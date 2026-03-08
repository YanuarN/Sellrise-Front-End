import React from 'react';
import { Menu, X, ChevronDown, PlayCircle } from 'lucide-react';
import Logo from '../../../assets/logo.png';

/**
 * LandingNavbar - Sticky top navigation bar for the landing page.
 */
const LandingNavbar = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

    return (
        <nav className="sticky top-0 z-50 bg-white border-b border-gray-100/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    {/* Logo */}
                    <div className="flex items-center gap-2 cursor-pointer">
                        <img src={Logo} alt="Sellrise logo" className="h-8 w-auto object-contain" />
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        <button className="flex items-center text-[15px] font-semibold text-gray-800 hover:text-blue-600 transition-colors">
                            Platform <ChevronDown className="ml-1 w-4 h-4 text-gray-400" />
                        </button>
                        <button className="flex items-center text-[15px] font-semibold text-gray-800 hover:text-blue-600 transition-colors">
                            Solution <ChevronDown className="ml-1 w-4 h-4 text-gray-400" />
                        </button>
                        <a href="#partners" className="text-[15px] font-semibold text-gray-800 hover:text-blue-600 transition-colors">Partners</a>
                        <a href="#contacts" className="text-[15px] font-semibold text-gray-800 hover:text-blue-600 transition-colors">Contacts</a>
                    </div>

                    <div className="hidden md:flex items-center space-x-4">
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-full text-[15px] font-semibold transition-colors flex items-center shadow-lg shadow-blue-600/20">
                            Try Demo now <PlayCircle className="ml-2 w-4 h-4 fill-white text-blue-600" />
                        </button>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="text-gray-600 hover:text-gray-900 focus:outline-none"
                        >
                            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-white border-b border-gray-100 px-4 py-4 space-y-3">
                    <a href="#platform" className="block text-base font-medium text-gray-700">Platform</a>
                    <a href="#solution" className="block text-base font-medium text-gray-700">Solution</a>
                    <a href="#partners" className="block text-base font-medium text-gray-700">Partners</a>
                    <a href="#contacts" className="block text-base font-medium text-gray-700">Contacts</a>
                    <div className="pt-4 border-t border-gray-100 flex flex-col space-y-3">
                        <button className="w-full bg-blue-600 text-white px-5 py-2.5 rounded-full text-sm font-medium flex items-center justify-center">
                            Try Demo now <PlayCircle className="ml-2 w-4 h-4 fill-white text-blue-600" />
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default LandingNavbar;
