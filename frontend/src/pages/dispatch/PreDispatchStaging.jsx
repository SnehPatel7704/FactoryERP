import React, { useState, useEffect } from 'react';
import { Truck, CheckSquare, Search } from 'lucide-react';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import { apiClient } from '../../utils/apiClient';

const PreDispatchStaging = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    apiClient.get('/inventory/production')
      .then(data => {
        setInventory(data.filter(i => i.type === 'entry'));
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleBatch = () => {
    alert("Staged Logistics mapped successfully. Proceed to Dispatch Challan Generation.");
  };

  return (
    <div className="animate-in fade-in space-y-6 custom-scrollbar">
      <div className="flex items-center justify-between border-b border-primary/20 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CheckSquare className="text-secondary" /> Pre-Dispatch Staging Queue
          </h2>
          <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Pending items cleared for shipment logistics</p>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 bg-surface-container border-outline/20 border px-4 py-2 rounded flex items-center gap-3 focus-within:border-secondary transition-colors">
          <Search size={18} className="text-slate-500" />
          <input className="bg-transparent border-none text-white focus:ring-0 flex-1 text-sm outline-none w-full" placeholder="Search physical asset footprint..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Button variant="secondary" className="flex gap-2 items-center" onClick={handleBatch} disabled={loading}><Truck size={16} /> Batch to Challan</Button>
      </div>

      {loading ? <Loader text="Synchronizing Remote Freight Pool..." /> : error ? (
         <div className="bg-error/10 border border-error/50 p-4 rounded text-error text-xs uppercase font-bold tracking-wider">{error}</div>
      ) : (
      <div className="bg-surface-container border border-primary/10 rounded-xl shadow overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-primary-container text-on-surface-variant border-b border-primary/20">
              <th className="px-6 py-4 text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em] w-12 text-center">
                <input type="checkbox" className="rounded border-outline bg-[#13181f] text-secondary" />
              </th>
              <th className="px-6 py-4 text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em]">Asset Sequence ID</th>
              <th className="px-6 py-4 text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em]">Component Entity</th>
              <th className="px-6 py-4 text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em] text-right">Physical Mass</th>
              <th className="px-6 py-4 text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em] text-center">Staging Flag</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-primary/10">
            {inventory.length === 0 && (
               <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500 uppercase tracking-widest text-xs font-bold">Logistics Pool Empty</td></tr>
            )}
            {inventory.map(item => (
              <tr key={item.id} className="hover:bg-primary/5 transition-colors group">
                <td className="px-6 py-4 text-center">
                   <input type="checkbox" className="rounded border-outline bg-[#13181f] text-secondary transition-all" />
                </td>
                <td className="px-6 py-4 font-mono text-sm text-secondary">{item.id.slice(0, 16)}...</td>
                <td className="px-6 py-4 text-sm font-medium text-slate-200">{item.item?.name || 'Unknown Reference'} <span className="text-slate-500 ml-2">({item.quality?.grade})</span></td>
                <td className="px-6 py-4 font-mono text-xs text-right text-slate-300">{item.weightKg.toFixed(2)} kg</td>
                <td className="px-6 py-4 text-center">
                  <span className="text-[10px] font-bold text-secondary bg-secondary/10 px-2 py-1 rounded">CLEARED</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
    </div>
  );
};

export default PreDispatchStaging;
