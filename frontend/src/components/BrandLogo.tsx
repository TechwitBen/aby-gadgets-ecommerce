import { Link } from "react-router-dom";

interface BrandLogoProps {
  size?: "sm" | "md";
  onClick?: () => void;
}

// TEMPORARY placeholder — replace the monogram <span> with the real logo later.
const BrandLogo = ({ size = "md", onClick }: BrandLogoProps) => (
  <Link
    to="/"
    onClick={onClick}
    className="flex items-center gap-2 group"
    aria-label="Gadget Plug home"
  >
    <span
      className={`flex items-center justify-center rounded-xl bg-gradient-to-br from-[#6426E1] to-[#3b1c9b] text-white font-extrabold tracking-tighter shadow-sm transition-transform duration-200 group-hover:scale-105 ${
        size === "sm" ? "h-8 w-8 text-sm" : "h-9 w-9 sm:h-10 sm:w-10 text-base"
      }`}
    >
      GP
    </span>
    <span
      className={`font-bold text-[#2B1670] leading-none ${
        size === "sm" ? "text-base" : "text-lg sm:text-xl"
      }`}
    >
      Gadget Plug
    </span>
  </Link>
);

export default BrandLogo;