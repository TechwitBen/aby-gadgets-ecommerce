import { useState, useMemo } from "react";
import { TrendingUp, TrendingDown, Users, UserPlus, Activity } from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// ── Types ─────────────────────────────────────────────────────────────────────

type DataPoint = {
  label: string;
  newCustomers: number;
  totalCustomers: number;
  churn: number;
};

type AnalyticsSectionProps = {
  totalCustomers?: number;
  customerCreatedDates?: string[];
  weeklyData?: DataPoint[];
  monthlyData?: DataPoint[];
};

// ── Cast recharts components ──────────────────────────────────────────────────
const RC = {
  ResponsiveContainer: ResponsiveContainer as any,
  AreaChart: AreaChart as any,
  BarChart: BarChart as any,
  LineChart: LineChart as any,
  Area: Area as any,
  Bar: Bar as any,
  Line: Line as any,
  XAxis: XAxis as any,
  YAxis: YAxis as any,
  CartesianGrid: CartesianGrid as any,
  Tooltip: Tooltip as any,
  Legend: Legend as any,
};

// ── Data derivation helpers ───────────────────────────────────────────────────

const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function buildWeeklyData(dates: string[]): DataPoint[] {
  const now = new Date();
  const points: DataPoint[] = [];
  let running = 0;

  const windowStart = new Date(now);
  windowStart.setDate(now.getDate() - 6);
  windowStart.setHours(0, 0, 0, 0);

  const baseline = dates.filter((d) => new Date(d) < windowStart).length;
  running = baseline;

  for (let i = 6; i >= 0; i--) {
    const day = new Date(now);
    day.setDate(now.getDate() - i);
    day.setHours(0, 0, 0, 0);

    const next = new Date(day);
    next.setDate(day.getDate() + 1);

    const newOnDay = dates.filter((d) => {
      const t = new Date(d).getTime();
      return t >= day.getTime() && t < next.getTime();
    }).length;

    running += newOnDay;

    points.push({
      label: DAYS_SHORT[day.getDay()],
      newCustomers: newOnDay,
      totalCustomers: running,
      churn: 0,
    });
  }

  return points;
}

function buildMonthlyData(dates: string[]): DataPoint[] {
  const year = new Date().getFullYear();
  const nowMonth = new Date().getMonth();

  const baseline = dates.filter((d) => new Date(d).getFullYear() < year).length;
  let running = baseline;

  return MONTHS_SHORT.slice(0, nowMonth + 1).map((label, idx) => {
    const newInMonth = dates.filter((d) => {
      const dt = new Date(d);
      return dt.getFullYear() === year && dt.getMonth() === idx;
    }).length;
    running += newInMonth;
    return {
      label,
      newCustomers: newInMonth,
      totalCustomers: running,
      churn: 0,
    };
  });
}

// ── Fallback mock data ────────────────────────────────────────────────────────

const mockWeeklyData: DataPoint[] = [
  { label: "Mon", newCustomers: 4, totalCustomers: 120, churn: 1 },
  { label: "Tue", newCustomers: 7, totalCustomers: 127, churn: 0 },
  { label: "Wed", newCustomers: 3, totalCustomers: 130, churn: 2 },
  { label: "Thu", newCustomers: 9, totalCustomers: 139, churn: 1 },
  { label: "Fri", newCustomers: 6, totalCustomers: 145, churn: 0 },
  { label: "Sat", newCustomers: 11, totalCustomers: 156, churn: 3 },
  { label: "Sun", newCustomers: 5, totalCustomers: 161, churn: 1 },
];

const mockMonthlyData: DataPoint[] = [
  { label: "Jan", newCustomers: 42, totalCustomers: 80, churn: 5 },
  { label: "Feb", newCustomers: 38, totalCustomers: 113, churn: 4 },
  { label: "Mar", newCustomers: 55, totalCustomers: 164, churn: 6 },
  { label: "Apr", newCustomers: 61, totalCustomers: 219, churn: 8 },
  { label: "May", newCustomers: 47, totalCustomers: 258, churn: 5 },
  { label: "Jun", newCustomers: 70, totalCustomers: 323, churn: 9 },
  { label: "Jul", newCustomers: 83, totalCustomers: 397, churn: 7 },
  { label: "Aug", newCustomers: 65, totalCustomers: 455, churn: 11 },
  { label: "Sep", newCustomers: 78, totalCustomers: 522, churn: 6 },
  { label: "Oct", newCustomers: 91, totalCustomers: 607, churn: 10 },
  { label: "Nov", newCustomers: 74, totalCustomers: 671, churn: 8 },
  { label: "Dec", newCustomers: 88, totalCustomers: 751, churn: 7 },
];

// ── Custom Tooltip ────────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-border rounded-xl p-3 shadow-xl text-xs space-y-1.5 min-w-[140px]">
      <p className="font-semibold text-foreground mb-2">{label}</p>
      {payload.map((entry: any) => (
        <div
          key={entry.dataKey}
          className="flex items-center justify-between gap-4"
        >
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span
              className="inline-block w-2 h-2 rounded-full"
              style={{ background: entry.color }}
            />
            {entry.name}
          </span>
          <span className="font-semibold text-foreground">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

// ── AnalyticsSection ──────────────────────────────────────────────────────────

const AnalyticsSection = ({
  totalCustomers,
  customerCreatedDates,
  weeklyData: weeklyOverride,
  monthlyData: monthlyOverride,
}: AnalyticsSectionProps) => {
  const [range, setRange] = useState<"week" | "month">("month");
  const [activeChart, setActiveChart] = useState<"growth" | "new" | "churn">(
    "growth"
  );

  const hasRealData =
    Array.isArray(customerCreatedDates) && customerCreatedDates.length > 0;

  const weeklyData = useMemo(
    () =>
      weeklyOverride ??
      (hasRealData
        ? buildWeeklyData(customerCreatedDates!)
        : mockWeeklyData),
    [weeklyOverride, customerCreatedDates, hasRealData]
  );

  const monthlyData = useMemo(
    () =>
      monthlyOverride ??
      (hasRealData
        ? buildMonthlyData(customerCreatedDates!)
        : mockMonthlyData),
    [monthlyOverride, customerCreatedDates, hasRealData]
  );

  const data = range === "week" ? weeklyData : monthlyData;

  const growthRate = useMemo(() => {
    if (data.length < 2) return 0;
    const last = data[data.length - 1].newCustomers;
    const prev = data[data.length - 2].newCustomers;
    return prev === 0
      ? 0
      : Number((((last - prev) / prev) * 100).toFixed(1));
  }, [data]);

  const totalNew = useMemo(
    () => data.reduce((s, d) => s + d.newCustomers, 0),
    [data]
  );
  const totalChurn = useMemo(
    () => data.reduce((s, d) => s + d.churn, 0),
    [data]
  );
  const netGrowth = totalNew - totalChurn;

  const metricCards = [
    {
      key: "growth",
      label: range === "week" ? "This Week Growth" : "This Year Growth",
      value: `+${netGrowth}`,
      sub: `${growthRate}% vs last period`,
      icon: <Activity size={15} />,
      positive: netGrowth >= 0,
    },
    {
      key: "new",
      label: range === "week" ? "New This Week" : "New This Year",
      value: totalNew,
      sub: `Avg ${(totalNew / (data.length || 1)).toFixed(1)} / ${
        range === "week" ? "day" : "month"
      }`,
      icon: <UserPlus size={15} />,
      positive: true,
    },
    {
      key: "churn",
      label: range === "week" ? "Churned This Week" : "Churned This Year",
      value: totalChurn,
      sub:
        totalChurn === 0
          ? "No churn data tracked yet"
          : `${((totalChurn / (totalNew || 1)) * 100).toFixed(1)}% churn rate`,
      icon: <Users size={15} />,
      positive: totalChurn === 0 || totalChurn < totalNew * 0.1,
    },
  ];

  const axisProps = {
    tick: {
      fontSize: 10,
      fill: "var(--color-muted-foreground, #6b7280)",
    },
    axisLine: false,
    tickLine: false,
  };

  const gridProps = {
    strokeDasharray: "3 3",
    stroke: "var(--color-border, #e5e7eb)",
  };

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden mb-6">
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-foreground">
              Customer Analytics
            </p>
            {hasRealData && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-medium">
                Live
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">
            Growth trends, acquisition & churn overview
            {!hasRealData && " — using sample data"}
          </p>
        </div>

        {/* Range toggle */}
        <div className="flex items-center bg-secondary rounded-lg p-0.5 gap-0.5">
          {(["week", "month"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-2.5 sm:px-3 py-1.5 text-xs rounded-md font-medium transition-all ${
                range === r
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {r === "week" ? "Weekly" : "Monthly"}
            </button>
          ))}
        </div>
      </div>

      {/* KPI cards — stack vertically on mobile, 3 cols on sm+ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 sm:divide-x divide-border border-b border-border">
        {metricCards.map((m) => (
          <button
            key={m.key}
            onClick={() => setActiveChart(m.key as "growth" | "new" | "churn")}
            className={`px-4 sm:px-5 py-3 sm:py-4 text-left transition-colors hover:bg-secondary/30 border-b sm:border-b-0 border-border last:border-b-0 ${
              activeChart === m.key ? "bg-secondary/40" : ""
            }`}
          >
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <p className="text-xs text-muted-foreground">{m.label}</p>
              <span
                className={`p-1 rounded-md ${
                  m.positive
                    ? "bg-emerald-500/10 text-emerald-500"
                    : "bg-destructive/10 text-destructive"
                }`}
              >
                {m.icon}
              </span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
              {m.value}
            </p>
            <p
              className={`text-xs mt-0.5 flex items-center gap-1 ${
                m.positive ? "text-emerald-500" : "text-destructive"
              }`}
            >
              {m.positive ? (
                <TrendingUp size={11} />
              ) : (
                <TrendingDown size={11} />
              )}
              {m.sub}
            </p>
            {activeChart === m.key && (
              <div className="mt-2 h-0.5 w-full bg-primary rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Charts */}
      <div className="px-4 sm:px-5 py-4 sm:py-5">
        {/* Growth — Area chart */}
        {activeChart === "growth" && (
          <>
            <p className="text-xs text-muted-foreground mb-4">
              Total customer base over time
            </p>
            <RC.ResponsiveContainer width="100%" height={200}>
              <RC.AreaChart
                data={data}
                margin={{ top: 4, right: 4, left: -24, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-primary, #6366f1)"
                      stopOpacity={0.25}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-primary, #6366f1)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                  <linearGradient id="gradNew" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <RC.CartesianGrid {...gridProps} />
                <RC.XAxis dataKey="label" {...axisProps} />
                <RC.YAxis {...axisProps} />
                <RC.Tooltip content={<CustomTooltip />} />
                <RC.Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 10, paddingTop: 10 }}
                />
                <RC.Area
                  type="monotone"
                  dataKey="totalCustomers"
                  name="Total Customers"
                  stroke="var(--color-primary, #6366f1)"
                  strokeWidth={2}
                  fill="url(#gradTotal)"
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                <RC.Area
                  type="monotone"
                  dataKey="newCustomers"
                  name="New Customers"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#gradNew)"
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </RC.AreaChart>
            </RC.ResponsiveContainer>
          </>
        )}

        {/* New Customers — Bar chart */}
        {activeChart === "new" && (
          <>
            <p className="text-xs text-muted-foreground mb-4">
              New customer acquisitions per{" "}
              {range === "week" ? "day" : "month"}
            </p>
            <RC.ResponsiveContainer width="100%" height={200}>
              <RC.BarChart
                data={data}
                margin={{ top: 4, right: 4, left: -24, bottom: 0 }}
              >
                <RC.CartesianGrid {...gridProps} vertical={false} />
                <RC.XAxis dataKey="label" {...axisProps} />
                <RC.YAxis {...axisProps} allowDecimals={false} />
                <RC.Tooltip content={<CustomTooltip />} />
                <RC.Bar
                  dataKey="newCustomers"
                  name="New Customers"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={32}
                />
              </RC.BarChart>
            </RC.ResponsiveContainer>
          </>
        )}

        {/* Churn — Line chart */}
        {activeChart === "churn" && (
          <>
            <p className="text-xs text-muted-foreground mb-2">
              Customer churn vs new acquisitions —{" "}
              {range === "week" ? "daily" : "monthly"} comparison
            </p>
            {totalChurn === 0 && (
              <p className="text-[11px] text-amber-500 mb-3">
                ⚠ Churn tracking requires a "last active" or
                account-deletion field on the User model.
              </p>
            )}
            <RC.ResponsiveContainer width="100%" height={200}>
              <RC.LineChart
                data={data}
                margin={{ top: 4, right: 4, left: -24, bottom: 0 }}
              >
                <RC.CartesianGrid {...gridProps} />
                <RC.XAxis dataKey="label" {...axisProps} />
                <RC.YAxis {...axisProps} allowDecimals={false} />
                <RC.Tooltip content={<CustomTooltip />} />
                <RC.Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 10, paddingTop: 10 }}
                />
                <RC.Line
                  type="monotone"
                  dataKey="newCustomers"
                  name="New Customers"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                <RC.Line
                  type="monotone"
                  dataKey="churn"
                  name="Churned"
                  stroke="#ef4444"
                  strokeWidth={2}
                  strokeDasharray="5 3"
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </RC.LineChart>
            </RC.ResponsiveContainer>
          </>
        )}
      </div>
    </div>
  );
};

export default AnalyticsSection;