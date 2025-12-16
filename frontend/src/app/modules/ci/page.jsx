import CiModuleCard from "../cards/ci";

export default function CiPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 py-10 px-4 sm:px-0">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Ci Module</p>
        <h1 className="text-3xl font-bold">Сенсовий координатор</h1>
        <p className="text-slate-300">
          Центральний інтелект Cimeika, що керує резонансами та сенсовими вагами між модулями.
        </p>
      </header>
      <CiModuleCard />
    </div>
  );
}
