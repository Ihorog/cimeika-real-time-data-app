import CiMap from "@/components/CiMap";
import ApiConsole from "@/components/ApiConsole";
import MoodWave from "@/components/MoodWave";

export default function CiPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Ci</p>
        <h1 className="text-3xl font-bold text-gradient">Центральна консоль</h1>
        <p className="text-slate-300 max-w-3xl">Навігація, аналітика і сенсові координати для всіх модулів.</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr] items-start">
        <CiMap />
        <MoodWave label="Резонанс" level={0.68} />
      </div>
      <ApiConsole />
    </div>
  );
}
