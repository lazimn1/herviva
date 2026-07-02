import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useRazorpay } from '../hooks/useRazorpay';
import { createOrder, verifyPayment } from '../utils/api';
import { formatPrice } from '../utils/formatPrice';
import { FREE_SHIPPING_MIN, SHIPPING_FLAT } from '../data/products';

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, subtotal, clearCart } = useCart();
  const { openCheckout } = useRazorpay();
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
    state: '',
  });

  const shipping = subtotal >= FREE_SHIPPING_MIN ? 0 : SHIPPING_FLAT;
  const total = subtotal + shipping;

  const updateField = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const buildCustomer = () => ({
    name: form.name.trim(),
    email: form.email.trim(),
    phone: form.phone.trim(),
    address: `${form.address.trim()}, ${form.city.trim()}, ${form.state.trim()} - ${form.pincode.trim()}`,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const items = cart.map(
        ({ id, name, price, qty, size, image, category }) => ({
          id,
          name,
          price,
          qty,
          size,
          image,
          category,
        })
      );

      const payload = {
        items,
        customer: buildCustomer(),
        paymentMethod,
      };

      const orderData = await createOrder(payload);

      if (paymentMethod === 'cod') {
        clearCart();
        navigate(`/order-success?orderId=${orderData.orderId}`);
        return;
      }

      await openCheckout({
        key: orderData.key,
        orderId: orderData.orderId,
        razorpayOrderId: orderData.razorpayOrderId,
        amount: orderData.amount,
        customer: buildCustomer(),
        onSuccess: async (response) => {
          await verifyPayment({
            orderId: orderData.orderId,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          clearCart();
          navigate(`/order-success?orderId=${orderData.orderId}`);
        },
        onFailure: (msg) => setError(msg || 'Payment failed'),
      });
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-5 text-center">
        <p className="text-muted">Your bag is empty</p>
        <Link
          to="/"
          className="mt-4 rounded-full bg-burgundy px-6 py-3 text-sm text-cream no-underline"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  const inputClass =
    'w-full rounded-xl border border-cream-dark bg-cream px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-sage';

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
      <h1 className="font-serif text-3xl text-ink sm:text-4xl">Checkout</h1>
      <p className="mt-2 text-sm text-muted">
        Complete your order — we ship across India
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-10 grid gap-10 lg:grid-cols-5"
      >
        <div className="space-y-6 lg:col-span-3">
          <fieldset className="space-y-4">
            <legend className="mb-2 font-serif text-xl text-ink">
              Delivery Details
            </legend>
            <input
              className={inputClass}
              name="name"
              placeholder="Full name *"
              required
              value={form.name}
              onChange={updateField}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                className={inputClass}
                name="email"
                type="email"
                placeholder="Email *"
                required
                value={form.email}
                onChange={updateField}
              />
              <input
                className={inputClass}
                name="phone"
                type="tel"
                placeholder="Phone *"
                required
                pattern="[0-9]{10}"
                value={form.phone}
                onChange={updateField}
              />
            </div>
            <textarea
              className={`${inputClass} min-h-20 resize-y`}
              name="address"
              placeholder="Street address *"
              required
              value={form.address}
              onChange={updateField}
            />
            <div className="grid gap-4 sm:grid-cols-3">
              <input
                className={inputClass}
                name="city"
                placeholder="City *"
                required
                value={form.city}
                onChange={updateField}
              />
              <input
                className={inputClass}
                name="state"
                placeholder="State *"
                required
                value={form.state}
                onChange={updateField}
              />
              <input
                className={inputClass}
                name="pincode"
                placeholder="PIN code *"
                required
                pattern="[0-9]{6}"
                value={form.pincode}
                onChange={updateField}
              />
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-3 font-serif text-xl text-ink">
              Payment Method
            </legend>
            <div className="space-y-3">
              {[
                {
                  id: 'razorpay',
                  label: 'Pay Online',
                  desc: 'UPI, cards, netbanking & wallets',
                },
                {
                  id: 'cod',
                  label: 'Cash on Delivery',
                  desc: 'Pay when your order arrives',
                },
              ].map((opt) => (
                <label
                  key={opt.id}
                  className={[
                    'flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors',
                    paymentMethod === opt.id
                      ? 'border-burgundy bg-burgundy/5'
                      : 'border-cream-dark hover:border-sage',
                  ].join(' ')}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={opt.id}
                    checked={paymentMethod === opt.id}
                    onChange={() => setPaymentMethod(opt.id)}
                    className="mt-1"
                  />
                  <div>
                    <p className="text-sm font-medium text-ink">{opt.label}</p>
                    <p className="text-xs text-muted">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <div className="lg:col-span-2">
          <div className="sticky top-24 rounded-2xl border border-cream-dark bg-cream p-6">
            <h2 className="font-serif text-xl text-ink">Order Summary</h2>
            <div className="mt-4 space-y-3">
              {cart.map((item) => (
                <div key={item.lineKey} className="flex gap-3">
                  <img
                    src={item.image}
                    alt=""
                    onError={(e) => {
                      e.target.src =
                        'https://via.placeholder.com/48x64?text=Item';
                    }}
                    className="h-16 w-12 rounded-lg object-cover"
                  />
                  <div className="flex-1 text-sm">
                    <p className="font-medium text-ink">{item.name}</p>
                    <p className="text-xs text-muted">
                      Size {item.size} · Qty {item.qty}
                    </p>
                  </div>
                  <span className="text-sm">
                    {formatPrice(item.price * item.qty)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-5 space-y-2 border-t border-cream-dark pt-5 text-sm">
              <div className="flex justify-between text-muted">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
              </div>
              {subtotal < FREE_SHIPPING_MIN && (
                <p className="text-[11px] text-sage">
                  Free shipping on orders over {formatPrice(FREE_SHIPPING_MIN)}
                </p>
              )}
              <div className="flex justify-between border-t border-cream-dark pt-3 font-medium text-ink">
                <span>Total</span>
                <span className="font-serif text-xl">{formatPrice(total)}</span>
              </div>
            </div>

            {error && (
              <p className="mt-4 rounded-xl bg-burgundy/10 px-4 py-3 text-xs text-burgundy">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-5 w-full cursor-pointer rounded-full bg-burgundy py-3.5 text-sm font-medium tracking-wide text-cream transition-colors hover:bg-burgundy/90 disabled:opacity-60"
            >
              {loading
                ? 'Processing…'
                : paymentMethod === 'cod'
                  ? 'Place Order'
                  : 'Pay Now'}
            </button>

            <p className="mt-3 text-center text-[11px] text-muted">
              Secure checkout · Easy returns within 7 days
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
