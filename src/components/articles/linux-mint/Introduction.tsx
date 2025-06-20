import React from 'react';
import { Rocket, Zap, Laptop, Settings, Cpu, MemoryStick, HelpCircle, CheckCircle2 } from 'lucide-react';

export const Introduction: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Introduction */}
      <div className="bg-[#1a1a1f] p-6 rounded-lg border border-green-900/20">
        <div className="flex items-center gap-3 mb-6">
          <Rocket className="w-6 h-6 text-green-400" />
          <h2 className="text-xl font-bold">Présentation Générale</h2>
        </div>
        
        <p className="text-gray-300 leading-relaxed mb-6">
          Votre ordinateur équipé d'un processeur Intel i3 et de 4 Go de RAM montre des signes de faiblesse sous Windows 11 ?
          Vous subissez des ralentissements, des blocages fréquents ou des mises à jour interminables ?
          Rassurez-vous, vous n’êtes pas seul : de nombreux utilisateurs se retrouvent dans cette situation.
        </p>

        <p className="text-gray-300 leading-relaxed mb-6">
          Linux Mint est une distribution Linux moderne et légère, parfaitement adaptée aux ordinateurs anciens ou modestes.
          Son interface, inspirée de Windows, est simple à prendre en main, même pour les personnes peu à l’aise en informatique.
          Aucun besoin de compétences techniques : vous pouvez naviguer, écrire, regarder des vidéos et gérer vos mails dès l’installation.
        </p>

        <p className="text-gray-300 leading-relaxed mb-6">
          Contrairement à Windows 11, Linux Mint ne surcharge pas votre système. Il démarre rapidement, reste fluide,
          et consomme très peu de ressources. Il s’agit d’une solution stable, sécurisée et pérenne pour prolonger la vie de votre ordinateur.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#2a2a2f] p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-green-400" />
              <h3 className="font-semibold">Performance</h3>
            </div>
            <p className="text-sm text-gray-400">
              Fluide et réactif même avec 4 Go de RAM, idéal pour un usage bureautique, web et multimédia.
            </p>
          </div>
          <div className="bg-[#2a2a2f] p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Laptop className="w-5 h-5 text-green-400" />
              <h3 className="font-semibold">Compatibilité</h3>
            </div>
            <p className="text-sm text-gray-400">
              Fonctionne sur la majorité des ordinateurs 64 bits, anciens ou récents, sans configuration complexe.
            </p>
          </div>
          <div className="bg-[#2a2a2f] p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Settings className="w-5 h-5 text-green-400" />
              <h3 className="font-semibold">Simplicité</h3>
            </div>
            <p className="text-sm text-gray-400">
              Installation intuitive, en français, avec des outils intégrés pour tout gérer sans difficulté.
            </p>
          </div>
        </div>
      </div>

      {/* Configuration Minimale */}
      <div className="bg-[#1a1a1f] p-6 rounded-lg border border-green-900/20">
        <div className="flex items-center gap-3 mb-6">
          <Cpu className="w-6 h-6 text-green-400" />
          <h2 className="text-xl font-bold">Configuration Minimale</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-[#2a2a2f] p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <Cpu className="w-5 h-5 text-green-400 mt-1" />
                <div>
                  <h4 className="font-semibold">Processeur</h4>
                  <p className="text-sm text-gray-400">
                    Compatible avec les processeurs Intel ou AMD 64 bits, à partir de 1 GHz.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-[#2a2a2f] p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <MemoryStick className="w-5 h-5 text-green-400 mt-1" />
                <div>
                  <h4 className="font-semibold">Mémoire RAM</h4>
                  <p className="text-sm text-gray-400">
                    2 Go minimum requis, 4 Go recommandés pour une expérience optimale.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-[#2a2a2f] p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <HelpCircle className="w-5 h-5 text-green-400 mt-1" />
                <div>
                  <h4 className="font-semibold">Stockage</h4>
                  <p className="text-sm text-gray-400">
                    20 Go d’espace disque libre, mais 40 Go recommandés pour les mises à jour et vos fichiers.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-[#2a2a2f] p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <Settings className="w-5 h-5 text-green-400 mt-1" />
                <div>
                  <h4 className="font-semibold">Graphique</h4>
                  <p className="text-sm text-gray-400">
                    Carte graphique compatible avec UEFI ou BIOS classique, affichage standard pris en charge nativement.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fonctionnalités */}
      <div className="bg-[#1a1a1f] p-6 rounded-lg border border-green-900/20">
        <div className="flex items-center gap-3 mb-6">
          <CheckCircle2 className="w-6 h-6 text-green-400" />
          <h2 className="text-xl font-bold">Fonctionnalités Principales</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-green-400 mb-3">Applications</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400 mt-1" />
                <span>Navigation web fluide avec Firefox ou Chrome</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400 mt-1" />
                <span>Suite bureautique complète : LibreOffice ou OpenOffice</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400 mt-1" />
                <span>Lecture de vidéos HD sans saccades avec VLC</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-green-400 mb-3">Système</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400 mt-1" />
                <span>Interface claire et proche de Windows pour ne pas être perdu</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400 mt-1" />
                <span>Sécurité native sans antivirus nécessaire</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400 mt-1" />
                <span>Mises à jour rapides, discrètes et faciles à appliquer</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};