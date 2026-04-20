import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, CheckCircle, AlertCircle } from "lucide-react";
import { authAPI } from "@/services/api";

// ── Shared UI helpers ─────────────────────────────────────────────────────────

const ErrorBanner = ({ message }: { message: string }) => (
  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
    <p className="text-sm text-red-600">{message}</p>
  </div>
);

// ── ForgotPasswordPage ────────────────────────────────────────────────────────

const ForgotPasswordPage = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setIsLoading(true);
    try {
      await authAPI.forgotPassword(email);
      setSubmitted(true);
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
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-5 -ml-1 p-1 rounded-md transition-colors"
        >
          <ArrowLeft size={20} />
        </button>

        {submitted ? (
          /* ── Success state ─────────────────────────────────────────────── */
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
              Check your inbox
            </h1>
            <p className="text-gray-600 text-sm mb-5 leading-relaxed">
              If{" "}
              <span className="font-medium text-gray-900">{email}</span> is
              linked to an account, you'll receive a reset link shortly.
            </p>
            <p className="text-xs text-gray-500 mb-7">
              Didn't get it? Check your spam folder or{" "}
              <button
                onClick={() => setSubmitted(false)}
                className="text-primary font-medium hover:underline"
              >
                try again
              </button>
              .
            </p>
            <Button
              variant="outline"
              className="w-full h-11 border-primary text-primary hover:bg-primary hover:text-white transition-colors"
              onClick={() => navigate("/login")}
            >
              BACK TO LOG IN
            </Button>
          </div>
        ) : (
          /* ── Form state ────────────────────────────────────────────────── */
          <>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              Forgot Password
            </h1>
            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
              Don't worry, it happens.
              <br />
              Enter your email address and we'll send you a link to reset your
              password.
            </p>

            {error && <ErrorBanner message={error} />}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm text-gray-600 mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Input
                    type="email"
                    placeholder="eg. janejo@gmail.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError(null);
                    }}
                    className="pr-10 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 h-11"
                    disabled={isLoading}
                  />
                  <Mail
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                </div>
              </div>

              <p className="text-sm text-gray-600">
                Remember your password?{" "}
                <Link
                  to="/login"
                  className="text-primary font-medium hover:underline"
                >
                  Log in
                </Link>
              </p>

              <Button
                type="submit"
                variant="outline"
                disabled={isLoading}
                className="w-full h-11 border-primary text-primary hover:bg-primary hover:text-white transition-colors"
              >
                {isLoading ? "SENDING…" : "SEND RESET LINK"}
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
            </form>
          </>
        )}
      </div>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;