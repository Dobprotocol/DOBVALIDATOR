#!/bin/bash

# Cloud SQL Proxy startup script for DOB Validator
# Usage: ./start-cloud-sql-proxy.sh YOUR_INSTANCE_CONNECTION_NAME

if [ -z "$1" ]; then
    echo "Usage: $0 <INSTANCE_CONNECTION_NAME>"
    echo "Example: $0 stoked-utility-453816-e2:us-central1:dob-validator-db"
    echo ""
    echo "You can find your instance connection name in the Google Cloud Console:"
    echo "1. Go to SQL instances"
    echo "2. Click on your instance"
    echo "3. Copy the 'Connection name'"
    exit 1
fi

INSTANCE_CONNECTION_NAME=$1
CREDENTIAL_FILE="***REMOVED******REMOVED***"

echo "Starting Cloud SQL Proxy..."
echo "Instance: $INSTANCE_CONNECTION_NAME"
echo "Port: 5433"
echo "Credential file: $CREDENTIAL_FILE"
echo ""

# Check if credential file exists
if [ ! -f "$CREDENTIAL_FILE" ]; then
    echo "Error: Credential file not found at $CREDENTIAL_FILE"
    exit 1
fi

# Start the proxy
./cloud_sql_proxy \
    $INSTANCE_CONNECTION_NAME \
    --credentials-file=$CREDENTIAL_FILE \
    --port=5433

echo ""
echo "Proxy stopped." 