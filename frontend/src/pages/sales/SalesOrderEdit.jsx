import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Pencil, FileText, Eye, Plus, Trash2 } from 'lucide-react';
import apiClient from '../../utils/apiClient';
import Loader from '../../components/ui/Loader';
import ErrorMessage from '../../components/ui/ErrorMessage';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';

const SalesOrderEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // State for the list view
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for the edit view
  const [order, setOrder] = useState(null);
  const [lineItems, setLineItems] = useState([]);
  const [masterData, setMasterData] = useState({ items: [], colors: [], sizes: [], qualities: [] });
  const [loadingEdit, setLoadingEdit] = useState(true);
  const [errorEdit, setErrorEdit] = useState(null);


  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    if (!id) {
      // List View Logic
      setLoading(true);
      apiClient.get('/sales')
        .then(response => {
          // Handle both response formats
          const responseData = response.success ?? response.data?.success;
          const ordersData = response.orders || response.data?.orders || [];
          
          if (responseData) {
            setOrders(ordersData);
          } else {
            setError('Failed to fetch sales orders.');
          }
        })
        .catch(err => setError(err.message || 'An error occurred.'))
        .finally(() => setLoading(false));
    } else {
      // Edit View Logic
      setLoadingEdit(true);
      Promise.all([
        apiClient.get('/master/all'),
        apiClient.get(`/sales/${id}`)
      ]).then(([masterDataRes, orderRes]) => {
        // Handle master data
        const masterDataToUse = masterDataRes.data || masterDataRes;
        if (!masterDataToUse.items) {
          throw new Error('Failed to fetch master data.');
        }
        setMasterData({
          items: masterDataToUse.items || [],
          qualities: masterDataToUse.qualities || [],
          sizes: masterDataToUse.sizes || [],
          colors: masterDataToUse.colors || []
        });

        // Handle order data
        const orderResponseData = orderRes.success ?? true;
        const fetchedOrder = orderRes.order || orderRes.data?.order;
        
        if (orderResponseData && fetchedOrder) {
          setOrder(fetchedOrder);
          setLineItems((fetchedOrder.lineItems || []).map(item => ({ ...item, tempId: Math.random() })));
        } else {
          throw new Error('Failed to fetch sales order details.');
        }
      }).catch(err => {
        setErrorEdit(err.message || 'An error occurred.');
        console.error(err);
      }).finally(() => {
        setLoadingEdit(false);
      });
    }
  }, [id]);

  const handleRowClick = (orderId) => {
    navigate(`/sales/edit/${orderId}`);
  };

  const handleFieldChange = (field, value) => {
    setOrder(prev => ({ ...prev, [field]: value }));
  };
  
  const updateLineItem = (tempId, field, value) => {
    setLineItems(items => items.map(item => item.tempId === tempId ? { ...item, [field]: value } : item));
  };

  const addLineItem = () => {
    setLineItems(items => [...items, { tempId: Math.random(), itemId: '', sizeId: '', qualityId: '', colorId: '', weightKg: 0, lengthMeter: 0 }]);
  };

  const removeLineItem = (tempId) => {
    setLineItems(items => items.filter(item => item.tempId !== tempId));
  };

  const handleUpdateOrder = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    // Prepare payload, removing temporary IDs
    const payload = {
      ...order,
      lineItems: lineItems.map(({ tempId, ...item }) => item)
    };

    try {
      const response = await apiClient.put(`/sales/${id}`, payload);
      if (response.data.success) {
        alert('Order updated successfully!');
        navigate('/sales/edit');
      } else {
        throw new Error(response.data.error || 'Failed to update order.');
      }
    } catch (err) {
      setSubmitError(err.message || 'An error occurred during submission.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // RENDER LIST VIEW
  if (!id) {
    if (loading) return <Loader>Loading Sales Orders...</Loader>;
    if (error) return <ErrorMessage title="Error" message={error} />;

    return (
      <div className="animate-in fade-in">
        <div className="flex items-center justify-between border-b border-primary/20 pb-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FileText className="text-secondary" /> All Sales Orders
            </h2>
            <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Select an order to view or edit</p>
          </div>
        </div>
        
        <div className="overflow-x-auto bg-[#13181f] border border-outline/20 rounded-lg">
          <table className="min-w-full text-sm text-left text-slate-400">
            <thead className="bg-primary/10 text-xs text-slate-500 uppercase tracking-wider">
              <tr>
                <th scope="col" className="px-6 py-3">Order #</th>
                <th scope="col" className="px-6 py-3">Customer</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3">Items</th>
                <th scope="col" className="px-6 py-3">Created</th>
                <th scope="col" className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id} className="border-b border-outline/20 hover:bg-primary/5 cursor-pointer" onClick={() => handleRowClick(order.id)}>
                  <th scope="row" className="px-6 py-4 font-medium text-white whitespace-nowrap">
                    {order.orderNumber}
                  </th>
                  <td className="px-6 py-4">{order.customerName}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      order.status === 'COMPLETED' ? 'bg-green-500/10 text-green-400' :
                      order.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-400' :
                      'bg-slate-500/10 text-slate-400'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">{order.lineItems.length}</td>
                  <td className="px-6 py-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleRowClick(order.id); }}>
                      <Eye size={16} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // RENDER EDIT VIEW
  if (loadingEdit) return <Loader>Loading Order Details...</Loader>;
  if (errorEdit) return <ErrorMessage title="Error Loading Order" message={errorEdit} />;
  if (!order) return <ErrorMessage title="Not Found" message={`Sales order with ID ${id} could not be found.`} />;

  const totalWeight = lineItems.reduce((acc, curr) => acc + Number(curr.weightKg || 0), 0).toFixed(2);

  return (
    <div className="animate-in fade-in space-y-6 pb-12">
      <div className="flex items-center justify-between border-b border-primary/20 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Pencil className="text-secondary" /> Edit Sales Order: <span className="text-secondary font-mono">{order.orderNumber}</span>
          </h2>
          <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Modify unprocessed order forms</p>
        </div>
        <Button onClick={handleUpdateOrder} disabled={isSubmitting}>
          {isSubmitting ? 'Updating...' : 'Update Order'}
        </Button>
      </div>

      {submitError && <ErrorMessage title="Update Failed" message={submitError} />}

      {/* Main Order Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4 p-6 bg-[#13181f] border border-outline/20 rounded-lg">
          <Input
            label="Customer Name"
            value={order.customerName}
            onChange={(e) => handleFieldChange('customerName', e.target.value)}
          />
          <Select
            label="Order Status"
            value={order.status}
            onChange={(e) => handleFieldChange('status', e.target.value)}
          >
            <option value="DRAFT">Draft</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </Select>
          <Input
            label="Expected Delivery Date"
            type="date"
            value={order.expectedDate ? new Date(order.expectedDate).toISOString().split('T')[0] : ''}
            onChange={(e) => handleFieldChange('expectedDate', e.target.value)}
          />
        </div>
        <div className="p-6 bg-[#13181f] border border-outline/20 rounded-lg">
           <h3 className="text-sm font-bold text-slate-300 mb-4">Summary</h3>
           <div className="space-y-3">
             <div className="flex justify-between items-center text-sm">
               <span className="text-slate-400">Total Items</span>
               <span className="font-bold text-white">{lineItems.length}</span>
             </div>
             <div className="flex justify-between items-center text-sm">
               <span className="text-slate-400">Total Weight</span>
               <span className="font-bold text-white">{totalWeight} kg</span>
             </div>
           </div>
        </div>
      </div>
      
      {/* Line Items Table */}
      <div className="bg-[#13181f] border border-outline/20 rounded-lg">
        <div className="flex items-center justify-between p-4 border-b border-outline/20">
          <h3 className="text-md font-bold text-slate-200">Line Items</h3>
          <Button variant="secondary" size="sm" onClick={addLineItem}><Plus size={16} className="mr-2" /> Add Item</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-xs text-slate-500 uppercase">
              <tr>
                <th className="px-4 py-2">Item</th>
                <th className="px-4 py-2">Size</th>
                <th className="px-4 py-2">Quality</th>
                <th className="px-4 py-2">Weight (kg)</th>
                <th className="px-4 py-2">Length (m)</th>
                <th className="px-4 py-2">Color</th>
                <th className="px-4 py-2">Sec. Color</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline/10">
              {lineItems.map(item => (
                <tr key={item.tempId}>
                  <td className="p-2"><Select value={item.itemId} onChange={e => updateLineItem(item.tempId, 'itemId', e.target.value)}><option value="">-</option>{masterData.items.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</Select></td>
                  <td className="p-2"><Select value={item.sizeId} onChange={e => updateLineItem(item.tempId, 'sizeId', e.target.value)}><option value="">-</option>{masterData.sizes.map(m => <option key={m.id} value={m.id}>{m.value}</option>)}</Select></td>
                  <td className="p-2"><Select value={item.qualityId} onChange={e => updateLineItem(item.tempId, 'qualityId', e.target.value)}><option value="">-</option>{masterData.qualities.map(m => <option key={m.id} value={m.id}>{m.grade}</option>)}</Select></td>
                  <td className="p-2"><Input type="number" value={item.weightKg} onChange={e => updateLineItem(item.tempId, 'weightKg', e.target.value)} /></td>
                  <td className="p-2"><Input type="number" value={item.lengthMeter || ''} onChange={e => updateLineItem(item.tempId, 'lengthMeter', e.target.value)} /></td>
                  <td className="p-2"><Select value={item.colorId} onChange={e => updateLineItem(item.tempId, 'colorId', e.target.value)}><option value="">-</option>{masterData.colors.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</Select></td>
                  <td className="p-2"><Select value={item.secondaryColorId || ''} onChange={e => updateLineItem(item.tempId, 'secondaryColorId', e.target.value)}><option value="">-</option>{masterData.colors.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</Select></td>
                  <td className="p-2 text-right"><Button variant="ghost" size="icon" onClick={() => removeLineItem(item.tempId)}><Trash2 size={16} className="text-red-500" /></Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Notes */}
      <div>
        <label htmlFor="internalNotes" className="block text-sm font-medium text-slate-300 mb-2">Internal Notes</label>
        <textarea
          id="internalNotes"
          rows="4"
          className="w-full bg-[#0d1117] border border-outline/20 rounded-md p-2 text-slate-300 focus:ring-secondary focus:border-secondary"
          value={order.internalNotes || ''}
          onChange={(e) => handleFieldChange('internalNotes', e.target.value)}
        ></textarea>
      </div>

    </div>
  );
};

export default SalesOrderEdit;
