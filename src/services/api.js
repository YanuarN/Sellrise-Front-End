/**
 * API Service for Sellrise Platform
 * Handles all backend API communications
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

class ApiService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/v1`;
  }

  /**
   * Get auth token from localStorage
   */
  getAuthToken() {
    return localStorage.getItem('access_token');
  }

  /**
   * Generic request handler
   */
  async request(endpoint, options = {}) {
    const token = this.getAuthToken();
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Request failed' }));
        throw new Error(error.detail || `HTTP ${response.status}`);
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  /**
   * Scenarios API
   */
  scenarios = {
    list: () => this.request('/scenarios'),
    
    get: (id) => this.request(`/scenarios/${id}`),
    
    create: (data) => this.request('/scenarios', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
    update: (id, data) => this.request(`/scenarios/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
    
    publish: (id) => this.request(`/scenarios/${id}/publish`, {
      method: 'POST',
    }),
  };

  /**
   * Knowledge Base API
   */
  kb = {
    articles: {
      list: (params) => {
        const query = new URLSearchParams(params).toString();
        return this.request(`/kb/articles${query ? '?' + query : ''}`);
      },
      
      get: (id) => this.request(`/kb/articles/${id}`),
      
      create: (data) => this.request('/kb/articles', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
      
      update: (id, data) => this.request(`/kb/articles/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
      
      delete: (id) => this.request(`/kb/articles/${id}`, {
        method: 'DELETE',
      }),
    },
  };

  /**
   * LLM Enhancement API (OpenRouter via backend)
   */
  llm = {
    enhance: (data) => this.request('/llm/enhance', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
    generateConfig: (data) => this.request('/llm/generate-config', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  };

  /**
   * File Upload API
   */
  async uploadFile(file, type = 'attachment') {
    const token = this.getAuthToken();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    try {
      const response = await fetch(`${this.baseURL}/files/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('File upload failed');
      }

      return await response.json();
    } catch (error) {
      console.error('File upload failed:', error);
      throw error;
    }
  }
}

export const api = new ApiService();
export default api;
