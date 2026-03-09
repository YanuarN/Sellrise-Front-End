import api from './api';

const scenarioService = {
  async getScenarios() {
    return api.get('/v1/scenarios');
  },

  async getScenario(id) {
    return api.get(`/v1/scenarios/${id}`);
  },

  async createScenario(data) {
    return api.post('/v1/scenarios', data);
  },

  async updateScenario(id, data) {
    return api.patch(`/v1/scenarios/${id}`, data);
  },

  async deleteScenario(id) {
    return api.delete(`/v1/scenarios/${id}`);
  },

  async publishScenario(id) {
    return api.post(`/v1/scenarios/${id}/publish`);
  },
};

export default scenarioService;
