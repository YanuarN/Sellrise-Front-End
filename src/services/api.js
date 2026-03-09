const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class ApiClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  getAccessToken() {
    return localStorage.getItem('access_token');
  }

  setAccessToken(token) {
    if (token) {
      localStorage.setItem('access_token', token);
    } else {
      localStorage.removeItem('access_token');
    }
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getAccessToken();

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
      credentials: 'include', // Send cookies (refresh_token)
    };

    let response = await fetch(url, config);

    // If 401, try to refresh token
    if (response.status === 401 && token) {
      const refreshed = await this.refreshToken();
      if (refreshed) {
        // Retry original request with new token
        headers['Authorization'] = `Bearer ${this.getAccessToken()}`;
        response = await fetch(url, { ...config, headers });
      } else {
        // Refresh failed, clear auth
        this.setAccessToken(null);
        window.location.href = '/login';
        throw new Error('Session expired');
      }
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: response.statusText }));
      const err = new Error(error.detail || 'Request failed');
      err.status = response.status;
      err.data = error;
      throw err;
    }

    // 204 No Content
    if (response.status === 204) {
      return null;
    }

    return response.json();
  }

  async refreshToken() {
    try {
      const response = await fetch(`${this.baseURL}/v1/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) return false;

      const data = await response.json();
      this.setAccessToken(data.access_token);
      return true;
    } catch {
      return false;
    }
  }

  get(endpoint, params) {
    let url = endpoint;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, value);
        }
      });
      const qs = searchParams.toString();
      if (qs) url += `?${qs}`;
    }
    return this.request(url, { method: 'GET' });
  }

  post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  patch(endpoint, body) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  /**
   * Scenarios API
   */
  scenarios = {
    list: () => this.get('/v1/scenarios'),

    get: (id) => this.get(`/v1/scenarios/${id}`),

    create: (data) => this.post('/v1/scenarios', data),

    update: (id, data) => this.patch(`/v1/scenarios/${id}`, data),

    delete: (id) => this.delete(`/v1/scenarios/${id}`),

    publish: (id) => this.post(`/v1/scenarios/${id}/publish`),

    /**
     * Simulate a conversation turn against a published or draft scenario.
     * @param {string} id - Scenario ID
     * @param {string} message - The user message to send
     * @param {Array}  history - Prior conversation history [{role, content}]
     * @param {Object} slots   - Current slot values collected so far
     */
    simulate: (id, message, history = [], slots = {}) =>
      this.post(`/v1/scenarios/${id}/simulate`, { message, history, slots }),
  };

  /**
   * Knowledge Base API
   */
  kb = {
    articles: {
      list: (params) => this.get('/v1/kb/articles', params),

      get: (id) => this.get(`/v1/kb/articles/${id}`),

      create: (data) => this.post('/v1/kb/articles', data),

      update: (id, data) => this.patch(`/v1/kb/articles/${id}`, data),

      delete: (id) => this.delete(`/v1/kb/articles/${id}`),
    },
  };

  /**
   * LLM Enhancement API (OpenRouter via backend)
   */
  llm = {
    enhance: (data) => this.post('/v1/llm/enhance', data),

    generateConfig: (data) => this.post('/v1/llm/generate-config', data),
  };

  /**
   * File Upload API
   */
  async uploadFile(file, type = 'attachment') {
    const token = this.getAccessToken();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await fetch(`${this.baseURL}/v1/files/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'File upload failed' }));
      const err = new Error(error.detail || 'File upload failed');
      err.status = response.status;
      throw err;
    }

    return response.json();
  }
}

const api = new ApiClient(API_BASE_URL);

export default api;
export { API_BASE_URL };
