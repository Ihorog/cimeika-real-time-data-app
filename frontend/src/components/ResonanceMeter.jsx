"use client";

export default function ResonanceMeter({ resonance }) {
  const level = Math.round(resonance * 100);
  const color =
    resonance > 0.85 ? "bg-green-500" : resonance > 0.75 ? "bg-yellow-400" : "bg-red-500";

  return (
    <div className="mt-2">
      <div className="text-xs text-slate-400">Рівень резонансу: {level}%</div>
      <div className="w-full h-2 bg-slate-700 rounded">
        <div className={`h-2 rounded ${color}`} style={{ width: `${level}%` }} />
      </div>
    </div>
  );
}
