import React from 'react';

// Utility for rendering status badges with consistent styling

export const getStatusColor = (status) => {
  switch (status) {
    case 'created':
      return { bg: 'bg-green-500/20', border: 'border-green-500/40', text: 'text-green-400', icon: '●' };
    case 'staged':
      return { bg: 'bg-blue-500/20', border: 'border-blue-500/40', text: 'text-blue-400', icon: '●' };
    case 'dispatched':
      return { bg: 'bg-purple-500/20', border: 'border-purple-500/40', text: 'text-purple-400', icon: '●' };
    case 'returned':
      return { bg: 'bg-red-500/20', border: 'border-red-500/40', text: 'text-red-400', icon: '●' };
    case 'pre-sale':
      return { bg: 'bg-orange-500/20', border: 'border-orange-500/40', text: 'text-orange-400', icon: '●' };
    case 'draft':
      return { bg: 'bg-slate-500/20', border: 'border-slate-500/40', text: 'text-slate-400', icon: '✎' };
    case 'pending':
      return { bg: 'bg-yellow-500/20', border: 'border-yellow-500/40', text: 'text-yellow-400', icon: '⏳' };
    case 'confirmed':
      return { bg: 'bg-emerald-500/20', border: 'border-emerald-500/40', text: 'text-emerald-400', icon: '✓' };
    case 'completed':
    case 'delivered':
      return { bg: 'bg-cyan-500/20', border: 'border-cyan-500/40', text: 'text-cyan-400', icon: '★' };
    default:
      return { bg: 'bg-slate-500/20', border: 'border-slate-500/40', text: 'text-slate-400', icon: '?' };
  }
};

export const getStatusLabel = (status) => {
  const labels = {
    'created': 'CREATED',
    'staged': 'STAGED',
    'dispatched': 'DISPATCHED',
    'returned': 'RETURNED',
    'pre-sale': 'PRE-SALE',
    'draft': 'DRAFT',
    'pending': 'PENDING',
    'confirmed': 'CONFIRMED',
    'completed': 'COMPLETED',
    'delivered': 'DELIVERED'
  };
  return labels[status] || 'UNKNOWN';
};

export const getStatusDescription = (status) => {
  const descriptions = {
    'created': 'Entry created, awaiting staging',
    'staged': 'Staged for dispatch',
    'dispatched': 'Dispatched successfully',
    'returned': 'Item returned to production',
    'pre-sale': 'Assigned to order, awaiting dispatch',
    'draft': 'Order drafted, awaiting confirmation',
    'pending': 'Pending processing',
    'confirmed': 'Confirmed and in progress',
    'completed': 'Fully completed',
    'delivered': 'Successfully delivered to destination'
  };
  return descriptions[status] || 'Unknown status';
};

// React component version - use this in JSX
export const StatusBadge = ({ status, className = 'text-xs' }) => {
  const colors = getStatusColor(status);
  const label = getStatusLabel(status);
  
  return (
    <span className={`inline-flex items-center ${colors.bg} ${colors.text} px-3 py-1 rounded-full ${className} font-bold border ${colors.border}`}>
      <span className="mr-1">{colors.icon}</span>
      {label}
    </span>
  );
};

// Legacy HTML string version - deprecated, use StatusBadge component instead
export const renderStatusBadge = (status, className = 'text-xs', inline = true) => {
  const colors = getStatusColor(status);
  const label = getStatusLabel(status);
  
  return `<span class="${inline ? 'inline-flex items-center' : ''} ${colors.bg} ${colors.text} px-3 py-1 rounded-full ${className} font-bold border ${colors.border}">
    ${colors.icon} ${label}
  </span>`;
};
