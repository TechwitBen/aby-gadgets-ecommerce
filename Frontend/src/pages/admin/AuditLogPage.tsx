import { useState, useEffect, useCallback } from "react";
import { auditService, getActionLabel, type AuditLog } from "@/services/auditLog.service";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, Activity } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const actionColors: Record<string, string> = {
  UPDATE_ORDER_STATUS:      "bg-blue-500/10 text-blue-400",
  UPDATE_PAYMENT_STATUS:    "bg-purple-500/10 text-purple-400",
  CREATE_STAFF:             "bg-green-500/10 text-green-400",
  UPDATE_STAFF_PERMISSIONS: "bg-amber-500/10 text-amber-400",
  ACTIVATE_STAFF:           "bg-green-500/10 text-green-400",
  DEACTIVATE_STAFF:         "bg-red-500/10 text-red-400",
  DELETE_STAFF:             "bg-red-500/10 text-red-400",
  UPDATE_SETTINGS:          "bg-indigo-500/10 text-indigo-400",
  DELETE_ORDER:             "bg-red-500/10 text-red-400",
};

const AuditLogPage = () => {
  const [logs,      setLogs]      = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error,     setError]     = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { logs } = await auditService.getLogs();
      setLogs(logs);
    } catch {
      setError("Failed to load activity logs.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  if (isLoading) return (
    <div className="flex items-center justify-center py-32 gap-3 text-muted-foreground">
      <Loader2 size={24} className="animate-spin text-primary" />
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center py-32 gap-4">
      <p className="text-sm text-destructive">{error}</p>
      <Button variant="outline" onClick={fetchLogs} className="gap-2">
        <RefreshCw size={14} /> Retry
      </Button>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Activity size={22} className="text-primary" />
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Activity Log</h1>
            <p className="text-muted-foreground text-sm mt-0.5">{logs.length} recorded actions</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={fetchLogs} className="gap-1.5">
          <RefreshCw size={14} /> Refresh
        </Button>
      </div>

      <div className="bg-card rounded-lg overflow-hidden">
        {logs.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground text-sm">
            No activity logged yet.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {logs.map((log) => {
              const actor = log.performedBy;
              const actorName = actor?.name ?? actor?.username ?? "Unknown";
              const initials  = actorName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
              const colorClass = actionColors[log.action] ?? "bg-secondary text-muted-foreground";

              return (
                <div key={log._id} className="flex items-start gap-4 p-4 hover:bg-secondary/30 transition-colors">
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary flex-shrink-0">
                    {initials}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-foreground">{actorName}</span>
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${colorClass}`}>
                        {getActionLabel(log.action)}
                      </span>
                    </div>

                    {/* Details */}
                    {log.details && Object.keys(log.details).length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {JSON.stringify(log.details)
                          .replace(/[{}"]/g, "")
                          .replace(/,/g, " · ")
                          .slice(0, 120)}
                      </p>
                    )}
                  </div>

                  {/* Timestamp */}
                  <span className="text-xs text-muted-foreground flex-shrink-0 whitespace-nowrap">
                    {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogPage;