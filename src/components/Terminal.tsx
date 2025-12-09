import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Terminal as TerminalIcon, X } from 'lucide-react';

// Types pour la coloration syntaxique
type LineType = 'command' | 'output' | 'error' | 'success' | 'system';
interface TerminalLine {
  type: LineType;
  content: string | React.ReactNode;
}

export const Terminal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<TerminalLine[]>([
    { type: 'system', content: "Arch Linux 6.8.9-arch1-1 (tty1)" },
    { type: 'system', content: "Moulinvest Corp. Network Access... Granted." },
    { type: 'output', content: "Type 'help' to see available commands." }
  ]);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const fileSystem: Record<string, string> = {
    'readme.txt': "Bienvenue sur mon portfolio. Je suis Tristan, alternant SysAdmin et passionné de Cyber.",
    'contact.txt': "Email: tr.barrypro@gmail.com\nTel: Encrypted[...]",
    'todo.md': "- [x] BTS SIO\n- [ ] OSCP\n- [ ] Master Cyber",
    'secret.txt': "Flag{Y0u_F0und_Th3_Term1n4l_Ch4mp10n}"
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '²' || e.code === 'Backquote' || e.key === 'F2' || (e.ctrlKey && e.key === 'k')) {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape' && isOpen) setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current) setTimeout(() => inputRef.current?.focus(), 50);
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [isOpen, history]);

  const handleCommand = (cmdStr: string) => {
    const args = cmdStr.trim().split(' ');
    const cmd = args[0].toLowerCase();
    const arg = args[1];

    const newHistory = [...history, { type: 'command', content: cmdStr } as TerminalLine];

    switch (cmd) {
      case 'help':
        newHistory.push({ type: 'output', content: (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-gray-600 dark:text-gray-300">
            <span><span className="text-violet-600 dark:text-violet-400">ls</span> : List directory contents</span>
            <span><span className="text-violet-600 dark:text-violet-400">cd [page]</span> : Navigate website</span>
            <span><span className="text-violet-600 dark:text-violet-400">cat [file]</span> : Read file content</span>
            <span><span className="text-violet-600 dark:text-violet-400">whoami</span> : Current user info</span>
            <span><span className="text-violet-600 dark:text-violet-400">neofetch</span> : System info</span>
            <span><span className="text-violet-600 dark:text-violet-400">clear</span> : Clear terminal</span>
            <span><span className="text-violet-600 dark:text-violet-400">exit</span> : Close session</span>
          </div>
        )});
        break;

      case 'clear': setHistory([]); setInput(''); return;

      case 'ls':
        const files = Object.keys(fileSystem).map(f => <span key={f} className="mr-4 text-gray-600 dark:text-gray-300">{f}</span>);
        const dirs = ['home', 'writeups', 'projects', 'certifications', 'contact'].map(d => <span key={d} className="mr-4 text-blue-600 dark:text-blue-400 font-bold">{d}/</span>);
        
        if (arg === '-la' || arg === '-l') {
             newHistory.push({ type: 'output', content: (
                <div className="flex flex-col text-xs md:text-sm font-mono">
                    <span className="text-gray-500">drwx------ 5 trtnx users 4096 Nov 11 10:00 .</span>
                    <span className="text-gray-500">drwxr-xr-x 3 root  root  4096 Jan 01 00:00 ..</span>
                    {Object.keys(fileSystem).map(f => (
                        <div key={f}><span className="text-gray-500">-rw-r--r-- 1 trtnx users  124 Nov 11 10:05</span> <span className="text-gray-600 dark:text-gray-300">{f}</span></div>
                    ))}
                    {['home', 'writeups', 'projects'].map(d => (
                        <div key={d}><span className="text-gray-500">drwxr-xr-x 2 trtnx users 4096 Nov 11 10:10</span> <span className="text-blue-600 dark:text-blue-400">{d}</span></div>
                    ))}
                </div>
             )});
        } else {
            newHistory.push({ type: 'output', content: <div className="flex flex-wrap">{dirs}{files}</div> });
        }
        break;

      case 'cat':
        if (!arg) newHistory.push({ type: 'error', content: "usage: cat [file]" });
        else if (fileSystem[arg]) newHistory.push({ type: 'output', content: fileSystem[arg] });
        else newHistory.push({ type: 'error', content: `cat: ${arg}: No such file or directory` });
        break;

      case 'whoami':
        newHistory.push({ type: 'success', content: "trtnx (uid=1000, gid=1000, groups=wheel,docker,moulinvest)" });
        break;

      case 'sudo':
        newHistory.push({ type: 'error', content: "trtnx is not in the sudoers file. This incident will be reported." });
        break;

      case 'neofetch':
        newHistory.push({ type: 'output', content: (
            <div className="flex gap-6 font-mono text-xs md:text-sm leading-tight mt-2">
                <div className="text-blue-600 dark:text-blue-500 hidden sm:block font-bold">
{`       /\\
      /  \\
     /    \\
    /      \\
   /   ,,   \\
  /   |  |   \\
 /_-''    ''-_\\`}
                </div>
                <div className="flex flex-col gap-1 text-gray-800 dark:text-gray-300">
                    <div><span className="text-blue-600 dark:text-blue-400 font-bold">trtnx</span>@<span className="text-blue-600 dark:text-blue-400 font-bold">archlinux</span></div>
                    <div>-----------------</div>
                    <div><span className="text-blue-600 dark:text-blue-400 font-bold">OS</span>: Arch Linux x86_64</div>
                    <div><span className="text-blue-600 dark:text-blue-400 font-bold">Host</span>: Lenovo IdeaPad Slim 5</div>
                    <div><span className="text-blue-600 dark:text-blue-400 font-bold">Kernel</span>: 6.8.9-arch1-1</div>
                    <div><span className="text-blue-600 dark:text-blue-400 font-bold">Role</span>: Alternant SysAdmin & Pentester</div>
                </div>
            </div>
        )});
        break;

      case 'exit': setIsOpen(false); break;

      case 'cd':
        if (!arg || arg === 'home' || arg === '~') { navigate('/'); newHistory.push({ type: 'system', content: "Navigating to /home..." }); }
        else if (arg === 'writeups') { navigate('/writeups'); newHistory.push({ type: 'system', content: "Accessing Archives..." }); }
        else if (arg === 'projects') { navigate('/projects'); newHistory.push({ type: 'system', content: "Loading Lab Environment..." }); }
        else if (arg === 'certifications') { navigate('/certifications'); newHistory.push({ type: 'system', content: "Verifying credentials..." }); }
        else if (arg === 'contact') { navigate('/'); setTimeout(() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }), 500); newHistory.push({ type: 'system', content: "Opening comms channel..." }); }
        else { newHistory.push({ type: 'error', content: `bash: cd: ${arg}: No such file or directory` }); }
        break;

      case '': break;
      default: newHistory.push({ type: 'error', content: `bash: ${cmd}: command not found` });
    }
    setHistory(newHistory);
    setInput('');
  };

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); handleCommand(input); };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999]"
          />

          <motion.div
            initial={{ y: '-100%' }}
            animate={{ y: 0 }}
            exit={{ y: '-100%' }}
            transition={{ type: "spring", stiffness: 250, damping: 25 }}
            // ✅ CHANGEMENT : Fond blanc en mode jour
            className="fixed top-0 left-0 right-0 h-[60vh] bg-white/95 dark:bg-[#0c0c12]/95 border-b border-violet-500/50 shadow-2xl z-[10000] flex flex-col font-mono text-sm md:text-base"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-[#15151a] border-b border-gray-300 dark:border-white/10">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <TerminalIcon className="w-4 h-4 text-violet-600 dark:text-violet-500" />
                <span className="text-xs font-bold tracking-wider text-violet-700 dark:text-violet-300">TRTNX_ROOT_SHELL</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Output */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-1 text-gray-800 dark:text-gray-300 custom-scrollbar font-medium"
              onClick={() => inputRef.current?.focus()}
            >
              {history.map((line, i) => (
                <div key={i} className="break-words">
                  {line.type === 'command' && (
                    <div>
                        <span className="text-green-600 dark:text-green-500 font-bold">root@trtnx</span>
                        <span className="text-gray-500">:</span>
                        <span className="text-blue-600 dark:text-blue-400 font-bold">~</span>
                        <span className="text-gray-900 dark:text-white">$ {line.content}</span>
                    </div>
                  )}
                  {line.type === 'output' && <div className="text-gray-700 dark:text-gray-300 pl-2">{line.content}</div>}
                  {line.type === 'error' && <div className="text-red-600 dark:text-red-400 pl-2">{line.content}</div>}
                  {line.type === 'success' && <div className="text-green-600 dark:text-green-400 pl-2">{line.content}</div>}
                  {line.type === 'system' && <div className="text-violet-600 dark:text-violet-400 italic pl-2"># {line.content}</div>}
                </div>
              ))}
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 bg-white dark:bg-[#0a0a0f] border-t border-gray-300 dark:border-white/10 flex items-center gap-2">
              <span className="text-green-600 dark:text-green-500 font-bold flex items-center whitespace-nowrap">
                root@trtnx:<span className="text-blue-600 dark:text-blue-400">~</span>$
              </span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white font-bold w-full"
                autoComplete="off"
                autoFocus
              />
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};