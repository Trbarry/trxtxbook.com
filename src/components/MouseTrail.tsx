import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  alpha: number;
  dx: number;
  dy: number;
  isBlack: boolean;
  rotation: number;
  spin: number;
  color: string;
  glowSize: number;
}

export const MouseTrail: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const frameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Configuration optimisée pour la haute résolution
    const handleResize = () => {
      const scale = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * scale;
      canvas.height = window.innerHeight * scale;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(scale, scale);
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // Gestion optimisée du mouvement de la souris
    let lastTime = 0;
    const throttleDelay = 1000 / 60; // 60fps pour une meilleure performance

    const handleMouseMove = (e: MouseEvent) => {
      const currentTime = Date.now();
      if (currentTime - lastTime < throttleDelay) return;
      lastTime = currentTime;

      prevMouseRef.current = { ...mouseRef.current };
      mouseRef.current = { x: e.clientX, y: e.clientY };

      const dx = mouseRef.current.x - prevMouseRef.current.x;
      const dy = mouseRef.current.y - prevMouseRef.current.y;
      const speed = Math.sqrt(dx * dx + dy * dy);

      if (speed > 1) {
        // Création de particules avec une meilleure distribution
        for (let i = 0; i < 3; i++) {
          const colors = ['rgba(139, 92, 246, ', 'rgba(167, 139, 250, ', 'rgba(196, 181, 253, '];
          particlesRef.current.push({
            x: mouseRef.current.x - dx * (i / 3),
            y: mouseRef.current.y - dy * (i / 3),
            size: Math.random() * 3 + 2,
            alpha: 1,
            dx: (dx / speed) * (Math.random() * 2 - 1) * 0.3,
            dy: (dy / speed) * (Math.random() * 2 - 1) * 0.3,
            isBlack: Math.random() > 0.8,
            rotation: Math.random() * Math.PI * 2,
            spin: (Math.random() * 2 - 1) * 0.1,
            color: colors[Math.floor(Math.random() * colors.length)],
            glowSize: Math.random() * 20 + 10
          });
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'screen';

      particlesRef.current = particlesRef.current.filter(particle => {
        particle.x += particle.dx;
        particle.y += particle.dy;
        particle.alpha *= 0.96;
        particle.rotation += particle.spin;
        particle.size *= 0.97;

        // Effet de glow amélioré
        const drawGlow = (radius: number, alpha: number) => {
          const gradient = ctx.createRadialGradient(
            particle.x, particle.y, 0,
            particle.x, particle.y, radius
          );

          const color = particle.isBlack 
            ? `rgba(10, 10, 15, ${alpha * particle.alpha})`
            : `${particle.color}${alpha * particle.alpha})`;
          
          gradient.addColorStop(0, color);
          gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

          ctx.beginPath();
          ctx.arc(particle.x, particle.y, radius, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();
        };

        // Effets de glow multicouches
        drawGlow(particle.glowSize * 1.5, 0.1);
        drawGlow(particle.glowSize, 0.2);
        drawGlow(particle.size * 2, 0.3);

        // Particule centrale avec rotation
        ctx.save();
        ctx.translate(particle.x, particle.y);
        ctx.rotate(particle.rotation);
        
        // Forme géométrique aléatoire
        if (Math.random() > 0.5) {
          ctx.beginPath();
          ctx.rect(-particle.size * 0.4, -particle.size * 0.4, 
                   particle.size * 0.8, particle.size * 0.8);
        } else {
          ctx.beginPath();
          ctx.moveTo(0, -particle.size * 0.4);
          ctx.lineTo(particle.size * 0.4, particle.size * 0.4);
          ctx.lineTo(-particle.size * 0.4, particle.size * 0.4);
          ctx.closePath();
        }

        ctx.fillStyle = particle.isBlack
          ? `rgba(10, 10, 15, ${particle.alpha})`
          : `${particle.color}${particle.alpha})`;
        ctx.fill();
        ctx.restore();

        return particle.alpha > 0.01 && particle.size > 0.1;
      });

      frameRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove);
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9999]"
      style={{ 
        opacity: 0.8,
        mixBlendMode: 'screen'
      }}
    />
  );
};