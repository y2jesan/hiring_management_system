const Candidate = require('../models/Candidate');
const Job = require('../models/Job');
const { generateApplicationId, createSuccessResponse, createErrorResponse, generatePagination, sanitizeSearchQuery, generateFileUrl } = require('../helpers/utils');
const { sendApplicationConfirmation, sendTaskSubmittedNotification, sendSelectionNotification, sendRejectionNotification } = require('../helpers/emailService');

// Apply for job (public endpoint)
const applyForJob = async (req, res) => {
  try {
    console.log('applyForJob - Request body:', req.body);
    console.log('applyForJob - Request file:', req.file);
    console.log('applyForJob - Request headers:', req.headers);

    const { name, email, phone } = req.body;
    const { job_id } = req.params;

    // Validate job exists and is active
    const job = await Job.findOne({ job_id, is_active: true });
    if (!job) {
      return res.status(404).json(createErrorResponse('Job not found or inactive'));
    }

    // Check if candidate already applied for this job
    const existingApplication = await Candidate.findOne({
      email: email.toLowerCase(),
      job_id: job._id,
    });

    if (existingApplication) {
      return res.status(400).json(createErrorResponse('You have already applied for this position'));
    }

    // Handle CV upload
    if (!req.file) {
      return res.status(400).json(createErrorResponse('CV file is required. Please upload a PDF, DOC, or DOCX file.'));
    }

    const cvPath = `cvs/${req.file.filename}`;
    const applicationId = generateApplicationId();

    const candidateData = {
      name,
      email: email.toLowerCase(),
      phone,
      cv_file_path: cvPath,
      application_id: applicationId,
      job_id: job._id,
      status: 'Applied',
    };

    const candidate = await Candidate.create(candidateData);

    // Send confirmation email
    const taskLink = job.task_link || `${process.env.FRONTEND_URL}/task-instructions`;
    const submissionLink = `${process.env.FRONTEND_URL}/application/${applicationId}`;

    await sendApplicationConfirmation(candidate.email, candidate.name, candidate.application_id, taskLink, submissionLink);

    res.status(201).json(
      createSuccessResponse(
        {
          candidate: {
            _id: candidate._id,
            name: candidate.name,
            email: candidate.email,
            application_id: candidate.application_id,
            status: candidate.status,
          },
        },
        'Application submitted successfully. Check your email for further instructions.'
      )
    );
  } catch (error) {
    console.error('Apply for job error:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json(createErrorResponse(errors.join(', ')));
    }
    res.status(500).json(createErrorResponse('Failed to submit application'));
  }
};

// Get all candidates with filters and pagination
const getCandidates = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search;
    const status = req.query.status;
    const jobId = req.query.job_id;

    const query = {};

    // Search filter
    if (search) {
      const sanitizedSearch = sanitizeSearchQuery(search);
      query.$or = [{ name: { $regex: sanitizedSearch, $options: 'i' } }, { email: { $regex: sanitizedSearch, $options: 'i' } }, { application_id: { $regex: sanitizedSearch, $options: 'i' } }];
    }

    // Status filter
    if (status) {
      query.status = status;
    }

    // Job filter
    if (jobId) {
      // Find job by job_id field first, then use its ObjectId
      const job = await Job.findOne({ job_id: jobId });
      if (job) {
        query.job_id = job._id;
      } else {
        // If job not found, return empty results
        return res.json(
          createSuccessResponse({
            candidates: [],
            pagination: generatePagination(page, limit, 0),
          })
        );
      }
    }

    const skip = (page - 1) * limit;

    const [candidates, total] = await Promise.all([Candidate.find(query).populate('job_id', 'title designation job_id').populate('evaluation.evaluated_by', 'name email').populate('interview.interviewer', 'name email').populate('final_selection.selected_by', 'name email').sort({ createdAt: -1 }).skip(skip).limit(limit), Candidate.countDocuments(query)]);

    // Add full file URLs
    const candidatesWithUrls = candidates.map((candidate) => ({
      ...candidate.toObject(),
      cv_file_path: candidate.cv_file_path ? generateFileUrl(candidate.cv_file_path) : null,
    }));

    const pagination = generatePagination(page, limit, total);

    res.json(
      createSuccessResponse({
        candidates: candidatesWithUrls,
        pagination,
      })
    );
  } catch (error) {
    console.error('Get candidates error:', error);
    res.status(500).json(createErrorResponse('Failed to fetch candidates'));
  }
};

// Get candidate by ID
const getCandidateById = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id).populate('job_id', 'title designation job_id task_link').populate('evaluation.evaluated_by', 'name email').populate('interview.interviewer', 'name email').populate('final_selection.selected_by', 'name email');

    if (!candidate) {
      return res.status(404).json(createErrorResponse('Candidate not found'));
    }

    const candidateWithUrls = {
      ...candidate.toObject(),
      cv_file_path: candidate.cv_file_path ? generateFileUrl(candidate.cv_file_path) : null,
    };

    res.json(createSuccessResponse({ candidate: candidateWithUrls }));
  } catch (error) {
    console.error('Get candidate by ID error:', error);
    res.status(500).json(createErrorResponse('Failed to fetch candidate'));
  }
};

// Get candidate by application ID (for candidate portal)
const getCandidateByApplicationId = async (req, res) => {
  try {
    const candidate = await Candidate.findOne({ application_id: req.params.application_id }).populate('job_id', 'title designation job_id task_link');

    if (!candidate) {
      return res.status(404).json(createErrorResponse('Application not found'));
    }

    const candidateWithUrls = {
      ...candidate.toObject(),
      cv_file_path: candidate.cv_file_path ? generateFileUrl(candidate.cv_file_path) : null,
    };

    res.json(createSuccessResponse({ candidate: candidateWithUrls }));
  } catch (error) {
    console.error('Get candidate by application ID error:', error);
    res.status(500).json(createErrorResponse('Failed to fetch application'));
  }
};

// Submit task (for candidate portal)
const submitTask = async (req, res) => {
  try {
    const { links } = req.body;
    const { application_id } = req.params;

    const candidate = await Candidate.findOne({ application_id });
    if (!candidate) {
      return res.status(404).json(createErrorResponse('Application not found'));
    }

    if (candidate.status !== 'Applied' && candidate.status !== 'Task Pending') {
      return res.status(400).json(createErrorResponse('Task submission is not allowed at this stage'));
    }

    // Validate links array
    if (!links || !Array.isArray(links) || links.length === 0) {
      return res.status(400).json(createErrorResponse('At least one link is required'));
    }

    if (links.length > 10) {
      return res.status(400).json(createErrorResponse('Maximum 10 links allowed'));
    }

    // Validate each link
    for (const link of links) {
      if (!link.url || typeof link.url !== 'string') {
        return res.status(400).json(createErrorResponse('Invalid link URL'));
      }

      // Basic URL validation
      try {
        new URL(link.url);
      } catch {
        return res.status(400).json(createErrorResponse('Invalid URL format'));
      }
    }

    const updateData = {
      status: 'Task Submitted',
      'task_submission.links': links,
      'task_submission.submitted_at': new Date(),
    };

    const updatedCandidate = await Candidate.findByIdAndUpdate(candidate._id, updateData, { new: true }).populate('job_id', 'title designation');

    // Send task submitted notification
    await sendTaskSubmittedNotification(candidate.email, candidate.name, candidate.application_id);

    res.json(
      createSuccessResponse(
        {
          candidate: updatedCandidate,
        },
        'Task submitted successfully'
      )
    );
  } catch (error) {
    console.error('Submit task error:', error);
    res.status(500).json(createErrorResponse('Failed to submit task'));
  }
};

// Evaluate candidate
const evaluateCandidate = async (req, res) => {
  try {
    const { score, comments } = req.body;
    const { id } = req.params;

    if (score < 0 || score > 100) {
      return res.status(400).json(createErrorResponse('Score must be between 0 and 100'));
    }

    const candidate = await Candidate.findById(id);
    if (!candidate) {
      return res.status(404).json(createErrorResponse('Candidate not found'));
    }

    if (candidate.status !== 'Task Submitted') {
      return res.status(400).json(createErrorResponse('Candidate is not in task submitted status'));
    }

    // Determine new status based on score
    let newStatus = 'Under Review';
    if (score >= 60) {
      newStatus = 'Interview Eligible';
    }

    const updateData = {
      status: newStatus,
      evaluation: {
        score,
        evaluated_by: req.user._id,
        evaluated_at: new Date(),
        comments,
      },
    };

    const updatedCandidate = await Candidate.findByIdAndUpdate(id, updateData, { new: true }).populate('evaluation.evaluated_by', 'name email');

    res.json(
      createSuccessResponse(
        {
          candidate: updatedCandidate,
        },
        'Candidate evaluated successfully'
      )
    );
  } catch (error) {
    console.error('Evaluate candidate error:', error);
    res.status(500).json(createErrorResponse('Failed to evaluate candidate'));
  }
};

// Update candidate status
const updateCandidateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    const validStatuses = ['Applied', 'Task Pending', 'Task Submitted', 'Under Review', 'Interview Eligible', 'Interview Scheduled', 'Interview Completed', 'Shortlisted', 'Selected', 'Rejected'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json(createErrorResponse('Invalid status'));
    }

    const candidate = await Candidate.findById(id);
    if (!candidate) {
      return res.status(404).json(createErrorResponse('Candidate not found'));
    }

    candidate.status = status;
    await candidate.save();

    res.json(
      createSuccessResponse(
        {
          candidate,
        },
        'Candidate status updated successfully'
      )
    );
  } catch (error) {
    console.error('Update candidate status error:', error);
    res.status(500).json(createErrorResponse('Failed to update candidate status'));
  }
};

// Final selection
const finalSelection = async (req, res) => {
  try {
    const { selected, offer_letter_path } = req.body;
    const { id } = req.params;

    const candidate = await Candidate.findById(id);
    if (!candidate) {
      return res.status(404).json(createErrorResponse('Candidate not found'));
    }

    const updateData = {
      'final_selection.selected': selected,
      'final_selection.selected_by': req.user._id,
      'final_selection.selected_at': new Date(),
      status: selected ? 'Selected' : 'Rejected',
    };

    if (offer_letter_path) {
      updateData['final_selection.offer_letter_path'] = offer_letter_path;
    }

    const updatedCandidate = await Candidate.findByIdAndUpdate(id, updateData, { new: true }).populate('final_selection.selected_by', 'name email');

    // Send notification email
    if (selected) {
      await sendSelectionNotification(candidate.email, candidate.name, candidate.application_id);
    } else {
      await sendRejectionNotification(candidate.email, candidate.name, candidate.application_id);
    }

    res.json(
      createSuccessResponse(
        {
          candidate: updatedCandidate,
        },
        `Candidate ${selected ? 'selected' : 'rejected'} successfully`
      )
    );
  } catch (error) {
    console.error('Final selection error:', error);
    res.status(500).json(createErrorResponse('Failed to update final selection'));
  }
};

// Delete candidate
const deleteCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findByIdAndDelete(req.params.id);

    if (!candidate) {
      return res.status(404).json(createErrorResponse('Candidate not found'));
    }

    res.json(createSuccessResponse(null, 'Candidate deleted successfully'));
  } catch (error) {
    console.error('Delete candidate error:', error);
    res.status(500).json(createErrorResponse('Failed to delete candidate'));
  }
};

module.exports = {
  applyForJob,
  getCandidates,
  getCandidateById,
  getCandidateByApplicationId,
  submitTask,
  evaluateCandidate,
  updateCandidateStatus,
  finalSelection,
  deleteCandidate,
};
