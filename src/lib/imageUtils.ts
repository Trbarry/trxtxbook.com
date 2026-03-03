import { Writeup } from '../types/writeup';

/**
 * Optimise les URLs d'images (Supabase Storage & Unsplash)
 * Utilise wsrv.nl comme proxy gratuit pour contourner les limitations
 * de redimensionnement de Supabase (plan gratuit).
 */
export const getOptimizedUrl = (url: string, width: number = 800, quality: number = 80) => {
  if (!url) return '';

  // 1. Gestion Unsplash (Support natif des paramètres)
  if (url.includes('images.unsplash.com')) {
    const baseUrl = url.split('?')[0];
    return `${baseUrl}?auto=format&fit=crop&w=${width}&q=${quality}`;
  }

  // 2. Gestion Supabase via wsrv.nl (Proxy gratuit de redimensionnement)
  // Cela permet d'avoir du WebP et la bonne taille même avec un compte Supabase gratuit.
  if (url.includes('supabase.co')) {
    // On encode l'URL originale pour la passer en paramètre au proxy
    return `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=${width}&q=${quality}&output=webp`;
  }

  // 3. Fallback (Images locales ou autres)
  return url;
};

/**
 * Récupère l'image associée à un write-up avec gestion des fallbacks
 */
export const getWriteupImage = (writeup: Writeup) => {
  // 1. Priorité aux images stockées en base de données
  if (writeup.images && writeup.images.length > 0) return writeup.images[0];

  // 2. Fallbacks Hardcodés (Sécurité & Performance)
  const fallbacks: Record<string, string> = {
    'hackthebox-forest': "https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/writeup-images/foresthtb.png",
    'hackthebox-cat-analysis': "https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/writeup-images/cat.htb.png",
    'hackthebox-dog': "https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/profile-images/dog.png",
    'hackthebox-reddish': "https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/writeup-images/reddish.webp",
    'tryhackme-skynet': "https://tryhackme-images.s3.amazonaws.com/room-icons/1559e2e8a4e1a3.png",
    'hackthebox-soccer': "https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/writeup-images/soccerhtb.png"
  };

  if (writeup.slug && fallbacks[writeup.slug]) {
    return fallbacks[writeup.slug];
  }

  // 3. Image par défaut si aucun slug ne correspond
  return "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80";
};