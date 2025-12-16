import GalleryPanel from "../../../components/GalleryPanel";

export default function GalleryPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 py-10 px-4 sm:px-0">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Gallery Module</p>
        <h1 className="text-3xl font-bold">Живий архів спогадів</h1>
        <p className="text-slate-300">
          Переглядайте сітку, часову лінію та повноекранний перегляд із резонансним шаром настрою.
        </p>
      </header>
      <GalleryPanel />
    </div>
  );
}
