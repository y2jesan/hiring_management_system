import api from './api';

export const candidateService = {
  // Get all candidates
  getAllCandidates: async (params = {}) => {
    const response = await api.get('/candidates', { params });
    return response.data;
  },

  // Get candidate by ID
  getCandidateById: async (id) => {
    const response = await api.get(`/candidates/${id}`);
    return response.data;
  },

  // Get candidate by application ID
  getCandidateByApplicationId: async (applicationId) => {
    const response = await api.get(`/candidates/application/${applicationId}`);
    return response.data;
  },

  // Create new candidate (job application)
  createCandidate: async (jobId, candidateData) => {
    // If candidateData is FormData, don't set Content-Type header
    const config = candidateData instanceof FormData ? {} : {};
    const response = await api.post(`/candidates/apply/${jobId}`, candidateData, config);
    return response.data;
  },

  // Update candidate
  updateCandidate: async (id, candidateData) => {
    const response = await api.put(`/candidates/${id}`, candidateData);
    return response.data;
  },

  // Delete candidate
  deleteCandidate: async (id) => {
    const response = await api.delete(`/candidates/${id}`);
    return response.data;
  },

  // Upload CV (handled in job application)
  uploadCV: async (id, cvFile) => {
    const formData = new FormData();
    formData.append('cv', cvFile);
    
    const response = await api.post(`/candidates/${id}/cv`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Submit task
  submitTask: async (applicationId, taskData) => {
    const response = await api.post(`/candidates/application/${applicationId}/submit-task`, taskData);
    return response.data;
  },

  // Evaluate candidate
  evaluateCandidate: async (id, evaluationData) => {
    const response = await api.post(`/candidates/${id}/evaluate`, evaluationData);
    return response.data;
  },

  // Update candidate status
  updateStatus: async (id, status) => {
    const response = await api.patch(`/candidates/${id}/status`, { status });
    return response.data;
  },

  // Export candidates
  exportCandidates: async (params = {}) => {
    const response = await api.get('/candidates/export', { 
      params,
      responseType: 'blob'
    });
    return response.data;
  }
};
