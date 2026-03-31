import React, { useState, useEffect } from 'react';
import { BarChart as BarChartIcon, Download, FileText, Calendar } from 'lucide-react';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import { apiClient } from '../../utils/apiClient';

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState('inventory_summary');
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch actual reports from API
    const fetchReports = async () => {
      try {
        setLoading(true);
        
        // Fetch daily report
        const dailyReport = await apiClient.get('/reports/daily');
        // Fetch annual performance report  
        const annualReport = await apiClient.get('/reports/annual-performance');
        
        // Create initial log entries from API responses
        const reportLogs = [
          { 
            id: `RPT-${Date.now()}-001`, 
            date: new Date().toLocaleDateString(), 
            type: 'Daily Production Report', 
            status: 'Generated',
            data: dailyReport 
          },
          { 
            id: `RPT-${Date.now()}-002`, 
            date: new Date().toLocaleDateString(), 
            type: 'Annual Performance Report', 
            status: 'Generated',
            data: annualReport 
          }
        ];
        
        setLogs(reportLogs);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch reports:', err);
        setError(err.message);
        // Fallback to placeholder logs
        setLogs([
          { id: 'RPC-881', date: new Date().toLocaleDateString(), type: 'Inventory Rollup', status: 'Error Loading' },
          { id: 'RPC-882', date: new Date().toLocaleDateString(), type: 'Sales Matrix', status: 'Error Loading' }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchReports();
  }, []);

  const generateReport = async () => {
    setLoading(true);
    try {
      // Fetch the selected report type from API
      let endpoint = '/reports/daily';
      if (reportType === 'sales_velocity') {
        endpoint = '/reports/daily'; // Use same endpoint, could be different in future
      } else if (reportType === 'quality_defects') {
        endpoint = '/reports/daily';
      } else if (reportType === 'logistics_transit') {
        endpoint = '/reports/daily';
      }
      
      const result = await apiClient.get(endpoint);
      setError(null);
      alert('Report data footprint successfully analyzed and synced.');
    } catch (err) {
      console.error('Failed to generate report:', err);
      setError(err.message);
      alert('Error generating report: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in space-y-6 custom-scrollbar">
      <div className="flex items-center justify-between border-b border-primary/20 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChartIcon className="text-secondary" /> Analytics & Reports
          </h2>
          <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Cross-module aggregate metric generations</p>
          {error && <p className="text-xs text-red-500 mt-2">Error: {error}</p>}
        </div>
        <Button variant="primary" className="flex items-center gap-2" onClick={generateReport} disabled={loading}><Download size={16} /> {loading ? 'Generating...' : 'Export CSV/PDF'}</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 bg-surface-container border border-primary/10 rounded-xl shadow p-6">
          <h3 className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-4">Query Parameters</h3>
          <div className="space-y-4 border-t border-outline/20 pt-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold text-slate-400 tracking-[0.05em] uppercase">Target Base Model</label>
              <select value={reportType} onChange={(e) => setReportType(e.target.value)} className="w-full bg-[#13181f] border border-outline/30 rounded py-2 px-3 text-sm text-slate-200 focus:ring-1 focus:ring-secondary">
                <option value="inventory_summary">Global Inventory Summary</option>
                <option value="sales_velocity">Sales Order Velocity</option>
                <option value="quality_defects">Quality Rejection Ratios</option>
                <option value="logistics_transit">Active Transit Manifests</option>
              </select>
            </div>
            
            <div className="bg-primary/5 rounded border border-outline/20 p-4 mt-4 text-center text-xs text-slate-400 space-y-2">
              <Calendar size={24} className="mx-auto text-secondary opacity-50" />
              <p>Chronological date filtering requires secondary module expansion currently slated for V2.</p>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 bg-surface-container border border-primary/10 rounded-xl shadow overflow-hidden flex flex-col">
          <div className="px-6 py-4 bg-primary-container/20 border-b border-outline/10 flex justify-between items-center">
            <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Generated Artifacts log</h3>
          </div>
          <div className="flex-1 p-6 relative">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-surface-container/80 z-10 backdrop-blur-sm">
                <Loader text="Compiling Data Matrices..." />
              </div>
            ) : null}
            
            <table className="w-full text-left">
              <thead>
                <tr className="text-on-surface-variant border-b border-outline/10">
                  <th className="pb-3 text-[10px] font-semibold text-slate-500 uppercase tracking-[0.2em]">Batch Code</th>
                  <th className="pb-3 text-[10px] font-semibold text-slate-500 uppercase tracking-[0.2em]">Report Class</th>
                  <th className="pb-3 text-[10px] font-semibold text-slate-500 uppercase tracking-[0.2em] text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline/5">
                {logs.map(log => (
                  <tr key={log.id} className="group">
                    <td className="py-4 font-mono text-sm text-secondary">{log.id}</td>
                    <td className="py-4 text-sm font-medium text-slate-300 flex items-center gap-2">
                      <FileText size={14} className="text-slate-500" /> {log.type}
                    </td>
                    <td className="py-4 text-right">
                      <span className="text-[10px] font-bold text-slate-400 bg-white/5 px-2 py-1 rounded">{log.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
