import { Trash2, ChevronDown, ChevronRight } from 'lucide-react';

export default function ScenarioCollapsibleHeader({
  expanded,
  onToggle,
  children,
  onDelete,
  className = '',
}) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors ${className}`}
      onClick={onToggle}
    >
      {expanded ? (
        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
      ) : (
        <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
      )}
      <div className="flex-1 min-w-0">{children}</div>
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="w-7 h-7 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center shrink-0"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
