import { BrainCircuit, Settings2 } from 'lucide-react';
import ScenarioSectionCard from '../ScenarioSectionCard';
import ScenarioField from '../ScenarioField';
import ScenarioToggleField from '../ScenarioToggleField';
import { SCENARIO_CONFIG_INPUT_CLS } from '../scenarioConfigStyles';
import { FIXED_LLM_MODEL } from '../../pages/ScenarioConfiguration/constants';

export default function ScenarioLLMConfigTab({ config, updateConfig }) {
  const llmConfig = config.llm_config || {};

  const setLLM = (key, value) => {
    updateConfig((draft) => {
      draft.llm_config = draft.llm_config || {};
      draft.llm_config[key] = value;
      draft.llm_config.model = FIXED_LLM_MODEL;
      return draft;
    });
  };

  return (
    <div className="space-y-5">
      <ScenarioSectionCard
        title="LLM Configuration"
        icon={BrainCircuit}
        description="Configure the AI model settings for this scenario."
      >
        <div data-onboarding="llm-model-settings">
        <div className="grid grid-cols-2 gap-4">
          <ScenarioField label="Model">
            <div className="space-y-2">
              <select
                value={FIXED_LLM_MODEL}
                disabled
                className={`${SCENARIO_CONFIG_INPUT_CLS} text-xs font-mono bg-slate-50 text-slate-500 cursor-not-allowed`}
              >
                <option value={FIXED_LLM_MODEL}>{FIXED_LLM_MODEL}</option>
              </select>
              <p className="text-xs text-slate-400">
                Model dikunci untuk semua scenario dan tidak bisa diganti user.
              </p>
            </div>
          </ScenarioField>
          <ScenarioField label="Temperature">
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={0}
                max={1}
                step={0.1}
                value={llmConfig.temperature ?? 0.7}
                onChange={(e) => setLLM('temperature', parseFloat(e.target.value))}
                className="flex-1"
              />
              <span className="text-xs font-mono text-slate-600 w-8 text-center">
                {llmConfig.temperature ?? 0.7}
              </span>
            </div>
          </ScenarioField>
          <ScenarioField label="Max Tokens">
            <input
              type="number"
              min={100}
              max={8000}
              value={llmConfig.max_tokens ?? 2000}
              onChange={(e) => setLLM('max_tokens', parseInt(e.target.value, 10) || 2000)}
              className={`${SCENARIO_CONFIG_INPUT_CLS} w-32`}
            />
          </ScenarioField>
        </div>
        </div>
      </ScenarioSectionCard>

      <ScenarioSectionCard title="Settings" icon={Settings2}>
        <div data-onboarding="llm-kb-setting">
        <ScenarioToggleField
          label="KB Only Strict Mode"
          description="Only answer from knowledge base content"
          checked={config.settings?.kb_only_strict ?? false}
          onChange={(value) =>
            updateConfig((draft) => {
              draft.settings = draft.settings || {};
              draft.settings.kb_only_strict = value;
              return draft;
            })
          }
        />
        </div>
      </ScenarioSectionCard>
    </div>
  );
}
