import { useState } from 'react';
import { Sparkles, Loader } from 'lucide-react';
import { Button } from '../../../components';
import api from '../../../services/api';

const PROMPT_TEMPLATES = {
  main: "You are an AI conversation agent for lead qualification. Follow all rules strictly: max 1 question per message, max 2 sentences, max 420 characters. Never use phrases like 'I think', 'probably', or 'maybe'. State facts only from the knowledge base—never invent information. Be professional, direct, and helpful.",
  qualification: "Your goal is to efficiently qualify leads by collecting required information (industry, role, interest trigger) through one question at a time. Keep responses concise (max 2 sentences, 420 chars). Guide the conversation toward either a quick chat qualification or booking a 15-minute demo call.",
  outbound: "When initiating outbound contact, introduce yourself and the company value proposition in one sentence, then request permission to ask 2 short questions. Keep total message under 520 characters. Be respectful of their time.",
  meeting_booking: "When booking meetings, be specific about the agenda (15-minute call to map process, show AI flow, agree next steps). Collect datetime and email efficiently. Confirm booking clearly with all details. Handle objections by offering flexible alternatives without repeating the same close.",
  followup: "For follow-up messages after silence, be brief and non-pushy. First check in (60 min silence), then remind (4 hours), offer demo (24 hours), or send resources and soft close (3 days). Max 520 characters per followup message."
};

function SystemPromptEditor({ prompts, onChange }) {
  const [enhancing, setEnhancing] = useState(null);

  const handlePromptChange = (key, value) => {
    onChange({
      ...prompts,
      [key]: value
    });
  };

  const handleEnhancePrompt = async (key) => {
    try {
      setEnhancing(key);
      const response = await api.llm.enhance({
        prompt: prompts[key],
        type: 'system_prompt',
        context: key
      });

      if (response.enhanced_prompt) {
        handlePromptChange(key, response.enhanced_prompt);
      }
    } catch (err) {
      console.error('Failed to enhance prompt:', err);
    } finally {
      setEnhancing(null);
    }
  };

  const addNewPrompt = () => {
    const newKey = `custom_${Date.now()}`;
    onChange({
      ...prompts,
      [newKey]: ''
    });
  };

  const removePrompt = (key) => {
    const newPrompts = { ...prompts };
    delete newPrompts[key];
    onChange(newPrompts);
  };

  const loadTemplate = (key) => {
    if (PROMPT_TEMPLATES[key]) {
      handlePromptChange(key, PROMPT_TEMPLATES[key]);
    }
  };

  return (
    <div className="space-y-4">
      {Object.entries(prompts || {}).map(([key, value]) => (
        <div key={key} className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 capitalize">
              {key.replace(/_/g, ' ')} Prompt
            </label>
            <div className="flex items-center gap-2">
              {PROMPT_TEMPLATES[key] && (
                <button
                  onClick={() => loadTemplate(key)}
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  Load Template
                </button>
              )}
              <button
                onClick={() => handleEnhancePrompt(key)}
                disabled={enhancing === key || !value}
                className="flex items-center gap-1 px-2 py-1 text-xs text-purple-600 hover:bg-purple-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {enhancing === key ? (
                  <Loader className="w-3 h-3 animate-spin" />
                ) : (
                  <Sparkles className="w-3 h-3" />
                )}
                Enhance
              </button>
              {!['main', 'qualification', 'closing'].includes(key) && (
                <button
                  onClick={() => removePrompt(key)}
                  className="text-xs text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
          <textarea
            value={value || ''}
            onChange={(e) => handlePromptChange(key, e.target.value)}
            rows={4}
            className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder={`Enter ${key} prompt...`}
          />
        </div>
      ))}

      <Button
        variant="ghost"
        size="sm"
        onClick={addNewPrompt}
        className="w-full"
      >
        + Add Custom Prompt
      </Button>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <p className="text-xs text-yellow-800">
          <strong>Tip:</strong> System prompts guide the LLM's behavior throughout the conversation. 
          Be specific and include examples where possible. Use "Enhance" to improve prompts with AI.
        </p>
      </div>
    </div>
  );
}

export default SystemPromptEditor;
