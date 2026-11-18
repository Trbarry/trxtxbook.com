import React from 'react';
import { Activity, Cpu, Github, Linkedin, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-surface dark:border-white/10">

      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Colonne 1 : Identité */}
          <div className="col-span-1 md:col-span-2 space-y-4">
            <p className="text-xl font-semibold tracking-tight text-text">Tristan Barry</p>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed max-w-sm">
              Technicien systèmes et réseaux chez Moulinvest, en formation AIS chez FORMATIK.
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-500 pt-2">
                <Cpu className="w-3 h-3" />
                <span>Propulsé par React • Vite • Tailwind • Supabase</span>
            </div>
          </div>

          {/* Colonne 2 : Navigation Rapide */}
          <div>
            <h3 className="font-semibold text-text mb-4">
              Plan du site
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/writeups" className="text-gray-600 dark:text-gray-400 hover:underline underline-offset-4">
                  Write-ups
                </Link>
              </li>
              <li>
                <Link to="/projects" className="text-gray-600 dark:text-gray-400 hover:underline underline-offset-4">
                  Projets & Lab
                </Link>
              </li>
              <li>
                <Link to="/wiki" className="text-gray-600 dark:text-gray-400 hover:underline underline-offset-4">
                  Wiki
                </Link>
              </li>
              <li>
                <Link to="/certifications" className="text-gray-600 dark:text-gray-400 hover:underline underline-offset-4">
                  Certifications
                </Link>
              </li>
            </ul>
          </div>

          {/* Colonne 3 : Réseaux */}
          <div>
            <h3 className="font-semibold text-text mb-4">
              Réseaux
            </h3>
            <div className="flex flex-col space-y-3">
              <a href="https://www.linkedin.com/in/tristan-barry-43b91b330/" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="flex items-center gap-3 text-gray-600 dark:text-gray-400 hover:underline underline-offset-4">
                <Linkedin className="w-4 h-4" />
                <span className="text-sm">LinkedIn</span>
              </a>
              <a href="https://github.com/Trbarry" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="flex items-center gap-3 text-gray-600 dark:text-gray-400 hover:underline underline-offset-4">
                <Github className="w-4 h-4" />
                <span className="text-sm">GitHub</span>
              </a>
              <a href="mailto:tr.barrypro@gmail.com" 
                 className="flex items-center gap-3 text-gray-600 dark:text-gray-400 hover:underline underline-offset-4">
                <Mail className="w-4 h-4" />
                <span className="text-sm">Email Pro</span>
              </a>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-gray-200 dark:border-white/5 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
                <p className="text-xs text-gray-500">
                    © {currentYear} Tristan Barry. Tous droits réservés.
                </p>
                {/* AJOUT : Lien Mentions Légales */}
                <Link 
                  to="/mentions-legales" 
                  className="text-xs text-gray-500 hover:text-text transition-colors underline decoration-gray-500/30 underline-offset-4"
                >
                  Mentions Légales
                </Link>
            </div>
            
            <div className="flex items-center gap-6">
                {/* Honeypot link: Hidden for humans, but a juicy target for crawlers/fuzzers */}
                <Link 
                  to="/admin_login" 
                  tabIndex={-1} 
                  aria-hidden="true" 
                  className="opacity-0 absolute pointer-events-none"
                  style={{ fontSize: '1px' }}
                >
                  Admin Login Access
                </Link>

                <Link 
                  to="/admin/analytics" 
                  className="flex items-center gap-2 text-xs text-gray-500 hover:text-text transition-colors"
                  title="Voir les statistiques"
                >
                  <Activity className="w-3 h-3" />
                  <span>Statistiques du site</span>
                </Link>
            </div>
        </div>
      </div>
    </footer>
  );
};