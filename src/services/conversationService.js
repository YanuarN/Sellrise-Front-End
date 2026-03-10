import api from './api';

/**
 * Conversation Service
 *
 * Wraps the centralised conversation API (/v1/conversations, /v1/steps).
 * Used by the WidgetSimulator to replace the local keyword-matching
 * placeholder with real, production-wired backend calls.
 */
const conversationService = {
  /**
   * Start a new conversation for the given workspace.
   * Calls POST /v1/conversations and returns the conversation object
   * (which includes at least { id: string }).
   *
   * @param {string} workspaceId - The workspace public key
   * @returns {Promise<{ id: string }>}
   */
  async startConversation(workspaceId) {
    return api.conversations.create(workspaceId);
  },

  /**
   * Send a user message and advance the conversation by one step.
   * Calls POST /v1/steps and returns the engine response
   * (which includes at least { reply: string }).
   *
   * @param {string} conversationId - ID from startConversation
   * @param {string} message        - The user's raw message text
   * @returns {Promise<{ reply: string, stage_id?: string, slots?: object }>}
   */
  async sendStep(conversationId, message) {
    return api.conversations.sendStep(conversationId, message);
  },
};

export default conversationService;
