import { useState, useEffect } from 'react';
import { dbService } from '../services/dbService';
import { Link } from 'react-router-dom';

const defaultImages = [
  {
    src: '/images/lookbook-1.webp',
    fallback: '/images/fallback.svg',
    // Desktop: large feature tile (col 2 + row 2)
    spanDesktop: 'sm:col-span-2 sm:row-span-2',
    caption: 'The Fusion Edit',
  },
  {
    src: '/images/lookbook-2.webp',
    fallback: '/images/fallback.svg',
    // Desktop: top right small
    spanDesktop: 'sm:col-span-1',
    caption: 'Soft Drapes',
  },
  {
    src: '/images/lookbook-3.webp',
    fallback: '/images/fallback.svg',
    // Desktop: top right small
    spanDesktop: 'sm:col-span-1',
    caption: 'Natural Light',
  },
  {
    src: '/images/lookbook-4.webp',
    fallback: '/images/fallback.svg',
    // Desktop: bottom right medium (fills the remaining 2 cols of row 2)
    spanDesktop: 'sm:col-span-2',
    caption: 'Festive Mood',
  },
  {
    src: '/images/lookbook-5.webp',
    fallback: '/images/fallback.svg',
    // Desktop: full width bottom landscape
    spanDesktop: 'sm:col-span-4 sm:h-[450px]',
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

  const images = defaultImages.map((def, idx) => {
    const dynamicImg = config?.images?.[idx];
    return {
      ...def,
      src: dynamicImg?.src || def.src,
      caption: dynamicImg?.caption || def.caption,
      fallback: def.fallback,
    };
  });

  return (
    <section id="lookbook" className="relative overflow-hidden bg-[#FAF9F6] py-16 sm:py-24 lg:py-32">
      {/* Decorative Background Text (Modern Luxury Touch) */}
      <div className="pointer-events-none absolute left-1/2 top-10 -translate-x-1/2 select-none opacity-[0.03]">
        <h2 className="font-serif text-[120px] font-bold leading-none tracking-tighter text-ink sm:text-[200px] lg:text-[280px]">
          EDITORIAL
        </h2>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-8">
        {/* Section header */}
        <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:mb-16 sm:flex-row sm:items-end sm:gap-6">
          <div className="max-w-xl">
            <span className="text-[10px] tracking-[0.3em] text-sage uppercase sm:text-xs sm:tracking-[0.4em]">
              {config?.eyebrow || 'Editorial'}
            </span>
            <h2 className="mt-3 font-serif text-3xl font-medium leading-tight text-ink sm:mt-4 sm:text-4xl lg:text-5xl">
              {config?.title || 'The Lookbook'}
            </h2>
            <p className="mt-3 text-sm text-ink/60 sm:mt-4 sm:text-base">
              A curated selection of our favorite silhouettes, styled for the modern muse.
            </p>
          </div>
          <Link
            to="/shop"
            className="group inline-flex items-center gap-2 border-b border-burgundy/30 pb-1 text-sm tracking-wide text-burgundy transition-all hover:border-terracotta hover:text-terracotta"
          >
            Shop the looks
            <svg
              className="h-4 w-4 transition-transform group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        {/* 
          MOBILE VIEW: Horizontal Snap Carousel
          A highly modern, app-like standard for mobile galleries.
        */}
        <div className="flex w-full snap-x snap-mandatory gap-4 overflow-x-auto pb-8 sm:hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {images.map((img) => (
            <div
              key={img.caption}
              className="relative aspect-[3/4] w-[85vw] shrink-0 snap-center overflow-hidden rounded-2xl shadow-sm"
            >
              <img
                src={img.src}
                alt={img.caption}
                onError={(e) => {
                  e.target.src = img.fallback || '/images/fallback.svg';
                }}
                className="h-full w-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/20 to-transparent" />
              <div className="absolute bottom-5 left-5">
                <span className="text-[10px] tracking-[0.2em] text-cream/80 uppercase">Look</span>
                <p className="mt-1 font-serif text-lg text-cream">{img.caption}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 
          DESKTOP VIEW: Perfect Asymmetrical Masonry Grid
          4 Columns. Fits the 5 images perfectly (2x2, 1x1, 1x1, 2x1, 4x1)
        */}
        <div className="hidden sm:grid sm:auto-rows-[280px] sm:grid-cols-4 sm:gap-4 lg:auto-rows-[340px] lg:gap-6">
          {images.map((img) => (
            <div
              key={img.caption}
              className={`group relative overflow-hidden rounded-2xl bg-gray-100 ${img.spanDesktop}`}
            >
              <img
                src={img.src}
                alt={img.caption}
                onError={(e) => {
                  e.target.src = img.fallback || '/images/fallback.svg';
                }}
                className="h-full w-full object-cover object-top transition-transform duration-1000 group-hover:scale-105"
              />
              {/* Elegant hover overlay */}
              <div className="absolute inset-0 bg-ink/0 transition-colors duration-500 group-hover:bg-ink/30" />
              <div className="absolute bottom-0 left-0 p-6 opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0 translate-y-4">
                <span className="text-xs tracking-[0.2em] text-cream/90 uppercase">Look</span>
                <p className="mt-1 font-serif text-xl text-cream">{img.caption}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

