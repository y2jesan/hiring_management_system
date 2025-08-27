const Experience = require('../models/Experience');

// Get all experiences
const getAllExperiences = async (req, res) => {
  try {
    const { active, search } = req.query;

    let query = {};

    // Filter by active status if provided
    if (active !== undefined) {
      query.active = active === 'true';
    }

    // Search by name if provided
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const experiences = await Experience.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        experiences,
        total: experiences.length,
      },
    });
  } catch (error) {
    console.error('Error fetching experiences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch experiences',
      error: error.message,
    });
  }
};

// Get single experience by ID
const getExperienceById = async (req, res) => {
  try {
    const { id } = req.params;

    const experience = await Experience.findById(id);

    if (!experience) {
      return res.status(404).json({
        success: false,
        message: 'Experience not found',
      });
    }

    res.json({
      success: true,
      data: { experience },
    });
  } catch (error) {
    console.error('Error fetching experience:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch experience',
      error: error.message,
    });
  }
};

// Create new experience
const createExperience = async (req, res) => {
  try {
    const { name, active } = req.body;

    // Check if experience with same name already exists
    const existingExperience = await Experience.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });

    if (existingExperience) {
      return res.status(400).json({
        success: false,
        message: 'Experience with this name already exists',
      });
    }

    const experience = new Experience({
      name,
      active: active !== undefined ? active : true,
    });

    await experience.save();

    res.status(201).json({
      success: true,
      message: 'Experience created successfully',
      data: { experience },
    });
  } catch (error) {
    console.error('Error creating experience:', error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: Object.values(error.errors).map((err) => err.message),
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create experience',
      error: error.message,
    });
  }
};

// Update experience
const updateExperience = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, active } = req.body;

    const experience = await Experience.findById(id);

    if (!experience) {
      return res.status(404).json({
        success: false,
        message: 'Experience not found',
      });
    }

    // Check if name is being updated and if it conflicts with existing experience
    if (name && name !== experience.name) {
      const existingExperience = await Experience.findOne({
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: id },
      });

      if (existingExperience) {
        return res.status(400).json({
          success: false,
          message: 'Experience with this name already exists',
        });
      }
    }

    // Update fields
    if (name !== undefined) experience.name = name;
    if (active !== undefined) experience.active = active;

    await experience.save();

    res.json({
      success: true,
      message: 'Experience updated successfully',
      data: { experience },
    });
  } catch (error) {
    console.error('Error updating experience:', error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: Object.values(error.errors).map((err) => err.message),
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update experience',
      error: error.message,
    });
  }
};

// Delete experience
const deleteExperience = async (req, res) => {
  try {
    const { id } = req.params;

    const experience = await Experience.findById(id);

    if (!experience) {
      return res.status(404).json({
        success: false,
        message: 'Experience not found',
      });
    }

    await Experience.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Experience deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting experience:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete experience',
      error: error.message,
    });
  }
};

// Toggle experience active status
const toggleExperienceStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const experience = await Experience.findById(id);

    if (!experience) {
      return res.status(404).json({
        success: false,
        message: 'Experience not found',
      });
    }

    experience.active = !experience.active;
    await experience.save();

    res.json({
      success: true,
      message: `Experience ${experience.active ? 'activated' : 'deactivated'} successfully`,
      data: { experience },
    });
  } catch (error) {
    console.error('Error toggling experience status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle experience status',
      error: error.message,
    });
  }
};

module.exports = {
  getAllExperiences,
  getExperienceById,
  createExperience,
  updateExperience,
  deleteExperience,
  toggleExperienceStatus,
};
