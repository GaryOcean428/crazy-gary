import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent } from './card';
import { Button } from './button';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
The Card component is a flexible container component that can hold content and actions. 
It consists of several sub-components that can be combined to create different card layouts.

## Components
- **Card**: The main container component
- **CardHeader**: Top section for title and description
- **CardTitle**: Card title
- **CardDescription**: Card description
- **CardContent**: Main content area
- **CardFooter**: Bottom section for actions
- **CardAction**: Action buttons positioned in the header

## Features
- Responsive design
- Flexible layout with grid system
- Interactive mobile support
- Accessible structure
- Multiple layout variations
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
  args: {},
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic card with header and content
export const Basic: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>
          This is a basic card with a title and description.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>
          This is the main content area of the card. You can put any content here
          including text, images, forms, or other components.
        </p>
      </CardContent>
    </Card>
  ),
};

// Card with footer actions
export const WithFooter: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Card with Actions</CardTitle>
        <CardDescription>
          This card includes footer actions for user interaction.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>
          The footer contains action buttons that users can click to perform
          various operations.
        </p>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">
          Cancel
        </Button>
        <Button className="w-full">
          Confirm
        </Button>
      </CardFooter>
    </Card>
  ),
};

// Card with header actions
export const WithHeaderActions: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Card with Header Actions</CardTitle>
        <CardDescription>
          Actions can be placed in the header for easy access.
        </CardDescription>
        <CardAction>
          <Button variant="ghost" size="icon">
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
                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
              />
            </svg>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p>
          Header actions are positioned in the top-right corner and are great
          for menu buttons, close buttons, or other quick actions.
        </p>
      </CardContent>
    </Card>
  ),
};

// Product card example
export const ProductCard: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <div className="w-full h-32 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg mb-4 flex items-center justify-center">
          <span className="text-white text-2xl">📱</span>
        </div>
        <CardTitle>Smartphone Pro</CardTitle>
        <CardDescription>
          Latest flagship smartphone with advanced camera system
        </CardDescription>
        <CardAction>
          <Button variant="ghost" size="icon">
            ❤️
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Price</span>
            <span className="font-semibold">$999.99</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Rating</span>
            <span className="flex items-center">
              ⭐⭐⭐⭐⭐ 4.8
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Add to Cart</Button>
      </CardFooter>
    </Card>
  ),
};

// Profile card example
export const ProfileCard: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xl font-bold">JD</span>
          </div>
          <div>
            <CardTitle>John Doe</CardTitle>
            <CardDescription>Senior Frontend Developer</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-muted-foreground" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            <span className="text-sm">john.doe@example.com</span>
          </div>
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-muted-foreground" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm">San Francisco, CA</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full mr-2">Message</Button>
        <Button className="w-full">Follow</Button>
      </CardFooter>
    </Card>
  ),
};

// Empty state card
export const EmptyState: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m8-8v8m-8 0h8" />
          </svg>
        </div>
        <CardTitle className="text-center">No items yet</CardTitle>
        <CardDescription className="text-center">
          Get started by creating your first item
        </CardDescription>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Create First Item</Button>
      </CardFooter>
    </Card>
  ),
};

// Minimal card
export const Minimal: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardContent className="pt-6">
        <p>
          This is a minimal card with just content and no header or footer.
          Perfect for simple layouts and compact designs.
        </p>
      </CardContent>
    </Card>
  ),
};

// Playground for testing
export const Playground: Story = {
  render: () => (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle>Playground</CardTitle>
        <CardDescription>
          Use this card to test different content combinations and layouts.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>
          Add your content here to see how it looks in the card component.
          You can experiment with different text lengths, layouts, and nested
          components.
        </p>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="flex-1">Cancel</Button>
        <Button className="flex-1">Save</Button>
      </CardFooter>
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Use this playground to experiment with different card configurations.',
      },
    },
  },
};

// Responsive story
export const Responsive: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle>Responsive Card 1</CardTitle>
          <CardDescription>This card adapts to different screen sizes</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Resize your browser to see how the layout changes.</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Responsive Card 2</CardTitle>
          <CardDescription>Cards stack on mobile and sit side by side on desktop</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Perfect for responsive grid layouts.</p>
        </CardContent>
      </Card>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'This story demonstrates how cards adapt to different screen sizes.',
      },
    },
  },
};