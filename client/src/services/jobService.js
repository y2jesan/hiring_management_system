import api from './api';

export const jobService = {
  // Get all jobs
  getAllJobs: async (params = {}) => {
    const response = await api.get('/jobs', { params });
    return response.data;
  },

  // Get job by ID
  getJobById: async (id) => {
    const response = await api.get(`/jobs/${id}`);
    return response.data;
  },

  // Get job by job_id
  getJobByJobId: async (jobId) => {
    const response = await api.get(`/jobs/public/${jobId}`);
    return response.data;
  },

  // Create new job
  createJob: async (jobData) => {
    const response = await api.post('/jobs', jobData);
    return response.data;
  },

  // Update job
  updateJob: async (id, jobData) => {
    const response = await api.put(`/jobs/${id}`, jobData);
    return response.data;
  },

  // Toggle job status (activate/deactivate)
  toggleJobStatus: async (id) => {
    const response = await api.patch(`/jobs/${id}/toggle-status`);
    return response.data;
  },

  // Delete job
  deleteJob: async (id) => {
    const response = await api.delete(`/jobs/${id}`);
    return response.data;
  },

  // Upload job image
  uploadJobImage: async (id, imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await api.post(`/jobs/${id}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
