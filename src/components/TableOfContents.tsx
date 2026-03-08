import React, { useEffect, useState } from 'react';
import { List, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  items: TocItem[];
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({ items }) => {
  const [activeId, setActiveId] = useState<string>('');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const observerOptions = {
      rootMargin: '-10% 0% -70% 0%',
      threshold: 0
    };

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      // Find the first entry that is intersecting
      const visibleEntry = entries.find(entry => entry.isIntersecting);
      if (visibleEntry) {
        setActiveId(visibleEntry.target.id);
      }
    };

    const observer = new IntersectionObserver(handleIntersection, observerOptions);

    items.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  const scrollToItem = (id: string, closeMobile = false) => {
    if (closeMobile) setMobileOpen(false);
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        const offset = closeMobile ? 120 : 100;
        const top = element.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    }, closeMobile ? 250 : 0);
  };

  const TocLinks = ({ onClickItem }: { onClickItem?: (id: string) => void }) => (
    <nav className="space-y-1 relative">
      {items.map((item) => {
        const isActive = activeId === item.id;
        const isMainTitle = item.level === 2;
        return (
          <a
            key={item.id}
            href={`#${item.id}`}
            onClick={(e) => { e.preventDefault(); onClickItem ? onClickItem(item.id) : scrollToItem(item.id); }}
            className={`
              group/item block transition-all duration-300 relative py-1.5
              ${isMainTitle ? 'text-[11px] font-bold uppercase tracking-wider mb-1 mt-3 first:mt-0' : 'text-xs font-medium pl-5 text-gray-500'}
              ${isActive ? 'text-violet-400 translate-x-1' : isMainTitle ? 'text-gray-300 hover:text-white hover:translate-x-1' : 'text-gray-500 hover:text-gray-200 hover:translate-x-1'}
            `}
          >
            {!isMainTitle && (
              <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-[1px] bg-violet-500 transition-all duration-300 ${isActive ? 'opacity-100 scale-100 w-3' : 'opacity-0 scale-0 group-hover/item:opacity-50 group-hover/item:scale-100'}`} />
            )}
            <span className={`transition-all duration-300 ${isActive ? 'drop-shadow-[0_0_8px_rgba(167,139,250,0.4)]' : ''}`}>{item.text}</span>
          </a>
        );
      })}
    </nav>
  );

  return (
    <>
    <aside className="hidden lg:block w-64 xl:w-72 flex-shrink-0">
      <div className="sticky top-24 self-start max-h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar pr-4 pb-8">
        <div className="relative p-6 rounded-2xl bg-[#0a0a0f]/60 backdrop-blur-md border border-white/5 shadow-2xl overflow-hidden group">
          {/* Violet accent border on the left */}
          <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-violet-600/20 via-violet-600 to-violet-600/20" />
          
          <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-500 shadow-[0_0_15px_rgba(139,92,246,0.1)]">
                  <List size={16} />
              </div>
              <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.25em]">
                  Sommaire
              </h4>
          </div>

          <TocLinks />

          {/* Decorative scanner line effect */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
              <motion.div 
                animate={{ y: [0, 300, 0] }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="w-full h-[1px] bg-gradient-to-r from-transparent via-violet-500 to-transparent shadow-[0_0_15px_rgba(139,92,246,0.5)]" 
              />
          </div>
          
          {/* Tech accents */}
          <div className="absolute top-0 right-0 p-1 opacity-10">
              <div className="w-6 h-6 border-t border-r border-violet-500" />
          </div>
          <div className="absolute bottom-0 right-0 p-1 opacity-10">
              <div className="w-6 h-6 border-b border-r border-violet-500" />
          </div>
        </div>
      </div>
    </aside>

    {/* Mobile FAB */}
    <button
      onClick={() => setMobileOpen(true)}
      className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-full shadow-xl shadow-violet-500/30 active:scale-95 transition-all"
    >
      <List size={16} />
      <span className="text-sm font-bold">Sommaire</span>
    </button>

    {/* Mobile Bottom Sheet */}
    <AnimatePresence>
      {mobileOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="lg:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0f0f14] border-t border-white/10 rounded-t-3xl max-h-[70vh] flex flex-col"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 bg-white/20 rounded-full" />
            </div>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-white/5 shrink-0">
              <div className="flex items-center gap-2 text-violet-400">
                <div className="p-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20">
                  <List size={14} />
                </div>
                <span className="text-xs font-black uppercase tracking-[0.2em]">Sommaire</span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="p-1.5 text-gray-500 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>
            {/* TOC */}
            <div className="overflow-y-auto px-6 py-4 pb-10 custom-scrollbar">
              <TocLinks onClickItem={(id) => scrollToItem(id, true)} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
    </>
  );
};
