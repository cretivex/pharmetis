const handleValidationError = (error, res, source = 'body') => {
  const errors = error.details.map(detail => ({
    field: detail.path.join('.'),
    message: detail.message.replace(/"/g, '')
  }));
  const firstError = errors[0];
  const message = firstError
    ? `${firstError.field ? firstError.field + ': ' : ''}${firstError.message}`
    : 'Validation error';
  return res.status(400).json({ success: false, message, errors });
};

export const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });
    if (error) return handleValidationError(error, res, 'body');
    req.body = value;
    next();
  };
};

export const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true
    });
    if (error) return handleValidationError(error, res, 'query');
    req.query = value;
    next();
  };
};
