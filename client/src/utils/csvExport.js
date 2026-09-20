import { formatDate } from './formatters';

/**
 * Converts array of invoice objects to CSV file and triggers download
 * @param {Array} invoices Invoices array
 * @param {String} filename CSV filename
 */
export const exportInvoicesToCSV = (invoices = [], filename = 'invoices_export.csv') => {
  if (!invoices || invoices.length === 0) return;

  const headers = [
    'Invoice Number',
    'Client Name',
    'Company',
    'Email',
    'Issue Date',
    'Due Date',
    'Subtotal',
    'Tax Amount',
    'Discount',
    'Grand Total',
    'Status'
  ];

  const rows = invoices.map((inv) => [
    `"${inv.invoiceNumber || ''}"`,
    `"${inv.client?.name || ''}"`,
    `"${inv.client?.companyName || ''}"`,
    `"${inv.client?.email || ''}"`,
    `"${formatDate(inv.issueDate)}"`,
    `"${formatDate(inv.dueDate)}"`,
    inv.subtotal || 0,
    inv.taxAmount || 0,
    inv.discount || 0,
    inv.grandTotal || 0,
    `"${inv.status || ''}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
