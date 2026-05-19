import type { Template } from '../../lib/schemas';

export const dashboardTemplates: Template[] = [
  {
    id: 'dash-analytics',
    name: 'Analytics Dashboard',
    category: 'dashboard',
    description: 'KPI cards, chart area, and recent activity table',
    tags: ['analytics', 'kpi', 'charts'],
    code: `export function AnalyticsDashboard() {
  const stats = [
    { label: 'Total Users', value: '24,521', change: '+12%' },
    { label: 'Revenue', value: '$89,240', change: '+8.2%' },
    { label: 'Conversion', value: '3.6%', change: '-0.4%' },
    { label: 'Avg Session', value: '4m 32s', change: '+1m' },
  ];
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Analytics</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow">
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className="text-2xl font-bold mt-1">{s.value}</p>
            <p className="text-xs mt-1 text-green-500">{s.change}</p>
          </div>
        ))}
      </div>
    </div>
  );
}`,
  },
  {
    id: 'dash-admin',
    name: 'Admin Dashboard',
    category: 'dashboard',
    description: 'Sidebar nav, header, and content area with status widgets',
    tags: ['admin', 'sidebar', 'navigation'],
    code: `export function AdminDashboard() {
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <aside className="w-64 bg-white dark:bg-gray-800 shadow-md p-4 flex flex-col gap-2">
        <h2 className="font-bold text-lg mb-4">Admin</h2>
        {['Dashboard','Users','Settings','Reports'].map(item => (
          <button key={item} className="text-left px-3 py-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-gray-700 text-sm">{item}</button>
        ))}
      </aside>
      <main className="flex-1 p-6 overflow-auto">
        <h1 className="text-xl font-bold mb-4">Dashboard Overview</h1>
        <div className="grid grid-cols-3 gap-4">
          {['Active Users','Pending Tasks','System Health'].map(w => (
            <div key={w} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow text-center">
              <p className="text-gray-500 text-sm">{w}</p>
              <p className="text-3xl font-bold mt-2">—</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}`,
  },
];
