import { useState, useEffect, useCallback } from "react";
import {
  ShieldCheck,
  ShieldOff,
  UserPlus,
  Loader2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Mail,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authAPI, usersAPI, type BackendUser } from "@/services/Api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

// ── Admin Card ────────────────────────────────────────────────────────────────
const AdminCard = ({
  admin,
  isSelf,
}: {
  admin: BackendUser;
  isSelf: boolean;
}) => {
  const initials = (admin.name ?? admin.username ?? admin.email)
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const joined = new Date(admin.createdAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl hover:border-primary/30 transition-colors">
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-sm font-bold text-primary shrink-0">
        {initials}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-foreground truncate">
            {admin.name ?? admin.username ?? "—"}
          </p>
          {isSelf && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium shrink-0">
              You
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">{admin.email}</p>
        <p className="text-[11px] text-muted-foreground/60 mt-0.5">
          Joined {joined}
        </p>
      </div>

      {/* Badge */}
      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 shrink-0">
        <ShieldCheck size={13} className="text-emerald-500" />
        <span className="text-xs font-medium text-emerald-600">Admin</span>
      </div>
    </div>
  );
};

// ── Promote Form ──────────────────────────────────────────────────────────────
const PromoteForm = ({ onPromoted }: { onPromoted: () => void }) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      setError("Please enter an email address.");
      return;
    }
    if (!trimmed.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await authAPI.promoteToAdmin(trimmed);

      if (res.success) {
        setSuccess(`${trimmed} has been promoted to admin.`);
        setEmail("");
        toast({ title: "Admin promoted", description: res.message });
        onPromoted(); // refresh admin list
      } else {
        setError(res.error ?? res.message ?? "Something went wrong.");
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ??
        err?.response?.data?.message ??
        "Failed to promote user. Check the email and try again.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
          <UserPlus size={16} className="text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">
            Promote a user to admin
          </p>
          <p className="text-xs text-muted-foreground">
            The user must already have a registered account.
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="px-5 py-5 space-y-4">
        <div>
          <label className="block text-xs text-muted-foreground mb-1.5">
            User email address <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <Input
              type="email"
              placeholder="e.g. john@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
                setSuccess(null);
              }}
              className="pr-10 bg-background border-border text-foreground placeholder:text-muted-foreground/50"
              disabled={isLoading}
            />
            <Mail
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={16}
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
            <AlertCircle
              size={15}
              className="text-destructive mt-0.5 shrink-0"
            />
            <p className="text-xs text-destructive">{error}</p>
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="flex items-start gap-2 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
            <CheckCircle2
              size={15}
              className="text-emerald-500 mt-0.5 shrink-0"
            />
            <p className="text-xs text-emerald-600">{success}</p>
          </div>
        )}

        {/* Warning */}
        <div className="flex items-start gap-2 p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg">
          <ShieldOff size={14} className="text-amber-500 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-600">
            Admins can manage all orders, products, and customers. Only promote
            users you fully trust.
          </p>
        </div>

        <Button
          type="submit"
          disabled={isLoading || !email.trim()}
          className="w-full gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Promoting…
            </>
          ) : (
            <>
              <ShieldCheck size={14} />
              Promote to Admin
            </>
          )}
        </Button>
      </form>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const AdminManagePage = () => {
  const { user: currentUser } = useAuth();

  const [admins, setAdmins] = useState<BackendUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchAdmins = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const data = await usersAPI.getAdmins();
      setAdmins(data);
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ??
        err?.response?.data?.message ??
        "Failed to load admins.";
      setFetchError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Page title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            Admin Management
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            View all admins and promote registered users.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchAdmins}
          disabled={isLoading}
          className="gap-1.5"
        >
          <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} />
          Refresh
        </Button>
      </div>

      {/* Promote form — always visible */}
      <PromoteForm onPromoted={fetchAdmins} />

      {/* Current admins list */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <p className="text-sm font-semibold text-foreground">
              Current admins
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isLoading
                ? "Loading…"
                : `${admins.length} admin${admins.length !== 1 ? "s" : ""} total`}
            </p>
          </div>
          <ShieldCheck size={16} className="text-primary" />
        </div>

        <div className="p-4 space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-10 gap-2 text-muted-foreground">
              <Loader2 size={18} className="animate-spin" />
              <span className="text-sm">Loading admins…</span>
            </div>
          ) : fetchError ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <div className="flex items-center gap-2 text-destructive">
                <X size={16} />
                <p className="text-sm">{fetchError}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchAdmins}
                className="gap-1.5"
              >
                <RefreshCw size={13} /> Retry
              </Button>
            </div>
          ) : admins.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-sm">
              No admins found.
            </div>
          ) : (
            admins.map((admin) => (
              <AdminCard
                key={admin._id}
                admin={admin}
                isSelf={currentUser?.email === admin.email}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminManagePage;
