import { Link } from "react-router-dom";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">

      {/* ── Left Side — Form ───────────────────────────────────────────── */}
      <div className="w-full lg:w-1/2 bg-white flex flex-col">

        {/* Top bar — logo */}
        <div className="px-5 sm:px-8 py-5 flex-shrink-0">
          <Link to="/" className="flex items-center gap-2 w-fit">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">Ab</span>
            </div>
            <span className="text-xl font-semibold text-gray-900">Aby Gadgets</span>
          </Link>
        </div>

        {/* Form area — vertically centred, horizontally padded */}
        <div className="flex-1 flex items-start lg:items-center justify-center px-5 sm:px-8 lg:px-16 py-6 lg:py-12">
          <div className="w-full max-w-md">
            {children}
          </div>
        </div>
      </div>

      {/* ── Right Side — Hero Image (hidden on mobile) ─────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.5)), url('https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=1200&q=80')`,
          }}
        />

        {/* Top nav links */}
        <div className="absolute top-6 right-6 flex items-center gap-4 z-10">
          <Link
            to="/signup"
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Sign Up
          </Link>
          <Link
            to="/login"
            className="text-white hover:text-gray-200 transition-colors"
          >
            Log in
          </Link>
        </div>

        {/* Hero text */}
        <div className="absolute bottom-20 left-8 right-8 z-10">
          <h2 className="text-3xl lg:text-4xl font-bold text-primary mb-4">
            {title}
          </h2>
          {subtitle && (
            <p className="text-white/90 text-lg leading-relaxed">{subtitle}</p>
          )}
        </div>
      </div>

      {/* ── Mobile hero strip (visible only on mobile) ─────────────────── */}
      <div
        className="lg:hidden relative h-40 sm:h-52 bg-cover bg-center flex-shrink-0 order-first"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.35), rgba(0,0,0,0.55)), url('https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=800&q=80')`,
        }}
      >
        {/* Mobile logo overlay */}
        <div className="absolute inset-0 flex flex-col items-start justify-end p-5">
          <h2 className="text-xl font-bold text-primary leading-snug">
            {title}
          </h2>
          {subtitle && (
            <p className="text-white/80 text-xs mt-1 leading-relaxed line-clamp-2">
              {subtitle}
            </p>
          )}
        </div>
      </div>

    </div>
  );
};