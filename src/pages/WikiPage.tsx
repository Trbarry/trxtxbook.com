import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { WikiPage as WikiPageType } from '../types/wiki';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { 
  Search, Book, ChevronRight, ChevronDown, Hash, 
  Menu, X, Calendar, Folder, FileText, Construction, 
  Layers, FolderOpen, CornerDownRight, Check, Copy, List,
  Brain, AlertTriangle, ShieldCheck, GraduationCap,
  Terminal, Cpu, Activity, Database
} from 'lucide-react';
import { SEOHead } from '../components/SEOHead';
import { motion, AnimatePresence } from 'framer-motion';
import { WikiTip } from '../components/WikiTip';

// --- TYPES & HELPER (Inchangés) ---
interface TreeNode { name: string; fullPath: string; children: Record<string, TreeNode>; page?: WikiPageType; isOpen: boolean; }
interface TocItem { id: string; text: string; level: number; }
const extractHeadings = (markdown: string): TocItem[] => {
  const lines = markdown.split('\n');
  const headings: TocItem[] = [];
  lines.forEach((line) => {
    const match = line.match(/^(#{2,3})\s+(.+)$/);
    if (match) { headings.push({ id: match[2].toLowerCase().replace(/[^\w]+/g, '-'), text: match[2], level: match[1].length }); }
  });
  return headings;
};

// --- CODE BLOCK (Reste sombre pour lisibilité code) ---
const CodeBlock = ({ children, className, ...props }: any) => {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : null;
  const content = String(children).replace(/\n$/, '');
  const handleCopy = async () => { await navigator.clipboard.writeText(content); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  if (!match) return <code className="bg-gray-100 dark:bg-[#1a1a20] text-violet-700 dark:text-violet-200 px-1.5 py-0.5 rounded font-mono text-sm border border-gray-200 dark:border-white/10 shadow-sm" {...props}>{children}</code>;

  return (
    <div className="relative group my-8 rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 bg-[#0f0f13] shadow-xl">
      <div className="flex items-center justify-between px-4 py-3 bg-[#1a1a20] border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500/20"></div><div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20"></div><div className="w-2.5 h-2.5 rounded-full bg-green-500/20"></div></div>
          <span className="text-xs text-gray-500 font-mono ml-2 uppercase tracking-widest opacity-70">{language}</span>
        </div>
        <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-colors px-2 py-1 rounded hover:bg-white/5">{copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}</button>
      </div>
      <div className="p-5 overflow-x-auto custom-scrollbar bg-black/20">
        <code className={`font-mono text-sm text-gray-300 leading-relaxed ${className}`} {...props}>{children}</code>
      </div>
    </div>
  );
};

// --- FILE TREE ---
const FileTree: React.FC<{ nodes: Record<string, TreeNode>; onSelect: (page: WikiPageType) => void; selectedId?: string; depth?: number }> = ({ nodes, onSelect, selectedId, depth = 0 }) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const toggle = (name: string) => setExpanded(prev => ({ ...prev, [name]: !prev[name] }));

  return (
    <div className="flex flex-col relative">
      {depth > 0 && <div className="absolute left-[11px] top-0 bottom-0 w-px bg-gray-200 dark:bg-white/10" />}
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
                  className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 relative overflow-hidden group/btn ${isFolderOpen ? 'bg-gray-100 dark:bg-white/5' : 'hover:bg-gray-50 dark:hover:bg-white/5'}`}
                  style={{ paddingLeft: `${depth * 16 + 12}px` }}
                >
                  <span className={`text-gray-400 dark:text-gray-500 transition-transform duration-300 ${isFolderOpen ? 'rotate-90 text-violet-600 dark:text-violet-400' : ''}`}><ChevronRight size={14} /></span>
                  <span className={`transition-colors duration-300 ${isFolderOpen ? 'text-violet-600 dark:text-violet-300' : 'text-gray-600 dark:text-gray-400 group-hover/btn:text-gray-900 dark:group-hover/btn:text-gray-200'}`}>{isFolderOpen ? <FolderOpen size={15} /> : <Folder size={15} />}</span>
                  <span className={`text-xs font-bold uppercase tracking-wider truncate transition-colors ${isFolderOpen ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>{name}</span>
                </button>
                <AnimatePresence>{isFolderOpen && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden"><FileTree nodes={node.children} onSelect={onSelect} selectedId={selectedId} depth={depth + 1} /></motion.div>)}</AnimatePresence>
              </div>
            )}
            
            {node.page && !hasChildren && (
              <div className="my-0.5 relative">
                <button
                  onClick={() => onSelect(node.page!)}
                  style={{ paddingLeft: `${depth * 16 + 28}px` }}
                  className={`w-full text-left text-sm truncate py-2 pr-3 rounded-lg transition-all duration-300 flex items-center gap-3 relative
                    ${isSelected ? 'text-gray-900 dark:text-white bg-violet-50 dark:bg-violet-500/10 border-l-2 border-violet-500' : 'text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 border-l-2 border-transparent'}`}
                >
                  <FileText size={14} className={`transition-colors ${isSelected ? "text-violet-600 dark:text-violet-400" : "text-gray-400 dark:text-gray-600"}`} />
                  <span className="truncate">{node.page.title}</span>
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// --- WIKI WELCOME ---
const WikiWelcome = () => {
  const stats = [{ label: "Nodes", value: "250+", icon: Database, color: "blue" }, { label: "Status", value: "Online", icon: Activity, color: "green" }, { label: "Last Update", value: "Today", icon: Calendar, color: "violet" }];
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 md:p-12 max-w-5xl mx-auto animate-in fade-in zoom-in duration-500 w-full">
      <div className="text-center mb-10 relative">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-300 text-xs font-medium mb-6 shadow-sm">
          <Brain className="w-3.5 h-3.5" /><span>Second Brain v2.0</span>
        </div>
        <h2 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">Wiki <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400">Personnel</span></h2>
        <p className="text-gray-600 dark:text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-8">Base de connaissances dynamique.</p>
        <div className="mb-12"><WikiTip context="global" /></div>
      </div>
      <div className="grid grid-cols-3 gap-4 w-full max-w-2xl mb-12">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-[#13131a]/50 border border-gray-200 dark:border-white/5 rounded-xl p-4 flex flex-col items-center justify-center gap-2 shadow-sm dark:shadow-none">
            <stat.icon className={`w-5 h-5 text-${stat.color}-500 dark:text-${stat.color}-400`} />
            <div className="text-center"><div className="text-lg font-bold text-gray-900 dark:text-white">{stat.value}</div><div className="text-[10px] text-gray-500 uppercase tracking-wider">{stat.label}</div></div>
          </div>
        ))}
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

  useEffect(() => { fetchPages(); if (window.innerWidth < 1024) setIsSidebarOpen(false); }, []);
  useEffect(() => {
    // (Logique Tree inchangée...)
    const newTree: Record<string, TreeNode> = {};
    const filteredPages = pages.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase()));
    filteredPages.forEach(page => {
      const parts = page.category.split('/').filter(p => p); 
      let currentLevel = newTree;
      parts.forEach((part, index) => {
        if (!currentLevel[part]) currentLevel[part] = { name: part, fullPath: parts.slice(0, index + 1).join('/'), children: {}, isOpen: false };
        if (index === parts.length - 1) currentLevel[part].children[page.title] = { name: page.title, fullPath: page.slug, children: {}, page: page, isOpen: false };
        currentLevel = currentLevel[part].children;
      });
    });
    setTree(newTree);
  }, [pages, searchQuery]);

  useEffect(() => { if (selectedPage?.content) setToc(extractHeadings(selectedPage.content)); else setToc([]); }, [selectedPage]);

  const fetchPages = async () => {
    try { const { data, error } = await supabase.from('wiki_pages').select('*').eq('published', true); if (error) throw error; setPages(data || []); } 
    catch (err) { console.error(err); } finally { setLoading(false); }
  };

  return (
    <>
      <SEOHead title="Wiki & Knowledge Base" description="Base de connaissances" />
      
      {/* ✅ CHANGEMENT : bg-background */}
      <div className="min-h-screen bg-background flex pt-24 pb-6 px-4 md:px-8 gap-6 overflow-hidden transition-colors duration-300">
        
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden fixed bottom-6 right-6 z-50 bg-violet-600 p-4 rounded-full shadow-lg text-white hover:bg-violet-500 transition-all active:scale-95">{isSidebarOpen ? <X /> : <Menu />}</button>

        {/* SIDEBAR : bg-surface */}
        <aside className={`fixed inset-y-24 left-4 lg:left-8 z-40 w-80 lg:relative lg:inset-auto lg:w-80 lg:block bg-surface/90 dark:bg-[#13131a]/80 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl flex flex-col transition-all duration-500 shadow-2xl ${isSidebarOpen ? 'translate-x-0 opacity-100' : '-translate-x-[120%] opacity-0 lg:translate-x-0 lg:opacity-100 lg:w-80'}`}>
          <div className="p-6 border-b border-gray-100 dark:border-white/5">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl shadow-lg"><Book className="w-5 h-5 text-white" /></div>
              <span className="font-bold text-xl text-gray-900 dark:text-white tracking-tight">Wiki TRTNX</span>
            </div>
            <div className="relative group">
              <div className="relative flex items-center bg-gray-50 dark:bg-[#0a0a0f] border border-gray-200 dark:border-white/10 rounded-xl focus-within:border-violet-500/50 transition-colors">
                <Search className="ml-3 w-4 h-4 text-gray-400 group-focus-within:text-violet-500" />
                <input type="text" placeholder="Explorer..." className="w-full bg-transparent py-3 pl-3 pr-4 text-sm text-gray-900 dark:text-gray-200 focus:outline-none placeholder-gray-500 dark:placeholder-gray-600 font-medium" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {loading ? <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin"></div></div> : Object.keys(tree).length === 0 ? <div className="text-center py-12 text-gray-500"><p>Aucune donnée.</p></div> : <FileTree nodes={tree} onSelect={(page) => { setSelectedPage(page); if (window.innerWidth < 1024) setIsSidebarOpen(false); }} selectedId={selectedPage?.id} />}
          </div>
        </aside>

        {/* MAIN CONTENT : bg-surface/40 */}
        <main className="flex-1 bg-surface/50 dark:bg-[#13131a]/40 backdrop-blur-md border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden relative shadow-xl flex flex-col">
          {selectedPage ? (
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-12 scroll-smooth relative">
              <motion.div key={selectedPage.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="max-w-4xl mx-auto relative z-10">
                <div className="mb-10 pb-8 border-b border-gray-200 dark:border-white/5">
                  <h1 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight leading-tight">{selectedPage.title}</h1>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-[#1a1a20] border border-gray-200 dark:border-white/10 px-3 py-1.5 rounded-full"><Calendar className="w-3 h-3" /><span>Updated: {new Date(selectedPage.updated_at).toLocaleDateString('fr-FR')}</span></div>
                    {selectedPage.tags?.map(tag => <span key={tag} className="flex items-center gap-1 text-xs text-violet-600 dark:text-violet-300 bg-violet-50 dark:bg-violet-500/10 px-3 py-1.5 rounded-full border border-violet-200 dark:border-violet-500/20"><Hash className="w-3 h-3" /> {tag}</span>)}
                  </div>
                </div>

                <div className="min-h-[400px]">
                  <div className="prose max-w-none 
                      prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white
                      prose-h1:text-3xl prose-h2:text-2xl prose-h2:mt-12 prose-h2:border-gray-200 dark:prose-h2:border-white/10
                      prose-h3:text-xl prose-h3:text-violet-700 dark:prose-h3:text-violet-200
                      prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed
                      prose-strong:text-gray-900 dark:prose-strong:text-white
                      prose-a:text-violet-600 dark:prose-a:text-violet-400
                      prose-li:text-gray-700 dark:prose-li:text-gray-300
                      prose-blockquote:border-violet-500 prose-blockquote:bg-violet-50 dark:prose-blockquote:bg-violet-500/5 prose-blockquote:text-gray-700 dark:prose-blockquote:text-gray-400
                  ">
                    <ReactMarkdown rehypePlugins={[rehypeRaw]} components={{ code: CodeBlock, h2: ({children}) => <h2 id={String(children).toLowerCase().replace(/[^\w]+/g, '-')}>{children}</h2> }}>{selectedPage.content}</ReactMarkdown>
                  </div>
                </div>
                <div className="mt-16 pb-12 border-t border-gray-200 dark:border-white/5 pt-8"><WikiTip pageId={selectedPage.id} context="article" /></div>
              </motion.div>
            </div>
          ) : <WikiWelcome />}
          
          {selectedPage && toc.length > 0 && (
            <aside className="hidden xl:block w-72 border-l border-gray-200 dark:border-white/5 bg-gray-50/50 dark:bg-[#13131a]/30 p-8 overflow-y-auto custom-scrollbar">
              <div className="sticky top-6">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2"><List size={14} />Sommaire</h4>
                <div className="space-y-1 relative"><div className="absolute left-[3px] top-2 bottom-2 w-px bg-gray-300 dark:bg-white/5"></div>{toc.map((item) => (<a key={item.id} href={`#${item.id}`} className={`block text-sm py-1.5 pl-4 border-l-2 transition-all duration-200 hover:text-violet-600 dark:hover:text-violet-300 ${item.level === 3 ? 'ml-3 text-gray-500 dark:text-gray-500 border-transparent text-xs' : 'text-gray-600 dark:text-gray-400 border-transparent'}`} onClick={(e) => {e.preventDefault();document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });}}>{item.text}</a>))}</div>
              </div>
            </aside>
          )}
        </main>
      </div>
    </>
  );
};