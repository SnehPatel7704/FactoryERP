import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import Loader from '../../components/ui/Loader';
import ErrorMessage from '../../components/ui/ErrorMessage';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { X, Save, Plus, Trash2 } from 'lucide-react';

const SalesOrderEntry = ({ order, onClose, onSuccess }) => {
  // Use custom API hook for initialization
  const { data: masterData, loading, error, execute } = useApi('/master/all', {}, { items: [], colors: [], sizes: [], qualities: [] });
  // We'll need a distinct hook for POST request so it doesn't overwrite masterData
  const { loading: submitting, error: submitError, execute: executeSubmit } = useApi('', {}, null);

  const isEditing = !!order;

  // Track production entries instead of raw line items
  const [scannedEntries, setScannedEntries] = useState([]);
  const [skuInput, setSkuInput] = useState('');

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
      if (order.productionEntries && order.productionEntries.length > 0) {
        setScannedEntries(order.productionEntries);
      } else if (order.lineItems && order.lineItems.length > 0) {
        // Fallback for legacy orders
        setScannedEntries(order.lineItems.map(item => ({
          ...item,
          isLegacy: true,
          sku: `LEGACY-${item.id.slice(0, 6)}`,
          item: masterData.items.find(m => m.id === item.itemId),
          size: masterData.sizes.find(m => m.id === item.sizeId),
          quality: masterData.qualities.find(m => m.id === item.qualityId),
          color: masterData.colors.find(m => m.id === item.colorId),
          secondaryColor: masterData.colors.find(m => m.id === item.secondaryColorId)
        })));
      }
    }
  }, [order, isEditing, masterData]);

  const handleAddSku = async () => {
    if (!skuInput.trim()) return;
    try {
      const module = await import('../../utils/apiClient.js');
      const apiClient = module.default;

      const entry = await apiClient.get(`/inventory/production/sku/${encodeURIComponent(skuInput.trim())}`);

      if (entry.status !== 'staged') {
        // It's possible operators skip staging in emergencies. In that case we probably shouldn't strictly block it, but a warning would be nice.
        // Due to the strict flow, we enforce staging.
        alert(`Cannot add: SKU is currently ${entry.status}. Please stage it first.`);
        return;
      }

      if (scannedEntries.some(e => e.id === entry.id)) {
        alert('SKU is already added to this order.');
        return;
      }

      setScannedEntries([...scannedEntries, entry]);
      setSkuInput('');
    } catch (err) {
      alert('Error finding SKU: ' + (err.response?.data?.error || err.message));
    }
  };

  // We should import apiClient at the top. Let's do that in a different chunk.

  const handleGenerateOrder = async () => {
    const payload = {
      orderNumber,
      customerName,
      status,
      bags: parseInt(bags) || 0,
      internalNotes: notes,
      productionEntryIds: scannedEntries.filter(e => !e.isLegacy).map(e => e.id),
      lineItems: scannedEntries.map(entry => ({
        itemId: entry.itemId,
        sizeId: entry.sizeId,
        qualityId: entry.qualityId,
        colorId: entry.colorId,
        secondaryColorId: entry.secondaryColorId,
        weightId: Number(entry.weightId) || 0,
        lengthMeter: Number(entry.lengthMeter) || null,
      }))
    };

    const endpoint = isEditing ? `/sales/${order.id}` : '/sales/new';
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

  const removeScannedEntry = (id) => {
    setScannedEntries(scannedEntries.filter(item => item.id !== id));
  };

  const totalWeight = scannedEntries.reduce((acc, curr) => acc + Number(curr.weightId || 0), 0).toFixed(2);
  const calculatedBags = scannedEntries.reduce((acc, curr) => acc + (curr.bagsCount || (curr.isLegacy ? 0 : 1)), 0);

  useEffect(() => {
    if (!isEditing && calculatedBags > 0) {
      setBags(calculatedBags.toString());
    }
  }, [calculatedBags, isEditing]);

  if (loading) return <div className="p-8 flex items-center justify-center min-h-screen"><Loader text="Initializing Catalog Dependencies..." /></div>;
  if (error) return <div className="p-8"><ErrorMessage error={error} retryFunction={execute} /></div>;

  return (
    <div className="animate-in fade-in duration-300 pt-2 pb-12 w-full min-h-screen">
      <div className="max-w-7xl mx-auto w-full px-4">
        {submitError && <ErrorMessage error={submitError} />}

        <div className="mb-8 flex justify-between items-end">
          <div>
            <span className="text-[10px] font-semibold text-secondary uppercase tracking-[0.2em] mb-1 block">Transaction Entry</span>
            <h1 className="text-3xl font-black text-on-surface uppercase tracking-tight">{isEditing ? 'EDIT ORDER' : 'NEW ORDER'}</h1>
          </div>
          <div className="flex gap-3">
            {onClose && (
              <Button variant="ghost" onClick={onClose} className="flex items-center gap-2">
                <X size={16} />
                Cancel
              </Button>
            )}
            <Button
              variant="primary"
              onClick={handleGenerateOrder}
              disabled={submitting}
              className="flex items-center gap-2"
            >
              <Save size={16} />
              {submitting ? 'Saving...' : isEditing ? 'Update Order' : 'Generate Order'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 bg-surface-container border border-outline/30 p-6 rounded-xl shadow">
            <h3 className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-6">Order Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Order ID</label>
                <div className="flex gap-2">
                  <input
                    className="flex-1 px-4 py-3 rounded text-sm bg-surface-container-highest border border-outline text-on-surface focus:border-secondary outline-none transition-all font-mono"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    readOnly
                  />
                </div>
                <p className="text-[8px] text-on-surface-variant">System generated sequential ID</p>
              </div>

              <Input
                label="Customer Name"
                placeholder="Enter customer name..."
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />

              <Input
                label="Number of Bags"
                type="number"
                placeholder="0"
                value={bags}
                onChange={(e) => setBags(e.target.value)}
              />

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block">Order Status</label>
                <select
                  className="w-full px-4 py-3 rounded text-sm bg-surface-container-highest border border-outline text-on-surface focus:border-secondary outline-none transition-all appearance-none cursor-pointer"
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

          <div className="bg-secondary/10 border border-secondary/30 p-6 rounded-xl flex flex-col justify-between shadow">
            <div>
              <h3 className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-4">Order Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-outline/20">
                  <span className="text-xs text-on-surface-variant">Total Items</span>
                  <span className="text-lg font-bold text-on-surface">{scannedEntries.length}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-outline/20">
                  <span className="text-xs text-on-surface-variant">Total Weight</span>
                  <span className="text-lg font-bold text-on-surface">{totalWeight} kg</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-on-surface-variant">Total Bags</span>
                  <span className="text-lg font-bold text-on-surface">{bags || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Line Items Box */}
        <div className="bg-surface-container border border-outline/30 rounded-xl overflow-hidden shadow">
          <div className="px-6 py-4 bg-surface-container-highest border-b border-outline/30 flex flex-wrap gap-4 justify-between items-center">
            <h3 className="text-sm font-black text-on-surface uppercase tracking-widest">Order Line Items</h3>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Scan SKU & Press Enter..."
                value={skuInput}
                onChange={(e) => setSkuInput(e.target.value)}
                onKeyPress={async (e) => {
                  if (e.key === 'Enter') {
                    await handleAddSku();
                  }
                }}
                className="bg-surface-container border border-outline text-sm text-on-surface px-4 py-2 rounded-lg focus:border-secondary outline-none w-64 font-mono"
              />
              <button
                type="button"
                onClick={handleAddSku}
                disabled={!skuInput.trim()}
                className="bg-secondary/20 hover:bg-secondary/30 text-secondary border border-secondary/30 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest transition-colors flex items-center gap-1 disabled:opacity-50"
              >
                <Plus size={16} /> ADD
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-highest border-b border-outline/20">
                  <th className="px-3 py-3 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">SKU</th>
                  <th className="px-3 py-3 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">ITEM</th>
                  <th className="px-3 py-3 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">SIZE</th>
                  <th className="px-3 py-3 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">QUALITY</th>
                  <th className="px-3 py-3 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">BAGS</th>
                  <th className="px-3 py-3 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Weight (kg)</th>
                  <th className="px-3 py-3 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Meter (m)</th>
                  <th className="px-3 py-3 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Color</th>
                  <th className="px-3 py-3 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Sec Color</th>
                  <th className="px-3 py-3 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline/20">
                {scannedEntries.map((item) => (
                  <tr key={item.id} className="hover:bg-secondary/5 transition-colors">
                    <td className="p-2 text-sm font-mono text-secondary">{item.sku}</td>
                    <td className="p-2 text-sm text-on-surface">{item.item?.name || 'N/A'}</td>
                    <td className="p-2 text-sm text-on-surface">{item.size?.value || 'N/A'}</td>
                    <td className="p-2 text-sm text-on-surface"><span className="bg-secondary/10 text-secondary px-2 py-0.5 rounded text-[10px] font-bold">{item.quality?.grade || 'N/A'}</span></td>
                    <td className="p-2 text-sm text-on-surface text-center font-bold">{item.bagsCount || 1}</td>
                    <td className="p-2 text-sm text-on-surface text-center font-mono">{item.weightId}</td>
                    <td className="p-2 text-sm text-on-surface text-center font-mono">{item.lengthMeter || '-'}</td>
                    <td className="p-2 text-sm text-on-surface capitalize">{item.color?.name || 'N/A'}</td>
                    <td className="p-2 text-sm text-on-surface capitalize">{item.secondaryColor?.name || '-'}</td>
                    <td className="p-2 text-center">
                      <button
                        onClick={() => removeScannedEntry(item.id)}
                        className="text-on-surface-variant hover:text-error transition-colors p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {scannedEntries.length === 0 && (
                  <tr>
                    <td colSpan="10" className="p-8 text-center text-on-surface-variant text-sm">
                      No items scanned. Scan a staged SKU to add it to the order.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-surface-container border border-outline/30 p-6 rounded-xl shadow">
            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block mb-3">Internal Notes</label>
            <textarea
              className="w-full h-24 bg-surface-container-highest border border-outline text-on-surface px-4 py-3 rounded text-sm focus:border-secondary outline-none transition-all placeholder:text-on-surface-variant/50"
              placeholder="Add any handling instructions or notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            ></textarea>
          </div>
          <div className="space-y-3">
            <div className="p-4 bg-error/10 border border-error/30 rounded flex gap-3">
              <span className="text-error font-bold text-sm">⚠</span>
              <p className="text-xs text-error font-semibold">Check inventory levels before confirming order</p>
            </div>
            <div className="p-4 bg-secondary/10 border border-secondary/30 rounded flex gap-3">
              <span className="text-secondary font-bold text-sm">✓</span>
              <p className="text-xs text-secondary font-semibold">Order ready for production line assignment</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 pt-6 border-t border-outline/30 flex justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="px-8 py-3 rounded-lg text-on-surface-variant font-semibold text-sm hover:text-on-surface transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleGenerateOrder}
            disabled={submitting || scannedEntries.length === 0}
            className="bg-secondary text-on-secondary px-12 py-3 rounded-lg font-black text-sm tracking-widest shadow-lg shadow-secondary/20 hover:shadow-secondary/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 uppercase"
          >
            <span className="material-symbols-outlined text-[18px]">save</span>
            {submitting ? 'Processing...' : isEditing ? 'Update Order' : 'Generate Order'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SalesOrderEntry;
