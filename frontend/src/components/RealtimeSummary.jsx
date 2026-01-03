"use client";
import { useEffect, useMemo, useState } from "react";
import { api } from "../utils/apiClient";

function formatTemp(value) {
  if (typeof value !== "number" || Number.isNaN(value)) return "—";
  return `${value}°C`;
}

function formatTime(timestamp) {
  if (!timestamp) return "—";
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleTimeString();
}

export default function RealtimeSummary({ city, sign }) {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const endpoint = useMemo(() => {
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (sign) params.set("sign", sign);
    const query = params.toString();
    return query ? `realtime/summary?${query}` : "realtime/summary";
  }, [city, sign]);

  useEffect(() => {
    let mounted = true;

    const fetchSummary = async () => {
      setLoading(true);
      try {
        const payload = await api(endpoint);
        if (mounted) {
          setSummary(payload.data);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message);
          setSummary(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchSummary();
    const interval = setInterval(fetchSummary, 20000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [endpoint]);

  if (loading && !summary) {
    return (
      <div className="p-4 bg-slate-900 text-white rounded-xl shadow-lg">
        <p className="text-slate-400">Loading realtime summary...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-amber-900/50 text-amber-100 rounded-xl border border-amber-700/60 space-y-2">
        <p className="font-semibold">Realtime Summary</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="p-4 bg-slate-900 text-white rounded-xl shadow-lg">
        <p className="text-slate-400">No realtime data available.</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-slate-900 text-white rounded-xl shadow-lg space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Realtime Summary</h2>
          <p className="text-sm text-slate-400">Aggregated weather, astrology & system monitor</p>
        </div>
        <span className="text-xs text-slate-400">{formatTime(summary.timestamp)}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-3 rounded-lg bg-slate-800/70 border border-slate-700/60">
          <p className="text-sm text-slate-400">Weather</p>
          <p className="text-lg font-semibold">{summary.weather?.city || "—"}</p>
          <p className="text-sm">{summary.weather?.weather || "N/A"}</p>
          <p className="text-sm text-slate-400">{formatTemp(summary.weather?.temperature)}</p>
        </div>

        <div className="p-3 rounded-lg bg-slate-800/70 border border-slate-700/60">
          <p className="text-sm text-slate-400">Astrology</p>
          <p className="text-lg font-semibold capitalize">{summary.astrology?.sign || "—"}</p>
          <p className="text-sm">{summary.astrology?.forecast || "No forecast"}</p>
        </div>

        <div className="p-3 rounded-lg bg-slate-800/70 border border-slate-700/60">
          <p className="text-sm text-slate-400">System</p>
          <p className="text-lg font-semibold">{summary.system?.api?.status || "Unknown"}</p>
          <p className="text-sm text-slate-400">Avg resonance: {summary.system?.avgResonance ?? "—"}</p>
          <p className="text-sm text-slate-400">Host: {summary.system?.hostname || "—"}</p>
        </div>
      </div>
    </div>
  );
}
