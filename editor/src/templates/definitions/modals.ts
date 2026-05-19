import type { Template } from '../../lib/schemas';

export const modalTemplates: Template[] = [
  {
    id: 'modal-confirm',
    name: 'Confirm Dialog',
    category: 'modal',
    description: 'Accessible confirm/cancel dialog with backdrop',
    tags: ['modal', 'dialog', 'confirm'],
    code: `import { useState } from 'react';
export function ConfirmDialog() {
  const [open, setOpen] = useState(false);
  return (
    <div className="p-8">
      <button onClick={() => setOpen(true)} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">Delete Item</button>
      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setOpen(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold">Delete Item?</h3>
            <p className="text-gray-500 mt-2 text-sm">This action cannot be undone. The item will be permanently removed.</p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setOpen(false)} className="flex-1 border rounded-lg py-2 text-sm dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
              <button onClick={() => setOpen(false)} className="flex-1 bg-red-600 text-white rounded-lg py-2 text-sm hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}`,
  },
  {
    id: 'modal-drawer',
    name: 'Side Drawer',
    category: 'modal',
    description: 'Slide-in side drawer with overlay',
    tags: ['drawer', 'slide', 'panel'],
    code: `import { useState } from 'react';
export function SideDrawer() {
  const [open, setOpen] = useState(false);
  return (
    <div className="p-8">
      <button onClick={() => setOpen(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg">Open Drawer</button>
      {open && <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setOpen(false)} />}
      <div className={\`fixed top-0 right-0 h-full w-80 bg-white dark:bg-gray-800 shadow-2xl z-50 transition-transform duration-300 \${open ? 'translate-x-0' : 'translate-x-full'}\`}>
        <div className="flex items-center justify-between p-5 border-b dark:border-gray-700">
          <h3 className="font-bold text-lg">Settings</h3>
          <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>
        <div className="p-5 space-y-4">
          {['Notifications','Privacy','Appearance','Language'].map(s => (
            <div key={s} className="flex items-center justify-between py-2 border-b dark:border-gray-700">
              <span className="text-sm">{s}</span>
              <div className="w-10 h-5 bg-indigo-600 rounded-full cursor-pointer" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}`,
  },
];
