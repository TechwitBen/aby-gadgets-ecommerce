import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  inviteAPI,
  DEFAULT_PERMISSIONS,
  type StaffPermissions,
} from "@/services/staff.service";

import axios from "axios";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Loader2, Send, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Reuse the same permission row from StaffDetailsPage
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
        className={`text-xs ${
          checked ? "text-green-400" : "text-muted-foreground"
        }`}
      >
        {checked ? "On" : "Off"}
      </span>
      <Switch checked={checked} onCheckedChange={onToggle} />
    </div>
  </div>
);

type PermissionCategory = keyof StaffPermissions;

const AddStaffPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [permissions, setPermissions] =
    useState<StaffPermissions>(DEFAULT_PERMISSIONS);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [sentTo, setSentTo] = useState("");

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

  // FIX: separate toggle for confirmPaymentStatus
  const toggleConfirmPayment = () => {
    setPermissions((prev) => ({
      ...prev,
      confirmPaymentStatus: !prev.confirmPaymentStatus,
    }));
  };

  const handleSend = async () => {
    if (!email.trim() || !email.includes("@")) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    setEmailError("");
    setIsSubmitting(true);

    try {
      await inviteAPI.inviteStaff({
        email: email.trim(),
        staffPermissions: permissions,
      });

      setSentTo(email.trim());
      setSent(true);

      toast({
        title: "Invite Sent!",
        description: `An invite email has been sent to ${email}.`,
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Failed to send invite",
        description: err.response?.data?.error || "Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Success screen ────────────────────────────────────────
  if (sent) {
    return (
      <div className="max-w-md mx-auto pt-12 text-center">
        <CheckCircle size={56} className="text-green-400 mx-auto mb-4" />

        <h2 className="text-xl font-semibold text-foreground mb-2">
          Invite Sent!
        </h2>

        <p className="text-muted-foreground text-sm mb-6">
          An invitation email has been sent to{" "}
          <span className="font-medium text-foreground">{sentTo}</span>. They'll
          use the link to set their own password and activate their account.
        </p>

        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            onClick={() => {
              setSent(false);
              setEmail("");
            }}
          >
            Invite Another
          </Button>

          <Button onClick={() => navigate("/admin/staffs")}>
            Back to Staff List
          </Button>
        </div>
      </div>
    );
  }

  const p = permissions;

  return (
    <div className="max-w-xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate("/admin/staffs")}
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <ArrowLeft size={18} />
        </button>

        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Invite Staff Member
          </h1>

          <p className="text-muted-foreground text-sm mt-0.5">
            They'll receive an email to set their own password.
          </p>
        </div>
      </div>

      {/* Email input */}
      <div className="bg-card rounded-lg p-6 mb-4">
        <h2 className="text-base font-medium text-foreground mb-4">
          Staff Email
        </h2>

        <div>
          <label className="text-sm text-muted-foreground block mb-1.5">
            Email Address <span className="text-destructive">*</span>
          </label>

          <input
            type="email"
            placeholder="e.g. amara@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailError("");
            }}
            className={`w-full border rounded-lg px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition ${
              emailError
                ? "border-destructive ring-1 ring-destructive"
                : "border-border"
            }`}
          />

          {emailError && (
            <p className="text-xs text-destructive mt-1">{emailError}</p>
          )}

          <p className="text-xs text-muted-foreground mt-2">
            An invite link will be sent here. It expires after 48 hours.
          </p>
        </div>
      </div>

      {/* Pre-set permissions */}
      <div className="bg-card rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-medium text-foreground">
              Set Permissions
            </h2>

            <p className="text-xs text-muted-foreground mt-0.5">
              These will be active when the staff member accepts. You can change
              them anytime from their profile.
            </p>
          </div>
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
                checked={p.confirmPaymentStatus}
                onToggle={toggleConfirmPayment}
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

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <Button variant="outline" onClick={() => navigate("/admin/staffs")}>
          Cancel
        </Button>

        <Button
          onClick={handleSend}
          disabled={isSubmitting}
          className="gap-1.5"
        >
          {isSubmitting ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Send size={15} />
          )}

          {isSubmitting ? "Sending…" : "Send Invite"}
        </Button>
      </div>
    </div>
  );
};

export default AddStaffPage;