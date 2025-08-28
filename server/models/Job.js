const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
    },
    salary_range: {
      type: String,
      required: [true, 'Salary range is required'],
      trim: true,
    },
    designation: {
      type: String,
      required: [true, 'Designation is required'],
      trim: true,
    },
    job_description: {
      type: String,
      required: [true, 'Job description is required'],
      trim: true,
    },
    image: {
      type: String,
      default: null,
    },
    experience_in_year: {
      type: String,
      default: null,
      trim: true,
    },
    task_link: {
      type: String,
      default: null,
    },
    job_id: {
      type: String,
      required: [true, 'Job ID is required'],
      unique: true,
      length: 8,
      uppercase: true,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    evaluators: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
jobSchema.index({ job_id: 1 });
jobSchema.index({ is_active: 1 });
jobSchema.index({ evaluators: 1 });

module.exports = mongoose.model('Job', jobSchema);
