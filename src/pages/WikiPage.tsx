import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { WikiPage as WikiPageType } from '../types/wiki';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { 
  Search, Book, ChevronRight, ChevronDown, Hash, 
  Menu, X, Calendar, Folder, FileText, Construction, AlertTriangle
} from 'lucide-react';
import { SEOHead } from '../components/SEOHead';

// --- TYPES ---
interface TreeNode {
  name: string;
  fullPath: string;
  children: Record<string, TreeNode>;
  page?: WikiPageType;
  isOpen: boolean;
}

// --- COMPOSANT DE NAVIGATION RÉCURSIF ---
const FileTree: React.FC<{ 
  nodes: Record<string, TreeNode>; 
  onSelect: (page: WikiPageType) => void; 
  selectedId?: string;
  depth?: number 
}> = ({ nodes, onSelect, selectedId, depth = 0 }) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggle = (name: string) => {
    setExpanded(prev => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <div className={`flex flex-col ${depth > 0 ? 'ml-3 border-l border-white/10 pl-2' : ''}`}>
      {Object.entries(nodes).sort().map(([name, node]) => {
        const hasChildren = Object.keys(node.children).length > 0;
        const isSelected = node.page?.id === selectedId;

        return (
          <div key={node.fullPath}>
            <div className="flex items-center gap-1 py-1">
              {hasChildren && (
                <button 
                  onClick={() => toggle(name)}
                  className="p-1 hover:bg-white/10 rounded text-gray-500 hover:text-white transition-colors"
                >
                  {expanded[name] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
              )}
              
              {node.page ? (
                <button
                  onClick={() => onSelect(node.page!)}
                  className={`flex-1 text-left text-sm truncate px-2 py-1.5 rounded transition-all flex items-center gap-2
                    ${isSelected 
                      ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                  <FileText size={14} className={isSelected ? "text-violet-400" : "text-gray-600"} />
                  {node.page.title}
                </button>
              ) : (
                <span className="flex-1 text-xs font-bold text-gray-500 uppercase tracking-wider px-2 py-1.5 flex items-center gap-2 select-none cursor-pointer" onClick={() => toggle(name)}>
                  <Folder size={14} />
                  {name}
                </span>
              )}
            </div>

            {hasChildren && expanded[name] && (
              <FileTree 
                nodes={node.children} 
                onSelect={onSelect} 
                selectedId={selectedId} 
                depth={depth + 1} 
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

// --- PAGE PRINCIPALE ---
export const WikiPage: React.FC = () => {
  const [pages, setPages] = useState<WikiPageType[]>([]);
  const [selectedPage, setSelectedPage] = useState<WikiPageType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [tree, setTree] = useState<Record<string, TreeNode>>({});

  useEffect(() => {
    fetchPages();
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  }, []);

  // Construction de l'arbre à partir des catégories plates (ex: "Admin Sys/Linux/Bash")
  useEffect(() => {
    const newTree: Record<string, TreeNode> = {};

    const filteredPages = pages.filter(p => 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    filteredPages.forEach(page => {
      const parts = page.category.split('/'); // ["Admin Sys", "Linux", "Bash"]
      let currentLevel = newTree;

      parts.forEach((part, index) => {
        if (!currentLevel[part]) {
          currentLevel[part] = {
            name: part,
            fullPath: parts.slice(0, index + 1).join('/'),
            children: {},
            isOpen: false
          };
        }
        
        // Si c'est la dernière partie (le dossier final), on attache la page ici
        // Note: Dans ta structure, si tu veux que "Bash" soit cliquable, il faut que la catégorie soit "Admin Sys/Linux" et le titre "Bash".
        // Ici on suppose que la page est une feuille dans le dossier final.
        
        if (index === parts.length - 1) {
           // On ajoute la page comme un enfant spécial ou on l'attache au dossier ?
           // Stratégie : On ajoute la page comme un enfant du dossier
           currentLevel[part].children[page.title] = {
             name: page.title,
             fullPath: page.slug,
             children: {},
             page: page,
             isOpen: false
           };
        }

        currentLevel = currentLevel[part].children;
      });
    });

    setTree(newTree);
  }, [pages, searchQuery]);

  const fetchPages = async () => {
    try {
      const { data, error } = await supabase
        .from('wiki_pages')
        .select('*')
        .eq('published', true)
        .order('category', { ascending: true })
        .order('title', { ascending: true });

      if (error) throw error;
      setPages(data || []);
    } catch (err) {
      console.error('Erreur Wiki:', err);
    } finally {
      setLoading(false);
    }
  };

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center h-96 text-center p-8 border border-dashed border-white/10 rounded-2xl bg-[#13131a]/50">
      <div className="p-4 bg-yellow-500/10 rounded-full mb-4 animate-pulse">
        <Construction className="w-12 h-12 text-yellow-500" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">Contenu non déployé</h3>
      <p className="text-gray-400 max-w-md">
        Cette section de la Knowledge Base est en cours de rédaction ou de migration. 
        Revenez plus tard pour accéder aux ressources.
      </p>
      <div className="mt-6 flex gap-2 text-xs font-mono text-gray-500">
        <span>status: pending</span>
        <span>•</span>
        <span>author: trtnx</span>
      </div>
    </div>
  );

  return (
    <>
      <SEOHead title="Knowledge Base | Tristan Barry" description="Wiki technique et documentation" />
      
      <div className="min-h-screen bg-[#0a0a0f] flex pt-20 overflow-hidden">
        
        {/* Mobile Toggle */}
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="md:hidden fixed bottom-6 right-6 z-50 bg-violet-600 p-4 rounded-full shadow-lg text-white hover:bg-violet-700 transition-colors"
        >
          {isSidebarOpen ? <X /> : <Menu />}
        </button>

        {/* SIDEBAR */}
        <aside className={`
          fixed md:relative z-40 w-80 h-[calc(100vh-80px)] bg-[#13131a] border-r border-white/5 flex flex-col transition-all duration-300
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-0 md:opacity-0 md:overflow-hidden'}
        `}>
          <div className="p-4 border-b border-white/5 bg-[#13131a]">
            <div className="flex items-center gap-2 mb-4 text-white font-bold text-lg">
              <Book className="w-5 h-5 text-violet-500" />
              <span>Wiki TRTNX</span>
            </div>
            <div className="relative group">
              <input
                type="text"
                placeholder="Filtrer les ressources..."
                className="w-full bg-[#0a0a0f] border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-gray-300 focus:outline-none focus:border-violet-500/50 transition-all placeholder-gray-600"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500 group-focus-within:text-violet-400 transition-colors" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-violet-500 border-t-transparent"></div>
              </div>
            ) : (
              <FileTree 
                nodes={tree} 
                onSelect={(page) => {
                  setSelectedPage(page);
                  if (window.innerWidth < 768) setIsSidebarOpen(false);
                }} 
                selectedId={selectedPage?.id} 
              />
            )}
          </div>
        </aside>

        {/* CONTENT */}
        <main className="flex-1 h-[calc(100vh-80px)] overflow-y-auto bg-[#0a0a0f] relative custom-scrollbar scroll-smooth">
          {selectedPage ? (
            <div className="max-w-4xl mx-auto p-6 md:p-12 animate-in fade-in duration-500">
              
              {/* Fil d'ariane & Meta */}
              <div className="mb-8 pb-6 border-b border-white/5">
                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mb-4 font-mono">
                  <span className="text-violet-400">root</span>
                  <ChevronRight size={12} />
                  {selectedPage.category.split('/').map((cat, i) => (
                    <React.Fragment key={i}>
                      <span>{cat}</span>
                      <ChevronRight size={12} />
                    </React.Fragment>
                  ))}
                  <span className="text-white">{selectedPage.title}</span>
                </div>

                <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">{selectedPage.title}</h1>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-xs text-gray-400 bg-white/5 px-3 py-1.5 rounded-full">
                    <Calendar className="w-3 h-3" />
                    <span>Mis à jour le {new Date(selectedPage.updated_at).toLocaleDateString('fr-FR')}</span>
                  </div>
                  {selectedPage.tags?.map(tag => (
                    <span key={tag} className="flex items-center gap-1 text-xs text-violet-300 bg-violet-500/10 px-3 py-1.5 rounded-full border border-violet-500/20">
                      <Hash className="w-3 h-3" /> {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Contenu */}
              <div className="min-h-[400px]">
                {(!selectedPage.content || selectedPage.content.trim() === '') ? (
                  <EmptyState />
                ) : (
                  <div className="prose prose-invert prose-violet max-w-none 
                    prose-h1:text-white prose-h2:text-white prose-h2:mt-12 prose-h2:mb-6 prose-h2:border-b prose-h2:border-white/10 prose-h2:pb-2
                    prose-h3:text-violet-200 prose-h3:mt-8
                    prose-p:text-gray-300 prose-p:leading-relaxed
                    prose-code:text-violet-200 prose-code:bg-[#1a1a20] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none prose-code:font-mono prose-code:text-sm
                    prose-pre:bg-[#13131a] prose-pre:border prose-pre:border-white/10 prose-pre:rounded-xl
                    prose-li:text-gray-300 prose-li:marker:text-violet-500
                    prose-img:rounded-xl prose-img:border prose-img:border-white/10 prose-img:shadow-2xl
                    prose-strong:text-white
                    prose-a:text-violet-400 hover:prose-a:text-violet-300 prose-a:no-underline hover:prose-a:underline
                  ">
                    <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                      {selectedPage.content}
                    </ReactMarkdown>
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-600 p-6">
              <div className="w-24 h-24 bg-[#13131a] rounded-full flex items-center justify-center mb-6 animate-float">
                <Book className="w-10 h-10 text-violet-500/50" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Wiki Personnel</h2>
              <p className="max-w-md text-center text-gray-500">
                Sélectionnez une catégorie dans le menu latéral pour explorer la base de connaissances.
              </p>
            </div>
          )}
        </main>
      </div>
    </>
  );
};