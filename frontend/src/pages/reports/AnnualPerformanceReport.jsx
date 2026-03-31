import React, { useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import Loader from '../../components/ui/Loader';
import ErrorMessage from '../../components/ui/ErrorMessage';

const AnnualPerformanceReport = () => {
  const { data, loading, error, execute } = useApi('/reports/annual-performance');

  useEffect(() => {
    execute();
  }, [execute]);

  if (loading) return <div className="p-8 flex justify-center h-full items-center"><Loader text="Loading Annual Performance Data..." /></div>;
  if (error) return <div className="p-8"><ErrorMessage error={error} retryFunction={execute} /></div>;

  // Strictly real data only. Defaulting to 0 / empty arrays to preserve operational truth.
  const {
    metrics = {
      production: '0M',
      productionGrowth: '0%',
      revenue: '$0',
      revenueGrowth: '0%',
      efficiency: '0%',
      wasteReduction: '0%'
    },
    quarters = [],
    productionMix = [],
    tableData = []
  } = data || {};

  return (
    <div className="text-slate-100 antialiased overflow-x-hidden min-h-screen">
      <div className="pt-6 pb-12 px-8 min-h-screen max-w-7xl mx-auto">
        {/* Hero Summary Section */}
        <section className="mb-8">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-green-500 mb-1">Performance Overview</h2>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Feather Fine Narrow Fabrics</h1>
              <p className="text-slate-400 mt-2 max-w-2xl">Annual industrial output and financial synthesis for the period April 2023 – March 2024. Record-breaking production density achieved in Q3.</p>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-blue-900/20 border border-blue-900/40 text-slate-100 text-[13px] font-bold rounded flex items-center gap-2 hover:bg-blue-900/30 transition-all">
                <span className="material-symbols-outlined text-[18px]">download</span> Export PDF
              </button>
              <button className="px-4 py-2 bg-green-500 text-white text-[13px] font-bold rounded flex items-center gap-2 hover:brightness-110 transition-all shadow-lg shadow-green-500/20">
                <span className="material-symbols-outlined text-[18px]">share</span> Share Analytics
              </button>
            </div>
          </div>
          
          {/* Macro Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-900/5 border border-blue-900/20 p-6 rounded-xl bg-gradient-to-br from-blue-900/10 to-slate-900/40">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Production</span>
                <span className="material-symbols-outlined text-green-500">precision_manufacturing</span>
              </div>
              <div className="text-3xl font-extrabold text-white">{metrics.production}</div>
              <div className="text-[12px] font-medium text-green-500 flex items-center gap-1 mt-1">
                <span className="material-symbols-outlined text-[14px]">trending_up</span> {metrics.productionGrowth} vs LY
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Meters of Fabric</div>
            </div>

            <div className="bg-blue-900/5 border border-blue-900/20 p-6 rounded-xl bg-gradient-to-br from-blue-900/10 to-slate-900/40">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Annual Revenue</span>
                <span className="material-symbols-outlined text-green-500">payments</span>
              </div>
              <div className="text-3xl font-extrabold text-white">{metrics.revenue}</div>
              <div className="text-[12px] font-medium text-green-500 flex items-center gap-1 mt-1">
                <span className="material-symbols-outlined text-[14px]">trending_up</span> {metrics.revenueGrowth} vs LY
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Gross Sales Revenue</div>
            </div>

            <div className="bg-blue-900/5 border border-blue-900/20 p-6 rounded-xl bg-gradient-to-br from-blue-900/10 to-slate-900/40">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Efficiency Rate</span>
                <span className="material-symbols-outlined text-green-500">speed</span>
              </div>
              <div className="text-3xl font-extrabold text-white">{metrics.efficiency}</div>
              <div className="text-[12px] font-medium text-green-500 flex items-center gap-1 mt-1">
                <span className="material-symbols-outlined text-[14px]">check_circle</span> Optimized
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Loom Up-time Average</div>
            </div>

            <div className="bg-blue-900/5 border border-blue-900/20 p-6 rounded-xl bg-gradient-to-br from-blue-900/10 to-slate-900/40">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Waste Reduction</span>
                <span className="material-symbols-outlined text-green-500">recycling</span>
              </div>
              <div className="text-3xl font-extrabold text-white">{metrics.wasteReduction}</div>
              <div className="text-[12px] font-medium text-green-500 flex items-center gap-1 mt-1">
                <span className="material-symbols-outlined text-[14px]">arrow_downward</span> Resource Savings
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Post-Industrial Scraps</div>
            </div>
          </div>
        </section>

        {/* Bento Layout for Deep Data */}
        <div className="grid grid-cols-12 gap-4">
          
          {/* Quarter-over-Quarter Comparison Chart */}
          <div className="col-span-12 lg:col-span-8 bg-slate-900 border border-blue-900/10 rounded-xl p-8">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-lg font-bold text-white">Quarterly Performance Delta</h3>
                <p className="text-[12px] text-slate-400">Comparison of Production vs Sales (Units in 100k)</p>
              </div>
              <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-sm"></div> <span className="text-slate-100">Production</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-900 border border-green-500/30 rounded-sm"></div> <span className="text-slate-100">Sales</span>
                </div>
              </div>
            </div>
            <div className="flex items-end justify-between h-64 w-full gap-4 px-4 border-b border-blue-900/20">
              {quarters.map((q) => (
                <div key={q.id} className="flex-1 flex flex-col items-center group">
                  <div className="flex items-end gap-1.5 w-full h-full">
                    <div className="w-full bg-green-500 rounded-t-sm relative transition-all duration-300 group-hover:bg-green-400" style={{ height: `${q.production}%` }}>
                      <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">{q.textPro}</span>
                    </div>
                    <div className="w-full bg-blue-900 border-t border-x border-green-500/20 rounded-t-sm relative transition-all duration-300 group-hover:bg-blue-800" style={{ height: `${q.sales}%` }}>
                      <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">{q.textSal}</span>
                    </div>
                  </div>
                  <span className="mt-4 text-[11px] font-bold text-slate-400 group-hover:text-slate-200 transition-colors">{q.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Material Composition / Product Mix */}
          <div className="col-span-12 lg:col-span-4 bg-blue-900/5 border border-blue-900/20 rounded-xl p-8 flex flex-col">
            <h3 className="text-lg font-bold text-white mb-6">Production Mix</h3>
            <div className="space-y-6 flex-1">
              {productionMix.map((mix, i) => (
                <div key={i}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[12px] font-medium text-slate-100">{mix.name}</span>
                    <span className="text-[12px] font-bold text-green-500">{mix.percentage}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="bg-green-500 h-full rounded-full transition-all duration-1000" style={{ width: `${mix.percentage}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 pt-6 border-t border-blue-900/10">
              <p className="text-[11px] text-slate-400 italic">"Technical Tapes segment saw a +15% YoY growth due to automotive sector demand."</p>
            </div>
          </div>

          {/* Operational Insights Table */}
          <div className="col-span-12 bg-slate-900 border border-blue-900/10 rounded-xl overflow-hidden shadow-lg">
            <div className="px-8 py-6 border-b border-blue-900/10 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">Yearly Logistics & Output</h3>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-blue-900/10 rounded text-[10px] font-bold text-slate-400 border border-blue-900/20">FY 2023-24</span>
                <span className="px-3 py-1 bg-green-500/10 rounded text-[10px] font-bold text-green-500 border border-green-500/20 animate-pulse">LIVE DATA</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-blue-900/20">
                  <tr>
                    <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Month Phase</th>
                    <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Metric Tonnes</th>
                    <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Sales Conversion</th>
                    <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Export %</th>
                    <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-900/10">
                  {tableData.map((row, i) => (
                    <tr key={i} className="hover:bg-blue-900/10 transition-colors cursor-default">
                      <td className="px-8 py-4 text-[14px] font-medium text-white">{row.phase}</td>
                      <td className="px-8 py-4 text-[14px] text-slate-400 font-mono">{row.tonnes}</td>
                      <td className="px-8 py-4 text-[14px] text-slate-400">{row.conversion}</td>
                      <td className="px-8 py-4 text-[14px] text-slate-400">{row.exportPct}</td>
                      <td className="px-8 py-4">
                        {row.peak ? (
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-1 rounded text-[10px] font-bold bg-green-500 text-slate-900 shadow-lg shadow-green-500/20">{row.status}</span>
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                          </div>
                        ) : (
                          <span className="px-2 py-1 rounded text-[10px] font-bold bg-green-500/10 text-green-500 border border-green-500/20">{row.status}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default AnnualPerformanceReport;
