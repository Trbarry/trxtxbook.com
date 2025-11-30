import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  colorKey: 'violet' | 'blue' | 'cyan';
}

export const MouseTrail: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const lastMouseRef = useRef({ x: 0, y: 0 });
  
  // Cache pour les sprites pré-rendus (Performance +++)
  const spritesRef = useRef<Record<string, HTMLCanvasElement>>({});

  // Configuration
  const PARTICLE_LIFETIME = 40; // Durée de vie en frames
  const SPAWN_THRESHOLD = 5;    // Distance min pour créer une particule (px)

  // Génération des sprites au démarrage (Une seule fois)
  const generateSprite = (color: string, size: number) => {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    const center = size / 2;
    const gradient = ctx.createRadialGradient(center, center, 0, center, center, center);
    
    // Cœur brillant
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)'); 
    // Couleur principale
    gradient.addColorStop(0.2, color.replace(')', ', 0.8)')); 
    // Fondu vers transparent
    gradient.addColorStop(0.6, color.replace(')', ', 0.1)')); 
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    return canvas;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true }); // alpha: true est important pour la transparence
    if (!ctx) return;

    // 1. Pré-calcul des Sprites (Gros gain de perf)
    spritesRef.current = {
      violet: generateSprite('rgba(139, 92, 246)', 64), // Violet-500
      blue: generateSprite('rgba(59, 130, 246)', 64),   // Blue-500
      cyan: generateSprite('rgba(6, 182, 212)', 64),    // Cyan-500
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    // 2. Boucle d'animation intelligente
    const animate = () => {
      // Si plus de particules, on arrête la boucle pour économiser la batterie
      if (particlesRef.current.length === 0) {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
          animationRef.current = null;
        }
        // On nettoie une dernière fois
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // 'lighter' ou 'screen' donne cet effet néon quand les particules se superposent
      ctx.globalCompositeOperation = 'lighter'; 

      // Mise à jour et dessin
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        
        p.life--;
        p.x += p.vx;
        p.y += p.vy;
        p.size *= 0.96; // Réduction progressive

        // Si morte, on supprime
        if (p.life <= 0 || p.size < 0.5) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        // Dessin optimisé via drawImage (bien plus rapide que createRadialGradient)
        const opacity = p.life / p.maxLife;
        ctx.globalAlpha = opacity;
        
        const sprite = spritesRef.current[p.colorKey];
        if (sprite) {
          // On dessine l'image pré-calculée centrée sur la position de la particule
          const drawSize = p.size * 4; // Facteur d'échelle pour le halo
          ctx.drawImage(
            sprite, 
            p.x - drawSize / 2, 
            p.y - drawSize / 2, 
            drawSize, 
            drawSize
          );
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      mouseRef.current = { x: clientX, y: clientY };

      // Calcul de la distance parcourue depuis le dernier point
      const dx = clientX - lastMouseRef.current.x;
      const dy = clientY - lastMouseRef.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Interpolation : Si la souris bouge vite, on ajoute des particules entre les points
      // pour éviter l'effet "pointillés"
      if (distance > SPAWN_THRESHOLD) {
        const steps = Math.min(Math.floor(distance / SPAWN_THRESHOLD), 10); // Max 10 particules par frame pour pas saturer
        
        for (let i = 0; i < steps; i++) {
          const t = i / steps;
          const x = lastMouseRef.current.x + dx * t;
          const y = lastMouseRef.current.y + dy * t;
          
          // Sélection aléatoire de couleur cyber
          const rand = Math.random();
          let colorKey: 'violet' | 'blue' | 'cyan' = 'violet';
          if (rand > 0.6) colorKey = 'blue';
          if (rand > 0.9) colorKey = 'cyan';

          particlesRef.current.push({
            x,
            y,
            vx: (Math.random() - 0.5) * 0.5, // Très léger mouvement aléatoire
            vy: (Math.random() - 0.5) * 0.5,
            size: Math.random() * 4 + 2,     // Taille variable
            life: PARTICLE_LIFETIME,
            maxLife: PARTICLE_LIFETIME,
            colorKey
          });
        }
        
        lastMouseRef.current = { x: clientX, y: clientY };

        // Si la boucle d'animation n'est pas active, on la lance
        if (!animationRef.current) {
          animate();
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Initialisation de la position souris
    lastMouseRef.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9999]"
      style={{ 
        // Pas de CSS mix-blend-mode lourd ici, on gère ça dans le canvas
        opacity: 0.8 
      }}
    />
  );
};