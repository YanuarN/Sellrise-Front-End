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
};

export default kbService;
