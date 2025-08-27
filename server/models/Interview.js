const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema(
  {
    candidate_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Candidate',
      required: true,
    },
    job_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    scheduled_date: {
      type: Date,
      required: [true, 'Interview date is required'],
    },
    duration: {
      type: Number,
      default: 60, // minutes
      min: 15,
      max: 240,
    },
    interviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    scheduled_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    interview_type: {
      type: String,
      enum: ['Technical', 'HR', 'Final', 'Panel'],
      default: 'Technical',
    },
    location: {
      type: String,
      enum: ['Online', 'In-Person'],
      default: 'In-Person',
    },
    meeting_link: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['Scheduled', 'Completed', 'Cancelled', 'Rescheduled'],
      default: 'Pending',
    },
    result: {
      type: String,
      enum: ['Pending', 'Taken', 'Passed', 'Failed', 'No Show'],
      default: 'Pending',
    },
    feedback: {
      type: String,
      default: null,
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
    notes: {
      type: String,
      default: null,
    },
    completed_at: {
      type: Date,
      default: null,
    },
    completed_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    cancelled_at: {
      type: Date,
      default: null,
    },
    cancelled_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    cancellation_reason: {
      type: String,
      default: null,
    },
    rescheduled_at: {
      type: Date,
      default: null,
    },
    rescheduled_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    rescheduled_from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Interview',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
interviewSchema.index({ candidate_id: 1 });
interviewSchema.index({ scheduled_date: 1 });
interviewSchema.index({ interviewer: 1 });
interviewSchema.index({ status: 1 });

module.exports = mongoose.model('Interview', interviewSchema);
