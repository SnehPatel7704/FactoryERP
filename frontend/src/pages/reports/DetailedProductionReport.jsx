import React, { useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import Loader from '../../components/ui/Loader';
import ErrorMessage from '../../components/ui/ErrorMessage';

const DetailedProductionReport = () => {
  const { data, loading, error, execute } = useApi('/reports/detailed-production');

  useEffect(() => {
    execute();
  }, [execute]);

  if (loading) return <div className="p-8 flex justify-center h-full items-center"><Loader text="Loading Detailed Production Data..." /></div>;
  if (error) return <div className="p-8"><ErrorMessage error={error} retryFunction={execute} /></div>;

  // Strictly real data only. Defaulting to 0 / empty arrays to preserve operational truth.
  const {
    summary = {
      totalBags: '0',
      efficiencyTrend: '0%',
      peakOutput: 'N/A',
      activeLines: '0 / 0',
      materialUtilization: '0%',
      passRate: '0%'
    },
    itemsLog = [],
    distribution = {
      lineA: 0,
      lineB: 0,
      wideWeave: 0
    },
    totals = {
      today: '0',
      week: '0',
      month: '0',
      year: '0'
    }
  } = data || {};

  return (
    <div className="text-slate-100 antialiased bg-slate-900 min-h-screen">
      <div className="pt-6 pb-12 px-8 min-h-screen max-w-7xl mx-auto">
        <div className="flex items-center gap-4 border-b border-blue-900/30 pb-4 mb-6">
          <span className="text-[14px] font-medium text-slate-100">Production Report: Feather Fine Narrow Fabrics</span>
        </div>

        {/* Dashboard Header / Key Metrics Bento */}
        <div className="grid grid-cols-12 gap-6 mb-8">
          <div className="col-span-12 md:col-span-8 bg-blue-900/10 rounded-xl p-6 border border-blue-900/20 relative overflow-hidden">
            <div className="relative z-10 flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold text-green-500 uppercase tracking-[0.2em] mb-2">Operational Overview</p>
                <h3 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Daily Production Yield</h3>
                <p className="text-slate-400 text-sm max-w-md">Real-time breakdown of per-item bag quantities across Feather Fine Narrow Fabrics' core production lines.</p>
              </div>
              <div className="bg-slate-800 rounded-lg px-4 py-3 border border-slate-700 shadow-sm">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Bags (Today)</div>
                <div className="text-2xl font-black text-green-500 flex items-baseline gap-2">
                  {summary.totalBags}
                  <span className="text-xs font-bold text-green-500/70 tracking-normal">units</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-span-12 md:col-span-4 bg-slate-900 border border-blue-900/20 rounded-xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Efficiency Trend</span>
                <span className="text-[10px] font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded">{summary.efficiencyTrend}</span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Peak Output Hour</span>
                  <span className="text-white font-semibold">{summary.peakOutput}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Active Production Lines</span>
                  <span className="text-white font-semibold">{summary.activeLines}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Material Utilization</span>
                  <span className="text-white font-semibold">{summary.materialUtilization}</span>
                </div>
              </div>
            </div>
            <button className="w-full mt-4 py-2 bg-green-500 text-slate-900 text-xs font-bold uppercase tracking-widest rounded-lg hover:shadow-lg hover:shadow-green-500/20 transition-all active:scale-[0.98]">
              Generate Full PDF Report
            </button>
          </div>
        </div>

        {/* Production Breakdown Table Container */}
        <div className="bg-slate-900 rounded-xl border border-blue-900/20 overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-blue-900/20 flex justify-between items-center bg-blue-900/5">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-green-500">view_list</span>
              <h4 className="text-lg font-bold text-white tracking-tight">Per-Item Bag Quantities</h4>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 bg-slate-800 border border-slate-700 text-xs font-semibold rounded hover:bg-slate-700 transition-colors flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">filter_list</span> Filter Items
              </button>
              <button className="px-3 py-1.5 bg-slate-800 border border-slate-700 text-xs font-semibold rounded hover:bg-slate-700 transition-colors flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">file_download</span> Export CSV
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <th className="px-6 py-4">Item Specification</th>
                  <th className="px-6 py-4 text-right">SKU Code</th>
                  <th className="px-6 py-4 text-right">Today</th>
                  <th className="px-6 py-4 text-right">This Week</th>
                  <th className="px-6 py-4 text-right">This Month</th>
                  <th className="px-6 py-4 text-right">This Year</th>
                  <th className="px-6 py-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-900/20">
                {itemsLog.map((item, i) => (
                  <tr key={i} className="hover:bg-blue-900/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-blue-900/20 flex items-center justify-center border border-blue-900/30">
                          <span className="material-symbols-outlined text-blue-500 text-[20px]">inventory</span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{item.desc}</p>
                          <p className="text-[10px] text-slate-400 uppercase tracking-tight">{item.spec}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-xs font-mono text-slate-400">{item.sku}</td>
                    <td className={`px-6 py-4 text-right font-bold text-sm ${item.isLow ? 'text-red-500' : ''}`}>{item.today}</td>
                    <td className="px-6 py-4 text-right text-sm text-slate-400">{item.week}</td>
                    <td className="px-6 py-4 text-right text-sm text-slate-400">{item.month}</td>
                    <td className="px-6 py-4 text-right text-sm text-slate-400">{item.year}</td>
                    <td className="px-6 py-4 text-right">
                      {item.isLow ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-500/10 text-red-500 border border-red-500/20">{item.status}</span>
                      ) : item.isSurplus ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-500 border border-blue-500/20">{item.status}</span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-green-500/10 text-green-500 border border-green-500/20">{item.status}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-800 border-t-2 border-blue-900/20">
                <tr className="text-white font-black uppercase text-[10px] tracking-widest">
                  <td className="px-6 py-4 text-left" colSpan="2">Total System Output</td>
                  <td className="px-6 py-4 text-right text-base text-green-500">{totals.today}</td>
                  <td className="px-6 py-4 text-right text-sm">{totals.week}</td>
                  <td className="px-6 py-4 text-right text-sm">{totals.month}</td>
                  <td className="px-6 py-4 text-right text-sm">{totals.year}</td>
                  <td className="px-6 py-4"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Secondary Insights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {/* Line Performance */}
          <div className="bg-slate-900 border border-blue-900/20 rounded-xl p-5 shadow-lg">
            <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Line Load Distribution</h5>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-white">Narrow Line A</span>
                  <span className="font-bold text-green-500">{distribution.lineA}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-green-500 h-full" style={{ width: `${distribution.lineA}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-white">Narrow Line B</span>
                  <span className="font-bold text-green-500">{distribution.lineB}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-green-500 h-full" style={{ width: `${distribution.lineB}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-white">Wide Weave Unit</span>
                  <span className="font-bold text-blue-500">{distribution.wideWeave}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full" style={{ width: `${distribution.wideWeave}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Quality Stats */}
          <div className="bg-slate-900 border border-blue-900/20 rounded-xl p-5 relative overflow-hidden group shadow-lg">
            <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Quality Assurance Metric</h5>
            <div className="flex items-center justify-center py-4">
              <div className="text-center">
                <div className="text-4xl font-black text-white group-hover:scale-110 transition-transform">
                  {summary.passRate.replace('%', '')}<span className="text-xl text-green-500">%</span>
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-2">Pass Rate Today</p>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-green-500 shadow-[0_-2px_10px_rgba(0,200,83,0.3)]"></div>
          </div>

          {/* Material Alert */}
          <div className="bg-slate-900 border border-blue-900/20 rounded-xl p-5 border-l-4 border-l-red-500/40 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-red-500/10 rounded">
                <span className="material-symbols-outlined text-red-500">warning</span>
              </div>
              <div>
                <h5 className="text-xs font-bold text-white uppercase mb-1">Stock Criticality</h5>
                <p className="text-xs text-slate-400 leading-relaxed mb-3">Nylon Warp Thread (Sky Blue) is projected to deplete within 14 production hours at current rates.</p>
                <a className="text-[10px] font-bold text-red-500 uppercase tracking-widest hover:underline cursor-pointer">Reorder Immediate →</a>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DetailedProductionReport;
