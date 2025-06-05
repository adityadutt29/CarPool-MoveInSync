const logger = require('../utils/logger');

// Global error‐handling middleware
module.exports = (err, req, res, next) => {
  logger.error('Unhandled error: %O', err);
  const status = err.statusCode || 500;
  const code   = err.code || 'SERVER_ERROR';
  const message = err.message || 'Internal Server Error';
  res.status(status).json({ error: { code, message } });
};
