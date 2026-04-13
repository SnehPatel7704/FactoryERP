import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Pencil, FileText, Eye, Plus, Trash2, X, Save } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import apiClient from '../../utils/apiClient';
import Loader from '../../components/ui/Loader';
import ErrorMessage from '../../components/ui/ErrorMessage';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';

const SalesOrderEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const isEditing = !!id;

  // API hooks
  const { data: masterData, loading: masterLoading, error: masterError, execute: loadMaster } = useApi('/master/all', {}, { items: [], colors: [], sizes: [], qualities: [] });
  const { loading: submitting, error: submitError, execute: executeSubmit } = useApi('', {}, null);

  // States for edit/single order view
  const [orderNumber, setOrderNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [status, setStatus] = useState('draft');
  const [bags, setBags] = useState('');
  const [notes, setNotes] = useState('');
  const [scannedEntries, setScannedEntries] = useState([]);
  const [skuInput, setSkuInput] = useState('');

  // List view states
  const [orders, setOrders] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [errorList, setErrorList] = useState(null);

  useEffect(() => {
    if (isEditing) {
      loadMaster();
    } else {
      loadOrdersList();
    }
  }, [isEditing]);

  const loadOrdersList = async () => {
    try {
      setLoadingList(true);
      const response = await apiClient.get('/sales');
      setOrders(response.orders || response.data?.orders || []);
    } catch (err) {
      setErrorList(err.message);
    } finally {
      setLoadingList(false);
    }
  };

  // Prefill for editing
  useEffect(() => {
    if (isEditing && masterData && id) {
      loadOrderDetails();
    }
  }, [isEditing, id, masterData]);

  const loadOrderDetails = async () => {
    try {
      const orderRes = await apiClient.get(`/sales/${id}`);
      const order = orderRes.order || orderRes.data?.order;
      if (order) {
        setOrderNumber(order.orderNumber || `ORD-${new Date().getFullYear()}-${Math.floor(Math.random() * 8999) + 1000}`);
        setCustomerName(order.customerName || '');
        setStatus(order.status || 'draft');
        setBags(order.bags?.toString() || '');
        setNotes(order.internalNotes || '');
        // Load scanned production entries
        if (order.productionEntries) {
          setScannedEntries(order.productionEntries);
        }
      }
    } catch (err) {
      console.error('Load order error:', err);
    }
  };

  const handleAddSku = async () => {
    if (!skuInput.trim()) return;
    try {
      const entry = await apiClient.get(`/inventory/production/sku/${encodeURIComponent(skuInput.trim())}`);
      if (entry.status !== 'staged') {
        alert(`SKU is ${entry.status}. Stage first.`);
        return;
      }
      if (scannedEntries.some(e => e.id === entry.id)) {
        alert('SKU already added.');
        return;
      }
      setScannedEntries([...scannedEntries, entry]);
      setSkuInput('');
      // Auto calc bags
      const calculatedBags = scannedEntries.reduce((acc, curr) => acc + (curr.bagsCount || 1), 0) + 1;
      setBags(calculatedBags.toString());
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message));
    }
  };

  const removeScannedEntry = (entryId) => {
    setScannedEntries(scannedEntries.filter(item => item.id !== entryId));
  };

  const handleGenerateOrder = async () => {
    const payload = {
      orderNumber,
      customerName,
      status,
      bags: parseInt(bags) || 0,
      internalNotes: notes,
      productionEntryIds: scannedEntries.filter(e => e.id).map(e => e.id),
    };

    const endpoint = `/sales/${id || 'new'}`;
    const method = id ? 'PUT' : 'POST';

    const { error: reqError } = await executeSubmit(endpoint, {
      method,
      body: JSON.stringify(payload)
    });

    if (!reqError) {
      alert(id ? 'Order Updated!' : 'Order Generated!');
      if (id) {
        loadOrderDetails();
      } else {
        navigate('/sales/edit');
      }
    }
  };

  const handleRowClick = (orderId) => {
    navigate(`/sales/edit/${orderId}`);
  };

  const totalWeight = scannedEntries.reduce((acc, curr) => acc + Number(curr.weightId || 0), 0).toFixed(2);

  // List View
  if (!isEditing) {
    if (loadingList) return <Loader text="Loading Orders..." />;
    if (errorList) return <ErrorMessage error={errorList} />;

    return (
      <div>
        <h2>Sales Orders List</h2>
        <table>
          {/* Existing list table code */}
          <tbody>
            {orders.map(order => (
              <tr key={order.id} onClick={() => handleRowClick(order.id)}>
                <td>{order.orderNumber}</td>
                <td>{order.customerName}</td>
                <td>{order.status}</td>
                <td>{order.lineItems?.length || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Edit View
  if (masterLoading) return <Loader text="Loading..." />;
  if (masterError) return <ErrorMessage error={masterError} />;

  return (
    <div className="animate-in fade-in pt-2 pb-12 min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8 flex justify-between">
          <h1>{isEditing ? 'Edit Order' : 'New Order'}</h1>
          <Button onClick={handleGenerateOrder} disabled={submitting}>
            {submitting ? 'Saving...' : 'Save Order'}
          </Button>
        </div>

        {submitError && <ErrorMessage error={submitError} />}

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <Input label="Order Number" value={orderNumber} readOnly />
              <Input label="Customer" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
              <Input label="No. of Bags *" type="number" value={bags} onChange={(e) => setBags(e.target.value)} />
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="p-3 border rounded">
                <option value="draft">Draft</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
              </select>
            </div>

            <div className="mb-6">
              <div className="flex gap-2 mb-2">
                <input
                  placeholder="Scan SKU..."
                  value={skuInput}
                  onChange={(e) => setSkuInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSku()}
                  className="flex-1 p-3 border rounded font-mono"
                />
                <Button onClick={handleAddSku}>Add SKU</Button>
              </div>
              <table className="w-full border-collapse">
                <thead>
                  <tr><th>SKU</th><th>Item</th><th>Bags</th><th>Weight</th><th></th></tr>
                </thead>
                <tbody>
                  {scannedEntries.map(item => (
                    <tr key={item.id}>
                      <td>{item.sku}</td>
                      <td>{item.item?.name}</td>
                      <td>{item.bagsCount}</td>
                      <td>{item.weightId}</td>
                      <td><Button variant="ghost" onClick={() => removeScannedEntry(item.id)}><Trash2 size={16} /></Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <textarea
              label="Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 border rounded h-24"
              placeholder="Internal notes..."
            />
          </div>
          <div>
            <h3>Summary</h3>
            <div>Items: {scannedEntries.length}</div>
            <div>Weight: {totalWeight} kg</div>
            <div>Bags: {bags || 0}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesOrderEdit;

