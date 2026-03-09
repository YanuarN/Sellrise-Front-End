import { useState } from 'react';
import { Sidebar } from '../Sidebar';
import { Menu, X, Briefcase } from 'lucide-react';

const MainLayout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // start collapsed to match image or false? let's default to false since user just showed it? Wait, let's set it to false for now or true. Let's do false.

    return (
        <div className="flex flex-col md:flex-row h-screen bg-[#f3f4f6] overflow-hidden">
            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#121626] border-b border-[#1e2336] z-20">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                        <Briefcase className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-white font-bold text-sm">Sellrise</span>
                </div>
                <button 
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="p-2 text-gray-400 hover:text-white"
                >
                    {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                {/* Header container can go here if needed in the future */}

                <main className="flex-1 overflow-auto p-4 md:p-6 bg-white min-h-0 no-scrollbar">
                    {children}
                </main>
            </div>

            {/* Backdrop for mobile */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-10 md:hidden" 
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
        </div>
    );
};

export default MainLayout;
