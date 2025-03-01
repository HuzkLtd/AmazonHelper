/**
 * AmazonHelper - Pagination Handling
 * Specialized functionality to ensure Amazon's pagination works properly
 */

const AmazonHelperPagination = {
    // Initialize pagination fixes
    init: function() {
        // Apply fixes immediately
        this.fixPagination();
        this.injectStyles();
        this.fixProductLinks();
        
        // Start monitoring to ensure fixes persist
        this.startPaginationMonitor();
    },
    
    // Fix pagination elements to ensure they're clickable
    fixPagination: function() {
        // Comprehensive set of pagination selectors for different Amazon sites
        const paginationSelectors = [
            // Standard pagination elements
            '.s-pagination-item',
            '.s-pagination-button',
            '.s-pagination-next',
            '.s-pagination-previous',
            
            // Container elements
            '.s-pagination-container',
            '.s-pagination-strip',
            
            // Legacy pagination
            '.a-pagination',
            '.a-pagination a',
            '.a-pagination li',
            '.a-pagination span',
            
            // URL-based selectors
            'a[href*="page="]',
            'a[href*="pgno="]',
            'a[href*="ref="]',
            
            // Aria-labeled elements
            'a[aria-label*="page"]',
            'a[aria-label*="Page"]',
            'a[aria-label*="pagina"]',
            'a[aria-label*="Seite"]'
        ];
        
        // Find all pagination elements
        paginationSelectors.forEach(selector => {
            try {
                document.querySelectorAll(selector).forEach(element => {
                    this.makeElementClickable(element, 9999); // Higher z-index for pagination
                    
                    // Also make parent elements clickable
                    let parent = element.parentElement;
                    for (let i = 0; parent && i < 5; i++) {
                        this.makeElementClickable(parent, 9998 - i);
                        parent = parent.parentElement;
                    }
                });
            } catch (e) {
                // Silently continue on errors
            }
        });
        
        // Special handling for pagination numbers (1, 2, 3, etc.)
        for (let i = 1; i <= 20; i++) {
            const pageNumber = i.toString();
            document.querySelectorAll('a, span').forEach(element => {
                if (element.textContent.trim() === pageNumber) {
                    this.makeElementClickable(element, 9999);
                    
                    // Also make parent elements clickable
                    let parent = element.parentElement;
                    for (let i = 0; parent && i < 5; i++) {
                        this.makeElementClickable(parent, 9998 - i);
                        parent = parent.parentElement;
                    }
                }
            });
        }
        
        // Handle text-based pagination elements like "Previous" and "Next"
        const paginationTexts = ['Previous', 'Next', 'Prev', 'Siguiente', 'Zurück', 'Weiter'];
        
        paginationTexts.forEach(text => {
            document.querySelectorAll('a, span').forEach(element => {
                if (element.textContent.trim() === text) {
                    this.makeElementClickable(element, 9999);
                    
                    // Also make parent elements clickable
                    let parent = element.parentElement;
                    for (let i = 0; parent && i < 5; i++) {
                        this.makeElementClickable(parent, 9998 - i);
                        parent = parent.parentElement;
                    }
                }
            });
        });
    },
    
    // Make a single element clickable
    makeElementClickable: function(element, zIndex = 100) {
        if (!element) return;
        
        // Add special class for styling
        element.classList.add('amazon-helper-clickable');
        
        // Apply direct inline styles for maximum priority
        const styles = {
            'pointer-events': 'auto',
            'cursor': 'pointer',
            'z-index': zIndex.toString(),
            'position': 'relative'
        };
        
        // Apply styles directly to the element with !important
        Object.keys(styles).forEach(key => {
            element.style.setProperty(key, styles[key], 'important');
        });
        
        // If it's a link, ensure it works properly by recreating it
        if (element.tagName === 'A' && element.href) {
            try {
                // Create a new element with the same attributes
                const newElement = element.cloneNode(true);
                
                // Replace all onclick and other handlers with clean ones
                newElement.onclick = function(e) {
                    // Navigate to the href directly
                    window.location.href = this.href;
                    return true;
                };
                
                // Replace the original element
                if (element.parentNode) {
                    element.parentNode.replaceChild(newElement, element);
                }
            } catch (e) {
                // If replacing fails, at least try to make the original clickable
                element.onclick = function(e) {
                    window.location.href = this.href;
                    return true;
                };
            }
        }
    },
    
    // Fix all product links to ensure they're clickable
    fixProductLinks: function() {
        // Product link selectors
        const productSelectors = [
            // Primary product elements
            '.s-result-item',
            'div[data-asin]',
            '.s-card-container',
            
            // Links and clickable elements
            'a[href*="/dp/"]',
            '.s-result-item a',
            '.s-product-image-container a',
            'div[data-asin] a',
            '.a-link-normal',
            'h2 a',
            'a.a-text-normal',
            '.a-carousel-card a',
            'a[href*="gp/product"]',
            
            // Images
            '.s-image',
            '.a-dynamic-image',
            'img[data-image-index]',
            'img[data-image-latency]',
            
            // Title elements
            '.a-size-medium',
            '.a-size-base-plus',
            '.a-text-normal',
            
            // Price elements
            '.a-price',
            '.a-price .a-offscreen'
        ];
        
        // Make all these elements clickable
        productSelectors.forEach(selector => {
            try {
                document.querySelectorAll(selector).forEach(element => {
                    this.makeElementClickable(element);
                });
            } catch (e) {
                // Silently continue
            }
        });
        
        // Special handling for product titles
        document.querySelectorAll('h2').forEach(heading => {
            this.makeElementClickable(heading);
            
            // Also make the parent card clickable
            const parentCard = heading.closest('.s-result-item, div[data-asin]');
            if (parentCard) {
                this.makeElementClickable(parentCard);
            }
        });
    },
    
    // Inject CSS styles to ensure pagination works
    injectStyles: function() {
        // Create style element if it doesn't exist
        let style = document.getElementById('amazon-helper-pagination-styles');
        if (!style) {
            style = document.createElement('style');
            style.id = 'amazon-helper-pagination-styles';
            
            // CSS rules to ensure pagination and links work properly
            style.textContent = `
                /* Reset any problematic styles that might be interfering */
                .s-main-slot > div[data-asin] * {
                    pointer-events: auto !important;
                }
                
                /* Make pagination clickable */
                .s-pagination-item,
                .s-pagination-button,
                .s-pagination-next,
                .s-pagination-previous,
                .s-pagination-container,
                .s-pagination-strip,
                .a-pagination,
                .a-pagination a,
                .a-pagination li,
                .a-pagination span,
                a[href*="page="],
                a[href*="pgno="],
                a[aria-label*="page"],
                a[aria-label*="Page"],
                .amazon-helper-clickable {
                    pointer-events: auto !important;
                    cursor: pointer !important;
                    z-index: 9999 !important;
                    position: relative !important;
                    display: inline-block !important;
                    visibility: visible !important;
                }
                
                /* Additional specificity for problematic pagination elements */
                span.s-pagination-item.s-pagination-selected,
                span.s-pagination-item.s-pagination-disabled,
                .s-pagination-item.s-pagination-button {
                    pointer-events: auto !important;
                    cursor: pointer !important;
                    z-index: 9999 !important;
                    position: relative !important;
                    display: inline-block !important;
                    visibility: visible !important;
                }
                
                /* Ensure parent containers are clickable */
                .s-pagination-container *,
                .a-pagination *,
                .s-main-slot > div[data-asin] * {
                    pointer-events: auto !important;
                }
                
                /* Make product links and images clickable */
                .s-result-item a,
                .s-product-image-container a,
                div[data-asin] a,
                .a-link-normal,
                h2 a,
                a.a-text-normal,
                a[href*="/dp/"],
                .s-image,
                .a-dynamic-image {
                    pointer-events: auto !important;
                    cursor: pointer !important;
                    z-index: 900 !important;
                    position: relative !important;
                }
                
                /* Make sure product containers are clickable */
                .s-result-item,
                .s-product-image-container,
                div[data-asin],
                .s-card-container {
                    pointer-events: auto !important;
                }
                
                /* Ensure sponsored content is properly visible when setting is off */
                body.amazon-helper-show-sponsored [data-component-type="sp-sponsored-result"],
                body.amazon-helper-show-sponsored div.AdHolder,
                body.amazon-helper-show-sponsored [aria-label="View Sponsored information or leave ad feedback"],
                body.amazon-helper-show-sponsored .s-sponsored-label-info-icon,
                body.amazon-helper-show-sponsored .puis-sponsored-label,
                body.amazon-helper-show-sponsored .puis-label-variant {
                    display: block !important;
                    visibility: visible !important;
                }
                
                /* Make sure sponsored parent containers are visible when setting is off */
                body.amazon-helper-show-sponsored .s-result-item:has([data-component-type="sp-sponsored-result"]),
                body.amazon-helper-show-sponsored .s-result-item:has(.s-sponsored-label-info-icon),
                body.amazon-helper-show-sponsored .s-result-item:has(.puis-sponsored-label) {
                    display: block !important;
                    visibility: visible !important;
                }
            `;
            
            // Add to document
            document.head.appendChild(style);
        }
    },
    
    // Start monitoring pagination
    startPaginationMonitor: function() {
        // Run frequent checks at the beginning when the page is still loading
        const initialChecks = setInterval(() => {
            this.fixPagination();
            this.fixProductLinks();
        }, 250);
        
        // After 5 seconds, switch to a less frequent interval
        setTimeout(() => {
            clearInterval(initialChecks);
            
            // Continue with less frequent checks
            setInterval(() => {
                this.fixPagination();
                this.fixProductLinks();
            }, 1000);
        }, 5000);
        
        // Monitor DOM changes to reapply fixes when needed
        const observer = new MutationObserver((mutations) => {
            // Check if any pagination elements were added or modified
            let needsFix = false;
            
            mutations.forEach(mutation => {
                if (mutation.addedNodes.length > 0) {
                    needsFix = true;
                }
            });
            
            if (needsFix) {
                this.fixPagination();
                this.fixProductLinks();
            }
        });
        
        // Observe the entire document for changes
        observer.observe(document.body, { 
            childList: true, 
            subtree: true,
            attributes: true,
            attributeFilter: ['style', 'class']
        });
    },
    
    // Update sponsored content visibility based on setting
    updateSponsoredContentVisibility: function() {
        if (!window.amazonHelper || !window.amazonHelper.state) return;
        
        const shouldShowSponsored = !window.amazonHelper.state.settings.sponsoredEnabled;
        
        if (shouldShowSponsored) {
            // If setting is OFF (false), show sponsored content
            document.body.classList.add('amazon-helper-show-sponsored');
            
            // Force sponsored items to be visible
            document.querySelectorAll(
                '[data-component-type="sp-sponsored-result"], ' +
                'div.AdHolder, ' +
                '[aria-label="View Sponsored information or leave ad feedback"], ' +
                '.s-sponsored-label-info-icon, ' +
                '.puis-sponsored-label'
            ).forEach(el => {
                if (el) {
                    el.style.setProperty('display', 'block', 'important');
                    el.style.setProperty('visibility', 'visible', 'important');
                    
                    // Also show parent product container
                    const productContainer = el.closest('.s-result-item, div[data-asin]');
                    if (productContainer) {
                        productContainer.style.setProperty('display', 'block', 'important');
                        productContainer.style.setProperty('visibility', 'visible', 'important');
                    }
                }
            });
        } else {
            // If setting is ON (true), hide sponsored content
            document.body.classList.remove('amazon-helper-show-sponsored');
        }
    }
};

// Initialize pagination fixes immediately
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        AmazonHelperPagination.init();
        
        // Update visibility when settings are loaded
        if (window.amazonHelper && window.amazonHelper.state) {
            AmazonHelperPagination.updateSponsoredContentVisibility();
        } else {
            document.addEventListener('amazonHelperReady', () => {
                AmazonHelperPagination.updateSponsoredContentVisibility();
            }, { once: true });
        }
    });
} else {
    // Page already loaded, initialize immediately
    AmazonHelperPagination.init();
    
    // Set up a short interval to check for amazonHelper
    const checkHelper = setInterval(() => {
        if (window.amazonHelper && window.amazonHelper.state) {
            AmazonHelperPagination.updateSponsoredContentVisibility();
            clearInterval(checkHelper);
        }
    }, 100);
    
    // Clear interval after 5 seconds to prevent any potential memory leaks
    setTimeout(() => clearInterval(checkHelper), 5000);
}

// Listen for state changes
document.addEventListener('amazonHelperSettingChanged', (event) => {
    if (event.detail && event.detail.setting === 'sponsoredEnabled') {
        AmazonHelperPagination.updateSponsoredContentVisibility();
    }
    
    // Reapply pagination fixes after settings change
    AmazonHelperPagination.fixPagination();
    AmazonHelperPagination.fixProductLinks();
});