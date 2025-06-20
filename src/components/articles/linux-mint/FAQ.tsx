import React from 'react';

export const FAQ: React.FC = () => {
  return (
    <div className="bg-[#1a1a1f] p-6 rounded-lg border border-green-900/20">
      <h3 className="text-xl font-semibold text-green-400 mb-6">Questions Fréquentes</h3>
      
      <div className="space-y-4">
        {/* Dual boot */}
        <div className="bg-[#2a2a2f] p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Puis-je garder Windows en dual-boot ?</h4>
          <p className="text-gray-400">
            Oui, lors de l'installation de Linux Mint, vous pouvez choisir l'option <strong>"Installer Linux Mint à côté de Windows"</strong>.
            Cela permet d’avoir les deux systèmes installés sur le même disque dur, chacun sur sa propre partition.
            Au démarrage, vous pourrez choisir entre Linux et Windows grâce à un menu (appelé GRUB).
            C’est la meilleure option si vous souhaitez garder certains logiciels Windows ou des habitudes spécifiques.
          </p>
        </div>

        {/* Accès aux fichiers Windows */}
        <div className="bg-[#2a2a2f] p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Mes fichiers Windows seront-ils accessibles ?</h4>
          <p className="text-gray-400">
            Oui. Linux Mint peut accéder aux partitions NTFS (utilisées par Windows). Vos documents, images ou vidéos seront visibles 
            dans le gestionnaire de fichiers, même si Windows est installé sur une autre partition.
            Vous pouvez lire, copier, modifier et sauvegarder des fichiers depuis votre ancien système sans problème.
          </p>
        </div>

        {/* Installation des pilotes */}
        <div className="bg-[#2a2a2f] p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Comment installer mes pilotes ?</h4>
          <p className="text-gray-400">
            Linux Mint installe automatiquement la plupart des pilotes (clavier, écran, carte son, réseau, etc.). 
            Pour les pilotes propriétaires (comme certaines cartes graphiques NVIDIA ou cartes WiFi spécifiques),
            vous pouvez utiliser l’outil graphique intégré : <strong>“Gestionnaire de pilotes”</strong>.
            Ouvrez-le depuis le menu, laissez-le détecter votre matériel, puis sélectionnez les pilotes recommandés.
          </p>
        </div>

        {/* Est-ce que Linux est sécurisé ? */}
        <div className="bg-[#2a2a2f] p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Linux est-il vraiment plus sécurisé que Windows ?</h4>
          <p className="text-gray-400">
            Oui, Linux Mint bénéficie d’une architecture plus robuste par défaut :
            chaque action système critique demande un mot de passe (comme l’UAC de Windows), 
            il y a peu de virus pour Linux, et les logiciels sont installés depuis des sources officielles.
            De plus, Linux ne collecte pas de données utilisateur comme Windows 10/11.
            Il reste cependant important d'appliquer régulièrement les mises à jour proposées.
          </p>
        </div>

        {/* Puis-je installer de nouveaux logiciels facilement ? */}
        <div className="bg-[#2a2a2f] p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Puis-je installer d'autres logiciels facilement ?</h4>
          <p className="text-gray-400">
            Absolument. Linux Mint dispose d'un <strong>Gestionnaire de logiciels</strong> (équivalent de l’App Store)
            avec des milliers de programmes disponibles gratuitement : navigateurs, outils de développement, jeux, graphisme, etc.
            Vous pouvez aussi utiliser la ligne de commande via <code className="text-green-400">apt install nom_du_logiciel</code>
            si vous êtes à l’aise avec le terminal.
          </p>
        </div>

        {/* Puis-je utiliser les fichiers Word, Excel, etc. ? */}
        <div className="bg-[#2a2a2f] p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Est-ce que je peux ouvrir mes fichiers Word, Excel, PowerPoint ?</h4>
          <p className="text-gray-400">
            Oui. <strong>LibreOffice</strong>, préinstallé avec Linux Mint, est compatible avec les formats Microsoft Office (.docx, .xlsx, .pptx).
            Vous pourrez lire, modifier et enregistrer des fichiers Office sans difficulté. Il est aussi possible d’exporter en PDF ou d’utiliser
            OnlyOffice si vous préférez une compatibilité visuelle encore plus proche de Microsoft Office.
          </p>
        </div>
      </div>
    </div>
  );
};
