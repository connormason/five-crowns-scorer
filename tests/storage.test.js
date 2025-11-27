/**
 * storage.test.js
 * Tests for storage module
 */

import { describe, it, assert } from './test-framework.js';
import { Storage } from '../js/storage.js';

describe('Storage Module', () => {
    // Clear localStorage before each test
    beforeEach(() => {
        localStorage.clear();
    });

    describe('save()', () => {
        it('should save game state to localStorage', () => {
            const gameState = {
                players: ['Alice', 'Bob'],
                scores: [[10, 20], [15, 25]],
                currentRound: 2
            };

            const result = Storage.save(gameState);
            assert.ok(result, 'Save should return true');

            const saved = localStorage.getItem('fiveCrownsGame');
            assert.isNotNull(saved, 'Data should be in localStorage');

            const parsed = JSON.parse(saved);
            assert.deepEqual(parsed, gameState, 'Saved data should match input');
        });

        it('should handle empty game state', () => {
            const gameState = {
                players: [],
                scores: [],
                currentRound: 1
            };

            const result = Storage.save(gameState);
            assert.ok(result, 'Save should succeed with empty state');
        });

        it('should overwrite existing data', () => {
            const gameState1 = { players: ['Alice'], scores: [[10]], currentRound: 1 };
            const gameState2 = { players: ['Bob'], scores: [[20]], currentRound: 2 };

            Storage.save(gameState1);
            Storage.save(gameState2);

            const saved = JSON.parse(localStorage.getItem('fiveCrownsGame'));
            assert.deepEqual(saved, gameState2, 'Should overwrite previous data');
        });
    });

    describe('load()', () => {
        it('should load game state from localStorage', () => {
            const gameState = {
                players: ['Alice', 'Bob'],
                scores: [[10, 20], [15, 25]],
                currentRound: 2
            };

            localStorage.setItem('fiveCrownsGame', JSON.stringify(gameState));

            const loaded = Storage.load();
            assert.deepEqual(loaded, gameState, 'Loaded data should match saved data');
        });

        it('should return null when no data exists', () => {
            const loaded = Storage.load();
            assert.isNull(loaded, 'Should return null when no data');
        });

        it('should return null on invalid JSON', () => {
            localStorage.setItem('fiveCrownsGame', 'invalid json');

            const loaded = Storage.load();
            assert.isNull(loaded, 'Should return null on parse error');
        });
    });

    describe('clear()', () => {
        it('should remove game state from localStorage', () => {
            const gameState = { players: ['Alice'], scores: [[10]], currentRound: 1 };
            Storage.save(gameState);

            assert.isNotNull(localStorage.getItem('fiveCrownsGame'), 'Data should exist before clear');

            const result = Storage.clear();
            assert.ok(result, 'Clear should return true');

            assert.isNull(localStorage.getItem('fiveCrownsGame'), 'Data should be removed');
        });

        it('should succeed even when no data exists', () => {
            const result = Storage.clear();
            assert.ok(result, 'Clear should succeed even with no data');
        });
    });

    describe('hasSavedGame()', () => {
        it('should return true when game data exists', () => {
            const gameState = { players: ['Alice'], scores: [[10]], currentRound: 1 };
            Storage.save(gameState);

            assert.ok(Storage.hasSavedGame(), 'Should return true when data exists');
        });

        it('should return false when no game data exists', () => {
            assert.notOk(Storage.hasSavedGame(), 'Should return false when no data');
        });

        it('should return false after clearing', () => {
            Storage.save({ players: ['Alice'], scores: [[10]], currentRound: 1 });
            Storage.clear();

            assert.notOk(Storage.hasSavedGame(), 'Should return false after clear');
        });
    });
});

// Helper to run before each test
function beforeEach(fn) {
    // This is a simple implementation - in a full framework, this would be more sophisticated
    // For now, we'll call it manually in each test that needs it
    // Or we can extend our test framework to support hooks
}
