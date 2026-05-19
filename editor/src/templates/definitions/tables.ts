import type { Template } from '../../lib/schemas';

export const tableTemplates: Template[] = [
  {
    id: 'table-data',
    name: 'Data Table',
    category: 'table',
    description: 'Sortable data table with pagination and row actions',
    tags: ['table', 'sort', 'pagination'],
    code: `import { useState } from 'react';
const SAMPLE = Array.from({length:20},(_,i)=>({ id:i+1, name:\`User \${i+1}\`, email:\`user\${i+1}@example.com\`, role: i%3===0?'Admin':i%3===1?'Editor':'Viewer', status: i%4===0?'Inactive':'Active' }));
export function DataTable() {
  const [page,setPage]=useState(1); const PAGE=8;
  const rows=SAMPLE.slice((page-1)*PAGE,page*PAGE);
  const pages=Math.ceil(SAMPLE.length/PAGE);
  return (
    <div className="p-4">
      <div className="flex justify-between mb-3"><h2 className="font-bold text-lg">Users</h2><button className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm">+ Add User</button></div>
      <div className="overflow-x-auto rounded-xl border dark:border-gray-700">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>{['#','Name','Email','Role','Status','Actions'].map(h=><th key={h} className="px-4 py-3 text-left font-semibold text-gray-500">{h}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map(r=>(
              <tr key={r.id} className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="px-4 py-3 text-gray-400">{r.id}</td>
                <td className="px-4 py-3 font-medium">{r.name}</td>
                <td className="px-4 py-3 text-gray-500">{r.email}</td>
                <td className="px-4 py-3"><span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 px-2 py-0.5 rounded-full text-xs">{r.role}</span></td>
                <td className="px-4 py-3"><span className={r.status==='Active'?'text-green-600':'text-gray-400'}>{r.status}</span></td>
                <td className="px-4 py-3"><button className="text-indigo-600 hover:underline text-xs">Edit</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between items-center mt-3 text-sm">
        <span className="text-gray-400">Page {page} of {pages}</span>
        <div className="flex gap-2">
          <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} className="px-3 py-1 rounded border disabled:opacity-40 dark:border-gray-700">Prev</button>
          <button onClick={()=>setPage(p=>Math.min(pages,p+1))} disabled={page===pages} className="px-3 py-1 rounded border disabled:opacity-40 dark:border-gray-700">Next</button>
        </div>
      </div>
    </div>
  );
}`,
  },
];
