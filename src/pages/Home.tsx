import HeroSlider from '../components/home/HeroSlider'
import AboutSection from '../components/home/AboutSection'
import StatsSection from '../components/home/StatsSection'
import ServicesSection from '../components/home/ServicesSection'
import GalleryPreview from '../components/home/GalleryPreview'
import TestimonialsSection from '../components/home/TestimonialsSection'
import DonateCTA from '../components/home/DonateCTA'

export default function Home() {
  return (
    <>
      <HeroSlider />
      <AboutSection />
      <StatsSection />
      <ServicesSection />
      <GalleryPreview />
      <TestimonialsSection />
      <DonateCTA />
    </>
  )
}
