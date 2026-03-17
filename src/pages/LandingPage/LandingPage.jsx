import LandingNavbar from './sections/LandingNavbar';
import HeroSection from './sections/HeroSection';
import PerfectForSection from './sections/PerfectForSection';
import FeatureSection from './sections/FeatureSection';
import TestimonialsSection from './sections/TestimonialsSection';
import StepsSection from './sections/StepsSection';
import LandingFooter from './sections/LandingFooter';
import LandingWidgetEmbed from './sections/LandingWidgetEmbed';

export default function LandingPage() {
    return (
        <div className="min-h-screen font-sans bg-white text-gray-900 selection:bg-blue-100">
            <LandingWidgetEmbed />
            <LandingNavbar />

            <main>
                <HeroSection />
                <PerfectForSection />
                <FeatureSection />
                <TestimonialsSection />
                <StepsSection />
            </main>

            <LandingFooter />
        </div>
    );
}
