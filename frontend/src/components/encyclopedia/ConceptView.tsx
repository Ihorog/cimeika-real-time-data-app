type Concept = {
  id: string;
  title?: string;
  summary?: string;
  content?: string;
  tags?: string[];
  links?: { label: string; href: string }[];
};

export default function ConceptView({
  concept,
}: {
  concept: Concept;
}) {
  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          {concept.title ?? concept.id}
        </h1>

        {concept.summary ? (
          <p className="text-slate-300">{concept.summary}</p>
        ) : null}

        {concept.tags?.length ? (
          <div className="flex flex-wrap gap-2">
            {concept.tags.map((t) => (
              <span
                key={t}
                className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-200"
              >
                {t}
              </span>
            ))}
          </div>
        ) : null}
      </header>

      {concept.content ? (
        <article className="prose prose-invert max-w-none">
          <p>{concept.content}</p>
        </article>
      ) : (
        <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-4 text-slate-300">
          Контент ще не завантажено.
        </div>
      )}

      {concept.links?.length ? (
        <footer className="space-y-2">
          <div className="text-sm text-slate-400">Пов’язані посилання</div>
          <ul className="space-y-1">
            {concept.links.map((l) => (
              <li key={l.href}>
                <a className="underline" href={l.href}>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </footer>
      ) : null}
    </section>
  );
}