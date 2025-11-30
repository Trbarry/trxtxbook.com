import React, { useEffect, useRef, useState } from 'react';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;      // Délai en ms avant l'apparition (pour effet cascade)
  threshold?: number;  // Pourcentage de visibilité requis (0.1 = 10%)
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({ 
  children, 
  className = '', 
  delay = 0,
  threshold = 0.15 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // On déclenche l'apparition avec le délai demandé
            setTimeout(() => {
              setIsVisible(true);
            }, delay);
            
            // Performance : Une fois visible, on arrête d'observer cet élément
            if (elementRef.current) {
              observer.unobserve(elementRef.current);
            }
          }
        });
      },
      {
        threshold: threshold,
        rootMargin: '0px 0px -50px 0px' // Marge négative pour déclencher un peu avant le bas de l'écran
      }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [delay, threshold]);

  return (
    <div 
      ref={elementRef}
      className={`transform transition-all duration-1000 cubic-bezier(0.17, 0.55, 0.55, 1) ${className}
        ${isVisible 
          ? 'opacity-100 translate-y-0 translate-x-0 blur-0' 
          : 'opacity-0 translate-y-12 blur-sm'}`}
    >
      {children}
    </div>
  );
};