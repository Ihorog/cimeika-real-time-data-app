import Timeline from "@/components/Timeline";

const stories = [
  { id: "st1", time: "Вчора", title: "Зоряний міст", context: "Минуле" },
  { id: "st2", time: "Сьогодні", title: "Дихання Ci", context: "Теперішнє" },
  { id: "st3", time: "Завтра", title: "Пісня Галереї", context: "Майбутнє" },
];

export default function KazkarPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Казкар</p>
        <h1 className="text-3xl font-bold text-gradient">Архів та історії</h1>
        <p className="text-slate-300 max-w-3xl">Розповіді, що резонують з часовими вузлами Календаря.</p>
      </div>
      <Timeline events={stories} />
    </div>
  );
}
