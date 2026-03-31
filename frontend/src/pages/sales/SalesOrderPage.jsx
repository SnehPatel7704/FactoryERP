import React, { useState, useEffect } from 'react';
import SalesOrderList from './SalesOrderList';
import SalesOrderEntry from './SalesOrderEntry';

/**
 * SalesOrderPage - Main orchestrator component
 * 
 * FLOW:
 * 1. Display SalesOrderList (view all orders with filters)
 * 2. User clicks "ADD ORDER" → Show SalesOrderEntry in add mode
 * 3. User clicks row or "Edit" button (admin only) → Show SalesOrderEntry in edit mode
 * 4. Form submission → Refresh list and close form
 * 5. Can navigate between list and form views
 */
const SalesOrderPage = () => {
  const [view, setView] = useState('list'); // 'list' or 'form'
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Check admin role from localStorage user object
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : {};
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  // Handle add new order
  const handleAddNew = () => {
    setSelectedOrder(null); // Clear selected order for new form
    setView('form');
  };

  // Handle edit order (only admin can access)
  const handleEditOrder = (order) => {
    if (!isAdmin) {
      alert('Only administrators can edit sales orders');
      return;
    }
    setSelectedOrder(order);
    setView('form');
  };

  // Handle form close/cancel
  const handleCloseForm = () => {
    setSelectedOrder(null);
    setView('list');
  };

  // Handle successful form submission
  const handleFormSuccess = () => {
    // Trigger list refresh
    setRefreshTrigger(prev => prev + 1);
    setSelectedOrder(null);
    setView('list');
  };

  return (
    <>
      {view === 'list' ? (
        <SalesOrderList
          key={refreshTrigger}
          onAddNew={handleAddNew}
          onEditOrder={handleEditOrder}
        />
      ) : (
        <SalesOrderEntry
          order={selectedOrder}
          onClose={handleCloseForm}
          onSuccess={handleFormSuccess}
        />
      )}
    </>
  );
};

export default SalesOrderPage;
