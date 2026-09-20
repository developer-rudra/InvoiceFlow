import React from 'react';
import { FileQuestion } from 'lucide-react';

const EmptyState = ({
  icon: Icon = FileQuestion,
  title = 'No records found',
  description = 'There are no items matching your criteria at this moment.',
  actionText,
  onAction
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-12 bg-slate-800/20 border border-dashed border-slate-700/60 rounded-xl my-4">
      <div className="p-4 bg-slate-800/80 text-brand-400 rounded-full mb-4 shadow-inner">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-semibold text-slate-100 mb-1">{title}</h3>
      <p className="text-sm text-slate-400 max-w-sm mb-6">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-500 rounded-lg transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
