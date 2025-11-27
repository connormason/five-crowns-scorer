#!/usr/bin/env node
/**
 * Puppeteer Test Runner for Five Crowns Scorer
 * Runs all Puppeteer test suites
 */

const puppeteer = require('puppeteer');
const path = require('path');

// Import test suites
const { runGameSetupTests } = require('./game-setup.test.js');
const { runScoreEntryTests } = require('./score-entry.test.js');
const { runUndoTests } = require('./undo.test.js');
const { runPersistenceTests } = require('./persistence.test.js');
const { runUITests } = require('./ui.test.js');
const { runExportImportTests } = require('./export-import.test.js');

/**
 * Print test results summary
 */
function printResults(suiteName, results) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Test Suite: ${suiteName}`);
  console.log(`${'='.repeat(60)}`);
  console.log(`✓ Passed: ${results.passed}`);
  console.log(`✗ Failed: ${results.failed}`);

  if (results.errors.length > 0) {
    console.log('\nFailures:');
    results.errors.forEach(({ test, error }) => {
      console.log(`  ✗ ${test}`);
      console.log(`    ${error}`);
    });
  }
}

/**
 * Main test runner
 */
async function runAllTests() {
  console.log('\n🎮 Five Crowns Scorer - Puppeteer Test Suite');
  console.log('='.repeat(60));

  const startTime = Date.now();
  let totalPassed = 0;
  let totalFailed = 0;

  // Launch browser
  console.log('\nLaunching browser...');
  const browser = await puppeteer.launch({
    headless: true, // Set to false to see tests running
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage'
    ]
  });

  try {
    // Run test suites
    const suites = [
      { name: 'Game Setup', runner: runGameSetupTests },
      { name: 'Score Entry & Game Flow', runner: runScoreEntryTests },
      { name: 'Undo Functionality', runner: runUndoTests },
      { name: 'localStorage Persistence', runner: runPersistenceTests },
      { name: 'UI & Dark Mode', runner: runUITests },
      { name: 'Export/Import', runner: runExportImportTests }
    ];

    for (const suite of suites) {
      console.log(`\n\nRunning ${suite.name} tests...`);
      const results = await suite.runner(browser);
      printResults(suite.name, results);

      totalPassed += results.passed;
      totalFailed += results.failed;
    }

    // Print overall summary
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log(`\n\n${'='.repeat(60)}`);
    console.log('OVERALL RESULTS');
    console.log(`${'='.repeat(60)}`);
    console.log(`Total Passed: ${totalPassed}`);
    console.log(`Total Failed: ${totalFailed}`);
    console.log(`Duration: ${duration}s`);

    if (totalFailed === 0) {
      console.log('\n✓ All tests passed! 🎉');
    } else {
      console.log(`\n✗ ${totalFailed} test(s) failed`);
    }

  } catch (error) {
    console.error('\n✗ Test runner error:', error);
    process.exit(1);
  } finally {
    // Close browser
    await browser.close();
  }

  // Exit with appropriate code
  process.exit(totalFailed > 0 ? 1 : 0);
}

// Handle command line arguments
const args = process.argv.slice(2);
const options = {
  headless: !args.includes('--headed'),
  suite: args.find(arg => !arg.startsWith('--'))
};

// Run specific suite if requested
if (options.suite) {
  console.log(`Running specific suite: ${options.suite}`);
  // Could add logic here to run specific suites
}

// Run tests
runAllTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
