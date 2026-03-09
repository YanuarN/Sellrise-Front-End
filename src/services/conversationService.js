import api from './api';

/**
 * Conversation Service  (US-4.5 – Centralized Conversation System)
 *
 * Wraps the /v1/conversations and /v1/conversations/:id/steps endpoints so
 * the WidgetSimulator (and any future widget consumer) can create sessions and
 * exchange messages without containing any placeholder / TODO logic.
 */
const conversationService = {
  /**
   * Start a new conversation session.
   *
   * @param {string} workspaceId - Workspace public key
   * @param {string} [source]    - Identifier for the caller (e.g. 'widget_simulator')
   * @returns {Promise<{id: string, session_id: string, [key: string]: any}>}
   */
  async startConversation(workspaceId, source = 'widget_simulator') {
    return api.conversations.create({ workspace_id: workspaceId, source });
  },

  /**
   * Get the current state of a conversation.
   *
   * @param {string} id - Conversation ID returned by startConversation
   * @returns {Promise<object>}
   */
  async getConversation(id) {
    return api.conversations.get(id);
  },

  /**
   * Send a user message and receive the bot reply for a running conversation.
   *
   * @param {string} conversationId - Conversation ID
   * @param {string} message        - User message text
   * @param {Object} [slots]        - Current slot state
   * @returns {Promise<{reply: string, slots?: Object, stage_id?: string, [key: string]: any}>}
   */
  async sendStep(conversationId, message, slots = {}) {
    return api.conversations.step(conversationId, message, slots);
  },
};

export default conversationService;
