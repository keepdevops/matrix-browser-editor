import type { Template } from '../../lib/schemas';

export const chartTemplates: Template[] = [
  {
    id: 'chart-bar',
    name: 'Bar Chart',
    category: 'chart',
    description: 'Animated SVG bar chart with hover tooltips and labels',
    tags: ['bar', 'chart', 'svg', 'analytics'],
    code: `import { useState } from 'react';
export function BarChart() {
  const data = [
    { label: 'Jan', value: 42 },
    { label: 'Feb', value: 68 },
    { label: 'Mar', value: 55 },
    { label: 'Apr', value: 90 },
    { label: 'May', value: 74 },
    { label: 'Jun', value: 83 },
  ];
  const [hovered, setHovered] = useState<number | null>(null);
  const max = Math.max(...data.map(d => d.value));
  const h = 200;
  const barW = 40;
  const gap = 20;
  const width = data.length * (barW + gap) - gap + 40;
  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow max-w-lg">
      <h3 className="font-bold text-lg dark:text-white mb-4">Monthly Revenue</h3>
      <svg width={width} height={h + 40} className="overflow-visible">
        {data.map((d, i) => {
          const barH = (d.value / max) * h;
          const x = i * (barW + gap) + 20;
          const y = h - barH;
          const isHov = hovered === i;
          return (
            <g key={d.label} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
              <rect x={x} y={y} width={barW} height={barH} rx={6}
                fill={isHov ? '#4f46e5' : '#818cf8'} className="transition-all duration-200" />
              {isHov && (
                <text x={x + barW / 2} y={y - 8} textAnchor="middle" fontSize={12} fill="#4f46e5" fontWeight="bold">
                  {d.value}
                </text>
              )}
              <text x={x + barW / 2} y={h + 20} textAnchor="middle" fontSize={12} fill="#9ca3af">{d.label}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}`,
  },
  {
    id: 'chart-line',
    name: 'Line Chart',
    category: 'chart',
    description: 'SVG sparkline with gradient fill and data point tooltips',
    tags: ['line', 'sparkline', 'svg', 'gradient'],
    code: `import { useState } from 'react';
export function LineChart() {
  const data = [30, 52, 38, 65, 48, 78, 60, 90, 72, 88, 76, 95];
  const labels = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const [hovered, setHovered] = useState<number | null>(null);
  const w = 480; const h = 160; const pad = 20;
  const max = Math.max(...data); const min = Math.min(...data);
  const px = (i: number) => pad + (i / (data.length - 1)) * (w - pad * 2);
  const py = (v: number) => h - pad - ((v - min) / (max - min)) * (h - pad * 2);
  const points = data.map((v, i) => \`\${px(i)},\${py(v)}\`).join(' ');
  const areaPoints = \`\${px(0)},\${h - pad} \${points} \${px(data.length - 1)},\${h - pad}\`;
  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow max-w-lg">
      <h3 className="font-bold text-lg dark:text-white mb-4">Growth Trend</h3>
      <svg width={w} height={h} className="overflow-visible">
        <defs>
          <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={areaPoints} fill="url(#grad)" />
        <polyline points={points} fill="none" stroke="#6366f1" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        {data.map((v, i) => (
          <g key={i} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
            <circle cx={px(i)} cy={py(v)} r={hovered === i ? 6 : 4}
              fill={hovered === i ? '#4f46e5' : '#fff'} stroke="#6366f1" strokeWidth={2} className="transition-all duration-150 cursor-pointer" />
            {hovered === i && (
              <text x={px(i)} y={py(v) - 12} textAnchor="middle" fontSize={11} fontWeight="bold" fill="#4f46e5">
                {v}
              </text>
            )}
            <text x={px(i)} y={h + 4} textAnchor="middle" fontSize={10} fill="#9ca3af">{labels[i]}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}`,
  },
  {
    id: 'chart-donut',
    name: 'Donut Chart',
    category: 'chart',
    description: 'SVG donut chart with legend and center stat',
    tags: ['donut', 'pie', 'svg', 'legend'],
    code: `import { useState } from 'react';
export function DonutChart() {
  const segments = [
    { label: 'Direct', value: 35, color: '#6366f1' },
    { label: 'Organic', value: 28, color: '#06b6d4' },
    { label: 'Referral', value: 22, color: '#f59e0b' },
    { label: 'Social', value: 15, color: '#10b981' },
  ];
  const [hovered, setHovered] = useState<number | null>(null);
  const total = segments.reduce((s, d) => s + d.value, 0);
  const cx = 80; const cy = 80; const r = 60; const inner = 36;
  let angle = -Math.PI / 2;
  const arcs = segments.map((seg, i) => {
    const sweep = (seg.value / total) * 2 * Math.PI;
    const x1 = cx + r * Math.cos(angle);
    const y1 = cy + r * Math.sin(angle);
    angle += sweep;
    const x2 = cx + r * Math.cos(angle);
    const y2 = cy + r * Math.sin(angle);
    const ix1 = cx + inner * Math.cos(angle - sweep);
    const iy1 = cy + inner * Math.sin(angle - sweep);
    const ix2 = cx + inner * Math.cos(angle);
    const iy2 = cy + inner * Math.sin(angle);
    const large = sweep > Math.PI ? 1 : 0;
    return { ...seg, path: \`M\${x1} \${y1} A\${r} \${r} 0 \${large} 1 \${x2} \${y2} L\${ix2} \${iy2} A\${inner} \${inner} 0 \${large} 0 \${ix1} \${iy1} Z\` };
  });
  const hov = hovered !== null ? segments[hovered] : null;
  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow inline-flex gap-8 items-center">
      <svg width={160} height={160}>
        {arcs.map((arc, i) => (
          <path key={arc.label} d={arc.path} fill={arc.color}
            opacity={hovered === null || hovered === i ? 1 : 0.4}
            className="transition-opacity duration-150 cursor-pointer"
            onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)} />
        ))}
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize={18} fontWeight="bold" fill={hov?.color ?? '#6366f1'}>
          {hov ? hov.value + '%' : total + '%'}
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize={10} fill="#9ca3af">
          {hov ? hov.label : 'Total'}
        </text>
      </svg>
      <ul className="space-y-2">
        {segments.map((s, i) => (
          <li key={s.label} className="flex items-center gap-2 text-sm cursor-pointer"
            onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: s.color }} />
            <span className="dark:text-gray-300">{s.label}</span>
            <span className="font-semibold dark:text-white ml-auto">{s.value}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}`,
  },
];
