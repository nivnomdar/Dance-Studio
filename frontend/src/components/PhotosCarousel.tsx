import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/scrollbar";

import { Pagination, Autoplay } from "swiper/modules";

function PhotosCarousel() {
  return (
    <Swiper
      spaceBetween={30}
      slidesPerView={1}
      autoplay={{ delay: 3000 }}
      loop={true}
      pagination={{ clickable: true }}
      modules={[Pagination, Autoplay]}
      scrollbar={{ draggable: true }}
      // modules={[Scrollbar]}
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

    // <div>
    //   <Carousel
    //     // width={400}
    //     showThumbs={true}
    //     // infiniteLoop={true}
    //     autoPlay={true}
    //     // interval={4000}
    //   >
    //     <div key="1">
    //       <img src="/carousel/image1.png" alt="Image 1" />
    //     </div>
    //     <div key="2">
    //       <img src="/carousel/image2.png" alt="Image 2" />
    //     </div>
    //     <div key="3">
    //       <img src="/carousel/image3.png" alt="Image 3" />
    //     </div>
    //     <div key="4">
    //       <img src="/carousel/image4.png" alt="Image 4" />
    //     </div>
    //   </Carousel>
    // </div>
  );
}

export default PhotosCarousel;
