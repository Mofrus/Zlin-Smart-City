#!/bin/bash

# Zlin Smart City - Full Stack Starter
# This script launches the API, Simulator, and Web Dashboard simultaneously.

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Function to handle shutdown
cleanup() {
    echo -e "\n\033[1;33mStopping all services...\033[0m"
    # Kill background jobs
    kill $(jobs -p) 2>/dev/null
    exit
}

# Trap termination signals
trap cleanup SIGINT SIGTERM EXIT

echo -e "\033[1;36m?? Starting Zlin Smart City Hub...\033[0m"

# 1. Start API (.NET)
echo -e "\033[0;90m?? Starting API (http://localhost:5214)...\033[0m"
cd "$SCRIPT_DIR/ZlinSmartCity.Api" && dotnet run &

# 2. Start Simulator (Python)
echo -e "\033[0;90m?? Starting Simulator...\033[0m"
cd "$SCRIPT_DIR/ZlinSmartCity.Simulator" && python simulator.py &

# 3. Start Web Dashboard (Vite)
echo -e "\033[0;90m?? Starting Web Dashboard (http://localhost:5173)...\033[0m"
cd "$SCRIPT_DIR/ZlinSmartCity.Web" && npm run dev &

echo -e "\n\033[1;32m? All services are launching!\033[0m"
echo -e "   - API: \033[4mhttp://localhost:5214\033[0m"
echo -e "   - Web: \033[4mhttp://localhost:5173\033[0m"
echo -e "\n\033[1;37mPress Ctrl+C to stop everything.\033[0m"

# Wait for all background processes
wait
