const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const { clientValidationRules } = require('../validators/clientValidator');
const validate = require('../middleware/validateMiddleware');
const { protect } = require('../middleware/authMiddleware');

// All client routes require authentication
router.use(protect);

router.route('/')
  .get(clientController.getClients)
  .post(clientValidationRules, validate, clientController.createClient);

router.route('/:id')
  .get(clientController.getClientById)
  .put(clientValidationRules, validate, clientController.updateClient)
  .delete(clientController.deleteClient);

module.exports = router;
