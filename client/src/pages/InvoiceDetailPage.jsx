import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import Badge from '../components/common/Badge';
import { CardSkeleton } from '../components/common/Skeleton';
import { getInvoiceById, updateInvoice } from '../services/invoiceService';
import { formatCurrency, formatDate } from '../utils/formatters';
import { downloadInvoicePDF } from '../utils/pdfGenerator';
import {
  ArrowLeft,
  Printer,
  Download,
  Edit2,
  CheckCircle,
  Clock,
  Building,
  Mail,
  Phone,
  MapPin,
  Receipt,
  FileCheck2,
  Loader2
} from 'lucide-react';

const InvoiceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [error, setError] = useState('');

  const fetchInvoice = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getInvoiceById(id);
      if (res.success) {
        setInvoice(res.data);
      }
    } catch (err) {
      console.error(err);
      setError('Unable to load invoice details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const handleStatusToggle = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      const res = await updateInvoice(id, { status: newStatus });
      if (res.success) {
        setInvoice(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    setIsExportingPDF(true);
    await downloadInvoicePDF('invoice-document', `Invoice_${invoice?.invoiceNumber || 'Document'}.pdf`);
    setIsExportingPDF(false);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-4 max-w-4xl mx-auto">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </AppLayout>
    );
  }

  if (error || !invoice) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-bold text-slate-200">{error || 'Invoice not found'}</h2>
          <Link to="/invoices" className="mt-4 inline-block text-brand-400 font-semibold hover:underline">
            ← Back to Invoices List
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* Top Navigation & Actions Bar (Hidden during print) */}
      <div className="no-print flex flex-col md:flex-row md:items-center justify-between gap-4 max-w-4xl mx-auto mb-6">
        <div className="flex items-center space-x-3">
          <Link
            to="/invoices"
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-extrabold text-white tracking-tight font-mono">
                {invoice.invoiceNumber}
              </h1>
              <Badge status={invoice.status} />
            </div>
            <p className="text-xs text-slate-400">Created on {formatDate(invoice.createdAt)}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Mark Paid / Unpaid Status Toggle */}
          {invoice.status !== 'Paid' ? (
            <button
              onClick={() => handleStatusToggle('Paid')}
              disabled={updatingStatus}
              className="inline-flex items-center space-x-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
            >
              {updatingStatus ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
              <span>Mark as Paid</span>
            </button>
          ) : (
            <button
              onClick={() => handleStatusToggle('Unpaid')}
              disabled={updatingStatus}
              className="inline-flex items-center space-x-1.5 px-3 py-2 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 text-xs font-semibold rounded-xl border border-amber-500/30 transition-colors"
            >
              {updatingStatus ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Clock className="w-3.5 h-3.5" />}
              <span>Mark Unpaid</span>
            </button>
          )}

          <Link
            to={`/invoices/${invoice._id}/edit`}
            className="inline-flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Edit</span>
          </Link>

          <button
            onClick={handlePrint}
            className="inline-flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-slate-400" />
            <span>Print</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={isExportingPDF}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl shadow-md transition-colors disabled:opacity-50"
          >
            {isExportingPDF ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* Real Business Invoice Document */}
      <div className="max-w-4xl mx-auto">
        <div
          id="invoice-document"
          className="invoice-container bg-white text-slate-900 rounded-2xl p-8 sm:p-12 shadow-2xl border border-slate-200 space-y-8"
        >
          {/* Invoice Header: Company Brand & Invoice Details */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-8 border-b border-slate-200">
            <div>
              <div className="flex items-center space-x-2 text-brand-600 mb-2">
                <Receipt className="w-8 h-8" />
                <span className="font-extrabold text-2xl tracking-tight">
                  {invoice.user?.companyName || 'InvoiceFlow Business'}
                </span>
              </div>
              <div className="text-xs text-slate-600 space-y-0.5 font-medium">
                {invoice.user?.name && <p>{invoice.user.name}</p>}
                {invoice.user?.companyAddress && <p>{invoice.user.companyAddress}</p>}
                {invoice.user?.email && <p>Email: {invoice.user.email}</p>}
                {invoice.user?.companyPhone && <p>Phone: {invoice.user.companyPhone}</p>}
              </div>
            </div>

            <div className="sm:text-right">
              <span className="text-xs uppercase font-extrabold text-slate-400 tracking-wider block mb-1">
                TAX INVOICE
              </span>
              <h2 className="text-3xl font-black text-slate-900 font-mono tracking-tight">
                {invoice.invoiceNumber}
              </h2>

              <div className="mt-3 text-xs space-y-1 font-medium">
                <p className="text-slate-600">
                  Issue Date: <span className="font-bold text-slate-900">{formatDate(invoice.issueDate)}</span>
                </p>
                <p className="text-slate-600">
                  Due Date: <span className="font-bold text-slate-900">{formatDate(invoice.dueDate)}</span>
                </p>
                <div className="mt-2 inline-block">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      invoice.status === 'Paid'
                        ? 'bg-emerald-100 text-emerald-800'
                        : invoice.status === 'Overdue'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    STATUS: {invoice.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bill To Client Details */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">
                BILLED TO:
              </span>
              <h3 className="font-bold text-lg text-slate-900">{invoice.client?.companyName}</h3>
              <p className="text-sm font-semibold text-slate-700">{invoice.client?.name}</p>
              <p className="text-xs text-slate-600 mt-1">{invoice.client?.billingAddress}</p>
            </div>

            <div className="sm:text-right text-xs text-slate-600 space-y-1">
              <p>
                <strong className="text-slate-800">Email:</strong> {invoice.client?.email}
              </p>
              <p>
                <strong className="text-slate-800">Phone:</strong> {invoice.client?.phone}
              </p>
              {invoice.client?.gstNumber && (
                <p>
                  <strong className="text-slate-800">GSTIN / Tax ID:</strong> {invoice.client.gstNumber}
                </p>
              )}
            </div>
          </div>

          {/* Line Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-300 text-slate-500 text-xs uppercase font-extrabold tracking-wider">
                  <th className="py-3 px-2">#</th>
                  <th className="py-3 px-2">Description</th>
                  <th className="py-3 px-2 text-center">Qty</th>
                  <th className="py-3 px-2 text-right">Rate</th>
                  <th className="py-3 px-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm font-medium">
                {invoice.items?.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-4 px-2 text-xs text-slate-400 font-mono">{idx + 1}</td>
                    <td className="py-4 px-2 font-semibold text-slate-800">{item.description}</td>
                    <td className="py-4 px-2 text-center text-slate-600">{item.quantity}</td>
                    <td className="py-4 px-2 text-right text-slate-600">{formatCurrency(item.rate)}</td>
                    <td className="py-4 px-2 text-right font-bold text-slate-900">{formatCurrency(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Breakdown */}
          <div className="flex flex-col sm:flex-row justify-between items-start pt-6 border-t border-slate-200 gap-6">
            <div className="sm:w-1/2 space-y-2">
              {invoice.notes && (
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Terms & Notes:
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                    {invoice.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="sm:w-1/2 w-full space-y-2 text-sm font-medium">
              <div className="flex justify-between py-1 text-slate-600">
                <span>Subtotal:</span>
                <span className="font-semibold text-slate-900">{formatCurrency(invoice.subtotal)}</span>
              </div>
              {invoice.taxPercentage > 0 && (
                <div className="flex justify-between py-1 text-slate-600">
                  <span>Tax ({invoice.taxPercentage}%):</span>
                  <span className="font-semibold text-slate-900">+{formatCurrency(invoice.taxAmount)}</span>
                </div>
              )}
              {invoice.discount > 0 && (
                <div className="flex justify-between py-1 text-slate-600">
                  <span>Discount:</span>
                  <span className="font-semibold text-emerald-600">-{formatCurrency(invoice.discount)}</span>
                </div>
              )}
              <div className="flex justify-between py-3 border-t-2 border-slate-900 text-lg font-extrabold text-slate-900">
                <span>Grand Total:</span>
                <span className="text-2xl font-black text-brand-600">{formatCurrency(invoice.grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Document Footer */}
          <div className="pt-8 border-t border-slate-200 text-center text-xs text-slate-400 font-medium">
            <p>Thank you for doing business with us!</p>
            <p className="mt-0.5 text-[10px] text-slate-400">Generated securely via InvoiceFlow System</p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default InvoiceDetailPage;
