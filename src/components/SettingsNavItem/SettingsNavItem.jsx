/**
 * SettingsNavItem - A single clickable item in the Settings sidebar navigation.
 *
 * Props:
 *  - label     {string}    Display label text.
 *  - icon      {Component} A lucide-react (or similar) icon component.
 *  - isActive  {boolean}   Whether this item is currently active/selected.
 *  - onClick   {Function}  Click handler.
 *  - className {string}    Optional extra classes.
 */
const SettingsNavItem = ({ label, icon: Icon, isActive = false, onClick, className = '' }) => {
    return (
        <div
            onClick={onClick}
            className={`flex items-center gap-3 font-medium px-4 py-3 rounded-xl cursor-pointer transition-all ${
                isActive
                    ? 'bg-white text-indigo-700 shadow-sm border border-indigo-100'
                    : 'text-slate-600 border border-transparent hover:bg-white hover:shadow-sm hover:border-slate-200'
            } ${className}`}
        >
            {Icon && (
                <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-500' : 'text-slate-400'}`} />
            )}
            {label}
        </div>
    );
};

export default SettingsNavItem;
