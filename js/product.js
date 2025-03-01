/**
 * AmazonHelper - Product Page Functionality
 * Handles all product page specific features
 */

const AmazonHelperProduct = {
    // Initialize product page features
    init: function() {
        if (!window.location.pathname.includes('/dp/')) return;
        if (!window.amazonHelper.state.enabled) return;
        
        this.enhanceProductImages();
        this.removeSponsored();
        this.addDownloadButton();
        this.addCategoryToRating();
    },
    
    // Make product images easily clickable
    enhanceProductImages: function() {
        // Fix product images to ensure they're clickable
        const productImages = document.querySelectorAll('#imgTagWrapperId img, #landingImage, .a-dynamic-image');
        
        productImages.forEach(image => {
            if (!image) return;
            
            // Set a higher z-index and ensure clickability
            image.style.setProperty('z-index', '100', 'important');
            image.style.setProperty('position', 'relative', 'important');
            image.style.setProperty('pointer-events', 'auto', 'important');
            image.style.setProperty('cursor', 'pointer', 'important');
            
            // Make sure the parent elements are also clickable
            let parent = image.parentElement;
            for (let i = 0; parent && i < 5; i++) {
                parent.style.setProperty('pointer-events', 'auto', 'important');
                parent.style.setProperty('cursor', 'pointer', 'important');
                parent = parent.parentElement;
            }
            
            // Make sure any wrapper is also clickable
            const wrapper = document.getElementById('imgTagWrapperId');
            if (wrapper) {
                wrapper.style.setProperty('pointer-events', 'auto', 'important');
                wrapper.style.setProperty('cursor', 'pointer', 'important');
            }
        });
        
        // Also enhance all product link/click areas
        const productLinks = document.querySelectorAll('a[href*="/dp/"]');
        productLinks.forEach(link => {
            if (!link) return;
            
            // Make sure links work correctly with direct styling
            link.style.setProperty('pointer-events', 'auto', 'important');
            link.style.setProperty('cursor', 'pointer', 'important');
            link.style.setProperty('z-index', '100', 'important');
            link.style.setProperty('position', 'relative', 'important');
            
            // Replace element to remove any interfering handlers
            const newLink = link.cloneNode(true);
            if (link.parentNode) {
                link.parentNode.replaceChild(newLink, link);
            }
        });
    },
    
    // Remove sponsored content from product pages
    removeSponsored: function() {
        if (!window.amazonHelper.state.settings.sponsoredOnProductEnabled) return;
        
        const sponsoredSelectors = [
            // Sponsored Products
            '#sponsoredProducts_feature_div',
            '#sponsoredProducts2_feature_div',
            '#sponsoredProducts-top_feature_div',
            '#sponsoredProducts-bottom_feature_div',
            
            // Similar Items
            '#similarities_feature_div',
            '#similar-items_feature_div',
            '#similar-items-carousel_feature_div',
            '#purchase-sims-feature',
            '#sims-consolidated-1_feature_div',
            '#sims-consolidated-2_feature_div',
            '#sp_detail',
            '#sp_detail2',
            
            // Carousel Items
            '[data-a-carousel-options*="similar-items"]',
            '[data-a-carousel-options*="sponsored"]',
            
            // Sponsored Related Products
            'div[cel_widget_id*="sponsored-products"]',
            'div[cel_widget_id*="sponsored_products"]',
            'div[data-cel-widget*="sponsored-products"]',
            'div[data-cel-widget*="sponsored_products"]'
        ];
        
        sponsoredSelectors.forEach(selector => {
            try {
                document.querySelectorAll(selector).forEach(element => {
                    if (element) {
                        element.style.setProperty('display', 'none', 'important');
                    }
                });
            } catch (e) {
                // Silently continue
            }
        });
    },
    
    // Add download button for product images
    addDownloadButton: function() {
        if (!window.amazonHelper.state.settings.downloadImagesEnabled) return;
        
        // Check if button already exists
        if (document.querySelector('.amazon-helper-download-button')) return;
        
        const imageContainer = document.querySelector('#imgTagWrapperId img, #landingImage');
        if (!imageContainer) return;
        
        const downloadButton = document.createElement('button');
        downloadButton.textContent = 'Download Image';
        downloadButton.className = 'amazon-helper-download-button';
        downloadButton.style.position = 'absolute';
        downloadButton.style.top = '10px';
        downloadButton.style.right = '10px';
        downloadButton.style.padding = '10px';
        downloadButton.style.backgroundColor = '#febd69';
        downloadButton.style.border = 'none';
        downloadButton.style.borderRadius = '5px';
        downloadButton.style.cursor = 'pointer';
        downloadButton.style.zIndex = '1000';
        downloadButton.style.fontSize = '14px';
        downloadButton.style.color = '#111';
        downloadButton.style.fontWeight = 'bold';
        
        downloadButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const imageUrl = imageContainer.src.replace('_SX300_.jpg', '');
            const link = document.createElement('a');
            link.href = imageUrl;
            link.download = 'product_image.jpg';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            return false;
        });
        
        if (imageContainer.parentElement) {
            imageContainer.parentElement.style.position = 'relative';
            imageContainer.parentElement.appendChild(downloadButton);
        }
    },
    
    // Add category information next to ratings
    addCategoryToRating: function() {
        // Check if already added
        if (document.querySelector('.amazon-helper-category')) return;
        
        const ratingElement = document.querySelector('.a-icon-alt');
        const categoryElement = document.querySelector('#wayfinding-breadcrumbs_feature_div ul.a-unordered-list');
        
        if (ratingElement && categoryElement) {
            const categoryText = categoryElement.innerText.trim().replace(/\n/g, ' > ');
            const categorySpan = document.createElement('span');
            categorySpan.style.fontSize = '12px';
            categorySpan.style.color = '#555';
            categorySpan.textContent = ` (${categoryText})`;
            categorySpan.className = 'amazon-helper-category';
            ratingElement.parentNode.appendChild(categorySpan);
        }
    }
};

// Listen for state changes
document.addEventListener('amazonHelperReady', () => {
    if (window.location.pathname.includes('/dp/')) {
        AmazonHelperProduct.init();
    }
});

document.addEventListener('amazonHelperStateChanged', (event) => {
    if (event.detail.enabled && window.location.pathname.includes('/dp/')) {
        AmazonHelperProduct.init();
    }
});

document.addEventListener('amazonHelperSettingChanged', (event) => {
    if (window.amazonHelper.state.enabled && window.location.pathname.includes('/dp/')) {
        AmazonHelperProduct.init();
    }
});

// Initialize if DOM is already loaded
if (document.readyState !== 'loading') {
    if (window.amazonHelper && window.amazonHelper.state && window.location.pathname.includes('/dp/')) {
        AmazonHelperProduct.init();
    } else if (window.location.pathname.includes('/dp/')) {
        // Set up a quick check for state initialization
        const stateCheck = setInterval(() => {
            if (window.amazonHelper && window.amazonHelper.state) {
                AmazonHelperProduct.init();
                clearInterval(stateCheck);
            }
        }, 100);
        
        // Clear interval after 5 seconds to prevent any potential memory leaks
        setTimeout(() => clearInterval(stateCheck), 5000);
    }
}