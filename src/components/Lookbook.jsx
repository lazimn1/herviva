import { useState, useEffect } from 'react';
import { dbService } from '../services/dbService';
import { Link } from 'react-router-dom';

const defaultImages = [
  {
    src: '/images/lookbook-1.webp',
    fallback: '/images/fallback.svg',
    span: 'col-span-2 row-span-2',
    caption: 'The Fusion Edit',
  },
  {
    src: '/images/lookbook-2.webp',
    fallback: '/images/fallback.svg',
    span: '',
    caption: 'Soft Drapes',
  },
  {
    src: '/images/lookbook-3.webp',
    fallback: '/images/fallback.svg',
    span: '',
    caption: 'Natural Light',
  },
  {
    src: '/images/lookbook-4.webp',
    fallback: '/images/fallback.svg',
    span: '',
    caption: 'Festive Mood',
  },
  {
    src: '/images/lookbook-5.webp',
    fallback: '/images/fallback.svg',
    span: 'col-span-2',
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
      caption: dynamicImg?.caption || def.caption
    };
  });

  return (
    <section id="lookbook" className="bg-cream py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mb-14 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <span className="text-xs tracking-[0.3em] text-sage uppercase">
              {config?.eyebrow || 'Editorial'}
            </span>
            <h2 className="mt-3 font-serif text-3xl font-medium text-ink sm:text-4xl lg:text-5xl">
              {config?.title || 'The Lookbook'}
            </h2>
          </div>
          <Link
            to="/shop"
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
          </Link>
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
