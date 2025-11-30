import React, { useEffect } from 'react';
import { Award, Terminal, Cpu, Shield, BookOpen } from 'lucide-react';
import { SEOHead } from '../components/SEOHead';
import { BTSCertification } from '../components/certifications/BTSCertification';
import { CPTSCertification } from '../components/certifications/CPTSCertification';
import { AZ900Certification } from '../components/certifications/AZ900Certification';
import { EJPTCertification } from '../components/certifications/EJPTCertification';
import { THMWebPentestingCertification } from '../components/certifications/THMWebPentestingCertification';
import { THMJrPentesterCertification } from '../components/certifications/THMJrPentesterCertification';

export const CertificationsList: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <SEOHead 
        title="Certifications & Diplômes | Tristan Barry"
        description="Parcours de certification : HTB CPTS (Expert), Microsoft AZ-900 (Cloud), eJPT (Offensive) et BTS SIO."
        keywords="CPTS, AZ-900, eJPT, BTS SIO, Cybersécurité, Pentest, Certification, Microsoft Azure"
        url="https://trxtxbook.com/certifications"
      />
      
      <div className="min-h-screen pt-32 pb-24 bg-black text-gray-100">
        <div className="container mx-auto px-6">
          
          {/* En-tête */}
          <div className="flex flex-col items-center text-center mb-16">
            <div className="p-4 bg-[#1a1a1f] rounded-2xl border border-white/10 mb-6 shadow-2xl">
              <Award className="w-12 h-12 text-violet-500" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
              Formation & Certifications
            </h1>
            <p className="text-gray-400 max-w-2xl text-lg leading-relaxed">
              Validation continue de mes compétences offensives et défensives.
              <br />
              <span className="text-sm font-mono text-violet-400 mt-2 block">
                Roadmap: CPTS Validée → Objectif OSCP
              </span>
            </p>
          </div>

          {/* 1. SECTION "EXPERT" - CPTS (Mise en avant majeure) */}
          <div className="mb-20">
            <div className="flex items-center gap-3 mb-6 pl-2">
                <Terminal className="w-6 h-6 text-violet-400" />
                <h2 className="text-2xl font-bold text-white">Expertise Offensive</h2>
            </div>
            
            {/* Wrapper avec effet de Glow pour la CPTS */}
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl opacity-20 blur-lg transition duration-500 group-hover:opacity-40"></div>
                <div className="relative">
                    <CPTSCertification />
                </div>
            </div>
          </div>

          {/* 2. SECTION "SOCLE TECHNIQUE" - BTS & CLOUD */}
          <div className="mb-20">
            <div className="flex items-center gap-3 mb-6 pl-2">
                <Cpu className="w-6 h-6 text-blue-400" />
                <h2 className="text-2xl font-bold text-white">Socle Académique & Cloud</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* BTS SIO - Le Diplôme */}
                <div className="flex flex-col">
                    <span className="text-xs font-mono text-gray-500 mb-2 uppercase tracking-widest pl-1">Diplôme d'État</span>
                    <BTSCertification />
                </div>

                {/* AZ-900 - La Brique Cloud */}
                <div className="flex flex-col">
                    <span className="text-xs font-mono text-gray-500 mb-2 uppercase tracking-widest pl-1">Microsoft Azure</span>
                    <AZ900Certification />
                </div>
            </div>
          </div>

          {/* 3. SECTION "ARSENAL OFFENSIF" - eJPT & THM */}
          <div>
            <div className="flex items-center gap-3 mb-6 pl-2">
                <Shield className="w-6 h-6 text-red-400" />
                <h2 className="text-2xl font-bold text-white">Compétences Opérationnelles</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* eJPT - La pratique */}
                <div className="lg:col-span-2">
                    <EJPTCertification />
                </div>
                
                {/* Badges THM - Les parcours */}
                <div className="flex flex-col gap-8">
                    <THMWebPentestingCertification />
                    <THMJrPentesterCertification />
                </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}