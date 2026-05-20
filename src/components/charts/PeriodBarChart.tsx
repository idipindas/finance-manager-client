import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { PeriodBucket } from "@/lib/analytics";
import { formatCurrency } from "@/lib/utils";

interface Props {
  data: PeriodBucket[];
}

export default function PeriodBarChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} barCategoryGap="35%" barGap={3}>
        <CartesianGrid vertical={false} stroke="#252d4a" strokeDasharray="3 3" />
        <XAxis
          dataKey="label"
          tick={{ fill: "#64748b", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={(v: number) =>
            v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`
          }
          tick={{ fill: "#64748b", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          width={40}
        />
        <Tooltip
          contentStyle={{
            background: "#1a2240",
            border: "1px solid #252d4a",
            borderRadius: "12px",
            padding: "8px 12px",
          }}
          itemStyle={{ color: "#f1f5f9", fontSize: "12px" }}
          formatter={(value) => [formatCurrency(Number(value)), ""]}
          cursor={{ fill: "rgba(124,90,246,0.07)" }}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => (
            <span style={{ color: "#64748b", fontSize: "11px" }}>{value}</span>
          )}
        />
        <Bar dataKey="income" name="Income" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={24} />
        <Bar dataKey="expense" name="Expense" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={24} />
      </BarChart>
    </ResponsiveContainer>
  );
}
