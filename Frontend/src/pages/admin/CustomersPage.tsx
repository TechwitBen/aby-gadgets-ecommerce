import { useState } from "react";
import { customersData as initialCustomers } from "@/pages/admin/data/mockData";
import { StatsCard } from "@/components/ui/stats-card";
import { SearchInput } from "@/components/ui/search-input";
import { Button } from "@/components/ui/button";
import { ChevronDown, X, User, Trash2, Edit2, BarChart2, Users } from "lucide-react";
import AnalyticsSection from "@/components/Analyticssection";

type Customer = {
  id: string;
  name: string;
  lastVisit: string;
  phone: string;
  age: number;
  email: string;
  address?: string;
};

type ActiveView = "analytics" | "customers";

const filterOptions = ["All Customers", "Recent Visitors", "New This Week"];

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
        { key: "customers", label: "Customers", icon: <Users size={13} /> },
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
  open,
  name,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  name: string;
  onConfirm: () => void;
  onCancel: () => void;
}) => {
  if (!open) return null;
  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onCancel();
  };
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={handleBackdrop}>
      <div className="bg-popover text-popover-foreground rounded-2xl w-full max-w-sm shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-destructive/10 flex items-center justify-center">
              <Trash2 size={16} className="text-destructive" />
            </div>
            <p className="text-sm font-semibold text-foreground">Delete Customer</p>
          </div>
          <button onClick={onCancel} className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-secondary">
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
            <Trash2 size={14} />
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

// ── Edit Customer Modal ───────────────────────────────────────────────────────
const EditCustomerModal = ({
  open,
  customer,
  onClose,
  onSave,
}: {
  open: boolean;
  customer: Customer | null;
  onClose: () => void;
  onSave: (updated: Customer) => void;
}) => {
  const [form, setForm] = useState(
    customer
      ? { name: customer.name, age: String(customer.age), email: customer.email, phone: customer.phone, address: customer.address || "" }
      : { name: "", age: "", email: "", phone: "", address: "" }
  );
  const [errors, setErrors] = useState<Partial<typeof form>>({});
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!open || !customer) return null;

  const validate = () => {
    const e: Partial<typeof form> = {};
    if (!form.name.trim()) e.name = "Full name is required";
    if (!form.age.trim() || isNaN(Number(form.age)) || Number(form.age) < 1) e.age = "Enter a valid age";
    if (!form.email.trim() || !form.email.includes("@")) e.email = "Enter a valid email";
    if (!form.phone.trim()) e.phone = "Phone number is required";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    onSave({ ...customer, name: form.name.trim(), age: Number(form.age), email: form.email.trim(), phone: form.phone.trim(), address: form.address.trim() });
    setSaveSuccess(true);
    setTimeout(() => { setSaveSuccess(false); setErrors({}); onClose(); }, 1200);
  };

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const Field = ({ label, field, type = "text", placeholder, optional = false }: { label: string; field: keyof typeof form; type?: string; placeholder?: string; optional?: boolean }) => (
    <div>
      <label className="text-xs text-muted-foreground block mb-1">
        {label}{" "}
        {optional ? <span className="text-xs text-muted-foreground/60">(optional)</span> : <span className="text-destructive">*</span>}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={form[field]}
        onChange={(e) => { setForm({ ...form, [field]: e.target.value }); if (errors[field]) setErrors({ ...errors, [field]: undefined }); }}
        className={`w-full bg-lavender text-lavender-foreground rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground/50 ${errors[field] ? "ring-2 ring-destructive" : ""}`}
      />
      {errors[field] && <p className="text-xs text-destructive mt-1">{errors[field]}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={handleBackdrop}>
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
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-secondary">
            <X size={16} />
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Full name" field="name" placeholder="e.g. Jenny Wilson" />
            <Field label="Age" field="age" type="number" placeholder="e.g. 25" />
          </div>
          <Field label="Email address" field="email" type="email" placeholder="e.g. jenny@email.com" />
          <Field label="Phone number" field="phone" placeholder="e.g. (209) 555-0104" />
          <Field label="Home address" field="address" placeholder="e.g. 14 Bode Thomas Street, Lagos" optional />
        </div>
        <div className="flex items-center justify-between px-6 py-4 border-t border-border">
          <p className="text-xs text-muted-foreground">Fields marked <span className="text-destructive">*</span> are required</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
            <Button size="sm" onClick={handleSubmit} className={`gap-1.5 transition-colors ${saveSuccess ? "bg-green-500 hover:bg-green-500 text-white" : "bg-primary text-primary-foreground hover:opacity-90"}`}>
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
  customer: Customer | null; open: boolean; onClose: () => void; onEdit: (c: Customer) => void; onDelete: (c: Customer) => void;
}) => {
  if (!open || !customer) return null;

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const initials = customer.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const Row = ({ label, value }: { label: string; value: string | number }) => (
    <div>
      <label className="text-xs text-muted-foreground block mb-1">{label}</label>
      <div className="bg-lavender text-lavender-foreground rounded-lg p-3 text-sm">{value}</div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={handleBackdrop}>
      <div className="bg-popover text-popover-foreground rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">{initials}</div>
            <div>
              <p className="text-sm font-semibold text-foreground">{customer.name}</p>
              <p className="text-xs text-muted-foreground">{customer.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-secondary">
            <X size={16} />
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Row label="Phone number" value={customer.phone} />
            <Row label="Age" value={customer.age} />
          </div>
          <Row label="Email address" value={customer.email} />
          <Row label="Last visit" value={customer.lastVisit} />
          {customer.address && <Row label="Address" value={customer.address} />}
        </div>
        <div className="flex items-center justify-between px-6 py-4 border-t border-border">
          <Button size="sm" variant="outline" className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive" onClick={() => { onClose(); onDelete(customer); }}>
            <Trash2 size={14} />
            Delete
          </Button>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="gap-1.5" onClick={() => { onClose(); onEdit(customer); }}>
              <Edit2 size={14} />
              Edit
            </Button>
            <Button size="sm" onClick={onClose} className="bg-primary text-primary-foreground hover:opacity-90">Close</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const CustomersPage = () => {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("All Customers");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [activeView, setActiveView] = useState<ActiveView>("analytics");

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);

  const filteredCustomers = customers.filter((c) => {
    const q = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q)
    );
  });

  const handleSaveEdit = (updated: Customer) => {
    setCustomers((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    setEditingCustomer(null);
  };

  const handleConfirmDelete = () => {
    if (!deletingCustomer) return;
    setCustomers((prev) => prev.filter((c) => c.id !== deletingCustomer.id));
    setDeletingCustomer(null);
  };

  return (
    <div className="admin-theme" onClick={() => setShowFilterDropdown(false)}>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatsCard title="Total Customers" value={String(customers.length)} subtitle="something good" variant="primary" />
        <StatsCard title="Active Customers" value={String(customers.length)} subtitle="something good" variant="success" />
        <StatsCard title="New Customers" value="20" subtitle="This week" variant="success" />
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-5">

        {/* Left: Filter — only visible in customers view */}
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
                    className="absolute top-full left-0 bg-popover border border-border rounded-lg mt-1 shadow-lg z-10 min-w-[160px]"
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

        {/* Right: Search + View Toggle */}
        <div className="flex items-center gap-3">
          {activeView === "customers" && (
            <SearchInput
              placeholder="Quick search"
              value={searchTerm}
              onChange={setSearchTerm}
              className="w-64"
            />
          )}
          <ViewToggle active={activeView} onChange={setActiveView} />
        </div>

      </div>

      {/* Content — toggled between analytics and table */}
      {activeView === "analytics" ? (
        <AnalyticsSection totalCustomers={customers.length} />
      ) : (
        <div className="bg-card rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 text-muted-foreground font-medium text-sm">Name</th>
                <th className="text-left p-4 text-muted-foreground font-medium text-sm">Last Visit</th>
                <th className="text-left p-4 text-muted-foreground font-medium text-sm">Phone Number</th>
                <th className="text-left p-4 text-muted-foreground font-medium text-sm">Age</th>
                <th className="text-left p-4 text-muted-foreground font-medium text-sm">Email</th>
                <th className="text-left p-4 text-muted-foreground font-medium text-sm">Actions</th>
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
                  <tr key={customer.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                    <td className="p-4 text-foreground text-sm cursor-pointer"       onClick={() => setSelectedCustomer(customer)}>{customer.name}</td>
                    <td className="p-4 text-muted-foreground text-sm cursor-pointer" onClick={() => setSelectedCustomer(customer)}>{customer.lastVisit}</td>
                    <td className="p-4 text-muted-foreground text-sm cursor-pointer" onClick={() => setSelectedCustomer(customer)}>{customer.phone}</td>
                    <td className="p-4 text-muted-foreground text-sm cursor-pointer" onClick={() => setSelectedCustomer(customer)}>{customer.age}</td>
                    <td className="p-4 text-muted-foreground text-sm cursor-pointer" onClick={() => setSelectedCustomer(customer)}>{customer.email}</td>
                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setEditingCustomer(customer)} className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors" title="Edit customer">
                          <Edit2 size={15} />
                        </button>
                        <button onClick={() => setDeletingCustomer(customer)} className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" title="Delete customer">
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

      {/* Modals — untouched */}
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