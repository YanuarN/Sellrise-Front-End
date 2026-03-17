import { useState, useRef, useEffect, useMemo } from 'react';
import { X, Send, RotateCcw, Bot, User, Loader2 } from 'lucide-react';
import { scenarioService } from '../../services';

// ── Greeting helpers (mirrors WidgetSimulator logic) ──────────────────────────

function normalizeScenarioConfig(config) {
  if (!config) return null;
  if (typeof config === 'string') {
    try {
      const parsed = JSON.parse(config);
      return parsed && typeof parsed === 'object' ? parsed : null;
    } catch {
      return null;
    }
  }

  return typeof config === 'object' ? config : null;
}

function applyScenarioVariables(text, brandName) {
  if (typeof text !== 'string') return '';
  const resolved = brandName || 'Plasthic';
  return text
    .replace(/\{name\}/gi, 'Simulator User')
    .replace(/\{first_name\}/gi, 'Simulator User')
    .replace(/\{agent_name\}/gi, resolved)
    .replace(/\{company\}/gi, resolved);
}

function sortByPriorityDesc(items) {
  return (Array.isArray(items) ? items : []).slice().sort((a, b) => (b?.priority || 0) - (a?.priority || 0));
}

function getInitialMessageFromScenario(scenarioConfig, brandName) {
  if (!scenarioConfig || typeof scenarioConfig !== 'object') return null;

  // Legacy step-based scenarios
  if (scenarioConfig.entry_step_id && scenarioConfig.steps) {
    const entryStep = scenarioConfig.steps?.[scenarioConfig.entry_step_id];
    const stepText =
      entryStep?.content || entryStep?.message || entryStep?.text ||
      entryStep?.question || entryStep?.prompt;
    const resolved = applyScenarioVariables(stepText, brandName);
    return resolved.trim() ? resolved : null;
  }

  // Stage-based scenarios
  if (scenarioConfig.stages) {
    const stages = Array.isArray(scenarioConfig.stages)
      ? sortByPriorityDesc(scenarioConfig.stages)
      : sortByPriorityDesc(Object.values(scenarioConfig.stages || {}));

    const firstStage =
      stages.find((s) => s?.entry_condition?.type === 'first_message') || stages[0];
    if (!firstStage) return null;

    const tasks = Array.isArray(firstStage.tasks)
      ? sortByPriorityDesc(firstStage.tasks)
      : sortByPriorityDesc(Object.values(firstStage.tasks || {}));

    for (const task of tasks) {
      const phrase = task?.approved_phrases?.[0] || task?.fallback_phrases?.[0];
      const resolved = applyScenarioVariables(phrase, brandName);
      if (resolved.trim()) return resolved;
    }
  }

  return null;
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * ScenarioSimulator
 *
 * A lightweight chat popup that lets admins test a scenario against
 * the live scenario engine.  Each user message is sent to
 * POST /v1/scenarios/{id}/simulate and the bot reply is shown inline.
 *
 * Props:
 *  scenario  {object}   The scenario object { id, name, config, ... }
 *  onClose   {Function} Called when the user closes the modal
 */
function ScenarioSimulator({ scenario, onClose }) {
  const [resolvedScenarioConfig, setResolvedScenarioConfig] = useState(() => normalizeScenarioConfig(scenario?.config));
  const [isLoadingScenario, setIsLoadingScenario] = useState(() => !normalizeScenarioConfig(scenario?.config) && !!scenario?.id);

  const initialGreeting = useMemo(
    () => getInitialMessageFromScenario(resolvedScenarioConfig, scenario?.name),
    [resolvedScenarioConfig, scenario?.name],
  );

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [slots, setSlots] = useState({});
  const [currentStage, setCurrentStage] = useState(null);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // ── helpers ──────────────────────────────────────────────────────────
  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-focus the text input whenever the modal opens.
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function resolveScenarioConfig() {
      const inlineConfig = normalizeScenarioConfig(scenario?.config);
      if (inlineConfig) {
        setResolvedScenarioConfig(inlineConfig);
        setIsLoadingScenario(false);
        return;
      }

      if (!scenario?.id) {
        setResolvedScenarioConfig(null);
        setIsLoadingScenario(false);
        return;
      }

      setIsLoadingScenario(true);
      try {
        const fullScenario = await scenarioService.getScenario(scenario.id);
        if (cancelled) return;
        setResolvedScenarioConfig(normalizeScenarioConfig(fullScenario?.config));
      } catch {
        if (cancelled) return;
        setResolvedScenarioConfig(null);
      } finally {
        if (!cancelled) setIsLoadingScenario(false);
      }
    }

    resolveScenarioConfig();

    return () => {
      cancelled = true;
    };
  }, [scenario?.id, scenario?.config]);

  // Build the history array expected by the simulate API.
  const buildHistory = () =>
    messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

  // ── actions ───────────────────────────────────────────────────────────
  const handleReset = () => {
    setMessages([]);
    setInput('');
    setSlots({});
    setCurrentStage(null);
    setError(null);
    inputRef.current?.focus();
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;

    const isFirstTurn = messages.length === 0;
    const userMessage = { role: 'user', content: text };
    // Capture history BEFORE appending the new user message, because
    // `message` is passed separately to the simulate endpoint and should
    // not also appear in the history array.
    const history = buildHistory();

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setSending(true);
    setError(null);

    try {
      const res = await scenarioService.simulateScenario(
        scenario.id,
        text,
        history,
        slots,
      );

      const botContent =
        (isFirstTurn && initialGreeting) ||
        res?.reply ||
        res?.message ||
        res?.content ||
        '[No response]';

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: botContent },
      ]);

      if (res?.slots) setSlots(res.slots);
      if (res?.stage_id) setCurrentStage(res.stage_id);
    } catch (err) {
      setError(err.message || 'Failed to get a response. Please try again.');
    } finally {
      setSending(false);
      // Keep focus in input after send.
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── render ────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative flex flex-col bg-white rounded-2xl shadow-2xl w-full max-w-xl h-[600px] overflow-hidden">
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-2xl shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-semibold">{scenario.name}</p>
              <p className="text-xs text-blue-100">Scenario Simulator</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
              title="Reset conversation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Stage badge ── */}
        {currentStage && (
          <div className="shrink-0 px-5 py-2 bg-slate-50 border-b border-slate-100 text-xs text-slate-500">
            Stage:{' '}
            <span className="font-mono font-medium text-blue-600">
              {currentStage}
            </span>
          </div>
        )}

        {/* ── Messages area ── */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {isLoadingScenario && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 gap-2">
              <Loader2 className="w-10 h-10 text-slate-300 animate-spin" />
              <p className="text-sm font-medium">Loading scenario…</p>
              <p className="text-xs">
                Fetching the latest scenario greeting.
              </p>
            </div>
          )}

          {!isLoadingScenario && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 gap-2">
              <Bot className="w-10 h-10 text-slate-300" />
              <p className="text-sm font-medium">Send the first message</p>
              <p className="text-xs">
                The simulator will show the configured greeting after your first input.
              </p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-2 ${
                msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-white text-xs ${
                  msg.role === 'user'
                    ? 'bg-blue-500'
                    : 'bg-indigo-600'
                }`}
              >
                {msg.role === 'user' ? (
                  <User className="w-3.5 h-3.5" />
                ) : (
                  <Bot className="w-3.5 h-3.5" />
                )}
              </div>

              {/* Bubble */}
              <div
                className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-sm'
                    : 'bg-slate-100 text-slate-800 rounded-tl-sm'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {sending && (
            <div className="flex gap-2 items-center">
              <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div className="bg-slate-100 rounded-2xl rounded-tl-sm px-4 py-2.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '-0.3s' }} />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '-0.15s' }} />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
              </div>
            </div>
          )}

          {/* Error banner */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* ── Input bar ── */}
        <div className="shrink-0 px-4 py-3 border-t border-slate-100 bg-white">
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={sending}
              rows={1}
              placeholder="Type a message… (Enter to send)"
              className="flex-1 resize-none rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 disabled:bg-slate-50 disabled:cursor-not-allowed max-h-28 overflow-y-auto leading-relaxed"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || sending}
              className="w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:cursor-not-allowed flex items-center justify-center text-white transition-colors shrink-0"
              title="Send message"
            >
              {sending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ScenarioSimulator;
