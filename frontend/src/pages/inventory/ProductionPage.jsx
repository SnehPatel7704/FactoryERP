import React, { useState, useEffect } from 'react';
import ProductionList from './ProductionList';
import ProductionEntryForm from './ProductionEntryForm';

/**
 * ProductionPage - Main orchestrator component
 * 
 * FLOW:
 * 1. Display ProductionList (view all entries with filters, default today)
 * 2. User clicks "ADD ENTRY" → Show ProductionEntryForm in add mode
 * 3. User clicks list row or "Edit" button (admin only) → Show ProductionEntryForm in edit mode
 * 4. Form submission → Refresh list and close form
 * 5. Can navigate between list and form views
 */
const ProductionPage = () => {
  const [view, setView] = useState('list'); // 'list' or 'form'
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Check admin role from localStorage user object
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : {};
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  // Handle add new entry
  const handleAddNew = () => {
    setSelectedEntry(null); // Clear selected entry for new form
    setView('form');
  };

  // Handle edit entry (only admin can access)
  const handleEditEntry = (entry) => {
    if (!isAdmin) {
      alert('Only administrators can edit production entries');
      return;
    }
    setSelectedEntry(entry);
    setView('form');
  };

  // Handle form close/cancel
  const handleCloseForm = () => {
    setSelectedEntry(null);
    setView('list');
  };

  // Handle successful form submission
  const handleFormSuccess = () => {
    // Trigger list refresh
    setRefreshTrigger(prev => prev + 1);
    setSelectedEntry(null);
    setView('list');
  };

  return (
    <>
      {view === 'list' ? (
        <ProductionList
          key={refreshTrigger}
          onAddNew={handleAddNew}
          onEditEntry={handleEditEntry}
        />
      ) : (
        <ProductionEntryForm
          entry={selectedEntry}
          onClose={handleCloseForm}
          onSuccess={handleFormSuccess}
        />
      )}
    </>
  );
};

export default ProductionPage;
