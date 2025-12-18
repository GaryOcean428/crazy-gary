// Re-export types from schemas for better consistency and type safety
export type {
  User as UserSchema,
  Task as TaskSchema,
  Message as MessageSchema,
  Agent as AgentSchema,
  ModelEndpoint as ModelEndpointSchema,
  MCPTool as MCPToolSchema,
  SystemMetrics as SystemMetricsSchema,
  AuthUser as AuthUserSchema,
  AuthResponse as AuthResponseSchema,
  ApiResponse as ApiResponseSchema,
  PaginatedResponse as PaginatedResponseSchema,
  CreateTaskRequest as CreateTaskRequestSchema,
  UpdateTaskRequest as UpdateTaskRequestSchema,
  SendMessageRequest as SendMessageRequestSchema,
  PaginationParams as PaginationParamsSchema,
  SearchParams as SearchParamsSchema,
  DateRange as DateRangeSchema,
  Settings as SettingsSchema,
} from '@/schemas/api'

export type {
  LoginFormData as LoginFormSchema,
  RegisterFormData as RegisterFormSchema,
  ChangePasswordFormData as ChangePasswordFormSchema,
  ProfileUpdateFormData as ProfileUpdateFormSchema,
} from '@/schemas/auth'

// Core application types (deprecated - use schema types instead)
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin' | 'enterprise';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
  userId?: string;
  progress?: number;
  result?: Record<string, unknown>;
  error?: string;
}

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface Agent {
  id: string;
  name: string;
  status: 'idle' | 'busy' | 'error';
  capabilities: string[];
  currentTask?: string;
}

export interface ModelEndpoint {
  id: string;
  name: string;
  provider: string;
  status: 'running' | 'stopped' | 'error';
  url?: string;
  parameters?: string;
  cost?: string;
  auto_sleep_in?: number;
}

export interface MCPTool {
  name: string;
  description: string;
  parameters?: Record<string, unknown>;
  provider: string;
}

export interface SystemMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: {
    up: number;
    down: number;
  };
}

// Component Props Types
export interface SidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  currentTask?: Task | null;
}

export interface TaskManagerProps {
  setCurrentTask: (task: Task | null) => void;
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Auth Types
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  token?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: AuthUser;
  token?: string;
  error?: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<AuthResponse>;
  updateProfile: (profileData: Partial<AuthUser>) => Promise<AuthResponse>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<AuthResponse>;
  refreshToken: () => Promise<AuthResponse>;
  isAuthenticated: boolean;
}

// Form Types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// Enhanced Theme Types
export type Theme = 'light' | 'dark' | 'high-contrast' | 'system';
export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeColors {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  border: string;
  input: string;
  ring: string;
  chart1: string;
  chart2: string;
  chart3: string;
  chart4: string;
  chart5: string;
  sidebar: string;
  sidebarForeground: string;
  sidebarPrimary: string;
  sidebarPrimaryForeground: string;
  sidebarAccent: string;
  sidebarAccentForeground: string;
  sidebarBorder: string;
  sidebarRing: string;
}

export interface ThemeGradients {
  primary: string;
  secondary: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
}

export interface ThemeShadows {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  soft: string;
  moderate: string;
  strong: string;
}

export interface ThemeTokens {
  colors: ThemeColors;
  gradients: ThemeGradients;
  shadows: ThemeShadows;
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      '2xl': string;
    };
    fontWeight: {
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };
    lineHeight: {
      tight: number;
      normal: number;
      relaxed: number;
    };
  };
  animation: {
    duration: {
      fast: string;
      normal: string;
      slow: string;
    };
    easing: {
      easeOut: string;
      easeIn: string;
      easeInOut: string;
    };
  };
}

export interface ThemeConfig {
  mode: Theme;
  tokens: ThemeTokens;
  transitions: {
    duration: number;
    easing: string;
    enableTransitions: boolean;
  };
  persistence: {
    storageKey: string;
    syncWithSystem: boolean;
    savePreferences: boolean;
  };
  accessibility: {
    minimumContrast: number;
    respectReducedMotion: boolean;
    focusIndicators: boolean;
  };
  customization: {
    allowUserCustomization: boolean;
    defaultCustomTheme: ThemeTokens | null;
    customThemes: Record<string, ThemeTokens>;
  };
}

export interface ThemeTransition {
  duration: number;
  easing: string;
  properties: string[];
}

export interface ThemeProviderState {
  theme: Theme;
  config: ThemeConfig;
  isTransitioning: boolean;
  systemTheme: ThemeMode;
  setTheme: (theme: Theme) => void;
  setConfig: (config: Partial<ThemeConfig>) => void;
  toggleTheme: () => void;
  resetToSystem: () => void;
  validateTheme: (theme: Theme) => boolean;
}

export interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  defaultConfig?: Partial<ThemeConfig>;
  storageKey?: string;
  enableTransitions?: boolean;
  enableHighContrast?: boolean;
  enableCustomization?: boolean;
}

// Error Handling Types
export interface ErrorInfo {
  componentStack: string;
  errorBoundary?: string;
  timestamp: number;
  userAgent: string;
  url: string;
  userId?: string;
  sessionId?: string;
}

export interface ErrorReport {
  id: string;
  error: Error;
  errorInfo: ErrorInfo;
  context: Record<string, unknown>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  componentType: string;
  userAction?: string;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
  retryCount: number;
  isRetrying: boolean;
  lastRetryAt: number | null;
}

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorBoundaryFallbackProps>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onRetry?: (error: Error) => void;
  maxRetries?: number;
  retryDelay?: number;
  componentType?: string;
  context?: Record<string, unknown>;
  enableRetry?: boolean;
  enableErrorReporting?: boolean;
  enableRecovery?: boolean;
}

export interface ErrorBoundaryFallbackProps {
  error: Error;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
  retryCount: number;
  isRetrying: boolean;
  onRetry: () => void;
  onReload: () => void;
  onGoHome: () => void;
  onReportError: () => void;
  onDismiss: () => void;
  maxRetries: number;
  enableRetry: boolean;
  enableErrorReporting: boolean;
}

// Navigation and Routing Types
export interface NavigationItem {
  title: string;
  href: string;
  icon?: string;
  badge?: string;
  children?: NavigationItem[];
  disabled?: boolean;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

// Form and Validation Types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'select' | 'textarea' | 'checkbox' | 'radio';
  required?: boolean;
  placeholder?: string;
  options?: Array<{ label: string; value: string }>;
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
  };
}

export interface FormError {
  field: string;
  message: string;
}

// UI Component Types
export interface LoadingState {
  loading: boolean;
  message?: string;
}

export interface ErrorState {
  error: boolean;
  message: string;
  details?: string;
}

export interface StatusState {
  status: 'idle' | 'loading' | 'success' | 'error';
  message?: string;
}

// Event and Handler Types
export type EventHandler<T = void> = (data?: T) => void;

export interface ClickHandler extends EventHandler {
  (event: React.MouseEvent<HTMLElement>): void;
}

export interface InputHandler extends EventHandler {
  (event: React.ChangeEvent<HTMLInputElement>): void;
}

// Performance and Monitoring Types
export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
}

export interface MonitoringData {
  cpu: number;
  memory: number;
  disk: number;
  network: {
    up: number;
    down: number;
  };
  responseTime: number;
  errorRate: number;
}

// Configuration Types
export interface AppConfig {
  apiUrl: string;
  environment: 'development' | 'staging' | 'production';
  features: {
    analytics: boolean;
    monitoring: boolean;
    debug: boolean;
  };
  limits: {
    maxFileSize: number;
    maxRequests: number;
  };
}

// Export all React types that are commonly used
export type { ReactNode, ReactElement } from 'react'
export type { ClassValue } from 'clsx'