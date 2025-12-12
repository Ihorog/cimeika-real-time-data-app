"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import classNames from "classnames";

export default function RecommendationsPanel({ suggestions = [], reminders = [] }) {
  const [filter, setFilter] = useState("all");

  const filtered = useMemo(() => {
    if (filter === "all") return suggestions;
    return suggestions.filter((item) => item.category === filter);
  }, [filter, suggestions]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="glow-card rounded-2xl bg-slate-900/70 border border-slate-800 p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Рекомендації</p>
          <h3 className="text-lg font-semibold text-white">Інтерактивні поради</h3>
        </div>
        <div className="flex gap-2">
          {["all", "agro", "family", "student"].map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={classNames(
                "px-3 py-1 rounded-full text-xs font-semibold border transition",
                filter === item
                  ? "bg-emerald-500/20 border-emerald-400/60 text-emerald-200"
                  : "border-slate-700 text-slate-300 hover:border-slate-500"
              )}
            >
              {item === "all" ? "Всі" : item === "agro" ? "Агроном" : item === "family" ? "Сім'я" : "Студент"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {filtered.map((item) => (
          <div key={item.title} className="rounded-xl border border-slate-800/80 bg-slate-900/80 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-white">{item.title}</h4>
              <span
                className={classNames("text-xs px-2 py-1 rounded-full", {
                  "bg-amber-500/15 text-amber-200": item.category === "student",
                  "bg-emerald-500/15 text-emerald-200": item.category === "agro",
                  "bg-indigo-500/15 text-indigo-200": item.category === "family",
                })}
              >
                {item.tag}
              </span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">{item.detail}</p>
            <div className="flex flex-wrap gap-2 text-xs text-slate-400">
              {item.actions?.map((action) => (
                <span key={action} className="px-2 py-1 rounded-full bg-slate-800/80">
                  {action}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-xl border border-slate-800/80 bg-gradient-to-r from-fuchsia-500/10 via-sky-500/10 to-emerald-500/10 p-4">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-300 mb-2">Автонагодадувач</p>
        <div className="grid gap-2 md:grid-cols-3">
          {reminders.map((reminder) => (
            <div key={reminder.title} className="rounded-lg border border-slate-800/70 bg-slate-900/80 p-3">
              <p className="text-sm font-semibold text-white">{reminder.title}</p>
              <p className="text-xs text-slate-300 leading-relaxed">{reminder.detail}</p>
              <p className="mt-1 text-[11px] text-emerald-200">Канал: {reminder.channel}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
