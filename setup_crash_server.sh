#!/bin/bash

# Configuration
SERVICE_NAME="craftcorps-crash"
INSTALL_DIR="/opt/craftcorps-crash"
SCRIPT_NAME="crash_server.py"

# Colors
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo -e "${GREEN}== CraftCorps Crash Server Setup ==${NC}"

# Check for root
if [ "$EUID" -ne 0 ]; then
  echo "Please run as root"
  exit 1
fi

# 1. Prepare Directory
echo "Creating install directory: $INSTALL_DIR"
mkdir -p "$INSTALL_DIR"

# 2. Copy Python Script
if [ -f "$SCRIPT_NAME" ]; then
    echo "Copying $SCRIPT_NAME..."
    cp "$SCRIPT_NAME" "$INSTALL_DIR/"
else
    echo "Error: $SCRIPT_NAME not found in current directory!"
    exit 1
fi

# 3. Create Service File
echo "Creating systemd service..."
cat > /etc/systemd/system/$SERVICE_NAME.service <<EOL
[Unit]
Description=CraftCorps Crash Report Server
After=network.target

[Service]
User=root
WorkingDirectory=$INSTALL_DIR
ExecStart=/usr/bin/python3 $INSTALL_DIR/$SCRIPT_NAME
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOL

# 4. Enable and Start
echo "Reloading systemd..."
systemctl daemon-reload

echo "Enabling service..."
systemctl enable $SERVICE_NAME

echo "Starting service..."
systemctl restart $SERVICE_NAME

echo -e "${GREEN}== Setup Complete! ==${NC}"
echo "Server is running on port 3000."
echo "Check status command: systemctl status $SERVICE_NAME"
echo "View logs command: journalctl -u $SERVICE_NAME -f"
