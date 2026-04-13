import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import Loader from '../../components/ui/Loader';
import ErrorMessage from '../../components/ui/ErrorMessage';
import { StatusBadge } from '../../utils/statusBadge';
import { ChevronDown, Package, Calendar, Weight, Ruler } from 'lucide-react';

const DispatchHistory = () => {
  // Fetch dispatch history
  const { data: historyData, loading, error, execute } = useApi('/sales/dispatch/history/all', {}, { groups: {}, total: 0 });

  // State
  const [expandedOrders, setExpandedOrders] = useState({});
  const [filterCustomer, setFilterCustomer] = useState('');

  useEffect(() => {
    execute();
  }, [execute]);

  const toggleOrderExpand = (orderId) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  // Get all unique customers from dispatched orders
  const getUniqueCustomers = () => {
    const customers = new Set();
    Object.values(historyData.groups).forEach(group => {
      if (group.order?.customerName) {
        customers.add(group.order.customerName);
      }
    });
    return Array.from(customers).sort();
  };

  // Filter groups based on customer
  const filteredGroups = Object.entries(historyData.groups || {})
    .filter(([_, group]) => {
      if (!filterCustomer) return true;
      return group.order?.customerName?.toLowerCase().includes(filterCustomer.toLowerCase());
    })
    .sort(([_, a], [__, b]) => {
      const dateA = new Date(a.order?.createdAt || 0);
      const dateB = new Date(b.order?.createdAt || 0);
      return dateB - dateA;
    });

  // Calculate total metrics
  const getTotalMetrics = () => {
    let totalWeight = 0;
    let totalMeter = 0;
    let totalEntries = 0;

    filteredGroups.forEach(([_, group]) => {
      group.entries?.forEach(entry => {
        totalWeight += entry.weightId || 0;
        totalMeter += entry.lengthMeter || 0;
        totalEntries += 1;
      });
    });

    return { totalWeight, totalMeter, totalEntries };
  };

  const metrics = getTotalMetrics();

  if (loading) return <div className="p-8 flex items-center justify-center min-h-screen text-slate-100"><Loader text="Loading Dispatch History..." /></div>;
  if (error) return <div className="p-8"><ErrorMessage error={error} retryFunction={execute} /></div>;

  return (
    <div className="pt-2 pb-12 w-full min-h-screen">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="mb-8">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-blue-400 mb-1">Shipment Tracking</p>
          <h3 className="text-3xl font-extrabold text-white">Dispatch History</h3>
          <p className="text-xs text-slate-400 mt-2">
            📦 {historyData.total} total dispatched items • {filteredGroups.length} orders
          </p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-900 border border-blue-900/30 rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <Package className="text-blue-400" size={20} />
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Items</span>
            </div>
            <span className="text-3xl font-bold text-white">{metrics.totalEntries}</span>
          </div>

          <div className="bg-slate-900 border border-blue-900/30 rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <Weight className="text-green-400" size={20} />
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Weight</span>
            </div>
            <span className="text-3xl font-bold text-white">{metrics.totalWeight.toFixed(2)} kg</span>
          </div>

          <div className="bg-slate-900 border border-blue-900/30 rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <Ruler className="text-purple-400" size={20} />
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Meter</span>
            </div>
            <span className="text-3xl font-bold text-white">{metrics.totalMeter.toFixed(2)} m</span>
          </div>
        </div>

        {/* Filter */}
        <div className="mb-6 bg-blue-900/10 border border-blue-900/20 rounded-xl p-4">
          <input
            type="text"
            placeholder="Filter by customer name..."
            value={filterCustomer}
            onChange={(e) => setFilterCustomer(e.target.value)}
            className="w-full bg-slate-800 border-slate-700 border rounded-lg text-sm text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 py-2 px-4 outline-none transition-all"
          />
        </div>

        {/* Dispatch Groups */}
        <div className="space-y-4">
          {filteredGroups.length > 0 ? (
            filteredGroups.map(([orderId, group]) => (
              <div key={orderId} className="bg-slate-900 border border-blue-900/20 rounded-xl overflow-hidden shadow-lg">
                {/* Order Header */}
                <div
                  onClick={() => toggleOrderExpand(orderId)}
                  className="px-6 py-4 bg-slate-800/40 border-b border-blue-900/20 cursor-pointer hover:bg-slate-800/60 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <ChevronDown
                      size={20}
                      className={`text-blue-400 transition-transform ${expandedOrders[orderId] ? 'rotate-180' : ''}`}
                    />
                    <div>
                      <p className="text-sm font-bold text-white">{group.order?.customerName || 'Unassigned'}</p>
                      <p className="text-xs text-slate-400 font-mono">{group.order?.orderNumber || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-bold text-white">{group.entries?.length || 0} items</p>
                      <p className="text-xs text-slate-400">
                        {(group.entries?.reduce((sum, e) => sum + (e.weightId || 0), 0) || 0).toFixed(2)} kg
                      </p>
                    </div>
                    {group.order?.status && (
                      <StatusBadge status={group.order.status} />
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedOrders[orderId] && (
                  <div className="px-6 py-4 space-y-4 bg-slate-900/50">
                    {/* Order Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pb-4 border-b border-blue-900/20">
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Order ID</p>
                        <p className="text-sm font-mono text-white">{group.order?.orderNumber || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Customer</p>
                        <p className="text-sm text-white">{group.order?.customerName || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Order Date</p>
                        <p className="text-sm text-slate-300">
                          {group.order?.createdAt ? new Date(group.order.createdAt).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Status</p>
                        {group.order?.status && <StatusBadge status={group.order.status} />}
                      </div>
                    </div>

                    {/* Dispatched Items Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-blue-900/20 text-slate-400">
                            <th className="px-4 py-2 font-bold uppercase tracking-wider">SKU</th>
                            <th className="px-4 py-2 font-bold uppercase tracking-wider">Item</th>
                            <th className="px-4 py-2 font-bold uppercase tracking-wider">Size</th>
                            <th className="px-4 py-2 font-bold uppercase tracking-wider">Quality</th>
                            <th className="px-4 py-2 font-bold uppercase tracking-wider">Weight (kg)</th>
                            <th className="px-4 py-2 font-bold uppercase tracking-wider">Meter (m)</th>
                            <th className="px-4 py-2 font-bold uppercase tracking-wider">Color</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-blue-900/10">
                          {group.entries?.map((entry) => (
                            <tr key={entry.id} className="hover:bg-blue-900/10 transition-colors">
                              <td className="px-4 py-2">
                                <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs font-mono border border-blue-500/40">
                                  {entry.sku || '-'}
                                </span>
                              </td>
                              <td className="px-4 py-2 font-semibold text-white">{entry.item?.name || '-'}</td>
                              <td className="px-4 py-2 text-slate-300">{entry.size?.value || '-'}</td>
                              <td className="px-4 py-2 text-slate-300">{entry.quality?.grade || '-'}</td>
                              <td className="px-4 py-2 text-slate-300 text-right font-mono">{(entry.weightId || 0).toFixed(2)}</td>
                              <td className="px-4 py-2 text-slate-300 text-right font-mono">{(entry.lengthMeter || 0).toFixed(2)}</td>
                              <td className="px-4 py-2 text-slate-300">{entry.color?.name || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Summary */}
                    <div className="bg-blue-900/10 border border-blue-900/20 rounded-lg p-4 mt-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-slate-400 mb-1">Total Items</p>
                          <p className="text-lg font-bold text-white">{group.entries?.length || 0}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 mb-1">Total Weight</p>
                          <p className="text-lg font-bold text-white">{(group.entries?.reduce((sum, e) => sum + (e.weightId || 0), 0) || 0).toFixed(2)} kg</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 mb-1">Total Meter</p>
                          <p className="text-lg font-bold text-white">{(group.entries?.reduce((sum, e) => sum + (e.lengthMeter || 0), 0) || 0).toFixed(2)} m</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="bg-slate-900 border border-blue-900/20 rounded-xl p-12 text-center">
              <p className="text-slate-400 text-sm">No dispatch records found for the selected filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DispatchHistory;
