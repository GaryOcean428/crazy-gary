# ADR-003: Authentication and Session Model

**Date**: 2025-09-12

**Status**: Proposed

## Context

The Crazy-Gary application requires a secure and scalable authentication and session management system. It also needs to support different user roles with different levels of access.

## Decision

We will use the **Supabase-Monkey-One MCP** for authentication and user management. Supabase provides a robust and easy-to-use authentication service with support for email/password and OAuth providers. We will define three user roles:

*   **owner**: Can manage all aspects of the application.
*   **member**: Can run agent tasks and manage their own workspaces.
*   **viewer**: Can only view the results of tasks.

## Consequences

*   **Pros**:
    *   Supabase provides a secure and scalable authentication solution.
    *   The role-based access control will allow for fine-grained control over the application's features.
*   **Cons**:
    *   The application will be dependent on the availability of the Supabase-Monkey-One MCP.


