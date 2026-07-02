const images = [
  {
    src: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=900&q=80&fm=webp',
    fallback: 'https://via.placeholder.com/900x900?text=Fusion+Edit',
    span: 'col-span-2 row-span-2',
    caption: 'The Fusion Edit',
  },
  {
    src: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&q=80&fm=webp',
    fallback: 'https://via.placeholder.com/600x600?text=Soft+Drapes',
    span: '',
    caption: 'Soft Drapes',
  },
  {
    src: 'https://images.unsplash.com/photo-1502716110395-3002d96b0a0b?w=600&q=80&fm=webp',
    fallback: 'https://via.placeholder.com/600x600?text=Natural+Light',
    span: '',
    caption: 'Natural Light',
  },
  {
    src: 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=600&q=80&fm=webp',
    fallback: 'https://via.placeholder.com/600x600?text=Festive+Mood',
    span: '',
    caption: 'Festive Mood',
  },
  {
    src: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=900&q=80&fm=webp',
    fallback: 'https://via.placeholder.com/900x600?text=Everyday+Grace',
    span: 'col-span-2',
    caption: 'Everyday Grace',
  },
];

export default function Lookbook() {
  return (
    <section id="lookbook" className="bg-cream py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mb-14 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <span className="text-xs tracking-[0.3em] text-sage uppercase">
              Editorial
            </span>
            <h2 className="mt-3 font-serif text-3xl font-medium text-ink sm:text-4xl lg:text-5xl">
              The Lookbook
            </h2>
          </div>
          <a
            href="#shop"
            className="inline-flex items-center gap-2 text-sm tracking-wide text-burgundy no-underline transition-colors hover:text-terracotta"
          >
            Shop the looks
            <svg
              className="h-4 w-4"
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
          </a>
        </div>

        <div className="grid auto-rows-[200px] grid-cols-2 gap-3 sm:auto-rows-[240px] sm:gap-4 lg:grid-cols-4">
          {images.map((img) => (
            <div
              key={img.caption}
              className={`group relative overflow-hidden rounded-2xl ${img.span}`}
            >
              <img
                src={img.src}
                alt={img.caption}
                onError={(e) => {
                  e.target.src = img.fallback;
                }}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-ink/0 transition-colors duration-300 group-hover:bg-ink/20" />
              <span className="absolute bottom-4 left-4 text-xs tracking-[0.2em] text-cream uppercase opacity-0 transition-opacity group-hover:opacity-100">
                {img.caption}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
