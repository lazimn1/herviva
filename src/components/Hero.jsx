import { useState, useEffect, useCallback } from 'react';
import { dbService } from '../services/dbService';
import { Link } from 'react-router-dom';

const slides = [
  {
    image:
      '/images/hero-1.webp',
    fallback: '/images/fallback.svg',
    tag: 'New Season',
    title: 'Effortless elegance,\ncrafted for every her',
    sub: 'Discover flowing silhouettes and timeless pieces that move with you.',
  },
  {
    image:
      '/images/hero-2.webp',
    fallback: '/images/fallback.svg',
    tag: 'Fusion Edit',
    title: 'Where tradition\nmeets modern grace',
    sub: 'Contemporary kurtas and tunics reimagined for the woman of today.',
  },
  {
    image:
      '/images/hero-3.webp',
    fallback: '/images/fallback.svg',
    tag: 'The Collection',
    title: 'Your wardrobe,\nreimagined',
    sub: 'Premium fabrics, thoughtful details, and silhouettes made to last.',
  },
];

export default function Hero() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [siteContent, setSiteContent] = useState(null);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  useEffect(() => {
    const fetchContent = async () => {
      const data = await dbService.getSiteContent();
      setSiteContent(data);
    };
    fetchContent();
  }, []);

  const displaySlides = siteContent?.heroSlides?.length > 0 ? siteContent.heroSlides : slides;

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % displaySlides.length);
  }, [displaySlides.length]);

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + displaySlides.length) % displaySlides.length);
  }, [displaySlides.length]);

  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    if (isLeftSwipe) next();
    if (isRightSwipe) prev();
  };

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next, paused]);

  const slide = displaySlides[current];

  return (
    <section
      className="relative w-full overflow-hidden bg-olive"
      style={{ height: '100svh', minHeight: '520px' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {displaySlides.map((s, i) => (
        <div
          key={s.tag}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{
            opacity: i === current ? 1 : 0,
            zIndex: i === current ? 1 : 0,
          }}
        >
          <img
            src={s.image}
            alt=""
            onError={(e) => {
              e.target.src = s.fallback;
            }}
            className={`h-full w-full object-cover object-top sm:object-center ${i === current ? 'animate-slow-zoom' : ''}`}
          />
          {/* Stronger gradient on mobile for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/35 to-ink/5 sm:from-ink/75 sm:via-ink/25 sm:to-ink/10" />
        </div>
      ))}

      <div className="absolute inset-0 z-10 flex flex-col justify-end px-5 pb-16 sm:px-12 sm:pb-24 lg:px-16">
        <div className="max-w-2xl animate-fade-up" key={current}>
          <span className="mb-3 inline-block text-[10px] tracking-[0.25em] text-cream/70 uppercase sm:mb-4 sm:text-xs sm:tracking-[0.3em]">
            {slide.tag}
          </span>
          <h1 className="font-serif text-[1.85rem] leading-[1.1] font-medium whitespace-pre-line text-cream sm:text-5xl lg:text-6xl">
            {slide.title}
          </h1>
          <p className="mt-3 max-w-sm text-[13px] leading-relaxed font-light text-cream/80 sm:mt-5 sm:max-w-md sm:text-base">
            {slide.sub}
          </p>
          <div className="mt-6 flex flex-col gap-2.5 xs:flex-row xs:flex-wrap sm:mt-8 sm:flex-row sm:gap-3">
            <Link
              to="/shop"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-terracotta px-6 py-2.5 text-sm font-medium tracking-wide text-cream no-underline transition-all hover:bg-terracotta/90 hover:shadow-lg sm:px-7 sm:py-3"
            >
              Shop Now
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
            <a
              href="#collections"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-cream/40 bg-cream/10 px-6 py-2.5 text-sm font-medium tracking-wide text-cream no-underline backdrop-blur-sm transition-all hover:bg-cream/20 sm:px-7 sm:py-3"
            >
              View Collections
            </a>
          </div>
        </div>
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-5 right-5 z-20 flex items-center gap-3 sm:bottom-8 sm:right-12 sm:gap-4">
        <span className="text-[10px] tabular-nums text-cream/50 sm:text-xs">
          {String(current + 1).padStart(2, '0')} /{' '}
          {String(displaySlides.length).padStart(2, '0')}
        </span>
        <div className="flex gap-1.5 sm:gap-2">
          {displaySlides.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => setCurrent(i)}
              className="h-1 rounded-full transition-all duration-300 sm:h-1.5"
              style={{
                width: i === current ? '24px' : '5px',
                backgroundColor:
                  i === current
                    ? 'var(--color-terracotta)'
                    : 'rgba(247,243,237,0.4)',
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
