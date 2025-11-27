/**
 * Puppeteer test suite for Five Crowns Scorer - Score Entry & Game Flow
 * Tests score input, validation, and round progression
 */

const TEST_URL = 'http://localhost:8000/index.html';

/**
 * Helper: Set up a game with players
 */
async function setupGame(page, playerNames = ['Alice', 'Bob', 'Charlie']) {
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
 * Test: Entering scores for a round
 */
async function testScoreEntry(page) {
  console.log('Testing score entry...');

  await setupGame(page);

  // Get score input fields
  const inputCount = await page.$$eval('.score-input input[type="number"]',
    inputs => inputs.length
  );

  if (inputCount !== 3) {
    throw new Error(`Expected 3 score inputs, found ${inputCount}`);
  }

  // Enter scores
  const inputs = await page.$$('.score-input input[type="number"]');
  await inputs[0].type('15');
  await inputs[1].type('23');
  await inputs[2].type('8');

  // Submit scores
  await page.click('#submit-scores');

  // Verify scores appear in table
  const scoreValues = await page.$$eval('#score-table tbody tr td:nth-child(2)',
    cells => cells.map(cell => cell.textContent.trim())
  );

  if (!scoreValues.includes('15') || !scoreValues.includes('23') || !scoreValues.includes('8')) {
    throw new Error(`Scores not recorded correctly: ${scoreValues.join(', ')}`);
  }

  // Verify round advanced to round 2
  const currentRound = await page.$eval('#current-round',
    el => el.textContent
  );

  if (!currentRound.includes('2')) {
    throw new Error(`Should be on round 2, got: ${currentRound}`);
  }

  console.log('✓ Score entry test passed');
  return true;
}

/**
 * Test: Score input validation
 */
async function testScoreValidation(page) {
  console.log('Testing score validation...');

  await setupGame(page, ['Player1', 'Player2']);

  // Try to submit without entering all scores
  const inputs = await page.$$('.score-input input[type="number"]');
  await inputs[0].type('10');
  // Leave second input empty

  await page.click('#submit-scores');

  // Should show error
  const hasError = await page.waitForSelector('#error-message', {
    visible: true,
    timeout: 2000
  }).then(() => true).catch(() => false);

  if (!hasError) {
    throw new Error('Should show error for incomplete scores');
  }

  // Now fill all scores
  await inputs[1].type('20');
  await page.click('#submit-scores');

  // Should proceed to next round
  await page.waitForFunction(
    () => document.querySelector('#current-round').textContent.includes('2'),
    { timeout: 2000 }
  );

  console.log('✓ Score validation test passed');
  return true;
}

/**
 * Test: Complete game flow through all 11 rounds
 */
async function testCompleteGame(page) {
  console.log('Testing complete game flow...');

  await setupGame(page, ['Alice', 'Bob']);

  // Play through all 11 rounds
  for (let round = 1; round <= 11; round++) {
    // Verify current round
    const roundText = await page.$eval('#current-round', el => el.textContent);
    if (!roundText.includes(round.toString())) {
      throw new Error(`Expected round ${round}, got: ${roundText}`);
    }

    // Enter scores
    const inputs = await page.$$('.score-input input[type="number"]');
    await inputs[0].type((round * 5).toString());
    await inputs[1].type((round * 3).toString());

    // Submit
    await page.click('#submit-scores');

    // Wait a bit for UI update
    await page.waitForTimeout(100);
  }

  // Should show winner
  const winnerVisible = await page.waitForSelector('#winner-announcement', {
    visible: true,
    timeout: 2000
  }).then(() => true).catch(() => false);

  if (!winnerVisible) {
    throw new Error('Winner announcement should be visible after 11 rounds');
  }

  // Verify winner is Bob (lower total score)
  const winnerText = await page.$eval('#winner-announcement', el => el.textContent);
  if (!winnerText.includes('Bob')) {
    throw new Error(`Expected Bob to win, got: ${winnerText}`);
  }

  console.log('✓ Complete game test passed');
  return true;
}

/**
 * Test: Total score calculation
 */
async function testScoreCalculation(page) {
  console.log('Testing score calculation...');

  await setupGame(page, ['Player1']);

  // Enter known scores for 3 rounds
  const roundScores = [10, 20, 15];

  for (const score of roundScores) {
    const inputs = await page.$$('.score-input input[type="number"]');
    await inputs[0].type(score.toString());
    await page.click('#submit-scores');
    await page.waitForTimeout(100);
  }

  // Check total score (should be 45)
  const totalScore = await page.$eval('#score-table tbody tr:first-child td:last-child',
    el => parseInt(el.textContent.trim())
  );

  const expectedTotal = roundScores.reduce((a, b) => a + b, 0);
  if (totalScore !== expectedTotal) {
    throw new Error(`Expected total ${expectedTotal}, got ${totalScore}`);
  }

  console.log('✓ Score calculation test passed');
  return true;
}

/**
 * Run all score entry and game flow tests
 */
async function runScoreEntryTests(browser) {
  const page = await browser.newPage();
  const results = {
    passed: 0,
    failed: 0,
    errors: []
  };

  try {
    await testScoreEntry(page);
    results.passed++;
  } catch (error) {
    results.failed++;
    results.errors.push({ test: 'testScoreEntry', error: error.message });
  }

  try {
    await testScoreValidation(page);
    results.passed++;
  } catch (error) {
    results.failed++;
    results.errors.push({ test: 'testScoreValidation', error: error.message });
  }

  try {
    await testCompleteGame(page);
    results.passed++;
  } catch (error) {
    results.failed++;
    results.errors.push({ test: 'testCompleteGame', error: error.message });
  }

  try {
    await testScoreCalculation(page);
    results.passed++;
  } catch (error) {
    results.failed++;
    results.errors.push({ test: 'testScoreCalculation', error: error.message });
  }

  await page.close();
  return results;
}

module.exports = { runScoreEntryTests };
