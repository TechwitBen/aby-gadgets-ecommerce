import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User, Mail, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { oauthHelpers } from "@/utils/oauth";

const SignUpPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";

  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  // Check for OAuth errors on component mount
  useEffect(() => {
    const oauthError = oauthHelpers.checkOAuthError();
    if (oauthError === "google") {
      setError("Google authentication failed. Please try again.");
      oauthHelpers.clearOAuthError();
    } else if (oauthError === "facebook") {
      setError("Facebook authentication failed. Please try again.");
      oauthHelpers.clearOAuthError();
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.username || !formData.email || !formData.password) {
      setError("All fields are required");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    try {
      await register(formData.username, formData.email, formData.password);
      // Return the user to wherever they were trying to go
      navigate(redirectTo, { replace: true });
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    oauthHelpers.loginWithGoogle();
  };

  const handleFacebookSignup = () => {
    oauthHelpers.loginWithFacebook();
  };

  return (
    <AuthLayout
      title="Welcome to Aby Gadgets"
      subtitle="Your trusted store for authentic gadgets. Sign up to track your orders, get updates, and shop faster next time."
    >
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Sign Up</h1>

        {/* Show where the user will land after signup */}
        {redirectTo !== "/" && (
          <p className="text-sm text-blue-600 mb-6">
            You'll be taken back to your previous page after creating your account.
          </p>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-gray-600 mb-2">Username</label>
            <div className="relative">
              <Input
                type="text"
                placeholder="johndoe"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                className="pr-10 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"
                disabled={isLoading}
              />
              <User
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">Email</label>
            <div className="relative">
              <Input
                type="email"
                placeholder="janejo@gmail.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="pr-10 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"
                disabled={isLoading}
              />
              <Mail
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">Password</label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="•••••••"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="pr-10 bg-white border-gray-200 text-gray-900"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              // Pass the same redirect along to login so the flow is preserved
              to={`/login?redirect=${encodeURIComponent(redirectTo)}`}
              className="text-primary font-medium hover:underline"
            >
              Log In
            </Link>
          </p>

          <Button
            type="submit"
            variant="outline"
            className="w-full border-primary text-primary hover:bg-primary hover:text-white"
            disabled={isLoading}
          >
            {isLoading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
          </Button>

          <Button
            type="button"
            variant="ghost"
            className="w-full text-primary font-medium"
            onClick={() => navigate("/")}
            disabled={isLoading}
          >
            CONTINUE WITHOUT ACCOUNT
          </Button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">Continue With</span>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              className="w-full border-primary text-gray-700 hover:bg-gray-50"
              disabled={isLoading}
              onClick={handleGoogleSignup}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full border-primary text-gray-700 hover:bg-gray-50"
              disabled={isLoading}
              onClick={handleFacebookSignup}
            >
              <svg className="w-5 h-5 mr-2" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Facebook
            </Button>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
};

export default SignUpPage;