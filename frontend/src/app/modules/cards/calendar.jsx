import ModuleCard from "../../../components/ModuleCard";

export default function CalendarModuleCard() {
  return (
    <ModuleCard title="Calendar+" status="Intelligent" accent="sky">
      <p>Персональні рекомендації, сімейні сценарії, інтеграція Google/Outlook та health API.</p>
      <p className="text-slate-400 text-sm">Підтримка нагадувань, Today widget, навчальні плани та локальні події.</p>
    </ModuleCard>
  );
}
