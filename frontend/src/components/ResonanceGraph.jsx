"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const defaultData = [
  { name: "00:00", value: 32 },
  { name: "04:00", value: 45 },
  { name: "08:00", value: 62 },
  { name: "12:00", value: 71 },
  { name: "16:00", value: 59 },
  { name: "20:00", value: 78 },
  { name: "24:00", value: 66 },
];

export default function ResonanceGraph({ data = defaultData }) {
  return (
    <div className="glow-card bg-slate-900/70 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Resonance Dynamics</h3>
        <span className="text-xs text-slate-400">24h window</span>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="resonance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis stroke="#94a3b8" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: "#0f172a", border: "1px solid #1f2937", borderRadius: 12 }}
              labelStyle={{ color: "#e2e8f0" }}
              itemStyle={{ color: "#38bdf8" }}
            />
            <Area type="monotone" dataKey="value" stroke="#22d3ee" fill="url(#resonance)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
