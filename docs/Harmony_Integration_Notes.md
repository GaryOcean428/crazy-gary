# Harmony Integration Notes

This document outlines the integration of the Harmony message format within the Crazy-Gary application.

## 1. Message Schema

All messages will follow the Harmony schema. A typical message will have the following structure:

```json
{
  "messages": [
    {
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": "<user's goal>"
        }
      ]
    }
  ],
  "tools": [],
  "settings": {}
}
```

### 1.1. Roles

The `role` field can be one of the following:

*   `user`: For messages from the user.
*   `assistant`: For messages from the agent.
*   `tool`: For the results of tool calls.

### 1.2. Content

The `content` field is an array of objects, each with a `type` and a value. The `type` can be `text`, `json`, `image`, etc.

## 2. Tool Signature Mapping

Tools will be defined using a JSON schema. The `tools` field in the Harmony message will contain an array of tool definitions. Each tool definition will have the following structure:

```json
{
  "name": "<tool_name>",
  "description": "<tool_description>",
  "parameters": {
    "<parameter_name>": "<parameter_type>"
  }
}
```

When the agent wants to call a tool, it will generate a message with the `role` set to `assistant` and a `content` object with the `type` set to `tool_code`. The `tool_code` object will contain the name of the tool and the parameters.

## 3. Error Handling

If a tool call fails, the tool will return a message with the `role` set to `tool` and a `content` object with the `type` set to `error`. The `error` object will contain a description of the error.

The agent will be responsible for handling tool errors. It can retry the tool call, try a different tool, or ask the user for help.


