import { useEffect, useRef, useState } from "react";

interface UseInViewOptions {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
}

export function useInView<T extends HTMLElement = HTMLDivElement>(
  options: UseInViewOptions = {}
) {
  const {
    threshold = 0.15,
    rootMargin = "0px 0px -60px 0px",
    once = true,
  } = options;

  const ref = useRef<T>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setIsInView(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return { ref, isInView };
}

/* helper to apply delay safely */
export const animationDelay = (delay = 0) => ({
  animationDelay: `${delay}ms`,
  transitionDelay: `${delay}ms`,
});

/* utility classes */
export const fadeUp = (isInView: boolean) =>
  `transition-all duration-700 ease-out ${
    isInView
      ? "opacity-100 translate-y-0"
      : "opacity-0 translate-y-6"
  }`;

export const fadeIn = (isInView: boolean) =>
  `transition-all duration-700 ease-out ${
    isInView ? "opacity-100" : "opacity-0"
  }`;

export const slideLeft = (isInView: boolean) =>
  `transition-all duration-700 ease-out ${
    isInView
      ? "opacity-100 translate-x-0"
      : "opacity-0 -translate-x-8"
  }`;

export const slideRight = (isInView: boolean) =>
  `transition-all duration-700 ease-out ${
    isInView
      ? "opacity-100 translate-x-0"
      : "opacity-0 translate-x-8"
  }`;