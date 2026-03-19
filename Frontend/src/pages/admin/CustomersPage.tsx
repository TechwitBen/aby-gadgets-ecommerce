import { useState } from "react";
import { customersData } from "@/pages/admin/data/mockData";
import { StatsCard } from "@/components/ui/stats-card";
import { SearchInput } from "@/components/ui/search-input";
import { Button } from "@/components/ui/button";
import { Plus, ChevronDown } from "lucide-react";

const CustomersPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("All Customers");

  return (
    <div className="admin-theme">
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatsCard 
          title="Total Customers" 
          value="43" 
          subtitle="something good"
          variant="primary" 
        />
        <StatsCard 
          title="Active Customers" 
          value="10" 
          subtitle="something good"
          variant="success" 
        />
        <StatsCard 
          title="New Customers" 
          value="20" 
          subtitle="This week"
          variant="success" 
        />
      </div>

      {/* Filters and Search */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="text-xs text-muted-foreground block mb-1">Filter</span>
          <div className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground rounded-lg px-3 py-2">
            <span className="text-sm">{filter}</span>
            <ChevronDown size={14} className="text-muted-foreground" />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <SearchInput
            placeholder="Quick search"
            value={searchTerm}
            onChange={setSearchTerm}
            className="w-64"
          />
          <Button className="gap-1 bg-primary text-primary-foreground hover:opacity-90">
            <Plus size={16} />
            New Customer
          </Button>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-card rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-4 text-muted-foreground font-medium text-sm">Name</th>
              <th className="text-left p-4 text-muted-foreground font-medium text-sm">Last Visit</th>
              <th className="text-left p-4 text-muted-foreground font-medium text-sm">Phone Number</th>
              <th className="text-left p-4 text-muted-foreground font-medium text-sm">Age</th>
              <th className="text-left p-4 text-muted-foreground font-medium text-sm">Email</th>
            </tr>
          </thead>
          <tbody>
            {customersData.map((customer) => (
              <tr
                key={customer.id}
                className="border-b border-border hover:bg-secondary/50 cursor-pointer transition-colors"
              >
                <td className="p-4 text-foreground text-sm">{customer.name}</td>
                <td className="p-4 text-muted-foreground text-sm">{customer.lastVisit}</td>
                <td className="p-4 text-muted-foreground text-sm">{customer.phone}</td>
                <td className="p-4 text-muted-foreground text-sm">{customer.age}</td>
                <td className="p-4 text-muted-foreground text-sm">{customer.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomersPage;
