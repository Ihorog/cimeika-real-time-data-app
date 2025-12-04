import ModuleCard from "../../../components/ModuleCard";

export default function SystemModuleCard() {
  return (
    <ModuleCard title="System" status="Stable" accent="emerald">
      <p>Monitoring infrastructure health, uptime, and resonance averages.</p>
      <p className="text-slate-400">Endpoints: /api/v1/system/monitor • Real-time metrics feed</p>
    </ModuleCard>
  );
}
