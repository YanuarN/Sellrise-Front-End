import api from './api';

const domainService = {
  async getDomains() {
    return api.get('/v1/domains');
  },

  async addDomain(domain) {
    return api.post('/v1/domains', { domain });
  },

  async removeDomain(domainId) {
    return api.delete(`/v1/domains/${domainId}`);
  },

  async updateDomain(domainId, data) {
    return api.patch(`/v1/domains/${domainId}`, data);
  },
};

export default domainService;
