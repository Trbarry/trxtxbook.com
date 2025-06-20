import React from 'react';

export const Usage: React.FC = () => {
  return (
    <div className="bg-[#1a1a1f] p-6 rounded-lg border border-green-900/20">
      <h3 className="text-xl font-semibold text-green-400 mb-6">Utilisation Quotidienne</h3>
      
      <div className="space-y-6">
        {/* Logiciels préinstallés */}
        <div className="bg-[#2a2a2f] p-4 rounded-lg">
          <h4 className="font-semibold mb-3 text-green-400">Logiciels Préinstallés</h4>
          <p className="text-sm text-gray-400 mb-4">
            Linux Mint est livré avec tous les outils essentiels pour travailler, naviguer, et se divertir sans rien avoir à installer au préalable :
          </p>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>• <strong>LibreOffice</strong> – Suite bureautique complète (équivalent de Microsoft Office)</li>
            <li>• <strong>Firefox</strong> – Navigateur web rapide et sécurisé</li>
            <li>• <strong>VLC</strong> – Lecteur vidéo/audio universel, compatible avec tous les formats</li>
            <li>• <strong>GIMP</strong> – Logiciel libre d’édition d’images, proche de Photoshop</li>
          </ul>
        </div>

        {/* Alternatives à Windows */}
        <div className="bg-[#2a2a2f] p-4 rounded-lg">
          <h4 className="font-semibold mb-3 text-green-400">Alternatives Windows</h4>
          <p className="text-sm text-gray-400 mb-4">
            Voici quelques correspondances courantes pour retrouver vos habitudes :
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 className="font-medium mb-2">Applications Windows</h5>
              <ul className="space-y-1 text-sm text-gray-400">
                <li>• <strong>MS Office → LibreOffice</strong> (traitement de texte, tableur, etc.)</li>
                <li>• <strong>Photoshop → GIMP</strong> (retouche photo)</li>
                <li>• <strong>Outlook → Thunderbird</strong> (client email moderne et léger)</li>
                <li>• <strong>Windows Media Player → VLC</strong> (vidéos et musiques sans codecs à installer)</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium mb-2">Compatibilité avec Windows</h5>
              <ul className="space-y-1 text-sm text-gray-400">
                <li>• <strong>Wine</strong> – Lancer certaines applications Windows (.exe)</li>
                <li>• <strong>PlayOnLinux</strong> – Interface simplifiée pour gérer Wine et ses profils</li>
                <li>• <strong>Machines virtuelles</strong> – Utiliser VirtualBox ou Boxes pour faire tourner un Windows si nécessaire</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
