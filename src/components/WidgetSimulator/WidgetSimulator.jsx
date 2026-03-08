import { useEffect, useMemo, useRef, useState } from 'react';
import { X, RotateCcw, AlertTriangle } from 'lucide-react';
import { Button } from '../Button';

function WidgetSimulator({ onClose, workspaceName = 'Workspace', fallbackMessage }) {
  const defaultMessages = useMemo(() => ([
    {
      id: 1,
      role: 'bot',
      text: `Hi! This is ${workspaceName} chatbot simulator. Ask me about pricing, booking, or support.`,
    },
  ]), [workspaceName]);

  const [messages, setMessages] = useState(defaultMessages);
  const [input, setInput] = useState('');
  const [isFallbackMode, setIsFallbackMode] = useState(false);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isBotTyping]);

  const pushBotMessage = (text) => {
    setMessages((prev) => [
      ...prev,
      { id: Date.now() + Math.random(), role: 'bot', text },
    ]);
  };

  const buildBotReply = (rawInput) => {
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

    return 'Thanks. I did not fully understand that in this simulator. Try: pricing, support, or booking demo.';
  };

  const handleSend = (event) => {
    event.preventDefault();

    const trimmed = input.trim();
    if (!trimmed || isFallbackMode || isBotTyping) {
      return;
    }

    const userMessage = { id: Date.now(), role: 'user', text: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsBotTyping(true);

    window.setTimeout(() => {
      pushBotMessage(buildBotReply(trimmed));
      setIsBotTyping(false);
    }, 500);
  };

  const handleReset = () => {
    setMessages(defaultMessages);
    setInput('');
    setIsFallbackMode(false);
    setIsBotTyping(false);
  };

  const handleTriggerFallback = () => {
    setIsFallbackMode(true);
    setIsBotTyping(false);
    pushBotMessage(fallbackMessage || 'Please leave your details and our team will contact you shortly.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Widget Simulator</h3>
            <p className="text-xs text-gray-600">Try your chatbot before embedding it.</p>
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

        <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-4 py-2">
          <Button size="sm" variant="secondary" className="gap-1" onClick={handleReset}>
            <RotateCcw size={14} /> Reset
          </Button>
          <Button size="sm" variant="outline" className="gap-1" onClick={handleTriggerFallback}>
            <AlertTriangle size={14} /> Simulate Timeout
          </Button>
        </div>

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
                <input disabled value="Your name" className="rounded border border-amber-200 bg-white px-2 py-1.5 text-xs" readOnly />
                <input disabled value="Email" className="rounded border border-amber-200 bg-white px-2 py-1.5 text-xs" readOnly />
                <button type="button" disabled className="rounded bg-gray-300 px-2 py-1.5 text-xs text-gray-700">Submit</button>
              </div>
            </div>
          )}

          <div ref={endRef} />
        </div>

        <form onSubmit={handleSend} className="border-t border-gray-200 p-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder={isFallbackMode ? 'Fallback mode active. Reset to continue.' : 'Type a message...'}
              disabled={isFallbackMode}
            />
            <Button type="submit" size="sm" disabled={isFallbackMode || !input.trim() || isBotTyping}>
              Send
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default WidgetSimulator;
