/**
 * app.js
 * Main application entry point and event handlers
 */

import { Game } from './game.js';
import { UI } from './ui.js';

class FiveCrownsApp {
    constructor() {
        this.game = new Game();
        this.ui = new UI(this.game);
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
        // Add player button
        document.querySelector('[data-action="add-player"]')?.addEventListener('click', () => {
            this.handleAddPlayer();
        });

        // Player name input - Enter key
        this.ui.elements.playerNameInput.addEventListener('keypress', (e) => {
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

        // Event delegation for remove player buttons
        this.ui.elements.playerList.addEventListener('click', (e) => {
            if (e.target.hasAttribute('data-remove-player')) {
                const index = parseInt(e.target.getAttribute('data-remove-player'), 10);
                this.handleRemovePlayer(index);
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
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.fiveCrownsApp = new FiveCrownsApp();
});
