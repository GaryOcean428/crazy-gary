import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from './dialog';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: 'UI/Dialog',
  component: Dialog,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
The Dialog component is a modal window that appears on top of the main content. 
It's used for focused interactions that require user attention and input.

## Components
- **Dialog**: Root component
- **DialogTrigger**: Button or element that opens the dialog
- **DialogContent**: Main dialog container
- **DialogHeader**: Top section for title and description
- **DialogTitle**: Dialog title
- **DialogDescription**: Dialog description
- **DialogFooter**: Bottom section for actions
- **DialogClose**: Close button

## Features
- Focus management and trap
- Escape key to close
- Overlay click to close
- Animated transitions
- Accessible with proper ARIA attributes
- Responsive design
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    open: {
      control: 'boolean',
      description: 'Whether the dialog is open',
    },
  },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic dialog
export const Basic: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    
    return (
      <>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Open Dialog</Button>
          </DialogTrigger>
          <DialogPortal>
            <DialogOverlay />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Profile</DialogTitle>
                <DialogDescription>
                  Make changes to your profile here. Click save when you're done.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" defaultValue="John Doe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" defaultValue="@johndoe" />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Save changes</Button>
              </DialogFooter>
            </DialogContent>
          </DialogPortal>
        </Dialog>
      </>
    );
  },
};

// Confirmation dialog
export const Confirmation: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    
    return (
      <>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive">Delete Account</Button>
          </DialogTrigger>
          <DialogPortal>
            <DialogOverlay />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you absolutely sure?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will permanently delete your account
                  and remove your data from our servers.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={() => setOpen(false)}>
                  Delete Account
                </Button>
              </DialogFooter>
            </DialogContent>
          </DialogPortal>
        </Dialog>
      </>
    );
  },
};

// Success dialog
export const Success: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    
    return (
      <>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Show Success</Button>
          </DialogTrigger>
          <DialogPortal>
            <DialogOverlay />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>✅ Success!</DialogTitle>
                <DialogDescription>
                  Your changes have been saved successfully.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button onClick={() => setOpen(false)}>Continue</Button>
              </DialogFooter>
            </DialogContent>
          </DialogPortal>
        </Dialog>
      </>
    );
  },
};

// Form dialog
export const Form: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    
    return (
      <>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Create New Project</Button>
          </DialogTrigger>
          <DialogPortal>
            <DialogOverlay />
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>
                  Fill in the details below to create a new project.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="project-name">Project Name</Label>
                  <Input id="project-name" placeholder="My Awesome Project" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input id="description" placeholder="Project description" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input id="category" placeholder="Web Development" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" onClick={() => setOpen(false)}>
                  Create Project
                </Button>
              </DialogFooter>
            </DialogContent>
          </DialogPortal>
        </Dialog>
      </>
    );
  },
};

// Image dialog
export const ImageDialog: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    
    return (
      <>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>View Image</Button>
          </DialogTrigger>
          <DialogPortal>
            <DialogOverlay />
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Screenshot Preview</DialogTitle>
                <DialogDescription>
                  Full size view of the dashboard screenshot
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <div className="w-full h-64 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-2xl">📸</span>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Close
                </Button>
                <Button>Download</Button>
              </DialogFooter>
            </DialogContent>
          </DialogPortal>
        </Dialog>
      </>
    );
  },
};

// Info dialog
export const Info: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    
    return (
      <>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">About</Button>
          </DialogTrigger>
          <DialogPortal>
            <DialogOverlay />
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>About Crazy-Gary</DialogTitle>
                <DialogDescription>
                  Version 1.0.0
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <p>
                  Crazy-Gary is an advanced AI agent platform designed to help developers
                  build, test, and deploy applications efficiently.
                </p>
                <div className="space-y-2">
                  <h4 className="font-medium">Features:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Component development and testing</li>
                    <li>Automated deployment pipeline</li>
                    <li>Real-time monitoring</li>
                    <li>Accessibility testing</li>
                  </ul>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => setOpen(false)}>Got it</Button>
              </DialogFooter>
            </DialogContent>
          </DialogPortal>
        </Dialog>
      </>
    );
  },
};

// Mobile responsive
export const Mobile: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    
    return (
      <>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Mobile Dialog</Button>
          </DialogTrigger>
          <DialogPortal>
            <DialogOverlay />
            <DialogContent className="sm:max-w-[425px] m-4">
              <DialogHeader>
                <DialogTitle>Mobile Optimized</DialogTitle>
                <DialogDescription>
                  This dialog is optimized for mobile devices with touch-friendly interactions.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <p className="text-sm">
                  The dialog content and actions are sized appropriately for mobile screens.
                </p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setOpen(false)}>Confirm</Button>
              </DialogFooter>
            </DialogContent>
          </DialogPortal>
        </Dialog>
      </>
    );
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

// Long content
export const LongContent: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    
    return (
      <>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Terms of Service</Button>
          </DialogTrigger>
          <DialogPortal>
            <DialogOverlay />
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Terms of Service</DialogTitle>
                <DialogDescription>
                  Last updated: December 17, 2025
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">1. Acceptance of Terms</h4>
                  <p>
                    By accessing and using this service, you accept and agree to be bound by the terms 
                    and provision of this agreement. If you do not agree to abide by the above, 
                    please do not use this service.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">2. Use License</h4>
                  <p>
                    Permission is granted to temporarily download one copy of the materials on Crazy-Gary's 
                    website for personal, non-commercial transitory viewing only. This is the grant of a license, 
                    not a transfer of title, and under this license you may not:
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>modify or copy the materials</li>
                    <li>use the materials for any commercial purpose or for any public display</li>
                    <li>attempt to reverse engineer any software contained on the website</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">3. Disclaimer</h4>
                  <p>
                    The materials on Crazy-Gary's website are provided on an 'as is' basis. Crazy-Gary makes 
                    no warranties, expressed or implied, and hereby disclaims and negates all other warranties.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">4. Limitations</h4>
                  <p>
                    In no event shall Crazy-Gary or its suppliers be liable for any damages (including, 
                    without limitation, damages for loss of data or profit, or due to business interruption).
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Decline
                </Button>
                <Button onClick={() => setOpen(false)}>Accept</Button>
              </DialogFooter>
            </DialogContent>
          </DialogPortal>
        </Dialog>
      </>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Dialog with long scrollable content.',
      },
    },
  },
};

// Without footer
export const NoFooter: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    
    return (
      <>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">Simple Dialog</Button>
          </DialogTrigger>
          <DialogPortal>
            <DialogOverlay />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Simple Information</DialogTitle>
                <DialogDescription>
                  This is a simple dialog with just information and a close button.
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </DialogPortal>
        </Dialog>
      </>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Simple dialog without footer actions.',
      },
    },
  },
};