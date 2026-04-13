import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import { apiClient } from '../../utils/apiClient';
import Loader from '../../components/ui/Loader';
import ErrorMessage from '../../components/ui/ErrorMessage';
import { StatusBadge } from '../../utils/statusBadge';
import { ChevronDown, Package, Weight, Ruler, Calendar } from 'lucide-react';


const OrderDispatchDetails = ({ orderId, orderNumber, onClose }) => {
  const { data: dispatchData, loading, error, execute } = useApi(
    `/sales/dispatch/order/${orderId}`,
    {},
    { order: null, dispatchedEntries: [], summary: {} }
  );

  useEffect(() => {
    execute();
  }, [execute]);

  if (loading) return <Loader text="Loading dispatch details..." />;
  if (error) return <ErrorMessage error={error} retryFunction={execute} />;

  const { order, dispatchedEntries, summary } = dispatchData;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-blue-900/30 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-slate-800/80 border-b border-blue-900/20 px-6 py-4 flex justify-between items-center backdrop-blur">
          <div>
            <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Shipment Details</p>
            <h3 className="text-xl font-bold text-white">{orderNumber}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Order Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-800/40 border border-blue-900/20 rounded-lg p-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Customer</p>
              <p className="text-lg font-bold text-white">{order?.customerName || 'N/A'}</p>
            </div>
            <div className="bg-slate-800/40 border border-blue-900/20 rounded-lg p-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Order Status</p>
              {order?.status && <StatusBadge status={order.status} />}
            </div>
            <div className="bg-slate-800/40 border border-blue-900/20 rounded-lg p-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Order Date</p>
              <p className="text-sm text-white">
                {order?.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <div className="bg-slate-800/40 border border-blue-900/20 rounded-lg p-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Dispatch Date</p>
              <p className="text-sm text-white">
                {summary?.dispatchDate ? new Date(summary.dispatchDate).toLocaleDateString() : 'Not dispatched'}
              </p>
            </div>
          </div>

          {/* Dispatch Metrics */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-900/10 border border-blue-900/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Package className="text-blue-400" size={16} />
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Items</span>
              </div>
              <p className="text-2xl font-bold text-white">{summary?.totalItems || 0}</p>
            </div>
            <div className="bg-green-900/10 border border-green-900/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Weight className="text-green-400" size={16} />
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Weight</span>
              </div>
              <p className="text-2xl font-bold text-white">{(summary?.totalWeight || 0).toFixed(2)} kg</p>
            </div>
            <div className="bg-purple-900/10 border border-purple-900/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Ruler className="text-purple-400" size={16} />
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Meter</span>
              </div>
              <p className="text-2xl font-bold text-white">{(summary?.totalMeter || 0).toFixed(2)} m</p>
            </div>
          </div>

          {/* Dispatched Items */}
          {dispatchedEntries && dispatchedEntries.length > 0 ? (
            <div>
              <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Dispatched Entries</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-blue-900/20 text-slate-400">
                      <th className="px-4 py-2 font-bold uppercase tracking-wider">SKU</th>
                      <th className="px-4 py-2 font-bold uppercase tracking-wider">Item</th>
                      <th className="px-4 py-2 font-bold uppercase tracking-wider">Size</th>
                      <th className="px-4 py-2 font-bold uppercase tracking-wider">Quality</th>
                      <th className="px-4 py-2 font-bold uppercase tracking-wider">Color</th>
                      <th className="px-4 py-2 font-bold uppercase tracking-wider text-right">Weight (kg)</th>
                      <th className="px-4 py-2 font-bold uppercase tracking-wider text-right">Meter (m)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-900/10">
                    {dispatchedEntries.map((entry) => (
                      <tr key={entry.id} className="hover:bg-blue-900/5 transition-colors">
                        <td className="px-4 py-2">
                          <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs font-mono border border-blue-500/40">
                            {entry.sku || '-'}
                          </span>
                        </td>
                        <td className="px-4 py-2 font-semibold text-white">{entry.item?.name || '-'}</td>
                        <td className="px-4 py-2 text-slate-300">{entry.size?.value || '-'}</td>
                        <td className="px-4 py-2 text-slate-300">{entry.quality?.grade || '-'}</td>
                        <td className="px-4 py-2 text-slate-300">{entry.color?.name || '-'}</td>
                        <td className="px-4 py-2 text-slate-300 text-right font-mono">{(entry.weightId || 0).toFixed(2)}</td>
                        <td className="px-4 py-2 text-slate-300 text-right font-mono">{(entry.lengthMeter || 0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-slate-800/40 border border-slate-700 rounded-lg p-8 text-center">
              <p className="text-slate-400 text-sm">No dispatched items found for this order.</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-slate-800/80 border-t border-blue-900/20 px-6 py-4 flex justify-between items-center backdrop-blur">
          {(!dispatchedEntries || dispatchedEntries.length === 0) && order?.status !== 'dispatched' ? (
            <button
              onClick={async () => {
                try {
                  await apiClient.post(`/sales/dispatch/force/${orderId}`, {});
                  execute(); // Refresh data
                  alert('Order status changed to dispatched, products to DISPATCHED');
                  onClose();
                } catch (err) {
                  alert('Error: ' + (err.message || 'Failed to dispatch order'));
                }
              }}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-sm shadow-lg shadow-blue-900/50 transition-colors"
            >
              Mark as Dispatched
            </button>
          ) : (
            <div></div> // empty spacer
          )}

          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold text-sm transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDispatchDetails;
