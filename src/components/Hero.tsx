import React, { useEffect, useState } from "react";
import { Award, BookOpen, Brain, Calendar, CheckCircle2, Cpu, Database, FileText, Lightbulb, Lock, Monitor, Network, Shield, Target, Terminal, TrendingUp, Users, Zap } from "lucide-react";

interface HeroProps {
isLoaded: boolean;
}

export const Hero: React.FC<HeroProps> = ({ isLoaded }) => {
const \[ready, setReady] = useState(false);

useEffect(() => {
const timeout = setTimeout(() => setReady(true), 100); // delay animation to improve LCP
return () => clearTimeout(timeout);
}, \[]);

return ( <section className="relative flex items-center justify-center h-screen max-h-[900px] px-4 overflow-hidden">
\<div
className={`text-center transition-opacity duration-1000 ease-out w-full max-w-5xl mx-auto ${
          isLoaded && ready ? "opacity-100" : "opacity-0"
        }`}
\> <div className="flex items-center gap-3 mb-6"> <span className="text-violet-400 font-bold text-3xl">Tristan Barry</span> </div> <p className="text-muted-foreground text-lg mb-10">
Alternant Technicien Informatique <br />
Étudiant en Informatique & Cybersécurité </p>

```
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {[
        { icon: Server, text: "System Administration", color: "violet" },
        { icon: Network, text: "Network Infrastructure", color: "blue" },
        { icon: Database, text: "Database Management", color: "green" },
        { icon: Settings, text: "Technical Support", color: "orange" }
      ].map((badge, index) => (
        <div
          key={index}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-${badge.color}-500/10 transition-all duration-300 hover:bg-${badge.color}-500/20`}
        >
          <badge.icon className={`w-4 h-4 text-${badge.color}-400`} />
          <span className={`text-${badge.color}-400 font-medium text-sm`}>
            {badge.text}
          </span>
        </div>
      ))}
    </div>
  </div>
</section>
```

);
};
