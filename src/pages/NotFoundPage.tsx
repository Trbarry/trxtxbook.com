import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileQuestion, ChevronLeft } from 'lucide-react';
import { PageTransition } from '../components/layout/PageTransition';

export const NotFoundPage = () => {
  return (
    <PageTransition>
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Icone technique et sobre */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-violet-500/10 text-violet-500 mb-4">
            <FileQuestion size={40} />
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-white tracking-tight">
              Page non trouvée
            </h1>
            <p className="text-violet-500 font-mono text-sm uppercase tracking-widest">
              Erreur 404
            </p>
          </div>
          
          <p className="text-gray-400 max-w-md mx-auto leading-relaxed">
            La ressource demandée n'est pas disponible ou a été déplacée. 
            Veuillez vérifier l'URL ou retourner à l'accueil.
          </p>

          <div className="pt-4">
            <Link 
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-violet-600/20 border border-white/10 hover:border-violet-500/50 text-white rounded-lg transition-all duration-300 group"
            >
              <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              Retour à la page principale
            </Link>
          </div>
        </motion.div>

        {/* Pied de page discret pour le diagnostic technique */}
        <div className="absolute bottom-10 left-0 right-0">
          <p className="text-[10px] font-mono text-white/20">
            TRXTXBOOK_ENGINE // NULL_REFERENCE_EXCEPTION // {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </PageTransition>
  );
};