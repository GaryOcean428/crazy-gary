/**
 * Barrel export for all page components
 * Centralized page imports for cleaner code
 */

// Page components
export { default as Chat } from './chat'
export { default as Dashboard } from './dashboard'
export { default as Heavy } from './heavy'
export { default as Login } from './login'
export { default as McpTools } from './mcp-tools'
export { default as ModelControl } from './model-control'
export { default as Monitoring } from './monitoring'
export { default as Observability } from './observability'
export { default as Register } from './register'
export { default as Settings } from './settings'
export { default as TaskManager } from './task-manager'
export { ResponsiveDesignDemo } from './responsive-design-demo'

// Demo pages
export { AccessibilityShowcasePage } from './accessibility-showcase'
export { default as AdvancedCacheDemoPage } from './advanced-cache-demo'
export { default as CacheDemo } from './cache-demo'

// Page route configurations
export interface PageConfig {
  path: string;
  component: React.ComponentType;
  title: string;
  description?: string;
  requiresAuth?: boolean;
  roles?: string[];
}

export const pageConfigs: PageConfig[] = [
  {
    path: '/',
    component: Dashboard,
    title: 'Dashboard',
    requiresAuth: true
  },
  {
    path: '/chat',
    component: Chat,
    title: 'Chat',
    requiresAuth: true
  },
  {
    path: '/login',
    component: Login,
    title: 'Login'
  },
  {
    path: '/register',
    component: Register,
    title: 'Register'
  },
  {
    path: '/settings',
    component: Settings,
    title: 'Settings',
    requiresAuth: true
  },
  {
    path: '/monitoring',
    component: Monitoring,
    title: 'Monitoring',
    requiresAuth: true,
    roles: ['admin', 'enterprise']
  },
  {
    path: '/observability',
    component: Observability,
    title: 'Observability',
    requiresAuth: true,
    roles: ['admin', 'enterprise']
  },
  {
    path: '/responsive-demo',
    component: ResponsiveDesignDemo,
    title: 'Responsive Design Demo',
    description: 'Comprehensive responsive design system showcase',
    requiresAuth: true
  }
]