import { useState, useEffect, useCallback } from "react";
import { StatsCard } from "@/components/ui/stats-card";
import { SearchInput } from "@/components/ui/search-input";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  X,
  User,
  Trash2,
  Edit2,
  BarChart2,
  Users,
  Loader2,
  RefreshCw,
  CalendarDays,
} from "lucide-react";
import AnalyticsSection from "@/components/Analyticssection";
import { usersAPI, type BackendUser } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

// ── Types ─────────────────────────────────────────────────────────────────────

/** Normalised shape the UI works with */
type Customer = {
  id:          string;
  name:        string;
  username:    string;
  email:       string;
  phone:       string;           // not in User model — shown as "—" until added
  address:     string;           // not in User model — shown as "—" until added
  provider:    string;
  memberSince: string;           // formatted createdAt  (replaces "age")
  rawCreatedAt: string;          // ISO string for analytics date grouping
};

type ActiveView = "analytics" | "customers";

const filterOptions = ["All Customers", "Recent (7 days)", "This Month"];

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day:   "numeric",
    month: "short",
    year:  "numeric",
  });

const isWithinDays = (iso: string, days: number) => {
  const diff = Date.now() - new Date(iso).getTime();
  return diff <= days * 24 * 60 * 60 * 1000;
};

const toCustomer = (u: BackendUser): Customer => ({
  id:           u._id,
  name:         u.name ?? u.username ?? "—",
  username:     u.username ?? "—",
  email:        u.email,
  phone:        "—",            // extend the User model to persist phone if needed
  address:      "—",            // extend the User model to persist address if needed
  provider:     u.provider ?? "local",
  memberSince:  formatDate(u.createdAt),
  rawCreatedAt: u.createdAt,
});

// ── View Toggle ───────────────────────────────────────────────────────────────

const ViewToggle = ({
  active,
  onChange,
}: {
  active: ActiveView;
  onChange: (v: ActiveView) => void;
}) => (
  <div className="flex items-center bg-secondary rounded-lg p-0.5 gap-0.5">
    {(
      [
        { key: "analytics", label: "Analytics", icon: <BarChart2 size={13} /> },
        { key: "customers", label: "Customers",  icon: <Users     size={13} /> },
      ] as { key: ActiveView; label: string; icon: React.ReactNode }[]
    ).map(({ key, label, icon }) => (
      <button
        key={key}
        onClick={() => onChange(key)}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md font-medium transition-all ${
          active === key
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        {icon}
        {label}
      </button>
    ))}
  </div>
);

// ── Delete Confirmation Modal ─────────────────────────────────────────────────

const DeleteConfirmModal = ({
  open, name, onConfirm, onCancel,
}: {
  open: boolean; name: string; onConfirm: () => void; onCancel: () => void;
}) => {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="bg-popover text-popover-foreground rounded-2xl w-full max-w-sm shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-destructive/10 flex items-center justify-center">
              <Trash2 size={16} className="text-destructive" />
            </div>
            <p className="text-sm font-semibold text-foreground">Delete Customer</p>
          </div>
          <button onClick={onCancel} className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-secondary">
            <X size={16} />
          </button>
        </div>
        <div className="px-6 py-5">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">{name}</span>? This action cannot be undone.
          </p>
        </div>
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border">
          <Button variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
          <Button size="sm" onClick={onConfirm} className="bg-destructive text-destructive-foreground hover:opacity-90 gap-1.5">
            <Trash2 size={14} /> Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

// ── Edit Customer Modal ───────────────────────────────────────────────────────
// Note: the User model only has username, email, name. Phone/address are shown
// as read-only "—" until you add those fields to the backend User schema.

const EditCustomerModal = ({
  open, customer, onClose, onSave,
}: {
  open: boolean;
  customer: Customer | null;
  onClose: () => void;
  onSave: (updated: Customer) => void;
}) => {
  const [form,        setForm]        = useState({ name: "", email: "" });
  const [errors,      setErrors]      = useState<Partial<typeof form>>({});
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (customer) setForm({ name: customer.name, email: customer.email });
  }, [customer]);

  if (!open || !customer) return null;

  const validate = () => {
    const e: Partial<typeof form> = {};
    if (!form.name.trim())                         e.name  = "Name is required";
    if (!form.email.trim() || !form.email.includes("@")) e.email = "Enter a valid email";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    onSave({ ...customer, name: form.name.trim(), email: form.email.trim() });
    setSaveSuccess(true);
    setTimeout(() => { setSaveSuccess(false); setErrors({}); onClose(); }, 1200);
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-popover text-popover-foreground rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
              <User size={16} className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Edit customer</p>
              <p className="text-xs text-muted-foreground">Update the details below</p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-secondary">
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Name */}
          <div>
            <label className="text-xs text-muted-foreground block mb-1">
              Full name <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => { setForm({ ...form, name: e.target.value }); setErrors({ ...errors, name: undefined }); }}
              placeholder="e.g. Jenny Wilson"
              className={`w-full bg-secondary text-foreground rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary ${errors.name ? "ring-2 ring-destructive" : ""}`}
            />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="text-xs text-muted-foreground block mb-1">
              Email address <span className="text-destructive">*</span>
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => { setForm({ ...form, email: e.target.value }); setErrors({ ...errors, email: undefined }); }}
              placeholder="e.g. jenny@email.com"
              className={`w-full bg-secondary text-foreground rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary ${errors.email ? "ring-2 ring-destructive" : ""}`}
            />
            {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
          </div>

          {/* Read-only info */}
          <div className="p-3 bg-secondary/50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Auth provider</p>
            <p className="text-sm text-foreground capitalize">{customer.provider}</p>
          </div>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-border">
          <p className="text-xs text-muted-foreground">Fields marked <span className="text-destructive">*</span> are required</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
            <Button
              size="sm"
              onClick={handleSubmit}
              className={`gap-1.5 transition-colors ${saveSuccess ? "bg-green-500 hover:bg-green-500 text-white" : ""}`}
            >
              <Edit2 size={14} />
              {saveSuccess ? "Saved!" : "Save changes"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Customer Detail Modal ─────────────────────────────────────────────────────

const CustomerDetailModal = ({
  customer, open, onClose, onEdit, onDelete,
}: {
  customer: Customer | null; open: boolean;
  onClose: () => void; onEdit: (c: Customer) => void; onDelete: (c: Customer) => void;
}) => {
  if (!open || !customer) return null;

  const initials = customer.name
    .split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const Row = ({ label, value }: { label: string; value: string }) => (
    <div>
      <label className="text-xs text-muted-foreground block mb-1">{label}</label>
      <div className="bg-secondary rounded-lg p-3 text-sm text-foreground">{value}</div>
    </div>
  );

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-popover text-popover-foreground rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
              {initials}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{customer.name}</p>
              <p className="text-xs text-muted-foreground">{customer.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-secondary">
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Row label="Username"    value={customer.username} />
            <Row label="Member Since" value={customer.memberSince} />
          </div>
          <Row label="Email address"  value={customer.email} />
          <Row label="Auth provider"  value={customer.provider} />
          {customer.phone    !== "—" && <Row label="Phone number" value={customer.phone} />}
          {customer.address  !== "—" && <Row label="Address"      value={customer.address} />}
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-border">
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
            onClick={() => { onClose(); onDelete(customer); }}
          >
            <Trash2 size={14} /> Delete
          </Button>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="gap-1.5"
              onClick={() => { onClose(); onEdit(customer); }}>
              <Edit2 size={14} /> Edit
            </Button>
            <Button size="sm" onClick={onClose} className="bg-primary text-primary-foreground hover:opacity-90">
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────

const CustomersPage = () => {
  const [customers,  setCustomers]  = useState<Customer[]>([]);
  const [isLoading,  setIsLoading]  = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter,     setFilter]     = useState("All Customers");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [activeView, setActiveView] = useState<ActiveView>("analytics");

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [editingCustomer,  setEditingCustomer]  = useState<Customer | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);

  const { toast } = useToast();

  // ── Fetch real users from backend ──────────────────────────────────────────
  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const users = await usersAPI.getAll();
      // Exclude admin accounts from the customers view
      setCustomers(
        users
          .filter((u) => u.role === "user")
          .map(toCustomer)
      );
    } catch (err: any) {
      setFetchError(
        err?.response?.data?.error ??
        err?.response?.data?.message ??
        "Failed to load customers. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleConfirmDelete = async () => {
    if (!deletingCustomer) return;
    try {
      await usersAPI.deleteUser(deletingCustomer.id);
      setCustomers((prev) => prev.filter((c) => c.id !== deletingCustomer.id));
      if (selectedCustomer?.id === deletingCustomer.id) setSelectedCustomer(null);
      toast({ title: "Customer deleted", description: `${deletingCustomer.name} has been removed.` });
    } catch (err: any) {
      toast({
        title:       "Delete failed",
        description: err?.response?.data?.error ?? "Could not delete this customer.",
        variant:     "destructive",
      });
    } finally {
      setDeletingCustomer(null);
    }
  };

  // ── Edit (local-only until a PATCH /users/:id endpoint is added) ───────────
  const handleSaveEdit = (updated: Customer) => {
    setCustomers((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    setEditingCustomer(null);
    toast({ title: "Customer updated", description: "Changes saved locally." });
  };

  // ── Filter ─────────────────────────────────────────────────────────────────
  const applyFilter = (list: Customer[]) => {
    if (filter === "Recent (7 days)")  return list.filter((c) => isWithinDays(c.rawCreatedAt, 7));
    if (filter === "This Month") {
      const now  = new Date();
      return list.filter((c) => {
        const d = new Date(c.rawCreatedAt);
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
      });
    }
    return list;
  };

  const filteredCustomers = applyFilter(
    customers.filter((c) => {
      const q = searchTerm.toLowerCase();
      return (
        c.name.toLowerCase().includes(q)  ||
        c.email.toLowerCase().includes(q) ||
        c.username.toLowerCase().includes(q)
      );
    })
  );

  // ── Derived stats ──────────────────────────────────────────────────────────
  const newThisWeek  = customers.filter((c) => isWithinDays(c.rawCreatedAt, 7)).length;
  const newThisMonth = customers.filter((c) => {
    const now = new Date();
    const d   = new Date(c.rawCreatedAt);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }).length;

  // ── Raw BackendUser list for analytics ────────────────────────────────────
  // We pass through the rawCreatedAt dates so AnalyticsSection can build
  // its own time-series without needing a separate fetch.
  const rawCreatedDates = customers.map((c) => c.rawCreatedAt);

  // ── Loading / Error states ─────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32 gap-3 text-muted-foreground">
        <Loader2 size={20} className="animate-spin" />
        <span className="text-sm">Loading customers…</span>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <p className="text-sm text-destructive">{fetchError}</p>
        <Button variant="outline" onClick={fetchCustomers} className="gap-2">
          <RefreshCw size={14} /> Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="admin-theme" onClick={() => setShowFilterDropdown(false)}>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatsCard
          title="Total Customers"
          value={String(customers.length)}
          subtitle="Registered users"
          variant="primary"
        />
        <StatsCard
          title="New This Month"
          value={String(newThisMonth)}
          subtitle="Joined in the last 30 days"
          variant="success"
        />
        <StatsCard
          title="New This Week"
          value={String(newThisWeek)}
          subtitle="Joined in the last 7 days"
          variant="success"
        />
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-5">
        {/* Filter — only in customers view */}
        <div>
          {activeView === "customers" && (
            <div>
              <span className="text-xs text-muted-foreground block mb-1">Filter</span>
              <div className="relative inline-block">
                <button
                  onClick={(e) => { e.stopPropagation(); setShowFilterDropdown(!showFilterDropdown); }}
                  className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground rounded-lg px-3 py-2"
                >
                  <span className="text-sm">{filter}</span>
                  <ChevronDown size={14} className="text-muted-foreground" />
                </button>
                {showFilterDropdown && (
                  <div
                    className="absolute top-full left-0 bg-popover border border-border rounded-lg mt-1 shadow-lg z-10 min-w-[170px]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {filterOptions.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => { setFilter(opt); setShowFilterDropdown(false); }}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-secondary/70 ${filter === opt ? "text-primary font-medium" : "text-popover-foreground"}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Search + toggle */}
        <div className="flex items-center gap-3">
          {activeView === "customers" && (
            <SearchInput
              placeholder="Search name, email or username"
              value={searchTerm}
              onChange={setSearchTerm}
              className="w-72"
            />
          )}
          <ViewToggle active={activeView} onChange={setActiveView} />
        </div>
      </div>

      {/* Content */}
      {activeView === "analytics" ? (
        <AnalyticsSection
          totalCustomers={customers.length}
          customerCreatedDates={rawCreatedDates}
        />
      ) : (
        <div className="bg-card rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {["Name", "Username", "Email", "Member Since", "Provider", "Actions"].map((h) => (
                  <th key={h} className="text-left p-4 text-muted-foreground font-medium text-sm">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground text-sm">
                    No customers match your search.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="border-b border-border hover:bg-secondary/50 transition-colors"
                  >
                    <td className="p-4 text-foreground text-sm font-medium cursor-pointer"
                      onClick={() => setSelectedCustomer(customer)}>
                      {customer.name}
                    </td>
                    <td className="p-4 text-muted-foreground text-sm cursor-pointer"
                      onClick={() => setSelectedCustomer(customer)}>
                      @{customer.username}
                    </td>
                    <td className="p-4 text-muted-foreground text-sm cursor-pointer"
                      onClick={() => setSelectedCustomer(customer)}>
                      {customer.email}
                    </td>
                    {/* Member Since — replaces Age */}
                    <td className="p-4 text-sm cursor-pointer"
                      onClick={() => setSelectedCustomer(customer)}>
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <CalendarDays size={13} className="text-primary/60" />
                        {customer.memberSince}
                      </span>
                    </td>
                    <td className="p-4 text-sm cursor-pointer"
                      onClick={() => setSelectedCustomer(customer)}>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${
                        customer.provider === "google"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-secondary text-muted-foreground"
                      }`}>
                        {customer.provider}
                      </span>
                    </td>
                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingCustomer(customer)}
                          className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                          title="Edit customer"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => setDeletingCustomer(customer)}
                          className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          title="Delete customer"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      <CustomerDetailModal
        key={selectedCustomer?.id}
        customer={selectedCustomer}
        open={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        onEdit={(c) => setEditingCustomer(c)}
        onDelete={(c) => setDeletingCustomer(c)}
      />
      <EditCustomerModal
        key={editingCustomer?.id ? `edit-${editingCustomer.id}` : "edit-none"}
        open={!!editingCustomer}
        customer={editingCustomer}
        onClose={() => setEditingCustomer(null)}
        onSave={handleSaveEdit}
      />
      <DeleteConfirmModal
        open={!!deletingCustomer}
        name={deletingCustomer?.name || ""}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingCustomer(null)}
      />
    </div>
  );
};

export default CustomersPage;