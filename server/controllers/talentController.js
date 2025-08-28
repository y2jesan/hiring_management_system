const Talent = require('../models/Talent');
const { generateTalentPoolId, createSuccessResponse, createErrorResponse, generatePagination, sanitizeSearchQuery, generateFileUrl } = require('../helpers/utils');

// Create new talent
const createTalent = async (req, res) => {
  try {
    const { 
      name, 
      email, 
      phone, 
      years_of_experience, 
      expected_salary, 
      notice_period_in_months, 
      current_employment_status, 
      current_company_name, 
      core_experience 
    } = req.body;

    // Generate unique talent pool ID
    let talentPoolId;
    let isUnique = false;
    while (!isUnique) {
      talentPoolId = generateTalentPoolId();
      const existingTalent = await Talent.findOne({ talent_pool_id: talentPoolId });
      if (!existingTalent) {
        isUnique = true;
      }
    }

    // Handle CV file upload
    let cvFilePath = null;
    if (req.file) {
      cvFilePath = `cvs/${req.file.filename}`;
    }

    const talentData = {
      name,
      email,
      phone,
      years_of_experience,
      expected_salary,
      notice_period_in_months,
      current_employment_status: current_employment_status === 'true',
      current_company_name: current_company_name || null,
      core_experience: Array.isArray(core_experience) ? core_experience : [core_experience],
      cv_file_path: cvFilePath,
      talent_pool_id: talentPoolId,
    };

    const talent = await Talent.create(talentData);

    res.status(201).json(createSuccessResponse({ talent }, 'Talent profile submitted successfully'));
  } catch (error) {
    console.error('Create talent error:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json(createErrorResponse(errors.join(', ')));
    }
    res.status(500).json(createErrorResponse('Failed to submit talent profile'));
  }
};

// Get all talents with pagination and filters
const getTalents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search;
    const isActive = req.query.is_active;
    const currentEmploymentStatus = req.query.current_employment_status;

    const query = {};

    // Search filter
    if (search) {
      const sanitizedSearch = sanitizeSearchQuery(search);
      query.$or = [
        { name: { $regex: sanitizedSearch, $options: 'i' } },
        { email: { $regex: sanitizedSearch, $options: 'i' } },
        { talent_pool_id: { $regex: sanitizedSearch, $options: 'i' } },
        { current_company_name: { $regex: sanitizedSearch, $options: 'i' } }
      ];
    }

    // Active status filter
    if (isActive !== undefined) {
      query.is_active = isActive === 'true';
    }

    // Current employment status filter
    if (currentEmploymentStatus !== undefined) {
      query.current_employment_status = currentEmploymentStatus === 'true';
    }

    const skip = (page - 1) * limit;

    const [talents, total] = await Promise.all([
      Talent.find(query)
        .populate('reference', 'name email')
        .populate('core_experience', 'name')
        .sort({ submission_date: -1 })
        .skip(skip)
        .limit(limit),
      Talent.countDocuments(query)
    ]);

    // Add full CV URLs
    const talentsWithUrls = talents.map((talent) => ({
      ...talent.toObject(),
      cv_file_path: talent.cv_file_path ? generateFileUrl(talent.cv_file_path) : null,
    }));

    const pagination = generatePagination(page, limit, total);

    res.json(
      createSuccessResponse({
        talents: talentsWithUrls,
        pagination,
      })
    );
  } catch (error) {
    console.error('Get talents error:', error);
    res.status(500).json(createErrorResponse('Failed to fetch talents'));
  }
};

// Get talent by ID
const getTalentById = async (req, res) => {
  try {
    const talent = await Talent.findById(req.params.id)
      .populate('reference', 'name email')
      .populate('core_experience', 'name');

    if (!talent) {
      return res.status(404).json(createErrorResponse('Talent not found'));
    }

    const talentWithUrl = {
      ...talent.toObject(),
      cv_file_path: talent.cv_file_path ? generateFileUrl(talent.cv_file_path) : null,
    };

    res.json(createSuccessResponse({ talent: talentWithUrl }));
  } catch (error) {
    console.error('Get talent by ID error:', error);
    res.status(500).json(createErrorResponse('Failed to fetch talent'));
  }
};

// Get talent by talent_pool_id
const getTalentByTalentPoolId = async (req, res) => {
  try {
    const talent = await Talent.findOne({
      talent_pool_id: req.params.talent_pool_id,
      is_active: true,
    })
      .populate('reference', 'name email')
      .populate('core_experience', 'name');

    if (!talent) {
      return res.status(404).json(createErrorResponse('Talent not found or inactive'));
    }

    const talentWithUrl = {
      ...talent.toObject(),
      cv_file_path: talent.cv_file_path ? generateFileUrl(talent.cv_file_path) : null,
    };

    res.json(createSuccessResponse({ talent: talentWithUrl }));
  } catch (error) {
    console.error('Get talent by talent_pool_id error:', error);
    res.status(500).json(createErrorResponse('Failed to fetch talent'));
  }
};

// Update talent
const updateTalent = async (req, res) => {
  try {
    const { 
      name, 
      email, 
      phone, 
      years_of_experience, 
      expected_salary, 
      notice_period_in_months, 
      current_employment_status, 
      current_company_name, 
      core_experience, 
      is_active, 
      reference 
    } = req.body;

    const updateData = {};

    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (years_of_experience !== undefined) updateData.years_of_experience = years_of_experience;
    if (expected_salary !== undefined) updateData.expected_salary = expected_salary;
    if (notice_period_in_months !== undefined) updateData.notice_period_in_months = notice_period_in_months;
    if (current_employment_status !== undefined) updateData.current_employment_status = current_employment_status === 'true';
    if (current_company_name !== undefined) updateData.current_company_name = current_company_name;
    if (core_experience !== undefined) updateData.core_experience = Array.isArray(core_experience) ? core_experience : [core_experience];
    if (is_active !== undefined) updateData.is_active = is_active;
    if (reference !== undefined) updateData.reference = reference;

    // Handle CV file upload
    if (req.file) {
      updateData.cv_file_path = `cvs/${req.file.filename}`;
    }

    const talent = await Talent.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true })
      .populate('reference', 'name email')
      .populate('core_experience', 'name');

    if (!talent) {
      return res.status(404).json(createErrorResponse('Talent not found'));
    }

    const talentWithUrl = {
      ...talent.toObject(),
      cv_file_path: talent.cv_file_path ? generateFileUrl(talent.cv_file_path) : null,
    };

    res.json(createSuccessResponse({ talent: talentWithUrl }, 'Talent updated successfully'));
  } catch (error) {
    console.error('Update talent error:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json(createErrorResponse(errors.join(', ')));
    }
    res.status(500).json(createErrorResponse('Failed to update talent'));
  }
};

// Delete talent
const deleteTalent = async (req, res) => {
  try {
    const talent = await Talent.findByIdAndDelete(req.params.id);

    if (!talent) {
      return res.status(404).json(createErrorResponse('Talent not found'));
    }

    res.json(createSuccessResponse(null, 'Talent deleted successfully'));
  } catch (error) {
    console.error('Delete talent error:', error);
    res.status(500).json(createErrorResponse('Failed to delete talent'));
  }
};

// Toggle talent active status
const toggleTalentStatus = async (req, res) => {
  try {
    const talent = await Talent.findById(req.params.id);

    if (!talent) {
      return res.status(404).json(createErrorResponse('Talent not found'));
    }

    talent.is_active = !talent.is_active;
    await talent.save();

    // Populate the talent before sending response
    const populatedTalent = await Talent.findById(talent._id)
      .populate('reference', 'name email')
      .populate('core_experience', 'name');

    const talentWithUrl = {
      ...populatedTalent.toObject(),
      cv_file_path: populatedTalent.cv_file_path ? generateFileUrl(populatedTalent.cv_file_path) : null,
    };

    res.json(
      createSuccessResponse({
        talent: talentWithUrl,
        message: `Talent ${talent.is_active ? 'activated' : 'deactivated'} successfully`,
      })
    );
  } catch (error) {
    console.error('Toggle talent status error:', error);
    res.status(500).json(createErrorResponse('Failed to toggle talent status'));
  }
};

// Export talents
const exportTalents = async (req, res) => {
  try {
    const { current_employment_status, min_experience, min_salary } = req.query;

    const query = {};

    if (current_employment_status !== undefined) {
      query.current_employment_status = current_employment_status === 'true';
    }

    if (min_experience) {
      query.years_of_experience = { $gte: parseFloat(min_experience) };
    }

    if (min_salary) {
      query.expected_salary = { $gte: parseFloat(min_salary) };
    }

    const talents = await Talent.find(query)
      .populate('reference', 'name email')
      .populate('core_experience', 'name')
      .sort({ submission_date: -1 });

    // Transform data for Excel export
    const exportData = talents.map((talent, index) => ({
      'No.': index + 1,
      'Talent Pool ID': talent.talent_pool_id,
      'Name': talent.name,
      'Email': talent.email,
      'Phone': talent.phone,
      'Years of Experience': talent.years_of_experience,
      'Expected Salary (BDT)': talent.expected_salary,
      'Notice Period (Months)': talent.notice_period_in_months,
      'Currently Employed': talent.current_employment_status ? 'Yes' : 'No',
      'Current Company': talent.current_company_name || 'N/A',
      'Core Experience': talent.core_experience.map(exp => exp.name).join(', '),
      'Reference': talent.reference ? `${talent.reference.name} (${talent.reference.email})` : 'N/A',
      'Status': talent.is_active ? 'Active' : 'Inactive',
      'Submission Date': talent.submission_date.toLocaleDateString(),
    }));

    // Set headers for Excel download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=talents.xlsx');

    // For now, return JSON data - you can implement Excel generation later
    res.json(createSuccessResponse({ talents: exportData }));
  } catch (error) {
    console.error('Export talents error:', error);
    res.status(500).json(createErrorResponse('Failed to export talents'));
  }
};

module.exports = {
  createTalent,
  getTalents,
  getTalentById,
  getTalentByTalentPoolId,
  updateTalent,
  deleteTalent,
  toggleTalentStatus,
  exportTalents,
};
