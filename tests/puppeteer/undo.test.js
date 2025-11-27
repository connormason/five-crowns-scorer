/**
 * Puppeteer test suite for Five Crowns Scorer - Undo Functionality
 * Tests undo last round and game state restoration
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
 * Test: Undo button appears after first round
 */
async function testUndoButtonAppearance(page) {
  console.log('Testing undo button appearance...');

  await setupGame(page);

  // Initially, undo button should not be visible (round 1, no scores submitted)
  const undoButton = await page.$('#undo-round');
  const initiallyHidden = await undoButton.evaluate(el => el.style.display === 'none');

  if (!initiallyHidden) {
    throw new Error('Undo button should be hidden initially');
  }

  // Submit scores for round 1
  const inputs = await page.$$('.score-input input[type="number"]');
  await inputs[0].type('10');
  await inputs[1].type('15');
  await page.click('#submit-scores');

  // Wait for round 2
  await page.waitForFunction(
    () => document.querySelector('#current-round').textContent.includes('2'),
    { timeout: 2000 }
  );

  // Now undo button should be visible
  const nowVisible = await undoButton.evaluate(el => el.style.display !== 'none');

  if (!nowVisible) {
    throw new Error('Undo button should be visible after submitting scores');
  }

  console.log('✓ Undo button appearance test passed');
  return true;
}

/**
 * Test: Undo last round restores game state
 */
async function testUndoRound(page) {
  console.log('Testing undo round functionality...');

  await setupGame(page, ['Player1', 'Player2']);

  // Submit scores for round 1
  let inputs = await page.$$('.score-input input[type="number"]');
  await inputs[0].type('10');
  await inputs[1].type('20');
  await page.click('#submit-scores');

  // Wait for round 2
  await page.waitForFunction(
    () => document.querySelector('#current-round').textContent.includes('2'),
    { timeout: 2000 }
  );

  // Submit scores for round 2
  inputs = await page.$$('.score-input input[type="number"]');
  await inputs[0].type('15');
  await inputs[1].type('25');
  await page.click('#submit-scores');

  // Wait for round 3
  await page.waitForFunction(
    () => document.querySelector('#current-round').textContent.includes('3'),
    { timeout: 2000 }
  );

  // Check totals before undo (should be 25 and 45)
  let totals = await page.$$eval('#score-table tbody tr td:last-child',
    cells => cells.map(cell => parseInt(cell.textContent.trim()))
  );

  if (totals[0] !== 25 || totals[1] !== 45) {
    throw new Error(`Expected totals [25, 45], got [${totals.join(', ')}]`);
  }

  // Click undo
  await page.click('#undo-round');

  // Should be back to round 2
  await page.waitForFunction(
    () => document.querySelector('#current-round').textContent.includes('2'),
    { timeout: 2000 }
  );

  // Check totals after undo (should be 10 and 20 - only round 1 scores)
  totals = await page.$$eval('#score-table tbody tr td:last-child',
    cells => cells.map(cell => parseInt(cell.textContent.trim()))
  );

  if (totals[0] !== 10 || totals[1] !== 20) {
    throw new Error(`Expected totals [10, 20] after undo, got [${totals.join(', ')}]`);
  }

  console.log('✓ Undo round test passed');
  return true;
}

/**
 * Test: Multiple undos
 */
async function testMultipleUndos(page) {
  console.log('Testing multiple undos...');

  await setupGame(page, ['Player1']);

  // Play 3 rounds
  for (let i = 0; i < 3; i++) {
    const inputs = await page.$$('.score-input input[type="number"]');
    await inputs[0].type('10');
    await page.click('#submit-scores');
    await page.waitForTimeout(100);
  }

  // Should be on round 4
  let roundText = await page.$eval('#current-round', el => el.textContent);
  if (!roundText.includes('4')) {
    throw new Error(`Expected round 4, got: ${roundText}`);
  }

  // Undo back to round 1
  for (let i = 0; i < 3; i++) {
    await page.click('#undo-round');
    await page.waitForTimeout(100);
  }

  // Should be back to round 1
  roundText = await page.$eval('#current-round', el => el.textContent);
  if (!roundText.includes('1')) {
    throw new Error(`Expected round 1 after undos, got: ${roundText}`);
  }

  // Total should be 0
  const total = await page.$eval('#score-table tbody tr td:last-child',
    el => parseInt(el.textContent.trim())
  );

  if (total !== 0) {
    throw new Error(`Expected total 0 after undoing all rounds, got ${total}`);
  }

  // Undo button should be hidden now
  const undoButton = await page.$('#undo-round');
  const hidden = await undoButton.evaluate(el => el.style.display === 'none');

  if (!hidden) {
    throw new Error('Undo button should be hidden when no rounds completed');
  }

  console.log('✓ Multiple undos test passed');
  return true;
}

/**
 * Test: Undo after game completion
 */
async function testUndoAfterCompletion(page) {
  console.log('Testing undo after game completion...');

  await setupGame(page, ['Player1', 'Player2']);

  // Play all 11 rounds
  for (let round = 1; round <= 11; round++) {
    const inputs = await page.$$('.score-input input[type="number"]');
    await inputs[0].type('5');
    await inputs[1].type('10');
    await page.click('#submit-scores');
    await page.waitForTimeout(100);
  }

  // Winner should be announced
  await page.waitForSelector('#winner-announcement', {
    visible: true,
    timeout: 2000
  });

  // Undo the last round
  await page.click('#undo-round');

  // Winner announcement should be hidden
  const winnerHidden = await page.$eval('#winner-announcement',
    el => el.style.display === 'none'
  );

  if (!winnerHidden) {
    throw new Error('Winner announcement should be hidden after undo');
  }

  // Should be back to round 11
  const roundText = await page.$eval('#current-round', el => el.textContent);
  if (!roundText.includes('11')) {
    throw new Error(`Expected round 11 after undo, got: ${roundText}`);
  }

  console.log('✓ Undo after completion test passed');
  return true;
}

/**
 * Run all undo functionality tests
 */
async function runUndoTests(browser) {
  const page = await browser.newPage();
  const results = {
    passed: 0,
    failed: 0,
    errors: []
  };

  try {
    await testUndoButtonAppearance(page);
    results.passed++;
  } catch (error) {
    results.failed++;
    results.errors.push({ test: 'testUndoButtonAppearance', error: error.message });
  }

  try {
    await testUndoRound(page);
    results.passed++;
  } catch (error) {
    results.failed++;
    results.errors.push({ test: 'testUndoRound', error: error.message });
  }

  try {
    await testMultipleUndos(page);
    results.passed++;
  } catch (error) {
    results.failed++;
    results.errors.push({ test: 'testMultipleUndos', error: error.message });
  }

  try {
    await testUndoAfterCompletion(page);
    results.passed++;
  } catch (error) {
    results.failed++;
    results.errors.push({ test: 'testUndoAfterCompletion', error: error.message });
  }

  await page.close();
  return results;
}

module.exports = { runUndoTests };
