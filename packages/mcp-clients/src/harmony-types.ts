// Local types for Harmony integration (to avoid circular dependencies)

export interface Tool {
  name: string;
  description: string;
  parameters: Record<string, any>;
}

export interface ToolCallContent {
  type: 'tool_call';
  name: string;
  parameters: Record<string, any>;
  id: string;
}

export interface ToolResultContent {
  type: 'tool_result';
  tool_call_id: string;
  result: any;
  error?: string;
}

export interface HarmonyMessage {
  messages: Message[];
  tools?: Tool[];
  settings?: any;
  metadata?: Record<string, any>;
}

export interface Message {
  role: string;
  content: Content[];
  timestamp?: string;
  id?: string;
}

export interface Content {
  type: string;
  text?: string;
  value?: Record<string, any>;
  url?: string;
  alt?: string;
  steps?: string[];
  name?: string;
  parameters?: Record<string, any>;
  id?: string;
  tool_call_id?: string;
  result?: any;
  error?: string;
}

