import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Linkedin, FileText, Download } from 'lucide-react';
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
      link.download = 'CV Tristan Barry.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading CV:', error);
    } finally {
      setTimeout(() => setDownloading(false), 1000);
    }
  };

  return (
    <section id="contact" className="py-20 bg-[#0d0d12]">
      <div className="container mx-auto px-6">
        <ScrollReveal>
          <h2 className="text-3xl font-bold mb-12 flex items-center gap-3">
            <Mail className="w-8 h-8 text-violet-500" />
            Contact
          </h2>
        </ScrollReveal>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Info */}
          <ScrollReveal>
            <div className="bg-[#1a1a1f] p-6 rounded-lg border border-violet-900/20 hover:border-violet-500/50 transition-all duration-300">
              <h3 className="text-xl font-semibold mb-6">Informations de contact</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-violet-400" />
                  <span>06 24 64 32 92</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-violet-400" />
                  <a 
                    href="mailto:tr.barrypro@gmail.com" 
                    className="hover:text-violet-400 transition-colors"
                  >
                    tr.barrypro@gmail.com
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-violet-400" />
                  <span>Saint-Étienne, France</span>
                </div>
                <div className="flex items-center gap-3">
                  <Linkedin className="w-5 h-5 text-violet-400" />
                  <a 
                    href="https://www.linkedin.com/in/tristan-barry-43b91b330/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-violet-400 transition-colors cursor-pointer"
                  >
                    LinkedIn
                  </a>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Availability Info */}
          <ScrollReveal>
            <div className="bg-[#1a1a1f] p-6 rounded-lg border border-violet-900/20 hover:border-violet-500/50 transition-all duration-300">
              <h3 className="text-xl font-semibold mb-6">Disponibilité</h3>
              <div className="space-y-4">
                <p className="text-gray-400">
                  Je suis actuellement à la recherche d'une alternance en tant que technicien informatique 
                  à partir de septembre 2025.
                </p>
                <p className="text-gray-400">
                  Rythme d'alternance : 2 semaines entreprise / 2 semaines formation
                </p>
                <p className="text-gray-400">
                  Mobilité : 45km autour de Saint-Étienne
                </p>
                <p className="text-gray-400">
                  Disponible également sur Lyon
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* CV Download Button */}
        <ScrollReveal>
          <div className="mt-8 max-w-md mx-auto">
            <button
              onClick={handleDownload}
              className="w-full flex items-center justify-center gap-2 py-4 px-6 
                       bg-violet-600 hover:bg-violet-700 rounded-lg transition-all duration-300 
                       cursor-pointer shadow-lg hover:shadow-xl"
            >
              <div className={`flex items-center gap-2 text-lg font-semibold
                           ${downloading ? 'animate-pulse' : ''}`}>
                <FileText className="w-6 h-6" />
                <Download className={`w-5 h-5 ${downloading ? 'animate-bounce' : ''}`} />
                <span>Télécharger mon CV</span>
              </div>
            </button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};