import { useEffect, useMemo, useState } from 'react';
import { Bot, Loader2, Radio } from 'lucide-react';
import { Badge, PageHeader } from '../../components';
import api from '../../services/api';
import TelegramBotConnect from '../../components/TelegramBotConnect/TelegramBotConnect';
import { connectionStatusColor } from '../../utils/channelHelpers';


export default function Channels() {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadConnections() {
    setLoading(true);
    setError('');
    try {
      const data = await api.channels.list();
      setConnections(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load channels.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadConnections();
  }, []);

  const telegramBotConnection = useMemo(
    () => connections.find((connection) => connection.channel_type === 'telegram_bot') || null,
    [connections],
  );

  async function handleConnect(botToken) {
    await api.channels.connectTelegramBot({ bot_token: botToken });
    await loadConnections();
  }

  async function handleDisconnect(connectionId) {
    await api.channels.disconnectTelegramBot(connectionId);
    await loadConnections();
  }

  async function handleRefresh(connectionId) {
    if (!connectionId) return;
    await api.channels.getStatus(connectionId);
    await loadConnections();
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 rounded-2xl overflow-hidden p-4 md:p-6">
      <PageHeader
        title="Channels"
        description="Connect messaging channels without duplicating conversation logic."
        className="mb-4 md:mb-6"
      />

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,2fr)_360px] gap-6 min-h-0">
        <TelegramBotConnect
          connection={telegramBotConnection}
          loading={loading}
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
          onRefresh={handleRefresh}
        />

        <div className="bg-[#121826] rounded-3xl p-6 text-white shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Connection Snapshot</h2>
              <p className="text-sm text-slate-300">Workspace-level channel status</p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 text-slate-300 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading connections...
            </div>
          ) : (
            <div className="space-y-3">
              {connections.length === 0 && (
                <p className="text-sm text-slate-300">No channels connected yet.</p>
              )}
              {connections.map((connection) => (
                <div key={connection.id} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-sky-500/15 text-sky-300 flex items-center justify-center shrink-0">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{connection.display_name || 'Telegram Bot'}</p>
                        <p className="text-xs text-slate-400 truncate">{connection.channel_type}</p>
                      </div>
                    </div>
                    <Badge color={connectionStatusColor(connection.status)}>{connection.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}

          {error && <p className="mt-4 text-sm text-red-300">{error}</p>}
        </div>
      </div>
    </div>
  );
}