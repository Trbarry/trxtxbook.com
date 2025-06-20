/*
  # Update Dog write-up content
  
  1. Changes
    - Update the content of the Dog write-up with complete walkthrough
    - Keep existing metadata (title, difficulty, points, etc.)
*/

UPDATE writeups
SET content = '# **Write-Up - Dog (Hack The Box)**  
📅 **Date de sortie** : 08/03/2025 - Box encore active 🔥  
🏷️ **Catégorie** : Easy  
🌍 **Type** : Web / Privilege Escalation  
🖥️ **OS** : Linux  

---

## **📌 Phase 1 : Reconnaissance**  

### 🔍 **1. Scan Nmap**  
Nous lançons un scan Nmap approfondi pour identifier les services exposés.  
```bash
nmap dog.htb -sV -A -Pn -T4
```
📌 **Résultats clés** :  
✔️ **Port 22 (SSH)** - OpenSSH 8.2p1 Ubuntu  
✔️ **Port 80 (HTTP)** - Apache 2.4.41 (Ubuntu)  
✔️ **Dépôt Git exposé (`/.git/`)**  
✔️ **CMS Backdrop CMS identifié**  

---

### 🔍 **2. Extraction du dépôt Git**  
Nous clonons le dépôt `.git` pour analyser les fichiers sensibles.  
```bash
git-dumper http://dog.htb/.git/ ./dog-git
cd dog-git
```
📌 **Découverte** :  
✔️ **Utilisateur Tiffany identifié** (`tiffany@dog.htb`)  
✔️ **Fichier `settings.php` contenant un mot de passe MySQL**  

---

## **📌 Phase 2 : Exploitation Web**  

### 🔑 **1. Accès à l''administration du CMS**  
Le fichier `settings.php` révèle les identifiants MySQL :  
```php
$database = ''mysql://root:BackDropJ2024DS2024@127.0.0.1/backdrop'';
```
📌 **Connexion avec** :  
```bash
Tiffany:BackDropJ2024DS2024
```
✔️ Accès à l''interface d''administration Backdrop CMS  
✔️ Possibilité d''upload de fichiers  

---

### 🎯 **2. Exploitation via Upload de Module**  
Backdrop CMS permet l''installation de modules personnalisés.  
✔️ **Téléchargement d''un module officiel** depuis Backdrop CMS  
✔️ **Modification pour inclure un reverse shell**  
✔️ **Repackaging en `.tar.gz`**  
```bash
tar -czvf bean.tar.gz *
```
✔️ **Upload et activation du module**  
✔️ **Obtention d''un shell sur `www-data`**  

---

## **📌 Phase 3 : Mouvement Latéral**  

### 🏆 **1. Accès à MySQL & utilisateurs**  
Connexion MySQL avec les identifiants trouvés :  
```bash
mysql -u root -pBackDropJ2024DS2024
```
📌 **Résultats** :  
✔️ **Hash du mot de passe de `jobert` non cassable**  
✔️ **Le mot de passe MySQL fonctionne pour `johncusack`**  

Connexion SSH en tant que **johncusack** :  
```bash
ssh johncusack@dog.htb
```
📌 **Flag user récupéré** :  
```bash
cat /home/johncusack/user.txt
```

---

## **📌 Phase 4 : Escalade de Privilèges**  

### 🔍 **1. Analyse des permissions sudo**  
Nous vérifions les permissions sudo avec :  
```bash
sudo -l
```
📌 **Résultat clé** :  
✔️ **Binaire `bee` exécutable en root** (`/usr/local/bin/bee`)  

---

### 🔥 **2. Exploitation de Bee CLI**  
`Bee` est un outil CLI Backdrop CMS permettant d''exécuter du **PHP**.  
✔️ **Il doit être exécuté dans `/var/www/html`**  
✔️ **Utilisation de la fonction `eval()` pour exécuter du code**  

Exécution d''un shell root :  
```bash
sudo /usr/local/bin/bee eval ''exec("/bin/bash -p");''
```
📌 **Root obtenu !** 🎯  
```bash
whoami
root
cd /root
cat root.txt
```
🔥 **Machine terminée !** 🔥  

---

## **📌 Conclusion**  

### ✅ **Points Clés**  
✔️ **Reconnaissance :** Scan Nmap & Git Leak → CMS Backdrop détecté  
✔️ **Exploitation Web :** Upload de module Backdrop → Shell `www-data`  
✔️ **Mouvement latéral :** Accès `johncusack` via mot de passe MySQL  
✔️ **Privilège Escalation :** Bee CLI → Exécution de PHP en root  

---

### 💡 **Leçons à Retenir**  
✔️ **Scanner les répertoires cachés (`/.git/`)**  
✔️ **Les fichiers de config peuvent contenir des credentials sensibles**  
✔️ **Analyser les binaires sudo exécutables pour une élévation de privilège**  

🔒 **#HackTheBox #Pentesting #CyberSecurity #Linux #PrivilegeEscalation**'
WHERE slug = 'hackthebox-dog';