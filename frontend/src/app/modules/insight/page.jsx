import InsightModuleCard from "../cards/insight";

export default function InsightPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 py-10 px-4 sm:px-0">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Insight Module</p>
        <h1 className="text-3xl font-bold">Аналітика профілю</h1>
        <p className="text-slate-300">Відповідає за матрицю сенсів та рекомендації на основі поведінкових сигналів.</p>
      </header>
      <InsightModuleCard />
    </div>
  );
}
