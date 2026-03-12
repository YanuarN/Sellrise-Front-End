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

  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
      <div className="flex gap-2 items-start">
        <select
          value={condType}
          onChange={(e) => onChange({ ...condition, type: e.target.value })}
          className={`${SCENARIO_CONFIG_INPUT_CLS} w-36 text-xs`}
        >
          {CONDITION_TYPES.map((conditionType) => (
            <option key={conditionType.value} value={conditionType.value}>
              {conditionType.label}
            </option>
          ))}
        </select>

        {['all', 'any', 'none'].includes(condType) && (
          <div className="flex-1">
            <input
              type="text"
              value={joinComma(whenClauses)}
              onChange={(e) =>
                onChange({
                  ...condition,
                  type: condType,
                  when: splitComma(e.target.value),
                })
              }
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
