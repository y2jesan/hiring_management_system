const Interview = require('../models/Interview');
const Candidate = require('../models/Candidate');
const User = require('../models/User');
const { createSuccessResponse, createErrorResponse, generatePagination, sanitizeSearchQuery } = require('../helpers/utils');
// const { sendInterviewScheduledNotification, sendEmail } = require('../helpers/emailService');

// Schedule interview
const scheduleInterview = async (req, res) => {
  try {
    const { candidate_id, job_id, scheduled_date, interviewer, location, meeting_link, notes } = req.body;

    // Validate candidate exists and is interview eligible
    const candidate = await Candidate.findById(candidate_id);
    if (!candidate) {
      return res.status(404).json(createErrorResponse('Candidate not found'));
    }

    if (candidate.status !== 'Interview Eligible' && candidate.status !== 'Shortlisted') {
      return res.status(400).json(createErrorResponse('Candidate is not eligible for interview'));
    }

    // Validate interviewer exists
    const interviewerUser = await User.findById(interviewer);
    if (!interviewerUser) {
      return res.status(404).json(createErrorResponse('Interviewer not found'));
    }

    // Check if interview already exists for this candidate
    // Allow multiple interviews; no single-interview restriction

    const interviewData = {
      candidate_id,
      job_id,
      scheduled_date: new Date(scheduled_date),
      interviewer,
      location: location || 'In-Person',
      meeting_link: location === 'Online' ? meeting_link : null,
      notes,
      scheduled_by: req.user._id,
      status: 'Pending',
    };

    const interview = await Interview.create(interviewData);

    // Update candidate status
    // Push interview id into candidate.interviews array and set status
    await Candidate.findByIdAndUpdate(candidate_id, {
      $push: { interviews: interview._id },
      status: 'Interview Scheduled',
    });

    // Email disabled per request
    // await sendInterviewScheduledNotification(candidate.email, candidate.name, candidate.application_id, scheduled_date, interviewerUser.name);

    const populatedInterview = await Interview.findById(interview._id).populate('candidate_id', 'name email application_id').populate('interviewer', 'name email').populate('scheduled_by', 'name email').select('candidate_id interviewer job_id scheduled_date location meeting_link result feedback notes scheduled_by');

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
    const interviewer = req.query.interviewer;

    const query = {};

    // Search filter
    if (search) {
      const sanitizedSearch = sanitizeSearchQuery(search);
      query.$or = [{ 'candidate_id.name': { $regex: sanitizedSearch, $options: 'i' } }, { 'candidate_id.email': { $regex: sanitizedSearch, $options: 'i' } }, { 'candidate_id.application_id': { $regex: sanitizedSearch, $options: 'i' } }];
    }

    // Status filter
    if (status) {
      query.status = status;
    }

    // Interviewer filter
    if (interviewer) {
      query.interviewer = interviewer;
    }

    const skip = (page - 1) * limit;

    const [interviews, total] = await Promise.all([
      Interview.find(query)
        .populate('candidate_id', 'name email application_id status')
        .populate('interviewer', 'name email')
        .populate('job_id', 'title designation salary_range experience_in_year')
        .select('candidate_id interviewer job_id scheduled_date location meeting_link result feedback notes completed_at completed_by scheduled_by')
        .sort({ scheduled_date: -1 })
        .skip(skip)
        .limit(limit),
      Interview.countDocuments(query),
    ]);

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
    const interview = await Interview.findById(req.params.id).populate('candidate_id', 'name email application_id status job_id').populate('interviewer', 'name email').populate('scheduled_by', 'name email');

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

    const validResults = ['Pending', 'Taken', 'Passed', 'Failed', 'No Show', 'Cancelled'];
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

    const updatedInterview = await Interview.findByIdAndUpdate(id, updateData, { new: true }).populate('candidate_id', 'name email application_id status').populate('interviewer', 'name email').populate('scheduled_by', 'name email');

    // Keep candidate status generic based on lifecycle only
    await Candidate.findByIdAndUpdate(interview.candidate_id, {
      status: 'Interview Completed',
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
      result: 'Rescheduled',
    };

    if (notes) {
      updateData.notes = notes;
    }

    const updatedInterview = await Interview.findByIdAndUpdate(id, updateData, { new: true }).populate('candidate_id', 'name email application_id').populate('interviewer', 'name email').populate('scheduled_by', 'name email');

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
    const { feedback, notes, candidateStatus } = req.body;
    const { id } = req.params;

    const interview = await Interview.findById(id);
    if (!interview) {
      return res.status(404).json(createErrorResponse('Interview not found'));
    }

    if (interview.result !== 'Pending' && interview.result !== 'Rescheduled') {
      return res.status(400).json(createErrorResponse('Cannot cancel completed interview'));
    }

    const updateData = {
      result: 'Cancelled',
      cancelled_at: new Date(),
      cancelled_by: req.user._id,
    };

    if (feedback) {
      updateData.feedback = feedback;
    }

    if (notes) {
      updateData.notes = notes;
    }

    const updatedInterview = await Interview.findByIdAndUpdate(id, updateData, { new: true }).populate('candidate_id', 'name email application_id').populate('interviewer', 'name email');

    // Update candidate status
    await Candidate.findByIdAndUpdate(interview.candidate_id, {
      status: candidateStatus || 'Interview Eligible',
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

    const interviews = await Interview.find({ candidate_id }).populate('interviewer', 'name email').populate('scheduled_by', 'name email').sort({ scheduled_date: -1 });

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
      .populate('interviewer', 'name email')
      .sort({ scheduled_date: 1 })
      .limit(10);

    res.json(createSuccessResponse({ interviews }));
  } catch (error) {
    console.error('Get upcoming interviews error:', error);
    res.status(500).json(createErrorResponse('Failed to fetch upcoming interviews'));
  }
};

// Schedule next interview (after completing current one)
const scheduleNextInterview = async (req, res) => {
  try {
    const { candidate_id, job_id, scheduled_date, interviewer, location, meeting_link, notes } = req.body;

    // Validate candidate exists and is interview completed
    const candidate = await Candidate.findById(candidate_id);
    if (!candidate) {
      return res.status(404).json(createErrorResponse('Candidate not found'));
    }

    if (candidate.status !== 'Interview Completed') {
      return res.status(400).json(createErrorResponse('Candidate is not in interview completed status'));
    }

    // Validate interviewer exists
    const interviewerUser = await User.findById(interviewer);
    if (!interviewerUser) {
      return res.status(404).json(createErrorResponse('Interviewer not found'));
    }

    // Mark the latest interview as passed
    const latestInterview = await Interview.findOne({ candidate_id }).sort({ scheduled_date: -1 });
    if (latestInterview) {
      await Interview.findByIdAndUpdate(latestInterview._id, {
        result: 'Passed',
        completed_at: latestInterview.completed_at || new Date(),
      });
    }

    const interviewData = {
      candidate_id,
      job_id,
      scheduled_date: new Date(scheduled_date),
      interviewer,
      location: location || 'In-Person',
      meeting_link: location === 'Online' ? meeting_link : null,
      notes,
      scheduled_by: req.user._id,
    };

    const interview = await Interview.create(interviewData);

    // Update candidate status back to scheduled
    await Candidate.findByIdAndUpdate(candidate_id, {
      $push: { interviews: interview._id },
      status: 'Interview Scheduled',
    });

    const populatedInterview = await Interview.findById(interview._id).populate('candidate_id', 'name email application_id').populate('interviewer', 'name email').populate('scheduled_by', 'name email').select('candidate_id interviewer job_id scheduled_date location meeting_link result feedback notes scheduled_by');

    res.status(201).json(
      createSuccessResponse(
        {
          interview: populatedInterview,
        },
        'Next interview scheduled successfully'
      )
    );
  } catch (error) {
    console.error('Schedule next interview error:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json(createErrorResponse(errors.join(', ')));
    }
    res.status(500).json(createErrorResponse('Failed to schedule next interview'));
  }
};

// Complete interview
const completeInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const { candidate_id, candidateStatus, interviewResult, interviewStatus, feedback, notes } = req.body;

    // Validate required fields
    if (!candidateStatus || !interviewResult || !interviewStatus) {
      return res.status(400).json(createErrorResponse('Candidate status, interview result, and interview status are required'));
    }

    // Validate candidate status
    const validCandidateStatuses = ['Interview Completed', 'Shortlisted'];
    if (!validCandidateStatuses.includes(candidateStatus)) {
      return res.status(400).json(createErrorResponse('Invalid candidate status'));
    }

    // Validate interview result
    const validInterviewResults = ['Taken', 'Passed', 'Failed', 'No Show', 'Cancelled'];
    if (!validInterviewResults.includes(interviewResult)) {
      return res.status(400).json(createErrorResponse('Invalid interview result'));
    }

    // Validate interview status
    const validInterviewStatuses = ['Taken', 'Passed', 'Failed', 'No Show', 'Cancelled'];
    if (!validInterviewStatuses.includes(interviewStatus)) {
      return res.status(400).json(createErrorResponse('Invalid interview status'));
    }

    const interview = await Interview.findById(id);
    if (!interview) {
      return res.status(404).json(createErrorResponse('Interview not found'));
    }

    if (interview.result !== 'Pending') {
      return res.status(400).json(createErrorResponse('Interview is already completed'));
    }

    // Update interview with all the data from modal
    const interviewUpdateData = {
      result: interviewResult,
      status: interviewStatus,
      feedback: feedback || null,
      notes: notes || null,
      completed_at: new Date(),
      completed_by: req.user._id,
    };

    const updatedInterview = await Interview.findByIdAndUpdate(
      id,
      interviewUpdateData,
      { new: true }
    )
      .populate('candidate_id', 'name email application_id status')
      .populate('interviewer', 'name email')
      .populate('scheduled_by', 'name email')
      .populate('completed_by', 'name email');

    // Update candidate with new status and interview data
    const candidateUpdateData = {
      status: candidateStatus,
      'interview.result': interviewResult,
      'interview.feedback': feedback || null,
      'interview.completed_at': new Date(),
    };

    await Candidate.findByIdAndUpdate(candidate_id, candidateUpdateData);

    // Send email notifications based on candidate status
    // Email disabled per request

    res.json(
      createSuccessResponse(
        {
          interview: updatedInterview,
        },
        'Interview completed successfully'
      )
    );
  } catch (error) {
    console.error('Complete interview error:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json(createErrorResponse(errors.join(', ')));
    }
    res.status(500).json(createErrorResponse('Failed to complete interview'));
  }
};

module.exports = {
  scheduleInterview,
  scheduleNextInterview,
  getInterviews,
  getInterviewById,
  updateInterviewResult,
  rescheduleInterview,
  cancelInterview,
  getInterviewsByCandidate,
  getUpcomingInterviews,
  completeInterview,
};
