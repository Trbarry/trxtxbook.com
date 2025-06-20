import React from 'react';
import { ArrowRight } from 'lucide-react';

export const Installation: React.FC = () => {
  return (
    <div className="bg-[#1a1a1f] p-6 rounded-lg border border-green-900/20">
      <h3 className="text-xl font-semibold text-green-400 mb-6">Guide d'Installation</h3>
      
      <div className="space-y-6">
        {/* Étape 1 : Préparation */}
        <div className="bg-[#2a2a2f] p-4 rounded-lg">
          <h4 className="font-semibold mb-2">1. Préparation</h4>
          <p className="text-sm text-gray-400 mb-4">
            Avant de commencer, sauvegardez vos données importantes. L'installation de Linux Mint peut effacer les fichiers existants si vous choisissez d’écraser le disque.
          </p>
          <pre className="bg-[#1a1a1f] p-4 rounded-lg overflow-x-auto">
            <code className="text-sm text-green-400">
              # Télécharger l'image ISO de Linux Mint{'\n'}
              https://linuxmint.com/download.php{'\n\n'}
              # Créer une clé USB bootable (minimum 4 Go){'\n'}
              • Windows : Utiliser Rufus → https://rufus.ie{'\n'}
              • Linux/Mac : Utiliser Balena Etcher → https://etcher.io
            </code>
          </pre>
        </div>

        {/* Étape 2 : Installation du système */}
        <div className="bg-[#2a2a2f] p-4 rounded-lg">
          <h4 className="font-semibold mb-2">2. Installation du Système</h4>
          <p className="text-sm text-gray-400 mb-4">
            Une fois votre clé USB prête, voici les étapes pour installer Linux Mint sur votre machine :
          </p>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex items-start gap-2">
              <ArrowRight className="w-4 h-4 text-green-400 mt-1" />
              <span>Redémarrez votre PC et accédez au menu de démarrage (généralement avec la touche <strong>F12</strong>, <strong>Esc</strong> ou <strong>Del</strong>).</span>
            </li>
            <li className="flex items-start gap-2">
              <ArrowRight className="w-4 h-4 text-green-400 mt-1" />
              <span>Sélectionnez la clé USB dans la liste des périphériques de démarrage.</span>
            </li>
            <li className="flex items-start gap-2">
              <ArrowRight className="w-4 h-4 text-green-400 mt-1" />
              <span>Choisissez <strong>"Start Linux Mint"</strong> dans le menu (Live mode).</span>
            </li>
            <li className="flex items-start gap-2">
              <ArrowRight className="w-4 h-4 text-green-400 mt-1" />
              <span>Une fois sur le bureau, double-cliquez sur <strong>"Install Linux Mint"</strong>.</span>
            </li>
            <li className="flex items-start gap-2">
              <ArrowRight className="w-4 h-4 text-green-400 mt-1" />
              <span>Suivez les étapes de l’assistant d’installation (langue, clavier, type d’installation, utilisateur, mot de passe…)</span>
            </li>
            <li className="flex items-start gap-2">
              <ArrowRight className="w-4 h-4 text-green-400 mt-1" />
              <span>Choisissez <strong>"Effacer le disque et installer Linux Mint"</strong> (ou choisissez une installation personnalisée si vous souhaitez un dual boot).</span>
            </li>
            <li className="flex items-start gap-2">
              <ArrowRight className="w-4 h-4 text-green-400 mt-1" />
              <span>Une fois l’installation terminée, cliquez sur <strong>"Redémarrer maintenant"</strong> et retirez la clé USB lorsque cela vous est demandé.</span>
            </li>
          </ul>
        </div>

        {/* Étape 3 : Post-Installation */}
        <div className="bg-[#2a2a2f] p-4 rounded-lg">
          <h4 className="font-semibold mb-2">3. Post-Installation</h4>
          <p className="text-sm text-gray-400 mb-4">
            Une fois votre système installé, quelques actions simples permettent d’optimiser votre environnement :
          </p>
          <pre className="bg-[#1a1a1f] p-4 rounded-lg overflow-x-auto">
            <code className="text-sm text-green-400">
              # Mettre à jour le système{'\n'}
              sudo apt update && sudo apt upgrade -y{'\n\n'}
              # Ouvrir le gestionnaire de pilotes{'\n'}
              sudo mintdrivers{'\n\n'}
              # Lancer les outils de bienvenue pour configurer votre session{'\n'}
              mintwelcome
            </code>
          </pre>
          <p className="text-sm text-gray-400 mt-4">
            Vous pouvez maintenant personnaliser votre thème, installer des applications depuis le gestionnaire de logiciels,
            et commencer à utiliser votre machine sans ralentissements ni limitations.
          </p>
        </div>
      </div>
    </div>
  );
};
