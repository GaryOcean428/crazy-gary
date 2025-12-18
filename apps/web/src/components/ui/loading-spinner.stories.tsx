import type { Meta, StoryObj } from '@storybook/react';
import { LoadingSpinner, ButtonLoading, InlineLoading, StepLoading } from './loading-spinner';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: 'UI/LoadingSpinner',
  component: LoadingSpinner,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
The LoadingSpinner component provides various loading states and animations for user feedback.
It includes multiple variants, sizes, and specialized loading components for different use cases.

## Components
- **LoadingSpinner**: Main spinner component with multiple variants
- **ButtonLoading**: Button-specific loading state
- **InlineLoading**: Inline loading indicator
- **StepLoading**: Multi-step progress loading

## Features
- Multiple animation variants (default, dots, pulse, ring, dots-bounce)
- Responsive sizing (sm, md, lg, xl)
- Color customization (primary, secondary, muted, white)
- Text support for context
- Full-screen overlay capability
- Framer Motion animations
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
      description: 'Size of the spinner',
    },
    variant: {
      control: 'select',
      options: ['default', 'dots', 'pulse', 'ring', 'dots-bounce'],
      description: 'Animation variant of the spinner',
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'muted', 'white'],
      description: 'Color of the spinner',
    },
    text: {
      control: 'text',
      description: 'Optional text to display with spinner',
    },
    fullScreen: {
      control: 'boolean',
      description: 'Whether to show as full-screen overlay',
    },
  },
  args: {
    size: 'md',
    variant: 'default',
    color: 'primary',
  },
} satisfies Meta<typeof LoadingSpinner>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic spinner variants
export const Default: Story = {
  args: {
    variant: 'default',
  },
};

export const Dots: Story = {
  args: {
    variant: 'dots',
  },
};

export const Pulse: Story = {
  args: {
    variant: 'pulse',
  },
};

export const Ring: Story = {
  args: {
    variant: 'ring',
  },
};

export const DotsBounce: Story = {
  args: {
    variant: 'dots-bounce',
  },
};

// Size variants
export const Small: Story = {
  args: {
    size: 'sm',
    variant: 'default',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    variant: 'default',
  },
};

export const ExtraLarge: Story = {
  args: {
    size: 'xl',
    variant: 'default',
  },
};

// Color variants
export const Primary: Story = {
  args: {
    color: 'primary',
    variant: 'default',
  },
};

export const Secondary: Story = {
  args: {
    color: 'secondary',
    variant: 'default',
  },
};

export const Muted: Story = {
  args: {
    color: 'muted',
    variant: 'default',
  },
};

export const White: Story = {
  args: {
    color: 'white',
    variant: 'default',
  },
  parameters: {
    docs: {
      description: {
        story: 'White variant for dark backgrounds.',
      },
    },
  },
};

// With text
export const WithText: Story = {
  args: {
    text: 'Loading...',
    variant: 'default',
  },
};

// Different variants with text
export const DotsWithText: Story = {
  args: {
    variant: 'dots',
    text: 'Processing...',
  },
};

export const PulseWithText: Story = {
  args: {
    variant: 'pulse',
    text: 'Please wait',
  },
};

// All variants comparison
export const AllVariants: Story = {
  render: () => (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 p-4">
      <div className="flex flex-col items-center space-y-2">
        <LoadingSpinner variant="default" />
        <span className="text-sm text-muted-foreground">Default</span>
      </div>
      <div className="flex flex-col items-center space-y-2">
        <LoadingSpinner variant="dots" />
        <span className="text-sm text-muted-foreground">Dots</span>
      </div>
      <div className="flex flex-col items-center space-y-2">
        <LoadingSpinner variant="pulse" />
        <span className="text-sm text-muted-foreground">Pulse</span>
      </div>
      <div className="flex flex-col items-center space-y-2">
        <LoadingSpinner variant="ring" />
        <span className="text-sm text-muted-foreground">Ring</span>
      </div>
      <div className="flex flex-col items-center space-y-2">
        <LoadingSpinner variant="dots-bounce" />
        <span className="text-sm text-muted-foreground">Dots Bounce</span>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Comparison of all available spinner variants.',
      },
    },
  },
};

// Size comparison
export const SizeComparison: Story = {
  render: () => (
    <div className="flex items-end space-x-8 p-4">
      <div className="flex flex-col items-center space-y-2">
        <LoadingSpinner size="sm" />
        <span className="text-sm text-muted-foreground">Small</span>
      </div>
      <div className="flex flex-col items-center space-y-2">
        <LoadingSpinner size="md" />
        <span className="text-sm text-muted-foreground">Medium</span>
      </div>
      <div className="flex flex-col items-center space-y-2">
        <LoadingSpinner size="lg" />
        <span className="text-sm text-muted-foreground">Large</span>
      </div>
      <div className="flex flex-col items-center space-y-2">
        <LoadingSpinner size="xl" />
        <span className="text-sm text-muted-foreground">Extra Large</span>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Comparison of different spinner sizes.',
      },
    },
  },
};

// Button loading component
export const ButtonLoadingComponent: Story = {
  render: () => (
    <div className="space-y-4">
      <ButtonLoading showText={false} />
      <ButtonLoading showText={true} text="Saving..." />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Button loading states with and without text.',
      },
    },
  },
};

// Inline loading component
export const InlineLoadingComponent: Story = {
  render: () => (
    <div className="space-y-4">
      <InlineLoading />
      <InlineLoading text="Fetching data..." />
      <InlineLoading size="sm" text="Loading..." />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Inline loading indicators for different contexts.',
      },
    },
  },
};

// Step loading component
export const StepLoadingComponent: Story = {
  render: () => (
    <div className="max-w-md p-4">
      <StepLoading
        steps={[
          'Connecting to server',
          'Authenticating user',
          'Loading data',
          'Preparing response'
        ]}
        currentStep={1}
        showProgress={true}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Multi-step loading progress indicator.',
      },
    },
  },
};

// Step loading completed
export const StepLoadingCompleted: Story = {
  render: () => (
    <div className="max-w-md p-4">
      <StepLoading
        steps={[
          'Connecting to server',
          'Authenticating user',
          'Loading data',
          'Preparing response'
        ]}
        currentStep={3}
        showProgress={true}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Step loading showing completed process.',
      },
    },
  },
};

// In context - form submission
export const FormSubmission: Story = {
  render: () => (
    <div className="space-y-4 max-w-md p-4">
      <h3 className="text-lg font-semibold">Submitting Form</h3>
      <div className="border rounded-lg p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Name</label>
            <div className="h-10 bg-muted rounded-md animate-pulse" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <div className="h-10 bg-muted rounded-md animate-pulse" />
          </div>
          <div className="flex justify-center pt-4">
            <LoadingSpinner text="Submitting..." variant="pulse" />
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Loading spinner used in form submission context.',
      },
    },
  },
};

// In context - data fetching
export const DataFetching: Story = {
  render: () => (
    <div className="space-y-4 max-w-md p-4">
      <h3 className="text-lg font-semibold">User Dashboard</h3>
      <div className="space-y-3">
        <div className="flex items-center space-x-3">
          <InlineLoading size="sm" />
          <span className="text-sm">Loading user data...</span>
        </div>
        <div className="flex items-center space-x-3">
          <InlineLoading size="sm" />
          <span className="text-sm">Fetching recent activity...</span>
        </div>
        <div className="flex items-center space-x-3">
          <InlineLoading size="sm" />
          <span className="text-sm">Calculating statistics...</span>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Multiple inline loading indicators for data fetching.',
      },
    },
  },
};

// Dark background context
export const DarkBackground: Story = {
  render: () => (
    <div className="bg-gray-800 p-6 rounded-lg">
      <div className="flex flex-col items-center space-y-4">
        <LoadingSpinner color="white" variant="default" />
        <LoadingSpinner color="white" variant="dots" />
        <LoadingSpinner color="white" variant="pulse" />
        <p className="text-white text-sm">Loading on dark background</p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'White spinner variants for dark backgrounds.',
      },
    },
  },
};

// Full screen overlay
export const FullScreenOverlay: Story = {
  render: () => (
    <div className="relative h-64">
      <div className="absolute inset-0 bg-blue-50 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-4">Page Content</h3>
          <p className="text-sm text-muted-foreground">This would be hidden during loading</p>
        </div>
      </div>
      <LoadingSpinner fullScreen text="Loading application..." />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Full-screen loading overlay.',
      },
    },
  },
};

// Playground
export const Playground: Story = {
  args: {
    size: 'md',
    variant: 'default',
    color: 'primary',
    text: undefined,
  },
  parameters: {
    docs: {
      description: {
        story: 'Use the controls below to experiment with different spinner configurations.',
      },
    },
  },
};