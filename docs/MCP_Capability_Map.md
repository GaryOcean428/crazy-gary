# MCP Capability Map

This document maps the capabilities of the available MCPs to the requirements of the Crazy-Gary application.

## 1. mcp-browserbase

The `mcp-browserbase` server provides a comprehensive set of tools for browser automation. These tools will be used to implement the web browsing and interaction features of the agent.

### 1.1. Session Management

*   `multi_browserbase_stagehand_session_create`: Create a new browser session.
*   `multi_browserbase_stagehand_session_list`: List all active browser sessions.
*   `multi_browserbase_stagehand_session_close`: Close a browser session.

### 1.2. Navigation

*   `multi_browserbase_stagehand_navigate_session`: Navigate to a URL in a specific session.

### 1.3. Interaction

*   `multi_browserbase_stagehand_act_session`: Perform an action on a web page element in a specific session.
*   `multi_browserbase_stagehand_extract_session`: Extract structured information from a web page in a specific session.
*   `multi_browserbase_stagehand_observe_session`: Observe and identify interactive elements on a web page in a specific session.

### 1.4. Other

*   `multi_browserbase_stagehand_get_url_session`: Get the current URL of a specific session.
*   `browserbase_stagehand_get_all_urls`: Get the current URLs of all active browser sessions.
*   `browserbase_screenshot`: Take a screenshot of the current page.

## 2. disco

The `disco` MCP server is currently unavailable. We will need to investigate this issue and determine the capabilities of this server once it is back online.

## 3. supabase-monkey-one

The `supabase-monkey-one` MCP server will be used for authentication, user management, and database operations. We will need to explore the specific tools available on this server to map its capabilities to our requirements.


