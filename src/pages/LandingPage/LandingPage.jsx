import React from 'react';
import {
    Menu, X, Sparkles, Rocket, MessageCircle, BarChart,
    Star, Play, CheckCircle2, Bot, Users, Globe,
    Layers, Zap, MessageSquare, Briefcase, Smile,
    ArrowRight, Check, CheckCircle, ChevronDown, PlayCircle
} from 'lucide-react';
import Picture1 from '../../assets/Picture1.png';
import Picture2 from '../../assets/Picture2.png';
import Picture3 from '../../assets/Picture3.png';
import Picture4 from '../../assets/Picture4.png';
import Picture5 from '../../assets/Picture5.png';
import Picture6 from '../../assets/Picture6.png';
import Picture7 from '../../assets/Picture7.png';
import Picture8 from '../../assets/Picture8.png';
import Picture9 from '../../assets/Picture9.png';
import Picture10 from '../../assets/Picture10.png';
import Picture11 from '../../assets/Picture11.png';
import Picture12 from '../../assets/Picture12.png';
import Logo from '../../assets/logo.png';


export default function LandingPage() {
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
    const [activeTab, setActiveTab] = React.useState('CRM');

    const tabImages = {
        'Onboarding': Picture6,
        'Chats': Picture3,
        'Analytics': Picture7,
        'CRM': Picture4,
        'Integrations': Picture5,
    };

    return (
        <div className="min-h-screen font-sans bg-white text-gray-900 selection:bg-blue-100">
            {/* --- Navbar --- */}
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

            {/* --- Main Content --- */}
            <main>
                {/* 1. Hero Section */}
                <section className="relative pt-20 pb-16 md:pt-28 md:pb-24 overflow-hidden">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                        {/* Floating elements from design */}
                        {/* Picture 2 (Blue icon) on the left */}
                        <div className="absolute top-44 left-[10%] hidden md:block -z-10">
                            <img src={Picture2} alt="Blue floating graphic" className="w-[60px] h-[60px] object-contain drop-shadow-lg" />
                        </div>
                        {/* Picture 1 (Pink gradient) on the right */}
                        <div className="absolute top-2 right-[10%] hidden md:block -z-10">
                            <img src={Picture1} alt="Pink floating graphic" className="w-[60px] h-[60px] object-contain drop-shadow-[0_20px_50px_rgba(255,165,0,0.2)]" />
                        </div>

                        {/* Badge */}
                        <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-white border border-gray-200 shadow-sm text-gray-700 text-sm font-semibold mb-8">
                            <span>😎</span> AI for next-gen sales
                        </div>

                        <h1 className="text-[40px] md:text-6xl lg:text-[72px] font-extrabold tracking-tight text-[#1E293B] mb-6 leading-[1.1] max-w-[850px] mx-auto">
                            From lead to booking — <br className="hidden md:block" />
                            automate sales <span className="text-[#0066FF]">with AI agents</span>
                        </h1>

                        <p className="text-lg md:text-[20px] text-gray-500 font-medium= mb-10 max-w-2xl mx-auto">
                            AI that chats, qualifies, and books — across ads, forms & messengers
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-24">
                            <button className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#0066FF] hover:bg-blue-700 text-white text-[16px] font-bold transition-colors">
                                Try demo for free
                            </button>
                            <button className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#EEF2FF] hover:bg-blue-100 text-[#0066FF] text-[16px] font-bold transition-colors">
                                Book a quick call
                            </button>
                        </div>

                        {/* Dashboard App Image */}
                        <div className="relative mx-auto mt-12 w-full max-w-[1000px] px-4 md:px-0">
                            <div className="rounded-t-[8px] overflow-hidden drop-shadow-2xl">
                                <img src={Picture12} alt="Sellrise Dashboard App Interface" className="w-full h-auto object-cover" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2. "Perfect For" Section */}
                <section className="pt-24 pb-20 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-white border border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] text-gray-700 text-[14px] font-semibold mb-8">
                            <span>🤩</span> <span className="ml-2 text-gray-800">Who's it for</span>
                        </div>
                        <h2 className="text-[32px] md:text-[44px] font-bold tracking-tight text-[#1E293B] max-w-[850px] mx-auto leading-[1.2] mb-16">
                            Perfect for DTC brands, online<br className="hidden md:block" />
                            sellers, and service businesses that<br className="hidden md:block" />
                            want to close <span className="text-[#0066FF]">more sales in chat —<br className="hidden md:block" />
                                automatically</span>
                        </h2>

                        {/* 3 Cards */}
                        <div className="grid md:grid-cols-3 gap-6 mb-8 text-left max-w-[1000px] mx-auto">
                            {/* Card 1 */}
                            <div className="bg-[#F8FAFC] rounded-[24px] p-8 border border-slate-100 flex flex-col items-center text-center hover:shadow-lg transition-shadow">
                                <div className="w-full flex-grow flex items-center justify-center mb-8">
                                    <img src={Picture10} alt="Closes sales in real time" className="max-w-full h-auto drop-shadow-sm rounded-[12px]" />
                                </div>
                                <div className="w-full text-left">
                                    <h4 className="text-[20px] font-bold text-gray-900 mb-2">Closes sales in real time</h4>
                                    <p className="text-gray-500 text-[15px] leading-relaxed">
                                        Your AI agent chats, qualifies, and sells — instantly and 24/7.
                                    </p>
                                </div>
                            </div>

                            {/* Card 2 */}
                            <div className="bg-[#F8FAFC] rounded-[24px] p-8 border border-slate-100 flex flex-col items-center text-center hover:shadow-lg transition-shadow">
                                <div className="w-full flex-grow flex items-center justify-center mb-8">
                                    <img src={Picture9} alt="Learns your brand in minutes" className="max-w-full h-auto drop-shadow-sm rounded-[12px]" />
                                </div>
                                <div className="w-full text-left">
                                    <h4 className="text-[20px] font-bold text-gray-900 mb-2">Learns your brand in minutes</h4>
                                    <p className="text-gray-500 text-[15px] leading-relaxed">
                                        No setup needed. Just plug in your offers — it adapts fast.
                                    </p>
                                </div>
                            </div>

                            {/* Card 3 */}
                            <div className="bg-[#F8FAFC] rounded-[24px] p-8 border border-slate-100 flex flex-col items-center text-center hover:shadow-lg transition-shadow">
                                <div className="w-full flex-grow flex items-center justify-center mb-8">
                                    <img src={Picture11} alt="Replaces manual outreach" className="max-w-full h-auto drop-shadow-sm rounded-[12px]" />
                                </div>
                                <div className="w-full text-left">
                                    <h4 className="text-[20px] font-bold text-gray-900 mb-2">Replaces manual outreach</h4>
                                    <p className="text-gray-500 text-[15px] leading-relaxed">
                                        Follows up with every lead — consistently, without burnout.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Integrations Wide Card */}
                        <div className="relative overflow-hidden bg-[#F8FAFC] rounded-[24px] p-8 md:px-12 border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8 max-w-[1000px] mx-auto text-left mb-16">
                            {/* Decorative gradient blob on the right edge */}
                            <div className="absolute top-0 right-0 bottom-0 w-1/4 bg-gradient-to-l from-[#E6F0FE] to-transparent pointer-events-none"></div>

                            <div className="md:w-1/3 relative z-10 shrink-0">
                                <h4 className="text-[20px] font-bold text-gray-900 mb-2">Works where your customers are</h4>
                                <p className="text-gray-500 text-[14px]">
                                    Connect to WhatsApp, Instagram, TikTok, and more — sell right in chat.
                                </p>
                            </div>

                            <div className="md:w-2/3 flex flex-col items-center md:items-end gap-2.5 z-10 w-full relative">
                                {/* Row 1 */}
                                <div className="flex flex-wrap md:flex-nowrap justify-start md:justify-end gap-2.5 items-center w-full relative md:pr-6">
                                    <div className="flex items-center gap-2 h-[38px] bg-white border border-slate-200/80 px-4 py-2 rounded-full shadow-sm text-[13.5px] font-semibold text-gray-700">
                                        <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" className="w-[18px] h-[18px]" alt="WhatsApp" /> WhatsApp
                                    </div>
                                    <div className="flex items-center gap-2 h-[38px] bg-white border border-slate-200/80 px-4 py-2 rounded-full shadow-sm text-[13.5px] font-semibold text-gray-700">
                                        <img src="https://upload.wikimedia.org/wikipedia/commons/8/87/Calendly_logo.svg" className="h-[18px] object-contain" style={{ width: '18px', objectPosition: 'left hidden' }} alt="Calendly" /> Calendly
                                    </div>
                                    <div className="flex items-center gap-2 h-[38px] bg-white border border-slate-200/80 px-4 py-2 rounded-full shadow-sm text-[13.5px] font-semibold text-gray-700">
                                        <img src="https://upload.wikimedia.org/wikipedia/commons/b/be/Facebook_Messenger_logo_2020.svg" className="w-[18px] h-[18px]" alt="FB Messenger" /> FB Messenger
                                    </div>
                                    <div className="flex items-center gap-2 h-[38px] bg-white border border-slate-200/80 px-4 py-2 rounded-full shadow-sm text-[13.5px] font-semibold text-gray-700">
                                        <img src="https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg" className="w-[18px] h-[18px]" alt="Instagram" /> Instagram
                                    </div>
                                    {/* The cut-off decorative pill */}
                                    <div className="hidden md:block absolute -right-14 w-16 h-[38px] rounded-full bg-gradient-to-r from-[#93BFF8] to-[#5a9cff] opacity-90 shadow-sm"></div>
                                </div>

                                {/* Row 2 */}
                                <div className="flex flex-wrap md:flex-nowrap justify-start md:justify-end gap-2.5 items-center w-full md:pr-6">
                                    <div className="flex items-center gap-2 h-[38px] bg-[#60A5FA] border border-blue-400/50 px-5 py-2 rounded-full text-[13.5px] font-semibold text-white shadow-md shadow-blue-400/20">
                                        And more!
                                    </div>
                                    <div className="flex items-center gap-2 h-[38px] bg-white border border-slate-200/80 px-4 py-2 rounded-full shadow-sm text-[13.5px] font-semibold text-gray-700">
                                        <img src="https://cdn.worldvectorlogo.com/logos/shopify.svg" className="w-[18px] h-[18px]" alt="Shopify" /> Shopify
                                    </div>
                                    <div className="flex items-center gap-2 h-[38px] bg-white border border-slate-200/80 px-4 py-2 rounded-full shadow-sm text-[13.5px] font-semibold text-gray-700">
                                        <img src="https://upload.wikimedia.org/wikipedia/en/a/a9/TikTok_logo.svg" className="w-[18px] h-[18px]" alt="TikTok" /> TikTok
                                    </div>
                                    <div className="flex items-center gap-2 h-[38px] bg-white border border-slate-200/80 px-4 py-2 rounded-full shadow-sm text-[13.5px] font-semibold text-gray-700">
                                        <img src="https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg" className="w-[18px] h-[18px]" alt="Gmail" /> Gmail
                                    </div>
                                    <div className="flex items-center gap-2 h-[38px] bg-white border border-slate-200/80 px-4 py-2 rounded-full shadow-sm text-[13.5px] font-semibold text-gray-700">
                                        <img src="https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg" className="w-[18px] h-[18px]" alt="Telegram" /> Telegram
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Try For Free Button */}
                        <div className="flex justify-center">
                            <button className="px-10 py-3.5 rounded-full bg-[#0066FF] hover:bg-blue-700 text-white text-[16px] font-bold transition-colors shadow-lg shadow-blue-500/20">
                                Try for free
                            </button>
                        </div>
                    </div>
                </section>

                {/* 3. Dark Section (Omnichannel & Dashboard) */}
                <section className="py-24 bg-[radial-gradient(120%_120%_at_0%_0%,#0B1A4E_0%,#071239_35%,#040B26_70%,#020818_100%)] text-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">

                        {/* 3A. Split View Feature - Omnichannel */}
                        <div className="rounded-[2.5rem] border border-dashed border-blue-500/30 p-8 md:p-16 relative">
                            <div className="grid md:grid-cols-2 gap-16 items-center">
                                {/* Left Graphic */}
                                <div className="relative aspect-square rounded-3xl flex items-center justify-center p-0 overflow-hidden drop-shadow-2xl">
                                    <img src={Picture8} alt="Omnichannel visual" className="w-full h-full object-cover rounded-3xl" />
                                </div>

                                {/* Right Content */}
                                <div>
                                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#050D2E] border border-slate-800 text-sm font-medium mb-8 text-white">
                                        <span>🤩</span> Omnichannel sales
                                    </div>
                                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 leading-[1.15]">
                                        Sell where your<br />customers chat
                                    </h2>
                                    <p className="text-slate-400 text-[17px] mb-12">
                                        Engage leads across WhatsApp, Instagram, TikTok, and more — from one smart AI agent that never misses a message.
                                    </p>

                                    <div className="space-y-8">
                                        <div className="flex gap-5">
                                            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                                                <Sparkles className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <h4 className="text-xl font-bold mb-2">Automated conversations</h4>
                                                <p className="text-slate-400 text-[15px] leading-relaxed">Start, nurture, and close sales in chat — automatically, with brand-personalized flow.</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-5">
                                            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                                                <MessageSquare className="w-6 h-6 text-white fill-white" />
                                            </div>
                                            <div>
                                                <h4 className="text-xl font-bold mb-2">Instant replies</h4>
                                                <p className="text-slate-400 text-[15px] leading-relaxed">Respond to every message in seconds, even during off-hours or at scale.</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-5">
                                            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                                                <Layers className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <h4 className="text-xl font-bold mb-2">Cross-platform sync</h4>
                                                <p className="text-slate-400 text-[15px] leading-relaxed">Your AI agent works seamlessly across channels — no switching, no silos.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 3B. Control Center Feature */}
                        <div className="pt-16 pb-8">
                            <div className="flex flex-col items-start text-left mb-10 max-w-[1000px] mx-auto relative px-4 md:px-0">
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#050D2E] border border-slate-800/80 text-[13px] font-medium mb-6 text-slate-300">
                                    <span>😎</span> Train, track, and manage your AI sales agent
                                </div>
                                <h2 className="text-4xl md:text-[44px] font-bold tracking-tight mb-14 text-white">
                                    All-in-one control center
                                </h2>

                                {/* Tabs */}
                                <div className="flex flex-wrap items-center justify-between w-full relative pb-4 md:pb-0 md:px-6">
                                    {Object.keys(tabImages).map((tabName) => (
                                        <div
                                            key={tabName}
                                            onClick={() => setActiveTab(tabName)}
                                            className={`flex items-center gap-2 cursor-pointer transition-colors whitespace-nowrap relative text-[15px] ${activeTab === tabName ? 'text-white font-bold' : 'text-slate-400 font-medium hover:text-slate-200'
                                                }`}
                                        >
                                            <div className={`w-1.5 h-1.5 rounded-full ${activeTab === tabName ? 'bg-white' : 'bg-slate-500'}`}></div> {tabName}
                                            {activeTab === tabName && (
                                                <div className="absolute -bottom-4 left-0 w-full h-[3px] bg-white rounded-t-full hidden md:block"></div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Dashboard Mockup Dynamic Image */}
                            <div className="relative mx-auto w-full max-w-[1000px] transition-all duration-300 px-4 md:px-0">
                                <div className="rounded-[20px] overflow-hidden drop-shadow-2xl">
                                    <img
                                        src={tabImages[activeTab]}
                                        alt={`${activeTab} App Image`}
                                        className="w-full h-auto object-cover animate-[fadeIn_0.5s_ease-out]"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 4. Testimonials Section */}
                <section className="py-24 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-gray-200 shadow-sm text-sm font-semibold mb-8">
                            <span>🤩</span> Trusted by teams around the world
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-[#1E293B] mb-16">
                            What people say
                        </h2>

                        {/* Testimonials Masonry / Grid */}
                        <div className="grid md:grid-cols-3 gap-6 mb-20 text-left">
                            {/* Col 1 */}
                            <div className="space-y-6 flex flex-col">
                                <div className="bg-white border border-gray-100 rounded-[16px] p-8 shadow-sm flex flex-col justify-between">
                                    <p className="text-[#1E293B] font-medium text-[14px] mb-8 leading-relaxed">
                                        "We doubled our conversion rate and slashed lead costs by 38%. Sellrise replies instantly — and that's exactly what real estate clients expect."
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full overflow-hidden shrink-0"><img src="https://i.pravatar.cc/150?img=5" alt="Avatar" className="w-full h-full object-cover" /></div>
                                        <div>
                                            <h5 className="text-[13px] font-bold text-gray-900">Real Estate Agency, Bali</h5>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-[#0066FF] rounded-[16px] p-8 flex flex-col justify-center text-white flex-grow min-h-[240px] shadow-lg shadow-blue-500/20">
                                    <h3 className="text-[40px] md:text-[46px] font-bold mb-2 tracking-tight">+$7,000</h3>
                                    <p className="text-white/90 font-medium text-[18px] leading-tight">average revenue<br />per<br />month</p>
                                </div>
                            </div>

                            {/* Col 2 */}
                            <div className="space-y-6 flex flex-col">
                                <div className="bg-white border border-gray-100 rounded-[16px] p-8 shadow-sm flex flex-col justify-between">
                                    <p className="text-[#1E293B] font-medium text-[14px] mb-8 leading-relaxed">
                                        "We used to wait hours to respond. Now it's instant"
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full overflow-hidden shrink-0"><img src="https://i.pravatar.cc/150?img=11" alt="Avatar" className="w-full h-full object-cover" /></div>
                                        <div>
                                            <h5 className="text-[13px] font-bold text-gray-900">Clinic, Dubai</h5>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white border border-gray-100 rounded-[16px] p-8 shadow-sm flex flex-col justify-between flex-grow">
                                    <p className="text-[#1E293B] font-medium text-[14px] mb-8 leading-relaxed">
                                        "Sellrise.ai replaced our inbound sales team"
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full overflow-hidden shrink-0"><img src="https://i.pravatar.cc/150?img=9" alt="Avatar" className="w-full h-full object-cover" /></div>
                                        <div>
                                            <h5 className="text-[13px] font-bold text-gray-900">Clinic, Dubai</h5>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Col 3 */}
                            <div className="space-y-6 flex flex-col">
                                <div className="bg-[#0066FF] rounded-[16px] p-8 flex flex-col justify-center text-white shadow-lg shadow-blue-500/20 min-h-[220px]">
                                    <h3 className="text-[60px] md:text-[72px] font-bold mb-1 tracking-tight leading-none">x2</h3>
                                    <p className="text-white/90 font-medium text-[18px] leading-tight mt-1">average<br />conversion<br />rate</p>
                                </div>
                                <div className="bg-white border border-gray-100 rounded-[16px] p-8 shadow-sm flex flex-col justify-between flex-grow">
                                    <p className="text-[#1E293B] font-medium text-[14px] mb-8 leading-relaxed">
                                        "Thanks to Sellrise, our conversion rate went from 3% to 6%, and our sales volume grew without upping our ad spend."
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full overflow-hidden shrink-0"><img src="https://i.pravatar.cc/150?img=10" alt="Avatar" className="w-full h-full object-cover" /></div>
                                        <div>
                                            <h5 className="text-[13px] font-bold text-gray-900">Real Estate Agency, Bali</h5>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* CTA Banner */}
                        <div className="max-w-[1000px] mx-auto bg-gradient-to-br from-[#60A5FA] via-[#A78BFA] to-[#FDBA74] rounded-[16px] py-14 px-8 text-center text-white relative overflow-hidden shadow-sm">
                            <div className="relative z-10 flex flex-col items-center">
                                <h3 className="text-2xl md:text-[32px] font-bold mb-8 tracking-tight">Ready to see what Sellrise can do for you?</h3>
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                    <button className="w-full sm:w-auto px-8 py-3 rounded-full bg-white text-[#8B5CF6] text-[14px] font-semibold hover:shadow-lg transition-all">
                                        Try demo
                                    </button>
                                    <button className="w-full sm:w-auto px-8 py-3 rounded-full bg-white/20 border border-white/40 text-white text-[14px] font-semibold backdrop-blur-sm transition-colors hover:bg-white/30">
                                        Talk to an expert
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 5. Steps Section */}
                <section className="py-24 bg-white border-t border-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] text-[14px] font-semibold mb-8 text-gray-700">
                            <span>🥳</span> Just connect, train, and go live
                        </div>
                        <h2 className="text-[32px] md:text-[44px] font-bold tracking-tight text-[#1E293B] mb-16 max-w-[850px] mx-auto leading-tight">
                            Launch in minutes, sell on autopilot
                        </h2>

                        <div className="max-w-[1000px] mx-auto grid md:grid-cols-3 gap-6">
                            {/* Step 1 */}
                            <div className="bg-white rounded-[16px] p-8 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] text-left flex flex-col h-full relative group">
                                <div className="text-[#0066FF] font-bold text-[24px] mb-4">Step 01</div>
                                <h4 className="text-[20px] font-bold text-gray-900 mb-2 leading-snug">Connect your store<br />or socials</h4>
                                <p className="text-gray-500 text-[13.5px] mb-12 flex-grow">Link your Instagram, WhatsApp, TikTok, or Shopify in seconds.</p>

                                {/* Visual placeholder */}
                                <div className="mt-auto flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center shadow-sm"><img src="https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg" alt="IG" className="w-[22px] h-[22px]" /></div>
                                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shadow-sm text-[#0066FF]"><img src="https://upload.wikimedia.org/wikipedia/commons/b/be/Facebook_Messenger_logo_2020.svg" alt="Messenger" className="w-[22px] h-[22px]" /></div>
                                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shadow-sm text-[#0066FF]">
                                        <div className="flex gap-[3px]">
                                            <div className="w-[3.5px] h-[3.5px] bg-current rounded-full"></div>
                                            <div className="w-[3.5px] h-[3.5px] bg-current rounded-full"></div>
                                            <div className="w-[3.5px] h-[3.5px] bg-current rounded-full"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Step 2 */}
                            <div className="bg-white rounded-[16px] p-8 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] text-left flex flex-col h-full relative group">
                                <div className="text-[#0066FF] font-bold text-[24px] mb-4">Step 02</div>
                                <h4 className="text-[20px] font-bold text-gray-900 mb-2 leading-snug">Train your AI in<br />minutes</h4>
                                <p className="text-gray-500 text-[13.5px] mb-12 flex-grow">Link your Instagram, WhatsApp, TikTok, or Shopify in seconds.</p>

                                {/* Visual placeholder */}
                                <div className="mt-auto">
                                    <div className="w-full bg-[#F3F8FF] rounded-lg p-3 flex items-center gap-2 text-[#0066FF] text-[11px] font-semibold border border-blue-100">
                                        <div className="w-[18px] h-[18px] bg-[#0066FF] rounded-full flex items-center justify-center text-white shrink-0"><Check className="w-2.5 h-2.5" /></div>
                                        <span>The knowledge base has<br />been updated!</span>
                                    </div>
                                </div>
                            </div>

                            {/* Step 3 */}
                            <div className="bg-white rounded-[16px] p-8 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] text-left flex flex-col h-full relative group">
                                <div className="text-[#0066FF] font-bold text-[24px] mb-4">Step 03</div>
                                <h4 className="text-[20px] font-bold text-gray-900 mb-2 leading-snug">Start selling in chat<br />automatically</h4>
                                <p className="text-gray-500 text-[13.5px] mb-8 flex-grow">Go live instantly. Your AI handles leads, replies, and books sales 24/7.</p>

                                {/* Visual placeholder */}
                                <div className="mt-auto bg-white rounded-t-[12px] border border-slate-100 shadow-sm p-4 w-full flex flex-col gap-2 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-t from-white/90 to-transparent pointer-events-none z-10"></div>
                                    <div className="flex gap-2 items-end">
                                        <img src="https://i.pravatar.cc/150?img=5" className="w-5 h-5 rounded-full" />
                                        <div className="bg-[#EEF2FF] rounded-[14px] rounded-bl-sm px-3 py-2 text-[10px] text-gray-700">
                                            Hey, can I book a haircut this<br />week?
                                        </div>
                                    </div>
                                    <div className="bg-[#0066FF] text-white rounded-[14px] rounded-br-sm px-3 py-1.5 text-[10px] self-end font-medium">
                                        Hey! Sure!
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

            </main>

            {/* --- Footer --- */}
            <footer className="bg-[#030712] pt-24 pb-12 text-slate-300 border-t-4 border-blue-600">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    <div className="text-center max-w-3xl mx-auto mb-24">
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-12 leading-[1.15]">
                            Let AI sell for you — <br className="hidden md:block" />
                            even while you sleep
                        </h2>

                        {/* Form */}
                        <form className="max-w-xl mx-auto space-y-4" onSubmit={(e) => e.preventDefault()}>
                            <div className="text-left space-y-1.5">
                                <label className="text-[13px] font-bold text-white ml-2">Full Name</label>
                                <input type="text" placeholder="Your full name" className="w-full bg-white rounded-lg px-4 py-3.5 text-gray-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-[15px]" />
                            </div>
                            <div className="text-left space-y-1.5">
                                <label className="text-[13px] font-bold text-white ml-2">WhatsApp Number</label>
                                <div className="flex bg-white rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
                                    <div className="flex items-center px-4 bg-white border-r border-gray-200">
                                        {/* USA Flag Placeholder */}
                                        <span className="text-lg mr-1">🇺🇸</span>
                                        <ChevronDown className="w-4 h-4 text-gray-400" />
                                    </div>
                                    <input type="tel" placeholder="+1 555 123 4567" className="flex-1 px-4 py-3.5 text-gray-900 placeholder-slate-400 focus:outline-none text-[15px]" />
                                </div>
                            </div>
                            <button type="submit" className="w-full mt-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-3.5 rounded-lg font-bold transition-colors shadow-lg shadow-blue-600/20 text-[15px]">
                                Submit
                            </button>
                        </form>
                    </div>

                    <div className="border-t border-slate-800/60 pt-12 pb-16 flex flex-col md:flex-row justify-between items-start gap-12 md:gap-8">
                        {/* Logo & Contact */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-1">
                                <span className="font-extrabold text-2xl tracking-tighter text-white">se</span>
                                <div className="w-5 h-5 bg-blue-600 rounded-md transform rotate-12 flex items-center justify-center mt-1">
                                    <div className="flex space-x-0.5 transform -rotate-12">
                                        <div className="w-1 h-3 bg-white rounded-full"></div>
                                        <div className="w-1 h-3 bg-white rounded-full"></div>
                                    </div>
                                </div>
                                <span className="font-extrabold text-2xl tracking-tighter text-white">rise.ai</span>
                            </div>
                            <p className="text-[15px] font-medium text-slate-300">hello@sellrise.ai</p>

                            {/* Social Icons Placeholder */}
                            <div className="flex items-center gap-3 pt-4">
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition cursor-pointer text-white"><span className="text-sm font-bold">♪</span></div>
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition cursor-pointer text-white"><MessageCircle className="w-5 h-5" /></div>
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition cursor-pointer text-white"><div className="w-5 h-5 border-[2px] border-white rounded-[6px] relative"><div className="absolute inset-1 border-[2px] border-white rounded-full"></div></div></div>
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition cursor-pointer text-white"><span className="text-sm font-bold">in</span></div>
                            </div>
                        </div>

                        {/* Links Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12 text-sm font-medium">
                            <div>
                                <h4 className="text-white font-bold mb-6 text-[15px]">Platform</h4>
                                <ul className="space-y-4">
                                    <li><a href="#" className="text-slate-400 hover:text-white transition-colors">WhatsApp</a></li>
                                    <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Instagram</a></li>
                                    <li><a href="#" className="text-slate-400 hover:text-white transition-colors">TikTok</a></li>
                                    <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Telegram</a></li>
                                    <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Facebook Messenger</a></li>
                                    <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Website Chat</a></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-white font-bold mb-6 text-[15px]">Solutions</h4>
                                <ul className="space-y-4">
                                    <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Custom solution</a></li>
                                    <li><a href="#" className="text-slate-400 hover:text-white transition-colors">eCommerce Brands</a></li>
                                    <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Beauty & Wellness</a></li>
                                    <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Digital Products</a></li>
                                    <li><a href="#" className="text-slate-400 hover:text-white transition-colors">TikTok Shop Sellers</a></li>
                                    <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Enterprise Solutions</a></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-white font-bold mb-6 text-[15px]">Company</h4>
                                <ul className="space-y-4">
                                    <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Terms of Service</a></li>
                                    <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Privacy Policy</a></li>
                                    <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Cookie Policy</a></li>
                                    <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Contacts</a></li>
                                    <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Partners</a></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-white font-bold mb-6 text-[15px]">Resources</h4>
                                <ul className="space-y-4">
                                    <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Help Center</a></li>
                                    <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Blog</a></li>
                                    <li><a href="#" className="text-slate-400 hover:text-white transition-colors">FAQ</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="text-center text-[13px] text-slate-500 pb-4">
                        Sellrise Limited, Registered in Hong Kong | Company Registration Number: 78104416
                    </div>
                </div>
            </footer>
        </div>
    );
}
