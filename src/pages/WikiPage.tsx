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
  Terminal, Cpu, Activity, Database, Sparkles
} from 'lucide-react';
import { SEOHead } from '../components/SEOHead';
import { motion, AnimatePresence } from 'framer-motion';
import { WikiTip } from '../components/WikiTip';
import { useWikiPages } from '../hooks/useWikiPages';

// --- TYPES & HELPER ---
interface TreeNode { 
  name: string; 
  fullPath: string; 
  children: Record<string, TreeNode>; 
  page?: WikiPageType; 
  isOpen: boolean; 
  count: number; 
}
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

const getReadingTime = (text: string): number => {
  const wordsPerMinute = 200;
  const noOfWords = text.split(/\s+/g).length;
  const minutes = noOfWords / wordsPerMinute;
  return Math.ceil(minutes);
};

// --- BREADCRUMBS ---
const Breadcrumbs: React.FC<{ category: string; title: string; onNavigate: (path: string) => void }> = ({ category, title, onNavigate }) => {
  const parts = category.split('/').filter(p => p);
  return (
    <nav className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs font-medium mb-4 md:mb-6 overflow-x-auto no-scrollbar py-1">
      <button onClick={() => onNavigate('')} className="text-gray-500 hover:text-violet-500 transition-colors flex items-center gap-1 md:gap-1.5 whitespace-nowrap">
        <Book size={12} className="md:w-3.5 md:h-3.5" />
        <span>Wiki</span>
      </button>
      {parts.map((part, i) => {
        const cumulativePath = parts.slice(0, i + 1).join('/');
        return (
          <React.Fragment key={i}>
            <ChevronRight size={10} className="text-gray-400 shrink-0" />
            <button 
              onClick={() => onNavigate(cumulativePath)}
              className="text-gray-500 hover:text-violet-500 transition-colors whitespace-nowrap hover:underline underline-offset-4 decoration-violet-500/30"
            >
              {part}
            </button>
          </React.Fragment>
        );
      })}
      <ChevronRight size={10} className="text-gray-400 shrink-0" />
      <span className="text-violet-600 dark:text-violet-400 font-bold whitespace-nowrap truncate max-w-[120px] md:max-w-none">{title}</span>
    </nav>
  );
};

// --- CALLOUTS ---
const Callout = ({ type, title, children }: { type: string; title?: string; children: React.ReactNode }) => {
  const config: Record<string, { icon: any; color: string; bg: string; border: string; label: string }> = {
    info: { icon: Brain, color: 'text-blue-500', bg: 'bg-blue-500/5', border: 'border-blue-500/20', label: 'Info' },
    tip: { icon: Sparkles, color: 'text-green-500', bg: 'bg-green-500/5', border: 'border-green-500/20', label: 'Astuce' },
    warning: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/5', border: 'border-amber-500/20', label: 'Attention' },
    danger: { icon: X, color: 'text-red-500', bg: 'bg-red-500/5', border: 'border-red-500/20', label: 'Danger' },
    note: { icon: FileText, color: 'text-violet-500', bg: 'bg-violet-500/5', border: 'border-violet-500/20', label: 'Note' },
  };

  const style = config[type.toLowerCase()] || config.note;
  const Icon = style.icon;

  return (
    <div className={`my-4 sm:my-6 rounded-xl border-l-4 ${style.border} ${style.bg} overflow-hidden shadow-sm`}>
      <div className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 border-b border-white/5 font-bold uppercase tracking-wider text-[9px] sm:text-[10px] ${style.color}`}>
        <Icon size={14} />
        <span>{title || style.label}</span>
      </div>
      <div className="px-3 sm:px-4 py-2 sm:py-3 prose-p:my-0 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
        {children}
      </div>
    </div>
  );
};

// --- CODE BLOCK ---
const CodeBlock = ({ children, className, ...props }: any) => {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : null;
  const content = String(children).replace(/\n$/, '');
  const handleCopy = async () => { await navigator.clipboard.writeText(content); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  if (!match) return <code className="bg-gray-100 dark:bg-[#1a1a20] text-violet-700 dark:text-violet-200 px-1.5 py-0.5 rounded font-mono text-[13px] sm:text-sm border border-gray-200 dark:border-white/10 shadow-sm" {...props}>{children}</code>;

  return (
    <div className="relative group my-6 sm:my-8 rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 bg-[#0f0f13] shadow-xl">
      <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 bg-[#1a1a20] border-b border-white/5">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500/20"></div><div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20"></div><div className="w-2.5 h-2.5 rounded-full bg-green-500/20"></div></div>
          <span className="text-[10px] text-gray-500 font-mono ml-1 sm:ml-2 uppercase tracking-widest opacity-70">{language}</span>
        </div>
        <button onClick={handleCopy} className="flex items-center gap-1.5 text-[10px] sm:text-xs text-gray-500 hover:text-white transition-colors px-2 py-1 rounded hover:bg-white/5">{copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}</button>
      </div>
      <div className="p-3 sm:p-5 overflow-x-auto custom-scrollbar bg-black/20">
        <code className={`font-mono text-[13px] sm:text-sm text-gray-300 leading-relaxed ${className}`} {...props}>{children}</code>
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
                  <div className="flex items-center justify-between flex-1 min-w-0 pr-1">
                    <span className={`text-xs font-bold uppercase tracking-wider truncate transition-colors ${isFolderOpen ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>{name}</span>
                    <span className="text-[10px] font-mono text-gray-400 dark:text-gray-500 bg-gray-200/50 dark:bg-white/5 px-1.5 py-0.5 rounded ml-2">{node.count}</span>
                  </div>
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
const WikiWelcome: React.FC<{ 
  pages: WikiPageType[]; 
  onShowMasonry: () => void;
  onSelect: (page: WikiPageType) => void;
}> = ({ pages, onShowMasonry, onSelect }) => {
  const totalWords = pages.reduce((acc, p) => acc + (p.content?.split(/\s+/).length || 0), 0);
  const lastUpdated = [...pages].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()).slice(0, 5);

  const stats = [
    { label: "Notes", value: pages.length, icon: Database, color: "violet" },
    { label: "Mots", value: `${(totalWords / 1000).toFixed(1)}k`, icon: FileText, color: "blue" },
  ];

  return (
    <div className="flex flex-col items-center justify-start py-8 px-4 md:p-12 max-w-5xl mx-auto animate-in fade-in zoom-in duration-500 w-full overflow-y-auto custom-scrollbar">
      <div className="text-center mb-8 md:mb-10 relative">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-300 text-xs font-medium mb-4 md:mb-6 shadow-sm">
          <Brain className="w-3.5 h-3.5" /><span>Second Brain v2.5</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4 md:mb-6 tracking-tight">Hacking <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400">Bowl of Rice</span></h2>
        <p className="text-gray-600 dark:text-gray-400 text-base md:text-xl max-w-2xl mx-auto leading-relaxed mb-6 md:mb-8">
          Mon environnement de travail partagé avec la communauté. Une démarche professionnelle pour diffuser mes connaissances, sans prétention.
        </p>
        
        <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4 mb-10 md:mb-12">
          <button 
            onClick={onShowMasonry}
            className="px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-violet-500/25 active:scale-95 flex items-center justify-center gap-2"
          >
            <Layers size={18} />
            Tout Parcourir
          </button>
          <div className="w-full sm:w-auto"><WikiTip context="global" /></div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full max-w-2xl mb-12 md:mb-16">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-[#13131a]/50 border border-gray-200 dark:border-white/5 rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-center gap-2 sm:gap-3 shadow-sm group hover:border-violet-500/30 transition-all duration-300">
            <div className={`p-2 sm:p-3 rounded-xl bg-violet-500/10 text-violet-500 group-hover:scale-110 transition-transform`}>
              <stat.icon size={20} className="sm:w-6 sm:h-6" />
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">{stat.value}</div>
              <div className="text-[9px] sm:text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-0.5 sm:mt-1">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="w-full max-w-3xl text-left">
        <h3 className="text-xs sm:text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 md:mb-6 flex items-center gap-2">
          <Activity size={16} className="text-violet-500" />
          Mises à jour récentes
        </h3>
        <div className="space-y-2 md:space-y-3">
          {lastUpdated.map(page => (
            <button
              key={page.id}
              onClick={() => onSelect(page)}
              className="w-full text-left p-3 md:p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:border-violet-500/50 hover:bg-white dark:hover:bg-white/10 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
                <div className="p-1.5 md:p-2 rounded-lg bg-white dark:bg-[#0a0a0f] border border-gray-200 dark:border-white/10 group-hover:text-violet-500 transition-colors shrink-0">
                  <FileText size={14} className="md:w-4 md:h-4" />
                </div>
                <div className="truncate">
                  <div className="text-xs md:text-sm font-bold text-gray-900 dark:text-white truncate">{page.title}</div>
                  <div className="text-[9px] md:text-[10px] text-gray-500 truncate uppercase tracking-wider">{page.category}</div>
                </div>
              </div>
              <div className="text-[9px] md:text-[10px] text-gray-400 font-mono whitespace-nowrap ml-2">
                {new Date(page.updated_at).toLocaleDateString('fr-FR')}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- WIKI MASONRY ---
const WikiMasonry: React.FC<{ 
  pages: WikiPageType[]; 
  onSelect: (page: WikiPageType) => void;
  onClose: () => void;
}> = ({ pages, onSelect, onClose }) => {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white/50 dark:bg-[#0a0a0f]/50 backdrop-blur-3xl">
      <div className="p-6 border-b border-gray-200 dark:border-white/5 flex items-center justify-between sticky top-0 z-20 bg-inherit backdrop-blur-md">
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
            <Layers className="text-violet-500" />
            Bibliothèque Complète
          </h2>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">{pages.length} Notes Indexées</p>
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 custom-scrollbar">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {pages.map(page => (
            <motion.button
              key={page.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              onClick={() => onSelect(page)}
              className="group text-left p-4 sm:p-6 rounded-2xl bg-white dark:bg-[#13131a]/80 border border-gray-200 dark:border-white/5 hover:border-violet-500/50 hover:shadow-2xl hover:shadow-violet-500/10 transition-all flex flex-col gap-3 sm:gap-4 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-0 group-hover:h-full bg-violet-600 transition-all duration-300" />
              
              <div className="flex items-center justify-between">
                <div className="p-1.5 sm:p-2 rounded-lg bg-gray-50 dark:bg-black/20 text-gray-400 group-hover:text-violet-500 transition-colors shrink-0">
                  <FileText size={16} className="sm:w-4.5 sm:h-4.5" />
                </div>
                <div className="text-[9px] sm:text-[10px] font-mono text-gray-400 uppercase tracking-tighter">
                  {new Date(page.updated_at).toLocaleDateString('fr-FR')}
                </div>
              </div>

              <div className="min-w-0">
                <h4 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white group-hover:text-violet-500 transition-colors line-clamp-2 leading-snug">
                  {page.title}
                </h4>
                <div className="text-[9px] sm:text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1.5 sm:mt-2 truncate">
                  {page.category}
                </div>
              </div>

              <div className="mt-auto pt-3 sm:pt-4 border-t border-gray-100 dark:border-white/5 flex flex-wrap gap-1 md:gap-1.5">
                {page.tags?.slice(0, 3).map(tag => (
                  <span key={tag} className="text-[8px] sm:text-[9px] bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded text-gray-500">#{tag}</span>
                ))}
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- BACKLINKS ---
const Backlinks: React.FC<{ 
  currentPage: WikiPageType; 
  allPages: WikiPageType[]; 
  onSelect: (page: WikiPageType) => void 
}> = ({ currentPage, allPages, onSelect }) => {
  const links = allPages.filter(p => 
    p.id !== currentPage.id && 
    (p.content?.includes(currentPage.slug) || p.content?.includes(currentPage.title))
  );

  if (links.length === 0) return null;

  return (
    <div className="mt-12 md:mt-16 pt-6 md:pt-8 border-t border-gray-200 dark:border-white/5 text-left">
      <h3 className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 md:mb-6 flex items-center gap-2">
        <CornerDownRight size={12} className="md:w-3.5 md:h-3.5" />
        Backlinks ({links.length})
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
        {links.map(link => (
          <button
            key={link.id}
            onClick={() => onSelect(link)}
            className="text-left p-3 md:p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:border-violet-500/30 transition-all group"
          >
            <div className="text-xs md:text-sm font-bold text-gray-900 dark:text-white group-hover:text-violet-500 transition-colors truncate">
              {link.title}
            </div>
            <div className="text-[9px] md:text-[10px] text-gray-500 mt-0.5 md:mt-1 truncate uppercase tracking-wider">{link.category}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

// --- PAGE PRINCIPALE ---
export const WikiPage: React.FC = () => {
  const { pages = [], isLoading, error: fetchError } = useWikiPages();
  const [selectedPage, setSelectedPage] = useState<WikiPageType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMasonryView, setIsMasonryView] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [tree, setTree] = useState<Record<string, TreeNode>>({});
  const [toc, setToc] = useState<TocItem[]>([]);

  // --- LOGIQUE DE RECHERCHE AMÉLIORÉE ---
  const calculateScore = (page: WikiPageType, query: string) => {
    if (!query) return 1;
    const q = query.toLowerCase();
    let score = 0;
    if (page.title?.toLowerCase().includes(q)) {
      score += 100;
      if (page.title.toLowerCase() === q) score += 200;
    }
    if (page.category?.toLowerCase().includes(q)) score += 50;
    if (page.tags?.some(t => t.toLowerCase().includes(q))) score += 70;
    const content = page.content?.toLowerCase() || '';
    const occurrences = content.split(q).length - 1;
    score += occurrences * 5;
    return score;
  };

  const filteredPages = React.useMemo(() => {
    return pages
      .map(p => ({ page: p, score: calculateScore(p, searchQuery) }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.page);
  }, [pages, searchQuery]);

  // --- MARKDOWN COMPONENTS ---
  const MarkdownComponents = {
    code: CodeBlock,
    h2: ({ children }: any) => <h2 id={String(children).toLowerCase().replace(/[^\w]+/g, '-')}>{children}</h2>,
    img: ({ src, alt }: any) => (
      <div className="my-6 sm:my-8 rounded-xl sm:rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 shadow-lg group cursor-zoom-in" onClick={() => setSelectedImage(src)}>
        <img src={src} alt={alt} className="w-full hover:scale-[1.02] transition-transform duration-500" />
        {alt && <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-50 dark:bg-white/5 text-[9px] sm:text-[10px] text-gray-500 font-medium italic border-t border-gray-200 dark:border-white/10 text-center">{alt}</div>}
      </div>
    ),
    blockquote: ({ children }: any) => {
      const content = React.Children.toArray(children);
      const firstChild = content[0] as any;
      if (firstChild && firstChild.props && firstChild.props.children) {
        const firstLine = String(firstChild.props.children[0] || '');
        const match = firstLine.match(/^\[!(\w+)\]\s*(.*)/);
        if (match) {
          const type = match[1];
          const title = match[2];
          const remainingChildren = [{ ...firstChild, props: { ...firstChild.props, children: [firstChild.props.children.slice(1)] } }, ...content.slice(1)];
          return <Callout type={type} title={title}>{remainingChildren}</Callout>;
        }
      }
      return <blockquote className="border-l-4 border-violet-500 bg-violet-500/5 px-4 py-1 my-4 italic text-gray-400">{children}</blockquote>;
    }
  };

  useEffect(() => { if (window.innerWidth < 1024) setIsSidebarOpen(false); }, []);
  useEffect(() => {
    const newTree: Record<string, TreeNode> = {};
    filteredPages.forEach(page => {
      const parts = page.category.split('/').filter(p => p); 
      let currentLevel = newTree;
      parts.forEach((part, index) => {
        if (!currentLevel[part]) {
          currentLevel[part] = { name: part, fullPath: parts.slice(0, index + 1).join('/'), children: {}, isOpen: false, count: 0 };
        }
        currentLevel[part].count++;
        if (index === parts.length - 1) {
          currentLevel[part].children[page.title] = { name: page.title, fullPath: page.slug, children: {}, page: page, isOpen: false, count: 1 };
        }
        currentLevel = currentLevel[part].children;
      });
    });
    setTree(newTree);
  }, [filteredPages]);

  useEffect(() => { if (selectedPage?.content) setToc(extractHeadings(selectedPage.content)); else setToc([]); }, [selectedPage]);

  return (
    <>
      <SEOHead title="Wiki & Knowledge Base" description="Base de connaissances" />
      
      <div className="min-h-screen bg-background flex pt-20 md:pt-24 pb-4 md:pb-6 px-2 md:px-8 gap-0 md:gap-6 overflow-hidden transition-colors duration-300">
        
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
          className="lg:hidden fixed bottom-6 right-6 z-50 bg-violet-600 p-4 rounded-full shadow-lg text-white hover:bg-violet-500 transition-all active:scale-95 flex items-center justify-center"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* SIDEBAR */}
        <aside className={`fixed inset-y-0 left-0 z-40 w-full sm:w-80 lg:relative lg:inset-auto lg:w-80 lg:block bg-white dark:bg-[#0a0a0f] lg:bg-surface/90 lg:dark:bg-[#13131a]/80 backdrop-blur-xl border-r lg:border border-gray-200 dark:border-white/10 lg:rounded-2xl flex flex-col transition-all duration-500 shadow-2xl ${isSidebarOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 lg:translate-x-0 lg:opacity-100 lg:w-80'}`}>
          <div className="p-6 border-b border-gray-100 dark:border-white/5 pt-24 lg:pt-6">
            <div className="flex items-center gap-3 mb-6 cursor-pointer" onClick={() => { setSelectedPage(null); setIsMasonryView(false); setSearchQuery(''); }}>
              <div className="p-2.5 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl shadow-lg"><Book className="w-5 h-5 text-white" /></div>
              <span className="font-bold text-xl text-gray-900 dark:text-white tracking-tight">Hacking Bowl of Rice</span>
            </div>
            <div className="relative group">
              <div className="relative flex items-center bg-gray-50 dark:bg-[#0a0a0f] border border-gray-200 dark:border-white/10 rounded-xl focus-within:border-violet-500/50 transition-colors">
                <Search className="ml-3 w-4 h-4 text-gray-400 group-focus-within:text-violet-500" />
                <input type="text" placeholder="Explorer..." className="w-full bg-transparent py-3 pl-3 pr-4 text-sm text-gray-900 dark:text-gray-200 focus:outline-none placeholder-gray-500 dark:placeholder-gray-600 font-medium" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {isLoading ? <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin"></div></div> : Object.keys(tree).length === 0 ? <div className="text-center py-12 text-gray-500"><p>Aucune donnée.</p></div> : <FileTree nodes={tree} onSelect={(page) => { setSelectedPage(page); setIsMasonryView(false); if (window.innerWidth < 1024) setIsSidebarOpen(false); }} selectedId={selectedPage?.id} />}
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 bg-white dark:bg-[#0a0a0f] lg:bg-surface/50 lg:dark:bg-[#13131a]/40 lg:backdrop-blur-md border-x lg:border border-gray-200 dark:border-white/5 lg:rounded-2xl overflow-hidden relative shadow-xl flex flex-col">
          {selectedPage ? (
            <div className="flex-1 overflow-y-auto custom-scrollbar p-5 sm:p-8 md:p-12 scroll-smooth relative">
              <motion.div key={selectedPage.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="max-w-4xl mx-auto relative z-10">
                
                <Breadcrumbs 
                  category={selectedPage.category} 
                  title={selectedPage.title} 
                  onNavigate={(path) => { 
                    setSelectedPage(null);
                    setSearchQuery(path);
                    if (path !== '') setIsMasonryView(true);
                    else setIsMasonryView(false);
                  }} 
                />

                <div className="mb-8 md:mb-10 pb-6 md:pb-8 border-b border-gray-200 dark:border-white/5 text-left">
                  <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 md:mb-6 tracking-tight leading-tight uppercase">{selectedPage.title}</h1>
                  <div className="flex flex-wrap items-center gap-2 md:gap-3">
                    <div className="flex items-center gap-2 text-[10px] md:text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-[#1a1a20] border border-gray-200 dark:border-white/10 px-2.5 py-1 rounded-full"><Calendar className="w-3 h-3" /><span>Mis à jour le {new Date(selectedPage.updated_at).toLocaleDateString('fr-FR')}</span></div>
                    <div className="flex items-center gap-2 text-[10px] md:text-xs text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20 px-2.5 py-1 rounded-full"><Activity className="w-3 h-3" /><span>{getReadingTime(selectedPage.content)} min de lecture</span></div>
                    {selectedPage.tags?.map(tag => <span key={tag} className="flex items-center gap-1 text-[10px] md:text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-white/5 px-2.5 py-1 rounded-full border border-gray-200 dark:border-white/10"><Hash className="w-3 h-3" /> {tag}</span>)}
                  </div>
                </div>

                <div className="min-h-[400px] text-left">
                  <div className="prose max-w-none prose-sm sm:prose-base prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white prose-h2:text-xl sm:prose-h2:text-2xl prose-h2:mt-10 sm:prose-h2:mt-12 prose-h2:pb-2 prose-h2:border-b prose-h2:border-gray-200 dark:prose-h2:border-white/10 prose-h3:text-lg sm:prose-h3:text-xl prose-h3:text-violet-700 dark:prose-h3:text-violet-200 prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed prose-strong:text-gray-900 dark:prose-strong:text-white prose-a:text-violet-600 dark:prose-a:text-violet-400 prose-li:text-gray-700 dark:prose-li:text-gray-300 prose-blockquote:border-violet-500 prose-blockquote:bg-violet-50 dark:prose-blockquote:bg-violet-500/5 prose-blockquote:text-gray-700 dark:prose-blockquote:text-gray-400 prose-img:rounded-xl">
                    <ReactMarkdown rehypePlugins={[rehypeRaw]} components={MarkdownComponents as any}>{selectedPage.content}</ReactMarkdown>
                  </div>
                </div>
                <div className="mt-16 pb-12 border-t border-gray-200 dark:border-white/5 pt-8">
                  <WikiTip pageId={selectedPage.id} context="article" />
                  <Backlinks currentPage={selectedPage} allPages={pages} onSelect={setSelectedPage} />
                </div>
              </motion.div>
            </div>
          ) : isMasonryView ? (
            <WikiMasonry pages={filteredPages} onSelect={(p) => { setSelectedPage(p); setIsMasonryView(false); }} onClose={() => setIsMasonryView(false)} />
          ) : (
            <WikiWelcome pages={pages} onShowMasonry={() => setIsMasonryView(true)} onSelect={setSelectedPage} />
          )}
          
          {selectedPage && toc.length > 0 && (
            <aside className="hidden xl:block w-72 border-l border-gray-200 dark:border-white/5 bg-gray-50/50 dark:bg-[#13131a]/30 p-8 overflow-y-auto custom-scrollbar">
              <div className="sticky top-6 text-left">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2"><List size={14} />Sommaire</h4>
                <div className="space-y-1 relative"><div className="absolute left-[3px] top-2 bottom-2 w-px bg-gray-300 dark:bg-white/5"></div>{toc.map((item) => (<a key={item.id} href={`#${item.id}`} className={`block text-sm py-1.5 pl-4 border-l-2 transition-all duration-200 hover:text-violet-600 dark:hover:text-violet-300 ${item.level === 3 ? 'ml-3 text-gray-500 dark:text-gray-500 border-transparent text-xs' : 'text-gray-600 dark:text-gray-400 border-transparent'}`} onClick={(e) => {e.preventDefault();document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });}}>{item.text}</a>))}</div>
              </div>
            </aside>
          )}
        </main>
      </div>

      <AnimatePresence>
        {selectedImage && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedImage(null)} className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 md:p-12 cursor-zoom-out">
            <motion.img initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} src={selectedImage} className="max-w-full max-h-full rounded-xl shadow-2xl" alt="Zoom" />
            <button onClick={() => setSelectedImage(null)} className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors"><X size={32} /></button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
