import React from 'react';
import { Laptop, Linkedin, Mail, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0a0a0f] py-8 border-t border-violet-900/20">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-3">
            <Laptop className="w-8 h-8 text-violet-400" />
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-wider bg-gradient-to-r from-violet-400 to-violet-600 bg-clip-text text-transparent">
                Mon Portfolio
              </span>
              <span className="text-xs text-gray-400">BTS SIO Technicien Informatique</span>
            </div>
          </div>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="https://www.linkedin.com/in/tristan-barry-43b91b330/" 
               target="_blank" 
               rel="noopener noreferrer"
               className="text-gray-400 hover:text-violet-400 transition-colors">
              <Linkedin className="w-5 h-5" />
            </a>
            <a href="mailto:tr.barrypro@gmail.com" className="text-gray-400 hover:text-violet-400 transition-colors">
              <Mail className="w-5 h-5" />
            </a>
            {/* Lien discret vers les analytics */}
            <Link 
              to="/admin/analytics" 
              className="text-gray-400 hover:text-violet-400 transition-colors"
              title="Analytics"
            >
              <BarChart3 className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};