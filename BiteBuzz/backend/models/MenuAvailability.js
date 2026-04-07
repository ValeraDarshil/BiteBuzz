const mongoose = require('mongoose');

const menuAvailabilitySchema = new mongoose.Schema({
  itemId: { type: Number, required: true, unique: true },
  available: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.models.MenuAvailability || mongoose.model('MenuAvailability', menuAvailabilitySchema);