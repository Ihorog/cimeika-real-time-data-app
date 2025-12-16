"use client";

import { resonanceColor } from "../utils/galleryClient";

export default function MoodOverlay({ resonance = 0.5, emotion = "neutral" }) {
  const color = resonanceColor(resonance);
  const resonanceLabel = Math.round(resonance * 100);

  return (
    <div className="absolute inset-0 pointer-events-none">
      <div
        className="absolute inset-0 blur-3xl opacity-70"
        style={{ background: `radial-gradient(circle at 20% 30%, ${color}, transparent 55%)` }}
      />
      <div className="absolute inset-0 bg-gradient-to-tr from-sky-100/50 via-rose-100/40 to-emerald-100/40" />
      <div className="absolute bottom-2 left-3 text-xs text-slate-900 drop-shadow-sm">
        <p className="font-semibold">Resonance level: {resonanceLabel}%</p>
        <p className="uppercase tracking-[0.25em] text-[10px] text-slate-700">{emotion}</p>
      </div>
    </div>
  );
}
