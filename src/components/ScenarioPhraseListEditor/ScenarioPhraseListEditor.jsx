import { Plus, Trash2 } from 'lucide-react';
import { SCENARIO_CONFIG_INPUT_CLS } from '../scenarioConfigStyles';

export default function ScenarioPhraseListEditor({ phrases, onChange }) {
  const addPhrase = () => onChange([...(phrases || []), '']);
  const removePhrase = (idx) => onChange((phrases || []).filter((_, i) => i !== idx));
  const updatePhrase = (idx, value) => {
    const next = [...(phrases || [])];
    next[idx] = value;
    onChange(next);
  };

  return (
    <div className="space-y-2">
      {(phrases || []).map((phrase, idx) => (
        <div key={idx} className="flex gap-2">
          <textarea
            value={phrase}
            onChange={(e) => updatePhrase(idx, e.target.value)}
            className={`${SCENARIO_CONFIG_INPUT_CLS} flex-1 resize-none h-14 text-xs`}
            placeholder="Approved phrase..."
          />
          <button
            onClick={() => removePhrase(idx)}
            className="w-6 h-6 rounded text-red-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center shrink-0 mt-1"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      ))}
      <button
        onClick={addPhrase}
        className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
      >
        <Plus className="w-3 h-3" /> Add Phrase
      </button>
    </div>
  );
}
