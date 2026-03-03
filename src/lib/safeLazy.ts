import { lazy, ComponentType } from 'react';

/**
 * A wrapper around React.lazy that handles "ChunkLoadError" or similar failures
 * by forcing a full page reload. This happens when a new version of the app
 * is deployed and the old chunks are no longer available on the server.
 */
export function safeLazy<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>
) {
  return lazy(async () => {
    try {
      return await factory();
    } catch (error) {
      console.error('Lazy loading failed:', error);
      
      // Check if it's a network error related to fetching a module
      const isChunkLoadError = 
        error instanceof Error && 
        (error.name === 'ChunkLoadError' || 
         error.message.includes('Failed to fetch dynamically imported module') ||
         error.message.includes('loading chunk'));

      if (isChunkLoadError) {
        console.warn('Chunk load error detected. Reloading page...');
        window.location.reload();
      }

      // Re-throw the error so it can be caught by an ErrorBoundary if present
      throw error;
    }
  });
}
