const mongoose = require('mongoose');

const ridePoolSchema = new mongoose.Schema({
  driver:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pickupLat:     { type: Number, required: true },
  pickupLng:     { type: Number, required: true },
  dropLat:       { type: Number, required: true },
  dropLng:       { type: Number, required: true },
  departureTime: { type: Date, required: true },
  totalSeats:    { type: Number, required: true },
  availableSeats:{ type: Number, required: true },
  status: {
    type: String,
    enum: ['UPCOMING', 'IN_PROGRESS', 'COMPLETED'],
    default: 'UPCOMING'
  },
  vehicleInfo:   {
    make:     { type: String, default: '' },
    model:    { type: String, default: '' },
    plateNo:  { type: String, default: '' },
    color:    { type: String, default: '' }
  },
  rules: {
    femaleOnly:   { type: Boolean, default: false },
    noSmoking:    { type: Boolean, default: false },
    petAllowed:   { type: Boolean, default: true }
  },
  createdAt:     { type: Date, default: Date.now },
  updatedAt:     { type: Date, default: Date.now }
});

// Composite index on departureTime for range queries
ridePoolSchema.index({ departureTime: 1 });

// Geospatial index on pickup coordinates for fast $near queries
ridePoolSchema.index({ pickup: '2dsphere' });
ridePoolSchema.index({ drop: '2dsphere' });

// Virtual fields for geolocation
ridePoolSchema.virtual('pickup', {
  ref: null,
  localField: 'pickupLat',
  foreignField: 'pickupLng',
  justOne: true
});

// We’ll manually ensure we insert a proper { type:"Point", coordinates:[lng, lat] } if needed
// For simplicity, queries below will use lat/lng fields directly.

module.exports = mongoose.model('RidePool', ridePoolSchema);
