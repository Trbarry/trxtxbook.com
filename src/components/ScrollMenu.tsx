// ... imports

export const ScrollMenu: React.FC<ScrollMenuProps> = ({ activeSection, setActiveSection }) => {
  // ... state

  useEffect(() => {
    let ticking = false; // Variable pour limiter les appels

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          // Point de déclenchement
          const triggerPoint = window.innerHeight / 3;

          for (const item of menuItems) {
            const element = document.getElementById(item.id);
            if (element) {
              const rect = element.getBoundingClientRect();
              if (rect.top <= triggerPoint && rect.bottom > triggerPoint) {
                // On met à jour seulement si ça change pour éviter les re-renders inutiles
                setActiveSection((prev) => (prev !== item.id ? item.id : prev));
                break; 
              }
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [setActiveSection]); // On retire menuItems des dépendances car c'est une constante

  // ... reste du composant