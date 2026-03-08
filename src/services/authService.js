import api from './api';

const authService = {
  async login(email, password) {
    const data = await api.post('/v1/auth/login', { email, password });
    api.setAccessToken(data.access_token);
    return data;
  },

  async logout() {
    try {
      await api.post('/v1/auth/logout');
    } finally {
      api.setAccessToken(null);
    }
  },

  async refresh() {
    const data = await api.post('/v1/auth/refresh');
    api.setAccessToken(data.access_token);
    return data;
  },

  async getMe() {
    return api.get('/v1/auth/me');
  },
};

export default authService;
