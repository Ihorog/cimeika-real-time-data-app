import SystemModuleCard from "../cards/system";

export default function SystemPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 py-10 px-4 sm:px-0">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.25em] text-slate-400">System Module</p>
        <h1 className="text-3xl font-bold">Системний моніторинг</h1>
        <p className="text-slate-300">Контролює інфраструктуру, аптайм та середні резонанси.</p>
      </header>
      <SystemModuleCard />
    </div>
  );
}
