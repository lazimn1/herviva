import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { dbService } from '../services/dbService';
import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/formatPrice';

export default function WishlistPage() {
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlistProducts = async () => {
      setLoading(true);
      const allProducts = await dbService.getProducts();
      // Filter out products that are in the wishlist array
      const likedProducts = allProducts.filter(p => wishlist.includes(p.id));
      
      const formatted = likedProducts.map(p => ({
        ...p,
        category: p.category || 'Essentials',
        sizes: p.sizes || ['S', 'M', 'L', 'XL'],
        fallback: '/images/fallback.svg'
      }));
      
      setProducts(formatted);
      setLoading(false);
    };

    fetchWishlistProducts();
  }, [wishlist]);

  return (
    <div className="pt-[68px] min-h-screen bg-cream-dark/40 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mb-12 text-center">
          <h2 className="mt-3 font-serif text-3xl font-medium text-ink sm:text-4xl lg:text-5xl">
            Your Wishlist
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm text-muted">
            {loading ? wishlist.length : products.length} {(loading ? wishlist.length : products.length) === 1 ? 'item' : 'items'} saved for later.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-burgundy"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted mb-6">You haven't saved any items yet.</p>
            <Link
              to="/shop"
              className="inline-block rounded-full bg-ink px-8 py-3 text-sm font-medium tracking-wide text-cream transition-colors hover:bg-burgundy"
            >
              Explore Collection
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <article key={product.id} className="group relative">
                <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-cream">
                  <img
                    src={product.image}
                    alt={product.name}
                    onError={(e) => {
                      e.target.src = product.fallback;
                    }}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      toggleWishlist(product.id);
                    }}
                    className="absolute top-3 right-3 z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-cream/90 backdrop-blur-sm transition-transform hover:scale-110"
                    aria-label="Remove from wishlist"
                  >
                    <svg
                      className="h-4 w-4 fill-burgundy text-burgundy transition-colors"
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

                  <button
                    type="button"
                    onClick={() => addToCart(product, product.sizes[0])}
                    className="absolute right-3 bottom-3 left-3 cursor-pointer rounded-full bg-ink/85 py-2.5 text-xs font-medium tracking-wide text-cream backdrop-blur-sm transition-all opacity-0 translate-y-2 group-hover:translate-y-0 group-hover:opacity-100"
                  >
                    Move to Bag
                  </button>
                </div>
                <div className="mt-4">
                  <p className="text-[11px] tracking-wide text-muted uppercase">
                    {product.category}
                  </p>
                  <Link to="/shop" className="no-underline">
                    <h3 className="mt-1 font-serif text-lg text-ink hover:text-burgundy transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-ink">
                      {formatPrice(product.price)}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
