import React from 'react';
import { useParams } from 'react-router-dom';
import WriteupPageTemplate from './WriteupPageTemplate'; // Hypothèse de chemin
import PortSwiggerBaseArticle from '../articles/portswigger/PortSwiggerBaseArticle';
import { PortSwiggerDAExample } from '../articles/portswigger/PortSwiggerDAExample'; // À créer

// Simuler les données pour un writeup PortSwigger spécifique
const portswiggerData: Record<string, { title: string, content: React.ReactNode, daComponent: React.ReactNode }> = {
    'sqli-blind': {
        title: 'SQL Injection - Blind (Time-based)',
        content: (
            <>
                <p>Introduction à l'exploitation d'une injection SQL aveugle basée sur le temps. C'est ici que l'on détaillera les requêtes 'sleep(5)'...</p>
                <h3 id="da-integration">Intégration de la DA</h3>
                <p>La DA pour cet exploit est une visualisation des délais de réponse.</p>
            </>
        ),
        daComponent: <PortSwiggerDAExample /> // Utilisation du composant DA
    },
    // ... autres writeups
};

const PortSwiggerArticlePage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const data = portswiggerData[slug];

    if (!data) {
        return <div className="p-10 text-center text-red-500">Writeup PortSwigger non trouvé pour le slug: {slug}</div>;
    }

    return (
        <WriteupPageTemplate title={`PortSwigger | ${data.title}`} description={`Détails du lab PortSwigger : ${data.title}`}>
            <PortSwiggerBaseArticle 
                title={data.title}
                daComponent={data.daComponent}
                content={data.content}
            />
        </WriteupPageTemplate>
    );
};

export default PortSwiggerArticlePage;