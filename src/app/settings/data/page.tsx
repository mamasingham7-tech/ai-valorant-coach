import { SettingsRenderer } from "@/components/settings/SettingsRenderer";

export default function DataSettingsPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Data & Storage</h2>
        <p className="text-sm text-zinc-400 mt-2">
          Manage cached data and application exports.
        </p>
      </div>
      <SettingsRenderer pagePath="/settings/data" />
    </div>
  );
}
