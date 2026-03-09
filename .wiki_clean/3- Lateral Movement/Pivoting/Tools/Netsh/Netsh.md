## Netsh Cheatsheet - Windows Network Configuration & Exploitation

**Netsh** est un outil Windows permettant de configurer, surveiller et exploiter le réseau. Il est utilisé pour le **Pivoting**, la modification des pare-feux, la redirection de ports et la capture de trafic.

```mermaid
flowchart LR
    A[Attaquant] -->|Port 4444| B(Cible - PortProxy)
    B -->|Redirection| C[Machine Interne - Port 3389]
```

> [!danger] Privilèges requis
> La majorité des commandes **netsh** nécessitent des privilèges élevés (**Administrateur** ou **SYSTEM**).

> [!warning] Stabilité
> L'utilisation de **portproxy** peut parfois entrer en conflit avec des services existants sur le port d'écoute.

> [!tip] Persistence
> **Netsh** permet le chargement de DLLs personnalisées, un vecteur de persistance à surveiller.

## Privilèges requis (nécessité d'être Administrateur/SYSTEM)

L'exécution de commandes **netsh** modifiant la configuration réseau ou les règles de filtrage nécessite un jeton d'accès élevé. Sans privilèges **Administrateur**, la plupart des commandes retourneront une erreur d'accès refusé.

Vérification des privilèges actuels en ligne de commande :
```bash
whoami /priv
```

Si vous disposez d'un accès **SYSTEM** (via un service compromis ou un exploit kernel), vous pouvez modifier la configuration réseau sans interaction utilisateur.

## Afficher la Configuration Réseau

Lister toutes les interfaces réseau :
```bash
netsh interface show interface
```

Afficher l'adresse IP et la passerelle :
```bash
netsh interface ip show config
```

Lister les connexions actives :
```bash
netsh interface ip show addresses
```

Afficher la table de routage :
```bash
netsh interface ip show route
```

Afficher la configuration DNS :
```bash
netsh interface ip show dns
```

Lister les connexions Wi-Fi enregistrées :
```bash
netsh wlan show profiles
```

Afficher le mot de passe d’un réseau Wi-Fi enregistré :
```bash
netsh wlan show profile name="WiFi_Name" key=clear
```

## Configurer une Adresse IP Statique

Assigner une IP statique sur une interface :
```bash
netsh interface ip set address name="Ethernet" static 192.168.1.100 255.255.255.0 192.168.1.1
```

Attribuer une adresse IP dynamique (**DHCP**) :
```bash
netsh interface ip set address name="Ethernet" dhcp
```

Configurer un serveur DNS :
```bash
netsh interface ip set dns name="Ethernet" static 8.8.8.8
```

Ajouter un DNS secondaire :
```bash
netsh interface ip add dns name="Ethernet" 8.8.4.4 index=2
```

## Modifier et Bypasser le Pare-feu Windows

Lister les règles du pare-feu :
```bash
netsh advfirewall firewall show rule name=all
```

Désactiver complètement le pare-feu :
```bash
netsh advfirewall set allprofiles state off
```

Activer le pare-feu :
```bash
netsh advfirewall set allprofiles state on
```

Ouvrir un port TCP spécifique :
```bash
netsh advfirewall firewall add rule name="Allow 4444" dir=in action=allow protocol=TCP localport=4444
```

Ouvrir un port UDP spécifique :
```bash
netsh advfirewall firewall add rule name="Allow DNS" dir=in action=allow protocol=UDP localport=53
```

Supprimer une règle spécifique :
```bash
netsh advfirewall firewall delete rule name="Allow 4444"
```

> [!danger] Risque critique
> La commande `allowinbound` expose totalement la machine aux scans externes.

Autoriser tout le trafic entrant :
```bash
netsh advfirewall set allprofiles firewallpolicy allowinbound,allowoutbound
```

## Redirection de Ports (Port Forwarding)

Activer le routage IP :
```bash
netsh interface ipv4 set forwarding "Ethernet" enabled
```

Créer une redirection de port vers une autre machine :
```bash
netsh interface portproxy add v4tov4 listenaddress=0.0.0.0 listenport=4444 connectaddress=192.168.1.10 connectport=3389
```

Lister toutes les règles de port forwarding :
```bash
netsh interface portproxy show all
```

Supprimer une redirection de port :
```bash
netsh interface portproxy delete v4tov4 listenport=4444
```

Rediriger un port sur une interface spécifique :
```bash
netsh interface portproxy add v4tov4 listenaddress=192.168.1.100 listenport=8080 connectaddress=10.0.0.1 connectport=80
```

## Persistence via Netsh (Helper DLLs)

**Netsh** peut charger des DLLs personnalisées via des "Helpers". Un attaquant peut enregistrer une DLL malveillante qui sera chargée à chaque exécution de **netsh.exe**, permettant une exécution de code arbitraire avec les privilèges de l'utilisateur lançant l'outil.

Ajout d'une DLL de persistance :
```bash
netsh add helper C:\path\to\malicious.dll
```

La détection se fait en inspectant les clés de registre associées aux helpers **netsh** :
`HKLM\SOFTWARE\Microsoft\Netsh`

## Netsh contextes avancés (WFP, Winsock)

Le contexte **Winsock** permet de manipuler la couche de transport réseau, utile pour installer des rootkits réseau ou intercepter du trafic local.

Réinitialiser le catalogue Winsock (souvent utilisé pour réparer ou corrompre la pile réseau) :
```bash
netsh winsock reset
```

Le contexte **WFP** (Windows Filtering Platform) permet une gestion granulaire des paquets, dépassant les capacités du pare-feu standard.

## Capture et Surveillance du Trafic

Activer la capture de paquets réseau :
```bash
netsh trace start capture=yes
```

Filtrer la capture sur une interface spécifique :
```bash
netsh trace start capture=yes tracefile=C:\temp\capture.etl
```

Arrêter la capture :
```bash
netsh trace stop
```

Afficher l’état de la capture en cours :
```bash
netsh trace show status
```

Activer la journalisation des connexions bloquées par le pare-feu :
```bash
netsh advfirewall set currentprofile logging filename "C:\Windows\System32\LogFiles\Firewall\pfirewall.log"
```

Voir les logs de pare-feu Windows :
```bash
type C:\Windows\System32\LogFiles\Firewall\pfirewall.log
```

## Attaques et Bypasses

Désactiver les règles du pare-feu pour un exécutable spécifique :
```bash
netsh advfirewall firewall add rule name="Bypass Defender" dir=in action=allow program="C:\malware.exe"
```

Ouvrir RDP à distance sur un hôte compromis :
```bash
netsh advfirewall firewall add rule name="Enable RDP" dir=in action=allow protocol=TCP localport=3389
```

Ouvrir SMB (445) pour exploitation :
```bash
netsh advfirewall firewall add rule name="Enable SMB" dir=in action=allow protocol=TCP localport=445
```

Créer une redirection pour attaquer un réseau interne :
```bash
netsh interface portproxy add v4tov4 listenport=8888 connectaddress=192.168.1.200 connectport=22
```

## Netsh vs PowerShell (comparaison des alternatives modernes)

Bien que **netsh** soit un standard historique, Microsoft recommande désormais l'utilisation des cmdlets **PowerShell** pour la gestion réseau, car elles offrent une meilleure intégration avec le système et une journalisation plus riche (Script Block Logging).

| Fonctionnalité | Netsh | PowerShell |
| :--- | :--- | :--- |
| Configuration IP | `netsh interface ip set address` | `New-NetIPAddress` |
| Pare-feu | `netsh advfirewall` | `New-NetFirewallRule` |
| Routage | `netsh interface ipv4` | `New-NetRoute` |
| Port Proxy | `netsh interface portproxy` | N/A (nécessite `netsh`) |

## Contre-Mesures et Détection

Restaurer les paramètres du pare-feu par défaut :
```bash
netsh advfirewall reset
```

Désactiver le port forwarding :
```bash
netsh interface portproxy reset
```

Bloquer les redirections non autorisées :
```bash
netsh advfirewall firewall add rule name="Block Proxying" dir=in action=block protocol=TCP localport=1080
```

Surveiller les tentatives de manipulation du pare-feu :
```powershell
Get-WinEvent -LogName Security | Where-Object { $_.Id -eq 5156 }
```

Désactiver l’accès à **netsh.exe** pour les utilisateurs non-admin :
```bash
icacls "C:\Windows\System32\netsh.exe" /deny Everyone:RX
```

> [!note] Remarque
> Les règles créées via **netsh** persistent après un redémarrage du système, sauf si elles sont explicitement supprimées ou réinitialisées.

## Liens associés
- [[Pivoting]]
- [[Windows Post-Exploitation]]
- [[Network Enumeration]]
- [[Firewall Evasion]]