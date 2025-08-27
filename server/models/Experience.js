const mongoose = require('mongoose');

const experienceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Experience name is required'],
    trim: true,
    unique: true
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
experienceSchema.index({ name: 1 });
experienceSchema.index({ active: 1 });

module.exports = mongoose.model('Experience', experienceSchema);
