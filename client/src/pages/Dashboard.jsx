import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import Badge from '../components/common/Badge';
import { CardSkeleton } from '../components/common/Skeleton';
import EmptyState from '../components/common/EmptyState';
import { getDashboardStats } from '../services/dashboardService';
import { formatCurrency, formatDate } from '../utils/formatters';
import {
  FileText,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowUpRight,
  Eye,
  Building2,
  Clock
} from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getDashboardStats();
      if (res.success) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('[Dashboard Error]', err);
      setError('Unable to load dashboard metrics. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <AppLayout>
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Executive Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time business performance overview & invoicing metrics
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to="/clients"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-xl border border-slate-700/60 transition-colors"
          >
            <Building2 className="w-4 h-4 text-slate-400" />
            <span>Manage Clients</span>
          </Link>
          <Link
            to="/invoices/new"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium rounded-xl shadow-md shadow-brand-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Invoice</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/15 border border-rose-500/30 text-rose-300 rounded-xl flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchStats} className="text-xs font-semibold underline hover:text-rose-100">
            Try Again
          </button>
        </div>
      )}

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : (
          <>
            {/* Card 1: Total Invoices */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Invoices</span>
                <div className="p-2.5 bg-brand-500/10 text-brand-400 rounded-xl border border-brand-500/20">
                  <FileText className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-3xl font-extrabold text-white tracking-tight">{stats?.totalInvoices || 0}</div>
                <p className="text-xs text-slate-400 mt-1 flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-1 text-slate-500" />
                  Across all active clients
                </p>
              </div>
            </div>

            {/* Card 2: Total Billed */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Billed</span>
                <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-3xl font-extrabold text-white tracking-tight">
                  {formatCurrency(stats?.totalBilled || 0)}
                </div>
                <p className="text-xs text-slate-400 mt-1 flex items-center">
                  Gross invoice volume issued
                </p>
              </div>
            </div>

            {/* Card 3: Total Paid */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Paid</span>
                <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-3xl font-extrabold text-emerald-400 tracking-tight">
                  {formatCurrency(stats?.totalPaid || 0)}
                </div>
                <p className="text-xs text-emerald-500/80 mt-1 flex items-center">
                  Received revenue
                </p>
              </div>
            </div>

            {/* Card 4: Outstanding Amount */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Outstanding</span>
                <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
                  <AlertCircle className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-3xl font-extrabold text-amber-400 tracking-tight">
                  {formatCurrency(stats?.outstandingAmount || 0)}
                </div>
                <p className="text-xs text-amber-500/80 mt-1 flex items-center">
                  Unpaid & Overdue total
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Invoice Status Distribution Bar */}
      {!loading && stats?.counts && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-200">Invoice Portfolio Status Distribution</h3>
            <span className="text-xs text-slate-400">{stats.totalInvoices} Total Invoices</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/40">
              <span className="text-xs text-slate-400 block mb-1">Paid</span>
              <span className="text-lg font-bold text-emerald-400">{stats.counts.paid}</span>
            </div>
            <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/40">
              <span className="text-xs text-slate-400 block mb-1">Unpaid</span>
              <span className="text-lg font-bold text-amber-400">{stats.counts.unpaid}</span>
            </div>
            <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/40">
              <span className="text-xs text-slate-400 block mb-1">Overdue</span>
              <span className="text-lg font-bold text-rose-400">{stats.counts.overdue}</span>
            </div>
            <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/40">
              <span className="text-xs text-slate-400 block mb-1">Draft</span>
              <span className="text-lg font-bold text-slate-400">{stats.counts.draft}</span>
            </div>
          </div>
        </div>
      )}

      {/* Recent Invoices Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-100">Recent Invoices</h2>
            <p className="text-xs text-slate-400">Latest active billing records</p>
          </div>
          <Link
            to="/invoices"
            className="inline-flex items-center space-x-1 text-xs font-semibold text-brand-400 hover:text-brand-300"
          >
            <span>View All Invoices</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            <div className="h-10 bg-slate-800/40 animate-pulse rounded-lg" />
            <div className="h-10 bg-slate-800/40 animate-pulse rounded-lg" />
            <div className="h-10 bg-slate-800/40 animate-pulse rounded-lg" />
          </div>
        ) : !stats?.recentInvoices || stats.recentInvoices.length === 0 ? (
          <EmptyState
            title="No Invoices Issued Yet"
            description="Start by adding a client and creating your first business invoice."
            actionText="+ Create First Invoice"
            onAction={() => (window.location.href = '/invoices/new')}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/60 text-xs uppercase text-slate-400 font-semibold">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg">Invoice Number</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Due Date</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right rounded-r-lg">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {stats.recentInvoices.map((inv) => (
                  <tr key={inv._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 font-mono font-medium text-brand-400">{inv.invoiceNumber}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-200">{inv.client?.companyName || 'N/A'}</div>
                      <div className="text-xs text-slate-500">{inv.client?.name || ''}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">{formatDate(inv.dueDate)}</td>
                    <td className="px-4 py-3 font-semibold text-slate-100">{formatCurrency(inv.grandTotal)}</td>
                    <td className="px-4 py-3">
                      <Badge status={inv.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/invoices/${inv._id}`}
                        className="inline-flex items-center space-x-1 p-1.5 text-slate-400 hover:text-brand-400 hover:bg-slate-800 rounded-lg transition-colors"
                        title="View Invoice"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Dashboard;
