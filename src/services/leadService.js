import api from './api';

const leadService = {
  async getLeads({ page = 1, pageSize = 10, stage, score, search, inbox } = {}) {
    return api.get('/v1/leads', {
      page,
      page_size: pageSize,
      stage,
      score,
      search,
      ...(inbox ? { inbox: true } : {}),
    });
  },

  async getLead(leadId) {
    return api.get(`/v1/leads/${leadId}`);
  },

  async getLeadEvents(leadId) {
    // Lead detail already includes events; this is a convenience wrapper
    return api.get(`/v1/leads/${leadId}`).then((r) => r.events ?? []);
  },

  async getLeadAttachments(leadId) {
    return api.get(`/v1/leads/${leadId}/attachments`);
  },

  async updateLead(leadId, data) {
    return api.patch(`/v1/leads/${leadId}`, data);
  },

  async addNote(leadId, body) {
    return api.post(`/v1/leads/${leadId}/notes`, { body });
  },

  async deleteLeadAttachment(leadId, attachmentId) {
    return api.delete(`/v1/leads/${leadId}/attachments/${attachmentId}`);
  },
};

export default leadService;
