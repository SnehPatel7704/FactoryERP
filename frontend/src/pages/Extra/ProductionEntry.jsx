import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import Loader from '../../components/ui/Loader';
import ErrorMessage from '../../components/ui/ErrorMessage';

const ProductionEntry = () => {
  // Use custom API hook for initialization
  const { data: masterData, loading, error, execute: fetchMaster } = useApi('/master/all', {}, { items: [], colors: [], sizes: [], qualities: [] });
  const { loading: submitting, error: submitError, execute: executeSubmit } = useApi('', {}, null);
  const { data: dailyStats, execute: fetchDailyStats } = useApi('/reports/daily', {}, { totalweightId: 0, totalMeterM: 0, totalEntries: 0 });
  const { data: recentEntries, execute: fetchRecentEntries } = useApi('/inventory/production/recent', {}, []);

  const [formData, setFormData] = useState({
    sizeId: '',
    qualityId: '',
    itemId: '',
    colorId: '',
    secondaryColorId: '',
    accentColorId: '',
    batchNumber: '',
    weightId: '',
    lengthMeter: '',
    bagsCount: '',
    entryDate: new Date().toISOString().split('T')[0]
  });

  const [selectedTemplate, setSelectedTemplate] = useState('');

  useEffect(() => {
    fetchMaster();
    fetchDailyStats();
    fetchRecentEntries();
  }, [fetchMaster, fetchDailyStats, fetchRecentEntries]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Validate numeric fields
    if (name === 'weightId' || name === 'lengthMeter' || name === 'bagsCount') {
      const numValue = parseFloat(value);
      if (value === '') {
        setFormData({ ...formData, [name]: '' });
      } else if (isNaN(numValue)) {
        return; // Ignore non-numeric input
      } else if (numValue < 0) {
        return; // Ignore negative values
      } else {
        setFormData({ ...formData, [name]: value });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleLoadTemplate = (entryId) => {
    if (!entryId || !recentEntries || recentEntries.length === 0) {
      alert('Please select a valid entry to load');
      return;
    }
    const selectedEntry = recentEntries.find(e => e.id === entryId);
    if (selectedEntry) {
      setFormData({
        sizeId: selectedEntry.sizeId || '',
        qualityId: selectedEntry.qualityId || '',
        itemId: selectedEntry.itemId || '',
        colorId: selectedEntry.colorId || '',
        secondaryColorId: selectedEntry.secondaryColorId || '',
        accentColorId: selectedEntry.accentColorId || '',
        batchNumber: selectedEntry.batchNumber ? `${selectedEntry.batchNumber}-copy` : '',
        weightId: '',
        lengthMeter: '',
        bagsCount: '',
        entryDate: new Date().toISOString().split('T')[0]
      });
      setSelectedTemplate('');
      alert(`Loaded template from ${selectedEntry.item?.name || 'Previous Order'}`);
    } else {
      alert('Entry not found!');
    }
  };

  const handleClear = () => {
    setFormData({
      sizeId: '',
      qualityId: '',
      itemId: '',
      colorId: '',
      secondaryColorId: '',
      accentColorId: '',
      batchNumber: '',
      weightId: '',
      lengthMeter: '',
      bagsCount: '',
      entryDate: new Date().toISOString().split('T')[0]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate batch number
    if (!formData.batchNumber || formData.batchNumber.trim().length === 0) {
      alert('Batch/Slot Number is required');
      return;
    }

    if (formData.batchNumber.length > 50) {
      alert('Batch Number must be less than 50 characters');
      return;
    }

    // Validate numeric values
    const weightId = parseFloat(formData.weightId);
    const lengthMeter = parseFloat(formData.lengthMeter);
    const bagsCount = parseInt(formData.bagsCount) || 0;

    if (weightId <= 0 || isNaN(weightId)) {
      alert('Weight must be a positive number');
      return;
    }

    if (lengthMeter <= 0 || isNaN(lengthMeter)) {
      alert('Meter must be a positive number');
      return;
    }

    if (weightId > 999999 || lengthMeter > 999999) {
      alert('Values must be less than 1,000,000');
      return;
    }

    const payload = {
      itemId: formData.itemId,
      sizeId: formData.sizeId,
      qualityId: formData.qualityId,
      colorId: formData.colorId,
      secondaryColorId: formData.secondaryColorId || null,
      accentColorId: formData.accentColorId || null,
      batchNumber: formData.batchNumber.trim(),
      weightId: weightId,
      lengthMeter: lengthMeter,
      bagsCount: bagsCount || 1,
      entryDate: formData.entryDate,
      shiftCode: null,
      machineCenter: null,
      operatorId: null
    };

    const { error: reqError } = await executeSubmit('/inventory/production/entry', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    if (!reqError) {
      alert("Production Entry Submitted Successfully");
      handleClear();
      setSelectedTemplate('');
      fetchDailyStats();
      fetchRecentEntries();
    } else {
      alert(`Submission Error: ${submitError || 'Unknown error occurred'}`);
    }
  };

  if (loading) return <div className="p-8 flex items-center justify-center min-h-screen text-slate-100"><Loader text="Initializing Production Context..." /></div>;
  if (error) return <div className="p-8"><ErrorMessage error={error} retryFunction={fetchMaster} /></div>;

  return (
    <div className="pt-2 pb-12 w-full min-h-screen">
      <div className="max-w-7xl mx-auto w-full">
        {submitError && <ErrorMessage error={submitError} />}

        {/* Action Header */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-green-500 mb-1">Production Hub</p>
            <h3 className="text-2xl font-extrabold text-white">Production Entry</h3>
          </div>
          <button className="bg-green-500 text-slate-900 px-6 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 shadow-lg shadow-green-500/20 hover:brightness-110 transition-all active:scale-95">
            <span className="material-symbols-outlined text-lg">add</span>
            NEW BATCH
          </button>
        </div>

        <div className="grid grid-cols-12 gap-8">
          {/* Form Section: New Production Entry */}
          <section className="col-span-12 lg:col-span-8">
            <div className="bg-blue-900/10 border border-blue-900/20 rounded-xl p-8 backdrop-blur-sm relative overflow-hidden shadow-lg">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <span className="material-symbols-outlined text-8xl">precision_manufacturing</span>
              </div>
              <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-green-500 rounded-full"></span>
                New Production Entry
              </h4>

              {/* Quick Load from Previous Orders */}
              {recentEntries && recentEntries.length > 0 && !loading && (
                <div className="mb-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                  <div className="flex gap-3 items-end">
                    <div className="flex-1">
                      <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 block mb-2">Load from Previous Order</label>
                      <select
                        value={selectedTemplate}
                        onChange={(e) => setSelectedTemplate(e.target.value)}
                        className="w-full bg-slate-800 border-slate-700 border rounded-lg text-sm text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 py-2 outline-none transition-all"
                      >
                        <option value="">Select a recent order...</option>
                        {recentEntries && recentEntries.length > 0 ? recentEntries.map((entry) => {
                          const colorName = entry.color?.name || 'No color';
                          return (
                            <option key={entry.id} value={entry.id}>
                              {entry.item?.name || 'N/A'} - {entry.batchNumber || 'N/A'} ({colorName}) - {new Date(entry.entryDate).toLocaleDateString('en-IN')}
                            </option>
                          );
                        }) : <option value="">No recent entries available</option>}
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleLoadTemplate(selectedTemplate)}
                      disabled={!selectedTemplate || loading}
                      className="bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold text-sm hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      {loading ? 'Loading...' : 'Load Template'}
                    </button>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                {/* Size */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Size</label>
                  <select required name="sizeId" value={formData.sizeId} onChange={handleChange} className="w-full bg-slate-800 border-slate-700 border rounded-lg text-sm text-white focus:ring-1 focus:ring-green-500 focus:border-green-500 py-3 outline-none transition-all">
                    <option value="">Select Size</option>
                    {masterData.sizes.map(m => <option key={m.id} value={m.id}>{m.value}</option>)}
                  </select>
                </div>

                {/* Quality */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Quality</label>
                  <select required name="qualityId" value={formData.qualityId} onChange={handleChange} className="w-full bg-slate-800 border-slate-700 border rounded-lg text-sm text-white focus:ring-1 focus:ring-green-500 focus:border-green-500 py-3 outline-none transition-all">
                    <option value="">Select Quality</option>
                    {masterData.qualities.map(m => <option key={m.id} value={m.id}>{m.grade}</option>)}
                  </select>
                </div>

                {/* Item */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Item</label>
                  <select required name="itemId" value={formData.itemId} onChange={handleChange} className="w-full bg-slate-800 border-slate-700 border rounded-lg text-sm text-white focus:ring-1 focus:ring-green-500 focus:border-green-500 py-3 outline-none transition-all">
                    <option value="">Select Item</option>
                    {masterData.items.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>

                {/* Primary Color */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Primary Color</label>
                  <div className="relative">
                    <select required name="colorId" value={formData.colorId} onChange={handleChange} className="w-full bg-slate-800 border-slate-700 border rounded-lg text-sm text-white focus:ring-1 focus:ring-green-500 focus:border-green-500 py-3 pl-10 outline-none transition-all">
                      <option value="">Select Color</option>
                      {masterData.colors.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-black border border-white/20"></div>
                  </div>
                </div>

                {/* Secondary Color */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Sec. Color (Optional)</label>
                  <div className="relative">
                    <select name="secondaryColorId" value={formData.secondaryColorId} onChange={handleChange} className="w-full bg-slate-800 border-slate-700 border rounded-lg text-sm text-white focus:ring-1 focus:ring-green-500 focus:border-green-500 py-3 pl-10 outline-none transition-all">
                      <option value="">None</option>
                      {masterData.colors.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-slate-500 border border-white/20"></div>
                  </div>
                </div>

                {/* Accent Color */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Accent (Optional)</label>
                  <div className="relative">
                    <select name="accentColorId" value={formData.accentColorId} onChange={handleChange} className="w-full bg-slate-800 border-slate-700 border rounded-lg text-sm text-white focus:ring-1 focus:ring-green-500 focus:border-green-500 py-3 pl-10 outline-none transition-all">
                      <option value="">None</option>
                      {masterData.colors.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-blue-500 border border-white/20"></div>
                  </div>
                </div>

                {/* Batch/Slot */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Batch / Slot Number</label>
                  <input required name="batchNumber" value={formData.batchNumber} onChange={handleChange} className="w-full bg-slate-800 border-slate-700 border rounded-lg text-sm text-white focus:ring-1 focus:ring-green-500 focus:border-green-500 py-3 outline-none transition-all" placeholder="e.g., B-102 / S-4" type="text" />
                </div>

                {/* Production Weight */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Production (Kg)</label>
                  <input required name="weightId" value={formData.weightId} onChange={handleChange} className="w-full bg-slate-800 border-slate-700 border rounded-lg text-sm text-white focus:ring-1 focus:ring-green-500 focus:border-green-500 py-3 outline-none transition-all" placeholder="0.00" step="0.01" type="number" min="0" max="999999" />
                </div>

                {/* Production Meter */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Meter (m)</label>
                  <input required name="lengthMeter" value={formData.lengthMeter} onChange={handleChange} className="w-full bg-slate-800 border-slate-700 border rounded-lg text-sm text-white focus:ring-1 focus:ring-green-500 focus:border-green-500 py-3 outline-none transition-all" placeholder="0.00" step="0.01" type="number" min="0" max="999999" />
                </div>

                {/* Bags Count */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">No. of Bags</label>
                  <input required name="bagsCount" value={formData.bagsCount} onChange={handleChange} className="w-full bg-slate-800 border-slate-700 border rounded-lg text-sm text-white focus:ring-1 focus:ring-green-500 focus:border-green-500 py-3 outline-none transition-all" placeholder="1" step="1" type="number" min="1" max="1000" />
                </div>

                {/* Date */}
                <div className="space-y-1.5 md:col-span-3">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Entry Date</label>
                  <input required name="entryDate" value={formData.entryDate} onChange={handleChange} className="w-full bg-slate-800 border-slate-700 border rounded-lg text-sm text-white focus:ring-1 focus:ring-green-500 focus:border-green-500 py-3 outline-none transition-all" type="date" />
                </div>

                <div className="md:col-span-3 pt-6 flex justify-end gap-4 border-t border-blue-900/30 mt-4">
                  <button type="button" onClick={handleClear} className="px-8 py-3 rounded-lg text-slate-400 font-semibold text-sm hover:text-white transition-colors">Clear Fields</button>
                  <button
                    type="submit"
                    disabled={submitting || !formData.itemId || !formData.sizeId || !formData.qualityId || !formData.colorId || !formData.weightId || !formData.lengthMeter || !formData.bagsCount}
                    className="bg-green-500 text-slate-900 px-12 py-3 rounded-lg font-black text-sm tracking-widest shadow-lg shadow-green-500/10 hover:shadow-green-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Fill all required fields"
                  >
                    {submitting ? 'PROCESSING...' : 'SUBMIT ENTRY'}
                  </button>
                </div>
              </form>
            </div>
          </section>

          {/* Stats & Quick Actions Column */}
          <section className="col-span-12 lg:col-span-4 space-y-6">
            {/* Summary Card */}
            <div className="bg-blue-900/10 border border-blue-900/20 rounded-xl p-6 shadow-lg">
              <h5 className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-4">Daily Throughput</h5>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-4xl font-extrabold text-white">{(dailyStats?.totalweightId || 0).toLocaleString('en-IN', { maximumFractionDigits: 1 })}</p>
                  <p className="text-[10px] text-green-500 font-bold">KG PRODUCED TODAY</p>
                </div>
                <div className="bg-green-500/10 text-green-500 px-2 py-1 rounded text-[10px] font-bold">{dailyStats?.totalEntries || 0} entries</div>
              </div>
            </div>

            {/* Industrial Note Card */}
            <div className="bg-slate-900 border border-blue-900/20 rounded-xl p-6 relative shadow-lg">
              <span className="material-symbols-outlined absolute top-4 right-4 text-blue-500/40">info</span>
              <h5 className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-2">Production Metrics</h5>
              <p className="text-sm text-slate-300 mb-4 leading-relaxed">Today's production: <strong>{(dailyStats?.totalMeterM || 0).toLocaleString('en-IN', { maximumFractionDigits: 1 })}m</strong> of material across <strong>{dailyStats?.totalEntries || 0}</strong> entries.</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-bold text-white">LIVE DATA</span>
              </div>
            </div>
          </section>

          {/* Recent Inventory Updates Table - Static Placeholder for Demo */}
          <section className="col-span-12">
            <div className="bg-slate-900 border border-blue-900/20 rounded-xl overflow-hidden shadow-xl">
              <div className="px-8 py-6 flex justify-between items-center bg-blue-900/5 border-b border-blue-900/20">
                <h4 className="text-lg font-bold text-white">Recent Inventory Updates (Last 10)</h4>
                <div className="flex gap-2">
                  <button
                    onClick={() => fetchRecentEntries()}
                    className="text-[10px] font-bold text-blue-400 uppercase tracking-widest hover:text-blue-300 transition-colors"
                    title="Refresh the table"
                  >
                    ↻ Refresh
                  </button>
                  <span className="text-slate-500">|</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total: {recentEntries?.length || 0} entries</span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-800/80 border-b border-blue-900/20">
                    <tr>
                      <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Date</th>
                      <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Item</th>
                      <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Batch</th>
                      <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Total Weight (Kg)</th>
                      <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-900/10">
                    {recentEntries && recentEntries.length > 0 ? (
                      recentEntries.map((entry, idx) => (
                        <tr key={entry.id} className="hover:bg-blue-900/5 transition-colors">
                          <td className="px-8 py-4 text-sm text-slate-400">{entry.entryDate ? new Date(entry.entryDate).toLocaleDateString('en-IN') : 'N/A'}</td>
                          <td className="px-8 py-4 text-sm font-semibold text-white">{entry.item?.name || 'N/A'}</td>
                          <td className="px-8 py-4 text-sm font-mono text-slate-500">{entry.batchNumber || '-'}</td>
                          <td className="px-8 py-4 text-sm text-white font-bold text-right">{(entry.weightId || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                          <td className="px-8 py-4 text-center"><span className="bg-green-500/10 text-green-500 border border-green-500/20 text-[10px] font-bold px-3 py-1 rounded-sm uppercase">✓ Recorded</span></td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-8 py-8 text-center text-slate-500 text-sm">
                          {loading ? 'Loading entries...' : 'No production entries yet - Add one to get started!'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default ProductionEntry;
