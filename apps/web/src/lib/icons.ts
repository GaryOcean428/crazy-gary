/**
 * Shared icon constants to reduce import redundancy across components
 * Following DRY principle to centralize commonly used icons
 */

// Common UI Icons - Used across multiple components
export {
  // Basic Actions
  Send,
  Play,
  Pause,
  Square,
  Settings,
  Copy,
  Trash2,
  MoreVertical,
  ArrowUp,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  
  // Status & Feedback
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Loader2,
  
  // Visibility
  Eye,
  EyeOff,
  
  // Users & Entities
  User,
  Users,
  Bot,
  
  // System & Hardware
  Activity,
  Brain,
  Cpu,
  HardDrive,
  Network,
  Server,
  Zap,
  
  // Time & Progress
  Clock,
  
  // Charts & Analytics
  BarChart3,
  LineChart,
  PieChart,
  TrendingUp,
  
  // Tools & Features
  Wrench,
  Sparkles,
  
  // Communication
  MessageSquare,
  Mic,
  MicOff,
  
  // Media
  Image as ImageIcon,
  Paperclip,
  
  // Navigation
  Home,
  RefreshCw
} from 'lucide-react'

// Status badge variants - commonly used across components
export const STATUS_VARIANTS = {
  success: 'default',
  running: 'secondary',
  idle: 'outline',
  error: 'destructive',
  warning: 'secondary'
}

// Common status icons mapping
export const STATUS_ICONS = {
  success: 'CheckCircle',
  running: 'Activity',
  idle: 'Clock',
  error: 'AlertCircle',
  warning: 'AlertTriangle',
  loading: 'Loader2'
}

// Model status mapping for consistent display
export const MODEL_STATUS_CONFIG = {
  running: { icon: 'Activity', variant: 'secondary', color: 'text-green-600' },
  idle: { icon: 'Clock', variant: 'outline', color: 'text-yellow-600' },
  error: { icon: 'AlertCircle', variant: 'destructive', color: 'text-red-600' },
  loading: { icon: 'Loader2', variant: 'secondary', color: 'text-blue-600' }
}

// MCP tool status configuration
export const MCP_STATUS_CONFIG = {
  connected: { icon: 'CheckCircle', variant: 'default', color: 'text-green-600' },
  disconnected: { icon: 'AlertCircle', variant: 'destructive', color: 'text-red-600' },
  connecting: { icon: 'Loader2', variant: 'secondary', color: 'text-blue-600' }
}