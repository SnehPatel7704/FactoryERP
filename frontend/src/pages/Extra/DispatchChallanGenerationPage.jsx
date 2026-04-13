import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DispatchChallanGeneration from '../dispatch/DispatchChallanGeneration';
import { apiClient } from '../../utils/apiClient';
import Loader from '../../components/ui/Loader';
import ErrorMessage from '../../components/ui/ErrorMessage';

/**
 * Wrapper component for standalone challan generation page
 * Allows user to select an order or access from URL with order parameter
 */
const DispatchChallanGenerationPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load orders on mount
  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/sales');
        setOrders(response || []);

        // Check if order ID is passed via URL
        const orderNum = searchParams.get('order');
        if (orderNum) {
          setSelectedOrderId(orderNum);
        }
      } catch (err) {
        setError(err.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [searchParams]);

  if (loading && !selectedOrderId) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen text-slate-100">
        <Loader text="Loading Orders..." />
      </div>
    );
  }

  // If we have a selected order ID from URL or state, show the challan generation form
  if (selectedOrderId) {
    return (
      <DispatchChallanGeneration
        salesOrderId={selectedOrderId}
        onBack={() => {
          setSelectedOrderId(null);
          navigate('/sales/order');
        }}
        onSuccess={() => {
          setSelectedOrderId(null);
          navigate('/sales/order');
        }}
      />
    );
  }

  // Show order selection view
  return (
    <div className="pt-2 pb-12 w-full min-h-screen">
      <div className="max-w-7xl mx-auto w-full">
        <div className="mb-8 flex justify-between items-end">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-green-500 mb-1">Logistics Hub</p>
            <h1 className="text-3xl font-black text-slate-100 uppercase tracking-tight">Generate Dispatch Challan</h1>
            <p className="text-xs text-slate-400 mt-2">Select a sales order to generate challan</p>
          </div>
        </div>

        {error && <ErrorMessage error={error} />}

        {orders.length === 0 ? (
          <div className="bg-slate-900 border border-blue-900/20 rounded-xl p-12 text-center">
            <p className="text-slate-400 text-lg mb-2">No sales orders available</p>
            <p className="text-slate-500 text-sm">Create a sales order first to generate a challan</p>
          </div>
        ) : (
          <div className="bg-slate-900 border border-blue-900/20 rounded-xl overflow-hidden shadow-xl">
            <div className="px-6 py-4 bg-slate-800/40 border-b border-blue-900/30">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest">
                Available Sales Orders ({orders.length})
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-800/40 border-b border-blue-900/20">
                  <tr>
                    <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Order Number</th>
                    <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Customer</th>
                    <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</th>
                    <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Items</th>
                    <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Weight</th>
                    <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-900/10">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-blue-900/5 transition-all">
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
                          {order.status || 'draft'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-right text-slate-300">
                        {order.lineItems?.length || 0}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-right text-white">
                        {order.lineItems?.reduce((sum, l) => sum + (parseFloat(l.weightId) || 0), 0).toFixed(2) || '0.00'} kg
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => setSelectedOrderId(order.orderNumber)}
                          className="inline-flex items-center gap-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">arrow_forward</span>
                          Generate Challan
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DispatchChallanGenerationPage;
