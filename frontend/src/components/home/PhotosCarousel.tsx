import { useEffect, useMemo, useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation, Autoplay } from 'swiper/modules';
import 'swiper/swiper-bundle.css';

const videoData = [
  { src: "/videos/video1.mp4", alt: "וידאו תדמיתי של הסטודיו" },
  { src: "/videos/video2.mp4", alt: "וידאו שיעורים בסטודיו" },
  { src: "/videos/video3.mp4", alt: "וידאו רקע הסטודיו" },
  { src: "/videos/video4.mp4", alt: "וידאו תדמית נוסף" },
  { src: "/videos/video5.mp4", alt: "וידאו מספר 5" },
  { src: "/videos/video6.mp4", alt: "וידאו מספר 6" },
];

// Function to get video thumbnail
const getVideoThumbnail = (videoPath: string): Promise<string | null> => {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.src = videoPath;
    video.preload = 'metadata';
    video.crossOrigin = 'anonymous';
    video.autoplay = false;
    video.loop = false;
    video.muted = true;
    video.playsInline = true;

    video.onloadeddata = () => {
      video.currentTime = Math.min(1, video.duration / 2); // Get frame from halfway point or 1 second
    };

    video.onseeked = () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataURL = canvas.toDataURL('image/jpeg');
        resolve(dataURL);
      } else {
        console.error('Could not get canvas context for video:', videoPath);
        resolve(null); // Resolve with null on error
      }
      video.remove();
    };

    video.onerror = (e) => {
      console.error('Error loading video for thumbnail:', videoPath, e);
      resolve(null); // Resolve with null on error
      video.remove();
    };

    video.load();
  });
};

function PhotosCarousel() {
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);
  const [isPaused, setIsPaused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0); // Add state for active slide index
  const [videoThumbnails, setVideoThumbnails] = useState<(string | null)[]>(new Array(videoData.length).fill(null)); // Initialize with nulls
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
        // Only play the active video
        const activeVideo = videos[activeIndex];
        if (activeVideo && activeVideo.muted) {
          void activeVideo.play();
        }
      }
    }
  }, [isPaused, prefersReducedMotion, activeIndex]); // Add activeIndex to dependencies

  // Respect reduced motion on mount/changes
  useEffect(() => {
    if (prefersReducedMotion) {
      try { swiperRef.current?.autoplay?.stop?.(); } catch {}
    }
  }, [prefersReducedMotion]);

  // Generate and store video thumbnails on mount
  useEffect(() => {
    const generateThumbnails = async () => {
      const thumbnails = await Promise.all(
        videoData.map(async (video) => {
          try {
            return await getVideoThumbnail(video.src);
          } catch (e) {
            console.error("Failed to generate thumbnail for", video.src, e);
            return null; // Return null on error
          }
        })
      );
      setVideoThumbnails(thumbnails);
    };

    generateThumbnails();
  }, []); // Run only once on mount

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
          onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)} // Update activeIndex on slide change
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
          {videoData.map((video, index) => (
            <SwiperSlide key={index}>
              {({ isActive }) => (
                <div 
                  className={`relative w-full h-64 sm:h-80 lg:h-96 transition-all duration-500 transform-gpu overflow-visible ${isActive ? 'scale-110 sm:scale-125 z-20 opacity-100' : 'scale-90 opacity-60'}`}
                  style={{ transformOrigin: 'center center' }}
                >
                  {isActive ? (
                    <video
                      src={video.src}
                      className="w-full h-full object-cover rounded-lg"
                      autoPlay={!prefersReducedMotion && !isPaused}
                      loop={!prefersReducedMotion && !isPaused}
                      muted
                      playsInline
                      preload="auto" // Add preload attribute
                      aria-label={video.alt}
                    />
                  ) : (
                    videoThumbnails[index] ? (
                      <img
                        src={videoThumbnails[index]}
                        alt={video.alt}
                        className="w-full h-full object-cover rounded-lg"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full object-cover rounded-lg bg-gray-700 flex items-center justify-center text-white">טוען תמונה...</div>
                    )
                  )}
                </div>
              )}
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}

export default PhotosCarousel; 