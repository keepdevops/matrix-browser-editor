import type { Template } from '../../lib/schemas';

export const navTemplates: Template[] = [
  {
    id: 'nav-topbar',
    name: 'Top Navigation Bar',
    category: 'nav',
    description: 'Responsive top nav with logo, links, and user menu',
    tags: ['navbar', 'header', 'responsive', 'dropdown'],
    code: `import { useState } from 'react';
export function TopNav() {
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const links = ['Products', 'Pricing', 'Docs', 'Blog'];
  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <nav className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="font-bold text-xl text-indigo-600">Acme</span>
          <div className="hidden md:flex items-center gap-6">
            {links.map(l => (
              <button key={l} className="text-sm text-gray-600 dark:text-gray-300 hover:text-indigo-600 transition-colors">{l}</button>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-3">
            <button className="text-sm text-gray-600 dark:text-gray-300 hover:text-indigo-600">Log in</button>
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-1.5 rounded-lg font-medium">Sign up</button>
            <div className="relative">
              <button onClick={() => setOpen(o => !o)}
                className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 font-bold text-sm">
                AJ
              </button>
              {open && (
                <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl shadow-lg py-1 z-10">
                  {['Profile', 'Settings', 'Sign out'].map(item => (
                    <button key={item} onClick={() => setOpen(false)}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <button onClick={() => setMenuOpen(o => !o)} className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <span className="block w-5 h-0.5 bg-gray-600 mb-1" />
            <span className="block w-5 h-0.5 bg-gray-600 mb-1" />
            <span className="block w-5 h-0.5 bg-gray-600" />
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden mt-3 border-t dark:border-gray-700 pt-3 flex flex-col gap-2">
            {links.map(l => (
              <button key={l} className="text-left px-2 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:text-indigo-600">{l}</button>
            ))}
          </div>
        )}
      </nav>
    </div>
  );
}`,
  },
  {
    id: 'nav-sidebar',
    name: 'Collapsible Sidebar Nav',
    category: 'nav',
    description: 'Icon + label sidebar that collapses to icon-only mode',
    tags: ['sidebar', 'navigation', 'collapse', 'icons'],
    code: `import { useState } from 'react';
export function SidebarNav() {
  const [collapsed, setCollapsed] = useState(false);
  const [active, setActive] = useState('Dashboard');
  const items = [
    { label: 'Dashboard', icon: '▦' },
    { label: 'Analytics', icon: '📈' },
    { label: 'Users', icon: '👥' },
    { label: 'Projects', icon: '📁' },
    { label: 'Messages', icon: '💬', badge: 4 },
    { label: 'Settings', icon: '⚙️' },
  ];
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <aside className={\`\${collapsed ? 'w-16' : 'w-56'} transition-all duration-200 bg-white dark:bg-gray-800 border-r dark:border-gray-700 flex flex-col\`}>
        <div className="flex items-center justify-between px-4 py-4 border-b dark:border-gray-700">
          {!collapsed && <span className="font-bold text-indigo-600 text-lg">Acme</span>}
          <button onClick={() => setCollapsed(c => !c)}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 ml-auto">
            {collapsed ? '→' : '←'}
          </button>
        </div>
        <nav className="flex-1 py-4 space-y-1 px-2">
          {items.map(({ label, icon, badge }) => (
            <button key={label} onClick={() => setActive(label)}
              className={\`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors \${active === label ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}\`}>
              <span className="text-base flex-shrink-0">{icon}</span>
              {!collapsed && (
                <span className="flex-1 text-left">{label}</span>
              )}
              {!collapsed && badge && (
                <span className="bg-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{badge}</span>
              )}
            </button>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-6">
        <h1 className="text-xl font-bold dark:text-white">{active}</h1>
      </main>
    </div>
  );
}`,
  },
  {
    id: 'nav-breadcrumb',
    name: 'Breadcrumb + Tab Nav',
    category: 'nav',
    description: 'Breadcrumb trail with tab navigation below',
    tags: ['breadcrumb', 'tabs', 'navigation'],
    code: `import { useState } from 'react';
export function BreadcrumbTabNav() {
  const [tab, setTab] = useState('Overview');
  const crumbs = ['Home', 'Projects', 'Apollo'];
  const tabs = ['Overview', 'Team', 'Files', 'Settings'];
  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-6 pt-4">
          <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-4">
            {crumbs.map((c, i) => (
              <span key={c} className="flex items-center gap-1.5">
                {i > 0 && <span>/</span>}
                <button className={\`hover:text-indigo-600 transition-colors \${i === crumbs.length - 1 ? 'text-gray-900 dark:text-white font-medium' : ''}\`}>{c}</button>
              </span>
            ))}
          </nav>
          <div className="flex gap-1">
            {tabs.map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={\`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors \${tab === t ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}\`}>
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-6 py-8">
        <p className="text-gray-500 dark:text-gray-400">{tab} content goes here.</p>
      </div>
    </div>
  );
}`,
  },
];
