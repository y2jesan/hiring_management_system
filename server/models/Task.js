const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Task description is required'],
    },
    requirements: {
      type: String,
      required: [true, 'Task requirements are required'],
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium',
    },
    estimated_time: {
      type: String,
      required: [true, 'Estimated time is required'],
    },
    task_link: {
      type: String,
      default: null,
    },
    file_path: {
      type: String,
      default: null,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
taskSchema.index({ is_active: 1 });
taskSchema.index({ difficulty: 1 });
taskSchema.index({ tags: 1 });

module.exports = mongoose.model('Task', taskSchema);
