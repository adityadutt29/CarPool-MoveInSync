const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName:     { type: String, required: true },
  displayName:  { type: String, required: true },
  email:        { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  role:         { type: String, enum: ['driver', 'rider'], default: 'rider' },
  showFullName: { type: Boolean, default: false },
  blurProfile:  { type: Boolean, default: true },
  createdAt:    { type: Date, default: Date.now },
  gender:       { type: String, enum: ['male','female','other'], default: 'other' },
  smokingAllowed: { type: Boolean, default: true },
  petAllowed:     { type: Boolean, default: true }
});

// Create an index on email for fast lookup
userSchema.index({ email: 1 });

module.exports = mongoose.model('User', userSchema);
