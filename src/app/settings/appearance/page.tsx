import { SettingsRenderer } from "@/components/settings/SettingsRenderer";

export default function AppearanceSettingsPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Appearance</h2>
        <p className="text-sm text-zinc-400 mt-2">
          Customize the look and feel of the application.
        </p>
      </div>
      <SettingsRenderer pagePath="/settings/appearance" />
    </div>
  );
}
