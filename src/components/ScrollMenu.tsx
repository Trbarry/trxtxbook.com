import { useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface ScrollMenuProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const sections = [
  { id: 'home', label: 'Accueil' },
  { id: 'parcours', label: 'Parcours' },
  { id: 'formation', label: 'Formation' },
  { id: 'projects', label: 'Projets' },
  { id: 'writeups', label: 'Write-ups' },
  { id: 'articles', label: 'Articles' },
  { id: 'stats', label: 'Statistiques' },
  { id: 'contact', label: 'Contact' },
];

export function ScrollMenu({ activeSection, setActiveSection }: ScrollMenuProps) {
  useEffect(() => {
    const main = document.getElementById('main-content');
    if (!main) return;

    const visible = new Set<string>();
    const observer = new IntersectionObserver(entries => {
      for (const { target, isIntersecting } of entries) {
        if (isIntersecting) visible.add(target.id);
        else visible.delete(target.id);
      }
      const current = sections.find(({ id }) => visible.has(id));
      if (current) setActiveSection(current.id);
    }, { rootMargin: '-80px 0px 0px' });

    const pending = new Set(sections.map(({ id }) => id));
    const trackSections = () => {
      for (const id of pending) {
        const section = document.getElementById(id);
        if (!section) continue;
        observer.observe(section);
        pending.delete(id);
        if (window.location.hash === `#${id}`) section.scrollIntoView();
      }
      if (!pending.size) mounts.disconnect();
    };
    const mounts = new MutationObserver(trackSections);
    mounts.observe(main, { childList: true, subtree: true });
    trackSections();

    return () => {
      observer.disconnect();
      mounts.disconnect();
    };
  }, [setActiveSection]);

  return (
    <nav aria-label="Sur cette page" className="bg-background px-5 text-sm sm:px-8">
      <div className="mx-auto max-w-6xl lg:px-8">
        <details className="group border-y border-line">
          <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 font-semibold text-text hover:text-accent [&::-webkit-details-marker]:hidden">
            Sur cette page
            <ChevronDown aria-hidden="true" size={16} className="text-accent group-open:rotate-180" />
          </summary>
          <ul className="grid grid-cols-2 gap-x-5 pb-3 sm:flex sm:flex-wrap sm:gap-x-6">
            {sections.map(({ id, label }) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  aria-current={id === activeSection ? 'location' : undefined}
                  className="inline-flex min-h-11 items-center text-muted underline-offset-4 hover:text-accent hover:underline aria-[current=location]:font-semibold aria-[current=location]:text-accent aria-[current=location]:underline"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </details>
      </div>
    </nav>
  );
}
