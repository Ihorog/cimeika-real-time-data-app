"use client";

import { useMemo, useState } from "react";
import GalleryGrid from "./GalleryGrid";
import GalleryViewer from "./GalleryViewer";
import GalleryTimeline from "./GalleryTimeline";
import UploadPanel from "./UploadPanel";
import { gallerySeed } from "./galleryData";

export default function GalleryPanel() {
  const [items, setItems] = useState(gallerySeed);
  const latest = useMemo(() => items.slice(0, 3), [items]);

  const handleUpload = (payload) => {
    setItems((prev) => [payload, ...prev]);
  };

  return (
    <section className="space-y-4 rounded-3xl bg-slate-100/70 p-6 shadow-2xl backdrop-blur-xl border border-white/60">
      <div className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Gallery v3.0 — Living Memory</p>
        <h2 className="text-2xl font-bold text-slate-900">Емоційна сітка спогадів</h2>
        <p className="text-slate-600 max-w-3xl text-sm">
          Інтеграція з Calendar, Nastrij та Kazkar: фільтруйте спогади за настроєм, переходьте у повноекранний перегляд, будуйте
          історії та тестуйте завантаження.
        </p>
      </div>

      <UploadPanel onUpload={handleUpload} />

      <GalleryViewer items={items} />

      <GalleryGrid items={items} />

      <GalleryTimeline items={latest} />
    </section>
  );
}
