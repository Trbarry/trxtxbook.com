import React, { useRef, useEffect } from "react";

interface DifficultyBackgroundProps {
  difficulty?: string;
  tags?: string[];
}

interface Particle {
  x: number;
  y: number;
  r: number;
  dx: number;
  dy: number;
  opacity: number;
  color: string;
  life: number;
  maxLife: number;
  type: 'pixel' | 'circle' | 'flame' | 'ash' | 'data' | 'void';
  text?: string;
  rotation?: number;
  rotationSpeed?: number;
}

export const DifficultyBackground: React.FC<DifficultyBackgroundProps> = ({ difficulty = "default", tags = [] }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let particles: Particle[] = [];
    let animationFrameId: number;

    const d = difficulty.toLowerCase();
    const t = tags.map(tag => tag.toLowerCase());
    
    const isEasy = d.includes("easy") || d.includes("facile") || t.includes("easy");
    const isMedium = d.includes("medium") || d.includes("moyen") || t.includes("medium");
    const isHard = d.includes("hard") || d.includes("difficile") || t.includes("hard") || t.includes("fire");
    const isInsane = d.includes("insane") || t.includes("insane");

    // Configuration selon la difficulté
    const config: {
        color: string;
        particleCount: number;
        speedFactor: number;
        type: 'pixel' | 'circle' | 'flame' | 'ash' | 'data' | 'void';
    } = {
      color: "#a855f7", // Default Violet
      particleCount: 60,
      speedFactor: 0.5,
      type: 'circle',
    };

    if (isEasy) {
      config.color = "#10b981"; // Green
      config.particleCount = 100;
      config.speedFactor = 0.4;
      config.type = 'circle';
    } else if (isMedium) {
      config.color = "#f59e0b"; // Orange/Amber
      config.particleCount = 120;
      config.speedFactor = 0.6;
      config.type = 'data';
    } else if (isHard) {
      config.color = "#ef4444"; // Red
      config.particleCount = 180;
      config.speedFactor = 1.0;
      config.type = 'flame';
    } else if (isInsane) {
      config.color = "#8b5cf6"; // Violet
      config.particleCount = 200;
      config.speedFactor = 1.4;
      config.type = 'void';
    }

    const dataChars = "01<>[]{}/\\!@#$%^&*()_+".split("");

    const createParticle = (isInitial = false): Particle => {
      let type = config.type;
      
      // Mélange selon difficulté
      if (isHard && Math.random() > 0.7) {
          type = 'ash';
      }
      if (isInsane && Math.random() > 0.8) {
          type = 'pixel';
      }

      const x = Math.random() * canvas.width;
      let y = isInitial ? Math.random() * canvas.height : (type === 'flame' ? canvas.height + 20 : (type === 'data' ? -20 : Math.random() * canvas.height));
      
      if (!isInitial && (type === 'ash' || type === 'void')) {
          y = Math.random() > 0.5 ? -20 : canvas.height + 20;
      }

      const r = (type === 'pixel' || type === 'ash' || type === 'data') ? Math.random() * 2 + 1 : Math.random() * 3 + 1;
      
      let dx = (Math.random() - 0.5) * config.speedFactor;
      let dy = (Math.random() - 0.5) * config.speedFactor;
      
      if (type === 'flame') {
        dy = -Math.random() * 1.5 - 0.5;
        dx = (Math.random() - 0.5) * 0.3;
      } else if (type === 'data') {
        dy = Math.random() * 1.0 + 0.5;
        dx = 0;
      } else if (type === 'void') {
        dx = (Math.random() - 0.5) * 2.0;
        dy = (Math.random() - 0.5) * 2.0;
      }

      const maxLife = Math.random() * 200 + 100;

      return {
        x,
        y,
        r,
        dx,
        dy,
        opacity: Math.random() * 0.4 + 0.1,
        color: type === 'ash' ? (isHard ? '#ffaa00' : config.color) : config.color,
        life: maxLife,
        maxLife,
        type,
        text: type === 'data' ? dataChars[Math.floor(Math.random() * dataChars.length)] : undefined,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.05,
      };
    };

    const initParticles = () => {
      particles = [];
      for (let i = 0; i < config.particleCount; i++) {
        particles.push(createParticle(true));
      }
    };

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, index) => {
        p.life--;
        if (p.life <= 0) {
          particles[index] = createParticle();
          return;
        }

        const lifeRatio = p.life / p.maxLife;
        const currentOpacity = p.opacity * (lifeRatio > 0.8 ? (1 - lifeRatio) * 5 : lifeRatio);

        ctx.save();
        ctx.translate(p.x, p.y);
        if (p.rotation !== undefined) ctx.rotate(p.rotation);
        
        ctx.beginPath();
        if (p.type === 'pixel' || p.type === 'ash') {
          ctx.rect(-p.r / 2, -p.r / 2, p.r, p.r);
        } else if (p.type === 'data') {
          ctx.font = `${p.r * 8}px monospace`;
          ctx.fillText(p.text || "0", 0, 0);
        } else if (p.type === 'flame') {
          const size = p.r * (1 + (1 - lifeRatio) * 2);
          ctx.arc(0, 0, size, 0, Math.PI * 2);
          
          const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 2);
          gradient.addColorStop(0, p.color);
          gradient.addColorStop(1, 'transparent');
          ctx.fillStyle = gradient;
          ctx.globalAlpha = currentOpacity * 0.4;
          ctx.fill();
          
          ctx.beginPath();
          ctx.arc(0, 0, size * 0.6, 0, Math.PI * 2);
        } else if (p.type === 'void') {
          const size = p.r * (2 + (1 - lifeRatio) * 5);
          ctx.arc(0, 0, size, 0, Math.PI * 2);
          
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 0.5;
          ctx.globalAlpha = currentOpacity * 0.3;
          ctx.stroke();
          
          // Petit centre brillant
          ctx.beginPath();
          ctx.arc(0, 0, 1, 0, Math.PI * 2);
        } else {
          ctx.arc(0, 0, p.r, 0, Math.PI * 2);
        }

        ctx.fillStyle = p.color;
        ctx.globalAlpha = currentOpacity;
        if (p.type !== 'data' && p.type !== 'void') ctx.fill();
        else if (p.type === 'data') ctx.fill(); // fillText uses fillStyle
        else if (p.type === 'void') {
            ctx.globalAlpha = currentOpacity * 0.8;
            ctx.fill();
        }
        ctx.restore();

        p.x += p.dx;
        p.y += p.dy;
        
        if (p.type === 'ash' || p.type === 'void') {
            p.dx += Math.sin(p.y / 50) * 0.02;
            p.dy += Math.cos(p.x / 50) * 0.02;
        }

        if (p.rotation !== undefined && p.rotationSpeed !== undefined) {
            p.rotation += p.rotationSpeed;
        }

        if (p.x < -50 || p.x > canvas.width + 50 || p.y < -50 || p.y > canvas.height + 50) {
            particles[index] = createParticle();
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [difficulty, tags]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{
        zIndex: 0,
        width: "100%",
        height: "100%",
        opacity: 0.7,
      }}
    />
  );
};
