"use client";
import { motion } from "framer-motion";

const gradients = [
  "from-cyan-400/60 via-blue-500/40 to-indigo-500/60",
  "from-emerald-400/50 via-cyan-500/40 to-blue-500/60",
];

export default function MoodWave({ label = "Настрій", level = 0.65 }) {
  return (
    <div className="ci-panel rounded-2xl p-4 text-slate-100 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{label}</h3>
        <span className="text-xs text-slate-400">рівень: {(level * 100).toFixed(0)}%</span>
      </div>
      <div className="relative h-40 overflow-hidden rounded-xl bg-slate-900/60 border border-slate-800">
        {gradients.map((grad, idx) => (
          <motion.div
            key={grad}
            className={`absolute inset-0 bg-gradient-to-r ${grad}`}
            style={{ opacity: 0.5, top: idx * 10 }}
            animate={{ x: ["-10%", "10%", "-10%"], y: [0, -6 * level * 10, 0] }}
            transition={{ duration: 6 + idx * 2, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
        <motion.div
          className="absolute bottom-4 left-4 text-sm font-semibold text-cyan-100"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          Резонанс хвилі
        </motion.div>
      </div>
    </div>
  );
}
