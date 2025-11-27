/**
 * Puppeteer test suite for Five Crowns Scorer - Game Setup
 * Tests player management and game initialization
 */

const TEST_URL = 'http://localhost:8000/index.html';

/**
 * Test: Adding and removing players
 */
async function testPlayerManagement(page) {
  console.log('Testing player management...');

  // Navigate to the app
  await page.goto(TEST_URL);
  await page.waitForSelector('#setup-view');

  // Add players
  await page.type('#player-name', 'Alice');
  await page.click('#add-player');
  await page.waitForSelector('#player-list li', { visible: true });

  await page.type('#player-name', 'Bob');
  await page.click('#add-player');

  await page.type('#player-name', 'Charlie');
  await page.click('#add-player');

  // Verify players were added
  const playerCount = await page.$$eval('#player-list li', players => players.length);
  if (playerCount !== 3) {
    throw new Error(`Expected 3 players, found ${playerCount}`);
  }

  // Verify player names
  const playerNames = await page.$$eval('#player-list li span',
    elements => elements.map(el => el.textContent)
  );

  if (!playerNames.includes('Alice') || !playerNames.includes('Bob') || !playerNames.includes('Charlie')) {
    throw new Error(`Player names incorrect: ${playerNames.join(', ')}`);
  }

  // Remove a player
  await page.click('#player-list li:first-child button');
  const updatedCount = await page.$$eval('#player-list li', players => players.length);

  if (updatedCount !== 2) {
    throw new Error(`Expected 2 players after removal, found ${updatedCount}`);
  }

  console.log('✓ Player management test passed');
  return true;
}

/**
 * Test: Starting a new game
 */
async function testGameStart(page) {
  console.log('Testing game start...');

  await page.goto(TEST_URL);
  await page.waitForSelector('#setup-view');

  // Clear any existing players and add new ones
  const removeButtons = await page.$$('#player-list li button');
  for (const button of removeButtons) {
    await button.click();
  }

  // Add minimum players (2)
  await page.type('#player-name', 'Player1');
  await page.click('#add-player');
  await page.type('#player-name', 'Player2');
  await page.click('#add-player');

  // Start game
  await page.click('#start-game');

  // Wait for game view
  await page.waitForSelector('#game-view', { visible: true });

  // Verify setup view is hidden
  const setupHidden = await page.$eval('#setup-view',
    el => el.style.display === 'none'
  );

  if (!setupHidden) {
    throw new Error('Setup view should be hidden after starting game');
  }

  // Verify score table is visible
  const scoreTableVisible = await page.$eval('#score-table',
    el => el.offsetParent !== null
  );

  if (!scoreTableVisible) {
    throw new Error('Score table should be visible');
  }

  // Verify round 1 is active
  const currentRound = await page.$eval('#current-round',
    el => el.textContent
  );

  if (!currentRound.includes('1')) {
    throw new Error(`Expected round 1, got: ${currentRound}`);
  }

  console.log('✓ Game start test passed');
  return true;
}

/**
 * Test: Input validation for player names
 */
async function testPlayerNameValidation(page) {
  console.log('Testing player name validation...');

  await page.goto(TEST_URL);
  await page.waitForSelector('#setup-view');

  // Try to add empty player name
  await page.click('#add-player');

  // Should show error message
  const hasError = await page.waitForSelector('#error-message', {
    visible: true,
    timeout: 2000
  }).then(() => true).catch(() => false);

  if (!hasError) {
    throw new Error('Should show error for empty player name');
  }

  // Add valid player
  await page.type('#player-name', 'ValidPlayer');
  await page.click('#add-player');

  // Try to add duplicate
  await page.type('#player-name', 'ValidPlayer');
  await page.click('#add-player');

  // Should show error for duplicate
  const duplicateError = await page.waitForSelector('#error-message', {
    visible: true,
    timeout: 2000
  }).then(() => true).catch(() => false);

  if (!duplicateError) {
    throw new Error('Should show error for duplicate player name');
  }

  console.log('✓ Player name validation test passed');
  return true;
}

/**
 * Run all game setup tests
 */
async function runGameSetupTests(browser) {
  const page = await browser.newPage();
  const results = {
    passed: 0,
    failed: 0,
    errors: []
  };

  try {
    await testPlayerManagement(page);
    results.passed++;
  } catch (error) {
    results.failed++;
    results.errors.push({ test: 'testPlayerManagement', error: error.message });
  }

  try {
    await testGameStart(page);
    results.passed++;
  } catch (error) {
    results.failed++;
    results.errors.push({ test: 'testGameStart', error: error.message });
  }

  try {
    await testPlayerNameValidation(page);
    results.passed++;
  } catch (error) {
    results.failed++;
    results.errors.push({ test: 'testPlayerNameValidation', error: error.message });
  }

  await page.close();
  return results;
}

module.exports = { runGameSetupTests };
