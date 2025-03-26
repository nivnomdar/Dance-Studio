import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay, Scrollbar } from "swiper/modules";

import "swiper/swiper-bundle.css";

function PhotosCarousel() {
  return (
    <Swiper
      spaceBetween={30}
      slidesPerView={1}
      autoplay={{ delay: 3000 }}
      loop={true}
      pagination={{ clickable: true }}
      modules={[Pagination, Autoplay, Scrollbar]}
      // scrollbar={{ draggable: true }}
    >
      <SwiperSlide>
        <img src="/carousel/image1.png" alt="Image 1" />
      </SwiperSlide>
      <SwiperSlide>
        <img src="/carousel/image2.png" alt="Image 2" />
      </SwiperSlide>
      <SwiperSlide>
        <img src="/carousel/image3.png" alt="Image 3" />
      </SwiperSlide>
      <SwiperSlide>
        <img src="/carousel/image4.png" alt="Image 4" />
      </SwiperSlide>
    </Swiper>
  );
}

export default PhotosCarousel;
