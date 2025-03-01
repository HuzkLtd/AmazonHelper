/**
 * AmazonHelper - State Management
 * Handles global state and settings for the extension
 */

// Global state object for the extension
window.amazonHelper = {
    state: {
        enabled: true,
        settings: {
            sponsoredEnabled: true,
            primeOnly: false,
            getTomorrow: false,
            getToday: false,
            ratingSortEnabled: false,
            showOtherSellers: false,
            sponsoredOnProductEnabled: true,
            downloadImagesEnabled: true,
            darkMode: true // Dark mode enabled by default
        },
        originalOrder: [],
        productListSelector: '.s-main-slot > div[data-asin]',
        paginationFixed: false
    },
    
    // Initialize state from storage
    init: function() {
        return new Promise((resolve) => {
            // Default settings with dark mode enabled
            const defaultSettings = {
                enabled: true,
                sponsoredEnabled: true,
                primeOnly: false,
                getTomorrow: false,
                getToday: false,
                ratingSortEnabled: false,
                showOtherSellers: false,
                sponsoredOnProductEnabled: true,
                downloadImagesEnabled: true,
                darkMode: true // Dark mode enabled by default
            };
            
            chrome.storage.sync.get(defaultSettings, (items) => {
                this.state.enabled = items.enabled;
                this.state.settings = {
                    sponsoredEnabled: items.sponsoredEnabled,
                    primeOnly: items.primeOnly,
                    getTomorrow: items.getTomorrow,
                    getToday: items.getToday,
                    ratingSortEnabled: items.ratingSortEnabled,
                    showOtherSellers: items.showOtherSellers,
                    sponsoredOnProductEnabled: items.sponsoredOnProductEnabled,
                    downloadImagesEnabled: items.downloadImagesEnabled,
                    darkMode: items.darkMode
                };
                resolve(this.state);
                
                // Set body class for sponsored content visibility
                if (!items.sponsoredEnabled) {
                    document.body.classList.add('amazon-helper-show-sponsored');
                }
            });
        });
    },
    
    // Utility function to debounce functions for performance
    debounce: function(func, wait) {
        let timeout;
        return function(...args) {
            const later = () => {
                clearTimeout(timeout);
                func.apply(this, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Helper to safely access DOM elements
    safeQuerySelector: function(selector) {
        try {
            return document.querySelector(selector);
        } catch (e) {
            return null;
        }
    },
    
    safeQuerySelectorAll: function(selector) {
        try {
            return document.querySelectorAll(selector);
        } catch (e) {
            return [];
        }
    }
};

// Initialize the extension's state as early as possible
(function() {
    // Create a function to initialize when DOM is available
    const initializeState = function() {
        window.amazonHelper.init().then(() => {
            // Dispatch an event that other scripts can listen for
            document.dispatchEvent(new CustomEvent('amazonHelperReady'));
        });
    };
    
    // Check if document is already loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeState);
    } else {
        initializeState();
    }
    
    // Also set up a safety fallback for very early execution
    if (typeof document !== 'undefined' && document.body) {
        initializeState();
    }
})();

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request) => {
    if (request.type === 'EXTENSION_STATE') {
        window.amazonHelper.state.enabled = request.enabled;
        document.dispatchEvent(new CustomEvent('amazonHelperStateChanged', { detail: { enabled: request.enabled } }));
    } else if (request.type === 'SETTING_CHANGED') {
        window.amazonHelper.state.settings[request.setting] = request.enabled;
        
        // Special handling for sponsored content visibility
        if (request.setting === 'sponsoredEnabled') {
            if (!request.enabled) {
                document.body.classList.add('amazon-helper-show-sponsored');
            } else {
                document.body.classList.remove('amazon-helper-show-sponsored');
            }
        }
        
        document.dispatchEvent(new CustomEvent('amazonHelperSettingChanged', { 
            detail: { 
                setting: request.setting, 
                enabled: request.enabled 
            } 
        }));
    }
});