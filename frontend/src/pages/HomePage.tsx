import HeroSection from '../components/home/HeroSection';
import PhotosCarousel from '../components/home/PhotosCarousel';
import AboutSection from '../components/home/AboutSection';
import TrendingProducts from '../components/home/TrendingProducts';
import { motion } from 'framer-motion';

function HomePage() {
  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };
  
  const fadeInUp = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] } }
  };

  return (
    <motion.main 
      className="flex flex-col"
      variants={staggerContainer}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={fadeInUp}>
        <HeroSection />
      </motion.div>
      <motion.div variants={fadeInUp}>
        <AboutSection />
      </motion.div>
      <motion.div variants={fadeInUp}>
        <PhotosCarousel />
      </motion.div>
      <motion.div variants={fadeInUp}>
        <TrendingProducts />
      </motion.div>
    </motion.main>
  );
}

export default HomePage; 