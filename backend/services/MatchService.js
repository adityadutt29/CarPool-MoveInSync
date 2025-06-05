const { haversineDistance } = require('../utils/haversine');

// OOP‐style match % calculation
class MatchService {
  /**
   * Compute a simple match percentage based on proximity thresholds.
   * @param {Object} riderOrig { lat, lng }
   * @param {Object} riderDest { lat, lng }
   * @param {Object} driverOrig { lat, lng }
   * @param {Object} driverDest { lat, lng }
   * @returns {number} match percentage (0–100)
   */
  static computeMatchPercent(riderOrig, riderDest, driverOrig, driverDest) {
    const d1 = haversineDistance(riderOrig.lat, riderOrig.lng, driverOrig.lat, driverOrig.lng);
    const d2 = haversineDistance(riderDest.lat, riderDest.lng, driverDest.lat, driverDest.lng);

    if (d1 < 5 && d2 < 5) return 90;
    if (d1 < 10 && d2 < 10) return 70;
    if (d1 < 20 && d2 < 20) return 40;
    if (d1 < 30 && d2 < 30) return 20;
    if (d1 < 50 && d2 < 50) return 10;
    return 0;
  }
}

module.exports = MatchService;
