import requests
import os
from supabase import create_client, Client

# Configuration : On récupère les variables d'environnement
# Ces variables seront définies plus tard dans GitHub Actions
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_KEY") # Clé SERVICE_ROLE (Admin)

def get_latest_critical_cves():
    print("🔍 Recherche des dernières CVE critiques...")
    
    # On utilise l'API de cve.circl.lu (Open Source et fiable)
    url = "https://cve.circl.lu/api/last"
    
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status() # Vérifie si la requête a réussi
        data = response.json()
        
        critical_cves = []
        
        for item in data:
            # On cherche les CVE avec un score CVSS >= 9.0 (Critique)
            cvss = item.get('cvss')
            
            # Parfois le CVSS est null ou une chaine, on sécurise la conversion
            try:
                cvss_score = float(cvss) if cvss else 0.0
            except ValueError:
                cvss_score = 0.0

            if cvss_score >= 9.0:
                cve_id = item.get('id')
                print(f"  🚨 Trouvé : {cve_id} (CVSS: {cvss_score})")
                
                # On formate les données pour notre table Supabase
                cve = {
                    "cve_id": cve_id,
                    "description": item.get('summary', 'Pas de description disponible'),
                    "cvss_score": cvss_score,
                    "affected_product": "Voir détails", # L'API est parfois vague ici
                    "published_date": item.get('Published'),
                    "reference_url": f"https://nvd.nist.gov/vuln/detail/{cve_id}"
                }
                critical_cves.append(cve)
                
            # On s'arrête dès qu'on en a 5 pour ne pas surcharger
            if len(critical_cves) >= 5:
                break
                
        return critical_cves

    except Exception as e:
        print(f"❌ Erreur lors de la récupération des CVE : {e}")
        return []

def update_database(cves):
    if not cves:
        print("⚠️ Aucune CVE critique trouvée ce jour.")
        return

    if not SUPABASE_URL or not SUPABASE_KEY:
        print("❌ Erreur : Les variables d'environnement Supabase ne sont pas définies.")
        return

    print(f"💾 Connexion à Supabase ({SUPABASE_URL})...")
    
    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        
        for cve in cves:
            # On utilise 'upsert' : Si l'ID existe déjà, on met à jour, sinon on crée.
            # Cela évite les doublons et les erreurs.
            result = supabase.table('security_watch').upsert(cve, on_conflict='cve_id').execute()
            print(f"  ✅ {cve['cve_id']} synchronisé avec succès.")
            
    except Exception as e:
        print(f"  ❌ Erreur lors de l'écriture en base : {e}")

if __name__ == "__main__":
    print("--- Démarrage du Security Watch Bot ---")
    cves = get_latest_critical_cves()
    update_database(cves)
    print("--- Terminé ---")