import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  staffService,
  type StaffMember,
  type StaffPermissions,
  DEFAULT_PERMISSIONS,
} from "@/services/Staff.service";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save, Loader2, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type PermissionCategory = keyof StaffPermissions;

// One reusable toggle row
const PermissionRow = ({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) => (
  <div className="flex items-center justify-between">
    <span className="text-muted-foreground text-sm">{label}</span>
    <div className="flex items-center gap-2">
      <span
        className={`text-xs ${checked ? "text-green-400" : "text-muted-foreground"}`}
      >
        {checked ? "On" : "Off"}
      </span>
      <Switch checked={checked} onCheckedChange={onToggle} />
    </div>
  </div>
);

const StaffDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [staff, setStaff] = useState<StaffMember | null>(null);
  const [permissions, setPermissions] =
    useState<StaffPermissions>(DEFAULT_PERMISSIONS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!id) return;
    staffService
      .getById(id)
      .then((data) => {
        setStaff(data);
        setPermissions(data.staffPermissions ?? DEFAULT_PERMISSIONS);
      })
      .catch(() =>
        toast({
          variant: "destructive",
          title: "Could not load staff member.",
        }),
      )
      .finally(() => setIsLoading(false));
  }, [id]);

  const toggle = <T extends PermissionCategory>(
    category: T,
    permission: keyof StaffPermissions[T],
  ) => {
    setPermissions((prev) => {
      const section = prev[category];
      if (typeof section === "boolean") {
        return { ...prev, [category]: !section };
      }
      return {
        ...prev,
        [category]: {
          ...(section as object),
          [permission]: !(section as Record<string, boolean>)[
            permission as string
          ],
        },
      };
    });
  };

  const handleSave = async () => {
    if (!id) return;
    setIsSaving(true);
    try {
      await staffService.updatePermissions(id, permissions);
      toast({
        title: "Permissions Saved",
        description: "Changes applied successfully.",
      });
    } catch {
      toast({ variant: "destructive", title: "Failed to save permissions." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!staff || !id) return;
    const next = staff.staffStatus === "active" ? "inactive" : "active";
    setIsTogglingStatus(true);
    try {
      await staffService.updateStatus(id, next);
      setStaff((prev) => (prev ? { ...prev, staffStatus: next } : prev));
      toast({
        title: `Staff ${next === "active" ? "Activated" : "Deactivated"}`,
      });
    } catch {
      toast({ variant: "destructive", title: "Failed to update status." });
    } finally {
      setIsTogglingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    setIsDeleting(true);
    try {
      await staffService.delete(id);
      toast({ title: "Staff Deleted" });
      navigate("/admin/staffs");
    } catch {
      toast({
        variant: "destructive",
        title: "Failed to delete staff member.",
      });
      setIsDeleting(false);
    }
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center py-32 gap-3 text-muted-foreground">
        <Loader2 size={24} className="animate-spin text-primary" />
      </div>
    );

  if (!staff)
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-muted-foreground">Staff member not found.</p>
        <Button variant="outline" onClick={() => navigate("/admin/staffs")}>
          Back to Staff List
        </Button>
      </div>
    );

  const p = permissions;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/admin/staffs")}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-2xl font-semibold text-foreground">
            Staff Details
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash2 size={14} /> Delete
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="gap-1.5">
            {isSaving ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Save size={15} />
            )}
            {isSaving ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Delete confirm */}
      {showDeleteConfirm && (
        <div className="mb-4 bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-center justify-between gap-4 flex-wrap">
          <p className="text-sm text-destructive">
            Are you sure you want to delete <strong>{staff.name}</strong>? This
            cannot be undone.
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-white hover:bg-destructive/90 gap-1.5"
            >
              {isDeleting && <Loader2 size={13} className="animate-spin" />}
              Confirm Delete
            </Button>
          </div>
        </div>
      )}

      {/* Staff Details */}
      <div className="bg-card rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-foreground">Staff Details</h2>
          {/* Active / Inactive toggle */}
          <button
            onClick={handleToggleStatus}
            disabled={isTogglingStatus}
            className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
              staff.staffStatus === "active"
                ? "bg-green-500/10 text-green-400 hover:bg-red-500/10 hover:text-red-400"
                : "bg-red-500/10 text-red-400 hover:bg-green-500/10 hover:text-green-400"
            }`}
          >
            {isTogglingStatus
              ? "…"
              : staff.staffStatus === "active"
                ? "Active — click to deactivate"
                : "Inactive — click to activate"}
          </button>
        </div>

        <div className="space-y-3">
          {[
            ["Full Name", staff.name || staff.username],
            ["Username", `@${staff.username}`],
            ["Email Address", staff.email],
            ["Phone Number", staff.phone || "—"],
            ["Home Address", staff.homeAddress || "—"],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between">
              <span className="text-muted-foreground text-sm">{label}</span>
              <span className="text-foreground text-sm text-right max-w-[60%]">
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Permissions */}
      <div className="bg-card rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-foreground">
            Staff Permissions
          </h2>
          <span className="text-primary text-sm">
            Changes Here Affect Operations
          </span>
        </div>

        <div className="space-y-6">
          {/* Orders */}
          <div>
            <h3 className="text-sm font-medium text-foreground mb-3">Orders</h3>
            <div className="space-y-3">
              <PermissionRow
                label="View Orders"
                checked={p.order.viewOrder}
                onToggle={() => toggle("order", "viewOrder")}
              />
              <PermissionRow
                label="Update Order Status"
                checked={p.order.updateOrderStatus}
                onToggle={() => toggle("order", "updateOrderStatus")}
              />
              <PermissionRow
                label="Add Internal Notes"
                checked={p.order.addInternalNotes}
                onToggle={() => toggle("order", "addInternalNotes")}
              />
            </div>
          </div>

          {/* Payments */}
          <div>
            <h3 className="text-sm font-medium text-foreground mb-3">
              Payments
            </h3>
            <div className="space-y-3">
              <PermissionRow
                label="Contact Customers"
                checked={p.payments.contactCustomers}
                onToggle={() => toggle("payments", "contactCustomers")}
              />
              <PermissionRow
                label="Confirm Payment Status"
                checked={p.confirmPaymentStatus as boolean}
                onToggle={() =>
                  toggle(
                    "confirmPaymentStatus",
                    "confirmPaymentStatus" as never,
                  )
                }
              />
            </div>
          </div>

          {/* Delivery */}
          <div>
            <h3 className="text-sm font-medium text-foreground mb-3">
              Delivery
            </h3>
            <div className="space-y-3">
              <PermissionRow
                label="Confirm Delivery"
                checked={p.delivery.confirmDelivery}
                onToggle={() => toggle("delivery", "confirmDelivery")}
              />
            </div>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-sm font-medium text-foreground mb-3">
              Products
            </h3>
            <div className="space-y-3">
              <PermissionRow
                label="View Products"
                checked={p.products.viewProducts}
                onToggle={() => toggle("products", "viewProducts")}
              />
              <PermissionRow
                label="Add Products"
                checked={p.products.addProducts}
                onToggle={() => toggle("products", "addProducts")}
              />
              <PermissionRow
                label="Edit Products"
                checked={p.products.editProducts}
                onToggle={() => toggle("products", "editProducts")}
              />
              <PermissionRow
                label="Delete Products"
                checked={p.products.deleteProducts}
                onToggle={() => toggle("products", "deleteProducts")}
              />
            </div>
          </div>

          {/* Customers */}
          <div>
            <h3 className="text-sm font-medium text-foreground mb-3">
              Customers
            </h3>
            <div className="space-y-3">
              <PermissionRow
                label="View Customers"
                checked={p.customers.viewCustomers}
                onToggle={() => toggle("customers", "viewCustomers")}
              />
              <PermissionRow
                label="View Contact Info"
                checked={p.customers.viewContactInfo}
                onToggle={() => toggle("customers", "viewContactInfo")}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDetailsPage;
