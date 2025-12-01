/**
 * Optimise les URLs d'images Supabase Storage
 * Utilise le service de transformation d'images de Supabase
 */
export const getOptimizedUrl = (url: string, width: number = 800, quality: number = 80) => {
  if (!url || !url.includes('supabase.co')) {
    return url;
  }

  // Si l'URL a déjà des paramètres, on ajoute avec &, sinon avec ?
  const separator = url.includes('?') ? '&' : '?';
  
  return `${url}${separator}width=${width}&format=webp&quality=${quality}`;
};