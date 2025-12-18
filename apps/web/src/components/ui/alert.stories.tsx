import type { Meta, StoryObj } from '@storybook/react';
import { Alert, AlertTitle, AlertDescription } from './alert';
import { Button } from './button';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: 'UI/Alert',
  component: Alert,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
The Alert component is used to display important messages to users with different severity levels.
It consists of a container, title, and description components that can be used together or separately.

## Components
- **Alert**: The main container component
- **AlertTitle**: The alert title/heading
- **AlertDescription**: The alert description content

## Features
- Two variants (default, destructive)
- Built-in icon support
- Accessible with proper ARIA roles
- Responsive design
- Flexible content structure
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive'],
      description: 'Visual variant of the alert',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
  args: {},
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic usage
export const Default: Story = {
  render: () => (
    <Alert className="max-w-md">
      <AlertTitle>Default Alert</AlertTitle>
      <AlertDescription>
        This is a default alert with important information for the user.
      </AlertDescription>
    </Alert>
  ),
};

export const Destructive: Story = {
  render: () => (
    <Alert variant="destructive" className="max-w-md">
      <AlertTitle>Destructive Alert</AlertTitle>
      <AlertDescription>
        This is a destructive alert indicating an error or critical issue that needs attention.
      </AlertDescription>
    </Alert>
  ),
};

// With icons
export const WithIcon: Story = {
  render: () => (
    <Alert className="max-w-md">
      <svg
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <AlertTitle>Information</AlertTitle>
      <AlertDescription>
        This alert includes an icon to draw attention to the information.
      </AlertDescription>
    </Alert>
  ),
};

export const SuccessWithIcon: Story = {
  render: () => (
    <Alert className="max-w-md">
      <svg
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <AlertTitle>Success!</AlertTitle>
      <AlertDescription>
        Your changes have been saved successfully.
      </AlertDescription>
    </Alert>
  ),
};

export const WarningWithIcon: Story = {
  render: () => (
    <Alert variant="destructive" className="max-w-md">
      <svg
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
        />
      </svg>
      <AlertTitle>Warning</AlertTitle>
      <AlertDescription>
        Please review your settings before proceeding.
      </AlertDescription>
    </Alert>
  ),
};

// Simple alerts (title only)
export const TitleOnly: Story = {
  render: () => (
    <Alert className="max-w-md">
      <AlertTitle>Simple Alert Title</AlertTitle>
    </Alert>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Alert with just a title, no description.',
      },
    },
  },
};

export const DescriptionOnly: Story = {
  render: () => (
    <Alert className="max-w-md">
      <AlertDescription>
        This alert only contains a description without a title.
      </AlertDescription>
    </Alert>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Alert with just a description, no title.',
      },
    },
  },
};

// With actions
export const WithActions: Story = {
  render: () => (
    <Alert className="max-w-md">
      <AlertTitle>Action Required</AlertTitle>
      <AlertDescription className="space-y-3">
        <p>
          Your subscription will expire in 3 days. Upgrade now to continue using all features.
        </p>
        <div className="flex gap-2">
          <Button size="sm">Upgrade Now</Button>
          <Button variant="outline" size="sm">Remind Me Later</Button>
        </div>
      </AlertDescription>
    </Alert>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Alert with action buttons for user interaction.',
      },
    },
  },
};

// Long content
export const LongContent: Story = {
  render: () => (
    <Alert className="max-w-md">
      <AlertTitle>Important Update</AlertTitle>
      <AlertDescription>
        <p>
          We have updated our privacy policy to provide better transparency about how we collect, 
          use, and protect your personal information. These changes will take effect on January 1, 2024.
        </p>
        <p>
          The new policy includes enhanced security measures, clearer data usage explanations, 
          and more granular control over your privacy settings.
        </p>
        <p>
          Please review the updated policy and let us know if you have any questions.
        </p>
      </AlertDescription>
    </Alert>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Alert with longer content to test text wrapping and layout.',
      },
    },
  },
};

// Multiple alerts
export const MultipleAlerts: Story = {
  render: () => (
    <div className="space-y-4 max-w-md">
      <Alert>
        <AlertTitle>Success</AlertTitle>
        <AlertDescription>Your profile has been updated successfully.</AlertDescription>
      </Alert>
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Unable to process your payment. Please try again.</AlertDescription>
      </Alert>
      <Alert>
        <AlertTitle>Info</AlertTitle>
        <AlertDescription>New features are available in the settings panel.</AlertDescription>
      </Alert>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Multiple alerts displayed together to show different states.',
      },
    },
  },
};

// Form validation errors
export const FormErrors: Story = {
  render: () => (
    <Alert variant="destructive" className="max-w-md">
      <AlertTitle>Form Validation Failed</AlertTitle>
      <AlertDescription>
        <ul className="list-disc list-inside space-y-1">
          <li>Email address is required</li>
          <li>Password must be at least 8 characters long</li>
          <li>Phone number format is invalid</li>
        </ul>
      </AlertDescription>
    </Alert>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Alert used to display form validation errors.',
      },
    },
  },
};

// System notifications
export const SystemNotifications: Story = {
  render: () => (
    <div className="space-y-4 max-w-md">
      <Alert>
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <AlertTitle>Maintenance Complete</AlertTitle>
        <AlertDescription>All systems are now operational.</AlertDescription>
      </Alert>
      
      <Alert>
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <AlertTitle>Scheduled Maintenance</AlertTitle>
        <AlertDescription>System maintenance scheduled for tonight at 2 AM EST.</AlertDescription>
      </Alert>
      
      <Alert variant="destructive">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <AlertTitle>Security Alert</AlertTitle>
        <AlertDescription>Unusual login activity detected. Please verify your account.</AlertDescription>
      </Alert>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'System notification examples with different severity levels.',
      },
    },
  },
};

// Responsive design
export const Responsive: Story = {
  render: () => (
    <div className="space-y-4 p-4">
      <Alert className="max-w-md">
        <AlertTitle>Responsive Alert</AlertTitle>
        <AlertDescription>
          This alert adapts to different screen sizes and maintains readability.
        </AlertDescription>
      </Alert>
      <div className="text-sm text-muted-foreground">
        Resize your browser window to see how the alert adapts.
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'This story demonstrates how alerts adapt to different screen sizes.',
      },
    },
  },
};

// Playground
export const Playground: Story = {
  render: () => (
    <Alert className="max-w-md">
      <AlertTitle>Playground Alert</AlertTitle>
      <AlertDescription>
        Use this alert to test different configurations and content combinations.
      </AlertDescription>
    </Alert>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Use this playground to experiment with different alert configurations.',
      },
    },
  },
};