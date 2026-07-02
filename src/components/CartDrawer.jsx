import { Link } from 'react-router-dom';
import { formatPrice } from '../utils/formatPrice';
import { FREE_SHIPPING_MIN, SHIPPING_FLAT } from '../data/products';

export default function CartDrawer({
  open,
  items,
  subtotal,
  onClose,
  onRemove,
  onUpdateQty,
}) {
  const shipping =
    subtotal >= FREE_SHIPPING_MIN ? 0 : items.length ? SHIPPING_FLAT : 0;
  const total = subtotal + shipping;

  return (
    <>
      <div
        className={[
          'fixed inset-0 z-[60] bg-ink/40 backdrop-blur-sm transition-opacity duration-300',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        ].join(' ')}
        onClick={onClose}
      />
      <div
        className={[
          'fixed top-0 right-0 z-[70] flex h-full w-full max-w-md flex-col bg-cream shadow-2xl transition-transform duration-400',
          open ? 'translate-x-0' : 'translate-x-full',
        ].join(' ')}
      >
        <div className="flex h-[68px] items-center justify-between border-b border-cream-dark px-6">
          <h2 className="font-serif text-xl text-ink">
            Your Bag ({items.length})
          </h2>
          <button
            type="button"
            aria-label="Close bag"
            onClick={onClose}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-cream-dark transition-colors hover:bg-sage/10"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <svg
                className="mb-4 h-12 w-12 text-muted/40"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z"
                />
              </svg>
              <p className="text-sm text-muted">Your bag is empty</p>
              <button
                type="button"
                onClick={onClose}
                className="mt-4 cursor-pointer rounded-full bg-burgundy px-6 py-2.5 text-xs font-medium tracking-wide text-cream"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {items.map((item) => (
                <div key={item.lineKey} className="flex gap-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    onError={(e) => {
                      e.target.src =
                        'https://via.placeholder.com/80x100?text=Item';
                    }}
                    className="h-24 w-20 rounded-xl object-cover"
                  />
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-ink">
                          {item.name}
                        </h3>
                        <p className="text-xs text-muted">
                          {item.category} · Size {item.size}
                        </p>
                      </div>
                      <button
                        type="button"
                        aria-label="Remove item"
                        onClick={() => onRemove(item.lineKey)}
                        className="cursor-pointer border-0 bg-transparent text-muted transition-colors hover:text-burgundy"
                      >
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
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center gap-2 rounded-full border border-cream-dark">
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateQty(item.lineKey, item.qty - 1)
                          }
                          className="flex h-7 w-7 cursor-pointer items-center justify-center border-0 bg-transparent text-ink"
                        >
                          −
                        </button>
                        <span className="text-xs tabular-nums">{item.qty}</span>
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateQty(item.lineKey, item.qty + 1)
                          }
                          className="flex h-7 w-7 cursor-pointer items-center justify-center border-0 bg-transparent text-ink"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-sm font-medium">
                        {formatPrice(item.price * item.qty)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-cream-dark px-6 py-5">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-sm text-muted">Subtotal</span>
              <span className="text-sm">{formatPrice(subtotal)}</span>
            </div>
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-muted">Shipping</span>
              <span className="text-sm">
                {shipping === 0 ? 'Free' : formatPrice(shipping)}
              </span>
            </div>
            <div className="mb-4 flex items-center justify-between border-t border-cream-dark pt-3">
              <span className="text-sm text-muted">Total</span>
              <span className="font-serif text-xl text-ink">
                {formatPrice(total)}
              </span>
            </div>
            <Link
              to="/checkout"
              onClick={onClose}
              className="block w-full rounded-full bg-burgundy py-3.5 text-center text-sm font-medium tracking-wide text-cream no-underline transition-colors hover:bg-burgundy/90"
            >
              Checkout
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
