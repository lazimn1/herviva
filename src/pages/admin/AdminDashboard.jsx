import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { IndianRupee, ShoppingBag, CreditCard, AlertCircle } from 'lucide-react';
import { dbService } from '../../services/dbService';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [timeRange, setTimeRange] = useState('days');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [overviewStats, salesTrend] = await Promise.all([
        dbService.getOverviewStats(),
        dbService.getSalesTrend(timeRange)
      ]);
      setStats(overviewStats);
      setTrendData(salesTrend);
      setLoading(false);
    };
    fetchData();
  }, [timeRange]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const statCards = [
    { 
      title: 'Total Revenue', 
      value: `₹${stats.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
      icon: IndianRupee, 
      color: 'bg-green-100 text-green-700' 
    },
    { 
      title: 'Total Orders', 
      value: stats.totalOrders.toLocaleString(), 
      icon: ShoppingBag, 
      color: 'bg-indigo-100 text-indigo-700' 
    },
    { 
      title: 'Average Order Value', 
      value: `₹${stats.averageOrderValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
      icon: CreditCard, 
      color: 'bg-blue-100 text-blue-700' 
    },
    { 
      title: 'Out of Stock Items', 
      value: stats.outOfStockItems, 
      icon: AlertCircle, 
      color: 'bg-red-100 text-red-700' 
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Overview Dashboard</h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{card.title}</p>
                <h3 className="text-2xl font-bold text-gray-900">{card.value}</h3>
              </div>
              <div className={`p-3 rounded-lg ${card.color}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <h2 className="text-lg font-semibold text-gray-900">Sales Trend</h2>
          
          <div className="flex bg-gray-100 p-1 rounded-lg">
            {[
              { id: 'days', label: '7 Days' },
              { id: 'weeks', label: '4 Weeks' },
              { id: 'month', label: '12 Months' },
              { id: 'year', label: '5 Years' }
            ].map(filter => (
              <button
                key={filter.id}
                onClick={() => setTimeRange(filter.id)}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                  timeRange === filter.id 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#6B7280', fontSize: 12 }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#6B7280', fontSize: 12 }}
                tickFormatter={(value) => `₹${value}`}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                formatter={(value) => [`₹${value}`, 'Sales']}
              />
              <Line 
                type="monotone" 
                dataKey="sales" 
                stroke="#4F46E5" 
                strokeWidth={3} 
                dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#4F46E5' }} 
                activeDot={{ r: 6, fill: '#4F46E5', stroke: '#fff', strokeWidth: 2 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
