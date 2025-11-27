# Puppeteer E2E Tests

This directory contains end-to-end (E2E) tests for the Five Crowns Scorer application using Puppeteer.

## Overview

The Puppeteer test suite provides comprehensive automated testing for all major features:

- **Game Setup** (`game-setup.test.js`) - Player management and game initialization
- **Score Entry** (`score-entry.test.js`) - Score input, validation, and round progression
- **Undo Functionality** (`undo.test.js`) - Undo last round and state restoration
- **Persistence** (`persistence.test.js`) - localStorage saving and game state restoration
- **UI Features** (`ui.test.js`) - Dark mode toggle and error messages
- **Export/Import** (`export-import.test.js`) - Game data export and import

## Setup

Install test dependencies:

```bash
make setup
```

Or manually:

```bash
npm install
```

## Running Tests

### Run all tests (headless):

```bash
make test-puppeteer
# or
make test-e2e
# or
npm run test:puppeteer
```

### Run tests with visible browser:

```bash
npm run test:puppeteer:headed
```

## Test Structure

Each test file exports a test runner function that:
1. Opens a new browser page
2. Runs multiple test cases
3. Collects results (passed/failed)
4. Reports errors
5. Closes the page

### Test Runner (`run-tests.js`)

The main test runner:
- Launches a headless Chromium browser
- Runs all test suites in sequence
- Prints detailed results for each suite
- Provides an overall summary
- Exits with appropriate status code (0 = success, 1 = failure)

## Test Requirements

Tests assume:
- The application is served on `http://localhost:8000`
- All tests start with a clean state (no localStorage data conflicts)
- The dev server is running (`make dev` in another terminal)

## Writing New Tests

To add a new test:

1. Create a new test file in `tests/puppeteer/`
2. Export a test runner function following the pattern:

```javascript
async function runMyTests(browser) {
  const page = await browser.newPage();
  const results = { passed: 0, failed: 0, errors: [] };

  try {
    await myTestFunction(page);
    results.passed++;
  } catch (error) {
    results.failed++;
    results.errors.push({ test: 'myTestFunction', error: error.message });
  }

  await page.close();
  return results;
}

module.exports = { runMyTests };
```

3. Import and add to the suites array in `run-tests.js`

## Common Patterns

### Setting up a game:

```javascript
async function setupGame(page, playerNames = ['Alice', 'Bob']) {
  await page.goto('http://localhost:8000/index.html');
  await page.waitForSelector('#setup-view');

  for (const name of playerNames) {
    await page.type('#player-name', name);
    await page.click('#add-player');
  }

  await page.click('#start-game');
  await page.waitForSelector('#game-view', { visible: true });
}
```

### Entering scores:

```javascript
const inputs = await page.$$('.score-input input[type="number"]');
await inputs[0].type('10');
await inputs[1].type('15');
await page.click('#submit-scores');
```

### Checking localStorage:

```javascript
const savedData = await page.evaluate(() => {
  const data = localStorage.getItem('fiveCrownsGame');
  return data ? JSON.parse(data) : null;
});
```

## Debugging

To debug tests:
1. Run with `--headed` flag to see the browser
2. Add `await page.waitForTimeout(5000)` to pause execution
3. Use `await page.screenshot({ path: 'debug.png' })` to capture screenshots
4. Check console output for detailed error messages

## CI/CD Integration

These tests can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run E2E tests
  run: |
    make setup
    make dev &
    sleep 5  # Wait for server to start
    make test-puppeteer
```

## Troubleshooting

**Tests fail with "Connection refused":**
- Ensure dev server is running (`make dev`)
- Check that tests use correct URL (`http://localhost:8000`)

**Tests timeout:**
- Increase timeout values in test code
- Check for network issues or slow machine

**Random failures:**
- Add `await page.waitForTimeout()` calls for async operations
- Use `waitForSelector` instead of arbitrary delays
- Ensure selectors are correct and stable

## Dependencies

- **puppeteer** (^21.0.0) - Headless Chrome automation

All dependencies are dev dependencies and won't affect the production build.
