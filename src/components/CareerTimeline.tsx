const experience = [
  {
    period: 'Depuis 2025',
    title: 'Technicien systèmes et réseaux',
    context: 'Moulinvest',
    description: 'Je gère le parc avec Microsoft Intune et les stratégies de groupe. Je travaille aussi sur la segmentation du réseau et la sécurité des systèmes.',
  },
  {
    period: '2024',
    title: 'Reconversion en informatique',
    context: 'Formation en autonomie',
    description: 'Pendant huit mois, j’ai alterné les exercices sur TryHackMe et la mise en pratique sur mon propre lab Active Directory.',
  },
  {
    period: '2020 – 2023',
    title: 'Technicien fibre optique',
    context: 'Interventions sur le terrain',
    description: 'J’intervenais sur les installations de fibre optique. Ces années de terrain m’ont appris comment fonctionne la couche physique du réseau.',
  },
];

export function CareerTimeline() {
  return (
    <section id="timeline" aria-labelledby="timeline-heading" className="border-y border-line bg-surface px-5 py-12 sm:px-8 md:py-16">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1fr_2fr] lg:gap-12 lg:px-8">
        <div>
          <h2 id="timeline-heading" className="font-serif text-4xl tracking-tight text-text md:text-5xl">Mon parcours</h2>
          <p className="mt-3 max-w-xs text-base leading-relaxed text-muted">De la fibre optique à l’administration des systèmes et des réseaux.</p>
        </div>
        <ol className="divide-y divide-line border-y border-line">
          {experience.map(({ period, title, context, description }) => (
            <li key={period} className="grid gap-2 py-5 sm:grid-cols-[7rem_1fr] sm:gap-5">
              <span className="pt-0.5 text-sm font-medium tabular-nums text-accent">{period}</span>
              <div>
                <h3 className="text-xl font-semibold leading-tight text-text">{title}</h3>
                <p className="mt-1 text-sm font-semibold text-muted">{context}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>
              </div>
            </li>
          ))}
          <li className="grid gap-2 py-5 sm:grid-cols-[7rem_1fr] sm:gap-5">
            <span className="pt-0.5 text-sm font-medium text-accent">À terme</span>
            <div>
              <h3 className="text-xl font-semibold leading-tight text-text">Poursuivre jusqu’au bac +5</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">J’aimerais approfondir l’architecture réseau et la sécurité offensive et défensive.</p>
            </div>
          </li>
        </ol>
      </div>
    </section>
  );
}
