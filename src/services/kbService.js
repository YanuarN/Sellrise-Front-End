import api from './api';

const kbService = {
  // Articles
  async getArticles({ category, search } = {}) {
    return api.get('/v1/kb/articles', { category, search });
  },

  async getArticle(id) {
    return api.get(`/v1/kb/articles/${id}`);
  },

  async createArticle(data) {
    return api.post('/v1/kb/articles', data);
  },

  async updateArticle(id, data) {
    return api.patch(`/v1/kb/articles/${id}`, data);
  },

  async deleteArticle(id) {
    return api.delete(`/v1/kb/articles/${id}`);
  },

  // FAQs
  async getFaqs({ category, search } = {}) {
    return api.get('/v1/kb/faqs', { category, search });
  },

  async getFaq(id) {
    return api.get(`/v1/kb/faqs/${id}`);
  },

  async createFaq(data) {
    return api.post('/v1/kb/faqs', data);
  },

  async updateFaq(id, data) {
    return api.patch(`/v1/kb/faqs/${id}`, data);
  },

  async deleteFaq(id) {
    return api.delete(`/v1/kb/faqs/${id}`);
  },

  // Documents — upload & auto-process
  async uploadDocument(file) {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('access_token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

    const baseURL = api.baseURL || import.meta.env.VITE_API_URL || 'http://localhost:8000';

    const response = await fetch(`${baseURL}/v1/kb/upload-document`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Upload failed' }));
      const msg = typeof error.detail === 'string' ? error.detail : error.detail?.message || 'Document upload failed';
      const err = new Error(msg);
      err.status = response.status;
      err.data = error;
      throw err;
    }

    return response.json();
  },

  async getDocuments({ status } = {}) {
    return api.get('/v1/kb/documents', { status });
  },

  async getDocument(id) {
    return api.get(`/v1/kb/documents/${id}`);
  },

  async deleteDocument(id) {
    return api.delete(`/v1/kb/documents/${id}`);
  },
};

export default kbService;
