import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

/**
 * StatCard - A KPI card showing a metric with a trend indicator.
 *
 * Props:
 *  - title      {string}      Label/title of the metric.
 *  - value      {string}      The main numeric value to display.
 *  - change     {string}      Change string, e.g. "+12.5%" or "-18s".
 *  - isPositive {boolean}     Whether the change is positive (green) or negative (red).
 *  - icon       {Component}   A lucide-react (or similar) icon component.
 *  - colorClass {string}      Tailwind classes for the icon container background & text color.
 *  - className  {string}      Optional extra wrapper classes.
 */
const StatCard = ({ title, value, change, isPositive, icon: Icon, colorClass = 'bg-blue-50 text-blue-600 border border-blue-100', className = '' }) => {
    return (
        <div className={`bg-white rounded-[24px] p-6 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300 group ${className}`}>
            <div className="flex items-center justify-between mb-4">
                {Icon && (
                    <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center ${colorClass} shadow-sm transition-transform group-hover:scale-105`}>
                        <Icon className="w-5 h-5" />
                    </div>
                )}
                {change !== undefined && (
                    <div className={`flex items-center gap-1 text-[13px] font-bold px-2.5 py-1 rounded-full ${isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                        <span>{change}</span>
                    </div>
                )}
            </div>

            <div>
                <h3 className="text-[15px] font-semibold text-gray-500 mb-1">{title}</h3>
                <div className="text-[32px] font-bold text-gray-900 tracking-tight leading-none">
                    {value}
                </div>
            </div>
        </div>
    );
};

export default StatCard;
