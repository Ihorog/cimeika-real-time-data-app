import OrchestratorModuleCard from "../cards/orchestrator";

export default function OrchestratorPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 py-10 px-4 sm:px-0">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Orchestrator Module</p>
        <h1 className="text-3xl font-bold">Керування задачами</h1>
        <p className="text-slate-300">Балансування задач для виконавців Ci з пріоритизацією та адаптивною маршрутизацією.</p>
      </header>
      <OrchestratorModuleCard />
    </div>
  );
}
