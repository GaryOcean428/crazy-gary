import type { Meta, StoryObj } from '@storybook/react';
import { Header } from './header';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: 'Layout/Header',
  component: Header,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
The Header component is the main navigation bar for the application. It includes:
- Mobile menu toggle
- Current task indicator
- System status indicators
- Theme toggle
- User menu
- Responsive design

## Features
- Mobile-responsive with collapsible sidebar
- Real-time system status monitoring
- Theme switching functionality
- User authentication menu
- Current task display
- Accessible navigation
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    sidebarOpen: {
      control: 'boolean',
      description: 'Whether the sidebar is open',
    },
    currentTask: {
      control: 'object',
      description: 'Current task information to display',
    },
  },
  args: {
    sidebarOpen: false,
  },
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default header
export const Default: Story = {
  args: {
    sidebarOpen: false,
  },
};

// With sidebar open
export const SidebarOpen: Story = {
  args: {
    sidebarOpen: true,
  },
};

// With current task
export const WithCurrentTask: Story = {
  args: {
    sidebarOpen: false,
    currentTask: {
      title: 'Analyzing user requirements',
      status: 'In Progress'
    },
  },
};

// With completed task
export const CompletedTask: Story = {
  args: {
    sidebarOpen: false,
    currentTask: {
      title: 'Generated feature documentation',
      status: 'Completed'
    },
  },
};

// System offline state
export const SystemOffline: Story = {
  args: {
    sidebarOpen: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Header with system offline indicators.',
      },
    },
  },
};

// Mobile view
export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  args: {
    sidebarOpen: false,
  },
  name: 'Mobile View',
};

// Tablet view
export const Tablet: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  },
  args: {
    sidebarOpen: false,
  },
  name: 'Tablet View',
};

// Desktop view
export const Desktop: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'desktop',
    },
  },
  args: {
    sidebarOpen: false,
  },
  name: 'Desktop View',
};

// With task and mobile
export const MobileWithTask: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  args: {
    sidebarOpen: false,
    currentTask: {
      title: 'Processing data analysis',
      status: 'Running'
    },
  },
  name: 'Mobile with Task',
};

// With multiple tasks (showing current)
export const MultipleTasks: Story = {
  args: {
    sidebarOpen: false,
    currentTask: {
      title: 'Building component documentation',
      status: 'Active'
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Header showing the currently active task among multiple background tasks.',
      },
    },
  },
};

// Error state
export const ErrorState: Story = {
  args: {
    sidebarOpen: false,
    currentTask: {
      title: 'Failed to connect to API',
      status: 'Error'
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Header showing error state in task and system status.',
      },
    },
  },
};

// Loading state
export const LoadingState: Story = {
  args: {
    sidebarOpen: false,
    currentTask: {
      title: 'Initializing workspace...',
      status: 'Loading'
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Header during application initialization.',
      },
    },
  },
};

// User logged out (if applicable)
export const LoggedOut: Story = {
  args: {
    sidebarOpen: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Header state when user is not authenticated (if applicable).',
      },
    },
  },
};

// Responsive comparison
export const ResponsiveComparison: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Mobile (320px)</h3>
        <div className="border rounded-lg overflow-hidden" style={{ width: '320px', height: '64px' }}>
          <Header sidebarOpen={false} />
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Tablet (768px)</h3>
        <div className="border rounded-lg overflow-hidden" style={{ width: '768px', height: '64px' }}>
          <Header sidebarOpen={false} />
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Desktop (1200px)</h3>
        <div className="border rounded-lg overflow-hidden" style={{ width: '1200px', height: '64px' }}>
          <Header sidebarOpen={false} />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Comparison of header across different screen sizes.',
      },
    },
  },
};

// Feature showcase
export const FeatureShowcase: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Header with Active Task</h3>
        <div className="border rounded-lg overflow-hidden" style={{ height: '64px' }}>
          <Header 
            sidebarOpen={false} 
            currentTask={{
              title: 'Compiling TypeScript components',
              status: 'Processing'
            }}
          />
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Header with System Alerts</h3>
        <div className="border rounded-lg overflow-hidden" style={{ height: '64px' }}>
          <Header 
            sidebarOpen={false} 
            currentTask={{
              title: 'System maintenance in progress',
              status: 'Maintenance'
            }}
          />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Showcase of different header states and configurations.',
      },
    },
  },
};

// Accessibility story
export const Accessibility: Story = {
  args: {
    sidebarOpen: false,
    currentTask: {
      title: 'Accessibility testing in progress',
      status: 'Testing'
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'This story demonstrates the header with accessibility features enabled.',
      },
    },
  },
};