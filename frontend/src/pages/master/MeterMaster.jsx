import React, { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Loader from '../../components/ui/Loader';
import Select from '../../components/ui/Select';
import { apiClient } from '../../utils/apiClient';

const MeterMaster = () => {
  const [meters, setMeters] = useState([]);
  const [newMeter, setNewMeter] = useState('');
  const [newMeterType, setNewMeterType] = useState('ROLL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMeters = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get('/master/meters');
      setMeters(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMeters(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newMeter || isNaN(newMeter)) return alert('Length must be a valid numerical value');
    try {
      await apiClient.post('/master/meters', { value: newMeter, type: newMeterType });
      setNewMeter('');
      setNewMeterType('ROLL');
      fetchMeters();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this length measurement?")) return;
    try {
      await apiClient.delete(`/master/meters/${id}`);
      fetchMeters();
    } catch(err) {
      alert("Error deleting record");
    }
  };

  return (
    <div className="animate-in fade-in grid grid-cols-12 gap-8 custom-scrollbar">
      <div className="col-span-12 lg:col-span-8 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white">Meter/Length Standardization Master</h2>
          <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Pre-defined length units</p>
        </div>
        
        {loading ? <Loader text="Loading Length Arrays..." /> : error ? (
            <div className="bg-error/10 border border-error/50 p-4 rounded text-error text-xs uppercase font-bold tracking-wider">{error}</div>
        ) : (
        <div className="bg-primary/5 rounded border border-outline/30 overflow-hidden shadow-2xl">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-primary/20 border-b border-primary/30">
                <th className="px-6 py-4 text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em]">Length (m)</th>
                <th className="px-6 py-4 text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em]">Roll Type</th>
                <th className="px-6 py-4 text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em] text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/20">
              {meters.length === 0 && (
                <tr><td colSpan="3" className="px-6 py-8 flex justify-center text-slate-500 text-xs tracking-wider uppercase">NO LENGTH CONFIGS FOUND</td></tr>
              )}
              {meters.map((m) => (
                <tr key={m.id} className="hover:bg-primary/10 transition-colors group">
                  <td className="px-6 py-4 text-sm font-bold text-slate-200">{m.value} <span className="text-[10px] font-normal text-slate-500 ml-1">meters</span></td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">{m.type}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleDelete(m.id)} className="p-2 bg-error/10 text-error rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-error/20"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </div>
      <div className="col-span-12 lg:col-span-4">
        <div className="bg-surface-container border border-primary/50 rounded-lg p-6 sticky top-8">
          <h3 className="text-lg font-bold text-white mb-6">Register Length Class</h3>
          <form onSubmit={handleAdd} className="space-y-4">
            <Input label="Length Designation [Float]" placeholder="e.g. 150" value={newMeter} onChange={e => setNewMeter(e.target.value)} />
            <Select
              label="Meter Type"
              value={newMeterType}
              onChange={e => setNewMeterType(e.target.value)}
              options={['ROLL', 'CUT']}
            />
            <Button variant="primary" className="w-full mt-4" disabled={loading}>Add Length</Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MeterMaster;
