```mermaid
flowchart TD
    A[Reconnaissance & Analyse] --> B[Analyse Statique/Dynamique]
    B --> C[Analyse Réseau]
    C --> D[Modification & Recompilation]
    D --> E[Exploitation (SQLi/Path Traversal)]
    E --> F[Accès/Exfiltration]
```

## Caractéristiques des applications client lourd

Les applications client lourd sont des logiciels installés localement sur la machine de l'utilisateur, fonctionnant de manière autonome ou en interaction avec un serveur distant. Elles sont développées via des frameworks tels que **.NET**, **Java**, **C++** ou **Silverlight**.

### Sécurité Java et .NET

*   **Java** : Utilise une **Sandbox** pour isoler le code, le **Code Signing** pour garantir l'intégrité et des restrictions d'API pour limiter l'accès aux ressources système.
*   **.NET** : Déporte une part importante de la logique métier côté client, ce qui peut accroître la surface d'attaque en cas de mauvaise gestion des données sensibles.

### Architectures

| Type | Description |
| :--- | :--- |
| 2-tier | Communication directe entre le client et la base de données. |
| 3-tier | Architecture intermédiaire avec un serveur d'application entre le client et la base de données. |

## Analyse de la surface d'attaque locale (fichiers de config, registres, logs)

L'analyse locale permet d'identifier des secrets stockés par défaut ou des comportements anormaux.
- **Fichiers de configuration** : Rechercher les fichiers `.xml`, `.json`, `.ini` ou `.config` (ex: `web.config` ou `app.config` en .NET) contenant des chaînes de connexion ou des clés API.
- **Registres Windows** : Utiliser `reg query` pour inspecter les clés sous `HKCU\Software\[NomApplication]` ou `HKLM\Software\[NomApplication]`.
- **Logs** : Examiner les répertoires `%APPDATA%` ou `%PROGRAMDATA%` pour des traces d'erreurs révélant des chemins serveurs ou des requêtes SQL.

## Analyse de la mémoire vive (dumping)

Le dumping mémoire est essentiel pour extraire des clés de chiffrement en clair ou des jetons de session actifs qui ne sont jamais écrits sur le disque.
- **ProcDump** : `procdump.exe -ma <PID> dump.dmp`
- **Analyse** : Charger le fichier `.dmp` dans **WinDbg** ou utiliser **Volatility** pour extraire les chaînes de caractères (`strings`) ou les structures d'objets.

## Analyse du trafic chiffré (SSL/TLS interception)

Si l'application utilise TLS, il est nécessaire d'injecter un certificat CA de confiance dans le magasin de certificats Windows ou de patcher le binaire pour désactiver la vérification SSL.
- **Burp Suite** : Configurer le proxy et installer le certificat `PortSwigger CA` dans le magasin "Trusted Root Certification Authorities".
- **Bypass SSL Pinning** : Utiliser **Frida** pour intercepter les appels aux bibliothèques de chiffrement (ex: `System.Net.ServicePointManager` en .NET) et forcer le retour `true` sur la validation du certificat.

## Débogage distant

Le débogage permet de modifier l'exécution en temps réel (ex: forcer une condition `if` à `true`).
- **dnSpy** : Attacher le processus via `Debug -> Attach to Process`. Placer des points d'arrêt (breakpoints) sur les méthodes d'authentification ou de validation.
- **Frida** : Utiliser un script pour hooker des fonctions spécifiques :
```javascript
Java.perform(function () {
    var targetClass = Java.use("com.app.AuthManager");
    targetClass.checkPassword.implementation = function (password) {
        return true; // Bypass authentification
    };
});
```

## Vulnérabilités typiques

*   **Hardcoded credentials** : Identifiants inscrits en dur dans le binaire.
*   **Buffer Overflow** : Dépassement de tampon dû à une mauvaise gestion mémoire.
*   **DLL Hijacking** : Chargement de bibliothèques malveillantes par le processus.
*   **SQL Injection** : Injection de requêtes SQL via les entrées utilisateur.
*   **Insecure storage** : Stockage local de données sensibles en clair.

## Outils de Pentest

### Analyse statique et dynamique

| Outil | Usage |
| :--- | :--- |
| **dnSpy** | Décompilation, débogage et modification **.NET** |
| **ILSpy** | Décompilation **.NET** |
| **JD-GUI** / **JADX** | Décompilation **Java** |
| **x64dbg** | Débogage bas niveau et analyse mémoire |
| **Ghidra** | Ingénierie inverse multi-architecture |
| **Frida** | Instrumentation dynamique (hooking) |
| **CFF Explorer** | Analyse de structure de fichiers binaires (PE) |

### Analyse réseau

| Outil | Usage |
| :--- | :--- |
| **Wireshark** | Capture et analyse de paquets |
| **Burp Suite** | Interception et modification de requêtes HTTP/S |
| **TCPView** | Visualisation des connexions actives |

> [!warning] Analyse réseau
> L'analyse réseau est cruciale : si le client communique avec un serveur, identifier le protocole est la priorité avant toute modification binaire. Voir **Network Traffic Analysis**.

## Scénario pratique (fatty-client.jar)

L'exploitation suit généralement une méthodologie de modification du comportement client pour interagir avec le serveur.

1.  **Découverte** : Analyse des fichiers extraits (ex: `beans.xml`) pour identifier des configurations ou secrets.
2.  **Contournement de signature** : Lors de la modification d'un fichier `.jar`, il est nécessaire de supprimer les fichiers de signature (`.SF`, `.RSA`) du répertoire `META-INF` et de nettoyer le `MANIFEST.MF` pour éviter les erreurs de runtime.
3.  **Path Traversal** : Modification du code source client pour manipuler les chemins d'accès aux fichiers sur le serveur.
4.  **SQL Injection** : Identification de requêtes vulnérables. Si le client effectue un hachage côté client (ex: **SHA-256**), il est souvent nécessaire de modifier le code source pour désactiver ce hachage avant l'envoi de la requête au serveur.

> [!danger] Signature JAR
> Attention à la signature des fichiers JAR : la modification nécessite la suppression des fichiers de signature (.SF, .RSA) pour éviter les erreurs de runtime.

> [!tip] Authentification
> Le contournement de l'authentification nécessite souvent une modification du code source client pour désactiver le hachage côté client avant l'envoi de la requête.

## Commandes utiles

| Action | Commande |
| :--- | :--- |
| Modifier fichier hosts | `echo 10.10.10.174 server.fatty.htb >> C:\Windows\System32\drivers\etc\hosts` |
| Recompiler JAR | `jar -cmf META-INF\MANIFEST.MF output.jar *` |
| Recompiler fichier Java | `javac -cp client.jar monfichier.java` |
| Wireshark filtre port | `tcp.port == 8000` |
| Strings sur exe | `strings64.exe fichier.exe` |
| Dump mémoire | `procdump.exe -ma <PID> dump.dmp` |
| Hook Frida | `frida -l script.js -n "NomProcessus" -f` |

Les techniques abordées ici s'appuient sur des concepts de **Reverse Engineering**, de **Binary Analysis** et de **Network Traffic Analysis**. L'exploitation de vulnérabilités comme le **Path Traversal** ou la **SQL Injection** nécessite une compréhension fine de la communication client-serveur.