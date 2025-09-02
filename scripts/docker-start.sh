#!/bin/bash

# FastAPI + Next.js Full-Stack Docker Starter
# This script starts the entire application stack

set -e

echo "🚀 Starting FastAPI + Next.js Full-Stack Application..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f vibe.yaml down 2>/dev/null || true

# Start the stack
echo "🔧 Starting services..."
docker-compose -f vibe.yaml up -d

# Wait for database to be ready
echo "🗄️  Waiting for PostgreSQL database..."
until docker-compose -f vibe.yaml exec -T postgres pg_isready -U postgres > /dev/null 2>&1; do
    echo "   Database not ready yet, waiting..."
    sleep 2
done
echo "✅ PostgreSQL database is ready!"

# Wait for backend to be ready
echo "🔧 Waiting for FastAPI backend..."
until curl -f http://localhost:9000/health > /dev/null 2>&1; do
    echo "   Backend not ready yet, waiting..."
    sleep 5
done
echo "✅ FastAPI backend is ready!"

# Wait for frontend to be ready
echo "🎨 Waiting for Next.js frontend..."
until curl -f http://localhost:3000 > /dev/null 2>&1; do
    echo "   Frontend not ready yet, waiting..."
    sleep 5
done
echo "✅ Next.js frontend is ready!"

echo ""
echo "🎉 All services are running!"
echo ""
echo "📊 Service Status:"
echo "   🌐 Frontend: http://localhost:3000"
echo "   🔧 Backend: http://localhost:9000"
echo "   📚 API Docs: http://localhost:9000/docs"
echo "   🗄️  Database: localhost:5432"
echo ""
echo "📝 Useful Commands:"
echo "   View logs: docker-compose -f vibe.yaml logs -f"
echo "   Stop services: docker-compose -f vibe.yaml down"
echo "   Restart: ./scripts/docker-start.sh"
echo ""
echo "🔍 Checking container status..."
docker-compose -f vibe.yaml ps
