import { z } from 'zod';

export const StyleSystemSchema = z.enum(['tailwind', 'shadcn', 'mui', 'antd', 'chakra', 'mantine']);
export type StyleSystem = z.infer<typeof StyleSystemSchema>;

export const ThemeSchema = z.enum(['light', 'dark']);
export type Theme = z.infer<typeof ThemeSchema>;

export const AgentMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
  timestamp: z.number(),
  isStreaming: z.boolean().optional(),
  error: z.string().optional(),
});
export type AgentMessage = z.infer<typeof AgentMessageSchema>;

export const ParsedComponentSchema = z.object({
  componentName: z.string(),
  language: z.enum(['tsx', 'jsx', 'ts', 'js']),
  description: z.string().optional(),
  dependencies: z.array(z.string()),
  code: z.string(),
});
export type ParsedComponent = z.infer<typeof ParsedComponentSchema>;

export const TemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.enum(['dashboard', 'form', 'table', 'modal', 'card', 'nav', 'chart', 'sidebar']),
  styleSystem: StyleSystemSchema.optional(),
  description: z.string(),
  code: z.string(),
  tags: z.array(z.string()).default([]),
});
export type Template = z.infer<typeof TemplateSchema>;

export const STYLE_SYSTEMS: { id: StyleSystem; label: string; color: string }[] = [
  { id: 'tailwind', label: 'Tailwind CSS', color: '#06b6d4' },
  { id: 'shadcn', label: 'shadcn/ui', color: '#18181b' },
  { id: 'mui', label: 'Material UI', color: '#1976d2' },
  { id: 'antd', label: 'Ant Design', color: '#1677ff' },
  { id: 'chakra', label: 'Chakra UI', color: '#319795' },
  { id: 'mantine', label: 'Mantine', color: '#339af0' },
];
