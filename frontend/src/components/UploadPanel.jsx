"use client";

export default function UploadPanel({ onUpload }) {
  const triggerUpload = () => {
    const payload = {
      id: `g-ui-${Date.now()}`,
      type: "photo",
      date: new Date().toISOString(),
      location: "Live Drop",
      emotion: "neutral",
      resonance: 0.58,
      tags: ["upload", "demo"],
      linked_event: null,
      note: "Drag-and-drop mock",
    };
    onUpload?.(payload);
  };

  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-4 shadow-inner backdrop-blur-lg">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-800">Upload / Dropzone</p>
          <p className="text-xs text-slate-500">Перетягніть фото чи відео, або натисніть, щоб змоделювати аплоуд.</p>
        </div>
        <button
          type="button"
          onClick={triggerUpload}
          className="rounded-full bg-gradient-to-tr from-sky-400 via-rose-400 to-emerald-400 px-4 py-2 text-xs font-semibold text-white shadow"
        >
          + Mock upload
        </button>
      </div>
    </div>
  );
}
