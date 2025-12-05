import ApiConsole from "@/components/ApiConsole";
import Timeline from "@/components/Timeline";

const events = [
  { id: "ev1", time: "09:00", title: "Синхрон із Ci", context: "Аналітика" },
  { id: "ev2", time: "11:00", title: "Проєкт Маля", context: "Творчість" },
  { id: "ev3", time: "15:30", title: "Галерея Sync", context: "Візуалізація" },
];

export default function PodiaPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.25em] text-slate-400">ПоДія</p>
        <h1 className="text-3xl font-bold text-gradient">Події та сценарії</h1>
        <p className="text-slate-300 max-w-3xl">Таймлайн дій, що підживлюють сенсове поле Ci.</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Timeline events={events} />
        <ApiConsole />
      </div>
    </div>
  );
}
