import type { Template } from '../lib/schemas';
import { dashboardTemplates } from './definitions/dashboards';
import { formTemplates } from './definitions/forms';
import { tableTemplates } from './definitions/tables';
import { modalTemplates } from './definitions/modals';
import { cardTemplates } from './definitions/cards';
import { navTemplates } from './definitions/nav';
import { chartTemplates } from './definitions/charts';
import { sidebarTemplates } from './definitions/sidebars';

export const ALL_TEMPLATES: Template[] = [
  ...dashboardTemplates,
  ...formTemplates,
  ...tableTemplates,
  ...modalTemplates,
  ...cardTemplates,
  ...navTemplates,
  ...chartTemplates,
  ...sidebarTemplates,
];

export const CATEGORIES = ['dashboard', 'form', 'table', 'modal', 'card', 'nav', 'chart', 'sidebar'] as const;

export function getByCategory(category: string): Template[] {
  return ALL_TEMPLATES.filter((t) => t.category === category);
}

export function searchTemplates(query: string): Template[] {
  const q = query.toLowerCase();
  return ALL_TEMPLATES.filter((t) =>
    t.name.toLowerCase().includes(q) ||
    t.description.toLowerCase().includes(q) ||
    t.tags.some((tag) => tag.includes(q))
  );
}
