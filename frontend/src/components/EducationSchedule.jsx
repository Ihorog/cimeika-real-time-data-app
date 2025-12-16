"use client";

import { motion } from "framer-motion";

export default function EducationSchedule({ lessons = [] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.26 }}
      className="glow-card rounded-2xl bg-slate-900/70 border border-slate-800 p-5"
    >
      <div className="mb-3">
        <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Освіта</p>
        <h3 className="text-lg font-semibold text-white">Розклад занять</h3>
      </div>
      <div className="space-y-3">
        {lessons.map((lesson) => (
          <div
            key={lesson.title}
            className="flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-900/80 px-4 py-3"
          >
            <div>
              <p className="font-semibold">{lesson.title}</p>
              <p className="text-xs text-slate-400">
                {lesson.day} • {lesson.time}
              </p>
            </div>
            <div className="text-right text-xs text-slate-300">
              <p>{lesson.location}</p>
              <p className="text-emerald-200">{lesson.progress} завершено</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
