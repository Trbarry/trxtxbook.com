import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Scale, Lock, AlertTriangle } from 'lucide-react';
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
          <div className="border-b border-line pb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-surface rounded-xl text-accent">
                <ShieldCheck size={32} />
              </div>
              <h1 className="text-4xl font-bold text-text tracking-tight">Mentions Légales & Éthique</h1>
            </div>
            <p className="text-muted font-mono text-sm uppercase tracking-widest">
              ID : trxtxbook-legal-01 // MAJ : {new Date().toLocaleDateString('fr-FR')}
            </p>
          </div>

          <section className="grid md:grid-cols-2 gap-12">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-text flex items-center gap-2">
                <Lock size={20} className="text-accent" />
                Édition du site
              </h2>
              <div className="text-muted space-y-2 leading-relaxed border-l-2 border-line pl-4">
                <p>Conformément à l'article 6 de la Loi n°2004-575, l'éditeur de ce site a choisi de rester **anonyme**.</p>
                <p>Les informations d'identification personnelle ont été transmises en toute conformité à l'hébergeur du site.</p>
                <p>Contact : <span className="text-text">tr.barrypro@gmail.com</span></p>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-text flex items-center gap-2">
                <Scale size={20} className="text-accent" />
                Hébergement
              </h2>
              <div className="text-muted space-y-2 leading-relaxed border-l-2 border-line pl-4">
                <p className="font-medium text-text">Netlify, Inc.</p>
                <p>44 Montgomery Street, Suite 300</p>
                <p>San Francisco, CA 94104, USA</p>
                <p>Contact : +1 415-691-1573</p>
              </div>
            </div>
          </section>

          {/* SECTION CRUCIALE POUR UN PENTESTER */}
          <section className="space-y-4 bg-surface p-6 rounded-2xl border border-line">
            <h2 className="text-xl font-semibold text-text flex items-center gap-2 italic">
              <AlertTriangle size={20} className="text-accent" />
              Responsabilité & Éthique Cyber
            </h2>
            <div className="text-muted leading-relaxed space-y-4">
              <p>
                Le contenu de ce site (Write-ups, scripts, méthodologies) est publié à des fins exclusivement **pédagogiques** et de recherche en sécurité. 
                L'auteur décline toute responsabilité quant à l'usage malveillant des informations présentées.
              </p>
              <p>
                Toute tentative d'intrusion ou d'utilisation des outils présentés sur des systèmes tiers sans autorisation écrite préalable est strictement interdite et passible de sanctions pénales (Articles 323-1 et suivants du Code pénal).
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-text border-l-4 border-accent pl-4">Données Personnelles (RGPD)</h2>
            <p className="text-muted leading-relaxed italic">
              Ce site n'utilise pas de cookies publicitaires. Les seules données collectées sont les logs techniques de connexion (Hébergeur) et les messages envoyés via le formulaire de contact, traités via **Supabase**. Vous disposez d'un droit d'accès et de suppression en écrivant à l'adresse email citée plus haut.
            </p>
          </section>
        </motion.div>
      </div>
    </PageTransition>
  );
};