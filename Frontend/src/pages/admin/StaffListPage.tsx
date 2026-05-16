import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { staffService, type StaffMember } from "@/services/staff.service";
import { Button } from "@/components/ui/button";
import { UserPlus, ChevronRight, Loader2, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useInView, fadeUp } from "@/hooks/useInView";

const roleColor = (role: string) => {
  const map: Record<string, string> = {
    "Order Manager": "bg-blue-500/10 text-blue-400",
    "Delivery Staff": "bg-purple-500/10 text-purple-400",
    "Customer Support": "bg-amber-500/10 text-amber-400",
    Staff: "bg-secondary text-muted-foreground",
  };
  return map[role] ?? "bg-secondary text-muted-foreground";
};

const StaffListPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // 🎬 Page entrance animation
  const { ref: pageRef, isInView: pageInView } = useInView({
    once: true,
    threshold: 0,
  });

  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await staffService.getAll();
      setStaff(Array.isArray(data) ? data : []);
    } catch {
      setError("Failed to load staff. Please try again.");
      toast({ variant: "destructive", title: "Error", description: "Failed to load staff." });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center py-32 gap-3 text-muted-foreground">
        <Loader2 size={24} className="animate-spin text-primary" />
        <span className="text-sm">Loading staff…</span>
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <p className="text-sm text-destructive">{error}</p>
        <Button variant="outline" onClick={fetchStaff} className="gap-2">
          <RefreshCw size={14} /> Retry
        </Button>
      </div>
    );

  return (
    <div ref={pageRef} className={fadeUp(pageInView)}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Staff</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {staff.length} team members
          </p>
        </div>
        <Button
          className="gap-1.5"
          onClick={() => navigate("/admin/staffs/add")}
        >
          <UserPlus size={16} />
          Add Staff
        </Button>
      </div>

      <div className="space-y-3">
        {staff.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground text-sm">
            No staff members yet. Add one to get started.
          </div>
        ) : (
          staff.map((member) => (
            <button
              key={member._id}
              onClick={() => navigate(`/admin/staffs/${member._id}`)}
              className="w-full bg-card rounded-lg p-4 flex items-center justify-between gap-4 hover:bg-secondary/50 transition-colors text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-semibold text-sm">
                    {(member.name || member.username)
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-foreground text-sm font-medium">
                    {member.name || member.username}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {member.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <span
                  className={`hidden sm:inline-block text-xs px-2.5 py-1 rounded-full font-medium ${
                    member.staffStatus === "inactive"
                      ? "bg-red-500/10 text-red-400"
                      : "bg-green-500/10 text-green-400"
                  }`}
                >
                  {member.staffStatus === "active" ? "Active" : "Inactive"}
                </span>
                <ChevronRight
                  size={16}
                  className="text-muted-foreground group-hover:text-foreground transition-colors"
                />
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default StaffListPage;