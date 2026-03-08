import { FileText } from 'lucide-react';

/**
 * KBArticleItem - A single row in the Knowledge Base article list.
 *
 * Props:
 *  - title        {string}     Article title.
 *  - excerpt      {string}     One-line description / excerpt.
 *  - status       {string}     Status label, e.g. "Published" | "Draft".
 *  - date         {string}     Date string, e.g. "Oct 12, 2023".
 *  - icon         {Component}  Optional icon. Defaults to FileText.
 *  - onClick      {Function}   Optional click handler.
 */
const KBArticleItem = ({
    title,
    excerpt,
    status = 'Published',
    date,
    icon: Icon = FileText,
    onClick,
}) => {
    return (
        <div
            onClick={onClick}
            className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center justify-between hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group"
        >
            <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-slate-50 text-slate-500 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                    <Icon className="w-5 h-5" />
                </div>
                <div className="pt-0.5">
                    <h4 className="font-semibold text-slate-800 text-base mb-1 group-hover:text-emerald-700 transition-colors">
                        {title}
                    </h4>
                    <p className="text-sm text-slate-500 line-clamp-1">{excerpt}</p>
                </div>
            </div>

            <div className="shrink-0 flex items-center gap-4 text-sm text-slate-400">
                <span>{status}</span>
                {date && <span>{date}</span>}
            </div>
        </div>
    );
};

export default KBArticleItem;
