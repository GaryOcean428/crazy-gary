/**
 * Browser Extension Conflict Handler
 * Prevents browser extension message channel errors from affecting the application
 */

/**
 * Initialize extension conflict handling
 * Call this early in your application startup
 */
export function initializeExtensionHandler() {
    // Wrap Chrome extension messaging if available
    if (typeof chrome !== 'undefined' && chrome.runtime) {
        const originalSendMessage = chrome.runtime.sendMessage;
        
        chrome.runtime.sendMessage = function(...args) {
            try {
                return originalSendMessage.apply(this, args);
            } catch (error) {
                console.warn('Extension message failed:', error);
                // Return a resolved promise to prevent errors
                return Promise.resolve();
            }
        };
        
        // Also wrap onMessage listeners to prevent errors
        if (chrome.runtime.onMessage) {
            const originalAddListener = chrome.runtime.onMessage.addListener;
            chrome.runtime.onMessage.addListener = function(callback) {
                const wrappedCallback = function(...args) {
                    try {
                        return callback.apply(this, args);
                    } catch (error) {
                        console.warn('Extension message listener failed:', error);
                        return false; // Indicate message not handled
                    }
                };
                return originalAddListener.call(this, wrappedCallback);
            };
        }
    }
    
    // Handle WebExtensions API if available (Firefox)
    if (typeof browser !== 'undefined' && browser.runtime) {
        const originalSendMessage = browser.runtime.sendMessage;
        
        browser.runtime.sendMessage = function(...args) {
            try {
                return originalSendMessage.apply(this, args);
            } catch (error) {
                console.warn('Extension message failed:', error);
                return Promise.resolve();
            }
        };
    }
    
    // Prevent window.postMessage errors from affecting the app
    const originalPostMessage = window.postMessage;
    window.postMessage = function(message, targetOrigin, transfer) {
        try {
            return originalPostMessage.call(this, message, targetOrigin, transfer);
        } catch (error) {
            console.warn('PostMessage failed (possibly extension related):', error);
        }
    };
    
    // Add global error handler for extension-related errors
    window.addEventListener('error', function(event) {
        const errorMessage = event.error?.message || event.message || '';
        
        // Check if this is likely an extension-related error
        if (errorMessage.includes('Extension context invalidated') ||
            errorMessage.includes('chrome-extension://') ||
            errorMessage.includes('moz-extension://') ||
            errorMessage.includes('Could not establish connection') ||
            errorMessage.includes('message channel')) {
            
            console.warn('Browser extension error detected and suppressed:', errorMessage);
            event.preventDefault();
            event.stopPropagation();
            return false;
        }
    }, true);
    
    // Add unhandled promise rejection handler
    window.addEventListener('unhandledrejection', function(event) {
        const reason = event.reason?.message || event.reason || '';
        
        if (typeof reason === 'string' && (
            reason.includes('Extension context invalidated') ||
            reason.includes('chrome-extension://') ||
            reason.includes('moz-extension://') ||
            reason.includes('Could not establish connection'))) {
            
            console.warn('Extension promise rejection suppressed:', reason);
            event.preventDefault();
            return false;
        }
    });
    
    console.log('✅ Browser extension conflict handler initialized');
}

/**
 * Safe message passing wrapper
 * Use this instead of direct chrome.runtime.sendMessage calls
 */
export function safeExtensionMessage(extensionId, message, options = {}) {
    return new Promise((resolve) => {
        try {
            if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
                chrome.runtime.sendMessage(extensionId, message, options, (response) => {
                    if (chrome.runtime.lastError) {
                        console.warn('Extension message error:', chrome.runtime.lastError);
                        resolve(null);
                    } else {
                        resolve(response);
                    }
                });
            } else {
                resolve(null);
            }
        } catch (error) {
            console.warn('Safe extension message failed:', error);
            resolve(null);
        }
    });
}

/**
 * Check if browser extensions are causing issues
 */
export function detectExtensionConflicts() {
    const conflicts = [];
    
    // Check for common problematic extension patterns
    if (typeof chrome !== 'undefined') {
        // Check if Chrome extension APIs are available but broken
        try {
            if (chrome.runtime && !chrome.runtime.sendMessage) {
                conflicts.push('Chrome runtime API partially available');
            }
        } catch (error) {
            conflicts.push('Chrome extension API access error');
        }
    }
    
    // Check for extension-injected scripts that might interfere
    const scripts = document.querySelectorAll('script[src*="chrome-extension"], script[src*="moz-extension"]');
    if (scripts.length > 0) {
        conflicts.push(`${scripts.length} extension script(s) detected`);
    }
    
    // Check for extension-modified DOM elements
    const extensionElements = document.querySelectorAll('[data-extension], [class*="extension"]');
    if (extensionElements.length > 0) {
        conflicts.push(`${extensionElements.length} extension DOM modification(s) detected`);
    }
    
    return {
        hasConflicts: conflicts.length > 0,
        conflicts: conflicts
    };
}