"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";

interface WeeklyData {
  day: string;
  count: number;
}

interface AppointmentChartProps {
  data: WeeklyData[];
}

interface TooltipPayloadItem {
  value: number;
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-3 py-2.5">
        <p className="text-xs font-semibold text-slate-700">{label}</p>
        <p className="text-sm font-bold mt-0.5" style={{ color: "#10B981" }}>
          {payload[0].value} appointments
        </p>
      </div>
    );
  }
  return null;
};

export default function AppointmentChart({ data }: AppointmentChartProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold text-slate-800">
            Weekly Appointments
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Last 7 days overview</p>
        </div>
        <span
          className="px-2.5 py-1 rounded-full text-xs font-semibold"
          style={{ background: "rgba(16,185,129,0.1)", color: "#10B981" }}
        >
          This Week
        </span>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barSize={32} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 12, fill: "#94A3B8", fontWeight: 500 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#CBD5E1" }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(16,185,129,0.05)" }} />
          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.count === Math.max(...data.map((d) => d.count)) ? "#10B981" : "#D1FAE5"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
