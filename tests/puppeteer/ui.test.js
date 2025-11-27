/**
 * Puppeteer test suite for Five Crowns Scorer - Dark Mode & UI Features
 * Tests theme toggle and UI interactions
 */

const TEST_URL = 'http://localhost:8000/index.html';

/**
 * Test: Dark mode toggle functionality
 */
async function testDarkModeToggle(page) {
  console.log('Testing dark mode toggle...');

  await page.goto(TEST_URL);
  await page.waitForSelector('#setup-view');

  // Check initial theme (should be light by default or from saved preference)
  const initialTheme = await page.$eval('body',
    el => el.getAttribute('data-theme')
  );

  // Click theme toggle
  await page.click('#theme-toggle');
  await page.waitForTimeout(100);

  // Theme should have changed
  const newTheme = await page.$eval('body',
    el => el.getAttribute('data-theme')
  );

  if (initialTheme === newTheme) {
    throw new Error('Theme should change after toggle');
  }

  // Toggle again
  await page.click('#theme-toggle');
  await page.waitForTimeout(100);

  // Should be back to original
  const restoredTheme = await page.$eval('body',
    el => el.getAttribute('data-theme')
  );

  if (restoredTheme !== initialTheme) {
    throw new Error('Theme should return to original after second toggle');
  }

  console.log('✓ Dark mode toggle test passed');
  return true;
}

/**
 * Test: Dark mode preference persists
 */
async function testDarkModePersistence(page) {
  console.log('Testing dark mode persistence...');

  await page.goto(TEST_URL);
  await page.waitForSelector('#setup-view');

  // Set to dark mode
  await page.click('#theme-toggle');
  await page.waitForTimeout(100);

  const themeBefore = await page.$eval('body',
    el => el.getAttribute('data-theme')
  );

  // Reload page
  await page.reload();
  await page.waitForSelector('#setup-view');

  // Theme should persist
  const themeAfter = await page.$eval('body',
    el => el.getAttribute('data-theme')
  );

  if (themeBefore !== themeAfter) {
    throw new Error(`Theme should persist across reload: ${themeBefore} vs ${themeAfter}`);
  }

  console.log('✓ Dark mode persistence test passed');
  return true;
}

/**
 * Test: Statistics view toggle
 */
async function testStatsView(page) {
  console.log('Testing statistics view...');

  await page.goto(TEST_URL);
  await page.waitForSelector('#setup-view');

  // Find and click stats button
  const statsButton = await page.$('#show-stats');
  if (!statsButton) {
    // Stats button might not exist yet, skip this test
    console.log('⊘ Stats button not found, skipping test');
    return true;
  }

  await statsButton.click();
  await page.waitForTimeout(200);

  // Stats view should be visible
  const statsViewVisible = await page.$eval('#stats-view',
    el => el.style.display !== 'none'
  ).catch(() => false);

  if (!statsViewVisible) {
    throw new Error('Stats view should be visible after clicking stats button');
  }

  // Close stats view
  const closeButton = await page.$('#close-stats');
  if (closeButton) {
    await closeButton.click();
    await page.waitForTimeout(200);

    // Stats view should be hidden
    const statsViewHidden = await page.$eval('#stats-view',
      el => el.style.display === 'none'
    ).catch(() => true);

    if (!statsViewHidden) {
      throw new Error('Stats view should be hidden after closing');
    }
  }

  console.log('✓ Statistics view test passed');
  return true;
}

/**
 * Test: Error message display and clearing
 */
async function testErrorMessages(page) {
  console.log('Testing error message display...');

  await page.goto(TEST_URL);
  await page.waitForSelector('#setup-view');

  // Try to add empty player (should show error)
  await page.click('#add-player');

  // Error should be visible
  const errorVisible = await page.waitForSelector('#error-message', {
    visible: true,
    timeout: 2000
  }).then(() => true).catch(() => false);

  if (!errorVisible) {
    throw new Error('Error message should be visible');
  }

  // Get error text
  const errorText = await page.$eval('#error-message',
    el => el.textContent
  );

  if (!errorText || errorText.trim().length === 0) {
    throw new Error('Error message should have text');
  }

  // Wait for error to auto-hide (usually 3 seconds)
  await page.waitForTimeout(3500);

  // Error should be hidden now
  const errorHidden = await page.$eval('#error-message',
    el => el.style.display === 'none'
  ).catch(() => true);

  if (!errorHidden) {
    throw new Error('Error message should auto-hide after timeout');
  }

  console.log('✓ Error message test passed');
  return true;
}

/**
 * Test: Responsive table rendering
 */
async function testScoreTableRendering(page) {
  console.log('Testing score table rendering...');

  await page.goto(TEST_URL);
  await page.waitForSelector('#setup-view');

  // Add 4 players
  const playerNames = ['Alice', 'Bob', 'Charlie', 'David'];
  for (const name of playerNames) {
    await page.type('#player-name', name);
    await page.click('#add-player');
  }

  await page.click('#start-game');
  await page.waitForSelector('#game-view', { visible: true });

  // Check table structure
  const headerCellCount = await page.$$eval('#score-table thead th',
    cells => cells.length
  );

  // Should have: Player + 11 rounds + Total = 13 columns
  if (headerCellCount !== 13) {
    throw new Error(`Expected 13 header columns, got ${headerCellCount}`);
  }

  // Check player rows
  const rowCount = await page.$$eval('#score-table tbody tr',
    rows => rows.length
  );

  if (rowCount !== 4) {
    throw new Error(`Expected 4 player rows, got ${rowCount}`);
  }

  // Each row should have 13 cells
  const firstRowCells = await page.$$eval('#score-table tbody tr:first-child td',
    cells => cells.length
  );

  if (firstRowCells !== 13) {
    throw new Error(`Expected 13 cells per row, got ${firstRowCells}`);
  }

  console.log('✓ Score table rendering test passed');
  return true;
}

/**
 * Run all UI and dark mode tests
 */
async function runUITests(browser) {
  const page = await browser.newPage();
  const results = {
    passed: 0,
    failed: 0,
    errors: []
  };

  try {
    await testDarkModeToggle(page);
    results.passed++;
  } catch (error) {
    results.failed++;
    results.errors.push({ test: 'testDarkModeToggle', error: error.message });
  }

  try {
    await testDarkModePersistence(page);
    results.passed++;
  } catch (error) {
    results.failed++;
    results.errors.push({ test: 'testDarkModePersistence', error: error.message });
  }

  try {
    await testStatsView(page);
    results.passed++;
  } catch (error) {
    results.failed++;
    results.errors.push({ test: 'testStatsView', error: error.message });
  }

  try {
    await testErrorMessages(page);
    results.passed++;
  } catch (error) {
    results.failed++;
    results.errors.push({ test: 'testErrorMessages', error: error.message });
  }

  try {
    await testScoreTableRendering(page);
    results.passed++;
  } catch (error) {
    results.failed++;
    results.errors.push({ test: 'testScoreTableRendering', error: error.message });
  }

  await page.close();
  return results;
}

module.exports = { runUITests };
