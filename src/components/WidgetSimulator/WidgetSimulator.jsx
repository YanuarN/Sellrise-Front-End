import { useEffect, useMemo, useRef, useState } from 'react';
import { X, RotateCcw, AlertTriangle } from 'lucide-react';
import { Button } from '../Button';
import { conversationService } from '../../services';

/**
 * WidgetSimulator  (US-4.5 – Centralized Conversation System)
 *
 * Provides an in-app chat preview that routes every user message through the
 * real conversation engine (POST /v1/conversations + POST …/steps).
 *
 * When a workspaceId is supplied the component:
 *   1. Creates a server-side conversation session on mount.
 *   2. Sends each user message via conversationService.sendStep().
 *   3. Displays the bot reply returned by the engine.
 *
 * If the API is unreachable (network error, missing workspaceId, etc.) the
 * component falls back to a simple local keyword-matching reply so the
 * simulator remains usable during development / offline.
 *
 * Props:
 *   onClose         {Function} – called when the user closes the modal
 *   workspaceId     {string}   – workspace public key (enables live API mode)
 *   workspaceName   {string}   – display name shown in the welcome message
 *   fallbackMessage {string}   – message shown when the widget times out
 */
function WidgetSimulator({
  onClose,
  workspaceId,
  workspaceName = 'Workspace',
  fallbackMessage,
}) {
  const defaultMessages = useMemo(
    () => [
      {
        id: 1,
        role: 'bot',
        text: `Hi! This is ${workspaceName} chatbot simulator. Ask me about pricing, booking, or support.`,
      },
    ],
    [workspaceName],
  );

  const [messages, setMessages] = useState(defaultMessages);
  const [input, setInput] = useState('');
  const [isFallbackMode, setIsFallbackMode] = useState(false);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [slots, setSlots] = useState({});
  const [apiError, setApiError] = useState(null);
  const endRef = useRef(null);

  // ── scroll to bottom whenever messages change ──────────────────────────
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isBotTyping]);

  // ── start a server-side conversation session on mount ─────────────────
  useEffect(() => {
    if (!workspaceId) return;

    conversationService
      .startConversation(workspaceId)
      .then((res) => {
        // Primary field is `id`; `conversation_id` accepted for API compatibility.
        setConversationId(res?.id ?? res?.conversation_id ?? null);
      })
      .catch((err) => {
        console.error('[WidgetSimulator] Failed to start conversation session:', err);
        // Non-fatal: fall back to local replies if session cannot be created.
        setApiError('Could not start a live session. Running in local mode.');
      });
  }, [workspaceId]);

  // ── helpers ────────────────────────────────────────────────────────────
  const pushBotMessage = (text) => {
    setMessages((prev) => [
      ...prev,
      { id: Date.now() + Math.random(), role: 'bot', text },
    ]);
  };

  /**
   * Local keyword-matching fallback – used when the API is unavailable or
   * no workspaceId was provided.  This is intentionally kept as a last
   * resort rather than the primary response path.
   */
  const buildLocalReply = (rawInput) => {
    const text = rawInput.toLowerCase();
    if (text.includes('book') || text.includes('demo') || text.includes('schedule')) {
      return 'Great. You can book a consultation here: https://calendly.com/your-team/demo';
    }
    if (text.includes('price') || text.includes('pricing') || text.includes('cost')) {
      return 'Our plans start from $49/month. For custom pricing, share your lead volume and team size.';
    }
    if (text.includes('support') || text.includes('help') || text.includes('issue')) {
      return 'I can help with support. Please describe your issue, and I will route it to the right team.';
    }
    if (text.includes('hi') || text.includes('hello')) {
      return 'Hello. What would you like to do today: get pricing, ask product questions, or book a demo?';
    }
    return 'I did not fully understand that. Try asking about pricing, support, or booking a demo.';
  };

  // ── send a message ─────────────────────────────────────────────────────
  const handleSend = async (event) => {
    event.preventDefault();

    const trimmed = input.trim();
    if (!trimmed || isFallbackMode || isBotTyping) return;

    const userMessage = { id: Date.now(), role: 'user', text: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsBotTyping(true);
    setApiError(null);

    try {
      if (conversationId) {
        // Live mode: call the conversation engine.
        const res = await conversationService.sendStep(conversationId, trimmed, slots);
        // Primary reply field is `reply`; `message` and `content` accepted for API compatibility.
        const reply =
          res?.reply ?? res?.message ?? res?.content ?? '[No response]';
        pushBotMessage(reply);
        if (res?.slots) setSlots(res.slots);
      } else {
        // Local mode: small delay to mimic network round-trip.
        await new Promise((resolve) => window.setTimeout(resolve, 400));
        pushBotMessage(buildLocalReply(trimmed));
      }
    } catch (err) {
      console.error('[WidgetSimulator] Conversation step failed:', err);
      setApiError('Could not reach the conversation engine. Showing a local reply.');
      pushBotMessage(buildLocalReply(trimmed));
    } finally {
      setIsBotTyping(false);
    }
  };

  const handleReset = () => {
    setMessages(defaultMessages);
    setInput('');
    setIsFallbackMode(false);
    setIsBotTyping(false);
    setSlots({});
    setApiError(null);

    // Re-create a server conversation if we have a workspace ID.
    if (workspaceId) {
      conversationService
        .startConversation(workspaceId)
        .then((res) => setConversationId(res?.id ?? res?.conversation_id ?? null))
        .catch((err) => {
          console.error('[WidgetSimulator] Failed to restart conversation session:', err);
          setApiError('Could not start a live session. Running in local mode.');
        });
    }
  };

  const handleTriggerFallback = () => {
    setIsFallbackMode(true);
    setIsBotTyping(false);
    pushBotMessage(
      fallbackMessage || 'Please leave your details and our team will contact you shortly.',
    );
  };

  // ── render ─────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Widget Simulator</h3>
            <p className="text-xs text-gray-600">
              {conversationId
                ? 'Live mode — connected to conversation engine'
                : 'Try your chatbot before embedding it.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close simulator"
          >
            <X size={18} />
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-4 py-2">
          <Button size="sm" variant="secondary" className="gap-1" onClick={handleReset}>
            <RotateCcw size={14} /> Reset
          </Button>
          <Button size="sm" variant="outline" className="gap-1" onClick={handleTriggerFallback}>
            <AlertTriangle size={14} /> Simulate Timeout
          </Button>
        </div>

        {/* API error notice */}
        {apiError && (
          <div className="border-b border-amber-100 bg-amber-50 px-4 py-2 text-xs text-amber-800">
            {apiError}
          </div>
        )}

        {/* Messages area */}
        <div className="h-80 space-y-3 overflow-y-auto px-4 py-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                message.role === 'bot'
                  ? 'bg-gray-100 text-gray-800'
                  : 'ml-auto bg-blue-600 text-white'
              }`}
            >
              {message.text}
            </div>
          ))}

          {isBotTyping && (
            <div className="max-w-[85%] rounded-xl bg-gray-100 px-3 py-2 text-sm text-gray-600">
              Chatbot is typing...
            </div>
          )}

          {isFallbackMode && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              <p className="mb-2 font-medium">Fallback Contact Form</p>
              <div className="grid gap-2">
                <input
                  disabled
                  value="Your name"
                  className="rounded border border-amber-200 bg-white px-2 py-1.5 text-xs"
                  readOnly
                />
                <input
                  disabled
                  value="Email"
                  className="rounded border border-amber-200 bg-white px-2 py-1.5 text-xs"
                  readOnly
                />
                <button
                  type="button"
                  disabled
                  className="rounded bg-gray-300 px-2 py-1.5 text-xs text-gray-700"
                >
                  Submit
                </button>
              </div>
            </div>
          )}

          <div ref={endRef} />
        </div>

        {/* Input bar */}
        <form onSubmit={handleSend} className="border-t border-gray-200 p-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder={
                isFallbackMode
                  ? 'Fallback mode active. Reset to continue.'
                  : 'Type a message...'
              }
              disabled={isFallbackMode}
            />
            <Button
              type="submit"
              size="sm"
              disabled={isFallbackMode || !input.trim() || isBotTyping}
            >
              Send
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default WidgetSimulator;
