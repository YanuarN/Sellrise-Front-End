/**
 * TestimonialsSection - Social proof & testimonials with CTA banner.
 */
const TestimonialsSection = () => {
    return (
        <section className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-gray-200 shadow-sm text-sm font-semibold mb-8">
                    <span>🤩</span> Trusted by teams around the world
                </div>
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-[#1E293B] mb-16">
                    What people say
                </h2>

                <div className="grid md:grid-cols-3 gap-6 mb-20 text-left">
                    {/* Col 1 */}
                    <div className="space-y-6 flex flex-col">
                        <div className="bg-white border border-gray-100 rounded-[16px] p-8 shadow-sm flex flex-col justify-between">
                            <p className="text-[#1E293B] font-medium text-[14px] mb-8 leading-relaxed">
                                "We doubled our conversion rate and slashed lead costs by 38%. Sellrise replies instantly — and that's exactly what real estate clients expect."
                            </p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                                    <img src="https://i.pravatar.cc/150?img=5" alt="Avatar" className="w-full h-full object-cover" />
                                </div>
                                <h5 className="text-[13px] font-bold text-gray-900">Real Estate Agency, Bali</h5>
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
                                <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                                    <img src="https://i.pravatar.cc/150?img=11" alt="Avatar" className="w-full h-full object-cover" />
                                </div>
                                <h5 className="text-[13px] font-bold text-gray-900">Clinic, Dubai</h5>
                            </div>
                        </div>
                        <div className="bg-white border border-gray-100 rounded-[16px] p-8 shadow-sm flex flex-col justify-between flex-grow">
                            <p className="text-[#1E293B] font-medium text-[14px] mb-8 leading-relaxed">
                                "Sellrise.ai replaced our inbound sales team"
                            </p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                                    <img src="https://i.pravatar.cc/150?img=9" alt="Avatar" className="w-full h-full object-cover" />
                                </div>
                                <h5 className="text-[13px] font-bold text-gray-900">Clinic, Dubai</h5>
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
                                <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                                    <img src="https://i.pravatar.cc/150?img=10" alt="Avatar" className="w-full h-full object-cover" />
                                </div>
                                <h5 className="text-[13px] font-bold text-gray-900">Real Estate Agency, Bali</h5>
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
    );
};

export default TestimonialsSection;
