const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  department: {
    type: String
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: "student"
  },
  cancellations: [Date],
  suspendedUntil: Date
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model("User", userSchema);

