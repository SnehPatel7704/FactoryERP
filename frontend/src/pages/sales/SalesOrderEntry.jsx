import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import Loader from '../../components/ui/Loader';
import ErrorMessage from '../../components/ui/ErrorMessage';

const SalesOrderEntry = ({ order, onClose, onSuccess }) => {
  // Use custom API hook for initialization
  const { data: masterData, loading, error, execute } = useApi('/master/all', {}, { items: [], colors: [], sizes: [], qualities: [] });
  // We'll need a distinct hook for POST request so it doesn't overwrite masterData
  const { loading: submitting, error: submitError, execute: executeSubmit } = useApi('', {}, null);

  const isEditing = !!order;

  const [lineItems, setLineItems] = useState([
    { id: Date.now(), itemId: '', sizeId: '', qualityId: '', colorId: '', secondaryColorId: '', weightKg: '', lengthMeter: '' }
  ]);

  const [customerName, setCustomerName] = useState('');
  const [orderNumber, setOrderNumber] = useState(`ORD-${new Date().getFullYear()}-${Math.floor(Math.random() * 8999) + 1000}-X`);
  const [status, setStatus] = useState('draft');
  const [bags, setBags] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    execute();
  }, [execute]);

  // Pre-populate form if editing
  useEffect(() => {
    if (isEditing && order) {
      setOrderNumber(order.orderNumber);
      setCustomerName(order.customerName);
      setStatus(order.status);
      setBags(order.bags?.toString() || '');
      setNotes(order.internalNotes);
      if (order.lineItems && order.lineItems.length > 0) {
        setLineItems(order.lineItems.map(item => ({
          id: item.id,
          itemId: item.itemId || '',
          sizeId: item.sizeId || '',
          qualityId: item.qualityId || '',
          colorId: item.colorId || '',
          secondaryColorId: item.secondaryColorId || '',
          weightKg: item.weightKg || '',
          lengthMeter: item.lengthMeter || ''
        })));
      }
    }
  }, [order, isEditing]);

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      { id: Date.now(), itemId: '', sizeId: '', qualityId: '', colorId: '', secondaryColorId: '', weightKg: '', lengthMeter: '' }
    ]);
  };

  const removeLineItem = (id) => {
    setLineItems(lineItems.filter(item => item.id !== id));
  };

  const updateLineItem = (id, field, value) => {
    setLineItems(lineItems.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleGenerateOrder = async () => {
    const payload = {
      orderNumber,
      customerName,
      status,
      bags: parseInt(bags) || 0,
      internalNotes: notes,
      lineItems: lineItems.filter(item => item.itemId && item.sizeId && item.qualityId && item.colorId && Number(item.weightKg) > 0)
    };

    const endpoint = isEditing ? `/sales/orders/${order.id}` : '/sales/new';
    const method = isEditing ? 'PUT' : 'POST';

    const { error: reqError } = await executeSubmit(endpoint, {
      method,
      body: JSON.stringify(payload)
    });

    if (!reqError) {
      alert(isEditing ? "Order Updated Successfully" : "Order Generated Successfully");
      if (onSuccess) {
        onSuccess();
      } else {
        window.location.href = '/sales/new';
      }
    }
  };

  const totalWeight = lineItems.reduce((acc, curr) => acc + Number(curr.weightKg || 0), 0).toFixed(2);

  if (loading) return <div className="p-8 flex items-center justify-center min-h-screen text-slate-100"><Loader text="Initializing Catalog Dependencies..." /></div>;
  if (error) return <div className="p-8"><ErrorMessage error={error} retryFunction={execute} /></div>;

  return (
    <div className="pt-2 pb-12 w-full min-h-screen">
      <div className="max-w-7xl mx-auto w-full">
        {submitError && <ErrorMessage error={submitError} />}
        
        <div className="mb-8 flex justify-between items-end">
          <div>
            <span className="text-[10px] font-semibold text-green-500 uppercase tracking-[0.2em] mb-1 block">Transaction Entry</span>
            <h1 className="text-3xl font-black text-slate-100 uppercase tracking-tight">{isEditing ? 'Edit Order' : 'New Order'}</h1>
          </div>
          <div className="flex gap-3">
            {onClose && (
              <button 
                onClick={onClose}
                className="px-6 py-2 border border-slate-700 text-slate-400 hover:bg-slate-800 transition-colors rounded text-sm font-semibold uppercase tracking-wider"
              >
                Cancel
              </button>
            )}
            <button 
              onClick={handleGenerateOrder}
              disabled={submitting}
              className="px-6 py-2 bg-green-500 text-slate-900 hover:brightness-110 transition-colors rounded text-sm font-black uppercase tracking-wider shadow-[0_0_15px_rgba(0,200,83,0.3)] disabled:opacity-50"
            >
              {submitting ? 'Saving...' : isEditing ? 'Update Order' : 'Generate Order'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 bg-slate-900 p-6 border border-blue-900/20 rounded-xl shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-2 md:col-span-1">
                <label className="text-[10px] font-bold text-green-500 uppercase tracking-widest flex items-center gap-1">
                  Order ID <span className="text-[9px] font-normal text-slate-500 normal-case tracking-normal">(Primary Reference)</span>
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input 
                      className="w-full bg-slate-800 border-green-500/50 border text-white px-4 py-3 rounded text-sm font-mono focus:ring-1 focus:ring-green-500/50 outline-none transition-all" 
                      value={orderNumber}
                      onChange={(e) => setOrderNumber(e.target.value)}
                    />
                  </div>
                  <button className="px-4 bg-blue-900 border border-green-500/30 text-green-500 hover:bg-blue-800 transition-all rounded flex items-center gap-2 group whitespace-nowrap">
                    <span className="material-symbols-outlined text-sm group-hover:scale-110 transition-transform">sync</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider">Fetch</span>
                  </button>
                </div>
                <p className="text-[9px] text-slate-500 italic">* System generated sequential ID.</p>
              </div>

              <div className="space-y-2 relative">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Customer Name</label>
                <div className="relative group">
                  <input 
                    className="w-full bg-slate-800 border-slate-700 border text-white px-4 py-3 rounded text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all" 
                    placeholder="Search customer database..." 
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                  <span className="material-symbols-outlined absolute right-3 top-3 text-slate-500">expand_more</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Number of Bags</label>
                <input 
                  className="w-full bg-slate-800 border-slate-700 border text-white px-4 py-3 rounded text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all" 
                  placeholder="0" 
                  type="number" 
                  value={bags}
                  onChange={(e) => setBags(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Order Status</label>
                <select 
                  className="w-full bg-slate-800 border-slate-700 border text-white px-4 py-3 rounded text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all appearance-none cursor-pointer"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="draft">Draft</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-blue-900/10 border border-green-500/20 p-6 rounded-xl flex flex-col justify-between shadow-lg">
            <div>
              <h3 className="text-[12px] font-black text-green-500 uppercase tracking-[0.2em] mb-4">Summary Preview</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-blue-900/30">
                  <span className="text-xs text-slate-400">Estimated Items</span>
                  <span className="text-lg font-bold text-white">{lineItems.length} Units</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-blue-900/30">
                  <span className="text-xs text-slate-400">Total Weight</span>
                  <span className="text-lg font-bold text-white">{totalWeight} kg</span>
                </div>
              </div>
            </div>
            
            <div className="mt-8 bg-slate-900 p-4 rounded border border-blue-900/20">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-green-500/10 flex items-center justify-center rounded text-green-500">
                  <span className="material-symbols-outlined">precision_manufacturing</span>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Production Line</p>
                  <p className="text-sm font-semibold text-white">Line Alpha (Automated)</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Line Items Box */}
        <div className="bg-slate-900 border border-blue-900/20 rounded-xl overflow-hidden shadow-2xl">
          <div className="px-6 py-4 bg-slate-800/40 border-b border-blue-900/30 flex justify-between items-center">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Order Line Items</h3>
            <button onClick={addLineItem} className="flex items-center gap-2 text-[11px] font-bold text-green-500 hover:text-green-400 transition-colors">
              <span className="material-symbols-outlined text-sm">add_circle</span>
              ADD NEW ROW
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-blue-900/20 text-slate-400">
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest border-r border-blue-900/10">ITEM</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest border-r border-blue-900/10">SIZE</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest border-r border-blue-900/10">QUALITY</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest border-r border-blue-900/10 w-32">Weight (kg)</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest border-r border-blue-900/10 w-32">Meter (m)</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest border-r border-blue-900/10">Color</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest border-r border-blue-900/10">Sec. Color</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-900/10">
                {lineItems.map((item) => (
                  <tr key={item.id} className="hover:bg-blue-900/5 transition-colors">
                    <td className="p-2 border-r border-blue-900/10">
                      <select 
                        className="w-full bg-slate-800 border border-slate-700 text-sm text-white px-2 py-1 rounded focus:border-green-500 outline-none" 
                        value={item.itemId} 
                        onChange={(e) => updateLineItem(item.id, 'itemId', e.target.value)}
                      >
                        <option value="">Select Item</option>
                        {masterData.items.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                      </select>
                    </td>
                    <td className="p-2 border-r border-blue-900/10">
                      <select 
                        className="w-full bg-slate-800 border border-slate-700 text-sm text-white px-2 py-1 rounded focus:border-green-500 outline-none" 
                        value={item.sizeId} 
                        onChange={(e) => updateLineItem(item.id, 'sizeId', e.target.value)}
                      >
                        <option value="">Select Size</option>
                        {masterData.sizes.map(m => <option key={m.id} value={m.id}>{m.value}</option>)}
                      </select>
                    </td>
                    <td className="p-2 border-r border-blue-900/10">
                      <select 
                        className="w-full bg-slate-800 border border-slate-700 text-sm text-white px-2 py-1 rounded focus:border-green-500 outline-none" 
                        value={item.qualityId} 
                        onChange={(e) => updateLineItem(item.id, 'qualityId', e.target.value)}
                      >
                        <option value="">Select Quality</option>
                        {masterData.qualities.map(m => <option key={m.id} value={m.id}>{m.grade}</option>)}
                      </select>
                    </td>
                    <td className="p-2 border-r border-blue-900/10">
                      <input 
                        className="w-full bg-slate-800 border border-slate-700 text-sm text-white text-center px-1 py-1 rounded focus:border-green-500 outline-none" 
                        step="0.01" 
                        type="number" 
                        placeholder="0.00"
                        value={item.weightKg} 
                        onChange={(e) => updateLineItem(item.id, 'weightKg', e.target.value)} 
                      />
                    </td>
                    <td className="p-2 border-r border-blue-900/10">
                      <input 
                        className="w-full bg-slate-800 border border-slate-700 text-sm text-white text-center px-1 py-1 rounded focus:border-green-500 outline-none" 
                        step="0.1" 
                        type="number" 
                        placeholder="0.0"
                        value={item.lengthMeter} 
                        onChange={(e) => updateLineItem(item.id, 'lengthMeter', e.target.value)} 
                      />
                    </td>
                    <td className="p-2 border-r border-blue-900/10">
                      <select 
                        className="w-full bg-slate-800 border border-slate-700 text-sm text-white px-2 py-1 rounded focus:border-green-500 outline-none" 
                        value={item.colorId} 
                        onChange={(e) => updateLineItem(item.id, 'colorId', e.target.value)}
                      >
                        <option value="">Select Color</option>
                        {masterData.colors.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                      </select>
                    </td>
                    <td className="p-2 border-r border-blue-900/10">
                       <select 
                        className="w-full bg-slate-800 border border-slate-700 text-sm text-white px-2 py-1 rounded focus:border-green-500 outline-none" 
                        value={item.secondaryColorId} 
                        onChange={(e) => updateLineItem(item.id, 'secondaryColorId', e.target.value)}
                      >
                        <option value="">Optional</option>
                        {masterData.colors.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                      </select>
                    </td>
                    <td className="p-2 text-center">
                      <button className="text-slate-500 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-500/10" onClick={() => removeLineItem(item.id)}>
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
                <tr className="bg-slate-900/50 opacity-50 hover:opacity-100 hover:bg-slate-800 transition-all cursor-pointer" onClick={addLineItem}>
                  <td className="p-4 text-center" colSpan="8">
                    <div className="flex items-center justify-center gap-2 text-slate-400 font-medium text-xs">
                      <span className="material-symbols-outlined text-sm">add</span>
                      CLICK TO ADD ANOTHER ITEM LINE
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="bg-slate-900 p-6 border border-blue-900/20 rounded-xl shadow-lg">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Internal Logistic Notes</h3>
            <textarea 
              className="w-full h-32 bg-slate-800 border-slate-700 border text-white px-4 py-3 rounded text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all placeholder:text-slate-500" 
              placeholder="Specify any technical requirements or handling instructions for production line staff..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            ></textarea>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded flex items-center gap-4">
              <span className="material-symbols-outlined text-red-500" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
              <p className="text-xs font-semibold text-red-500 uppercase tracking-wider">Inventory Alert: Industrial Coil stock is low (8 units remaining).</p>
            </div>
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded flex items-center gap-4">
              <span className="material-symbols-outlined text-green-500" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              <p className="text-xs font-semibold text-green-500 uppercase tracking-wider">Customer Credit Limit Verified: Approved for transaction.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesOrderEntry;
