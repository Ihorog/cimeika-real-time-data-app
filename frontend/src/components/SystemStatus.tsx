"use client";

import { useEffect, useState } from "react";

import { get } from "../lib/api";

type HealthResponse = {
  status: string;
  service?: string;
  base_url?: string;
};

export default function SystemStatus() {
  const [status, setStatus] = useState<string>("checking");
  const [details, setDetails] = useState<string>("");

  useEffect(() => {
    async function loadHealth() {
      const response = await get<HealthResponse>("/health");
      if (response.status === "ok" && response.data?.status === "ok") {
        setStatus("ok");
        setDetails(response.data.base_url || "ready");
      } else {
        setStatus("error");
        setDetails(response.error || "backend unavailable");
      }
    }

    loadHealth();
  }, []);

  const statusColor = status === "ok" ? "text-emerald-400" : "text-rose-400";
  const badgeColor = status === "ok" ? "bg-emerald-500/10" : "bg-rose-500/10";

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">System status</p>
          <div className="mt-2 flex items-center gap-3">
            <span className={`rounded-full px-3 py-1 text-sm font-medium ${badgeColor} ${statusColor}`}>
              {status === "checking" ? "checking" : status}
            </span>
            <p className="text-slate-300 text-sm">{details || "waiting for response"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
