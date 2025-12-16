"use client";

import { motion } from "framer-motion";

export default function HistoryTimeline({ events = [] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className="glow-card rounded-2xl bg-slate-900/70 border border-slate-800 p-5 text-slate-100"
    >
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Історія</p>
        <h3 className="text-lg font-semibold">Події та резонанси</h3>
      </div>
      <div className="space-y-4">
        {events.map((event) => (
          <div key={event.title} className="relative pl-5">
            <span className="absolute left-0 top-2 h-2 w-2 rounded-full bg-emerald-400" />
            <div className="flex items-center justify-between">
              <p className="font-semibold">{event.title}</p>
              <span className="text-xs text-slate-400">{event.date}</span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">{event.detail}</p>
            <div className="flex flex-wrap gap-2 text-[11px] text-slate-400 mt-1">
              {event.labels?.map((label) => (
                <span key={label} className="px-2 py-1 rounded-full bg-slate-800/80">
                  {label}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
