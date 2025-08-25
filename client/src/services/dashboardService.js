import api from './api';

export const dashboardService = {
  // Get dashboard statistics
  getDashboardStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },

  // Get analytics data
  getAnalytics: async (params = {}) => {
    const response = await api.get('/dashboard/analytics', { params });
    return response.data;
  },

  // Get recent activities
  getRecentActivities: async (params = {}) => {
    const response = await api.get('/dashboard/recent-activities', { params });
    return response.data;
  },

  // Get status distribution (part of analytics)
  getStatusDistribution: async () => {
    const response = await api.get('/dashboard/analytics');
    return response.data;
  },

  // Get monthly applications (part of analytics)
  getMonthlyApplications: async (year) => {
    const response = await api.get('/dashboard/analytics', { params: { year } });
    return response.data;
  },
};
