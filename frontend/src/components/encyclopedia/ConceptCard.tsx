import Link from "next/link";
import type { Concept } from "../../lib/encyclopedia/types";

export default function ConceptCard({ concept }: { concept: Concept }) {
  const subtitle =
    concept.timeline?.is ||
    concept.description_core ||
    "";

  return (
    <Link
      href={`/encyclopedia/${encodeURIComponent(concept.id)}`}
      className="block rounded-2xl border border-slate-800 bg-slate-900/40 hover:bg-slate-900/65 transition-colors p-5"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-50">{concept.name}</h3>
          {subtitle ? (
            <p className="mt-1 text-sm text-slate-300 line-clamp-2">{subtitle}</p>
          ) : null}
        </div>

        {concept.type ? (
          <span className="shrink-0 rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300">
            {concept.type}
          </span>
        ) : null}
      </div>

      {Array.isArray(concept.tags) && concept.tags.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {concept.tags.slice(0, 4).map((t) => (
            <span
              key={t}
              className="rounded-full bg-slate-800/60 px-2.5 py-1 text-xs text-slate-300"
            >
              {t}
            </span>
          ))}
        </div>
      ) : null}
    </Link>
  );
}