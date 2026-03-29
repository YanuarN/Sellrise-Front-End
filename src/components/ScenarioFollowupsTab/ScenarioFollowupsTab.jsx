import { Clock, Plus, Trash2 } from 'lucide-react';
import ScenarioSectionCard from '../ScenarioSectionCard';
import { SCENARIO_CONFIG_INPUT_CLS } from '../scenarioConfigStyles';

export default function ScenarioFollowupsTab({ config, updateConfig }) {
  const followups = config.followup_sequences || {};
  const entries = Object.entries(followups);

  const addSequence = () => {
    const key = `stage_${entries.length}`;
    updateConfig((draft) => {
      draft.followup_sequences = draft.followup_sequences || {};
      draft.followup_sequences[key] = [];
      return draft;
    });
  };

  const removeSequence = (key) => {
    updateConfig((draft) => {
      delete draft.followup_sequences[key];
      return draft;
    });
  };

  const addFollowup = (sequenceKey) => {
    updateConfig((draft) => {
      draft.followup_sequences[sequenceKey] = draft.followup_sequences[sequenceKey] || [];
      draft.followup_sequences[sequenceKey].push({
        delay: '60m',
        message: '',
        tags: [],
      });
      return draft;
    });
  };

  const removeFollowup = (sequenceKey, idx) => {
    updateConfig((draft) => {
      draft.followup_sequences[sequenceKey]?.splice(idx, 1);
      return draft;
    });
  };

  const updateFollowup = (sequenceKey, idx, field, value) => {
    updateConfig((draft) => {
      const followup = draft.followup_sequences?.[sequenceKey]?.[idx];
      if (followup) followup[field] = value;
      return draft;
    });
  };

  return (
    <div className="space-y-5">
      <ScenarioSectionCard
        title="Follow-up Sequences"
        icon={Clock}
        description="Define timed follow-up messages when leads go silent."
        data-onboarding="followups-section"
        action={
          <button
            onClick={addSequence}
            className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700"
          >
            <Plus className="w-3.5 h-3.5" /> Add Sequence
          </button>
        }
      >
        {entries.length === 0 ? (
          <p className="text-sm text-slate-400 italic">No follow-up sequences defined.</p>
        ) : (
          <div className="space-y-4">
            {entries.map(([key, items]) => (
              <div key={key} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-slate-700 font-mono">{key}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => addFollowup(key)}
                      className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
                    >
                      <Plus className="w-3 h-3" /> Add
                    </button>
                    <button
                      onClick={() => removeSequence(key)}
                      className="w-6 h-6 rounded text-red-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {Array.isArray(items) && items.length > 0 ? (
                  <div className="space-y-2">
                    {items.map((followup, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 p-2 bg-white rounded-lg border border-slate-100"
                      >
                        <input
                          type="text"
                          value={followup.delay || ''}
                          onChange={(e) => updateFollowup(key, idx, 'delay', e.target.value)}
                          className={`${SCENARIO_CONFIG_INPUT_CLS} w-20 text-xs font-mono`}
                          placeholder="60m"
                        />
                        <textarea
                          value={followup.message || ''}
                          onChange={(e) => updateFollowup(key, idx, 'message', e.target.value)}
                          className={`${SCENARIO_CONFIG_INPUT_CLS} flex-1 resize-none h-14 text-xs`}
                          placeholder="Follow-up message..."
                        />
                        <button
                          onClick={() => removeFollowup(key, idx)}
                          className="w-6 h-6 rounded text-red-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center shrink-0 mt-1"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No follow-ups in this sequence.</p>
                )}
              </div>
            ))}
          </div>
        )}
      </ScenarioSectionCard>
    </div>
  );
}
