const Badge = ({ children, className = '', color = 'gray' }) => {
    const colorMap = {
        gray: 'bg-[#e2e8f0] text-gray-700',
        blue: 'bg-blue-100 text-blue-800',
        green: 'bg-green-100 text-green-800',
        yellow: 'bg-yellow-100 text-yellow-800',
        red: 'bg-red-100 text-red-800',
    };

    const bgClass = colorMap[color] || colorMap.gray;

    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${bgClass} ${className}`}>
            {children}
        </span>
    );
};

export default Badge;
