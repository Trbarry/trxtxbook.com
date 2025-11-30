import React from 'react';
import { 
  Github, 
  Linkedin, 
  Mail, 
  Terminal, 
  Shield, 
  Cpu, 
  Activity,
  GitBranch 
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0f0f13] border-t border-violet-900/20 relative overflow-hidden">
      {/* Effet de fond subtil */}
      <div className="absolute top-0 left-1/4 w-96 h-1 bg-gradient-to-r from-transparent via-violet-500/50 to-transparent blur-sm" />

      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Colonne 1 : Identité */}
          <div className="col-span-1 md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-violet-500/10 rounded-lg border border-violet-500/20">
                <Terminal className="w-6 h-6 text-violet-400" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Tristan Barry
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              Alternant Technicien Système & Réseau passionné par la Cybersécurité offensive. 
              Construction de laboratoires, CTF et sécurisation d'infrastructures.
            </p>
            {/* Stack Technique du site */}
            <div className="flex items-center gap-2 text-xs text-gray-500 pt-2">
                <Cpu className="w-3 h-3" />
                <span>Propulsé par React • Vite • Tailwind • Supabase</span>
            </div>
          </div>

          {/* Colonne 2 : Navigation Rapide */}
          <div>
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-violet-500" />
              Plan du site
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/writeups" className="text-gray-400 hover:text-violet-400 transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 bg-violet-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Write-ups
                </Link>
              </li>
              <li>
                <Link to="/projects" className="text-gray-400 hover:text-violet-400 transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 bg-violet-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Projets & Lab
                </Link>
              </li>
              <li>
                <Link to="/certifications" className="text-gray-400 hover:text-violet-400 transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 bg-violet-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Certifications
                </Link>
              </li>
            </ul>
          </div>

          {/* Colonne 3 : Connexion */}
          <div>
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-500" />
              Réseaux
            </h3>
            <div className="flex flex-col space-y-3">
              <a href="https://www.linkedin.com/in/tristan-barry-43b91b330/" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors group">
                <Linkedin className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
                <span className="text-sm">LinkedIn</span>
              </a>
              <a href="https://github.com/Trbarry" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors group">
                <Github className="w-5 h-5 text-purple-500 group-hover:scale-110 transition-transform" />
                <span className="text-sm">GitHub</span>
              </a>
              <a href="mailto:tr.barrypro@gmail.com" 
                 className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors group">
                <Mail className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform" />
                <span className="text-sm">Email Pro</span>
              </a>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-white/5 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-500">
                © {currentYear} Tristan Barry. Tous droits réservés.
            </p>
            
            <div className="flex items-center gap-6">
                {/* Lien Admin Camouflé */}
                <Link 
                  to="/admin/analytics" 
                  className="flex items-center gap-2 text-xs text-gray-600 hover:text-green-500 transition-colors"
                  title="Voir les statistiques"
                >
                  <Activity className="w-3 h-3" />
                  <span className="font-mono">System Status: Online</span>
                </Link>
            </div>
        </div>
      </div>
    </footer>
  );
};