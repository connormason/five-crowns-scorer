# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a single-file web application for scoring the card game "Five Crowns". The entire application is contained in `scorer.html` - a self-contained HTML file with embedded CSS and JavaScript.

## Architecture

**Single-File Structure**: All code (HTML, CSS, JavaScript) is in `scorer.html`:
- Lines 1-274: HTML structure and CSS styling
- Lines 275-315: HTML layout (setup section, game section with scoreboard)
- Lines 317-541: JavaScript application logic

**Game Logic**:
- Five Crowns has 11 rounds (3-13 cards per round)
- Players accumulate points across rounds (lower is better)
- State management uses three global variables:
  - `players`: Array of player names
  - `scores`: 2D array (players × rounds) of score values
  - `currentRound`: Current round number (1-11)

**Key Functions**:
- `addPlayer()` / `removePlayer()`: Manage player roster during setup
- `startGame()`: Initialize score arrays and transition to game view
- `submitRound()`: Validate and record scores for current round
- `undoLastRound()`: Revert the most recent round
- `updateScoreTable()`: Render the full scoreboard with totals
- `announceWinner()`: Determine and display winner when game completes

## Development

**Running the Application**:
Simply open `scorer.html` in any web browser. No build process or dependencies required.

**Testing Changes**:
After editing, refresh the browser to see changes. No compilation or bundling needed.

**State Management**:
All game state is in-memory only. Refreshing the browser will lose all game data. The application intentionally does not persist data to localStorage or any backend.
