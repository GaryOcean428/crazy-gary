import { BaseMCPClient, MCPClientConfig, MCPTool, MCPToolCall, MCPToolResult } from './base-client';

export interface BrowserbaseConfig extends MCPClientConfig {
  sessionId?: string;
  projectId?: string;
}

export class BrowserbaseMCPClient extends BaseMCPClient {
  private sessionId?: string;
  private projectId?: string;

  constructor(config: BrowserbaseConfig) {
    super(config);
    this.sessionId = config.sessionId;
    this.projectId = config.projectId;
  }

  async connect(): Promise<void> {
    try {
      // Discover available tools from Browserbase MCP
      await this.discoverTools();
      this.isConnected = true;
    } catch (error) {
      throw new Error(`Failed to connect to Browserbase MCP: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async disconnect(): Promise<void> {
    this.isConnected = false;
    this.tools.clear();
  }

  async executeTool(toolCall: MCPToolCall): Promise<MCPToolResult> {
    if (!this.isConnected) {
      throw new Error('Not connected to Browserbase MCP');
    }

    this.validateToolCall(toolCall);

    return this.withRetry(async () => {
      const response = await fetch(`${this.config.endpoint}/tools/${toolCall.name}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` }),
        },
        body: JSON.stringify({
          arguments: toolCall.arguments,
          sessionId: this.sessionId,
          projectId: this.projectId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Browserbase tool execution failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return this.formatBrowserbaseResult(result);
    });
  }

  private async discoverTools(): Promise<void> {
    // Define Browserbase tools based on the MCP specification
    const browserbaseTools: MCPTool[] = [
      {
        name: 'browserbase_session_create',
        description: 'Create or reuse a single cloud browser session using Browserbase with fully initialized Stagehand',
        inputSchema: {
          type: 'object',
          properties: {
            sessionId: {
              type: 'string',
              description: 'Optional session ID to use/reuse. If not provided or invalid, a new session is created.',
              required: false,
            },
          },
        },
      },
      {
        name: 'browserbase_session_close',
        description: 'Closes the current Browserbase session by properly shutting down the Stagehand instance',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'browserbase_stagehand_navigate',
        description: 'Navigate to a URL in the browser',
        inputSchema: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              description: 'The URL to navigate to',
              required: true,
            },
          },
          required: ['url'],
        },
      },
      {
        name: 'browserbase_stagehand_act',
        description: 'Performs an action on a web page element',
        inputSchema: {
          type: 'object',
          properties: {
            action: {
              type: 'string',
              description: 'The action to perform. Should be as atomic and specific as possible',
              required: true,
            },
            variables: {
              type: 'object',
              description: 'Variables used in the action template for sensitive data or dynamic content',
              required: false,
            },
          },
          required: ['action'],
        },
      },
      {
        name: 'browserbase_stagehand_extract',
        description: 'Extracts structured information and text content from the current web page',
        inputSchema: {
          type: 'object',
          properties: {
            instruction: {
              type: 'string',
              description: 'The specific instruction for what information to extract from the current page',
              required: true,
            },
          },
          required: ['instruction'],
        },
      },
      {
        name: 'browserbase_stagehand_observe',
        description: 'Observes and identifies specific interactive elements on the current web page',
        inputSchema: {
          type: 'object',
          properties: {
            instruction: {
              type: 'string',
              description: 'Detailed instruction for what specific elements or components to observe',
              required: true,
            },
            returnAction: {
              type: 'boolean',
              description: 'Whether to return the action to perform on the element',
              required: false,
            },
          },
          required: ['instruction'],
        },
      },
      {
        name: 'browserbase_screenshot',
        description: 'Takes a screenshot of the current page',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'browserbase_stagehand_get_url',
        description: 'Gets the current URL of the browser page',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'multi_browserbase_stagehand_session_create',
        description: 'Create parallel browser session for multi-session workflows',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Descriptive name for tracking multiple sessions',
              required: false,
            },
            browserbaseSessionID: {
              type: 'string',
              description: 'Resume an existing Browserbase session by providing its session ID',
              required: false,
            },
          },
        },
      },
      {
        name: 'multi_browserbase_stagehand_session_list',
        description: 'Track all parallel sessions - shows all active browser sessions',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'multi_browserbase_stagehand_session_close',
        description: 'Cleanup parallel session for multi-session workflows',
        inputSchema: {
          type: 'object',
          properties: {
            sessionId: {
              type: 'string',
              description: 'Exact session ID to close',
              required: true,
            },
          },
          required: ['sessionId'],
        },
      },
      {
        name: 'multi_browserbase_stagehand_navigate_session',
        description: 'Navigate to a URL in a specific browser session',
        inputSchema: {
          type: 'object',
          properties: {
            sessionId: {
              type: 'string',
              description: 'The session ID to use',
              required: true,
            },
            url: {
              type: 'string',
              description: 'The URL to navigate to',
              required: true,
            },
          },
          required: ['sessionId', 'url'],
        },
      },
      {
        name: 'multi_browserbase_stagehand_act_session',
        description: 'Performs an action on a web page element in a specific session',
        inputSchema: {
          type: 'object',
          properties: {
            sessionId: {
              type: 'string',
              description: 'The session ID to use',
              required: true,
            },
            action: {
              type: 'string',
              description: 'The action to perform',
              required: true,
            },
            variables: {
              type: 'object',
              description: 'Variables used in the action template',
              required: false,
            },
          },
          required: ['sessionId', 'action'],
        },
      },
      {
        name: 'multi_browserbase_stagehand_extract_session',
        description: 'Extracts structured information from a web page in a specific session',
        inputSchema: {
          type: 'object',
          properties: {
            sessionId: {
              type: 'string',
              description: 'The session ID to use',
              required: true,
            },
            instruction: {
              type: 'string',
              description: 'The specific instruction for what information to extract',
              required: true,
            },
          },
          required: ['sessionId', 'instruction'],
        },
      },
      {
        name: 'multi_browserbase_stagehand_observe_session',
        description: 'Observes and identifies interactive elements in a specific session',
        inputSchema: {
          type: 'object',
          properties: {
            sessionId: {
              type: 'string',
              description: 'The session ID to use',
              required: true,
            },
            instruction: {
              type: 'string',
              description: 'Detailed instruction for what elements to observe',
              required: true,
            },
            returnAction: {
              type: 'boolean',
              description: 'Whether to return the action to perform on the element',
              required: false,
            },
          },
          required: ['sessionId', 'instruction'],
        },
      },
      {
        name: 'multi_browserbase_stagehand_get_url_session',
        description: 'Gets the current URL of a specific browser session',
        inputSchema: {
          type: 'object',
          properties: {
            sessionId: {
              type: 'string',
              description: 'The session ID to use',
              required: true,
            },
          },
          required: ['sessionId'],
        },
      },
      {
        name: 'browserbase_stagehand_get_all_urls',
        description: 'Gets the current URLs of all active browser sessions',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ];

    // Add tools to the tools map
    for (const tool of browserbaseTools) {
      this.tools.set(tool.name, tool);
    }
  }

  private formatBrowserbaseResult(result: any): MCPToolResult {
    // Handle different types of Browserbase responses
    if (result.error) {
      return {
        content: [
          {
            type: 'text',
            text: result.error,
          },
        ],
        isError: true,
      };
    }

    // Handle screenshot results
    if (result.screenshot) {
      return {
        content: [
          {
            type: 'image',
            data: result.screenshot,
            mimeType: 'image/png',
          },
        ],
      };
    }

    // Handle extraction results
    if (result.extracted_content) {
      return {
        content: [
          {
            type: 'text',
            text: typeof result.extracted_content === 'string' 
              ? result.extracted_content 
              : JSON.stringify(result.extracted_content),
          },
        ],
      };
    }

    // Handle observation results
    if (result.elements) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result.elements),
          },
        ],
      };
    }

    // Handle session creation results
    if (result.sessionId) {
      return {
        content: [
          {
            type: 'text',
            text: `Session created: ${result.sessionId}`,
            data: { sessionId: result.sessionId },
          },
        ],
      };
    }

    // Handle URL results
    if (result.url) {
      return {
        content: [
          {
            type: 'text',
            text: result.url,
          },
        ],
      };
    }

    // Handle session list results
    if (result.sessions) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result.sessions),
            data: result.sessions,
          },
        ],
      };
    }

    // Default handling for other results
    return {
      content: [
        {
          type: 'text',
          text: typeof result === 'string' ? result : JSON.stringify(result),
          data: result,
        },
      ],
    };
  }

  /**
   * Set the session ID for subsequent operations
   */
  setSessionId(sessionId: string): void {
    this.sessionId = sessionId;
  }

  /**
   * Get the current session ID
   */
  getSessionId(): string | undefined {
    return this.sessionId;
  }

  /**
   * Set the project ID for operations
   */
  setProjectId(projectId: string): void {
    this.projectId = projectId;
  }

  /**
   * Get the current project ID
   */
  getProjectId(): string | undefined {
    return this.projectId;
  }
}

