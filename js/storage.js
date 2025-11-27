/**
 * storage.js
 * Handles localStorage persistence for game state
 */

const STORAGE_KEY = 'fiveCrownsGame';

export const Storage = {
    /**
     * Save game state to localStorage
     * @param {Object} gameState - The game state to save
     */
    save(gameState) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
            return true;
        } catch (error) {
            console.error('Failed to save game state:', error);
            return false;
        }
    },

    /**
     * Load game state from localStorage
     * @returns {Object|null} The saved game state or null if none exists
     */
    load() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Failed to load game state:', error);
            return null;
        }
    },

    /**
     * Clear saved game state
     */
    clear() {
        try {
            localStorage.removeItem(STORAGE_KEY);
            return true;
        } catch (error) {
            console.error('Failed to clear game state:', error);
            return false;
        }
    },

    /**
     * Check if a saved game exists
     * @returns {boolean}
     */
    hasSavedGame() {
        return localStorage.getItem(STORAGE_KEY) !== null;
    }
};
