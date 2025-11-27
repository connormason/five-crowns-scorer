#!/bin/bash
# Run Puppeteer tests with automatic server management

set -e

echo "🎮 Five Crowns Scorer - E2E Test Runner"
echo "========================================"

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start dev server in background
echo "🚀 Starting development server..."
python3 -m http.server 8000 > /dev/null 2>&1 &
SERVER_PID=$!

# Wait for server to be ready
echo "⏳ Waiting for server to start..."
sleep 3

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping development server..."
    kill $SERVER_PID 2>/dev/null || true
}

# Register cleanup function
trap cleanup EXIT INT TERM

# Check if server is running
if ! curl -s http://localhost:8000 > /dev/null; then
    echo "❌ Server failed to start"
    exit 1
fi

echo "✓ Server ready on http://localhost:8000"
echo ""

# Run tests
echo "🧪 Running Puppeteer tests..."
echo ""

if npm run test:puppeteer; then
    echo ""
    echo "✅ All tests passed!"
    exit 0
else
    echo ""
    echo "❌ Some tests failed"
    exit 1
fi
