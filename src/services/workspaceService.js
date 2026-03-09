import api from './api';

const workspaceService = {
  async listWorkspaces() {
    return api.get('/v1/workspaces');
  },

  async getWorkspace(workspaceId) {
    return api.get(`/v1/workspaces/${workspaceId}`);
  },

  async getCurrentWorkspace() {
    const items = await api.get('/v1/workspaces');
    return Array.isArray(items) && items.length > 0 ? items[0] : null;
  },

  async createWorkspace(data) {
    return api.post('/v1/workspaces', data);
  },

  async updateWorkspace(workspaceId, data) {
    return api.patch(`/v1/workspaces/${workspaceId}`, data);
  },

  async deleteWorkspace(workspaceId) {
    return api.delete(`/v1/workspaces/${workspaceId}`);
  },
};

export default workspaceService;
