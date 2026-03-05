-- Migration to add NTLM Relay Wiki Page (with WebP images and TOC)
INSERT INTO wiki_pages (title, slug, category, content, tags, published, updated_at)
VALUES (
  'L''Attaque NTLM Relay : Théorie, Pratique et Défense',
  'ntlm-relay-attack-guide',
  'Pentest/Active Directory/Attaques',
  '> [!NOTE] Sommaire
>
>   *   [PARTIE 1 : Fondations & Théorie de l''Attaque NTLM Relay](#partie-1-fondations-th-orie-de-l-attaque-ntlm-relay)
>     *   [I. Architecture & Concepts : Le mécanisme "Under the Hood"](#i-architecture-concepts-le-m-canisme-under-the-hood-)
>     *   [II. Les Vecteurs d''Interception (MitM)](#ii-les-vecteurs-d-interception-mitm-)
>     *   [III. The Lab Setup : Environnement de Reproduction](#iii-the-lab-setup-environnement-de-reproduction)
>     *   [IV. Pre-requisites & Reconnaissance](#iv-pre-requisites-reconnaissance)
>   *   [PARTIE 2 : Implémentation & Défense](#partie-2-impl-mentation-d-fense)
>     *   [V. Step-by-Step Implementation : De l''interception à la session SOCKS](#v-step-by-step-implementation-de-l-interception-la-session-socks)
>     *   [VI. Vecteurs Modernes : IPv6 Poisoning (mitm6)](#vi-vecteurs-modernes-ipv6-poisoning-mitm6-)
>     *   [VII. Troubleshooting : Pourquoi le relais échoue-t-il ?](#vii-troubleshooting-pourquoi-le-relais-choue-t-il-)
>     *   [VIII. Hardening & Blue Team : Sécuriser l''Infrastructure](#viii-hardening-blue-team-s-curiser-l-infrastructure)
>     *   [Conclusion](#conclusion)
>

---

## PARTIE 1 : Fondations & Théorie de l''Attaque NTLM Relay

L''attaque **NTLM Relay** demeure, malgré son ancienneté, l''un des vecteurs de compromission les plus redoutables au sein des infrastructures **Active Directory** (AD). Contrairement à une attaque par force brute ou au **Cracking** hors ligne, le relais ne vise pas à retrouver le mot de passe en clair de l''utilisateur. Son objectif est de détourner une session d''authentification légitime pour obtenir un accès non autorisé à un service tiers (SMB, HTTP, LDAP, MSSQL). 

L''enjeu pour une infrastructure IT est critique : un attaquant parvenant à relayer l''authentification d''un **Domain Admin** vers un contrôleur de domaine ou un serveur de fichiers sensible peut prendre le contrôle total de la forêt AD sans jamais connaître un seul mot de passe.

### I. Architecture & Concepts : Le mécanisme "Under the Hood"

Pour comprendre le relais, il faut d''abord disséquer le **NTLM Handshake** (Challenge/Response). Le protocole NTLM (v1 ou v2) n''envoie jamais le mot de passe sur le réseau, mais une preuve de connaissance de celui-ci.

#### 1. Le Handshake NTLM en trois étapes

1.  **Type 1 (Negotiate) :** Le client informe le serveur qu''il souhaite s''authentifier et annonce les capacités supportées.
2.  **Type 2 (Challenge) :** Le serveur répond avec un `Server Challenge` (une valeur aléatoire de 8 octets appelée "nonce").
3.  **Type 3 (Authenticate) :** Le client chiffre le challenge avec son **Hash NT** (dérivé du mot de passe) et renvoie le résultat au serveur. C''est ce qu''on appelle le **Net-NTLM Hash**.

#### 2. La logique du Relais

Dans une attaque **NTLM Relay**, l''attaquant s''interpose en tant que **Man-in-the-Middle** (MitM). Il ne se contente pas d''écouter ; il intercepte les messages et les rejoue en temps réel vers une cible différente.

```mermaid
sequenceDiagram
    participant V as Victime (Client)
    participant A as Attaquant (MitM)
    participant C as Cible (Serveur)

    Note over V, C: L''attaquant force ou attend une connexion
    V->>A: NTLM Type 1 (Negotiate)
    A->>C: NTLM Type 1 (Negotiate)
    C->>A: NTLM Type 2 (Challenge)
    A->>V: NTLM Type 2 (Challenge)
    V->>A: NTLM Type 3 (Authenticate / Net-NTLM)
    A->>C: NTLM Type 3 (Authenticate / Net-NTLM)
    Note over C, A: Authentification réussie pour l''attaquant
```

#### 3. Distinction Cruciale : Hash NT vs Net-NTLM

Il est impératif de ne pas confondre les deux termes, car leurs usages en **Pentest** diffèrent radicalement :
*   **Hash NT :** Stocké dans la base **SAM** ou le processus **LSASS**. Utilisé pour les attaques **Pass-the-Hash**.
*   **Net-NTLM (v1/v2) :** C''est la réponse au challenge circulant sur le réseau. Il peut être capturé (pour du cracking) ou relayé (pour de l''accès direct).

![Schéma conceptuel de l''architecture binaire d''une attaque NTLM Relay illustrant la manipulation des structures de données NTLMSSP, montrant l''interception du flux hexadécimal entre une station de travail Windows 11 et un serveur de fichiers, avec une mise en évidence de la modification des flags de négociation pour désactiver les fonctions de sécurité optionnelles](https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/writeup-images/wiki/ntlm_relay_binary_arch.webp)

### II. Les Vecteurs d''Interception (MitM)

Pour qu''un relais réussisse, l''attaquant doit forcer la victime à s''authentifier auprès de sa machine. Plusieurs techniques de **Poisoning** sont utilisées :

*   **LLMNR (Link-Local Multicast Name Resolution) & NBT-NS (NetBIOS Name Service) :** Protocoles de secours utilisés par Windows quand le **DNS** échoue. L''attaquant répond aux requêtes de résolution de noms non résolues pour dire "C''est moi le serveur que vous cherchez".
*   **IPv6 Poisoning (mitm6) :** Windows privilégie l''IPv6. L''attaquant peut se faire passer pour un serveur DNS IPv6 via des messages **DHCPv6 Advertise** et forcer l''authentification vers ses propres services.
*   **Coerced Attacks (Attaques par coercition) :** Utilisation de vulnérabilités comme **PrintNightmare** (MS-RPRN) ou **PetitPotam** (MS-EFSR) pour forcer une machine distante (souvent un serveur) à s''authentifier contre l''attaquant.

### III. The Lab Setup : Environnement de Reproduction

Pour tester cette vulnérabilité, un environnement de laboratoire doit comporter au minimum trois entités distinctes.

#### 1. Configuration des machines
*   **Attacker Node :** Une distribution Kali Linux équipée de la suite **Impacket** et de **Responder**.
*   **Victim Node :** Un poste Windows 10/11 (Workstation) avec un utilisateur standard ou privilégié.
*   **Target Server :** Un serveur Windows (2016/2019/2022) avec le service **SMB** actif et, crucialement, le **SMB Signing** désactivé.

#### 2. Outils de l''arsenal
*   **Responder :** Pour le **LLMNR/NBT-NS Poisoning** et l''émulation de services (HTTP/SMB/WPAD).
*   **ntlmrelayx (Impacket) :** Le moteur de relais qui gère la négociation avec la cible.
*   **CrackMapExec (ou NetExec) :** Pour la reconnaissance et l''identification des cibles vulnérables.

```mermaid
flowchart TD
    A[Attacker: Kali Linux] -- LLMNR/NBT-NS Poisoning --> B(Victim: Windows Workstation)
    B -- NTLM Auth Request --> A
    A -- Relays Auth --> C{Target: Windows Server}
    C -- SMB Signing Disabled? --> D[Success: Remote Command Execution / SAM Dump]
    C -- SMB Signing Enabled? --> E[Failure: Authentication Refused]
```

### IV. Pre-requisites & Reconnaissance

L''attaque NTLM Relay n''est possible que si certaines conditions de sécurité ne sont pas remplies sur la cible. La phase de reconnaissance est donc vitale.

#### 1. Vérification du SMB Signing
La protection principale contre le relais SMB est le **SMB Signing**. Si la signature est activée et requise, le serveur refusera les messages NTLM relayés car l''attaquant ne peut pas signer le trafic sans le **Session Key** (dérivé du mot de passe).

Utilisation de `nmap` pour scanner le réseau :
```bash
# Utilisation du script smb-security-mode pour identifier les serveurs sans signature requise
nmap -p 445 --script smb-security-mode 192.168.1.0/24
```
*   **Flags importants :** `-p 445` cible le port SMB. `--script` exécute la logique de détection des configurations de sécurité.

#### 2. Analyse avec CrackMapExec
`CrackMapExec` (CME) est plus efficace pour générer une liste de cibles exploitables.
```bash
# Génération d''une liste de machines où le SMB Signing est ''False''
crackmapexec smb 192.168.1.0/24 --gen-relay-list targets.txt
```
*   **Flag `--gen-relay-list` :** Filtre automatiquement les machines vulnérables et enregistre leurs IP dans un fichier.

#### 3. Configuration de l''interception
Avant de lancer le relais, il faut s''assurer que les ports locaux de l''attaquant sont disponibles. Par défaut, **Responder** lance ses propres serveurs SMB et HTTP. Pour relayer, nous devons désactiver ces serveurs dans `Responder.conf` afin de laisser `ntlmrelayx` prendre la main sur ces ports.

```bash
# Modification du fichier de configuration
sed -i ''s/SMB = On/SMB = Off/g'' /etc/responder/Responder.conf
sed -i ''s/HTTP = On/HTTP = Off/g'' /etc/responder/Responder.conf
```

![Visualisation d''une cartographie réseau générée dynamiquement montrant les vecteurs de propagation de l''attaque NTLM Relay, avec des liens rouges identifiant les serveurs dont le SMB Signing est désactivé et des icônes d''alerte sur les segments réseau utilisant encore les protocoles hérités LLMNR et NetBIOS](https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/writeup-images/wiki/network_recon_map.webp)

Cette phase préparatoire établit la fondation technique nécessaire. Une fois les cibles identifiées et les outils configurés, l''attaquant est prêt pour la phase d''exécution, qui consiste à capturer le flux d''authentification et à l''injecter vers les cibles identifiées comme vulnérables.

## PARTIE 2 : Implémentation & Défense

L''exécution d''une attaque **NTLM Relay** nécessite une orchestration précise entre l''interception du flux et son injection vers des services cibles. Cette seconde partie détaille les procédures opératoires pour transformer une interception en compromission de domaine et les contre-mesures critiques à déployer.

### V. Step-by-Step Implementation : De l''interception à la session SOCKS

Une fois les cibles sans **SMB Signing** identifiées, l''attaquant utilise `ntlmrelayx` pour automatiser le relais. L''utilisation d''un **SOCKS Proxy** est ici la méthode la plus flexible pour maintenir des sessions persistantes.

#### 1. Initialisation du Relais avec SOCKS Proxy

Contrairement au mode "one-shot" qui exécute une commande unique, le flag `-socks` permet de garder la session active dans un proxy local.

```bash
# Lancement de ntlmrelayx en mode interactif avec support SMB2
sudo ntlmrelayx.py -tf targets.txt -smb2support -socks
```

*   **Flag `-tf`** : Charge la liste des IPs cibles vulnérables.
*   **Flag `-socks`** : Instancie un serveur proxy (par défaut sur `127.0.0.1:1080`).

```mermaid
flowchart LR
    V[Victime] -- Auth NTLM --> A[Attaquant: ntlmrelayx]
    A -- Relais --> T[Cible SMB]
    T -- Session Valide --> A
    A -- Stockage --> S{SOCKS Proxy}
    S -- Utilisation via --> P[Proxychains]
```

#### 2. Utilisation des sessions via Proxychains

Pour consommer ces sessions, il faut configurer `/etc/proxychains4.conf` pour pointer vers le port 1080. L''attaquant peut alors utiliser n''importe quel outil de la suite **Impacket** comme s''il était l''utilisateur relayé.

```bash
# Lister les sessions actives dans ntlmrelayx
ntlmrelayx> socks

# Exécution de secretsdump pour extraire la base SAM de la cible
proxychains python3 secretsdump.py -no-pass -smb2 DOMAIN/User@192.168.1.205
```

#### 3. Cas particulier : Le Relais HTTP (Exemple GLPI/IIS)

Le relais vers des applications Web utilisant l''authentification Windows intégrée (**IIS**) est particulièrement dévastateur. Si un administrateur est relayé vers une application comme **GLPI**, un script personnalisé dans `ntlmrelayx` peut automatiser l''élévation de privilèges au sein de l''application.

*   **Mécanisme** : L''attaquant intercepte le `Header HTTP Authorization: NTLM` et le rejoue.
*   **Payload** : Le script de l''attaquant peut automatiser l''ajout d''un compte utilisateur dans le groupe "Super-Admin" en gérant les **CSRF Tokens** et les cookies de session.

```mermaid
sequenceDiagram
    participant V as Navigateur Victime
    participant A as Attaquant (ntlmrelayx)
    participant W as Serveur Web (IIS/GLPI)

    V->>A: Requête HTTP (Auth NTLM Type 1)
    A->>W: Requête HTTP (Auth NTLM Type 1)
    W->>A: 401 Unauthorized (Challenge Type 2)
    A->>V: 401 Unauthorized (Challenge Type 2)
    V->>A: Auth NTLM Type 3 (Net-NTLM)
    A->>W: Auth NTLM Type 3 (Net-NTLM)
    Note over A, W: Session Authentifiée
    A->>W: POST /profile_user.form.php (Elevate Admin)
```

![Représentation microscopique d''une injection de payload dans une structure de paquet HTTP, montrant le remplacement des tokens d''authentification et la manipulation des en-têtes Set-Cookie pour capturer une session d''administration Web via un relais NTLM](https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/writeup-images/wiki/http_relay_payload_injection.webp)

### VI. Vecteurs Modernes : IPv6 Poisoning (mitm6)

Dans les environnements où **LLMNR** est désactivé, l''attaquant exploite la priorité de l''IPv6 sur l''IPv4 dans Windows. L''outil `mitm6` agit comme un serveur **DHCPv6** malveillant.

1.  **Mécanisme** : `mitm6` répond aux sollicitations DHCPv6 et définit l''IP de l''attaquant comme serveur DNS primaire.
2.  **Impact** : Lorsque Windows tente de résoudre un nom (ex: `wpad.domain.local`), il interroge l''attaquant en IPv6, qui le force ensuite à s''authentifier via HTTP ou SMB.

```bash
# Capture des requêtes sur l''interface eth0 pour le domaine local
sudo mitm6 -d internal.corp
```

### VII. Troubleshooting : Pourquoi le relais échoue-t-il ?

Le succès d''un **NTLM Relay** dépend de variables strictes. Voici les points de blocage classiques :

| Erreur / Symptôme | Cause Probable | Solution Technique |
| :--- | :--- | :--- |
| `AUTHENTICATION_REJECTED` | **SMB Signing** activé et requis sur la cible. | Cibler un autre serveur ou relayer vers LDAP/HTTP. |
| Connexion refusée sur l''attaquant | Port 445 ou 80 déjà utilisé par un service local. | Vérifier avec `ss -antlp` et stopper `samba` ou `apache`. |
| `Status_Access_Denied` | L''utilisateur relayé n''a pas de droits locaux sur la cible. | Relayer l''authentification d''un compte plus privilégié. |
| Relais impossible vers la même machine | Protection contre le **Loopback** (MS08-068). | Le relais doit impérativement s''effectuer entre deux machines distinctes. |
| Échec sur Windows 11 / Server 2022 | **EPA (Extended Protection for Authentication)**. | Utiliser des vecteurs ne supportant pas encore EPA ou forcer Kerberos. |

### VIII. Hardening & Blue Team : Sécuriser l''Infrastructure

La défense contre le relais NTLM ne doit pas reposer sur une seule mesure, mais sur une stratégie de **Defense in Depth**.

#### 1. Désactivation des protocoles hérités (Legacy)
La première ligne de défense est de supprimer les vecteurs de **Poisoning**.
*   **GPO pour LLMNR** : `Computer Configuration -> Administrative Templates -> Network -> DNS Client -> Turn off Multicast Name Resolution`.
*   **NetBIOS** : Désactiver via les paramètres DHCP ou manuellement dans les propriétés TCP/IPv4 de l''interface.

#### 2. Activation de la Signature (Signing)
*   **SMB Signing** : Forcer via GPO (`Microsoft network server: Digitally sign communications (always)`). Cela rend le relais SMB impossible.
*   **LDAP Signing & Channel Binding** : Indispensable pour protéger les contrôleurs de domaine contre le relais vers LDAP/S.

#### 3. Extended Protection for Authentication (EPA)
L''**EPA** lie le canal TLS au flux d''authentification NTLM. Si un attaquant tente de relayer une session HTTPS, le lien de canal sera invalide car il ne possédera pas le certificat client ou les secrets du tunnel TLS original.

#### 4. Monitoring & Détection
Surveiller les Event IDs Windows :
*   **Event 4624** : Analyser le "Logon Type". Un type 3 (Network) avec un "Key Length" de 0 est souvent suspect.
*   **Event 4627** : Indique l''utilisation de groupes restreints.
*   **Honeytokens** : Placer des fichiers `.url` ou `.scf` sur des partages ouverts qui pointent vers une IP monitorée pour détecter toute tentative de coercition.

```mermaid
flowchart TD
    Start[Stratégie de Défense NTLM] --> P1[Réduction de Surface]
    Start --> P2[Durcissement Protocol de Transport]
    Start --> P3[Migration Protocolaire]

    P1 --> D1[Désactiver LLMNR/NBT-NS via GPO]
    P1 --> D2[Bloquer Port 445 au Firewall périmétrique]

    P2 --> S1[SMB Signing = Required]
    P2 --> S2[LDAP Channel Binding]
    P2 --> S3[Activer EPA pour IIS/Exchange]

    P3 --> K1[Priorité Kerberos via KDC]
    P3 --> K2[Ajouter Admins au groupe ''Protected Users'']
```

![Tableau de bord de monitoring SOC illustrant une vue éclatée des contre-mesures Active Directory, montrant des graphiques de réduction de l''usage NTLMv1 au profit de Kerberos et des alertes de blocage de tentatives de relais sur des serveurs critiques avec signature activée](https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/writeup-images/wiki/hardening_view.webp)

### Conclusion

L''attaque **NTLM Relay** illustre parfaitement la persistance des vulnérabilités architecturales dans les systèmes hérités. Bien que complexe à mettre en œuvre contre des environnements modernisés (Windows Server 2025/Windows 11), elle reste une "Silver Bullet" dans la majorité des réseaux d''entreprise où la rétrocompatibilité prime sur la sécurité.

La transition vers une architecture **Zero Trust** et l''abandon définitif de NTLM au profit de **Kerberos** (avec PKINIT ou AES) est l''unique solution pérenne. En attendant cette migration, l''activation systématique du **SMB Signing** et de l''**EPA** demeure le rempart le plus pragmatique pour tout ingénieur système soucieux de l''intégrité de sa forêt Active Directory.',
  ARRAY['NTLM', 'Relay', 'Active Directory', 'SMB', 'MitM', 'Security', 'Poisoning', 'WebP'],
  true,
  now()
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  category = EXCLUDED.category,
  tags = EXCLUDED.tags,
  updated_at = now();
