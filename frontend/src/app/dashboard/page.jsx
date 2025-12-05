import Link from "next/link";
import ResonanceGraph from "../../components/ResonanceGraph";
import RealtimeSummary from "../../components/RealtimeSummary";
import CiModule from "../modules/ci";
import InsightModule from "../modules/insight";
import OrchestratorModule from "../modules/orchestrator";
import SystemModule from "../modules/system";
import GalleryPanel from "../../components/GalleryPanel";

export default function DashboardPage() {
  return (
    <main className="min-h-screen py-14 px-6 sm:px-10 lg:px-16">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Dashboard</p>
            <h1 className="text-3xl font-bold text-white">Sensory Resonance Board</h1>
            <p className="text-slate-300">High-level pulse of all active modules.</p>
          </div>
          <Link href="/" className="text-sky-300 hover:text-sky-200">← Back to Home</Link>
        </div>

        <RealtimeSummary />

        <ResonanceGraph />

        <div className="grid gap-6 md:grid-cols-2">
          <SystemModule />
          <OrchestratorModule />
          <CiModule />
          <InsightModule />
        </div>

        <GalleryPanel />
      </div>
    </main>
  );
}
