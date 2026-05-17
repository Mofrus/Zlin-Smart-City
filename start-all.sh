#!/bin/bash

# Function to handle exit and kill all background processes
cleanup() {
    echo ""
    echo "Stopping all services..."
    # Kill all background jobs started by this script
    kill $(jobs -p) 2>/dev/null
    exit
}

# Trap Ctrl+C (SIGINT) and other termination signals
trap cleanup SIGINT SIGTERM EXIT

echo "🚀 Starting Zlin Smart City application..."

# 1. Start API
echo "📡 Starting API (http://localhost:5214)..."
(cd ZlinSmartCity.Api && dotnet run) &

# 2. Start Simulator
echo "🤖 Starting Simulator..."
(cd ZlinSmartCity.Simulator && python simulator.py) &

# 3. Start Web Frontend
echo "💻 Starting Web Frontend (Vite)..."
(cd ZlinSmartCity.Web && npm run dev) &

echo ""
echo "✅ All services are starting up!"
echo "   - API: http://localhost:5214"
echo "   - Web: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop everything."

# Wait for background processes to keep the script running
wait
