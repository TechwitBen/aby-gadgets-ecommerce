import { Link } from "react-router-dom";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 bg-white flex flex-col">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">Ab</span>
            </div>
            <span className="text-xl font-semibold text-gray-900">Aby Gadgets</span>
          </Link>
        </div>
        
        <div className="flex-1 flex items-center justify-center px-8 lg:px-16">
          <div className="w-full max-w-md">
            {children}
          </div>
        </div>
      </div>
      
      {/* Right Side - Hero Image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.5)), url('https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=1200&q=80')`,
          }}
        />
        
        {/* Top Navigation */}
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
        
        {/* Hero Text */}
        <div className="absolute bottom-20 left-8 right-8 z-10">
          <h2 className="text-3xl lg:text-4xl font-bold text-primary mb-4">
            {title}
          </h2>
          {subtitle && (
            <p className="text-white/90 text-lg leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
