import api from './api';

const channelService = {
  async listConnections() {
    return api.channels.list();
  },

  async connectTelegramBot(botToken) {
    return api.channels.connectTelegramBot({ bot_token: botToken });
  },

  async disconnectTelegramBot(connectionId) {
    return api.channels.disconnectTelegramBot(connectionId);
  },

  async getConnectionStatus(connectionId) {
    return api.channels.getStatus(connectionId);
  },
};

export default channelService;