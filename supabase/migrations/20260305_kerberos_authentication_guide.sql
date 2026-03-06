-- Migration to add/update Wiki Page: Kerberos : Les Fondations du 'Three-Headed Dog' dans l'AD
INSERT INTO wiki_pages (title, slug, category, content, tags, published, updated_at)
VALUES (
  'Kerberos : Les Fondations du ''Three-Headed Dog'' dans l''AD',
  'kerberos-authentication-guide',
  'Pentest/Active Directory/Theorie',
  '> [!info] Table des Matières
>
> 
**PARTIE 1 : Fondations & Théorie de Kerberos**
>   * [I. Architecture & Concepts](#i-architecture-concepts)
>   * [II. Les Vecteurs & Fonctionnement](#ii-les-vecteurs-fonctionnement)
>   * [III. The Lab Setup](#iii-the-lab-setup)
>   * [IV. Pre-requisites & Reconnaissance](#iv-pre-requisites-reconnaissance)
> 
**PARTIE 2 : Implémentation & Défense**
>   * [V. Step-by-Step Implementation](#v-step-by-step-implementation)
>   * [VI. Vecteurs Modernes & Optimisations](#vi-vecteurs-modernes-optimisations)
>   * [VII. Troubleshooting](#vii-troubleshooting)
>   * [VIII. Hardening & Blue Team](#viii-hardening-blue-team)
> 
**Conclusion**
>

---

## PARTIE 1 : Fondations & Théorie de Kerberos

### I. Architecture & Concepts

Le protocole Kerberos, né au MIT au sein du projet Athena, s''est imposé comme le standard de facto pour l''authentification au sein des environnements Active Directory (AD). Contrairement aux protocoles de type *Challenge-Response* comme NTLM, Kerberos repose sur un modèle de tiers de confiance (Trusted Third Party) et l''utilisation de tickets pour prouver l''identité sans jamais transiter le mot de passe en clair ou son hash sur le réseau.

L''architecture repose sur trois entités majeures, souvent désignées par le terme "The Three-Headed Dog" :

1.  **Le Client (Principal) :** Toute entité (utilisateur ou machine) cherchant à accéder à une ressource.
2.  **Le Key Distribution Center (KDC) :** Le pivot central, généralement hébergé sur le Domain Controller (DC). Il se divise en deux sous-services :
    *   **Authentication Service (AS) :** Responsable de la validation initiale de l''identité et de l''émission du TGT.
    *   **Ticket Granting Service (TGS) :** Responsable de l''émission des tickets de service (ST).
3.  **Le Service Server (Application) :** La ressource finale (SMB share, SQL Server, Web IIS) que le client souhaite consommer.

La sécurité de ce modèle repose sur la connaissance préalable par le KDC de tous les secrets (hashes de mots de passe) de tous les objets du domaine. Un élément critique de cette architecture est le compte **KRBTGT**, dont le hash NTLM sert à chiffrer les TGT. Si ce secret est compromis, l''intégralité du domaine est virtuellement sous le contrôle de l''attaquant.

```mermaid
graph LR
    subgraph "Trust Realm"
    A[Client Principal] -- "1. AS-REQ" --> B[AS - Authentication Service]
    B -- "2. AS-REP (TGT)" --> A
    A -- "3. TGS-REQ (TGT)" --> C[TGS - Ticket Granting Service]
    C -- "4. TGS-REP (Service Ticket)" --> A
    A -- "5. AP-REQ (ST)" --> D[Service Server]
    D -- "6. AP-REP (Mutual Auth)" --> A
    end
    subgraph "KDC (Domain Controller)"
    B
    C
    end
```

![Représentation macroscopique et abstraite de l''architecture Kerberos illustrant les flux de données chiffrées entre le KDC, les terminaux clients et les serveurs applicatifs. L''esthétique utilise des motifs de circuits intégrés et des nœuds de confiance interconnectés pour symboliser la centralisation des secrets au sein de la base de données NTDS.DIT](https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/writeup-images/wiki/kerberos_macro_arch.png)

### II. Les Vecteurs & Fonctionnement

Le flux d''authentification Kerberos se décompose en trois échanges distincts de type requête/réponse. Chaque étape est critique et utilise des mécanismes de chiffrement symétrique (souvent AES-256 ou RC4).

#### 1. AS-REQ / AS-REP (Initial Authentication)
Le client envoie un `AS-REQ`. Pour prouver son identité sans envoyer son mot de passe, il chiffre un *Timestamp* avec son propre hash (Pre-Authentication). Le KDC, possédant ce hash, déchiffre le *Timestamp*. S''il est valide (gestion du *Time Skew* de 5 minutes pour éviter les *Replay Attacks*), le KDC renvoie un `AS-REP` contenant :
*   Le **Ticket-Granting Ticket (TGT)** : Chiffré avec le hash du compte `krbtgt`. Le client ne peut pas le lire.
*   Une **Session Key** : Chiffrée avec le hash du client, permettant de sécuriser les futurs échanges avec le TGS.

#### 2. TGS-REQ / TGS-REP (Service Authorization)
Muni de son TGT, le client contacte le TGS via un `TGS-REQ`. Il présente son TGT et un `Authenticator` (prouvant qu''il possède la clé de session). Il précise le **Service Principal Name (SPN)** de la ressource visée. Le TGS déchiffre le TGT, vérifie les droits et renvoie un `TGS-REP` contenant le **Service Ticket (ST)**, chiffré avec le hash du compte de service cible.

#### 3. AP-REQ / AP-REP (Service Request)
Enfin, le client présente le `ST` au serveur applicatif via `AP-REQ`. Le serveur déchiffre le ticket avec son propre secret. S''il peut le lire, il sait que le ticket provient du KDC. Le serveur extrait le **Privilege Attribute Certificate (PAC)** pour vérifier les appartenances aux groupes de l''utilisateur et décider de l''accès.

```mermaid
sequenceDiagram
    participant C as Client
    participant K as KDC (AS/TGS)
    participant S as Target Service
    Note over C,K: AS Exchange
    C->>K: AS-REQ (Pre-Auth: Encrypted Timestamp)
    K->>C: AS-REP (TGT + Client/TGS Session Key)
    Note over C,K: TGS Exchange
    C->>K: TGS-REQ (TGT + Authenticator + SPN)
    K->>C: TGS-REP (Service Ticket + Client/Server Session Key)
    Note over C,S: AP Exchange
    C->>S: AP-REQ (Service Ticket + Authenticator)
    S->>C: AP-REP (Mutual Auth - Optional)
```

![Détail technique microscopique d''une structure de paquet Kerberos montrant les headers ASN.1, les champs de chiffrement EType 18 (AES256-CTS-HMAC-SHA1-96) et la structure binaire d''un Ticket-Granting Ticket encapsulant le Privilege Attribute Certificate](https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/writeup-images/wiki/kerberos_packet_structure.png)

### III. The Lab Setup

Pour étudier Kerberos, un environnement de laboratoire contrôlé est impératif. La virtualisation est la méthode privilégiée pour simuler un domaine AD complet.

**Spécifications recommandées :**
*   **Domain Controller (DC1) :** Windows Server 2019/2022. 
    *   Rôle : AD DS, DNS.
    *   Configuration : Création d''un domaine `TRTNXBOOK.LOCAL`.
    *   Comptes : `krbtgt` (par défaut), `svc_web` (service principal), `user_test`.
*   **Workstation (WS1) :** Windows 10/11 joint au domaine.
    *   Utilisé pour générer du trafic légitime et tester le SSO.
*   **Attacker Node (KALI) :** Linux.
    *   Outils : Impacket, Kerbrute, Rubeus (via Cobalt Strike ou via transfert sur WS1).

Le paramètre le plus critique est la synchronisation temporelle via **NTP**. Si l''écart entre le DC et les clients excède 300 secondes, Kerberos rejettera systématiquement les requêtes pour prévenir les injections de tickets interceptés.

```mermaid
graph TD
    subgraph "Lab Network (10.0.0.0/24)"
    DC[DC01 - Windows Server 2022]
    WS[WS01 - Windows 11]
    Kali[Attacker - Kali Linux]
    end
    DC --- WS
    DC --- Kali
    WS --- Kali
```

### IV. Pre-requisites & Reconnaissance

Avant toute interaction, l''ingénieur doit identifier les surfaces d''attaque Kerberos via une phase de reconnaissance.

#### 1. Identification du KDC
La découverte du KDC se fait via des requêtes DNS sur les enregistrements `SRV`. Ces enregistrements indiquent quel serveur gère le protocole sur le port UDP 88.

```bash
# Recherche des serveurs Kerberos via DNS
nslookup -type=srv _kerberos._udp.trtnxbook.local
```

#### 2. Discovery des SPN (Service Principal Names)
Un SPN est l''identifiant unique d''un service dans AD. Sans SPN, Kerberos ne peut pas associer un ticket à un secret. Lister les SPN permet d''identifier les cibles potentielles pour des attaques de type *Kerberoasting*.

```powershell
# Utilisation de l''outil natif Windows
setspn -T trtnxbook.local -Q */*

# Recherche ciblée sur les comptes utilisateurs ayant un SPN (cibles Kerberoast)
Get-NetUser -Unconstrained -AdminCount
```

#### 3. Énumération des Encryption Types (ETypes)
Le choix de l''algorithme de chiffrement impacte la robustesse des tickets. Le flag `msDS-SupportedEncryptionTypes` sur un compte définit si le KDC utilisera du RC4 (vulnérable) ou de l''AES.

*   **RC4_HMAC (etype 23) :** Basé sur le hash MD4 du mot de passe (équivalent au hash NTLM). Facilement crackable hors-ligne.
*   **AES256_CTS_HMAC_SHA1 (etype 18) :** Standard moderne. Nécessite une puissance de calcul massive pour être bruteforcé.

```mermaid
flowchart TD
    A[Début Reconnaissance] --> B{Accès au Domaine?}
    B -- Non --> C[DNS SRV Lookup]
    C --> D[Scan de ports 88/888]
    B -- Oui --> E[Énumération SPN]
    E --> F[Check Encryption Types]
    F --> G[Identification cibles Kerberoast/AS-REP Roast]
```

![Illustration conceptuelle montrant la vision d''un attaquant sur un réseau Active Directory : des fils d''or (SPN) relient les utilisateurs aux serveurs, tandis que des verrous chiffrés (Tickets) flottent au-dessus des flux réseau, certains apparaissant plus fragiles (RC4) que d''autres (AES)](https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/writeup-images/wiki/attacker_recon_vision.png)

L''étape suivante, traitée dans la Partie 2, concernera l''exploitation de ces faiblesses architecturales et les méthodes de durcissement associées.

## PARTIE 2 : Implémentation & Défense

### V. Step-by-Step Implementation

L''interaction manuelle avec Kerberos permet de décomposer chaque phase pour en comprendre les failles potentielles. Nous utilisons ici les deux standards de l''industrie : **Impacket** (pour les vecteurs depuis Linux) et **Rubeus** (pour les opérations *In-Memory* sous Windows).

#### 1. Phase Authentication Service (AS) : Acquisition du TGT
Le but est de prouver l''identité pour obtenir le `Ticket-Granting Ticket`. 

```bash
# Via Impacket (génère un fichier .ccache)
getTGT.py -dc-ip 10.0.0.1 trtnxbook.local/user_test:Password123

# Via Rubeus (génère un blob base64 ou un fichier .kirbi)
Rubeus.exe asktgt /user:user_test /password:Password123 /domain:trtnxbook.local /dc:10.0.0.1 /outfile:user_test.kirbi
```
**Mécanisme :** Le client génère un `AS-REQ`. Le KDC répond avec un `AS-REP` contenant le TGT (chiffré par le hash du compte `krbtgt`) et une clé de session (chiffrée par le hash de l''utilisateur). L''outil extrait cette clé de session pour permettre les étapes suivantes.

#### 2. Phase Ticket Granting Service (TGS) : Acquisition du Service Ticket
Une fois le TGT en cache, le client sollicite l''accès à une ressource spécifique définie par son **Service Principal Name (SPN)**.

```bash
# Utilisation du ticket .ccache précédemment obtenu
export KRB5CCNAME=user_test.ccache
getST.py -dc-ip 10.0.0.1 -spn "HTTP/webserver.trtnxbook.local" -k -no-pass trtnxbook.local/user_test

# Via Rubeus
Rubeus.exe asktgs /ticket:user_test.kirbi /service:"HTTP/webserver.trtnxbook.local" /outfile:http_ticket.kirbi
```

#### 3. Phase Application Request (AP) : Consommation du service
Le `ST` est présenté au service final. Sous Windows, cela se fait via l''injection du ticket dans la session de logon (Pass-The-Ticket).

```powershell
# Injection du ticket dans la session courante
Rubeus.exe ptt /ticket:http_ticket.kirbi

# Vérification du cache Kerberos local
klist
```

```mermaid
sequenceDiagram
    participant A as Attacker/Client
    participant K as KDC (DC01)
    participant S as Web Server
    Note over A,K: AS-REQ (Pre-Auth)
    A->>K: getTGT.py (user/pass)
    K-->>A: TGT (ccache file)
    Note over A,K: TGS-REQ (SPN request)
    A->>K: getST.py -spn HTTP/webserver
    K-->>A: Service Ticket (ST)
    Note over A,S: AP-REQ (Access)
    A->>S: Presentation of ST
    S-->>A: Access Granted
```

![Vue microscopique d''une injection de ticket Kerberos dans la mémoire LSASS, illustrant la structure d''un bloc ''Principal'' et le remplacement d''un ticket légitime par un ticket forgé. L''image utilise des tons néons sur fond sombre pour symboliser les segments de mémoire vive et les pointeurs de fonction système](https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/writeup-images/wiki/kerberos_memory_injection.png)

### VI. Vecteurs Modernes & Optimisations

L''évolution de l''AD a introduit des nuances critiques dans la gestion des secrets.

#### 1. Encryption Downgrade & RC4
Si un compte est configuré pour supporter uniquement le `RC4_HMAC` (etype 23), le KDC émettra des tickets dont le secret est directement dérivé du hash NTLM. C''est le fondement du **Kerberoasting** : un attaquant demande un TGS pour un SPN, puis tente de craquer le ticket *offline*. 

```bash
# Extraction des tickets pour craquage offline (Kerberoasting)
GetUserSPNs.py trtnxbook.local/user_test:Password123 -dc-ip 10.0.0.1 -request
```

#### 2. AS-REP Roasting
Certains comptes n''exigent pas la `Pre-Authentication`. Un attaquant peut envoyer un `AS-REQ` pour n''importe lequel de ces utilisateurs et recevoir un `AS-REP` contenant une partie chiffrée avec le hash de l''utilisateur, sans même connaître son mot de passe.

```mermaid
flowchart TD
    A[Identifier comptes sans Pre-Auth] --> B[Envoyer AS-REQ]
    B --> C[Recevoir AS-REP]
    C --> D[Extraire blob chiffré]
    D --> E[Bruteforce Offline du Hash]
```

![Représentation abstraite d''une attaque par force brute offline : des cascades de caractères hexadécimaux se heurtent à un bouclier cryptographique (AES) tandis qu''un flux plus faible (RC4) se fissure sous la pression d''un cluster de calcul GPU](https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/writeup-images/wiki/offline_cracking_metaphor.png)

### VII. Troubleshooting

Le déploiement de Kerberos échoue souvent à cause de trois facteurs :

1.  **Time Skew (Dérive temporelle) :** Si l''horloge du client et du DC diffère de plus de 5 minutes, l''authentification échoue avec l''erreur `KRB_AP_ERR_SKEW`. Kerberos utilise le *Timestamp* pour empêcher les *Replay Attacks*.
    *   *Solution :* Configurer un serveur NTP commun.
2.  **DNS Resolution :** Kerberos s''appuie exclusivement sur les noms de domaine. L''utilisation d''adresses IP pour accéder à un service forcera souvent le passage vers NTLM.
    *   *Solution :* Vérifier les enregistrements SRV `_kerberos._udp.DOMAIN.COM`.
3.  **SPN Duplication :** Si deux comptes possèdent le même SPN, le KDC ne saura pas quel secret utiliser pour chiffrer le ticket, provoquant une erreur `KDC_ERR_S_PRINCIPAL_UNKNOWN`.

```bash
# Vérifier la présence des enregistrements SRV indispensables
nslookup -q=SRV _kerberos._tcp.trtnxbook.local
```

### VIII. Hardening & Blue Team

Pour sécuriser un environnement "Kerberisé", la Blue Team doit agir sur la configuration des objets et la surveillance des journaux d''événements.

#### 1. Enforcer AES-256
Désactiver les types de chiffrement obsolètes (DES et RC4) via GPO : `Computer Configuration -> Windows Settings -> Security Settings -> Local Policies -> Security Options -> Network security: Configure encryption types allowed for Kerberos`.

#### 2. Protection du compte KRBTGT
Le secret du compte `krbtgt` ne peut pas être réinitialisé automatiquement. Il est impératif de changer son mot de passe **deux fois de suite** périodiquement (pour invalider les anciens tickets et les clés de session précédentes), car AD conserve les deux derniers hashs en mémoire pour la transition.

#### 3. Monitoring des événements critiques
*   **Event ID 4768 :** TGT Request (Vérifier les anomalies de sources IP).
*   **Event ID 4769 :** TGS Request (Surveiller les demandes massives de tickets de service, signe de Kerberoasting).
*   **Event ID 4771 :** Kerberos Pre-Authentication failed (Signe de Bruteforce).

```mermaid
graph TD
    subgraph "Défense en Profondeur"
    H1[Désactivation RC4] --> H2[Rotation KRBTGT x2]
    H2 --> H3[Surveillance SIEM 4769]
    H3 --> H4[Tiered Admin Model]
    end
```

![Architecture de défense multicouche montrant un Domain Controller fortifié, protégé par des pare-feu applicatifs et un centre de surveillance (SOC). Des flux de logs dorés (Audit) remontent vers une interface de monitoring tandis que des verrous AES-256 bloquent les tentatives d''accès non autorisées](https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/writeup-images/wiki/hardening_view.png)

## Conclusion

Kerberos demeure le pivot central de la confiance au sein d''un domaine Active Directory. Sa complexité architecturale, bien que robuste face aux interceptions réseau classiques, offre une surface d''attaque conséquente dès lors que les configurations s''écartent des standards modernes (AES-256, Pre-Auth impérative). Pour l''ingénieur IT, la maîtrise du cycle de vie des tickets n''est pas une option, mais une nécessité pour garantir l''intégrité des identités au sein de l''entreprise. La transition vers une posture de défense active, axée sur la détection des anomalies de requêtes TGS et le durcissement des politiques de chiffrement, constitue aujourd''hui la seule parade efficace contre les techniques d''exploitation de type *Post-Exploitation*.',
  ARRAY['Kerberos', 'Active Directory', 'Authentication', 'TGT', 'TGS', 'Security'],
  true,
  now()
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  category = EXCLUDED.category,
  tags = EXCLUDED.tags,
  updated_at = now();
