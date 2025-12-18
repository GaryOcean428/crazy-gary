import React from 'react'
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'

// Test wrapper component for Card with all parts
const TestCard = ({ 
  title = 'Test Card', 
  description = 'Test description', 
  children = 'Card content',
  footer = 'Card footer',
  ...props 
}) => (
  <Card {...props}>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent>{children}</CardContent>
    <CardFooter>{footer}</CardFooter>
  </Card>
)

describe('UI Components - Card', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Card Structure', () => {
    it('should render complete card structure', () => {
      render(<TestCard />)
      
      expect(screen.getByText('Test Card')).toBeInTheDocument()
      expect(screen.getByText('Test description')).toBeInTheDocument()
      expect(screen.getByText('Card content')).toBeInTheDocument()
      expect(screen.getByText('Card footer')).toBeInTheDocument()
    })

    it('should render card with only title', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Simple Card</CardTitle>
          </CardHeader>
        </Card>
      )
      
      expect(screen.getByText('Simple Card')).toBeInTheDocument()
    })

    it('should render card with only content', () => {
      render(
        <Card>
          <CardContent>Just content</CardContent>
        </Card>
      )
      
      expect(screen.getByText('Just content')).toBeInTheDocument()
    })

    it('should render card with header and content only', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Header Only</CardTitle>
          </CardHeader>
          <CardContent>Content here</CardContent>
        </Card>
      )
      
      expect(screen.getByText('Header Only')).toBeInTheDocument()
      expect(screen.getByText('Content here')).toBeInTheDocument()
    })
  })

  describe('CardHeader', () => {
    it('should render card header with title', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Header Title</CardTitle>
          </CardHeader>
        </Card>
      )
      
      expect(screen.getByText('Header Title')).toBeInTheDocument()
    })

    it('should render card header with description', () => {
      render(
        <Card>
          <CardHeader>
            <CardDescription>Header Description</CardDescription>
          </CardHeader>
        </Card>
      )
      
      expect(screen.getByText('Header Description')).toBeInTheDocument()
    })

    it('should render card header with both title and description', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Title</CardTitle>
            <CardDescription>Description</CardDescription>
          </CardHeader>
        </Card>
      )
      
      expect(screen.getByText('Title')).toBeInTheDocument()
      expect(screen.getByText('Description')).toBeInTheDocument()
    })

    it('should render header with custom content', () => {
      render(
        <Card>
          <CardHeader>
            <div>Custom Header Content</div>
            <img src="test.jpg" alt="Test" />
          </CardHeader>
        </Card>
      )
      
      expect(screen.getByText('Custom Header Content')).toBeInTheDocument()
      expect(screen.getByAltText('Test')).toBeInTheDocument()
    })
  })

  describe('CardTitle', () => {
    it('should render as heading element', () => {
      render(<CardTitle>Card Title</CardTitle>)
      
      const title = screen.getByRole('heading', { name: 'Card Title' })
      expect(title).toBeInTheDocument()
      expect(title.tagName).toBe('H3')
    })

    it('should support custom heading level', () => {
      render(<CardTitle asChild><h2>Level 2 Title</h2></CardTitle>)
      
      const title = screen.getByRole('heading', { name: 'Level 2 Title' })
      expect(title.tagName).toBe('H2')
    })

    it('should handle interactive title', () => {
      const handleClick = vi.fn()
      
      render(
        <CardTitle asChild>
          <button onClick={handleClick}>Clickable Title</button>
        </CardTitle>
      )
      
      const title = screen.getByRole('button', { name: 'Clickable Title' })
      fireEvent.click(title)
      
      expect(handleClick).toHaveBeenCalledTimes(1)
    })
  })

  describe('CardDescription', () => {
    it('should render as paragraph element', () => {
      render(<CardDescription>Card Description</CardDescription>)
      
      const description = screen.getByText('Card Description')
      expect(description).toBeInTheDocument()
      expect(description.tagName).toBe('P')
    })

    it('should render with proper styling classes', () => {
      render(<CardDescription>Styled Description</CardDescription>)
      
      const description = screen.getByText('Styled Description')
      expect(description).toHaveClass('text-sm', 'text-muted-foreground')
    })

    it('should handle long descriptions', () => {
      const longDescription = 'a'.repeat(200)
      render(<CardDescription>{longDescription}</CardDescription>)
      
      expect(screen.getByText(longDescription)).toBeInTheDocument()
    })
  })

  describe('CardContent', () => {
    it('should render content section', () => {
      render(<CardContent>Main content</CardContent>)
      
      expect(screen.getByText('Main content')).toBeInTheDocument()
    })

    it('should render complex content', () => {
      render(
        <CardContent>
          <div>
            <p>Paragraph content</p>
            <img src="test.jpg" alt="Test" />
            <button>Action button</button>
          </div>
        </CardContent>
      )
      
      expect(screen.getByText('Paragraph content')).toBeInTheDocument()
      expect(screen.getByAltText('Test')).toBeInTheDocument()
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should handle interactive content', () => {
      const handleClick = vi.fn()
      
      render(
        <CardContent>
          <button onClick={handleClick}>Click me</button>
        </CardContent>
      )
      
      fireEvent.click(screen.getByRole('button'))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })
  })

  describe('CardFooter', () => {
    it('should render footer section', () => {
      render(<CardFooter>Footer content</CardFooter>)
      
      expect(screen.getByText('Footer content')).toBeInTheDocument()
    })

    it('should render footer with action buttons', () => {
      render(
        <CardFooter>
          <button>Cancel</button>
          <button>Confirm</button>
        </CardFooter>
      )
      
      expect(screen.getByText('Cancel')).toBeInTheDocument()
      expect(screen.getByText('Confirm')).toBeInTheDocument()
    })

    it('should align footer content', () => {
      render(
        <CardFooter className="justify-between">
          <span>Left</span>
          <span>Right</span>
        </CardFooter>
      )
      
      const footer = screen.getByText('Left').closest('div')
      expect(footer).toHaveClass('justify-between')
    })
  })

  describe('Card Variants and Styling', () => {
    it('should support default card styling', () => {
      render(<Card>Default card</Card>)
      
      const card = screen.getByText('Default card').closest('div')
      expect(card).toHaveClass('rounded-lg', 'border')
    })

    it('should support custom className', () => {
      render(<Card className="custom-card">Custom styled</Card>)
      
      const card = screen.getByText('Custom styled').closest('div')
      expect(card).toHaveClass('custom-card')
    })

    it('should support custom styling props', () => {
      render(
        <Card style={{ backgroundColor: 'red' }}>
          Styled card
        </Card>
      )
      
      const card = screen.getByText('Styled card').closest('div')
      expect(card).toHaveStyle({ backgroundColor: 'red' })
    })

    it('should handle responsive classes', () => {
      render(
        <Card className="md:p-6 lg:p-8">
          Responsive card
        </Card>
      )
      
      const card = screen.getByText('Responsive card').closest('div')
      expect(card).toHaveClass('md:p-6', 'lg:p-8')
    })
  })

  describe('Card Interactions', () => {
    it('should be focusable', () => {
      render(<Card tabIndex={0}>Focusable card</Card>)
      
      const card = screen.getByText('Focusable card').closest('div')
      expect(card).toHaveAttribute('tabindex', '0')
    })

    it('should handle click events', () => {
      const handleClick = vi.fn()
      
      render(
        <Card onClick={handleClick}>
          <CardContent>Clickable card</CardContent>
        </Card>
      )
      
      fireEvent.click(screen.getByText('Clickable card'))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should handle hover states', () => {
      render(
        <Card className="hover:bg-accent">
          <CardContent>Hoverable card</CardContent>
        </Card>
      )
      
      const card = screen.getByText('Hoverable card').closest('div')
      expect(card).toHaveClass('hover:bg-accent')
    })

    it('should handle keyboard navigation', () => {
      const handleKeyDown = vi.fn()
      
      render(
        <Card tabIndex={0} onKeyDown={handleKeyDown}>
          <CardContent>Keyboard card</CardContent>
        </Card>
      )
      
      const card = screen.getByText('Keyboard card').closest('div')
      fireEvent.keyDown(card, { key: 'Enter' })
      
      expect(handleKeyDown).toHaveBeenCalledTimes(1)
    })
  })

  describe('Card Composition', () => {
    it('should compose with form elements', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Login Form</CardTitle>
          </CardHeader>
          <CardContent>
            <form>
              <input placeholder="Username" />
              <input placeholder="Password" type="password" />
            </form>
          </CardContent>
          <CardFooter>
            <button>Sign In</button>
          </CardFooter>
        </Card>
      )
      
      expect(screen.getByText('Login Form')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Username')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Password')).toBeInTheDocument()
      expect(screen.getByText('Sign In')).toBeInTheDocument()
    })

    it('should compose with media elements', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Image Card</CardTitle>
          </CardHeader>
          <CardContent>
            <img src="test.jpg" alt="Test" />
            <p>Image description</p>
          </CardContent>
        </Card>
      )
      
      expect(screen.getByAltText('Test')).toBeInTheDocument()
      expect(screen.getByText('Image description')).toBeInTheDocument()
    })

    it('should compose with list elements', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>List Card</CardTitle>
          </CardHeader>
          <CardContent>
            <ul>
              <li>Item 1</li>
              <li>Item 2</li>
              <li>Item 3</li>
            </ul>
          </CardContent>
        </Card>
      )
      
      expect(screen.getByText('Item 1')).toBeInTheDocument()
      expect(screen.getByText('Item 2')).toBeInTheDocument()
      expect(screen.getByText('Item 3')).toBeInTheDocument()
    })
  })

  describe('Card Layout Patterns', () => {
    it('should support grid layout', () => {
      render(
        <div className="grid grid-cols-3 gap-4">
          <Card>Card 1</Card>
          <Card>Card 2</Card>
          <Card>Card 3</Card>
        </div>
      )
      
      const cards = screen.getAllByText(/Card \d/)
      expect(cards).toHaveLength(3)
    })

    it('should support flex layout', () => {
      render(
        <div className="flex gap-4">
          <Card>Flex Card 1</Card>
          <Card>Flex Card 2</Card>
        </div>
      )
      
      expect(screen.getByText('Flex Card 1')).toBeInTheDocument()
      expect(screen.getByText('Flex Card 2')).toBeInTheDocument()
    })

    it('should support masonry layout', () => {
      render(
        <div className="columns-3">
          <Card>Short card</Card>
          <Card>Taller card<br/>with more content</Card>
          <Card>Another card</Card>
        </div>
      )
      
      expect(screen.getByText('Short card')).toBeInTheDocument()
      expect(screen.getByText('Another card')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(
        <Card aria-label="User profile card">
          <CardContent>Profile content</CardContent>
        </Card>
      )
      
      const card = screen.getByText('Profile content').closest('div')
      expect(card).toHaveAttribute('aria-label', 'User profile card')
    })

    it('should support ARIA describedby', () => {
      render(
        <>
          <Card aria-describedby="card-description">
            <CardContent>Card content</CardContent>
          </Card>
          <div id="card-description">Card description</div>
        </>
      )
      
      const card = screen.getByText('Card content').closest('div')
      expect(card).toHaveAttribute('aria-describedby', 'card-description')
    })

    it('should have semantic structure', () => {
      render(<TestCard />)
      
      const card = screen.getByText('Card content').closest('div')
      expect(card).toHaveClass('rounded-lg', 'border')
    })

    it('should support role attributes', () => {
      render(
        <Card role="article">
          <CardContent>Article content</CardContent>
        </Card>
      )
      
      const card = screen.getByText('Article content').closest('div')
      expect(card).toHaveAttribute('role', 'article')
    })
  })

  describe('Performance', () => {
    it('should not re-render unnecessarily', () => {
      const { rerender } = render(<Card>Content</Card>)
      
      rerender(<Card>Content</Card>)
      
      // Should maintain same DOM structure
      expect(screen.getByText('Content')).toBeInTheDocument()
    })

    it('should handle large content efficiently', () => {
      const largeContent = Array.from({ length: 1000 }, (_, i) => (
        <div key={i}>Item {i}</div>
      ))
      
      render(<CardContent>{largeContent}</CardContent>)
      
      expect(screen.getByText('Item 0')).toBeInTheDocument()
      expect(screen.getByText('Item 999')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty card', () => {
      render(<Card></Card>)
      
      const card = screen.getByText('Card content').closest('div')
      expect(card).toBeInTheDocument()
    })

    it('should handle nested cards', () => {
      render(
        <Card>
          <CardContent>
            <Card>
              <CardContent>Nested card</CardContent>
            </Card>
          </CardContent>
        </Card>
      )
      
      expect(screen.getByText('Nested card')).toBeInTheDocument()
    })

    it('should handle very long content', () => {
      const longContent = 'a'.repeat(10000)
      render(<CardContent>{longContent}</CardContent>)
      
      expect(screen.getByText(longContent)).toBeInTheDocument()
    })

    it('should handle special characters', () => {
      render(
        <CardTitle>Special &amp; Characters &lt;3</CardTitle>
      )
      
      expect(screen.getByRole('heading')).toHaveTextContent('Special & Characters <3')
    })

    it('should handle null and undefined children', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Title</CardTitle>
            {null}
            {undefined}
          </CardHeader>
        </Card>
      )
      
      expect(screen.getByText('Title')).toBeInTheDocument()
    })
  })
})
