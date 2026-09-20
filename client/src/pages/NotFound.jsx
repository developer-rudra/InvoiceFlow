import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
      <div className="p-4 bg-slate-900 border border-slate-800 text-brand-400 rounded-full mb-4 shadow-xl">
        <FileQuestion className="w-12 h-12" />
      </div>
      <h1 className="text-4xl font-extrabold text-white tracking-tight">404 — Page Not Found</h1>
      <p className="mt-2 text-slate-400 max-w-md text-sm">
        The requested page could not be located. It may have been moved or removed.
      </p>
      <Link
        to="/dashboard"
        className="mt-6 inline-flex items-center space-x-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-medium rounded-xl shadow-lg shadow-brand-600/20 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Dashboard</span>
      </Link>
    </div>
  );
};

export default NotFound;
