import { useNavigate } from "react-router-dom";
import promoBannerImage from "@/assets/promoBanner.png";

/**
 * PromoBanner
 * A single graphic banner — the whole thing is one designed image
 * (headline, offer, product shot baked in). Swap `promoBannerImage`
 * for the real artwork when it's ready; a placeholder ships for now.
 * Clicking the banner sends shoppers to the sale/products page.
 */
const PromoBanner = () => {
  const navigate = useNavigate();

  return (
    <section className="w-full bg-white py-8 sm:py-10 md:py-12">
      <div className="container mx-auto px-5 sm:px-6 md:px-8 lg:px-12">
        <button
          onClick={() => navigate("/products")}
          className="group relative w-full overflow-hidden rounded-2xl border border-[#E5E5EA]
                     focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/50"
          aria-label="View this week's discount"
        >
          <img
            src={promoBannerImage}
            alt="Up to 25% off select flagship smartphones this week"
            className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            draggable={false}
          />
        </button>
      </div>
    </section>
  );
};

export default PromoBanner;