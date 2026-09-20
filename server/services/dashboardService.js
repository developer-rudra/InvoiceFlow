const Invoice = require('../models/Invoice');
const { formatInvoiceWithStatus, evaluateInvoiceStatus } = require('../utils/overdue');
const { roundCurrency } = require('../utils/calculations');

/**
 * Calculates dashboard KPI metrics and recent invoices for authenticated user
 */
const getDashboardStats = async (userId) => {
  const allInvoices = await Invoice.find({ user: userId }).populate(
    'client',
    'name companyName email'
  );

  let totalInvoices = allInvoices.length;
  let totalBilled = 0;
  let totalPaid = 0;
  let outstandingAmount = 0;

  let draftCount = 0;
  let unpaidCount = 0;
  let paidCount = 0;
  let overdueCount = 0;

  allInvoices.forEach((inv) => {
    const status = evaluateInvoiceStatus(inv);
    const amount = Number(inv.grandTotal) || 0;

    totalBilled += amount;

    if (status === 'Paid') {
      totalPaid += amount;
      paidCount++;
    } else if (status === 'Overdue') {
      outstandingAmount += amount;
      overdueCount++;
    } else if (status === 'Unpaid') {
      outstandingAmount += amount;
      unpaidCount++;
    } else if (status === 'Draft') {
      draftCount++;
    }
  });

  // Recent 5 invoices sorted by createdAt descending
  const sortedInvoices = [...allInvoices].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const recentInvoices = sortedInvoices.slice(0, 5).map((inv) => formatInvoiceWithStatus(inv));

  return {
    totalInvoices,
    totalBilled: roundCurrency(totalBilled),
    totalPaid: roundCurrency(totalPaid),
    outstandingAmount: roundCurrency(outstandingAmount),
    counts: {
      draft: draftCount,
      unpaid: unpaidCount,
      paid: paidCount,
      overdue: overdueCount
    },
    recentInvoices
  };
};

module.exports = {
  getDashboardStats
};
