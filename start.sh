#!/bin/bash

echo "🚀 Starting Rails + React E-commerce Full-Stack Application..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Build and start the application
echo "📦 Building and starting containers..."
docker-compose up --build -d

echo ""
echo "✅ Application is starting up!"
echo ""
echo "🌐 Access your application at:"
echo "   Frontend: http://localhost:3001"
echo "   Backend API: http://localhost:3000"
echo "   Database: localhost:3306"
echo ""
echo "📊 View logs with: docker-compose logs -f"
echo "🛑 Stop the application with: docker-compose down"
echo ""
echo "⏳ Please wait a moment for all services to be ready..." 