import React, { useEffect, useState, useRef } from 'react';
import { useApi } from '../../hooks/useApi';
import { useNavigate } from 'react-router-dom';
import html2pdf from 'html2pdf.js';
import Loader from '../../components/ui/Loader';
import ErrorMessage from '../../components/ui/ErrorMessage';

const DailyProductionSalesReport = () => {
  const { data, loading, error, execute } = useApi('/reports/daily');
  const navigate = useNavigate();
  const reportRef = useRef(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState('All');
  const itemsPerPage = 5;

  const handleExportPDF = () => {
    const element = reportRef.current;
    if (!element) return;

    const opt = {
      margin: 0.5,
      filename: `Daily_Production_Report_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  };

  useEffect(() => {
    execute();
  }, [execute]);

  if (loading) return <div className="p-8 flex justify-center h-full items-center"><Loader text="Loading Daily Report Data..." /></div>;
  if (error) return <div className="p-8"><ErrorMessage error={error} retryFunction={execute} /></div>;

  // Strictly real data only. Defaulting to 0 / empty arrays to preserve operational truth.
  const {
    summary = {
      date: new Date().toLocaleDateString('en-GB'),
      production: '0',
      productionGrowth: '0%',
      sales: '0',
      salesStatus: 'No Data',
      efficiency: '0',
      efficiencyGrowth: '0%',
      downtime: '0',
      downtimeStatus: '-'
    },
    shiftStatus = {
      shift: '-',
      supervisor: 'Assigning...',
      target: 0,
      alertMsg: 'No Active Alerts',
      alertDesc: 'Systems Optimal'
    },
    itemsLog = [],
    trendData = []
  } = data || {};

  // Filtering
  const filteredItems = itemsLog.filter(item => {
    if (filterStatus === 'All') return true;
    if (filterStatus === 'Low Stock') return item.lowStock;
    if (filterStatus === 'Normal') return !item.lowStock;
    return true;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage) || 1;

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(c => c + 1);
  };
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(c => c - 1);
  };

  // Reset page to 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus]);

  return (
    <div className="text-slate-100 antialiased bg-slate-900 min-h-screen">
      <div ref={reportRef} className="pt-6 pb-12 px-8 min-h-screen max-w-7xl mx-auto">
        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex items-end justify-between border-b border-blue-900/30 pb-6">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-green-500 mb-1">Production Unit A</p>
              <h1 className="text-[30px] font-extrabold text-white leading-none">Feather Fine Narrow Fabrics</h1>
              <p className="text-slate-400 text-[14px] mt-2">Operational Summary: {summary.date}</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={handleExportPDF}
                className="px-4 py-2 bg-blue-900/20 border border-blue-900 text-white text-[12px] font-bold uppercase tracking-wider rounded hover:bg-blue-900/40 transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">download</span> Export PDF
              </button>
              <button
                onClick={execute}
                className="px-4 py-2 bg-green-500 text-slate-900 text-[12px] font-bold uppercase tracking-wider rounded shadow-[0_0_15px_rgba(0,200,83,0.3)] hover:scale-[1.02] transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">sync</span> Refresh Data
              </button>
            </div>
          </div>

          {/* Bento Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-900/10 p-5 rounded-lg border-l-2 border-green-500 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Production</span>
                <span className="text-green-500 text-[12px] font-bold">{summary.productionGrowth}</span>
              </div>
              <div className="mt-4">
                <span className="text-[24px] font-black text-white">{summary.production} <span className="text-[14px] font-medium text-slate-500">Mtrs</span></span>
              </div>
            </div>

            <div className="bg-blue-900/10 p-5 rounded-lg border-l-2 border-blue-500 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Sales (MTD)</span>
                <span className="text-blue-500 text-[12px] font-bold">{summary.salesStatus}</span>
              </div>
              <div className="mt-4">
                <span className="text-[24px] font-black text-white">{summary.sales} <span className="text-[14px] font-medium text-slate-500">Mtrs</span></span>
              </div>
            </div>

            <div className="bg-blue-900/10 p-5 rounded-lg border-l-2 border-amber-500 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Efficiency Rate</span>
                <span className="text-amber-500 text-[12px] font-bold">{summary.efficiencyGrowth}</span>
              </div>
              <div className="mt-4">
                <span className="text-[24px] font-black text-white">{summary.efficiency}<span className="text-[14px] font-medium text-slate-500">%</span></span>
              </div>
            </div>

            <div className="bg-blue-900/10 p-5 rounded-lg border-l-2 border-red-500 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Downtime</span>
                <span className="text-red-500 text-[12px] font-bold">{summary.downtimeStatus}</span>
              </div>
              <div className="mt-4">
                <span className="text-[24px] font-black text-white">{summary.downtime} <span className="text-[14px] font-medium text-slate-500">Mins</span></span>
              </div>
            </div>
          </div>

          {/* Visualization Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Main Trend Chart */}
            <div className="lg:col-span-2 bg-slate-900 p-6 rounded-xl border border-blue-900/20 shadow-inner">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-white font-bold text-[16px]">Production vs Sales Trend</h3>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest">Shift-wise Hourly Analysis</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Production</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Sales</span>
                  </div>
                </div>
              </div>

              {/* Mock Chart Visualization */}
              <div className="h-64 flex items-end justify-between gap-2 px-2">
                {trendData.map((t, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 flex-1 group">
                    <div className="w-full bg-green-500/10 relative h-full rounded-t-sm group-hover:bg-green-500/20 transition-all flex items-end">
                      <div className="absolute bottom-0 w-full bg-green-500 rounded-t-sm transition-all duration-500" style={{ height: `${t.prod}%` }}></div>
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 bg-blue-500 opacity-80 transition-all duration-500" style={{ height: `${t.sales}%` }}></div>
                    </div>
                    <span className="text-[9px] text-slate-500 font-bold uppercase">{t.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Shift Status */}
            <div className="bg-blue-900/5 border border-blue-900/20 rounded-xl p-6 overflow-hidden relative shadow-md">
              <div className="relative z-10 h-full flex flex-col">
                <h3 className="text-white font-bold text-[16px] mb-4">Current Shift: {shiftStatus.shift}</h3>
                <div className="space-y-4 flex-1">
                  <div className="flex items-center justify-between p-3 bg-slate-800 rounded">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Supervisor</p>
                      <p className="text-[14px] font-semibold text-white">{shiftStatus.supervisor}</p>
                    </div>
                    <div className="flex items-center gap-1 text-green-500">
                      <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>circle</span>
                      <span className="text-[10px] font-bold uppercase">Active</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-slate-800 rounded">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Target Met</p>
                      <p className="text-[14px] font-semibold text-white">{shiftStatus.target}%</p>
                    </div>
                    <div className="w-16 h-1.5 bg-blue-900/30 rounded-full overflow-hidden">
                      <div className="bg-green-500 h-full transition-all duration-1000" style={{ width: `${shiftStatus.target}%` }}></div>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded flex items-center gap-3">
                    <span className="material-symbols-outlined text-red-500 animate-pulse">report_problem</span>
                    <div>
                      <p className="text-red-500 text-[12px] font-bold uppercase tracking-tight">{shiftStatus.alertMsg}</p>
                      <p className="text-[10px] text-red-400/80">{shiftStatus.alertDesc}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Industrial Table Section */}
          <div className="bg-slate-900 rounded-xl border border-blue-900/20 overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-blue-900/30 flex justify-between items-center">
              <div>
                <h3 className="text-white font-bold text-[16px]">Item-wise Detailed Log</h3>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest">Live Inventory & Movement Tracking</p>
              </div>
              <div className="flex gap-2 items-center">
                <select 
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-100 text-[11px] font-bold uppercase rounded border border-slate-700 hover:bg-slate-700 transition-colors focus:outline-none"
                >
                  <option value="All">All Status</option>
                  <option value="Normal">Normal</option>
                  <option value="Low Stock">Low Stock</option>
                </select>
                <button className="px-3 py-1.5 bg-slate-800 text-slate-100 text-[11px] font-bold uppercase rounded border border-slate-700 hover:bg-slate-700 transition-colors">Columns</button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-blue-900/20">
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Item Name</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Quality Spec</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 text-right">Production Qty</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 text-right">Sales Qty</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Status</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-900/10">
                  {currentItems.map((item, i) => (
                    <tr key={item.id} className="hover:bg-blue-900/5 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-blue-900/20 flex items-center justify-center border border-blue-900/30">
                            <span className="material-symbols-outlined text-green-500 text-[18px]">texture</span>
                          </div>
                          <div>
                            <p className="text-[14px] font-bold text-white uppercase tracking-tight">{item.name}</p>
                            <p className="text-[10px] text-slate-500">ID: {item.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 bg-blue-900/10 text-blue-200 text-[11px] font-bold border border-blue-900/20 rounded">{item.quality}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-[14px] font-black text-white">{item.production} <span className="text-[10px] text-slate-500">M</span></span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-[14px] font-black text-green-500">{item.sales} <span className="text-[10px] text-slate-500">M</span></span>
                      </td>
                      <td className="px-6 py-4">
                        {item.lowStock ? (
                          <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                            <span className="text-[10px] font-black text-amber-500 uppercase tracking-tighter">Low Stock</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                            <span className="text-[10px] font-black text-green-500 uppercase tracking-tighter">Normal</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button className="text-slate-500 hover:text-white transition-colors"><span className="material-symbols-outlined">more_horiz</span></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="p-4 bg-slate-900/50 flex justify-between items-center text-[11px] text-slate-500 font-bold uppercase border-t border-blue-900/10">
              <div>Showing {filteredItems.length > 0 ? indexOfFirstItem + 1 : 0}-{Math.min(indexOfLastItem, filteredItems.length)} of {filteredItems.length} active product lines</div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="p-1 hover:text-white disabled:opacity-30 transition-all"
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <span className="text-white">Page {String(currentPage).padStart(2, '0')}</span>
                <button 
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="p-1 hover:text-white disabled:opacity-30 transition-all"
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Action for Quick Report */}
        <div className="fixed bottom-8 right-8 z-50">
          <button 
            onClick={() => navigate('/inventory/production-entry')}
            className="group flex items-center gap-3 bg-blue-900 text-white p-4 rounded-full shadow-2xl border border-green-500/50 hover:scale-105 transition-all"
          >
            <span className="material-symbols-outlined text-[24px]">add_circle</span>
            <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-[200px] transition-all duration-300 font-bold uppercase text-[12px] tracking-widest pr-2">Add Log Entry</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DailyProductionSalesReport;
