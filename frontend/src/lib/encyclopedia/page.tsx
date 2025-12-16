import Link from "next/link";
import { getBundle } from "../../lib/encyclopedia/loadBundle";
import ConceptCard from "../../components/encyclopedia/ConceptCard";

export default async function EncyclopediaPage() {
  const bundle = await getBundle();

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-50">Енциклопедія</h1>
          <p className="mt-1 text-sm text-slate-400">
            {bundle.namespace?.join(" / ") || "Cimeika"} · {bundle.bundle_id} · v{bundle.version}
          </p>
        </div>

        <Link
          href="/"
          className="text-sm text-slate-300 hover:text-white transition-colors"
        >
          На головну
        </Link>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {bundle.concepts.map((c) => (
          <ConceptCard key={c.id} concept={c} />
        ))}
      </section>
    </div>
  );
}