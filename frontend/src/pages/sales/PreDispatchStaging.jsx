import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import Loader from '../../components/ui/Loader';
import ErrorMessage from '../../components/ui/ErrorMessage';

const PreDispatchStaging = () => {
  const { data, loading, error, execute } = useApi('/sales/staging', {}, { stagedItems: [] });

  useEffect(() => {
    execute();
  }, [execute]);

  // Get staged items from response
  const [stagedItems, setStagedItems] = useState([]);

  useEffect(() => {
    if (data && data.stagedItems) {
      setStagedItems(data.stagedItems);
    } else if (Array.isArray(data)) {
      setStagedItems(data);
    }
  }, [data]);

  const removeItem = (id) => {
    setStagedItems(stagedItems.filter(item => item.id !== id));
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
            <button className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold transition-all border border-slate-700">
              <span className="material-symbols-outlined text-sm">print</span>
              Print Manifest
            </button>
            <button className="bg-green-500 text-slate-900 hover:brightness-110 px-6 py-2 rounded-lg flex items-center gap-2 text-sm font-bold transition-all shadow-[0_0_15px_rgba(0,200,83,0.3)]">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              Confirm Staging
            </button>
          </div>
        </div>

        {/* Metric Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-blue-900/10 rounded-xl p-5 border-l-4 border-blue-900 shadow-md">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Total Staged Items</div>
            <div className="text-2xl font-black text-white">1,428 <span className="text-sm font-medium text-slate-400">Units</span></div>
            <div className="mt-2 text-xs text-green-500 flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">trending_up</span>
              <span>12% from prev. batch</span>
            </div>
          </div>
          <div className="bg-blue-900/10 rounded-xl p-5 border-l-4 border-green-500 shadow-md">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Aggregate Weight</div>
            <div className="text-2xl font-black text-white">3,842.5 <span className="text-sm font-medium text-slate-400">Kg</span></div>
            <div className="mt-2 text-xs text-slate-400 flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">scale</span>
              <span>Capacity: 85%</span>
            </div>
          </div>
          <div className="bg-blue-900/10 rounded-xl p-5 border-l-4 border-blue-500 shadow-md">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Total Linear Meters</div>
            <div className="text-2xl font-black text-white">24,500 <span className="text-sm font-medium text-slate-400">m</span></div>
            <div className="mt-2 text-xs text-slate-400 flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">straighten</span>
              <span>Standard Gauge</span>
            </div>
          </div>
          <div className="bg-blue-900/10 rounded-xl p-5 border-l-4 border-red-500 shadow-md">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Pending QC Flags</div>
            <div className="text-2xl font-black text-red-500">02 <span className="text-sm font-medium text-slate-400 text-opacity-50">Items</span></div>
            <div className="mt-2 text-xs text-red-500 flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">warning</span>
              <span>Action Required</span>
            </div>
          </div>
        </div>

        {/* Table Staging Area */}
        <div className="bg-slate-900 rounded-xl overflow-hidden shadow-2xl border border-blue-900/20">
          <div className="px-6 py-4 flex items-center justify-between bg-slate-800 border-b border-blue-900/30">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Item Dispatch Queue</h3>
            <div className="flex gap-2">
              <span className="px-2 py-1 bg-green-500/10 text-green-500 text-[10px] font-bold rounded uppercase border border-green-500/20">Batch #DS-9021</span>
              <span className="px-2 py-1 bg-blue-900/30 text-blue-400 text-[10px] font-bold rounded uppercase border border-blue-900/30">Priority: High</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-800">
                <tr>
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
                  <tr><td colSpan="11" className="p-8 text-center text-slate-500 text-sm">No items in staging queue.</td></tr>
                )}
                {stagedItems.map(item => (
                  <tr key={item.id} className="hover:bg-blue-900/5 transition-colors group">
                    <td className="px-6 py-4 text-xs font-semibold text-white">{item.size}</td>
                    <td className="px-6 py-4 text-xs">
                      <span className="bg-green-500/10 text-green-500 px-2 py-0.5 rounded text-[10px] font-bold border border-green-500/20">{item.quality}</span>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-300">{item.itemId}</td>
                    <td className="px-6 py-4 text-xs font-mono">{item.weightKg}</td>
                    <td className="px-6 py-4 text-xs font-mono">{item.meter}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-900"></div>
                        <span className="text-[10px] uppercase font-bold text-slate-400">{item.primaryColor}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-slate-500"></div>
                        <span className="text-[10px] uppercase font-bold text-slate-400">{item.secondaryColor}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono">{item.bagWt}</td>
                    <td className="px-6 py-4 text-xs font-mono">{item.rolls}</td>
                    <td className="px-6 py-4 text-xs font-bold text-green-500">{item.totalMeter}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1 hover:text-blue-500 text-slate-500 transition-colors"><span className="material-symbols-outlined text-sm">edit</span></button>
                        <button onClick={() => removeItem(item.id)} className="p-1 hover:text-red-500 text-slate-500 transition-colors"><span className="material-symbols-outlined text-sm">delete</span></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-800 border-t border-blue-900/30">
                <tr>
                  <td className="px-6 py-4 text-[10px] font-bold uppercase text-slate-400" colSpan="3">Batch Totals</td>
                  <td className="px-6 py-4 text-xs font-bold text-white">728.15</td>
                  <td className="px-6 py-4"></td>
                  <td className="px-6 py-4" colSpan="2"></td>
                  <td className="px-6 py-4 text-xs font-bold text-white">138.50</td>
                  <td className="px-6 py-4 text-xs font-bold text-white">125</td>
                  <td className="px-6 py-4 text-xs font-black text-green-500">9,500 m</td>
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
              <span className="text-xl font-black text-white">{stagedItems.length} / 12</span>
            </div>
            <div className="bg-slate-900 px-4 py-3 rounded-xl border border-blue-900/20 flex flex-col min-w-[120px] shadow-sm">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Queue Status</span>
              <span className="text-xs font-bold text-green-500 flex items-center gap-1 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> READY
              </span>
            </div>
          </div>
          <div className="flex gap-4">
            <button className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-6 rounded-xl border border-blue-900/30 flex items-center gap-2 transition-all">
              <span className="material-symbols-outlined">qr_code_scanner</span> Scan SKU
            </button>
            <button className="bg-blue-900/80 hover:bg-blue-900 text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2 shadow-xl transition-all border border-blue-800">
              <span className="material-symbols-outlined">add</span> Add Manual Item
            </button>
          </div>
        </div>

        {/* System Logs / Audit Trail */}
        <div className="mt-12">
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
        </div>

      </div>
    </div>
  );
};

export default PreDispatchStaging;
