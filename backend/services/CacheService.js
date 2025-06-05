const NodeCache = require('node-cache');
const logger = require('../utils/logger');

// In-memory cache with a TTL of 300 seconds (5 min) and checkperiod of 600 seconds
class CacheService {
  constructor() {
    this.cache = new NodeCache({ stdTTL: 300, checkperiod: 600 });
    logger.info('CacheService initialized (in-memory LRU).');
  }

  get(key) {
    try {
      return this.cache.get(key);
    } catch (err) {
      logger.warn('Cache get error: %s', err.message);
      return null;
    }
  }

  set(key, value, ttl = 300) {
    try {
      this.cache.set(key, value, ttl);
    } catch (err) {
      logger.warn('Cache set error: %s', err.message);
    }
  }

  del(key) {
    try {
      this.cache.del(key);
    } catch (err) {
      logger.warn('Cache del error: %s', err.message);
    }
  }
}

module.exports = new CacheService();
