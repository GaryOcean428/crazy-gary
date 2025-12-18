/**
 * Accessibility Configuration
 * Comprehensive configuration for accessibility testing with axe-core
 */

export const accessibilityConfig = {
  // WCAG 2.1 AA Configuration
  wcag21AA: {
    rules: {
      // Color and Contrast
      'color-contrast': {
        enabled: true,
        options: {
          minContrastRatio: 4.5
        }
      },
      'color-contrast-enhanced': {
        enabled: true,
        options: {
          minContrastRatio: 7
        }
      },
      
      // Keyboard Navigation
      'keyboard': {
        enabled: true
      },
      'keyboard-navigation': {
        enabled: true
      },
      'focus-order-semantics': {
        enabled: true
      },
      'focus-visible': {
        enabled: true
      },
      
      // ARIA Implementation
      'aria-labels': {
        enabled: true
      },
      'aria-roles': {
        enabled: true
      },
      'aria-valid-attr': {
        enabled: true
      },
      'aria-valid-attr-value': {
        enabled: true
      },
      'aria-required-attr': {
        enabled: true
      },
      'aria-required-children': {
        enabled: true
      },
      'aria-required-parent': {
        enabled: true
      },
      'aria-unsupported': {
        enabled: true
      },
      
      // Form Accessibility
      'form-field-multiple-labels': {
        enabled: true
      },
      'label': {
        enabled: true
      },
      'label-title-only': {
        enabled: true
      },
      'form-labels': {
        enabled: true
      },
      
      // Structure and Semantics
      'heading-order': {
        enabled: true
      },
      'landmark-one-main': {
        enabled: true
      },
      'landmark-one Complementary': {
        enabled: true
      },
      'landmark-one Footer': {
        enabled: true
      },
      'landmark-one Header': {
        enabled: true
      },
      'landmark-one Nav': {
        enabled: true
      },
      'landmark-one Region': {
        enabled: true
      },
      'landmark-one Search': {
        enabled: true
      },
      
      // Images and Media
      'image-alt': {
        enabled: true
      },
      'image-redundant-alt': {
        enabled: true
      },
      'region-img-alt': {
        enabled: true
      },
      
      // Links and Navigation
      'link-name': {
        enabled: true
      },
      'skip-link': {
        enabled: true
      },
      
      // Lists
      'list': {
        enabled: true
      },
      'listitem': {
        enabled: true
      },
      
      // Tables
      'table-duplicate-name': {
        enabled: true
      },
      'table-fake-caption': {
        enabled: true
      },
      'td-has-header': {
        enabled: true
      },
      'td-headers-attr': {
        enabled: true
      },
      'th-has-data-cells': {
        enabled: true
      },
      
      // Interactive Elements
      'button-name': {
        enabled: true
      },
      'input-image-alt': {
        enabled: true
      },
      
      // Language and Direction
      'html-has-lang': {
        enabled: true
      },
      'html-lang-valid': {
        enabled: true
      },
      'html-xml-lang-mismatch': {
        enabled: true
      },
      
      // Meta Information
      'document-title': {
        enabled: true
      },
      'document-title': {
        enabled: true
      },
      
      // Other Important Rules
      'bypass': {
        enabled: true
      },
      'consistent-class': {
        enabled: false // Set to false as it's often too strict
      },
      'duplicate-id': {
        enabled: true
      },
      'empty-heading': {
        enabled: true
      },
      'frame-title': {
        enabled: true
      },
      'html-has-lang': {
        enabled: true
      },
      'html-lang-valid': {
        enabled: true
      },
      'identical-links-same-purpose': {
        enabled: true
      },
      'image-redundant-alt': {
        enabled: true
      },
      'input-button-name': {
        enabled: true
      },
      'input-image-alt': {
        enabled: true
      },
      'landmark-complementary-is-top-level': {
        enabled: true
      },
      'landmark-contentinfo-is-top-level': {
        enabled: true
      },
      'landmark-banner-is-top-level': {
        enabled: true
      },
      'landmark-no-duplicate-banner': {
        enabled: true
      },
      'landmark-no-duplicate-contentinfo': {
        enabled: true
      },
      'landmark-undefined': {
        enabled: true
      },
      'layout-table': {
        enabled: false // Set to false as layout tables are common in older designs
      },
      'meta-refresh': {
        enabled: false // Set to false as meta refresh is sometimes necessary
      },
      'meta-viewport': {
        enabled: true,
        options: {
          maxZoom: 5
        }
      },
      'nested-interactive': {
        enabled: true
      },
      'no-autofocus': {
        enabled: true,
        options: {
          isPositive: false
        }
      },
      'p-as-heading': {
        enabled: true
      },
      'page-has-heading-one': {
        enabled: true
      },
      'region': {
        enabled: true
      },
      'scope-attr-valid': {
        enabled: true
      },
      'scrollable-region-focusable': {
        enabled: true
      },
      'server-side-image-map': {
        enabled: true
      },
      'svg-img-alt': {
        enabled: true
      },
      'tabindex': {
        enabled: true,
        options: {
          maxTabindex: 0
        }
      },
      'valid-lang': {
        enabled: true
      },
      'video-caption': {
        enabled: true
      },
      'video-description': {
        enabled: true
      }
    },
    tags: ['wcag2a', 'wcag2aa'],
    reporter: 'v2'
  },
  
  // Enhanced Accessibility Configuration
  enhanced: {
    rules: {
      // More strict color contrast (AAA level)
      'color-contrast': {
        enabled: true,
        options: {
          minContrastRatio: 7
        }
      },
      
      // Focus management
      'focus-order-trap': {
        enabled: true
      },
      'focus-order-semantics': {
        enabled: true
      },
      'focus-visible': {
        enabled: true
      },
      
      // Enhanced ARIA validation
      'aria-prohibited-attr': {
        enabled: true
      },
      'aria-roledescription': {
        enabled: true
      },
      'aria-allowed-attr': {
        enabled: true
      },
      
      // Interactive elements
      'click-event-namespace': {
        enabled: true
      },
      'custom-roles': {
        enabled: true
      },
      'interactive-element-affordance': {
        enabled: true
      }
    },
    tags: ['wcag2a', 'wcag2aa', 'wcag2aaa', 'best-practice']
  },
  
  // WCAG 2.1 AAA Configuration (for high-contrast scenarios)
  wcag21AAA: {
    rules: {
      'color-contrast': {
        enabled: true,
        options: {
          minContrastRatio: 7
        }
      },
      'color-contrast-enhanced': {
        enabled: true,
        options: {
          minContrastRatio: 10
        }
      },
      'focus-visible': {
        enabled: true
      }
    },
    tags: ['wcag2a', 'wcag2aa', 'wcag2aaa']
  },
  
  // Component-specific configurations
  components: {
    // Modal/Dialog configuration
    modal: {
      rules: {
        'aria-modal': {
          enabled: true
        },
        'focus-order-trap': {
          enabled: true
        },
        'focus-visible': {
          enabled: true
        }
      }
    },
    
    // Menu configuration
    menu: {
      rules: {
        'menu': {
          enabled: true
        },
        'menuitem': {
          enabled: true
        },
        'aria-orientation': {
          enabled: true
        }
      }
    },
    
    // Form configuration
    form: {
      rules: {
        'form-field-multiple-labels': {
          enabled: true
        },
        'label': {
          enabled: true
        },
        'aria-required-attr': {
          enabled: true
        }
      }
    },
    
    // Navigation configuration
    navigation: {
      rules: {
        'landmark-one-main': {
          enabled: true
        },
        'skip-link': {
          enabled: true
        }
      }
    }
  },
  
  // Testing environment configurations
  environments: {
    // Development environment (more lenient)
    development: {
      rules: {
        'color-contrast': {
          enabled: true,
          options: { minContrastRatio: 3 }
        },
        'aria-required-attr': {
          enabled: false // Allow incomplete ARIA during development
        },
        'consistent-class': {
          enabled: false // Allow class changes during development
        }
      }
    },
    
    // Production environment (strict)
    production: {
      rules: {
        'color-contrast': {
          enabled: true,
          options: { minContrastRatio: 4.5 }
        },
        'aria-required-attr': {
          enabled: true
        },
        'consistent-class': {
          enabled: true
        }
      }
    },
    
    // Testing environment (very strict)
    test: {
      rules: {
        'color-contrast': {
          enabled: true,
          options: { minContrastRatio: 7 }
        },
        'aria-required-attr': {
          enabled: true
        },
        'focus-visible': {
          enabled: true
        },
        'keyboard': {
          enabled: true
        }
      }
    }
  }
}

// Environment-specific configurations
export const getAccessibilityConfig = (environment: keyof typeof accessibilityConfig.environments = 'test') => {
  const baseConfig = accessibilityConfig.wcag21AA
  const envConfig = accessibilityConfig.environments[environment]
  
  return {
    ...baseConfig,
    rules: {
      ...baseConfig.rules,
      ...envConfig.rules
    }
  }
}

// Utility functions for configuration
export const createCustomAxeConfig = (customRules: Record<string, any>, baseConfig = 'wcag21AA') => {
  const base = accessibilityConfig[baseConfig]
  
  return {
    ...base,
    rules: {
      ...base.rules,
      ...customRules
    }
  }
}

// Export specific configurations for different use cases
export const testConfig = getAccessibilityConfig('test')
export const devConfig = getAccessibilityConfig('development')
export const prodConfig = getAccessibilityConfig('production')
export const enhancedConfig = accessibilityConfig.enhanced
export const aaaConfig = accessibilityConfig.wcag21AAA

export default accessibilityConfig
