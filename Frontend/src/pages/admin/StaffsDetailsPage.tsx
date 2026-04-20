import { useState } from "react";
import { staffData } from "@/pages/admin/data/mockData";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Switch } from "@/components/ui/switch";

type PermissionCategory = keyof typeof staffData.permissions;

const StaffsPage = () => {
  const [permissions, setPermissions] = useState(staffData.permissions);

  const togglePermission = <T extends PermissionCategory>(
    category: T,
    permission: keyof typeof staffData.permissions[T]
  ) => {
    setPermissions((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [permission]: !prev[category][permission],
      },
    }));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Staff Management</h1>
        <Button className="gap-1">
          <Plus size={16} />
          Save changes
        </Button>
      </div>

      {/* Staff Details */}
      <div className="bg-card rounded-lg p-6 mb-6">
        <h2 className="text-lg font-medium text-foreground mb-4">Staff Details</h2>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground text-sm">Full Name</span>
            <span className="text-foreground text-sm">{staffData.fullName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground text-sm">Email Address</span>
            <span className="text-foreground text-sm">{staffData.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground text-sm">Phone number</span>
            <span className="text-foreground text-sm">{staffData.phone}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground text-sm">Role</span>
            <span className="text-primary text-sm font-medium">{staffData.role}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground text-sm">Status</span>
            <span className="text-success text-sm">{staffData.status}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground text-sm">Home Address</span>
            <span className="text-foreground text-sm">{staffData.homeAddress}</span>
          </div>
        </div>
      </div>

      {/* Staff Permissions */}
      <div className="bg-card rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-foreground">Staff Permission</h2>
          <span className="text-primary text-sm">Changes Here Affects Operations</span>
        </div>

        <div className="space-y-6">
          {/* Order Permissions */}
          <div>
            <h3 className="text-sm font-medium text-foreground mb-3">Order</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">View Order</span>
                <div className="flex items-center gap-2">
                  <span className={`text-xs ${permissions.order.viewOrder ? 'text-success' : 'text-muted-foreground'}`}>
                    {permissions.order.viewOrder ? 'On' : 'Off'}
                  </span>
                  <Switch
                    checked={permissions.order.viewOrder}
                    onCheckedChange={() => togglePermission('order', 'viewOrder')}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Update Order Status</span>
                <div className="flex items-center gap-2">
                  <span className={`text-xs ${permissions.order.updateOrderStatus ? 'text-success' : 'text-muted-foreground'}`}>
                    {permissions.order.updateOrderStatus ? 'On' : 'Off'}
                  </span>
                  <Switch
                    checked={permissions.order.updateOrderStatus}
                    onCheckedChange={() => togglePermission('order', 'updateOrderStatus')}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Add Internal notes</span>
                <div className="flex items-center gap-2">
                  <span className={`text-xs ${permissions.order.addInternalNotes ? 'text-success' : 'text-muted-foreground'}`}>
                    {permissions.order.addInternalNotes ? 'On' : 'Off'}
                  </span>
                  <Switch
                    checked={permissions.order.addInternalNotes}
                    onCheckedChange={() => togglePermission('order', 'addInternalNotes')}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Payments Permissions */}
          <div>
            <h3 className="text-sm font-medium text-foreground mb-3">Payments</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Contact Customers</span>
                <div className="flex items-center gap-2">
                  <span className={`text-xs ${permissions.payments.contactCustomers ? 'text-success' : 'text-muted-foreground'}`}>
                    {permissions.payments.contactCustomers ? 'On' : 'Off'}
                  </span>
                  <Switch
                    checked={permissions.payments.contactCustomers}
                    onCheckedChange={() => togglePermission('payments', 'contactCustomers')}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Permissions */}
          <div>
            <h3 className="text-sm font-medium text-foreground mb-3">Delivery</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Confirm Delivery</span>
                <div className="flex items-center gap-2">
                  <span className={`text-xs ${permissions.delivery.confirmDelivery ? 'text-success' : 'text-muted-foreground'}`}>
                    {permissions.delivery.confirmDelivery ? 'On' : 'Off'}
                  </span>
                  <Switch
                    checked={permissions.delivery.confirmDelivery}
                    onCheckedChange={() => togglePermission('delivery', 'confirmDelivery')}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Products Permissions */}
          <div>
            <h3 className="text-sm font-medium text-foreground mb-3">Products</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Confirm Payment status</span>
                <div className="flex items-center gap-2">
                  <span className={`text-xs ${permissions.products.confirmPaymentStatus ? 'text-success' : 'text-muted-foreground'}`}>
                    {permissions.products.confirmPaymentStatus ? 'On' : 'Off'}
                  </span>
                  <Switch
                    checked={permissions.products.confirmPaymentStatus}
                    onCheckedChange={() => togglePermission('products', 'confirmPaymentStatus')}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffsPage;