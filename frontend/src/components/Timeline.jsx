"use client";
import { motion } from "framer-motion";

export default function Timeline({ events = [] }) {
  return (
    <div className="ci-panel rounded-2xl p-4 text-slate-100">
      <h3 className="font-semibold mb-3">Таймлайн</h3>
      <div className="space-y-4">
        {events.map((event, idx) => (
          <motion.div
            key={event.id}
            className="relative pl-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <span className="absolute left-0 top-1.5 h-3 w-3 rounded-full bg-cyan-400" aria-hidden />
            <div className="text-sm text-slate-300">{event.time}</div>
            <div className="text-base font-semibold">{event.title}</div>
            <div className="text-xs text-slate-400">{event.context}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
