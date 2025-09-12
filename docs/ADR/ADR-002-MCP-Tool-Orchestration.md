# ADR-002: MCP Tool Orchestration

**Date**: 2025-09-12

**Status**: Proposed

## Context

The Crazy-Gary application needs to interact with a variety of external tools for data, browsing, and other functionalities. A consistent and scalable approach is required to manage these tools.

## Decision

We will use the **Manus Context Protocol (MCP)** to interact with all external tools. The application will connect to the Disco, Browserbase, and Supabase-Monkey-One MCPs to discover and use their tools. The system will dynamically generate a tool registry and user interface toggles based on the MCP manifests.

## Consequences

*   **Pros**:
    *   The MCP provides a standardized way to interact with external tools, which will simplify the development and maintenance of the application.
    *   The dynamic tool discovery will make it easy to add new tools to the application without requiring code changes.
*   **Cons**:
    *   The application will be dependent on the availability of the MCPs.
    *   There may be a performance overhead associated with the MCP communication.

