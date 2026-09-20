import api from './api';

export const getInvoices = async (filters = {}) => {
  const query = new URLSearchParams();
  if (filters.search) query.append('search', filters.search);
  if (filters.status) query.append('status', filters.status);
  if (filters.clientId) query.append('clientId', filters.clientId);
  if (filters.from) query.append('from', filters.from);
  if (filters.to) query.append('to', filters.to);

  const queryString = query.toString();
  const response = await api.get(`/invoices${queryString ? `?${queryString}` : ''}`);
  return response.data;
};

export const getInvoiceById = async (id) => {
  const response = await api.get(`/invoices/${id}`);
  return response.data;
};

export const createInvoice = async (invoiceData) => {
  const response = await api.post('/invoices', invoiceData);
  return response.data;
};

export const updateInvoice = async (id, invoiceData) => {
  const response = await api.put(`/invoices/${id}`, invoiceData);
  return response.data;
};

export const deleteInvoice = async (id) => {
  const response = await api.delete(`/invoices/${id}`);
  return response.data;
};
