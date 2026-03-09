import { useState } from 'react';
import { Sidebar } from '../Sidebar';

const MainLayout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // start collapsed to match image or false? let's default to false since user just showed it? Wait, let's set it to false for now or true. Let's do false.

    return (
        <div className="flex h-screen bg-[#f3f4f6]">
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header container can go here if needed in the future */}

                <main className="flex-1 overflow-auto p-6 bg-white min-h-0 no-scrollbar">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
