import type { Concept } from "@/lib/encyclopedia/types";
import RelationList from "@/components/encyclopedia/RelationList";

function Block({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/30 p-5">
      <h2 className="text-sm font-semibold text-slate-200">{title}</h2>
      <div className="mt-2 text-sm text-slate-200">{children}</div>
    </section>
  );
}

function TimelineRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/30 p-4">
      <div className="text-xs uppercase tracking-wide text-slate-400">
        {label}
      </div>
      <div className="mt-1 text-sm text-slate-100 whitespace-pre-wrap">
        {value || "—"}
      </div>
    </div>
  );
}

export default function ConceptView({
  concept,
  conceptMap,
}: {
  concept: Concept;
  conceptMap: Record<string, Concept>;
}) {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold text-slate-50">
            {concept.name}
          </h1>

          {concept.type ? (
            <span className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300">
              {concept.type}
            </span>
          ) : null}

          {concept.polarity ? (
            <span className="rounded-full bg-slate-800/60 px-3 py-1 text-xs text-slate-300">
              {concept.polarity}
            </span>
          ) : null}
        </div>

        {concept.namespace?.length ? (
          <p className="text-sm text-slate-400">
            {concept.namespace.join(" / ")}
          </p>
        ) : null}
      </header>

      <section className="grid gap-3 md:grid-cols-3">
        <TimelineRow label="Було" value={concept.timeline?.was} />
        <TimelineRow label="Є" value={concept.timeline?.is} />
        <TimelineRow label="Буде" value={concept.timeline?.will} />
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Block title="Суть">
          <div className="whitespace-pre-wrap">
            {concept.description_core || "—"}
          </div>
        </Block>

        <Block title="Образ">
          <div className="whitespace-pre-wrap">
            {concept.description_story || "—"}
          </div>
        </Block>

        <Block title="Технічно">
          <div className="whitespace-pre-wrap">
            {concept.description_technical || "—"}
          </div>
        </Block>
      </section>

      <Block title="Зв’язки">
        <RelationList relations={concept.relations} conceptMap={conceptMap} />
      </Block>
    </div>
  );
}