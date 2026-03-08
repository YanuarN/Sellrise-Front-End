/**
 * PageHeader - Reusable header used at the top of every page.
 *
 * Props:
 *  - title        {string}       Required. The main heading text.
 *  - description  {string}       Optional. Sub-text rendered below the title.
 *  - actions      {ReactNode}    Optional. Buttons / inputs rendered on the right side.
 *  - className    {string}       Optional. Extra classes for the wrapper.
 */
const PageHeader = ({ title, description, actions, className = '' }) => {
    return (
        <div className={`flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 ${className}`}>
            <div>
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight">{title}</h1>
                {description && (
                    <p className="text-sm text-slate-500 mt-2">{description}</p>
                )}
            </div>

            {actions && (
                <div className="flex items-center gap-3 shrink-0">
                    {actions}
                </div>
            )}
        </div>
    );
};

export default PageHeader;
