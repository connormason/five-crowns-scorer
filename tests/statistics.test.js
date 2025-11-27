/**
 * statistics.test.js
 * Tests for statistics module
 */

import { describe, it, assert } from './test-framework.js';
import { Statistics } from '../js/statistics.js';

describe('Statistics Class', () => {
    let stats;

    const beforeEach = () => {
        stats = new Statistics();
        localStorage.clear();
    };

    const createMockGameState = (players, winner = 0) => {
        const scores = players.map((_, idx) => {
            const baseScore = idx === winner ? 50 : 60 + idx * 5;
            return Array(11).fill(baseScore / 11);
        });

        return {
            players,
            scores,
            currentRound: 12
        };
    };

    describe('Constructor', () => {
        it('should initialize with empty history', () => {
            beforeEach();
            assert.isArray(stats.history, 'History should be an array');
            assert.lengthOf(stats.history, 0, 'History should be empty initially');
        });

        it('should load existing history from localStorage', () => {
            const existingHistory = [{
                id: 1,
                date: new Date().toISOString(),
                players: ['Alice', 'Bob'],
                winner: { name: 'Alice', score: 50 }
            }];

            localStorage.setItem('fiveCrownsHistory', JSON.stringify(existingHistory));

            const newStats = new Statistics();
            assert.lengthOf(newStats.history, 1, 'Should load existing history');
        });
    });

    describe('saveGame()', () => {
        it('should save completed game to history', () => {
            beforeEach();
            const gameState = createMockGameState(['Alice', 'Bob']);

            const record = stats.saveGame(gameState);

            assert.ok(record, 'Should return game record');
            assert.ok(record.id, 'Record should have ID');
            assert.ok(record.date, 'Record should have date');
            assert.lengthOf(stats.history, 1, 'History should have 1 game');
        });

        it('should add winner information', () => {
            beforeEach();
            const gameState = createMockGameState(['Alice', 'Bob', 'Charlie'], 1);

            const record = stats.saveGame(gameState);

            assert.equal(record.winner.name, 'Bob', 'Winner should be Bob');
            assert.ok(record.winner.score, 'Winner should have score');
        });

        it('should limit history to 50 games', () => {
            beforeEach();

            // Add 55 games
            for (let i = 0; i < 55; i++) {
                const gameState = createMockGameState(['Alice', 'Bob']);
                stats.saveGame(gameState);
            }

            assert.lengthOf(stats.history, 50, 'History should cap at 50 games');
        });

        it('should keep most recent games', () => {
            beforeEach();

            // Add games with timestamps
            for (let i = 0; i < 55; i++) {
                const gameState = createMockGameState([`Player${i}`, 'Bob']);
                stats.saveGame(gameState);
            }

            // Most recent should have higher player numbers
            const firstGame = stats.history[0];
            assert.ok(firstGame.players[0].includes('54'), 'Should keep most recent');
        });
    });

    describe('getPlayerStats()', () => {
        it('should return statistics for a player', () => {
            beforeEach();

            // Add games where Alice wins some
            stats.saveGame(createMockGameState(['Alice', 'Bob'], 0)); // Alice wins
            stats.saveGame(createMockGameState(['Alice', 'Bob'], 1)); // Bob wins
            stats.saveGame(createMockGameState(['Alice', 'Bob'], 0)); // Alice wins

            const aliceStats = stats.getPlayerStats('Alice');

            assert.ok(aliceStats, 'Should return stats');
            assert.equal(aliceStats.playerName, 'Alice');
            assert.equal(aliceStats.totalGames, 3);
            assert.equal(aliceStats.wins, 2);
            assert.equal(aliceStats.losses, 1);
        });

        it('should calculate win rate correctly', () => {
            beforeEach();

            stats.saveGame(createMockGameState(['Alice', 'Bob'], 0)); // Alice wins
            stats.saveGame(createMockGameState(['Alice', 'Bob'], 1)); // Bob wins
            stats.saveGame(createMockGameState(['Alice', 'Bob'], 1)); // Bob wins
            stats.saveGame(createMockGameState(['Alice', 'Bob'], 0)); // Alice wins

            const aliceStats = stats.getPlayerStats('Alice');

            assert.equal(aliceStats.winRate, 50.0, 'Win rate should be 50%');
        });

        it('should calculate average score', () => {
            beforeEach();

            const game1 = createMockGameState(['Alice', 'Bob'], 0);
            game1.scores[0] = Array(11).fill(5); // Alice: 55 total

            const game2 = createMockGameState(['Alice', 'Bob'], 0);
            game2.scores[0] = Array(11).fill(4); // Alice: 44 total

            stats.saveGame(game1);
            stats.saveGame(game2);

            const aliceStats = stats.getPlayerStats('Alice');

            assert.equal(aliceStats.avgScore, 49.5, 'Avg score should be 49.5');
        });

        it('should return null for player not in history', () => {
            beforeEach();

            stats.saveGame(createMockGameState(['Alice', 'Bob']));

            const charlieStats = stats.getPlayerStats('Charlie');

            assert.isNull(charlieStats, 'Should return null for unknown player');
        });

        it('should track best and worst scores', () => {
            beforeEach();

            const game1 = createMockGameState(['Alice', 'Bob'], 0);
            game1.scores[0] = Array(11).fill(3); // Alice: 33 total

            const game2 = createMockGameState(['Alice', 'Bob'], 0);
            game2.scores[0] = Array(11).fill(8); // Alice: 88 total

            const game3 = createMockGameState(['Alice', 'Bob'], 0);
            game3.scores[0] = Array(11).fill(5); // Alice: 55 total

            stats.saveGame(game1);
            stats.saveGame(game2);
            stats.saveGame(game3);

            const aliceStats = stats.getPlayerStats('Alice');

            assert.equal(aliceStats.bestScore, 33, 'Best score should be 33');
            assert.equal(aliceStats.worstScore, 88, 'Worst score should be 88');
        });
    });

    describe('getAllPlayers()', () => {
        it('should return unique player names', () => {
            beforeEach();

            stats.saveGame(createMockGameState(['Alice', 'Bob']));
            stats.saveGame(createMockGameState(['Bob', 'Charlie']));
            stats.saveGame(createMockGameState(['Alice', 'Charlie']));

            const players = stats.getAllPlayers();

            assert.lengthOf(players, 3, 'Should have 3 unique players');
            assert.includes(players, 'Alice');
            assert.includes(players, 'Bob');
            assert.includes(players, 'Charlie');
        });

        it('should return empty array when no history', () => {
            beforeEach();

            const players = stats.getAllPlayers();

            assert.lengthOf(players, 0, 'Should return empty array');
        });

        it('should return sorted player names', () => {
            beforeEach();

            stats.saveGame(createMockGameState(['Zoe', 'Alice', 'Bob']));

            const players = stats.getAllPlayers();

            assert.equal(players[0], 'Alice', 'Should be sorted alphabetically');
            assert.equal(players[1], 'Bob');
            assert.equal(players[2], 'Zoe');
        });
    });

    describe('getOverallStats()', () => {
        it('should return overall statistics', () => {
            beforeEach();

            stats.saveGame(createMockGameState(['Alice', 'Bob'], 0));
            stats.saveGame(createMockGameState(['Bob', 'Charlie'], 0));
            stats.saveGame(createMockGameState(['Alice', 'Charlie'], 0));

            const overall = stats.getOverallStats();

            assert.ok(overall, 'Should return stats');
            assert.equal(overall.totalGames, 3);
            assert.equal(overall.uniquePlayers, 3);
            assert.ok(overall.bestPlayer, 'Should have best player');
        });

        it('should return null when no history', () => {
            beforeEach();

            const overall = stats.getOverallStats();

            assert.isNull(overall, 'Should return null with no history');
        });

        it('should identify best player by win rate', () => {
            beforeEach();

            // Alice wins 3/3
            stats.saveGame(createMockGameState(['Alice', 'Bob'], 0));
            stats.saveGame(createMockGameState(['Alice', 'Bob'], 0));
            stats.saveGame(createMockGameState(['Alice', 'Bob'], 0));

            // Bob only appears in losses
            // Charlie wins 1/1
            stats.saveGame(createMockGameState(['Charlie', 'Dave'], 0));

            const overall = stats.getOverallStats();

            // Both Alice and Charlie have 100% win rate, but we take the first found
            assert.ok(['Alice', 'Charlie'].includes(overall.bestPlayer));
        });
    });

    describe('getRecentGames()', () => {
        it('should return recent games', () => {
            beforeEach();

            for (let i = 0; i < 15; i++) {
                stats.saveGame(createMockGameState(['Alice', 'Bob']));
            }

            const recent = stats.getRecentGames(10);

            assert.lengthOf(recent, 10, 'Should return 10 games');
        });

        it('should return games in chronological order (most recent first)', () => {
            beforeEach();

            const game1 = createMockGameState(['Player1', 'Bob']);
            const game2 = createMockGameState(['Player2', 'Bob']);
            const game3 = createMockGameState(['Player3', 'Bob']);

            stats.saveGame(game1);
            stats.saveGame(game2);
            stats.saveGame(game3);

            const recent = stats.getRecentGames(3);

            assert.equal(recent[0].players[0], 'Player3', 'Most recent should be first');
            assert.equal(recent[2].players[0], 'Player1', 'Oldest should be last');
        });

        it('should handle limit larger than history', () => {
            beforeEach();

            stats.saveGame(createMockGameState(['Alice', 'Bob']));
            stats.saveGame(createMockGameState(['Alice', 'Bob']));

            const recent = stats.getRecentGames(100);

            assert.lengthOf(recent, 2, 'Should return all available games');
        });
    });

    describe('exportHistory() / importHistory()', () => {
        it('should export history as JSON', () => {
            beforeEach();

            stats.saveGame(createMockGameState(['Alice', 'Bob']));
            stats.saveGame(createMockGameState(['Charlie', 'Dave']));

            const exported = stats.exportHistory();

            assert.ok(exported, 'Export should return data');

            const parsed = JSON.parse(exported);
            assert.isArray(parsed, 'Should be array');
            assert.lengthOf(parsed, 2, 'Should have 2 games');
        });

        it('should import valid history', () => {
            beforeEach();

            const game1 = createMockGameState(['Alice', 'Bob']);
            stats.saveGame(game1);

            const exported = stats.exportHistory();

            // Create new stats instance and import
            const newStats = new Statistics();
            newStats.history = []; // Clear

            const result = newStats.importHistory(exported);

            assert.ok(result, 'Import should succeed');
            assert.lengthOf(newStats.history, 1, 'Should have imported game');
        });

        it('should merge with existing history', () => {
            beforeEach();

            stats.saveGame(createMockGameState(['Alice', 'Bob']));

            const exported = stats.exportHistory();

            stats.saveGame(createMockGameState(['Charlie', 'Dave']));

            const result = stats.importHistory(exported);

            assert.ok(result, 'Import should succeed');
            assert.lengthOf(stats.history, 2, 'Should have merged history');
        });

        it('should reject invalid JSON', () => {
            beforeEach();

            const result = stats.importHistory('invalid json');

            assert.notOk(result, 'Should return false for invalid JSON');
        });

        it('should reject invalid structure', () => {
            beforeEach();

            const invalidData = JSON.stringify({ not: 'an array' });

            const result = stats.importHistory(invalidData);

            assert.notOk(result, 'Should return false for invalid structure');
        });
    });

    describe('clearHistory()', () => {
        it('should clear all history', () => {
            beforeEach();

            stats.saveGame(createMockGameState(['Alice', 'Bob']));
            stats.saveGame(createMockGameState(['Charlie', 'Dave']));

            assert.lengthOf(stats.history, 2, 'Should have 2 games');

            stats.clearHistory();

            assert.lengthOf(stats.history, 0, 'History should be empty');
        });
    });
});
