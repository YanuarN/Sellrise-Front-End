import Picture9 from '../../../assets/Picture9.png';
import Picture10 from '../../../assets/Picture10.png';
import Picture11 from '../../../assets/Picture11.png';

/**
 * PerfectForSection - "Who's it for" section with 3 feature cards + integrations row.
 */
const PerfectForSection = () => {
    return (
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
                    <div className="bg-[#F8FAFC] rounded-[24px] p-8 border border-slate-100 flex flex-col items-center text-center hover:shadow-lg transition-shadow">
                        <div className="w-full flex-grow flex items-center justify-center mb-8">
                            <img src={Picture10} alt="Closes sales in real time" className="max-w-full h-auto drop-shadow-sm rounded-[12px]" />
                        </div>
                        <div className="w-full text-left">
                            <h4 className="text-[20px] font-bold text-gray-900 mb-2">Closes sales in real time</h4>
                            <p className="text-gray-500 text-[15px] leading-relaxed">Your AI agent chats, qualifies, and sells — instantly and 24/7.</p>
                        </div>
                    </div>

                    <div className="bg-[#F8FAFC] rounded-[24px] p-8 border border-slate-100 flex flex-col items-center text-center hover:shadow-lg transition-shadow">
                        <div className="w-full flex-grow flex items-center justify-center mb-8">
                            <img src={Picture9} alt="Learns your brand in minutes" className="max-w-full h-auto drop-shadow-sm rounded-[12px]" />
                        </div>
                        <div className="w-full text-left">
                            <h4 className="text-[20px] font-bold text-gray-900 mb-2">Learns your brand in minutes</h4>
                            <p className="text-gray-500 text-[15px] leading-relaxed">No setup needed. Just plug in your offers — it adapts fast.</p>
                        </div>
                    </div>

                    <div className="bg-[#F8FAFC] rounded-[24px] p-8 border border-slate-100 flex flex-col items-center text-center hover:shadow-lg transition-shadow">
                        <div className="w-full flex-grow flex items-center justify-center mb-8">
                            <img src={Picture11} alt="Replaces manual outreach" className="max-w-full h-auto drop-shadow-sm rounded-[12px]" />
                        </div>
                        <div className="w-full text-left">
                            <h4 className="text-[20px] font-bold text-gray-900 mb-2">Replaces manual outreach</h4>
                            <p className="text-gray-500 text-[15px] leading-relaxed">Follows up with every lead — consistently, without burnout.</p>
                        </div>
                    </div>
                </div>

                {/* Integrations Wide Card */}
                <div className="relative overflow-hidden bg-[#F8FAFC] rounded-[24px] p-8 md:px-12 border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8 max-w-[1000px] mx-auto text-left mb-16">
                    <div className="absolute top-0 right-0 bottom-0 w-1/4 bg-gradient-to-l from-[#E6F0FE] to-transparent pointer-events-none"></div>

                    <div className="md:w-1/3 relative z-10 shrink-0">
                        <h4 className="text-[20px] font-bold text-gray-900 mb-2">Works where your customers are</h4>
                        <p className="text-gray-500 text-[14px]">Connect to WhatsApp, Instagram, TikTok, and more — sell right in chat.</p>
                    </div>

                    <div className="md:w-2/3 flex flex-col items-center md:items-end gap-2.5 z-10 w-full relative">
                        {/* Row 1 */}
                        <div className="flex flex-wrap md:flex-nowrap justify-start md:justify-end gap-2.5 items-center w-full relative md:pr-6">
                            {[
                                { src: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg', label: 'WhatsApp' },
                                { src: 'https://upload.wikimedia.org/wikipedia/commons/8/87/Calendly_logo.svg', label: 'Calendly' },
                                { src: 'https://upload.wikimedia.org/wikipedia/commons/b/be/Facebook_Messenger_logo_2020.svg', label: 'FB Messenger' },
                                { src: 'https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg', label: 'Instagram' },
                            ].map(({ src, label }) => (
                                <div key={label} className="flex items-center gap-2 h-[38px] bg-white border border-slate-200/80 px-4 py-2 rounded-full shadow-sm text-[13.5px] font-semibold text-gray-700">
                                    <img src={src} className="w-[18px] h-[18px]" alt={label} /> {label}
                                </div>
                            ))}
                            <div className="hidden md:block absolute -right-14 w-16 h-[38px] rounded-full bg-gradient-to-r from-[#93BFF8] to-[#5a9cff] opacity-90 shadow-sm"></div>
                        </div>

                        {/* Row 2 */}
                        <div className="flex flex-wrap md:flex-nowrap justify-start md:justify-end gap-2.5 items-center w-full md:pr-6">
                            <div className="flex items-center gap-2 h-[38px] bg-[#60A5FA] border border-blue-400/50 px-5 py-2 rounded-full text-[13.5px] font-semibold text-white shadow-md shadow-blue-400/20">
                                And more!
                            </div>
                            {[
                                { src: 'https://cdn.worldvectorlogo.com/logos/shopify.svg', label: 'Shopify' },
                                { src: 'https://upload.wikimedia.org/wikipedia/en/a/a9/TikTok_logo.svg', label: 'TikTok' },
                                { src: 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg', label: 'Gmail' },
                                { src: 'https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg', label: 'Telegram' },
                            ].map(({ src, label }) => (
                                <div key={label} className="flex items-center gap-2 h-[38px] bg-white border border-slate-200/80 px-4 py-2 rounded-full shadow-sm text-[13.5px] font-semibold text-gray-700">
                                    <img src={src} className="w-[18px] h-[18px]" alt={label} /> {label}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <div className="flex justify-center">
                    <button className="px-10 py-3.5 rounded-full bg-[#0066FF] hover:bg-blue-700 text-white text-[16px] font-bold transition-colors shadow-lg shadow-blue-500/20">
                        Try for free
                    </button>
                </div>
            </div>
        </section>
    );
};

export default PerfectForSection;
