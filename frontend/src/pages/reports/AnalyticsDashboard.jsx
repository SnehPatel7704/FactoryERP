import React, { useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import Loader from '../../components/ui/Loader';
import ErrorMessage from '../../components/ui/ErrorMessage';
import { Activity, Clock, FileText, CheckCircle, TrendingUp, AlertTriangle } from 'lucide-react';

// Format numbers in Indian style
const formatIndianNumber = (num) => {
  const number = parseFloat(num) || 0;
  if (number >= 10000000) {
    return (number / 10000000).toFixed(2) + ' Cr'; // Crores
  } else if (number >= 100000) {
    return (number / 100000).toFixed(2) + ' L'; // Lakhs
  } else if (number >= 1000) {
    return (number / 1000).toFixed(2) + ' K'; // Thousands
  }
  return number.toFixed(0);
};

const AnalyticsDashboard = () => {
  // Fetch from the actual reporting API endpoints
  const { data: dailyData, loading: dailyLoading, error: dailyErr, execute: executeDaily } = useApi('/reports/daily', {}, { summary: {} });
  const { data: annualData, loading: annualLoading, error: annualErr, execute: executeAnnual } = useApi('/reports/annual-performance', {}, { metrics: {} });
  const { data: sevenDaysData, loading: sevenDaysLoading, error: sevenDaysErr, execute: executeSevenDays } = useApi('/reports/seven-days', {}, { dailyData: [] });
  const { data: dashboardData, loading: dashLoading, error: dashErr, execute: executeDash } = useApi('/dashboard', {}, { metrics: {} });

  useEffect(() => {
    executeDaily();
    executeAnnual();
    executeSevenDays();
    executeDash();
  }, [executeDaily, executeAnnual, executeSevenDays, executeDash]);

  if (dailyLoading || annualLoading || dashLoading || sevenDaysLoading) {
    return <div className="p-8"><Loader text="Aggregating Core Analytics..." /></div>;
  }

  if (dailyErr || annualErr || dashErr || sevenDaysErr) {
    return <div className="p-8"><ErrorMessage error={dailyErr || annualErr || dashErr || sevenDaysErr} retryFunction={() => { executeDaily(); executeAnnual(); executeSevenDays(); executeDash(); }} /></div>;
  }

  // Extract data with fallbacks
  const dailyProduction = formatIndianNumber(dailyData?.summary?.production || 0);
  const annualProduction = formatIndianNumber(annualData?.metrics?.production || 0);
  const dashMetrics = dashboardData?.metrics || {};
  const chartData = sevenDaysData?.dailyData || [];

  // Calculate quality yield (using available data)
  const totalOrders = dashMetrics.totalOrders || 0;
  const pendingOrders = dashMetrics.pendingOrders || 0;
  const qualityYield = totalOrders > 0 ? (((totalOrders - pendingOrders) / totalOrders) * 100).toFixed(1) : '0';
  const wastage = (100 - parseFloat(qualityYield)).toFixed(1);

  // Get max production for scaling the chart
  const maxProduction = chartData.length > 0 ? Math.max(...chartData.map(d => d.production)) : 100;

  return (
    <div className="pt-2 pb-12 w-full">
      <div className="max-w-7xl mx-auto w-full space-y-8">

        {/* Header Section */}
        <div className="flex flex-col mb-10">
          <span className="text-[10px] font-semibold text-teal-500 uppercase tracking-[0.2em] mb-1">Intelligence Module</span>
          <h1 className="text-3xl font-black text-slate-100 uppercase tracking-tight">Analytics Center</h1>
          <p className="text-sm text-slate-500 mt-2 max-w-2xl">High-level insights aggregated from real-time production, dispatch, and quality control systems across FeatheraFine facilities.</p>
        </div>

        {/* Top KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.2)] hover:-translate-y-1 hover:border-teal-500/40 hover:shadow-teal-500/10 transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 group-hover:opacity-10 transition-all duration-500">
              <TrendingUp size={48} className="text-teal-400" />
            </div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Today's Output</h3>
            <p className="text-3xl font-black text-white">{dailyProduction}</p>
            <p className="text-[10px] text-teal-400 font-bold uppercase mt-2">Meters</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.2)] hover:-translate-y-1 hover:border-indigo-500/40 hover:shadow-indigo-500/10 transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 group-hover:opacity-10 transition-all duration-500">
              <Activity size={48} className="text-indigo-400" />
            </div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Annual Production</h3>
            <p className="text-3xl font-black text-white">{annualProduction}</p>
            <p className="text-[10px] text-indigo-400 font-bold uppercase mt-2">Total YTD</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.2)] hover:-translate-y-1 hover:border-emerald-500/40 hover:shadow-emerald-500/10 transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 group-hover:opacity-10 transition-all duration-500">
              <CheckCircle size={48} className="text-emerald-400" />
            </div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Quality Yield</h3>
            <p className="text-3xl font-black text-white">{qualityYield}%</p>
            <p className="text-[10px] text-emerald-400 font-bold uppercase mt-2">Passed QA Checks</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.2)] hover:-translate-y-1 hover:border-rose-500/40 hover:shadow-rose-500/10 transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 group-hover:opacity-10 transition-all duration-500">
              <AlertTriangle size={48} className="text-rose-400" />
            </div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Material Wastage</h3>
            <p className="text-3xl font-black text-white">{wastage}%</p>
            <p className="text-[10px] text-rose-400 font-bold uppercase mt-2">Below Threshold</p>
          </div>
        </div>

        {/* Charts & Graphs Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.2)] hover:-translate-y-1 transition-all duration-300 min-h-[400px]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
                <Clock size={16} className="text-teal-400" /> Production Last 7 Days
              </h3>
            </div>
            <div className="h-full flex flex-col justify-end gap-2 pb-12 px-4 border-b border-l border-white/10 relative mt-8">
              {/* Bar Chart with Dates */}
              <div className="absolute bottom-0 left-0 w-full h-[1px] bg-white/10" />
              <div className="flex items-end justify-between h-[250px] w-full gap-2 relative">
                {chartData.map((day, i) => {
                  const percentage = maxProduction > 0 ? (day.production / maxProduction) * 100 : 0;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-gradient-to-t from-teal-500/30 to-teal-400/70 rounded-t hover:brightness-125 transition-all cursor-pointer relative group border border-teal-500/20" style={{ height: `${percentage || 5}%`, minHeight: '20px' }}>
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800/80 backdrop-blur px-2 py-1 rounded whitespace-nowrap">
                          {formatIndianNumber(day.production)} m
                        </div>
                      </div>
                      <span className="text-[9px] text-slate-400 font-bold text-center w-full">{day.date}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <p className="text-xs text-center text-slate-400 mt-4 italic">Live production data for the last 7 days.</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.2)] hover:-translate-y-1 transition-all duration-300 min-h-[400px]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
                <FileText size={16} className="text-teal-400" /> Live System Metrics
              </h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg hover:border-white/20 hover:bg-white/10 transition-all">
                <div className="flex items-center gap-4">
                  <span className="w-2 h-2 rounded-full bg-teal-400" />
                  <div>
                    <p className="text-sm font-bold text-slate-200">Total Orders</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">System Count</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-teal-400">{totalOrders}</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg hover:border-white/20 hover:bg-white/10 transition-all">
                <div className="flex items-center gap-4">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <div>
                    <p className="text-sm font-bold text-slate-200">Pending Orders</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">Active Queue</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-amber-400">{pendingOrders}</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg hover:border-white/20 hover:bg-white/10 transition-all">
                <div className="flex items-center gap-4">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <div>
                    <p className="text-sm font-bold text-slate-200">Physical Stocks</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">Available Units</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-400">{(dashMetrics.physicalStocks || 0).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg hover:border-white/20 hover:bg-white/10 transition-all">
                <div className="flex items-center gap-4">
                  <span className="w-2 h-2 rounded-full bg-rose-400" />
                  <div>
                    <p className="text-sm font-bold text-slate-200">Monthly Production</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">Cumulative Kg</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-rose-400">{formatIndianNumber(dashMetrics.monthlyProduction || 0)}</span>
                </div>
              </div>

              <div className="pt-4 mt-2">
                <button onClick={() => { executeDaily(); executeAnnual(); executeSevenDays(); executeDash(); }} className="w-full py-2 bg-teal-500/20 border border-teal-500/30 hover:bg-teal-500/30 hover:border-teal-500/50 text-teal-300 text-xs font-bold uppercase tracking-widest rounded-lg transition-all">
                  Refresh Data
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AnalyticsDashboard;
