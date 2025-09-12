# ADR-004: Observability and Limits

**Date**: 2025-09-12

**Status**: Proposed

## Context

The Crazy-Gary application needs to be observable to track its performance and identify issues. It also needs to have limits in place to prevent abuse and ensure fair usage.

## Decision

We will implement a comprehensive observability solution that includes:

*   **Structured Logging**: All log messages will be in JSON format and include a trace ID to correlate events across different services.
*   **Metrics**: We will collect metrics on request counts, latency, and tool error rates.
*   **Error Reporting**: We will use Sentry to track and report errors.

We will also implement the following limits:

*   **Max steps per task**: A limit on the number of steps that an agent can execute for a single task.
*   **Max tool calls per step**: A limit on the number of tool calls that an agent can make in a single step.
*   **Token caps**: A limit on the number of tokens that can be used per request and per task.
*   **Domain allow/deny-lists**: A list of allowed and denied domains for the browser.

## Consequences

*   **Pros**:
    *   The observability solution will make it easier to monitor and debug the application.
    *   The limits will help to prevent abuse and ensure the stability of the application.
*   **Cons**:
    *   Implementing the observability and limits will add complexity to the application.


