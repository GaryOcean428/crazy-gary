import { z } from 'zod';

// Content types for messages
export const TextContentSchema = z.object({
  type: z.literal('text'),
  text: z.string(),
});

export const JsonContentSchema = z.object({
  type: z.literal('json'),
  value: z.record(z.any()),
});

export const ImageContentSchema = z.object({
  type: z.literal('image'),
  url: z.string(),
  alt: z.string().optional(),
});

export const PlanContentSchema = z.object({
  type: z.literal('plan'),
  text: z.string(),
  steps: z.array(z.string()).optional(),
});

export const ToolCallContentSchema = z.object({
  type: z.literal('tool_call'),
  name: z.string(),
  parameters: z.record(z.any()),
  id: z.string(),
});

export const ToolResultContentSchema = z.object({
  type: z.literal('tool_result'),
  tool_call_id: z.string(),
  result: z.any(),
  error: z.string().optional(),
});

export const ContentSchema = z.union([
  TextContentSchema,
  JsonContentSchema,
  ImageContentSchema,
  PlanContentSchema,
  ToolCallContentSchema,
  ToolResultContentSchema,
]);

// Message roles
export const MessageRoleSchema = z.enum(['user', 'assistant', 'tool', 'system']);

// Message schema
export const MessageSchema = z.object({
  role: MessageRoleSchema,
  content: z.array(ContentSchema),
  timestamp: z.string().optional(),
  id: z.string().optional(),
});

// Tool parameter schema
export const ToolParameterSchema = z.object({
  type: z.string(),
  description: z.string(),
  required: z.boolean().optional(),
  enum: z.array(z.string()).optional(),
  properties: z.record(z.any()).optional(),
});

// Tool schema
export const ToolSchema = z.object({
  name: z.string(),
  description: z.string(),
  parameters: z.record(ToolParameterSchema),
});

// Model settings schema
export const ModelSettingsSchema = z.object({
  model: z.enum(['120b', '20b']),
  temperature: z.number().min(0).max(2).default(0.7),
  top_p: z.number().min(0).max(1).default(0.9),
  top_k: z.number().min(1).max(100).default(50),
  max_tokens: z.number().min(1).max(8192).default(2048),
  presence_penalty: z.number().min(-2).max(2).default(0),
  frequency_penalty: z.number().min(-2).max(2).default(0),
  seed: z.number().optional(),
});

// Main Harmony message schema
export const HarmonyMessageSchema = z.object({
  messages: z.array(MessageSchema),
  tools: z.array(ToolSchema).optional(),
  settings: ModelSettingsSchema.optional(),
  metadata: z.record(z.any()).optional(),
});

// Type exports
export type TextContent = z.infer<typeof TextContentSchema>;
export type JsonContent = z.infer<typeof JsonContentSchema>;
export type ImageContent = z.infer<typeof ImageContentSchema>;
export type PlanContent = z.infer<typeof PlanContentSchema>;
export type ToolCallContent = z.infer<typeof ToolCallContentSchema>;
export type ToolResultContent = z.infer<typeof ToolResultContentSchema>;
export type Content = z.infer<typeof ContentSchema>;

export type MessageRole = z.infer<typeof MessageRoleSchema>;
export type Message = z.infer<typeof MessageSchema>;

export type ToolParameter = z.infer<typeof ToolParameterSchema>;
export type Tool = z.infer<typeof ToolSchema>;

export type ModelSettings = z.infer<typeof ModelSettingsSchema>;
export type HarmonyMessage = z.infer<typeof HarmonyMessageSchema>;

// Error types
export class HarmonyValidationError extends Error {
  constructor(message: string, public details?: any) {
    super(message);
    this.name = 'HarmonyValidationError';
  }
}

export class ModelError extends Error {
  constructor(message: string, public modelType?: string, public originalError?: Error) {
    super(message);
    this.name = 'ModelError';
  }
}

export class ToolError extends Error {
  constructor(message: string, public toolName?: string, public originalError?: Error) {
    super(message);
    this.name = 'ToolError';
  }
}

