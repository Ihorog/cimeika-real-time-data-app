"use client";

import { motion } from "framer-motion";
import classNames from "classnames";

export default function ModuleCard({ title, status = "Active", accent = "emerald", children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={classNames(
        "glow-card rounded-2xl p-5 bg-slate-900/70 border border-slate-800",
        "hover:-translate-y-1 transition duration-200"
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">{title}</h3>
        <span
          className={classNames(
            "text-xs px-3 py-1 rounded-full font-semibold bg-opacity-15",
            {
              "bg-emerald-500/20 text-emerald-200": accent === "emerald",
              "bg-sky-500/20 text-sky-200": accent === "sky",
              "bg-amber-500/20 text-amber-200": accent === "amber",
              "bg-fuchsia-500/20 text-fuchsia-200": accent === "fuchsia",
            }
          )}
        >
          {status}
        </span>
      </div>
      <div className="text-sm text-slate-300 space-y-2">{children}</div>
    </motion.div>
  );
}
