// State management
const state = {
    enabled: true,
    settings: {
        sponsoredEnabled: true,
        primeOnly: false,
        getTomorrow: false,
        getToday: false,
        ratingSortEnabled: false,
        showOtherSellers: false
    },
    originalOrder: []
};

// Load settings
chrome.storage.sync.get({
    enabled: true,
    sponsoredEnabled: true,
    primeOnly: false,
    getTomorrow: false,
    getToday: false,
    ratingSortEnabled: false,
    showOtherSellers: false
}, (items) => {
    state.enabled = items.enabled;
    state.settings = items;
    if (state.enabled) applyAllFilters();
});

// Listen for setting changes
chrome.runtime.onMessage.addListener((request) => {
    if (request.type === 'EXTENSION_STATE') {
        state.enabled = request.enabled;
        if (state.enabled) {
            applyAllFilters();
        } else {
            restoreOriginalOrder();
        }
    } else if (request.type === 'SETTING_CHANGED') {
        state.settings[request.setting] = request.enabled;
        if (state.enabled) {
            applyAllFilters();
        }
    }
});

// Apply all filters and sorting
function applyAllFilters() {
    if (!state.enabled) {
        restoreOriginalOrder();
        return;
    }

    const products = document.querySelectorAll('.s-result-item');
    if (!products.length) return;

    // Save original ordering
    if (!state.originalOrder.length) {
        state.originalOrder = Array.from(products);
    }

    products.forEach(product => {
        let shouldHide = false;
        const text = product.textContent.toLowerCase();

        // Sponsored check
        const isSponsored = product.querySelector(
            '[data-component-type="sp-sponsored-result"], ' +
            'div.AdHolder, ' +
            '[aria-label="View Sponsored information or leave ad feedback"]'
        );
        if (state.settings.sponsoredEnabled && isSponsored) {
            shouldHide = true;
        }

        // Prime check
        if (!shouldHide && state.settings.primeOnly) {
            const isPrime = product.querySelector('[aria-label*="Prime"], .a-icon-prime');
            if (!isPrime) shouldHide = true;
        }

        // Today check
        if (!shouldHide && state.settings.getToday) {
            const isToday = text.includes('today') || text.includes('same day') || text.includes('arrives today');
            if (!isToday) shouldHide = true;
        }

        // Tomorrow check
        if (!shouldHide && state.settings.getTomorrow) {
            const isTomorrow = text.includes('tomorrow') || text.includes('next day') || text.includes('arrives tomorrow');
            if (!isTomorrow) shouldHide = true;
        }

        product.style.display = shouldHide ? 'none' : '';
    });

    // Force sponsored items to reappear if the setting is disabled
    if (!state.settings.sponsoredEnabled) {
        products.forEach(product => {
            const isSponsored = product.querySelector(
                '[data-component-type="sp-sponsored-result"], ' +
                'div.AdHolder, ' +
                '[aria-label="View Sponsored information or leave ad feedback"]'
            );
            if (isSponsored) {
                product.style.display = '';
            }
        });
    }

    // Rating sorting
    if (state.settings.ratingSortEnabled) {
        sortByRating();
    } else {
        // Reorder only the still-visible items to the original order
        const container = document.querySelector('.s-main-slot');
        if (!container) return;
        const fragment = document.createDocumentFragment();
        state.originalOrder.forEach(item => {
            if (item.style.display !== 'none') fragment.appendChild(item);
        });
        container.appendChild(fragment);
    }
}

// Sort by rating
function sortByRating() {
    const container = document.querySelector('.s-main-slot');
    if (!container) return;

    const products = Array.from(container.querySelectorAll('.s-result-item')).filter(p => p.style.display !== 'none');
    const fragment = document.createDocumentFragment();

    products
        .map(product => ({
            element: product,
            rating: parseFloat(product.querySelector('.a-icon-alt')?.textContent.split(' ')[0] || '0')
        }))
        .sort((a, b) => b.rating - a.rating)
        .forEach(item => fragment.appendChild(item.element));

    container.appendChild(fragment);
}

// Restore original order
function restoreOriginalOrder() {
    const container = document.querySelector('.s-main-slot');
    if (!container || !state.originalOrder.length) return;

    const fragment = document.createDocumentFragment();
    state.originalOrder.forEach(item => {
        item.style.display = '';
        fragment.appendChild(item);
    });
    container.appendChild(fragment);
}

// Initialize observers
const observer = new MutationObserver(debounce(applyAllFilters, 100));
observer.observe(document.body, { childList: true, subtree: true });

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

// Initialize on document ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyAllFilters);
} else {
    applyAllFilters();
}