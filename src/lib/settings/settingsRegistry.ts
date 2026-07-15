export type SettingType = 'toggle' | 'select' | 'button' | 'link';

export interface SettingOption {
  label: string;
  value: string;
}

export interface SettingDefinition {
  id: string; // The dot-notation path in the preferences JSON (e.g., 'appearance.compactMode')
  title: string;
  description: string;
  type: SettingType;
  options?: SettingOption[];
  defaultValue?: string | boolean;
  keywords: string[];
  category: string;
  path: string; // the sub-page where this setting lives, e.g., '/settings/appearance'
  action?: () => void; // for button types
  danger?: boolean; // for destructive actions
}

export const SETTINGS_REGISTRY: SettingDefinition[] = [
  // APPEARANCE
  {
    id: 'appearance.theme',
    title: 'Theme',
    description: 'Select the color theme of the application.',
    type: 'select',
    options: [
      { label: 'Light', value: 'light' },
      { label: 'Dark', value: 'dark' },
      { label: 'System', value: 'system' }
    ],
    defaultValue: 'system',
    keywords: ['theme', 'dark', 'light', 'system', 'color', 'appearance'],
    category: 'Appearance',
    path: '/settings/appearance'
  },
  {
    id: 'appearance.compactMode',
    title: 'Compact Mode',
    description: 'Reduce spacing between elements to fit more content on screen.',
    type: 'toggle',
    defaultValue: false,
    keywords: ['compact', 'spacing', 'density', 'layout', 'appearance'],
    category: 'Layout',
    path: '/settings/appearance'
  },
  {
    id: 'appearance.sidebarCollapsed',
    title: 'Default Sidebar State',
    description: 'Start with the sidebar collapsed by default.',
    type: 'toggle',
    defaultValue: false,
    keywords: ['sidebar', 'collapse', 'menu', 'navigation'],
    category: 'Layout',
    path: '/settings/appearance'
  },

  // SECURITY
  {
    id: 'security.password',
    title: 'Change Password',
    description: 'Update your account password. You will be asked for your current password.',
    type: 'button',
    keywords: ['password', 'security', 'change', 'auth'],
    category: 'Authentication',
    path: '/settings/security'
  },
  {
    id: 'security.twoFactor',
    title: 'Two-Factor Authentication',
    description: 'Add an extra layer of security to your account.',
    type: 'toggle',
    defaultValue: false,
    keywords: ['2fa', 'two-factor', 'mfa', 'security', 'auth'],
    category: 'Authentication',
    path: '/settings/security'
  },
  {
    id: 'security.activeSessions',
    title: 'Terminate All Other Sessions',
    description: 'Log out of all other devices currently logged into this account.',
    type: 'button',
    danger: true,
    keywords: ['sessions', 'logout', 'devices', 'terminate', 'security'],
    category: 'Sessions',
    path: '/settings/security'
  },

  // NOTIFICATIONS
  {
    id: 'notifications.email',
    title: 'Email Notifications',
    description: 'Receive important updates and alerts via email.',
    type: 'toggle',
    defaultValue: true,
    keywords: ['email', 'notifications', 'alerts', 'messages'],
    category: 'Channels',
    path: '/settings/notifications'
  },
  {
    id: 'notifications.push',
    title: 'Push Notifications',
    description: 'Receive browser push notifications for real-time alerts.',
    type: 'toggle',
    defaultValue: false,
    keywords: ['push', 'browser', 'notifications', 'alerts'],
    category: 'Channels',
    path: '/settings/notifications'
  },
  {
    id: 'notifications.matchReminders',
    title: 'Match Reminders',
    description: 'Get notified when a new match is analyzed.',
    type: 'toggle',
    defaultValue: true,
    keywords: ['match', 'reminders', 'game', 'analysis'],
    category: 'Events',
    path: '/settings/notifications'
  },
  {
    id: 'notifications.coaching',
    title: 'Coaching Insights',
    description: 'Receive periodic insights and tips from the AI Coach.',
    type: 'toggle',
    defaultValue: true,
    keywords: ['coach', 'insights', 'tips', 'ai'],
    category: 'Events',
    path: '/settings/notifications'
  },

  // PRIVACY
  {
    id: 'privacy.analytics',
    title: 'Usage Analytics',
    description: 'Help us improve by sharing anonymous usage data.',
    type: 'toggle',
    defaultValue: true,
    keywords: ['analytics', 'data', 'telemetry', 'tracking', 'privacy'],
    category: 'Data Collection',
    path: '/settings/privacy'
  },
  {
    id: 'privacy.crashReports',
    title: 'Crash Reports',
    description: 'Automatically send crash reports when errors occur.',
    type: 'toggle',
    defaultValue: true,
    keywords: ['crash', 'errors', 'reports', 'bugs', 'privacy'],
    category: 'Data Collection',
    path: '/settings/privacy'
  },

  // ACCESSIBILITY
  {
    id: 'accessibility.fontSize',
    title: 'Font Size',
    description: 'Adjust the global text size of the application.',
    type: 'select',
    options: [
      { label: 'Small', value: 'sm' },
      { label: 'Medium', value: 'md' },
      { label: 'Large', value: 'lg' }
    ],
    defaultValue: 'md',
    keywords: ['font', 'text', 'size', 'scaling', 'accessibility'],
    category: 'Visuals',
    path: '/settings/accessibility'
  },
  {
    id: 'accessibility.highContrast',
    title: 'High Contrast Mode',
    description: 'Increase contrast between text and backgrounds for better readability.',
    type: 'toggle',
    defaultValue: false,
    keywords: ['contrast', 'visibility', 'readability', 'colors', 'accessibility'],
    category: 'Visuals',
    path: '/settings/accessibility'
  },
  {
    id: 'accessibility.reducedMotion',
    title: 'Reduced Motion',
    description: 'Disable non-essential animations and transitions.',
    type: 'toggle',
    defaultValue: false,
    keywords: ['motion', 'animations', 'transitions', 'accessibility'],
    category: 'Visuals',
    path: '/settings/accessibility'
  },

  // DATA
  {
    id: 'data.clearCache',
    title: 'Clear Application Cache',
    description: 'Clear locally cached data. This will not log you out.',
    type: 'button',
    keywords: ['cache', 'clear', 'storage', 'data'],
    category: 'Storage',
    path: '/settings/data'
  },
  {
    id: 'data.export',
    title: 'Export Preferences',
    description: 'Download a JSON file of your current application preferences.',
    type: 'button',
    keywords: ['export', 'json', 'download', 'backup', 'data'],
    category: 'Management',
    path: '/settings/data'
  },
  {
    id: 'data.reset',
    title: 'Reset All Preferences',
    description: 'Reset all settings back to their defaults.',
    type: 'button',
    danger: true,
    keywords: ['reset', 'defaults', 'factory', 'data'],
    category: 'Management',
    path: '/settings/data'
  },

  // LANGUAGE
  {
    id: 'language.locale',
    title: 'Application Language',
    description: 'Select your preferred language.',
    type: 'select',
    options: [
      { label: 'English (US)', value: 'en-US' },
      { label: 'Español', value: 'es-ES' },
      { label: 'Français', value: 'fr-FR' },
      { label: 'Deutsch', value: 'de-DE' },
      { label: '日本語', value: 'ja-JP' }
    ],
    defaultValue: 'en-US',
    keywords: ['language', 'locale', 'translation', 'region'],
    category: 'Region',
    path: '/settings/language'
  },
  {
    id: 'language.timeFormat',
    title: 'Time Format',
    description: 'Select how time is displayed across the app.',
    type: 'select',
    options: [
      { label: '12-hour (1:00 PM)', value: '12h' },
      { label: '24-hour (13:00)', value: '24h' }
    ],
    defaultValue: '12h',
    keywords: ['time', 'format', 'clock', 'region'],
    category: 'Region',
    path: '/settings/language'
  },
];
