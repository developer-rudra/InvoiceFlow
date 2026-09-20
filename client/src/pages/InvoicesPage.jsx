import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import EmptyState from '../components/common/EmptyState';
import { TableSkeleton } from '../components/common/Skeleton';
import { getInvoices, deleteInvoice } from '../services/invoiceService';
import { getClients } from '../services/clientService';
import { formatCurrency, formatDate } from '../utils/formatters';
import { exportInvoicesToCSV } from '../utils/csvExport';
import {
  FileText,
  Search,
  Plus,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Download,
  Calendar,
  Building,
  Loader2,
  X
} from 'lucide-react';

const InvoicesPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [clientFilter, setClientFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Delete modal state
  const [deletingInvoice, setDeletingInvoice] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await getInvoices({
        search,
        status: statusFilter,
        clientId: clientFilter,
        from: fromDate,
        to: toDate
      });
      if (res.success) {
        setInvoices(res.data);
      }
    } catch (err) {
      console.error('[Invoices Fetch Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch clients list for filter dropdown once
    const fetchClientOptions = async () => {
      try {
        const res = await getClients();
        if (res.success) setClients(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchClientOptions();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInvoices();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter, clientFilter, fromDate, toDate]);

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setClientFilter('');
    setFromDate('');
    setToDate('');
  };

  const handleExportCSV = () => {
    exportInvoicesToCSV(invoices, `InvoiceFlow_Export_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleDeleteInvoice = async () => {
    if (!deletingInvoice) return;
    setIsDeleting(true);
    try {
      const res = await deleteInvoice(deletingInvoice._id);
      if (res.success) {
        setDeletingInvoice(null);
        fetchInvoices();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const hasActiveFilters = search || statusFilter || clientFilter || fromDate || toDate;

  return (
    <AppLayout>
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Invoice Center</h1>
          <p className="text-sm text-slate-400 mt-1">Manage, filter & track all business invoices</p>
        </div>
        <div className="flex items-center space-x-3 self-start md:self-auto">
          {invoices.length > 0 && (
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-xl border border-slate-700/60 transition-colors"
              title="Export filtered invoices to CSV"
            >
              <Download className="w-4 h-4 text-brand-400" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
          )}
          <Link
            to="/invoices/new"
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium rounded-xl shadow-md shadow-brand-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Invoice</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search bar */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by invoice number or client..."
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          {/* Status filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-brand-500"
            >
              <option value="">All Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Unpaid">Unpaid</option>
              <option value="Overdue">Overdue</option>
              <option value="Draft">Draft</option>
            </select>
          </div>

          {/* Client filter */}
          <div>
            <select
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-brand-500"
            >
              <option value="">All Clients</option>
              {clients.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.companyName} ({c.name})
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <div className="flex items-center">
              <button
                onClick={clearFilters}
                className="w-full flex items-center justify-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl border border-slate-700 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            </div>
          )}
        </div>

        {/* Date range inputs expandable */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-800/80 text-xs text-slate-400">
          <span className="font-semibold text-slate-300 flex items-center">
            <Calendar className="w-3.5 h-3.5 mr-1 text-slate-500" /> Date Range:
          </span>
          <div className="flex items-center space-x-2">
            <span>From:</span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="bg-slate-800/80 border border-slate-700/80 rounded-lg px-2 py-1 text-xs text-slate-100 focus:outline-none focus:border-brand-500"
            />
          </div>
          <div className="flex items-center space-x-2">
            <span>To:</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="bg-slate-800/80 border border-slate-700/80 rounded-lg px-2 py-1 text-xs text-slate-100 focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>
      </div>

      {/* Invoice Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        {loading ? (
          <TableSkeleton rows={6} cols={6} />
        ) : invoices.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No Invoices Found"
            description={
              hasActiveFilters
                ? 'No invoices match your current search and filter settings.'
                : 'Create your first invoice to bill clients.'
            }
            actionText={hasActiveFilters ? 'Clear Filters' : '+ Create Invoice'}
            onAction={hasActiveFilters ? clearFilters : () => (window.location.href = '/invoices/new')}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/60 text-xs uppercase text-slate-400 font-semibold">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg">Invoice Number</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Issue Date</th>
                  <th className="px-4 py-3">Due Date</th>
                  <th className="px-4 py-3">Grand Total</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right rounded-r-lg">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {invoices.map((inv) => (
                  <tr key={inv._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3.5 font-mono font-semibold text-brand-400">
                      <Link to={`/invoices/${inv._id}`} className="hover:underline">
                        {inv.invoiceNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-100">{inv.client?.companyName || 'N/A'}</div>
                      <div className="text-xs text-slate-400">{inv.client?.name || ''}</div>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-300">{formatDate(inv.issueDate)}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-300">{formatDate(inv.dueDate)}</td>
                    <td className="px-4 py-3.5 font-bold text-slate-100">{formatCurrency(inv.grandTotal)}</td>
                    <td className="px-4 py-3.5">
                      <Badge status={inv.status} />
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          to={`/invoices/${inv._id}`}
                          className="p-2 text-slate-400 hover:text-brand-400 hover:bg-slate-800 rounded-lg transition-colors"
                          title="View Invoice"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          to={`/invoices/${inv._id}/edit`}
                          className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition-colors"
                          title="Edit Invoice"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setDeletingInvoice(inv)}
                          className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                          title="Delete Invoice"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Invoice Confirmation Modal */}
      <Modal
        isOpen={!!deletingInvoice}
        onClose={() => setDeletingInvoice(null)}
        title="Delete Invoice"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-300">
            Are you sure you want to delete invoice{' '}
            <strong className="text-brand-400 font-mono">{deletingInvoice?.invoiceNumber}</strong>?
          </p>
          <p className="text-xs text-slate-400">
            This operation is permanent and cannot be restored.
          </p>
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setDeletingInvoice(null)}
              className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteInvoice}
              disabled={isDeleting}
              className="inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-sm disabled:opacity-50"
            >
              {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Confirm Delete</span>
            </button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
};

export default InvoicesPage;
