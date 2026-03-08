import api from './api';

const analyticsService = {
  async getSummary() {
    return api.get('/v1/analytics/summary');
  },
};

export default analyticsService;
