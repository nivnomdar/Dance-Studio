import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay, EffectFade, Navigation } from "swiper/modules";

import "swiper/swiper-bundle.css";

function PhotosCarousel() {
  return (
    <div className="w-full max-w-[100vw] overflow-hidden">
    <Swiper
        spaceBetween={0}
      slidesPerView={1}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true
        }}
      loop={true}
        effect="fade"
        fadeEffect={{
          crossFade: true
        }}
        pagination={{
          clickable: true,
          dynamicBullets: true,
          renderBullet: function (index, className) {
            return '<span class="' + className + ' bg-[#cfe611]"></span>';
          }
        }}
        navigation={{
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        }}
        modules={[Pagination, Autoplay, EffectFade, Navigation]}
        className="w-full h-[60vh] sm:h-[70vh] md:h-[80vh]"
    >
      <SwiperSlide>
          <div className="relative w-full h-full">
            <img 
              src="/carousel/image1.png" 
              alt="Image 1" 
              className="w-full h-full object-cover object-center"
              loading="lazy"
            />
          </div>
      </SwiperSlide>
      <SwiperSlide>
          <div className="relative w-full h-full">
            <img 
              src="/carousel/image2.png" 
              alt="Image 2" 
              className="w-full h-full object-cover object-center"
              loading="lazy"
            />
          </div>
      </SwiperSlide>
      <SwiperSlide>
          <div className="relative w-full h-full">
            <img 
              src="/carousel/image3.png" 
              alt="Image 3" 
              className="w-full h-full object-cover object-center"
              loading="lazy"
            />
          </div>
      </SwiperSlide>
      <SwiperSlide>
          <div className="relative w-full h-full">
            <img 
              src="/carousel/image4.png" 
              alt="Image 4" 
              className="w-full h-full object-cover object-center"
              loading="lazy"
            />
          </div>
      </SwiperSlide>

        {/* Navigation buttons */}
        <div className="swiper-button-prev !text-[#cfe611] !w-8 !h-8 sm:!w-12 sm:!h-12"></div>
        <div className="swiper-button-next !text-[#cfe611] !w-8 !h-8 sm:!w-12 sm:!h-12"></div>
    </Swiper>
    </div>
  );
}

export default PhotosCarousel;
