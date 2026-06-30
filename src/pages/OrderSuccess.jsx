import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getOrder } from "../utils/api";
import { formatPrice } from "../utils/formatPrice";

export default function OrderSuccess() {
  const [params] = useSearchParams();
  const orderId = params.get("orderId");
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderId) return;
    getOrder(orderId)
      .then(setOrder)
      .catch(() => setError("Could not load order details"));
  }, [orderId]);

  return (
    <div className="mx-auto max-w-lg px-5 py-16 text-center sm:py-24">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-sage/20">
        <svg className="h-8 w-8 text-sage-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h1 className="font-serif text-3xl text-ink">Thank you!</h1>
      <p className="mt-3 text-sm text-muted">
        Your order has been {order?.status === "paid" ? "paid and " : ""}confirmed.
        We&apos;ll reach out shortly to confirm delivery.
      </p>

      {orderId && (
        <p className="mt-4 rounded-full bg-cream-dark/60 px-4 py-2 text-sm text-ink">
          Order ID: <strong>{orderId}</strong>
        </p>
      )}

      {order && (
        <div className="mt-8 rounded-2xl border border-cream-dark bg-cream p-6 text-left text-sm">
          <div className="flex justify-between">
            <span className="text-muted">Total paid</span>
            <span className="font-medium">{formatPrice(order.total)}</span>
          </div>
          <div className="mt-2 flex justify-between">
            <span className="text-muted">Payment</span>
            <span className="font-medium capitalize">
              {order.paymentMethod === "cod" ? "Cash on Delivery" : "Online"}
            </span>
          </div>
          <div className="mt-4 border-t border-cream-dark pt-4">
            <p className="text-xs text-muted">Delivering to</p>
            <p className="mt-1 text-ink">{order.customer.name}</p>
            <p className="text-muted">{order.customer.address}</p>
          </div>
        </div>
      )}

      {error && <p className="mt-4 text-xs text-burgundy">{error}</p>}

      <Link
        to="/"
        className="mt-8 inline-block rounded-full bg-burgundy px-8 py-3 text-sm font-medium text-cream no-underline transition-colors hover:bg-burgundy/90"
      >
        Continue Shopping
      </Link>
    </div>
  );
}
