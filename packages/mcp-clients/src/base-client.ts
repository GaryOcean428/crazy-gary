import { HarmonyMessage, Tool, ToolCallContent, ToolResultContent } from './harmony-types';

export interface MCPToolParameter {
  type: string;
  description: string;
  required?: boolean;
  enum?: string[];
  properties?: Record<string, any>;
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, MCPToolParameter>;
    required?: string[];
  };
}

export interface MCPToolCall {
  name: string;
  arguments: Record<string, any>;
}

export interface MCPToolResult {
  content: Array<{
    type: string;
    text?: string;
    data?: any;
    mimeType?: string;
  }>;
  isError?: boolean;
}

export interface MCPClientConfig {
  endpoint: string;
  apiKey?: string;
  timeout?: number;
  retries?: number;
}

export abstract class BaseMCPClient {
  protected config: MCPClientConfig;
  protected tools: Map<string, MCPTool> = new Map();
  protected isConnected: boolean = false;

  constructor(config: MCPClientConfig) {
    this.config = {
      timeout: 30000,
      retries: 3,
      ...config,
    };
  }

  /**
   * Connect to the MCP server and discover available tools
   */
  abstract connect(): Promise<void>;

  /**
   * Disconnect from the MCP server
   */
  abstract disconnect(): Promise<void>;

  /**
   * Execute a tool call
   */
  abstract executeTool(toolCall: MCPToolCall): Promise<MCPToolResult>;

  /**
   * Get all available tools
   */
  getTools(): Tool[] {
    return Array.from(this.tools.values()).map(mcpTool => this.convertMCPToolToHarmony(mcpTool));
  }

  /**
   * Get a specific tool by name
   */
  getTool(name: string): Tool | undefined {
    const mcpTool = this.tools.get(name);
    return mcpTool ? this.convertMCPToolToHarmony(mcpTool) : undefined;
  }

  /**
   * Check if a tool exists
   */
  hasTool(name: string): boolean {
    return this.tools.has(name);
  }

  /**
   * Get connection status
   */
  isReady(): boolean {
    return this.isConnected && this.tools.size > 0;
  }

  /**
   * Convert MCP tool to Harmony tool format
   */
  protected convertMCPToolToHarmony(mcpTool: MCPTool): Tool {
    const parameters: Record<string, any> = {};

    for (const [paramName, paramDef] of Object.entries(mcpTool.inputSchema.properties)) {
      parameters[paramName] = {
        type: paramDef.type,
        description: paramDef.description,
        required: mcpTool.inputSchema.required?.includes(paramName) || false,
        enum: paramDef.enum,
        properties: paramDef.properties,
      };
    }

    return {
      name: mcpTool.name,
      description: mcpTool.description,
      parameters,
    };
  }

  /**
   * Convert Harmony tool call to MCP tool call
   */
  protected convertHarmonyToolCallToMCP(toolCall: ToolCallContent): MCPToolCall {
    return {
      name: toolCall.name,
      arguments: toolCall.parameters,
    };
  }

  /**
   * Convert MCP tool result to Harmony tool result
   */
  protected convertMCPResultToHarmony(result: MCPToolResult, toolCallId: string): ToolResultContent {
    let resultData: any = result;
    let error: string | undefined;

    if (result.isError) {
      error = result.content.map(c => c.text || JSON.stringify(c.data)).join(' ');
      resultData = null;
    } else {
      // Extract the main result data
      if (result.content.length === 1) {
        const content = result.content[0];
        if (content.text) {
          resultData = content.text;
        } else if (content.data) {
          resultData = content.data;
        }
      } else {
        resultData = result.content;
      }
    }

    return {
      type: 'tool_result',
      tool_call_id: toolCallId,
      result: resultData,
      error,
    };
  }

  /**
   * Validate tool call parameters
   */
  protected validateToolCall(toolCall: MCPToolCall): void {
    const tool = this.tools.get(toolCall.name);
    if (!tool) {
      throw new Error(`Tool '${toolCall.name}' not found`);
    }

    const schema = tool.inputSchema;
    const required = schema.required || [];

    // Check required parameters
    for (const requiredParam of required) {
      if (!(requiredParam in toolCall.arguments)) {
        throw new Error(`Required parameter '${requiredParam}' missing for tool '${toolCall.name}'`);
      }
    }

    // Basic type validation
    for (const [paramName, value] of Object.entries(toolCall.arguments)) {
      const paramDef = schema.properties[paramName];
      if (!paramDef) {
        throw new Error(`Unknown parameter '${paramName}' for tool '${toolCall.name}'`);
      }

      // Type checking
      if (paramDef.type === 'string' && typeof value !== 'string') {
        throw new Error(`Parameter '${paramName}' must be a string`);
      }
      if (paramDef.type === 'number' && typeof value !== 'number') {
        throw new Error(`Parameter '${paramName}' must be a number`);
      }
      if (paramDef.type === 'boolean' && typeof value !== 'boolean') {
        throw new Error(`Parameter '${paramName}' must be a boolean`);
      }
      if (paramDef.type === 'array' && !Array.isArray(value)) {
        throw new Error(`Parameter '${paramName}' must be an array`);
      }
      if (paramDef.type === 'object' && (typeof value !== 'object' || Array.isArray(value))) {
        throw new Error(`Parameter '${paramName}' must be an object`);
      }
    }
  }

  /**
   * Retry mechanism for failed operations
   */
  protected async withRetry<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= this.config.retries!; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt === this.config.retries) {
          throw lastError;
        }

        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }
}

