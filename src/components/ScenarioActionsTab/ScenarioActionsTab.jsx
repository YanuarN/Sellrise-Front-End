import { Zap, Plus, Trash2, Hash } from 'lucide-react';
import ScenarioSectionCard from '../ScenarioSectionCard';
import { SCENARIO_CONFIG_INPUT_CLS } from '../scenarioConfigStyles';
import { ACTION_TYPES } from '../../pages/ScenarioConfiguration/constants';

export default function ScenarioActionsTab({ config, updateConfig }) {
  const catalog = config.actions_catalog || {};
  const entries = Object.entries(catalog);

  const addAction = () => {
    const tag = `#action_${Date.now().toString(36)}`;
    updateConfig((draft) => {
      draft.actions_catalog = draft.actions_catalog || {};
      draft.actions_catalog[tag] = { type: 'custom', payload_schema: {} };
      return draft;
    });
  };

  const removeAction = (tag) => {
    updateConfig((draft) => {
      delete draft.actions_catalog[tag];
      return draft;
    });
  };

  const renameAction = (oldTag, newTag) => {
    if (!newTag || newTag === oldTag || config.actions_catalog[newTag]) return;
    const normalizedTag = newTag.startsWith('#') ? newTag : `#${newTag}`;
    updateConfig((draft) => {
      const value = draft.actions_catalog[oldTag];
      delete draft.actions_catalog[oldTag];
      draft.actions_catalog[normalizedTag] = value;
      return draft;
    });
  };

  const updateAction = (tag, field, value) => {
    updateConfig((draft) => {
      if (draft.actions_catalog[tag]) {
        draft.actions_catalog[tag][field] = value;
      }
      return draft;
    });
  };

  return (
    <div className="space-y-5">
      <ScenarioSectionCard
        title="Actions Catalog"
        icon={Zap}
        description="Define backend actions that can be triggered by the conversation."
        action={
          <button
            onClick={addAction}
            className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700"
          >
            <Plus className="w-3.5 h-3.5" /> Add Action
          </button>
        }
      >
        {entries.length === 0 ? (
          <p className="text-sm text-slate-400 italic">
            No actions. Click &ldquo;Add Action&rdquo; to create one.
          </p>
        ) : (
          <div className="space-y-3">
            {entries.map(([tag, value]) => (
              <div
                key={tag}
                className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100"
              >
                <Hash className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  defaultValue={tag}
                  onBlur={(e) => renameAction(tag, e.target.value.trim())}
                  className={`${SCENARIO_CONFIG_INPUT_CLS} flex-1 font-mono text-xs`}
                  placeholder="#action_tag"
                />
                <select
                  value={value.type || 'custom'}
                  onChange={(e) => updateAction(tag, 'type', e.target.value)}
                  className={`${SCENARIO_CONFIG_INPUT_CLS} w-44 text-xs`}
                >
                  {ACTION_TYPES.map((actionType) => (
                    <option key={actionType.value} value={actionType.value}>
                      {actionType.label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => removeAction(tag)}
                  className="w-7 h-7 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </ScenarioSectionCard>
    </div>
  );
}
