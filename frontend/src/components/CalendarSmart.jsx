"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import classNames from "classnames";
import {
  analyzeUserPatterns,
  fetchCalendarInsights,
  fetchHealthEvents,
  fetchLocalRecommendations,
  generateSmartReminders,
} from "../utils/calendarClient";

const defaultEvents = [
  { title: "Сімейна вечеря", date: "2024-05-15T18:00:00Z", time: "18:00", category: "family", shared: true, reminder: true },
  { title: "Лекція з ML", date: "2024-05-16T09:00:00Z", time: "09:00", category: "learning", recurring: true },
  { title: "Посів томатів", date: "2024-05-17T07:00:00Z", time: "07:00", category: "agro", recurring: true },
  { title: "Morning Run", date: "2024-05-15T06:30:00Z", time: "06:30", category: "health", reminder: true },
];

export default function CalendarSmart() {
  const [events] = useState(defaultEvents);
  const [insights, setInsights] = useState([]);
  const [localEvents, setLocalEvents] = useState([]);
  const [healthEvents, setHealthEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userContext = useMemo(
    () => ({
      agronomist: true,
      family: true,
      student: true,
      city: "Київ",
      interests: ["outdoor", "music"],
    }),
    []
  );

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      try {
        const [insightPayload, localPayload, healthPayload] = await Promise.all([
          fetchCalendarInsights().catch(() => ({ balance: [], timeline: [] })),
          fetchLocalRecommendations(userContext.city, userContext.interests).catch(() => ({ events: [] })),
          fetchHealthEvents("fitbit").catch(() => ({ events: [] })),
        ]);

        if (!mounted) return;
        setInsights(insightPayload?.insights || insightPayload?.balance || []);
        setLocalEvents(localPayload?.events || []);
        setHealthEvents(healthPayload?.events || []);
      } catch (err) {
        if (!mounted) return;
        setError("Не вдалося отримати дані. Використовуємо локальні патерни.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    bootstrap();
    return () => {
      mounted = false;
    };
  }, [userContext.city, userContext.interests]);

  const patternInsights = useMemo(() => analyzeUserPatterns(events), [events]);
  const insightCards = useMemo(() => (insights?.length ? insights : patternInsights), [insights, patternInsights]);
  const reminders = useMemo(() => generateSmartReminders(userContext), [userContext]);

  const mergedEvents = useMemo(
    () => [...events, ...healthEvents.map((event) => ({ ...event, category: event.category || "health" }))],
    [events, healthEvents]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="glow-card rounded-2xl bg-slate-900/70 border border-slate-800 p-6 text-slate-100"
    >
      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Calendar+ Orchestrator</p>
          <h2 className="text-2xl font-bold text-white">Інтелектуальний календар</h2>
            <p className="text-sm text-slate-300 max-w-2xl">
              {"Аналізує звички, підтягує дані з Google/Outlook, здоров'я та соціальних сервісів. Працює з родинними та навчальними сценаріями."}
            </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {["health", "family", "learning", "finance"].map((tag) => (
            <span key={tag} className="px-3 py-1 rounded-full bg-slate-800 text-xs text-slate-200 capitalize">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {error && <p className="mb-3 text-sm text-amber-200">{error}</p>}
      {loading ? (
        <p className="text-sm text-slate-300">Завантаження синхронізованих даних…</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <h3 className="text-sm uppercase tracking-[0.2em] text-slate-400">Патерни</h3>
            {insightCards.map((insight) => (
              <div
                key={insight.title}
                className="rounded-xl border border-slate-800/80 bg-slate-900/80 px-4 py-3 flex items-start justify-between gap-3"
              >
                <div>
                  <p className="font-semibold text-white">{insight.title}</p>
                  <p className="text-sm text-slate-300 leading-relaxed">{insight.detail}</p>
                </div>
                <span
                  className={classNames("text-xs px-2 py-1 rounded-full", {
                    "bg-emerald-500/15 text-emerald-200": insight.tone === "emerald",
                    "bg-sky-500/15 text-sky-200": insight.tone === "sky",
                    "bg-amber-500/15 text-amber-200": insight.tone === "amber",
                  })}
                >
                  {insight.tone || "AI"}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <h3 className="text-sm uppercase tracking-[0.2em] text-slate-400">Автопропозиції</h3>
            <div className="rounded-xl border border-slate-800/80 bg-slate-900/80 px-4 py-3 space-y-2">
              <p className="text-sm text-slate-200 font-semibold">На основі історії</p>
              <ul className="list-disc list-inside text-sm text-slate-300 space-y-1">
                {mergedEvents.map((event) => (
                  <li key={`${event.title}-${event.date}`} className="flex justify-between gap-2">
                    <span>
                      {event.title} — {event.category}
                    </span>
                    {event.recurring && <span className="text-xs text-emerald-200">повтор</span>}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-slate-400">Система пропонує повторити події та додає сімейні традиції.</p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/80 px-4 py-3 space-y-1">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Local</p>
          <p className="text-sm text-slate-200 font-semibold">Події поруч</p>
          <ul className="text-xs text-slate-300 space-y-1">
            {localEvents.length ? (
              localEvents.map((event) => <li key={event.title}>{event.title}</li>)
            ) : (
              <li>Eventbrite/KARABAS.ua: очікуємо відповіді</li>
            )}
          </ul>
        </div>
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/80 px-4 py-3 space-y-1">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Health</p>
          <p className="text-sm text-slate-200 font-semibold">Apple/Google Fit</p>
          <ul className="text-xs text-slate-300 space-y-1">
            {healthEvents.length ? (
              healthEvents.map((item) => <li key={item.title}>{item.title}</li>)
            ) : (
              <li>Синхронізовано базові кроки та сон</li>
            )}
          </ul>
        </div>
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/80 px-4 py-3 space-y-1">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Reminders</p>
          <p className="text-sm text-slate-200 font-semibold">Гнучкі канали</p>
          <ul className="text-xs text-slate-300 space-y-1">
            {reminders.map((reminder) => (
              <li key={reminder.title} className="flex justify-between gap-2">
                <span>{reminder.title}</span>
                <span className="text-emerald-200">{reminder.channel}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}
