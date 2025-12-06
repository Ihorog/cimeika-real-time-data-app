"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { motion } from "framer-motion";
import { DATE_LONG_OPTIONS, DEFAULT_LOCALE } from "../../config/locale";

const DISMISS_MS = 2400;

export default function TodayWidget({ events = [], quickAddMessage = "Голосова команда активована", onQuickAdd }) {
  const [notification, setNotification] = useState(null);
  const timeoutRef = useRef(null);
  const [isPending, startTransition] = useTransition();

  const todayLabel = useMemo(
    () => new Date().toLocaleDateString(DEFAULT_LOCALE, DATE_LONG_OPTIONS),
    [],
  );

  useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    },
    [],
  );

  const showNotification = (message) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    const payload = { id: crypto.randomUUID?.() ?? Date.now(), message };
    setNotification(payload);

    timeoutRef.current = window.setTimeout(() => {
      setNotification((current) => (current?.id === payload.id ? null : current));
    }, DISMISS_MS);
  };

  const handleQuickAdd = async () => {
    const handler = onQuickAdd || (() => quickAddMessage);

    startTransition(async () => {
      try {
        const result = await Promise.resolve(handler());
        if (result === false) return;

        const message = typeof result === "string" && result.trim().length ? result : quickAddMessage;
        showNotification(message);
      } catch (error) {
        showNotification("Не вдалося запустити швидке додавання");
      }
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="glow-card rounded-2xl bg-slate-900/70 border border-slate-800 p-5 text-slate-100"
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Сьогодні</p>
          <h3 className="text-xl font-semibold">{todayLabel}</h3>
        </div>
        <button
          onClick={handleQuickAdd}
          disabled={isPending}
          className="px-3 py-2 rounded-lg bg-sky-500 text-white text-sm font-semibold hover:bg-sky-400 transition"
          aria-busy={isPending}
        >
          Голос: додати подію
        </button>
      </div>
      {notification && (
        <div className="mb-3 rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-slate-100">
          {notification.message}
        </div>
      )}
      <div className="space-y-3">
        {events.length === 0 ? (
          <p className="text-slate-400 text-sm">Немає запланованих подій. Спробуйте автоматичні пропозиції.</p>
        ) : (
          events.map((event) => (
            <div
              key={`${event.title}-${event.time}`}
              className="flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-900/80 px-4 py-3"
            >
              <div>
                <p className="font-semibold">{event.title}</p>
                <p className="text-xs text-slate-400">
                  {event.time} • {event.category}
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                {event.reminder && <span className="px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-200">Нагадування</span>}
                {event.shared && <span className="px-2 py-1 rounded-full bg-indigo-500/15 text-indigo-200">Сімейно</span>}
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}
