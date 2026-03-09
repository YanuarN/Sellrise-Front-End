import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Briefcase,
    MessageSquare,
    Users,
    ChevronDown,
    ChevronRight,
    PieChart,
    MessageCircleQuestion,
    Bot,
    LayoutDashboard,
    Inbox,
    KanbanSquare,
    BookOpen,
    Globe,
    Settings,
    LogOut,
    Code2,
    Zap
} from 'lucide-react';
import useAuthStore from '../../stores/authStore';

const Sidebar = ({ isOpen, setIsOpen }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [activeItem, setActiveItem] = useState('Dashboard');
    const user = useAuthStore((s) => s.user);
    const logout = useAuthStore((s) => s.logout);

    const menuItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        { name: 'Inbox', icon: Inbox, path: '/inbox' },
        { name: 'Pipeline', icon: KanbanSquare, path: '/pipeline' },
        { name: 'Leads', icon: Users, path: '/leads' },
        { name: 'Scenarios', icon: Bot, path: '/scenarios' },
        { name: 'Knowledge Base', icon: BookOpen, path: '/knowledge-base' },
        { name: 'Analytics', icon: PieChart, path: '/analytics' },
        { name: 'Domains', icon: Globe, path: '/domains' },
        { name: 'LLM Settings', icon: Zap, path: '/llm-settings' },
        { name: 'Widget Settings', icon: Code2, path: '/widget-settings' },
        { name: 'Settings', icon: Settings, path: '/settings' },
    ];

    useEffect(() => {
        const currentPath = location.pathname;
        const currentItem = menuItems.find(item => currentPath.startsWith(item.path));
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
            className={`${isOpen ? 'w-[260px]' : 'w-[88px]'} bg-[#121626] text-gray-400 h-screen flex flex-col py-6 px-4 transition-all duration-300 ease-in-out relative z-10 shrink-0 border-r border-[#1e2336] overflow-y-auto no-scrollbar`}
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

            {/* Support / Logout for collapsed state */}
            {!isOpen && (
                <div className="mt-auto mb-6 flex flex-col items-center gap-2 w-full">
                    <button
                        onClick={async () => { await logout(); navigate('/login'); }}
                        className="w-12 h-12 flex items-center justify-center rounded-2xl bg-[#1a1f33] border border-[#2a3045] text-gray-400 hover:text-red-400 transition-colors group relative"
                    >
                        <LogOut className="w-5 h-5" />
                        <div className="absolute -bottom-6 w-max opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-[10px] text-gray-500">Logout</span>
                        </div>
                    </button>
                </div>
            )}

            {/* User Info + Logout for expanded state */}
            {isOpen && (
                <div className="mt-auto mb-6 mx-1">
                    {/* User profile */}
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#1a1f33] border border-[#2a3045] mb-3">
                        <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
                            {(user?.full_name || 'U')[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 className="text-white font-medium text-sm truncate">{user?.full_name || 'User'}</h2>
                            <p className="text-xs text-gray-400 truncate mt-0.5 capitalize">{user?.role || 'viewer'}</p>
                        </div>
                    </div>

                    <button
                        onClick={async () => { await logout(); navigate('/login'); }}
                        className="w-full py-2.5 px-4 rounded-xl bg-transparent border border-[#2a3045] text-gray-400 text-sm font-medium flex items-center justify-center gap-2 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
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
