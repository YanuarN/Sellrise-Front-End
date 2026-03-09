import { useState, useRef, useEffect } from 'react';
import { X, Send, RotateCcw, Bot } from 'lucide-react';

/**
 * ScenarioSimulator – A simple chat popup to preview a stage-based scenario.
 *
 * Props:
 *  - scenario  {object}   The scenario object with `name` and `config` (stage-based JSON).
 *  - onClose   {Function} Called when the user closes the popup.
 */

const sortByPriority = (items) =>
  [...(items || [])].sort((a, b) => (b.priority || 0) - (a.priority || 0));

const getTaskMessage = (task, fallback = null) =>
  task?.approved_phrases?.[0] || task?.instruction || fallback;

function ScenarioSimulator({ scenario, onClose }) {
  const config = scenario?.config || {};
  const stages = Array.isArray(config.stages) ? config.stages : [];

  // Sort stages by priority descending so highest priority runs first
  const sortedStages = sortByPriority(stages);

  const getFirstBotMessage = () => {
    const firstStage = sortedStages[0];
    if (!firstStage) return "Hello! How can I help you today?";
    const firstTask = sortByPriority(firstStage.tasks)[0];
    return getTaskMessage(firstTask, "Hello! How can I help you today?");
  };

  const [messages, setMessages] = useState([
    { role: 'bot', text: getFirstBotMessage() },
  ]);
  const [input, setInput] = useState('');
  const [stageIndex, setStageIndex] = useState(0);
  const [taskIndex, setTaskIndex] = useState(1); // already showed first task
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getNextBotMessage = () => {
    // Walk through stages/tasks sequentially for a simple simulation
    const currentStage = sortedStages[stageIndex];
    if (!currentStage) return null;

    const sortedTasks = sortByPriority(currentStage.tasks);

    if (taskIndex < sortedTasks.length) {
      const task = sortedTasks[taskIndex];
      setTaskIndex((i) => i + 1);
      return getTaskMessage(task);
    }

    // Move to next stage
    const nextStageIndex = stageIndex + 1;
    if (nextStageIndex < sortedStages.length) {
      setStageIndex(nextStageIndex);
      const nextStage = sortedStages[nextStageIndex];
      const nextTasks = sortByPriority(nextStage.tasks);
      const task = nextTasks[0];
      setTaskIndex(1);
      if (task) return getTaskMessage(task);
    }

    return "Thank you for the conversation! This is the end of the scenario.";
  };

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const botReply = getNextBotMessage();

    setMessages((prev) => [
      ...prev,
      { role: 'user', text: trimmed },
      ...(botReply ? [{ role: 'bot', text: botReply }] : []),
    ]);
    setInput('');
  };

  const handleRestart = () => {
    setStageIndex(0);
    setTaskIndex(1);
    setMessages([{ role: 'bot', text: getFirstBotMessage() }]);
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Panel */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden animate-[fadeIn_0.2s_ease-out]"
           style={{ height: '600px' }}>
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">{scenario?.name || 'Scenario Simulator'}</p>
            <p className="text-xs text-blue-100">Simulation mode</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRestart}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/20 transition-colors"
              title="Restart simulation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/20 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-slate-50/50">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'bot' && (
                <div className="w-7 h-7 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0 mr-2 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-white text-slate-800 shadow-sm border border-slate-100 rounded-bl-sm'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-slate-100 bg-white">
          <div className="flex items-center gap-2 bg-slate-50 rounded-2xl px-4 py-2 border border-slate-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="flex-1 bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="w-8 h-8 bg-blue-600 text-white rounded-xl flex items-center justify-center disabled:opacity-40 hover:bg-blue-700 transition-colors shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-center text-xs text-slate-400 mt-2">
            Simulation only — no real data is sent
          </p>
        </div>
      </div>
    </div>
  );
}

export default ScenarioSimulator;
