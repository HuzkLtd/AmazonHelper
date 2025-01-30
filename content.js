// State management
const state = {
    enabled: true,
    settings: {
        sponsoredEnabled: true,
        primeOnly: false,
        getTomorrow: false,
        getToday: false
    }
};

// Load settings
chrome.storage.sync.get({
    enabled: true,
    sponsoredEnabled: true,
    primeOnly: false,
    getTomorrow: false,
    getToday: false
}, (items) => {
    state.enabled = items.enabled;
    state.settings = items;
});

// Listen for setting changes
chrome.runtime.onMessage.addListener((request) => {
    if (request.type === 'EXTENSION_STATE') {
        state.enabled = request.enabled;
    } else if (request.type === 'SETTING_CHANGED') {
        state.settings[request.setting] = request.enabled;
    }
});

// Simple filter function
function applyFilters() {
    if (!state.enabled) return;

    // Get all products
    const products = document.querySelectorAll('.s-result-item');
    if (!products.length) return;

    products.forEach(product => {
        let shouldHide = false;

        // Check sponsored
        if (state.settings.sponsoredEnabled) {
            const isSponsored = product.querySelector(
                '[data-component-type="sp-sponsored-result"], ' +
                'div.AdHolder, ' +
                '[aria-label="View Sponsored information or leave ad feedback"]'
            );
            if (isSponsored) shouldHide = true;
        }

        // Check Prime
        if (!shouldHide && state.settings.primeOnly) {
            const isPrime = product.querySelector('[aria-label="Amazon Prime"], .a-icon-prime');
            if (!isPrime) shouldHide = true;
        }

        // Check Next Day
        if (!shouldHide && state.settings.getTomorrow) {
            const text = product.textContent.toLowerCase();
            if (!text.includes('tomorrow') && !text.includes('next day')) {
                shouldHide = true;
            }
        }

        // Check Today Delivery
        if (!shouldHide && state.settings.getToday) {
            const text = product.textContent.toLowerCase();
            if (!text.includes('today') && !text.includes('same day')) {
                shouldHide = true;
            }
        }

        // Apply visibility
        if (shouldHide) {
            product.style.setProperty('display', 'none', 'important');
        } else {
            product.style.removeProperty('display');
        }
    });
}

// Use MutationObserver for better performance
const filterObserver = new MutationObserver(debounce(() => {
    if (state.enabled) applyFilters();
}, 250));

filterObserver.observe(document.body, {
    childList: true,
    subtree: true
});

// Debounce utility
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Initialize settings
function initializeSettings() {
    chrome.storage.sync.get({
        enabled: true,
        sponsoredEnabled: true,
        primeOnly: false,
        getTomorrow: false,
        getToday: false
    }, (items) => {
        state.enabled = items.enabled;
        state.settings = items;
        if (state.enabled) init();
    });
}

// Remove sponsored products
function removeSponsoredProducts() {
    if (!state.enabled || !state.settings.sponsoredEnabled) return;

    const sponsoredSelectors = [
        '[data-component-type="sp-sponsored-result"]',
        '[aria-label="View Sponsored information or leave ad feedback"]',
        'div.AdHolder',
        'div[data-component-type="sp-sponsored-result"]'
    ];

    sponsoredSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(element => {
            const item = element.closest("div.s-result-item") || element;
            if (item) item.style.display = "none";
        });
    });
}

// Sort products by rating
function sortByRating() {
    if (!state.enabled || !state.settings.ratingSortEnabled) return;
    
    const productGrid = document.querySelector('.s-main-slot');
    if (!productGrid) return;

    const products = Array.from(productGrid.children).filter(product => 
        product.classList.contains('s-result-item')
    );
    if (!products.length) return;

    const ratings = new Map();
    products.forEach(product => {
        const ratingElement = product.querySelector('.a-icon-star-small');
        let rating = 0;
        if (ratingElement) {
            const ratingText = ratingElement.getAttribute('aria-label') || '';
            const match = ratingText.match(/(\d+(\.\d+)?)/);
            if (match) rating = parseFloat(match[1]);
        }
        ratings.set(product, rating);
    });

    products.sort((a, b) => ratings.get(b) - ratings.get(a));
    products.forEach(product => productGrid.appendChild(product));
}

// Reset all changes
function resetChanges() {
    document.querySelectorAll('[style*="display: none"]').forEach(element => {
        if (element.matches('[data-component-type="sp-sponsored-result"], div.AdHolder, div[data-component-type="sp-sponsored-result"]')) {
            element.style.display = '';
        }
    });
}

// Add warning message function
function showNoProductsWarning() {
    let warningElement = document.getElementById('amazon-sorter-warning');
    
    if (!warningElement) {
        warningElement = document.createElement('div');
        warningElement.id = 'amazon-sorter-warning';
        warningElement.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background-color: #fff;
            border: 2px solid #e77600;
            border-radius: 8px;
            padding: 15px 25px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            z-index: 9999;
            display: flex;
            align-items: center;
            gap: 15px;
            font-size: 14px;
            min-width: 300px;
            opacity: 1;
            transition: opacity 0.3s ease-in-out;
        `;

        // Warning icon
        const icon = document.createElement('span');
        icon.innerHTML = '⚠️';
        icon.style.fontSize = '20px';
        warningElement.appendChild(icon);

        // Message container
        const messageContainer = document.createElement('div');
        messageContainer.style.flex = '1';

        // Main message
        const mainMessage = document.createElement('div');
        mainMessage.style.fontWeight = 'bold';
        mainMessage.style.marginBottom = '5px';
        mainMessage.textContent = 'No products found';
        messageContainer.appendChild(mainMessage);

        // Sub message
        const subMessage = document.createElement('div');
        subMessage.style.fontSize = '12px';
        subMessage.style.color = '#666';
        subMessage.textContent = 'Try adjusting your filter settings to see more products';
        messageContainer.appendChild(subMessage);

        warningElement.appendChild(messageContainer);

        // Close button
        const closeButton = document.createElement('button');
        closeButton.innerHTML = '×';
        closeButton.style.cssText = `
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            padding: 0 5px;
            color: #666;
            margin-left: 10px;
            transition: color 0.2s ease;
        `;
        closeButton.onmouseover = () => closeButton.style.color = '#000';
        closeButton.onmouseout = () => closeButton.style.color = '#666';
        closeButton.onclick = () => {
            warningElement.style.opacity = '0';
            setTimeout(() => warningElement.remove(), 300);
        };
        warningElement.appendChild(closeButton);

        document.body.appendChild(warningElement);

        // Auto-hide after 10 seconds with fade effect
        setTimeout(() => {
            if (warningElement && warningElement.parentNode) {
                warningElement.style.opacity = '0';
                setTimeout(() => {
                    if (warningElement && warningElement.parentNode) {
                        warningElement.remove();
                    }
                }, 300);
            }
        }, 10000);
    }
}

// Auto-check Prime filter on search page
function setPrimeFilter() {
    if (!state.settings.primeOnly) return;

    // Try multiple methods to set Prime filter
    const methods = [
        // Method 1: Click Prime checkbox
        () => {
            const primeCheckbox = document.querySelector('#p_n_prime_domestic, #prime-checkbox, #p_76-0');
            if (primeCheckbox && !primeCheckbox.checked) {
                // Önce parent elementi bul ve display: none'ı kaldır
                const parentElements = document.querySelectorAll('.a-section.a-spacing-none');
                parentElements.forEach(parent => {
                    if (parent.style.display === 'none') {
                        parent.style.removeProperty('display');
                    }
                });

                primeCheckbox.click();
                return true;
            }
            return false;
        },
        // Method 2: Click Prime filter link
        () => {
            const primeFilterLink = Array.from(document.querySelectorAll('a.a-link-normal')).find(
                link => (link.textContent.includes('Prime') || link.textContent.includes('prime')) && 
                       (link.getAttribute('href')?.includes('p_n_prime_domestic') || 
                        link.getAttribute('href')?.includes('p_76'))
            );
            
            if (primeFilterLink && !window.location.href.includes('p_n_prime_domestic') && !window.location.href.includes('p_76')) {
                // Filtrelerin görünürlüğünü kontrol et
                const filterSection = document.querySelector('#filters');
                if (filterSection && filterSection.style.display === 'none') {
                    filterSection.style.removeProperty('display');
                }

                primeFilterLink.click();
                return true;
            }
            return false;
        },
        // Method 3: Modify URL directly
        () => {
            if (!window.location.href.includes('p_n_prime_domestic') && !window.location.href.includes('p_76')) {
                const separator = window.location.href.includes('?') ? '&' : '?';
                const newUrl = `${window.location.href}${separator}p_76=1`;
                window.history.replaceState(null, '', newUrl);

                // Sol filtrelerin görünürlüğünü kontrol et
                const leftNavigation = document.querySelector('#s-refinements');
                if (leftNavigation && leftNavigation.style.display === 'none') {
                    leftNavigation.style.removeProperty('display');
                }

                return true;
            }
            return false;
        }
    ];

    // Try each method until one succeeds
    for (const method of methods) {
        if (method()) break;
    }

    // Ensure filter visibility
    setTimeout(() => {
        const selectors = [
            '#filters',
            '#s-refinements',
            '.a-section.a-spacing-none',
            '.a-section.a-spacing-small',
            '#leftNav',
            '.left-nav-container'
        ];

        selectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                if (element.style.display === 'none') {
                    element.style.removeProperty('display');
                }
            });
        });
    }, 500);
}

// Core functionality
function init() {
    if (!state.enabled) return;
    
    const debouncedInit = debounce(() => {
        removeSponsoredProducts();
        if (state.settings.ratingSortEnabled) sortByRating();
        applyFilters();
    }, 250);

    requestAnimationFrame(debouncedInit);
}

// Initialize observers
function setupObservers() {
    // Main content observer
    const contentObserver = new MutationObserver(debounce(() => {
        if (state.enabled) init();
    }, 250));

    // URL change observer
    let lastUrl = location.href;
    const urlObserver = new MutationObserver(debounce(() => {
        const url = location.href;
        if (url !== lastUrl) {
            lastUrl = url;
            if (state.settings.primeOnly) setPrimeFilter();
            init();
        }
    }, 250));

    // Safe observer initialization
    function startObservers() {
        if (document.body) {
            contentObserver.observe(document.body, { 
                childList: true, 
                subtree: true 
            });
            urlObserver.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    }

    if (document.body) {
        startObservers();
    } else {
        document.addEventListener('DOMContentLoaded', startObservers);
    }
}

// Start extension
function startExtension() {
    initializeSettings();
    setupObservers();
}

// Initialize on document ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startExtension);
} else {
    startExtension();
}

// Save settings and notify content script
function saveSettings(setting, value) {
    const settings = {
        [setting]: value
    };
    
    // Save settings
    chrome.storage.sync.set(settings);

    // Notify content script
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        // Amazon domain kontrolü
        if (tabs[0].url.match(/\bamazon\.(com|co\.uk|de|fr|it|es|nl|pl|se|com\.tr)\b/)) {
            chrome.tabs.sendMessage(tabs[0].id, {
                type: setting === 'enabled' ? 'EXTENSION_STATE' : 'SETTING_CHANGED',
                setting: setting,
                enabled: value
            });
        }
    });
} 