.PHONY: help dev test lint validate deploy clean status

# Default target
help:
	@echo "Five Crowns Scorer - Development Makefile"
	@echo ""
	@echo "Available commands:"
	@echo "  make dev        - Start local development server"
	@echo "  make test       - Run syntax validation and checks"
	@echo "  make lint       - Check JavaScript syntax"
	@echo "  make validate   - Validate HTML and file structure"
	@echo "  make deploy     - Deploy to GitHub Pages"
	@echo "  make clean      - Clean temporary files"
	@echo "  make status     - Show git and project status"
	@echo "  make backup     - Create backup of game data"
	@echo ""

# Start local development server
dev:
	@echo "Starting development server on http://localhost:8000"
	@echo "Press Ctrl+C to stop"
	@python3 -m http.server 8000

# Run tests
test: lint validate
	@echo " All tests passed!"

# Lint JavaScript files
lint:
	@echo "Checking JavaScript syntax..."
	@node -c js/storage.js || exit 1
	@node -c js/game.js || exit 1
	@node -c js/ui.js || exit 1
	@node -c js/statistics.js || exit 1
	@node -c js/app.js || exit 1
	@echo " JavaScript syntax OK"

# Validate project structure
validate:
	@echo "Validating project structure..."
	@test -f index.html || (echo " index.html missing" && exit 1)
	@test -f css/styles.css || (echo " css/styles.css missing" && exit 1)
	@test -f js/app.js || (echo " js/app.js missing" && exit 1)
	@test -f js/game.js || (echo " js/game.js missing" && exit 1)
	@test -f js/ui.js || (echo " js/ui.js missing" && exit 1)
	@test -f js/storage.js || (echo " js/storage.js missing" && exit 1)
	@test -f js/statistics.js || (echo " js/statistics.js missing" && exit 1)
	@test -f README.md || (echo " README.md missing" && exit 1)
	@echo " Project structure OK"

# Deploy to GitHub Pages
deploy:
	@echo "Deploying to GitHub Pages..."
	@if [ -n "$$(git status --porcelain)" ]; then \
		echo " Working directory not clean. Commit changes first."; \
		exit 1; \
	fi
	@echo "Running tests before deploy..."
	@make test
	@echo "Pushing to GitHub..."
	@git push origin main
	@echo " Deployed! Your site will be live in a few minutes."
	@echo "  Visit: https://$$(git config --get remote.origin.url | sed 's/.*github.com[:/]\(.*\)\.git/\1/' | sed 's/\// /g' | awk '{print $$1".github.io/"$$2}')"

# Clean temporary files
clean:
	@echo "Cleaning temporary files..."
	@find . -name ".DS_Store" -delete
	@find . -name "*.tmp" -delete
	@find . -name "*.log" -delete
	@echo " Clean complete"

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
	tar -czf "$$BACKUP_FILE" index.html css/ js/ README.md CLAUDE.md; \
	echo " Backup created: $$BACKUP_FILE"

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
	@echo "CSS:"
	@wc -l css/*.css
	@echo "HTML:"
	@wc -l index.html
	@echo "Total:"
	@wc -l css/*.css js/*.js index.html | tail -1
