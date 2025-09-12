import { BaseMCPClient, MCPToolCall, MCPToolResult } from './base-client';
import { BrowserbaseMCPClient, BrowserbaseConfig } from './browserbase-client';
import { DiscoMCPClient, DiscoConfig } from './disco-client';
import { SupabaseMCPClient, SupabaseConfig } from './supabase-client';
import { Tool, ToolCallContent, ToolResultContent } from './harmony-types';

export interface MCPManagerConfig {
  browserbase?: BrowserbaseConfig;
  disco?: DiscoConfig;
  supabase?: SupabaseConfig;
}

export class MCPManager {
  private clients: Map<string, BaseMCPClient> = new Map();
  private toolToClientMap: Map<string, string> = new Map();

  constructor(config: MCPManagerConfig) {
    // Initialize clients based on configuration
    if (config.browserbase) {
      const client = new BrowserbaseMCPClient(config.browserbase);
      this.clients.set('browserbase', client);
    }

    if (config.disco) {
      const client = new DiscoMCPClient(config.disco);
      this.clients.set('disco', client);
    }

    if (config.supabase) {
      const client = new SupabaseMCPClient(config.supabase);
      this.clients.set('supabase', client);
    }
  }

  /**
   * Connect to all configured MCP servers
   */
  async connect(): Promise<void> {
    const connectionPromises = Array.from(this.clients.entries()).map(async ([name, client]) => {
      try {
        await client.connect();
        this.mapToolsToClient(name, client);
        console.log(`Connected to ${name} MCP server`);
      } catch (error) {
        console.error(`Failed to connect to ${name} MCP server:`, error);
        // Don't throw here, allow other connections to proceed
      }
    });

    await Promise.all(connectionPromises);
  }

  /**
   * Disconnect from all MCP servers
   */
  async disconnect(): Promise<void> {
    const disconnectionPromises = Array.from(this.clients.values()).map(client => 
      client.disconnect().catch(error => 
        console.error('Error disconnecting from MCP server:', error)
      )
    );

    await Promise.all(disconnectionPromises);
    this.toolToClientMap.clear();
  }

  /**
   * Get all available tools from all connected clients
   */
  getAllTools(): Tool[] {
    const allTools: Tool[] = [];
    
    for (const client of this.clients.values()) {
      if (client.isReady()) {
        allTools.push(...client.getTools());
      }
    }

    return allTools;
  }

  /**
   * Get tools from a specific client
   */
  getToolsFromClient(clientName: string): Tool[] {
    const client = this.clients.get(clientName);
    return client?.isReady() ? client.getTools() : [];
  }

  /**
   * Get a specific tool by name
   */
  getTool(toolName: string): Tool | undefined {
    const clientName = this.toolToClientMap.get(toolName);
    if (!clientName) {
      return undefined;
    }

    const client = this.clients.get(clientName);
    return client?.getTool(toolName);
  }

  /**
   * Check if a tool exists
   */
  hasTool(toolName: string): boolean {
    return this.toolToClientMap.has(toolName);
  }

  /**
   * Execute a tool call
   */
  async executeTool(toolCall: ToolCallContent): Promise<ToolResultContent> {
    const clientName = this.toolToClientMap.get(toolCall.name);
    if (!clientName) {
      return {
        type: 'tool_result',
        tool_call_id: toolCall.id,
        result: null,
        error: `Tool '${toolCall.name}' not found in any connected MCP server`,
      };
    }

    const client = this.clients.get(clientName);
    if (!client || !client.isReady()) {
      return {
        type: 'tool_result',
        tool_call_id: toolCall.id,
        result: null,
        error: `MCP client '${clientName}' is not ready`,
      };
    }

    try {
      const mcpToolCall: MCPToolCall = {
        name: toolCall.name,
        arguments: toolCall.parameters,
      };

      const result = await client.executeTool(mcpToolCall);
      return this.convertMCPResultToHarmony(result, toolCall.id);
    } catch (error) {
      return {
        type: 'tool_result',
        tool_call_id: toolCall.id,
        result: null,
        error: error instanceof Error ? error.message : 'Unknown error executing tool',
      };
    }
  }

  /**
   * Execute multiple tool calls in parallel
   */
  async executeTools(toolCalls: ToolCallContent[]): Promise<ToolResultContent[]> {
    const executionPromises = toolCalls.map(toolCall => this.executeTool(toolCall));
    return Promise.all(executionPromises);
  }

  /**
   * Get the status of all MCP clients
   */
  getClientStatus(): Record<string, { connected: boolean; toolCount: number; tools: string[] }> {
    const status: Record<string, { connected: boolean; toolCount: number; tools: string[] }> = {};

    for (const [name, client] of this.clients.entries()) {
      const tools = client.isReady() ? client.getTools() : [];
      status[name] = {
        connected: client.isReady(),
        toolCount: tools.length,
        tools: tools.map(tool => tool.name),
      };
    }

    return status;
  }

  /**
   * Get tools by category/client type
   */
  getToolsByCategory(): Record<string, Tool[]> {
    const categories: Record<string, Tool[]> = {};

    for (const [name, client] of this.clients.entries()) {
      if (client.isReady()) {
        categories[name] = client.getTools();
      }
    }

    return categories;
  }

  /**
   * Search for tools by name or description
   */
  searchTools(query: string): Tool[] {
    const allTools = this.getAllTools();
    const lowerQuery = query.toLowerCase();

    return allTools.filter(tool => 
      tool.name.toLowerCase().includes(lowerQuery) ||
      tool.description.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get a specific client instance
   */
  getClient(clientName: string): BaseMCPClient | undefined {
    return this.clients.get(clientName);
  }

  /**
   * Check if all clients are ready
   */
  isReady(): boolean {
    return Array.from(this.clients.values()).every(client => client.isReady());
  }

  /**
   * Get the number of connected clients
   */
  getConnectedClientCount(): number {
    return Array.from(this.clients.values()).filter(client => client.isReady()).length;
  }

  /**
   * Map tools to their respective clients for quick lookup
   */
  private mapToolsToClient(clientName: string, client: BaseMCPClient): void {
    const tools = client.getTools();
    for (const tool of tools) {
      this.toolToClientMap.set(tool.name, clientName);
    }
  }

  /**
   * Convert MCP result to Harmony format
   */
  private convertMCPResultToHarmony(result: MCPToolResult, toolCallId: string): ToolResultContent {
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
   * Refresh tool mappings (useful after reconnecting)
   */
  async refreshToolMappings(): Promise<void> {
    this.toolToClientMap.clear();
    
    for (const [name, client] of this.clients.entries()) {
      if (client.isReady()) {
        this.mapToolsToClient(name, client);
      }
    }
  }

  /**
   * Add a new client dynamically
   */
  addClient(name: string, client: BaseMCPClient): void {
    this.clients.set(name, client);
  }

  /**
   * Remove a client
   */
  async removeClient(name: string): Promise<void> {
    const client = this.clients.get(name);
    if (client) {
      await client.disconnect();
      this.clients.delete(name);
      
      // Remove tool mappings for this client
      for (const [toolName, clientName] of this.toolToClientMap.entries()) {
        if (clientName === name) {
          this.toolToClientMap.delete(toolName);
        }
      }
    }
  }
}

