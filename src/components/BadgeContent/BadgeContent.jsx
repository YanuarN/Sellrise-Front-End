const BadgeContent = ({
    label = 'CRM',
    icon = null,
    className = '',
    iconWrapperClassName = '',
}) => {
    const defaultIcon = (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M8.5 11C10.1569 11 11.5 9.65685 11.5 8C11.5 6.34315 10.1569 5 8.5 5C6.84315 5 5.5 6.34315 5.5 8C5.5 9.65685 6.84315 11 8.5 11Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5363C21.6184 15.8199 20.8541 15.2828 19.97 15"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M16 5.13013C16.8604 5.35043 17.623 5.85083 18.1676 6.56241C18.7122 7.27399 19.0084 8.156 19.0084 9.06013C19.0084 9.96425 18.7122 10.8463 18.1676 11.5578C17.623 12.2694 16.8604 12.7698 16 12.9901"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );

    return (
        <div
            className={`flex items-center gap-2 mb-6 p-3 rounded-xl text-white max-w-full bg-[linear-gradient(135deg,#6B8CFF_0%,#9C8EE7_45%,#D9A080_100%)] ${className}`}
        >
            <span
                className={`w-8 h-8 rounded-full bg-white/20 flex items-center justify-center ${iconWrapperClassName}`}
            >
                {icon || defaultIcon}
            </span>
            <span className="font-medium px-1">{label}</span>
        </div>
    );
};

export default BadgeContent;
