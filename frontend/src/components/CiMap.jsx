"use client";
import { motion } from "framer-motion";

const nodes = [
  { id: "ci", label: "Ci", x: 50, y: 50, color: "var(--ci-wave)" },
  { id: "podia", label: "ПоДія", x: 25, y: 30, color: "var(--ci-glow)" },
  { id: "mood", label: "Настрій", x: 75, y: 30, color: "var(--ci-calm)" },
  { id: "mala", label: "Маля", x: 25, y: 75, color: "var(--ci-rose)" },
  { id: "gallery", label: "Галерея", x: 75, y: 75, color: "var(--ci-grass)" },
];

export default function CiMap() {
  return (
    <div className="ci-panel rounded-2xl p-4 text-slate-100">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-lg">Ci Map</h3>
        <span className="text-xs text-slate-400">сенсоматика</span>
      </div>
      <div className="relative h-64 w-full bg-slate-900/50 rounded-xl overflow-hidden">
        {nodes.map((node) => (
          <motion.div
            key={node.id}
            className="absolute flex h-12 w-12 items-center justify-center rounded-full text-xs font-bold shadow-lg"
            style={{
              background: node.color,
              top: `${node.y}%`,
              left: `${node.x}%`,
              transform: "translate(-50%, -50%)",
            }}
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            {node.label}
          </motion.div>
        ))}
        {nodes
          .filter((n) => n.id !== "ci")
          .map((node) => (
            <svg key={`line-${node.id}`} className="absolute inset-0" aria-hidden>
              <line
                x1="50%"
                y1="50%"
                x2={`${node.x}%`}
                y2={`${node.y}%`}
                stroke="var(--ci-wave)"
                strokeWidth="1.5"
                strokeOpacity="0.35"
              />
            </svg>
          ))}
      </div>
    </div>
  );
}
