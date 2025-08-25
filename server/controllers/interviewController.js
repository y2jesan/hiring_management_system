const Interview = require('../models/Interview');
const Candidate = require('../models/Candidate');
const User = require('../models/User');
const { createSuccessResponse, createErrorResponse, generatePagination, sanitizeSearchQuery } = require('../helpers/utils');
const { sendInterviewScheduledNotification } = require('../helpers/emailService');

// Schedule interview
const scheduleInterview = async (req, res) => {
  try {
    const { candidate_id, scheduled_date, interviewer_id, notes } = req.body;

    // Validate candidate exists and is interview eligible
    const candidate = await Candidate.findById(candidate_id);
    if (!candidate) {
      return res.status(404).json(createErrorResponse('Candidate not found'));
    }

    if (candidate.status !== 'Interview Eligible' && candidate.status !== 'Shortlisted') {
      return res.status(400).json(createErrorResponse('Candidate is not eligible for interview'));
    }

    // Validate interviewer exists
    const interviewer = await User.findById(interviewer_id);
    if (!interviewer) {
      return res.status(404).json(createErrorResponse('Interviewer not found'));
    }

    // Check if interview already exists for this candidate
    const existingInterview = await Interview.findOne({ candidate_id });
    if (existingInterview) {
      return res.status(400).json(createErrorResponse('Interview already scheduled for this candidate'));
    }

    const interviewData = {
      candidate_id,
      scheduled_date: new Date(scheduled_date),
      interviewer_id,
      notes,
      scheduled_by: req.user._id,
    };

    const interview = await Interview.create(interviewData);

    // Update candidate status
    await Candidate.findByIdAndUpdate(candidate_id, {
      status: 'Interview Scheduled',
      'interview.scheduled_date': new Date(scheduled_date),
      'interview.interviewer': interviewer_id,
    });

    // Send interview notification email
    await sendInterviewScheduledNotification(candidate.email, candidate.name, candidate.application_id, scheduled_date, interviewer.name);

    const populatedInterview = await Interview.findById(interview._id).populate('candidate_id', 'name email application_id').populate('interviewer_id', 'name email').populate('scheduled_by', 'name email');

    res.status(201).json(
      createSuccessResponse(
        {
          interview: populatedInterview,
        },
        'Interview scheduled successfully'
      )
    );
  } catch (error) {
    console.error('Schedule interview error:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json(createErrorResponse(errors.join(', ')));
    }
    res.status(500).json(createErrorResponse('Failed to schedule interview'));
  }
};

// Get all interviews with filters and pagination
const getInterviews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search;
    const status = req.query.status;
    const interviewer_id = req.query.interviewer_id;

    const query = {};

    // Search filter
    if (search) {
      const sanitizedSearch = sanitizeSearchQuery(search);
      query.$or = [{ 'candidate_id.name': { $regex: sanitizedSearch, $options: 'i' } }, { 'candidate_id.email': { $regex: sanitizedSearch, $options: 'i' } }, { 'candidate_id.application_id': { $regex: sanitizedSearch, $options: 'i' } }];
    }

    // Status filter
    if (status) {
      query.result = status;
    }

    // Interviewer filter
    if (interviewer_id) {
      query.interviewer_id = interviewer_id;
    }

    const skip = (page - 1) * limit;

    const [interviews, total] = await Promise.all([Interview.find(query).populate('candidate_id', 'name email application_id status').populate('interviewer_id', 'name email').populate('scheduled_by', 'name email').sort({ scheduled_date: -1 }).skip(skip).limit(limit), Interview.countDocuments(query)]);

    const pagination = generatePagination(page, limit, total);

    res.json(
      createSuccessResponse({
        interviews,
        pagination,
      })
    );
  } catch (error) {
    console.error('Get interviews error:', error);
    res.status(500).json(createErrorResponse('Failed to fetch interviews'));
  }
};

// Get interview by ID
const getInterviewById = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id).populate('candidate_id', 'name email application_id status job_id').populate('interviewer_id', 'name email').populate('scheduled_by', 'name email');

    if (!interview) {
      return res.status(404).json(createErrorResponse('Interview not found'));
    }

    res.json(createSuccessResponse({ interview }));
  } catch (error) {
    console.error('Get interview by ID error:', error);
    res.status(500).json(createErrorResponse('Failed to fetch interview'));
  }
};

// Update interview result
const updateInterviewResult = async (req, res) => {
  try {
    const { result, feedback, score } = req.body;
    const { id } = req.params;

    const validResults = ['Pending', 'Passed', 'Failed', 'No Show'];
    if (!validResults.includes(result)) {
      return res.status(400).json(createErrorResponse('Invalid interview result'));
    }

    const interview = await Interview.findById(id);
    if (!interview) {
      return res.status(404).json(createErrorResponse('Interview not found'));
    }

    const updateData = {
      result,
      feedback,
      completed_at: new Date(),
      completed_by: req.user._id,
    };

    if (score !== undefined) {
      updateData.score = score;
    }

    const updatedInterview = await Interview.findByIdAndUpdate(id, updateData, { new: true }).populate('candidate_id', 'name email application_id status').populate('interviewer_id', 'name email').populate('scheduled_by', 'name email');

    // Update candidate status based on result
    let candidateStatus = 'Interview Completed';
    if (result === 'Passed') {
      candidateStatus = 'Shortlisted';
    } else if (result === 'Failed' || result === 'No Show') {
      candidateStatus = 'Rejected';
    }

    await Candidate.findByIdAndUpdate(interview.candidate_id, {
      status: candidateStatus,
      'interview.result': result,
      'interview.feedback': feedback,
    });

    res.json(
      createSuccessResponse(
        {
          interview: updatedInterview,
        },
        'Interview result updated successfully'
      )
    );
  } catch (error) {
    console.error('Update interview result error:', error);
    res.status(500).json(createErrorResponse('Failed to update interview result'));
  }
};

// Reschedule interview
const rescheduleInterview = async (req, res) => {
  try {
    const { scheduled_date, notes } = req.body;
    const { id } = req.params;

    const interview = await Interview.findById(id);
    if (!interview) {
      return res.status(404).json(createErrorResponse('Interview not found'));
    }

    const updateData = {
      scheduled_date: new Date(scheduled_date),
      rescheduled_at: new Date(),
      rescheduled_by: req.user._id,
    };

    if (notes) {
      updateData.notes = notes;
    }

    const updatedInterview = await Interview.findByIdAndUpdate(id, updateData, { new: true }).populate('candidate_id', 'name email application_id').populate('interviewer_id', 'name email').populate('scheduled_by', 'name email');

    // Update candidate interview date
    await Candidate.findByIdAndUpdate(interview.candidate_id, {
      'interview.scheduled_date': new Date(scheduled_date),
    });

    // Send reschedule notification email
    await sendInterviewScheduledNotification(updatedInterview.candidate_id.email, updatedInterview.candidate_id.name, updatedInterview.candidate_id.application_id, scheduled_date, updatedInterview.interviewer_id.name);

    res.json(
      createSuccessResponse(
        {
          interview: updatedInterview,
        },
        'Interview rescheduled successfully'
      )
    );
  } catch (error) {
    console.error('Reschedule interview error:', error);
    res.status(500).json(createErrorResponse('Failed to reschedule interview'));
  }
};

// Cancel interview
const cancelInterview = async (req, res) => {
  try {
    const { reason } = req.body;
    const { id } = req.params;

    const interview = await Interview.findById(id);
    if (!interview) {
      return res.status(404).json(createErrorResponse('Interview not found'));
    }

    if (interview.result !== 'Pending') {
      return res.status(400).json(createErrorResponse('Cannot cancel completed interview'));
    }

    const updateData = {
      result: 'Cancelled',
      cancelled_at: new Date(),
      cancelled_by: req.user._id,
    };

    if (reason) {
      updateData.cancellation_reason = reason;
    }

    const updatedInterview = await Interview.findByIdAndUpdate(id, updateData, { new: true }).populate('candidate_id', 'name email application_id').populate('interviewer_id', 'name email');

    // Update candidate status
    await Candidate.findByIdAndUpdate(interview.candidate_id, {
      status: 'Interview Eligible',
      'interview.scheduled_date': null,
      'interview.interviewer': null,
    });

    res.json(
      createSuccessResponse(
        {
          interview: updatedInterview,
        },
        'Interview cancelled successfully'
      )
    );
  } catch (error) {
    console.error('Cancel interview error:', error);
    res.status(500).json(createErrorResponse('Failed to cancel interview'));
  }
};

// Get interviews by candidate
const getInterviewsByCandidate = async (req, res) => {
  try {
    const { candidate_id } = req.params;

    const interviews = await Interview.find({ candidate_id }).populate('interviewer_id', 'name email').populate('scheduled_by', 'name email').sort({ scheduled_date: -1 });

    res.json(createSuccessResponse({ interviews }));
  } catch (error) {
    console.error('Get interviews by candidate error:', error);
    res.status(500).json(createErrorResponse('Failed to fetch candidate interviews'));
  }
};

// Get upcoming interviews
const getUpcomingInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({
      scheduled_date: { $gte: new Date() },
      result: 'Pending',
    })
      .populate('candidate_id', 'name email application_id')
      .populate('interviewer_id', 'name email')
      .sort({ scheduled_date: 1 })
      .limit(10);

    res.json(createSuccessResponse({ interviews }));
  } catch (error) {
    console.error('Get upcoming interviews error:', error);
    res.status(500).json(createErrorResponse('Failed to fetch upcoming interviews'));
  }
};

module.exports = {
  scheduleInterview,
  getInterviews,
  getInterviewById,
  updateInterviewResult,
  rescheduleInterview,
  cancelInterview,
  getInterviewsByCandidate,
  getUpcomingInterviews,
};
