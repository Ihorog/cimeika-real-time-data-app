import axios from "axios";

const DEFAULT_API_BASE = "http://localhost:3000/api/v1";
const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_API_BASE).replace(/\/$/, "");

const calendarClient = axios.create({
  baseURL: `${apiBase}/calendar`,
  timeout: 5000,
});

export async function fetchCalendarInsights() {
  const { data } = await calendarClient.get("/insights");
  return data;
}

export async function syncExternalCalendar(provider) {
  const { data } = await calendarClient.post(`/sync/${provider}`);
  return data;
}

export async function fetchFamilyCalendar(sharedId) {
  const { data } = await calendarClient.get(`/family/${sharedId}`);
  return data;
}

export async function fetchHealthEvents(provider) {
  const { data } = await calendarClient.get(`/health/${provider}`);
  return data;
}

export async function fetchLocalRecommendations(city, interests = []) {
  const params = new URLSearchParams();
  if (city) params.append("city", city);
  interests.forEach((interest) => params.append("interest", interest));

  const { data } = await calendarClient.get(`/local?${params.toString()}`);
  return data;
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

export default calendarClient;
