import Timeline from "@/components/Timeline";
import ApiConsole from "@/components/ApiConsole";

const memories = [
  { id: "gl1", time: "Вчора", title: "Ci Glow", context: "Сімейний момент" },
  { id: "gl2", time: "Сьогодні", title: "Wave Study", context: "Настрій" },
  { id: "gl3", time: "Завтра", title: "Sketch drop", context: "Маля" },
];

export default function GalleryPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Галерея</p>
        <h1 className="text-3xl font-bold text-gradient">Візуальні спогади</h1>
        <p className="text-slate-300 max-w-3xl">Кадри, що підсилюють сенсовий вектор Ci.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Timeline events={memories} />
        <ApiConsole />
      </div>
    </div>
  );
}
