import { z } from 'zod';
import {
  HarmonyMessageSchema,
  MessageSchema,
  ContentSchema,
  ToolSchema,
  ModelSettingsSchema,
  HarmonyValidationError,
  type HarmonyMessage,
  type Message,
  type Content,
  type Tool,
  type ModelSettings,
} from './types';

export class HarmonyValidator {
  /**
   * Validates a complete Harmony message
   */
  static validateHarmonyMessage(data: unknown): HarmonyMessage {
    try {
      return HarmonyMessageSchema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new HarmonyValidationError(
          'Invalid Harmony message format',
          error.errors
        );
      }
      throw error;
    }
  }

  /**
   * Validates a single message
   */
  static validateMessage(data: unknown): Message {
    try {
      return MessageSchema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new HarmonyValidationError(
          'Invalid message format',
          error.errors
        );
      }
      throw error;
    }
  }

  /**
   * Validates message content
   */
  static validateContent(data: unknown): Content {
    try {
      return ContentSchema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new HarmonyValidationError(
          'Invalid content format',
          error.errors
        );
      }
      throw error;
    }
  }

  /**
   * Validates a tool definition
   */
  static validateTool(data: unknown): Tool {
    try {
      return ToolSchema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new HarmonyValidationError(
          'Invalid tool format',
          error.errors
        );
      }
      throw error;
    }
  }

  /**
   * Validates model settings
   */
  static validateModelSettings(data: unknown): ModelSettings {
    try {
      return ModelSettingsSchema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new HarmonyValidationError(
          'Invalid model settings format',
          error.errors
        );
      }
      throw error;
    }
  }

  /**
   * Safely validates and returns default values for partial data
   */
  static validatePartialHarmonyMessage(data: Partial<HarmonyMessage>): HarmonyMessage {
    const defaultMessage: HarmonyMessage = {
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

    const merged = {
      ...defaultMessage,
      ...data,
      settings: {
        ...defaultMessage.settings,
        ...data.settings,
      },
    };

    return this.validateHarmonyMessage(merged);
  }

  /**
   * Checks if data is a valid Harmony message without throwing
   */
  static isValidHarmonyMessage(data: unknown): data is HarmonyMessage {
    try {
      this.validateHarmonyMessage(data);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Checks if data is a valid message without throwing
   */
  static isValidMessage(data: unknown): data is Message {
    try {
      this.validateMessage(data);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Sanitizes and validates user input for safety
   */
  static sanitizeUserInput(input: string): string {
    // Remove potentially dangerous characters and normalize
    return input
      .replace(/[<>]/g, '') // Remove HTML-like tags
      .replace(/javascript:/gi, '') // Remove javascript: protocols
      .replace(/data:/gi, '') // Remove data: protocols
      .trim()
      .slice(0, 10000); // Limit length
  }

  /**
   * Validates tool call parameters against tool schema
   */
  static validateToolCall(toolName: string, parameters: Record<string, any>, tools: Tool[]): boolean {
    const tool = tools.find(t => t.name === toolName);
    if (!tool) {
      throw new HarmonyValidationError(`Tool '${toolName}' not found in available tools`);
    }

    // Check required parameters
    for (const [paramName, paramDef] of Object.entries(tool.parameters)) {
      if (paramDef.required && !(paramName in parameters)) {
        throw new HarmonyValidationError(
          `Required parameter '${paramName}' missing for tool '${toolName}'`
        );
      }
    }

    // Check parameter types (basic validation)
    for (const [paramName, value] of Object.entries(parameters)) {
      const paramDef = tool.parameters[paramName];
      if (!paramDef) {
        throw new HarmonyValidationError(
          `Unknown parameter '${paramName}' for tool '${toolName}'`
        );
      }

      // Basic type checking
      if (paramDef.type === 'string' && typeof value !== 'string') {
        throw new HarmonyValidationError(
          `Parameter '${paramName}' must be a string for tool '${toolName}'`
        );
      }
      if (paramDef.type === 'number' && typeof value !== 'number') {
        throw new HarmonyValidationError(
          `Parameter '${paramName}' must be a number for tool '${toolName}'`
        );
      }
      if (paramDef.type === 'boolean' && typeof value !== 'boolean') {
        throw new HarmonyValidationError(
          `Parameter '${paramName}' must be a boolean for tool '${toolName}'`
        );
      }
    }

    return true;
  }
}

