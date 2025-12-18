import { z } from 'zod'

// Base API response schema
export const apiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z.string().optional(),
    message: z.string().optional(),
  })

// Paginated response schema
export const paginatedResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  apiResponseSchema(
    z.array(dataSchema)
  ).and(
    z.object({
      pagination: z.object({
        page: z.number().min(1),
        limit: z.number().min(1),
        total: z.number().min(0),
        pages: z.number().min(0),
      }),
    })
  )

// Common API entity schemas
export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().min(1),
  role: z.enum(['user', 'admin', 'enterprise']),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
})

export const taskSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(['pending', 'running', 'completed', 'failed', 'cancelled']),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  userId: z.string().optional(),
  progress: z.number().min(0).max(100).optional(),
  result: z.record(z.any()).optional(),
  error: z.string().optional(),
})

export const messageSchema = z.object({
  id: z.string(),
  content: z.string().min(1),
  role: z.enum(['user', 'assistant', 'system']),
  timestamp: z.string().datetime(),
  metadata: z.record(z.any()).optional(),
})

export const agentSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  status: z.enum(['idle', 'busy', 'error']),
  capabilities: z.array(z.string()),
  currentTask: z.string().optional(),
})

export const modelEndpointSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  provider: z.string().min(1),
  status: z.enum(['running', 'stopped', 'error']),
  url: z.string().url().optional(),
  parameters: z.string().optional(),
  cost: z.string().optional(),
  auto_sleep_in: z.number().min(0).optional(),
})

export const mcpToolSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  parameters: z.record(z.any()).optional(),
  provider: z.string().min(1),
})

export const systemMetricsSchema = z.object({
  cpu: z.number().min(0).max(100),
  memory: z.number().min(0).max(100),
  disk: z.number().min(0).max(100),
  network: z.object({
    up: z.number().min(0),
    down: z.number().min(0),
  }),
})

// Auth-related schemas
export const authUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().min(1),
  role: z.string(),
  token: z.string().optional(),
})

export const authResponseSchema = z.object({
  success: z.boolean(),
  user: authUserSchema.optional(),
  token: z.string().optional(),
  error: z.string().optional(),
})

// Request schemas
export const createTaskRequestSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
})

export const updateTaskRequestSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  status: z.enum(['pending', 'running', 'completed', 'failed', 'cancelled']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  progress: z.number().min(0).max(100).optional(),
})

export const sendMessageRequestSchema = z.object({
  content: z.string().min(1, 'Message content is required').max(4000, 'Message must be less than 4000 characters'),
  role: z.enum(['user', 'assistant', 'system']).default('user'),
  metadata: z.record(z.any()).optional(),
})

// Form-related schemas
export const paginationParamsSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
})

export const searchParamsSchema = z.object({
  query: z.string().max(100).optional(),
  filters: z.record(z.any()).optional(),
  ...paginationParamsSchema.shape,
})

// Date range schema
export const dateRangeSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
}).refine((data) => {
  if (data.startDate && data.endDate) {
    return new Date(data.startDate) <= new Date(data.endDate)
  }
  return true
}, {
  message: 'Start date must be before end date',
  path: ['startDate'],
})

// Settings schema
export const settingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).default('system'),
  notifications: z.object({
    email: z.boolean().default(true),
    push: z.boolean().default(true),
    inApp: z.boolean().default(true),
  }).default({
    email: true,
    push: true,
    inApp: true,
  }),
  language: z.string().default('en'),
  timezone: z.string().default('UTC'),
})

// Type inference
export type ApiResponse<T> = z.infer<ReturnType<typeof apiResponseSchema<T>>>
export type PaginatedResponse<T> = z.infer<ReturnType<typeof paginatedResponseSchema<T>>>

export type User = z.infer<typeof userSchema>
export type Task = z.infer<typeof taskSchema>
export type Message = z.infer<typeof messageSchema>
export type Agent = z.infer<typeof agentSchema>
export type ModelEndpoint = z.infer<typeof modelEndpointSchema>
export type MCPTool = z.infer<typeof mcpToolSchema>
export type SystemMetrics = z.infer<typeof systemMetricsSchema>
export type AuthUser = z.infer<typeof authUserSchema>
export type AuthResponse = z.infer<typeof authResponseSchema>

export type CreateTaskRequest = z.infer<typeof createTaskRequestSchema>
export type UpdateTaskRequest = z.infer<typeof updateTaskRequestSchema>
export type SendMessageRequest = z.infer<typeof sendMessageRequestSchema>
export type PaginationParams = z.infer<typeof paginationParamsSchema>
export type SearchParams = z.infer<typeof searchParamsSchema>
export type DateRange = z.infer<typeof dateRangeSchema>
export type Settings = z.infer<typeof settingsSchema>