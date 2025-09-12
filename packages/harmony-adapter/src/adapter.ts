import { HarmonyValidator } from './validator';
import {
  type HarmonyMessage,
  type Message,
  type Content,
  type Tool,
  type ModelSettings,
  type TextContent,
  type JsonContent,
  type ToolCallContent,
  type ToolResultContent,
  HarmonyValidationError,
  ModelError,
} from './types';

export interface ModelResponse {
  content: Content[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model: string;
  finish_reason?: string;
}

export interface ModelClient {
  generateResponse(messages: Message[], settings: ModelSettings, tools?: Tool[]): Promise<ModelResponse>;
  isAvailable(): Promise<boolean>;
}

export class HarmonyAdapter {
  private model120bClient?: ModelClient;
  private model20bClient?: ModelClient;

  constructor(model120bClient?: ModelClient, model20bClient?: ModelClient) {
    this.model120bClient = model120bClient;
    this.model20bClient = model20bClient;
  }

  /**
   * Sets the 120B model client
   */
  setModel120bClient(client: ModelClient): void {
    this.model120bClient = client;
  }

  /**
   * Sets the 20B model client
   */
  setModel20bClient(client: ModelClient): void {
    this.model20bClient = client;
  }

  /**
   * Processes a Harmony message and returns a response
   */
  async processMessage(harmonyMessage: HarmonyMessage): Promise<HarmonyMessage> {
    // Validate the input message
    const validatedMessage = HarmonyValidator.validateHarmonyMessage(harmonyMessage);
    
    const { messages, tools = [], settings } = validatedMessage;
    const modelSettings = settings || {
      model: '120b',
      temperature: 0.7,
      top_p: 0.9,
      top_k: 50,
      max_tokens: 2048,
      presence_penalty: 0,
      frequency_penalty: 0,
    };

    try {
      // Try primary model first
      const response = await this.generateWithFallback(messages, modelSettings, tools);
      
      // Create response message
      const responseMessage: Message = {
        role: 'assistant',
        content: response.content,
        timestamp: new Date().toISOString(),
        id: this.generateMessageId(),
      };

      // Return new Harmony message with response
      return {
        messages: [...messages, responseMessage],
        tools,
        settings: modelSettings,
        metadata: {
          ...validatedMessage.metadata,
          model_used: response.model,
          usage: response.usage,
          finish_reason: response.finish_reason,
        },
      };
    } catch (error) {
      throw new ModelError(
        `Failed to process message: ${error instanceof Error ? error.message : 'Unknown error'}`,
        modelSettings.model,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Generates response with automatic fallback from 120B to 20B model
   */
  private async generateWithFallback(
    messages: Message[],
    settings: ModelSettings,
    tools: Tool[]
  ): Promise<ModelResponse> {
    // Try primary model (120B) first
    if (settings.model === '120b' && this.model120bClient) {
      try {
        const isAvailable = await this.model120bClient.isAvailable();
        if (isAvailable) {
          return await this.model120bClient.generateResponse(messages, settings, tools);
        }
      } catch (error) {
        console.warn('120B model failed, falling back to 20B:', error);
      }
    }

    // Fallback to 20B model
    if (this.model20bClient) {
      try {
        const isAvailable = await this.model20bClient.isAvailable();
        if (isAvailable) {
          const fallbackSettings = { ...settings, model: '20b' as const };
          return await this.model20bClient.generateResponse(messages, fallbackSettings, tools);
        }
      } catch (error) {
        console.error('20B model also failed:', error);
        throw new ModelError('Both 120B and 20B models are unavailable', '20b', error instanceof Error ? error : undefined);
      }
    }

    throw new ModelError('No model clients available');
  }

  /**
   * Creates a user message from text input
   */
  createUserMessage(text: string): Message {
    const sanitizedText = HarmonyValidator.sanitizeUserInput(text);
    
    return {
      role: 'user',
      content: [
        {
          type: 'text',
          text: sanitizedText,
        } as TextContent,
      ],
      timestamp: new Date().toISOString(),
      id: this.generateMessageId(),
    };
  }

  /**
   * Creates a tool call message
   */
  createToolCallMessage(toolName: string, parameters: Record<string, any>, tools: Tool[]): Message {
    // Validate the tool call
    HarmonyValidator.validateToolCall(toolName, parameters, tools);

    const toolCallContent: ToolCallContent = {
      type: 'tool_call',
      name: toolName,
      parameters,
      id: this.generateToolCallId(),
    };

    return {
      role: 'assistant',
      content: [toolCallContent],
      timestamp: new Date().toISOString(),
      id: this.generateMessageId(),
    };
  }

  /**
   * Creates a tool result message
   */
  createToolResultMessage(toolCallId: string, result: any, error?: string): Message {
    const toolResultContent: ToolResultContent = {
      type: 'tool_result',
      tool_call_id: toolCallId,
      result,
      error,
    };

    return {
      role: 'tool',
      content: [toolResultContent],
      timestamp: new Date().toISOString(),
      id: this.generateMessageId(),
    };
  }

  /**
   * Creates a plan message
   */
  createPlanMessage(planText: string, steps?: string[]): Message {
    return {
      role: 'assistant',
      content: [
        {
          type: 'plan',
          text: planText,
          steps,
        },
      ],
      timestamp: new Date().toISOString(),
      id: this.generateMessageId(),
    };
  }

  /**
   * Extracts tool calls from a message
   */
  extractToolCalls(message: Message): ToolCallContent[] {
    return message.content.filter(
      (content): content is ToolCallContent => content.type === 'tool_call'
    );
  }

  /**
   * Extracts text content from a message
   */
  extractTextContent(message: Message): string {
    return message.content
      .filter((content): content is TextContent => content.type === 'text')
      .map(content => content.text)
      .join(' ');
  }

  /**
   * Converts messages to a format suitable for model APIs
   */
  convertToModelFormat(messages: Message[]): any[] {
    return messages.map(message => ({
      role: message.role,
      content: this.extractTextContent(message),
      timestamp: message.timestamp,
    }));
  }

  /**
   * Generates a unique message ID
   */
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generates a unique tool call ID
   */
  private generateToolCallId(): string {
    return `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Validates and normalizes model settings
   */
  static normalizeModelSettings(settings: Partial<ModelSettings>): ModelSettings {
    return HarmonyValidator.validateModelSettings({
      model: '120b',
      temperature: 0.7,
      top_p: 0.9,
      top_k: 50,
      max_tokens: 2048,
      presence_penalty: 0,
      frequency_penalty: 0,
      ...settings,
    });
  }

  /**
   * Creates an empty Harmony message
   */
  static createEmptyMessage(): HarmonyMessage {
    return {
      messages: [],
      tools: [],
      settings: {
        model: '120b',
        temperature: 0.7,
        top_p: 0.9,
        top_k: 50,
        max_tokens: 2048,
        presence_penalty: 0,
        frequency_penalty: 0,
      },
      metadata: {},
    };
  }
}

