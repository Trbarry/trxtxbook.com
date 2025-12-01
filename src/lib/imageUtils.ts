/**
 * Optimise les URLs d'images (Supabase Storage & Unsplash)
 */
export const getOptimizedUrl = (url: string, width: number = 800, quality: number = 80) => {
  if (!url) return '';

  // 1. Gestion Unsplash
  if (url.includes('images.unsplash.com')) {
    // On nettoie l'URL des paramètres existants pour éviter les doublons
    const baseUrl = url.split('?')[0];
    return `${baseUrl}?auto=format&fit=crop&w=${width}&q=${quality}`;
  }

  // 2. Gestion Supabase
  if (url.includes('supabase.co')) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}width=${width}&format=webp&quality=${quality}`;
  }

  // 3. Fallback (Images locales ou autres)
  return url;
};