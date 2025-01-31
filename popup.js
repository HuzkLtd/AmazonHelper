document.addEventListener('DOMContentLoaded', function() {
    // Load settings
    chrome.storage.sync.get({
        enabled: true,
        sponsoredEnabled: true,
        primeOnly: false,
        getTomorrow: false,
        getToday: false,
        darkMode: true,
        ratingSortEnabled: false
    }, (items) => {
        // Set checkbox states
        document.getElementById('extensionEnabled').checked = items.enabled;
        document.getElementById('sponsoredEnabled').checked = items.sponsoredEnabled;
        document.getElementById('primeOnly').checked = items.primeOnly;
        document.getElementById('getTomorrow').checked = items.getTomorrow;
        document.getElementById('getToday').checked = items.getToday;
        document.getElementById('darkMode').checked = items.darkMode;
        document.getElementById('ratingSortEnabled').checked = items.ratingSortEnabled;

        // Apply dark mode if enabled
        if (items.darkMode) {
            document.body.classList.add('dark-mode');
        }
    });

    // Listen to all switches
    const switches = [
        'extensionEnabled',
        'sponsoredEnabled',
        'primeOnly',
        'getTomorrow',
        'getToday',
        'darkMode',
        'ratingSortEnabled'
    ];

    switches.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', function() {
                // Special handling for dark mode
                if (id === 'darkMode') {
                    if (this.checked) {
                        document.body.classList.add('dark-mode');
                    } else {
                        document.body.classList.remove('dark-mode');
                    }
                }

                // Save setting
                saveSettings(id, this.checked);
            });
        }
    });
});

// Save settings and notify content script
function saveSettings(setting, value) {
    const settings = {
        [setting]: value
    };
    
    chrome.storage.sync.set(settings, () => {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            if (!tabs[0]?.id) return;
            
            try {
                chrome.tabs.sendMessage(tabs[0].id, {
                    type: setting === 'enabled' ? 'EXTENSION_STATE' : 'SETTING_CHANGED',
                    setting: setting,
                    enabled: value
                });
            } catch (error) {
                console.error('Message sending failed:', error);
            }
        });
    });
}