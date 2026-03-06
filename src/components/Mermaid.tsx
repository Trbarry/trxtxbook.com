import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { useTheme } from '../context/ThemeContext';

interface MermaidProps {
  chart: string;
}

const Mermaid: React.FC<MermaidProps> = ({ chart }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    // Initialisation de mermaid avec le thème actuel
    mermaid.initialize({
      startOnLoad: true,
      theme: theme === 'dark' ? 'dark' : 'default',
      securityLevel: 'loose',
      fontFamily: 'inherit',
      fontSize: 14,
    });
  }, [theme]);

  useEffect(() => {
    if (ref.current && chart) {
      // Nettoyer le contenu précédent
      ref.current.innerHTML = '';
      
      const renderChart = async () => {
        try {
          // Générer un ID unique pour mermaid
          const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
          const { svg } = await mermaid.render(id, chart);
          if (ref.current) {
            ref.current.innerHTML = svg;
          }
        } catch (error) {
          console.error('Mermaid rendering failed:', error);
          if (ref.current) {
            ref.current.innerHTML = `<pre class="text-red-500 p-4 bg-red-500/10 rounded-lg border border-red-500/20 text-xs">Error rendering diagram: ${error instanceof Error ? error.message : 'Unknown error'}</pre>`;
          }
        }
      };

      renderChart();
    }
  }, [chart, theme]); // On re-rend si le thème change aussi

  return (
    <div 
      className="mermaid-container flex justify-center w-full overflow-x-auto bg-white/5 dark:bg-black/20 rounded-xl p-4 sm:p-8 my-6 border border-gray-200 dark:border-white/10 shadow-inner"
      ref={ref} 
    />
  );
};

export default Mermaid;
