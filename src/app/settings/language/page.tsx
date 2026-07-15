import { SettingsRenderer } from "@/components/settings/SettingsRenderer";

export default function LanguageSettingsPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Language & Region</h2>
        <p className="text-sm text-zinc-400 mt-2">
          Set your preferred language and regional formats.
        </p>
      </div>
      <SettingsRenderer pagePath="/settings/language" />
    </div>
  );
}
