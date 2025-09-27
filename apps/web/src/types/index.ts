// Core application types
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

// Theme Types
export type Theme = 'dark' | 'light' | 'system';

export interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}