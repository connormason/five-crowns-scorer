# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a production-ready web application for scoring the card game "Five Crowns". The application has been refactored from a single-file prototype into a modular, maintainable codebase suitable for GitHub Pages deployment.

## Architecture

**Modular Structure**: The application follows a clean separation of concerns:

```
five-crowns-scorer/
├── index.html          # Main HTML structure
├── css/
│   └── styles.css     # All styling
├── js/
│   ├── app.js         # Application entry point and event handlers
│   ├── game.js        # Game state management (Game class)
│   ├── ui.js          # UI rendering (UI class)
│   └── storage.js     # localStorage persistence (Storage module)
└── scorer.html        # Legacy single-file version (for reference)
```

**Game Logic** (js/game.js):
- Five Crowns has 11 rounds (3-13 cards per round)
- Players accumulate points across rounds (lower is better)
- `Game` class manages all state:
  - `players`: Array of player names
  - `scores`: 2D array (players × rounds) of score values
  - `currentRound`: Current round number (1-11)
- Methods: `addPlayer()`, `removePlayer()`, `submitRound()`, `undoLastRound()`, etc.
- State persistence via `saveState()` and `loadState()`

**UI Management** (js/ui.js):
- `UI` class handles all DOM manipulation
- Methods: `updateScoreTable()`, `updateScoreInputs()`, `updatePlayerList()`, etc.
- XSS protection through HTML escaping
- Separation of rendering logic from game logic

**Data Persistence** (js/storage.js):
- `Storage` module provides localStorage interface
- Methods: `save()`, `load()`, `clear()`, `hasSavedGame()`
- Automatic game state persistence
- Users can continue interrupted games

**Application Entry** (js/app.js):
- `FiveCrownsApp` class coordinates everything
- Integrates Game, UI, and Statistics modules
- Event delegation for dynamic elements
- Handles user interactions and error messages
- Checks for saved games on startup
- Export/import functionality
- Dark mode support

**Statistics & History** (js/statistics.js):
- Tracks completed games (last 50)
- Player statistics (wins, win rate, scores)
- Overall game statistics
- Export/import game history
- localStorage persistence

## Development

**Running the Application**:
```bash
make dev  # Start local server at http://localhost:8000
```
Or open `index.html` in any modern browser with ES6 module support. No build process or dependencies required.

**Testing Changes**:
```bash
make test      # Run all tests
make lint      # Check JavaScript syntax
make validate  # Verify project structure
```

**Deployment**:
```bash
make deploy  # Deploy to GitHub Pages
```

**State Management**:
Game state is automatically saved to localStorage after each action. Users can close/refresh the browser and continue their game. Completed games are saved to history automatically.

## Key Classes and Methods

**Game Class** (js/game.js):
- `startNewGame(playerNames)`: Initialize new game
- `addPlayer(name)` / `removePlayer(index)`: Player management
- `submitRound(roundScores)`: Record scores and advance
- `undoLastRound()`: Revert last round
- `getWinner()`: Determine winner when complete
- `saveState()` / `loadState()`: Persistence
- `exportState()`: Get game state as JSON

**UI Class** (js/ui.js):
- `showSetup()` / `showGame()`: View transitions
- `updateScoreTable()`: Render scoreboard
- `updateScoreInputs()`: Render input fields
- `updatePlayerList()`: Render player roster
- `announceWinner(winner)`: Display winner
- `getScoreInputs()`: Collect scores from form

**Storage Module** (js/storage.js):
- `save(gameState)`: Save to localStorage
- `load()`: Load from localStorage
- `clear()`: Remove saved data
- `hasSavedGame()`: Check for existing save

**Statistics Class** (js/statistics.js):
- `saveGame(gameState)`: Save completed game to history
- `getHistory()`: Get all game records
- `getPlayerStats(playerName)`: Get stats for specific player
- `getAllPlayers()`: Get unique player names
- `getOverallStats()`: Get aggregate statistics
- `getRecentGames(limit)`: Get recent games
- `exportHistory()`: Export history as JSON
- `importHistory(jsonData)`: Import history from JSON

**UI Class** (js/ui.js):
- `toggleTheme()`: Switch between light/dark mode
- `showStats()`: Display statistics view
- `updateStatsView()`: Render statistics data
- `showImportModal()` / `hideImportModal()`: Control import dialog
- `downloadJSON(data, filename)`: Trigger file download

## New Features (Added)

**Dark Mode**:
- CSS variables for theming
- Toggle button in header
- Preference saved to localStorage
- Smooth transitions

**Statistics & History**:
- Automatic game history tracking (last 50 games)
- Per-player statistics (wins, win rate, average score)
- Overall statistics (best player, total games)
- Recent game history view

**Export/Import**:
- Export game as JSON file
- Import previously exported games
- Data validation on import
- Versioned export format

**Makefile**:
- `make dev`: Start local server
- `make test`: Run tests
- `make deploy`: Deploy to GitHub Pages
- `make lint`, `make validate`, `make clean`, etc.

## Extensibility

The modular architecture makes it easy to:
- Add new game features (modify Game class)
- Customize UI/styling (edit styles.css or UI class)
- Add export formats (extend Storage module)
- Implement game history or statistics
- Add multiplayer or sharing features

## GitHub Pages Deployment

The application is configured for GitHub Pages:
1. All assets use relative paths
2. No build process required
3. ES6 modules work natively
4. Simply push to main branch to deploy

**Configuration**: Repository Settings → Pages → Source: main branch / (root)
