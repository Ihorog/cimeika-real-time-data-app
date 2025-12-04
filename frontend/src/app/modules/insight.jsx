import ModuleCard from "../../components/ModuleCard";

export default function InsightModule() {
  return (
    <ModuleCard title="Insight" status="Preparing" accent="amber">
      <p>Profile analytics and sense-matrix discovery in progress.</p>
      <p className="text-slate-400">Coming next: Behavioral signals • Trend detection • CI resonance</p>
    </ModuleCard>
  );
}
