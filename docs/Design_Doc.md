# Design Document: Crazy-Gary Agentic Application

This document outlines the design and architecture of the Crazy-Gary agentic application.

## 1. Introduction

Crazy-Gary is a web-based application that allows users to execute open-ended agentic tasks. The application will provide a user-friendly interface for defining tasks, monitoring their execution, and reviewing the results. The core of the application is an agent that can autonomously plan, select tools, execute steps, and verify the outcome of the tasks.

## 2. System Architecture

The system will be built using a modern full-stack architecture with a Next.js frontend, a Node.js/TypeScript backend, and a set of microservices for specific functionalities.

*   **Frontend**: A responsive web interface built with Next.js and React.
*   **Backend**: A Node.js/TypeScript service that handles the agentic logic, model orchestration, and communication with MCPs.
*   **MCPs (Manus Context Protocol)**: A set of services that provide access to external tools and data, including:
    *   **Disco MCP**: For general-purpose tools.
    *   **Browserbase MCP**: For web browser automation.
    *   **Supabase-Monkey-One MCP**: For authentication, user management, and database operations.
*   **Database**: Supabase will be used for storing user data, task information, and application settings.

## 3. Core Components

### 3.1. Agentic Core

The agentic core is the heart of the application. It is responsible for:

*   **Task Planning**: Decomposing a user's goal into a sequence of executable steps.
*   **Tool Selection**: Choosing the appropriate tools for each step from the available MCPs.
*   **Execution**: Running the steps and handling the results.
*   **Reflection and Self-Verification**: Analyzing the results of each step and verifying that the task is progressing towards the goal.

### 3.2. Harmony Message Format

All communication between the frontend, backend, and models will use the Harmony message format. This will ensure consistency and interoperability between the different components of the system.

### 3.3. Model Orchestration

The application will use two Hugging Face models:

*   **gpt-oss-120b-crazy-gary**: The primary model for agentic tasks.
*   **A 20B variant**: A fallback model to be used if the primary model is unavailable.

The system will handle automatic fallback and provide a user interface for controlling model parameters.

## 4. Unknowns and Decisions to be Made

*   The exact URL of the 20B model endpoint.
*   The specific tools available through the Disco and Browserbase MCPs.
*   The detailed schema for the Harmony messages.
*   The specific implementation details of the agent loop and reflection mechanism.





## 5. GPT-OSS Model Lineage

Based on the initial research, the GPT-OSS models are a family of open-weight language models released by OpenAI. The two models we will be using are:

*   **gpt-oss-120b**: A 117B-parameter Mixture-of-Experts (MoE) model designed for high-reasoning and agentic tasks.
*   **gpt-oss-20b**: A smaller, 20-billion parameter model.

Both models are released under the Apache 2.0 license and are available on Hugging Face. The 120B model is noted for its strong performance in general reasoning and coding benchmarks. The 20B model is designed to be more accessible for fine-tuning on consumer hardware.

Further research is required to determine the specific tokenizer and context window for each model. This information will be crucial for the implementation of the Harmony Core and the agent loop.


