import api from './api';

const authService = {
  async login(email, password) {
    const data = await api.post('/v1/auth/login', { email, password }, {
      skipAuth: true,
      skipAuthRefresh: true,
    });
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
    const refreshed = await api.refreshToken();

    if (!refreshed) {
      throw new Error('Session expired');
    }

    return {
      access_token: api.getAccessToken(),
      token_type: 'bearer',
    };
  },

  async getMe() {
    return api.get('/v1/auth/me');
  },
};

export default authService;
