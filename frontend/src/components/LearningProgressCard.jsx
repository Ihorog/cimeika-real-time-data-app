"use client";

import { motion } from "framer-motion";

export default function LearningProgressCard({ milestones = [] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className="glow-card rounded-2xl bg-slate-900/70 border border-slate-800 p-5"
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Прогрес</p>
          <h3 className="text-lg font-semibold text-white">Навчальні плани</h3>
        </div>
        <span className="text-xs px-3 py-1 rounded-full bg-amber-500/20 text-amber-200">Student mode</span>
      </div>
      <div className="space-y-3">
        {milestones.map((milestone) => (
          <div key={milestone.title} className="space-y-1">
            <div className="flex items-center justify-between text-sm text-slate-300">
              <p className="font-semibold text-white">{milestone.title}</p>
              <span className="text-xs text-slate-400">{milestone.deadline}</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-500 via-fuchsia-500 to-emerald-500"
                style={{ width: `${milestone.progress}%` }}
              />
            </div>
            <p className="text-xs text-slate-400">{milestone.progress}% завершено</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
