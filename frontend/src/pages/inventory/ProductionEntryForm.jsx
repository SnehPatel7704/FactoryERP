import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import Loader from '../../components/ui/Loader';
import ErrorMessage from '../../components/ui/ErrorMessage';
import { X, Save } from 'lucide-react';

const ProductionEntryForm = ({ entry, onClose, onSuccess }) => {
  // API hooks
  const { data: masterData, loading, error, execute: fetchMaster } = useApi('/master/all', {}, { items: [], colors: [], sizes: [], qualities: [] });
  const { loading: submitting, error: submitError, execute: executeSubmit } = useApi('', {}, null);
  const { data: dailyStats, execute: fetchDailyStats } = useApi('/reports/daily', {}, { totalWeightKg: 0, totalMeterM: 0, totalEntries: 0 });
  const { data: recentEntries, execute: fetchRecentEntries } = useApi('/inventory/production/recent', {}, []);

  const isEditing = !!entry;
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : {};
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  // Form state
  const [formData, setFormData] = useState({
    sizeId: '',
    qualityId: '',
    itemId: '',
    colorId: '',
    secondaryColorId: '',
    accentColorId: '',
    batchNumber: '',
    weightKg: '',
    lengthMeter: '',
    entryDate: new Date().toISOString().split('T')[0]
  });

  const [selectedTemplate, setSelectedTemplate] = useState('');

  // Initialize form with existing data if editing
  useEffect(() => {
    fetchMaster();
    if (!isEditing) {
      fetchRecentEntries();
    }
  }, [fetchMaster, isEditing, fetchRecentEntries]);

  // Populate form when editing
  useEffect(() => {
    if (isEditing && entry) {
      setFormData({
        sizeId: entry.sizeId || '',
        qualityId: entry.qualityId || '',
        itemId: entry.itemId || '',
        colorId: entry.colorId || '',
        secondaryColorId: entry.secondaryColorId || '',
        accentColorId: entry.accentColorId || '',
        batchNumber: entry.batchNumber || '',
        weightKg: entry.weightKg || '',
        lengthMeter: entry.lengthMeter || '',
        entryDate: entry.entryDate ? entry.entryDate.split('T')[0] : new Date().toISOString().split('T')[0]
      });
    }
  }, [isEditing, entry]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Validate numeric fields
    if (name === 'weightKg' || name === 'lengthMeter') {
      const numValue = parseFloat(value);
      if (value === '') {
        setFormData({ ...formData, [name]: '' });
      } else if (isNaN(numValue)) {
        return;
      } else if (numValue < 0) {
        return;
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
        weightKg: '',
        lengthMeter: '',
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
      weightKg: '',
      lengthMeter: '',
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
    const weightKg = parseFloat(formData.weightKg);
    const lengthMeter = parseFloat(formData.lengthMeter);

    if (weightKg <= 0 || isNaN(weightKg)) {
      alert('Weight must be a positive number');
      return;
    }

    if (lengthMeter <= 0 || isNaN(lengthMeter)) {
      alert('Meter must be a positive number');
      return;
    }

    if (weightKg > 999999 || lengthMeter > 999999) {
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
      weightKg: weightKg,
      lengthMeter: lengthMeter,
      entryDate: formData.entryDate,
      shiftCode: null,
      machineCenter: null,
      operatorId: null
    };

    const endpoint = isEditing ? `/inventory/production/${entry.id}` : '/inventory/production/entry';
    const method = isEditing ? 'PUT' : 'POST';

    const { error: reqError } = await executeSubmit(endpoint, {
      method,
      body: JSON.stringify(payload)
    });

    if (!reqError) {
      alert(`Production Entry ${isEditing ? 'Updated' : 'Submitted'} Successfully`);
      handleClear();
      setSelectedTemplate('');
      onSuccess?.();
      onClose?.();
    } else {
      alert(`Submission Error: ${submitError || 'Unknown error occurred'}`);
    }
  };

  if (loading) return <div className="p-8 flex items-center justify-center min-h-screen text-slate-100"><Loader text="Loading Form..." /></div>;
  if (error && !isEditing) return <div className="p-8"><ErrorMessage error={error} retryFunction={fetchMaster} /></div>;

  return (
    <div className="pt-2 pb-12 w-full">
      <div className="max-w-4xl mx-auto w-full">
        {submitError && <ErrorMessage error={submitError} />}

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-green-500 mb-1">Production Hub</p>
            <h3 className="text-2xl font-extrabold text-white">
              {isEditing ? 'Edit Production Entry' : 'New Production Entry'}
            </h3>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              title="Close form"
            >
              <X size={24} className="text-slate-400 hover:text-white" />
            </button>
          )}
        </div>

        {/* Form Card */}
        <div className="bg-blue-900/10 border border-blue-900/20 rounded-xl p-8 backdrop-blur-sm shadow-lg">
          {/* Quick Load Template - Only Show for New Entries */}
          {!isEditing && recentEntries && recentEntries.length > 0 && (
            <div className="mb-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 block mb-2">⚡ Quick Load from Recent Order</label>
                  <select
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                    className="w-full bg-slate-800 border-slate-700 border rounded-lg text-sm text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 py-2 outline-none transition-all"
                  >
                    <option value="">Select a recent order...</option>
                    {recentEntries.map((entry) => {
                      const colorName = entry.color?.name || 'No color';
                      return (
                        <option key={entry.id} value={entry.id}>
                          {entry.item?.name || 'N/A'} - {entry.batchNumber || 'N/A'} ({colorName}) - {new Date(entry.entryDate).toLocaleDateString('en-IN')}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => handleLoadTemplate(selectedTemplate)}
                  disabled={!selectedTemplate}
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold text-sm hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  Load Template
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Size */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Size *</label>
              <select required name="sizeId" value={formData.sizeId} onChange={handleChange} className="w-full bg-slate-800 border-slate-700 border rounded-lg text-sm text-white focus:ring-1 focus:ring-green-500 focus:border-green-500 py-3 outline-none transition-all">
                <option value="">Select Size</option>
                {masterData.sizes.map(m => <option key={m.id} value={m.id}>{m.value}</option>)}
              </select>
            </div>

            {/* Quality */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Quality *</label>
              <select required name="qualityId" value={formData.qualityId} onChange={handleChange} className="w-full bg-slate-800 border-slate-700 border rounded-lg text-sm text-white focus:ring-1 focus:ring-green-500 focus:border-green-500 py-3 outline-none transition-all">
                <option value="">Select Quality</option>
                {masterData.qualities.map(m => <option key={m.id} value={m.id}>{m.grade}</option>)}
              </select>
            </div>

            {/* Item */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Item *</label>
              <select required name="itemId" value={formData.itemId} onChange={handleChange} className="w-full bg-slate-800 border-slate-700 border rounded-lg text-sm text-white focus:ring-1 focus:ring-green-500 focus:border-green-500 py-3 outline-none transition-all">
                <option value="">Select Item</option>
                {masterData.items.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>

            {/* Primary Color */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Primary Color *</label>
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

            {/* Batch Number */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Batch / Slot Number *</label>
              <input required name="batchNumber" value={formData.batchNumber} onChange={handleChange} className="w-full bg-slate-800 border-slate-700 border rounded-lg text-sm text-white focus:ring-1 focus:ring-green-500 focus:border-green-500 py-3 outline-none transition-all" placeholder="e.g., B-102 / S-4" type="text" />
            </div>

            {/* Production Weight */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Production (Kg) *</label>
              <input required name="weightKg" value={formData.weightKg} onChange={handleChange} className="w-full bg-slate-800 border-slate-700 border rounded-lg text-sm text-white focus:ring-1 focus:ring-green-500 focus:border-green-500 py-3 outline-none transition-all" placeholder="0.00" step="0.01" type="number" min="0" max="999999" />
            </div>

            {/* Production Meter */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Meter (m) *</label>
              <input required name="lengthMeter" value={formData.lengthMeter} onChange={handleChange} className="w-full bg-slate-800 border-slate-700 border rounded-lg text-sm text-white focus:ring-1 focus:ring-green-500 focus:border-green-500 py-3 outline-none transition-all" placeholder="0.00" step="0.01" type="number" min="0" max="999999" />
            </div>

            {/* Date */}
            <div className="space-y-1.5 md:col-span-3">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Entry Date *</label>
              <input required name="entryDate" value={formData.entryDate} onChange={handleChange} className="w-full bg-slate-800 border-slate-700 border rounded-lg text-sm text-white focus:ring-1 focus:ring-green-500 focus:border-green-500 py-3 outline-none transition-all" type="date" />
            </div>

            {/* Action Buttons */}
            <div className="md:col-span-3 pt-6 flex justify-end gap-4 border-t border-blue-900/30 mt-4">
              <button type="button" onClick={handleClear} className="px-8 py-3 rounded-lg text-slate-400 font-semibold text-sm hover:text-white transition-colors">
                Clear Fields
              </button>
              {onClose && (
                <button type="button" onClick={onClose} className="px-8 py-3 rounded-lg text-slate-400 font-semibold text-sm hover:text-white transition-colors">
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={submitting || !formData.itemId || !formData.sizeId || !formData.qualityId || !formData.colorId || !formData.weightKg || !formData.lengthMeter}
                className="bg-green-500 text-slate-900 px-12 py-3 rounded-lg font-black text-sm tracking-widest shadow-lg shadow-green-500/10 hover:shadow-green-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                title="Fill all required fields"
              >
                <Save size={18} />
                {submitting ? 'PROCESSING...' : isEditing ? 'UPDATE ENTRY' : 'SUBMIT ENTRY'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductionEntryForm;
