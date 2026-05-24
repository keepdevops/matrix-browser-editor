'use strict';

const { z } = require('zod');

const AgentResponseSchema = z.object({
  code: z.string().min(1, 'code must not be empty'),
  language: z.enum(['tsx', 'jsx', 'ts', 'js']).default('tsx'),
  componentName: z.string().min(1),
  description: z.string().optional(),
  dependencies: z.array(z.string()).default([]),
});

const AgentStreamChunkSchema = z.object({
  type: z.enum(['delta', 'done', 'error']),
  content: z.string().optional(),
  error: z.string().optional(),
});

const ConnectorRequestSchema = z.object({
  mode: z.enum(['export', 'analyze', 'inject', 'live']),
  projectPath: z.string().optional(),
  componentCode: z.string().optional(),
  componentName: z.string().optional(),
  targetFile: z.string().optional(),
  styleSystem: z.string().optional(),
});

const PromptRequestSchema = z.object({
  prompt: z.string().min(1, 'prompt is required'),
  styleSystem: z.enum(['tailwind', 'shadcn', 'mui', 'antd', 'chakra', 'mantine']).default('tailwind'),
  theme: z.enum(['light', 'dark']).default('light'),
  templateCode: z.string().optional(),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).default([]),
  screenshotImage: z.string()
    .regex(/^[A-Za-z0-9+/=]+$/, 'screenshotImage must be plain base64')
    .optional(),
  preferredBackend: z.enum(['auto', 'llamacpp', 'swarm', 'claude']).default('auto'),
});

function validate(schema, data) {
  const result = schema.safeParse(data);
  if (!result.success) {
    const issues = result.error.issues ?? result.error.errors ?? [];
    const message = issues.map(e => `${e.path.join('.')}: ${e.message}`).join('; ');
    throw new Error(`Validation failed: ${message}`);
  }
  return result.data;
}

module.exports = {
  AgentResponseSchema,
  AgentStreamChunkSchema,
  ConnectorRequestSchema,
  PromptRequestSchema,
  validate,
};
