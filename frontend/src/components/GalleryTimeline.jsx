"use client";

import { DATE_SHORT_OPTIONS, DEFAULT_LOCALE } from "../../config/locale";

export default function GalleryTimeline({ items = [] }) {
  return (
    <div className="rounded-2xl bg-white/60 p-4 shadow-md backdrop-blur-lg">
      <div className="flex items-center justify-between pb-2">
        <h4 className="text-sm font-semibold text-slate-800 uppercase tracking-[0.2em]">Timeline</h4>
        <p className="text-xs text-slate-500">{items.length} memories</p>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="relative pl-4">
            <span className="absolute left-0 top-2 h-2 w-2 rounded-full bg-sky-400 shadow" />
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-800">{item.location}</p>
                <p className="text-xs text-slate-500">
                  {new Date(item.date).toLocaleDateString(DEFAULT_LOCALE, DATE_SHORT_OPTIONS)}
                </p>
              </div>
              <div className="text-xs text-slate-600">{Math.round(item.resonance * 100)}%</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
