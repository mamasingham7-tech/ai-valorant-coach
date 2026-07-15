import os

pages = {
    'security': ('Security', 'Manage your password, 2FA, and active sessions.'),
    'notifications': ('Notifications', 'Configure how and when you receive alerts.'),
    'privacy': ('Privacy', 'Manage analytics and data collection preferences.'),
    'accessibility': ('Accessibility', 'Customize the visual experience for better usability.'),
    'data': ('Data & Storage', 'Manage cached data and application exports.'),
    'language': ('Language & Region', 'Set your preferred language and regional formats.'),
    'about': ('About', 'Information about the application and its version.')
}

base_path = 'src/app/settings'

for slug, (title, desc) in pages.items():
    content = f'''import {{ SettingsRenderer }} from "@/components/settings/SettingsRenderer";

export default function {slug.capitalize()}SettingsPage() {{
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">{title}</h2>
        <p className="text-sm text-zinc-400 mt-2">
          {desc}
        </p>
      </div>
      <SettingsRenderer pagePath="/settings/{slug}" />
    </div>
  );
}}
'''
    with open(os.path.join(base_path, slug, 'page.tsx'), 'w', encoding='utf-8') as f:
        f.write(content)
