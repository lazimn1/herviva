import { useState, useEffect } from 'react';
import { dbService } from '../services/dbService';

const reviews = [
  {
    name: 'Priya M.',
    location: 'Mumbai',
    text: "The Sage Linen Kurta is absolutely stunning. The fabric quality is exceptional and it drapes like a dream. I've already ordered two more pieces!",
    rating: 5,
    product: 'Sage Linen Kurta',
  },
  {
    name: 'Ananya K.',
    location: 'Bangalore',
    text: 'Finally found a brand that understands fusion wear. Every piece feels premium without being over the top. herviva is my go-to for work and weekends.',
    rating: 5,
    product: 'Terracotta Flow Tunic',
  },
  {
    name: 'Rhea S.',
    location: 'Delhi',
    text: "Wore the Burgundy Festive Set to my sister's wedding and received so many compliments. The embroidery detail is exquisite. Worth every rupee.",
    rating: 5,
    product: 'Burgundy Festive Set',
  },
];

function Stars({ count }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <svg
          key={i}
          className="h-3.5 w-3.5 text-terracotta"
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
  const displayReviews = config?.reviewsList?.length > 0 ? config.reviewsList : reviews;

  return (
    <section id="reviews" className="bg-burgundy/5 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mb-14 text-center">
          <span className="text-xs tracking-[0.3em] text-sage uppercase">
            {eyebrow}
          </span>
          <h2 className="mt-3 font-serif text-3xl font-medium text-ink sm:text-4xl">
            {title}
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {displayReviews.map((review, index) => (
            <blockquote
              key={index}
              className="flex flex-col rounded-2xl border border-cream-dark bg-cream p-7"
            >
              <Stars count={review.rating} />
              <p className="mt-5 flex-1 text-sm leading-relaxed text-ink/80 italic">
                &ldquo;{review.text}&rdquo;
              </p>
              <footer className="mt-6 border-t border-cream-dark pt-5">
                <p className="text-sm font-medium text-ink">{review.name}</p>
                <p className="text-xs text-muted">
                  {review.location} · {review.product}
                </p>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
