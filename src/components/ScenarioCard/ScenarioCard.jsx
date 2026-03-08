import { Bot } from 'lucide-react';
import { Button } from '../index';

/**
 * ScenarioCard - Card representing a single automation scenario.
 *
 * Props:
 *  - title       {string}    Scenario name.
 *  - description {string}    Short description of the scenario.
 *  - status      {string}    Status label displayed as a badge (e.g. "Published (v1.2)").
 *  - lastModified {string}   Human-readable last modification time (e.g. "Modified 2d ago").
 *  - onEdit      {Function}  Callback when the Edit button is clicked.
 *  - onSimulate  {Function}  Callback when the Simulate button is clicked.
 *  - icon        {Component} Optional override for the scenario icon. Defaults to Bot.
 */
const ScenarioCard = ({
    title,
    description,
    status = 'Published',
    lastModified,
    onEdit,
    onSimulate,
    icon: Icon = Bot,
}) => {
    return (
        <div className="group bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-xl hover:-translate-y-1 hover:border-blue-200 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                    <Icon className="w-6 h-6" />
                </div>
                <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                    {status}
                </span>
            </div>

            <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                {title}
            </h3>
            <p className="text-sm text-slate-500 mb-6 line-clamp-2">
                {description}
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <span className="text-xs text-slate-400 font-medium tracking-wide uppercase">
                    {lastModified}
                </span>
                <div className="flex gap-2">
                    <Button variant="outline" className="text-xs py-1.5 px-3 h-auto" onClick={onEdit}>
                        Edit
                    </Button>
                    <Button variant="secondary" className="text-xs py-1.5 px-3 h-auto" onClick={onSimulate}>
                        Simulate
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ScenarioCard;
