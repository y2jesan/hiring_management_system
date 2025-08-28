const { v4: uuidv4 } = require('uuid');

// Generate unique 8-character alphanumeric job ID
const generateJobId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Generate unique 8-character alphanumeric talent pool ID
const generateTalentPoolId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Generate unique application ID
const generateApplicationId = () => {
  return `APP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
};

// Generate unique task ID
const generateTaskId = () => {
  return `TASK-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
};

// Format date to readable string
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Calculate percentage
const calculatePercentage = (value, total) => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

// Validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone number format
const isValidPhone = (phone) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

// Generate pagination object
const generatePagination = (page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return {
    currentPage: page,
    totalPages,
    totalItems: total,
    itemsPerPage: limit,
    hasNextPage,
    hasPrevPage,
    nextPage: hasNextPage ? page + 1 : null,
    prevPage: hasPrevPage ? page - 1 : null,
  };
};

// Sanitize search query
const sanitizeSearchQuery = (query) => {
  if (!query) return '';
  return query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// Generate file URL
const generateFileUrl = (filePath) => {
  if (!filePath) return null;
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:4000';
  return `${baseUrl}/uploads/${filePath}`;
};

// Get status color for UI
const getStatusColor = (status) => {
  const statusColors = {
    Applied: 'bg-blue-100 text-blue-800',
    'Task Pending': 'bg-yellow-100 text-yellow-800',
    'Task Submitted': 'bg-purple-100 text-purple-800',
    'Under Review': 'bg-orange-100 text-orange-800',
    'Interview Eligible': 'bg-green-100 text-green-800',
    'Interview Scheduled': 'bg-indigo-100 text-indigo-800',
    'Interview Completed': 'bg-gray-100 text-gray-800',
    Shortlisted: 'bg-pink-100 text-pink-800',
    Selected: 'bg-green-100 text-green-800',
    Rejected: 'bg-red-100 text-red-800',
  };
  return statusColors[status] || 'bg-gray-100 text-gray-800';
};

// Get role color for UI
const getRoleColor = (role) => {
  const roleColors = {
    HR: 'bg-blue-100 text-blue-800',
    Evaluator: 'bg-green-100 text-green-800',
    MD: 'bg-purple-100 text-purple-800',
    'Super Admin': 'bg-red-100 text-red-800',
  };
  return roleColors[role] || 'bg-gray-100 text-gray-800';
};

// Format file size
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Generate random password
const generateRandomPassword = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// Validate file type
const validateFileType = (filename, allowedTypes) => {
  const ext = filename.split('.').pop().toLowerCase();
  return allowedTypes.includes(ext);
};

// Create success response
const createSuccessResponse = (data, message = 'Success') => {
  return {
    success: true,
    message,
    data,
  };
};

// Create error response
const createErrorResponse = (message, statusCode = 400) => {
  return {
    success: false,
    message,
    statusCode,
  };
};

module.exports = {
  generateJobId,
  generateTalentPoolId,
  generateApplicationId,
  generateTaskId,
  formatDate,
  calculatePercentage,
  isValidEmail,
  isValidPhone,
  generatePagination,
  sanitizeSearchQuery,
  generateFileUrl,
  getStatusColor,
  getRoleColor,
  formatFileSize,
  generateRandomPassword,
  validateFileType,
  createSuccessResponse,
  createErrorResponse,
};
