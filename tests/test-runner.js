/**
 * test-runner.js
 * Main test runner - imports and runs all test suites
 */

import { test } from './test-framework.js';

// Import all test suites
import './storage.test.js';
import './game.test.js';
import './statistics.test.js';

// Run all tests when loaded
(async () => {
    console.log('Five Crowns Scorer - Test Suite\n');
    console.log('='.repeat(50));
    console.log('');

    const results = await test.run();

    // Exit with error code if tests failed (for CI/CD)
    if (typeof process !== 'undefined' && results.failed > 0) {
        process.exit(1);
    }

    // Display summary in browser
    if (typeof document !== 'undefined') {
        displayResults(results);
    }
})();

/**
 * Display test results in browser
 * @param {Object} results - Test results
 */
function displayResults(results) {
    const container = document.getElementById('results');
    if (!container) return;

    const passRate = ((results.passed / results.total) * 100).toFixed(1);
    const status = results.failed === 0 ? 'success' : 'failure';

    container.innerHTML = `
        <div class="summary ${status}">
            <h2>${results.failed === 0 ? '✅ All Tests Passed!' : `❌ ${results.failed} Test(s) Failed`}</h2>
            <div class="stats">
                <div class="stat">
                    <span class="label">Total Tests:</span>
                    <span class="value">${results.total}</span>
                </div>
                <div class="stat">
                    <span class="label">Passed:</span>
                    <span class="value passed">${results.passed}</span>
                </div>
                <div class="stat">
                    <span class="label">Failed:</span>
                    <span class="value failed">${results.failed}</span>
                </div>
                <div class="stat">
                    <span class="label">Pass Rate:</span>
                    <span class="value">${passRate}%</span>
                </div>
            </div>
            <p class="note">Check the browser console for detailed test output.</p>
        </div>
    `;
}
