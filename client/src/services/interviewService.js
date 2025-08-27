import api from './api';

export const interviewService = {
  // Get all interviews
  getAllInterviews: async (params = {}) => {
    const response = await api.get('/interviews', { params });
    return response.data;
  },

  // Get interview by ID
  getInterviewById: async (id) => {
    const response = await api.get(`/interviews/${id}`);
    return response.data;
  },

  // Create new interview
  createInterview: async (interviewData) => {
    const response = await api.post('/interviews', interviewData);
    return response.data;
  },

  // Update interview
  updateInterview: async (id, interviewData) => {
    const response = await api.put(`/interviews/${id}`, interviewData);
    return response.data;
  },

  // Delete interview
  deleteInterview: async (id) => {
    const response = await api.delete(`/interviews/${id}`);
    return response.data;
  },

  // Schedule interview
  scheduleInterview: async (interviewData) => {
    const response = await api.post('/interviews/schedule', interviewData);
    return response.data;
  },

  // Schedule next interview
  scheduleNextInterview: async (interviewData) => {
    const response = await api.post('/interviews/schedule-next', interviewData);
    return response.data;
  },

  // Update interview result
  updateInterviewResult: async (id, resultData) => {
    const response = await api.put(`/interviews/${id}/result`, resultData);
    return response.data;
  },

  // Get interviews by candidate
  getInterviewsByCandidate: async (candidateId) => {
    const response = await api.get(`/interviews/candidate/${candidateId}`);
    return response.data;
  },

  // Complete interview
  completeInterview: async (interviewId, candidateId, completeData) => {
    const response = await api.put(`/interviews/${interviewId}/complete`, {
      candidate_id: candidateId,
      ...completeData
    });
    return response.data;
  },

  // Reschedule interview
  rescheduleInterview: async (interviewId, rescheduleData) => {
    const response = await api.put(`/interviews/${interviewId}/reschedule`, rescheduleData);
    return response.data;
  },
};
