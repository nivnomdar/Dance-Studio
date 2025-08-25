import HeroSection from '../components/home/HeroSection';
import PhotosCarousel from '../components/home/PhotosCarousel';
import AboutSection from '../components/home/AboutSection';
import TrendingProducts from '../components/home/TrendingProducts';

function HomePage() {
  return (
    <main className="flex flex-col">
      <HeroSection />
      <AboutSection />
      <PhotosCarousel />
      <TrendingProducts />
    </main>
  );
}

export default HomePage; 