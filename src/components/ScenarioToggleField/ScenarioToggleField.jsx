export default function ScenarioToggleField({
  label,
  description,
  checked,
  onChange,
  compact,
}) {
  return (
    <label className={`flex items-center gap-2 ${compact ? '' : 'cursor-pointer'}`}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-9 h-5 rounded-full transition-colors shrink-0 ${
          checked ? 'bg-blue-600' : 'bg-slate-300'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform shadow-sm ${
            checked ? 'translate-x-4' : ''
          }`}
        />
      </button>
      <div>
        <span className={`${compact ? 'text-xs' : 'text-sm'} font-medium text-slate-700`}>
          {label}
        </span>
        {description && <p className="text-xs text-slate-400">{description}</p>}
      </div>
    </label>
  );
}
