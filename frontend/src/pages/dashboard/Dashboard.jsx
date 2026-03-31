import React, { useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import Loader from '../../components/ui/Loader';
import ErrorMessage from '../../components/ui/ErrorMessage';
import AnalyticsDashboard from '../reports/AnalyticsDashboard';

const Dashboard = () => {
  const { data, loading, error, execute } = useApi('/dashboard');

  useEffect(() => {
    execute();
  }, [execute]);

  // Ensure ERP accuracy by defaulting strictly to 0 if data isn't present
  const defaultMetrics = {
    totalOrders: 0,
    pendingOrders: 0,
    totalProductionKg: 0,
    monthlySales: 0,
    annualSales: 0,
    dailySales: 0,
    monthlyProduction: 0,
    annualProduction: 0,
    physicalStocks: 0
  };

  const metrics = { ...defaultMetrics, ...(data?.metrics || {}) };

  if (loading) return <div className="p-8 flex items-center justify-center min-h-screen text-slate-100"><Loader text="Aggregating Enterprise Data..." /></div>;
  if (error) return <div className="p-8"><ErrorMessage error={error} retryFunction={execute} /></div>;

  return (
    <div className="pt-2 pb-12 min-h-screen antialiased bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Decorative Glow Elements */}
      <div className="absolute top-0 left-[-10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-teal-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Top Header */}
      <div className="flex items-center justify-between px-8 mb-10 z-10 relative w-full max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-400 tracking-tight">Integrated Management Dashboard</h2>
          <span className="px-2.5 py-1 bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[10px] font-bold rounded-full uppercase tracking-widest shadow-[0_0_15px_rgba(20,184,166,0.15)]">Enterprise Overview</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 border-l border-white/10 pl-6">
            <div className="text-right">
              <p className="text-xs font-bold leading-none text-slate-200">{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
              <p className="text-[10px] text-slate-500">{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 space-y-12 relative z-10">
        
        {/* 1. Sales Metrics Section */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
              <span className="material-symbols-outlined text-indigo-400 text-lg">payments</span>
            </div>
            <h3 className="text-lg font-bold text-slate-200 uppercase tracking-widest">Sales Overview</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.2)] hover:-translate-y-1 hover:border-indigo-500/40 hover:shadow-indigo-500/10 transition-all duration-300 relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none group-hover:scale-110 group-hover:opacity-10 transition-all duration-500">
                <span className="material-symbols-outlined text-8xl text-indigo-400">attach_money</span>
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Daily Sales</p>
              <div className="flex items-end justify-between relative z-10">
                <h4 className="text-3xl font-black text-white drop-shadow-md">₹{(metrics.dailySales || 0).toLocaleString()}</h4>
              </div>
            </div>
            
            <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.2)] hover:-translate-y-1 hover:border-indigo-500/40 hover:shadow-indigo-500/10 transition-all duration-300 relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none group-hover:scale-110 group-hover:opacity-10 transition-all duration-500">
                <span className="material-symbols-outlined text-8xl text-indigo-400">monitoring</span>
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Monthly Sales</p>
              <div className="flex items-end justify-between relative z-10">
                <h4 className="text-3xl font-black text-white drop-shadow-md">₹{(metrics.monthlySales || 0).toLocaleString()}</h4>
              </div>
            </div>
            
            <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.2)] hover:-translate-y-1 hover:border-indigo-500/40 hover:shadow-indigo-500/10 transition-all duration-300 relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none group-hover:scale-110 group-hover:opacity-10 transition-all duration-500">
                <span className="material-symbols-outlined text-8xl text-indigo-400">account_balance</span>
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Annual Sales (Lakhs)</p>
              <div className="flex items-end justify-between relative z-10">
                <h4 className="text-3xl font-black text-white drop-shadow-md">₹{((metrics.annualSales || 0) / 100000).toFixed(1)} <span className="text-lg text-slate-400">L</span></h4>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Stock & Orders Section */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <span className="material-symbols-outlined text-emerald-400 text-lg">inventory</span>
            </div>
            <h3 className="text-lg font-bold text-slate-200 uppercase tracking-widest">Stock & Orders</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/5 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.2)] flex items-center justify-between hover:-translate-y-1 hover:border-emerald-500/30 hover:shadow-emerald-500/10 transition-all duration-300 group">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Physical Stocks Available</p>
                <h4 className="text-5xl font-black text-white drop-shadow-lg tracking-tight">{(metrics.physicalStocks || 0).toLocaleString()} <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Units</span></h4>
              </div>
              <div className="w-20 h-20 bg-emerald-500/5 border border-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/10 transition-all duration-300 shadow-inner">
                <span className="material-symbols-outlined text-4xl group-hover:rotate-6 transition-transform">inventory_2</span>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.2)] flex items-center justify-between hover:-translate-y-1 hover:border-sky-500/30 hover:shadow-sky-500/10 transition-all duration-300 group">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Pending Orders Queued</p>
                <h4 className="text-5xl font-black text-white drop-shadow-lg tracking-tight">{(metrics.pendingOrders || 0).toLocaleString()} <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Active</span></h4>
              </div>
              <div className="w-20 h-20 bg-sky-500/5 border border-sky-500/10 rounded-full flex items-center justify-center text-sky-400 group-hover:bg-sky-500/10 transition-all duration-300 shadow-inner">
                <span className="material-symbols-outlined text-4xl pr-1 mt-1 group-hover:-rotate-6 transition-transform">shopping_cart_checkout</span>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Production Metrics Section */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
              <span className="material-symbols-outlined text-rose-400 text-lg">precision_manufacturing</span>
            </div>
            <h3 className="text-lg font-bold text-slate-200 uppercase tracking-widest">Production Volumes</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/5 backdrop-blur-lg p-6 rounded-2xl border border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.2)] hover:-translate-y-1 transition-all duration-300 border-l-4 border-l-teal-500">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Daily Output</p>
              <div className="flex items-end justify-between">
                <h4 className="text-3xl font-black text-white">{(metrics.totalProductionKg || 0).toLocaleString()} <span className="text-xs font-bold text-slate-500 uppercase">Kg</span></h4>
              </div>
            </div>
            
            <div className="bg-white/5 backdrop-blur-lg p-6 rounded-2xl border border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.2)] hover:-translate-y-1 transition-all duration-300 border-l-4 border-l-indigo-500">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Monthly Output</p>
              <div className="flex items-end justify-between">
                <h4 className="text-3xl font-black text-white">{(metrics.monthlyProduction || 0).toLocaleString()} <span className="text-xs font-bold text-slate-500 uppercase">Kg</span></h4>
              </div>
            </div>
            
            <div className="bg-white/5 backdrop-blur-lg p-6 rounded-2xl border border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.2)] hover:-translate-y-1 transition-all duration-300 border-l-4 border-l-slate-400">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Annual Output</p>
              <div className="flex items-end justify-between">
                <h4 className="text-3xl font-black text-white">{(metrics.annualProduction || 0).toLocaleString()} <span className="text-xs font-bold text-slate-500 uppercase">Tons</span></h4>
              </div>
            </div>
          </div>
        </section>

        {/* Analytics Dashboard Section */}
        <section className="mt-20">
          <AnalyticsDashboard />
        </section>

      </div>
    </div>
  );
};

export default Dashboard;
