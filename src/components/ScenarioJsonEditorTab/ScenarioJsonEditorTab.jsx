import { useState } from 'react';
import { Code2, BrainCircuit, AlertCircle, Sparkles, Loader2 } from 'lucide-react';
import Button from '../Button';
import ScenarioSectionCard from '../ScenarioSectionCard';

export default function ScenarioJsonEditorTab({
  jsonText,
  jsonError,
  onChange,
  onFormat,
  onEnhance,
  enhancing,
}) {
  const [instructions, setInstructions] = useState('');

  return (
    <div className="space-y-5">
      <ScenarioSectionCard
        title="AI Config Editor"
        icon={BrainCircuit}
        description="Describe changes in natural language — AI will edit the config for you."
        data-onboarding="json-ai-editor"
      >
        <div className="flex gap-2">
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors placeholder-slate-400 flex-1 resize-none h-20"
            placeholder='e.g. "Add a new stage for product demo with priority 65" or "Change max sentences from 2 to 3"...'
          />
          <Button
            className="bg-violet-600 hover:bg-violet-700 text-white gap-1.5 self-end shrink-0"
            onClick={() => {
              onEnhance(instructions);
              setInstructions('');
            }}
            disabled={enhancing || !instructions.trim()}
          >
            {enhancing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Apply
          </Button>
        </div>
      </ScenarioSectionCard>

      <ScenarioSectionCard
        title="JSON Configuration"
        icon={Code2}
        data-onboarding="json-raw-editor"
        action={
          <div className="flex items-center gap-2">
            {jsonError && (
              <span className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {jsonError}
              </span>
            )}
            <button
              onClick={onFormat}
              className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              <Code2 className="w-3 h-3" /> Format
            </button>
          </div>
        }
      >
        <textarea
          value={jsonText}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full border rounded-xl px-4 py-3 font-mono text-xs leading-relaxed focus:outline-none focus:ring-2 resize-none ${
            jsonError
              ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500 bg-red-50/30'
              : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-500 bg-white'
          }`}
          style={{ minHeight: '500px' }}
          spellCheck={false}
        />
      </ScenarioSectionCard>
    </div>
  );
}
