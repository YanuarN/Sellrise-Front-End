import { ChevronDown, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FOOTER_LINKS = {
    Platform: ['WhatsApp', 'Instagram', 'TikTok', 'Telegram', 'Facebook Messenger', 'Website Chat'],
    Solutions: ['Custom solution', 'eCommerce Brands', 'Beauty & Wellness', 'Digital Products', 'TikTok Shop Sellers', 'Enterprise Solutions'],
    Company: ['Terms of Service', 'Privacy Policy', 'Cookie Policy', 'Contacts', 'Partners'],
    Resources: ['Help Center', 'Blog', 'FAQ'],
};

/**
 * LandingFooter - Full footer with CTA form, links grid, and copyright.
 */
const LandingFooter = () => {
    const navigate = useNavigate();

    return (
        <footer className="bg-[#030712] pt-24 pb-12 text-slate-300 border-t-4 border-blue-600">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* CTA + Form */}
                <div className="text-center max-w-3xl mx-auto mb-24">
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-12 leading-[1.15]">
                        Start your automation setup
                    </h2>

                    <p className="text-slate-300 text-[16px] mb-10 max-w-2xl mx-auto">
                        Tell us about your business and sales process. We will design and deploy your conversational automation system.
                    </p>

                    <form className="max-w-xl mx-auto space-y-4" onSubmit={(e) => e.preventDefault()}>
                        <div className="text-left space-y-1.5">
                            <label className="text-[13px] font-bold text-white ml-2">Full Name</label>
                            <input type="text" placeholder="Your full name" className="w-full bg-white rounded-lg px-4 py-3.5 text-gray-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-[15px]" />
                        </div>
                        <div className="text-left space-y-1.5">
                            <label className="text-[13px] font-bold text-white ml-2">WhatsApp Number</label>
                            <div className="flex bg-white rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
                                <div className="flex items-center px-4 bg-white border-r border-gray-200">
                                    <span className="text-lg mr-1">🇺🇸</span>
                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                </div>
                                <input type="tel" placeholder="+1 555 123 4567" className="flex-1 px-4 py-3.5 text-gray-900 placeholder-slate-400 focus:outline-none text-[15px]" />
                            </div>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => navigate('/login')}
                                className="w-full mt-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-3.5 rounded-lg font-bold transition-colors shadow-lg shadow-blue-600/20 text-[15px]"
                            >
                                Start Integration
                            </button>
                            <button type="button" className="w-full mt-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-8 py-3.5 rounded-lg font-bold transition-colors text-[15px]">
                                Book Demo
                            </button>
                        </div>
                    </form>
                </div>

                {/* Links + Branding */}
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

                        {/* Social Icons */}
                        <div className="flex items-center gap-3 pt-4">
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition cursor-pointer text-white"><span className="text-sm font-bold">♪</span></div>
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition cursor-pointer text-white"><MessageCircle className="w-5 h-5" /></div>
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition cursor-pointer text-white">
                                <div className="w-5 h-5 border-[2px] border-white rounded-[6px] relative">
                                    <div className="absolute inset-1 border-[2px] border-white rounded-full"></div>
                                </div>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition cursor-pointer text-white"><span className="text-sm font-bold">in</span></div>
                        </div>
                    </div>

                    {/* Links Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12 text-sm font-medium">
                        {Object.entries(FOOTER_LINKS).map(([section, links]) => (
                            <div key={section}>
                                <h4 className="text-white font-bold mb-6 text-[15px]">{section}</h4>
                                <ul className="space-y-4">
                                    {links.map((link) => (
                                        <li key={link}>
                                            <a href="#" className="text-slate-400 hover:text-white transition-colors">{link}</a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="text-center text-[13px] text-slate-500 pb-4">
                    Sellrise Limited | Business Registration Number (HK): 78104416 | Unit 1603, 16/F, The L. Plaza, 367-375 Queen's Road Central, Sheung Wan, Hong Kong
                </div>
            </div>
        </footer>
    );
};

export default LandingFooter;
