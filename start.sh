#!/bin/bash

# Script to start Backend, Frontend, and Prisma Studio
# Usage: ./start.sh

echo "🚀 Starting FeatheraFine Development Environment..."
echo ""

# Get the directory of this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Function to open terminal and run command
run_in_terminal() {
    local title=$1
    local command=$2
    local cwd=$3
    
    osascript <<EOF
tell application "Terminal"
    do script "cd '$cwd' && $command"
    set the title of the front window to "$title"
end tell
EOF
}

# Start Backend
echo "📦 Starting Backend (port 5000)..."
run_in_terminal "Backend" "npm run dev" "$SCRIPT_DIR/backend"
sleep 2

# Start Frontend
echo "⚛️  Starting Frontend (port 5173)..."
run_in_terminal "Frontend" "npm run dev" "$SCRIPT_DIR/frontend"

echo ""
echo "✅ Backend and Frontend started!"
echo ""
echo "📱 Services:"
echo "  • Frontend:        http://localhost:5173"
echo "  • Backend API:     http://localhost:5000"
echo ""
echo "💡 To also start Prisma Studio, run:"
echo "   ./start-studio.sh"
echo ""
echo "📝 Check the Terminal windows for any errors or logs"
