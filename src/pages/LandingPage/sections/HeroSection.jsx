import Picture1 from '../../../assets/Picture1.png';
import Picture2 from '../../../assets/Picture2.png';
import Picture12 from '../../../assets/Picture12.png';
import { useNavigate } from 'react-router-dom';

/**
 * HeroSection - Landing page hero with headline, CTAs, and dashboard preview.
 */
const HeroSection = () => {
    const navigate = useNavigate();

    return (
        <section className="relative pt-20 pb-16 md:pt-28 md:pb-24 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                {/* Floating decorative images */}
                <div className="absolute top-44 left-[10%] hidden md:block -z-10">
                    <img src={Picture2} alt="Blue floating graphic" className="w-[60px] h-[60px] object-contain drop-shadow-lg" />
                </div>
                <div className="absolute top-2 right-[10%] hidden md:block -z-10">
                    <img src={Picture1} alt="Pink floating graphic" className="w-[60px] h-[60px] object-contain drop-shadow-[0_20px_50px_rgba(255,165,0,0.2)]" />
                </div>

                {/* Badge */}
                <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-white border border-gray-200 shadow-sm text-gray-700 text-sm font-semibold mb-8">
                    <span>😎</span> Conversational sales automation
                </div>

                <h1 className="text-[40px] md:text-6xl lg:text-[72px] font-extrabold tracking-tight text-[#1E293B] mb-6 leading-[1.1] max-w-[850px] mx-auto">
                    Conversational Sales Automation <br className="hidden md:block" />
                    for <span className="text-[#0066FF]">Shopify Brands</span>
                </h1>

                <p className="text-lg md:text-[20px] text-gray-500 font-medium mb-10 max-w-2xl mx-auto">
                    Sellrise integrates and deploys AI powered automation across WhatsApp, Instagram, TikTok and website chat so every customer conversation moves closer to conversion.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-24">
                    <button
                        onClick={() => navigate('/login')}
                        className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#0066FF] hover:bg-blue-700 text-white text-[16px] font-bold transition-colors"
                    >
                        Start Integration
                    </button>
                    <button className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#EEF2FF] hover:bg-blue-100 text-[#0066FF] text-[16px] font-bold transition-colors">
                        Book Demo
                    </button>
                </div>

                <p className="text-sm text-gray-500 font-medium mb-10 max-w-2xl mx-auto -mt-16">
                    Built for e commerce teams that want automation implemented, not just installed.
                </p>

                {/* Dashboard App Image */}
                <div className="relative mx-auto mt-12 w-full max-w-[1000px] px-4 md:px-0">
                    <div className="rounded-t-[8px] overflow-hidden drop-shadow-2xl">
                        <img src={Picture12} alt="Sellrise Dashboard App Interface" className="w-full h-auto object-cover" />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
