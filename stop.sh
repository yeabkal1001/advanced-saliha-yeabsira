#!/bin/bash

echo "🛑 Stopping Rails + React Full-Stack Application..."
echo ""

# Stop and remove containers
docker-compose down

echo ""
echo "✅ Application stopped successfully!"
echo ""
echo "🧹 To remove all data (including database), run: docker-compose down -v" 