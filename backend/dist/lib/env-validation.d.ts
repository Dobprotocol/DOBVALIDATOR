interface EnvConfig {
    DATABASE_URL: string;
    JWT_SECRET: string;
    JWT_EXPIRES_IN: string;
    STELLAR_NETWORK: 'testnet' | 'public';
    STELLAR_HORIZON_URL: string;
    PORT: number;
    NODE_ENV: 'development' | 'production' | 'test';
    CORS_ORIGIN: string;
    UPLOAD_DIR: string;
    MAX_FILE_SIZE: number;
    RATE_LIMIT_WINDOW_MS?: number;
    RATE_LIMIT_MAX_REQUESTS?: number;
    AUTH_RATE_LIMIT_MAX_REQUESTS?: number;
}
export declare const env: EnvConfig;
export {};
//# sourceMappingURL=env-validation.d.ts.map