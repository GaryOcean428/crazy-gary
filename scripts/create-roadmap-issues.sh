#!/bin/bash

# GitHub Issue Creation Script for Crazy-Gary Roadmap
# This script helps create issues from the roadmap implementation guide

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REPO_OWNER="GaryOcean428"
REPO_NAME="crazy-gary"
ROADMAP_FILE="docs/ROADMAP_IMPLEMENTATION.md"

# Check if gh CLI is installed
check_gh_cli() {
    if ! command -v gh &> /dev/null; then
        echo -e "${RED}Error: GitHub CLI (gh) is not installed.${NC}"
        echo "Please install it from: https://cli.github.com/"
        exit 1
    fi
    
    if ! gh auth status &> /dev/null; then
        echo -e "${RED}Error: GitHub CLI is not authenticated.${NC}"
        echo "Please run: gh auth login"
        exit 1
    fi
}

# Create an epic issue
create_epic() {
    local epic_number="$1"
    local epic_title="$2"
    local epic_description="$3"
    local quarter="$4"
    local labels="$5"
    
    echo -e "${BLUE}Creating Epic: $epic_title${NC}"
    
    # Create the epic issue
    issue_url=$(gh issue create \
        --repo "$REPO_OWNER/$REPO_NAME" \
        --title "[EPIC] $epic_title" \
        --body "$epic_description" \
        --label "$labels")
    
    echo -e "${GREEN}Created epic: $issue_url${NC}"
    echo "$issue_url"
}

# Create a feature issue
create_feature_issue() {
    local issue_title="$1"
    local issue_description="$2"
    local labels="$3"
    local epic_number="$4"
    
    echo -e "${BLUE}Creating Feature: $issue_title${NC}"
    
    # Add epic reference to description if provided
    if [ -n "$epic_number" ]; then
        issue_description="Related Epic: #$epic_number

$issue_description"
    fi
    
    # Create the feature issue
    issue_url=$(gh issue create \
        --repo "$REPO_OWNER/$REPO_NAME" \
        --title "[FEATURE] $issue_title" \
        --body "$issue_description" \
        --label "$labels")
    
    echo -e "${GREEN}Created issue: $issue_url${NC}"
    echo "$issue_url"
}

# Q1 Epic and Issue Creation
create_q1_issues() {
    echo -e "${YELLOW}Creating Q1 - Foundations & Reliability Issues${NC}"
    
    # Epic 1: Architecture Improvements
    epic1_desc="## Epic Overview

### Description
Implement full A2A AgentCard protocol and baseline MCP server integration to establish a solid foundation for agent communication and tool orchestration.

### Success Criteria
- [ ] A2A AgentCard protocol fully implemented
- [ ] MCP server integration (filesystem + git) working
- [ ] Protocol validation and routing functional
- [ ] Integration tests passing

### Quarter
- [x] Q1 - Foundations & Reliability

### Related Issues
Will be populated as issues are created.

### Dependencies
- Current MCP orchestrator implementation
- Heavy mode integration requirements

### Acceptance Criteria
- [ ] All related issues completed
- [ ] Documentation updated
- [ ] Tests passing
- [ ] Deployment successful"

    epic1_url=$(create_epic "1" "Architecture Improvements" "$epic1_desc" "q1" "epic,q1,architecture,high-priority")
    epic1_number=$(echo "$epic1_url" | grep -o '[0-9]*$')
    
    # Issue 1: A2A AgentCard Protocol
    issue1_desc="## Feature Description

### Summary
Implement the complete A2A AgentCard protocol specification including tasks/send and tasks/sendSubscribe flows for agent-to-agent communication.

### Problem Statement
Current system lacks standardized agent communication protocol, limiting multi-agent orchestration capabilities.

### Proposed Solution
- Implement A2A AgentCard specification
- Add tasks/send endpoint for agent communication
- Add tasks/sendSubscribe flow for real-time updates
- Create AgentCard validation and routing

### Roadmap Quarter
- [x] Q1 - Foundations & Reliability

### Acceptance Criteria
- [ ] A2A AgentCard protocol fully implemented
- [ ] tasks/send endpoint functional and tested
- [ ] tasks/sendSubscribe flow working
- [ ] Protocol documentation updated
- [ ] Integration tests passing

### Technical Requirements
- Update MCP orchestrator to support A2A protocol
- Add AgentCard validation middleware
- Implement routing for agent communication
- Add protocol version management

### Testing Requirements
- [ ] Unit tests for AgentCard validation
- [ ] Integration tests for communication flows
- [ ] E2E tests for multi-agent scenarios
- [ ] Protocol compliance tests

### Documentation Requirements
- [ ] A2A protocol specification
- [ ] API endpoint documentation
- [ ] Integration examples
- [ ] Developer guide updates"

    create_feature_issue "Implement A2A AgentCard Protocol" "$issue1_desc" "q1,architecture,mcp,high-priority" "$epic1_number"
    
    # Issue 2: MCP Server Integration
    issue2_desc="## Feature Description

### Summary
Add baseline MCP server integration starting with filesystem and git MCP servers, including auto-discovery mechanisms.

### Problem Statement
Current MCP integration is limited and lacks standardized server discovery, reducing tool availability and integration capabilities.

### Proposed Solution
- Integrate filesystem MCP server for file operations
- Integrate git MCP server for version control operations
- Create MCP server auto-discovery mechanism
- Add server health monitoring

### Roadmap Quarter
- [x] Q1 - Foundations & Reliability

### Acceptance Criteria
- [ ] Filesystem MCP server integrated and functional
- [ ] Git MCP server integrated and functional
- [ ] Auto-discovery of MCP servers working
- [ ] Server health monitoring implemented
- [ ] MCP integration tests passing

### Technical Requirements
- Extend MCPOrchestrator for new server types
- Add server discovery service
- Implement health check endpoints for MCP servers
- Add error handling and fallback mechanisms

### Testing Requirements
- [ ] Unit tests for MCP server integration
- [ ] Integration tests for file and git operations
- [ ] Health check monitoring tests
- [ ] Error handling tests

### Documentation Requirements
- [ ] MCP server setup guide
- [ ] Integration documentation
- [ ] Tool usage examples"

    create_feature_issue "Baseline MCP Server Integration" "$issue2_desc" "q1,mcp,integration,medium-priority" "$epic1_number"
    
    echo -e "${GREEN}Q1 Epic 1 and related issues created${NC}"
}

# Main execution
main() {
    echo -e "${YELLOW}🚀 Crazy-Gary Roadmap Issue Creator${NC}"
    echo "This script creates GitHub issues from the roadmap implementation guide."
    echo ""
    
    check_gh_cli
    
    echo -e "${BLUE}Repository: $REPO_OWNER/$REPO_NAME${NC}"
    echo ""
    
    # Ask user what to create
    echo "What would you like to create?"
    echo "1) Q1 Issues (Foundations & Reliability)"
    echo "2) Q2 Issues (Intelligence & Advanced Features)"
    echo "3) Q3 Issues (Growth, Adoption & Monetization)"
    echo "4) All Issues (Complete Roadmap)"
    echo "5) Exit"
    
    read -p "Enter your choice (1-5): " choice
    
    case $choice in
        1)
            create_q1_issues
            ;;
        2)
            echo -e "${YELLOW}Q2 issue creation coming soon...${NC}"
            ;;
        3)
            echo -e "${YELLOW}Q3 issue creation coming soon...${NC}"
            ;;
        4)
            echo -e "${YELLOW}Full roadmap creation coming soon...${NC}"
            ;;
        5)
            echo -e "${BLUE}Exiting...${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}Invalid choice. Exiting.${NC}"
            exit 1
            ;;
    esac
    
    echo ""
    echo -e "${GREEN}✅ Issue creation completed!${NC}"
    echo "Visit the repository to view and manage the created issues:"
    echo "https://github.com/$REPO_OWNER/$REPO_NAME/issues"
}

# Run main function
main "$@"