#!/usr/bin/env python3
"""
refactor-wiki.py — Pipeline de refactoring des notes CPTS en 3 passes via Gemini

Usage:
  python3 scripts/refactor-wiki.py                  # Traite tous les fichiers
  python3 scripts/refactor-wiki.py --limit 5        # Limite à 5 fichiers (test)
  python3 scripts/refactor-wiki.py --file "chemin"  # Un seul fichier
  python3 scripts/refactor-wiki.py --sync           # Sync vers Supabase après traitement
  python3 scripts/refactor-wiki.py --sync-only      # Sync uniquement (sans retraiter)
  python3 scripts/refactor-wiki.py --reset          # Reset la progression (recommence tout)

Variables d'environnement requises:
  GEMINI_API_KEY          Clef API Google Gemini
  SUPABASE_SERVICE_KEY    (optionnel pour --sync)
"""

import os, sys, json, re, time, argparse, urllib.request, urllib.error
from pathlib import Path
from datetime import datetime

# ─────────────────────────── CONFIG ────────────────────────────────────────

WIKI_DIR     = Path(__file__).parent.parent / ".Pentestin_Leadsheetv2"
OUTPUT_DIR   = Path(__file__).parent.parent / ".wiki_clean"
PROGRESS_FILE = Path(__file__).parent.parent / ".refactor_progress.json"

GEMINI_API_KEY    = os.environ.get("GEMINI_API_KEY", "")
GEMINI_MODEL      = "gemini-3.1-flash-lite-preview"
GEMINI_API_URL    = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"
REQUEST_DELAY     = 5   # secondes entre chaque appel API (free tier ~15 RPM, 1500 RPD)
MAX_RETRIES       = 3

SUPABASE_URL      = "https://srmwnujqhxaopnffesgl.supabase.co"
SUPABASE_KEY      = os.environ.get(
    "SUPABASE_SERVICE_KEY",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNybXdudWpxaHhhb3BuZmZlc2dsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczOTg5ODkyMCwiZXhwIjoyMDU1NDc0OTIwfQ.RLd2mrctE3EDmXh4mGzUtofFv3yOcJmqwEwlXMgBEsI"
)

# ─────────────────────────── NORMALISATION CATÉGORIE ───────────────────────

# Mapping top-level
TOP_LEVEL_MAP = {
    "1- information gathering": "Reconnaissance",
    "2- exploitation":          "Exploitation",
    "3- lateral movement":      "Lateral Movement",
    "4- post-exploitation":     "Post-Exploitation",
}

# Parties à supprimer/collapser (redondantes avec le niveau parent)
COLLAPSE_PARTS = {
    "service exploitation",
    "services",
    "1- service enumeration",
}

def clean_part(part: str) -> str:
    """Nettoie une partie du chemin : supprime préfixes numériques, ports, caractères parasites."""
    # Supprimer préfixe "N- "
    part = re.sub(r'^\d+[-.\s]+', '', part)
    # Supprimer ports entre parenthèses : "DNS (53)" → "DNS"
    part = re.sub(r'\s*\([^)]*\)', '', part)
    # Supprimer "BIG DOSSIER" et équivalents
    part = re.sub(r'\bBIG DOSSIER\b', '', part, flags=re.IGNORECASE)
    return part.strip()

def normalize_category(parts: list[str]) -> str:
    """Convertit une liste de parties de chemin en catégorie propre."""
    result = []
    for i, part in enumerate(parts):
        lower = part.lower()

        # Mapping top-level
        if i == 0 and lower in TOP_LEVEL_MAP:
            result.append(TOP_LEVEL_MAP[lower])
            continue

        # Collapse les parties redondantes
        if lower in COLLAPSE_PARTS:
            continue

        cleaned = clean_part(part)
        if cleaned:
            result.append(cleaned)

    return "/".join(result)

def make_slug(category: str, title: str) -> str:
    """Génère un slug propre depuis catégorie + titre."""
    full = f"{category}/{title}"
    slug = full.lower()
    slug = re.sub(r'[àáâãäå]', 'a', slug)
    slug = re.sub(r'[èéêë]',   'e', slug)
    slug = re.sub(r'[ìíîï]',   'i', slug)
    slug = re.sub(r'[òóôõö]',  'o', slug)
    slug = re.sub(r'[ùúûü]',   'u', slug)
    slug = re.sub(r'[ç]',      'c', slug)
    slug = re.sub(r'[ñ]',      'n', slug)
    slug = re.sub(r'[^a-z0-9]+', '-', slug)
    slug = re.sub(r'-+', '-', slug).strip('-')
    return slug[:120]  # limite de longueur

def file_to_metadata(md_file: Path) -> dict:
    """Extrait titre, catégorie et slug depuis le chemin du fichier."""
    relative = md_file.relative_to(WIKI_DIR)
    parts    = list(relative.parts)
    filename = parts[-1]
    path_parts = parts[:-1]

    title    = filename.replace('.md', '').strip()
    category = normalize_category(path_parts)
    slug     = make_slug(category, title)

    return {"title": title, "category": category, "slug": slug}

# ─────────────────────────── PROMPTS ───────────────────────────────────────

PROMPT_AUDIT = """Tu es un expert en pentest offensif niveau CPTS (HackTheBox Academy).
Analyse ce fichier de notes de pentest.

Retourne UNIQUEMENT un JSON valide structuré ainsi (pas de markdown, pas de ```json) :
{{
  "sujet": "sujet principal de la note",
  "phase_pentest": "Reconnaissance | Exploitation | Lateral Movement | Post-Exploitation",
  "sections_presentes": ["liste des sections techniques présentes"],
  "commandes_presentes": ["liste des outils/commandes mentionnés"],
  "sections_manquantes": ["sections importantes absentes pour une note CPTS complète sur ce sujet"],
  "tags_suggeres": ["3 à 6 tags courts, en minuscules, pertinents : ex dns, enumeration, windows, ad, exploit"],
  "flux_a_diagrammer": true,
  "callouts_pertinents": ["infos qui méritent un callout : prérequis, conditions critiques, tips, dangers"],
  "notes_liees": ["titres exacts d'autres notes CPTS probablement liées"],
  "problemes_format": ["liste des problèmes détectés"]
}}

FICHIER :
{content}"""

PROMPT_CLEAN = """Tu es un expert en pentest offensif niveau CPTS (HackTheBox Academy).
Réécris ce fichier de notes pentest pour un wiki markdown moderne. Respecte ces règles STRICTES.

--- SUPPRIMER ---
Tout langage où l'IA s'adresse à l'utilisateur, sans exception :
- Intros : "Voici un cheat sheet...", "Voici une cheatsheet complète...", "Voici le dossier complet sur...", "Voici un cours condensé..."
- Conclusions : "Avec cette cheatsheet tu as...", "Tu disposes maintenant de...", "J'espère que..."
- Questions : "Souhaites-tu...", "Besoin d'un focus...", "Veux-tu que je...", "Besoin d'un diagramme ?"
- Commentaires mid-fichier : "💡 Explication :", "👉 Réponse indicative :", "🎯 Tu obtiens :", "✅ Résultat :", "> ⚠️ En résumé :"
- Tous les emojis (📌🔥🎯🔍✅⚠️🚀🛠️🧪1️⃣2️⃣ etc.) sauf dans les blocs de code
- Les sections "Liens associés" et tous les [[liens Obsidian]]
- Les sections vides (titre sans contenu)
- Le gras systématique sur tout

--- CONSERVER ABSOLUMENT ---
- CHAQUE commande, flag, option — ne RIEN résumer ni supprimer
- CHAQUE exemple de sortie/output de commande
- CHAQUE tableau existant
- CHAQUE explication technique (reformulée en style documentation neutre si elle était en langage IA)

--- FORMAT OBLIGATOIRE ---

Structure :
- Ne PAS utiliser de H1 (# Titre) — le titre est déjà rendu par l'UI du wiki
- H2 (##) : sections principales — auront un séparateur visuel automatique
- H3 (###) : sous-sections — s'affichent en violet dans le wiki
- Blocs de code avec langage explicite : ```bash ```powershell ```text ```python ```json
- Tableaux markdown bien alignés avec header
- Si flux_a_diagrammer est true dans l'audit → ajoute un diagramme Mermaid pertinent au début, après une courte intro d'une phrase :
  - flowchart LR/TD pour une chaîne d'attaque
  - sequenceDiagram pour un protocole réseau

Callouts (utiliser selon l'audit, syntaxe exacte) :
> [!danger] Titre optionnel
> Conditions critiques, prérequis bloquants, risques de détection

> [!warning] Titre optionnel
> Points d'attention, limitations, cas particuliers

> [!tip] Titre optionnel
> Raccourcis utiles, astuces pratiques, optimisations

> [!info] Titre optionnel
> Contexte, théorie, explications de fond

> [!note] Titre optionnel
> Références, infos complémentaires

Gras (intentionnel uniquement) :
- Noms d'outils et binaires : **Responder**, **Certipy**, **hashcat**, **netexec**
- Flags/options critiques dans les explications texte : **-m 5600**, **--local-auth**
- Termes de sécurité clés : **NTLMv2**, **Pass-the-Hash**, **EKU**, **TGT**
- Avertissements : **Attention :** ou **Prérequis :**
- PAS de gras sur des phrases entières, PAS sur les verbes ordinaires

Notes liées (backlinks) :
- Mentionner naturellement dans le texte les sujets liés listés dans l'audit notes_liees

AUDIT de référence :
{audit}

FICHIER :
{content}"""

PROMPT_COMPLETE = """Tu es un expert en pentest offensif niveau CPTS (HackTheBox Academy).
Voici une note de pentest nettoyée et son audit listant les sections manquantes.

Ajoute UNIQUEMENT les sections manquantes listées dans sections_manquantes de l'audit.
Ne modifie, ne reformule, ne réordonne PAS ce qui existe.

Chaque ajout doit :
- Être au niveau CPTS réel : commandes concrètes, options importantes, exemples de sortie réels
- Respecter le même style : pas d'emojis, pas de langage IA, gras intentionnel uniquement
- Utiliser le même format : ```bash, tableaux markdown, Mermaid si flux complexe
- Utiliser des callouts [!danger]/[!warning]/[!tip] si pertinents
- Mentionner naturellement les notes liées (notes_liees) pour activer les backlinks
- Ignorer une section manquante si elle n'est vraiment pas pertinente pour ce sujet précis

Ne commence PAS par un H1.
Retourne la note COMPLÈTE (existante + ajouts intégrés à la bonne position logique).

AUDIT :
{audit}

NOTE NETTOYÉE :
{content}"""

# ─────────────────────────── API GEMINI ────────────────────────────────────

def call_gemini(prompt: str, label: str = "") -> str:
    """Appel à l'API Gemini avec retry exponentiel."""
    if not GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY non définie. Export GEMINI_API_KEY=ta_clef")

    payload = json.dumps({
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.3,
            "maxOutputTokens": 8192,
        }
    }).encode("utf-8")

    url = f"{GEMINI_API_URL}?key={GEMINI_API_KEY}"

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            req = urllib.request.Request(
                url,
                data=payload,
                headers={"Content-Type": "application/json"},
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=60) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                text = data["candidates"][0]["content"]["parts"][0]["text"]
                time.sleep(REQUEST_DELAY)
                return text.strip()

        except urllib.error.HTTPError as e:
            body = e.read().decode("utf-8", errors="replace")
            if e.code == 429:
                wait = 30 * attempt
                print(f"  ⏳ Rate limit (429), attente {wait}s... [{label}]")
                time.sleep(wait)
            else:
                print(f"  ✗ HTTP {e.code}: {body[:200]} [{label}]")
                if attempt == MAX_RETRIES:
                    raise
                time.sleep(5 * attempt)

        except Exception as e:
            print(f"  ✗ Erreur attempt {attempt}/{MAX_RETRIES}: {e} [{label}]")
            if attempt == MAX_RETRIES:
                raise
            time.sleep(5 * attempt)

    raise RuntimeError(f"Échec après {MAX_RETRIES} tentatives [{label}]")

# ─────────────────────────── PIPELINE 3 PASSES ─────────────────────────────

def print_progress_bar(current: int, total: int, width: int = 30) -> str:
    filled = int(width * current / total) if total else 0
    bar    = "█" * filled + "░" * (width - filled)
    pct    = 100 * current / total if total else 0
    return f"[{bar}] {pct:.0f}% ({current}/{total})"

def fmt_time(seconds: float) -> str:
    if seconds < 60:
        return f"{int(seconds)}s"
    return f"{int(seconds // 60)}m{int(seconds % 60):02d}s"

def process_file(md_file: Path, progress: dict, file_index: int, file_total: int, start_time: float) -> dict | None:
    """Traite un fichier en 3 passes. Retourne les métadonnées ou None si skip."""
    key = str(md_file)

    if key in progress and progress[key].get("status") == "done":
        print(f"  ↩  Déjà traité, skip")
        return progress[key].get("metadata")

    content = md_file.read_text(encoding="utf-8", errors="replace").strip()

    if len(content) < 50:
        print(f"  ⚠  Fichier vide/trop court, skip")
        progress[key] = {"status": "skipped", "reason": "too_short"}
        return None

    meta = file_to_metadata(md_file)
    words = len(content.split())
    print(f"  📄  {words} mots | catégorie → {meta['category']}")
    print(f"  🔗  slug → {meta['slug']}")

    try:
        t0 = time.time()

        # PASS 1 — Audit
        print(f"  ├─ [1/3] Audit en cours...", end="", flush=True)
        audit_raw = call_gemini(
            PROMPT_AUDIT.format(content=content),
            label=f"audit:{meta['slug'][:40]}"
        )
        audit_raw = re.sub(r'^```json\s*', '', audit_raw, flags=re.MULTILINE)
        audit_raw = re.sub(r'^```\s*$',    '', audit_raw, flags=re.MULTILINE)
        try:
            audit = json.loads(audit_raw)
        except json.JSONDecodeError:
            m = re.search(r'\{[\s\S]*\}', audit_raw)
            audit = json.loads(m.group()) if m else {}

        meta["tags"] = audit.get("tags_suggeres", [])
        manquantes   = audit.get("sections_manquantes", [])
        mermaid      = audit.get("flux_a_diagrammer", False)
        print(f" ✓ ({fmt_time(time.time()-t0)})")
        print(f"  │   tags: {', '.join(meta['tags']) or 'aucun'}")
        print(f"  │   sections manquantes: {len(manquantes)} | mermaid: {'oui' if mermaid else 'non'}")

        # PASS 2 — Nettoyage
        t1 = time.time()
        print(f"  ├─ [2/3] Nettoyage...", end="", flush=True)
        clean_content = call_gemini(
            PROMPT_CLEAN.format(audit=json.dumps(audit, ensure_ascii=False), content=content),
            label=f"clean:{meta['slug'][:40]}"
        )
        clean_words = len(clean_content.split())
        print(f" ✓ ({fmt_time(time.time()-t1)}) | {words}w → {clean_words}w")

        # PASS 3 — Complétion
        t2 = time.time()
        print(f"  └─ [3/3] Complétion...", end="", flush=True)
        final_content = call_gemini(
            PROMPT_COMPLETE.format(audit=json.dumps(audit, ensure_ascii=False), content=clean_content),
            label=f"complete:{meta['slug'][:40]}"
        )
        final_words = len(final_content.split())
        print(f" ✓ ({fmt_time(time.time()-t2)}) | {clean_words}w → {final_words}w (+{final_words-words})")

        # Sauvegarde
        relative    = md_file.relative_to(WIKI_DIR)
        output_file = OUTPUT_DIR / relative
        output_file.parent.mkdir(parents=True, exist_ok=True)
        output_file.write_text(final_content, encoding="utf-8")

        elapsed  = time.time() - start_time
        avg_per  = elapsed / file_index
        remaining = avg_per * (file_total - file_index)
        print(f"  ✓  Sauvegardé → .wiki_clean/{relative}")
        print(f"  ⏱  Fichier: {fmt_time(time.time()-t0)} | Écoulé: {fmt_time(elapsed)} | Restant: ~{fmt_time(remaining)}")

        progress[key] = {
            "status":       "done",
            "output_path":  str(output_file),
            "metadata":     meta,
            "processed_at": datetime.now().isoformat()
        }
        return meta

    except Exception as e:
        print(f"\n  ✗  ERREUR: {e}")
        progress[key] = {"status": "error", "error": str(e)}
        return None

# ─────────────────────────── SUPABASE SYNC ─────────────────────────────────

def supabase_request(method: str, path: str, data: dict | list | None = None) -> dict | list:
    """Appel REST Supabase."""
    url     = f"{SUPABASE_URL}/rest/v1/{path}"
    payload = json.dumps(data).encode("utf-8") if data is not None else None
    headers = {
        "apikey":          SUPABASE_KEY,
        "Authorization":  f"Bearer {SUPABASE_KEY}",
        "Content-Type":   "application/json",
        "Prefer":         "return=minimal",
    }
    req = urllib.request.Request(url, data=payload, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            body = resp.read().decode("utf-8")
            return json.loads(body) if body else {}
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"Supabase {method} {path} → HTTP {e.code}: {body[:300]}")

def sync_to_supabase(progress: dict, clean_sync: bool = False):
    """Synchronise les fichiers traités vers Supabase."""
    print("\n─────────────────────────────────────────")
    print("📡  Synchronisation Supabase")

    if clean_sync:
        print("  🗑  Suppression de toutes les wiki_pages existantes...")
        supabase_request("DELETE", "wiki_pages?id=not.is.null")
        print("  ✓  Table vidée")

    done_entries = [v for v in progress.values() if v.get("status") == "done"]
    total        = len(done_entries)
    success      = 0

    for i, entry in enumerate(done_entries, 1):
        meta        = entry["metadata"]
        output_path = Path(entry["output_path"])

        if not output_path.exists():
            print(f"  ✗ [{i}/{total}] Fichier output manquant: {output_path}")
            continue

        content = output_path.read_text(encoding="utf-8")

        # TOC auto-généré (callout [!info])
        toc_entries = []
        for line in content.splitlines():
            m = re.match(r'^(#{2,3})\s+(.+)$', line.strip())
            if m:
                level  = len(m.group(1))
                text   = m.group(2).strip()
                anchor = re.sub(r'[^\w]+', '-', text.lower()).strip('-')
                if level == 2:
                    toc_entries.append(f"**{text}**")
                else:
                    toc_entries.append(f"  * [{text}](#{anchor})")

        if toc_entries:
            toc_block = (
                "> [!info] Table des matières\n>\n"
                + "\n".join(f"> {e}" for e in toc_entries)
                + "\n>\n\n---\n\n"
            )
            content = toc_block + content

        record = {
            "title":      meta["title"],
            "slug":       meta["slug"],
            "category":   meta["category"],
            "content":    content,
            "tags":       meta.get("tags", []),
            "published":  True,
            "updated_at": datetime.now().isoformat(),
        }

        try:
            # Upsert sur le slug
            req_path = "wiki_pages?on_conflict=slug"
            url      = f"{SUPABASE_URL}/rest/v1/{req_path}"
            payload  = json.dumps(record).encode("utf-8")
            headers  = {
                "apikey":         SUPABASE_KEY,
                "Authorization":  f"Bearer {SUPABASE_KEY}",
                "Content-Type":   "application/json",
                "Prefer":         "resolution=merge-duplicates,return=minimal",
            }
            req = urllib.request.Request(url, data=payload, headers=headers, method="POST")
            with urllib.request.urlopen(req, timeout=30) as resp:
                resp.read()

            print(f"  ✓ [{i}/{total}] {meta['title']} ({meta['category']})")
            success += 1

        except Exception as e:
            print(f"  ✗ [{i}/{total}] {meta['title']}: {e}")

    print(f"\n  Résultat : {success}/{total} pages synchronisées")

# ─────────────────────────── MAIN ──────────────────────────────────────────

def load_progress() -> dict:
    if PROGRESS_FILE.exists():
        try:
            return json.loads(PROGRESS_FILE.read_text(encoding="utf-8"))
        except Exception:
            return {}
    return {}

def save_progress(progress: dict):
    PROGRESS_FILE.write_text(json.dumps(progress, indent=2, ensure_ascii=False), encoding="utf-8")

def main():
    parser = argparse.ArgumentParser(description="Refactoring pipeline des notes CPTS")
    parser.add_argument("--limit",     type=int, help="Limiter à N fichiers (test)")
    parser.add_argument("--file",      type=str, help="Traiter un seul fichier")
    parser.add_argument("--sync",      action="store_true", help="Sync vers Supabase après traitement")
    parser.add_argument("--sync-only", action="store_true", help="Sync uniquement (sans retraiter)")
    parser.add_argument("--clean-sync",action="store_true", help="Vide la table avant sync")
    parser.add_argument("--reset",     action="store_true", help="Reset la progression")
    args = parser.parse_args()

    # Reset progression
    if args.reset:
        if PROGRESS_FILE.exists():
            PROGRESS_FILE.unlink()
        print("✓ Progression réinitialisée")
        if not args.sync and not getattr(args, 'sync_only', False):
            return

    progress = load_progress()

    if not getattr(args, 'sync_only', False):
        # Collecte des fichiers à traiter
        if args.file:
            md_files = [Path(args.file).resolve()]
        else:
            md_files = sorted(WIKI_DIR.rglob("*.md"))

        if args.limit:
            # Traiter en priorité les non-traités
            pending = [f for f in md_files if progress.get(str(f), {}).get("status") != "done"]
            md_files = pending[:args.limit]

        total = len(md_files)
        done_count = sum(1 for f in md_files if progress.get(str(f), {}).get("status") == "done")

        print(f"╔══════════════════════════════════════════╗")
        print(f"║   Wiki CPTS Refactoring Pipeline         ║")
        print(f"╚══════════════════════════════════════════╝")
        print(f"  Modèle   : {GEMINI_MODEL}")
        print(f"  Fichiers : {total} ({done_count} déjà traités)")
        print(f"  Output   : {OUTPUT_DIR}")
        print(f"  ETA      : ~{((total - done_count) * 3 * REQUEST_DELAY) // 60} min")
        print()

        if not GEMINI_API_KEY:
            print("✗ GEMINI_API_KEY non définie !")
            print("  export GEMINI_API_KEY=ta_clef_api")
            sys.exit(1)

        OUTPUT_DIR.mkdir(exist_ok=True)

        start_time = time.time()
        for i, md_file in enumerate(md_files, 1):
            status = progress.get(str(md_file), {}).get("status", "pending")
            print(f"\n{'─'*50}")
            print(f"  {print_progress_bar(i, total)}  [{status}]")
            print(f"  📂  {md_file.relative_to(WIKI_DIR)}")

            process_file(md_file, progress, i, total, start_time)
            save_progress(progress)

        # Bilan
        done    = sum(1 for v in progress.values() if v.get("status") == "done")
        errors  = sum(1 for v in progress.values() if v.get("status") == "error")
        skipped = sum(1 for v in progress.values() if v.get("status") == "skipped")
        total_time = time.time() - start_time
        print(f"\n{'═'*50}")
        print(f"  ✓ Traités : {done}  |  ✗ Erreurs : {errors}  |  ↩ Skipped : {skipped}")
        print(f"  ⏱  Durée totale : {fmt_time(total_time)}")

    # Sync Supabase
    if args.sync or args.clean_sync or getattr(args, 'sync_only', False):
        sync_to_supabase(progress, clean_sync=args.clean_sync)

    save_progress(progress)
    print("\n✓ Terminé. Progression sauvegardée dans", PROGRESS_FILE.name)

if __name__ == "__main__":
    main()
