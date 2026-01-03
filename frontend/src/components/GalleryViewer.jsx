"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import MoodOverlay from "./MoodOverlay";

export default function GalleryViewer({ items = [] }) {
  const [index, setIndex] = useState(0);
  const current = items[index] || items[0];
  const fallback = useMemo(() => items[0], [items]);
  const media = current || fallback;

  if (!media) {
    return null;
  }

  const goNext = () => setIndex((prev) => (prev + 1) % items.length);
  const goPrev = () => setIndex((prev) => (prev - 1 + items.length) % items.length);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-slate-900/80 shadow-xl border border-white/10">
      <div className="absolute inset-0 bg-gradient-to-tr from-sky-100/10 via-rose-100/10 to-emerald-100/10 blur-3xl" />
      <div className="relative p-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] items-center">
        <div className="relative h-64 overflow-hidden rounded-xl border border-white/5 bg-slate-900/60">
          <AnimatePresence mode="wait">
            <motion.div
              key={media.id}
              className="absolute inset-0 flex items-center justify-center text-slate-200"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            >
              <div className="absolute inset-0">
                <Image
                  src={media.preview || media.src}
                  alt={media.note || media.location}
                  fill
                  sizes="(min-width: 1024px) 60vw, 100vw"
                  className="object-cover"
                  placeholder={media.blurDataURL ? "blur" : "empty"}
                  blurDataURL={media.blurDataURL}
                  loading="lazy"
                  priority={false}
                />
              </div>
              <div className="relative z-10 text-center space-y-2 bg-slate-900/60 px-4 py-3 rounded-xl shadow-lg">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-300">{media.type}</p>
                <p className="text-2xl font-semibold text-white">{media.location}</p>
                <p className="text-sm text-slate-200 line-clamp-2">{media.note}</p>
              </div>
              <MoodOverlay resonance={media.resonance} emotion={media.emotion} />
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="space-y-3 text-slate-100">
          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-slate-300">
            <span>Living Memory</span>
            <span className="h-px w-10 bg-slate-700" />
            <span>{media.emotion}</span>
          </div>
          <h3 className="text-xl font-semibold text-white">{media.location}</h3>
          <p className="text-sm text-slate-300">{media.note}</p>
          <div className="flex flex-wrap gap-2">
            {media.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-100">
                #{tag}
              </span>
            ))}
          </div>
          <p className="text-xs text-slate-400">Resonance level: {Math.round(media.resonance * 100)}%</p>
          <div className="flex gap-2 text-sm text-slate-300">
            <button
              type="button"
              onClick={goPrev}
              className="rounded-full border border-slate-600 px-3 py-1 hover:border-slate-400"
            >
              ← Prev
            </button>
            <button
              type="button"
              onClick={goNext}
              className="rounded-full border border-slate-600 px-3 py-1 hover:border-slate-400"
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
