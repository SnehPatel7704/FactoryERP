import React, { useState } from 'react';
import { ArrowLeftSquare, Receipt } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Loader from '../../components/ui/Loader';

const DispatchReturn = () => {
  const [loading, setLoading] = useState(false);
  
  const handleIssue = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert("Credit Memo Issued on Server");
    }, 1500);
  };

  return (
    <div className="animate-in fade-in space-y-6 custom-scrollbar">
      <div className="flex items-center justify-between border-b border-primary/20 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ArrowLeftSquare className="text-amber-500" /> Dispatch Customer Returns
          </h2>
          <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Inbound freight from rejected deliveries</p>
        </div>
        <Button variant="primary" className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700" onClick={handleIssue} disabled={loading}><Receipt size={16} /> Issue Credit Memo</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-surface-container border border-amber-500/20 rounded-xl shadow p-6 relative">
          <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] mb-4">Link Inbound Freight</h3>
          {loading ? (
             <div className="mt-8"><Loader text="Reverting Transit Ledger..." /></div>
          ) : (
          <div className="space-y-4">
            <Input label="Original Challan Ref" placeholder="e.g. CHLN-992-X" />
            <Input label="Original Order ID" placeholder="e.g. ORD-2023-XX" />
            <div className="flex flex-col gap-1.5 pt-2">
              <label className="text-[10px] font-semibold text-slate-400 tracking-[0.05em] uppercase">Return Designation Status</label>
              <select className="w-full bg-[#13181f] border border-outline/30 rounded py-2 px-3 text-sm text-slate-200">
                <option value="salvage">Restock to Usable Inventory</option>
                <option value="defect">Route to Defective Storage</option>
              </select>
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DispatchReturn;
