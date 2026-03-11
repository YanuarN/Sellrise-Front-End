import { useNavigate } from 'react-router-dom';

/**
 * TestimonialsSection - Social proof & testimonials with CTA banner.
 */
const TestimonialsSection = () => {
    const navigate = useNavigate();

    return (
        <section className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-gray-200 shadow-sm text-sm font-semibold mb-8">
                    <span>🤩</span> Trusted by growing digital businesses
                </div>
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-[#1E293B] mb-16">
                    Trusted by growing digital businesses
                </h2>

                <div className="grid md:grid-cols-3 gap-6 mb-20 text-left">
                    {/* Col 1 */}
                    <div className="space-y-6 flex flex-col">
                        <div className="bg-white border border-gray-100 rounded-[16px] p-8 shadow-sm flex flex-col justify-between">
                            <p className="text-[#1E293B] font-medium text-[14px] mb-8 leading-relaxed">
                                "Sellrise helped us automate our inbound conversations across messaging channels and respond instantly to customer questions."
                            </p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                                    <img src="https://i.pravatar.cc/150?img=5" alt="Avatar" className="w-full h-full object-cover" />
                                </div>
                                <h5 className="text-[13px] font-bold text-gray-900">eCommerce Team</h5>
                            </div>
                        </div>
                        <div className="bg-[#0066FF] rounded-[16px] p-8 flex flex-col justify-center text-white flex-grow min-h-[240px] shadow-lg shadow-blue-500/20">
                            <h3 className="text-[40px] md:text-[46px] font-bold mb-2 tracking-tight">Reliable</h3>
                            <p className="text-white/90 font-medium text-[18px] leading-tight">multi channel<br />conversation<br />coverage</p>
                        </div>
                    </div>

                    {/* Col 2 */}
                    <div className="space-y-6 flex flex-col">
                        <div className="bg-white border border-gray-100 rounded-[16px] p-8 shadow-sm flex flex-col justify-between">
                            <p className="text-[#1E293B] font-medium text-[14px] mb-8 leading-relaxed">
                                "Our team no longer spends hours answering repetitive questions. We focus only on qualified leads."
                            </p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                                    <img src="https://i.pravatar.cc/150?img=11" alt="Avatar" className="w-full h-full object-cover" />
                                </div>
                                <h5 className="text-[13px] font-bold text-gray-900">Sales Operations</h5>
                            </div>
                        </div>
                        <div className="bg-white border border-gray-100 rounded-[16px] p-8 shadow-sm flex flex-col justify-between flex-grow">
                            <p className="text-[#1E293B] font-medium text-[14px] mb-8 leading-relaxed">
                                "Sellrise gave us a structured way to handle conversations and guide customers toward the right product."
                            </p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                                    <img src="https://i.pravatar.cc/150?img=9" alt="Avatar" className="w-full h-full object-cover" />
                                </div>
                                <h5 className="text-[13px] font-bold text-gray-900">Growth Team</h5>
                            </div>
                        </div>
                    </div>

                    {/* Col 3 */}
                    <div className="space-y-6 flex flex-col">
                        <div className="bg-[#0066FF] rounded-[16px] p-8 flex flex-col justify-center text-white shadow-lg shadow-blue-500/20 min-h-[220px]">
                            <h3 className="text-[60px] md:text-[72px] font-bold mb-1 tracking-tight leading-none">24/7</h3>
                            <p className="text-white/90 font-medium text-[18px] leading-tight mt-1">always on<br />customer<br />engagement</p>
                        </div>
                        <div className="bg-white border border-gray-100 rounded-[16px] p-8 shadow-sm flex flex-col justify-between flex-grow">
                            <p className="text-[#1E293B] font-medium text-[14px] mb-8 leading-relaxed">
                                "Sellrise gave us a structured way to handle conversations and guide customers toward the right product."
                            </p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                                    <img src="https://i.pravatar.cc/150?img=10" alt="Avatar" className="w-full h-full object-cover" />
                                </div>
                                <h5 className="text-[13px] font-bold text-gray-900">Product Advisory Team</h5>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-[1000px] mx-auto mb-16 text-left">
                    <h3 className="text-3xl md:text-[36px] font-bold tracking-tight text-[#1E293B] mb-8 text-center">
                        Why teams choose Sellrise
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-white border border-gray-100 rounded-[16px] p-8 shadow-sm">
                            <h4 className="text-[18px] font-bold text-gray-900 mb-4">Typical chatbot tools</h4>
                            <ul className="space-y-3 text-gray-600 text-[15px]">
                                <li>DIY setup</li>
                                <li>Generic AI responses</li>
                                <li>Single channel automation</li>
                                <li>Requires internal technical work</li>
                            </ul>
                        </div>
                        <div className="bg-[#EFF6FF] border border-blue-100 rounded-[16px] p-8 shadow-sm">
                            <h4 className="text-[18px] font-bold text-[#1E3A8A] mb-4">Sellrise</h4>
                            <ul className="space-y-3 text-[#1E3A8A] text-[15px]">
                                <li>Done for you deployment</li>
                                <li>Structured sales automation</li>
                                <li>Multi channel orchestration</li>
                                <li>Configured around your business</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="max-w-[1000px] mx-auto mb-16 text-left">
                    <h3 className="text-3xl md:text-[36px] font-bold tracking-tight text-[#1E293B] mb-8 text-center">
                        Frequently asked questions
                    </h3>
                    <div className="space-y-4">
                        {[
                            {
                                q: 'Is Sellrise just a chatbot?',
                                a: 'No. Sellrise is a conversational automation system that combines AI with structured conversation logic.',
                            },
                            {
                                q: 'Do we need a technical team?',
                                a: 'No. Sellrise handles integration and setup as part of the deployment process.',
                            },
                            {
                                q: 'Does Sellrise work with Shopify?',
                                a: 'Yes. Sellrise integrates with Shopify powered stores and other commerce environments.',
                            },
                            {
                                q: 'Can conversations be transferred to a human?',
                                a: 'Yes. The system can route conversations to a human agent whenever needed.',
                            },
                            {
                                q: 'What happens after we submit the integration brief?',
                                a: 'Our team reviews your setup, designs the automation logic, and prepares the deployment process.',
                            },
                        ].map(({ q, a }) => (
                            <div key={q} className="bg-white border border-gray-100 rounded-[14px] p-6 shadow-sm">
                                <h4 className="text-[17px] font-bold text-gray-900 mb-2">{q}</h4>
                                <p className="text-[15px] text-gray-600 leading-relaxed">{a}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA Banner */}
                <div className="max-w-[1000px] mx-auto bg-gradient-to-br from-[#60A5FA] via-[#A78BFA] to-[#FDBA74] rounded-[16px] py-14 px-8 text-center text-white relative overflow-hidden shadow-sm">
                    <div className="relative z-10 flex flex-col items-center">
                        <h3 className="text-2xl md:text-[32px] font-bold mb-4 tracking-tight">Start your automation setup</h3>
                        <p className="text-white/90 text-[16px] mb-8 max-w-[780px]">
                            Tell us about your business and sales process. We will design and deploy your conversational automation system.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button
                                onClick={() => navigate('/login')}
                                className="w-full sm:w-auto px-8 py-3 rounded-full bg-white text-[#8B5CF6] text-[14px] font-semibold hover:shadow-lg transition-all"
                            >
                                Start Integration
                            </button>
                            <button className="w-full sm:w-auto px-8 py-3 rounded-full bg-white/20 border border-white/40 text-white text-[14px] font-semibold backdrop-blur-sm transition-colors hover:bg-white/30">
                                Book Demo
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TestimonialsSection;
