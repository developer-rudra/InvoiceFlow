const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorArray = errors.array();
    const firstErrorMessage = errorArray[0].msg;
    return res.status(400).json({
      success: false,
      message: firstErrorMessage,
      errors: errorArray.map((err) => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

module.exports = validate;
