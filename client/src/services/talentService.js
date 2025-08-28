import api from './api';

export const talentService = {
  // Create new talent (public)
  createTalent: async (formData) => {
    const response = await api.post('/talents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get all talents (admin)
  getAllTalents: async (params = {}) => {
    const response = await api.get('/talents', { params });
    return response.data;
  },

  // Get talent by ID (admin)
  getTalentById: async (id) => {
    const response = await api.get(`/talents/${id}`);
    return response.data;
  },

  // Get talent by talent pool ID (public)
  getTalentByTalentPoolId: async (talentPoolId) => {
    const response = await api.get(`/talents/public/${talentPoolId}`);
    return response.data;
  },

  // Update talent (admin)
  updateTalent: async (id, data) => {
    const response = await api.put(`/talents/${id}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update talent by talent pool ID (public - for candidates)
  updateTalentByTalentPoolId: async (talentPoolId, data) => {
    const response = await api.put(`/talents/public/${talentPoolId}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete talent (admin)
  deleteTalent: async (id) => {
    const response = await api.delete(`/talents/${id}`);
    return response.data;
  },

  // Toggle talent status (admin)
  toggleTalentStatus: async (id) => {
    const response = await api.patch(`/talents/${id}/toggle-status`);
    return response.data;
  },

  // Export talents (admin)
  exportTalents: async (params = {}) => {
    const response = await api.get('/talents/export', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },
};
