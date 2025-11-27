/**
 * app.js
 * Main application entry point and event handlers
 */

import { Game } from './game.js';
import { UI } from './ui.js';
import { Statistics } from './statistics.js';

class FiveCrownsApp {
    constructor() {
        this.game = new Game();
        this.statistics = new Statistics();
        this.ui = new UI(this.game, this.statistics);
        this.setupEventListeners();
        this.checkForSavedGame();
    }

    /**
     * Check if there's a saved game and offer to restore it
     */
    checkForSavedGame() {
        if (this.game.loadState()) {
            if (this.ui.confirm('Continue your previous game?')) {
                this.ui.showGame();
                this.ui.updateAll();
            } else {
                this.game.reset();
                this.ui.updatePlayerList();
            }
        } else {
            this.ui.updatePlayerList();
        }
    }

    /**
     * Set up all event listeners
     */
    setupEventListeners() {
        // Theme toggle
        document.getElementById('themeToggle')?.addEventListener('click', () => {
            this.ui.toggleTheme();
        });

        // Add player button
        document.querySelector('[data-action="add-player"]')?.addEventListener('click', () => {
            this.handleAddPlayer();
        });

        // Player name input - Enter key
        this.ui.elements.playerNameInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleAddPlayer();
            }
        });

        // Start game button
        document.querySelector('[data-action="start-game"]')?.addEventListener('click', () => {
            this.handleStartGame();
        });

        // Submit round button
        document.querySelector('[data-action="submit-round"]')?.addEventListener('click', () => {
            this.handleSubmitRound();
        });

        // Undo last round button
        document.querySelector('[data-action="undo-round"]')?.addEventListener('click', () => {
            this.handleUndoRound();
        });

        // Reset game button
        document.querySelector('[data-action="reset-game"]')?.addEventListener('click', () => {
            this.handleResetGame();
        });

        // View statistics
        document.querySelector('[data-action="view-stats"]')?.addEventListener('click', () => {
            this.ui.showStats();
        });

        // Export game
        document.querySelector('[data-action="export-game"]')?.addEventListener('click', () => {
            this.handleExportGame();
        });

        // Import game
        document.querySelector('[data-action="import-game"]')?.addEventListener('click', () => {
            this.ui.showImportModal();
        });

        // Import modal controls
        document.querySelector('[data-action="close-import"]')?.addEventListener('click', () => {
            this.ui.hideImportModal();
        });

        document.querySelector('[data-action="confirm-import"]')?.addEventListener('click', () => {
            this.handleImportGame();
        });

        // Back to game button
        document.querySelector('[data-action="back-to-game"]')?.addEventListener('click', () => {
            if (this.game.players.length > 0) {
                this.ui.showGame();
                this.ui.updateAll();
            } else {
                this.ui.showSetup();
            }
        });

        // Event delegation for remove player buttons
        this.ui.elements.playerList?.addEventListener('click', (e) => {
            if (e.target.hasAttribute('data-remove-player')) {
                const index = parseInt(e.target.getAttribute('data-remove-player'), 10);
                this.handleRemovePlayer(index);
            }
        });

        // Close modal when clicking outside
        this.ui.elements.importModal?.addEventListener('click', (e) => {
            if (e.target === this.ui.elements.importModal) {
                this.ui.hideImportModal();
            }
        });
    }

    /**
     * Handle adding a player
     */
    handleAddPlayer() {
        try {
            const name = this.ui.elements.playerNameInput.value;
            this.game.addPlayer(name);
            this.ui.clearPlayerInput();
            this.ui.updatePlayerList();
            this.ui.elements.playerNameInput.focus();
        } catch (error) {
            this.ui.showError(error.message);
        }
    }

    /**
     * Handle removing a player
     * @param {number} index - Player index
     */
    handleRemovePlayer(index) {
        this.game.removePlayer(index);
        this.ui.updatePlayerList();
    }

    /**
     * Handle starting the game
     */
    handleStartGame() {
        try {
            if (this.game.players.length < 2) {
                this.ui.showError('Please add at least 2 players');
                return;
            }

            this.game.startNewGame(this.game.players);
            this.ui.showGame();
            this.ui.updateAll();
        } catch (error) {
            this.ui.showError(error.message);
        }
    }

    /**
     * Handle submitting scores for a round
     */
    handleSubmitRound() {
        try {
            if (this.game.isGameComplete()) {
                this.ui.showError('Game is already complete!');
                return;
            }

            const { scores, allFilled } = this.ui.getScoreInputs();

            // Check if any scores are missing
            if (!allFilled) {
                if (!this.ui.confirm('Some scores are missing. Continue anyway?')) {
                    return;
                }
                // Replace null with 0 for missing scores
                for (let i = 0; i < scores.length; i++) {
                    if (scores[i] === null) {
                        scores[i] = 0;
                    }
                }
            }

            const gameComplete = this.game.submitRound(scores);
            this.ui.updateAll();

            if (gameComplete) {
                // Save to history
                this.statistics.saveGame(this.game.exportState());

                const winner = this.game.getWinner();
                this.ui.announceWinner(winner);
            }
        } catch (error) {
            this.ui.showError(error.message);
        }
    }

    /**
     * Handle undoing the last round
     */
    handleUndoRound() {
        try {
            if (this.game.currentRound === 1) {
                this.ui.showError('No rounds to undo');
                return;
            }

            if (!this.ui.confirm('Undo the last round?')) {
                return;
            }

            this.game.undoLastRound();
            this.ui.updateAll();
        } catch (error) {
            this.ui.showError(error.message);
        }
    }

    /**
     * Handle resetting the game
     */
    handleResetGame() {
        if (!this.ui.confirm('Start a new game? All scores will be lost.')) {
            return;
        }

        this.game.reset();
        this.ui.showSetup();
        this.ui.clearPlayerInput();
        this.ui.updatePlayerList();
    }

    /**
     * Handle exporting game data
     */
    handleExportGame() {
        try {
            const jsonData = this.game.exportToJSON();
            const filename = `five-crowns-game-${new Date().toISOString().split('T')[0]}.json`;
            this.ui.downloadJSON(jsonData, filename);
        } catch (error) {
            this.ui.showError('Failed to export game: ' + error.message);
        }
    }

    /**
     * Handle importing game data
     */
    handleImportGame() {
        const fileInput = this.ui.elements.importFileInput;

        if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
            this.ui.showError('Please select a file to import');
            return;
        }

        const file = fileInput.files[0];
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const jsonData = e.target.result;
                this.game.importFromJSON(jsonData);
                this.ui.hideImportModal();
                this.ui.showGame();
                this.ui.updateAll();
                alert('Game imported successfully!');
            } catch (error) {
                this.ui.showError('Failed to import game: ' + error.message);
            }
        };

        reader.onerror = () => {
            this.ui.showError('Failed to read file');
        };

        reader.readAsText(file);
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.fiveCrownsApp = new FiveCrownsApp();
});
