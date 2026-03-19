import { useState } from "react";
import { ordersData } from "@/pages/admin/data/mockData";
import { SearchInput } from "@/components/ui/search-input";
import { OrderDetailModal } from "@/pages/admin/components/orders/OrderDetailModal";

const OrdersPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<typeof ordersData[0] | null>(null);

  const filteredOrders = ordersData.filter(
    (order) =>
      order.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-theme">
      {/* Welcome Section */}
      <div className="flex items-center justify-between mb-8 bg-card rounded-xl p-6">
        <div>
          <p className="text-muted-foreground text-lg">Welcome,</p>
          <h1 className="text-primary text-2xl font-semibold">Egoh Abraham</h1>
          <p className="text-muted-foreground text-sm mt-1">
            It's okay to take breaks but never stop pushing
          </p>
        </div>
        <div className="w-32 h-24 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center">
          <div className="text-4xl">🛍️</div>
        </div>
      </div>

      {/* Orders Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Orders</h2>
            <p className="text-muted-foreground text-sm">Manage and track customer orders</p>
          </div>
          <SearchInput
            placeholder="Hinted search text"
            value={searchTerm}
            onChange={setSearchTerm}
            className="w-72"
            showMenuIcon={false}
          />
        </div>

        {/* Orders Table */}
        <div className="bg-card rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 text-muted-foreground font-medium text-sm">Order ID</th>
                <th className="text-left p-4 text-muted-foreground font-medium text-sm">Name</th>
                <th className="text-left p-4 text-muted-foreground font-medium text-sm">Phone number</th>
                <th className="text-left p-4 text-muted-foreground font-medium text-sm">Address</th>
                <th className="text-left p-4 text-muted-foreground font-medium text-sm">Email</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className="border-b border-border hover:bg-secondary/50 cursor-pointer transition-colors"
                >
                  <td className="p-4 text-primary text-sm">{order.id}</td>
                  <td className="p-4 text-foreground text-sm">{order.name}</td>
                  <td className="p-4 text-muted-foreground text-sm">{order.phone}</td>
                  <td className="p-4 text-muted-foreground text-sm max-w-xs truncate">{order.address}</td>
                  <td className="p-4 text-muted-foreground text-sm">{order.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        open={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  );
};

export default OrdersPage;
