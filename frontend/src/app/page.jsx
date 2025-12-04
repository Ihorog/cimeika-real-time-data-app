import Link from "next/link";
import SystemStatus from "../components/SystemStatus";
import CiModuleCard from "./modules/cards/ci";
import InsightModuleCard from "./modules/cards/insight";
import SystemModuleCard from "./modules/cards/system";
import OrchestratorModuleCard from "./modules/cards/orchestrator";

export default function HomePage() {
  return (
    <div className="py-8">
      <div className="max-w-6xl mx-auto space-y-10">
        <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Cimeika Phase 1</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-gradient">
              System UI — Resonance Monitor
            </h1>
            <p className="text-slate-300 max-w-2xl">
              Live insight into Ci, Insight, System, and Orchestrator modules. Track uptime, resonance vectors, and prepare for
              Phase 2 visualizations.
            </p>
            <div className="flex gap-3">
              <Link
                href="/dashboard"
                className="px-4 py-2 rounded-full bg-sky-500 text-slate-50 font-semibold hover:bg-sky-400 transition"
              >
                Open Dashboard
              </Link>
              <Link
                href="/api/v1/system/monitor"
                className="px-4 py-2 rounded-full border border-slate-700 text-slate-200 hover:border-slate-500 transition"
              >
                API: system/monitor
              </Link>
            </div>
          </div>
          <div className="relative mx-auto h-28 w-28 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 shadow-lg shadow-sky-900/40">
            <div className="absolute inset-0 bg-gradient-to-br from-sky-500/40 via-indigo-500/20 to-fuchsia-500/30 blur-2xl" />
            <div className="relative flex h-full items-center justify-center text-center text-slate-100">
              <span className="text-lg font-semibold leading-tight">
                Cimeika
                <br />
                System UI
              </span>
            </div>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] items-start">
          <SystemStatus />
          <div className="glow-card rounded-2xl p-6 bg-slate-900/70 text-slate-200 space-y-3">
            <h3 className="text-lg font-semibold text-white">API Landscape</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between">
                <span>/api/v1/system/monitor</span>
                <span className="text-emerald-300">Active</span>
              </li>
              <li className="flex justify-between">
                <span>/api/v1/ci/sense</span>
                <span className="text-amber-300">Next phase</span>
              </li>
              <li className="flex justify-between">
                <span>/api/v1/insight</span>
                <span className="text-amber-300">In progress</span>
              </li>
              <li className="flex justify-between">
                <span>/api/v1/orchestrator/balance</span>
                <span className="text-emerald-300">Active</span>
              </li>
            </ul>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <CiModuleCard />
          <InsightModuleCard />
          <SystemModuleCard />
          <OrchestratorModuleCard />
        </section>
      </div>
    </div>
  );
}
