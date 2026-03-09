import api from './api';

const analyticsService = {
  async getSummary() {
    return api.analytics.getSummary();
  },

  async getFunnel(params) {
    return api.analytics.getFunnel(params);
  },

  async getSources(params) {
    return api.analytics.getSources(params);
  },

  async getDropoff(params) {
    return api.analytics.getDropoff(params);
  },

  async exportLeads(params) {
    return api.analytics.exportLeads(params);
  },
};


export default analyticsService;
