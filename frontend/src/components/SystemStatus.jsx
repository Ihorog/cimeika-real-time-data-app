"use client";
import { useEffect, useState } from "react";
import { api } from "../utils/apiClient";

const formatSeconds = (seconds) => {
  if (typeof seconds !== "number" || Number.isNaN(seconds)) return "—";
  if (seconds < 60) return `${seconds.toFixed(0)}s`;
  const minutes = seconds / 60;
  if (minutes < 60) return `${minutes.toFixed(1)}m`;
  const hours = minutes / 60;
  if (hours < 24) return `${hours.toFixed(1)}h`;
  return `${(hours / 24).toFixed(1)}d`;
};

export default function SystemStatus() {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadStatus = async () => {
      try {
        const data = await api("system/monitor");
        if (mounted) {
          setStatus(data);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message);
          setStatus(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadStatus();
    const interval = setInterval(loadStatus, 15000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  if (loading) {
    return <p className="text-slate-400">Loading system state...</p>;
  }

  if (error) {
    return (
      <div className="p-4 bg-amber-900/40 text-amber-100 rounded-xl border border-amber-700/60">
        <p className="font-semibold">System Monitor</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (!status?.data) {
    return (
      <div className="p-4 bg-slate-900 text-white rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold mb-2">System Monitor</h2>
        <p className="text-slate-400">No system data available.</p>
      </div>
    );
  }

  const uptime = formatSeconds(status.data.uptime);
  const avgResonance =
    typeof status.data.avgResonance === "number" && !Number.isNaN(status.data.avgResonance)
      ? status.data.avgResonance.toFixed(2)
      : "—";

  return (
    <div className="p-4 bg-slate-900 text-white rounded-xl shadow-lg space-y-2">
      <div className="flex items-center gap-3">
        <div className="h-3 w-3 rounded-full bg-emerald-400 animate-pulse" aria-hidden />
        <h2 className="text-xl font-semibold">System Monitor</h2>
      </div>
      <p className="text-sm text-slate-400">Live poll every 15s</p>
      <p>Hostname: {status.data.hostname || "—"}</p>
      <p>Uptime: {uptime}</p>
      <p>Average Resonance: {avgResonance}</p>
      <p>Status: Stable ✅</p>
    </div>
  );
}
