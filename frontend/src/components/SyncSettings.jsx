"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import classNames from "classnames";

const defaultProviders = [
  { key: "google_calendar", label: "Google Calendar", type: "calendar", status: "active" },
  { key: "outlook_sync", label: "Outlook", type: "calendar", status: "ready" },
  { key: "finance_api", label: "Finance API", type: "finance", status: "optional" },
  { key: "social_hooks", label: "Facebook / Telegram", type: "social", status: "listening" },
];

export default function SyncSettings({ providers = defaultProviders }) {
  const [connections, setConnections] = useState(() =>
    providers.map((provider) => ({ ...provider, enabled: provider.status === "active" }))
  );

  const toggle = (key) => {
    setConnections((prev) => prev.map((conn) => (conn.key === key ? { ...conn, enabled: !conn.enabled } : conn)));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className="glow-card rounded-2xl bg-slate-900/70 border border-slate-800 p-5 text-slate-100"
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Інтеграції</p>
          <h3 className="text-lg font-semibold">Синхронізація сервісів</h3>
        </div>
        <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-200">OAuth2</span>
      </div>

      <div className="space-y-3">
        {connections.map((provider) => (
          <div
            key={provider.key}
            className="flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-900/80 px-4 py-3"
          >
            <div>
              <p className="font-semibold">{provider.label}</p>
              <p className="text-xs text-slate-400 capitalize">{provider.type} integration</p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={classNames("text-xs px-2 py-1 rounded-full", {
                  "bg-emerald-500/15 text-emerald-200": provider.status === "active" || provider.enabled,
                  "bg-amber-500/15 text-amber-200": provider.status === "optional",
                  "bg-sky-500/15 text-sky-200": provider.status === "ready",
                  "bg-indigo-500/15 text-indigo-200": provider.status === "listening",
                })}
              >
                {provider.status}
              </span>
              <button
                onClick={() => toggle(provider.key)}
                className={classNames(
                  "px-3 py-1 rounded-lg text-xs font-semibold transition",
                  provider.enabled
                    ? "bg-emerald-500 text-slate-900 hover:bg-emerald-400"
                    : "border border-slate-700 text-slate-200 hover:border-slate-500"
                )}
              >
                {provider.enabled ? "Увімкнено" : "Увімкнути"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
