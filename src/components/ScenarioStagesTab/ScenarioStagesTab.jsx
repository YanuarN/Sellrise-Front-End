import { useState } from 'react';
import { Layers, Plus } from 'lucide-react';
import ScenarioSectionCard from '../ScenarioSectionCard';
import ScenarioCommaSeparatedInput from '../ScenarioCommaSeparatedInput/ScenarioCommaSeparatedInput';
import ScenarioField from '../ScenarioField';
import ScenarioEntryConditionEditor from '../ScenarioEntryConditionEditor';
import ScenarioPhraseListEditor from '../ScenarioPhraseListEditor';
import ScenarioCollapsibleHeader from '../ScenarioCollapsibleHeader';
import { SCENARIO_CONFIG_INPUT_CLS } from '../scenarioConfigStyles';

export default function ScenarioStagesTab({ config, updateConfig }) {
  const stages = Array.isArray(config.stages) ? config.stages : [];
  const [expandedStages, setExpandedStages] = useState({});
  const [expandedTasks, setExpandedTasks] = useState({});

  const toggleStage = (idx) => setExpandedStages((state) => ({ ...state, [idx]: !state[idx] }));
  const toggleTask = (stageIdx, taskIdx) =>
    setExpandedTasks((state) => ({
      ...state,
      [`${stageIdx}-${taskIdx}`]: !state[`${stageIdx}-${taskIdx}`],
    }));

  const addStage = () => {
    updateConfig((draft) => {
      draft.stages = draft.stages || [];
      draft.stages.push({
        stage_id: `stage_${draft.stages.length}`,
        priority: Math.max(0, ...draft.stages.map((stage) => stage.priority || 0)) - 10 || 50,
        entry_condition: { type: 'always' },
        instruction: '',
        fallback_phrases: [],
        tasks: [],
      });
      return draft;
    });
  };

  const removeStage = (idx) => {
    updateConfig((draft) => {
      draft.stages.splice(idx, 1);
      return draft;
    });
  };

  const updateStage = (idx, field, value) => {
    updateConfig((draft) => {
      if (draft.stages[idx]) draft.stages[idx][field] = value;
      return draft;
    });
  };

  const addTask = (stageIdx) => {
    updateConfig((draft) => {
      const stage = draft.stages[stageIdx];
      if (!stage) return draft;
      stage.tasks = stage.tasks || [];
      stage.tasks.push({
        task_id: `task_${stageIdx}_${stage.tasks.length}`,
        priority: 100,
        criteria: { type: 'always' },
        instruction: '',
        approved_phrases: [],
      });
      return draft;
    });
  };

  const removeTask = (stageIdx, taskIdx) => {
    updateConfig((draft) => {
      draft.stages[stageIdx]?.tasks?.splice(taskIdx, 1);
      return draft;
    });
  };

  const updateTask = (stageIdx, taskIdx, field, value) => {
    updateConfig((draft) => {
      const task = draft.stages[stageIdx]?.tasks?.[taskIdx];
      if (task) task[field] = value;
      return draft;
    });
  };

  return (
    <div className="space-y-5">
      <ScenarioSectionCard
        title="Conversation Stages"
        icon={Layers}
        description="Define stages and tasks that guide the conversation flow. Higher priority stages are evaluated first."
        data-onboarding="stages-section"
        action={
          <button
            onClick={addStage}
            className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700"
          >
            <Plus className="w-3.5 h-3.5" /> Add Stage
          </button>
        }
      >
        {stages.length === 0 ? (
          <p className="text-sm text-slate-400 italic">
            No stages defined. Click &ldquo;Add Stage&rdquo; to create one.
          </p>
        ) : (
          <div className="space-y-3">
            {stages.map((stage, idx) => {
              const isExpanded = expandedStages[idx] ?? false;
              return (
                <div key={idx} className="border border-slate-200 rounded-xl bg-white overflow-hidden">
                  <ScenarioCollapsibleHeader
                    expanded={isExpanded}
                    onToggle={() => toggleStage(idx)}
                    onDelete={() => removeStage(idx)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-semibold text-blue-600 truncate">
                        {stage.stage_id || `Stage ${idx}`}
                      </span>
                      <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">
                        P{stage.priority ?? 0}
                      </span>
                      <span className="text-xs text-slate-400">
                        {stage.entry_condition?.type || 'always'}
                      </span>
                    </div>
                    {stage.instruction && (
                      <p className="text-xs text-slate-400 truncate mt-0.5">{stage.instruction}</p>
                    )}
                    <span className="text-xs text-slate-400 shrink-0 block mt-1">
                      {stage.tasks?.length || 0} task{(stage.tasks?.length || 0) !== 1 ? 's' : ''}
                    </span>
                  </ScenarioCollapsibleHeader>

                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 border-t border-slate-100 space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <ScenarioField label="Stage ID">
                          <input
                            type="text"
                            value={stage.stage_id || ''}
                            onChange={(e) =>
                              updateStage(idx, 'stage_id', e.target.value.trim().replace(/\s+/g, '_'))
                            }
                            className={`${SCENARIO_CONFIG_INPUT_CLS} font-mono text-xs`}
                          />
                        </ScenarioField>
                        <ScenarioField label="Priority">
                          <input
                            type="number"
                            value={stage.priority ?? 0}
                            onChange={(e) =>
                              updateStage(idx, 'priority', parseInt(e.target.value, 10) || 0)
                            }
                            className={`${SCENARIO_CONFIG_INPUT_CLS} w-24`}
                          />
                        </ScenarioField>
                      </div>

                      <ScenarioField label="Instruction">
                        <textarea
                          value={stage.instruction || ''}
                          onChange={(e) => updateStage(idx, 'instruction', e.target.value)}
                          className={`${SCENARIO_CONFIG_INPUT_CLS} resize-none h-20 text-xs`}
                          placeholder="Instructions for the AI within this stage..."
                        />
                      </ScenarioField>

                      <ScenarioEntryConditionEditor
                        condition={stage.entry_condition || { type: 'always' }}
                        onChange={(condition) => updateStage(idx, 'entry_condition', condition)}
                      />

                      <ScenarioField label="Required Slots (comma-separated)">
                        <ScenarioCommaSeparatedInput
                          value={Array.isArray(stage.required_slots) ? stage.required_slots.join(', ') : ''}
                          onChange={(value) => updateStage(idx, 'required_slots', value)}
                          className={`${SCENARIO_CONFIG_INPUT_CLS} text-xs font-mono`}
                          placeholder="industry, role"
                        />
                      </ScenarioField>

                      <ScenarioField label="Fallback Phrases">
                        <ScenarioPhraseListEditor
                          phrases={stage.fallback_phrases || []}
                          onChange={(phrases) => updateStage(idx, 'fallback_phrases', phrases)}
                        />
                      </ScenarioField>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-semibold text-slate-700">Tasks</h4>
                          <button
                            onClick={() => addTask(idx)}
                            className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
                          >
                            <Plus className="w-3 h-3" /> Add Task
                          </button>
                        </div>

                        {!stage.tasks || stage.tasks.length === 0 ? (
                          <p className="text-xs text-slate-400 italic">
                            No tasks. Add a task to define behavior within this stage.
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {stage.tasks.map((task, taskIdx) => {
                              const taskExpanded = expandedTasks[`${idx}-${taskIdx}`] ?? false;
                              return (
                                <div
                                  key={taskIdx}
                                  className="border border-slate-100 rounded-lg bg-slate-50/50 overflow-hidden"
                                >
                                  <ScenarioCollapsibleHeader
                                    expanded={taskExpanded}
                                    onToggle={() => toggleTask(idx, taskIdx)}
                                    onDelete={() => removeTask(idx, taskIdx)}
                                    className="px-3 py-2"
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="font-mono text-xs font-medium text-slate-600 flex-1 truncate">
                                        {task.task_id || `Task ${taskIdx}`}
                                      </span>
                                      <span className="text-xs bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-medium">
                                        P{task.priority ?? 0}
                                      </span>
                                    </div>
                                  </ScenarioCollapsibleHeader>

                                  {taskExpanded && (
                                    <div className="px-3 pb-3 pt-1 border-t border-slate-100 space-y-3">
                                      <div className="grid grid-cols-2 gap-3">
                                        <ScenarioField label="Task ID">
                                          <input
                                            type="text"
                                            value={task.task_id || ''}
                                            onChange={(e) =>
                                              updateTask(
                                                idx,
                                                taskIdx,
                                                'task_id',
                                                e.target.value.trim().replace(/\s+/g, '_'),
                                              )
                                            }
                                            className={`${SCENARIO_CONFIG_INPUT_CLS} font-mono text-xs`}
                                          />
                                        </ScenarioField>
                                        <ScenarioField label="Priority">
                                          <input
                                            type="number"
                                            value={task.priority ?? 100}
                                            onChange={(e) =>
                                              updateTask(
                                                idx,
                                                taskIdx,
                                                'priority',
                                                parseInt(e.target.value, 10) || 0,
                                              )
                                            }
                                            className={`${SCENARIO_CONFIG_INPUT_CLS} w-24`}
                                          />
                                        </ScenarioField>
                                      </div>

                                      <ScenarioField label="Instruction">
                                        <textarea
                                          value={task.instruction || ''}
                                          onChange={(e) => updateTask(idx, taskIdx, 'instruction', e.target.value)}
                                          className={`${SCENARIO_CONFIG_INPUT_CLS} resize-none h-16 text-xs`}
                                          placeholder="Task instruction for the AI..."
                                        />
                                      </ScenarioField>

                                      <ScenarioEntryConditionEditor
                                        label="Criteria"
                                        condition={task.criteria || { type: 'always' }}
                                        onChange={(condition) => updateTask(idx, taskIdx, 'criteria', condition)}
                                      />

                                      <ScenarioField label="Tags (comma-separated)">
                                        <ScenarioCommaSeparatedInput
                                          value={Array.isArray(task.tags) ? task.tags.join(', ') : ''}
                                          onChange={(value) => updateTask(idx, taskIdx, 'tags', value)}
                                          className={`${SCENARIO_CONFIG_INPUT_CLS} text-xs font-mono`}
                                          placeholder="#handover, #product_request"
                                        />
                                      </ScenarioField>

                                      <ScenarioField label="Approved Phrases">
                                        <ScenarioPhraseListEditor
                                          phrases={task.approved_phrases || []}
                                          onChange={(phrases) => updateTask(idx, taskIdx, 'approved_phrases', phrases)}
                                        />
                                      </ScenarioField>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </ScenarioSectionCard>
    </div>
  );
}
