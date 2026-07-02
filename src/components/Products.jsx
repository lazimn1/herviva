import { useState } from 'react';
import { products } from '../data/products';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/formatPrice';

const filters = ['All', 'Kurtas', 'Tunics', 'Fusion', 'Occasion', 'Essentials'];

export default function Products() {
  const { addToCart } = useCart();
  const [activeFilter, setActiveFilter] = useState('All');
  const [hoveredId, setHoveredId] = useState(null);
  const [sizePicker, setSizePicker] = useState(null);

  const filtered =
    activeFilter === 'All'
      ? products
      : products.filter((p) => {
          const cat = p.category.toLowerCase();
          const filter = activeFilter.toLowerCase();
          return (
            cat.includes(filter) ||
            (filter === 'essentials' && cat === 'essentials')
          );
        });

  const handleAdd = (product, size) => {
    addToCart(product, size);
    setSizePicker(null);
  };

  return (
    <section id="shop" className="bg-cream-dark/40 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mb-12 text-center">
          <span className="text-xs tracking-[0.3em] text-sage uppercase">
            Shop
          </span>
          <h2 className="mt-3 font-serif text-3xl font-medium text-ink sm:text-4xl lg:text-5xl">
            New Arrivals
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm text-muted">
            Pieces designed to drape beautifully, feel luxurious, and become
            staples in your wardrobe.
          </p>
        </div>

        <div className="mb-10 flex flex-wrap justify-center gap-2">
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setActiveFilter(f)}
              className={[
                'cursor-pointer rounded-full border px-5 py-2 text-xs tracking-wide transition-all',
                activeFilter === f
                  ? 'border-burgundy bg-burgundy text-cream'
                  : 'border-cream-dark bg-cream text-muted hover:border-sage hover:text-ink',
              ].join(' ')}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((product) => (
            <article
              key={product.id}
              className="group"
              onMouseEnter={() => setHoveredId(product.id)}
              onMouseLeave={() => {
                setHoveredId(null);
                if (sizePicker === product.id) setSizePicker(null);
              }}
            >
              <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-cream">
                <img
                  src={product.image}
                  alt={product.name}
                  onError={(e) => {
                    e.target.src = product.fallback;
                  }}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {product.badge && (
                  <span className="absolute top-3 left-3 rounded-full bg-cream/90 px-2.5 py-1 text-[10px] font-medium tracking-wide text-burgundy backdrop-blur-sm">
                    {product.badge}
                  </span>
                )}

                {sizePicker === product.id ? (
                  <div className="absolute right-3 bottom-3 left-3 rounded-2xl bg-cream/95 p-3 backdrop-blur-sm">
                    <p className="mb-2 text-center text-[10px] tracking-wide text-muted uppercase">
                      Select size
                    </p>
                    <div className="flex flex-wrap justify-center gap-1.5">
                      {product.sizes.map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => handleAdd(product, size)}
                          className="cursor-pointer rounded-full border border-cream-dark px-3 py-1.5 text-xs transition-colors hover:border-burgundy hover:bg-burgundy hover:text-cream"
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setSizePicker(product.id)}
                    className={[
                      'absolute right-3 bottom-3 left-3 cursor-pointer rounded-full bg-ink/85 py-2.5 text-xs font-medium tracking-wide text-cream backdrop-blur-sm transition-all',
                      hoveredId === product.id
                        ? 'translate-y-0 opacity-100'
                        : 'translate-y-2 opacity-0 sm:opacity-100 sm:translate-y-0',
                    ].join(' ')}
                  >
                    Add to Bag
                  </button>
                )}
              </div>
              <div className="mt-4">
                <p className="text-[11px] tracking-wide text-muted uppercase">
                  {product.category}
                </p>
                <h3 className="mt-1 font-serif text-lg text-ink">
                  {product.name}
                </h3>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-ink">
                    {formatPrice(product.price)}
                  </span>
                  <span className="text-[10px] text-muted">
                    {product.sizes.join(' · ')}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
