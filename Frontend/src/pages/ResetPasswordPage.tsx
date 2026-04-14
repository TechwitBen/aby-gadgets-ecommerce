import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, CheckCircle } from "lucide-react";
import { authAPI } from "@/services/api";

const ResetPasswordPage = () => {
  const navigate      = useNavigate();
  const { token }     = useParams<{ token: string }>();

  const [showPassword,        setShowPassword]        = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData,            setFormData]            = useState({ newPassword: "", confirmPassword: "" });
  const [isLoading,           setIsLoading]           = useState(false);
  const [error,               setError]               = useState<string | null>(null);
  const [success,             setSuccess]             = useState(false);

  const validate = () => {
    if (formData.newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return false;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("Reset link is invalid. Please request a new one.");
      return;
    }

    if (!validate()) return;

    setIsLoading(true);
    try {
      await authAPI.resetPassword(token, formData.newPassword);
      setSuccess(true);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ?? "Something went wrong. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Hello, welcome back."
      subtitle="Your trusted store for authentic gadgets. Sign up to track your orders, get updates, and shop faster next time."
    >
      <div>
        {success ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Password reset!</h1>
            <p className="text-gray-600 text-sm mb-8">
              Your password has been updated successfully. You can now log in with your new password.
            </p>
            <Button
              className="w-full bg-primary hover:bg-primary/90 text-white"
              onClick={() => navigate("/login")}
            >
              GO TO LOG IN
            </Button>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Reset Your Password</h1>
            <p className="text-gray-600 text-sm mb-8">
              Your password must be different from before.
            </p>

            {!token && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-6">
                <p className="text-red-600 text-sm">
                  This reset link is invalid or missing.{" "}
                  <Link to="/forgot-password" className="font-medium underline">
                    Request a new one
                  </Link>
                  .
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm text-gray-600 mb-2">New Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••"
                    value={formData.newPassword}
                    onChange={(e) => { setFormData({ ...formData, newPassword: e.target.value }); setError(null); }}
                    className="pr-10 bg-white border-gray-200 text-gray-900"
                    disabled={isLoading || !token}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-2">Confirm Password</label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => { setFormData({ ...formData, confirmPassword: e.target.value }); setError(null); }}
                    className="pr-10 bg-white border-gray-200 text-gray-900"
                    disabled={isLoading || !token}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && <p className="text-red-500 text-xs -mt-2">{error}</p>}

              <p className="text-sm text-gray-600">
                Remember your password?{" "}
                <Link to="/login" className="text-primary font-medium hover:underline">
                  Log In
                </Link>
              </p>

              <Button
                type="submit"
                disabled={isLoading || !token}
                className="w-full bg-primary hover:bg-primary/90 text-white"
              >
                {isLoading ? "RESETTING…" : "RESET PASSWORD"}
              </Button>
            </form>
          </>
        )}
      </div>
    </AuthLayout>
  );
};

export default ResetPasswordPage;