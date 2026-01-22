import { useState } from "react";
import { Mail } from "lucide-react";
import { Link } from "react-router-dom";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [touched, setTouched] = useState(false);

 const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
 const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setEmail(e.target.value);
  if (error) {
    setError("");
  }
};
  const handleBlur = () => {
    setTouched(true);
    if (email && !validateEmail(email)) {
      setError("Please enter a valid email address");
    }
  };

  const handleSubmit = () => {
    setTouched(true);
    
    if (!email) {
      setError("Email is required");
      return;
    }
    
    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    console.log("Password reset link sent to:", email);
    alert("Password reset link has been sent to your email!");
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Forgot Password Form */}
      <div className="w-full lg:w-[45%] bg-white p-8 lg:p-12 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded flex items-center justify-center">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-lg font-semibold text-gray-900">Aby Gadgets</span>
          </Link>
          
        
        </div>

        <div className="flex-1 flex flex-col justify-center max-w-sm w-full">
          {/* Back button */}
          <Link 
            to="/login"
            className="flex items-center gap-1.5 text-gray-900 mb-6 hover:text-gray-700 w-fit"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>

          <h1 className="text-3xl font-bold mb-3 text-gray-900">Forget Password</h1>
          
          <p className="text-xs text-gray-600 mb-8 leading-relaxed">
            Don't worry, it happens.<br />
            Enter your email address and we'll send you a link to reset your password.
          </p>

          <div className="space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-gray-600 mb-1.5">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-3 py-2.5 bg-white border ${
                    error && touched 
                      ? "border-red-500" 
                      : "border-gray-200"
                  } rounded text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 pr-9`}
                  placeholder="eg. james@gmail.com"
                />
                <Mail className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
              {error && touched && (
                <p className="mt-1 text-xs text-red-500">{error}</p>
              )}
            </div>

            <div className="text-xs text-gray-600 pt-1">
              Already got password back?{" "}
              <Link to="/login" className="text-purple-600 hover:text-purple-700 font-medium">
                Log In
              </Link>
            </div>

            <button
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white font-semibold text-sm py-2.5 rounded transition-all mt-2"
            >
              SEND RESET LINK
            </button>
          </div>

          <div className="mt-5 text-center">
            <Link to="/" className="text-purple-600 hover:text-purple-700 font-semibold text-xs uppercase tracking-wide">
              CONTINUE WITHOUT ACCOUNT
            </Link>
          </div>
        </div>
      </div>

      {/* Right side - Welcome Section */}
      <div className="hidden lg:flex lg:w-[55%] bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 relative overflow-hidden">
        {/* Add Sign Up and Log in buttons at top-right */}
        <div className="absolute top-8 right-8 z-10">
          <div className="flex gap-3">
            <Link 
              to="/signup"
              className="px-5 py-2.5 rounded-xl text-sm font-medium bg-transparent text-white hover:bg-white/10 transition-colors"
            >
              Sign Up
            </Link>
            <Link 
              to="/login"
              className="px-5 py-2.5 rounded-xl text-sm font-medium bg-transparent text-white hover:bg-white/10 transition-colors"
            >
              Log in
            </Link>
          </div>
        </div>

        {/* Rest of the right side remains exactly the same */}
        <div className="absolute inset-0 bg-cover bg-center opacity-40" style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1565689157206-0fddef7589a2?w=1200&auto=format&fit=crop&q=80)',
          backgroundBlendMode: 'overlay'
        }}></div>
        
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-slate-900/60"></div>

        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '32px 32px'
          }}></div>
        </div>

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative" style={{ transform: 'scale(0.85)' }}>
            <div className="w-72 h-96 bg-gradient-to-br from-slate-600/40 to-slate-700/40 rounded-3xl shadow-2xl backdrop-blur-sm transform -rotate-12 absolute -left-24 top-8" style={{ border: '1px solid rgba(255,255,255,0.1)' }}></div>
            <div className="w-64 h-[420px] bg-gradient-to-br from-slate-500/50 to-slate-600/50 rounded-[32px] shadow-2xl backdrop-blur-sm transform rotate-6 relative z-10" style={{ border: '1px solid rgba(255,255,255,0.15)' }}>
              <div className="absolute top-6 left-1/2 -translate-x-1/2 w-16 h-1.5 bg-slate-400/30 rounded-full"></div>
            </div>
            <div className="w-56 h-80 bg-gradient-to-br from-slate-600/40 to-slate-700/40 rounded-2xl shadow-2xl backdrop-blur-sm transform -rotate-6 absolute -right-20 top-16" style={{ border: '1px solid rgba(255,255,255,0.1)' }}></div>
          </div>
        </div>

        <div className="relative z-10 flex flex-col justify-center px-16 text-white max-w-lg ml-auto mr-16">
          <h1 className="text-4xl font-bold mb-4 text-cyan-400">Hello, welcome back.</h1>
          <p className="text-base text-gray-300 mb-3 leading-relaxed">
            Your trusted store for authentic gadgets.
          </p>
          <p className="text-base text-gray-300 leading-relaxed">
            Sign up to track your orders, get updates, and shop faster next time.
          </p>
        </div>

        <div className="absolute top-24 right-24 w-40 h-40 bg-cyan-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-32 left-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;