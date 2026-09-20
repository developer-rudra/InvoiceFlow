import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import ClientModal from '../components/clients/ClientModal';
import { getClients, createClient } from '../services/clientService';
import { createInvoice } from '../services/invoiceService';
import { formatCurrency, formatDateForInput } from '../utils/formatters';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Building,
  Calendar,
  Percent,
  Tag,
  FileText,
  Loader2,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

const CreateInvoicePage = () => {
  const navigate = useNavigate();

  const [clients, setClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(true);

  // Form State
  const [clientId, setClientId] = useState('');
  const [issueDate, setIssueDate] = useState(() => formatDateForInput(new Date()));
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 15);
    return formatDateForInput(d);
  });
  const [status, setStatus] = useState('Unpaid');
  const [taxPercentage, setTaxPercentage] = useState(18);
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState('Payment terms: 15 days net. Thank you for your business!');

  // Items State
  const [items, setItems] = useState([
    { description: 'Web Application Development Services', quantity: 1, rate: 25000 }
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Client Modal state for creating client inline
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [creatingClient, setCreatingClient] = useState(false);

  const fetchClients = async () => {
    setLoadingClients(true);
    try {
      const res = await getClients();
      if (res.success && res.data) {
        setClients(res.data);
        if (res.data.length > 0 && !clientId) {
          setClientId(res.data[0]._id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingClients(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  // Item modifications
  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, rate: 0 }]);
  };

  const removeItem = (index) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  // Live client-side total calculations preview
  const subtotal = items.reduce((sum, item) => {
    const q = Math.max(0, Number(item.quantity) || 0);
    const r = Math.max(0, Number(item.rate) || 0);
    return sum + q * r;
  }, 0);

  const taxAmount = (subtotal * (Number(taxPercentage) || 0)) / 100;
  const grandTotal = Math.max(0, subtotal + taxAmount - (Number(discount) || 0));

  const handleInlineClientCreate = async (formData) => {
    setCreatingClient(true);
    try {
      const res = await createClient(formData);
      if (res.success) {
        setClientModalOpen(false);
        await fetchClients();
        setClientId(res.data._id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreatingClient(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!clientId) {
      setError('Please select a client for this invoice');
      return;
    }

    if (items.some((it) => !it.description.trim() || it.quantity <= 0)) {
      setError('All invoice items must have a description and valid quantity greater than 0');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        clientId,
        items: items.map((it) => ({
          description: it.description,
          quantity: Number(it.quantity),
          rate: Number(it.rate)
        })),
        taxPercentage: Number(taxPercentage),
        discount: Number(discount),
        issueDate,
        dueDate,
        status,
        notes
      };

      const res = await createInvoice(payload);
      if (res.success && res.data) {
        navigate(`/invoices/${res.data._id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create invoice');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link
            to="/invoices"
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Create New Invoice</h1>
            <p className="text-sm text-slate-400">Fill in details. Totals are recalculated securely by the backend.</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/15 border border-rose-500/30 text-rose-300 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Client & Date Details Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
          <h2 className="text-base font-semibold text-slate-200 flex items-center">
            <Building className="w-4 h-4 mr-2 text-brand-400" />
            1. Client & Billing Schedule
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Client Selector */}
            <div className="md:col-span-1">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">
                  Select Client <span className="text-rose-400">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setClientModalOpen(true)}
                  className="text-xs text-brand-400 hover:text-brand-300 font-semibold"
                >
                  + Add Client
                </button>
              </div>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                required
                className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-brand-500"
              >
                {clients.length === 0 ? (
                  <option value="">-- No Clients Found --</option>
                ) : (
                  clients.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.companyName} ({c.name})
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Issue Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Issue Date <span className="text-rose-400">*</span>
              </label>
              <input
                type="date"
                required
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-brand-500"
              />
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Payment Due Date <span className="text-rose-400">*</span>
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Step 2: Dynamic Line Items Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-200 flex items-center">
              <FileText className="w-4 h-4 mr-2 text-brand-400" />
              2. Line Items Breakdown
            </h2>
            <button
              type="button"
              onClick={addItem}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-brand-400 text-xs font-semibold rounded-lg border border-slate-700/60 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Item</span>
            </button>
          </div>

          <div className="space-y-3">
            {items.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-12 gap-3 p-3 bg-slate-800/40 border border-slate-700/50 rounded-xl items-center"
              >
                {/* Description */}
                <div className="col-span-12 sm:col-span-6">
                  <label className="block text-[11px] text-slate-400 mb-1 sm:hidden">Description</label>
                  <input
                    type="text"
                    required
                    placeholder="Item or service description"
                    value={item.description}
                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
                  />
                </div>

                {/* Quantity */}
                <div className="col-span-4 sm:col-span-2">
                  <label className="block text-[11px] text-slate-400 mb-1 sm:hidden">Qty</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-brand-500 text-center"
                  />
                </div>

                {/* Rate */}
                <div className="col-span-5 sm:col-span-3">
                  <label className="block text-[11px] text-slate-400 mb-1 sm:hidden">Rate (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={item.rate}
                    onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-brand-500 text-right"
                  />
                </div>

                {/* Remove button */}
                <div className="col-span-3 sm:col-span-1 text-right">
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    disabled={items.length === 1}
                    className="p-2 text-slate-500 hover:text-rose-400 disabled:opacity-25 rounded-lg hover:bg-slate-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step 3: Tax, Discount & Totals Calculation Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
            <h2 className="text-base font-semibold text-slate-200 flex items-center">
              <Percent className="w-4 h-4 mr-2 text-brand-400" />
              3. Tax, Discount & Status Settings
            </h2>

            <div className="space-y-4">
              {/* Tax Percentage */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tax / GST Percentage ({taxPercentage}%)
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="range"
                    min="0"
                    max="28"
                    step="1"
                    value={taxPercentage}
                    onChange={(e) => setTaxPercentage(e.target.value)}
                    className="flex-1 accent-brand-500"
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={taxPercentage}
                    onChange={(e) => setTaxPercentage(e.target.value)}
                    className="w-20 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-sm text-slate-100 text-center"
                  />
                </div>
              </div>

              {/* Discount Amount */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Discount Amount (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-brand-500"
                />
              </div>

              {/* Initial Status */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Initial Invoice Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-brand-500"
                >
                  <option value="Unpaid">Unpaid</option>
                  <option value="Draft">Draft</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Terms & Payment Notes
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>
          </div>

          {/* Live Summary Calculation Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col justify-between">
            <h2 className="text-base font-semibold text-slate-200 mb-4">Live Calculations Summary</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-slate-400">
                <span>Items Subtotal:</span>
                <span className="font-semibold text-slate-200">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Tax ({taxPercentage}%):</span>
                <span className="font-semibold text-slate-200">+{formatCurrency(taxAmount)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Discount:</span>
                <span className="font-semibold text-emerald-400">-{formatCurrency(discount)}</span>
              </div>
              <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-lg font-bold text-white">
                <span>Grand Total:</span>
                <span className="text-2xl font-extrabold text-brand-400">{formatCurrency(grandTotal)}</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
              <Link
                to="/invoices"
                className="px-4 py-2.5 text-sm font-medium text-slate-400 hover:text-slate-200 rounded-xl hover:bg-slate-800"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting || clients.length === 0}
                className="inline-flex items-center space-x-2 px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl shadow-lg shadow-brand-600/20 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Issue Invoice</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Inline Client Create Modal */}
      <ClientModal
        isOpen={clientModalOpen}
        onClose={() => setClientModalOpen(false)}
        onSubmit={handleInlineClientCreate}
        isSubmitting={creatingClient}
      />
    </AppLayout>
  );
};

export default CreateInvoicePage;
