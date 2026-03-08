import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Briefcase,
    MessageSquare,
    Users,
    GitMerge,
    CreditCard,
    ChevronDown,
    ChevronRight,
    PieChart,
    MessageCircleQuestion,
    Bot,
    ScanLine,
    Wallet,
    LayoutDashboard,
    Settings
} from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [activeItem, setActiveItem] = useState('CRM');

    const menuItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        { name: 'Analytics', icon: PieChart, path: '/analytics' },
        { name: 'Chats', icon: MessageSquare, path: '/chats' },
        { name: 'CRM', icon: Users, path: '/crm' },
        { name: 'Scenarios', icon: Bot, path: '/scenarios' },
        { name: 'Integrations', icon: ScanLine, path: '/integrations' },
        { name: 'Plans & Billing', icon: Wallet, path: '/billing' },
    ];

    useEffect(() => {
        const currentPath = location.pathname;
        const currentItem = menuItems.find(item => item.path === currentPath);
        if (currentItem) {
            setActiveItem(currentItem.name);
        }
    }, [location.pathname]);

    const handleNavigation = (item) => {
        setActiveItem(item.name);
        if (item.path) {
            navigate(item.path);
        }
    };

    return (
        <div
            className={`${isOpen ? 'w-[260px]' : 'w-[88px]'} bg-[#121626] text-gray-400 h-screen flex flex-col py-6 px-4 transition-all duration-300 ease-in-out relative z-10 shrink-0 border-r border-[#1e2336]`}
        >
            {/* Project Selector */}
            <div className={`flex items-center gap-3 rounded-2xl bg-gradient-to-b from-[#252b41] to-[#1a1f33] mb-8 cursor-pointer hover:brightness-110 transition-all ${isOpen ? 'p-3 mx-1' : 'w-14 h-14 mx-auto justify-center'}`}>
                <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <Briefcase className="w-5 h-5 text-white" />
                </div>
                {isOpen && (
                    <>
                        <div className="flex-1 min-w-0 pr-2">
                            <h2 className="text-white font-medium text-sm truncate">Project name</h2>
                            <p className="text-xs text-gray-400 truncate mt-0.5">Trial</p>
                        </div>
                        <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />
                    </>
                )}
            </div>

            {/* Bot Selector */}
            <div className={`flex items-center gap-3 rounded-2xl border border-[#2a3045] mb-8 cursor-pointer hover:bg-[#1a1f33] transition-colors ${isOpen ? 'p-3 mx-1' : 'w-14 h-14 mx-auto justify-center'}`}>
                <div className="w-10 h-10 shrink-0 rounded-xl bg-[#1e2336] flex items-center justify-center border border-[#2a3045]">
                    <Bot className="w-5 h-5 text-gray-400" />
                </div>
                {isOpen && (
                    <>
                        <span className="flex-1 text-sm font-medium text-gray-300">Demo bot</span>
                        <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />
                    </>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-2 flex flex-col items-center w-full">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeItem === item.name;

                    if (!isOpen) {
                        return (
                            <button
                                key={item.name}
                                onClick={() => handleNavigation(item)}
                                title={item.name}
                                className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all ${isActive
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                    : 'text-gray-400 hover:bg-[#1a1f33] hover:text-gray-200'
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                            </button>
                        );
                    }

                    return (
                        <button
                            key={item.name}
                            onClick={() => handleNavigation(item)}
                            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-medium transition-all ${isActive
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                : 'text-gray-400 hover:bg-[#252b41] hover:text-gray-200'
                                }`}
                        >
                            <span className={`flex items-center justify-center ${isActive ? 'text-white' : 'text-gray-400'}`}>
                                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                            </span>
                            {item.name}
                        </button>
                    );
                })}
            </nav>

            {/* Support / Chat Icon at bottom for collapsed state */}
            {!isOpen && (
                <div className="mt-auto mb-6 flex flex-col items-center gap-2 w-full">
                    <button className="w-12 h-12 flex items-center justify-center rounded-2xl bg-[#1a1f33] border border-[#2a3045] text-gray-400 hover:text-white transition-colors group relative">
                        <MessageCircleQuestion className="w-5 h-5" />

                        {/* Tooltip or small text below */}
                        <div className="absolute -bottom-6 w-max opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-[10px] text-gray-500">Support</span>
                        </div>
                    </button>
                </div>
            )}

            {/* Upgrade Banner for expanded state */}
            {isOpen && (
                <div className="mt-auto mb-6 bg-gradient-to-br from-[#262c40] to-[#1e2336] p-5 rounded-3xl border border-gray-700/50 relative overflow-hidden mx-1 shadow-xl">
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl"></div>

                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center mb-4 text-white shadow-lg shadow-blue-500/30">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 8H20C21.1046 8 22 8.89543 22 10V18C22 19.1046 21.1046 20 20 20H4C2.89543 20 2 19.1046 2 18V10C2 8.89543 2.89543 8 4 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M8 8V6C8 4.89543 8.89543 4 10 4H14C15.1046 4 16 4.89543 16 6V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M12 12V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M10 14H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>

                    <h3 className="text-white font-semibold mb-1.5 text-[15px]">Upgrade to Pro</h3>
                    <p className="text-xs text-gray-400 mb-5 leading-relaxed">
                        Get access to all features on sellrise
                    </p>

                    <button className="w-full py-2.5 px-4 rounded-xl bg-transparent border border-gray-600/60 text-white text-sm font-medium flex items-center justify-between hover:bg-white/5 transition-colors group">
                        Get Pro
                        <span className="text-lg leading-none group-hover:translate-x-1 transition-transform">→</span>
                    </button>
                </div>
            )}

            {/* Toggle Sidebar Button */}
            <div className="flex justify-center w-full mt-2">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-8 h-8 rounded-full bg-[#1a1f33] border border-[#2a3045] flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                >
                    <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
            </div>

            {/* Darker section indicator at very bottom showing user/profile maybe */}
        </div>
    );
};

export default Sidebar;
