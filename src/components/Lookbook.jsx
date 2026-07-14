import { useState, useEffect } from 'react';
import { dbService } from '../services/dbService';
import { Link } from 'react-router-dom';

const defaultImages = [
  {
    src: '/images/lookbook-1.webp',
    fallback: '/images/fallback.svg',
    // Desktop: large feature tile (col 2 + row 2); Mobile: full-width
    spanDesktop: 'sm:col-span-2 sm:row-span-2',
    caption: 'The Fusion Edit',
  },
  {
    src: '/images/lookbook-2.webp',
    fallback: '/images/fallback.svg',
    spanDesktop: '',
    caption: 'Soft Drapes',
  },
  {
    src: '/images/lookbook-3.webp',
    fallback: '/images/fallback.svg',
    spanDesktop: '',
    caption: 'Natural Light',
  },
  {
    src: '/images/lookbook-4.webp',
    fallback: '/images/fallback.svg',
    spanDesktop: '',
    caption: 'Festive Mood',
  },
  {
    src: '/images/lookbook-5.webp',
    fallback: '/images/fallback.svg',
    // Desktop: wide bottom tile; Mobile: full-width
    spanDesktop: 'sm:col-span-2',
    caption: 'Everyday Grace',
  },
];

export default function Lookbook() {
  const [siteContent, setSiteContent] = useState(null);

  useEffect(() => {
    const fetchContent = async () => {
      const data = await dbService.getSiteContent();
      setSiteContent(data);
    };
    fetchContent();
  }, []);

  const config = siteContent?.lookbookConfig;

  // Merge DB images with defaults; always carry the fallback from defaults
  const images = defaultImages.map((def, idx) => {
    const dynamicImg = config?.images?.[idx];
    return {
      ...def,
      src: dynamicImg?.src || def.src,
      caption: dynamicImg?.caption || def.caption,
      fallback: def.fallback, // always keep the local fallback
    };
  });

  return (
    <section id="lookbook" className="bg-cream py-12 sm:py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">

        {/* Section header */}
        <div className="mb-8 flex flex-col items-start justify-between gap-3 sm:mb-14 sm:flex-row sm:items-end sm:gap-6">
          <div>
            <span className="text-[10px] tracking-[0.25em] text-sage uppercase sm:text-xs sm:tracking-[0.3em]">
              {config?.eyebrow || 'Editorial'}
            </span>
            <h2 className="mt-2 font-serif text-2xl font-medium text-ink sm:mt-3 sm:text-4xl lg:text-5xl">
              {config?.title || 'The Lookbook'}
            </h2>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-1.5 text-sm tracking-wide text-burgundy no-underline transition-colors hover:text-terracotta"
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
          </Link>
        </div>

        {/*
          Mobile: simple 2-col uniform grid (no col/row spans).
          Tablet+: 4-col grid with the original feature spans restored via sm: prefix.
        */}
        <div className="grid grid-cols-2 gap-2.5 sm:auto-rows-[240px] sm:gap-4 sm:grid-cols-4 lg:gap-5">
          {images.map((img) => (
            <div
              key={img.caption}
              className={`group relative overflow-hidden rounded-xl sm:rounded-2xl ${img.spanDesktop}`}
            >
              {/* On mobile use aspect ratio; on sm+ the grid auto-rows controls height */}
              <div className="aspect-[3/4] sm:h-full sm:aspect-auto">
                <img
                  src={img.src}
                  alt={img.caption}
                  onError={(e) => {
                    e.target.src = img.fallback || '/images/fallback.svg';
                  }}
                  className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              {/* Overlay: subtle always-on on mobile, hover-triggered on desktop */}
              <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-ink/10 to-transparent sm:bg-ink/0 sm:transition-colors sm:duration-300 sm:group-hover:bg-ink/20" />
              {/* Caption: always visible on mobile, hover-only on desktop */}
              <span className="absolute bottom-3 left-3 text-[11px] tracking-[0.15em] text-cream uppercase opacity-100 sm:bottom-4 sm:left-4 sm:text-xs sm:tracking-[0.2em] sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
                {img.caption}
              </span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

