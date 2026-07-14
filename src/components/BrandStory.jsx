import { useState, useEffect } from 'react';
import { dbService } from '../services/dbService';

export default function BrandStory() {
  const [siteContent, setSiteContent] = useState(null);

  useEffect(() => {
    const fetchContent = async () => {
      const data = await dbService.getSiteContent();
      setSiteContent(data);
    };
    fetchContent();
  }, []);

  return (
    <section id="story" className="overflow-hidden bg-olive py-12 sm:py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="grid items-center gap-10 sm:grid-cols-2 sm:gap-12 lg:grid-cols-2 lg:gap-20">

          {/* Image column */}
          <div className="relative pb-10 sm:pb-12">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <img
                src={siteContent?.aboutUsConfig?.image1 || "/images/brand-story-1.webp"}
                alt="Fabric detail"
                onError={(e) => {
                  e.target.src = '/images/fallback.svg';
                }}
                className="aspect-[3/4] w-full rounded-xl object-cover sm:rounded-2xl"
              />
              <img
                src={siteContent?.aboutUsConfig?.image2 || "/brand-board.png"}
                alt="herviva brand"
                onError={(e) => {
                  e.target.src = '/images/fallback.svg';
                }}
                className="mt-6 aspect-[3/4] w-full rounded-xl object-cover sm:mt-8 sm:rounded-2xl"
              />
            </div>
            {/* Stat badge — anchored to bottom of image grid */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-xl bg-terracotta px-5 py-3 text-center shadow-xl sm:-bottom-6 sm:rounded-2xl sm:px-8 sm:py-5 lg:left-auto lg:right-0 lg:translate-x-0">
              <p className="font-serif text-2xl text-cream sm:text-3xl">
                {siteContent?.aboutUsConfig?.years || "8+"}
              </p>
              <p className="text-[11px] tracking-wide text-cream/80 sm:text-xs">
                {siteContent?.aboutUsConfig?.yearsText || "Years of craft"}
              </p>
            </div>
          </div>

          {/* Text column */}
          <div className="pt-4 sm:pt-0">
            <span className="text-[10px] tracking-[0.25em] text-sage uppercase sm:text-xs sm:tracking-[0.3em]">
              {siteContent?.aboutUsConfig?.subtitle || "Our Story"}
            </span>
            <h2 className="mt-2 font-serif text-2xl leading-tight font-medium text-cream sm:mt-3 sm:text-4xl lg:text-5xl">
              {siteContent?.aboutUsConfig?.title || "Woven with intention,\nmade for every her"}
            </h2>
            <div className="mt-4 text-[13px] leading-relaxed text-cream/75 sm:mt-6 sm:text-base">
              {siteContent?.aboutUs || (
                <>
                  <p>
                    herviva was born from a simple belief: every woman deserves a
                    wardrobe that feels as beautiful as she is. We blend the richness
                    of South Asian craftsmanship with clean, contemporary silhouettes
                    — creating pieces that honour tradition while embracing the rhythm
                    of modern life.
                  </p>
                  <p className="mt-3 sm:mt-4">
                    From hand-selected linens to artisanal embroideries, each garment
                    is designed to drape effortlessly, layer beautifully, and become a
                    cherished part of your everyday story.
                  </p>
                </>
              )}
            </div>

            <div className="mt-8 grid grid-cols-3 gap-4 border-t border-cream/15 pt-8 sm:mt-10 sm:gap-6 sm:pt-10">
              {[
                { stat: '100%', label: 'Natural fabrics' },
                { stat: '50+', label: 'Unique designs' },
                { stat: '4.9', label: 'Customer rating' },
              ].map((item) => (
                <div key={item.label}>
                  <p className="font-serif text-xl text-terracotta sm:text-3xl">
                    {item.stat}
                  </p>
                  <p className="mt-0.5 text-[11px] text-cream/60 sm:mt-1 sm:text-xs">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
