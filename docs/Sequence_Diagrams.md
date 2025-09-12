# Sequence Diagrams

This document contains sequence diagrams that illustrate the key workflows of the Crazy-Gary application.

## 1. Agent Loop

This diagram shows the main loop of the agent as it processes a task.

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Agent
    participant Model
    participant MCPs

    User->>Frontend: Submits a task
    Frontend->>Backend: Sends the task to the backend
    Backend->>Agent: Starts the agent with the task
    Agent->>Model: Generates a plan
    Model-->>Agent: Returns the plan
    Agent->>Backend: Sends the plan to the backend
    Backend->>Frontend: Displays the plan to the user
    User->>Frontend: Approves the plan
    Frontend->>Backend: Sends the approval to the backend
    Backend->>Agent: Starts the execution of the plan
    loop For each step in the plan
        Agent->>Model: Selects a tool for the step
        Model-->>Agent: Returns the tool
        Agent->>MCPs: Executes the tool
        MCPs-->>Agent: Returns the result
        Agent->>Model: Reflects on the result
        Model-->>Agent: Returns the reflection
    end
    Agent->>Model: Verifies the final result
    Model-->>Agent: Returns the verification
    Agent->>Backend: Sends the final result to the backend
    Backend->>Frontend: Displays the final result to the user
```

## 2. Tool Call

This diagram shows the process of calling a tool through an MCP.

```mermaid
sequenceDiagram
    participant Agent
    participant MCPs
    participant Tool

    Agent->>MCPs: Calls a tool with parameters
    MCPs->>Tool: Executes the tool
    Tool-->>MCPs: Returns the result
    MCPs-->>Agent: Returns the result to the agent
```

## 3. Model Fallback

This diagram shows the process of falling back to the 20B model if the 120B model is unavailable.

```mermaid
sequenceDiagram
    participant Agent
    participant Model120B
    participant Model20B

    Agent->>Model120B: Sends a request
    Model120B-->>Agent: Returns an error
    Agent->>Model20B: Sends the same request
    Model20B-->>Agent: Returns a successful response
```

## 4. Human Checkpoint

This diagram shows the process of a human checkpoint, where the user can approve, edit, or abort a task.

```mermaid
sequenceDiagram
    participant Agent
    participant Backend
    participant Frontend
    participant User

    Agent->>Backend: Reaches a checkpoint
    Backend->>Frontend: Notifies the user
    User->>Frontend: Chooses an action (approve, edit, or abort)
    Frontend->>Backend: Sends the user's action to the backend
    Backend->>Agent: Resumes the agent with the user's action
```


