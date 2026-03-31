import React, { useState, useEffect } from 'react';
import { FileOutput, Truck } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Loader from '../../components/ui/Loader';
import { apiClient } from '../../utils/apiClient';

const DispatchChallanGeneration = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    vehicleNo: '',
    transporter: '',
    driverContact: '',
    destination: '',
    challanNumber: `CHL-${Date.now()}`
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleDispatch = async () => {
    try {
      setLoading(true);
      await apiClient.post('/logistics/challan', { ...formData, lines: [] });
      alert("Manifest Deployed to Transporter Protocol");
      setFormData({ vehicleNo: '', transporter: '', driverContact: '', destination: '', challanNumber: `CHL-${Date.now()}` });
    } catch(err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in space-y-6 custom-scrollbar">
      <div className="flex items-center justify-between border-b border-primary/20 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileOutput className="text-secondary" /> Formal Dispatch Challan
          </h2>
          <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Vehicle and Logistics Documentation Generator</p>
        </div>
        <Button variant="primary" className="flex items-center gap-2" onClick={handleDispatch} disabled={loading}><Truck size={16} /> Deploy Manifest</Button>
      </div>

      {error ? <div className="bg-error/10 border border-error/50 p-4 rounded text-error text-xs uppercase font-bold tracking-wider">{error}</div> : null}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-surface-container border border-primary/10 rounded-xl shadow p-6">
          <h3 className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-4">Transport Protocol</h3>
          <div className="space-y-4">
            <Input label="System Challan Sequence" name="challanNumber" value={formData.challanNumber} readOnly />
            <Input label="Vehicle License Number" name="vehicleNo" placeholder="e.g. GJ-05-XX-1234" value={formData.vehicleNo} onChange={handleChange} />
            <Input label="Transport Company" name="transporter" placeholder="XYZ Freight" value={formData.transporter} onChange={handleChange} />
            <Input label="Driver Contact / Badge" name="driverContact" placeholder="+91 XXXX XXXX" value={formData.driverContact} onChange={handleChange} />
            <Input label="Consignee Location Code" name="destination" placeholder="City Destination Code" value={formData.destination} onChange={handleChange} />
          </div>
        </div>

        <div className="bg-surface-container border border-primary/10 rounded-xl shadow p-6">
          <h3 className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-4">Batched Items for Dispatch</h3>
          {loading ? (
             <div className="mt-8"><Loader text="Negotiating Transport Pipeline..." /></div>
          ) : (
          <div className="p-8 border border-dashed border-secondary/30 rounded-lg text-center bg-secondary/5 mt-4">
            <p className="text-sm font-bold text-secondary mb-2">No active batches drafted!</p>
            <p className="text-xs text-slate-400">Please queue batches via the Pre-Dispatch Staging table to assign them to a transport vehicle.</p>
          </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DispatchChallanGeneration;
