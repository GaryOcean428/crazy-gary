import { BaseMCPClient, MCPClientConfig, MCPTool, MCPToolCall, MCPToolResult } from './base-client';

export interface SupabaseConfig extends MCPClientConfig {
  projectId?: string;
  databaseUrl?: string;
}

export class SupabaseMCPClient extends BaseMCPClient {
  private projectId?: string;
  private databaseUrl?: string;

  constructor(config: SupabaseConfig) {
    super(config);
    this.projectId = config.projectId;
    this.databaseUrl = config.databaseUrl;
  }

  async connect(): Promise<void> {
    try {
      // Discover available tools from Supabase MCP
      await this.discoverTools();
      this.isConnected = true;
    } catch (error) {
      throw new Error(`Failed to connect to Supabase MCP: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async disconnect(): Promise<void> {
    this.isConnected = false;
    this.tools.clear();
  }

  async executeTool(toolCall: MCPToolCall): Promise<MCPToolResult> {
    if (!this.isConnected) {
      throw new Error('Not connected to Supabase MCP');
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
          projectId: this.projectId,
          databaseUrl: this.databaseUrl,
        }),
      });

      if (!response.ok) {
        throw new Error(`Supabase tool execution failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return this.formatSupabaseResult(result);
    });
  }

  private async discoverTools(): Promise<void> {
    // Define Supabase tools based on the Prisma Postgres MCP server capabilities
    const supabaseTools: MCPTool[] = [
      {
        name: 'supabase_database_create',
        description: 'Create a new Supabase database',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Name of the database to create',
              required: true,
            },
            region: {
              type: 'string',
              description: 'Region for the database (optional)',
              required: false,
            },
          },
          required: ['name'],
        },
      },
      {
        name: 'supabase_database_delete',
        description: 'Delete a Supabase database',
        inputSchema: {
          type: 'object',
          properties: {
            databaseId: {
              type: 'string',
              description: 'ID of the database to delete',
              required: true,
            },
          },
          required: ['databaseId'],
        },
      },
      {
        name: 'supabase_database_list',
        description: 'List all Supabase databases',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'supabase_query_execute',
        description: 'Execute a SQL query on the Supabase database',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'SQL query to execute',
              required: true,
            },
            parameters: {
              type: 'array',
              description: 'Parameters for the SQL query',
              required: false,
            },
            databaseId: {
              type: 'string',
              description: 'Database ID (optional if using default)',
              required: false,
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'supabase_schema_introspect',
        description: 'Introspect the database schema',
        inputSchema: {
          type: 'object',
          properties: {
            databaseId: {
              type: 'string',
              description: 'Database ID (optional if using default)',
              required: false,
            },
          },
        },
      },
      {
        name: 'supabase_table_create',
        description: 'Create a new table in the database',
        inputSchema: {
          type: 'object',
          properties: {
            tableName: {
              type: 'string',
              description: 'Name of the table to create',
              required: true,
            },
            columns: {
              type: 'array',
              description: 'Array of column definitions',
              required: true,
            },
            databaseId: {
              type: 'string',
              description: 'Database ID (optional if using default)',
              required: false,
            },
          },
          required: ['tableName', 'columns'],
        },
      },
      {
        name: 'supabase_table_drop',
        description: 'Drop a table from the database',
        inputSchema: {
          type: 'object',
          properties: {
            tableName: {
              type: 'string',
              description: 'Name of the table to drop',
              required: true,
            },
            databaseId: {
              type: 'string',
              description: 'Database ID (optional if using default)',
              required: false,
            },
          },
          required: ['tableName'],
        },
      },
      {
        name: 'supabase_data_insert',
        description: 'Insert data into a table',
        inputSchema: {
          type: 'object',
          properties: {
            tableName: {
              type: 'string',
              description: 'Name of the table to insert into',
              required: true,
            },
            data: {
              type: 'object',
              description: 'Data to insert',
              required: true,
            },
            databaseId: {
              type: 'string',
              description: 'Database ID (optional if using default)',
              required: false,
            },
          },
          required: ['tableName', 'data'],
        },
      },
      {
        name: 'supabase_data_select',
        description: 'Select data from a table',
        inputSchema: {
          type: 'object',
          properties: {
            tableName: {
              type: 'string',
              description: 'Name of the table to select from',
              required: true,
            },
            columns: {
              type: 'array',
              description: 'Columns to select (optional, defaults to all)',
              required: false,
            },
            where: {
              type: 'object',
              description: 'WHERE conditions',
              required: false,
            },
            limit: {
              type: 'number',
              description: 'Limit number of results',
              required: false,
            },
            databaseId: {
              type: 'string',
              description: 'Database ID (optional if using default)',
              required: false,
            },
          },
          required: ['tableName'],
        },
      },
      {
        name: 'supabase_data_update',
        description: 'Update data in a table',
        inputSchema: {
          type: 'object',
          properties: {
            tableName: {
              type: 'string',
              description: 'Name of the table to update',
              required: true,
            },
            data: {
              type: 'object',
              description: 'Data to update',
              required: true,
            },
            where: {
              type: 'object',
              description: 'WHERE conditions for the update',
              required: true,
            },
            databaseId: {
              type: 'string',
              description: 'Database ID (optional if using default)',
              required: false,
            },
          },
          required: ['tableName', 'data', 'where'],
        },
      },
      {
        name: 'supabase_data_delete',
        description: 'Delete data from a table',
        inputSchema: {
          type: 'object',
          properties: {
            tableName: {
              type: 'string',
              description: 'Name of the table to delete from',
              required: true,
            },
            where: {
              type: 'object',
              description: 'WHERE conditions for the deletion',
              required: true,
            },
            databaseId: {
              type: 'string',
              description: 'Database ID (optional if using default)',
              required: false,
            },
          },
          required: ['tableName', 'where'],
        },
      },
      {
        name: 'supabase_backup_create',
        description: 'Create a backup of the database',
        inputSchema: {
          type: 'object',
          properties: {
            backupName: {
              type: 'string',
              description: 'Name for the backup',
              required: true,
            },
            databaseId: {
              type: 'string',
              description: 'Database ID (optional if using default)',
              required: false,
            },
          },
          required: ['backupName'],
        },
      },
      {
        name: 'supabase_backup_restore',
        description: 'Restore a database from backup',
        inputSchema: {
          type: 'object',
          properties: {
            backupId: {
              type: 'string',
              description: 'ID of the backup to restore',
              required: true,
            },
            databaseId: {
              type: 'string',
              description: 'Database ID (optional if using default)',
              required: false,
            },
          },
          required: ['backupId'],
        },
      },
      {
        name: 'supabase_backup_list',
        description: 'List all available backups',
        inputSchema: {
          type: 'object',
          properties: {
            databaseId: {
              type: 'string',
              description: 'Database ID (optional if using default)',
              required: false,
            },
          },
        },
      },
      {
        name: 'supabase_connection_string_get',
        description: 'Get the connection string for a database',
        inputSchema: {
          type: 'object',
          properties: {
            databaseId: {
              type: 'string',
              description: 'Database ID (optional if using default)',
              required: false,
            },
          },
        },
      },
      {
        name: 'supabase_auth_user_create',
        description: 'Create a new user in Supabase Auth',
        inputSchema: {
          type: 'object',
          properties: {
            email: {
              type: 'string',
              description: 'User email address',
              required: true,
            },
            password: {
              type: 'string',
              description: 'User password',
              required: true,
            },
            metadata: {
              type: 'object',
              description: 'Additional user metadata',
              required: false,
            },
          },
          required: ['email', 'password'],
        },
      },
      {
        name: 'supabase_auth_user_delete',
        description: 'Delete a user from Supabase Auth',
        inputSchema: {
          type: 'object',
          properties: {
            userId: {
              type: 'string',
              description: 'ID of the user to delete',
              required: true,
            },
          },
          required: ['userId'],
        },
      },
      {
        name: 'supabase_storage_upload',
        description: 'Upload a file to Supabase Storage',
        inputSchema: {
          type: 'object',
          properties: {
            bucket: {
              type: 'string',
              description: 'Storage bucket name',
              required: true,
            },
            path: {
              type: 'string',
              description: 'File path in the bucket',
              required: true,
            },
            file: {
              type: 'string',
              description: 'File content (base64 encoded)',
              required: true,
            },
            contentType: {
              type: 'string',
              description: 'MIME type of the file',
              required: false,
            },
          },
          required: ['bucket', 'path', 'file'],
        },
      },
      {
        name: 'supabase_storage_download',
        description: 'Download a file from Supabase Storage',
        inputSchema: {
          type: 'object',
          properties: {
            bucket: {
              type: 'string',
              description: 'Storage bucket name',
              required: true,
            },
            path: {
              type: 'string',
              description: 'File path in the bucket',
              required: true,
            },
          },
          required: ['bucket', 'path'],
        },
      },
    ];

    // Add tools to the tools map
    for (const tool of supabaseTools) {
      this.tools.set(tool.name, tool);
    }
  }

  private formatSupabaseResult(result: any): MCPToolResult {
    // Handle different types of Supabase responses
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

    // Handle query execution results
    if (result.rows !== undefined) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result.rows, null, 2),
            data: {
              rows: result.rows,
              rowCount: result.rowCount,
              fields: result.fields,
            },
          },
        ],
      };
    }

    // Handle schema introspection results
    if (result.schema) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result.schema, null, 2),
            data: result.schema,
          },
        ],
      };
    }

    // Handle database creation results
    if (result.databaseId) {
      return {
        content: [
          {
            type: 'text',
            text: `Database created: ${result.databaseId}`,
            data: { databaseId: result.databaseId },
          },
        ],
      };
    }

    // Handle database list results
    if (result.databases) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result.databases, null, 2),
            data: result.databases,
          },
        ],
      };
    }

    // Handle backup results
    if (result.backupId) {
      return {
        content: [
          {
            type: 'text',
            text: `Backup created: ${result.backupId}`,
            data: { backupId: result.backupId },
          },
        ],
      };
    }

    // Handle backup list results
    if (result.backups) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result.backups, null, 2),
            data: result.backups,
          },
        ],
      };
    }

    // Handle connection string results
    if (result.connectionString) {
      return {
        content: [
          {
            type: 'text',
            text: result.connectionString,
            data: { connectionString: result.connectionString },
          },
        ],
      };
    }

    // Handle user creation results
    if (result.userId) {
      return {
        content: [
          {
            type: 'text',
            text: `User created: ${result.userId}`,
            data: { userId: result.userId },
          },
        ],
      };
    }

    // Handle file upload results
    if (result.fileUrl) {
      return {
        content: [
          {
            type: 'text',
            text: `File uploaded: ${result.fileUrl}`,
            data: { fileUrl: result.fileUrl },
          },
        ],
      };
    }

    // Handle file download results
    if (result.fileContent) {
      return {
        content: [
          {
            type: 'text',
            text: 'File downloaded successfully',
            data: { 
              content: result.fileContent,
              contentType: result.contentType,
              size: result.size,
            },
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
   * Set the project ID for subsequent operations
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

  /**
   * Set the database URL for operations
   */
  setDatabaseUrl(databaseUrl: string): void {
    this.databaseUrl = databaseUrl;
  }

  /**
   * Get the current database URL
   */
  getDatabaseUrl(): string | undefined {
    return this.databaseUrl;
  }
}

