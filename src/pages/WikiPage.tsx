import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { WikiPage as WikiPageType } from '../types/wiki';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { 
  Search, Book, ChevronRight, ChevronDown, Hash, 
  Menu, X, Calendar, Folder, FileText, Construction, 
  Layers, FolderOpen, CornerDownRight, Check, Copy, List,
  Brain, Sparkles, AlertTriangle, ShieldCheck, GraduationCap,
  Terminal, Cpu, Network, Activity, Database
} from 'lucide-react';
import { SEOHead } from '../components/SEOHead';
import { motion, AnimatePresence } from 'framer-motion';
import { WikiTip } from '../components/WikiTip'; // ✅ Import du composant Tip

// --- TYPES ---
interface TreeNode {
  name: string;
  fullPath: string;
  children: Record<string, TreeNode>;
  page?: WikiPageType;
  isOpen: boolean;
}

interface TocItem {
  id: string;
  text: string;
  level: number;
}

// --- HELPER : EXTRACTION DU SOMMAIRE ---
const extractHeadings = (markdown: string): TocItem[] => {
  const lines = markdown.split('\n');
  const headings: TocItem[] = [];
  
  lines.forEach((line) => {
    const match = line.match(/^(#{2,3})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2];
      const id = text.toLowerCase().replace(/[^\w]+/g, '-');
      headings.push({ id, text, level });
    }
  });
  
  return headings;
};

// --- COMPOSANT CODE BLOCK "TERMINAL" ---
const CodeBlock = ({ children, className, ...props }: any) => {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : null;
  const content = String(children).replace(/\n$/, '');

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!match) {
    return (
      <code className="bg-[#1a1a20] text-violet-200 px-1.5 py-0.5 rounded font-mono text-sm border border-white/10 shadow-sm" {...props}>
        {children}
      </code>
    );
  }

  return (
    <div className="relative group my-8 rounded-xl overflow-hidden border border-white/10 bg-[#0f0f13] shadow-2xl ring-1 ring-white/5">
      <div className="flex items-center justify-between px-4 py-3 bg-[#1a1a20]/80 backdrop-blur border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50"></div>
          </div>
          <span className="text-xs text-gray-500 font-mono ml-2 uppercase tracking-widest opacity-70">{language}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-colors px-2 py-1 rounded hover:bg-white/5"
        >
          {copied ? <><Check size={14} className="text-green-400" /><span className="text-green-400 font-medium">Copié</span></> : <><Copy size={14} /><span>Copier</span></>}
        </button>
      </div>
      <div className="p-5 overflow-x-auto custom-scrollbar bg-black/20">
        <code className={`font-mono text-sm text-gray-300 leading-relaxed ${className}`} {...props}>{children}</code>
      </div>
    </div>
  );
};

// --- COMPOSANT FILE TREE ---
const FileTree: React.FC<{ nodes: Record<string, TreeNode>; onSelect: (page: WikiPageType) => void; selectedId?: string; depth?: number }> = ({ nodes, onSelect, selectedId, depth = 0 }) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const toggle = (name: string) => setExpanded(prev => ({ ...prev, [name]: !prev[name] }));

  return (
    <div className="flex flex-col relative">
      {depth > 0 && <div className="absolute left-[11px] top-0 bottom-0 w-px bg-gradient-to-b from-white/10 to-transparent" />}
      {Object.entries(nodes).sort().map(([name, node]) => {
        const hasChildren = Object.keys(node.children).length > 0;
        const isSelected = node.page?.id === selectedId;
        const isFolderOpen = expanded[name];

        return (
          <div key={node.fullPath} className="relative group/item">
            {(!node.page || hasChildren) && (
              <div className="my-1">
                <button 
                  onClick={() => toggle(name)}
                  className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 relative overflow-hidden group/btn
                    ${isFolderOpen ? 'bg-white/5' : 'hover:bg-white/5'}
                  `}
                  style={{ paddingLeft: `${depth * 16 + 12}px` }}
                >
                  {depth > 0 && <CornerDownRight className="absolute text-white/20 w-3 h-3" style={{ left: `${depth * 16 - 6}px` }} />}
                  
                  <span className={`text-gray-500 transition-transform duration-300 ${isFolderOpen ? 'rotate-90 text-violet-400' : ''}`}><ChevronRight size={14} /></span>
                  
                  <span className={`transition-colors duration-300 ${isFolderOpen ? 'text-violet-300' : 'text-gray-400 group-hover/btn:text-gray-200'}`}>
                    {isFolderOpen ? <FolderOpen size={15} /> : <Folder size={15} />}
                  </span>
                  
                  <span className={`text-xs font-bold uppercase tracking-wider truncate transition-colors ${isFolderOpen ? 'text-white' : 'text-gray-400'}`}>{name}</span>
                </button>
                
                <AnimatePresence>
                  {isFolderOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                      <FileTree nodes={node.children} onSelect={onSelect} selectedId={selectedId} depth={depth + 1} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
            
            {node.page && !hasChildren && (
              <div className="my-0.5 relative">
                 {depth > 0 && <CornerDownRight className="absolute top-2.5 text-white/20 w-3 h-3" style={{ left: `${depth * 16 + 4}px` }} />}
                <button
                  onClick={() => onSelect(node.page!)}
                  style={{ paddingLeft: `${depth * 16 + 28}px` }}
                  className={`w-full text-left text-sm truncate py-2 pr-3 rounded-lg transition-all duration-300 flex items-center gap-3 relative
                    ${isSelected 
                      ? 'text-white bg-gradient-to-r from-violet-500/10 to-transparent border-l-2 border-violet-500' 
                      : 'text-gray-500 hover:text-gray-200 hover:bg-white/5 border-l-2 border-transparent'}`}
                >
                  <FileText size={14} className={`transition-colors ${isSelected ? "text-violet-400" : "text-gray-600 group-hover:text-gray-400"}`} />
                  <span className="truncate">{node.page.title}</span>
                  {isSelected && <motion.div layoutId="activeGlow" className="absolute inset-0 bg-violet-500/5 rounded-lg -z-10" initial={false} transition={{ type: "spring", stiffness: 500, damping: 30 }} />}
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// --- PAGE D'ACCUEIL WIKI (DESIGN PREMIUM + KUDOS) ---
const WikiWelcome = () => {
  const stats = [
    { label: "Nodes", value: "250+", icon: Database, color: "blue" },
    { label: "Status", value: "Online", icon: Activity, color: "green" },
    { label: "Last Update", value: "Today", icon: Calendar, color: "violet" },
  ];

  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 md:p-12 max-w-5xl mx-auto animate-in fade-in zoom-in duration-500 w-full">
      
      {/* Hero Header */}
      <div className="text-center mb-10 relative">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-violet-500/20 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-medium mb-6 shadow-[0_0_15px_rgba(139,92,246,0.2)]">
          <Brain className="w-3.5 h-3.5" />
          <span>Second Brain v2.0</span>
        </div>

        <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
          Wiki <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">Personnel</span>
        </h2>
        
        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-8">
          Base de connaissances dynamique, centralisant mes notes techniques, procédures et retours d'expérience.
        </p>

        {/* ✅ AJOUT DU BOUTON KUDOS ICI */}
        <div className="mb-12">
          <WikiTip /> 
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 w-full max-w-2xl mb-12">
        {stats.map((stat, i) => (
          <div key={i} className="bg-[#13131a]/50 border border-white/5 rounded-xl p-4 flex flex-col items-center justify-center gap-2 group hover:border-white/10 transition-colors">
            <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
            <div className="text-center">
              <div className="text-lg font-bold text-white">{stat.value}</div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wider">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mb-12">
        <div className="group relative bg-[#1a1a20]/50 border border-white/10 rounded-2xl p-8 overflow-hidden hover:border-violet-500/30 transition-all duration-300 hover:shadow-[0_0_30px_rgba(139,92,246,0.1)]">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
            <GraduationCap className="w-32 h-32 rotate-12" />
          </div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-violet-500/10 rounded-xl flex items-center justify-center mb-6 border border-violet-500/20 group-hover:scale-110 transition-transform duration-300">
              <Book className="w-6 h-6 text-violet-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Philosophie</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Centraliser l'information pour ne jamais la chercher deux fois. Une approche "Digital Garden" où les notes évoluent, se lient entre elles et s'enrichissent avec la pratique.
            </p>
          </div>
        </div>

        <div className="group relative bg-[#1a1a20]/50 border border-white/10 rounded-2xl p-8 overflow-hidden hover:border-yellow-500/30 transition-all duration-300 hover:shadow-[0_0_30px_rgba(234,179,8,0.1)]">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
            <Terminal className="w-32 h-32 rotate-12" />
          </div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center mb-6 border border-yellow-500/20 group-hover:scale-110 transition-transform duration-300">
              <AlertTriangle className="w-6 h-6 text-yellow-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Disclaimer</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Notes de terrain brutes. Le contenu privilégie l'efficacité technique à la forme académique. Certaines sections peuvent être en chantier ou contenir du "franglais".
            </p>
          </div>
        </div>
      </div>

      {/* Footer Status */}
      <div className="w-full max-w-4xl border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500 font-mono">
        <div className="flex items-center gap-3">
           <div className="flex items-center gap-2 px-2 py-1 bg-white/5 rounded">
             <ShieldCheck className="w-3 h-3 text-green-500" />
             <span>Access: Public Read</span>
           </div>
           <div className="flex items-center gap-2 px-2 py-1 bg-white/5 rounded">
             <Cpu className="w-3 h-3 text-blue-500" />
             <span>Engine: React/Supabase</span>
           </div>
        </div>
        <div className="flex items-center gap-2">
          <span>AUTHOR:</span>
          <span className="text-violet-400 font-bold">TRTNX</span>
        </div>
      </div>
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
  const [toc, setToc] = useState<TocItem[]>([]);

  useEffect(() => {
    fetchPages();
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  }, []);

  useEffect(() => {
    const newTree: Record<string, TreeNode> = {};
    const filteredPages = pages.filter(p => 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    filteredPages.forEach(page => {
      const parts = page.category.split('/').filter(p => p); 
      let currentLevel = newTree;
      parts.forEach((part, index) => {
        if (!currentLevel[part]) {
          currentLevel[part] = { name: part, fullPath: parts.slice(0, index + 1).join('/'), children: {}, isOpen: false };
        }
        if (index === parts.length - 1) {
           currentLevel[part].children[page.title] = { name: page.title, fullPath: page.slug, children: {}, page: page, isOpen: false };
        }
        currentLevel = currentLevel[part].children;
      });
    });
    setTree(newTree);
  }, [pages, searchQuery]);

  useEffect(() => {
    if (selectedPage?.content) {
      setToc(extractHeadings(selectedPage.content));
    } else {
      setToc([]);
    }
  }, [selectedPage]);

  const fetchPages = async () => {
    try {
      const { data, error } = await supabase.from('wiki_pages').select('*').eq('published', true).order('category', { ascending: true }).order('title', { ascending: true });
      if (error) throw error;
      setPages(data || []);
    } catch (err) {
      console.error('Erreur Wiki:', err);
    } finally {
      setLoading(false);
    }
  };

  const MaintenanceState = () => (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center p-12 border border-white/5 rounded-3xl bg-[#13131a]/50 backdrop-blur-sm relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.02)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%] animate-[shimmer_3s_linear_infinite] pointer-events-none"></div>
      
      <div className="relative mb-8">
        <div className="w-24 h-24 bg-[#1a1a20] rounded-full flex items-center justify-center border border-white/10 shadow-xl mx-auto mb-6 relative group">
          <div className="absolute inset-0 bg-yellow-500/10 rounded-full blur-xl group-hover:bg-yellow-500/20 transition-all"></div>
          <Construction className="w-10 h-10 text-yellow-500" />
          <div className="absolute bottom-0 right-0 p-2 bg-[#13131a] rounded-full border border-white/10">
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
          </div>
        </div>
      </div>
      
      <h3 className="text-2xl font-bold text-white mb-4">Contenu en cours d'ingestion</h3>
      <p className="text-gray-400 max-w-md leading-relaxed mb-8">
        Cette section a été indexée dans l'architecture, mais les données brutes n'ont pas encore été formatées pour l'affichage public.
      </p>
      
      <div className="inline-flex items-center gap-3 px-4 py-2 bg-yellow-500/5 border border-yellow-500/10 rounded-full">
        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
        <span className="text-xs font-mono text-yellow-400 tracking-widest uppercase">Status: Pending Sync</span>
      </div>
    </div>
  );

  return (
    <>
      <SEOHead title="Wiki & Knowledge Base | Tristan Barry" description="Base de connaissances technique" />
      
      <div className="min-h-screen bg-[#0a0a0f] flex pt-24 pb-6 px-4 md:px-8 gap-6 overflow-hidden">
        
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden fixed bottom-6 right-6 z-50 bg-violet-600 p-4 rounded-full shadow-[0_0_30px_rgba(139,92,246,0.4)] text-white hover:bg-violet-500 transition-all active:scale-95">
          {isSidebarOpen ? <X /> : <Menu />}
        </button>

        {/* SIDEBAR */}
        <aside className={`fixed inset-y-24 left-4 lg:left-8 z-40 w-80 lg:relative lg:inset-auto lg:w-80 lg:block bg-[#13131a]/80 backdrop-blur-xl border border-white/10 rounded-2xl flex flex-col transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)] shadow-2xl ${isSidebarOpen ? 'translate-x-0 opacity-100' : '-translate-x-[120%] opacity-0 lg:translate-x-0 lg:opacity-100 lg:w-80'}`}>
          <div className="p-6 border-b border-white/5">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl shadow-lg shadow-violet-500/20"><Book className="w-5 h-5 text-white" /></div>
              <span className="font-bold text-xl text-white tracking-tight">Wiki TRTNX</span>
            </div>
            <div className="relative group">
              <div className="absolute inset-0 bg-violet-500/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
              <div className="relative flex items-center bg-[#0a0a0f] border border-white/10 rounded-xl focus-within:border-violet-500/50 transition-colors">
                <Search className="ml-3 w-4 h-4 text-gray-500 group-focus-within:text-violet-400 transition-colors" />
                <input type="text" placeholder="Explorer..." className="w-full bg-transparent py-3 pl-3 pr-4 text-sm text-gray-200 focus:outline-none placeholder-gray-600 font-medium" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin"></div>
              </div>
            ) : Object.keys(tree).length === 0 ? (
              <div className="text-center py-12 text-gray-500"><p>Aucune donnée trouvée.</p></div>
            ) : (
              <FileTree nodes={tree} onSelect={(page) => { setSelectedPage(page); if (window.innerWidth < 1024) setIsSidebarOpen(false); }} selectedId={selectedPage?.id} />
            )}
          </div>
          <div className="p-4 border-t border-white/5 bg-white/[0.02] flex justify-between items-center text-[10px] text-gray-500 font-mono uppercase tracking-widest">
            <span>{pages.length} nodes</span>
            <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />Online</span>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 bg-[#13131a]/40 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden relative shadow-2xl flex flex-col">
          
          {selectedPage ? (
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-12 scroll-smooth relative">
               {/* Glow Background */}
               <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-500/5 rounded-full blur-[120px] pointer-events-none"></div>

              <motion.div key={selectedPage.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="max-w-4xl mx-auto relative z-10">
                
                {/* Header Page */}
                <div className="mb-10 pb-8 border-b border-white/5">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mb-6 font-mono uppercase tracking-wide">
                    <span className="text-violet-400 font-bold px-2 py-1 bg-violet-500/10 rounded border border-violet-500/20">root</span>
                    <ChevronRight size={12} />
                    {selectedPage.category.split('/').map((cat, i) => (
                      <React.Fragment key={i}>
                        <span className="hover:text-white transition-colors cursor-default">{cat}</span>
                        <ChevronRight size={12} />
                      </React.Fragment>
                    ))}
                  </div>

                  <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight leading-tight">
                    {selectedPage.title}
                  </h1>
                  
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 text-xs text-gray-400 bg-[#1a1a20] border border-white/10 px-3 py-1.5 rounded-full">
                      <Calendar className="w-3 h-3" />
                      <span>Updated: {new Date(selectedPage.updated_at).toLocaleDateString('fr-FR')}</span>
                    </div>
                    {selectedPage.tags?.map(tag => (
                      <span key={tag} className="flex items-center gap-1 text-xs text-violet-300 bg-violet-500/10 px-3 py-1.5 rounded-full border border-violet-500/20"><Hash className="w-3 h-3" /> {tag}</span>
                    ))}
                  </div>
                </div>

                {/* Contenu */}
                <div className="min-h-[400px]">
                  {(!selectedPage.content || selectedPage.content.trim() === '') ? (
                    <MaintenanceState />
                  ) : (
                    <div className="prose prose-invert prose-violet max-w-none 
                      prose-headings:font-bold prose-headings:text-white prose-headings:tracking-tight
                      prose-h1:text-3xl prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:border-b prose-h2:border-white/10 prose-h2:pb-2 prose-h2:scroll-mt-32
                      prose-h3:text-xl prose-h3:text-violet-200 prose-h3:mt-8 prose-h3:scroll-mt-32
                      prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-6 prose-p:text-[15px]
                      prose-code:text-violet-200 prose-code:bg-[#1a1a20] prose-code:border prose-code:border-white/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none prose-code:font-mono prose-code:text-sm
                      prose-pre:bg-transparent prose-pre:p-0 prose-pre:border-none prose-pre:shadow-none prose-pre:my-8
                      prose-li:text-gray-300 prose-li:marker:text-violet-500
                      prose-img:rounded-xl prose-img:border prose-img:border-white/10 prose-img:shadow-2xl prose-img:my-8
                      prose-strong:text-white
                      prose-a:text-violet-400 hover:prose-a:text-violet-300 prose-a:no-underline hover:prose-a:underline prose-a:font-medium
                      prose-blockquote:border-l-4 prose-blockquote:border-violet-500 prose-blockquote:bg-violet-500/5 prose-blockquote:px-6 prose-blockquote:py-2 prose-blockquote:rounded-r-lg prose-blockquote:not-italic prose-blockquote:text-gray-400
                      prose-hr:border-white/10 prose-hr:my-12
                    ">
                      <ReactMarkdown 
                        rehypePlugins={[rehypeRaw]}
                        components={{
                          code: CodeBlock,
                          pre: ({children}) => <>{children}</>,
                          h2: ({children}) => {
                            const id = String(children).toLowerCase().replace(/[^\w]+/g, '-');
                            return <h2 id={id}>{children}</h2>
                          },
                          h3: ({children}) => {
                            const id = String(children).toLowerCase().replace(/[^\w]+/g, '-');
                            return <h3 id={id}>{children}</h3>
                          }
                        }}
                      >
                        {selectedPage.content}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>

                {/* ✅ SECTION TIPS - Nouvelle intégration */}
                <div className="mt-16">
                   <WikiTip pageId={selectedPage.id} initialLikes={selectedPage.likes || 0} />
                </div>

              </motion.div>
            </div>
          ) : (
            // VUE D'ACCUEIL WIKI (Composant complet)
            <WikiWelcome />
          )}

          {/* TABLE OF CONTENTS (Desktop Only) */}
          {selectedPage && toc.length > 0 && selectedPage.content && selectedPage.content.trim() !== '' && (
            <aside className="hidden xl:block w-72 border-l border-white/5 bg-[#13131a]/30 p-8 overflow-y-auto custom-scrollbar">
              <div className="sticky top-6">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <List size={14} />
                  Sommaire
                </h4>
                <div className="space-y-1 relative">
                  <div className="absolute left-[3px] top-2 bottom-2 w-px bg-white/5"></div>
                  {toc.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className={`block text-sm py-1.5 pl-4 border-l-2 transition-all duration-200 hover:text-violet-300 hover:border-violet-500/50 ${item.level === 3 ? 'ml-3 text-gray-500 border-transparent text-xs' : 'text-gray-400 border-transparent'}`}
                      onClick={(e) => {
                        e.preventDefault();
                        document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
                      }}
                    >
                      {item.text}
                    </a>
                  ))}
                </div>
              </div>
            </aside>
          )}
        </main>
      </div>
    </>
  );
};