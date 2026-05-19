import type { Template } from '../../lib/schemas';

export const sidebarTemplates: Template[] = [
  {
    id: 'sidebar-settings',
    name: 'Settings Sidebar',
    category: 'sidebar',
    description: 'Settings panel with grouped sections and toggle switches',
    tags: ['settings', 'toggles', 'preferences'],
    code: `import { useState } from 'react';
export function SettingsSidebar() {
  const [settings, setSettings] = useState({
    notifications: true,
    emailDigest: false,
    twoFactor: true,
    darkMode: false,
    analytics: true,
    marketing: false,
  });
  const toggle = (key: keyof typeof settings) => setSettings(s => ({ ...s, [key]: !s[key] }));
  const groups = [
    { title: 'Notifications', items: [
      { key: 'notifications', label: 'Push notifications', desc: 'Receive alerts in the browser' },
      { key: 'emailDigest', label: 'Weekly email digest', desc: 'Summary of activity' },
    ]},
    { title: 'Security', items: [
      { key: 'twoFactor', label: 'Two-factor auth', desc: 'Require 2FA on login' },
    ]},
    { title: 'Privacy', items: [
      { key: 'analytics', label: 'Usage analytics', desc: 'Help improve the product' },
      { key: 'marketing', label: 'Marketing emails', desc: 'Promotions and updates' },
    ]},
  ] as const;
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <aside className="w-72 bg-white dark:bg-gray-800 border-r dark:border-gray-700 p-6 overflow-y-auto">
        <h2 className="font-bold text-lg dark:text-white mb-6">Settings</h2>
        {groups.map(g => (
          <div key={g.title} className="mb-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{g.title}</p>
            <div className="space-y-4">
              {g.items.map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium dark:text-white">{label}</p>
                    <p className="text-xs text-gray-400">{desc}</p>
                  </div>
                  <button onClick={() => toggle(key as keyof typeof settings)}
                    className={\`w-11 h-6 rounded-full transition-colors flex-shrink-0 \${settings[key as keyof typeof settings] ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'}\`}>
                    <span className={\`block w-4 h-4 bg-white rounded-full shadow transition-transform mx-1 \${settings[key as keyof typeof settings] ? 'translate-x-5' : ''}\`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </aside>
      <main className="flex-1 p-8">
        <p className="text-gray-400 dark:text-gray-500 text-sm">Select a setting to configure.</p>
      </main>
    </div>
  );
}`,
  },
  {
    id: 'sidebar-filter',
    name: 'Filter Sidebar',
    category: 'sidebar',
    description: 'Search + checkbox filters with active filter chips and result count',
    tags: ['filter', 'search', 'checkbox', 'faceted'],
    code: `import { useState } from 'react';
export function FilterSidebar() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string[]>(['React']);
  const categories = ['React', 'Vue', 'Angular', 'Svelte', 'Next.js', 'Remix', 'Astro'];
  const levels = ['Beginner', 'Intermediate', 'Advanced'];
  const toggle = (v: string) => setSelected(s => s.includes(v) ? s.filter(x => x !== v) : [...s, v]);
  const filtered = categories.filter(c => c.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <aside className="w-64 bg-white dark:bg-gray-800 border-r dark:border-gray-700 p-5 flex flex-col gap-5">
        <h2 className="font-bold dark:text-white">Filters</h2>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search frameworks…"
          className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white" />
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Framework</p>
          <div className="space-y-2">
            {filtered.map(c => (
              <label key={c} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={selected.includes(c)} onChange={() => toggle(c)}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                <span className="text-sm dark:text-gray-300">{c}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Level</p>
          <div className="space-y-2">
            {levels.map(l => (
              <label key={l} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={selected.includes(l)} onChange={() => toggle(l)}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                <span className="text-sm dark:text-gray-300">{l}</span>
              </label>
            ))}
          </div>
        </div>
        {selected.length > 0 && (
          <div className="flex flex-wrap gap-1.5 border-t dark:border-gray-700 pt-4">
            {selected.map(s => (
              <span key={s} className="flex items-center gap-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 text-xs px-2 py-1 rounded-full">
                {s}
                <button onClick={() => toggle(s)} className="hover:text-indigo-900">×</button>
              </span>
            ))}
          </div>
        )}
      </aside>
      <main className="flex-1 p-6">
        <p className="text-sm text-gray-500 dark:text-gray-400">Showing results for <strong>{selected.join(', ') || 'all'}</strong></p>
      </main>
    </div>
  );
}`,
  },
  {
    id: 'sidebar-chat',
    name: 'Chat Sidebar',
    category: 'sidebar',
    description: 'Conversation list sidebar with search, unread badges, and active state',
    tags: ['chat', 'messaging', 'conversations', 'inbox'],
    code: `import { useState } from 'react';
export function ChatSidebar() {
  const [active, setActive] = useState(0);
  const [search, setSearch] = useState('');
  const convos = [
    { id: 0, name: 'Sarah Chen', msg: 'Sounds good! See you then.', time: '2m', unread: 2, avatar: '👩' },
    { id: 1, name: 'Dev Team', msg: 'PR is ready for review', time: '15m', unread: 5, avatar: '👥' },
    { id: 2, name: 'Marcus Lee', msg: 'Thanks for the update!', time: '1h', unread: 0, avatar: '👨' },
    { id: 3, name: 'Design', msg: 'New mockups uploaded', time: '3h', unread: 1, avatar: '🎨' },
    { id: 4, name: 'Alex Kim', msg: 'Can we reschedule?', time: '1d', unread: 0, avatar: '🧑' },
  ];
  const filtered = convos.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <aside className="w-72 bg-white dark:bg-gray-800 border-r dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b dark:border-gray-700">
          <h2 className="font-bold text-lg dark:text-white mb-3">Messages</h2>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search conversations…"
            className="w-full bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2 text-sm outline-none dark:text-white" />
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.map(c => (
            <button key={c.id} onClick={() => setActive(c.id)}
              className={\`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left \${active === c.id ? 'bg-indigo-50 dark:bg-indigo-900/20 border-r-2 border-indigo-600' : ''}\`}>
              <span className="text-2xl flex-shrink-0">{c.avatar}</span>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <span className={\`text-sm font-semibold dark:text-white \${c.unread ? 'text-gray-900' : 'text-gray-700 dark:text-gray-300'}\`}>{c.name}</span>
                  <span className="text-xs text-gray-400">{c.time}</span>
                </div>
                <p className="text-xs text-gray-500 truncate mt-0.5">{c.msg}</p>
              </div>
              {c.unread > 0 && (
                <span className="bg-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">{c.unread}</span>
              )}
            </button>
          ))}
        </div>
      </aside>
      <main className="flex-1 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Select a conversation</p>
      </main>
    </div>
  );
}`,
  },
];
