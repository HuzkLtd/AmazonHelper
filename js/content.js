/**
 * AmazonHelper - Single content script for Amazon functionality
 */

// Global state object with default values
const amazonHelperState = {
    enabled: true,
    sponsoredEnabled: true,
    primeOnly: false,
    getTomorrow: false,
    getToday: false,
    ratingSortEnabled: false,
    darkMode: true
};

// Load settings
function loadSettings() {
    return new Promise((resolve) => {
        chrome.storage.sync.get({
            enabled: true,
            sponsoredEnabled: true,
            primeOnly: false,
            getTomorrow: false,
            getToday: false,
            ratingSortEnabled: false,
            darkMode: true
        }, (items) => {
            // Update state with loaded settings
            amazonHelperState.enabled = items.enabled;
            amazonHelperState.sponsoredEnabled = items.sponsoredEnabled;
            amazonHelperState.primeOnly = items.primeOnly;
            amazonHelperState.getTomorrow = items.getTomorrow;
            amazonHelperState.getToday = items.getToday;
            amazonHelperState.ratingSortEnabled = items.ratingSortEnabled;
            amazonHelperState.darkMode = items.darkMode;
            
            resolve();
        });
    });
}

// Inject custom CSS into the page
function injectCSS() {
    const style = document.createElement('style');
    style.textContent = `
        /* Make pagination clickable */
        .s-pagination-item, .s-pagination-button, .s-pagination-container, 
        .a-pagination, .a-pagination a, a[href*="page="] {
            pointer-events: auto !important;
            cursor: pointer !important;
            z-index: 9999 !important;
        }
        
        /* Make product links/images clickable */
        .s-result-item a, div[data-asin] a, .s-image, h2 a {
            pointer-events: auto !important;
            cursor: pointer !important;
            z-index: 100 !important;
        }
        
        /* Fix parent containers */
        .s-result-item, div[data-asin], .s-card-container {
            pointer-events: auto !important;
        }
        
        /* Hide sponsored content - only when enabled */
        body:not(.amazon-helper-show-sponsored) [data-component-type="sp-sponsored-result"],
        body:not(.amazon-helper-show-sponsored) div.AdHolder,
        body:not(.amazon-helper-show-sponsored) [aria-label="View Sponsored information or leave ad feedback"],
        body:not(.amazon-helper-show-sponsored) .s-sponsored-label-info-icon {
            display: none !important;
        }
        
        /* Show sponsored content when setting is disabled */
        body.amazon-helper-show-sponsored [data-component-type="sp-sponsored-result"],
        body.amazon-helper-show-sponsored div.AdHolder,
        body.amazon-helper-show-sponsored [aria-label="View Sponsored information or leave ad feedback"],
        body.amazon-helper-show-sponsored .s-sponsored-label-info-icon {
            display: block !important;
            visibility: visible !important;
        }
    `;
    document.head.appendChild(style);
}

// Apply fixes to make elements clickable
function fixClickability() {
    // First approach: Add classes and styles
    document.querySelectorAll('.s-pagination-item, .s-pagination-button, .a-pagination a, a[href*="page="]').forEach(el => {
        el.style.setProperty('pointer-events', 'auto', 'important');
        el.style.setProperty('cursor', 'pointer', 'important');
        el.style.setProperty('z-index', '9999', 'important');
    });
    
    // Second approach: Make all product elements clickable
    document.querySelectorAll('.s-result-item a, div[data-asin] a, .s-image, h2 a').forEach(el => {
        el.style.setProperty('pointer-events', 'auto', 'important');
        el.style.setProperty('cursor', 'pointer', 'important');
        el.style.setProperty('z-index', '100', 'important');
    });
    
    // Third approach: Fix parent containers
    document.querySelectorAll('.s-result-item, div[data-asin], .s-card-container').forEach(el => {
        el.style.setProperty('pointer-events', 'auto', 'important');
    });
}

// Apply filters to search results
function applyFilters() {
    if (!amazonHelperState.enabled) {
        showAllElements();
        return;
    }
    
    // Handle sponsored content visibility
    if (!amazonHelperState.sponsoredEnabled) {
        // If setting is OFF (false), we should SHOW sponsored items
        document.body.classList.add('amazon-helper-show-sponsored');
    } else {
        // If setting is ON (true), we should HIDE sponsored items
        document.body.classList.remove('amazon-helper-show-sponsored');
    }
    
    // Apply other filters if needed
    if (amazonHelperState.primeOnly || amazonHelperState.getToday || amazonHelperState.getTomorrow) {
        document.querySelectorAll('.s-result-item, div[data-asin]').forEach(product => {
            let shouldHide = false;
            const text = product.textContent.toLowerCase();
            
            // Prime check
            if (!shouldHide && amazonHelperState.primeOnly) {
                const isPrime = product.querySelector('[aria-label*="Prime"], .a-icon-prime');
                if (!isPrime) shouldHide = true;
            }
            
            // Today check
            if (!shouldHide && amazonHelperState.getToday) {
                const isToday = text.includes('today') || text.includes('same day');
                if (!isToday) shouldHide = true;
            }
            
            // Tomorrow check
            if (!shouldHide && amazonHelperState.getTomorrow) {
                const isTomorrow = text.includes('tomorrow') || text.includes('next day');
                if (!isTomorrow) shouldHide = true;
            }
            
            product.style.display = shouldHide ? 'none' : '';
        });
    }
    
    // Always apply clickability fixes
    fixClickability();
}

// Show all elements that might have been hidden
function showAllElements() {
    document.querySelectorAll('.s-result-item, div[data-asin]').forEach(product => {
        product.style.display = '';
    });
    
    // Show sponsored content
    document.body.classList.add('amazon-helper-show-sponsored');
    
    // Always apply clickability fixes
    fixClickability();
}

// Initialize the extension
async function initialize() {
    // First inject CSS
    injectCSS();
    
    // Load settings
    await loadSettings();
    
    // Apply initial filters
    applyFilters();
    
    // Set up a simple periodic check for clickability
    setInterval(fixClickability, 1000);
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'EXTENSION_STATE') {
        amazonHelperState.enabled = message.enabled;
    } else if (message.type === 'SETTING_CHANGED') {
        amazonHelperState[message.setting] = message.enabled;
    }
    
    // Apply filters after any setting change
    applyFilters();
});

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}
