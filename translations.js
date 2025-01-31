const translations = {
    'com': {
        extensionActive: 'Extension Active',
        sponsoredContent: 'Hide Sponsored',
        ratingSort: 'Sort by Rating' // Added translation
    },
    'co.uk': {
        extensionActive: 'Extension Active',
        sponsoredContent: 'Hide Sponsored',
        ratingSort: 'Sort by Rating' // Added translation
    },
    'de': {
        extensionActive: 'Erweiterung Aktiv',
        sponsoredContent: 'Gesponsert Ausblenden',
        ratingSort: 'Nach Bewertung Sortieren'
    },
    'fr': {
        extensionActive: 'Extension Active',
        sponsoredContent: 'Masquer Sponsorisés',
        ratingSort: 'Trier par Évaluation'
    },
    'com.tr': {
        extensionActive: 'Extension Active',
        sponsoredContent: 'Hide Sponsored',
        ratingSort: 'Sort by Rating'
    }
    // Additional languages can be added
};

function getCurrentLanguage() {
    const host = window.location.host;
    const domain = host.split('amazon.')[1];
    return translations[domain] || translations['com']; // Default to English
}