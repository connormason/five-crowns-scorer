/**
 * ui.js
 * UI rendering and DOM manipulation
 */

export class UI {
    constructor(game, statistics) {
        this.game = game;
        this.statistics = statistics;
        this.currentView = 'setup'; // 'setup', 'game', 'stats'
        this.elements = {
            setupSection: document.getElementById('setupSection'),
            gameSection: document.getElementById('gameSection'),
            statsSection: document.getElementById('statsSection'),
            playerNameInput: document.getElementById('playerNameInput'),
            playerList: document.getElementById('playerList'),
            roundInfo: document.getElementById('roundInfo'),
            currentRound: document.getElementById('currentRound'),
            scoreTable: document.getElementById('scoreTable'),
            scoreTableBody: document.getElementById('scoreTableBody'),
            scoreInputs: document.getElementById('scoreInputs'),
            themeToggle: document.getElementById('themeToggle'),
            importModal: document.getElementById('importModal'),
            importFileInput: document.getElementById('importFileInput')
        };
        this.initializeTheme();
    }

    /**
     * Initialize theme from localStorage
     */
    initializeTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeIcon(savedTheme);
    }

    /**
     * Toggle between light and dark theme
     */
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        this.updateThemeIcon(newTheme);
    }

    /**
     * Update theme toggle icon
     * @param {string} theme - Current theme
     */
    updateThemeIcon(theme) {
        if (this.elements.themeToggle) {
            this.elements.themeToggle.textContent = theme === 'light' ? '🌙' : '☀️';
        }
    }

    /**
     * Show setup section
     */
    showSetup() {
        this.hideAllSections();
        this.elements.setupSection.classList.remove('hidden');
        this.elements.roundInfo.textContent = 'Setup Game';
        this.currentView = 'setup';
    }

    /**
     * Show game section
     */
    showGame() {
        this.hideAllSections();
        this.elements.gameSection.classList.remove('hidden');
        this.currentView = 'game';
    }

    /**
     * Show statistics section
     */
    showStats() {
        this.hideAllSections();
        this.elements.statsSection.classList.remove('hidden');
        this.elements.roundInfo.textContent = 'Statistics & History';
        this.currentView = 'stats';
        this.updateStatsView();
    }

    /**
     * Hide all sections
     */
    hideAllSections() {
        this.elements.setupSection.classList.add('hidden');
        this.elements.gameSection.classList.add('hidden');
        this.elements.statsSection.classList.add('hidden');
    }

    /**
     * Update the player list display
     */
    updatePlayerList() {
        const list = this.elements.playerList;

        if (this.game.players.length === 0) {
            list.innerHTML = '<p style="color: #999; text-align: center;">No players added yet</p>';
            return;
        }

        list.innerHTML = this.game.players.map((name, index) => `
            <div class="player-item">
                <span>${this.escapeHtml(name)}</span>
                <button class="btn-danger" data-remove-player="${index}">Remove</button>
            </div>
        `).join('');
    }

    /**
     * Update the round information display
     */
    updateRoundInfo() {
        const info = this.game.getCurrentRoundInfo();
        this.elements.roundInfo.textContent =
            `Round ${info.round} of ${info.maxRounds} - ${info.cards} cards each`;
        this.elements.currentRound.textContent = info.round;
    }

    /**
     * Update the score table
     */
    updateScoreTable() {
        const table = this.elements.scoreTable;
        const thead = table.querySelector('thead tr');
        const tbody = this.elements.scoreTableBody;

        // Update header
        thead.innerHTML = '<th>Player</th>';
        for (let i = 1; i <= this.game.maxRounds; i++) {
            thead.innerHTML += `<th>R${i}</th>`;
        }
        thead.innerHTML += '<th>Total</th>';

        // Determine winner if game is complete
        const winner = this.game.getWinner();

        // Update body
        tbody.innerHTML = this.game.players.map((player, playerIndex) => {
            const total = this.game.getPlayerTotal(playerIndex);
            const isWinner = winner && winner.index === playerIndex;

            return `
                <tr ${isWinner ? 'class="winner"' : ''}>
                    <td class="player-name">${this.escapeHtml(player)}</td>
                    ${this.game.scores[playerIndex].map(score =>
                        `<td>${score !== null ? score : '-'}</td>`
                    ).join('')}
                    <td class="total-col">${total}</td>
                </tr>
            `;
        }).join('');
    }

    /**
     * Update the score input fields
     */
    updateScoreInputs() {
        const container = this.elements.scoreInputs;

        if (this.game.isGameComplete()) {
            container.innerHTML = '<p style="text-align: center; color: #667eea; font-weight: 600;">Game Complete!</p>';
            return;
        }

        container.innerHTML = this.game.players.map((player, index) => {
            const currentScore = this.game.getScore(index, this.game.currentRound);
            return `
                <div class="score-item">
                    <label>${this.escapeHtml(player)}</label>
                    <input type="number"
                           id="score-${index}"
                           min="0"
                           value="${currentScore !== null ? currentScore : ''}"
                           placeholder="0"
                           data-player-index="${index}" />
                </div>
            `;
        }).join('');
    }

    /**
     * Get scores from input fields
     * @returns {Object} Object with scores array and allFilled boolean
     */
    getScoreInputs() {
        const scores = [];
        let allFilled = true;

        this.game.players.forEach((_, index) => {
            const input = document.getElementById(`score-${index}`);
            const value = input.value.trim();

            if (value === '') {
                allFilled = false;
                scores.push(null);
            } else {
                scores.push(parseInt(value, 10));
            }
        });

        return { scores, allFilled };
    }

    /**
     * Clear player name input
     */
    clearPlayerInput() {
        this.elements.playerNameInput.value = '';
    }

    /**
     * Show winner announcement
     * @param {Object} winner - Winner object from game
     */
    announceWinner(winner) {
        setTimeout(() => {
            alert(`<� ${winner.name} wins with ${winner.score} points!`);
        }, 300);
    }

    /**
     * Show error message
     * @param {string} message - Error message
     */
    showError(message) {
        alert(message);
    }

    /**
     * Show confirmation dialog
     * @param {string} message - Confirmation message
     * @returns {boolean} User's choice
     */
    confirm(message) {
        return confirm(message);
    }

    /**
     * Escape HTML to prevent XSS
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Update all UI components
     */
    updateAll() {
        this.updateScoreTable();
        this.updateScoreInputs();
        this.updateRoundInfo();
    }

    /**
     * Update statistics view
     */
    updateStatsView() {
        const container = document.getElementById('statsContent');
        if (!container) return;

        const overall = this.statistics.getOverallStats();
        const recentGames = this.statistics.getRecentGames(10);
        const allPlayers = this.statistics.getAllPlayers();

        if (!overall) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No game history yet. Play some games to see statistics!</p>';
            return;
        }

        let html = '<h3>Overall Statistics</h3>';
        html += '<div class="stat-card">';
        html += `<div class="stat-row"><span class="stat-label">Total Games:</span><span class="stat-value">${overall.totalGames}</span></div>`;
        html += `<div class="stat-row"><span class="stat-label">Unique Players:</span><span class="stat-value">${overall.uniquePlayers}</span></div>`;
        html += `<div class="stat-row"><span class="stat-label">Best Player:</span><span class="stat-value">${this.escapeHtml(overall.bestPlayer)} (${overall.bestWinRate}% wins)</span></div>`;
        html += `<div class="stat-row"><span class="stat-label">Avg Game Score:</span><span class="stat-value">${overall.avgGameScore}</span></div>`;
        html += '</div>';

        // Player stats
        if (allPlayers.length > 0) {
            html += '<h3>Player Statistics</h3>';
            allPlayers.forEach(playerName => {
                const stats = this.statistics.getPlayerStats(playerName);
                if (stats) {
                    html += '<div class="stat-card">';
                    html += `<h4 style="margin-bottom: 0.5rem; color: var(--primary-color);">${this.escapeHtml(stats.playerName)}</h4>`;
                    html += `<div class="stat-row"><span class="stat-label">Games Played:</span><span class="stat-value">${stats.totalGames}</span></div>`;
                    html += `<div class="stat-row"><span class="stat-label">Wins:</span><span class="stat-value">${stats.wins}</span></div>`;
                    html += `<div class="stat-row"><span class="stat-label">Win Rate:</span><span class="stat-value">${stats.winRate}%</span></div>`;
                    html += `<div class="stat-row"><span class="stat-label">Avg Score:</span><span class="stat-value">${stats.avgScore}</span></div>`;
                    html += `<div class="stat-row"><span class="stat-label">Best Score:</span><span class="stat-value">${stats.bestScore}</span></div>`;
                    html += '</div>';
                }
            });
        }

        // Recent games
        if (recentGames.length > 0) {
            html += '<h3>Recent Games</h3>';
            recentGames.forEach(game => {
                const date = new Date(game.date);
                html += '<div class="history-item">';
                html += '<div class="history-header">';
                html += `<span class="history-winner">Winner: ${this.escapeHtml(game.winner.name)} (${game.winner.score})</span>`;
                html += `<span class="history-date">${date.toLocaleDateString()}</span>`;
                html += '</div>';
                html += `<div style="color: var(--text-secondary); font-size: 0.9rem;">Players: ${game.players.map(p => this.escapeHtml(p)).join(', ')}</div>`;
                html += '</div>';
            });
        }

        container.innerHTML = html;
    }

    /**
     * Show import modal
     */
    showImportModal() {
        if (this.elements.importModal) {
            this.elements.importModal.classList.add('active');
        }
    }

    /**
     * Hide import modal
     */
    hideImportModal() {
        if (this.elements.importModal) {
            this.elements.importModal.classList.remove('active');
            if (this.elements.importFileInput) {
                this.elements.importFileInput.value = '';
            }
        }
    }

    /**
     * Download JSON file
     * @param {string} data - JSON data
     * @param {string} filename - File name
     */
    downloadJSON(data, filename) {
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}
