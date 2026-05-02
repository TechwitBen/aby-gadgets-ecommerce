import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { inviteAPI } from "@/services/Staff.service";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Eye, EyeOff, CheckCircle } from "lucide-react";

const AcceptInvitePage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { setUserManually } = useAuth();

  // Step 1 — validate token
  const [inviteEmail, setInviteEmail] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [tokenLoading, setTokenLoading] = useState(true);

  // Step 2 — form
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) {
      setTokenError("Invalid invite link.");
      setTokenLoading(false);
      return;
    }
    inviteAPI
      .getInviteInfo(token)
      .then(({ email }) => setInviteEmail(email))
      .catch(() =>
        setTokenError(
          "This invite link is invalid or has expired. Ask your admin to resend it.",
        ),
      )
      .finally(() => setTokenLoading(false));
  }, [token]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!username.trim()) e.username = "Username is required";
    if (username.trim().length < 3)
      e.username = "Username must be at least 3 characters";
    if (password.length < 8)
      e.password = "Password must be at least 8 characters";
    if (password !== confirm) e.confirm = "Passwords do not match";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await inviteAPI.acceptInvite(token!, {
        username: username.trim(),
        password,
        name: name.trim() || undefined,
      });
      setDone(true);
      // Redirect to admin dashboard after short delay
      setTimeout(() => navigate("/admin"), 2500);
    } catch (err: any) {
      setSubmitError(
        err.response?.data?.error || "Something went wrong. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Loading state ─────────────────────────────────────────────────────────
  if (tokenLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2
            size={32}
            className="animate-spin text-purple-600 mx-auto mb-3"
          />
          <p className="text-gray-500 text-sm">Validating your invite…</p>
        </div>
      </div>
    );
  }

  // ── Invalid / expired token ───────────────────────────────────────────────
  if (tokenError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">❌</span>
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">
            Invite Invalid
          </h2>
          <p className="text-sm text-gray-500 mb-6">{tokenError}</p>
          <Link to="/" className="text-sm text-purple-600 hover:underline">
            Go to homepage
          </Link>
        </div>
      </div>
    );
  }

  // ── Success state ─────────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center">
          <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-gray-900 mb-2">
            Account Activated!
          </h2>
          <p className="text-sm text-gray-500">
            Welcome to Aby Gadgets. Redirecting you to the dashboard…
          </p>
        </div>
      </div>
    );
  }

  // ── Form ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
        {/* Header */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">Ab</span>
          </div>
          <span className="text-lg font-bold text-gray-900">Aby Gadgets</span>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Accept your invite
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          You're joining as a staff member for{" "}
          <span className="font-medium text-gray-700">{inviteEmail}</span>
        </p>

        {submitError && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
            {submitError}
          </div>
        )}

        <div className="space-y-4">
          {/* Full name — optional */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">
              Full Name{" "}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Amara Okafor"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

          {/* Username */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">
              Username <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. amara_ok"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setErrors((p) => ({ ...p, username: "" }));
              }}
              className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 ${errors.username ? "border-red-400" : "border-gray-200"}`}
            />
            {errors.username && (
              <p className="text-xs text-red-500 mt-1">{errors.username}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrors((p) => ({ ...p, password: "" }));
                }}
                className={`w-full border rounded-xl px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 ${errors.password ? "border-red-400" : "border-gray-200"}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-500 mt-1">{errors.password}</p>
            )}
          </div>

          {/* Confirm password */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Re-enter password"
              value={confirm}
              onChange={(e) => {
                setConfirm(e.target.value);
                setErrors((p) => ({ ...p, confirm: "" }));
              }}
              className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 ${errors.confirm ? "border-red-400" : "border-gray-200"}`}
            />
            {errors.confirm && (
              <p className="text-xs text-red-500 mt-1">{errors.confirm}</p>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full h-11 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
          >
            {isSubmitting && <Loader2 size={16} className="animate-spin" />}
            {isSubmitting ? "Activating…" : "Activate My Account"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AcceptInvitePage;
