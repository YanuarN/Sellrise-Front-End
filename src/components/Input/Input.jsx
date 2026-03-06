import { Search } from 'lucide-react';

const Input = ({ icon: Icon, placeholder, className = '', ...props }) => {
    const paddingClass = Icon ? 'pl-9' : 'pl-4';

    return (
        <div className={`relative flex items-center ${className}`}>
            {Icon && (
                <span className="absolute left-3 text-gray-400">
                    <Icon className="w-4 h-4" />
                </span>
            )}
            <input
                type="text"
                placeholder={placeholder}
                className={`w-full ${paddingClass} pr-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors shadow-sm placeholder-gray-400`}
                {...props}
            />
        </div>
    );
};

export default Input;
