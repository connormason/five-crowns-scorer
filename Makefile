.PHONY: help dev test test-unit test-puppeteer test-e2e setup lint validate deploy clean status install-hooks check-hooks

# Default target
help:
	@echo "Five Crowns Scorer - Development Makefile"
	@echo ""
	@echo "Available commands:"
	@echo "  make dev            - Start local development server"
	@echo "  make test           - Run all tests (lint + validate)"
	@echo "  make test-unit      - Run unit tests in browser"
	@echo "  make test-puppeteer - Run Puppeteer E2E tests (headless)"
	@echo "  make test-e2e       - Alias for test-puppeteer"
	@echo "  make setup          - Install test dependencies"
	@echo "  make lint           - Check JavaScript syntax"
	@echo "  make validate       - Validate HTML and file structure"
	@echo "  make deploy         - Deploy to GitHub Pages"
	@echo "  make clean          - Clean temporary files"
	@echo "  make status         - Show git and project status"
	@echo "  make backup         - Create backup of game data"
	@echo "  make install-hooks  - Install/reinstall Git hooks"
	@echo "  make check-hooks    - Verify Git hooks are installed"
	@echo "  make loc            - Count lines of code"
	@echo ""

# Start local development server
dev:
	@echo "Starting development server on http://localhost:8000"
	@echo "Press Ctrl+C to stop"
	@python3 -m http.server 8000

# Run tests
test: lint validate
	@echo "✓ All tests passed!"
	@echo ""
	@echo "To run unit tests, use: make test-unit"

# Run unit tests in browser
test-unit:
	@echo "Opening unit tests in browser..."
	@echo "Tests will run automatically. Check browser console for details."
	@echo ""
	@echo "Visit: http://localhost:8000/tests/"
	@echo ""
	@python3 -m http.server 8000

# Run Puppeteer E2E tests
test-puppeteer:
	@echo "Running Puppeteer E2E tests..."
	@if [ ! -d "node_modules" ]; then \
		echo "Dependencies not installed. Run 'make setup' first."; \
		exit 1; \
	fi
	@npm run test:puppeteer

# Alias for Puppeteer tests
test-e2e: test-puppeteer

# Install test dependencies
setup:
	@echo "Installing test dependencies..."
	@npm install
	@echo "✓ Setup complete"

# Lint JavaScript files
lint:
	@echo "Checking JavaScript syntax..."
	@node -c js/storage.js || exit 1
	@node -c js/game.js || exit 1
	@node -c js/ui.js || exit 1
	@node -c js/statistics.js || exit 1
	@node -c js/app.js || exit 1
	@echo "✓ JavaScript syntax OK"

# Validate project structure
validate:
	@echo "Validating project structure..."
	@test -f index.html || (echo "✗ index.html missing" && exit 1)
	@test -f css/styles.css || (echo "✗ css/styles.css missing" && exit 1)
	@test -f js/app.js || (echo "✗ js/app.js missing" && exit 1)
	@test -f js/game.js || (echo "✗ js/game.js missing" && exit 1)
	@test -f js/ui.js || (echo "✗ js/ui.js missing" && exit 1)
	@test -f js/storage.js || (echo "✗ js/storage.js missing" && exit 1)
	@test -f js/statistics.js || (echo "✗ js/statistics.js missing" && exit 1)
	@test -f README.md || (echo "✗ README.md missing" && exit 1)
	@test -d tests || (echo "✗ tests directory missing" && exit 1)
	@test -f tests/test-framework.js || (echo "✗ test framework missing" && exit 1)
	@echo "✓ Project structure OK"

# Deploy to GitHub Pages
deploy:
	@echo "Deploying to GitHub Pages..."
	@if [ -n "$$(git status --porcelain)" ]; then \
		echo "✗ Working directory not clean. Commit changes first."; \
		exit 1; \
	fi
	@echo "Running tests before deploy..."
	@make test
	@echo "Pushing to GitHub..."
	@git push origin main
	@echo "✓ Deployed! Your site will be live in a few minutes."
	@echo "  Visit: https://$$(git config --get remote.origin.url | sed 's/.*github.com[:/]\(.*\)\.git/\1/' | sed 's/\// /g' | awk '{print $$1".github.io/"$$2}')"

# Clean temporary files
clean:
	@echo "Cleaning temporary files..."
	@find . -name ".DS_Store" -delete
	@find . -name "*.tmp" -delete
	@find . -name "*.log" -delete
	@rm -f .server.pid
	@echo "✓ Clean complete"

# Show project status
status:
	@echo "=== Project Status ==="
	@echo ""
	@echo "Git Status:"
	@git status --short
	@echo ""
	@echo "Recent Commits:"
	@git log --oneline -5
	@echo ""
	@echo "File Statistics:"
	@wc -l css/*.css js/*.js index.html | tail -1
	@echo ""
	@echo "Last Modified:"
	@ls -lt css/*.css js/*.js index.html | head -5

# Create backup of data files
backup:
	@echo "Creating backup..."
	@mkdir -p backups
	@BACKUP_FILE="backups/five-crowns-backup-$$(date +%Y%m%d-%H%M%S).tar.gz"; \
	tar -czf "$$BACKUP_FILE" index.html css/ js/ tests/ README.md CLAUDE.md; \
	echo "✓ Backup created: $$BACKUP_FILE"

# Quick commit and push (use with care)
quick-push:
	@read -p "Commit message: " msg; \
	git add .; \
	git commit -m "$$msg"; \
	git push origin main

# Count lines of code
loc:
	@echo "Lines of Code:"
	@echo "JavaScript:"
	@wc -l js/*.js | tail -1
	@echo "Tests:"
	@wc -l tests/*.js | tail -1
	@echo "CSS:"
	@wc -l css/*.css
	@echo "HTML:"
	@wc -l index.html
	@echo "Total:"
	@wc -l css/*.css js/*.js tests/*.js index.html | tail -1

# Install Git hooks
install-hooks:
	@echo "Installing Git hooks..."
	@chmod +x .git/hooks/pre-commit 2>/dev/null || echo "⚠️  pre-commit hook not found"
	@chmod +x .git/hooks/pre-push 2>/dev/null || echo "⚠️  pre-push hook not found"
	@chmod +x .git/hooks/commit-msg 2>/dev/null || echo "⚠️  commit-msg hook not found"
	@if [ -f .git/hooks/pre-commit ] && [ -f .git/hooks/pre-push ] && [ -f .git/hooks/commit-msg ]; then \
		echo "✓ Git hooks installed and executable"; \
		echo ""; \
		echo "Installed hooks:"; \
		echo "  • pre-commit  - Runs lint, validate, and optional E2E tests"; \
		echo "  • pre-push    - Runs full test suite before pushing"; \
		echo "  • commit-msg  - Validates commit message quality"; \
		echo ""; \
		echo "See .githooks-README.md for details"; \
	else \
		echo "✗ Some hooks are missing. Please ensure hooks are in .git/hooks/"; \
		exit 1; \
	fi

# Check if Git hooks are installed and working
check-hooks:
	@echo "Checking Git hooks status..."
	@echo ""
	@if [ -x .git/hooks/pre-commit ]; then \
		echo "✓ pre-commit hook installed and executable"; \
	else \
		echo "✗ pre-commit hook missing or not executable"; \
	fi
	@if [ -x .git/hooks/pre-push ]; then \
		echo "✓ pre-push hook installed and executable"; \
	else \
		echo "✗ pre-push hook missing or not executable"; \
	fi
	@if [ -x .git/hooks/commit-msg ]; then \
		echo "✓ commit-msg hook installed and executable"; \
	else \
		echo "✗ commit-msg hook missing or not executable"; \
	fi
	@echo ""
	@echo "To install hooks, run: make install-hooks"
