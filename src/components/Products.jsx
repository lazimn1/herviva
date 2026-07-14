import { useState, useEffect } from 'react';
import { dbService } from '../services/dbService';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { formatPrice } from '../utils/formatPrice';

const filters = ['All', 'Kurtas', 'Tunics', 'Fusion', 'Occasion', 'Essentials'];

export default function Products() {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [activeFilter, setActiveFilter] = useState('All');
  const [hoveredId, setHoveredId] = useState(null);
  const [sizePicker, setSizePicker] = useState(null);
  const [products, setProducts] = useState([]);
  const [shopHeader, setShopHeader] = useState({
    tag: 'Shop', title: 'New Arrivals', description: 'Pieces designed to drape beautifully, feel luxurious, and become staples in your wardrobe.'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [dbProducts, siteData] = await Promise.all([
        dbService.getProducts(),
        dbService.getSiteContent()
      ]);
      // Only show active products on storefront
      const activeProducts = dbProducts.filter(p => p.status !== 'Draft');
      
      const formattedProducts = activeProducts.map(p => ({
        ...p,
        category: p.category || 'Essentials',
        sizes: p.sizes || ['S', 'M', 'L', 'XL'],
        fallback: '/images/fallback.svg'
      }));
      // Remove duplicate products based on image and name to ensure uniqueness
      const seen = new Set();
      const uniqueProducts = formattedProducts.filter(p => {
        const key = `${p.image}|${p.name}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      setProducts(uniqueProducts);
      
      if (siteData?.shopHeader) {
        setShopHeader(siteData.shopHeader);
      }
      
      setLoading(false);
    };
    fetchData();
  }, []);

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
            {shopHeader.tag}
          </span>
          <h2 className="mt-3 font-serif text-3xl font-medium text-ink sm:text-4xl lg:text-5xl">
            {shopHeader.title}
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm text-muted">
            {shopHeader.description}
          </p>
        </div>

        {/* Mobile Horizontal Scroll Filters | Desktop Wrap */}
        <div className="-mx-5 mb-8 flex overflow-x-auto px-5 pb-4 sm:mx-0 sm:mb-10 sm:flex-wrap sm:justify-center sm:px-0 sm:pb-0 gap-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setActiveFilter(f)}
              className={[
                'shrink-0 cursor-pointer rounded-full border px-4 py-1.5 text-[11px] sm:px-5 sm:py-2 sm:text-xs tracking-wide transition-all',
                activeFilter === f
                  ? 'border-burgundy bg-burgundy text-cream'
                  : 'border-cream-dark bg-cream text-muted hover:border-sage hover:text-ink',
              ].join(' ')}
            >
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-burgundy"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted">
            No products found in this category.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
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
              <div className="relative aspect-[3/4] overflow-hidden rounded-xl sm:rounded-2xl bg-cream">
                <img
                  src={product.image}
                  alt={product.name}
                  onError={(e) => {
                    e.target.src = product.fallback;
                  }}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {product.badge && (
                  <span className="absolute top-2 left-2 sm:top-3 sm:left-3 rounded-full bg-cream/90 px-2 py-0.5 sm:px-2.5 sm:py-1 text-[9px] sm:text-[10px] font-medium tracking-wide text-burgundy backdrop-blur-sm z-10">
                    {product.badge}
                  </span>
                )}

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    toggleWishlist(product.id);
                  }}
                  className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10 flex h-7 w-7 sm:h-8 sm:w-8 cursor-pointer items-center justify-center rounded-full bg-cream/90 backdrop-blur-sm transition-transform hover:scale-110"
                  aria-label={isInWishlist(product.id) ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <svg
                    className={`h-3.5 w-3.5 sm:h-4 sm:w-4 transition-colors ${isInWishlist(product.id) ? 'fill-burgundy text-burgundy' : 'fill-transparent text-ink/70'}`}
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                    />
                  </svg>
                </button>

                {sizePicker === product.id ? (
                  <div className="absolute right-2 bottom-2 left-2 sm:right-3 sm:bottom-3 sm:left-3 rounded-xl sm:rounded-2xl bg-cream/95 p-2 sm:p-3 backdrop-blur-sm">
                    <p className="mb-1.5 sm:mb-2 text-center text-[9px] sm:text-[10px] tracking-wide text-muted uppercase">
                      Select size
                    </p>
                    <div className="flex flex-wrap justify-center gap-1 sm:gap-1.5">
                      {product.sizes.map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => handleAdd(product, size)}
                          className="cursor-pointer rounded-full border border-cream-dark px-2 py-1 text-[9px] sm:px-3 sm:py-1.5 sm:text-xs transition-colors hover:border-burgundy hover:bg-burgundy hover:text-cream"
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
                    className="absolute right-2 bottom-2 left-2 sm:right-3 sm:bottom-3 sm:left-3 cursor-pointer rounded-full bg-ink/85 py-1.5 sm:py-2.5 text-[10px] sm:text-xs font-medium tracking-wide text-cream backdrop-blur-sm transition-all lg:translate-y-2 lg:opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
                  >
                    Add to Bag
                  </button>
                )}
              </div>
              <div className="mt-3 sm:mt-4">
                <p className="text-[10px] sm:text-[11px] tracking-wide text-muted uppercase">
                  {product.category}
                </p>
                <h3 className="mt-0.5 sm:mt-1 font-serif text-base sm:text-lg text-ink truncate">
                  {product.name}
                </h3>
                <div className="mt-1 sm:mt-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-ink">
                    {formatPrice(product.price)}
                  </span>
                  <span className="text-[9px] sm:text-[10px] text-muted truncate ml-2">
                    {product.sizes.join(' · ')}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
        )}
      </div>
    </section>
  );
}
