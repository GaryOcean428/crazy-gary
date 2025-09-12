import { BaseMCPClient, MCPClientConfig, MCPTool, MCPToolCall, MCPToolResult } from './base-client';

export interface DiscoConfig extends MCPClientConfig {
  containerId?: string;
  workspaceId?: string;
}

export class DiscoMCPClient extends BaseMCPClient {
  private containerId?: string;
  private workspaceId?: string;

  constructor(config: DiscoConfig) {
    super(config);
    this.containerId = config.containerId;
    this.workspaceId = config.workspaceId;
  }

  async connect(): Promise<void> {
    try {
      // Discover available tools from Disco MCP
      await this.discoverTools();
      this.isConnected = true;
    } catch (error) {
      throw new Error(`Failed to connect to Disco MCP: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async disconnect(): Promise<void> {
    this.isConnected = false;
    this.tools.clear();
  }

  async executeTool(toolCall: MCPToolCall): Promise<MCPToolResult> {
    if (!this.isConnected) {
      throw new Error('Not connected to Disco MCP');
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
          containerId: this.containerId,
          workspaceId: this.workspaceId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Disco tool execution failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return this.formatDiscoResult(result);
    });
  }

  private async discoverTools(): Promise<void> {
    // Define Disco tools based on the WebContainer technology and development environment capabilities
    const discoTools: MCPTool[] = [
      {
        name: 'disco_container_create',
        description: 'Create a new WebContainer development environment',
        inputSchema: {
          type: 'object',
          properties: {
            template: {
              type: 'string',
              description: 'Template to use for the container (e.g., "node", "react", "vue", "angular")',
              required: false,
            },
            name: {
              type: 'string',
              description: 'Name for the container',
              required: false,
            },
          },
        },
      },
      {
        name: 'disco_container_list',
        description: 'List all available WebContainer environments',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'disco_container_delete',
        description: 'Delete a WebContainer environment',
        inputSchema: {
          type: 'object',
          properties: {
            containerId: {
              type: 'string',
              description: 'ID of the container to delete',
              required: true,
            },
          },
          required: ['containerId'],
        },
      },
      {
        name: 'disco_file_read',
        description: 'Read a file from the WebContainer filesystem',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Path to the file to read',
              required: true,
            },
            containerId: {
              type: 'string',
              description: 'Container ID (optional if using default)',
              required: false,
            },
          },
          required: ['path'],
        },
      },
      {
        name: 'disco_file_write',
        description: 'Write content to a file in the WebContainer filesystem',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Path to the file to write',
              required: true,
            },
            content: {
              type: 'string',
              description: 'Content to write to the file',
              required: true,
            },
            containerId: {
              type: 'string',
              description: 'Container ID (optional if using default)',
              required: false,
            },
          },
          required: ['path', 'content'],
        },
      },
      {
        name: 'disco_file_delete',
        description: 'Delete a file from the WebContainer filesystem',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Path to the file to delete',
              required: true,
            },
            containerId: {
              type: 'string',
              description: 'Container ID (optional if using default)',
              required: false,
            },
          },
          required: ['path'],
        },
      },
      {
        name: 'disco_directory_list',
        description: 'List contents of a directory in the WebContainer',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Path to the directory to list',
              required: true,
            },
            containerId: {
              type: 'string',
              description: 'Container ID (optional if using default)',
              required: false,
            },
          },
          required: ['path'],
        },
      },
      {
        name: 'disco_terminal_execute',
        description: 'Execute a command in the WebContainer terminal',
        inputSchema: {
          type: 'object',
          properties: {
            command: {
              type: 'string',
              description: 'Command to execute',
              required: true,
            },
            workingDirectory: {
              type: 'string',
              description: 'Working directory for the command',
              required: false,
            },
            containerId: {
              type: 'string',
              description: 'Container ID (optional if using default)',
              required: false,
            },
          },
          required: ['command'],
        },
      },
      {
        name: 'disco_terminal_stream',
        description: 'Start a streaming terminal session',
        inputSchema: {
          type: 'object',
          properties: {
            containerId: {
              type: 'string',
              description: 'Container ID (optional if using default)',
              required: false,
            },
          },
        },
      },
      {
        name: 'disco_npm_install',
        description: 'Install npm packages in the WebContainer',
        inputSchema: {
          type: 'object',
          properties: {
            packages: {
              type: 'array',
              description: 'Array of package names to install',
              required: true,
            },
            dev: {
              type: 'boolean',
              description: 'Install as dev dependencies',
              required: false,
            },
            containerId: {
              type: 'string',
              description: 'Container ID (optional if using default)',
              required: false,
            },
          },
          required: ['packages'],
        },
      },
      {
        name: 'disco_npm_run',
        description: 'Run an npm script in the WebContainer',
        inputSchema: {
          type: 'object',
          properties: {
            script: {
              type: 'string',
              description: 'npm script to run (e.g., "start", "build", "test")',
              required: true,
            },
            containerId: {
              type: 'string',
              description: 'Container ID (optional if using default)',
              required: false,
            },
          },
          required: ['script'],
        },
      },
      {
        name: 'disco_git_clone',
        description: 'Clone a git repository into the WebContainer',
        inputSchema: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              description: 'Git repository URL to clone',
              required: true,
            },
            directory: {
              type: 'string',
              description: 'Directory to clone into',
              required: false,
            },
            containerId: {
              type: 'string',
              description: 'Container ID (optional if using default)',
              required: false,
            },
          },
          required: ['url'],
        },
      },
      {
        name: 'disco_git_commit',
        description: 'Commit changes in the WebContainer git repository',
        inputSchema: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Commit message',
              required: true,
            },
            files: {
              type: 'array',
              description: 'Files to add to the commit (optional, defaults to all)',
              required: false,
            },
            containerId: {
              type: 'string',
              description: 'Container ID (optional if using default)',
              required: false,
            },
          },
          required: ['message'],
        },
      },
      {
        name: 'disco_git_push',
        description: 'Push changes to remote git repository',
        inputSchema: {
          type: 'object',
          properties: {
            remote: {
              type: 'string',
              description: 'Remote name (defaults to "origin")',
              required: false,
            },
            branch: {
              type: 'string',
              description: 'Branch name (defaults to current branch)',
              required: false,
            },
            containerId: {
              type: 'string',
              description: 'Container ID (optional if using default)',
              required: false,
            },
          },
        },
      },
      {
        name: 'disco_server_start',
        description: 'Start a development server in the WebContainer',
        inputSchema: {
          type: 'object',
          properties: {
            port: {
              type: 'number',
              description: 'Port to start the server on',
              required: false,
            },
            command: {
              type: 'string',
              description: 'Custom command to start the server',
              required: false,
            },
            containerId: {
              type: 'string',
              description: 'Container ID (optional if using default)',
              required: false,
            },
          },
        },
      },
      {
        name: 'disco_server_stop',
        description: 'Stop a running development server',
        inputSchema: {
          type: 'object',
          properties: {
            port: {
              type: 'number',
              description: 'Port of the server to stop',
              required: false,
            },
            containerId: {
              type: 'string',
              description: 'Container ID (optional if using default)',
              required: false,
            },
          },
        },
      },
      {
        name: 'disco_preview_url',
        description: 'Get the preview URL for a running server',
        inputSchema: {
          type: 'object',
          properties: {
            port: {
              type: 'number',
              description: 'Port of the server',
              required: false,
            },
            containerId: {
              type: 'string',
              description: 'Container ID (optional if using default)',
              required: false,
            },
          },
        },
      },
      {
        name: 'disco_workspace_sync',
        description: 'Sync workspace with external repository or storage',
        inputSchema: {
          type: 'object',
          properties: {
            source: {
              type: 'string',
              description: 'Source to sync from (git URL, etc.)',
              required: true,
            },
            containerId: {
              type: 'string',
              description: 'Container ID (optional if using default)',
              required: false,
            },
          },
          required: ['source'],
        },
      },
    ];

    // Add tools to the tools map
    for (const tool of discoTools) {
      this.tools.set(tool.name, tool);
    }
  }

  private formatDiscoResult(result: any): MCPToolResult {
    // Handle different types of Disco responses
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

    // Handle file read results
    if (result.content !== undefined) {
      return {
        content: [
          {
            type: 'text',
            text: result.content,
          },
        ],
      };
    }

    // Handle directory listing results
    if (result.files) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result.files, null, 2),
            data: result.files,
          },
        ],
      };
    }

    // Handle terminal execution results
    if (result.stdout !== undefined || result.stderr !== undefined) {
      const output = [];
      if (result.stdout) {
        output.push(`STDOUT:\n${result.stdout}`);
      }
      if (result.stderr) {
        output.push(`STDERR:\n${result.stderr}`);
      }
      
      return {
        content: [
          {
            type: 'text',
            text: output.join('\n\n'),
            data: {
              stdout: result.stdout,
              stderr: result.stderr,
              exitCode: result.exitCode,
            },
          },
        ],
        isError: result.exitCode !== 0,
      };
    }

    // Handle container creation results
    if (result.containerId) {
      return {
        content: [
          {
            type: 'text',
            text: `Container created: ${result.containerId}`,
            data: { containerId: result.containerId },
          },
        ],
      };
    }

    // Handle container list results
    if (result.containers) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result.containers, null, 2),
            data: result.containers,
          },
        ],
      };
    }

    // Handle server start results
    if (result.serverUrl) {
      return {
        content: [
          {
            type: 'text',
            text: `Server started at: ${result.serverUrl}`,
            data: { serverUrl: result.serverUrl, port: result.port },
          },
        ],
      };
    }

    // Handle preview URL results
    if (result.previewUrl) {
      return {
        content: [
          {
            type: 'text',
            text: result.previewUrl,
            data: { previewUrl: result.previewUrl },
          },
        ],
      };
    }

    // Handle git operation results
    if (result.gitResult) {
      return {
        content: [
          {
            type: 'text',
            text: result.gitResult,
            data: result,
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
   * Set the container ID for subsequent operations
   */
  setContainerId(containerId: string): void {
    this.containerId = containerId;
  }

  /**
   * Get the current container ID
   */
  getContainerId(): string | undefined {
    return this.containerId;
  }

  /**
   * Set the workspace ID for operations
   */
  setWorkspaceId(workspaceId: string): void {
    this.workspaceId = workspaceId;
  }

  /**
   * Get the current workspace ID
   */
  getWorkspaceId(): string | undefined {
    return this.workspaceId;
  }
}

