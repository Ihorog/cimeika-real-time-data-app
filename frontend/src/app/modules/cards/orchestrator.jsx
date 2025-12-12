import ModuleCard from "../../../components/ModuleCard";

export default function OrchestratorModuleCard() {
  return (
    <ModuleCard title="Orchestrator" status="Active" accent="sky">
      <p>Task balancing for Ci executors with priority scheduling.</p>
      <p className="text-slate-400">Endpoint: /api/v1/orchestrator/balance • Adaptive routing</p>
    </ModuleCard>
  );
}
