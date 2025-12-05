import CalendarSmart from "../../../components/CalendarSmart";
import RecommendationsPanel from "../../../components/RecommendationsPanel";
import SyncSettings from "../../../components/SyncSettings";
import TodayWidget from "../../../components/TodayWidget";
import TimeAnalyticsChart from "../../../components/TimeAnalyticsChart";
import HistoryTimeline from "../../../components/HistoryTimeline";
import EducationSchedule from "../../../components/EducationSchedule";
import LearningProgressCard from "../../../components/LearningProgressCard";
import { analyzeUserPatterns, generateSmartReminders } from "../../../utils/calendarClient";

const sampleEvents = [
  { title: "Пробіжка", time: "06:30", category: "здоров'я", reminder: true },
  { title: "Лекція з ML", time: "09:00", category: "навчання" },
  { title: "Сімейна вечеря", time: "18:00", category: "сім'я", shared: true },
];

const educationLessons = [
  { title: "Алгоритми", day: "Понеділок", time: "09:00", location: "Zoom", progress: "60%" },
  { title: "Data Science Lab", day: "Середа", time: "14:00", location: "Campus", progress: "45%" },
];

const milestones = [
  { title: "Дипломний проєкт", deadline: "4 дні", progress: 62 },
  { title: "Курс LLM", deadline: "12 днів", progress: 35 },
  { title: "Сертифікація Azure", deadline: "1 місяць", progress: 20 },
];

const analyticsData = [
  { day: "Пн", work: 6, rest: 3 },
  { day: "Вт", work: 7, rest: 2 },
  { day: "Ср", work: 5, rest: 4 },
  { day: "Чт", work: 8, rest: 2 },
  { day: "Пт", work: 6, rest: 3 },
  { day: "Сб", work: 4, rest: 5 },
  { day: "Нд", work: 2, rest: 7 },
];

const historyEvents = [
  {
    title: "Синхронізація Google Calendar",
    date: "12.05",
    detail: "Імпортовано 14 подій, створено авто-нагадування для дедлайнів.",
    labels: ["Google", "OAuth2"],
  },
  {
    title: "Сімейний календар",
    date: "10.05",
    detail: "Додано shared_calendar_id=family_home та 3 спільні події.",
    labels: ["shared", "family"],
  },
  {
    title: "Здоров'я",
    date: "09.05",
    detail: "Стягнуто дані Apple Health: сон 7год, пульс 62 bpm.",
    labels: ["health", "apple"],
  },
];

const suggestionBank = [
  {
    title: "Сприятливі дні для посадки",
    detail: "Субота та понеділок матимуть оптимальну вологість ґрунту. Плануйте полив ввечері.",
    category: "agro",
    tag: "Агроном",
    actions: ["Запланувати посів", "Додати нагадування про погоду"],
  },
  {
    title: "Готуймо свято",
    detail: "Річниця родини за тиждень. Додайте покупки та список гостей у сімейний календар.",
    category: "family",
    tag: "Сім'я",
    actions: ["Список покупок", "Забронювати стіл"],
  },
  {
    title: "Фінансове нагадування",
    detail: "Очікується зарплата в п'ятницю. Порада: створіть подію для автоматичного переказу у заощадження.",
    category: "finance",
    tag: "Finance",
    actions: ["Додати в календар", "Увімкнути push"],
  },
  {
    title: "Дедлайни студенту",
    detail: "Лаба з ML через 4 дні. Система пропонує дві сесії по 90 хв з фокусом на моделі RAG.",
    category: "student",
    tag: "Student",
    actions: ["Поставити у Today", "Увімкнути in-app"],
  },
];

export default function CalendarModulePage() {
  const reminders = generateSmartReminders({ agronomist: true, student: true, family: true });
  const patterns = analyzeUserPatterns([
    { date: new Date().toISOString(), category: "learning", recurring: true },
    { date: new Date().toISOString(), category: "family", recurring: true },
  ]);

  return (
    <div className="max-w-6xl mx-auto space-y-6 py-10 px-4 sm:px-0">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Calendar+ Module</p>
        <h1 className="text-3xl font-bold">Інтелектуальний тайм-менеджмент</h1>
        <p className="text-slate-300 max-w-3xl">
          Синхронізація Google/Outlook, соціальні webhooks, фінанси, здоров'я та навчання в одному UI. Календар виявляє патерни,
          радить наступні кроки та готує сімейні сценарії.
        </p>
      </header>

      <CalendarSmart />
      <RecommendationsPanel suggestions={suggestionBank} reminders={reminders} />

      <div className="grid gap-4 md:grid-cols-2">
        <SyncSettings />
        <TodayWidget events={sampleEvents} onQuickAdd={() => alert("Голосова команда активована")} />
      </div>

      <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
        <TimeAnalyticsChart data={analyticsData} />
        <HistoryTimeline events={historyEvents} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <EducationSchedule lessons={educationLessons} />
        <LearningProgressCard milestones={milestones} />
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-sm text-slate-300 space-y-1">
        <p className="font-semibold text-white">API гайд</p>
        <p>Скористайтесь /api/v1/calendar/insights для аналітики та /api/v1/calendar/sync/google для OAuth2 потоку.</p>
        <ul className="list-disc list-inside text-slate-400">
          {patterns.map((item) => (
            <li key={item.title}>{item.detail}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
