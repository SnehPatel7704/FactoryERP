#!/bin/bash

# Script to start Prisma Studio
# Usage: ./start-studio.sh

echo "🚀 Starting Prisma Studio..."
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

# Start Prisma Studio
echo "🗄️  Starting Prisma Studio (port 5555)..."
run_in_terminal "Prisma Studio" "npx prisma studio" "$SCRIPT_DIR/backend"

echo ""
echo "✅ Prisma Studio started!"
echo ""
echo "📱 Access:"
echo "  • Prisma Studio:   http://localhost:5555"
echo ""
echo "💡 Tip: Make sure your Backend is running (port 5000)"
echo ""
echo "⏹️  To stop, close this Terminal window or press Ctrl+C"
