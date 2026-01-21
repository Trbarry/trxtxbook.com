import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import { PageTransition } from '../components/layout/PageTransition';

export const LegalPage = () => {
  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-6 py-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          <div className="border-b border-white/10 pb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-violet-500/10 rounded-xl text-violet-500">
                <ShieldCheck size={32} />
              </div>
              <h1 className="text-4xl font-bold text-white tracking-tight">Mentions Légales</h1>
            </div>
            <p className="text-gray-400 font-mono text-sm uppercase tracking-widest">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
            </p>
          </div>

          <section className="grid md:grid-cols-2 gap-12">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white border-l-4 border-violet-500 pl-4">Édition du site</h2>
              <div className="text-gray-400 space-y-2 leading-relaxed">
                <p>Le site <span className="text-white">trxtxbook.com</span> est édité par :</p>
                <p className="font-medium text-white">Tristan [Nom de famille]</p>
                <p>Domicilié à proximité de Saint-Étienne, France</p>
                <p>Contact : [Votre adresse email]</p>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white border-l-4 border-violet-500 pl-4">Hébergement</h2>
              <div className="text-gray-400 space-y-2 leading-relaxed">
                <p>Le site est hébergé par :</p>
                <p className="font-medium text-white">Netlify, Inc.</p>
                <p>44 Montgomery Street, Suite 300</p>
                <p>San Francisco, California 94104, USA</p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white border-l-4 border-violet-500 pl-4">Propriété Intellectuelle</h2>
            <p className="text-gray-400 leading-relaxed">
              L'ensemble de ce site relève de la législation française et internationale sur le droit d'auteur et la propriété intellectuelle. 
              Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.
              La reproduction de tout ou partie de ce site sur un support électronique quel qu'il soit est formellement interdite sauf autorisation expresse de l'éditeur.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white border-l-4 border-violet-500 pl-4">Données Personnelles</h2>
            <p className="text-gray-400 leading-relaxed">
              D'une manière générale, vous pouvez visiter ce site sans avoir à décliner votre identité et à fournir des informations personnelles vous concernant. 
              Toutefois, nous pouvons parfois vous demander des informations via le formulaire de contact (nom, email) pour traiter une demande.
              Conformément à la loi "Informatique et Libertés", vous pouvez exercer votre droit d'accès aux données vous concernant et les faire rectifier en contactant l'éditeur.
            </p>
          </section>
        </motion.div>
      </div>
    </PageTransition>
  );
};