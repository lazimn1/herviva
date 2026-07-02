export function formatPrice(amount) {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function cartLineKey(id, size) {
  return `${id}-${size}`;
}
