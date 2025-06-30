#!/bin/bash

# Create root .env file
cat > .env << EOL
# Database Configuration
DB_USER=dobvalidator
DB_PASSWORD=dobvalidator_password
DB_NAME=dobvalidator_db
DATABASE_URL=postgresql://\${DB_USER}:\${DB_PASSWORD}@db:5432/\${DB_NAME}

# JWT Configuration
JWT_SECRET=your_secure_jwt_secret_key_here

# Stellar Configuration
STELLAR_NETWORK=testnet
STELLAR_CONTRACT_ID=your_stellar_contract_id_here

# Service URLs (for production)
FRONTEND_URL=https://app.dobvalidator.com
BACKOFFICE_URL=https://admin.dobvalidator.com
BACKEND_URL=https://api.dobvalidator.com

# Node Environment
NODE_ENV=production
EOL

# Create frontend .env.local file
mkdir -p frontend
cat > frontend/.env.local << EOL
# API Configuration
NEXT_PUBLIC_API_URL=\${BACKEND_URL}

# Stellar Configuration
NEXT_PUBLIC_STELLAR_NETWORK=\${STELLAR_NETWORK}
NEXT_PUBLIC_STELLAR_CONTRACT_ID=\${STELLAR_CONTRACT_ID}

# Service URLs
NEXT_PUBLIC_FRONTEND_URL=\${FRONTEND_URL}
NEXT_PUBLIC_BACKOFFICE_URL=\${BACKOFFICE_URL}
EOL

# Create backoffice .env.local file
mkdir -p backoffice
cat > backoffice/.env.local << EOL
# API Configuration
NEXT_PUBLIC_API_URL=\${BACKEND_URL}

# Stellar Configuration
NEXT_PUBLIC_STELLAR_NETWORK=\${STELLAR_NETWORK}
NEXT_PUBLIC_STELLAR_CONTRACT_ID=\${STELLAR_CONTRACT_ID}

# Service URLs
NEXT_PUBLIC_FRONTEND_URL=\${FRONTEND_URL}
NEXT_PUBLIC_BACKOFFICE_URL=\${BACKOFFICE_URL}
EOL

# Create backend .env file
mkdir -p backend
cat > backend/.env << EOL
# Database Configuration
DATABASE_URL=\${DATABASE_URL}

# JWT Configuration
JWT_SECRET=\${JWT_SECRET}

# Stellar Configuration
STELLAR_NETWORK=\${STELLAR_NETWORK}
STELLAR_CONTRACT_ID=\${STELLAR_CONTRACT_ID}

# Service URLs
FRONTEND_URL=\${FRONTEND_URL}
BACKOFFICE_URL=\${BACKOFFICE_URL}
BACKEND_URL=\${BACKEND_URL}

# Server Configuration
PORT=3002
NODE_ENV=production
EOL

# Make the script executable
chmod +x scripts/setup-env.sh

echo "Environment files have been created successfully!"
echo "Please update the following values in the .env files:"
echo "1. JWT_SECRET (for security)"
echo "2. STELLAR_CONTRACT_ID (for your specific contract)"
echo "3. Database credentials if needed"
echo "4. Service URLs for your production domain" 