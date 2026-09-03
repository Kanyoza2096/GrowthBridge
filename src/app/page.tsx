import { HeroSection } from '@/components/home/HeroSection';
import { ImpactStats } from '@/components/home/ImpactStats';
import { PartnerCarousel } from '@/components/home/PartnerCarousel';
import { ServicesPreview } from '@/components/home/ServicesPreview';
import { WhyGrowthbridge } from '@/components/home/WhyGrowthbridge';
import { HowWeCreateImpact } from '@/components/home/HowWeCreateImpact';
import { ProjectsShowcase } from '@/components/home/ProjectsShowcase';
import { Testimonials } from '@/components/home/Testimonials';
import { SocialFeedAggregator } from '@/components/home/SocialFeedAggregator';
import { CTASection } from '@/components/home/CTASection';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ImpactStats />
      <PartnerCarousel />
      <ServicesPreview />
      <WhyGrowthbridge />
      <HowWeCreateImpact />
      <ProjectsShowcase />
      <Testimonials />
      <SocialFeedAggregator />
      <CTASection />
    </>
  );
}
