#!/bin/bash

echo "🚀 Starting AARAMBH AI Curiosity Platform with Gemini Integration"
echo "================================================================="

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found!"
    echo "📋 Creating .env from example..."
    cp .env.example .env
    echo "✅ .env file created"
    echo "📝 Please edit .env file and add your GEMINI_API_KEY"
    echo "🔗 Get your API key from: https://makersuite.google.com/app/apikey"
    echo ""
    echo "After adding your API key, run this script again."
    exit 1
fi

# Check if Gemini API key is configured
if ! grep -q "GEMINI_API_KEY=AIza" .env; then
    echo "⚠️  Gemini API key not configured in .env file"
    echo "📝 Please edit .env file and add your GEMINI_API_KEY"
    echo "🔗 Get your API key from: https://makersuite.google.com/app/apikey"
    echo "📄 Example: GEMINI_API_KEY=AIzaSyC-your-actual-api-key-here"
    echo ""
    echo "The server will start in fallback mode without AI features."
    read -p "Press Enter to continue or Ctrl+C to exit..."
fi

echo "🔧 Starting Curiosity Gemini Server..."
echo "📡 Server will run on: http://localhost:5001"
echo "🌐 Frontend should connect from: http://localhost:3000"
echo ""
echo "📋 Available endpoints:"
echo "   GET  /api/ai/health - Health check"
echo "   GET  /api/ai/agents - Available agents"
echo "   POST /api/ai/tutor  - AI explanations"
echo "   POST /api/ai/content - Content generation"
echo ""
echo "To stop the server, press Ctrl+C"
echo "================================================================="

# Start the server
node curiosity-gemini-server.js