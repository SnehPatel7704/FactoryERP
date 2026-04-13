import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import Loader from '../../components/ui/Loader';
import ErrorMessage from '../../components/ui/ErrorMessage';
import { Truck, Package, Ruler, Weight, Calendar, User } from 'lucide-react';
import html2pdf from 'html2pdf.js';

const DeliveryChallanPDF = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const printRef = useRef();

  const { data: challan, loading, error, execute } = useApi(
    `/logistics/challan/${id}`,
    {},
    null
  );

  useEffect(() => {
    if (id) execute();
  }, [id, execute]);

  const handlePrintPDF = () => {
    const element = printRef.current;
    if (element) {
      const opt = {
        margin: 0.5,
        filename: `Delivery_Challan_${challan?.challanNumber || id}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
      };
      html2pdf().set(opt).from(element).save();
    }
  };

  if (loading) return <Loader text="Loading challan details..." />;
  if (error) return <ErrorMessage error={error} retryFunction={execute} />;
  if (!challan) return <div className="p-8 text-center text-slate-400">Challan not found</div>;

  const totalWeight = challan.lines.reduce((sum, line) => sum + line.batchweightId, 0);

  return (
    <div className="pt-4 pb-12 min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-xl">arrow_back</span>
            Back
          </button>
          <div className="text-right">
            <h1 className="text-3xl font-black text-white uppercase tracking-tight">Delivery Challan</h1>
            <p className="text-sm text-slate-400 mt-1">Print / Download PDF</p>
          </div>
          <button
            onClick={handlePrintPDF}
            className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-lg font-bold shadow-lg transition-all"
          >
            📄 Download PDF
          </button>
        </div>

        {/* Printable Content */}
        <div ref={printRef} className="bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden print:shadow-none print:rounded-none">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-black uppercase tracking-wide">FeatheraFine Industries</h2>
                <p className="text-blue-100 mt-1">Textile Production & Dispatch</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black">DELIVERY CHALLAN</div>
                <div className="bg-white/20 px-4 py-1 rounded-full text-sm font-bold mt-2">
                  #{challan.challanNumber || 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="p-8 space-y-6">
            {/* Transport Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-bold text-lg uppercase tracking-wide mb-4 border-b pb-2">Transporter Details</h3>
                <div className="space-y-2 text-sm">
                  <div><span className="font-semibold">Vehicle No:</span> {challan.vehicleNo || 'N/A'}</div>
                  <div><span className="font-semibold">Transporter:</span> {challan.transporter || 'N/A'}</div>
                  <div><span className="font-semibold">Driver Contact:</span> {challan.driverContact || 'N/A'}</div>
                  <div><span className="font-semibold">Destination:</span> {challan.destination || 'N/A'}</div>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-lg uppercase tracking-wide mb-4 border-b pb-2">Dispatch Details</h3>
                <div className="space-y-2 text-sm">
                  <div><span className="font-semibold">Date:</span> {challan.dispatchDate ? new Date(challan.dispatchDate).toLocaleDateString() : 'N/A'}</div>
                  <div><span className="font-semibold">Total Items:</span> {challan.lines.length}</div>
                  <div><span className="font-semibold">Total Weight:</span> {totalWeight.toFixed(2)} kg</div>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div>
              <h3 className="font-bold text-lg uppercase tracking-wide mb-4 border-b pb-2">Dispatch Items</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="border p-3 text-left font-bold uppercase text-xs tracking-wide">Item Description</th>
                      <th className="border p-3 text-right font-bold uppercase text-xs tracking-wide">Weight (kg)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {challan.lines.map((line, idx) => (
                      <tr key={idx} className="border-b hover:bg-slate-50">
                        <td className="p-3">{line.description}</td>
                        <td className="p-3 font-mono text-right font-bold">{line.batchweightId.toFixed(2)}</td>
                      </tr>
                    ))}
                    <tr className="bg-blue-50 font-bold">
                      <td className="p-3 text-right uppercase">TOTAL</td>
                      <td className="p-3 font-mono text-right text-2xl text-blue-900">{totalWeight.toFixed(2)} kg</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer Signatures */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t">
              <div>
                <p className="text-xs text-slate-500 mb-4 uppercase font-bold tracking-wide">Prepared By</p>
                <div className="border-t h-24 flex items-end pb-4">
                  <span className="block text-sm font-mono">Signature & Date</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-4 uppercase font-bold tracking-wide">Receiver Signature</p>
                <div className="border-t h-24 flex items-end pb-4">
                  <span className="block text-sm font-mono">Customer Signature & Stamp</span>
                </div>
              </div>
            </div>
          </div>

          {/* Page Footer */}
          <div className="bg-slate-100 p-4 text-xs text-slate-600 text-center border-t">
            Generated by FeatheraFine Dispatch System | Page 1 of 1 | {new Date().toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryChallanPDF;

