import { useState } from 'react';
import { trackOrders } from '../utils/api';
import { formatPrice } from '../utils/formatPrice';

export default function TrackOrders() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orders, setOrders] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError('');
    setOrders(null);

    try {
      const data = await trackOrders(email.trim());
      setOrders(data.orders);
    } catch (err) {
      setError(err.message || 'Failed to find orders for this email.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'paid': return 'Payment Successful';
      case 'confirmed': return 'Order Confirmed (COD)';
      case 'pending_payment': return 'Payment Pending';
      default: return status;
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-20 min-h-[70vh]">
      <div className="text-center mb-12">
        <h1 className="font-serif text-3xl text-ink sm:text-5xl">Track Your Orders</h1>
        <p className="mt-4 text-sm text-muted max-w-md mx-auto">
          Enter the email address you used during checkout to view your order history and current status.
        </p>
      </div>

      <div className="max-w-md mx-auto">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            className="flex-1 rounded-full border border-cream-dark bg-cream px-5 py-3 text-sm text-ink outline-none transition-colors focus:border-sage"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-burgundy px-6 py-3 text-sm font-medium tracking-wide text-cream transition-colors hover:bg-burgundy/90 disabled:opacity-70 cursor-pointer"
          >
            {loading ? 'Searching...' : 'Track'}
          </button>
        </form>
        {error && <p className="mt-4 text-center text-sm text-burgundy">{error}</p>}
      </div>

      {orders !== null && (
        <div className="mt-16 space-y-8">
          <h2 className="font-serif text-2xl text-ink mb-6">
            {orders.length === 0 ? 'No orders found' : `Your Orders (${orders.length})`}
          </h2>
          
          {orders.map((order) => {
            // Calculate a mock 18% GST display based on subtotal
            const gstAmount = order.subtotal * 0.18;
            
            return (
              <div key={order.id} className="rounded-2xl border border-cream-dark bg-cream p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-cream-dark pb-6">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted mb-1">Order #{order.id}</p>
                    <p className="text-sm font-medium text-ink">
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'long', day: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="inline-block rounded-full bg-sage/10 px-4 py-1.5 text-xs font-medium text-sage text-center">
                    {getStatusText(order.status)}
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex gap-4">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-16 h-20 object-cover rounded-lg bg-cream-dark"
                        onError={(e) => { e.target.src = '/images/fallback.svg'; }}
                      />
                      <div className="flex-1">
                        <p className="font-medium text-ink text-sm">{item.name}</p>
                        <p className="text-xs text-muted mt-1">Size: {item.size} | Qty: {item.qty}</p>
                      </div>
                      <div className="text-sm font-medium text-ink">
                        {formatPrice(item.price * item.qty)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 border-t border-cream-dark pt-5 text-sm w-full sm:w-64 sm:ml-auto">
                  <div className="flex justify-between text-muted">
                    <span>Subtotal</span>
                    <span>{formatPrice(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-muted">
                    <span>Estimated GST (18%)</span>
                    <span>{formatPrice(gstAmount)}</span>
                  </div>
                  <div className="flex justify-between text-muted">
                    <span>Shipping</span>
                    <span>{order.shipping === 0 ? 'Free' : formatPrice(order.shipping)}</span>
                  </div>
                  <div className="flex justify-between border-t border-cream-dark pt-3 font-medium text-ink text-base">
                    <span>Total Paid</span>
                    <span>{formatPrice(order.total)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
