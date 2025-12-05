"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import MoodOverlay from "./MoodOverlay";

function formatDate(date) {
  return new Date(date).toLocaleDateString("uk-UA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function GalleryGrid({ items = [] }) {
  const [emotionFilter, setEmotionFilter] = useState("all");
  const [tagQuery, setTagQuery] = useState("");

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesEmotion = emotionFilter === "all" || item.emotion === emotionFilter;
      const matchesTag = tagQuery
        ? item.tags.some((tag) => tag.toLowerCase().includes(tagQuery.toLowerCase()))
        : true;
      return matchesEmotion && matchesTag;
    });
  }, [items, emotionFilter, tagQuery]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <span className="text-xs uppercase tracking-[0.25em] text-slate-500">Filters</span>
          <select
            value={emotionFilter}
            onChange={(e) => setEmotionFilter(e.target.value)}
            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-700 shadow-sm focus:outline-none"
          >
            <option value="all">Усі емоції</option>
            <option value="happy">happy</option>
            <option value="calm">calm</option>
            <option value="nostalgic">nostalgic</option>
            <option value="sad">sad</option>
            <option value="neutral">neutral</option>
          </select>
          <input
            value={tagQuery}
            onChange={(e) => setTagQuery(e.target.value)}
            placeholder="#tag"
            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-700 shadow-sm focus:outline-none"
          />
        </div>
        <p className="text-xs text-slate-500">{filteredItems.length} / {items.length} вибірок</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map((item) => (
          <motion.div
            key={item.id}
            layout
            whileHover={{ scale: 1.02 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-tr from-sky-100 via-rose-100 to-emerald-100 shadow-md hover:scale-[1.01] transition-all"
          >
            <div className="relative h-40 w-full bg-slate-900/40 flex items-center justify-center text-slate-100 uppercase tracking-[0.3em]">
              <span className="text-xs">{item.type}</span>
              <MoodOverlay resonance={item.resonance} emotion={item.emotion} />
            </div>
            <div className="p-4 space-y-1 text-slate-800">
              <p className="text-sm font-semibold">{item.location}</p>
              <p className="text-xs text-slate-600">{formatDate(item.date)}</p>
              <p className="text-xs font-semibold text-slate-700">Resonance level: {Math.round(item.resonance * 100)}%</p>
              <div className="flex flex-wrap gap-2 pt-1">
                {item.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-white/70 px-2 py-0.5 text-[11px] text-slate-700 shadow">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
