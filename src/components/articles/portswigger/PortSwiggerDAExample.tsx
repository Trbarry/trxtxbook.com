import React from 'react';
import { Image } from 'lucide-react';

// Ceci est un exemple de composant DA (Direction Artistique) pour un writeup PortSwigger
export const PortSwiggerDAExample: React.FC = () => {
    return (
        <div className="p-3 border border-dashed border-blue-500/50 rounded-lg text-center">
            <p className="text-sm italic">
                Visualisation de la chaîne d'exploitation typique sur PortSwigger. L'image DA réelle doit être placée dans le dossier 'portswigger/images/'.
            </p>
            <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                [Placeholder pour l'image DA : exemple.png]
            </div>
        </div>
    );
};