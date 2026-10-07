import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Carousel1 from "@/assets/GadgetPlug-Carousel1.png"; // adjust extension if needed
import Carousel2 from "@/assets/GadgetPlug-Carousel2.png"; // adjust extension if needed
import Carousel3 from "@/assets/GadgetPlug-Carousel3.png"; // adjust extension if needed

interface PromoSlide {
  id: string;
  image: string; // swap each slide's image here later
  alt: string;
  to?: string; // optional: makes the whole banner clickable
}

// ── Each slide has its own image. Replace `image` per slide later. ──
const slides: PromoSlide[] = [
  { id: "promo-1", image: Carousel1, alt: "Promotion 1", to: "/products" },
  { id: "promo-2", image: Carousel2, alt: "Promotion 2", to: "/products" },
  { id: "promo-3", image: Carousel3, alt: "Promotion 3", to: "/products" },
];

const AUTOPLAY_MS = 6000;
const SWIPE_THRESHOLD = 50;

const PromoCarousel = () => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduceMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const count = slides.length;

  const goTo = useCallback((i: number) => setIndex((i + count) % count), [count]);
  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  // Autoplay: restarts after every slide change, pauses on hover/focus/touch
  useEffect(() => {
    if (paused || reduceMotion) return;
    const t = setTimeout(() => setIndex((i) => (i + 1) % count), AUTOPLAY_MS);
    return () => clearTimeout(t);
  }, [index, paused, reduceMotion, count]);

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
    setPaused(true);
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    setPaused(false);
    if (!start) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
      dx < 0 ? next() : prev();
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") prev();
    if (e.key === "ArrowRight") next();
  };

  return (
    <section
      className="w-full bg-background"
      aria-roledescription="carousel"
      aria-label="Promotions"
    >
      <div
        className="relative w-full"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
        onKeyDown={onKeyDown}
      >
        {/* Viewport */}
        <div
          className="overflow-hidden touch-pan-y"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {/* Track */}
          <div
            className="flex transition-transform duration-500 ease-out motion-reduce:transition-none"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {slides.map((slide, i) => {
              const active = i === index;
              const image = (
                <img
                  src={slide.image}
                  alt={slide.alt}
                  loading={i === 0 ? "eager" : "lazy"}
                  draggable={false}
                  className="h-full w-full object-cover"
                />
              );

              return (
                <div
                  key={slide.id}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${i + 1} of ${count}`}
                  aria-hidden={!active}
                  // Full viewport height minus: sticky header (64px / 69px on lg) and the dots row (40px).
                  // min-h keeps it usable on short landscape screens.
                  className="min-w-full min-h-[360px] h-[calc(100dvh-104px)] lg:h-[calc(100dvh-109px)]"
                >
                  {slide.to ? (
                    <Link
                      to={slide.to}
                      tabIndex={active ? 0 : -1}
                      className="block h-full w-full"
                    >
                      {image}
                    </Link>
                  ) : (
                    image
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Arrows (sm and up; mobile uses swipe + dots) */}
        <button
          type="button"
          onClick={prev}
          aria-label="Previous slide"
          className="hidden sm:flex absolute left-4 lg:left-6 top-1/2 -translate-y-1/2 h-10 w-10 items-center justify-center rounded-full bg-white/90 text-gray-900 shadow-md hover:bg-white transition"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={next}
          aria-label="Next slide"
          className="hidden sm:flex absolute right-4 lg:right-6 top-1/2 -translate-y-1/2 h-10 w-10 items-center justify-center rounded-full bg-white/90 text-gray-900 shadow-md hover:bg-white transition"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Pagination dots — outside the banner, directly below it (row height = 40px) */}
      <div
        className="flex h-10 items-center justify-center gap-2"
        role="tablist"
        aria-label="Choose slide"
      >
        {slides.map((slide, i) => (
          <button
            key={slide.id}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => goTo(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === index ? "w-6 bg-[#6426E1]" : "w-2 bg-gray-300 hover:bg-gray-400"
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default PromoCarousel;