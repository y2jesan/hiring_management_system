import api from './api';

export const experienceService = {
  // Get all experiences
  getAllExperiences: async (params = {}) => {
    const queryParams = new URLSearchParams();

    if (params.active !== undefined) {
      queryParams.append('active', params.active);
    }

    if (params.search) {
      queryParams.append('search', params.search);
    }

    const queryString = queryParams.toString();
    const url = queryString ? `/experiences?${queryString}` : '/experiences';

    const response = await api.get(url);
    return response.data;
  },

  // Get active experiences for selection
  getActiveExperiences: async () => {
    const response = await api.get('/experiences?active=true');
    return response.data;
  },

  // Get single experience by ID
  getExperienceById: async (id) => {
    const response = await api.get(`/experiences/${id}`);
    return response.data;
  },

  // Create new experience
  createExperience: async (experienceData) => {
    const response = await api.post('/experiences', experienceData);
    return response.data;
  },

  // Update experience
  updateExperience: async (id, experienceData) => {
    const response = await api.put(`/experiences/${id}`, experienceData);
    return response.data;
  },

  // Delete experience
  deleteExperience: async (id) => {
    const response = await api.delete(`/experiences/${id}`);
    return response.data;
  },

  // Toggle experience status
  toggleExperienceStatus: async (id) => {
    const response = await api.patch(`/experiences/${id}/toggle`);
    return response.data;
  },
};
