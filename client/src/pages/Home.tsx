import Header from './homepage/Header';
import HeroSection from './homepage/HeroSection';
import PositioningSection from './homepage/PositioningSection';
import ChildOutcomesSection from './homepage/ChildOutcomesSection';
import ParentOutcomesSection from './homepage/ParentOutcomesSection';
import EligibilitySection from './homepage/EligibilitySection';
import ContextSection from './homepage/ContextSection';
import JoySection from './homepage/JoySection';
import HallOfFame from './homepage/HallOfFame';
import FinalCTASection from './homepage/FinalCTASection';
import FAQSection from './homepage/FAQSection';
import Footer from './homepage/Footer';

import SplashScreen from './homepage/SplashScreen';

// No changes needed if folder move worksmpatibility

export default function Home() {
    return (
        <main className="overflow-hidden">
            <SplashScreen />
            <Header />
            <HeroSection />
            <PositioningSection />
            <ChildOutcomesSection />
            <ParentOutcomesSection />
            {/* <EligibilitySection /> */}
            {/* <JoySection /> */}
            <HallOfFame />
            <ContextSection />
            <FinalCTASection />
            {/* <FAQSection /> */}
            {/* <Footer /> */}
        </main>
    );
}
