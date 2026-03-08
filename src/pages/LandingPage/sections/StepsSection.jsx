import { Check } from 'lucide-react';

const STEPS = [
    {
        number: '01',
        title: 'Connect your store\nor socials',
        description: 'Link your Instagram, WhatsApp, TikTok, or Shopify in seconds.',
        visual: (
            <div className="mt-auto flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center shadow-sm">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg" alt="IG" className="w-[22px] h-[22px]" />
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shadow-sm">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/b/be/Facebook_Messenger_logo_2020.svg" alt="Messenger" className="w-[22px] h-[22px]" />
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shadow-sm text-[#0066FF]">
                    <div className="flex gap-[3px]">
                        <div className="w-[3.5px] h-[3.5px] bg-current rounded-full"></div>
                        <div className="w-[3.5px] h-[3.5px] bg-current rounded-full"></div>
                        <div className="w-[3.5px] h-[3.5px] bg-current rounded-full"></div>
                    </div>
                </div>
            </div>
        ),
    },
    {
        number: '02',
        title: 'Train your AI in\nminutes',
        description: 'Link your Instagram, WhatsApp, TikTok, or Shopify in seconds.',
        visual: (
            <div className="mt-auto">
                <div className="w-full bg-[#F3F8FF] rounded-lg p-3 flex items-center gap-2 text-[#0066FF] text-[11px] font-semibold border border-blue-100">
                    <div className="w-[18px] h-[18px] bg-[#0066FF] rounded-full flex items-center justify-center text-white shrink-0">
                        <Check className="w-2.5 h-2.5" />
                    </div>
                    <span>The knowledge base has<br />been updated!</span>
                </div>
            </div>
        ),
    },
    {
        number: '03',
        title: 'Start selling in chat\nautomatically',
        description: 'Go live instantly. Your AI handles leads, replies, and books sales 24/7.',
        visual: (
            <div className="mt-auto bg-white rounded-t-[12px] border border-slate-100 shadow-sm p-4 w-full flex flex-col gap-2 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-white/90 to-transparent pointer-events-none z-10"></div>
                <div className="flex gap-2 items-end">
                    <img src="https://i.pravatar.cc/150?img=5" className="w-5 h-5 rounded-full" alt="user" />
                    <div className="bg-[#EEF2FF] rounded-[14px] rounded-bl-sm px-3 py-2 text-[10px] text-gray-700">
                        Hey, can I book a haircut this<br />week?
                    </div>
                </div>
                <div className="bg-[#0066FF] text-white rounded-[14px] rounded-br-sm px-3 py-1.5 text-[10px] self-end font-medium">
                    Hey! Sure!
                </div>
            </div>
        ),
    },
];

/**
 * StepsSection - "Launch in minutes" 3-step guide section.
 */
const StepsSection = () => {
    return (
        <section className="py-24 bg-white border-t border-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] text-[14px] font-semibold mb-8 text-gray-700">
                    <span>🥳</span> Just connect, train, and go live
                </div>
                <h2 className="text-[32px] md:text-[44px] font-bold tracking-tight text-[#1E293B] mb-16 max-w-[850px] mx-auto leading-tight">
                    Launch in minutes, sell on autopilot
                </h2>

                <div className="max-w-[1000px] mx-auto grid md:grid-cols-3 gap-6">
                    {STEPS.map(({ number, title, description, visual }) => (
                        <div key={number} className="bg-white rounded-[16px] p-8 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] text-left flex flex-col h-full group">
                            <div className="text-[#0066FF] font-bold text-[24px] mb-4">Step {number}</div>
                            <h4 className="text-[20px] font-bold text-gray-900 mb-2 leading-snug whitespace-pre-line">{title}</h4>
                            <p className="text-gray-500 text-[13.5px] mb-12 flex-grow">{description}</p>
                            {visual}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default StepsSection;
