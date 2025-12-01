import requests
import os
from supabase import create_client, Client

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_KEY")

def get_latest_critical_cves():
    print("🔍 Recherche des dernières CVE...")
    # On demande un peu plus de résultats (50) pour être sûr de trouver des CVE parmi les MAL
    url = "https://cve.circl.lu/api/last/50"
    
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        critical_cves = []
        
        for item in data:
            cve_id = item.get('id')
            
            # --- FILTRE 1 : On ne veut que des vraies CVE ---
            # On ignore les "MAL-" (Malware packages) ou autres formats bizarres
            if not cve_id or not cve_id.startswith("CVE-"):
                continue

            cvss = item.get('cvss')
            try:
                cvss_score = float(cvss) if cvss else 0.0
            except ValueError:
                cvss_score = 0.0

            # --- FILTRE 2 : Un minimum de criticité ---
            # On garde ce qui est au moins "Medium" (4.0) pour avoir des scores à afficher
            if cvss_score >= 4.0:
                print(f"  📥 Trouvé : {cve_id} (CVSS: {cvss_score})")
                
                cve = {
                    "cve_id": cve_id,
                    "description": item.get('summary', 'Pas de description disponible'),
                    "cvss_score": cvss_score,
                    "affected_product": "Voir détails",
                    "published_date": item.get('Published'),
                    "reference_url": f"https://nvd.nist.gov/vuln/detail/{cve_id}"
                }
                critical_cves.append(cve)
            
            # On s'arrête quand on a trouvé 5 belles CVE
            if len(critical_cves) >= 5:
                break
        
        print(f"✅ {len(critical_cves)} CVEs qualifiées trouvées.")
        return critical_cves

    except Exception as e:
        print(f"❌ Erreur API : {e}")
        return []

def update_database(cves):
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("❌ ERREUR FATALE : Les clés Supabase sont vides.")
        return

    if not cves:
        print("⚠️ Aucune CVE pertinente trouvée ce jour (que des MAL ou low score).")
        return

    print(f"💾 Connexion à Supabase...")
    
    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        
        for cve in cves:
            result = supabase.table('security_watch').upsert(cve, on_conflict='cve_id').execute()
            print(f"  ✅ {cve['cve_id']} inséré/mis à jour.")
            
    except Exception as e:
        print(f"  ❌ Erreur DB : {e}")

if __name__ == "__main__":
    print("--- Démarrage du Security Watch Bot ---")
    cves = get_latest_critical_cves()
    update_database(cves)
    print("--- Terminé ---")