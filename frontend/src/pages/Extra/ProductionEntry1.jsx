import React, { useState, useEffect } from 'react';
import { PackageOpen, Clock, Settings, Save } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Loader from '../../components/ui/Loader';
import { apiClient } from '../../utils/apiClient';

const ProductionEntry = () => {
  const [masterData, setMasterData] = useState({ items: [], qualities: [], sizes: [], colors: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    shiftCode: '',
    operatorId: '',
    machineCenter: '',
    itemId: '',
    qualityId: '',
    sizeId: '',
    colorId: '',
    weightId: '',
    lengthMeter: '',
    bagsCount: ''
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

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.itemId || !formData.qualityId || !formData.sizeId || !formData.colorId) {
      return alert("Foreign dependencies (Item, Quality, Size, Color) required.");
    }

    try {
      await apiClient.post('/inventory/production/entry', formData);
      alert("Factory Batch Sequence Loaded successfully!");
      setFormData({ ...formData, weightId: '', lengthMeter: '', bagsCount: '' });
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div className="animate-in fade-in space-y-6">
      <div className="flex items-center justify-between border-b border-primary/20 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Settings className="text-secondary" /> Production Log Entry
          </h2>
          <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Shift output submission form</p>
        </div>
        <Button variant="primary" className="flex items-center gap-2" onClick={handleSave}><Save size={16} /> Save Batch Log</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-surface-container border border-primary/10 rounded-xl shadow p-6">
          <h3 className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-4">Shift & Operator Data</h3>
          <div className="space-y-4">
            <Input label="Shift Code" name="shiftCode" placeholder="e.g. SFT-Morning-1A" value={formData.shiftCode} onChange={handleChange} />
            <Input label="Lead Operator ID" name="operatorId" placeholder="Badge Number" value={formData.operatorId} onChange={handleChange} />
            <Input label="Machine Center" name="machineCenter" placeholder="e.g. Loom #14" value={formData.machineCenter} onChange={handleChange} />

            <div className="flex flex-col gap-1.5 pt-4 border-t border-outline/20">
              <label className="text-[10px] font-semibold text-slate-400 tracking-[0.05em] uppercase">Target Base Item</label>
              <select name="itemId" value={formData.itemId} onChange={handleChange} className="w-full bg-[#13181f] border border-outline/30 rounded py-2 px-3 text-sm text-slate-200 focus:ring-1 focus:ring-secondary">
                <option value="">Select Physical Entity...</option>
                {masterData.items?.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-surface-container border border-primary/10 rounded-xl shadow p-6">
          <h3 className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-4">Yield Metrics</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold text-slate-400 tracking-[0.05em] uppercase">Quality Grade</label>
                <select name="qualityId" value={formData.qualityId} onChange={handleChange} className="w-full bg-[#13181f] border border-outline/30 rounded py-2 px-3 text-sm text-slate-200 focus:ring-1 focus:ring-secondary">
                  <option value="">Select...</option>
                  {masterData.qualities?.map(m => <option key={m.id} value={m.id}>{m.grade}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold text-slate-400 tracking-[0.05em] uppercase">Physical Dimension</label>
                <select name="sizeId" value={formData.sizeId} onChange={handleChange} className="w-full bg-[#13181f] border border-outline/30 rounded py-2 px-3 text-sm text-slate-200 focus:ring-1 focus:ring-secondary">
                  <option value="">Select...</option>
                  {masterData.sizes?.map(m => <option key={m.id} value={m.id}>{m.value}</option>)}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold text-slate-400 tracking-[0.05em] uppercase">Color Specification</label>
              <select name="colorId" value={formData.colorId} onChange={handleChange} className="w-full bg-[#13181f] border border-outline/30 rounded py-2 px-3 text-sm text-slate-200 focus:ring-1 focus:ring-secondary">
                <option value="">Map Color Context...</option>
                {masterData.colors?.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-outline/20">
              <Input label="Total Weight (Kg)" name="weightId" type="number" step="0.01" value={formData.weightId} onChange={handleChange} />
              <Input label="Total Length (Meters)" name="lengthMeter" type="number" step="0.1" value={formData.lengthMeter} onChange={handleChange} />
            </div>
            <Input label="Number of Bags/Rolls Mapped" name="bagsCount" type="number" value={formData.bagsCount} onChange={handleChange} />
          </div>
          <div className="bg-primary/5 border border-primary/20 rounded-lg mt-6 p-4 flex gap-3 items-center">
            <Clock className="text-secondary" size={24} />
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">Timestamp Generated</p>
              <p className="text-sm font-mono text-slate-200 mt-1">{new Date().toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductionEntry;
