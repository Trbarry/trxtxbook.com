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