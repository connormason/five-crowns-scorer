**NOTE**: using this as a Claude Code playground

# Five Crowns Scorer

A modern, feature-rich web application for scoring the card game Five Crowns. 
Built with vanilla JavaScript, CSS, and HTML - no frameworks or build tools required.

## Features

### Core Functionality
- **Player Management**: Add and remove players during setup
- **11-Round Scoring**: Track all 11 rounds with automatic totaling
- **Game State Persistence**: Automatically saves game progress to localStorage
- **Winner Detection**: Automatically highlights the winner when the game completes
- **Undo Functionality**: Easily undo the last round if mistakes were made

### Advanced Features
- **🌙 Dark Mode**: Toggle between light and dark themes (preference saved)
- **📊 Game History**: View statistics and history of all completed games (last 50 games)
- **👤 Player Statistics**: Track wins, win rate, average scores, best/worst scores per player
- **💾 Export/Import**: Save games as JSON files and import them later
- **📱 Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **🔧 Production-Ready**: Modular, maintainable code structure with clear separation of concerns

## Quick Start

### Using Makefile (Recommended)

```bash
# Start development server
make dev

# Run tests
make test

# Deploy to GitHub Pages
make deploy

# See all commands
make help
```

### Manual Setup

1. Clone or download this repository
2. Open `index.html` in any modern web browser
3. Start playing!

### GitHub Pages

Visit the live application at: `https://[your-username].github.io/five-crowns-scorer/`

## Project Structure

```
five-crowns-scorer/
├── index.html          # Main HTML structure
├── css/
│   └── styles.css     # All styling with dark mode (CSS variables)
├── js/
│   ├── app.js         # Main application and event handlers
│   ├── game.js        # Game state management and business logic
│   ├── ui.js          # UI rendering and DOM manipulation
│   ├── storage.js     # localStorage persistence layer
│   └── statistics.js  # Game history and player statistics
├── Makefile           # Development and deployment commands
├── scorer.html        # Legacy single-file version (for reference)
├── README.md          # This file
├── CLAUDE.md          # Developer instructions for Claude Code
└── DEPLOYMENT.md      # GitHub Pages deployment guide
```

## Usage Guide

### Starting a Game

1. Enter player names one at a time and click "Add"
2. Add at least 2 players (no maximum limit)
3. Click "Start Game" when all players are added

### During the Game

1. Enter scores for each player after completing a round
2. Click "Submit Round" to save scores and move to the next round
3. Use "Undo Last" if you need to correct the previous round
4. The scoreboard updates automatically with running totals
5. Access Export, Import, and Stats features from the menu buttons

### Viewing Statistics

Click the "📊 Stats" button to view:
- Overall statistics (total games, unique players, best player)
- Individual player statistics (games played, wins, win rate, scores)
- Recent game history with winners and dates

### Exporting & Importing Games

- **Export**: Click "💾 Export" to download current game as JSON
- **Import**: Click "📁 Import", select a previously exported JSON file

### Dark Mode

Click the 🌙/☀️ button in the top-right corner to toggle dark mode. Your preference is automatically saved.

## Development

### Prerequisites

- Modern web browser with ES6 module support
- Python 3 (for local development server via Makefile)
- Node.js (for JavaScript syntax checking via Makefile)

### Local Development

```bash
# Start development server on http://localhost:8000
make dev

# Or manually
python3 -m http.server 8000
```

### Testing

```bash
# Run all tests (lint + validation)
make test

# Check JavaScript syntax only
make lint

# Validate project structure only
make validate
```

### Code Organization

**JavaScript Modules:**
- `app.js` (295 lines): Application coordinator, event handling
- `game.js` (280 lines): Core game logic and state management
- `ui.js` (363 lines): DOM manipulation and rendering
- `statistics.js` (265 lines): Game history and player stats
- `storage.js` (57 lines): localStorage abstraction

**Styling:**
- `styles.css` (508 lines): Complete styling with CSS variables for theming

**Total:** ~1,871 lines of code

### Architecture

The application follows these design principles:

1. **Separation of Concerns**: Each module has a single, well-defined responsibility
2. **No Dependencies**: Pure vanilla JavaScript, no frameworks or libraries
3. **ES6 Modules**: Native browser module system for clean imports
4. **CSS Variables**: Dynamic theming without JavaScript manipulation
5. **LocalStorage**: Client-side persistence for game state and history
6. **Progressive Enhancement**: Works without JavaScript for basic HTML

## Key Features Explained

### Game History & Statistics

Completed games are automatically saved to localStorage (last 50 games). Statistics include:

- **Overall Stats**: Total games, unique players, best player by win rate
- **Player Stats**: Games played, wins/losses, win rate, average/best/worst scores
- **Game History**: Recent games with winners, scores, and dates

### Export/Import Format

Games are exported as JSON with this structure:

```json
{
  "version": "1.0",
  "exportDate": "2024-01-15T10:30:00.000Z",
  "game": {
    "players": ["Player 1", "Player 2"],
    "scores": [[...], [...]],
    "currentRound": 5,
    "maxRounds": 11,
    "roundCards": [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
  }
}
```

### Dark Mode Implementation

Uses CSS custom properties for theme switching:

- `data-theme` attribute on `<html>` element
- CSS variables for all colors
- localStorage persistence
- Smooth transitions between themes

## Makefile Commands

```bash
make dev        # Start local development server
make test       # Run all tests and validations
make lint       # Check JavaScript syntax
make validate   # Validate project structure
make deploy     # Deploy to GitHub Pages
make clean      # Remove temporary files
make status     # Show git and project status
make backup     # Create backup tarball
make loc        # Count lines of code
make help       # Show all available commands
```

## Deployment

### GitHub Pages Deployment

1. Ensure all changes are committed
2. Run `make deploy` (or manually push to main branch)
3. Enable GitHub Pages in repository settings:
   - Settings → Pages → Source: `main` / `(root)`
4. Visit your site at `https://[username].github.io/[repository-name]/`

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

### Browser Support

Requires a modern browser with ES6 module support:
- Chrome/Edge 61+
- Firefox 60+
- Safari 11+
- iOS Safari 11+

## Extensibility

The modular architecture makes it easy to add:

- **New Game Modes**: Extend `Game` class with variants
- **Advanced Statistics**: Add new metrics to `Statistics` class
- **Themes**: Add more theme options via CSS variables
- **Export Formats**: Support CSV, PDF, or other formats
- **Multiplayer**: Add real-time sync via WebSockets
- **Achievements**: Track milestones and player achievements

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`make test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Development Guidelines

- Keep the code modular and maintainable
- Add JSDoc comments for new functions
- Test on multiple browsers and devices
- Follow the existing code style
- Update documentation as needed
- Use the Makefile for common tasks

## License

This project is open source and available under the MIT License.

## Game Rules Reference

Five Crowns has 11 rounds:
- Round 1: 3 cards each
- Round 2: 4 cards each
- ...
- Round 11: 13 cards each

Points are accumulated across all rounds. The player with the lowest total score wins.

## Acknowledgments

- Built for Five Crowns, a card game by Set Enterprises
- Designed with modern web standards and best practices
- Optimized for GitHub Pages deployment
- No external dependencies or frameworks

---

**Made with ❤️ for Five Crowns players everywhere**

For questions or issues, please open an issue on GitHub.
