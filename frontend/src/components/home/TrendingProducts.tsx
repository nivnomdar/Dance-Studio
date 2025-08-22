import { useEffect, useMemo, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation } from 'swiper/modules';
import 'swiper/swiper-bundle.css';
import { apiService } from '../../lib/api';

type ShopProduct = {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  is_active: boolean;
  main_image?: string | null;
  categories?: { id: string; name: string | null } | null;
};

function TrendingProducts() {
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const data = await apiService.shop.getProducts();
        if (!isMounted) return;
        setProducts(Array.isArray(data) ? data : []);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  const trending = useMemo(() => {
    const items = (products || []).filter(p => p.is_active);
    const flagged = items.filter((p: any) => !!p.trending);
    return flagged.length ? flagged : [];
  }, [products]);

  if (loading) {
    return (
      <section className="bg-black py-8 sm:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-40 bg-white/5 rounded-lg animate-pulse" />
        </div>
      </section>
    );
  }

  if (!trending.length) return null;

  return (
    <section className="bg-black pt-6 sm:pt-8 lg:pt-10 pb-10 sm:pb-14 lg:pb-16">
      <style>{`
        .swiper-button-next,
        .swiper-button-prev { color: #EC4899 !important; }
        .swiper-pagination-bullet { background-color: #EC4899 !important; }
        .swiper-pagination-bullet-active { background-color: #EC4899 !important; }
        @media (max-width: 640px) {
          .swiper-button-next, .swiper-button-prev { display: none !important; }
        }
      `}</style>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4 font-agrandir-grand">מוצרים חמים</h2>
          <div className="w-16 sm:w-20 lg:w-24 h-1 bg-[#EC4899] mx-auto" />
        </div>
        <Swiper
          modules={[Pagination, Navigation]}
          spaceBetween={16}
          slidesPerView={1.15}
          centeredSlides={false}
          loop={false}
          pagination={{ clickable: true }}
          navigation
          breakpoints={{
            640: { slidesPerView: 2.15, spaceBetween: 20 },
            768: { slidesPerView: 3, spaceBetween: 24 },
            1024: { slidesPerView: 4, spaceBetween: 24 },
          }}
          className="overflow-visible"
        >
          {trending.map((p) => (
            <SwiperSlide key={p.id}>
              <article className="bg-white/5 rounded-xl border border-white/10 overflow-hidden shadow-sm hover:shadow-pink-500/10 transition-all duration-200">
                <div className="aspect-[4/3] w-full bg-white/5 overflow-hidden">
                  {p.main_image ? (
                    <img src={p.main_image} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/40">No image</div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-white font-semibold text-base sm:text-lg line-clamp-1">{p.name}</h3>
                  <p className="text-white/70 text-sm line-clamp-2 mt-1 min-h-[2.5rem]">{p.description || ''}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[#E6C17C] font-bold text-base">₪{Number(p.price).toLocaleString()}</span>
                    <button className="px-3 py-1.5 rounded-full bg-gradient-to-r from-[#4B2E83] to-[#EC4899] text-white text-sm hover:opacity-90 transition">לפרטים</button>
                  </div>
                </div>
              </article>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}

export default TrendingProducts;


