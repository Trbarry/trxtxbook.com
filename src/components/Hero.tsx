import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HeroProps {
  setShowProfile: (show: boolean) => void;
}

export function Hero({ setShowProfile }: HeroProps) {
  return (
    <section aria-labelledby="hero-title" className="bg-background px-5 pt-28 text-text sm:px-8 md:pt-32">
      <div className="mx-auto max-w-6xl lg:px-8">
        <div className="grid items-center gap-9 pb-9 md:grid-cols-[1.35fr_1fr] md:gap-12 md:pb-10">
          <div>
            <div className="mb-5 flex items-center gap-3">
              <img
                src="https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/profile-images/photo.jpg"
                alt=""
                width={52}
                height={52}
                className="h-14 w-14 rounded-full object-cover"
              />
              <p className="text-sm leading-snug text-gray-600 dark:text-gray-300">
                Technicien systèmes et réseaux<br />
                <span className="font-semibold text-text">Moulinvest</span>
              </p>
            </div>
            <h1 id="hero-title" className="text-5xl font-semibold leading-none tracking-tight sm:text-7xl lg:text-8xl">Tristan <span className="font-serif font-normal italic">Barry</span></h1>
            <p className="mt-4 max-w-lg text-lg leading-relaxed text-gray-700 dark:text-gray-300">
              En parallèle de mon poste, je prépare le titre AIS chez FORMATIK. J’ai obtenu la CPTS et je débute en bug bounty sur mon temps libre.
            </p>
            <button
              type="button"
              onClick={() => setShowProfile(true)}
              aria-haspopup="dialog"
              className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-md bg-[#12605f] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#0b4d4c]"
            >
              Découvrir mon profil <ArrowRight size={16} aria-hidden="true" />
            </button>
          </div>
          <div className="border-t border-gray-300 pt-6 dark:border-gray-700 md:border-l md:border-t-0 md:pl-9 md:pt-0">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-accent">Retour d’expérience</p>
            <h2 className="font-serif text-4xl font-normal leading-tight tracking-tight sm:text-5xl">
              De l’eJPT à la CPTS
            </h2>
            <p className="mt-3 max-w-sm text-base leading-relaxed text-gray-600 dark:text-gray-300">
              Comment j’ai organisé mes cinq mois de préparation et abordé la rédaction d’un rapport de 190 pages.
            </p>
            <Link to="/articles/cpts-journey?lang=fr" className="mt-3 inline-flex min-h-11 items-center gap-2 font-semibold text-[#12605f] underline decoration-1 underline-offset-4 hover:decoration-2 dark:text-teal-300">
              Lire mon retour sur le CPTS <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
