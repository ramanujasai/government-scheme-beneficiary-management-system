import React from 'react';

const statusColors = {
  Submitted: 'text-blue-300',
  'Under Review': 'text-amber-300',
  Approved: 'text-emerald-300',
  Rejected: 'text-red-300',
  Disbursed: 'text-blue-300'
};

export const StatusBadge = ({ status }) => (
  <span className={`whitespace-nowrap text-xs ${statusColors[status] || 'text-slate-300'}`}>
    {status || 'Unknown'}
  </span>
);
