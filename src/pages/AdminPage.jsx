import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchAdminOrders, updateOrderStatus } from '../utils/api';
import { formatPrice } from '../utils/formatPrice';

export default function AdminPage() {
  const { user, session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [orders, setOrders] = useState([]);
  
  const adminEmails = (import.meta.env.VITE_ADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());
  const isAdmin = user && adminEmails.includes(user.email?.toLowerCase());

  useEffect(() => {
    if (isAdmin && session?.access_token) {
      loadOrders();
    } else if (!isAdmin && user) {
      setLoading(false);
    }
  }, [isAdmin, session]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminOrders(session.access_token);
      setOrders(data.orders);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus, session.access_token);
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (err) {
      alert(`Failed to update status: ${err.message}`);
    }
  };

  if (loading) {
    return <div className="p-20 text-center text-muted">Loading Admin Panel...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="p-20 text-center flex flex-col items-center justify-center min-h-[50vh]">
        <h1 className="text-3xl font-serif text-ink mb-4">Unauthorized</h1>
        <p className="text-muted">You do not have permission to view this page.</p>
      </div>
    );
  }

  const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 min-h-[70vh]">
      <div className="mb-10">
        <h1 className="font-serif text-4xl text-ink">Admin Dashboard</h1>
        <p className="text-muted mt-2">Manage all store orders and update fulfillment statuses.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="bg-cream rounded-2xl p-6 border border-cream-dark shadow-sm">
          <p className="text-sm uppercase tracking-wider text-muted mb-2">Total Revenue</p>
          <p className="text-4xl font-serif text-ink">{formatPrice(totalRevenue)}</p>
        </div>
        <div className="bg-cream rounded-2xl p-6 border border-cream-dark shadow-sm">
          <p className="text-sm uppercase tracking-wider text-muted mb-2">Total Orders</p>
          <p className="text-4xl font-serif text-ink">{orders.length}</p>
        </div>
      </div>

      {error && <div className="bg-burgundy/10 text-burgundy p-4 rounded-lg mb-8">{error}</div>}

      <div className="overflow-x-auto bg-cream rounded-2xl border border-cream-dark shadow-sm">
        <table className="w-full text-left text-sm text-ink min-w-[800px]">
          <thead className="bg-sage/10 uppercase tracking-wider text-xs border-b border-cream-dark">
            <tr>
              <th className="px-6 py-4">Order ID & Date</th>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Items</th>
              <th className="px-6 py-4">Total</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cream-dark">
            {orders.length === 0 ? (
              <tr><td colSpan="5" className="p-8 text-center text-muted">No orders found.</td></tr>
            ) : orders.map(order => (
              <tr key={order.id} className="hover:bg-sage/5 transition-colors">
                <td className="px-6 py-4 align-top">
                  <div className="font-medium text-xs bg-white px-2 py-1 rounded inline-block border border-cream-dark mb-2">
                    {order.id}
                  </div>
                  <div className="text-muted text-xs">
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </div>
                  <div className="text-muted text-xs font-medium mt-1 uppercase tracking-wider text-sage">
                    {order.paymentMethod === 'cod' ? 'COD' : 'Online'}
                  </div>
                </td>
                <td className="px-6 py-4 align-top">
                  <div className="font-medium">{order.customer?.name}</div>
                  <div className="text-muted mt-1">{order.customer?.email}</div>
                  <div className="text-muted">{order.customer?.phone}</div>
                  <div className="text-xs text-muted mt-2 border-t border-cream-dark pt-2 line-clamp-3">
                    {order.customer?.address}, {order.customer?.city}, {order.customer?.state} {order.customer?.zip}
                  </div>
                </td>
                <td className="px-6 py-4 align-top max-w-xs">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="mb-2 text-xs flex justify-between">
                      <span className="text-muted truncate mr-2">{item.qty}x {item.name} ({item.size})</span>
                    </div>
                  ))}
                </td>
                <td className="px-6 py-4 align-top font-medium">
                  {formatPrice(order.total)}
                </td>
                <td className="px-6 py-4 align-top">
                  <select 
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className="bg-white border border-cream-dark rounded-lg px-3 py-2 text-sm outline-none focus:border-sage cursor-pointer w-full"
                  >
                    <option value="pending_payment">Pending Payment</option>
                    <option value="confirmed">Confirmed (COD)</option>
                    <option value="paid">Paid (Online)</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
