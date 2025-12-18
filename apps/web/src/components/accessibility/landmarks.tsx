/**
 * Skip Links and Landmarks System
 * Provides comprehensive navigation landmarks and skip links for better accessibility
 */

import React, { ReactNode, useEffect, useRef } from 'react'

// Types for landmarks
export interface LandmarkConfig {
  role: string
  ariaLabel?: string
  ariaLabelledby?: string
  id?: string
  className?: string
}

// Types for skip links
export interface SkipLinkConfig {
  href: string
  text: string
  description?: string
  className?: string
}

// Main landmark component
export const Landmark: React.FC<{
  children: ReactNode
  config: LandmarkConfig
  'data-testid'?: string
}> = ({ children, config, 'data-testid': testId, ...props }) => {
  const { role, ariaLabel, ariaLabelledby, id, className = '', ...restProps } = config
  
  return (
    <div
      role={role}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby}
      id={id}
      className={className}
      data-testid={testId}
      {...restProps}
    >
      {children}
    </div>
  )
}

// Predefined landmark configurations
export const LANDMARK_CONFIGS = {
  banner: {
    role: 'banner',
    className: 'fixed top-0 left-0 right-0 z-50 bg-background border-b'
  } as LandmarkConfig,

  navigation: {
    role: 'navigation',
    className: 'bg-muted/50 border-r'
  } as LandmarkConfig,

  main: {
    role: 'main',
    className: 'flex-1 overflow-auto'
  } as LandmarkConfig,

  complementary: {
    role: 'complementary',
    className: 'bg-muted/30'
  } as LandmarkConfig,

  contentinfo: {
    role: 'contentinfo',
    className: 'bg-muted/20 border-t'
  } as LandmarkConfig,

  search: {
    role: 'search',
    className: ''
  } as LandmarkConfig,

  form: {
    role: 'form',
    className: ''
  } as LandmarkConfig,

  region: {
    role: 'region',
    className: ''
  } as LandmarkConfig
}

// Skip links container
export const SkipLinks: React.FC<{
  links: SkipLinkConfig[]
  className?: string
}> = ({ links, className = '' }) => {
  return (
    <nav
      aria-label="Skip links"
      className={`sr-only focus-within:not-sr-only focus-within:absolute focus-within:top-4 focus-within:left-4 focus-within:z-50 focus-within:space-y-2 ${className}`}
    >
      {links.map((link, index) => (
        <a
          key={index}
          href={link.href}
          className="block px-4 py-2 bg-primary text-primary-foreground rounded-md shadow-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
        >
          {link.text}
          {link.description && (
            <span className="sr-only">{link.description}</span>
          )}
        </a>
      ))}
    </nav>
  )
}

// Default skip links configuration
export const DEFAULT_SKIP_LINKS: SkipLinkConfig[] = [
  {
    href: '#main-content',
    text: 'Skip to main content',
    description: 'Jump to the main content area'
  },
  {
    href: '#navigation',
    text: 'Skip to navigation',
    description: 'Jump to the navigation menu'
  },
  {
    href: '#search',
    text: 'Skip to search',
    description: 'Jump to the search input'
  },
  {
    href: '#sidebar',
    text: 'Skip to sidebar',
    description: 'Jump to the sidebar navigation'
  },
  {
    href: '#footer',
    text: 'Skip to footer',
    description: 'Jump to the footer content'
  }
]

// Application layout with landmarks
export const AccessibleLayout: React.FC<{
  children: ReactNode
  skipLinks?: SkipLinkConfig[]
  customLandmarks?: LandmarkConfig[]
}> = ({ 
  children, 
  skipLinks = DEFAULT_SKIP_LINKS,
  customLandmarks = []
}) => {
  return (
    <>
      <SkipLinks links={skipLinks} />
      <Landmark config={LANDMARK_CONFIGS.banner}>
        {children.header}
      </Landmark>
      
      <div className="flex min-h-screen">
        <Landmark config={LANDMARK_CONFIGS.navigation}>
          {children.sidebar}
        </Landmark>
        
        <Landmark config={LANDMARK_CONFIGS.main} id="main-content">
          {children.content}
        </Landmark>
        
        {children.aside && (
          <Landmark config={LANDMARK_CONFIGS.complementary}>
            {children.aside}
          </Landmark>
        )}
      </div>
      
      <Landmark config={LANDMARK_CONFIGS.contentinfo} id="footer">
        {children.footer}
      </Landmark>
      
      {customLandmarks.map((landmark, index) => (
        <Landmark key={index} config={landmark}>
          {/* Custom landmark content would go here */}
        </Landmark>
      ))}
    </>
  )
}

// Component for creating custom landmarks
export const createCustomLandmark = (
  role: string,
  ariaLabel: string,
  id?: string
): LandmarkConfig => ({
  role,
  ariaLabel,
  ariaLabelledby: id ? `${id}-heading` : undefined,
  id
})

// Headings hierarchy helper
export const HeadingHierarchy: React.FC<{
  children: ReactNode
  level: 1 | 2 | 3 | 4 | 5 | 6
  id?: string
  className?: string
  'aria-label'?: string
}> = ({ children, level, id, className = '', ...props }) => {
  const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements
  
  return (
    <HeadingTag
      id={id}
      className={`heading-${level} ${className}`}
      {...props}
    >
      {children}
    </HeadingTag>
  )
}

// Page structure analyzer
export const PageStructureAnalyzer: React.FC = () => {
  const [structure, setStructure] = React.useState<{
    landmarks: string[]
    headings: { level: number; text: string; id?: string }[]
    skipLinks: string[]
  }>({ landmarks: [], headings: [], skipLinks: [] })

  useEffect(() => {
    const analyzePage = () => {
      // Find all landmarks
      const landmarks = Array.from(document.querySelectorAll('[role]'))
        .map(el => el.getAttribute('role') || '')
        .filter(role => role)

      // Find all headings
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'))
        .map(el => ({
          level: parseInt(el.tagName.charAt(1)),
          text: el.textContent?.trim() || '',
          id: el.id
        }))

      // Find skip links
      const skipLinks = Array.from(document.querySelectorAll('nav[aria-label="Skip links"] a'))
        .map(el => el.getAttribute('href') || '')

      setStructure({ landmarks, headings, skipLinks })
    }

    // Analyze on mount and when DOM changes
    analyzePage()
    
    const observer = new MutationObserver(analyzePage)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => observer.disconnect()
  }, [])

  const violations = []

  // Check for required landmarks
  if (!structure.landmarks.includes('main')) {
    violations.push('Missing main landmark')
  }
  if (!structure.landmarks.includes('navigation')) {
    violations.push('Missing navigation landmark')
  }

  // Check heading hierarchy
  const h1Count = structure.headings.filter(h => h.level === 1).length
  if (h1Count === 0) {
    violations.push('Missing H1 heading')
  } else if (h1Count > 1) {
    violations.push('Multiple H1 headings found')
  }

  // Check for skip links
  if (structure.skipLinks.length === 0) {
    violations.push('Missing skip links')
  }

  return (
    <div className="p-4 border rounded-lg bg-muted/20">
      <h3 className="font-semibold mb-2">Page Structure Analysis</h3>
      
      <div className="space-y-2 text-sm">
        <div>
          <strong>Landmarks:</strong> {structure.landmarks.join(', ') || 'None found'}
        </div>
        <div>
          <strong>Headings:</strong>
          <ul className="list-disc list-inside ml-4">
            {structure.headings.map((heading, index) => (
              <li key={index}>
                H{heading.level}: {heading.text}
                {heading.id && ` (${heading.id})`}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <strong>Skip Links:</strong> {structure.skipLinks.length} found
        </div>
      </div>

      {violations.length > 0 && (
        <div className="mt-4 p-2 bg-destructive/10 border border-destructive rounded">
          <strong className="text-destructive">Violations:</strong>
          <ul className="list-disc list-inside ml-4 text-destructive">
            {violations.map((violation, index) => (
              <li key={index}>{violation}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// Accessibility tree viewer
export const AccessibilityTreeViewer: React.FC = () => {
  const [tree, setTree] = React.useState<any[]>([])

  useEffect(() => {
    const generateTree = () => {
      const elements = Array.from(document.querySelectorAll('*'))
      const accessibilityTree = elements
        .filter(el => {
          // Filter for elements that are relevant to accessibility tree
          const role = el.getAttribute('role')
          const tagName = el.tagName.toLowerCase()
          return (
            role ||
            ['button', 'input', 'textarea', 'select', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName) ||
            el.hasAttribute('aria-label') ||
            el.hasAttribute('aria-labelledby')
          )
        })
        .map(el => ({
          tagName: el.tagName.toLowerCase(),
          role: el.getAttribute('role') || null,
          ariaLabel: el.getAttribute('aria-label') || null,
          ariaLabelledby: el.getAttribute('aria-labelledby') || null,
          id: el.id || null,
          textContent: el.textContent?.trim().slice(0, 50) || null
        }))

      setTree(accessibilityTree)
    }

    generateTree()
    
    const observer = new MutationObserver(generateTree)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => observer.disconnect()
  }, [])

  return (
    <div className="p-4 border rounded-lg bg-muted/20 max-h-96 overflow-auto">
      <h3 className="font-semibold mb-2">Accessibility Tree</h3>
      <div className="text-xs font-mono">
        {tree.map((node, index) => (
          <div key={index} className="py-1 border-b border-muted">
            <div className="font-semibold">{node.tagName}</div>
            {node.role && <div>role: {node.role}</div>}
            {node.ariaLabel && <div>aria-label: {node.ariaLabel}</div>}
            {node.id && <div>id: {node.id}</div>}
            {node.textContent && <div>text: {node.textContent}...</div>}
          </div>
        ))}
      </div>
    </div>
  )
}

// Utility component for creating accessible page regions
export const AccessiblePageRegions: React.FC<{
  children: ReactNode
}> = ({ children }) => {
  const headerRef = useRef<HTMLElement>(null)
  const navRef = useRef<HTMLElement>(null)
  const mainRef = useRef<HTMLElement>(null)
  const footerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    // Set up landmark relationships
    const nav = navRef.current
    if (nav && !nav.getAttribute('aria-label')) {
      const main = mainRef.current
      const mainHeading = main?.querySelector('h1')
      if (mainHeading) {
        nav.setAttribute('aria-labelledby', mainHeading.id || 'main-heading')
      }
    }
  }, [])

  return (
    <div className="accessible-page">
      <header ref={headerRef} role="banner" className="bg-background border-b">
        {children.header}
      </header>
      
      <nav 
        ref={navRef} 
        role="navigation" 
        aria-label="Main navigation"
        className="bg-muted/50 border-r"
      >
        {children.nav}
      </nav>
      
      <main 
        ref={mainRef} 
        role="main" 
        id="main-content"
        className="flex-1 overflow-auto p-6"
        tabIndex={-1}
      >
        {children.main}
      </main>
      
      <footer 
        ref={footerRef} 
        role="contentinfo" 
        id="footer"
        className="bg-muted/20 border-t p-6"
      >
        {children.footer}
      </footer>
    </div>
  )
}

export default {
  Landmark,
  LANDMARK_CONFIGS,
  SkipLinks,
  DEFAULT_SKIP_LINKS,
  AccessibleLayout,
  createCustomLandmark,
  HeadingHierarchy,
  PageStructureAnalyzer,
  AccessibilityTreeViewer,
  AccessiblePageRegions
}