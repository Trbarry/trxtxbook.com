import React, { useEffect } from 'react';
import { Award } from 'lucide-react';
import { SEOHead } from '../components/SEOHead';
import { BTSCertification } from '../components/certifications/BTSCertification';
import { CPTSCertification } from '../components/certifications/CPTSCertification';
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
        title="Formation & Certifications en Cybersécurité | Tristan Barry"
        description="Découvrez mes certifications en cybersécurité : CPTS, eJPT, TryHackMe certifications et ma formation BTS SIO SISR. Parcours complet en pentesting et sécurité informatique."
        keywords="certifications cybersécurité, CPTS, eJPT, TryHackMe, BTS SIO SISR, pentesting, formation informatique, Hack The Box"
        url="https://trxtxbook.com/certifications"
      />
      <div className="min-h-screen pt-24 pb-20 bg-[#0a0a0f]">
        <div className="container mx-auto px-6">
          <div className="flex items-center gap-3 mb-12">
            <Award className="w-8 h-8 text-violet-500" />
            <h1 className="text-3xl font-bold">Formation & Certifications</h1>
          </div>

          {/* Formation en cours */}
          <BTSCertification />

          {/* Certifications */}
          <div className="grid grid-cols-1 gap-6 mt-8">
            <CPTSCertification />
            <EJPTCertification />
            <THMWebPentestingCertification />
            <THMJrPentesterCertification />
          </div>
        </div>
      </div>
    </>
  );
}