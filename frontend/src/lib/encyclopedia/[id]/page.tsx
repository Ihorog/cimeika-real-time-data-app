import Link from "next/link";
import { notFound } from "next/navigation";
import { getConcept, getConceptMap } from "../../../lib/encyclopedia/loadBundle";
import ConceptView from "../../../components/encyclopedia/ConceptView";

export default async function EncyclopediaConceptPage({
  params,
}: {
  params: { id: string };
}) {
  const concept = await getConcept(params.id);
  if (!concept) return notFound();

  const conceptMap = await getConceptMap();

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-4">
        <nav className="text-sm text-slate-400">
          <Link href="/encyclopedia" className="hover:text-white transition-colors">
            Енциклопедія
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-300">{concept.name}</span>
        </nav>

        <Link
          href="/encyclopedia"
          className="text-sm text-slate-300 hover:text-white transition-colors"
        >
          До списку
        </Link>
      </header>

      <ConceptView concept={concept} conceptMap={conceptMap} />
    </div>
  );
}