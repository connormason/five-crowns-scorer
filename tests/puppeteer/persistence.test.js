/**
 * Puppeteer test suite for Five Crowns Scorer - localStorage Persistence
 * Tests game state saving and restoration
 */

const TEST_URL = 'http://localhost:8000/index.html';

/**
 * Helper: Set up a game with players
 */
async function setupGame(page, playerNames = ['Alice', 'Bob']) {
  await page.goto(TEST_URL);
  await page.waitForSelector('#setup-view');

  for (const name of playerNames) {
    await page.type('#player-name', name);
    await page.click('#add-player');
  }

  await page.click('#start-game');
  await page.waitForSelector('#game-view', { visible: true });
}

/**
 * Test: Game state persists across page reloads
 */
async function testGameStatePersistence(page) {
  console.log('Testing game state persistence...');

  await setupGame(page, ['Player1', 'Player2', 'Player3']);

  // Play 2 rounds
  for (let i = 0; i < 2; i++) {
    const inputs = await page.$$('.score-input input[type="number"]');
    await inputs[0].type('10');
    await inputs[1].type('15');
    await inputs[2].type('12');
    await page.click('#submit-scores');
    await page.waitForTimeout(200);
  }

  // Should be on round 3
  let roundText = await page.$eval('#current-round', el => el.textContent);
  if (!roundText.includes('3')) {
    throw new Error(`Expected round 3 before reload, got: ${roundText}`);
  }

  // Get scores before reload
  const scoresBefore = await page.$$eval('#score-table tbody tr td:last-child',
    cells => cells.map(cell => cell.textContent.trim())
  );

  // Reload the page
  await page.reload();

  // Should show "Continue Game" option
  const continueButton = await page.waitForSelector('#continue-game', {
    visible: true,
    timeout: 2000
  }).then(() => true).catch(() => false);

  if (!continueButton) {
    throw new Error('Continue game button should be visible');
  }

  // Click continue
  await page.click('#continue-game');
  await page.waitForSelector('#game-view', { visible: true });

  // Verify round is still 3
  roundText = await page.$eval('#current-round', el => el.textContent);
  if (!roundText.includes('3')) {
    throw new Error(`Expected round 3 after reload, got: ${roundText}`);
  }

  // Verify scores are the same
  const scoresAfter = await page.$$eval('#score-table tbody tr td:last-child',
    cells => cells.map(cell => cell.textContent.trim())
  );

  if (JSON.stringify(scoresBefore) !== JSON.stringify(scoresAfter)) {
    throw new Error(`Scores changed after reload: ${scoresBefore} vs ${scoresAfter}`);
  }

  console.log('✓ Game state persistence test passed');
  return true;
}

/**
 * Test: Starting new game clears saved state
 */
async function testNewGameClearsState(page) {
  console.log('Testing new game clears saved state...');

  await setupGame(page, ['Player1', 'Player2']);

  // Play 1 round
  const inputs = await page.$$('.score-input input[type="number"]');
  await inputs[0].type('10');
  await inputs[1].type('15');
  await page.click('#submit-scores');
  await page.waitForTimeout(200);

  // Reload
  await page.reload();

  // Click "New Game" instead of "Continue"
  await page.waitForSelector('#new-game', { visible: true });
  await page.click('#new-game');

  // Should show setup view
  await page.waitForSelector('#setup-view', { visible: true });

  // Game view should be hidden
  const gameHidden = await page.$eval('#game-view',
    el => el.style.display === 'none'
  );

  if (!gameHidden) {
    throw new Error('Game view should be hidden after starting new game');
  }

  // Player list should be empty
  const playerCount = await page.$$eval('#player-list li',
    players => players.length
  );

  if (playerCount !== 0) {
    throw new Error(`Expected 0 players after new game, found ${playerCount}`);
  }

  console.log('✓ New game clears state test passed');
  return true;
}

/**
 * Test: localStorage contains expected data
 */
async function testLocalStorageData(page) {
  console.log('Testing localStorage data structure...');

  await setupGame(page, ['Alice', 'Bob']);

  // Play 1 round
  const inputs = await page.$$('.score-input input[type="number"]');
  await inputs[0].type('10');
  await inputs[1].type('20');
  await page.click('#submit-scores');
  await page.waitForTimeout(200);

  // Check localStorage
  const savedData = await page.evaluate(() => {
    const data = localStorage.getItem('fiveCrownsGame');
    return data ? JSON.parse(data) : null;
  });

  if (!savedData) {
    throw new Error('No data found in localStorage');
  }

  // Verify structure
  if (!savedData.players || !Array.isArray(savedData.players)) {
    throw new Error('savedData should have players array');
  }

  if (!savedData.scores || !Array.isArray(savedData.scores)) {
    throw new Error('savedData should have scores array');
  }

  if (typeof savedData.currentRound !== 'number') {
    throw new Error('savedData should have currentRound number');
  }

  // Verify content
  if (savedData.players.length !== 2) {
    throw new Error(`Expected 2 players in savedData, got ${savedData.players.length}`);
  }

  if (!savedData.players.includes('Alice') || !savedData.players.includes('Bob')) {
    throw new Error('Player names not saved correctly');
  }

  if (savedData.currentRound !== 2) {
    throw new Error(`Expected currentRound to be 2, got ${savedData.currentRound}`);
  }

  console.log('✓ localStorage data structure test passed');
  return true;
}

/**
 * Test: Completed game is saved to history
 */
async function testGameHistory(page) {
  console.log('Testing game history persistence...');

  // Clear history first
  await page.evaluate(() => {
    localStorage.removeItem('fiveCrownsHistory');
  });

  await setupGame(page, ['Player1', 'Player2']);

  // Play all 11 rounds
  for (let round = 1; round <= 11; round++) {
    const inputs = await page.$$('.score-input input[type="number"]');
    await inputs[0].type('5');
    await inputs[1].type('10');
    await page.click('#submit-scores');
    await page.waitForTimeout(100);
  }

  // Wait for winner announcement
  await page.waitForSelector('#winner-announcement', { visible: true, timeout: 2000 });

  // Check that history was saved
  const history = await page.evaluate(() => {
    const data = localStorage.getItem('fiveCrownsHistory');
    return data ? JSON.parse(data) : null;
  });

  if (!history || !Array.isArray(history)) {
    throw new Error('Game history should be saved as array');
  }

  if (history.length !== 1) {
    throw new Error(`Expected 1 game in history, got ${history.length}`);
  }

  const game = history[0];
  if (!game.players || !game.scores || !game.timestamp) {
    throw new Error('Saved game should have players, scores, and timestamp');
  }

  if (game.players.length !== 2) {
    throw new Error(`Expected 2 players in history, got ${game.players.length}`);
  }

  console.log('✓ Game history persistence test passed');
  return true;
}

/**
 * Run all localStorage persistence tests
 */
async function runPersistenceTests(browser) {
  const page = await browser.newPage();
  const results = {
    passed: 0,
    failed: 0,
    errors: []
  };

  try {
    await testGameStatePersistence(page);
    results.passed++;
  } catch (error) {
    results.failed++;
    results.errors.push({ test: 'testGameStatePersistence', error: error.message });
  }

  try {
    await testNewGameClearsState(page);
    results.passed++;
  } catch (error) {
    results.failed++;
    results.errors.push({ test: 'testNewGameClearsState', error: error.message });
  }

  try {
    await testLocalStorageData(page);
    results.passed++;
  } catch (error) {
    results.failed++;
    results.errors.push({ test: 'testLocalStorageData', error: error.message });
  }

  try {
    await testGameHistory(page);
    results.passed++;
  } catch (error) {
    results.failed++;
    results.errors.push({ test: 'testGameHistory', error: error.message });
  }

  await page.close();
  return results;
}

module.exports = { runPersistenceTests };
