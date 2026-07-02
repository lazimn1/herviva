const collections = [
  {
    title: 'Kurtas & Tunics',
    desc: 'Flowing fabrics, artisanal prints',
    image:
      'https://images.unsplash.com/photo-1583292655851-27f1e0f0b8e5?w=800&q=80&fm=webp',
    fallback: 'https://via.placeholder.com/800x1000?text=Kurtas+%26+Tunics',
    color: 'bg-sage/20',
    accent: 'text-sage-dark',
  },
  {
    title: 'Fusion Wear',
    desc: 'East meets west, effortlessly',
    image:
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&q=80&fm=webp',
    fallback: 'https://via.placeholder.com/800x1000?text=Fusion+Wear',
    color: 'bg-terracotta/15',
    accent: 'text-terracotta',
  },
  {
    title: 'Occasion Edit',
    desc: 'Festive, formal & celebratory',
    image:
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&q=80&fm=webp',
    fallback: 'https://via.placeholder.com/800x1000?text=Occasion+Edit',
    color: 'bg-burgundy/10',
    accent: 'text-burgundy',
  },
  {
    title: 'Everyday Essentials',
    desc: 'Comfort meets quiet luxury',
    image:
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800&q=80&fm=webp',
    fallback: 'https://via.placeholder.com/800x1000?text=Everyday+Essentials',
    color: 'bg-tan/20',
    accent: 'text-ink',
  },
];

export default function Collections() {
  return (
    <section id="collections" className="bg-cream py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mb-14 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <span className="text-xs tracking-[0.3em] text-sage uppercase">
              Curated For You
            </span>
            <h2 className="mt-3 font-serif text-3xl font-medium text-ink sm:text-4xl lg:text-5xl">
              Our Collections
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-muted">
            Each piece is thoughtfully designed to celebrate the modern woman —
            rooted in heritage, made for today.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {collections.map((col, i) => (
            <a
              key={col.title}
              href="#shop"
              className="group relative overflow-hidden rounded-2xl no-underline"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="aspect-[3/4] overflow-hidden">
                <img
                  src={col.image}
                  alt={col.title}
                  onError={(e) => {
                    e.target.src = col.fallback;
                  }}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
              <div
                className={`absolute top-4 left-4 rounded-full px-3 py-1 text-[10px] tracking-wider uppercase ${col.color} ${col.accent} backdrop-blur-sm`}
              >
                Collection
              </div>
              <div className="absolute right-0 bottom-0 left-0 p-5">
                <h3 className="font-serif text-xl text-cream sm:text-2xl">
                  {col.title}
                </h3>
                <p className="mt-1 text-xs text-cream/70">{col.desc}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs tracking-wide text-cream/90 opacity-0 transition-opacity group-hover:opacity-100">
                  Explore
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
