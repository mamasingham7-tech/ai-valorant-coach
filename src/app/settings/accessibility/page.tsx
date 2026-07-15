import { SettingsRenderer } from "@/components/settings/SettingsRenderer";

export default function AccessibilitySettingsPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Accessibility</h2>
        <p className="text-sm text-zinc-400 mt-2">
          Customize the visual experience for better usability.
        </p>
      </div>
      <SettingsRenderer pagePath="/settings/accessibility" />
    </div>
  );
}
