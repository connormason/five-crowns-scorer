/**
 * statistics.js
 * Manages game history and player statistics
 */

const HISTORY_KEY = 'fiveCrownsHistory';
const MAX_HISTORY = 50; // Keep last 50 games

export class Statistics {
    constructor() {
        this.history = this.loadHistory();
    }

    /**
     * Save completed game to history
     * @param {Object} gameState - Complete game state
     */
    saveGame(gameState) {
        const gameRecord = {
            id: Date.now(),
            date: new Date().toISOString(),
            players: gameState.players,
            scores: gameState.scores,
            winner: this.determineWinner(gameState),
            totalRounds: gameState.scores[0].filter(s => s !== null).length,
            timestamp: Date.now()
        };

        this.history.unshift(gameRecord);

        // Keep only last MAX_HISTORY games
        if (this.history.length > MAX_HISTORY) {
            this.history = this.history.slice(0, MAX_HISTORY);
        }

        this.saveHistory();
        return gameRecord;
    }

    /**
     * Determine winner from game state
     * @param {Object} gameState - Game state
     * @returns {Object} Winner information
     */
    determineWinner(gameState) {
        const totals = gameState.scores.map(playerScores =>
            playerScores.reduce((sum, score) => sum + (score !== null ? score : 0), 0)
        );

        const minScore = Math.min(...totals);
        const winnerIndex = totals.indexOf(minScore);

        return {
            name: gameState.players[winnerIndex],
            score: minScore,
            index: winnerIndex
        };
    }

    /**
     * Get all game history
     * @returns {Array} Array of game records
     */
    getHistory() {
        return this.history;
    }

    /**
     * Get statistics for a specific player
     * @param {string} playerName - Player name
     * @returns {Object} Player statistics
     */
    getPlayerStats(playerName) {
        const playerGames = this.history.filter(game =>
            game.players.includes(playerName)
        );

        if (playerGames.length === 0) {
            return null;
        }

        const wins = playerGames.filter(game => game.winner.name === playerName).length;
        const totalGames = playerGames.length;
        const winRate = ((wins / totalGames) * 100).toFixed(1);

        // Calculate average score
        const allScores = playerGames.map(game => {
            const playerIndex = game.players.indexOf(playerName);
            return game.scores[playerIndex].reduce((sum, score) =>
                sum + (score !== null ? score : 0), 0
            );
        });

        const avgScore = (allScores.reduce((a, b) => a + b, 0) / allScores.length).toFixed(1);
        const bestScore = Math.min(...allScores);
        const worstScore = Math.max(...allScores);

        return {
            playerName,
            totalGames,
            wins,
            losses: totalGames - wins,
            winRate: parseFloat(winRate),
            avgScore: parseFloat(avgScore),
            bestScore,
            worstScore
        };
    }

    /**
     * Get all player names from history
     * @returns {Array} Unique player names
     */
    getAllPlayers() {
        const players = new Set();
        this.history.forEach(game => {
            game.players.forEach(player => players.add(player));
        });
        return Array.from(players).sort();
    }

    /**
     * Get overall statistics
     * @returns {Object} Overall stats
     */
    getOverallStats() {
        if (this.history.length === 0) {
            return null;
        }

        const allPlayers = this.getAllPlayers();
        const playerStats = allPlayers.map(name => this.getPlayerStats(name));

        // Find best player by win rate
        const bestPlayer = playerStats.reduce((best, current) =>
            current.winRate > best.winRate ? current : best
        );

        // Calculate average game score
        const avgGameScores = this.history.map(game => {
            return game.scores.reduce((total, playerScores) => {
                return total + playerScores.reduce((sum, score) =>
                    sum + (score !== null ? score : 0), 0
                );
            }, 0) / game.players.length;
        });

        const overallAvgScore = (avgGameScores.reduce((a, b) => a + b, 0) / avgGameScores.length).toFixed(1);

        return {
            totalGames: this.history.length,
            uniquePlayers: allPlayers.length,
            bestPlayer: bestPlayer.playerName,
            bestWinRate: bestPlayer.winRate,
            avgGameScore: parseFloat(overallAvgScore)
        };
    }

    /**
     * Get recent games
     * @param {number} limit - Number of games to return
     * @returns {Array} Recent games
     */
    getRecentGames(limit = 10) {
        return this.history.slice(0, limit);
    }

    /**
     * Delete a game from history
     * @param {number} gameId - Game ID to delete
     */
    deleteGame(gameId) {
        this.history = this.history.filter(game => game.id !== gameId);
        this.saveHistory();
    }

    /**
     * Clear all history
     */
    clearHistory() {
        this.history = [];
        this.saveHistory();
    }

    /**
     * Export history as JSON
     * @returns {string} JSON string of history
     */
    exportHistory() {
        return JSON.stringify(this.history, null, 2);
    }

    /**
     * Import history from JSON
     * @param {string} jsonData - JSON string
     * @returns {boolean} Success status
     */
    importHistory(jsonData) {
        try {
            const imported = JSON.parse(jsonData);

            if (!Array.isArray(imported)) {
                throw new Error('Invalid history format');
            }

            // Validate structure
            imported.forEach(game => {
                if (!game.players || !game.scores || !game.winner) {
                    throw new Error('Invalid game record');
                }
            });

            // Merge with existing history, avoid duplicates
            const existingIds = new Set(this.history.map(g => g.id));
            const newGames = imported.filter(g => !existingIds.has(g.id));

            this.history = [...this.history, ...newGames]
                .sort((a, b) => b.timestamp - a.timestamp)
                .slice(0, MAX_HISTORY);

            this.saveHistory();
            return true;
        } catch (error) {
            console.error('Failed to import history:', error);
            return false;
        }
    }

    /**
     * Load history from localStorage
     * @returns {Array} Loaded history or empty array
     */
    loadHistory() {
        try {
            const data = localStorage.getItem(HISTORY_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Failed to load history:', error);
            return [];
        }
    }

    /**
     * Save history to localStorage
     */
    saveHistory() {
        try {
            localStorage.setItem(HISTORY_KEY, JSON.stringify(this.history));
        } catch (error) {
            console.error('Failed to save history:', error);
        }
    }
}
