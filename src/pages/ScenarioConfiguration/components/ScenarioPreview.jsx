import { useState, useRef, useEffect } from 'react';
import { X, Play, RotateCcw, Bot, User } from 'lucide-react';
import { Button, Card } from '../../../components';

/**
 * ScenarioPreview
 *
 * Local, offline preview of a stages-based scenario config.
 * Walks through the stages in priority order, showing the first
 * task's approved_phrase as a bot message and collecting user input.
 *
 * This is intentionally simple — for full AI-powered simulation use
 * the ScenarioSimulator (available from the Scenarios list page).
 *
 * Props:
 *   config  {object}   The full scenario config (stages format)
 *   onClose {Function} Close callback
 */
function ScenarioPreview({ config, onClose }) {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [stageIndex, setStageIndex] = useState(0);
  const [slots, setSlots] = useState({});
  const [started, setStarted] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Sorted stages by priority desc.
  const sortedStages = [...(config.stages || [])].sort(
    (a, b) => (b.priority ?? 0) - (a.priority ?? 0),
  );

  const currentStage = sortedStages[stageIndex] ?? null;

  const scrollToBottom = () =>
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Kick off the first bot message when started.
  const handleStart = () => {
    setMessages([]);
    setSlots({});
    setStageIndex(0);
    setStarted(true);

    const firstStage = sortedStages[0];
    const firstTask = firstStage?.tasks?.[0];
    const botMessage =
      firstTask?.approved_phrases?.[0] ??
      firstTask?.instruction ??
      '(No opening message configured)';

    setMessages([{ role: 'bot', content: botMessage, stageId: firstStage?.stage_id }]);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleReset = () => {
    setMessages([]);
    setSlots({});
    setStageIndex(0);
    setStarted(false);
    setUserInput('');
  };

  const handleSend = () => {
    const text = userInput.trim();
    if (!text) return;

    const updatedMessages = [
      ...messages,
      { role: 'user', content: text },
    ];

    // Advance to next stage.
    const nextIndex = stageIndex + 1;
    const nextStage = sortedStages[nextIndex] ?? null;
    const nextTask = nextStage?.tasks?.[0] ?? null;

    const botReply = nextTask
      ? nextTask.approved_phrases?.[0] ?? nextTask.instruction ?? '(Stage has no message)'
      : '✅ Scenario complete. Thank you!';

    setMessages([
      ...updatedMessages,
      {
        role: 'bot',
        content: botReply,
        stageId: nextStage?.stage_id ?? 'end',
      },
    ]);

    setStageIndex(nextIndex);
    setUserInput('');
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isEnd = started && stageIndex >= sortedStages.length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-xl">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            <h2 className="text-base font-semibold">Scenario Preview</h2>
            {currentStage && (
              <span className="ml-3 text-xs bg-white/20 rounded-full px-2.5 py-0.5 font-mono">
                {currentStage.stage_id}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
              title="Restart preview"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
              title="Close preview"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-slate-50">
          {!started ? (
            <div className="flex flex-col items-center justify-center h-full py-12 text-center gap-4">
              <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
                <Bot className="w-7 h-7 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">Ready to preview</p>
                <p className="text-sm text-slate-500 mt-1">
                  This walks through your {sortedStages.length} stage(s) locally — no AI calls are made.
                </p>
              </div>
              <Button
                onClick={handleStart}
                className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
              >
                <Play className="w-4 h-4" />
                Start Preview
              </Button>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div
                  className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-white text-xs ${
                    msg.role === 'user' ? 'bg-blue-500' : 'bg-indigo-600'
                  }`}
                >
                  {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                </div>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-sm'
                      : 'bg-white text-slate-800 shadow-sm border border-slate-100 rounded-tl-sm'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        {started && !isEnd && (
          <div className="shrink-0 px-4 py-3 border-t bg-white flex gap-2 items-end">
            <textarea
              ref={inputRef}
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Reply… (Enter to send)"
              className="flex-1 resize-none rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 max-h-24 overflow-y-auto"
            />
            <button
              onClick={handleSend}
              disabled={!userInput.trim()}
              className="w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:cursor-not-allowed flex items-center justify-center text-white transition-colors shrink-0"
            >
              <Play className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Slots inspector */}
        {started && Object.keys(slots).length > 0 && (
          <div className="shrink-0 border-t px-5 py-3 bg-slate-50">
            <p className="text-xs font-semibold text-slate-500 mb-2">Collected Slots</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(slots).map(([k, v]) => (
                <span key={k} className="text-xs bg-blue-100 text-blue-800 rounded-full px-2.5 py-1 font-mono">
                  {k}: {String(v)}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ScenarioPreview;
