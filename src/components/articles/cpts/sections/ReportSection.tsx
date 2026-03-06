import React from 'react';
import { FileText, Clock, ListChecks, BookOpen, CheckCircle2, Zap, Code, Lightbulb } from 'lucide-react';

export const ReportSection: React.FC = () => (
  <section className="mb-16">
    <div className="bg-[#1a1a1f] p-8 rounded-lg border border-violet-900/20">
      <div className="flex items-center gap-3 mb-8">
        <FileText className="w-8 h-8 text-violet-400" />
        <h2 className="text-3xl font-bold">Le rapport de 190 pages</h2>
      </div>
      <div className="space-y-8">
        <div>
          <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
            <Clock className="w-6 h-6" />
            Stratégie de reporting
          </h3>
          <div className="bg-[#2a2a2f] p-6 rounded-lg space-y-6">
            <p className="text-gray-300">
              Workflow en temps réel avec <strong>SysReptor</strong>. Chaque découverte est documentée immédiatement.
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
            <Code className="w-6 h-6" />
            Walkthrough vs Findings
          </h3>
          <div className="bg-[#2a2a2f] p-6 rounded-lg space-y-6">
            <p className="text-gray-300">
              Le <strong>walkthrough</strong> est factuel et linéaire. Les <strong>findings</strong> sont analytiques et structurés.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
);
