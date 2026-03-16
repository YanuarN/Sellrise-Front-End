import { useEffect, useRef, useState } from 'react';
import { X, RotateCcw, AlertTriangle, Send, Bot, User, Loader2 } from 'lucide-react';
import { Button } from '../Button';
import api from '../../services/api';
import { domainService, scenarioService, workspaceService } from '../../services';

function pickDisplayName(...candidates) {
  return candidates.find((value) => typeof value === 'string' && value.trim())?.trim() || 'Plasthic';
}

function applyScenarioVariables(text, visitorName, brandName) {
  if (typeof text !== 'string') return '';
  const firstName = (visitorName || 'there').trim().split(/\s+/)[0] || 'there';
  const resolvedBrandName = brandName || 'Plasthic';

  return text
    .replace(/\{name\}/gi, firstName)
    .replace(/\{first_name\}/gi, firstName)
    .replace(/\{agent_name\}/gi, resolvedBrandName)
    .replace(/\{company\}/gi, resolvedBrandName);
}

function sortByPriorityDesc(items) {
  return (Array.isArray(items) ? items : []).slice().sort((a, b) => (b?.priority || 0) - (a?.priority || 0));
}

function getInitialMessageFromScenario(scenarioConfig, visitorName, brandName) {
  if (!scenarioConfig || typeof scenarioConfig !== 'object') return null;

  // Legacy (step-based) scenarios
  if (scenarioConfig.entry_step_id && scenarioConfig.steps) {
    const entryStep = scenarioConfig.steps?.[scenarioConfig.entry_step_id];
    const stepText =
      entryStep?.content ||
      entryStep?.message ||
      entryStep?.text ||
      entryStep?.question ||
      entryStep?.prompt;

    const resolved = applyScenarioVariables(stepText, visitorName, brandName);
    return resolved.trim() ? resolved : null;
  }

  // Stage-based scenarios
  if (scenarioConfig.stages) {
    const stages = Array.isArray(scenarioConfig.stages)
      ? sortByPriorityDesc(scenarioConfig.stages)
      : sortByPriorityDesc(Object.values(scenarioConfig.stages || {}));

    const firstStage = stages.find((stage) => stage?.entry_condition?.type === 'first_message') || stages[0];
    if (!firstStage) return null;

    const tasks = Array.isArray(firstStage.tasks)
      ? sortByPriorityDesc(firstStage.tasks)
      : sortByPriorityDesc(Object.values(firstStage.tasks || {}));

    for (const task of tasks) {
      const phrase = task?.approved_phrases?.[0] || task?.fallback_phrases?.[0];
      const resolved = applyScenarioVariables(phrase, visitorName, brandName);
      if (resolved.trim()) return resolved;
    }

    return null;
  }

  return null;
}

/**
 * WidgetSimulator
 *
 * An in-app chat overlay that lets admins test the chatbot widget before
 * embedding it.  Every user message is forwarded to the live conversation
 * engine via:
 *   POST /v1/conversations  – creates the session on open
 *   POST /v1/steps          – processes each user turn and returns a reply
 *
 * Props:
 *   workspaceId    {string}   Workspace public key used to start the conversation
 *   workspaceName  {string}   Display name shown in the simulator header
 *   fallbackMessage {string}  Message shown when the "Simulate Timeout" button is pressed
 *   onClose        {Function} Called when the user dismisses the modal
 */
function WidgetSimulator({ onClose, workspaceId, workspaceName = 'Workspace', fallbackMessage }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [leadId, setLeadId] = useState(null);
  const [sessionId] = useState(() => `sim-${Date.now()}`);
  const [resolvedBrandName, setResolvedBrandName] = useState(workspaceName);
  const [publishedScenarioConfig, setPublishedScenarioConfig] = useState(null);
  const [isContextLoading, setIsContextLoading] = useState(true);
  const [isInitialising, setIsInitialising] = useState(true);
  const [initError, setInitError] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [isFallbackMode, setIsFallbackMode] = useState(false);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to the latest message whenever messages update.
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  useEffect(() => {
    let cancelled = false;

    async function loadWidgetContext() {
      setIsContextLoading(true);
      try {
        const [workspace, domains, scenarios] = await Promise.all([
          workspaceId ? workspaceService.getWorkspace(workspaceId) : Promise.resolve(null),
          domainService.getDomains().catch(() => []),
          scenarioService.getScenarios().catch(() => []),
        ]);

        if (cancelled) return;

        const activeDomain = (Array.isArray(domains) ? domains : []).find((domain) => domain.is_active) || domains?.[0];
        const publishedScenario = (Array.isArray(scenarios) ? scenarios : []).find((scenario) => scenario.is_published);
        setResolvedBrandName(
          pickDisplayName(
            activeDomain?.brand_name,
            publishedScenario?.name,
            workspace?.name,
            workspaceName,
            'Plasthic',
          ),
        );

        if (publishedScenario?.id) {
          const scenarioDetail = await scenarioService.getScenario(publishedScenario.id);
          if (!cancelled) {
            setPublishedScenarioConfig(scenarioDetail?.config || null);
            setResolvedBrandName(
              pickDisplayName(
                activeDomain?.brand_name,
                scenarioDetail?.name,
                publishedScenario?.name,
                workspace?.name,
                workspaceName,
                'Plasthic',
              ),
            );
          }
        }
      } catch {
        if (!cancelled) {
          setResolvedBrandName(pickDisplayName(workspaceName, 'Plasthic'));
        }
      } finally {
        if (!cancelled) setIsContextLoading(false);
      }
    }

    loadWidgetContext();

    return () => {
      cancelled = true;
    };
  }, [workspaceId, workspaceName]);

  const initialGreeting = getInitialMessageFromScenario(
    publishedScenarioConfig,
    'Simulator User',
    resolvedBrandName,
  );

  // Start the conversation session as soon as the simulator opens.
  useEffect(() => {
    let cancelled = false;

    async function init() {
      setIsInitialising(true);
      setInitError(null);

      if (isContextLoading) return;
      if (!publishedScenarioConfig) {
        setInitError('No published scenario found for this workspace. Publish a scenario to simulate the chatbot.');
        setIsInitialising(false);
        return;
      }
      if (!initialGreeting) {
        setInitError('Published scenario does not define an initial message. Add an opening phrase in the first stage/task (approved_phrases or fallback_phrases).');
        setIsInitialising(false);
        return;
      }

      try {
        // Create a simulator lead via the public widget API
        const res = await api.widget.createLead({
          workspace_id: workspaceId,
          name: 'Simulator User',
          email: `simulator-${Date.now()}@test.local`,
          consent_given: true,
        });
        if (cancelled) return;

        setLeadId(res.lead_id);
        setMessages([
          {
            id: 1,
            role: 'bot',
            content: initialGreeting,
          },
        ]);
      } catch (err) {
        if (!cancelled) {
          setInitError(err.message || 'Failed to start conversation. Check your connection and try again.');
        }
      } finally {
        if (!cancelled) {
          setIsInitialising(false);
          setTimeout(() => inputRef.current?.focus(), 0);
        }
      }
    }

    init();

    return () => {
      cancelled = true;
    };
  }, [workspaceId, isContextLoading, publishedScenarioConfig, initialGreeting]);

  const pushBotMessage = (content) => {
    setMessages((prev) => [
      ...prev,
      { id: Date.now() + Math.random(), role: 'bot', content },
    ]);
  };

  const handleSend = async (event) => {
    if (event) event.preventDefault();

    const trimmed = input.trim();
    if (!trimmed || isFallbackMode || isSending || !leadId) return;

    setMessages((prev) => [
      ...prev,
      { id: Date.now(), role: 'user', content: trimmed },
    ]);
    setInput('');
    setIsSending(true);

    try {
      const res = await api.widget.sendMessage({
        workspace_id: workspaceId,
        lead_id: leadId,
        message: trimmed,
        channel: 'web',
        session_id: sessionId,
      });
      pushBotMessage(res.bot_reply || '[No response]');
    } catch (err) {
      pushBotMessage(`Error: ${err.message || 'Could not get a response. Please try again.'}`);
    } finally {
      setIsSending(false);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReset = async () => {
    setMessages([]);
    setInput('');
    setIsFallbackMode(false);
    setIsSending(false);
    setLeadId(null);
    setIsInitialising(true);
    setInitError(null);

    if (isContextLoading) return;
    if (!publishedScenarioConfig) {
      setInitError('No published scenario found for this workspace. Publish a scenario to simulate the chatbot.');
      setIsInitialising(false);
      return;
    }
    if (!initialGreeting) {
      setInitError('Published scenario does not define an initial message. Add an opening phrase in the first stage/task (approved_phrases or fallback_phrases).');
      setIsInitialising(false);
      return;
    }

    try {
      const res = await api.widget.createLead({
        workspace_id: workspaceId,
        name: 'Simulator User',
        email: `simulator-${Date.now()}@test.local`,
        consent_given: true,
      });
      setLeadId(res.lead_id);
      setMessages([
        {
          id: 1,
          role: 'bot',
          content: initialGreeting,
        },
      ]);
    } catch (err) {
      setInitError(err.message || 'Failed to restart conversation.');
    } finally {
      setIsInitialising(false);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  const handleTriggerFallback = () => {
    setIsFallbackMode(true);
    setIsSending(false);
    pushBotMessage(fallbackMessage || 'Please leave your details and our team will contact you shortly.');
  };

  const isInputDisabled = isFallbackMode || isSending || isInitialising || isContextLoading || !!initError || !leadId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="flex w-full max-w-md flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl" style={{ height: '560px' }}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white">
              <Bot size={14} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Widget Simulator</h3>
              <p className="text-xs text-gray-500">{resolvedBrandName}</p>
            </div>
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
          <Button size="sm" variant="secondary" className="gap-1" onClick={handleReset} disabled={isInitialising}>
            <RotateCcw size={14} /> Reset
          </Button>
          <Button size="sm" variant="outline" className="gap-1" onClick={handleTriggerFallback} disabled={isInitialising || isFallbackMode}>
            <AlertTriangle size={14} /> Simulate Timeout
          </Button>
          {leadId && (
            <span className="ml-auto font-mono text-xs text-gray-400" title="Lead ID">
              {leadId.slice(0, 12)}…
            </span>
          )}
        </div>

        {/* Message area */}
        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
          {/* Initialising state */}
          {isInitialising && (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-gray-400">
              <Loader2 size={24} className="animate-spin" />
              <p className="text-sm">Starting conversation…</p>
            </div>
          )}

          {/* Init error */}
          {!isInitialising && initError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <p className="font-medium">Could not start conversation</p>
              <p className="mt-1 text-xs">{initError}</p>
            </div>
          )}

          {/* Messages */}
          {!isInitialising && !initError && messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-2 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white ${
                  message.role === 'user' ? 'bg-blue-500' : 'bg-indigo-600'
                }`}
              >
                {message.role === 'user' ? <User size={12} /> : <Bot size={12} />}
              </div>
              <div
                className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                  message.role === 'user'
                    ? 'rounded-tr-sm bg-blue-600 text-white'
                    : 'rounded-tl-sm bg-gray-100 text-gray-800'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}

          {/* Bot typing indicator */}
          {isSending && (
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white">
                <Bot size={12} />
              </div>
              <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm bg-gray-100 px-4 py-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '-0.3s' }} />
                <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '-0.15s' }} />
                <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce" />
              </div>
            </div>
          )}

          {/* Fallback form preview */}
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

        {/* Input bar */}
        <form onSubmit={handleSend} className="shrink-0 border-t border-gray-200 p-3">
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isInputDisabled}
              rows={1}
              className="w-full resize-none rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-gray-50 max-h-24 overflow-y-auto"
              placeholder={
                isFallbackMode
                  ? 'Fallback mode active. Reset to continue.'
                  : isInitialising
                  ? 'Starting conversation…'
                  : initError
                  ? 'Conversation unavailable.'
                  : 'Type a message… (Enter to send)'
              }
            />
            <button
              type="submit"
              disabled={isInputDisabled || !input.trim()}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-200"
              title="Send message"
            >
              {isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default WidgetSimulator;
