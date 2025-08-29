const mongoose = require('mongoose');

const talentSchema = new mongoose.Schema(
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
      match: [/^01\d{9}$/, 'Phone number must be 11 digits starting with 01'],
    },
    cv_file_path: {
      type: String,
      required: [true, 'CV file is required'],
    },
    talent_pool_id: {
      type: String,
      required: [true, 'Talent pool ID is required'],
      unique: true,
      length: 8,
      uppercase: true,
    },
    reference: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    years_of_experience: {
      type: Number,
      required: [true, 'Years of experience is required'],
      min: [0, 'Years of experience cannot be negative'],
    },
    expected_salary: {
      type: Number,
      required: [true, 'Expected salary is required'],
      min: [0, 'Expected salary cannot be negative'],
    },
    notice_period_in_months: {
      type: Number,
      required: [true, 'Notice period is required'],
      min: [0, 'Notice period cannot be negative'],
    },
    current_employment_status: {
      type: Boolean,
      required: [true, 'Current employment status is required'],
      default: true,
    },
    current_company_name: {
      type: String,
      default: null,
      trim: true,
    },
    write_about_yourself: {
      type: String,
      default: "",
      trim: true,
    },
    core_experience: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Experience',
      required: [true, 'At least one core experience is required'],
      validate: {
        validator: function(v) {
          return v.length > 0;
        },
        message: 'At least one core experience is required'
      }
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    submission_date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
talentSchema.index({ talent_pool_id: 1 });
talentSchema.index({ email: 1 });
talentSchema.index({ is_active: 1 });
talentSchema.index({ submission_date: -1 });
talentSchema.index({ core_experience: 1 });

module.exports = mongoose.model('Talent', talentSchema);
