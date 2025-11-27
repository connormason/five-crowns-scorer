/**
 * game.test.js
 * Tests for game logic
 */

import { describe, it, assert } from './test-framework.js';
import { Game } from '../js/game.js';

describe('Game Class', () => {
    let game;

    // Setup before each test
    const beforeEach = () => {
        game = new Game();
        localStorage.clear();
    };

    describe('Constructor', () => {
        it('should initialize with empty state', () => {
            beforeEach();
            assert.deepEqual(game.players, [], 'Players should be empty');
            assert.deepEqual(game.scores, [], 'Scores should be empty');
            assert.equal(game.currentRound, 1, 'Current round should be 1');
            assert.equal(game.maxRounds, 11, 'Max rounds should be 11');
        });

        it('should have correct round cards configuration', () => {
            beforeEach();
            assert.deepEqual(game.roundCards, [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
        });
    });

    describe('addPlayer()', () => {
        it('should add a player', () => {
            beforeEach();
            const result = game.addPlayer('Alice');
            assert.ok(result, 'Should return true');
            assert.includes(game.players, 'Alice', 'Players should include Alice');
            assert.lengthOf(game.players, 1, 'Should have 1 player');
        });

        it('should add multiple players', () => {
            beforeEach();
            game.addPlayer('Alice');
            game.addPlayer('Bob');
            game.addPlayer('Charlie');

            assert.lengthOf(game.players, 3, 'Should have 3 players');
            assert.includes(game.players, 'Alice');
            assert.includes(game.players, 'Bob');
            assert.includes(game.players, 'Charlie');
        });

        it('should trim whitespace from player names', () => {
            beforeEach();
            game.addPlayer('  Alice  ');
            assert.includes(game.players, 'Alice', 'Should trim whitespace');
        });

        it('should throw error for empty name', () => {
            beforeEach();
            assert.throws(() => game.addPlayer(''), Error, 'Should throw for empty name');
            assert.throws(() => game.addPlayer('   '), Error, 'Should throw for whitespace-only name');
        });

        it('should throw error for duplicate player', () => {
            beforeEach();
            game.addPlayer('Alice');
            assert.throws(() => game.addPlayer('Alice'), Error, 'Should throw for duplicate');
        });
    });

    describe('removePlayer()', () => {
        it('should remove player by index', () => {
            beforeEach();
            game.addPlayer('Alice');
            game.addPlayer('Bob');
            game.addPlayer('Charlie');

            game.removePlayer(1); // Remove Bob

            assert.lengthOf(game.players, 2, 'Should have 2 players');
            assert.notIncludes(game.players, 'Bob', 'Should not include Bob');
            assert.includes(game.players, 'Alice');
            assert.includes(game.players, 'Charlie');
        });

        it('should handle invalid index gracefully', () => {
            beforeEach();
            game.addPlayer('Alice');

            game.removePlayer(5); // Invalid index
            assert.lengthOf(game.players, 1, 'Should still have 1 player');
        });
    });

    describe('startNewGame()', () => {
        it('should initialize game with players', () => {
            beforeEach();
            const players = ['Alice', 'Bob', 'Charlie'];

            game.startNewGame(players);

            assert.deepEqual(game.players, players, 'Players should be set');
            assert.lengthOf(game.scores, 3, 'Should have 3 score arrays');
            assert.lengthOf(game.scores[0], 11, 'Each player should have 11 rounds');
            assert.equal(game.currentRound, 1, 'Should start at round 1');
        });

        it('should initialize all scores to null', () => {
            beforeEach();
            game.startNewGame(['Alice', 'Bob']);

            game.scores.forEach(playerScores => {
                playerScores.forEach(score => {
                    assert.isNull(score, 'All scores should be null initially');
                });
            });
        });

        it('should throw error for less than 2 players', () => {
            beforeEach();
            assert.throws(() => game.startNewGame([]), Error);
            assert.throws(() => game.startNewGame(['Alice']), Error);
        });
    });

    describe('submitRound()', () => {
        it('should record scores for current round', () => {
            beforeEach();
            game.startNewGame(['Alice', 'Bob']);

            const scores = [10, 15];
            game.submitRound(scores);

            assert.equal(game.scores[0][0], 10, 'Alice round 1 score should be 10');
            assert.equal(game.scores[1][0], 15, 'Bob round 1 score should be 15');
            assert.equal(game.currentRound, 2, 'Should advance to round 2');
        });

        it('should handle multiple rounds', () => {
            beforeEach();
            game.startNewGame(['Alice', 'Bob']);

            game.submitRound([10, 15]);
            game.submitRound([20, 25]);
            game.submitRound([30, 35]);

            assert.equal(game.currentRound, 4, 'Should be on round 4');
            assert.equal(game.scores[0][2], 30, 'Alice round 3 should be 30');
        });

        it('should return true when game completes', () => {
            beforeEach();
            game.startNewGame(['Alice', 'Bob']);

            // Submit 10 rounds
            for (let i = 0; i < 10; i++) {
                const result = game.submitRound([10, 15]);
                assert.notOk(result, 'Should return false before completion');
            }

            // Submit final round
            const result = game.submitRound([10, 15]);
            assert.ok(result, 'Should return true on game completion');
            assert.ok(game.isGameComplete(), 'Game should be complete');
        });

        it('should throw error if game is complete', () => {
            beforeEach();
            game.startNewGame(['Alice', 'Bob']);

            // Complete the game
            for (let i = 0; i < 11; i++) {
                game.submitRound([10, 15]);
            }

            assert.throws(() => game.submitRound([10, 15]), Error);
        });

        it('should throw error if score count does not match player count', () => {
            beforeEach();
            game.startNewGame(['Alice', 'Bob', 'Charlie']);

            assert.throws(() => game.submitRound([10, 15]), Error, 'Too few scores');
            assert.throws(() => game.submitRound([10, 15, 20, 25]), Error, 'Too many scores');
        });
    });

    describe('undoLastRound()', () => {
        it('should undo the last round', () => {
            beforeEach();
            game.startNewGame(['Alice', 'Bob']);

            game.submitRound([10, 15]);
            game.submitRound([20, 25]);

            assert.equal(game.currentRound, 3, 'Should be on round 3');

            game.undoLastRound();

            assert.equal(game.currentRound, 2, 'Should be back to round 2');
            assert.isNull(game.scores[0][1], 'Round 2 score should be cleared');
            assert.isNull(game.scores[1][1], 'Round 2 score should be cleared');
            assert.equal(game.scores[0][0], 10, 'Round 1 score should remain');
        });

        it('should throw error if on round 1', () => {
            beforeEach();
            game.startNewGame(['Alice', 'Bob']);

            assert.throws(() => game.undoLastRound(), Error);
        });
    });

    describe('getPlayerTotal()', () => {
        it('should calculate player total score', () => {
            beforeEach();
            game.startNewGame(['Alice', 'Bob']);

            game.submitRound([10, 15]);
            game.submitRound([20, 25]);
            game.submitRound([30, 35]);

            const aliceTotal = game.getPlayerTotal(0);
            const bobTotal = game.getPlayerTotal(1);

            assert.equal(aliceTotal, 60, 'Alice total should be 60');
            assert.equal(bobTotal, 75, 'Bob total should be 75');
        });

        it('should ignore null scores', () => {
            beforeEach();
            game.startNewGame(['Alice', 'Bob']);

            game.submitRound([10, 15]);

            const aliceTotal = game.getPlayerTotal(0);
            assert.equal(aliceTotal, 10, 'Should only count non-null scores');
        });
    });

    describe('getWinner()', () => {
        it('should determine winner when game is complete', () => {
            beforeEach();
            game.startNewGame(['Alice', 'Bob', 'Charlie']);

            // Complete game with different totals
            for (let i = 0; i < 11; i++) {
                game.submitRound([5, 10, 15]); // Alice wins with lowest score
            }

            const winner = game.getWinner();

            assert.ok(winner, 'Winner should be defined');
            assert.equal(winner.name, 'Alice', 'Alice should win');
            assert.equal(winner.score, 55, 'Winner score should be 55');
            assert.equal(winner.index, 0, 'Winner index should be 0');
        });

        it('should return null if game is not complete', () => {
            beforeEach();
            game.startNewGame(['Alice', 'Bob']);

            game.submitRound([10, 15]);

            const winner = game.getWinner();
            assert.isNull(winner, 'Winner should be null before game completes');
        });
    });

    describe('exportToJSON()', () => {
        it('should export game as JSON string', () => {
            beforeEach();
            game.startNewGame(['Alice', 'Bob']);
            game.submitRound([10, 15]);

            const json = game.exportToJSON();

            assert.ok(json, 'JSON should be defined');

            const parsed = JSON.parse(json);
            assert.equal(parsed.version, '1.0', 'Should have version');
            assert.ok(parsed.exportDate, 'Should have export date');
            assert.ok(parsed.game, 'Should have game data');
            assert.deepEqual(parsed.game.players, ['Alice', 'Bob']);
        });
    });

    describe('importFromJSON()', () => {
        it('should import valid game data', () => {
            beforeEach();
            const exportData = {
                version: '1.0',
                exportDate: new Date().toISOString(),
                game: {
                    players: ['Alice', 'Bob'],
                    scores: [[10, null, null, null, null, null, null, null, null, null, null],
                             [15, null, null, null, null, null, null, null, null, null, null]],
                    currentRound: 2
                }
            };

            const result = game.importFromJSON(JSON.stringify(exportData));

            assert.ok(result, 'Import should succeed');
            assert.deepEqual(game.players, ['Alice', 'Bob']);
            assert.equal(game.currentRound, 2);
            assert.equal(game.scores[0][0], 10);
        });

        it('should throw error for invalid JSON', () => {
            beforeEach();
            assert.throws(() => game.importFromJSON('invalid json'), Error);
        });

        it('should throw error for missing game data', () => {
            beforeEach();
            const invalidData = {
                version: '1.0',
                exportDate: new Date().toISOString()
                // Missing 'game' property
            };

            assert.throws(() => game.importFromJSON(JSON.stringify(invalidData)), Error);
        });

        it('should throw error for too few players', () => {
            beforeEach();
            const invalidData = {
                version: '1.0',
                exportDate: new Date().toISOString(),
                game: {
                    players: ['Alice'], // Only 1 player
                    scores: [[10, null, null, null, null, null, null, null, null, null, null]],
                    currentRound: 1
                }
            };

            assert.throws(() => game.importFromJSON(JSON.stringify(invalidData)), Error);
        });
    });

    describe('isGameComplete()', () => {
        it('should return false during game', () => {
            beforeEach();
            game.startNewGame(['Alice', 'Bob']);
            game.submitRound([10, 15]);

            assert.notOk(game.isGameComplete(), 'Game should not be complete');
        });

        it('should return true after all rounds', () => {
            beforeEach();
            game.startNewGame(['Alice', 'Bob']);

            for (let i = 0; i < 11; i++) {
                game.submitRound([10, 15]);
            }

            assert.ok(game.isGameComplete(), 'Game should be complete');
        });
    });

    describe('getCurrentRoundInfo()', () => {
        it('should return current round information', () => {
            beforeEach();
            game.startNewGame(['Alice', 'Bob']);

            const info = game.getCurrentRoundInfo();

            assert.equal(info.round, 1, 'Round should be 1');
            assert.equal(info.cards, 3, 'Cards should be 3');
            assert.equal(info.maxRounds, 11, 'Max rounds should be 11');
        });

        it('should update as rounds progress', () => {
            beforeEach();
            game.startNewGame(['Alice', 'Bob']);

            game.submitRound([10, 15]);
            game.submitRound([20, 25]);

            const info = game.getCurrentRoundInfo();

            assert.equal(info.round, 3, 'Round should be 3');
            assert.equal(info.cards, 5, 'Cards should be 5');
        });
    });
});
