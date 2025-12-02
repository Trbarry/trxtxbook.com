// src/lib/imageUtils.ts

export const getOptimizedUrl = (url: string, width: number = 800, quality: number = 80) => {
  if (!url) return '';

  // 1. Gestion Unsplash (inchangé)
  if (url.includes('images.unsplash.com')) {
    const baseUrl = url.split('?')[0];
    return `${baseUrl}?auto=format&fit=crop&w=${width}&q=${quality}`;
  }

  // 2. Gestion Supabase : On passe par wsrv.nl pour le redimensionnement gratuit
  if (url.includes('supabase.co')) {
    // On encode l'URL originale pour la passer en paramètre
    return `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=${width}&q=${quality}&output=webp`;
  }

  // 3. Fallback
  return url;
};