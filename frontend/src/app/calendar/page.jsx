import Timeline from "@/components/Timeline";
import ApiConsole from "@/components/ApiConsole";

const nodes = [
  { id: "tn1", time: "08:00", title: "Ci morning sync", context: "Focus" },
  { id: "tn2", time: "12:00", title: "Настрій check-in", context: "Емоція" },
  { id: "tn3", time: "18:00", title: "Галерея upload", context: "Спогад" },
];

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Календар</p>
        <h1 className="text-3xl font-bold text-gradient">Вузли часу</h1>
        <p className="text-slate-300 max-w-3xl">Події з сенсовими мітками для Ci.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Timeline events={nodes} />
        <ApiConsole />
      </div>
    </div>
  );
}
