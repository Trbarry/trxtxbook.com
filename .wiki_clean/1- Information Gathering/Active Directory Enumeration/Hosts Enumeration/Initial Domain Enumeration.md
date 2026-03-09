Cette documentation détaille les procédures d'énumération initiale d'un domaine **Active Directory**.

```mermaid
flowchart LR
    A[Observation Passive] --> B[Identification Hôtes]
    B --> C[Énumération AD]
    C --> D[OSINT]
    D --> E[Énumération SMB/RPC]
    E --> F[Analyse Politique/Vulnérabilités]
```

## Observation passive du réseau

L'objectif est de récupérer des informations sans interagir directement avec les machines cibles.

### Capture du trafic avec Wireshark

```bash
sudo -E wireshark
```

*   Filtre requêtes ARP : `arp`
*   Filtre requêtes mDNS : `udp.port == 5353`
*   Filtre trafic NetBIOS : `udp.port == 137`

### Capture du trafic avec tcpdump

*   Écouter les requêtes ARP :
    ```bash
    sudo tcpdump -i eth0 arp
    ```
*   Écouter le trafic mDNS :
    ```bash
    sudo tcpdump -i eth0 udp port 5353
    ```
*   Sauvegarder le trafic :
    ```bash
    sudo tcpdump -i eth0 -w capture.pcap
    ```
*   Lire un fichier .pcap :
    ```bash
    sudo tcpdump -r capture.pcap
    ```

### Utilisation de Responder en mode passif

```bash
sudo responder -I eth0 -A
```

> [!danger] Danger
> L'utilisation de **Responder** en mode actif peut provoquer des dénis de service ou des alertes immédiates sur le réseau.

## Identification des hôtes sur le réseau

### Identification avec fping

```bash
fping -asgq 172.16.5.0/23
```

| Flag | Description |
| :--- | :--- |
| **-a** | Afficher uniquement les hôtes actifs |
| **-s** | Afficher les statistiques de fin |
| **-g** | Générer une liste d'IP à partir d'un CIDR |
| **-q** | Mode silencieux |

### Scan avec Nmap

> [!warning] Attention
> L'utilisation de scanners actifs (**Nmap -A**) peut déclencher des alertes EDR/IDS.

*   Scan rapide :
    ```bash
    sudo nmap -sn 172.16.5.0/23
    ```
*   Scan détaillé :
    ```bash
    sudo nmap -A -p- -iL hosts.txt -oN nmap_scan.txt
    ```

## Énumération Active Directory

### Énumération des utilisateurs avec Kerbrute

> [!warning] Prérequis
> **Kerbrute** nécessite une liste d'utilisateurs propre pour éviter le bruit inutile.

```bash
kerbrute userenum -d INLANEFREIGHT.LOCAL --dc 172.16.5.5 userlist.txt -o valid_users.txt
```

### Énumération LDAP

> [!info] Condition critique
> L'énumération **LDAP** sans authentification dépend de la configuration 'Allow Anonymous Bind' du contrôleur de domaine.

*   Lister les utilisateurs :
    ```bash
    ldapsearch -x -h 172.16.5.5 -b "dc=inlanefreight,dc=local" "(objectClass=user)"
    ```
*   Lister les groupes :
    ```bash
    ldapsearch -x -h 172.16.5.5 -b "dc=inlanefreight,dc=local" "(objectClass=group)"
    ```
*   Lister les ordinateurs :
    ```bash
    ldapsearch -x -h 172.16.5.5 -b "dc=inlanefreight,dc=local" "(objectClass=computer)"
    ```

## Énumération SMB (null sessions, shares)

L'énumération **SMB** permet d'identifier des partages accessibles sans authentification (Null Session). Voir note **SMB Enumeration**.

*   Énumération des partages avec `smbclient` :
    ```bash
    smbclient -L //172.16.5.5/ -N
    ```
*   Utilisation de `crackmapexec` (ou `netexec`) pour tester les Null Sessions :
    ```bash
    nxc smb 172.16.5.0/23 --shares -u '' -p ''
    ```

## Énumération RPC (null sessions, user enumeration)

L'énumération **RPC** via `rpcclient` permet d'extraire des informations sur les utilisateurs et les politiques du domaine.

*   Connexion Null Session :
    ```bash
    rpcclient -U "" -N 172.16.5.5
    ```
*   Commandes utiles une fois connecté :
    ```bash
    enumdomusers
    querydominfo
    enumalsgroups domain
    ```

## Analyse de la politique de mot de passe (Password Policy)

La connaissance de la politique de mot de passe est cruciale pour les attaques par force brute ou pulvérisation.

*   Via `rpcclient` :
    ```bash
    rpcclient -U "" -N 172.16.5.5 -c "querydominfo"
    ```
*   Via `crackmapexec` :
    ```bash
    nxc smb 172.16.5.5 --pass-pol
    ```

## Recherche de vulnérabilités spécifiques (ex: SMB Signing, LLMNR poisoning actif)

*   Vérification du **SMB Signing** (si désactivé, vulnérable au relay) :
    ```bash
    nxc smb 172.16.5.0/23 --gen-relay-list relay_targets.txt
    ```
*   Vérification **LLMNR/NBT-NS** :
    Utiliser **Responder** en mode écoute pour capturer les hashs NTLMv2 générés par des requêtes LLMNR/NBT-NS non résolues sur le réseau.

## Collecte d'informations OSINT

### Recherche de documents et emails

*   Recherche de fichiers PDF :
    ```text
    filetype:pdf inurl:inlanefreight.com
    ```
*   Recherche d'emails :
    ```text
    intext:"@inlanefreight.com" inurl:inlanefreight.com
    ```
*   Récupération de noms d'utilisateurs avec **linkedin2username** :
    ```bash
    linkedin2username -c "Inlanefreight"
    ```

### Analyse de fuites de données

```bash
python3 dehashed.py -q inlanefreight.local -p
```

Cette phase de reconnaissance s'appuie sur les concepts abordés dans **Active Directory Enumeration**, **Kerberos Attacks**, **SMB Enumeration** et **OSINT Techniques**.