#!/usr/bin/env bash
# ==============================================================================
# Automated Azure Virtual Machine Provisioning Script (Ubuntu 22.04 / 24.04 LTS)
# Installs Docker, Docker Compose, Git, and Configures Production Firewall
# ==============================================================================

set -euo pipefail

echo "====================================================="
echo "   Provisioning Azure Virtual Machine for PulseChat"
echo "====================================================="

# Step 1: System Package Updates
echo "==> Updating system packages..."
sudo apt-get update -y
sudo apt-get upgrade -y
sudo apt-get install -y ca-certificates curl gnupg lsb-release ufw git

# Step 2: Install Official Docker Engine & Docker Compose
echo "==> Installing Docker Engine..."
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update -y
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Step 3: Grant Docker Privileges to Non-Root User
echo "==> Configuring user privileges for Docker..."
sudo usermod -aG docker "$USER"

# Step 4: Configure UFW Host Firewall (Allow SSH, HTTP, HTTPS)
echo "==> Configuring firewall rules..."
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp comment 'SSH'
sudo ufw allow 80/tcp comment 'HTTP'
sudo ufw allow 443/tcp comment 'HTTPS'
sudo ufw --force enable

# Step 5: Setup Application Directory
echo "==> Setting up /opt/chat-app deployment directory..."
sudo mkdir -p /opt/chat-app
sudo chown -R "$USER:$USER" /opt/chat-app

echo "====================================================="
echo "   Azure VM Setup Complete!"
echo "   Please log out and log back in to activate Docker:"
echo "   exit"
echo "====================================================="
