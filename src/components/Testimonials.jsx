import { useState, useEffect } from 'react';
import { dbService } from '../services/dbService';

const reviews = [
  {
    id: 'rev-1',
    name: 'Priya M.',
    location: 'Mumbai',
    text: "The Sage Linen Kurta is absolutely stunning. The fabric quality is exceptional and it drapes like a dream. I've already ordered two more pieces!",
    rating: 5,
    product: 'Sage Linen Kurta',
    avatar: 'https://ui-avatars.com/api/?name=Priya+M&background=F3EBE6&color=4A3C31',
  },
  {
    id: 'rev-2',
    name: 'Ananya K.',
    location: 'Bangalore',
    text: 'Finally found a brand that understands fusion wear. Every piece feels premium without being over the top. herviva is my go-to for work and weekends.',
    rating: 5,
    product: 'Terracotta Flow Tunic',
    avatar: 'https://ui-avatars.com/api/?name=Ananya+K&background=F3EBE6&color=4A3C31',
  },
  {
    id: 'rev-3',
    name: 'Rhea S.',
    location: 'Delhi',
    text: "Wore the Burgundy Festive Set to my sister's wedding and received so many compliments. The embroidery detail is exquisite. Worth every rupee.",
    rating: 5,
    product: 'Burgundy Festive Set',
    avatar: 'https://ui-avatars.com/api/?name=Rhea+S&background=F3EBE6&color=4A3C31',
  },
];

function Stars({ count }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: count }).map((_, i) => (
        <svg
          key={i}
          className="h-4 w-4 text-[#C17767]"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function Testimonials() {
  const [siteContent, setSiteContent] = useState(null);

  useEffect(() => {
    const fetchContent = async () => {
      const data = await dbService.getSiteContent();
      setSiteContent(data);
    };
    fetchContent();
  }, []);

  const config = siteContent?.reviewsConfig;
  const eyebrow = config?.eyebrow || 'Love Letters';
  const title = config?.title || 'What Our Hervivas Say';
  
  // Map over DB reviews to ensure they have an ID and an avatar
  const displayReviews = (config?.reviewsList?.length > 0 ? config.reviewsList : reviews).map((rev, idx) => ({
    ...rev,
    id: rev.id || `db-rev-${idx}`,
    avatar: rev.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(rev.name || 'User')}&background=F3EBE6&color=4A3C31`
  }));

  return (
    <section id="reviews" className="bg-[#FAF9F6] py-16 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        
        {/* Header */}
        <div className="mb-10 text-center sm:mb-16">
          <span className="text-[10px] tracking-[0.3em] text-sage uppercase sm:text-xs sm:tracking-[0.4em]">
            {eyebrow}
          </span>
          <h2 className="mt-3 font-serif text-3xl font-medium leading-tight text-ink sm:mt-4 sm:text-4xl lg:text-5xl">
            {title}
          </h2>
        </div>

        {/* Mobile: Horizontal Snap Carousel | Desktop: Grid */}
        <div className="flex w-full snap-x snap-mandatory gap-4 overflow-x-auto pb-6 sm:grid sm:grid-cols-3 sm:gap-6 sm:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {displayReviews.map((review) => (
            <blockquote
              key={review.id}
              className="flex w-[85vw] shrink-0 snap-center flex-col justify-between rounded-2xl border border-cream-dark bg-white p-6 shadow-sm transition-shadow hover:shadow-md sm:w-auto sm:p-8"
            >
              <div>
                <Stars count={review.rating || 5} />
                <p className="mt-5 text-sm leading-relaxed text-ink/80 italic sm:text-base">
                  &ldquo;{review.text}&rdquo;
                </p>
              </div>
              
              <footer className="mt-8 flex items-center gap-4 border-t border-cream-dark pt-5">
                <img 
                  src={review.avatar} 
                  alt={review.name}
                  className="h-10 w-10 rounded-full object-cover shadow-sm"
                />
                <div>
                  <p className="text-sm font-semibold text-ink">{review.name}</p>
                  <p className="mt-0.5 text-[11px] text-ink/60 sm:text-xs">
                    {review.location} · {review.product}
                  </p>
                </div>
              </footer>
            </blockquote>
          ))}
        </div>


      </div>
    </section>
  );
}
