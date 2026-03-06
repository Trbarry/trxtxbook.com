import React from 'react';
import { Terminal, Shield, Cpu, Monitor, FileText, BookOpen, Network, CheckCircle2 } from 'lucide-react';

export const ToolsSection: React.FC = () => (
  <section className="mb-16">
    <div className="bg-[#1a1a1f] p-8 rounded-lg border border-violet-900/20">
      <div className="flex items-center gap-3 mb-8">
        <Terminal className="w-8 h-8 text-violet-400" />
        <h2 className="text-3xl font-bold">Outils, environnement & prise de notes</h2>
      </div>
      <div className="space-y-8">
        <div>
          <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
            <Shield className="w-6 h-6" />
            Exegol : Mon environnement d’attaque
          </h3>
          <div className="bg-[#2a2a2f] p-6 rounded-lg space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <Cpu className="w-6 h-6 text-violet-400" />
              <h4 className="text-xl font-semibold text-violet-300">Exegol : le top du toolkit offensif 🇫🇷</h4>
            </div>
            <p className="text-gray-300">
              Je le dis haut et fort : <strong>Exegol, c’est français. COCORICO 🇫🇷</strong><br  />
            </p>
            <div className="bg-violet-900/20 rounded-lg p-4">
              <Terminal className="w-5 h-5 text-violet-400 inline-block mb-1 mr-2" />
              <span className="font-semibold text-violet-400">Outils phares d’Exegol :</span>
              <ul className="list-disc ml-6 text-gray-300 mt-2 space-y-1">
                <li><strong>Ligolo-ng</strong> : Pour le tunneling et le pivoting.</li>
                <li><strong>NetExec</strong> : Parfait pour le credential spraying.</li>
                <li><strong>FFuf</strong> : Fuzz web rapide et précis.</li>
                <li><strong>Burp Suite</strong> : Attaques web.</li>
                <li><strong>BloodyAD</strong> : Enum AD simple et rapide.</li>
                <li><strong>Impacket Tools</strong> : Indispensables sur Windows.</li>
              </ul>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
            <FileText className="w-6 h-6" />
            SysReptor & Obsidian
          </h3>
          <div className="bg-[#2a2a2f] p-6 rounded-lg space-y-6">
            <div>
              <h4 className="text-xl font-semibold text-violet-300 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-violet-400" /> Obsidian
              </h4>
              <p className="text-gray-300">
                <strong>Obsidian</strong> a été mon outil central pour gérer tout mon savoir.
              </p>
            </div>
            <div>
              <h4 className="text-xl font-semibold text-violet-300 flex items-center gap-2">
                <Network className="w-5 h-5 text-violet-400" /> SysReptor
              </h4>
              <p className="text-gray-300">
                Pour la remise du rapport final, j’ai utilisé <strong>SysReptor</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);
