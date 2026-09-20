import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import { getInvoiceById, updateInvoice } from '../services/invoiceService';
import { getClients } from '../services/clientService';
import { formatCurrency, formatDateForInput } from '../utils/formatters';
import { CardSkeleton } from '../components/common/Skeleton';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Building,
  FileText,
  Percent,
  Loader2,
  CheckCircle
} from 'lucide-react';

const EditInvoicePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState([]);
  const [invoiceNumber, setInvoiceNumber] = useState('');

  const [clientId, setClientId] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState('Unpaid');
  const [taxPercentage, setTaxPercentage] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [invRes, clientRes] = await Promise.all([getInvoiceById(id), getClients()]);

        if (clientRes.success) setClients(clientRes.data);

        if (invRes.success && invRes.data) {
          const inv = invRes.data;
          setInvoiceNumber(inv.invoiceNumber);
          setClientId(inv.client?._id || inv.client);
          setIssueDate(formatDateForInput(inv.issueDate));
          setDueDate(formatDateForInput(inv.dueDate));
          setStatus(inv.status);
          setTaxPercentage(inv.taxPercentage || 0);
          setDiscount(inv.discount || 0);
          setNotes(inv.notes || '');
          setItems(inv.items || []);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to fetch invoice details for editing');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

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

  const subtotal = items.reduce((sum, item) => {
    const q = Math.max(0, Number(item.quantity) || 0);
    const r = Math.max(0, Number(item.rate) || 0);
    return sum + q * r;
  }, 0);

  const taxAmount = (subtotal * (Number(taxPercentage) || 0)) / 100;
  const grandTotal = Math.max(0, subtotal + taxAmount - (Number(discount) || 0));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
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

      const res = await updateInvoice(id, payload);
      if (res.success) {
        navigate(`/invoices/${id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update invoice');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex items-center space-x-3">
        <Link
          to={`/invoices/${id}`}
          className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Edit Invoice {invoiceNumber}</h1>
          <p className="text-sm text-slate-400">Update line items, tax, discount or status</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/15 border border-rose-500/30 text-rose-300 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Client & Dates */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
          <h2 className="text-base font-semibold text-slate-200 flex items-center">
            <Building className="w-4 h-4 mr-2 text-brand-400" />
            Client & Dates
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Client</label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                required
                className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-brand-500"
              >
                {clients.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.companyName} ({c.name})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Issue Date</label>
              <input
                type="date"
                required
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Due Date</label>
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

        {/* Step 2: Line Items */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-200 flex items-center">
              <FileText className="w-4 h-4 mr-2 text-brand-400" />
              Line Items
            </h2>
            <button
              type="button"
              onClick={addItem}
              className="inline-flex items-center space-x-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-brand-400 text-xs font-semibold rounded-lg border border-slate-700"
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
                <div className="col-span-12 sm:col-span-6">
                  <input
                    type="text"
                    required
                    value={item.description}
                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div className="col-span-4 sm:col-span-2">
                  <input
                    type="number"
                    min="1"
                    required
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 text-center focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div className="col-span-5 sm:col-span-3">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={item.rate}
                    onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 text-right focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div className="col-span-3 sm:col-span-1 text-right">
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    disabled={items.length === 1}
                    className="p-2 text-slate-500 hover:text-rose-400 disabled:opacity-25 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step 3: Settings & Totals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
            <h2 className="text-base font-semibold text-slate-200">Adjustments & Status</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tax ({taxPercentage}%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={taxPercentage}
                  onChange={(e) => setTaxPercentage(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Discount (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100"
                >
                  <option value="Unpaid">Unpaid</option>
                  <option value="Paid">Paid</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200"
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col justify-between">
            <h2 className="text-base font-semibold text-slate-200 mb-4">Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal:</span>
                <span className="font-semibold text-slate-200">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Tax:</span>
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
                to={`/invoices/${id}`}
                className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-200 rounded-xl"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center space-x-2 px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl shadow-lg"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </AppLayout>
  );
};

export default EditInvoicePage;
