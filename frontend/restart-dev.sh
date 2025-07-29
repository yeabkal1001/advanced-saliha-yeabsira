#!/bin/bash

echo "🔄 Restarting Development Environment..."

# Clear caches
echo "🧹 Clearing caches..."
rm -rf node_modules/.cache
rm -f tsconfig.tsbuildinfo

# Kill any existing processes
echo "🛑 Stopping existing processes..."
pkill -f "vite" || true
pkill -f "npm run dev" || true

# Wait a moment
sleep 2

# Start fresh
echo "🚀 Starting development server..."
npm run dev

echo "✅ Development environment restarted!" 