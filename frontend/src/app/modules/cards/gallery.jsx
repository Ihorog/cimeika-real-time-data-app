import ModuleCard from "../../../components/ModuleCard";

export default function GalleryModuleCard() {
  return (
    <ModuleCard title="Gallery" status="Living Memory" accent="rose">
      <p>Фото, відео та описи користувача з емоційними мітками. Інтеграція з Calendar, Nastrij і Казкарем.</p>
      <p className="text-slate-400 text-sm">Підтримка резонансів, візуальних історій та зв&#39;язку з подіями.</p>
    </ModuleCard>
  );
}
