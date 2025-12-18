import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

// ARIA attribute validation utilities
const validateAriaAttributes = (element: HTMLElement, requiredAttrs: Record<string, any> = {}) => {
  const errors: string[] = []
  
  Object.entries(requiredAttrs).forEach(([attr, expectedValue]) => {
    const actualValue = element.getAttribute(attr)
    
    if (expectedValue === true) {
      if (actualValue === null) {
        errors.push(`Missing required aria attribute: ${attr}`)
      }
    } else if (expectedValue === false) {
      if (actualValue !== null) {
        errors.push(`Aria attribute ${attr} should not be present but found: ${actualValue}`)
      }
    } else if (expectedValue !== null && actualValue !== expectedValue) {
      errors.push(`Aria attribute ${attr} expected "${expectedValue}" but found "${actualValue}"`)
    }
  })
  
  return errors
}

const getAriaElement = (container: HTMLElement, role: string, name?: string) => {
  const elements = container.querySelectorAll(`[role="${role}"]`)
  
  if (!name) {
    return elements[0] as HTMLElement
  }
  
  for (const element of elements) {
    const accessibleName = element.getAttribute('aria-label') || 
                          element.getAttribute('aria-labelledby') ||
                          element.textContent?.trim()
    
    if (accessibleName === name) {
      return element as HTMLElement
    }
  }
  
  return null
}

describe('ARIA Attribute Validation', () => {
  describe('ARIA Labels and Descriptions', () => {
    it('validates aria-label attributes', () => {
      render(
        <div>
          <button aria-label="Save document" data-testid="save-btn">
            💾
          </button>
          <input 
            aria-label="Search products" 
            type="search"
            data-testid="search-input"
          />
          <div 
            aria-label="User profile information"
            role="region"
            data-testid="profile-region"
          >
            Profile content
          </div>
        </div>
      )
      
      const saveBtn = screen.getByTestId('save-btn')
      const searchInput = screen.getByTestId('search-input')
      const profileRegion = screen.getByTestId('profile-region')
      
      expect(saveBtn).toHaveAttribute('aria-label', 'Save document')
      expect(searchInput).toHaveAttribute('aria-label', 'Search products')
      expect(profileRegion).toHaveAttribute('aria-label', 'User profile information')
    })

    it('validates aria-labelledby relationships', () => {
      render(
        <div>
          <h2 id="section-title">User Settings</h2>
          <div role="region" aria-labelledby="section-title" data-testid="settings-region">
            Settings content
          </div>
          
          <label id="name-label" htmlFor="name-input">Full Name</label>
          <input 
            id="name-input" 
            aria-labelledby="name-label"
            data-testid="name-input"
          />
        </div>
      )
      
      const settingsRegion = screen.getByTestId('settings-region')
      const nameInput = screen.getByTestId('name-input')
      
      expect(settingsRegion).toHaveAttribute('aria-labelledby', 'section-title')
      expect(nameInput).toHaveAttribute('aria-labelledby', 'name-label')
    })

    it('validates aria-describedby relationships', () => {
      render(
        <div>
          <input 
            type="email"
            aria-describedby="email-help email-error"
            data-testid="email-input"
          />
          <div id="email-help" className="sr-only">
            Enter your email address
          </div>
          <div id="email-error" className="sr-only">
            Email format is invalid
          </div>
        </div>
      )
      
      const emailInput = screen.getByTestId('email-input')
      const describedBy = emailInput.getAttribute('aria-describedby')
      
      expect(describedBy).toContain('email-help')
      expect(describedBy).toContain('email-error')
    })

    it('validates aria-label precedence over other naming methods', () => {
      render(
        <div>
          <button 
            aria-label="Accessible name"
            title="Tooltip text"
            data-testid="button-with-both"
          >
            Visible text
          </button>
        </div>
      )
      
      const button = screen.getByTestId('button-with-both')
      
      // aria-label should take precedence
      expect(button).toHaveAttribute('aria-label', 'Accessible name')
      expect(button).toHaveAttribute('title', 'Tooltip text')
    })
  })

  describe('ARIA States and Properties', () => {
    it('validates aria-expanded for disclosure patterns', () => {
      render(
        <div>
          <button 
            aria-expanded="false"
            aria-controls="disclosure-content"
            data-testid="disclosure-button"
          >
            Show details
          </button>
          <div id="disclosure-content" hidden data-testid="disclosure-content">
            Hidden content
          </div>
        </div>
      )
      
      const button = screen.getByTestId('disclosure-button')
      const content = screen.getByTestId('disclosure-content')
      
      expect(button).toHaveAttribute('aria-expanded', 'false')
      expect(button).toHaveAttribute('aria-controls', 'disclosure-content')
      expect(content).toHaveAttribute('hidden')
    })

    it('validates aria-selected for selection patterns', () => {
      render(
        <div role="tablist">
          <button role="tab" aria-selected="true" tabIndex={0} data-testid="tab-1">
            Tab 1
          </button>
          <button role="tab" aria-selected="false" tabIndex={-1} data-testId="tab-2">
            Tab 2
          </button>
        </div>
      )
      
      const tab1 = screen.getByTestId('tab-1')
      const tab2 = screen.getByTestId('tab-2')
      
      expect(tab1).toHaveAttribute('aria-selected', 'true')
      expect(tab2).toHaveAttribute('aria-selected', 'false')
    })

    it('validates aria-checked for checkbox patterns', () => {
      render(
        <div role="group" aria-label="Settings">
          <div role="checkbox" aria-checked="true" tabIndex={0} data-testid="checkbox-1">
            Enable notifications
          </div>
          <div role="checkbox" aria-checked="false" tabIndex={-1} data-testid="checkbox-2">
            Enable email alerts
          </div>
        </div>
      )
      
      const checkbox1 = screen.getByTestId('checkbox-1')
      const checkbox2 = screen.getByTestId('checkbox-2')
      
      expect(checkbox1).toHaveAttribute('aria-checked', 'true')
      expect(checkbox2).toHaveAttribute('aria-checked', 'false')
    })

    it('validates aria-pressed for toggle buttons', () => {
      render(
        <div>
          <button 
            aria-pressed="false"
            data-testid="toggle-btn"
          >
            Start recording
          </button>
        </div>
      )
      
      const toggleBtn = screen.getByTestId('toggle-btn')
      
      expect(toggleBtn).toHaveAttribute('aria-pressed', 'false')
      expect(toggleBtn).toHaveAttribute('aria-label')
    })

    it('validates aria-invalid for form validation', () => {
      render(
        <div>
          <label htmlFor="username">Username</label>
          <input 
            id="username"
            aria-invalid="true"
            aria-describedby="username-error"
            data-testid="username-input"
          />
          <div id="username-error" role="alert" data-testid="username-error">
            Username is required
          </div>
        </div>
      )
      
      const usernameInput = screen.getByTestId('username-input')
      
      expect(usernameInput).toHaveAttribute('aria-invalid', 'true')
      expect(usernameInput).toHaveAttribute('aria-describedby', 'username-error')
    })

    it('validates aria-required for required form fields', () => {
      render(
        <div>
          <label htmlFor="email">Email Address</label>
          <input 
            id="email"
            aria-required="true"
            type="email"
            data-testid="email-input"
          />
        </div>
      )
      
      const emailInput = screen.getByTestId('email-input')
      
      expect(emailInput).toHaveAttribute('aria-required', 'true')
    })

    it('validates aria-disabled for disabled elements', () => {
      render(
        <div>
          <button 
            aria-disabled="true"
            disabled
            data-testid="disabled-button"
          >
            Disabled Button
          </button>
          <input 
            aria-disabled="true"
            disabled
            data-testid="disabled-input"
          />
        </div>
      )
      
      const disabledButton = screen.getByTestId('disabled-button')
      const disabledInput = screen.getByTestId('disabled-input')
      
      expect(disabledButton).toHaveAttribute('aria-disabled', 'true')
      expect(disabledInput).toHaveAttribute('aria-disabled', 'true')
    })

    it('validates aria-hidden for decorative elements', () => {
      render(
        <div>
          <span aria-hidden="true" data-testid="decorative-icon">🎨</span>
          <div aria-hidden="true" data-testid="decorative-div">
            Decorative content
          </div>
          <span data-testid="accessible-icon">💾 Save</span>
        </div>
      )
      
      const decorativeIcon = screen.getByTestId('decorative-icon')
      const decorativeDiv = screen.getByTestId('decorative-div')
      const accessibleIcon = screen.getByTestId('accessible-icon')
      
      expect(decorativeIcon).toHaveAttribute('aria-hidden', 'true')
      expect(decorativeDiv).toHaveAttribute('aria-hidden', 'true')
      expect(accessibleIcon).not.toHaveAttribute('aria-hidden')
    })
  })

  describe('ARIA Relationships', () => {
    it('validates aria-controls relationships', () => {
      render(
        <div>
          <button 
            aria-controls="panel-1"
            aria-expanded="false"
            data-testid="control-button"
          >
            Toggle Panel
          </button>
          <div id="panel-1" role="region" data-testid="controlled-panel">
            Panel content
          </div>
        </div>
      )
      
      const controlButton = screen.getByTestId('control-button')
      const controlledPanel = screen.getByTestId('controlled-panel')
      
      expect(controlButton).toHaveAttribute('aria-controls', 'panel-1')
      expect(controlledPanel).toHaveAttribute('id', 'panel-1')
    })

    it('validates aria-labelledby relationships', () => {
      render(
        <div>
          <h2 id="form-title">Contact Form</h2>
          <div role="form" aria-labelledby="form-title" data-testid="form-region">
            Form fields
          </div>
        </div>
      )
      
      const formRegion = screen.getByTestId('form-region')
      
      expect(formRegion).toHaveAttribute('aria-labelledby', 'form-title')
    })

    it('validates aria-describedby relationships', () => {
      render(
        <div>
          <button 
            aria-describedby="button-help"
            data-testid="described-button"
          >
            Submit Form
          </button>
          <div id="button-help">
            Click to submit your information
          </div>
        </div>
      )
      
      const describedButton = screen.getByTestId('described-button')
      
      expect(describedButton).toHaveAttribute('aria-describedby', 'button-help')
    })

    it('validates aria-activedescendant for composite widgets', () => {
      render(
        <div>
          <input 
            role="combobox"
            aria-expanded="false"
            aria-activedescendant=""
            data-testid="combobox"
          />
          <ul role="listbox">
            <li role="option" id="option-1">Option 1</li>
            <li role="option" id="option-2">Option 2</li>
          </ul>
        </div>
      )
      
      const combobox = screen.getByTestId('combobox')
      
      expect(combobox).toHaveAttribute('role', 'combobox')
      expect(combobox).toHaveAttribute('aria-activedescendant', '')
    })

    it('validates aria-owns for dynamic content relationships', () => {
      render(
        <div>
          <button 
            aria-haspopup="menu"
            aria-expanded="false"
            aria-owns="dynamic-menu"
            data-testid="menu-button"
          >
            Menu
          </button>
          <div id="dynamic-menu" role="menu" data-testid="dynamic-menu">
            <div role="menuitem">Item 1</div>
            <div role="menuitem">Item 2</div>
          </div>
        </div>
      )
      
      const menuButton = screen.getByTestId('menu-button')
      const dynamicMenu = screen.getByTestId('dynamic-menu')
      
      expect(menuButton).toHaveAttribute('aria-owns', 'dynamic-menu')
      expect(dynamicMenu).toHaveAttribute('id', 'dynamic-menu')
    })
  })

  describe('ARIA Live Regions', () => {
    it('validates aria-live attributes', () => {
      render(
        <div>
          <div 
            aria-live="polite"
            aria-atomic="true"
            data-testid="polite-region"
          >
            Polite announcement
          </div>
          <div 
            aria-live="assertive"
            role="alert"
            data-testid="assertive-region"
          >
            Urgent alert
          </div>
          <div 
            aria-live="off"
            data-testid="silent-region"
          >
            Silent content
          </div>
        </div>
      )
      
      const politeRegion = screen.getByTestId('polite-region')
      const assertiveRegion = screen.getByTestId('assertive-region')
      const silentRegion = screen.getByTestId('silent-region')
      
      expect(politeRegion).toHaveAttribute('aria-live', 'polite')
      expect(politeRegion).toHaveAttribute('aria-atomic', 'true')
      
      expect(assertiveRegion).toHaveAttribute('aria-live', 'assertive')
      expect(assertiveRegion).toHaveAttribute('role', 'alert')
      
      expect(silentRegion).toHaveAttribute('aria-live', 'off')
    })

    it('validates aria-relevant for live region content changes', () => {
      render(
        <div>
          <div 
            aria-live="polite"
            aria-relevant="additions text"
            data-testid="relevant-region"
          >
            Content changes will be announced
          </div>
        </div>
      )
      
      const relevantRegion = screen.getByTestId('relevant-region')
      
      expect(relevantRegion).toHaveAttribute('aria-relevant', 'additions text')
    })
  })

  describe('ARIA Global Attributes', () => {
    it('validates aria-label on global elements', () => {
      render(
        <div>
          <main aria-label="Main content area" data-testid="main-region">
            Main content
          </main>
          <nav aria-label="Primary navigation" data-testid="nav-region">
            Navigation
          </nav>
          <aside aria-label="Sidebar content" data-testid="aside-region">
            Sidebar
          </aside>
        </div>
      )
      
      const mainRegion = screen.getByTestId('main-region')
      const navRegion = screen.getByTestId('nav-region')
      const asideRegion = screen.getByTestId('aside-region')
      
      expect(mainRegion).toHaveAttribute('aria-label', 'Main content area')
      expect(navRegion).toHaveAttribute('aria-label', 'Primary navigation')
      expect(asideRegion).toHaveAttribute('aria-label', 'Sidebar content')
    })

    it('validates aria-hidden on decorative elements', () => {
      render(
        <div>
          <img 
            src="/icon.svg" 
            aria-hidden="true"
            data-testid="hidden-image"
          />
          <div aria-hidden="true" data-testid="hidden-div">
            Decorative content
          </div>
          <span data-testid="visible-span">Visible content</span>
        </div>
      )
      
      const hiddenImage = screen.getByTestId('hidden-image')
      const hiddenDiv = screen.getByTestId('hidden-div')
      const visibleSpan = screen.getByTestId('visible-span')
      
      expect(hiddenImage).toHaveAttribute('aria-hidden', 'true')
      expect(hiddenDiv).toHaveAttribute('aria-hidden', 'true')
      expect(visibleSpan).not.toHaveAttribute('aria-hidden')
    })
  })

  describe('ARIA Widget Patterns', () => {
    it('validates tablist and tab patterns', () => {
      render(
        <div role="tablist" aria-label="Sample tabs">
          <button 
            role="tab" 
            aria-selected="true" 
            aria-controls="panel-1" 
            tabIndex={0}
            data-testid="tab-1"
          >
            Tab 1
          </button>
          <button 
            role="tab" 
            aria-selected="false" 
            aria-controls="panel-2" 
            tabIndex={-1}
            data-testid="tab-2"
          >
            Tab 2
          </button>
        </div>
      )
      
      const tablist = screen.getByRole('tablist')
      const tab1 = screen.getByTestId('tab-1')
      const tab2 = screen.getByTestId('tab-2')
      
      expect(tablist).toHaveAttribute('aria-label', 'Sample tabs')
      expect(tab1).toHaveAttribute('aria-selected', 'true')
      expect(tab1).toHaveAttribute('aria-controls', 'panel-1')
      expect(tab2).toHaveAttribute('aria-selected', 'false')
      expect(tab2).toHaveAttribute('aria-controls', 'panel-2')
    })

    it('validates tabpanel pattern', () => {
      render(
        <div>
          <div role="tabpanel" id="panel-1" aria-labelledby="tab-1" data-testid="tabpanel">
            Tab panel content
          </div>
        </div>
      )
      
      const tabpanel = screen.getByTestId('tabpanel')
      
      expect(tabpanel).toHaveAttribute('role', 'tabpanel')
      expect(tabpanel).toHaveAttribute('id', 'panel-1')
      expect(tabpanel).toHaveAttribute('aria-labelledby', 'tab-1')
    })

    it('validates menu and menuitem patterns', () => {
      render(
        <div role="menu" aria-label="File operations">
          <div role="menuitem" tabIndex={0} data-testid="menuitem-1">
            New File
          </div>
          <div role="menuitem" tabIndex={-1} aria-disabled="true" data-testid="menuitem-2">
            Open File (Disabled)
          </div>
          <div role="menuitem" tabIndex={-1} data-testid="menuitem-3">
            Save As
          </div>
        </div>
      )
      
      const menu = screen.getByRole('menu')
      const menuItems = screen.getAllByRole('menuitem')
      
      expect(menu).toHaveAttribute('aria-label', 'File operations')
      expect(menuItems).toHaveLength(3)
      expect(menuItems[1]).toHaveAttribute('aria-disabled', 'true')
    })

    it('validates combobox pattern', () => {
      render(
        <div>
          <label htmlFor="country">Country</label>
          <input
            id="country"
            role="combobox"
            aria-expanded="false"
            aria-autocomplete="list"
            aria-haspopup="listbox"
            aria-activedescendant=""
            aria-describedby="country-help"
          />
          <div id="country-help" className="sr-only">
            Select a country from the list
          </div>
        </div>
      )
      
      const combobox = screen.getByRole('combobox')
      
      expect(combobox).toHaveAttribute('role', 'combobox')
      expect(combobox).toHaveAttribute('aria-expanded', 'false')
      expect(combobox).toHaveAttribute('aria-autocomplete', 'list')
      expect(combobox).toHaveAttribute('aria-haspopup', 'listbox')
      expect(combobox).toHaveAttribute('aria-describedby', 'country-help')
    })

    it('validates slider pattern', () => {
      render(
        <div>
          <label htmlFor="volume">Volume</label>
          <input
            id="volume"
            type="range"
            role="slider"
            aria-valuemin="0"
            aria-valuemax="100"
            aria-valuenow="50"
            aria-valuetext="50 percent"
            aria-orientation="horizontal"
          />
        </div>
      )
      
      const slider = screen.getByRole('slider')
      
      expect(slider).toHaveAttribute('role', 'slider')
      expect(slider).toHaveAttribute('aria-valuemin', '0')
      expect(slider).toHaveAttribute('aria-valuemax', '100')
      expect(slider).toHaveAttribute('aria-valuenow', '50')
      expect(slider).toHaveAttribute('aria-valuetext', '50 percent')
      expect(slider).toHaveAttribute('aria-orientation', 'horizontal')
    })
  })

  describe('ARIA Error Handling', () => {
    it('provides error announcements for form validation', () => {
      const TestComponent = () => {
        const [errors, setErrors] = React.useState<Record<string, string>>({})
        
        const validateField = (fieldName: string, value: string) => {
          if (!value) {
            setErrors(prev => ({ ...prev, [fieldName]: `${fieldName} is required` }))
          } else {
            setErrors(prev => {
              const newErrors = { ...prev }
              delete newErrors[fieldName]
              return newErrors
            })
          }
        }
        
        return (
          <form>
            <div>
              <label htmlFor="name">Name</label>
              <input 
                id="name"
                aria-invalid={errors.name ? 'true' : 'false'}
                aria-describedby={errors.name ? 'name-error' : undefined}
                onBlur={(e) => validateField('name', e.target.value)}
              />
              {errors.name && (
                <div id="name-error" role="alert" aria-live="polite">
                  {errors.name}
                </div>
              )}
            </div>
          </form>
        )
      }
      
      render(<TestComponent />)
      
      const nameInput = screen.getByLabelText('Name')
      
      // Trigger validation error
      fireEvent.blur(nameInput, { target: { value: '' } })
      
      const errorMessage = await screen.findByRole('alert')
      expect(errorMessage).toHaveTextContent('Name is required')
      expect(nameInput).toHaveAttribute('aria-invalid', 'true')
    })
  })
})
