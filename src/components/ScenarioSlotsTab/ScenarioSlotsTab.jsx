import { ListChecks, Plus, Trash2, GripVertical } from 'lucide-react';
import ScenarioSectionCard from '../ScenarioSectionCard';
import ScenarioToggleField from '../ScenarioToggleField';
import { SCENARIO_CONFIG_INPUT_CLS } from '../scenarioConfigStyles';
import { SLOT_TYPES } from '../../pages/ScenarioConfiguration/constants';

export default function ScenarioSlotsTab({ config, updateConfig }) {
  const slots = config.slots_schema || {};
  const entries = Object.entries(slots);

  const addSlot = () => {
    const key = `new_slot_${Date.now().toString(36)}`;
    updateConfig((draft) => {
      draft.slots_schema = draft.slots_schema || {};
      draft.slots_schema[key] = { type: 'string', required: false };
      return draft;
    });
  };

  const removeSlot = (key) => {
    updateConfig((draft) => {
      delete draft.slots_schema[key];
      return draft;
    });
  };

  const renameSlot = (oldKey, newKey) => {
    if (!newKey || newKey === oldKey || config.slots_schema[newKey]) return;
    updateConfig((draft) => {
      const value = draft.slots_schema[oldKey];
      delete draft.slots_schema[oldKey];
      draft.slots_schema[newKey] = value;
      return draft;
    });
  };

  const updateSlot = (key, field, value) => {
    updateConfig((draft) => {
      if (draft.slots_schema[key]) {
        draft.slots_schema[key][field] = value;
      }
      return draft;
    });
  };

  return (
    <div className="space-y-5">
      <ScenarioSectionCard
        title="Slots Schema"
        icon={ListChecks}
        description="Define data fields to collect from leads during conversation."
        action={
          <button
            onClick={addSlot}
            className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700"
          >
            <Plus className="w-3.5 h-3.5" /> Add Slot
          </button>
        }
      >
        {entries.length === 0 ? (
          <p className="text-sm text-slate-400 italic">
            No slots defined. Click &ldquo;Add Slot&rdquo; to create one.
          </p>
        ) : (
          <div className="space-y-3">
            {entries.map(([key, value]) => (
              <div
                key={key}
                className="grid grid-cols-[auto,minmax(0,1fr),7rem,auto,auto] items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100"
              >
                <GripVertical className="w-4 h-4 text-slate-300 shrink-0" />
                <input
                  type="text"
                  defaultValue={key}
                  onBlur={(e) => renameSlot(key, e.target.value.trim().replace(/\s+/g, '_'))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') e.currentTarget.blur();
                  }}
                  className={`${SCENARIO_CONFIG_INPUT_CLS} min-w-0 font-mono text-xs`}
                  placeholder="slot_name"
                />
                <select
                  value={value.type || 'string'}
                  onChange={(e) => updateSlot(key, 'type', e.target.value)}
                  className={`${SCENARIO_CONFIG_INPUT_CLS} text-xs`}
                >
                  {SLOT_TYPES.map((typeOption) => (
                    <option key={typeOption.value} value={typeOption.value}>
                      {typeOption.label}
                    </option>
                  ))}
                </select>
                <ScenarioToggleField
                  label="Req"
                  checked={value.required ?? false}
                  onChange={(checked) => updateSlot(key, 'required', checked)}
                  compact
                />
                <button
                  onClick={() => removeSlot(key)}
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
