const Client = require('../models/Client');
const Invoice = require('../models/Invoice');

/**
 * Get clients for authenticated user with optional search query
 */
const getClients = async (userId, searchQuery) => {
  const filter = { user: userId };

  if (searchQuery) {
    const regex = new RegExp(searchQuery.trim(), 'i');
    filter.$or = [
      { name: regex },
      { companyName: regex },
      { email: regex }
    ];
  }

  return await Client.find(filter).sort({ createdAt: -1 });
};

/**
 * Get single client by ID (ensuring user ownership)
 */
const getClientById = async (userId, clientId) => {
  const client = await Client.findOne({ _id: clientId, user: userId });
  if (!client) {
    const error = new Error('Client not found');
    error.statusCode = 404;
    throw error;
  }
  return client;
};

/**
 * Create new client for user
 */
const createClient = async (userId, clientData) => {
  const client = await Client.create({
    user: userId,
    ...clientData
  });
  return client;
};

/**
 * Update client details
 */
const updateClient = async (userId, clientId, updateData) => {
  const client = await Client.findOne({ _id: clientId, user: userId });
  if (!client) {
    const error = new Error('Client not found');
    error.statusCode = 404;
    throw error;
  }

  Object.assign(client, updateData);
  await client.save();
  return client;
};

/**
 * Delete client with invoice existence safeguard rule
 */
const deleteClient = async (userId, clientId) => {
  const client = await Client.findOne({ _id: clientId, user: userId });
  if (!client) {
    const error = new Error('Client not found');
    error.statusCode = 404;
    throw error;
  }

  // Check if client has existing invoices
  const existingInvoicesCount = await Invoice.countDocuments({ client: clientId, user: userId });

  if (existingInvoicesCount > 0) {
    const error = new Error('This client cannot be deleted because invoices exist for this client.');
    error.statusCode = 400; // Bad Request / Business rule violation
    throw error;
  }

  await Client.deleteOne({ _id: clientId });
  return { message: 'Client deleted successfully' };
};

module.exports = {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient
};
