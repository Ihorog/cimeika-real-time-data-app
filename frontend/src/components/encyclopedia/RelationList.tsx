import Link from "next/link";
import type { Concept, Relation } from "../../lib/encyclopedia/types";

function fmtWeight(w?: number) {
  if (typeof w !== "number") return "";
  const n = Math.round(w * 100) / 100;
  return ` · ${n}`;
}

export default function RelationList({
  relations,
  conceptMap,
}: {
  relations?: Relation[];
  conceptMap: Record<string, Concept>;
}) {
  if (!relations?.length) {
    return <p className="text-sm text-slate-400">Нема зв’язків.</p>;
  }

  return (
    <div className="space-y-2">
      {relations.map((r, idx) => {
        const target = conceptMap[r.target_id];
        const label = target?.name ?? r.target_id;

        return (
          <div
            key={`${r.relation_type}-${r.target_id}-${idx}`}
            className="rounded-xl border border-slate-800 bg-slate-900/30 p-3 flex items-center justify-between gap-4"
          >
            <div className="min-w-0">
              <div className="text-sm text-slate-200">
                <span className="text-slate-400">{r.relation_type}</span>
                <span className="text-slate-400">{fmtWeight(r.weight)}</span>
              </div>

              <div className="mt-0.5 text-sm text-slate-100 truncate">
                {target ? (
                  <Link
                    className="hover:underline"
                    href={`/encyclopedia/${encodeURIComponent(r.target_id)}`}
                  >
                    {label}
                  </Link>
                ) : (
                  label
                )}
              </div>
            </div>

            <span className="shrink-0 rounded-full bg-slate-800/60 px-2.5 py-1 text-xs text-slate-300">
              {r.target_id}
            </span>
          </div>
        );
      })}
    </div>
  );
}