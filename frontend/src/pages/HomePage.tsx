import { useState, useEffect } from 'react';
import HeroSection from '../components/home/HeroSection';
import PhotosCarousel from '../components/home/PhotosCarousel';
import AboutSection from '../components/home/AboutSection';
import HomePageLoader from '../components/loading/HomePageLoader';

function HomePage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Faster loading time for better user experience
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000); // Reduced from 2 seconds to 1 second

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <HomePageLoader />;
  }

  return (
    <main className="flex flex-col">
      <HeroSection />
      <AboutSection />
      <PhotosCarousel />
    </main>
  );
}

export default HomePage; 