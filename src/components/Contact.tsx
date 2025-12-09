import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  MapPin, 
  Linkedin, 
  FileText, 
  Download, 
  Building2, 
  MessageSquare,
  CheckCircle2
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ScrollReveal } from './ScrollReveal';

interface ContactProps {}

export const Contact: React.FC<ContactProps> = () => {
  const [downloading, setDownloading] = useState(false);
  const [cvUrl, setCvUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchCvUrl();
  }, []);

  const fetchCvUrl = async () => {
    try {
      const { data: { publicUrl } } = supabase
        .storage
        .from('cv-files')
        .getPublicUrl('CV Tristan Barry.pdf');

      if (publicUrl) {
        setCvUrl(publicUrl);
      }
    } catch (error) {
      console.error('Error fetching CV URL:', error);
    }
  };

  const handleDownload = async () => {
    if (!cvUrl) return;
    setDownloading(true);
    try {
      const response = await fetch(cvUrl);
      if (!response.ok) throw new Error('Failed to fetch CV');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'CV_Tristan_Barry.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading CV:', error);
      window.open(cvUrl, '_blank');
    } finally {
      setTimeout(() => setDownloading(false), 1000);
    }
  };

  return (
    // ✅ CHANGEMENT : bg-background
    <section id="contact" className="py-24 relative bg-background transition-colors duration-300 overflow-hidden">
      
      <div className="container mx-auto px-6 relative z-10">
        <ScrollReveal>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 flex items-center justify-center gap-3">
              <span className="p-3 bg-surface dark:bg-[#1a1a1f] rounded-xl border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none">
                <MessageSquare className="w-8 h-8 text-violet-600 dark:text-violet-400" />
              </span>
              <span className="text-gray-900 dark:text-white">
                Contact & Connexion
              </span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Technicien ou Pentester ? Discutons technique, opportunités ou simplement d'Active Directory.
            </p>
          </div>
        </ScrollReveal>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          
          <ScrollReveal>
            {/* ✅ CHANGEMENT : Carte bg-surface */}
            <div className="h-full bg-surface dark:bg-[#1a1a1f] p-8 rounded-2xl border border-gray-200 dark:border-white/5 hover:border-violet-500/30 transition-all duration-300 shadow-sm dark:shadow-none">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-2">
                <span className="w-1 h-6 bg-violet-500 rounded-full"></span>
                Me contacter
              </h3>
              
              <div className="space-y-6">
                <a 
                  href="mailto:tr.barrypro@gmail.com" 
                  // ✅ CHANGEMENT : Item bg-gray-50 en light
                  className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/5 hover:border-violet-500/20 transition-all group/item"
                >
                  <div className="p-3 bg-white dark:bg-[#1a1a1f] rounded-lg text-violet-600 dark:text-violet-400 group-hover/item:text-violet-700 dark:group-hover/item:text-white transition-colors border border-gray-100 dark:border-transparent">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Email</p>
                    <p className="text-gray-900 dark:text-white font-medium group-hover/item:text-violet-600 dark:group-hover/item:text-violet-300 transition-colors">tr.barrypro@gmail.com</p>
                  </div>
                </a>

                <a 
                  href="https://www.linkedin.com/in/tristan-barry-43b91b330/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/5 hover:border-blue-500/20 transition-all group/item"
                >
                  <div className="p-3 bg-white dark:bg-[#1a1a1f] rounded-lg text-blue-600 dark:text-blue-400 group-hover/item:text-blue-700 dark:group-hover/item:text-white transition-colors border border-gray-100 dark:border-transparent">
                    <Linkedin className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">LinkedIn</p>
                    <p className="text-gray-900 dark:text-white font-medium group-hover/item:text-blue-600 dark:group-hover/item:text-blue-300 transition-colors">Tristan Barry</p>
                  </div>
                </a>

                <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/5 opacity-80">
                  <div className="p-3 bg-white dark:bg-[#1a1a1f] rounded-lg text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-transparent">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Localisation</p>
                    <p className="text-gray-700 dark:text-gray-300 font-medium">Saint-Étienne & Lyon (France)</p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal>
            {/* ✅ CHANGEMENT : Carte bg-surface */}
            <div className="h-full bg-surface dark:bg-[#1a1a1f] p-8 rounded-2xl border border-gray-200 dark:border-white/5 hover:border-blue-500/30 transition-all duration-300 flex flex-col justify-between shadow-sm dark:shadow-none">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-2">
                    <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                    Statut Professionnel
                </h3>

                <div className="bg-gray-50 dark:bg-black p-6 rounded-xl border border-gray-200 dark:border-white/5 mb-8">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-white rounded-lg shadow-lg border border-gray-100">
                             <Building2 className="w-6 h-6 text-violet-900" />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 dark:text-white text-lg">En poste chez Moulinvest</h4>
                            <p className="text-blue-600 dark:text-blue-300 text-sm font-medium mb-3">Alternance 2025 - 2027</p>
                            <div className="flex items-center gap-2 text-green-700 dark:text-green-400 text-xs font-semibold bg-green-100 dark:bg-green-400/10 w-fit px-2 py-1 rounded-full border border-green-200 dark:border-green-400/20">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-600 dark:bg-green-500"></span>
                                </span>
                                Actuellement indisponible pour recrutement
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-3 mb-8">
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                        Bien que je ne sois pas en recherche active, je reste <strong>toujours ouvert</strong> pour :
                    </p>
                    <ul className="space-y-2">
                        {['Échanger sur des sujets techniques (Pentest/AD)', 'Partager des ressources & Write-ups', 'Étendre mon réseau professionnel'].map((item, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                <CheckCircle2 className="w-4 h-4 text-violet-600 dark:text-violet-500" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
              </div>

              <button
                onClick={handleDownload}
                disabled={downloading}
                // ✅ CHANGEMENT : Bouton sombre en mode light pour le contraste
                className="w-full group relative overflow-hidden bg-gray-900 dark:bg-white text-white dark:text-black py-4 px-6 rounded-xl font-bold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg"
              >
                <div className="relative z-10 flex items-center justify-center gap-3">
                  {downloading ? (
                     <>
                        <div className="w-5 h-5 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin"></div>
                        <span>Téléchargement...</span>
                     </>
                  ) : (
                     <>
                        <FileText className="w-5 h-5" />
                        <span>Télécharger mon CV complet</span>
                        <Download className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-violet-300 dark:text-violet-600" />
                     </>
                  )}
                </div>
              </button>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};