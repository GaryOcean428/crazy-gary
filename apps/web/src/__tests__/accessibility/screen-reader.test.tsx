import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

// Mock speech synthesis for screen reader testing
const mockSpeechSynthesis = {
  speak: vi.fn(),
  cancel: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  speaking: false,
  pending: false,
  onvoiceschanged: null,
}

Object.defineProperty(window, 'speechSynthesis', {
  value: mockSpeechSynthesis,
})

// Mock SpeechRecognition
const mockSpeechRecognition = {
  start: vi.fn(),
  stop: vi.fn(),
  abort: vi.fn(),
  continuous: false,
  interimResults: false,
  lang: 'en-US',
  maxAlternatives: 1,
  serviceURI: '',
  grammars: null,
  onaudioend: null,
  onaudiostart: null,
  onend: null,
  onerror: null,
  onnomatch: null,
  onresult: null,
  onsoundend: null,
  onsoundstart: null,
  onspeechend: null,
  onspeechstart: null,
  onstart: null,
}

global.SpeechRecognition = vi.fn(() => mockSpeechRecognition) as any
global.webkitSpeechRecognition = vi.fn(() => mockSpeechRecognition) as any

describe('Screen Reader Compatibility', () => {
  describe('ARIA Labels and Descriptions', () => {
    it('provides proper labels for interactive elements', () => {
      render(
        <div>
          <Button aria-label="Save document" data-testid="save-button">
            💾
          </Button>
          <Button aria-label="Delete item" aria-describedby="delete-help">
            🗑️
          </Button>
          <div id="delete-help" className="sr-only">
            This action cannot be undone
          </div>
        </div>
      )
      
      const saveButton = screen.getByTestId('save-button')
      expect(saveButton).toHaveAttribute('aria-label', 'Save document')
      
      const deleteButton = screen.getByRole('button', { name: 'Delete item' })
      expect(deleteButton).toHaveAttribute('aria-describedby', 'delete-help')
    })

    it('uses aria-labelledby for complex element relationships', () => {
      render(
        <div>
          <h2 id="form-title">Contact Information</h2>
          <div role="form" aria-labelledby="form-title">
            <label htmlFor="name">Name</label>
            <Input id="name" aria-labelledby="name-label" />
            <span id="name-label" className="sr-only">
              Please enter your full name
            </span>
          </div>
        </div>
      )
      
      const form = screen.getByRole('form')
      expect(form).toHaveAttribute('aria-labelledby', 'form-title')
      
      const nameInput = screen.getByLabelText('Name')
      expect(nameInput).toHaveAttribute('aria-labelledby', 'name-label')
    })

    it('announces form validation errors', () => {
      render(
        <form>
          <div>
            <label htmlFor="email">Email Address</label>
            <Input 
              id="email" 
              type="email"
              aria-invalid="true"
              aria-describedby="email-error"
            />
            <div id="email-error" role="alert">
              Please enter a valid email address
            </div>
          </div>
        </form>
      )
      
      const emailInput = screen.getByLabelText('Email Address')
      expect(emailInput).toHaveAttribute('aria-invalid', 'true')
      
      const errorMessage = screen.getByRole('alert')
      expect(errorMessage).toHaveTextContent('Please enter a valid email address')
    })
  })

  describe('Live Regions and Announcements', () => {
    it('announces dynamic content changes', () => {
      const TestComponent = () => {
        const [message, setMessage] = React.useState('')
        const [announcement, setAnnouncement] = React.useState('')
        
        React.useEffect(() => {
          if (message) {
            setAnnouncement(`Updated: ${message}`)
          }
        }, [message])
        
        return (
          <div>
            <button 
              onClick={() => setMessage('New notification')}
              data-testid="trigger-button"
            >
              Trigger Announcement
            </button>
            <div
              aria-live="polite"
              aria-atomic="true"
              className="sr-only"
              data-testid="live-region"
            >
              {announcement}
            </div>
          </div>
        )
      }
      
      render(<TestComponent />)
      
      const button = screen.getByTestId('trigger-button')
      fireEvent.click(button)
      
      const liveRegion = screen.getByTestId('live-region')
      expect(liveRegion).toHaveTextContent('Updated: New notification')
    })

    it('uses assertive live region for urgent updates', () => {
      const TestComponent = () => {
        const [error, setError] = React.useState('')
        
        return (
          <div>
            <button 
              onClick={() => setError('Connection lost!')}
              data-testid="error-trigger"
            >
              Trigger Error
            </button>
            <div
              aria-live="assertive"
              role="alert"
              data-testid="assertive-region"
            >
              {error}
            </div>
          </div>
        )
      }
      
      render(<TestComponent />)
      
      const button = screen.getByTestId('error-trigger')
      fireEvent.click(button)
      
      const errorRegion = screen.getByTestId('assertive-region')
      expect(errorRegion).toHaveAttribute('aria-live', 'assertive')
      expect(errorRegion).toHaveAttribute('role', 'alert')
      expect(errorRegion).toHaveTextContent('Connection lost!')
    })

    it('announces loading states', () => {
      const TestComponent = () => {
        const [isLoading, setIsLoading] = React.useState(false)
        const [status, setStatus] = React.useState('')
        
        const handleLoad = async () => {
          setIsLoading(true)
          setStatus('Loading data...')
          
          // Simulate async operation
          setTimeout(() => {
            setIsLoading(false)
            setStatus('Data loaded successfully')
          }, 100)
        }
        
        return (
          <div>
            <Button 
              onClick={handleLoad}
              disabled={isLoading}
              aria-describedby="loading-status"
              data-testid="load-button"
            >
              Load Data
            </Button>
            <div
              aria-live="polite"
              aria-atomic="true"
              id="loading-status"
              className="sr-only"
              data-testid="loading-status"
            >
              {isLoading ? 'Loading...' : 'Ready'}
            </div>
          </div>
        )
      }
      
      render(<TestComponent />)
      
      const button = screen.getByTestId('load-button')
      fireEvent.click(button)
      
      const statusRegion = screen.getByTestId('loading-status')
      expect(statusRegion).toHaveTextContent('Loading...')
    })
  })

  describe('Complex Widgets', () => {
    it('provides proper ARIA for tabs', () => {
      render(
        <div>
          <div role="tablist" aria-label="Settings">
            <button role="tab" aria-selected="true" aria-controls="panel-1" tabIndex={0}>
              General
            </button>
            <button role="tab" aria-selected="false" aria-controls="panel-2" tabIndex={-1}>
              Security
            </button>
            <button role="tab" aria-selected="false" aria-controls="panel-3" tabIndex={-1}>
              Privacy
            </button>
          </div>
          
          <div role="tabpanel" id="panel-1" aria-labelledby="tab-1">
            General settings content
          </div>
        </div>
      )
      
      const tablist = screen.getByRole('tablist')
      expect(tablist).toHaveAttribute('aria-label', 'Settings')
      
      const selectedTab = screen.getByRole('tab', { selected: true })
      expect(selectedTab).toHaveTextContent('General')
      
      const tabpanel = screen.getByRole('tabpanel')
      expect(tabpanel).toHaveAttribute('aria-labelledby')
      expect(tabpanel).toHaveTextContent('General settings content')
    })

    it('provides proper ARIA for accordion', () => {
      render(
        <div>
          <button
            role="button"
            aria-expanded="false"
            aria-controls="acc-panel"
            id="acc-button"
          >
            What is accessibility?
          </button>
          <div id="acc-panel" role="region" aria-labelledby="acc-button">
            Accessibility ensures that websites are usable by everyone...
          </div>
        </div>
      )
      
      const accordionButton = screen.getByRole('button')
      expect(accordionButton).toHaveAttribute('aria-expanded', 'false')
      expect(accordionButton).toHaveAttribute('aria-controls', 'acc-panel')
      
      const accordionPanel = screen.getByRole('region')
      expect(accordionPanel).toHaveAttribute('aria-labelledby', 'acc-button')
    })

    it('provides proper ARIA for menu and menu items', () => {
      render(
        <div role="menu" aria-label="File operations">
          <div role="menuitem" tabIndex={0} aria-haspopup="false">
            New File
          </div>
          <div role="menuitem" tabIndex={-1} aria-haspopup="false">
            Open File
          </div>
          <div role="menuitem" tabIndex={-1} aria-haspopup="true" aria-expanded="false">
            Export
          </div>
        </div>
      )
      
      const menu = screen.getByRole('menu')
      expect(menu).toHaveAttribute('aria-label', 'File operations')
      
      const menuItems = screen.getAllByRole('menuitem')
      expect(menuItems).toHaveLength(3)
      
      const exportItem = menuItems[2]
      expect(exportItem).toHaveAttribute('aria-haspopup', 'true')
      expect(exportItem).toHaveAttribute('aria-expanded', 'false')
    })

    it('provides proper ARIA for combobox/autocomplete', () => {
      render(
        <div>
          <label htmlFor="country-input">Country</label>
          <input
            id="country-input"
            role="combobox"
            aria-expanded="false"
            aria-autocomplete="list"
            aria-haspopup="listbox"
            aria-activedescendant=""
          />
          <ul role="listbox" aria-label="Countries">
            <li role="option" id="option-1">United States</li>
            <li role="option" id="option-2">United Kingdom</li>
            <li role="option" id="option-3">Canada</li>
          </ul>
        </div>
      )
      
      const combobox = screen.getByRole('combobox')
      expect(combobox).toHaveAttribute('aria-expanded', 'false')
      expect(combobox).toHaveAttribute('aria-autocomplete', 'list')
      expect(combobox).toHaveAttribute('aria-haspopup', 'listbox')
      
      const listbox = screen.getByRole('listbox')
      expect(listbox).toHaveAttribute('aria-label', 'Countries')
      
      const options = screen.getAllByRole('option')
      expect(options).toHaveLength(3)
    })
  })

  describe('Landmarks and Structure', () => {
    it('defines proper page landmarks', () => {
      render(
        <div>
          <header role="banner">
            <nav role="navigation" aria-label="Main navigation">
              <a href="#main">Skip to main content</a>
              <ul>
                <li><a href="#">Home</a></li>
                <li><a href="#">About</a></li>
              </ul>
            </nav>
          </header>
          
          <main role="main" id="main">
            <aside role="complementary" aria-label="Sidebar">
              Related links
            </aside>
            <section aria-label="Content">
              <h1>Main Content</h1>
              <p>Content area</p>
            </section>
          </main>
          
          <footer role="contentinfo">
            <p>&copy; 2024 Company</p>
          </footer>
        </div>
      )
      
      expect(screen.getByRole('banner')).toBeInTheDocument()
      expect(screen.getByRole('navigation')).toBeInTheDocument()
      expect(screen.getByRole('main')).toBeInTheDocument()
      expect(screen.getByRole('complementary')).toBeInTheDocument()
      expect(screen.getByRole('contentinfo')).toBeInTheDocument()
    })

    it('provides headings hierarchy', () => {
      render(
        <div>
          <h1>Website Title</h1>
          <section>
            <h2>Main Section</h2>
            <article>
              <h3>Article Title</h3>
              <p>Article content</p>
              <section>
                <h4>Subsection</h4>
                <p>Subsection content</p>
              </section>
            </article>
          </section>
        </div>
      )
      
      const headings = screen.getAllByRole('heading')
      expect(headings).toHaveLength(5)
      
      expect(headings[0]).toHaveTextContent('Website Title')
      expect(headings[0]).toHaveAttribute('aria-level', '1')
      
      expect(headings[1]).toHaveTextContent('Main Section')
      expect(headings[1]).toHaveAttribute('aria-level', '2')
      
      expect(headings[2]).toHaveTextContent('Article Title')
      expect(headings[2]).toHaveAttribute('aria-level', '3')
      
      expect(headings[3]).toHaveTextContent('Subsection')
      expect(headings[3]).toHaveAttribute('aria-level', '4')
    })

    it('provides alternative text for images', () => {
      render(
        <div>
          <img 
            src="/logo.png" 
            alt="Company logo" 
            data-testid="company-logo"
          />
          <img 
            src="/chart.png" 
            alt="Sales chart showing 25% increase in Q4"
            data-testid="chart-image"
          />
          <img 
            src="/decorative.png" 
            alt=""
            role="presentation"
            data-testid="decorative-image"
          />
        </div>
      )
      
      const companyLogo = screen.getByTestId('company-logo')
      expect(companyLogo).toHaveAttribute('alt', 'Company logo')
      
      const chartImage = screen.getByTestId('chart-image')
      expect(chartImage).toHaveAttribute('alt', 'Sales chart showing 25% increase in Q4')
      
      const decorativeImage = screen.getByTestId('decorative-image')
      expect(decorativeImage).toHaveAttribute('alt', '')
      expect(decorativeImage).toHaveAttribute('role', 'presentation')
    })
  })

  describe('Tables and Data Relationships', () => {
    it('provides proper table structure', () => {
      render(
        <table>
          <caption>Employee Directory</caption>
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Department</th>
              <th scope="col">Email</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">John Doe</th>
              <td>Engineering</td>
              <td>john@example.com</td>
            </tr>
            <tr>
              <th scope="row">Jane Smith</th>
              <td>Marketing</td>
              <td>jane@example.com</td>
            </tr>
          </tbody>
        </table>
      )
      
      const table = screen.getByRole('table')
      expect(table).toBeInTheDocument()
      
      const caption = screen.getByText('Employee Directory')
      expect(caption).toBeInTheDocument()
      
      const headers = screen.getAllByRole('columnheader')
      expect(headers).toHaveLength(3)
      
      const rowHeaders = screen.getAllByRole('rowheader')
      expect(rowHeaders).toHaveLength(2)
    })

    it('associates form elements with tables', () => {
      render(
        <table>
          <thead>
            <tr>
              <th scope="col">Field</th>
              <th scope="col">Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">
                <label htmlFor="name">Name</label>
              </th>
              <td>
                <input id="name" type="text" aria-describedby="name-desc" />
                <div id="name-desc" className="sr-only">
                  Enter your full name
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      )
      
      const nameInput = screen.getByLabelText('Name')
      expect(nameInput).toBeInTheDocument()
      
      const description = screen.getByText('Enter your full name')
      expect(description).toBeInTheDocument()
    })
  })
})
