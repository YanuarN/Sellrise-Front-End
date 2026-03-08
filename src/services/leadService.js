import api from './api';

const leadService = {
  async getLeads({ page = 1, pageSize = 10, stage, score, search } = {}) {
    return api.get('/v1/leads', { page, page_size: pageSize, stage, score, search });
  },

  async getLead(leadId) {
    return api.get(`/v1/leads/${leadId}`);
  },

  async updateLead(leadId, data) {
    return api.patch(`/v1/leads/${leadId}`, data);
  },

  async addNote(leadId, body) {
    return api.post(`/v1/leads/${leadId}/notes`, { body });
  },
};

export default leadService;
