// Special operations for the product detail page
function handleProductPage() {
    if (!window.location.pathname.includes('/dp/')) return;

    const selectors = {
        sponsored: [
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
            'div[data-cel-widget*="sponsored_products"]',
            
            // Video Ads
            'div[cel_widget_id*="video-sponsored"]',
            'div[data-cel-widget*="video-sponsored"]',
            
            // General Sponsored Content
            'div[cel_widget_id*="sp_detail"]',
            'div[data-cel-widget*="sp_detail"]',
            'div[cel_widget_id*="sp-detail"]',
            'div[data-cel-widget*="sp-detail"]',
            
            // Additional Sponsored Sections
            '.sp_desktop_sponsored',
            '.sp_desktop',
            '.celwidget[data-csa-c-type*="sponsored"]',
            '[data-component-props*="sponsored"]',
            '[data-component-type*="sponsored"]',
            
            // Parent Containers
            'div[data-cel-widget*="sims-consolidated"]',
            'div[cel_widget_id*="sims-consolidated"]',
            '#desktop-dp-sims_session-similarities',
            '#detailpage-similar-sponsored',
            
            // Similar Brands
            '#almMultiOfferEgress',
            '#almMultiOfferEgress_feature_div',
            'div[data-feature-name="almMultiOfferEgress"]',
            '#brandsRefinements',
            '#brands-refinements',
            'div[cel_widget_id*="brand-footer"]',
            'div[data-cel-widget*="brand-footer"]',
            '#brandProductCarousel',
            '#brand-carousel',
            
            // Banner ve Üst Reklamlar
            '#hero-quick-promo',
            '#hero-quick-promo_feature_div',
            '#dp-ads-center-promo',
            '#dp-ads-center-promo_feature_div',
            'div[data-cel-widget*="hero-quick-promo"]',
            'div[cel_widget_id*="hero-quick-promo"]',
            '#advertisements_feature_div',
            '#advertisements',
            '#ad-endcap-1',
            '#ad-endcap-2',
            
            // Ek Similar Products seçicileri
            'div[data-cel-widget*="similar_brands"]',
            'div[cel_widget_id*="similar_brands"]',
            '#similarity-brands-widget',
            '#similar-brands-carousel',
            'div[data-feature-name*="similar"]',
            'div[data-feature-name*="similarity"]',
            
            // Genel sponsorlu içerik seçicileri
            'div[data-cel-widget*="adplacements"]',
            'div[cel_widget_id*="adplacements"]',
            'div[data-ad-details]',
            'div[data-ad-id]',

            // Video Carousel sponsorlu içerikleri
            'div[class*="_multi-brand-video-desktop"]',
            'div[class*="MultiBrandVideoDesktop"]',
            'div[data-cel-widget*="multi-brand-video"]',
            'div[data-feature-name*="multi-brand-video"]',
            'div[data-feature-name*="MultiBrandVideo"]',
            'div[class*="sbv_carousel"]',
            'div[data-a-carousel-options*="sponsored"]',
            'div[data-component-type="sbv"]',
            'div[data-component-props*="sponsored"]',
            
            // Carousel container'ları
            'div[cel_widget_id*="multi-brand-video"]',
            'div[data-cel-widget*="multi-brand-video"]',
            'div[cel_widget_id*="sbv_carousel"]',
            'div[data-cel-widget*="sbv_carousel"]',
            
            // Video reklam bileşenleri
            'div[class*="_mbvItem"]',
            'div[data-type="mbvItem"]',
            'div[class*="videoProductContainer"]',
            'div[class*="videoSectionContainer"]',
            
            // Sponsorlu marka videoları
            'div[data-video-ad-attributes-props]',
            'div[data-cel-widget*="sponsored-brands-video"]',
            'div[data-component-type="sponsored-brands-video"]',
            
            // Carousel wrapper'ları
            'div[class*="anonCarousel"]',
            'div[class*="a-carousel-container"][data-a-carousel-options*="sponsored"]',
            'div.a-carousel-row:has(div[data-video-ad-attributes-props])',
            
            // Sponsorlu video oynatıcıları
            'video[aria-label*="Sponsored video"]',
            'div[class*="videoContainer"]:has(video[aria-label*="Sponsored"])'
        ],
        parentContainers: [
            '.celwidget',
            '.a-carousel-container',
            '.a-section',
            'div[class*="_multi-brand-video-desktop"]',
            'div[class*="MultiBrandVideoDesktop"]',
            'div[data-cel-widget*="multi-brand-video"]'
        ]
    };

    function removeSponsored() {
        selectors.sponsored.forEach(selector => {
            document.querySelectorAll(selector).forEach(element => {
                // Find the parent container first
                let parent = element;
                selectors.parentContainers.some(containerSelector => {
                    const container = element.closest(containerSelector);
                    if (container) {
                        parent = container;
                        return true;
                    }
                    return false;
                });
                
                // Hide the element and its parent
                parent.style.display = 'none';
                
                // Hide all sponsored content inside
                parent.querySelectorAll('[data-cel-widget*="sponsored"], [cel_widget_id*="sponsored"]').forEach(child => {
                    child.style.display = 'none';
                });
            });
        });
    }

    function addDownloadButton() {
        const imageContainer = document.querySelector('#imgTagWrapperId img');
        if (!imageContainer) return;

        const downloadButton = document.createElement('button');
        downloadButton.textContent = 'Download Image';
        downloadButton.style.position = 'absolute';
        downloadButton.style.top = '10px';
        downloadButton.style.right = '10px';
        downloadButton.style.padding = '10px';
        downloadButton.style.backgroundColor = '#febd69';
        downloadButton.style.border = 'none';
        downloadButton.style.borderRadius = '5px';
        downloadButton.style.cursor = 'pointer';
        downloadButton.style.zIndex = '1000';

        downloadButton.addEventListener('click', () => {
            const imageUrl = imageContainer.src.replace('_SX300_.jpg', '');
            const link = document.createElement('a');
            link.href = imageUrl;
            link.download = 'product_image.jpg';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });

        imageContainer.parentElement.style.position = 'relative';
        imageContainer.parentElement.appendChild(downloadButton);
    }

    // Initial run
    chrome.storage.sync.get(['sponsoredOnProductEnabled', 'downloadImagesEnabled'], (items) => {
        if (items.sponsoredOnProductEnabled) {
            removeSponsored();
        }
        if (items.downloadImagesEnabled) {
            addDownloadButton();
        }
    });

    // Watch for DOM changes
    const observer = new MutationObserver(() => {
        chrome.storage.sync.get(['sponsoredOnProductEnabled', 'downloadImagesEnabled'], (items) => {
            if (items.sponsoredOnProductEnabled) {
                removeSponsored();
            }
            if (items.downloadImagesEnabled) {
                addDownloadButton();
            }
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Check again on scroll and page load events
    window.addEventListener('scroll', () => {
        chrome.storage.sync.get(['sponsoredOnProductEnabled', 'downloadImagesEnabled'], (items) => {
            if (items.sponsoredOnProductEnabled) {
                removeSponsored();
            }
            if (items.downloadImagesEnabled) {
                addDownloadButton();
            }
        });
    });
    window.addEventListener('load', () => {
        chrome.storage.sync.get(['sponsoredOnProductEnabled', 'downloadImagesEnabled'], (items) => {
            if (items.sponsoredOnProductEnabled) {
                removeSponsored();
            }
            if (items.downloadImagesEnabled) {
                addDownloadButton();
            }
        });
    });
    
    // Periodic check (for lazy-loaded content)
    setInterval(() => {
        chrome.storage.sync.get(['sponsoredOnProductEnabled', 'downloadImagesEnabled'], (items) => {
            if (items.sponsoredOnProductEnabled) {
                removeSponsored();
            }
            if (items.downloadImagesEnabled) {
                addDownloadButton();
            }
        });
    }, 500);
}

function addCategoryToRating() {
    const ratingElement = document.querySelector('.a-icon-alt');
    const categoryElement = document.querySelector('#wayfinding-breadcrumbs_feature_div ul.a-unordered-list');
    if (ratingElement && categoryElement) {
        const categoryText = categoryElement.innerText.trim().replace(/\n/g, ' > ');
        const categorySpan = document.createElement('span');
        categorySpan.style.fontSize = '12px';
        categorySpan.style.color = '#555';
        categorySpan.textContent = ` (${categoryText})`;
        ratingElement.parentNode.appendChild(categorySpan);
    }
}

// Run on page load
document.addEventListener('DOMContentLoaded', () => {
    handleProductPage();
    addCategoryToRating();
});

// Add message listener
chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'SETTING_CHANGED' && message.setting === 'sponsoredEnabled') {
        if (message.enabled) {
            removeSponsored();
        } else {
            // Optionally undo sponsored removal if desired
        }
    } else if (message.type === 'EXTENSION_STATE') {
        if (!message.enabled) {
            // Disable or pause extension actions if needed
        } else {
            // Re-enable extension actions
            removeSponsored();
        }
    } else if (message.type === 'SETTING_CHANGED' && message.setting === 'sponsoredOnProductEnabled') {
        if (message.enabled) {
            removeSponsored();
        }
    } else if (message.type === 'SETTING_CHANGED' && message.setting === 'downloadImagesEnabled') {
        if (message.enabled) {
            addDownloadButton();
        } else {
            // Optionally remove download button if desired
        }
    }
});