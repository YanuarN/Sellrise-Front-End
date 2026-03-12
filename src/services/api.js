const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class ApiClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
    this.refreshPromise = null;
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

  isRefreshEligible(endpoint, skipAuthRefresh = false) {
    if (skipAuthRefresh) return false;

    if (endpoint.startsWith('/v1/widget/')) {
      return false;
    }

    return ![
      '/v1/auth/register',
      '/v1/auth/login',
      '/v1/auth/refresh',
      '/v1/auth/logout',
      '/v1/auth/forgot-password',
      '/v1/auth/reset-password',
    ].some((path) => endpoint.startsWith(path));
  }

  handleSessionExpired() {
    this.setAccessToken(null);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth:session-expired'));

      if (window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
    }
  }

  async request(endpoint, options = {}) {
    const {
      skipAuth = false,
      skipAuthRefresh = false,
      ...fetchOptions
    } = options;

    const url = `${this.baseURL}${endpoint}`;
    const token = this.getAccessToken();

    const headers = {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    };

    if (token && !skipAuth) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...fetchOptions,
      headers,
      credentials: 'include', // Send cookies (refresh_token)
    };

    let response = await fetch(url, config);

    // If 401, try to refresh token
    if (response.status === 401 && this.isRefreshEligible(endpoint, skipAuthRefresh)) {
      const refreshed = await this.refreshToken();
      if (refreshed) {
        // Retry original request with new token
        const refreshedToken = this.getAccessToken();
        const retryHeaders = { ...headers };

        if (refreshedToken && !skipAuth) {
          retryHeaders['Authorization'] = `Bearer ${refreshedToken}`;
        } else {
          delete retryHeaders['Authorization'];
        }

        response = await fetch(url, { ...config, headers: retryHeaders });
      } else {
        // Refresh failed, clear auth
        this.handleSessionExpired();
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
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      try {
        const response = await fetch(`${this.baseURL}/v1/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          this.setAccessToken(null);
          return false;
        }

        const data = await response.json();
        this.setAccessToken(data.access_token);
        return true;
      } catch {
        return false;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
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

  post(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
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
   * Analytics API
   */
  analytics = {
    getSummary: () => this.get('/v1/analytics/summary'),
    getFunnel: (params) => this.get('/v1/analytics/funnel', params),
    getSources: (params) => this.get('/v1/analytics/sources', params),
    getDropoff: (params) => this.get('/v1/analytics/dropoff', params),
    exportLeads: (params) => this.get('/v1/analytics/export', params),
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
   * Conversations API
   */
  conversations = {
    /**
     * Start a new conversation session for a workspace.
     * @param {string} workspaceId - Workspace public key
     */
    create: (workspaceId) =>
      this.post('/v1/conversations', { workspace_id: workspaceId }),

    /**
     * Execute a conversation step (send a user message and receive the bot reply).
     * @param {string} conversationId - ID returned by conversations.create
     * @param {string} message        - The user's message text
     */
    sendStep: (conversationId, message) =>
      this.post('/v1/steps', { conversation_id: conversationId, message }),
  };

  /**
   * Widget API (public — no auth required)
   */
  widget = {
    /**
     * Initialise a widget session (domain handshake).
     * @param {Object} payload - { domain, page_url, referrer, utm_* , timezone }
     */
    session: (payload) => this.post('/v1/widget/session', payload),

    /**
     * Create or deduplicate a lead from the widget.
     * @param {Object} payload - { workspace_id, name, email, phone, consent_given, ... }
     */
    createLead: (payload) => this.post('/v1/widget/lead', payload),

    /**
     * Send a chat message through the widget (AI runtime).
     * @param {Object} payload - { workspace_id, lead_id, message, channel, session_id }
     */
    sendMessage: (payload) => this.post('/v1/widget/message', payload),

    /**
     * Log a widget interaction event.
     * @param {Object} payload - { workspace_id, lead_id, event_type, step_name, data }
     */
    event: (payload) => this.post('/v1/widget/event', payload),

    /**
     * Search the knowledge base (public).
     * @param {Object} params - { q, workspace_id, limit }
     */
    kbSearch: (params) => this.get('/v1/widget/kb/search', params),

    /**
     * Submit a fallback lead capture form.
     * @param {Object} payload - { name, email, phone, reason, correlation_id, page_url }
     */
    fallbackLead: (payload) => this.post('/v1/widget/fallback-lead', payload),
  };

  /**
   * File Upload API
   */
  async uploadFile(file, type = 'attachment') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const buildHeaders = () => {
      const token = this.getAccessToken();
      return token ? { 'Authorization': `Bearer ${token}` } : {};
    };

    let response = await fetch(`${this.baseURL}/v1/files/upload`, {
      method: 'POST',
      headers: buildHeaders(),
      credentials: 'include',
      body: formData,
    });

    if (response.status === 401) {
      const refreshed = await this.refreshToken();

      if (refreshed) {
        response = await fetch(`${this.baseURL}/v1/files/upload`, {
          method: 'POST',
          headers: buildHeaders(),
          credentials: 'include',
          body: formData,
        });
      } else {
        this.handleSessionExpired();
        throw new Error('Session expired');
      }
    }

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
