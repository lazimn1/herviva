import React, { useState, useEffect } from 'react';
import { dbService } from '../services/dbService';
import { Link } from 'react-router-dom';

const defaultCollections = [
  {
    title: 'Kurtas & Tunics',
    desc: 'Flowing fabrics, artisanal prints',
    image:
      '/images/collection-1.webp',
    fallback: '/images/fallback.svg',
    color: 'bg-sage/20',
    accent: 'text-sage-dark',
  },
  {
    title: 'Fusion Wear',
    desc: 'East meets west, effortlessly',
    image:
      '/images/collection-2.webp',
    fallback: '/images/fallback.svg',
    color: 'bg-terracotta/15',
    accent: 'text-terracotta',
  },
  {
    title: 'Occasion Edit',
    desc: 'Festive, formal & celebratory',
    image:
      '/images/collection-3.webp',
    fallback: '/images/fallback.svg',
    color: 'bg-burgundy/10',
    accent: 'text-burgundy',
  },
  {
    title: 'Everyday Essentials',
    desc: 'Comfort meets quiet luxury',
    image:
      '/images/collection-4.webp',
    fallback: '/images/fallback.svg',
    color: 'bg-tan/20',
    accent: 'text-ink',
  },
];

export default function Collections() {
  const [siteContent, setSiteContent] = useState(null);

  useEffect(() => {
    const fetchContent = async () => {
      const data = await dbService.getSiteContent();
      setSiteContent(data);
    };
    fetchContent();
  }, []);

  const displayCollections = siteContent?.collections?.length > 0 ? siteContent.collections : defaultCollections;

  return (
    <section id="collections" className="bg-cream py-12 sm:py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        {/* Section header */}
        <div className="mb-8 flex flex-col items-start justify-between gap-3 sm:mb-14 sm:flex-row sm:items-end sm:gap-6">
          <div>
            <span className="text-[10px] tracking-[0.25em] text-sage uppercase sm:text-xs sm:tracking-[0.3em]">
              Curated For You
            </span>
            <h2 className="mt-2 font-serif text-2xl font-medium text-ink sm:mt-3 sm:text-4xl lg:text-5xl">
              Our Collections
            </h2>
          </div>
          <p className="max-w-xs text-[13px] leading-relaxed text-muted sm:max-w-sm sm:text-sm">
            Each piece is thoughtfully designed to celebrate the modern woman —
            rooted in heritage, made for today.
          </p>
        </div>

        {/* 2-col on mobile, 2-col sm, 4-col lg */}
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {displayCollections.map((col, i) => (
            <Link
              key={col.title}
              to="/shop"
              className="group relative overflow-hidden rounded-xl no-underline sm:rounded-2xl"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {/* Shorter aspect on mobile so cards don't overflow screen */}
              <div className="aspect-[3/4] overflow-hidden sm:aspect-[3/4]">
                <img
                  src={col.image}
                  alt={col.title}
                  onError={(e) => {
                    e.target.src = col.fallback || '/images/fallback.svg';
                  }}
                  className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              {/* Stronger gradient on mobile */}
              <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent sm:from-ink/70 sm:via-ink/10" />
              {/* Badge — smaller on mobile */}
              <div
                className={`absolute top-2.5 left-2.5 rounded-full px-2 py-0.5 text-[9px] tracking-wider uppercase sm:top-4 sm:left-4 sm:px-3 sm:py-1 sm:text-[10px] ${col.color} ${col.accent} backdrop-blur-sm`}
              >
                Collection
              </div>
              {/* Card text */}
              <div className="absolute right-0 bottom-0 left-0 p-3 sm:p-5">
                <h3 className="font-serif text-base leading-tight text-cream sm:text-2xl">
                  {col.title}
                </h3>
                <p className="mt-0.5 text-[11px] text-cream/70 sm:mt-1 sm:text-xs">{col.desc}</p>
                {/* Always visible on mobile (no hover on touch), hover-only on desktop */}
                <span className="mt-2 inline-flex items-center gap-1 text-[11px] tracking-wide text-cream/90 opacity-100 transition-opacity sm:mt-3 sm:text-xs sm:opacity-0 sm:group-hover:opacity-100">
                  Explore
                  <svg
                    className="h-3 w-3 sm:h-3.5 sm:w-3.5"
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
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
