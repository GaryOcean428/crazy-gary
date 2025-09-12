# ADR-001: Harmony and Model Strategy

**Date**: 2025-09-12

**Status**: Proposed

## Context

The Crazy-Gary application requires a standardized way to communicate between the frontend, backend, and the large language models. It also needs a clear strategy for selecting and using the models.

## Decision

We will adopt the **Harmony message format** for all communications. This will provide a consistent and extensible schema for messages, tool calls, and function signatures.

For the model strategy, we will use the **gpt-oss-120b-crazy-gary** model as the primary model and a **20B parameter model** as a fallback. The system will automatically switch to the fallback model if the primary model is unavailable.

## Consequences

*   **Pros**:
    *   The Harmony format will simplify the development of the application by providing a single, unified communication protocol.
    *   The fallback model strategy will improve the reliability of the application.
*   **Cons**:
    *   The Harmony format is a new standard, and there may be a learning curve for developers.
    *   The 20B model may not be as capable as the 120B model, which could affect the quality of the results in some cases.


