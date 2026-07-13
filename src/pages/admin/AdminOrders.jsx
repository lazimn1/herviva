import React, { useEffect, useState, useRef } from 'react';
import { dbService } from '../../services/dbService';
import { Search, Eye, X, Package, MapPin, Phone, Mail, ChevronDown, Check } from 'lucide-react';

const STATUS_OPTIONS = ['Processing', 'Shipped', 'Delivered', 'Cancelled'];

const getStatusColor = (status) => {
  switch(status?.toLowerCase()) {
    case 'delivered':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'processing':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'shipped':
      return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    case 'paid':
    case 'confirmed':
      return 'bg-teal-100 text-teal-800 border-teal-200';
    case 'pending':
    case 'pending_payment':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'cancelled':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStatusLabel = (status) => {
  switch (status?.toLowerCase()) {
    case 'paid': return 'Paid (Online)';
    case 'confirmed': return 'Confirmed (COD)';
    case 'pending_payment': return 'Pending Payment';
    case 'processing': return 'Processing';
    case 'shipped': return 'Shipped';
    case 'delivered': return 'Delivered';
    case 'cancelled': return 'Cancelled';
    default: return status || 'Unknown';
  }
};

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const getPlace = (customer) => {
  if (!customer?.address) return 'N/A';
  const parts = customer.address.split(',');
  if (parts.length >= 3) {
    const city = parts[parts.length - 2].trim();
    const statePin = parts[parts.length - 1].trim();
    return `${city}, ${statePin.split('-')[0].trim()}`;
  }
  return customer.address;
};

// Custom Interactive Dropdown Component
const StatusDropdown = ({ order, onUpdate, isUpdating, fullWidth = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (status) => {
    if (status !== order.status) {
      onUpdate(order.id, status);
    }
    setIsOpen(false);
  };

  return (
    <div className={`relative inline-block text-left ${fullWidth ? 'w-full' : ''}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isUpdating}
        className={`inline-flex items-center justify-between px-3 py-1.5 rounded-full text-xs font-semibold border ${getStatusColor(order.status)} hover:opacity-80 transition-all outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 disabled:opacity-50 min-w-[125px] ${fullWidth ? 'w-full py-2.5 px-4 text-sm rounded-lg' : ''}`}
      >
        <span>{getStatusLabel(order.status)}</span>
        {isUpdating ? (
          <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin ml-2"></div>
        ) : (
          <ChevronDown className={`w-3 h-3 ml-2 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        )}
      </button>

      {isOpen && (
        <div className={`absolute ${fullWidth ? 'left-0 right-0' : 'right-0 sm:left-auto'} mt-2 w-48 rounded-xl bg-white shadow-xl border border-gray-100 ring-1 ring-black ring-opacity-5 focus:outline-none z-50 animate-in fade-in slide-in-from-top-2 duration-150 py-1 overflow-hidden`}>
          <div className="px-4 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50 border-b border-gray-50 mb-1">
            Update Status
          </div>
          {STATUS_OPTIONS.map((opt) => {
            const isSelected = order.status === opt;
            return (
              <button
                key={opt}
                onClick={() => handleSelect(opt)}
                className={`w-full text-left flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                  isSelected 
                    ? 'bg-indigo-50/50 text-indigo-700 font-medium' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {opt}
                {isSelected && <Check className="w-4 h-4 text-indigo-600" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};


export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const data = await dbService.getOrders();
    setOrders(data);
    setLoading(false);
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingStatus(orderId);
    try {
      await dbService.updateOrderStatus(orderId, newStatus);
      // Update local state
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      alert("Failed to update status");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const filteredOrders = orders.filter(order => {
    const term = searchTerm.toLowerCase();
    const cust = order.customer || {};
    return (
      order.id?.toLowerCase().includes(term) ||
      cust.name?.toLowerCase().includes(term) ||
      cust.email?.toLowerCase().includes(term) ||
      cust.phone?.toLowerCase().includes(term) ||
      cust.address?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Orders Tracker</h1>
          <p className="text-gray-500 mt-1">View and manage recent customer transactions.</p>
        </div>
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text"
            placeholder="Search orders, customers, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm text-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[400px]">
        {/* We use overflow-visible here so the custom dropdown menu doesn't get clipped */}
        <div className="overflow-visible">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Place</th>
                <th className="px-6 py-4 text-right">Items / Total</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredOrders.map((order) => {
                const customer = order.customer || {};
                const place = getPlace(customer);
                const itemsCount = Array.isArray(order.items) ? order.items.reduce((acc, item) => acc + (item.qty || 1), 0) : 0;
                
                return (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-indigo-600 text-sm">{order.id}</div>
                      <div className="text-xs text-gray-400 mt-1">{formatDate(order.date || order.createdAt)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{customer.name || 'N/A'}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{customer.email || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-700 text-sm font-medium">
                      {customer.phone || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm max-w-[150px] truncate" title={place}>
                      {place}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-sm font-semibold text-gray-900">
                        ₹{Number(order.total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">{itemsCount} item{itemsCount !== 1 && 's'}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <StatusDropdown 
                        order={order} 
                        onUpdate={handleUpdateStatus} 
                        isUpdating={updatingStatus === order.id} 
                      />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="inline-flex items-center justify-center p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {!loading && filteredOrders.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500 bg-gray-50/50">
                    No orders found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
                <p className="text-sm text-gray-500 mt-1">{selectedOrder.id} • {formatDate(selectedOrder.date || selectedOrder.createdAt)}</p>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Column: Customer & Status */}
                <div className="lg:col-span-1 space-y-6">
                  {/* Customer Info Card */}
                  <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-indigo-500" />
                      Customer Details
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Name</p>
                        <p className="text-sm font-semibold text-gray-900 mt-0.5">{selectedOrder.customer?.name || 'N/A'}</p>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <Mail className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Email</p>
                          <p className="text-sm text-gray-900 mt-0.5">{selectedOrder.customer?.email || 'N/A'}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <Phone className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Contact</p>
                          <p className="text-sm text-gray-900 mt-0.5">{selectedOrder.customer?.phone || 'N/A'}</p>
                        </div>
                      </div>

                      <div className="border-t border-gray-200 pt-4 mt-2">
                        <p className="text-xs text-gray-500 font-medium">Shipping Address</p>
                        <p className="text-sm text-gray-800 mt-1 leading-relaxed">
                          {selectedOrder.customer?.address || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Status & Payment Card */}
                  <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 overflow-visible">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Package className="w-4 h-4 text-indigo-500" />
                      Order Status
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-gray-500 font-medium mb-1.5">Current Status</p>
                        <StatusDropdown 
                          order={selectedOrder} 
                          onUpdate={handleUpdateStatus} 
                          isUpdating={updatingStatus === selectedOrder.id} 
                          fullWidth={true}
                        />
                      </div>
                      
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Payment Method</p>
                        <p className="text-sm font-medium text-gray-900 mt-0.5 uppercase">
                          {selectedOrder.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online (Razorpay)'}
                        </p>
                      </div>
                      
                      {selectedOrder.razorpayPaymentId && (
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Transaction ID</p>
                          <p className="text-sm font-mono text-gray-600 mt-0.5 break-all">
                            {selectedOrder.razorpayPaymentId}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column: Products & Totals */}
                <div className="lg:col-span-2 flex flex-col h-full">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Purchased Items</h3>
                  
                  <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                    {Array.isArray(selectedOrder.items) && selectedOrder.items.length > 0 ? (
                      selectedOrder.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4 p-3 bg-white border border-gray-100 rounded-xl hover:border-gray-200 transition-colors shadow-sm">
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            onError={(e) => { e.target.src = '/images/fallback.svg'; }}
                            className="w-16 h-20 object-cover rounded-lg bg-gray-100"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-gray-900 truncate">{item.name}</h4>
                            <p className="text-xs text-gray-500 mt-1">Size: <span className="font-medium text-gray-700">{item.size}</span></p>
                            <p className="text-xs text-gray-500">Qty: <span className="font-medium text-gray-700">{item.qty}</span></p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-gray-900">
                              ₹{Number(item.price * item.qty).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              ₹{Number(item.price).toLocaleString('en-IN')} each
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        No product details found for this order.
                      </div>
                    )}
                  </div>
                  
                  {/* Totals Section */}
                  <div className="mt-6 p-5 bg-gray-50 rounded-xl border border-gray-100 space-y-3">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Subtotal</span>
                      <span className="font-medium">₹{Number(selectedOrder.subtotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Shipping</span>
                      <span className="font-medium">{selectedOrder.shipping === 0 ? 'Free' : `₹${Number(selectedOrder.shipping).toLocaleString('en-IN')}`}</span>
                    </div>
                    <div className="flex justify-between text-base font-bold text-gray-900 pt-3 border-t border-gray-200 mt-3">
                      <span>Total</span>
                      <span className="text-indigo-600">₹{Number(selectedOrder.total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                  
                </div>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end">
              <button 
                onClick={() => setSelectedOrder(null)}
                className="px-6 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
