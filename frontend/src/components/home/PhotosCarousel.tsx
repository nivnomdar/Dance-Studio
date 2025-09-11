import { useEffect, useMemo, useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation, Autoplay } from 'swiper/modules';
import 'swiper/swiper-bundle.css';

function PhotosCarousel() {
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);
  const [isPaused, setIsPaused] = useState(false);
  const swiperRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Sync videos and Swiper autoplay with the global pause state
  useEffect(() => {
    const swiper = swiperRef.current;
    const container = containerRef.current;

    if (!container) return;

    const videos = Array.from(container.querySelectorAll('video')) as HTMLVideoElement[];

    if (isPaused) {
      try { swiper?.autoplay?.stop?.(); } catch {}
      videos.forEach(v => {
        try { v.pause(); } catch {}
      });
    } else {
      if (!prefersReducedMotion) {
        try { swiper?.autoplay?.start?.(); } catch {}
        videos.forEach(v => {
          try { if (v.muted) { void v.play(); } } catch {}
        });
      }
    }
  }, [isPaused, prefersReducedMotion]);

  // Respect reduced motion on mount/changes
  useEffect(() => {
    if (prefersReducedMotion) {
      try { swiperRef.current?.autoplay?.stop?.(); } catch {}
    }
  }, [prefersReducedMotion]);

  return (
    <section id="photos-carousel" role="region" aria-label="קרוסלת תמונות ווידאו" className="pt-2 sm:pt-3 lg:pt-0 pb-4 sm:pb-6 lg:pb-8 mb-4 sm:mb-6 lg:mb-1 bg-black overflow-visible">
      <style>{`
        .swiper-button-next,
        .swiper-button-prev {
          color: #EC4899 !important;
        }
        .swiper-pagination-bullet {
          background-color: #EC4899 !important;
        }
        .swiper-pagination-bullet-active {
          background-color: #EC4899 !important;
        }
        .swiper-button-next:focus-visible,
        .swiper-button-prev:focus-visible {
          outline: 2px solid #ffffff !important;
          outline-offset: 2px;
          border-radius: 9999px;
          box-shadow: 0 0 0 4px rgba(0,0,0,0.6);
        }
        @media (max-width: 640px) {
          .swiper-button-next,
          .swiper-button-prev {
            display: none !important;
          }
        }
      `}</style>
      <div ref={containerRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-1 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4 font-agrandir-grand">
            גלריית תמונות
          </h2>
          <div className="w-16 sm:w-20 lg:w-24 h-1 bg-[#EC4899] mx-auto mb-4 sm:mb-6"></div>
        </div>
        <div className="flex justify-end mb-2 sm:mb-3">
          <button
            type="button"
            aria-controls="photos-carousel"
            aria-pressed={isPaused}
            onClick={() => setIsPaused(p => !p)}
            className="inline-flex items-center gap-2 rounded-md bg-black/50 text-white px-3 py-1.5 text-sm hover:bg-black/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black active:scale-[0.98] transition"
          >
            {isPaused ? 'המשך' : 'השהה'}
          </button>
        </div>

        <Swiper
          modules={[Pagination, Navigation, Autoplay]}
          spaceBetween={20}
          slidesPerView={1}
          centeredSlides={true}
          loop={true}
          keyboard={{ enabled: true }}
          pagination={{ clickable: true }}
          navigation
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true
          }}
          onSwiper={(swiper) => { swiperRef.current = swiper; }}
          breakpoints={{
            640: {
              slidesPerView: 1,
              spaceBetween: 30,
            },
            768: {
              slidesPerView: 2,
              spaceBetween: 30,
            },
            1024: {
              slidesPerView: 3,
              spaceBetween: 30,
            },
          }}
          className="rounded-lg overflow-visible"
          style={{ padding: '50px 0' }}
        >
          {/* Videos First */}
          <SwiperSlide>
            {({ isActive }) => (
              <div 
                className={`relative w-full h-80 sm:h-80 lg:h-96 transition-all duration-500 transform-gpu overflow-visible ${
                  isActive ? 'scale-110 sm:scale-125 z-100 opacity-100' : 'scale-90 opacity-60'
                }`}
                style={{ transformOrigin: 'center center' }}
              >
                <video
                  src="/videos/video1.mp4"
                  className="w-full h-full object-cover rounded-lg"
                  autoPlay={!prefersReducedMotion && !isPaused}
                  loop={!prefersReducedMotion && !isPaused}
                  muted
                  playsInline
                  aria-label="וידאו תדמיתי של הסטודיו"
                />
              </div>
            )}
          </SwiperSlide>
          <SwiperSlide>
            {({ isActive }) => (
              <div 
                className={`relative w-full h-64 sm:h-80 lg:h-96 transition-all duration-500 transform-gpu overflow-visible ${
                  isActive ? 'scale-110 sm:scale-125 z-20 opacity-100' : 'scale-90 opacity-60'
                }`}
                style={{ transformOrigin: 'center center' }}
              >
                <video
                  src="/videos/video2.mp4"
                  className="w-full h-full object-cover rounded-lg"
                  autoPlay={!prefersReducedMotion && !isPaused}
                  loop={!prefersReducedMotion && !isPaused}
                  muted
                  playsInline
                  aria-label="וידאו שיעורים בסטודיו"
                />
              </div>
            )}
          </SwiperSlide>
          <SwiperSlide>
            {({ isActive }) => (
              <div 
                className={`relative w-full h-64 sm:h-80 lg:h-96 transition-all duration-500 transform-gpu overflow-visible ${
                  isActive ? 'scale-110 sm:scale-125 z-20 opacity-100' : 'scale-90 opacity-60'
                }`}
                style={{ transformOrigin: 'center center' }}
              >
                <video
                  src="/videos/video3.mp4"
                  className="w-full h-full object-cover rounded-lg"
                  autoPlay={!prefersReducedMotion && !isPaused}
                  loop={!prefersReducedMotion && !isPaused}
                  muted
                  playsInline
                  aria-label="וידאו רקע הסטודיו"
                />
              </div>
            )}
          </SwiperSlide>
          <SwiperSlide>
            {({ isActive }) => (
              <div 
                className={`relative w-full h-64 sm:h-80 lg:h-96 transition-all duration-500 transform-gpu overflow-visible ${
                  isActive ? 'scale-110 sm:scale-125 z-20 opacity-100' : 'scale-90 opacity-60'
                }`}
                style={{ transformOrigin: 'center center' }}
              >
                <video
                  src="/videos/video4.mp4"
                  className="w-full h-full object-cover rounded-lg"
                  autoPlay={!prefersReducedMotion && !isPaused}
                  loop={!prefersReducedMotion && !isPaused}
                  muted
                  playsInline
                  aria-label="וידאו תדמית נוסף"
                />
              </div>
            )}
          </SwiperSlide>
          <SwiperSlide>
            {({ isActive }) => (
              <div 
                className={`relative w-full h-64 sm:h-80 lg:h-96 transition-all duration-500 transform-gpu overflow-visible ${
                  isActive ? 'scale-110 sm:scale-125 z-20 opacity-100' : 'scale-90 opacity-60'
                }`}
                style={{ transformOrigin: 'center center' }}
              >
                <video
                  src="/videos/video5.mp4"
                  className="w-full h-full object-cover rounded-lg"
                  autoPlay={!prefersReducedMotion && !isPaused}
                  loop={!prefersReducedMotion && !isPaused}
                  muted
                  playsInline
                  aria-label="וידאו מספר 5"
                />
              </div>
            )}
          </SwiperSlide>
          <SwiperSlide>
            {({ isActive }) => (
              <div 
                className={`relative w-full h-64 sm:h-80 lg:h-96 transition-all duration-500 transform-gpu overflow-visible ${
                  isActive ? 'scale-110 sm:scale-125 z-20 opacity-100' : 'scale-90 opacity-60'
                }`}
                style={{ transformOrigin: 'center center' }}
              >
                <video
                  src="/videos/video6.mp4"
                  className="w-full h-full object-cover rounded-lg"
                  autoPlay={!prefersReducedMotion && !isPaused}
                  loop={!prefersReducedMotion && !isPaused}
                  muted
                  playsInline
                  aria-label="וידאו מספר 6"
                />
              </div>
            )}
          </SwiperSlide>
        </Swiper>
      </div>
    </section>
  );
}

export default PhotosCarousel; 