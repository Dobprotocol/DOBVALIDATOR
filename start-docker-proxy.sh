#!/bin/bash

# Docker Cloud SQL Proxy startup script for DOB Validator
# This script starts the Cloud SQL Proxy using Docker

PROJECT_ROOT="/Users/JoaquinNam/Desktop/MENTE_MAESTRA/1CLIENTS/DOBPROTOCOL/DOBVALIDATOR"
KEYS_DIR="$PROJECT_ROOT/keys"
INSTANCE_CONNECTION_NAME="stoked-utility-453816-e2:us-central1:dob-validator"
LOCAL_PORT="5433"
CONTAINER_PORT="5432"

echo "Starting Cloud SQL Proxy via Docker..."
echo "Instance: $INSTANCE_CONNECTION_NAME"
echo "Local Port: $LOCAL_PORT"
echo "Keys Directory: $KEYS_DIR"
echo ""

# Check if keys directory exists
if [ ! -d "$KEYS_DIR" ]; then
    echo "Error: Keys directory not found at $KEYS_DIR"
    exit 1
fi

# Check if account.json exists
if [ ! -f "$KEYS_DIR/account.json" ]; then
    echo "Error: account.json not found at $KEYS_DIR/account.json"
    exit 1
fi

# Stop any existing proxy container
echo "Stopping any existing proxy containers..."
sudo docker stop cloud-sql-proxy 2>/dev/null || true
sudo docker rm cloud-sql-proxy 2>/dev/null || true

# Start the proxy
echo "Starting new proxy container..."
sudo docker run \
  --name cloud-sql-proxy \
  -v "$KEYS_DIR:/config" \
  -p "127.0.0.1:$LOCAL_PORT:$CONTAINER_PORT" \
  gcr.io/cloudsql-docker/gce-proxy:1.16 \
  /cloud_sql_proxy \
    -instances="$INSTANCE_CONNECTION_NAME=tcp:0.0.0.0:$CONTAINER_PORT" \
    -credential_file=/config/account.json

echo ""
echo "Proxy stopped." 