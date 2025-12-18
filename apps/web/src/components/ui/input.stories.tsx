import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { Input } from './input';
import { Label } from './label';
import { Button } from './button';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: 'UI/Input',
  component: Input,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
The Input component is a versatile text input field with built-in accessibility features 
and responsive design. It supports all standard HTML input attributes and provides 
consistent styling across the application.

## Features
- Responsive design with mobile-first approach
- Accessibility compliant with proper ARIA attributes
- Focus states with ring indicators
- Error states with destructive styling
- File input support
- Touch-friendly interactions
- Dark mode support
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'url', 'search', 'file'],
      description: 'HTML input type',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the input is disabled',
    },
    required: {
      control: 'boolean',
      description: 'Whether the input is required',
    },
    value: {
      control: 'text',
      description: 'Input value',
    },
    defaultValue: {
      control: 'text',
      description: 'Default input value',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
  args: {
    onChange: fn(),
    placeholder: 'Enter text...',
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic input
export const Basic: Story = {
  args: {
    placeholder: 'Enter your name',
  },
};

// Different input types
export const Email: Story = {
  args: {
    type: 'email',
    placeholder: 'Enter your email',
  },
};

export const Password: Story = {
  args: {
    type: 'password',
    placeholder: 'Enter your password',
  },
};

export const Number: Story = {
  args: {
    type: 'number',
    placeholder: 'Enter a number',
  },
};

export const Phone: Story = {
  args: {
    type: 'tel',
    placeholder: 'Enter your phone number',
  },
};

export const URL: Story = {
  args: {
    type: 'url',
    placeholder: 'Enter a URL',
  },
};

export const Search: Story = {
  args: {
    type: 'search',
    placeholder: 'Search...',
  },
};

// State variants
export const WithValue: Story = {
  args: {
    value: 'This is a pre-filled value',
    placeholder: 'Enter text...',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    value: 'Disabled input',
  },
};

export const Required: Story = {
  args: {
    required: true,
    placeholder: 'This field is required',
  },
};

// File input
export const FileInput: Story = {
  args: {
    type: 'file',
    className: 'cursor-pointer',
  },
  parameters: {
    docs: {
      description: {
        story: 'File input with custom styling.',
      },
    },
  },
};

// With labels
export const WithLabel: Story = {
  render: () => (
    <div className="space-y-2">
      <Label htmlFor="name">Name</Label>
      <Input id="name" placeholder="Enter your full name" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Input with proper label association.',
      },
    },
  },
};

// Form field example
export const FormField: Story = {
  render: () => (
    <div className="space-y-4 max-w-md">
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input 
          id="username" 
          placeholder="Choose a username" 
          type="text"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input 
          id="email" 
          placeholder="Enter your email" 
          type="email"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input 
          id="password" 
          placeholder="Create a password" 
          type="password"
        />
      </div>
      <Button className="w-full">Sign Up</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Example of multiple input fields in a form.',
      },
    },
  },
};

// Search with icon
export const SearchWithIcon: Story = {
  render: () => (
    <div className="relative max-w-md">
      <svg
        className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <Input
        type="search"
        placeholder="Search..."
        className="pl-10"
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Search input with an icon.',
      },
    },
  },
};

// Error state
export const ErrorState: Story = {
  render: () => (
    <div className="space-y-2 max-w-md">
      <Label htmlFor="email">Email Address</Label>
      <Input 
        id="email" 
        type="email" 
        placeholder="Enter your email"
        className="border-destructive focus-visible:border-destructive"
        aria-invalid="true"
      />
      <p className="text-sm text-destructive">Please enter a valid email address</p>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Input showing error state with validation message.',
      },
    },
  },
};

// Success state
export const SuccessState: Story = {
  render: () => (
    <div className="space-y-2 max-w-md">
      <Label htmlFor="email">Email Address</Label>
      <Input 
        id="email" 
        type="email" 
        placeholder="Enter your email"
        value="user@example.com"
        className="border-green-500 focus-visible:border-green-500"
      />
      <p className="text-sm text-green-600">✓ Email is valid</p>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Input showing success state with validation message.',
      },
    },
  },
};

// Textarea-like behavior with rows
export const Textarea: Story = {
  args: {
    placeholder: 'Enter your message...',
    style: { minHeight: '100px', resize: 'vertical' },
  },
  parameters: {
    docs: {
      description: {
        story: 'Input configured to behave like a textarea with multiple lines.',
      },
    },
  },
};

// With help text
export const WithHelpText: Story = {
  render: () => (
    <div className="space-y-2 max-w-md">
      <Label htmlFor="bio">Bio</Label>
      <Input 
        id="bio" 
        placeholder="Tell us about yourself"
      />
      <p className="text-sm text-muted-foreground">
        This information will be displayed on your public profile.
      </p>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Input with helpful description text.',
      },
    },
  },
};

// Input group with button
export const InputGroup: Story = {
  render: () => (
    <div className="flex max-w-md">
      <Input
        placeholder="Enter website URL"
        className="rounded-r-none"
      />
      <Button className="rounded-l-none">
        Visit
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Input grouped with an action button.',
      },
    },
  },
};

// Responsive design
export const Responsive: Story = {
  render: () => (
    <div className="space-y-4 p-4 max-w-2xl">
      <div className="space-y-2">
        <Label>Mobile-first Input</Label>
        <Input placeholder="This input adapts to screen size" />
      </div>
      <div className="text-sm text-muted-foreground">
        Resize your browser window to see how the input adapts responsively.
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'This story demonstrates how inputs adapt to different screen sizes.',
      },
    },
  },
};

// Playground
export const Playground: Story = {
  args: {
    type: 'text',
    placeholder: 'Try different configurations...',
  },
  parameters: {
    docs: {
      description: {
        story: 'Use the controls below to experiment with different input configurations.',
      },
    },
  },
};