import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import Loader from '../../components/ui/Loader';
import ErrorMessage from '../../components/ui/ErrorMessage';
import OrderDispatchDetails from './OrderDispatchDetails';
import { ChevronDown, Edit2, Filter, Plus, Truck, FileOutput } from 'lucide-react';

const SalesOrderList = ({ onAddNew, onEditOrder, onViewDispatch, onGenerateChallan }) => {
  // Auth check - get user role from localStorage user object
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : {};
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  // API hooks
  const { data: allOrders, loading, error, execute: fetchAllOrders } = useApi('/sales', {}, []);

  // State
  const [displayOrders, setDisplayOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCustomer, setFilterCustomer] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedOrderForDispatch, setSelectedOrderForDispatch] = useState(null);

  // Fetch data on mount
  useEffect(() => {
    fetchAllOrders();
  }, [fetchAllOrders]);

  // Apply filters whenever dependencies change
  useEffect(() => {
    if (!allOrders || allOrders.length === 0) {
      setDisplayOrders([]);
      return;
    }

    let filtered = [...allOrders];

    // Filter by status
    if (filterStatus) {
      filtered = filtered.filter(order => order.status === filterStatus);
    }

    // Filter by customer
    if (filterCustomer) {
      filtered = filtered.filter(order =>
        order.customerName?.toLowerCase().includes(filterCustomer.toLowerCase())
      );
    }

    // Sort by date descending (newest first)
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    setDisplayOrders(filtered);
  }, [allOrders, filterStatus, filterCustomer]);

  // Clear all filters
  const handleClearFilters = () => {
    setFilterStatus('');
    setFilterCustomer('');
  };

  // Get summary stats
  const getStats = () => {
    if (!displayOrders || displayOrders.length === 0) {
      return { orders: 0, totalWeight: 0, bags: 0 };
    }
    return {
      orders: displayOrders.length,
      totalWeight: displayOrders.reduce((sum, o) => {
        const lineTotal = o.lineItems?.reduce((s, l) => s + (parseFloat(l.weightId) || 0), 0) || 0;
        return sum + lineTotal;
      }, 0),
      bags: displayOrders.reduce((sum, o) => sum + (parseInt(o.bags) || 0), 0)
    };
  };

  const stats = getStats();

  if (loading) return <div className="p-8 flex items-center justify-center min-h-screen text-slate-100"><Loader text="Loading Sales Orders..." /></div>;
  if (error) return <div className="p-8"><ErrorMessage error={error} retryFunction={fetchAllOrders} /></div>;

  return (
    <div className="pt-2 pb-12 w-full min-h-screen">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-green-500 mb-1">Sales Hub</p>
            <h3 className="text-2xl font-extrabold text-white">Sales Orders</h3>
            <p className="text-xs text-slate-400 mt-1">{stats.orders} orders • {stats.totalWeight.toLocaleString('en-IN', { maximumFractionDigits: 2 })} Kg • {stats.bags} bags</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onViewDispatch}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold text-sm flex items-center gap-2 shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95"
              title="View dispatch history"
            >
              <span className="material-symbols-outlined">local_shipping</span>
              DISPATCH HISTORY
            </button>
            <button
              onClick={onAddNew}
              className="bg-green-500 text-slate-900 px-6 py-3 rounded-lg font-bold text-sm flex items-center gap-2 shadow-lg shadow-green-500/20 hover:bg-green-600 transition-all active:scale-95"
              title="Create new sales order"
            >
              <Plus size={18} />
              NEW ORDER
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="mb-6 bg-green-900/10 border border-green-900/20 rounded-xl p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-green-400" />
              <h4 className="font-semibold text-white text-sm">Filters</h4>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="text-green-400 hover:text-green-300 transition-colors"
            >
              <ChevronDown size={20} className={`transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 pb-4 border-b border-green-900/30">
              {/* Status Filter */}
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 block mb-2">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full bg-slate-800 border-slate-700 border rounded-lg text-sm text-white focus:ring-1 focus:ring-green-500 focus:border-green-500 py-2 outline-none transition-all"
                >
                  <option value="">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                </select>
              </div>

              {/* Customer Filter */}
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 block mb-2">Customer</label>
                <input
                  type="text"
                  placeholder="Search customer..."
                  value={filterCustomer}
                  onChange={(e) => setFilterCustomer(e.target.value)}
                  className="w-full bg-slate-800 border-slate-700 border rounded-lg text-sm text-white focus:ring-1 focus:ring-green-500 focus:border-green-500 py-2 outline-none transition-all"
                />
              </div>

              {/* Clear Filters Button */}
              <div className="flex items-end">
                <button
                  onClick={handleClearFilters}
                  className="w-full bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors"
                  title="Reset all filters to default"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sales Orders Table */}
        <div className="bg-slate-900 border border-green-900/20 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-800/80 border-b border-green-900/20">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Order ID</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Customer</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Items</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Weight (Kg)</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Bags</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Date</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-green-900/10">
                {displayOrders && displayOrders.length > 0 ? (
                  displayOrders.map((order) => (
                    <tr
                      key={order.id}
                      className={`hover:bg-green-900/5 transition-all ${isAdmin ? 'cursor-pointer' : ''}`}
                      onClick={() => isAdmin && onEditOrder(order)}
                    >
                      <td className="px-6 py-4 text-sm font-mono text-white">
                        {order.orderNumber || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-white">
                        {order.customerName || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-semibold uppercase tracking-wider ${order.status === 'confirmed' ? 'bg-green-500/20 text-green-300' :
                            order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' :
                              'bg-slate-700/20 text-slate-300'
                          }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-right text-slate-300">
                        {order.lineItems?.length || 0}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-right text-white">
                        {order.lineItems?.reduce((sum, l) => sum + (parseFloat(l.weightId) || 0), 0).toLocaleString('en-IN', { maximumFractionDigits: 2 }) || '0.00'}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-right text-white">
                        {order.bags || 0}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedOrderForDispatch(order);
                            }}
                            className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-xs font-semibold transition-colors"
                            title="View dispatch history"
                          >
                            <Truck size={14} />
                            Dispatch
                          </button>
                          {onGenerateChallan && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onGenerateChallan(order);
                              }}
                              className="inline-flex items-center gap-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-lg text-xs font-semibold transition-colors"
                              title="Generate dispatch challan"
                            >
                              <FileOutput size={14} />
                              Challan
                            </button>
                          )}
                          {isAdmin && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditOrder(order);
                              }}
                              className="inline-flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-xs font-semibold transition-colors"
                              title="Edit this order (Admin only)"
                            >
                              <Edit2 size={14} />
                              Edit
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-slate-500 text-sm">
                      No sales orders found for the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dispatch Details Modal */}
        {selectedOrderForDispatch && (
          <OrderDispatchDetails
            orderId={selectedOrderForDispatch.id}
            orderNumber={selectedOrderForDispatch.orderNumber}
            onClose={() => setSelectedOrderForDispatch(null)}
          />
        )}
      </div>
    </div>
  );
};

export default SalesOrderList;
