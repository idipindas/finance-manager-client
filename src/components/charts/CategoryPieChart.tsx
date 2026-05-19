import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { Expense } from "@/types";
import { formatCurrency } from "@/lib/utils";

const COLORS = [
  "#7c5af6", "#22c55e", "#f43f5e", "#f59e0b", "#06b6d4",
  "#8b5cf6", "#10b981", "#ef4444", "#eab308", "#3b82f6",
];

interface Props {
  expenses: Expense[];
}

export default function CategoryPieChart({ expenses }: Props) {
  const data = Object.entries(
    expenses.reduce<Record<string, number>>((acc, e) => {
      acc[e.category] = (acc[e.category] ?? 0) + e.amount;
      return acc;
    }, {})
  )
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-text-muted text-sm">
        No expense data for this month
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={3}
          dataKey="value"
          strokeWidth={0}
        >
          {data.map((_entry, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: "#1a2240",
            border: "1px solid #252d4a",
            borderRadius: "12px",
            padding: "8px 12px",
          }}
          itemStyle={{ color: "#f1f5f9", fontSize: "12px" }}
          formatter={(value) => [formatCurrency(Number(value)), ""]}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => (
            <span style={{ color: "#64748b", fontSize: "11px" }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
