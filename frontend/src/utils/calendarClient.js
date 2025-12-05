import { get, post } from "../lib/api";

const CALENDAR_BASE_PATH = "/api/v1/calendar";

async function unwrap(response, message = "Calendar service unavailable") {
  if (response?.error) {
    throw new Error(response.error || message);
  }

  return response?.data;
}

export async function fetchCalendarInsights() {
  const payload = await get(`${CALENDAR_BASE_PATH}/insights`);
  return unwrap(payload);
}

export async function syncExternalCalendar(provider) {
  const payload = await post(`${CALENDAR_BASE_PATH}/sync/${provider}`, {});
  return unwrap(payload);
}

export async function fetchFamilyCalendar(sharedId) {
  const payload = await get(`${CALENDAR_BASE_PATH}/family/${sharedId}`);
  return unwrap(payload);
}

export async function fetchHealthEvents(provider) {
  const payload = await get(`${CALENDAR_BASE_PATH}/health/${provider}`);
  return unwrap(payload, "Health events are unavailable");
}

export async function fetchLocalRecommendations(city, interests = []) {
  const params = new URLSearchParams();
  if (city) params.append("city", city);
  interests.forEach((interest) => params.append("interest", interest));

  const payload = await get(`${CALENDAR_BASE_PATH}/local?${params.toString()}`);
  return unwrap(payload, "Local recommendations unavailable");
}

export async function analyzePatterns(events = []) {
  return analyzeUserPatterns(events);
}

// Local helper to keep the analytical logic close to the frontend experience
export function analyzeUserPatterns(events = []) {
  const now = new Date();
  const recurring = events.filter((event) => event.recurring);
  const upcoming = events.filter((event) => new Date(event.date) > now);

  const categoryCounts = events.reduce((acc, event) => {
    const key = event.category || "other";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const dominantCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "balanced";

  return [
    {
      title: "Повторювані події",
      detail: recurring.length
        ? `Знайдено ${recurring.length} повторюваних подій — налаштуйте нагадування, щоб не пропустити.`
        : "Немає повторюваних патернів — можна створити циклічні нагадування.",
      tone: recurring.length ? "emerald" : "sky",
    },
    {
      title: "Пріоритети часу",
      detail: dominantCategory === "learning"
        ? "Більшість записів пов'язані з навчанням — спробуйте блокувати ранкові години."
        : `Домінує категорія ${dominantCategory} — налаштуйте баланс роботи та відпочинку.`,
      tone: "amber",
    },
    {
      title: "Близькі дедлайни",
      detail: upcoming.length
        ? `Маєте ${upcoming.length} майбутніх подій. Рекомендуємо увімкнути push та email нагадування.`
        : "Нових подій не виявлено — спробуйте додати рекомендації з TodayWidget.",
      tone: upcoming.length ? "emerald" : "sky",
    },
  ];
}

export function generateSmartReminders(userContext = {}) {
  const reminders = [];

  if (userContext.agronomist) {
    reminders.push({
      title: "Сприятливі дні для посадки",
      detail: "Субота та понеділок мають оптимальний прогноз вологості ґрунту.",
      channel: "push",
    });
  }

  if (userContext.student) {
    reminders.push({
      title: "Дедлайни завдань",
      detail: "Курс з алгоритмів — прогрес 60%, здача лабораторної через 4 дні.",
      channel: "in-app",
    });
  }

  if (userContext.family) {
    reminders.push({
      title: "Річниця родини",
      detail: "Наступної середи — сплануйте святкову вечерю та закупівлю продуктів.",
      channel: "email",
    });
  }

  return reminders;
}
