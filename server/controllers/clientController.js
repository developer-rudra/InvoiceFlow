const clientService = require('../services/clientService');

/**
 * @desc    Get all clients for authenticated user with search support
 * @route   GET /api/clients
 * @access  Private
 */
const getClients = async (req, res, next) => {
  try {
    const clients = await clientService.getClients(req.user._id, req.query.search);
    return res.status(200).json({
      success: true,
      message: 'Clients retrieved successfully',
      data: clients
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single client by ID
 * @route   GET /api/clients/:id
 * @access  Private
 */
const getClientById = async (req, res, next) => {
  try {
    const client = await clientService.getClientById(req.user._id, req.params.id);
    return res.status(200).json({
      success: true,
      message: 'Client details retrieved successfully',
      data: client
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new client
 * @route   POST /api/clients
 * @access  Private
 */
const createClient = async (req, res, next) => {
  try {
    const client = await clientService.createClient(req.user._id, req.body);
    return res.status(201).json({
      success: true,
      message: 'Client created successfully',
      data: client
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an existing client
 * @route   PUT /api/clients/:id
 * @access  Private
 */
const updateClient = async (req, res, next) => {
  try {
    const client = await clientService.updateClient(req.user._id, req.params.id, req.body);
    return res.status(200).json({
      success: true,
      message: 'Client updated successfully',
      data: client
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a client (subject to invoice safeguard)
 * @route   DELETE /api/clients/:id
 * @access  Private
 */
const deleteClient = async (req, res, next) => {
  try {
    const result = await clientService.deleteClient(req.user._id, req.params.id);
    return res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient
};
