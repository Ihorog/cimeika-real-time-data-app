import MoodWave from "@/components/MoodWave";
import CiMap from "@/components/CiMap";

export default function MoodPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Настрій</p>
        <h1 className="text-3xl font-bold text-gradient">Емоційні хвилі</h1>
        <p className="text-slate-300 max-w-3xl">Ci вловлює ваш стан і синхронізує його з подіями.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <MoodWave level={0.72} />
        <CiMap />
      </div>
    </div>
  );
}
