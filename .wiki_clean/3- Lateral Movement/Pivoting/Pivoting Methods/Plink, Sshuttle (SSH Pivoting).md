Le flux de travail pour le pivoting réseau via SSH est illustré par le diagramme suivant :

```mermaid
flowchart LR
    A[Machine Attaquante] -- SSH Tunnel --> B[Pivot (Linux/Windows)]
    B -- Accès Réseau Interne --> C[Cible Interne]
```

## Plink (Windows)

**Plink** est l'outil de ligne de commande de la suite PuTTY, permettant d'établir des tunnels SSH sur des systèmes Windows.

### Connexion SSH

```bash
plink -ssh utilisateur@IP_CIBLE
```

### Gestion des clés SSH (authentification sans mot de passe)

Pour automatiser les connexions sans interaction humaine, utilisez des clés SSH. Générez la paire sur la machine attaquante et ajoutez la clé publique au fichier `authorized_keys` de la cible.

```bash
# Génération de la clé
ssh-keygen -t rsa -b 4096

# Copie de la clé publique vers la cible (si SSH est actif sur la cible)
plink -ssh utilisateur@IP_CIBLE "mkdir -p ~/.ssh && echo 'CONTENU_CLE_PUBLIQUE' >> ~/.ssh/authorized_keys"
```

### Utilisation de plink avec -batch pour éviter les prompts interactifs

L'option **-batch** désactive les invites interactives (comme la demande de mot de passe ou l'acceptation de la clé).

```bash
# Utilisation combinée avec une clé privée pour une automatisation totale
plink -batch -i id_rsa utilisateur@IP_CIBLE -L 8080:127.0.0.1:80
```

> [!danger] Acceptation de la clé SSH
> **Plink** nécessite l'acceptation manuelle de la clé SSH lors de la première connexion. Utilisez **-batch** ou **-hostkey** pour automatiser cette étape dans des scripts.

### Port Forwarding

| Type | Commande Plink | Explication |
| :--- | :--- | :--- |
| Local Forwarding | `plink -L 8080:127.0.0.1:80 utilisateur@IP_CIBLE` | Redirige 127.0.0.1:8080 (local) vers 127.0.0.1:80 (distant) |
| Remote Forwarding | `plink -R 4444:127.0.0.1:4444 utilisateur@IP_CIBLE` | Redirige IP_CIBLE:4444 vers 127.0.0.1:4444 |
| SOCKS Proxy | `plink -D 9050 -ssh utilisateur@IP_CIBLE` | Crée un proxy SOCKS sur 127.0.0.1:9050 |

> [!warning] Port Forwarding
> Le port forwarding local peut échouer si le port est déjà utilisé sur la machine locale.

### Contournement des restrictions de pare-feu (Firewall Egress)

Si le trafic SSH standard (port 22) est bloqué, tentez de rediriger le tunnel vers des ports autorisés en sortie (ex: 443, 80, 53).

```bash
# Connexion via un port alternatif si le serveur SSH distant est configuré pour écouter sur le 443
plink -P 443 utilisateur@IP_CIBLE
```

### Utilisation avec ProxyChains

Pour utiliser le proxy SOCKS généré, configurez `/etc/proxychains.conf` :

```text
socks4 127.0.0.1 9050
```

Exécution d'un scan via le pivot :

```bash
proxychains nmap -sT -Pn 192.168.1.1
```

### Exécution de commandes distantes

```bash
plink -ssh utilisateur@IP_CIBLE "ls -la"
```

## SSHuttle (Linux)

**SSHuttle** permet de créer un tunnel réseau transparent sans nécessiter de privilèges root sur la machine distante.

> [!info] Prérequis
> **SSHuttle** nécessite **Python** sur la machine attaquante.

### Tunneling réseau

Tunnel complet :

```bash
sshuttle -r utilisateur@IP_CIBLE 0.0.0.0/0 -vv
```

Ciblage d'un sous-réseau spécifique :

```bash
sshuttle -r utilisateur@IP_CIBLE 172.16.5.0/23
```

### Gestion du processus

Exécution en arrière-plan :

```bash
sshuttle -r utilisateur@IP_CIBLE 0.0.0.0/0 --daemon
```

Vérification de l'activité :

```bash
ps aux | grep sshuttle
```

Exemple de sortie :

```text
root     21573  0.0  0.2  26720  9876 ?        Ss   12:34   0:00 python3 /usr/bin/sshuttle
```

## Nettoyage des traces (Post-Exploitation)

Après l'opération, il est crucial de supprimer les traces de connexion et les fichiers temporaires.

```bash
# Suppression de la clé publique ajoutée dans authorized_keys
plink -ssh utilisateur@IP_CIBLE "sed -i '$d' ~/.ssh/authorized_keys"

# Effacement de l'historique bash sur le pivot
plink -ssh utilisateur@IP_CIBLE "history -c && rm ~/.bash_history"
```

## Comparaison d'outils

| Outil | Avantage | Inconvénient |
| :--- | :--- | :--- |
| **Plink** | Compatible **Windows**, léger | Besoin de PuTTY, pas de tunneling global |
| **SSHuttle** | Tunneling global sans root | Nécessite **Python**, **Windows** non supporté |

> [!warning] Détection
> Attention au risque de détection IDS/IPS lors de l'utilisation de tunnels SSH persistants.

## Cas d'usage

| Situation | Outil recommandé |
| :--- | :--- |
| Environnement **Windows** | **Plink** |
| Proxy SOCKS sur **Windows** | **Plink -D** + **proxychains** |
| Routage complet via pivot **Linux** | **SSHuttle** |
| Tunnel rapide pour sous-réseau | **SSHuttle** |

## Commandes récapitulatives

| Commande | Utilité |
| :--- | :--- |
| `plink -ssh utilisateur@IP_CIBLE` | Connexion SSH |
| `plink -D 9050 -ssh utilisateur@IP_CIBLE` | Proxy SOCKS |
| `plink -L 8080:127.0.0.1:80 utilisateur@IP_CIBLE` | Local Port Forwarding |
| `sshuttle -r utilisateur@IP_CIBLE 0.0.0.0/0` | Tunneling global |
| `sshuttle -r utilisateur@IP_CIBLE 192.168.1.0/24` | Tunneling sous-réseau |
| `sshuttle -r utilisateur@IP_CIBLE 0.0.0.0/0 --daemon` | Mode daemon |
| `ps aux \| grep sshuttle` | Vérification processus |

Ces techniques s'inscrivent dans les méthodologies de **Pivoting**, **Tunneling**, et **Port Forwarding** détaillées dans les notes sur les **SSH Pivoting Techniques** et la configuration de **Proxychains**. L'usage de ces outils est courant dans les scénarios **Living off the Land (LotL)**.