import React from 'react';
import { Sparkles, MessageSquare, Layers } from 'lucide-react';
import Picture3 from '../../../assets/Picture3.png';
import Picture4 from '../../../assets/Picture4.png';
import Picture5 from '../../../assets/Picture5.png';
import Picture6 from '../../../assets/Picture6.png';
import Picture7 from '../../../assets/Picture7.png';
import Picture8 from '../../../assets/Picture8.png';

const TAB_IMAGES = {
    Onboarding: Picture6,
    Chats: Picture3,
    Analytics: Picture7,
    CRM: Picture4,
    Integrations: Picture5,
};

/**
 * FeatureSection - Dark section with Omnichannel split-view and Control Center tabs.
 */
const FeatureSection = () => {
    const [activeTab, setActiveTab] = React.useState('CRM');

    return (
        <section className="py-24 bg-[radial-gradient(120%_120%_at_0%_0%,#0B1A4E_0%,#071239_35%,#040B26_70%,#020818_100%)] text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">

                {/* 3A. Omnichannel Split */}
                <div className="rounded-[2.5rem] border border-dashed border-blue-500/30 p-8 md:p-16 relative">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        {/* Left Graphic */}
                        <div className="relative aspect-square rounded-3xl flex items-center justify-center overflow-hidden drop-shadow-2xl">
                            <img src={Picture8} alt="Omnichannel visual" className="w-full h-full object-cover rounded-3xl" />
                        </div>

                        {/* Right Content */}
                        <div>
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#050D2E] border border-slate-800 text-sm font-medium mb-8 text-white">
                                <span>🤩</span> Conversational sales system
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 leading-[1.15]">
                                A complete conversational<br />sales system
                            </h2>
                            <p className="text-slate-400 text-[17px] mb-12">
                                Built to automate sales conversations across channels while keeping interactions structured and measurable.
                            </p>

                            <div className="space-y-8">
                                {[
                                    {
                                        icon: Sparkles,
                                        title: 'Instant answers to product questions',
                                        body: 'Respond immediately to shopper questions with consistent, accurate product guidance.',
                                    },
                                    {
                                        icon: MessageSquare,
                                        title: 'Lead qualification through conversation',
                                        body: 'Ask the right follow-up questions and collect structured lead information automatically.',
                                    },
                                    {
                                        icon: Layers,
                                        title: 'Automated product recommendations',
                                        body: 'Suggest relevant products based on customer intent and context in real time.',
                                    },
                                    {
                                        icon: Sparkles,
                                        title: 'Customer support automation',
                                        body: 'Resolve common support requests quickly and route edge cases to your team.',
                                    },
                                    {
                                        icon: MessageSquare,
                                        title: 'Meeting booking and lead routing',
                                        body: 'Book demos or consultations and send leads to the right owner automatically.',
                                    },
                                    {
                                        icon: Layers,
                                        title: 'Conversation analytics and insights',
                                        body: 'Track performance by stage, identify drop-offs, and optimize conversion paths.',
                                    },
                                ].map(({ icon: Icon, title, body }) => (
                                    <div key={title} className="flex gap-5">
                                        <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                                            <Icon className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-bold mb-2">{title}</h4>
                                            <p className="text-slate-400 text-[15px] leading-relaxed">{body}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3B. Control Center */}
                <div className="pt-16 pb-8">
                    <div className="flex flex-col items-start text-left mb-10 max-w-[1000px] mx-auto relative px-4 md:px-0">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#050D2E] border border-slate-800/80 text-[13px] font-medium mb-6 text-slate-300">
                            <span>😎</span> Structured platform architecture
                        </div>
                        <h2 className="text-4xl md:text-[44px] font-bold tracking-tight mb-14 text-white">
                            Powered by a structured AI conversation platform
                        </h2>
                        <p className="text-slate-300 text-[16px] mb-4 max-w-[920px]">
                            Sellrise runs on a conversation engine designed to automate sales and customer communication.
                        </p>
                        <p className="text-slate-300 text-[16px] mb-4 max-w-[920px]">
                            The system organizes conversations into stages and tasks so every interaction follows a structured path.
                        </p>
                        <p className="text-slate-100 text-[17px] font-semibold mb-8">Architecture: Stage -&gt; Task -&gt; Action</p>
                        <p className="text-slate-300 text-[16px] mb-10 max-w-[920px]">
                            This makes automation reliable and easy to control.
                        </p>

                        {/* Tabs */}
                        <div className="flex flex-wrap items-center justify-between w-full relative pb-4 md:pb-0 md:px-6">
                            {Object.keys(TAB_IMAGES).map((tabName) => (
                                <div
                                    key={tabName}
                                    onClick={() => setActiveTab(tabName)}
                                    className={`flex items-center gap-2 cursor-pointer transition-colors whitespace-nowrap relative text-[15px] ${activeTab === tabName ? 'text-white font-bold' : 'text-slate-400 font-medium hover:text-slate-200'}`}
                                >
                                    <div className={`w-1.5 h-1.5 rounded-full ${activeTab === tabName ? 'bg-white' : 'bg-slate-500'}`}></div>
                                    {tabName}
                                    {activeTab === tabName && (
                                        <div className="absolute -bottom-4 left-0 w-full h-[3px] bg-white rounded-t-full hidden md:block"></div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Dynamic Tab Image */}
                    <div className="relative mx-auto w-full max-w-[1000px] transition-all duration-300 px-4 md:px-0">
                        <div className="rounded-[20px] overflow-hidden drop-shadow-2xl">
                            <img
                                src={TAB_IMAGES[activeTab]}
                                alt={`${activeTab} App Image`}
                                className="w-full h-auto object-cover animate-[fadeIn_0.5s_ease-out]"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FeatureSection;
