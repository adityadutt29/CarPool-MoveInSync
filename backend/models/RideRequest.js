const mongoose = require('mongoose');

const rideRequestSchema = new mongoose.Schema({
  ride:       { type: mongoose.Schema.Types.ObjectId, ref: 'RidePool', required: true },
  rider:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status:     {
    type: String,
    enum: ['PENDING','APPROVED','REJECTED'],
    default: 'PENDING'
  },
  requestedAt:{ type: Date, default: Date.now }
});

// Compound index to quickly find pending requests by ride
rideRequestSchema.index({ ride: 1, status: 1 });

module.exports = mongoose.model('RideRequest', rideRequestSchema);