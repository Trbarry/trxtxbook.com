import requests
import os
from supabase import create_client, Client

# Récupération des variables d'environnement
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_KEY")

def get_latest_critical_cves():
    print("🔍 Recherche des dernières CVE (Mode Test : TOUT inclure)...")
    url = "https://cve.circl.lu/api/last"
    
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        critical_cves = []
        
        for item in data:
            cvss = item.get('cvss')
            try:
                cvss_score = float(cvss) if cvss else 0.0
            except ValueError:
                cvss_score = 0.0

            # --- MODIFICATION ICI : ON PREND TOUT ---
            # if cvss_score >= 7.0:  <-- On commente cette ligne
            
            cve_id = item.get('id')
            print(f"  📥 Récupération : {cve_id} (CVSS: {cvss_score})")
            
            cve = {
                "cve_id": cve_id,
                "description": item.get('summary', 'Pas de description disponible'),
                "cvss_score": cvss_score,
                "affected_product": "Voir détails",
                "published_date": item.get('Published'),
                "reference_url": f"https://nvd.nist.gov/vuln/detail/{cve_id}"
            }
            critical_cves.append(cve)
            
            # On s'arrête à 5 pour le test
            if len(critical_cves) >= 5:
                break
        
        print(f"✅ {len(critical_cves)} CVEs trouvées.")
        return critical_cves

    except Exception as e:
        print(f"❌ Erreur API : {e}")
        return []

def update_database(cves):
    if not SUPABASE_URL or not SUPABASE_KEY:
        # Cette erreur s'affichera si les secrets GitHub ne passent pas
        print("❌ ERREUR FATALE : Les clés Supabase sont vides. Vérifiez vos Secrets GitHub !")
        return

    if not cves:
        print("⚠️ Aucune CVE à enregistrer.")
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
    
    # CORRECTION ICI : On utilise les variables Python définies en haut (lignes 6 et 7)
    print(f"DEBUG: URL présente ? {bool(SUPABASE_URL)}")
    print(f"DEBUG: KEY présente ? {bool(SUPABASE_KEY)}")
    
    cves = get_latest_critical_cves()
    update_database(cves)
    print("--- Terminé ---")