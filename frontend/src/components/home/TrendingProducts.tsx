import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation, Autoplay } from 'swiper/modules';
import 'swiper/swiper-bundle.css';
import { useProducts } from '../../hooks/useProducts';

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
  const { products, loading } = useProducts();
  const navigate = useNavigate();

  const trending = useMemo(() => {
    const items = (products || []).filter(p => p.is_active);
    const flagged = items.filter((p: ShopProduct) => !!(p as any).trending);
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
    <section className="bg-black pt-1 sm:pt-6 lg:pt-8 pb-6 sm:pb-8 lg:pb-10">
      <style>{`
        .swiper-button-next,
        .swiper-button-prev {
          color: #EC4899 !important;
          width: 44px !important;
          height: 44px !important;
          border-radius: 9999px !important;
          background: linear-gradient(135deg, rgba(236,72,153,0.12), rgba(75,46,131,0.12)) !important;
          border: 2px solid #EC4899 !important;
          backdrop-filter: blur(8px);
          box-shadow: 0 6px 18px rgba(236,72,153,0.25);
          display: flex; align-items: center; justify-content: center;
          top: 50% !important; transform: translateY(-50%);
          transition: transform .2s ease, box-shadow .2s ease, background .2s ease, opacity .2s ease;
          z-index: 10;
        }
        .swiper-button-next::after,
        .swiper-button-prev::after { font-size: 18px !important; }
        .swiper-button-prev { right: max(8px, env(safe-area-inset-right)) !important; left: auto !important; }
        .swiper-button-next { left: max(8px, env(safe-area-inset-left)) !important; right: auto !important; }
        .swiper-button-next:hover,
        .swiper-button-prev:hover {
          transform: translateY(-50%) scale(1.05);
          box-shadow: 0 10px 28px rgba(236,72,153,0.35);
          background: linear-gradient(135deg, rgba(236,72,153,0.18), rgba(75,46,131,0.18)) !important;
        }
        .swiper-button-next:active,
        .swiper-button-prev:active {
          transform: translateY(-50%) scale(0.98);
        }
        .swiper-button-next:focus-visible,
        .swiper-button-prev:focus-visible {
          outline: none;
          box-shadow: 0 0 0 3px rgba(236,72,153,0.45);
        }
        .swiper-button-disabled {
          opacity: .35 !important;
          box-shadow: none !important;
          cursor: not-allowed !important;
        }
        .swiper-pagination { display: none !important; }
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
          modules={[Pagination, Navigation, Autoplay]}
          spaceBetween={16}
          slidesPerView={1.15}
          centeredSlides={false}
          loop={true}
          autoHeight={false}
          navigation
          autoplay={{ delay: 3000 }}
          breakpoints={{
            640: { slidesPerView: 2.15, spaceBetween: 20 },
            768: { slidesPerView: 3, spaceBetween: 24 },
            1024: { slidesPerView: 4, spaceBetween: 24 },
          }}
          className="overflow-visible"
        >
          {trending.map((p) => (
            <SwiperSlide key={p.id} className="h-auto">
              <article className="bg-white/5 rounded-xl border border-white/10 overflow-hidden shadow-sm hover:shadow-pink-500/10 transition-all duration-200 flex flex-col h-full">
                <div className="relative w-full h-48 sm:h-56 md:h-64 lg:h-72 overflow-hidden rounded-t-xl">
                  {p.main_image ? (
                    <>
                      <img src={p.main_image} alt={p.name} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/40">No image</div>
                  )}
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="text-white font-semibold text-base sm:text-lg line-clamp-1 min-h-[1.75rem]">{p.name}</h3>
                  <p className="text-white/70 text-sm line-clamp-2 mt-1 min-h-[2.5rem]">{p.description || ''}</p>
                  <div className="mt-auto pt-3 flex items-center justify-between">
                    <span className="text-[#EC4899] font-bold text-base">₪{Number(p.price).toLocaleString()}</span>
                    <button type="button" aria-label={`הצגת מוצר ${p.name}`} onClick={() => navigate(`/product/${p.id}`)} className="group px-3 py-1.5 rounded-full bg-gradient-to-r from-[#4B2E83] to-[#EC4899] text-white text-sm hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 transition inline-flex items-center gap-1.5 cursor-pointer">
                      <span>צפי במוצר</span>
                   
                    </button>
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


