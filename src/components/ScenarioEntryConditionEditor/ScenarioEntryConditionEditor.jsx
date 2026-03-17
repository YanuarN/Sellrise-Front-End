import { useEffect, useState } from 'react';
import { CONDITION_TYPES } from '../../pages/ScenarioConfiguration/constants';
import { splitComma, joinComma } from '../../pages/ScenarioConfiguration/utils';
import { SCENARIO_CONFIG_INPUT_CLS } from '../scenarioConfigStyles';

export default function ScenarioEntryConditionEditor({
  label = 'Entry Condition',
  condition,
  onChange,
}) {
  const condType = condition?.type || 'always';
  const whenClauses = condition?.when || [];
  const [draftWhen, setDraftWhen] = useState(joinComma(whenClauses));

  useEffect(() => {
    setDraftWhen(joinComma(whenClauses));
  }, [condition?.when]);

  const commitWhenClauses = () => {
    onChange({
      ...condition,
      type: condType,
      when: splitComma(draftWhen),
    });
  };

  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
      <div
        className={['all', 'any', 'none'].includes(condType)
          ? 'grid grid-cols-[minmax(0,11rem),minmax(0,1fr)] gap-2 items-start'
          : 'flex'}
      >
        <select
          value={condType}
          onChange={(e) => onChange({ ...condition, type: e.target.value })}
          className={`${SCENARIO_CONFIG_INPUT_CLS} w-full text-xs`}
        >
          {CONDITION_TYPES.map((conditionType) => (
            <option key={conditionType.value} value={conditionType.value}>
              {conditionType.label}
            </option>
          ))}
        </select>

        {['all', 'any', 'none'].includes(condType) && (
          <div className="min-w-0">
            <input
              type="text"
              value={draftWhen}
              onChange={(e) => setDraftWhen(e.target.value)}
              onBlur={commitWhenClauses}
              onKeyDown={(e) => {
                if (e.key === 'Enter') e.currentTarget.blur();
              }}
              className={`${SCENARIO_CONFIG_INPUT_CLS} text-xs font-mono`}
              placeholder="slots.industry is not null, slots.role is not null"
            />
            <p className="text-xs text-slate-400 mt-1">
              Separate clauses with commas. Supported:{' '}
              <code className="bg-slate-100 px-1 rounded">slots.X is null</code>,{' '}
              <code className="bg-slate-100 px-1 rounded">slots.X is not null</code>,{' '}
              <code className="bg-slate-100 px-1 rounded">context.Y == true</code>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
