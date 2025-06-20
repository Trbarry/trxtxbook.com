import React from 'react';
import { Zap, Settings } from 'lucide-react';

export const Configuration: React.FC = () => {
  return (
    <div className="bg-[#1a1a1f] p-6 rounded-lg border border-green-900/20">
      <h3 className="text-xl font-semibold text-green-400 mb-6">Optimisation du Système</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bloc Performance */}
        <div className="bg-[#2a2a2f] p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-5 h-5 text-green-400" />
            <h4 className="font-semibold">Performance</h4>
          </div>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>
              • <strong>Désactiver les effets visuels</strong> : allez dans les paramètres système &gt; apparence &gt; effets, et désactivez les animations pour économiser des ressources.
            </li>
            <li>
              • <strong>Ajuster le swap</strong> : réduisez l'utilisation excessive de la mémoire swap en modifiant le swappiness (`sudo sysctl vm.swappiness=10` pour un usage plus réactif).
            </li>
            <li>
              • <strong>Optimiser le cache disque</strong> : activez la mise en cache pour les disques HDD dans les paramètres d'alimentation ou utilisez `noatime` dans `/etc/fstab` pour réduire les écritures disque.
            </li>
            <li>
              • <strong>Gérer les services au démarrage</strong> : désactivez les services inutiles via l'application "Startup Applications" ou `gnome-session-properties`.
            </li>
          </ul>
        </div>

        {/* Bloc Personnalisation */}
        <div className="bg-[#2a2a2f] p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Settings className="w-5 h-5 text-green-400" />
            <h4 className="font-semibold">Personnalisation</h4>
          </div>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>
              • <strong>Choix du thème</strong> : explorez les thèmes préinstallés ou installez-en d'autres depuis le gestionnaire de thèmes pour moderniser l’interface.
            </li>
            <li>
              • <strong>Configuration du bureau</strong> : ajoutez ou retirez les icônes, changez le fond d’écran et ajustez les comportements (clic droit, disposition des fenêtres).
            </li>
            <li>
              • <strong>Raccourcis clavier</strong> : créez vos propres raccourcis personnalisés dans les paramètres clavier pour gagner en efficacité.
            </li>
            <li>
              • <strong>Gestion des applets</strong> : activez des applets utiles dans la barre des tâches (météo, contrôle du son, surveillance CPU, etc.).
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
