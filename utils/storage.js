// Local Storage utilities for the Prompt Library
class StorageManager {
    constructor() {
        this.keys = {
            favorites: 'promptLibraryFavorites',
            settings: 'promptLibrarySettings',
            usage: 'promptLibraryUsage',
            history: 'promptLibraryHistory'
        };
    }

    // Generic storage methods
    setItem(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            return false;
        }
    }

    getItem(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return defaultValue;
        }
    }

    removeItem(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing from localStorage:', error);
            return false;
        }
    }

    // Favorites management
    getFavorites() {
        return this.getItem(this.keys.favorites, []);
    }

    saveFavorites(favorites) {
        return this.setItem(this.keys.favorites, favorites);
    }

    addFavorite(promptId) {
        const favorites = this.getFavorites();
        if (!favorites.includes(promptId)) {
            favorites.push(promptId);
            return this.saveFavorites(favorites);
        }
        return true;
    }

    removeFavorite(promptId) {
        const favorites = this.getFavorites();
        const index = favorites.indexOf(promptId);
        if (index > -1) {
            favorites.splice(index, 1);
            return this.saveFavorites(favorites);
        }
        return true;
    }

    isFavorite(promptId) {
        return this.getFavorites().includes(promptId);
    }

    // Usage tracking
    getUsageStats() {
        return this.getItem(this.keys.usage, {});
    }

    recordUsage(promptId) {
        const usage = this.getUsageStats();
        if (!usage[promptId]) {
            usage[promptId] = {
                count: 0,
                firstUsed: new Date().toISOString(),
                lastUsed: null
            };
        }
        usage[promptId].count++;
        usage[promptId].lastUsed = new Date().toISOString();
        return this.setItem(this.keys.usage, usage);
    }

    getPromptUsage(promptId) {
        const usage = this.getUsageStats();
        return usage[promptId] || { count: 0, firstUsed: null, lastUsed: null };
    }

    // Search history
    getSearchHistory() {
        return this.getItem(this.keys.history, []);
    }

    addSearchHistory(searchTerm) {
        if (!searchTerm.trim()) return;

        const history = this.getSearchHistory();
        
        // Remove if already exists
        const index = history.indexOf(searchTerm);
        if (index > -1) {
            history.splice(index, 1);
        }
        
        // Add to beginning
        history.unshift(searchTerm);
        
        // Keep only last 20 searches
        if (history.length > 20) {
            history.splice(20);
        }
        
        return this.setItem(this.keys.history, history);
    }

    clearSearchHistory() {
        return this.setItem(this.keys.history, []);
    }

    // Settings management
    getSettings() {
        return this.getItem(this.keys.settings, {
            theme: 'light',
            defaultView: 'browse',
            resultsPerPage: 12,
            showUsageStats: true,
            autoSave: true
        });
    }

    saveSetting(key, value) {
        const settings = this.getSettings();
        settings[key] = value;
        return this.setItem(this.keys.settings, settings);
    }

    getSetting(key, defaultValue = null) {
        const settings = this.getSettings();
        return settings[key] !== undefined ? settings[key] : defaultValue;
    }

    // Export data
    exportData() {
        return {
            favorites: this.getFavorites(),
            usage: this.getUsageStats(),
            settings: this.getSettings(),
            history: this.getSearchHistory(),
            exportDate: new Date().toISOString()
        };
    }

    // Import data
    importData(data) {
        try {
            if (data.favorites) this.saveFavorites(data.favorites);
            if (data.usage) this.setItem(this.keys.usage, data.usage);
            if (data.settings) this.setItem(this.keys.settings, data.settings);
            if (data.history) this.setItem(this.keys.history, data.history);
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }

    // Clear all data
    clearAllData() {
        return Object.values(this.keys).every(key => this.removeItem(key));
    }
}

// Create a global instance
window.storage = new StorageManager();