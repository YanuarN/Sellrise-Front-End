import { useMemo, useState } from 'react';
import { Bot, Loader2, Plug2, RefreshCw, Trash2 } from 'lucide-react';
import { Button, Badge } from '..';
import { connectionStatusColor } from '../../utils/channelHelpers';


export default function TelegramBotConnect({
  connection,
  loading,
  onConnect,
  onDisconnect,
  onRefresh,
}) {
  const [botToken, setBotToken] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isConnected = connection?.status === 'connected';
  const label = useMemo(() => {
    if (!connection) return 'Telegram Bot';
    return connection.display_name || connection.bot_username || 'Telegram Bot';
  }, [connection]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!botToken.trim()) return;

    setSubmitting(true);
    setError('');
    try {
      await onConnect(botToken.trim());
      setBotToken('');
    } catch (err) {
      setError(err.message || 'Failed to connect Telegram bot.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRefresh() {
    setError('');
    try {
      await onRefresh(connection?.id);
    } catch (err) {
      setError(err.message || 'Failed to refresh connection status.');
    }
  }

  async function handleDisconnect() {
    setError('');
    try {
      await onDisconnect(connection?.id);
    } catch (err) {
      setError(err.message || 'Failed to disconnect Telegram bot.');
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-semibold text-slate-800">Telegram Bot</h3>
              <Badge color={connectionStatusColor(connection?.status)}>
                {connection?.status || 'disconnected'}
              </Badge>
              {connection?.mode && <Badge color="blue">{connection.mode}</Badge>}
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Connect a Telegram bot token and route incoming messages into the existing conversation engine.
            </p>
          </div>
        </div>

        {connection?.id && (
          <Button variant="secondary" size="sm" className="gap-2" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5 text-sm">
        <div className="rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3">
          <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">Bot</p>
          <p className="font-medium text-slate-700">{label}</p>
          {connection?.bot_username && <p className="text-slate-500 mt-1">@{connection.bot_username}</p>}
        </div>
        <div className="rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3">
          <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">Webhook</p>
          <p className="font-medium text-slate-700 break-all">{connection?.webhook_url || 'Not registered yet'}</p>
        </div>
      </div>

      {!isConnected && (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Bot Token</label>
            <input
              type="password"
              value={botToken}
              onChange={(event) => setBotToken(event.target.value)}
              placeholder="123456:AA..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
            />
          </div>
          <Button type="submit" className="gap-2" disabled={submitting || !botToken.trim()}>
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plug2 className="w-4 h-4" />}
            Connect Bot
          </Button>
        </form>
      )}

      {isConnected && (
        <div className="flex items-center justify-between gap-4 rounded-2xl bg-emerald-50 border border-emerald-100 px-4 py-3">
          <div>
            <p className="text-sm font-medium text-emerald-800">Connection active</p>
            <p className="text-xs text-emerald-700 mt-1">Messages sent to this bot will appear in the shared inbox.</p>
          </div>
          <Button variant="secondary" size="sm" className="gap-2 text-red-600 border-red-200 hover:bg-red-50" onClick={handleDisconnect}>
            <Trash2 className="w-4 h-4" />
            Disconnect
          </Button>
        </div>
      )}

      {(error || connection?.last_error) && (
        <p className="mt-4 text-sm text-red-600">{error || connection?.last_error}</p>
      )}
    </div>
  );
}