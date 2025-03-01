/**
 * AmazonHelper - Simple Popup Script
 */

document.addEventListener('DOMContentLoaded', function() {
    // All toggle switches
    const switches = [
        'extensionEnabled',
        'sponsoredEnabled',
        'primeOnly',
        'getTomorrow',
        'getToday',
        'darkMode',
        'ratingSortEnabled'
    ];
    
    const statusMessage = document.getElementById('statusMessage');
    const body = document.body;
    
    // Default settings - dark mode is true by default
    const defaultSettings = {
        enabled: true,
        sponsoredEnabled: true,
        primeOnly: false,
        getTomorrow: false,
        getToday: false,
        darkMode: true,
        ratingSortEnabled: false
    };
    
    // Load saved settings
    chrome.storage.sync.get(defaultSettings, (items) => {
        // Apply settings to UI
        document.getElementById('extensionEnabled').checked = items.enabled;
        document.getElementById('sponsoredEnabled').checked = items.sponsoredEnabled;
        document.getElementById('primeOnly').checked = items.primeOnly;
        document.getElementById('getTomorrow').checked = items.getTomorrow;
        document.getElementById('getToday').checked = items.getToday;
        document.getElementById('darkMode').checked = items.darkMode;
        document.getElementById('ratingSortEnabled').checked = items.ratingSortEnabled;
        
        // Apply dark mode if enabled
        if (items.darkMode) {
            body.classList.add('dark-mode');
        } else {
            body.classList.remove('dark-mode');
        }
        
        // Apply extension active/inactive state
        if (!items.enabled) {
            body.classList.add('extension-inactive');
            disableAllTogglesExcept('extensionEnabled');
        }
        
        // Add event listeners to all toggles
        setupToggleListeners();
    });
    
    // Setup listeners for all toggle switches
    function setupToggleListeners() {
        switches.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', function() {
                    // Handle dark mode
                    if (id === 'darkMode') {
                        if (this.checked) {
                            body.classList.add('dark-mode');
                        } else {
                            body.classList.remove('dark-mode');
                        }
                    }
                    
                    // Handle extension enabled/disabled
                    if (id === 'extensionEnabled') {
                        if (this.checked) {
                            enableAllToggles();
                            body.classList.remove('extension-inactive');
                            showStatus('Extension Activated');
                        } else {
                            disableAllTogglesExcept('extensionEnabled');
                            body.classList.add('extension-inactive');
                            showStatus('Extension Deactivated');
                        }
                    } else {
                        // Show status message for other toggles
                        const statusText = this.checked ? 
                            `${getToggleLabel(id)} Enabled` : 
                            `${getToggleLabel(id)} Disabled`;
                        showStatus(statusText);
                    }
                    
                    // Save setting
                    const realSetting = (id === 'extensionEnabled') ? 'enabled' : id;
                    saveSettings(realSetting, this.checked);
                    
                    // Add animation
                    const container = this.closest('.switch-container');
                    if (container) {
                        container.classList.add('setting-changed');
                        setTimeout(() => {
                            container.classList.remove('setting-changed');
                        }, 500);
                    }
                });
            }
        });
    }
    
    // Disable all toggles except the specified one
    function disableAllTogglesExcept(exceptId) {
        switches.forEach(id => {
            if (id !== exceptId) {
                const element = document.getElementById(id);
                if (element) {
                    element.disabled = true;
                    const container = element.closest('.switch-container');
                    if (container) {
                        container.classList.add('disabled');
                    }
                }
            }
        });
    }
    
    // Enable all toggles
    function enableAllToggles() {
        switches.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.disabled = false;
                const container = element.closest('.switch-container');
                if (container) {
                    container.classList.remove('disabled');
                }
            }
        });
    }
    
    // Get human-readable label for toggle
    function getToggleLabel(id) {
        const labels = {
            'extensionEnabled': 'Extension',
            'sponsoredEnabled': 'Hide Sponsored',
            'primeOnly': 'Prime Only',
            'getTomorrow': 'Get Tomorrow',
            'getToday': 'Get Today',
            'darkMode': 'Dark Mode',
            'ratingSortEnabled': 'Sort by Rating'
        };
        return labels[id] || id;
    }
    
    // Show status message
    function showStatus(message) {
        statusMessage.textContent = message;
        statusMessage.classList.add('visible');
        
        setTimeout(() => {
            statusMessage.classList.remove('visible');
        }, 2000);
    }
    
    // Save settings and notify content script
    function saveSettings(setting, value) {
        const settings = {
            [setting]: value
        };
        
        chrome.storage.sync.set(settings, () => {
            try {
                chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                    if (tabs && tabs[0] && tabs[0].id) {
                        chrome.tabs.sendMessage(tabs[0].id, {
                            type: setting === 'enabled' ? 'EXTENSION_STATE' : 'SETTING_CHANGED',
                            setting: setting,
                            enabled: value
                        });
                    }
                });
            } catch (error) {
                console.log('Communication with content script failed');
            }
        });
    }
});