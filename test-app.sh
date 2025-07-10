#!/bin/bash

echo "🧪 Testing E-commerce Full-Stack Application..."
echo ""

# Test database connection
echo "📊 Testing Database Connection..."
if docker-compose exec db mysql -u rails_user -prails_password -e "SELECT 1;" > /dev/null 2>&1; then
    echo "✅ Database is running and accessible"
else
    echo "❌ Database connection failed"
fi

# Test backend API
echo ""
echo "🔧 Testing Backend API..."
if curl -s http://localhost:3000/api/v1/posts > /dev/null 2>&1; then
    echo "✅ Backend API is responding"
    echo "📝 Sample API response:"
    curl -s http://localhost:3000/api/v1/posts | head -c 100
    echo "..."
else
    echo "⏳ Backend API is still starting up..."
fi

# Test frontend
echo ""
echo "🎨 Testing Frontend..."
if curl -s http://localhost:3001 > /dev/null 2>&1; then
    echo "✅ Frontend is accessible"
else
    echo "❌ Frontend is not accessible"
fi

# Show container status
echo ""
echo "🐳 Container Status:"
docker-compose ps

echo ""
echo "📋 Application URLs:"
echo "   Frontend: http://localhost:3001"
echo "   Backend API: http://localhost:3000"
echo "   Database: localhost:3307"
echo ""
echo "🔍 To view logs: docker-compose logs -f [service]"
echo "🛑 To stop: docker-compose down" 