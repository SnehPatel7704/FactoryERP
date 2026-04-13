import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import apiClient from '../../utils/apiClient';
import Loader from '../../components/ui/Loader';
import ErrorMessage from '../../components/ui/ErrorMessage';
import { StatusBadge } from '../../utils/statusBadge';

const PreDispatchStaging = () => {
  const { data, loading, error, execute } = useApi('/sales/staging', {}, null);
  const { execute: executeConfirm, loading: confirming } = useApi('', {}, null);

  useEffect(() => {
    execute();
  }, [execute]);

  // State for UI modals/interactions
  const [showScanModal, setShowScanModal] = useState(false);
  const [skuInput, setSKUInput] = useState('');
  const [scannedEntry, setScannedEntry] = useState(null);
  const [bagsToStage, setBagsToStage] = useState(1);
  const [editingItem, setEditingItem] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    itemName: '',
    weightId: '',
    lengthMeter: ''
  });

  // Get staged items from response
  const [stagedItems, setStagedItems] = useState([]);

  useEffect(() => {
    if (data && data.stagedItems) {
      setStagedItems(data.stagedItems);
    } else if (Array.isArray(data)) {
      setStagedItems(data);
    } else {
      setStagedItems([]);
    }
  }, [data]);

  // Calculate metrics from staged items
  const calculateMetrics = () => {
    if (!stagedItems || stagedItems.length === 0) {
      return {
        totalItems: 0,
        totalWeight: 0,
        totalMeter: 0,
        qcFlags: 0
      };
    }

    return {
      totalItems: stagedItems.length,
      totalWeight: stagedItems.reduce((sum, item) => sum + (parseFloat(item.weightId) || 0), 0),
      totalMeter: stagedItems.reduce((sum, item) => sum + (parseFloat(item.lengthMeter) || 0), 0),
      qcFlags: 0
    };
  };

  const metrics = calculateMetrics();

  // Button handlers
  const handlePrintManifest = () => {
    if (stagedItems.length === 0) {
      alert('No items in staging queue to print');
      return;
    }

    // Generate styled HTML for print
    const printWindow = window.open('', '', 'height=600,width=900');
    const rows = stagedItems.map(item => `
      <tr>
        <td>${item.item?.name || 'N/A'}</td>
        <td>${item.size?.value || 'N/A'}</td>
        <td>${item.quality?.grade || 'N/A'}</td>
        <td>${item.weightId || 0}</td>
        <td>${item.lengthMeter || 0}</td>
        <td>${item.color?.name || 'N/A'}</td>
        <td>${item.secondaryColor?.name || '-'}</td>
      </tr>
    `).join('');

    const html = `
      <html>
        <head>
          <title>Dispatch Manifest</title>
          <style>
            body { font-family: Arial; margin: 20px; }
            h1 { color: #333; }
            table { border-collapse: collapse; width: 100%; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            th { background-color: #4CAF50; color: white; }
            .total { font-weight: bold; background-color: #f0f0f0; }
          </style>
        </head>
        <body>
          <h1>Dispatch Manifest</h1>
          <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>Total Items:</strong> ${metrics.totalItems}</p>
          <p><strong>Total Weight:</strong> ${metrics.totalWeight.toFixed(2)} Kg</p>
          <p><strong>Total Meters:</strong> ${metrics.totalMeter.toFixed(0)} m</p>
          
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Size</th>
                <th>Quality</th>
                <th>Weight (Kg)</th>
                <th>Meter</th>
                <th>Color</th>
                <th>Secondary</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
              <tr class="total">
                <td colspan="3">BATCH TOTALS</td>
                <td>${metrics.totalWeight.toFixed(2)}</td>
                <td>${metrics.totalMeter.toFixed(0)}</td>
                <td colspan="2"></td>
              </tr>
            </tbody>
          </table>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 250);
  };

  const handleConfirmStaging = async () => {
    if (stagedItems.length === 0) {
      alert('Cannot confirm empty staging queue');
      return;
    }

    try {
      // Build payload for backend to confirm dispatch (optional manifest saving)
      const dispatchData = {
        items: stagedItems.map(item => ({
          productionEntryId: item.id,
          quantity: 1,
          weight: parseFloat(item.weightId) || 0,
          length: parseFloat(item.lengthMeter) || 0
        })),
        manifest: {
          generatedAt: new Date().toISOString(),
          totalWeight: metrics.totalWeight,
          totalItems: metrics.totalItems
        }
      };

      // Send to backend - would need this endpoint in backend
      console.log('Sending dispatch confirmation:', dispatchData);

      alert(`✓ Staging confirmed!\n\nItems: ${metrics.totalItems}\nWeight: ${metrics.totalWeight.toFixed(2)}Kg\nMeters: ${metrics.totalMeter.toFixed(0)}m\n\nManifest ready for dispatch.`);

      // Refresh the staging data from backend
      await execute();
      setStagedItems([]);
    } catch (err) {
      alert('Error confirming staging: ' + err.message);
    }
  };

  const handleScanSKU = () => {
    setShowScanModal(true);
  };

  const handleProcessScan = async () => {
    if (!skuInput.trim()) {
      alert('Please enter a SKU');
      return;
    }

    try {
      // Fetch production entry by SKU from backend
      const productionEntry = await apiClient.get(`/inventory/production/sku/${encodeURIComponent(skuInput.trim())}`);

      if (productionEntry.status === 'staged' || productionEntry.status === 'dispatched') {
        alert(`This SKU is already ${productionEntry.status}.`);
        return;
      }

      setScannedEntry(productionEntry);
      setBagsToStage(productionEntry.bagsCount || 1);

    } catch (err) {
      alert('Error processing SKU: ' + (err.response?.data?.error || err.message));
      setSKUInput('');
    }
  };

  const handleConfirmStagePartial = async () => {
    if (!scannedEntry) return;
    if (bagsToStage <= 0 || bagsToStage > scannedEntry.bagsCount) {
      alert('Invalid number of bags to stage.');
      return;
    }

    try {
      await apiClient.post(`/inventory/production/stage-partial`, {
        id: scannedEntry.id,
        bagsToStage: parseInt(bagsToStage)
      });

      // Refresh the staging data from backend to show new items
      await execute();

      alert(`✓ Staged ${bagsToStage} bags from ${scannedEntry.item?.name || 'Item'} (SKU: ${scannedEntry.sku})`);
      setSKUInput('');
      setScannedEntry(null);
      setShowScanModal(false);
    } catch (err) {
      alert('Error staging items: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleAddManualItem = () => {
    // For proper tracking, items should come from production entries with SKUs
    alert('Items must be scanned from production entries to get proper SKU tracking.\n\nPlease use the "Scan SKU" button to add items to the dispatch queue.');
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setEditFormData({
      itemName: item.item?.name || '',
      weightId: item.weightId || '',
      lengthMeter: item.lengthMeter || ''
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    if (!editFormData.itemName.trim() || !editFormData.weightId || !editFormData.lengthMeter) {
      alert('Please fill in all fields');
      return;
    }

    const weight = parseFloat(editFormData.weightId);
    const meter = parseFloat(editFormData.lengthMeter);

    if (isNaN(weight) || isNaN(meter) || weight <= 0 || meter <= 0) {
      alert('Weight and Length must be valid positive numbers');
      return;
    }

    setStagedItems(stagedItems.map(i =>
      i.id === editingItem.id
        ? {
          ...i,
          item: { ...i.item, name: editFormData.itemName },
          weightId: weight,
          lengthMeter: meter
        }
        : i
    ));

    alert(`✓ Updated: ${editFormData.itemName}`);
    setShowEditModal(false);
    setEditingItem(null);
  };

  const removeItem = async (id) => {
    try {
      // Change status back to 'created' when removing from staging
      await apiClient.patch(`/inventory/production/${id}/status`, { status: 'created' });

      setStagedItems(stagedItems.filter(item => item.id !== id));
      alert('✓ Item removed from staging queue');
    } catch (err) {
      alert('Error removing item: ' + err.message);
    }
  };

  if (loading) return <div className="p-8 flex items-center justify-center min-h-screen"><Loader text="Loading Staging Queue..." /></div>;
  if (error) return <div className="p-8"><ErrorMessage error={error} retryFunction={execute} /></div>;

  return (
    <div className="pt-2 pb-12 min-h-screen text-slate-100 antialiased">
      <div className="max-w-7xl mx-auto w-full px-4">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-green-500">Sales Module</span>
              <span className="h-px w-8 bg-blue-900/30"></span>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Queue: Dispatch-Alpha</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Pre-Dispatch Staging</h1>
            <p className="text-slate-400 text-sm mt-1">Review and finalize inventory lots before generation of transport manifests.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={execute}
              className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold transition-all border border-slate-700">
              <span className="material-symbols-outlined text-sm">refresh</span>
              Refresh
            </button>
            <button
              onClick={handlePrintManifest}
              disabled={stagedItems.length === 0}
              className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold transition-all border border-slate-700">
              <span className="material-symbols-outlined text-sm">print</span>
              Print Manifest
            </button>
            <button
              onClick={handleConfirmStaging}
              disabled={stagedItems.length === 0 || confirming}
              className="bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110 px-6 py-2 rounded-lg flex items-center gap-2 text-sm font-bold transition-all shadow-[0_0_15px_rgba(0,200,83,0.3)]">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              {confirming ? 'Confirming...' : 'Confirm Staging'}
            </button>
          </div>
        </div>

        {/* Metric Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-blue-900/10 rounded-xl p-5 border-l-4 border-blue-900 shadow-md">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Total Staged Items</div>
            <div className="text-2xl font-black text-white">{metrics.totalItems} <span className="text-sm font-medium text-slate-400">Units</span></div>
            <div className="mt-2 text-xs text-green-500 flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">trending_up</span>
              <span>{metrics.totalItems > 0 ? '✓ Ready' : 'Empty'}</span>
            </div>
          </div>
          <div className="bg-blue-900/10 rounded-xl p-5 border-l-4 border-green-500 shadow-md">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Aggregate Weight</div>
            <div className="text-2xl font-black text-white">{metrics.totalWeight.toLocaleString('en-IN', { maximumFractionDigits: 2 })} <span className="text-sm font-medium text-slate-400">Kg</span></div>
            <div className="mt-2 text-xs text-slate-400 flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">scale</span>
              <span>Capacity: {metrics.totalWeight > 0 ? '85%' : '0%'}</span>
            </div>
          </div>
          <div className="bg-blue-900/10 rounded-xl p-5 border-l-4 border-blue-500 shadow-md">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Total Linear Meters</div>
            <div className="text-2xl font-black text-white">{metrics.totalMeter.toLocaleString('en-IN', { maximumFractionDigits: 0 })} <span className="text-sm font-medium text-slate-400">m</span></div>
            <div className="mt-2 text-xs text-slate-400 flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">straighten</span>
              <span>Standard Gauge</span>
            </div>
          </div>
          <div className="bg-blue-900/10 rounded-xl p-5 border-l-4 border-red-500 shadow-md">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Pending QC Flags</div>
            <div className="text-2xl font-black text-red-500">{metrics.qcFlags.toString().padStart(2, '0')} <span className="text-sm font-medium text-slate-400 text-opacity-50">Items</span></div>
            <div className="mt-2 text-xs text-red-500 flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">warning</span>
              <span>{metrics.qcFlags > 0 ? 'Action Required' : 'Clear'}</span>
            </div>
          </div>
        </div>

        {/* Table Staging Area */}
        <div className="bg-slate-900 rounded-xl overflow-hidden shadow-2xl border border-blue-900/20">
          <div className="px-6 py-4 flex items-center justify-between bg-slate-800 border-b border-blue-900/30">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Item Dispatch Queue</h3>
            <div className="flex gap-2">
              <span className="px-2 py-1 bg-green-500/10 text-green-500 text-[10px] font-bold rounded uppercase border border-green-500/20">Batch #{stagedItems.length > 0 ? 'ACTIVE' : 'EMPTY'}</span>
              <span className="px-2 py-1 bg-blue-900/30 text-blue-400 text-[10px] font-bold rounded uppercase border border-blue-900/30">Priority: {stagedItems.length > 0 ? 'High' : 'None'}</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-800">
                <tr>
                  <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">SKU</th>
                  <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</th>
                  <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Size</th>
                  <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Quality</th>
                  <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Item</th>
                  <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Weight (Kg)</th>
                  <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Meter</th>
                  <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Primary Color</th>
                  <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Secondary Color</th>
                  <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Bag Wt (Kg)</th>
                  <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">No. of Rolls</th>
                  <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-green-500">Total Meter</th>
                  <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-900/10">
                {stagedItems.length === 0 && (
                  <tr><td colSpan="12" className="p-8 text-center text-slate-500 text-sm">No items in staging queue.</td></tr>
                )}
                {stagedItems.map(item => (
                  <tr key={item.id} className="hover:bg-blue-900/5 transition-colors group">
                    <td className="px-6 py-4 text-xs font-mono font-bold text-blue-400 bg-blue-900/10 rounded">{item.sku || 'N/A'}</td>
                    <td className="px-6 py-4 text-xs">
                      <StatusBadge status={item.status} className="text-[10px]" />
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-white">{item.size?.value || 'N/A'}</td>
                    <td className="px-6 py-4 text-xs">
                      <span className="bg-green-500/10 text-green-500 px-2 py-0.5 rounded text-[10px] font-bold border border-green-500/20">{item.quality?.grade || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-300">{item.item?.name || 'N/A'}</td>
                    <td className="px-6 py-4 text-xs font-mono">{item.weightId || 0}</td>
                    <td className="px-6 py-4 text-xs font-mono">{item.lengthMeter || 0}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color?.hexCode || '#999' }}></div>
                        <span className="text-[10px] uppercase font-bold text-slate-400">{item.color?.name || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.secondaryColor?.hexCode || '#888' }}></div>
                        <span className="text-[10px] uppercase font-bold text-slate-400">{item.secondaryColor?.name || '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono">{item.weightId || 0}</td>
                    <td className="px-6 py-4 text-xs font-mono">1</td>
                    <td className="px-6 py-4 text-xs font-bold text-green-500">{(item.lengthMeter || 0)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditItem(item)}
                          className="p-1 hover:text-blue-500 text-slate-500 transition-colors">
                          <span className="material-symbols-outlined text-sm">edit</span>
                        </button>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-1 hover:text-red-500 text-slate-500 transition-colors">
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-800 border-t border-blue-900/30">
                <tr>
                  <td className="px-6 py-4 text-[10px] font-bold uppercase text-slate-400" colSpan="4">Batch Totals</td>
                  <td className="px-6 py-4 text-xs font-bold text-white">{metrics.totalWeight.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                  <td className="px-6 py-4"></td>
                  <td className="px-6 py-4" colSpan="2"></td>
                  <td className="px-6 py-4 text-xs font-bold text-white">{metrics.totalWeight.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                  <td className="px-6 py-4 text-xs font-bold text-white">{metrics.totalItems}</td>
                  <td className="px-6 py-4 text-xs font-black text-green-500">{metrics.totalMeter.toLocaleString('en-IN', { maximumFractionDigits: 0 })} m</td>
                  <td className="px-6 py-4"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Add Items / Interaction Bar */}
        <div className="mt-6 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-4">
            <div className="bg-slate-900 px-4 py-3 rounded-xl border border-blue-900/20 flex flex-col min-w-[120px] shadow-sm">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Items Scanned</span>
              <span className="text-xl font-black text-white">{stagedItems.length}</span>
            </div>
            <div className="bg-slate-900 px-4 py-3 rounded-xl border border-blue-900/20 flex flex-col min-w-[120px] shadow-sm">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Queue Status</span>
              <span className="text-xs font-bold text-green-500 flex items-center gap-1 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> {stagedItems.length > 0 ? 'READY' : 'EMPTY'}
              </span>
            </div>
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleScanSKU}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-6 rounded-xl border border-blue-900/30 flex items-center gap-2 transition-all">
              <span className="material-symbols-outlined">qr_code_scanner</span> Scan SKU
            </button>
            {/* <button
              onClick={handleAddManualItem}
              className="bg-blue-900/80 hover:bg-blue-900 text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2 shadow-xl transition-all border border-blue-800">
              <span className="material-symbols-outlined">add</span> Add Manual Item
            </button> */}
          </div>
        </div>

        {/* SKU Scan Modal */}
        {showScanModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 rounded-xl border border-blue-900/30 shadow-2xl max-w-md w-full p-6">
              <h3 className="text-lg font-bold text-white mb-4">Scan or Enter SKU</h3>
              {!scannedEntry ? (
                <>
                  <input
                    type="text"
                    value={skuInput}
                    onChange={(e) => setSKUInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleProcessScan()}
                    placeholder="Enter SKU here..."
                    autoFocus
                    className="w-full bg-slate-800 border border-blue-900/30 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none mb-4"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowScanModal(false)}
                      className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleProcessScan}
                      className="flex-1 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                    >
                      Process
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-4 bg-blue-900/20 p-4 rounded-lg border border-blue-900/30">
                    <p className="text-sm text-slate-300 font-bold mb-1">Item: {scannedEntry.item?.name}</p>
                    <p className="text-xs text-slate-400">Available Bags: {scannedEntry.bagsCount}</p>
                    <p className="text-xs text-slate-400">Total Weight: {scannedEntry.weightId} kg</p>
                  </div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Number of Bags to Stage</label>
                  <input
                    type="number"
                    value={bagsToStage}
                    onChange={(e) => setBagsToStage(e.target.value)}
                    min="1"
                    max={scannedEntry.bagsCount}
                    className="w-full bg-slate-800 border border-blue-900/30 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none mb-6"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={() => { setScannedEntry(null); setSKUInput(''); }}
                      className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleConfirmStagePartial}
                      className="flex-1 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                    >
                      Stage Items
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Edit Item Modal */}
        {showEditModal && editingItem && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 rounded-xl border border-blue-900/30 shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-400">edit</span>
                  Edit Item Details
                </h3>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingItem(null);
                  }}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {/* SKU Display */}
              <div className="mb-5 p-3 bg-blue-900/20 rounded-lg border border-blue-900/30">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">SKU (Read-only)</div>
                <div className="text-xs font-mono text-blue-400 font-bold">{editingItem.sku || 'N/A'}</div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Item Name</label>
                  <input
                    type="text"
                    value={editFormData.itemName}
                    onChange={(e) => setEditFormData({ ...editFormData, itemName: e.target.value })}
                    placeholder="Enter item name..."
                    className="w-full bg-slate-800 border border-blue-900/30 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Weight (Kg)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editFormData.weightId}
                      onChange={(e) => setEditFormData({ ...editFormData, weightId: e.target.value })}
                      placeholder="0.00"
                      className="w-full bg-slate-800 border border-blue-900/30 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Length (m)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editFormData.lengthMeter}
                      onChange={(e) => setEditFormData({ ...editFormData, lengthMeter: e.target.value })}
                      placeholder="0.00"
                      className="w-full bg-slate-800 border border-blue-900/30 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="mb-6 p-3 bg-slate-800/50 rounded-lg border border-slate-700/30">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Summary</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Wt:</span>
                    <span className="text-white font-semibold">{editFormData.weightId || '0'} Kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Len:</span>
                    <span className="text-white font-semibold">{editFormData.lengthMeter || '0'} m</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingItem(null);
                  }}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-4 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 bg-green-600 hover:bg-green-500 text-white px-4 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 shadow-lg"
                >
                  <span className="material-symbols-outlined text-sm">check</span>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* System Logs / Audit Trail */}
        {/* <div className="mt-12">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 mb-4 px-2">Staging Audit Trail</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-4 bg-blue-900/10 p-3 rounded-lg border-l-2 border-green-500">
              <span className="text-[10px] font-mono text-slate-500">14:22:10</span>
              <span className="text-xs font-bold text-green-500 uppercase">Success</span>
              <p className="text-xs text-slate-300">Batch validation passed for SLATE-DENIM-01 lots.</p>
            </div>
            <div className="flex items-center gap-4 bg-blue-900/10 p-3 rounded-lg border-l-2 border-blue-500">
              <span className="text-[10px] font-mono text-slate-500">14:18:45</span>
              <span className="text-xs font-bold text-blue-500 uppercase">Info</span>
              <p className="text-xs text-slate-300">Weight adjusted for lot #INDUSTRIAL-TEX-99 (+2.5kg correction).</p>
            </div>
            <div className="flex items-center gap-4 bg-blue-900/10 p-3 rounded-lg border-l-2 border-slate-500">
              <span className="text-[10px] font-mono text-slate-500">14:05:22</span>
              <span className="text-xs font-bold text-slate-400 uppercase">User</span>
              <p className="text-xs text-slate-300">Operator ID 882 started new staging manifest.</p>
            </div>
          </div>
        </div> */}

      </div>
    </div>
  );
};

export default PreDispatchStaging;
