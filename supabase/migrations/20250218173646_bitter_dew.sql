/*
  # Add Root-Me writeup

  1. Changes
    - Insert a new writeup for Root-Me platform
    - Add test data for the Root-Me challenge "Command & Control - Level 1"
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
  description,
  images
) VALUES (
  'Root-Me: Command & Control - Level 1',
  'rootme-command-control-level-1',
  '# Root-Me: Command & Control - Level 1

## Présentation du Challenge

Challenge de type Command & Control (C2) simulant une infection par malware avec communication vers un serveur de contrôle.

## Analyse Initiale

```bash
# Capture réseau fournie
tcpdump -r capture.pcap

# Extraction des données
tshark -r capture.pcap -Y "http" -T fields -e http.request.uri
```

Détection de requêtes HTTP suspectes vers un domaine inconnu.

## Investigation

1. Analyse du trafic C2:
   - Requêtes HTTP POST régulières
   - Données encodées en base64
   - Pattern de beacon typique

2. Décodage des communications:
```python
import base64

encoded_data = "JHtleGVjdXRlLXJlc3BvbnNlfQ=="
decoded = base64.b64decode(encoded_data)
print(decoded)
```

3. Reconstruction de la timeline:
   - Première infection: 15:30 UTC
   - Téléchargement du payload: 15:32 UTC
   - Exfiltration des données: 15:35 UTC

## Résolution

1. Identification du malware utilisé
2. Décodage des commandes C2
3. Récupération du flag dans les données exfiltrées

## Apprentissages

- Importance de la surveillance du trafic réseau
- Techniques de détection des C2
- Méthodes d''obfuscation courantes',
  'rootme',
  'Facile',
  20,
  ARRAY['Network', 'Malware', 'C2', 'Forensics'],
  true,
  'Analyse d''une capture réseau pour détecter et comprendre une infection malware de type Command & Control.',
  ARRAY['https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80']
);