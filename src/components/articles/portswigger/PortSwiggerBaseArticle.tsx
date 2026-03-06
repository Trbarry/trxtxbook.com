import React from 'react';
import { BookOpen, Image, FileText } from 'lucide-react';

// Ceci est un composant de base pour un writeup PortSwigger
// Il doit être étendu pour inclure le contenu spécifique et la DA (Direction Artistique)

interface PortSwiggerWriteupProps {
    title: string;
    daComponent?: React.ReactNode; // Composant pour la DA (Direction Artistique)
    content: React.ReactNode;
}

const PortSwiggerBaseArticle: React.FC<PortSwiggerWriteupProps> = ({ title, daComponent, content }) => {
    return (
        <article className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-extrabold mb-4 text-gray-900 dark:text-white border-b pb-2 border-gray-300 dark:border-gray-700">
                PortSwigger Writeup: {title}
            </h1>
            
            {/* Section pour la DA (Direction Artistique) */}
            {daComponent && (
                <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded-lg shadow-md">
                    <h2 className="flex items-center gap-2 text-xl font-semibold text-blue-700 dark:text-blue-300 mb-3">
                        <Image className="w-5 h-5" /> Direction Artistique (DA)
                    </h2>
                    <div className="dark:text-gray-300">
                        {daComponent}
                    </div>
                </div>
            )}

            {/* Contenu principal du writeup */}
            <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
                {content}
            </div>
        </article>
    );
};

export default PortSwiggerBaseArticle;