import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Loader from '../../components/ui/Loader';
import ErrorMessage from '../../components/ui/ErrorMessage';
import { apiClient } from '../../utils/apiClient';
import { exportToCSV } from '../../utils/exportCSV';
import html2pdf from 'html2pdf.js';


const DispatchChallanGeneration = ({ salesOrderId: salesOrderIdProp, onBack, onSuccess }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  // Support both prop-driven (embedded) and route-driven (standalone) usage
  const salesOrderId = salesOrderIdProp || searchParams.get('order');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [salesOrder, setSalesOrder] = useState(null);
  const [stagedItems, setStagedItems] = useState([]);

  const [formData, setFormData] = useState({
    vehicleNo: '',
    transporter: '',
    driverContact: '',
    destination: '',
    challanNumber: `CHL-${Date.now()}`
  });

  const [selectedItems, setSelectedItems] = useState([]);
  const [challan, setChallan] = useState(null);

  // Load sales order and staged items
  useEffect(() => {

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch the sales order
        const orderResponse = await apiClient.get(`/sales/search/${salesOrderId}`);
        setSalesOrder(orderResponse);


        // Use sales order lineItems directly for challan (no staging dependency)
        // NOTE: use orderResponse directly — salesOrder state hasn't updated yet
        if (orderResponse && orderResponse.lineItems && orderResponse.lineItems.length > 0) {
          const lineItemsForChallan = orderResponse.lineItems.map((line, index) => ({
            ...line,                             // preserve item/size/quality/color for table rendering
            id: line.id || `line-${index}`,
            productionId: null,
            batchweightId: line.weightId || 0,
            description: `Line Item - Item: ${line.item?.name || 'N/A'}, Size: ${line.size?.value || 'N/A'}, Quality: ${line.quality?.grade || 'N/A'}, Color: ${line.color?.name || 'N/A'}, Weight: ${line.weightId}kg`
          }));
          setStagedItems(lineItemsForChallan);

          // Pre-select all
          setSelectedItems(lineItemsForChallan);
        } else {
          console.log('No line items in sales order:', salesOrderId);
          setStagedItems([]);
        }

      } catch (err) {
        setError(err.message || 'Failed to load order details');
      } finally {
        setLoading(false);
      }
    };



    if (salesOrderId) {
      loadData();
    }
  }, [salesOrderId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleItemSelection = (item) => {
    setSelectedItems(prev => {
      const exists = prev.find(i => i.id === item.id);
      if (exists) {
        return prev.filter(i => i.id !== item.id);
      } else {
        // Re-add with all original fields preserved (same shape as stagedItems)
        return [...prev, { ...item }];
      }
    });
  };

  const updateSelectedItem = (id, field, value) => {
    setSelectedItems(prev =>
      prev.map(item => item.id === id ? { ...item, [field]: value } : item)
    );
  };

  // ── Shared validation + challan generator ────────────────────────────────────
  const validateAndGetChallan = async () => {
    // 1. Check order is loaded
    if (!salesOrder) {
      alert('Error: No sales order loaded. Please navigate here from a sales order.');
      return null;
    }
    // 2. Check items are selected
    if (selectedItems.length === 0) {
      alert('Error: No items selected. Please select at least one line item to include in the challan.');
      return null;
    }
    // 3. If challan already generated, reuse it
    if (challan) return challan;

    // 4. Generate challan via API
    try {
      setSubmitting(true);
      setError(null);
      const payload = {
        challanNumber: formData.challanNumber,
        vehicleNo: formData.vehicleNo,
        transporter: formData.transporter,
        driverContact: formData.driverContact,
        destination: formData.destination,
        salesOrderId: salesOrder.id,
        lines: selectedItems,
      };
      const response = await apiClient.post('/logistics/challan', payload);
      setChallan(response);

      // Update order + production status
      await apiClient.post(`/sales/${salesOrder.id}/dispatch`);

      // Reset form fields, keep items for re-download
      setFormData(prev => ({ ...prev, challanNumber: `CHL-${Date.now()}` }));
      return response;
    } catch (err) {
      const msg = err.message || 'Failed to generate challan';
      setError(msg);
      alert(`Error: ${msg}`);
      return null;
    } finally {
      setSubmitting(false);
    }
  };

  // ── Excel Export ─────────────────────────────────────────────────────────────
  const handleExcelDownload = async () => {
    const c = await validateAndGetChallan();
    if (!c) return;
    const rows = (c.lines || selectedItems).map((line, idx) => ({
      '#': idx + 1,
      'Challan No': c.challanNumber,
      'Item': line.item?.name || line.description || 'N/A',
      'Size': line.size?.value || 'N/A',
      'Quality': line.quality?.grade || 'N/A',
      'Color': line.color?.name || 'N/A',
      'Weight (kg)': parseFloat(line.batchweightId || 0).toFixed(2),
    }));
    exportToCSV(rows, `Challan_${c.challanNumber}.csv`);
  };

  // ── PDF Export ────────────────────────────────────────────────────────────────
  const handlePDFDownload = async () => {
    const c = await validateAndGetChallan();
    if (!c) return;
    const lines = c.lines || selectedItems;
    const totalWt = lines.reduce((s, l) => s + parseFloat(l.batchweightId || 0), 0).toFixed(2);
    const rowsHtml = lines.map((line, idx) => `
      <tr style="border-bottom:1px solid #e2e8f0;">
        <td style="padding:10px 12px;">${idx + 1}</td>
        <td style="padding:10px 12px;font-weight:600;">${line.item?.name || 'N/A'}</td>
        <td style="padding:10px 12px;">${line.size?.value || 'N/A'}</td>
        <td style="padding:10px 12px;">${line.quality?.grade || 'N/A'}</td>
        <td style="padding:10px 12px;">${line.color?.name || 'N/A'}</td>
        <td style="padding:10px 12px;text-align:right;font-weight:700;font-family:monospace;">${parseFloat(line.batchweightId || 0).toFixed(2)}</td>
      </tr>
    `).join('');

    const html = `
      <div style="font-family:'Helvetica Neue',Arial,sans-serif;color:#1e293b;max-width:800px;margin:0 auto;">
        <!-- Header -->
        <div style="background:linear-gradient(135deg,#1d4ed8,#2563eb);color:#fff;padding:32px;border-radius:12px 12px 0 0;">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;">
            <div>
              <div style="font-size:22px;font-weight:900;letter-spacing:1px;text-transform:uppercase;">FeatheraFine Industries</div>
              <div style="font-size:13px;color:#bfdbfe;margin-top:4px;">Textile Production &amp; Dispatch</div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:28px;font-weight:900;letter-spacing:2px;">DELIVERY CHALLAN</div>
              <div style="background:rgba(255,255,255,0.25);display:inline-block;padding:4px 16px;border-radius:99px;font-size:13px;font-weight:700;margin-top:6px;">#${c.challanNumber}</div>
            </div>
          </div>
        </div>


        <!-- Details -->
        <div style="background:#f8fafc;padding:24px 32px;display:flex;gap:40px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;">
          <div style="flex:1;">
            <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#64748b;margin-bottom:12px;">Transport Details</div>
            <table style="font-size:13px;border-collapse:collapse;width:100%;">
              <tr><td style="padding:3px 0;color:#64748b;width:120px;">Vehicle No</td><td style="font-weight:600;">${challan.vehicleNo || '—'}</td></tr>
              <tr><td style="padding:3px 0;color:#64748b;">Transporter</td><td style="font-weight:600;">${challan.transporter || '—'}</td></tr>
              <tr><td style="padding:3px 0;color:#64748b;">Driver Contact</td><td style="font-weight:600;">${challan.driverContact || '—'}</td></tr>
              <tr><td style="padding:3px 0;color:#64748b;">Destination</td><td style="font-weight:600;">${challan.destination || '—'}</td></tr>
            </table>
          </div>
          <div style="flex:1;">
            <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#64748b;margin-bottom:12px;">Dispatch Summary</div>
            <table style="font-size:13px;border-collapse:collapse;width:100%;">
              <tr><td style="padding:3px 0;color:#64748b;width:120px;">Date</td><td style="font-weight:600;">${challan.dispatchDate ? new Date(challan.dispatchDate).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN')}</td></tr>
              <tr><td style="padding:3px 0;color:#64748b;">Total Items</td><td style="font-weight:600;">${challan.lines?.length || 0}</td></tr>
              <tr><td style="padding:3px 0;color:#64748b;">Total Weight</td><td style="font-weight:700;color:#1d4ed8;font-size:15px;">${totalWt} kg</td></tr>
              <tr><td style="padding:3px 0;color:#64748b;">Order</td><td style="font-weight:600;">${salesOrder?.orderNumber || '—'}</td></tr>
            </table>
          </div>
        </div>

        <!-- Items Table -->
        <div style="border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;overflow:hidden;">
          <table style="width:100%;border-collapse:collapse;font-size:13px;">
            <thead>
              <tr style="background:#f1f5f9;">
                <th style="padding:10px 12px;text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#64748b;">#</th>
                <th style="padding:10px 12px;text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#64748b;">Item</th>
                <th style="padding:10px 12px;text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#64748b;">Size</th>
                <th style="padding:10px 12px;text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#64748b;">Quality</th>
                <th style="padding:10px 12px;text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#64748b;">Color</th>
                <th style="padding:10px 12px;text-align:right;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#64748b;">Weight (kg)</th>
              </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
            <tfoot>
              <tr style="background:#eff6ff;">
                <td colspan="5" style="padding:12px;text-align:right;font-weight:700;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#1e40af;">Total</td>
                <td style="padding:12px;text-align:right;font-weight:900;font-size:18px;color:#1d4ed8;font-family:monospace;">${totalWt} kg</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- Signatures -->
        <div style="display:flex;gap:40px;margin-top:32px;padding-top:24px;border-top:1px dashed #cbd5e1;">
          <div style="flex:1;">
            <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;margin-bottom:40px;">Prepared By</div>
            <div style="border-top:1px solid #1e293b;padding-top:6px;font-size:11px;color:#64748b;">Signature &amp; Date</div>
          </div>
          <div style="flex:1;">
            <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;margin-bottom:40px;">Receiver Signature</div>
            <div style="border-top:1px solid #1e293b;padding-top:6px;font-size:11px;color:#64748b;">Customer Signature &amp; Stamp</div>
          </div>
        </div>

        <!-- Footer -->
        <div style="margin-top:24px;padding:12px;background:#f8fafc;border-radius:8px;text-align:center;font-size:10px;color:#94a3b8;">
          Generated by FeatheraFine Dispatch System &nbsp;|&nbsp; ${new Date().toLocaleString('en-IN')}
        </div>
      </div>
    `;

    const opt = {
      margin: 0.4,
      filename: `DeliveryChallan_${c.challanNumber}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    const container = document.createElement('div');
    container.innerHTML = html;
    document.body.appendChild(container);
    html2pdf().set(opt).from(container).save().then(() => {
      document.body.removeChild(container);
    });
  };

  const handleDispatch = async () => {
    try {
      // if (!formData.vehicleNo?.trim()) {
      //   setError('Vehicle Number is required');
      //   return;
      // }
      if (selectedItems.length === 0) {
        setError('Please select at least one item to dispatch');
        return;
      }

      setSubmitting(true);
      setError(null);

      const payload = {
        challanNumber: formData.challanNumber,
        vehicleNo: formData.vehicleNo,
        transporter: formData.transporter,
        driverContact: formData.driverContact,
        destination: formData.destination,
        salesOrderId: salesOrder.id,
        lines: selectedItems
      };

      const response = await apiClient.post('/logistics/challan', payload);
      setChallan(response);

      // Update order and product status to dispatched/confirmed
      if (salesOrder?.id) {
        await apiClient.post(`/sales/${salesOrder.id}/dispatch`);
      }

      // Reset form
      alert('Challan Generated Successfully!\nOrder status updated to confirmed, products to dispatched.');
      setFormData({
        vehicleNo: '',
        transporter: '',
        driverContact: '',
        destination: '',
        challanNumber: `CHL-${Date.now()}`
      });
      setSelectedItems([]);

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err.message || 'Failed to generate challan');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen text-slate-100">
        <Loader text="Loading Order Details..." />
      </div>
    );
  }

  if (!salesOrderId) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-on-surface-variant text-lg font-semibold">No order selected</p>
        <p className="text-on-surface-variant/70 text-sm">Navigate here from a Sales Order to generate a challan.</p>
      </div>
    );
  }

  const totalWeight = selectedItems.reduce((sum, item) => sum + (parseFloat(item.batchweightId) || 0), 0).toFixed(2);

  return (
    <div className="animate-in fade-in duration-300 pt-2 pb-12 w-full min-h-screen">
      <div className="max-w-7xl mx-auto w-full px-4">
        {/* Header */}
        <div className="mb-8 flex justify-between items-end">
          <div>
            {onBack && (
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-secondary hover:text-secondary/80 transition-colors font-semibold mb-4"
              >
                <ArrowLeft size={18} />
                Back to Orders
              </button>
            )}
            {/* <p className="text-[10px] font-semibold uppercase tracking-widest text-secondary mb-1">Logistics Hub</p> */}
            <h1 className="text-3xl font-black text-on-surface uppercase tracking-tight"> Dispatch Challan</h1>
            {salesOrder && (
              <p className="text-xs text-on-surface-variant mt-2">Order: <span className="font-bold">{salesOrder.orderNumber}</span> • {salesOrder.customerName}</p>
            )}
          </div>
          {/* Action Buttons — always visible */}
          <div className="flex items-center gap-3 flex-wrap justify-end">
            <button
              onClick={handleExcelDownload}
              disabled={submitting}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white text-sm font-semibold transition-colors shadow"
            >
              📊 Excel
            </button>
            <button
              onClick={handlePDFDownload}
              disabled={submitting}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-600 disabled:opacity-50 text-white text-sm font-semibold transition-colors shadow"
            >
              📄 PDF
            </button>
            <Button
              variant="primary"
              onClick={handleDispatch}
              disabled={submitting || selectedItems.length === 0}
              className="flex items-center gap-2"
            >
              <Check size={16} />
              {submitting ? 'Generating...' : 'Generate Challan'}
            </Button>
          </div>
        </div>

        {error && <ErrorMessage error={error} />}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Logistics Details */}
          <div className="lg:col-span-2 bg-surface-container border border-outline/30 p-6 rounded-xl shadow">
            <h3 className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-6">Transport Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Challan Number"
                value={formData.challanNumber}
                readOnly
              />

              <Input
                label="Vehicle Number *"
                name="vehicleNo"
                placeholder="e.g. GJ-05-XX-1234"
                value={formData.vehicleNo}
                onChange={handleChange}
              />

              <Input
                label="Transport Company"
                name="transporter"
                placeholder="e.g. XYZ Freight"
                value={formData.transporter}
                onChange={handleChange}
              />

              <Input
                label="Driver Contact"
                name="driverContact"
                placeholder="+91 XXXX XXXX XX"
                value={formData.driverContact}
                onChange={handleChange}
              />

              <Input
                label="Destination"
                name="destination"
                placeholder="City/Location"
                value={formData.destination}
                onChange={handleChange}
                containerClassName="md:col-span-2"
              />
            </div>
          </div>

          {/* Summary */}
          <div className="bg-secondary/10 border border-secondary/30 p-6 rounded-xl flex flex-col justify-between shadow">
            <div>
              <h3 className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-4">Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-outline/20">
                  <span className="text-xs text-on-surface-variant">Selected Items</span>
                  <span className="text-lg font-bold text-on-surface">{selectedItems.length}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-outline/20">
                  <span className="text-xs text-on-surface-variant">Total Weight</span>
                  <span className="text-lg font-bold text-on-surface">{totalWeight} kg</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-on-surface-variant">Vehicle</span>
                  <span className="text-sm font-bold text-on-surface">{formData.vehicleNo || 'Pending'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="bg-surface-container border border-outline/30 rounded-xl overflow-hidden shadow">
          <div className="px-6 py-4 bg-surface-container-highest border-b border-outline/30">

            <h3 className="text-sm font-black text-on-surface uppercase tracking-widest">
              Sales Order Line Items ({selectedItems.length} selected)
              {/* {salesOrder && salesOrder.status !== 'confirmed' && salesOrder.status !== 'PRE-SALE' && ( */}
              {salesOrder && salesOrder.status !== 'confirmed' && (
                <span className="ml-2 px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs rounded-full font-bold uppercase tracking-wider">
                  Dispatch First
                </span>
              )}
            </h3>

          </div>
          <div className="overflow-x-auto">
            {stagedItems.length > 0 ? (
              <table className="w-full text-left">
                <thead className="bg-surface-container-highest border-b border-outline/30">
                  <tr>
                    <th className="px-4 py-3 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest w-12">
                      <input
                        type="checkbox"
                        checked={selectedItems.length === stagedItems.length && stagedItems.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedItems([...stagedItems]);
                          } else {
                            setSelectedItems([]);
                          }
                        }}
                        className="w-4 h-4 cursor-pointer"
                      />
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Item</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Size</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Quality</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Color</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest text-right">Weight (kg)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline/20">
                  {stagedItems.map((item) => {
                    const isSelected = selectedItems.some(si => si.id === item.id);
                    const selectedItem = selectedItems.find(si => si.id === item.id);
                    return (
                      <tr
                        key={item.id}
                        className={`hover:bg-secondary/5 transition-all ${isSelected ? 'bg-secondary/10' : ''}`}
                      >
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleItemSelection(item)}
                            className="w-4 h-4 cursor-pointer"
                          />
                        </td>
                        <td className="px-4 py-4 text-sm font-semibold text-on-surface">
                          {item.item?.name || 'N/A'}
                        </td>
                        <td className="px-4 py-4 text-sm text-on-surface-variant">
                          {item.size?.value || 'N/A'}
                        </td>
                        <td className="px-4 py-4 text-sm text-on-surface-variant">
                          {item.quality?.grade || 'N/A'}
                        </td>
                        <td className="px-4 py-4 text-sm text-on-surface-variant">
                          {item.color?.name || 'N/A'}
                        </td>
                        <td className="px-4 py-4 text-sm font-bold text-right text-on-surface">
                          {isSelected ? (
                            <input
                              type="number"
                              step="0.01"
                              value={selectedItem.batchweightId}
                              onChange={(e) => updateSelectedItem(item.id, 'batchweightId', e.target.value)}
                              className="w-20 bg-surface-container-highest border border-outline text-on-surface px-2 py-1 rounded text-sm focus:border-secondary outline-none text-right"
                            />
                          ) : (
                            `${item.weightId || 0}`
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center">
                <p className="text-on-surface-variant text-sm mb-2">No line items found for this sales order</p>
                <p className="text-on-surface-variant/70 text-xs">Add line items to the sales order before generating a challan</p>
              </div>
            )}
          </div>
        </div>

        {selectedItems.length > 0 && (
          <div className="mt-4 p-4 bg-secondary/10 border border-secondary/30 rounded-xl">
            <p className="text-xs text-on-surface-variant">
              Total items selected: <span className="text-secondary font-bold">{selectedItems.length}</span> •
              Total weight: <span className="text-secondary font-bold">{totalWeight} kg</span>
            </p>
          </div>
        )}

        {challan && (
          <div className="mt-8 p-6 bg-green-900/20 border-2 border-green-500 rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="text-lg font-bold text-green-400 uppercase tracking-wider">✓ Challan Generated!</h3>
                <p className="text-green-300 text-sm font-mono mt-1">#{challan.challanNumber}</p>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <a
                  href={`/challan/delivery/${challan.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-green-500 text-green-300 hover:bg-green-900/40 transition-colors text-sm font-semibold"
                >
                  🖨️ View &amp; Print
                </a>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setChallan(null);
                    setSelectedItems([...stagedItems]);
                    setFormData(prev => ({ ...prev, challanNumber: `CHL-${Date.now()}` }));
                  }}
                >
                  New Challan
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


// export default DispatchChallanGeneration;
//           <h3 className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-4">Transport Protocol</h3>
//           <div className="space-y-4">
//             <Input label="System Challan Sequence" name="challanNumber" value={formData.challanNumber} readOnly />
//             <Input label="Vehicle License Number" name="vehicleNo" placeholder="e.g. GJ-05-XX-1234" value={formData.vehicleNo} onChange={handleChange} />
//             <Input label="Transport Company" name="transporter" placeholder="XYZ Freight" value={formData.transporter} onChange={handleChange} />
//             <Input label="Driver Contact / Badge" name="driverContact" placeholder="+91 XXXX XXXX" value={formData.driverContact} onChange={handleChange} />
//             <Input label="Consignee Location Code" name="destination" placeholder="City Destination Code" value={formData.destination} onChange={handleChange} />
//           </div>
//         </div>

//         <div className="bg-surface-container border border-primary/10 rounded-xl shadow p-6">
//           <h3 className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-4">Batched Items for Dispatch</h3>
//           {loading ? (
//              <div className="mt-8"><Loader text="Negotiating Transport Pipeline..." /></div>
//           ) : (
//           <div className="p-8 border border-dashed border-secondary/30 rounded-lg text-center bg-secondary/5 mt-4">
//             <p className="text-sm font-bold text-secondary mb-2">No active batches drafted!</p>
//             <p className="text-xs text-slate-400">Please queue batches via the Pre-Dispatch Staging table to assign them to a transport vehicle.</p>
//           </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

export default DispatchChallanGeneration;
