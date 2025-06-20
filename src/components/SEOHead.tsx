import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title = "Tristan Barry - Alternant Technicien Informatique | Portfolio IT & Cybersécurité",
  description = "Portfolio en IT & cybersécurité | Alternant BTS SIO SISR passionné d'informatique et de cybersécurité | Projets personnels en infrastructure, réseaux et sécurité | Partage de write-ups CTF et progression sur les plateformes comme Hack The Box & TryHackMe.",
  keywords = "Tristan Barry, technicien informatique, BTS SIO SISR, cybersécurité, pentesting, hack the box, tryhackme, write-ups, CTF, infrastructure, réseaux, alternance, Saint-Étienne, Lyon",
  image = "https://images.unsplash.com/photo-1550439062-609e1531270e?auto=format&fit=crop&q=80",
  url = "https://trxtxbook.com/",
  type = "website",
  author = "Tristan Barry",
  publishedTime,
  modifiedTime
}) => {
  return (
    <Helmet>
      {/* Titre principal */}
      <title>{title}</title>
      
      {/* Métadonnées de base */}
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <meta name="robots" content="index, follow" />
      <meta name="language" content="fr-FR" />
      <meta name="revisit-after" content="7 days" />
      
      {/* Dates */}
      {publishedTime && <meta name="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta name="article:modified_time" content={modifiedTime} />}
      
      {/* Canonical URL */}
      <link rel="canonical" href={url} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="Tristan Barry - Portfolio" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="fr_FR" />
      {author && <meta property="article:author" content={author} />}
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:creator" content="@TristanBarry" />
      
      {/* Métadonnées techniques */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      
      {/* Favicon et icônes */}
      <link rel="icon" type="image/png" href="https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/assets/favicon.png" />
      <link rel="apple-touch-icon" href="https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/assets/favicon.png" />
      
      {/* Polices préchargées */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      {/* Schema.org JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Person",
          "name": "Tristan Barry",
          "jobTitle": "Alternant Technicien Informatique",
          "description": "Alternant BTS SIO SISR passionné d'informatique et de cybersécurité",
          "url": "https://trxtxbook.com",
          "sameAs": [
            "https://www.linkedin.com/in/tristan-barry-43b91b330/",
            "https://tryhackme.com/p/Tr.barry",
            "https://app.hackthebox.com/profile/2129647"
          ],
          "knowsAbout": [
            "Cybersécurité",
            "Pentesting",
            "Infrastructure IT",
            "Réseaux informatiques",
            "Administration système",
            "Active Directory",
            "Linux",
            "Windows Server"
          ],
          "alumniOf": {
            "@type": "EducationalOrganization",
            "name": "BTS SIO option SISR"
          },
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Saint-Étienne",
            "addressCountry": "FR"
          }
        })}
      </script>
    </Helmet>
  );
};