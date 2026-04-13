import React, { useState, useEffect } from 'react';
import { RefreshCcw, AlertTriangle, Search } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Loader from '../../components/ui/Loader';
import apiClient from '../../utils/apiClient';

const ProductionReturn = () => {
  const [masterData, setMasterData] = useState({ items: [], qualities: [], sizes: [], colors: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [batchSearching, setBatchSearching] = useState(false);
  const [batchNumber, setBatchNumber] = useState('');

  const [formData, setFormData] = useState({
    batchNumber: '',
    shiftCode: 'RETURN-BATCH',
    operatorId: '',
    machineCenter: 'QC-DEPT',
    itemId: '',
    qualityId: '',
    sizeId: '',
    colorId: '',
    weightId: '',
    lengthMeter: '0',
    bagsCount: '1'
  });

  useEffect(() => {
    apiClient.get('/master/all')
      .then(data => {
        // Handle both response formats
        const masterDataToUse = data.data || data;
        setMasterData({
          items: masterDataToUse.items || [],
          qualities: masterDataToUse.qualities || [],
          sizes: masterDataToUse.sizes || [],
          colors: masterDataToUse.colors || []
        });
        setLoading(false);
      })
      .catch(err => { setError(err.message); setLoading(false); });
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFetchBatchDetails = async () => {
    if (!batchNumber.trim()) {
      alert('Please enter a batch number');
      return;
    }

    setBatchSearching(true);
    try {
      const response = await apiClient.get('/inventory/production');
      const entries = response.data || response;

      // Find batch by number
      const batch = entries.find(e => e.batchNumber === batchNumber.trim());

      if (!batch) {
        alert('Batch not found');
        setBatchSearching(false);
        return;
      }

      // Populate form with batch details
      setFormData(prev => ({
        ...prev,
        batchNumber: batch.batchNumber,
        itemId: batch.itemId || '',
        qualityId: batch.qualityId || '',
        sizeId: batch.sizeId || '',
        colorId: batch.colorId || '',
        weightId: batch.weightId || '',
        lengthMeter: batch.lengthMeter || '0'
      }));

      alert(`Batch loaded: ${batch.batchNumber}`);
    } catch (err) {
      alert('Error fetching batch: ' + err.message);
    }
    setBatchSearching(false);
  };

  const handleReturnAction = async (e) => {
    e.preventDefault();
    if (!formData.itemId || !formData.qualityId || !formData.sizeId || !formData.colorId) {
      return alert("Foreign dependencies (Item, Quality, Size, Color) required for return sequence.");
    }

    if (!window.confirm("Initialize negative offset sequence on Database?")) return;

    try {
      await apiClient.post('/inventory/production/return', formData);
      alert("Defective return isolated into DB logging");
      setFormData({ ...formData, weightId: '', operatorId: '', batchNumber: '' });
      setBatchNumber('');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };
  return (
    <div className="animate-in fade-in space-y-6 custom-scrollbar">
      <div className="flex items-center justify-between border-b border-error/50 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <RefreshCcw className="text-error" /> Internal Production Returns
          </h2>
          <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Submit defective or surplus inventory back to processing</p>
        </div>
        <Button variant="outline" className="flex items-center gap-2 border-error text-error hover:bg-error/10" onClick={handleReturnAction}><AlertTriangle size={16} /> Mark as Defective Log</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-surface-container border border-error/20 rounded-xl shadow p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <AlertTriangle size={128} className="text-error" />
          </div>
          <h3 className="text-[10px] font-black text-error uppercase tracking-[0.2em] mb-4">Damaged Roll Submission</h3>
          <div className="space-y-4">
            <div className="bg-error/10 text-error/80 text-xs p-3 rounded mt-4 border border-error/20 inline-block w-full text-center font-bold">
              Submitting this form deducts from active usable inventory!
            </div>

            {/* Batch Search Section */}
            <div className="bg-error/5 border border-error/20 rounded-lg p-4 mb-4">
              <label className="text-[10px] font-semibold text-slate-400 tracking-[0.05em] uppercase block mb-2">Search by Batch Number</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter batch number..."
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleFetchBatchDetails()}
                  className="flex-1 bg-[#13181f] border border-error/30 rounded py-2 px-3 text-sm text-slate-200 focus:ring-1 focus:ring-error outline-none"
                />
                <button
                  onClick={handleFetchBatchDetails}
                  disabled={batchSearching}
                  className="bg-error/20 hover:bg-error/30 text-error px-4 py-2 rounded font-semibold text-sm flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  {batchSearching ? <Loader /> : <Search size={16} />}
                  {batchSearching ? 'Searching...' : 'Load'}
                </button>
              </div>
              <p className="text-[10px] text-slate-500 mt-2">Auto-fills Item, Quality, Size, and Color from batch</p>
            </div>

            <Input label="QC Operator ID" name="operatorId" placeholder="Badge Number" value={formData.operatorId} onChange={handleChange} />

            <div className="flex flex-col gap-1.5 border-t border-outline/20 pt-4 mt-2">
              <label className="text-[10px] font-semibold text-slate-400 tracking-[0.05em] uppercase">Target Base Item</label>
              <select name="itemId" value={formData.itemId} onChange={handleChange} className="w-full bg-[#13181f] border border-error/30 rounded py-2 px-3 text-sm text-slate-200 focus:ring-1 focus:ring-error">
                <option value="">Select Defective Entity...</option>
                {masterData.items?.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold text-slate-400 tracking-[0.05em] uppercase">Quality Grade</label>
                <select name="qualityId" value={formData.qualityId} onChange={handleChange} className="w-full bg-[#13181f] border border-error/30 rounded py-2 px-3 text-sm text-slate-200 focus:ring-1 focus:ring-error">
                  <option value="">Select...</option>
                  {masterData.qualities?.map(m => <option key={m.id} value={m.id}>{m.grade}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold text-slate-400 tracking-[0.05em] uppercase">Physical Dimension</label>
                <select name="sizeId" value={formData.sizeId} onChange={handleChange} className="w-full bg-[#13181f] border border-error/30 rounded py-2 px-3 text-sm text-slate-200 focus:ring-1 focus:ring-error">
                  <option value="">Select...</option>
                  {masterData.sizes?.map(m => <option key={m.id} value={m.id}>{m.value}</option>)}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold text-slate-400 tracking-[0.05em] uppercase">Color Specification</label>
              <select name="colorId" value={formData.colorId} onChange={handleChange} className="w-full bg-[#13181f] border border-error/30 rounded py-2 px-3 text-sm text-slate-200 focus:ring-1 focus:ring-error">
                <option value="">Map Color Context...</option>
                {masterData.colors?.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>

            <Input label="Damaged Weight (Kg)" name="weightId" type="number" step="0.01" value={formData.weightId} onChange={handleChange} />


          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductionReturn;
