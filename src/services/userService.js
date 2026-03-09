import api from './api';

const userService = {
  async listUsers() {
    return api.get('/v1/users');
  },

  async getUser(userId) {
    return api.get(`/v1/users/${userId}`);
  },

  async createUser(data) {
    return api.post('/v1/users', data);
  },

  async updateUser(userId, data) {
    return api.patch(`/v1/users/${userId}`, data);
  },

  async deactivateUser(userId) {
    return api.delete(`/v1/users/${userId}`);
  },
};

export default userService;
