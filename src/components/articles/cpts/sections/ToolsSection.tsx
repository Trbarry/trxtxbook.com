import React from 'react';
import { Terminal, Shield, Cpu, FileText, BookOpen, Network, CheckCircle2 } from 'lucide-react';

export const ToolsSection: React.FC = () => (
  <section className="mb-16">
    <div className="bg-[#1a1a1f] p-8 rounded-lg border border-violet-900/20">
      <div className="flex items-center gap-3 mb-8">
        <Terminal className="w-8 h-8 text-violet-400" />
        <h2 className="text-3xl font-bold">Outils, environnement & prise de notes</h2>
      </div>
      <div className="space-y-8">

        {/* Exegol */}
        <div>
          <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
            <Shield className="w-6 h-6" />
            Exegol : Mon environnement offensif
          </h3>
          <div className="bg-[#2a2a2f] p-6 rounded-lg space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <Cpu className="w-6 h-6 text-violet-400" />
              <h4 className="text-xl font-semibold text-violet-300">Exegol : le top du toolkit offensif 🇫🇷</h4>
            </div>
            <p className="text-gray-300">
              Permettez-moi de le dire haut et fort : <strong>Exegol, c'est français. COCORICO 🇫🇷</strong>
            </p>
            <div className="flex justify-center my-6">
              <img
                src="https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/assets/oss117meme.webp"
                alt="Jack OSS 117 mauvais meme"
                className="rounded-2xl shadow-xl max-w-md"
              />
            </div>
            <p className="text-gray-300">
              Et Kali ? Tu es <em>mauvais</em>, comme Jack dans OSS 117. 🕶️ Voilà, c'est dit.
            </p>
            <p className="text-gray-300">
              Blague à part, passer de Kali à Exegol a été l'une des meilleures décisions de ma prépa CPTS.
              <strong> Exegol est un environnement de sécurité offensive basé sur des conteneurs</strong>, construit sur Docker, avec tout ce dont tu as besoin pré-installé et testé.
              Stable, léger, ultra rapide à déployer — un environnement tout frais en 2 secondes ? Boom — c'est fait.
            </p>
            <p className="text-gray-300">
              J'ai utilisé Exegol comme <strong>mon toolkit offensif principal</strong> tout au long du parcours et de l'examen.
              Mon setup : <strong>Arch Linux + Exegol</strong>. Performance, contrôle et stabilité.
            </p>

            <div className="bg-violet-900/20 rounded-lg p-4">
              <Terminal className="w-5 h-5 text-violet-400 inline-block mb-1 mr-2" />
              <span className="font-semibold text-violet-400">Outils phares d'Exegol :</span>
              <ul className="list-disc ml-6 text-gray-300 mt-2 space-y-1">
                <li><strong>Ligolo-ng</strong> — Tunneling et pivoting dans les réseaux internes. Indispensable pour le mouvement latéral.</li>
                <li><strong>NetExec</strong> — Parfait pour le credential spraying, l'énumération SMB et l'analyse des partages exposés.</li>
                <li><strong>FFuf</strong> — Fuzzing web rapide et précis pour l'énumération et l'exploitation.</li>
                <li><strong>Burp Suite</strong> — Attaques web, bypass CSRF, inspection de cookies, PoC XSS.</li>
                <li><strong>BloodyAD</strong> — Énumération AD simple et efficace (souvent plus pratique que BloodHound).</li>
                <li><strong>Impacket Tools</strong> — <code>secretsdump.py</code>, <code>smbexec.py</code>, <code>wmiexec.py</code> sont indispensables sur Windows.</li>
                <li><strong>smbserver.py</strong> — Pour servir des payloads ou récupérer du butin pendant l'examen.</li>
                <li><strong>Nmap</strong> — Rapide, fiable, tous les scripts prêts à l'emploi.</li>
              </ul>
            </div>

            <p className="text-gray-300">
              Ce qui fait briller Exegol : <strong>ça fait gagner du temps et des maux de tête</strong>.
              Pas d'installation, pas de dépannage. Tout est préconfiguré, organisé et prêt pour les opérations offensives.
              <span className="font-semibold text-violet-400"> Quand tu es en plein grind d'examen de 10 jours, ça compte plus que tout.</span>
            </p>

            <div className="bg-violet-900/20 rounded-lg p-4">
              <span className="font-semibold text-violet-400">✨ Pourquoi je n'y reviendrai jamais :</span>
              <ul className="list-disc ml-6 text-gray-300 mt-2 space-y-1">
                <li>Lance en quelques secondes avec Docker, sans polluer ton système hôte.</li>
                <li>Zéro crash, zéro problème de paquets — contrairement à Kali après chaque <code>apt upgrade</code>.</li>
                <li>Structure parfaite pour la prise de notes, les screenshots, l'hébergement de payloads et la rétention des logs.</li>
                <li>Se sent comme un toolkit professionnel, pas comme une distro de hobbyiste.</li>
              </ul>
            </div>

            <p className="text-gray-300">
              Et oui : <strong>c'est français 🇫🇷</strong>.
              Si tu es curieux du setup, du workflow et pourquoi je ne reviendrai jamais à Kali, lis mon article :<br />
              <a
                href="https://trxtxbook.com/articles/exegol-docker"
                target="_blank"
                rel="noopener noreferrer"
                className="text-violet-400 underline hover:text-violet-300"
              >
                Exegol : Le toolkit ultime pour la CPTS
              </a>.
            </p>
          </div>
        </div>

        {/* Obsidian & SysReptor */}
        <div>
          <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
            <FileText className="w-6 h-6" />
            SysReptor & Obsidian pour les notes & le reporting
          </h3>
          <div className="bg-[#2a2a2f] p-6 rounded-lg space-y-6">

            {/* Obsidian */}
            <div>
              <h4 className="text-xl font-semibold text-violet-300 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-violet-400" /> Obsidian : Mon hub de connaissances personnel
              </h4>
              <p className="text-gray-300">
                <strong>Obsidian</strong> a été mon outil central pour gérer mes connaissances tout au long de la CPTS.
                Chaque commande, chaque CVE, chaque technique était correctement documentée, expliquée et catégorisée.
              </p>
              <p className="text-gray-300">Voici une version simplifiée de ma structure Obsidian :</p>
              <details className="group bg-[#1a1a1f] rounded-lg p-4 text-white open:ring-1 open:ring-violet-600 transition-all">
                <summary className="cursor-pointer text-violet-400 font-semibold text-lg mb-2">
                  Cliquer pour voir la structure complète de l'arbre Obsidian
                </summary>
                <pre className="bg-black text-white text-sm rounded p-4 mt-4 overflow-x-auto whitespace-pre-wrap">
{` CPTS
  ├── 1- Information Gathering
│   ├── 1- Service Enumeration
│   │   ├── Services
│   │   │   ├── DNS (53)
│   │   │   │   ├── Attack DNS.md
│   │   │   │   ├── Dangerous Settings
│   │   │   │   └── Record Types
│   │   │   ├── FTP (21)
│   │   │   │   ├── Dangerous Settings
│   │   │   │   └── Enumeration.md
│   │   │   ├── IMAP (143, 993)
│   │   │   │   └── Commands
│   │   │   ├── IPMI (623)
│   │   │   │   ├── Authentication
│   │   │   │   └── Default Credentials
│   │   │   ├── Kerberos (88)
│   │   │   │   └── Kerberos.md
│   │   │   ├── LDAP (389,3268).md
│   │   │   ├── MSSQL (1433, 1434, 2433)
│   │   │   │   ├── Dangerous Settings
│   │   │   │   ├── Enum.md
│   │   │   │   ├── T-SQL Commands
│   │   │   │   └── Windows Exploitation.md
│   │   │   ├── MySQL (3306)
│   │   │   │   ├── Basic SQL Queries
│   │   │   │   └── Dangerous Settings
│   │   │   ├── NFS (2049)
│   │   │   │   ├── Dangerous Settings
│   │   │   │   └── Enum.md
│   │   │   ├── Oracle TNS (1521)
│   │   │   │   ├── Enum.md
│   │   │   │   ├── SQLplus Commands
│   │   │   │   └── Troubleshooting
│   │   │   ├── POP3 (110, 995)
│   │   │   │   ├── Commands
│   │   │   │   ├── Dangerous Settings
│   │   │   │   └── Enum.md
│   │   │   ├── R-Services (512, 513, 514)
│   │   │   │   ├── Enum.md
│   │   │   │   └── Service Breakdown
│   │   │   ├── RDP (3389)
│   │   │   │   └── Enumeration.md
│   │   │   ├── RPC.md
│   │   │   ├── Rsync (873)
│   │   │   │   └── Enumeration.md
│   │   │   ├── SMB (139, 445)
│   │   │   │   ├── Dangerous Settings
│   │   │   │   ├── Enumeration.md
│   │   │   │   ├── RPCClient
│   │   │   │   ├── Spidering
│   │   │   │   └── Windows Specific
│   │   │   ├── SMTP (25, 465, 587)
│   │   │   │   ├── Common Commands
│   │   │   │   └── enumeration.md
│   │   │   ├── SNMP (161, 162, 10161, 10162)
│   │   │   │   ├── Dangerous Settings
│   │   │   │   └── Enumeration.md
│   │   │   ├── SSH (22)
│   │   │   │   ├── Authentication
│   │   │   │   └── Dangerous Settings
│   │   │   ├── TFTP (69)
│   │   │   │   └── enumeration.md
│   │   │   ├── Telnet (23).md
│   │   │   └── WinRM (5985, 5986)
│   │   │       └── enumeration.md
│   │   └── Tools
│   │       ├── Nmap
│   │       │   ├── Firewall and IDS
│   │       │   └── Host Discovery
│   │       ├── WMIexec
│   │       │   └── Wmiexec.md
│   │       ├── creds
│   │       │   └── Credential Tools.md
│   │       └── tcpdump
│   │           └── Tcpdump.md
│   ├── Active Directory Enumeration
│   │   ├── ACL Enumeration
│   │   ├── Credential AD enumeration
│   │   ├── Hosts Enumeration
│   │   ├── LLMNR_NBT-NS Poisoning
│   │   ├── Password Policy Enumeration
│   │   ├── Password Spraying
│   │   └── Tools
│   │       ├── BloodHound
│   │       └── PowerView
│   └── Web Enumeration
│       ├── Active
│       │   ├── Directory & Page Fuzzing
│       │   ├── Parameter & Value Fuzzing
│       │   └── Subdomain & Virtual Host Fuzzing
│       └── Passive
│           ├── Google Dorking
│           └── Passive Infrastructure Identification
├── 2- Exploitation
│   ├── Service Exploitation
│   │   └── Web Exploitation
│   │       ├── CGI Shellshock Attack
│   │       ├── CSRF.md
│   │       ├── Command Injection
│   │       ├── Cross-Site Scripting (XSS)
│   │       ├── File Uploads
│   │       ├── HTTP Verb Tampering.md
│   │       ├── IDOR.md
│   │       ├── Local File Inclusion (LFI)
│   │       ├── SQLi
│   │       └── XXE
│   └── Tools
│       └── Credential Generating.md
├── 3- Lateral Movement
│   ├── Linux Lateral Movement
│   │   └── Kerberos Pass the Ticket
│   ├── Pivoting
│   │   ├── Advanced Tunneling
│   │   ├── Double Pivoting
│   │   ├── Dynamic and Local Port Forwarding
│   │   └── Pivoting Methods
│   │       ├── Chisel (SOCKS5 Tunneling).md
│   │       ├── Netsh (Windows Port Forwarding).md
│   │       ├── Plink, Sshuttle (SSH Pivoting).md
│   │       └── Rpivot (Web Server Pivoting).md
│   └── Windows Lateral Movement
│       ├── ADCS ESC 1 to 13
│       ├── Active Directory Lateral Movement
│       ├── Domain Trust Forest
│       ├── Kerberos Pass the Ticket
│       ├── NTLM Pass the Hash
│       └── SeBackUpPrivilege Abuse.md
├── 4- Post-Exploitation
│   ├── Linux Post Exploitation
│   │   ├── File Transfer
│   │   └── Privilege Escalation
│   ├── Password Attacks
│   └── Windows Post Exploitation
│       ├── Kernel Exploits
│       └── Privilege Escalation
│           ├── AD Certificates Services.md
│           ├── Kerberoasting
│           ├── Legacy Operating Systems
│           ├── Password Attacks
│           └── Privilege escalation`}
                </pre>
              </details>
              <p className="text-gray-300">
                <span className="font-semibold text-violet-400">Mon conseil :</span><br />
                Crée ton propre système de prise de notes structuré.
                Ça améliore la mémorisation et te donne une référence pendant l'examen.
                <span className="block">Organiser tes pensées pendant l'apprentissage paye sous pression.</span>
              </p>
            </div>

            {/* SysReptor */}
            <div>
              <h4 className="text-xl font-semibold text-violet-300 flex items-center gap-2 mt-8">
                <Network className="w-5 h-5 text-violet-400" /> SysReptor : L'arme finale pour le reporting
              </h4>
              <p className="text-gray-300">
                Pour la soumission du rapport final, j'ai utilisé <strong>SysReptor</strong>.
                C'est la plateforme de reporting d'HTB, ce qui rend le processus fluide et professionnel.
              </p>
              <p className="text-gray-300">
                Ce que j'ai aimé par-dessus tout, c'est le <strong>workflow de reporting structuré</strong> :
                chaque vulnérabilité est une entrée "Finding" dédiée, avec sévérité, impact, étapes de reproduction, screenshots et mesures correctives.
                Ça m'a aidé à maintenir la cohérence et la clarté tout au long de mon <strong>rapport de 190 pages</strong>.
              </p>
              <p className="text-gray-300">Voici à quoi ressemblait ma structure SysReptor typique :</p>
              <ul className="list-disc ml-6 text-gray-300 text-sm space-y-1">
                <li><strong>Walkthrough :</strong> Étapes d'attaque chronologiques, couvrant chaque phase</li>
                <li><strong>Findings :</strong> Chaque vulnérabilité en détail (IDOR, SSRF, SQLi...)</li>
                <li><strong>Flags :</strong> IDs des flags et comment ils ont été capturés</li>
                <li><strong>Recommandations :</strong> Conseils clairs et professionnels par problème</li>
              </ul>
              <p className="text-gray-300">
                J'ai rempli SysReptor en temps réel pendant l'examen avec la <strong>"méthode trigger-based"</strong> : chaque fois que je découvrais quelque chose d'important ou que je terminais une étape, je le documentais immédiatement. Pas de temps perdu à la fin.
              </p>
              <div className="bg-violet-900/20 rounded-lg p-4 flex items-center gap-2 mt-4">
                <CheckCircle2 className="w-5 h-5 text-violet-400" />
                <span className="text-gray-300">
                  <strong>Conseil final :</strong> Obsidian c'est pour toi, SysReptor c'est pour HTB.<br />
                  Garde les deux propres, concis et bien structurés.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);
