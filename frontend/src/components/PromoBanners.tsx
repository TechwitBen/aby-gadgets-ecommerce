import promoBanner1 from "@/assets/PromoBanner1.png";
import promoBanner2 from "@/assets/PromoBanner2.png";

const banners = [
  { id: "promo-1", image: promoBanner1, alt: "Promotional banner 1" },
  { id: "promo-2", image: promoBanner2, alt: "Promotional banner 2" },
];

const PromoBanners = () => (
  // Same outer/inner padding as Shop By Category so the edges line up
  <section
    className="w-full bg-background px-3 pb-10 sm:px-5 md:pb-14 lg:px-6"
    aria-label="Promotions"
  >
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:gap-8">
        {banners.map((banner, i) => (
          <div
            key={banner.id}
            className="h-44 overflow-hidden rounded-2xl sm:h-[240px] md:h-[260px] lg:h-[250px] xl:h-[290px] 2xl:h-[320px]"
          >
            <img
              src={banner.image}
              alt={banner.alt}
              loading={i === 0 ? "eager" : "lazy"}
              draggable={false}
              className="h-full w-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default PromoBanners;