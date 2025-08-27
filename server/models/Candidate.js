const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    cv_file_path: {
      type: String,
      required: [true, 'CV file path is required'],
    },
    application_id: {
      type: String,
      required: [true, 'Application ID is required'],
      unique: true,
    },
    job_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    reference: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    years_of_experience: {
      type: Number,
      required: [true, 'Years of experience is required'],
      min: 0,
      default: 0,
    },
    expected_salary: {
      type: Number,
      required: [true, 'Expected salary is required'],
      min: 0,
      default: 0,
    },
    notice_period_in_months: {
      type: Number,
      required: [true, 'Notice period is required'],
      min: 0,
      default: 1,
    },
    core_experience: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Experience',
      default: [],
    },
    task_submission: {
      links: [
        {
          url: {
            type: String,
            required: true,
          },
          type: {
            type: String,
            enum: ['github', 'live', 'other'],
            default: 'other',
          },
        },
      ],
      submitted_at: {
        type: Date,
        default: null,
      },
    },
    // Array of interview document references for multiple interview support
    interviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Interview',
        default: undefined,
      },
    ],
    status: {
      type: String,
      enum: ['Applied', 'Task Pending', 'Task Submitted', 'Under Review', 'Interview Eligible', 'Interview Scheduled', 'Interview Completed', 'Shortlisted', 'Selected', 'Rejected'],
      default: 'Applied',
    },
    evaluation: {
      score: {
        type: Number,
        min: 0,
        max: 100,
        default: null,
      },
      evaluated_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
      },
      evaluated_at: {
        type: Date,
        default: null,
      },
      comments: {
        type: String,
        default: null,
      },
    },
    interview: {
      scheduled_date: {
        type: Date,
        default: null,
      },
      interviewer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
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
      result: {
        type: String,
        enum: ['Pending', 'Passed', 'Failed', 'No Show'],
        default: 'Pending',
      },
      feedback: {
        type: String,
        default: null,
      },
      completed_at: {
        type: Date,
        default: null,
      },
    },
    final_selection: {
      selected: {
        type: Boolean,
        default: false,
      },
      offer_letter_path: {
        type: String,
        default: null,
      },
      selected_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
      },
      selected_at: {
        type: Date,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
candidateSchema.index({ application_id: 1 });
candidateSchema.index({ email: 1 });
candidateSchema.index({ status: 1 });
candidateSchema.index({ job_id: 1 });
candidateSchema.index({ reference: 1 });
candidateSchema.index({ years_of_experience: 1 });
candidateSchema.index({ expected_salary: 1 });
candidateSchema.index({ notice_period_in_months: 1 });
candidateSchema.index({ core_experience: 1 });

module.exports = mongoose.model('Candidate', candidateSchema);
