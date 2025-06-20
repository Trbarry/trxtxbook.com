import React, { useState } from 'react';
import { Download, RefreshCw, CheckCircle2, AlertCircle, FileText } from 'lucide-react';
import { useSitemapGenerator } from '../lib/sitemap';

export const SitemapGenerator: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<Date | null>(null);
  const [sitemapContent, setSitemapContent] = useState<string>('');
  const [error, setError] = useState<string>('');
  const { generateSitemap, saveSitemap } = useSitemapGenerator();

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError('');
    
    try {
      const sitemap = await generateSitemap();
      setSitemapContent(sitemap);
      setLastGenerated(new Date());
    } catch (err) {
      setError('Erreur lors de la génération du sitemap');
      console.error('Sitemap generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!sitemapContent) return;

    const blob = new Blob([sitemapContent], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sitemap.xml';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSave = async () => {
    setIsGenerating(true);
    try {
      await saveSitemap();
      setLastGenerated(new Date());
    } catch (err) {
      setError('Erreur lors de la sauvegarde');
      console.error('Sitemap save error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-[#1a1a1f] p-6 rounded-lg border border-violet-900/20">
      <div className="flex items-center gap-3 mb-6">
        <FileText className="w-6 h-6 text-violet-400" />
        <h3 className="text-xl font-semibold">Générateur de Sitemap Automatique</h3>
      </div>

      <div className="space-y-6">
        {/* Description */}
        <div className="bg-[#2a2a2f] p-4 rounded-lg">
          <p className="text-gray-300 text-sm leading-relaxed">
            Ce générateur crée automatiquement un sitemap.xml basé sur vos routes React et 
            votre contenu Supabase. Il inclut toutes les pages statiques, articles et write-ups publiés.
          </p>
        </div>

        {/* Status */}
        {lastGenerated && (
          <div className="flex items-center gap-2 text-sm text-green-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>Dernière génération: {lastGenerated.toLocaleString('fr-FR')}</span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-400">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2 bg-violet-500 hover:bg-violet-600 
                     disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Génération...' : 'Générer Sitemap'}</span>
          </button>

          {sitemapContent && (
            <>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 
                         rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Télécharger</span>
              </button>

              <button
                onClick={handleSave}
                disabled={isGenerating}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 
                         disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span>Sauvegarder</span>
              </button>
            </>
          )}
        </div>

        {/* Preview */}
        {sitemapContent && (
          <div className="space-y-3">
            <h4 className="font-medium text-violet-400">Aperçu du Sitemap</h4>
            <div className="bg-[#2a2a2f] p-4 rounded-lg max-h-64 overflow-y-auto">
              <pre className="text-xs text-gray-300 whitespace-pre-wrap">
                {sitemapContent.substring(0, 1000)}
                {sitemapContent.length > 1000 && '...'}
              </pre>
            </div>
            <p className="text-xs text-gray-400">
              Taille: {(sitemapContent.length / 1024).toFixed(1)} KB | 
              URLs: {(sitemapContent.match(/<url>/g) || []).length}
            </p>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <h4 className="font-medium text-blue-400 mb-2">Instructions d'utilisation</h4>
          <ol className="text-sm text-gray-300 space-y-1 list-decimal list-inside">
            <li>Cliquez sur "Générer Sitemap" pour créer le sitemap automatiquement</li>
            <li>Téléchargez le fichier et remplacez le sitemap.xml dans /public/</li>
            <li>Ou utilisez "Sauvegarder" pour l'envoyer vers Supabase Storage</li>
            <li>Soumettez le nouveau sitemap à Google Search Console</li>
          </ol>
        </div>
      </div>
    </div>
  );
};