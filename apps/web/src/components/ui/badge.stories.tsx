import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './badge';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: 'UI/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
The Badge component is a small element used to highlight status, count, or category information.
It provides visual indicators with different variants and can contain text or icons.

## Features
- Multiple visual variants (default, secondary, destructive, outline)
- Icon support
- Responsive design
- Accessibility compliant
- Flexible styling with className override
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'destructive', 'outline'],
      description: 'Visual variant of the badge',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
    children: {
      control: 'text',
      description: 'Badge content',
    },
  },
  args: {
    children: 'Badge',
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

// Variants
export const Default: Story = {
  args: {
    variant: 'default',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
  },
};

export const Destructive: Story = {
  args: {
    variant: 'destructive',
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
  },
};

// With icons
export const WithIcon: Story = {
  args: {
    children: (
      <>
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        Success
      </>
    ),
  },
};

export const WithDot: Story = {
  args: {
    children: (
      <>
        <span className="w-2 h-2 bg-current rounded-full" />
        Online
      </>
    ),
  },
};

// Status examples
export const Status: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="default">Active</Badge>
      <Badge variant="secondary">Pending</Badge>
      <Badge variant="destructive">Error</Badge>
      <Badge variant="outline">Draft</Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Common status indicators using different badge variants.',
      },
    },
  },
};

// Notification count
export const NotificationCount: Story = {
  args: {
    children: '3',
  },
  parameters: {
    docs: {
      description: {
        story: 'Badge used to display notification counts.',
      },
    },
  },
};

// Category labels
export const Categories: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="default">React</Badge>
      <Badge variant="secondary">TypeScript</Badge>
      <Badge variant="outline">CSS</Badge>
      <Badge variant="secondary">JavaScript</Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Badge used for category or tag labels.',
      },
    },
  },
};

// Priority indicators
export const Priority: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="destructive">High Priority</Badge>
      <Badge variant="default">Medium Priority</Badge>
      <Badge variant="secondary">Low Priority</Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Priority indicators using different badge colors.',
      },
    },
  },
};

// Feature flags
export const FeatureFlags: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="default">New</Badge>
      <Badge variant="outline">Beta</Badge>
      <Badge variant="secondary">Coming Soon</Badge>
      <Badge variant="destructive">Deprecated</Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Feature flag indicators for product status.',
      },
    },
  },
};

// In a list context
export const InList: Story = {
  render: () => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span>User Profile</span>
        <Badge variant="secondary">Completed</Badge>
      </div>
      <div className="flex items-center justify-between">
        <span>Payment Setup</span>
        <Badge variant="destructive">Failed</Badge>
      </div>
      <div className="flex items-center justify-between">
        <span>Email Verification</span>
        <Badge variant="default">Verified</Badge>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Badges used in a list context to show status.',
      },
    },
  },
};

// As a button child
export const AsChild: Story = {
  args: {
    asChild: true,
    children: (
      <button className="px-3 py-1 rounded-md bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors">
        Clickable Badge
      </button>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Badge rendered as a child component for custom interactions.',
      },
    },
  },
};

// Responsive usage
export const Responsive: Story = {
  render: () => (
    <div className="space-y-4 p-4">
      <div className="flex flex-wrap gap-2">
        <Badge variant="default">Desktop Layout</Badge>
        <Badge variant="secondary">Multiple Badges</Badge>
        <Badge variant="outline">Responsive</Badge>
      </div>
      <div className="text-sm text-muted-foreground">
        Resize your browser to see how badges adapt to different screen sizes.
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'This story demonstrates how badges adapt to different screen sizes.',
      },
    },
  },
};

// Playground
export const Playground: Story = {
  args: {
    variant: 'default',
  },
  parameters: {
    docs: {
      description: {
        story: 'Use the controls below to experiment with different badge configurations.',
      },
    },
  },
};