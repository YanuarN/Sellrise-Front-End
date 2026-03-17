import { MessageSquare, Plus, Trash2, Sparkles, Loader2 } from 'lucide-react';
import ScenarioSectionCard from '../ScenarioSectionCard';
import { PROMPT_TEMPLATES } from '../../pages/ScenarioConfiguration/constants';

export default function ScenarioPromptsTab({
  config,
  updateConfig,
  enhancePrompt,
  enhancingField,
}) {
  const prompts = config.prompts || {};
  const entries = Object.entries(prompts);

  const addPrompt = () => {
    const key = `custom_${Date.now().toString(36)}`;
    updateConfig((draft) => {
      draft.prompts = draft.prompts || {};
      draft.prompts[key] = '';
      return draft;
    });
  };

  const removePrompt = (key) => {
    updateConfig((draft) => {
      delete draft.prompts[key];
      return draft;
    });
  };

  const renamePrompt = (oldKey, newKey) => {
    if (!newKey || newKey === oldKey || config.prompts[newKey]) return;
    updateConfig((draft) => {
      const value = draft.prompts[oldKey];
      delete draft.prompts[oldKey];
      draft.prompts[newKey] = value;
      return draft;
    });
  };

  const setPromptValue = (key, value) => {
    updateConfig((draft) => {
      draft.prompts = draft.prompts || {};
      draft.prompts[key] = value;
      return draft;
    });
  };

  return (
    <div className="space-y-5">
      <ScenarioSectionCard
        title="System Prompts"
        icon={MessageSquare}
        description="Configure prompts that guide AI behavior in different conversation phases."
        action={
          <div className="flex items-center gap-2">
            <select
              onChange={(e) => {
                if (e.target.value) {
                  const key = e.target.value;
                  if (!config.prompts?.[key]) {
                    updateConfig((draft) => {
                      draft.prompts = draft.prompts || {};
                      draft.prompts[key] = PROMPT_TEMPLATES[key] || '';
                      return draft;
                    });
                  }
                  e.target.value = '';
                }
              }}
              className="text-xs border border-slate-200 rounded-lg px-2 py-1 text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              defaultValue=""
            >
              <option value="" disabled>
                Add template...
              </option>
              {Object.keys(PROMPT_TEMPLATES)
                .filter((key) => !prompts[key])
                .map((key) => (
                  <option key={key} value={key}>
                    {key}
                  </option>
                ))}
            </select>
            <button
              onClick={addPrompt}
              className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              <Plus className="w-3.5 h-3.5" /> Custom
            </button>
          </div>
        }
      >
        {entries.length === 0 ? (
          <p className="text-sm text-slate-400 italic">
            No prompts defined. Add from templates or create custom.
          </p>
        ) : (
          <div className="space-y-4">
            {entries.map(([key, value]) => (
              <div key={key} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <input
                    type="text"
                    defaultValue={key}
                    onBlur={(e) => renamePrompt(key, e.target.value.trim().replace(/\s+/g, '_'))}
                    className="text-sm font-semibold text-slate-700 bg-transparent border-none focus:outline-none focus:ring-0 p-0"
                  />
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => enhancePrompt(key)}
                      disabled={enhancingField === key}
                      className="flex items-center gap-1 text-xs font-medium text-violet-600 hover:text-violet-700 disabled:opacity-50 px-2 py-1 rounded-lg hover:bg-violet-50 transition-colors"
                    >
                      {enhancingField === key ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Sparkles className="w-3 h-3" />
                      )}
                      Enhance
                    </button>
                    <button
                      onClick={() => removePrompt(key)}
                      className="w-6 h-6 rounded text-red-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <textarea
                  value={value || ''}
                  onChange={(e) => setPromptValue(key, e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none h-32 bg-white"
                  placeholder="Enter system prompt..."
                />
              </div>
            ))}
          </div>
        )}
      </ScenarioSectionCard>
    </div>
  );
}
