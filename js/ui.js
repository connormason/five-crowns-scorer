/**
 * ui.js
 * UI rendering and DOM manipulation
 */

export class UI {
    constructor(game) {
        this.game = game;
        this.elements = {
            setupSection: document.getElementById('setupSection'),
            gameSection: document.getElementById('gameSection'),
            playerNameInput: document.getElementById('playerNameInput'),
            playerList: document.getElementById('playerList'),
            roundInfo: document.getElementById('roundInfo'),
            currentRound: document.getElementById('currentRound'),
            scoreTable: document.getElementById('scoreTable'),
            scoreTableBody: document.getElementById('scoreTableBody'),
            scoreInputs: document.getElementById('scoreInputs')
        };
    }

    /**
     * Show setup section and hide game section
     */
    showSetup() {
        this.elements.setupSection.classList.remove('hidden');
        this.elements.gameSection.classList.add('hidden');
        this.elements.roundInfo.textContent = 'Setup Game';
    }

    /**
     * Show game section and hide setup section
     */
    showGame() {
        this.elements.setupSection.classList.add('hidden');
        this.elements.gameSection.classList.remove('hidden');
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
            alert(`<‰ ${winner.name} wins with ${winner.score} points!`);
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
}
