![Cover](cover.png)

### 1. Reconnaissance & Scanning

Ma méthodologie débute par un **Full TCP Port Scan** pour identifier la surface d'attaque exhaustive, suivi d'un scan de services pour déterminer les versions et les technologies en place.

```bash
# Scan rapide de tous les ports
nmap -p- --min-rate 10000 -oA scans/nmap-alltcp 10.10.10.222

# Scan détaillé des ports ouverts
nmap -p 22,80,8065 -sC -sV -oA scans/nmap-tcpscans 10.10.10.222
```

**Résultats du scan :**
*   **Port 22 (SSH)** : OpenSSH 7.9p1 (Debian 10).
*   **Port 80 (HTTP)** : Nginx 1.14.2.
*   **Port 8065 (HTTP)** : Instance **Mattermost** (alternative open-source à Slack).

Le scan révèle des noms d'hôtes potentiels. Je mets à jour mon fichier `/etc/hosts` pour assurer une résolution correcte :
```bash
echo "10.10.10.222 delivery.htb helpdesk.delivery.htb" | sudo tee -a /etc/hosts
```

---

### 2. Énumération des Services Web

L'application sur le port 80 est une page statique qui redirige vers un **HelpDesk** (`helpdesk.delivery.htb`). Une information cruciale est présente : pour accéder au serveur **Mattermost**, il est impératif de posséder une adresse email `@delivery.htb`.

#### HelpDesk (osTicket)
Le sous-domaine héberge une instance de **osTicket**. En explorant les fonctionnalités, je note qu'un utilisateur non authentifié peut "Open a New Ticket". 
Lors de la création d'un ticket, le système génère un **Ticket ID** et indique qu'une adresse email spécifique (ex: `6421357@delivery.htb`) est créée pour permettre la communication bidirectionnelle entre l'utilisateur et le support.

#### Mattermost (Port 8065)
L'instance **Mattermost** permet la création de compte, mais nécessite une validation par email. Comme la machine n'a pas d'accès internet, je ne peux pas utiliser une adresse externe.

> **Schéma Mental : Abus de la logique de communication (Mail Relay)**
> 1. L'attaquant n'a pas d'email `@delivery.htb`.
> 2. Le **HelpDesk** crée une boîte mail temporaire pour chaque ticket ouvert.
> 3. Tout email envoyé à `ID_TICKET@delivery.htb` est automatiquement ajouté comme commentaire/update dans le ticket consultable via l'interface web.
> 4. **Action** : Utiliser l'email du ticket pour s'inscrire sur **Mattermost**, puis lire le lien de vérification directement dans le ticket **osTicket**.

---

### 3. Vecteur d'Entrée : Exploitation du flux d'enregistrement

1.  **Génération de l'email** : Je crée un ticket sur `helpdesk.delivery.htb`. Le système me donne le **Ticket ID** `9832145` et l'email associé `9832145@delivery.htb`.
2.  **Inscription Mattermost** : Je me rends sur `delivery.htb:8065` et je crée un compte en utilisant `9832145@delivery.htb` comme adresse de contact.
3.  **Interception du Token** : Je retourne sur le portail **HelpDesk**, section "Check Ticket Status". En saisissant mon email personnel (utilisé lors de la création du ticket) et le **Ticket ID**, j'accède au contenu du ticket.
4.  **Validation** : Un nouvel update est apparu dans le ticket : c'est l'email de bienvenue de **Mattermost** contenant le lien de validation.

```text
http://delivery.htb:8065/do_verify_email?token=qmk1xu7ctbgdtdfomo36e7sixo...
```

En cliquant sur ce lien, mon compte **Mattermost** est activé.

---

### 4. Premier Shell (Initial Access)

Une fois connecté à **Mattermost**, je rejoins l'équipe "Internal". Dans le canal "Internal", je découvre une conversation entre les administrateurs mentionnant des **Credentials** pour un accès SSH temporaire.

*   **Username** : `maildeliverer`
*   **Password** : `Youve_G0t_Mail!`

Le message précise également que ce mot de passe est une variante de `PleaseSubscribe!` et que des **Hashcat Rules** seront nécessaires plus tard pour l'escalade de privilèges.

J'utilise ces identifiants pour établir une connexion **SSH** :

```bash
ssh maildeliverer@10.10.10.222
# Password: Youve_G0t_Mail!
```

**Validation du premier flag :**
```bash
maildeliverer@Delivery:~$ cat user.txt
6b22a6ae************************
```

---

### Énumération Interne & Mouvement Latéral

Une fois mon accès **SSH** établi avec l'utilisateur `maildeliverer`, je débute l'exploration du système pour identifier des vecteurs d'**Escalade de Privilèges**. L'instance **Mattermost** tournant localement est ma cible prioritaire pour l'énumération de secrets.

#### 1. Analyse de la Configuration Mattermost
Je recherche les fichiers de configuration de l'application. Le fichier `config.json` contient souvent des **Database Credentials** ou des clés d'API.

```bash
# Localisation et lecture de la configuration
cat /opt/mattermost/config/config.json | jq '.SqlSettings'
```

Le fichier révèle des identifiants **MySQL** en clair : `mmuser` : `Crack_The_MM_Admin_PW`.

> **Schéma Mental :**
> Accès Initial (User) -> Énumération de la Configuration Application -> Extraction de Secrets (DB Creds) -> Pivot vers la Base de Données.

#### 2. Extraction des Hashs de la Base de Données
Je me connecte à l'instance **MariaDB** locale pour extraire les informations de la table des utilisateurs. L'objectif est de récupérer le **Hash** du compte **root**.

```bash
# Connexion à la base de données
mysql -u mmuser -p'Crack_The_MM_Admin_PW' mattermost

# Extraction des noms d'utilisateurs et des hashs
SELECT Username, Password FROM Users WHERE Username='root';
```

Le résultat me donne le hash **bcrypt** suivant pour **root** : `$2a$10$VM6EeymRxJ29r8Wjkr8Dtev0O.1STWb4.4ScG.anuu7v0EFJwgjjO`.

#### 3. Cracking de Mot de Passe (Rule-based Attack)
L'énumération précédente dans les canaux **Mattermost** indiquait que les mots de passe du système sont des variantes de `PleaseSubscribe!`. Au lieu d'une attaque par **Brute Force** classique, j'utilise une **Rule-based attack** avec **Hashcat** pour générer des mutations basées sur ce pattern.

```bash
# Préparation du dictionnaire de base
echo "PleaseSubscribe!" > password.txt

# Attaque Hashcat avec la règle best64
hashcat -m 3200 hash.txt password.txt -r /usr/share/hashcat/rules/best64.rule
```

**Hashcat** parvient à casser le hash rapidement. Le mot de passe identifié est : `PleaseSubscribe!21`.

#### 4. Privilege Escalation vers Root
Le mot de passe extrait de la base de données **Mattermost** est réutilisé pour le compte système **root**. Cette **Password Reuse** est une vulnérabilité critique fréquente dans les environnements où les administrateurs simplifient la gestion de leurs accès.

```bash
# Passage en root
su -
# Saisie du mot de passe : PleaseSubscribe!21

# Vérification de l'identité
id && hostname
```

> **Schéma Mental :**
> Hash de l'application -> Indice de mot de passe (OSINT interne) -> Rule-based Cracking -> Password Reuse (App vers OS) -> Full System Compromise.

---

### Phase 3 : Élévation de Privilèges & Domination

Une fois l'accès initial établi en tant que **maildeliverer**, mon objectif est d'identifier des vecteurs de mouvement latéral ou d'escalade verticale. L'énumération du système de fichiers révèle une instance **Mattermost** installée dans `/opt`.

#### Énumération et Extraction de Secrets

L'analyse des fichiers de configuration de **Mattermost** est une étape critique. Le fichier `config.json` contient souvent des **Database Connection Strings** en clair.

```bash
# Localisation et lecture de la configuration
cat /opt/mattermost/config/config.json | jq '.SqlSettings'

# Extraction des credentials MySQL
"DataSource": "mmuser:Crack_The_MM_Admin_PW@tcp(127.0.0.1:3306)/mattermost?..."
```

> **Schéma Mental :**
> L'application **Mattermost** nécessite un accès permanent à sa base de données pour stocker les messages et les profils. En accédant au fichier de configuration, je récupère les identifiants de l'utilisateur **mmuser**. L'objectif est maintenant de dumper les **Password Hashes** des administrateurs de la plateforme, en espérant une **Password Reuse** avec le compte **Root** du système.

#### Extraction des Hashes via MariaDB

Je me connecte à l'instance **MariaDB** locale pour extraire les données de la table `Users`.

```sql
-- Connexion à la base de données
mysql -u mmuser -pCrack_The_MM_Admin_PW mattermost

-- Extraction des hashes
SELECT Username, Password FROM Users WHERE Username='root';

-- Résultat :
-- root | $2a$10$VM6EeymRxJ29r8Wjkr8Dtev0O.1STWb4.4ScG.anuu7v0EFJwgjjO
```

Le hash identifié utilise l'algorithme **bcrypt** (identifié par le préfixe `$2a$`), ce qui le rend résistant aux attaques par force brute classique sans une stratégie ciblée.

#### Attaque par Dictionnaire avec Hashcat Rules

En me basant sur les indices trouvés précédemment dans les chats **Mattermost**, je sais que les mots de passe suivent un pattern basé sur la chaîne "PleaseSubscribe!". Pour générer les variantes nécessaires, j'utilise une **Rule-based Attack** avec **Hashcat**.

```bash
# Préparation du dictionnaire de base
echo "PleaseSubscribe!" > password.txt

# Attaque avec la règle best64
hashcat -m 3200 hash.txt password.txt -r /usr/share/hashcat/rules/best64.rule --user
```

**Résultat du cracking :** `PleaseSubscribe!21`

#### Compromission Totale

Le mot de passe cracké permet de basculer vers l'utilisateur **Root** via la commande `su`.

```bash
maildeliverer@Delivery:~$ su -
Password: PleaseSubscribe!21
root@Delivery:~# id
uid=0(root) gid=0(root) groups=0(root)
```

---

### Analyse Beyond Root

La compromission totale de **Delivery** met en lumière plusieurs faiblesses architecturales classiques :

1.  **Password Reuse (OS vs Application) :** La vulnérabilité majeure réside dans l'utilisation du même mot de passe (ou d'une variante prévisible) pour le compte administrateur de l'application **Mattermost** et le compte **Root** du système d'exploitation. C'est un vecteur d'escalade critique dans les environnements où la gestion des secrets n'est pas centralisée.
2.  **Hardcoded Credentials :** La présence de mots de passe en clair dans `config.json` est une pratique risquée. Bien que nécessaire pour le fonctionnement de l'application, l'accès à ce fichier aurait dû être restreint de manière plus stricte via des permissions **Linux ACLs** ou l'utilisation d'un **Secret Manager** (type HashiCorp Vault).
3.  **Information Leakage via Internal Chat :** Les communications internes (Mattermost) contenaient des indices sur la politique de mots de passe. Dans un scénario réel, un attaquant surveillerait ces canaux pour identifier des procédures de maintenance ou des déploiements de credentials temporaires.
4.  **Bypass de l'Email Verification :** L'exploitation initiale reposait sur la capacité à recevoir un email de vérification via un système de **HelpDesk** mal configuré. Cela démontre qu'une vulnérabilité de type **Logic Flaw** dans un service périphérique peut mener à la compromission d'une infrastructure de communication interne complète.