import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import Loader from '../../components/ui/Loader';
import ErrorMessage from '../../components/ui/ErrorMessage';

const MonthlyWastageReport = () => {
  const { data, loading, error, execute } = useApi('/reports/wastage');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    execute();
  }, [execute]);

  if (loading) return <div className="p-8 flex justify-center h-full items-center"><Loader text="Loading Monthly Report Data..." /></div>;
  if (error) return <div className="p-8"><ErrorMessage error={error} retryFunction={execute} /></div>;

  // Strictly real data only. Defaulting to 0 / empty arrays to preserve operational truth.
  const {
    summary = {
      period: 'N/A',
      production: '0',
      productionGrowth: '0%',
      sales: '0',
      salesGrowth: '0%',
      efficiency: '0%',
      efficiencyDiff: '0%'
    },
    inventoryLedger = []
  } = data || {};

  return (
    <div className="text-slate-100 antialiased bg-slate-900 min-h-screen relative">
      <div className="pt-6 pb-12 px-8 min-h-screen max-w-7xl mx-auto flex flex-col">
        {/* Page Header Section */}
        <div className="mb-8 flex justify-between items-end border-b border-blue-900/30 pb-6">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Feather Fine Narrow Fabrics</h2>
            <p className="text-slate-400 text-sm mt-1 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">calendar_today</span>
              Reporting Period: {summary.period}
            </p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-red-500/10 border border-red-500/30 text-red-500 px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-red-500/20 transition-all rounded-sm flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">delete_sweep</span>
              Wastage Entry
            </button>
            <button className="bg-blue-900/20 border border-blue-900/30 text-white px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-blue-900/40 transition-all rounded-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">download</span>
              Export PDF
            </button>
            <button 
              onClick={execute}
              className="bg-green-500 text-slate-900 px-4 py-2 text-xs font-bold uppercase tracking-widest hover:brightness-110 transition-all rounded-sm shadow-lg shadow-green-500/20 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">refresh</span>
              Refresh Data
            </button>
          </div>
        </div>

        {/* Macro Metrics Bento Grid */}
        <div className="grid grid-cols-12 gap-6 mb-8">
          {/* Total Production Metric */}
          <div className="col-span-12 md:col-span-4 bg-blue-900/10 p-6 border-l-2 border-green-500/50 rounded-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="material-symbols-outlined text-6xl text-white">precision_manufacturing</span>
            </div>
            <div className="flex justify-between items-start mb-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Total Production (Kg)</p>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-white">{summary.production}</span>
              <span className="text-sm font-bold text-green-500 flex items-center">
                <span className="material-symbols-outlined text-sm">arrow_upward</span>
                {summary.productionGrowth}
              </span>
            </div>
          </div>

          {/* Total Sales Metric */}
          <div className="col-span-12 md:col-span-4 bg-blue-900/10 p-6 border-l-2 border-blue-500/50 rounded-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="material-symbols-outlined text-6xl text-white">sell</span>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Total Sales (Mtr)</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-white">{summary.sales}</span>
              <span className="text-sm font-bold text-blue-500 flex items-center">
                <span className="material-symbols-outlined text-sm">arrow_upward</span>
                {summary.salesGrowth}
              </span>
            </div>
          </div>

          {/* Avg Efficiency Metric */}
          <div className="col-span-12 md:col-span-4 bg-blue-900/10 p-6 border-l-2 border-red-500/50 rounded-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="material-symbols-outlined text-6xl text-white">history_toggle_off</span>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Machine Efficiency (%)</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-white">{summary.efficiency}</span>
              <span className="text-sm font-bold text-red-500 flex items-center">
                <span className="material-symbols-outlined text-sm">arrow_downward</span>
                {summary.efficiencyDiff}
              </span>
            </div>
          </div>
        </div>

        {/* Detailed Data Table */}
        <div className="bg-slate-900 rounded-sm border border-blue-900/10 overflow-hidden shadow-2xl mt-8">
          <div className="px-6 py-4 border-b border-blue-900/10 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Inventory Ledger Summary</h3>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Showing: All Items</span>
              <span className="material-symbols-outlined text-sm cursor-pointer hover:text-green-500 text-slate-400">filter_list</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-blue-900/10">
                  <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Item Code</th>
                  <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                  <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Opening Stock</th>
                  <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Production</th>
                  <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Sales/Issues</th>
                  <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Balance</th>
                  <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-900/10">
                {inventoryLedger.map((inv, i) => (
                  <tr key={i} className="hover:bg-blue-900/5 transition-colors cursor-pointer">
                    <td className="px-6 py-4 text-[13px] font-bold text-white">{inv.id}</td>
                    <td className="px-6 py-4 text-[13px] text-slate-400">{inv.desc}</td>
                    <td className="px-6 py-4 text-[13px] text-slate-400">{inv.opening}</td>
                    <td className="px-6 py-4 text-[13px] text-green-500 font-semibold">{inv.prodInfo}</td>
                    <td className="px-6 py-4 text-[13px] text-blue-500">{inv.salesInfo}</td>
                    <td className={`px-6 py-4 text-[13px] font-bold ${inv.isLow ? 'text-red-500' : 'text-white'}`}>{inv.bal}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-sm border ${inv.isLow ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-green-500/10 text-green-500 border-green-500/20'}`}>
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Wastage Entry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-blue-900/30 w-full max-w-md rounded-sm shadow-2xl">
            <div className="px-6 py-4 border-b border-blue-900/10 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white tracking-tight">Production Wastage Entry</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Wastage Amount (Kg)</label>
                <input className="w-full bg-slate-800 border border-slate-700 px-4 py-2.5 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none rounded-sm transition-all" placeholder="0.00" type="number" />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Wastage Reason / Notes</label>
                <textarea className="w-full bg-slate-800 border border-slate-700 px-4 py-2.5 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none rounded-sm transition-all h-24 resize-none" placeholder="Enter reason for wastage..."></textarea>
              </div>
            </div>
            <div className="px-6 py-4 bg-blue-900/5 flex justify-end gap-3 border-t border-blue-900/10">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors">
                Cancel
              </button>
              <button onClick={() => { setIsModalOpen(false); execute(); }} className="bg-green-500 text-slate-900 px-6 py-2 text-xs font-bold uppercase tracking-widest hover:brightness-110 transition-all rounded-sm shadow-lg shadow-green-500/20">
                Submit Entry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthlyWastageReport;
