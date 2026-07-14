import { useState, useEffect } from 'react';
import { dbService } from '../services/dbService';
import { Link } from 'react-router-dom';

const defaultImages = [
  {
    src: '/images/lookbook-1.webp',
    fallback: '/images/fallback.svg',
    // Large feature tile (col 2 + row 2)
    span: 'col-span-2 row-span-2',
    caption: 'The Fusion Edit',
  },
  {
    src: '/images/lookbook-2.webp',
    fallback: '/images/fallback.svg',
    // Top right small
    span: 'col-span-1',
    caption: 'Soft Drapes',
  },
  {
    src: '/images/lookbook-3.webp',
    fallback: '/images/fallback.svg',
    // Top right small
    span: 'col-span-1',
    caption: 'Natural Light',
  },
  {
    src: '/images/lookbook-4.webp',
    fallback: '/images/fallback.svg',
    // Bottom right medium
    span: 'col-span-2',
    caption: 'Festive Mood',
  },
  {
    src: '/images/lookbook-5.webp',
    fallback: '/images/fallback.svg',
    // Full width bottom landscape
    span: 'col-span-4 h-[180px] sm:h-[450px]',
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
      {/* Decorative Background Text */}
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
          UNIFIED VIEW: Perfect Asymmetrical Masonry Grid across all screens
          4 Columns. Fits the 5 images perfectly (2x2, 1x1, 1x1, 2x1, 4x1)
        */}
        <div className="grid auto-rows-[120px] grid-cols-4 gap-2 sm:auto-rows-[280px] sm:gap-4 lg:auto-rows-[340px] lg:gap-6">
          {images.map((img) => (
            <div
              key={img.caption}
              className={`group relative overflow-hidden rounded-xl bg-gray-100 sm:rounded-2xl ${img.span}`}
            >
              <img
                src={img.src}
                alt={img.caption}
                onError={(e) => {
                  e.target.src = img.fallback || '/images/fallback.svg';
                }}
                className="h-full w-full object-cover object-top transition-transform duration-1000 group-hover:scale-105"
              />
              
              {/* Overlay: Always slightly dark on mobile for readability, pure hover on desktop */}
              <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent sm:bg-ink/0 sm:bg-none sm:transition-colors sm:duration-500 sm:group-hover:bg-ink/30" />
              
              {/* Caption: Always visible on mobile, hover reveal on desktop */}
              <div className="absolute bottom-0 left-0 p-3 sm:p-6 opacity-100 sm:translate-y-4 sm:opacity-0 sm:transition-all sm:duration-500 sm:group-hover:translate-y-0 sm:group-hover:opacity-100">
                <span className="text-[8px] tracking-[0.2em] text-cream/90 uppercase sm:text-xs">Look</span>
                <p className="mt-0.5 font-serif text-[11px] leading-tight text-cream sm:mt-1 sm:text-xl">{img.caption}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

