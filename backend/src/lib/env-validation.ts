import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

interface EnvConfig {
  // Database
  DATABASE_URL: string
  
  // JWT
  JWT_SECRET: string
  JWT_EXPIRES_IN: string
  
  // Stellar
  STELLAR_NETWORK: 'testnet' | 'public'
  STELLAR_HORIZON_URL: string
  
  // Server
  PORT: number
  NODE_ENV: 'development' | 'production' | 'test'
  
  // CORS
  CORS_ORIGIN: string
  
  // File Storage
  UPLOAD_DIR: string
  MAX_FILE_SIZE: number
  
  // Security
  RATE_LIMIT_WINDOW_MS?: number
  RATE_LIMIT_MAX_REQUESTS?: number
  AUTH_RATE_LIMIT_MAX_REQUESTS?: number
}

function validateEnv(): EnvConfig {
  const errors: string[] = []
  
  // Required environment variables
  const requiredVars = {
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
    STELLAR_NETWORK: process.env.STELLAR_NETWORK,
    STELLAR_HORIZON_URL: process.env.STELLAR_HORIZON_URL,
    CORS_ORIGIN: process.env.CORS_ORIGIN,
    UPLOAD_DIR: process.env.UPLOAD_DIR,
    MAX_FILE_SIZE: process.env.MAX_FILE_SIZE,
  }
  
  // Check for missing required variables
  Object.entries(requiredVars).forEach(([key, value]) => {
    if (!value) {
      errors.push(`Missing required environment variable: ${key}`)
    }
  })
  
  // Validate JWT_SECRET strength in production
  if (process.env.NODE_ENV === 'production' && process.env.JWT_SECRET) {
    if (process.env.JWT_SECRET.length < 32) {
      errors.push('JWT_SECRET must be at least 32 characters long in production')
    }
    if (process.env.JWT_SECRET === 'your-super-secret-jwt-key-change-in-production') {
      errors.push('JWT_SECRET must be changed from default value in production')
    }
  }
  
  // Validate STELLAR_NETWORK
  if (process.env.STELLAR_NETWORK && !['testnet', 'public'].includes(process.env.STELLAR_NETWORK)) {
    errors.push('STELLAR_NETWORK must be either "testnet" or "public"')
  }
  
  // Validate NODE_ENV
  if (process.env.NODE_ENV && !['development', 'production', 'test'].includes(process.env.NODE_ENV)) {
    errors.push('NODE_ENV must be either "development", "production", or "test"')
  }
  
  // Validate numeric values
  const port = parseInt(process.env.PORT || '3001')
  if (isNaN(port) || port < 1 || port > 65535) {
    errors.push('PORT must be a valid port number (1-65535)')
  }
  
  const maxFileSize = parseInt(process.env.MAX_FILE_SIZE || '10485760')
  if (isNaN(maxFileSize) || maxFileSize <= 0) {
    errors.push('MAX_FILE_SIZE must be a positive number')
  }
  
  // Throw error if any validation failed
  if (errors.length > 0) {
    console.error('❌ Environment validation failed:')
    errors.forEach(error => console.error(`  - ${error}`))
    console.error('\nPlease check your .env file and ensure all required variables are set correctly.')
    process.exit(1)
  }
  
  // Return validated config
  const config: EnvConfig = {
    DATABASE_URL: process.env.DATABASE_URL!,
    JWT_SECRET: process.env.JWT_SECRET!,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN!,
    STELLAR_NETWORK: (process.env.STELLAR_NETWORK as 'testnet' | 'public') || 'testnet',
    STELLAR_HORIZON_URL: process.env.STELLAR_HORIZON_URL!,
    PORT: port,
    NODE_ENV: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development',
    CORS_ORIGIN: process.env.CORS_ORIGIN!,
    UPLOAD_DIR: process.env.UPLOAD_DIR!,
    MAX_FILE_SIZE: maxFileSize,
    RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
    RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    AUTH_RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS || '5'),
  }
  
  console.log('✅ Environment validation passed')
  console.log(`🔧 Environment: ${config.NODE_ENV}`)
  console.log(`🌐 CORS Origin: ${config.CORS_ORIGIN}`)
  console.log(`⭐ Stellar Network: ${config.STELLAR_NETWORK}`)
  
  return config
}

export const env = validateEnv() 