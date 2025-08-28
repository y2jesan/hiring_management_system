#!/bin/bash

echo "🚀 Starting Hiring Management System Server..."

# Check if MongoDB is running (optional)
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  Warning: MongoDB might not be running. Make sure MongoDB is started."
fi

# Navigate to server directory
cd server

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing server dependencies..."
    npm install
fi

# Check if client dist folder exists
if [ ! -d "../client/dist" ]; then
    echo "📦 Building client application..."
    cd ../client
    npm install
    npm run build
    cd ../server
fi

# Start the server
echo "🌐 Starting server on port 4000..."
echo "📱 Frontend will be available at: http://localhost:4000"
echo "🔌 API endpoints will be available at: http://localhost:4000/api"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm start
