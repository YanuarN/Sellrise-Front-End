import { useEffect, useState } from 'react';
import { Settings2 } from 'lucide-react';
import ScenarioSectionCard from '../ScenarioSectionCard';
import ScenarioCommaSeparatedInput from '../ScenarioCommaSeparatedInput/ScenarioCommaSeparatedInput';
import ScenarioField from '../ScenarioField';
import ScenarioToggleField from '../ScenarioToggleField';
import { SCENARIO_CONFIG_INPUT_CLS } from '../scenarioConfigStyles';

export default function ScenarioRulesTab({ config, updateConfig }) {
  const rules = config.rules || {};
  const [maxSentencesInput, setMaxSentencesInput] = useState(String(rules.max_sentences ?? 2));

  const setRule = (key, value) => {
    updateConfig((draft) => {
      draft.rules = draft.rules || {};
      draft.rules[key] = value;
      return draft;
    });
  };

  const setNestedRule = (key, subKey, value) => {
    updateConfig((draft) => {
      draft.rules = draft.rules || {};
      draft.rules[key] = draft.rules[key] || {};
      draft.rules[key][subKey] = value;
      return draft;
    });
  };

  useEffect(() => {
    setMaxSentencesInput(String(rules.max_sentences ?? 2));
  }, [rules.max_sentences]);

  const handleMaxSentencesChange = (e) => {
    const nextValue = e.target.value;
    setMaxSentencesInput(nextValue);

    if (nextValue === '') return;

    const parsedValue = parseInt(nextValue, 10);
    if (!Number.isNaN(parsedValue)) {
      setRule('max_sentences', parsedValue);
    }
  };

  const handleMaxSentencesBlur = () => {
    const parsedValue = parseInt(maxSentencesInput, 10);
    const normalizedValue = Number.isNaN(parsedValue)
      ? 2
      : Math.min(10, Math.max(1, parsedValue));

    setMaxSentencesInput(String(normalizedValue));
    setRule('max_sentences', normalizedValue);
  };

  return (
    <div className="space-y-5">
      <ScenarioSectionCard
        title="Communication Rules"
        icon={Settings2}
        description="Define conversation behavior constraints."
      >
        <div className="grid grid-cols-2 gap-4">
          <ScenarioToggleField
            label="One question per message"
            checked={rules.one_question_rule ?? true}
            onChange={(value) => setRule('one_question_rule', value)}
          />
          <ScenarioToggleField
            label="Facts only (no speculation)"
            checked={rules.facts_only ?? true}
            onChange={(value) => setRule('facts_only', value)}
          />
          <ScenarioToggleField
            label="Allow emoji"
            checked={rules.emoji?.allowed ?? false}
            onChange={(value) => setNestedRule('emoji', 'allowed', value)}
          />
          <ScenarioField label="Max sentences per message">
            <input
              type="number"
              min={1}
              max={10}
              value={maxSentencesInput}
              onChange={handleMaxSentencesChange}
              onBlur={handleMaxSentencesBlur}
              className={`${SCENARIO_CONFIG_INPUT_CLS} w-24`}
            />
          </ScenarioField>
        </div>

        <div className="mt-4">
          <h4 className="text-sm font-medium text-slate-700 mb-2">Character Limits</h4>
          <div className="grid grid-cols-3 gap-3">
            {['default', 'outbound', 'followup'].map((key) => (
              <ScenarioField key={key} label={key.charAt(0).toUpperCase() + key.slice(1)}>
                <input
                  type="number"
                  min={100}
                  max={2000}
                  value={rules.max_chars?.[key] ?? 420}
                  onChange={(e) =>
                    setNestedRule('max_chars', key, parseInt(e.target.value, 10) || 420)
                  }
                  className={`${SCENARIO_CONFIG_INPUT_CLS} w-full`}
                />
              </ScenarioField>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <ScenarioField label="Forbidden phrases (comma-separated)">
            <ScenarioCommaSeparatedInput
              value={Array.isArray(rules.forbid) ? rules.forbid.join(', ') : ''}
              onChange={(value) => setRule('forbid', value)}
              className={SCENARIO_CONFIG_INPUT_CLS}
              placeholder="I think, probably, maybe"
            />
          </ScenarioField>
        </div>
      </ScenarioSectionCard>
    </div>
  );
}
