"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import GalleryGrid from "./GalleryGrid";
import GalleryViewer from "./GalleryViewer";
import GalleryTimeline from "./GalleryTimeline";
import UploadPanel from "./UploadPanel";
import { gallerySeed } from "./galleryData";

export default function GalleryPanel() {
  const [items, setItems] = useState(gallerySeed);
  const latest = useMemo(() => items.slice(0, 3), [items]);
  const [deferSections, setDeferSections] = useState(true);
  const lazyRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setDeferSections(false);
          observer.disconnect();
        }
      },
      { rootMargin: "160px" },
    );

    if (lazyRef.current) observer.observe(lazyRef.current);
    return () => observer.disconnect();
  }, []);

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
      <div ref={lazyRef} className="h-px w-full" />
      {deferSections ? (
        <div className="rounded-2xl border border-white/40 bg-white/60 p-6 text-slate-700 animate-pulse">
          Оптимізуємо ресурси та готуємо галерею...
        </div>
      ) : (
        <>
          <GalleryGrid items={items} />

          <GalleryTimeline items={latest} />
        </>
      )}
    </section>
  );
}
