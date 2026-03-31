import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import Loader from '../../components/ui/Loader';
import ErrorMessage from '../../components/ui/ErrorMessage';
import html2pdf from 'html2pdf.js';

const DeliveryChallanPDF = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: challan, loading, error, execute } = useApi(`/logistics/challan/${id}`);
  const printRef = useRef();

  useEffect(() => {
    execute();
  }, [execute, id]);

  const handleDownloadPdf = () => {
    const element = printRef.current;
    if (!element) return;
    
    // Temporarily apply print styles strictly for PDF generation
    const opt = {
      margin: 0.5,
      filename: `Challan_${challan?.challanNumber || id}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().from(element).set(opt).save();
  };

  if (loading) return <div className="p-8 flex items-center justify-center min-h-screen text-slate-100"><Loader text="Loading Document Data..." /></div>;
  if (error) return <div className="p-8"><ErrorMessage error={error} retryFunction={execute} /></div>;
  if (!challan) return <div className="p-8 text-slate-100">Document Not Found</div>;

  return (
    <div className="pt-2 pb-12 w-full min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <span className="text-[10px] font-semibold text-blue-500 uppercase tracking-[0.2em] block mb-1">Document Viewer</span>
            <h1 className="text-3xl font-black text-slate-100 uppercase tracking-tight">Delivery Challan</h1>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="px-6 py-2 border border-slate-700 text-slate-400 hover:bg-slate-800 transition-colors rounded text-sm font-semibold uppercase tracking-wider"
            >
              Back
            </button>
            <button 
              onClick={handleDownloadPdf}
              className="px-6 py-2 flex items-center gap-2 bg-blue-500 text-slate-900 hover:brightness-110 transition-colors rounded text-sm font-black uppercase tracking-wider shadow-[0_0_15px_rgba(59,130,246,0.3)]"
            >
              <span className="material-symbols-outlined text-sm">download</span>
              Export PDF
            </button>
          </div>
        </div>

        {/* PDF Container - visually styled but strictly printable */}
        <div className="bg-white p-12 rounded shadow-2xl text-slate-900 overflow-x-auto print-container group hover:ring-2 hover:ring-blue-500/50 transition-all">
          <div ref={printRef} className="max-w-full w-[800px] mx-auto bg-white" style={{ minHeight: '1056px', padding: '40px' }}>
            
            {/* Header / Company Info */}
            <div className="flex justify-between items-start border-b-2 border-slate-800 pb-6 mb-8">
              <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">FeatheraFine</h1>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">Industrial Poly-Products</p>
                <div className="mt-4 text-xs text-slate-600 space-y-1">
                  <p>123 Manufacturing Sector, Industrial Estate</p>
                  <p>Gujarat, India 380001</p>
                  <p>GSTIN: 24AAABC1234E1Z1</p>
                  <p>Contact: +91 98765 43210</p>
                </div>
              </div>
              <div className="text-right">
                <h2 className="text-3xl font-bold text-slate-800 uppercase tracking-widest border border-slate-800 px-4 py-2 inline-block">Challan</h2>
                <div className="mt-4 text-left grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <span className="font-bold text-slate-500 uppercase text-[10px]">Challan No:</span>
                  <span className="font-bold">{challan.challanNumber}</span>
                  
                  <span className="font-bold text-slate-500 uppercase text-[10px]">Date:</span>
                  <span className="font-semibold">{new Date(challan.dispatchDate).toLocaleDateString()}</span>
                  
                  <span className="font-bold text-slate-500 uppercase text-[10px]">Vehicle No:</span>
                  <span className="font-semibold">{challan.vehicleNo || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Consignee Details */}
            <div className="grid grid-cols-2 gap-12 mb-8">
              <div>
                <h3 className="text-xs font-black text-slate-400 border-b border-slate-300 pb-2 mb-3 uppercase tracking-widest">Dispatched To</h3>
                <p className="font-bold text-lg text-slate-800">{challan.destination || 'Direct Customer'}</p>
                <p className="text-sm text-slate-600 mt-2">Transporter: {challan.transporter || 'Self/Local'}</p>
                <p className="text-sm text-slate-600">Driver Contact: {challan.driverContact || 'N/A'}</p>
              </div>
              <div>
                <h3 className="text-xs font-black text-slate-400 border-b border-slate-300 pb-2 mb-3 uppercase tracking-widest">Shipping Terms</h3>
                <p className="text-sm text-slate-600 italic">"Goods once sold and dispatched cannot be taken back unless prior written consent guarantees return."</p>
                <p className="text-sm text-slate-600 mt-2 font-bold uppercase text-[10px]">Status: {challan.status}</p>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="min-h-[400px]">
              <table className="w-full text-left border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 border-b-2 border-slate-400">
                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-widest border-r border-slate-300 w-16">Sr.</th>
                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-widest border-r border-slate-300">Description of Goods</th>
                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-widest border-r border-slate-300 w-32 text-right">Prod ID</th>
                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-widest w-40 text-right">Net Weight (Kg)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {challan.lines?.map((line, index) => (
                    <tr key={line.id}>
                      <td className="px-4 py-3 text-sm text-slate-600 border-r border-slate-300">{index + 1}</td>
                      <td className="px-4 py-3 text-sm font-semibold border-r border-slate-300">{line.description || 'Industrial Item'}</td>
                      <td className="px-4 py-3 text-xs text-slate-500 font-mono text-right border-r border-slate-300">{line.productionId?.substring(0,8) || '-'}</td>
                      <td className="px-4 py-3 text-sm font-bold text-right">{Number(line.batchWeightKg).toFixed(2)}</td>
                    </tr>
                  ))}
                  {(!challan.lines || challan.lines.length === 0) && (
                    <tr>
                      <td colSpan="4" className="px-4 py-8 text-center text-sm text-slate-400 italic">No line items documented for this challan.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Totals & Footer */}
            <div className="flex justify-between items-end mt-12 pt-8 border-t-2 border-slate-800">
              <div className="text-xs text-slate-500 w-1/2">
                <p className="font-bold mb-1 uppercase tracking-widest text-slate-800">Declaration:</p>
                <p>We declare that this invoice/challan shows the actual price of the goods described and that all particulars are true and correct.</p>
              </div>
              
              <div className="text-right">
                <div className="mb-12">
                  <p className="text-lg font-bold text-slate-800">
                    Total Wt: <span className="text-2xl ml-2">{challan.lines?.reduce((sum, l) => sum + Number(l.batchWeightKg), 0).toFixed(2)} Kg</span>
                  </p>
                </div>
                <div className="border-t border-slate-400 pt-2 px-12 inline-block">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-600">Authorized Signatory</p>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default DeliveryChallanPDF;
