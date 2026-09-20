import React from 'react';

const Badge = ({ status = 'Unpaid', className = '' }) => {
  const getBadgeStyle = (statusName) => {
    switch (statusName) {
      case 'Paid':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'Overdue':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      case 'Unpaid':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'Draft':
        return 'bg-slate-500/15 text-slate-400 border-slate-500/30';
      default:
        return 'bg-slate-500/15 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getBadgeStyle(
        status
      )} ${className}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
          status === 'Paid'
            ? 'bg-emerald-400'
            : status === 'Overdue'
            ? 'bg-rose-400 animate-pulse'
            : status === 'Unpaid'
            ? 'bg-amber-400'
            : 'bg-slate-400'
        }`}
      />
      {status}
    </span>
  );
};

export default Badge;
