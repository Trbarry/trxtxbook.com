import React, { useEffect, useState } from 'react';
import { List } from 'lucide-react';
import { motion } from 'framer-motion';

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

  return (
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

          <nav className="space-y-1 relative">
            {items.map((item) => {
              const isActive = activeId === item.id;
              const isMainTitle = item.level === 2;

              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    const element = document.getElementById(item.id);
                    if (element) {
                      const offset = 100; // Adjust for sticky headers
                      const elementPosition = element.getBoundingClientRect().top;
                      const offsetPosition = elementPosition + window.pageYOffset - offset;
                      window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                      });
                    }
                  }}
                  className={`
                    group/item block transition-all duration-300 relative py-1.5
                    ${isMainTitle 
                      ? 'text-[11px] font-bold uppercase tracking-wider mb-1 mt-3 first:mt-0' 
                      : 'text-xs font-medium pl-5 text-gray-500'
                    }
                    ${isActive 
                      ? 'text-violet-400 translate-x-1' 
                      : isMainTitle 
                        ? 'text-gray-300 hover:text-white hover:translate-x-1' 
                        : 'text-gray-500 hover:text-gray-200 hover:translate-x-1'
                    }
                  `}
                >
                  {/* Subtle dot or line for active state */}
                  {!isMainTitle && (
                    <span className={`
                      absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-[1px] bg-violet-500 transition-all duration-300
                      ${isActive ? 'opacity-100 scale-100 w-3' : 'opacity-0 scale-0 group-hover/item:opacity-50 group-hover/item:scale-100'}
                    `} />
                  )}
                  
                  <span className={`
                    transition-all duration-300
                    ${isActive ? 'drop-shadow-[0_0_8px_rgba(167,139,250,0.4)]' : ''}
                  `}>
                    {item.text}
                  </span>
                </a>
              );
            })}
          </nav>

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
  );
};
