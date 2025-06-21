import React, { useState, useEffect, useRef } from 'react';
import { Bot, MessageSquare, Terminal, Bug, History, Shield, Skull, Lock } from 'lucide-react';
import { Howl } from 'howler';

interface Message {
  text: string;
  type: 'history' | 'security' | 'hack' | 'password' | 'cybercrime' | 'tech' | 'welcome';
}

interface Position {
  x: number;
  y: number;
}

export const CyberCharacter: React.FC = () => {
  const [showMessage, setShowMessage] = useState(false);
  const [currentMessage, setCurrentMessage] = useState<Message>({ text: '', type: 'welcome' });
  const [isGlitching, setIsGlitching] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [hasClicked, setHasClicked] = useState(false);
  const [hasShownWelcome, setHasShownWelcome] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);

  const messageTimeoutRef = useRef<NodeJS.Timeout>();
  const glitchIntervalRef = useRef<NodeJS.Timeout>();
  const soundRef = useRef<Howl>();
  const characterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (import.meta.env.VITE_ENABLE_CYBER_BOT !== 'true' || isMobile) {
    return null;
  }

  useEffect(() => {
    soundRef.current = new Howl({
      src: ['https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'],
      volume: 0.5,
      rate: 1.5,
      preload: true
    });
  }, []);

  const messages: Message[] = [
    { text: "Le premier virus informatique 'Creeper' (1971) affichait : 'I'm the Creeper, catch me if you can!' ", type: 'history' },
    { text: "Kevin Mitnick utilisait un OS custom sur sa clé USB : OSSJack, basé sur Kali mais avec plus de style. 💀", type: 'hack' },
    // ... (ajoute tous les autres messages ici)
  ];

  const welcomeMessage: Message = {
    text: "Hey! 👋 Je connais 30 fun facts sur la cybersécurité! Clique pour les découvrir! 🔒",
    type: 'welcome'
  };

  useEffect(() => {
    if (characterRef.current) {
      setPosition({
        x: window.innerWidth * 0.15,
        y: window.innerHeight * 0.75
      });
    }
  }, []);

  useEffect(() => {
    const startGlitchEffect = () => {
      setIsGlitching(true);
      setTimeout(() => setIsGlitching(false), 150);
    };

    glitchIntervalRef.current = setInterval(() => {
      if (Math.random() > 0.7) {
        startGlitchEffect();
      }
    }, 3000);

    if (!hasShownWelcome) {
      setTimeout(() => {
        setCurrentMessage(welcomeMessage);
        setShowMessage(true);
        setHasShownWelcome(true);
      }, 1000);
    }

    return () => {
      if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
      if (glitchIntervalRef.current) clearInterval(glitchIntervalRef.current);
    };
  }, [hasShownWelcome]);

  useEffect(() => {
    if (hasClicked && !isHovered) {
      setShowMessage(false);
    }
  }, [isHovered, hasClicked]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    if (characterRef.current) {
      setIsDragging(true);
      setDragOffset({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      const maxX = window.innerWidth - 100;
      const maxY = window.innerHeight - 100;
      setPosition({ x: Math.max(0, Math.min(maxX, newX)), y: Math.max(0, Math.min(maxY, newY)) });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  const showRandomMessage = () => {
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    setCurrentMessage(randomMessage);
    setShowMessage(true);
    if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
    if (!isHovered) {
      messageTimeoutRef.current = setTimeout(() => setShowMessage(false), 8000);
    }
  };

  const handleClick = () => {
    if (isDragging) return;
    if (soundRef.current) soundRef.current.play();
    setHasClicked(true);
    showRandomMessage();
    setIsGlitching(true);
    setTimeout(() => setIsGlitching(false), 150);
  };

  const getMessageIcon = (type: Message['type']) => {
    switch (type) {
      case 'history': return <History className="w-4 h-4 text-blue-400" />;
      case 'security': return <Shield className="w-4 h-4 text-green-400" />;
      case 'hack': return <Skull className="w-4 h-4 text-red-400" />;
      case 'password': return <Lock className="w-4 h-4 text-yellow-400" />;
      case 'cybercrime': return <Bug className="w-4 h-4 text-purple-400" />;
      case 'tech': return <Terminal className="w-4 h-4 text-cyan-400" />;
      default: return <Bot className="w-4 h-4 text-violet-400" />;
    }
  };

  const getMessageColor = (type: Message['type']) => {
    switch (type) {
      case 'history': return 'border-blue-500/50 text-blue-300';
      case 'security': return 'border-green-500/50 text-green-300';
      case 'hack': return 'border-red-500/50 text-red-300';
      case 'password': return 'border-yellow-500/50 text-yellow-300';
      case 'cybercrime': return 'border-purple-500/50 text-purple-300';
      case 'tech': return 'border-cyan-500/50 text-cyan-300';
      default: return 'border-violet-500/50 text-violet-300';
    }
  };

  return (
    <div ref={characterRef} className="fixed z-50 select-none" style={{ left: `${position.x}px`, top: `${position.y}px`, cursor: isDragging ? 'grabbing' : isHovered ? 'grab' : 'pointer', touchAction: 'none' }} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => { setIsHovered(false); if (hasClicked) setShowMessage(false); }} onMouseDown={handleMouseDown} onClick={handleClick}>
      <div className={`relative group transition-transform duration-300 ${isHovered ? 'scale-110' : 'scale-100'} ${isGlitching ? 'translate-x-[1px] translate-y-[1px]' : ''}`}>
        <div className={`relative bg-[#1a1a1f] p-4 rounded-full border-2 transition-all duration-300 ${isHovered ? 'border-violet-500 shadow-lg shadow-violet-500/20' : 'border-violet-500/50'} ${isGlitching ? 'border-violet-600 brightness-125' : ''} md:scale-[3] scale-75`}>
          <Bot className={`w-8 h-8 transition-all duration-300 ${isHovered ? 'text-violet-400' : 'text-violet-500'} ${isGlitching ? 'text-violet-300' : ''}`} />
          <div className={`absolute -top-1 -right-1 w-2 h-2 rounded-full bg-violet-500 transition-all duration-300 ${isHovered ? 'opacity-100 scale-150' : 'opacity-50 scale-100'} ${isGlitching ? 'bg-violet-300' : ''}`} />
          <div className={`absolute -bottom-1 -left-1 w-2 h-2 rounded-full bg-violet-500 transition-all duration-300 ${isHovered ? 'opacity-100 scale-150' : 'opacity-50 scale-100'} ${isGlitching ? 'bg-violet-300' : ''}`} />
        </div>
      </div>
      <div className={`absolute bottom-full left-0 mb-4 transition-all duration-300 transform ${showMessage ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
        <div className={`relative bg-[#1a1a1f] px-4 py-2 rounded-lg border-2 transition-all duration-300 ${getMessageColor(currentMessage.type)} min-w-[200px] max-w-[300px]`}>
          <div className="flex items-center gap-2">
            {getMessageIcon(currentMessage.type)}
            <p className="text-sm">{currentMessage.text}</p>
          </div>
          <div className={`absolute -bottom-2 left-4 w-4 h-4 bg-[#1a1a1f] border-r-2 border-b-2 ${getMessageColor(currentMessage.type)} transform rotate-45`} />
        </div>
      </div>
    </div>
  );
};
