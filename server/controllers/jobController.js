const Job = require('../models/Job');
const { generateJobId, createSuccessResponse, createErrorResponse, generatePagination, sanitizeSearchQuery, generateFileUrl } = require('../helpers/utils');

// Create new job
const createJob = async (req, res) => {
  try {
    const { title, salary_range, designation, job_description, experience_in_year, task_link } = req.body;

    // Generate unique job ID
    let jobId;
    let isUnique = false;
    while (!isUnique) {
      jobId = generateJobId();
      const existingJob = await Job.findOne({ job_id: jobId });
      if (!existingJob) {
        isUnique = true;
      }
    }

    // Handle image upload
    let imagePath = null;
    if (req.file) {
      imagePath = `images/${req.file.filename}`;
    }

    const jobData = {
      title,
      salary_range,
      designation,
      job_description,
      experience_in_year,
      task_link,
      job_id: jobId,
      image: imagePath,
      created_by: req.user._id,
    };

    const job = await Job.create(jobData);

    res.status(201).json(createSuccessResponse({ job }, 'Job created successfully'));
  } catch (error) {
    console.error('Create job error:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json(createErrorResponse(errors.join(', ')));
    }
    res.status(500).json(createErrorResponse('Failed to create job'));
  }
};

// Get all jobs with pagination and filters
const getJobs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search;
    const isActive = req.query.is_active;

    const query = {};

    // Search filter
    if (search) {
      const sanitizedSearch = sanitizeSearchQuery(search);
      query.$or = [{ title: { $regex: sanitizedSearch, $options: 'i' } }, { designation: { $regex: sanitizedSearch, $options: 'i' } }, { job_id: { $regex: sanitizedSearch, $options: 'i' } }];
    }

    // Active status filter
    if (isActive !== undefined) {
      query.is_active = isActive === 'true';
    }

    const skip = (page - 1) * limit;

    const [jobs, total] = await Promise.all([Job.find(query).populate('created_by', 'name email').sort({ createdAt: -1 }).skip(skip).limit(limit), Job.countDocuments(query)]);

    // Add full image URLs
    const jobsWithUrls = jobs.map((job) => ({
      ...job.toObject(),
      image: job.image ? generateFileUrl(job.image) : null,
    }));

    const pagination = generatePagination(page, limit, total);

    res.json(
      createSuccessResponse({
        jobs: jobsWithUrls,
        pagination,
      })
    );
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json(createErrorResponse('Failed to fetch jobs'));
  }
};

// Get job by ID
const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('created_by', 'name email');

    if (!job) {
      return res.status(404).json(createErrorResponse('Job not found'));
    }

    const jobWithUrl = {
      ...job.toObject(),
      image: job.image ? generateFileUrl(job.image) : null,
    };

    res.json(createSuccessResponse({ job: jobWithUrl }));
  } catch (error) {
    console.error('Get job by ID error:', error);
    res.status(500).json(createErrorResponse('Failed to fetch job'));
  }
};

// Get job by job_id (for public access)
const getJobByJobId = async (req, res) => {
  try {
    const job = await Job.findOne({
      job_id: req.params.job_id,
      is_active: true,
    }).populate('created_by', 'name email');

    if (!job) {
      return res.status(404).json(createErrorResponse('Job not found or inactive'));
    }

    const jobWithUrl = {
      ...job.toObject(),
      image: job.image ? generateFileUrl(job.image) : null,
    };

    res.json(createSuccessResponse({ job: jobWithUrl }));
  } catch (error) {
    console.error('Get job by job_id error:', error);
    res.status(500).json(createErrorResponse('Failed to fetch job'));
  }
};

// Update job
const updateJob = async (req, res) => {
  try {
    const { title, salary_range, designation, job_description, experience_in_year, task_link, is_active } = req.body;

    const updateData = {};

    if (title !== undefined) updateData.title = title;
    if (salary_range !== undefined) updateData.salary_range = salary_range;
    if (designation !== undefined) updateData.designation = designation;
    if (job_description !== undefined) updateData.job_description = job_description;
    if (experience_in_year !== undefined) updateData.experience_in_year = experience_in_year;
    if (task_link !== undefined) updateData.task_link = task_link;
    if (is_active !== undefined) updateData.is_active = is_active;

    // Handle image upload
    if (req.file) {
      updateData.image = `images/${req.file.filename}`;
    }

    const job = await Job.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true }).populate('created_by', 'name email');

    if (!job) {
      return res.status(404).json(createErrorResponse('Job not found'));
    }

    const jobWithUrl = {
      ...job.toObject(),
      image: job.image ? generateFileUrl(job.image) : null,
    };

    res.json(createSuccessResponse({ job: jobWithUrl }, 'Job updated successfully'));
  } catch (error) {
    console.error('Update job error:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json(createErrorResponse(errors.join(', ')));
    }
    res.status(500).json(createErrorResponse('Failed to update job'));
  }
};

// Delete job
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);

    if (!job) {
      return res.status(404).json(createErrorResponse('Job not found'));
    }

    res.json(createSuccessResponse(null, 'Job deleted successfully'));
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json(createErrorResponse('Failed to delete job'));
  }
};

// Toggle job active status
const toggleJobStatus = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json(createErrorResponse('Job not found'));
    }

    job.is_active = !job.is_active;
    await job.save();

    res.json(
      createSuccessResponse({
        job,
        message: `Job ${job.is_active ? 'activated' : 'deactivated'} successfully`,
      })
    );
  } catch (error) {
    console.error('Toggle job status error:', error);
    res.status(500).json(createErrorResponse('Failed to toggle job status'));
  }
};

// Get active jobs (for public access)
const getActiveJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ is_active: true }).populate('created_by', 'name email').sort({ createdAt: -1 });

    const jobsWithUrls = jobs.map((job) => ({
      ...job.toObject(),
      image: job.image ? generateFileUrl(job.image) : null,
    }));

    res.json(createSuccessResponse({ jobs: jobsWithUrls }));
  } catch (error) {
    console.error('Get active jobs error:', error);
    res.status(500).json(createErrorResponse('Failed to fetch active jobs'));
  }
};

// Get public active jobs (for candidates - limited data)
const getPublicActiveJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ is_active: true })
      .select('title designation job_description experience_in_year salary_range job_id image createdAt')
      .sort({ createdAt: -1 });

    const jobsWithUrls = jobs.map((job) => ({
      _id: job._id,
      title: job.title,
      designation: job.designation,
      job_description: job.job_description,
      experience_in_year: job.experience_in_year,
      salary_range: job.salary_range,
      job_id: job.job_id,
      image: job.image ? generateFileUrl(job.image) : null,
      createdAt: job.createdAt,
    }));

    res.json(createSuccessResponse({ jobs: jobsWithUrls }));
  } catch (error) {
    console.error('Get public active jobs error:', error);
    res.status(500).json(createErrorResponse('Failed to fetch active jobs'));
  }
};

module.exports = {
  createJob,
  getJobs,
  getJobById,
  getJobByJobId,
  updateJob,
  deleteJob,
  toggleJobStatus,
  getActiveJobs,
  getPublicActiveJobs,
};
