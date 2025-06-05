const logger = require('../utils/logger');

// Logs method, URL, and response time
module.exports = (req, res, next) => {
  const startHrTime = process.hrtime();

  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(startHrTime);
    const elapsedMs = seconds * 1000 + nanoseconds / 1e6;
    logger.info('%s %s %d %dms', req.method, req.originalUrl, res.statusCode, elapsedMs.toFixed(1));
  });

  next();
};
