/**
 * game.js
 * Core game state management and business logic
 */

import { Storage } from './storage.js';

export class Game {
    constructor() {
        this.players = [];
        this.scores = [];
        this.currentRound = 1;
        this.maxRounds = 11;
        this.roundCards = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
    }

    /**
     * Initialize a new game with players
     * @param {string[]} playerNames - Array of player names
     */
    startNewGame(playerNames) {
        if (playerNames.length < 2) {
            throw new Error('At least 2 players required');
        }

        this.players = [...playerNames];
        this.scores = this.players.map(() => new Array(this.maxRounds).fill(null));
        this.currentRound = 1;
        this.saveState();
    }

    /**
     * Add a player during setup
     * @param {string} name - Player name
     * @returns {boolean} Success status
     */
    addPlayer(name) {
        const trimmedName = name.trim();

        if (!trimmedName) {
            throw new Error('Player name cannot be empty');
        }

        if (this.players.includes(trimmedName)) {
            throw new Error('Player already exists');
        }

        this.players.push(trimmedName);
        return true;
    }

    /**
     * Remove a player during setup
     * @param {number} index - Player index
     */
    removePlayer(index) {
        if (index >= 0 && index < this.players.length) {
            this.players.splice(index, 1);
        }
    }

    /**
     * Submit scores for the current round
     * @param {number[]} roundScores - Array of scores for each player
     * @returns {boolean} Success status
     */
    submitRound(roundScores) {
        if (this.currentRound > this.maxRounds) {
            throw new Error('Game is already complete');
        }

        if (roundScores.length !== this.players.length) {
            throw new Error('Score count must match player count');
        }

        // Validate and store scores
        roundScores.forEach((score, index) => {
            this.scores[index][this.currentRound - 1] = score;
        });

        this.currentRound++;
        this.saveState();

        return this.isGameComplete();
    }

    /**
     * Undo the last completed round
     */
    undoLastRound() {
        if (this.currentRound === 1) {
            throw new Error('No rounds to undo');
        }

        this.currentRound--;
        this.players.forEach((_, index) => {
            this.scores[index][this.currentRound - 1] = null;
        });

        this.saveState();
    }

    /**
     * Get current round information
     * @returns {Object} Round info with number and card count
     */
    getCurrentRoundInfo() {
        return {
            round: this.currentRound,
            cards: this.roundCards[this.currentRound - 1],
            maxRounds: this.maxRounds
        };
    }

    /**
     * Calculate total score for a player
     * @param {number} playerIndex - Player index
     * @returns {number} Total score
     */
    getPlayerTotal(playerIndex) {
        return this.scores[playerIndex].reduce(
            (sum, score) => sum + (score !== null ? score : 0),
            0
        );
    }

    /**
     * Get all player totals
     * @returns {number[]} Array of total scores
     */
    getAllTotals() {
        return this.players.map((_, index) => this.getPlayerTotal(index));
    }

    /**
     * Determine the winner
     * @returns {Object|null} Winner info or null if game not complete
     */
    getWinner() {
        if (!this.isGameComplete()) {
            return null;
        }

        const totals = this.getAllTotals();
        const minScore = Math.min(...totals);
        const winnerIndex = totals.indexOf(minScore);

        return {
            name: this.players[winnerIndex],
            score: minScore,
            index: winnerIndex
        };
    }

    /**
     * Check if game is complete
     * @returns {boolean}
     */
    isGameComplete() {
        return this.currentRound > this.maxRounds;
    }

    /**
     * Get score for a specific player and round
     * @param {number} playerIndex - Player index
     * @param {number} round - Round number (1-indexed)
     * @returns {number|null}
     */
    getScore(playerIndex, round) {
        return this.scores[playerIndex][round - 1];
    }

    /**
     * Save current game state to localStorage
     */
    saveState() {
        Storage.save({
            players: this.players,
            scores: this.scores,
            currentRound: this.currentRound
        });
    }

    /**
     * Load game state from localStorage
     * @returns {boolean} True if state was loaded successfully
     */
    loadState() {
        const state = Storage.load();
        if (state) {
            this.players = state.players;
            this.scores = state.scores;
            this.currentRound = state.currentRound;
            return true;
        }
        return false;
    }

    /**
     * Reset game state and clear storage
     */
    reset() {
        this.players = [];
        this.scores = [];
        this.currentRound = 1;
        Storage.clear();
    }

    /**
     * Export game state as JSON
     * @returns {Object}
     */
    exportState() {
        return {
            players: this.players,
            scores: this.scores,
            currentRound: this.currentRound,
            maxRounds: this.maxRounds,
            roundCards: this.roundCards
        };
    }
}
