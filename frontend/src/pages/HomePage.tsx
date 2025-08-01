import HeroSection from '../components/home/HeroSection';
import PhotosCarousel from '../components/home/PhotosCarousel';
import AboutSection from '../components/home/AboutSection';

function HomePage() {
  return (
    <main className="flex flex-col min-h-screen">
      <HeroSection />
      <AboutSection />
      <PhotosCarousel />
    </main>
  );
}

export default HomePage; 