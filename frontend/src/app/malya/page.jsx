import ApiConsole from "@/components/ApiConsole";
import CiMap from "@/components/CiMap";

export default function MalyaPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Маля</p>
        <h1 className="text-3xl font-bold text-gradient">Творчість та навчання</h1>
        <p className="text-slate-300 max-w-3xl">Canvas генератор, що підживлюється датасетом ci_power.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <ApiConsole />
        <CiMap />
      </div>
    </div>
  );
}
