"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const database_1 = require("./lib/database");
const database_2 = require("./lib/database");
const env_validation_1 = require("./lib/env-validation");
const app = (0, express_1.default)();
const PORT = env_validation_1.env.PORT;
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
}));
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: env_validation_1.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000,
    max: env_validation_1.env.AUTH_RATE_LIMIT_MAX_REQUESTS || 5,
    message: { error: 'Too many authentication attempts, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});
const apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: env_validation_1.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000,
    max: env_validation_1.env.RATE_LIMIT_MAX_REQUESTS || 100,
    message: { error: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/auth', authLimiter);
app.use('/api', apiLimiter);
app.use((0, cors_1.default)({
    origin: env_validation_1.env.CORS_ORIGIN,
    credentials: true
}));
app.use(express_1.default.json({ limit: '1mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '1mb' }));
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.post('/api/auth/challenge', async (req, res) => {
    try {
        const { walletAddress } = req.body;
        if (!walletAddress) {
            res.status(400).json({ error: 'Wallet address is required' });
            return;
        }
        const challenge = `DOB_VALIDATOR_AUTH_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
        await database_2.authService.createChallenge(walletAddress, challenge, expiresAt);
        res.json({ success: true, challenge });
        return;
    }
    catch (error) {
        console.error('Challenge generation error:', error);
        res.status(500).json({ error: 'Failed to generate challenge' });
        return;
    }
});
app.post('/api/auth/verify', async (req, res) => {
    try {
        const { walletAddress, signature, challenge } = req.body;
        if (!walletAddress || !signature || !challenge) {
            res.status(400).json({ error: 'Wallet address, signature, and challenge are required' });
            return;
        }
        const storedChallenge = await database_2.authService.getChallenge(challenge);
        if (!storedChallenge) {
            res.status(401).json({ error: 'Invalid or expired challenge' });
            return;
        }
        const isValid = true;
        if (!isValid) {
            res.status(401).json({ error: 'Invalid signature' });
            return;
        }
        const user = await database_2.userService.findOrCreateByWallet(walletAddress);
        const jwt = require('jsonwebtoken');
        const token = jwt.sign({ walletAddress, userId: user.id }, env_validation_1.env.JWT_SECRET, { expiresIn: env_validation_1.env.JWT_EXPIRES_IN });
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await database_2.authService.createSession(walletAddress, token, expiresAt);
        await database_2.authService.deleteChallenge(challenge);
        res.json({ success: true, token, user });
        return;
    }
    catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ error: 'Failed to verify signature' });
        return;
    }
});
app.get('/api/profile', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'Authorization header required' });
            return;
        }
        const token = authHeader.substring(7);
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, env_validation_1.env.JWT_SECRET);
        const { walletAddress } = decoded;
        const profile = await database_2.profileService.getByWallet(walletAddress);
        if (!profile) {
            res.status(404).json({ error: 'Profile not found' });
            return;
        }
        res.json({ success: true, profile });
        return;
    }
    catch (error) {
        console.error('Profile fetch error:', error);
        res.status(401).json({ error: 'Invalid token' });
        return;
    }
});
app.post('/api/profile', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'Authorization header required' });
            return;
        }
        const token = authHeader.substring(7);
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, env_validation_1.env.JWT_SECRET);
        const { walletAddress } = decoded;
        const { name, company, email } = req.body;
        const user = await database_2.userService.getByWallet(walletAddress);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        const profile = await database_2.profileService.create(user.id, {
            name,
            company,
            email,
            walletAddress
        });
        res.json({ success: true, profile });
        return;
    }
    catch (error) {
        console.error('Profile creation error:', error);
        res.status(500).json({ error: 'Failed to create profile' });
        return;
    }
});
app.get('/api/submissions', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'Authorization header required' });
            return;
        }
        const token = authHeader.substring(7);
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, env_validation_1.env.JWT_SECRET);
        const { walletAddress } = decoded;
        const { status, limit = 10, offset = 0 } = req.query;
        const user = await database_2.userService.getByWallet(walletAddress);
        const isAdmin = user?.role === 'ADMIN';
        let result;
        if (isAdmin) {
            result = await database_2.submissionService.getAll({
                status: status,
                limit: parseInt(limit),
                offset: parseInt(offset)
            });
        }
        else {
            result = await database_2.submissionService.getByUser(walletAddress, {
                status: status,
                limit: parseInt(limit),
                offset: parseInt(offset)
            });
        }
        res.json({ success: true, ...result });
        return;
    }
    catch (error) {
        console.error('Submissions fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch submissions' });
        return;
    }
});
app.get('/api/submissions/:id', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'Authorization header required' });
            return;
        }
        const token = authHeader.substring(7);
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, env_validation_1.env.JWT_SECRET);
        const { walletAddress } = decoded;
        const { id } = req.params;
        const submission = await database_2.submissionService.getById(id);
        if (!submission) {
            res.status(404).json({ error: 'Submission not found' });
            return;
        }
        const user = await database_2.userService.getByWallet(walletAddress);
        const isAdmin = user?.role === 'ADMIN';
        const isOwner = submission.user.walletAddress === walletAddress;
        if (!isAdmin && !isOwner) {
            res.status(403).json({ error: 'Access denied' });
            return;
        }
        res.json({ success: true, submission });
        return;
    }
    catch (error) {
        console.error('Submission fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch submission' });
        return;
    }
});
app.post('/api/submissions', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'Authorization header required' });
            return;
        }
        const token = authHeader.substring(7);
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, env_validation_1.env.JWT_SECRET);
        const { walletAddress } = decoded;
        const user = await database_2.userService.getByWallet(walletAddress);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        const submissionData = req.body;
        const submission = await database_2.submissionService.create(user.id, submissionData);
        res.json({ success: true, submission });
        return;
    }
    catch (error) {
        console.error('Submission creation error:', error);
        res.status(500).json({ error: 'Failed to create submission' });
        return;
    }
});
app.put('/api/submissions/:id/status', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'Authorization header required' });
            return;
        }
        const token = authHeader.substring(7);
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, env_validation_1.env.JWT_SECRET);
        const { walletAddress } = decoded;
        const user = await database_2.userService.getByWallet(walletAddress);
        if (user?.role !== 'ADMIN') {
            res.status(403).json({ error: 'Admin access required' });
            return;
        }
        const { id } = req.params;
        const { status, adminNotes } = req.body;
        const submission = await database_2.submissionService.update(id, { status, adminNotes });
        res.json({ success: true, submission });
        return;
    }
    catch (error) {
        console.error('Submission update error:', error);
        res.status(500).json({ error: 'Failed to update submission' });
        return;
    }
});
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({ error: 'Internal server error' });
});
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});
async function startServer() {
    try {
        await database_1.prisma.$connect();
        console.log('✅ Database connected successfully');
        setInterval(async () => {
            try {
                await database_2.authService.cleanupExpired();
                console.log('🧹 Cleaned up expired sessions and challenges');
            }
            catch (error) {
                console.error('❌ Session cleanup error:', error);
            }
        }, 60 * 60 * 1000);
        await database_2.authService.cleanupExpired();
        console.log('🧹 Initial cleanup completed');
        app.listen(PORT, () => {
            console.log(`🚀 Backend server running on port ${PORT}`);
            console.log(`📊 Health check: http://localhost:${PORT}/health`);
            console.log(`🔗 API base: http://localhost:${PORT}/api`);
            console.log(`🔒 Security: Rate limiting, enhanced helmet, session cleanup active`);
        });
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down server...');
    await database_1.prisma.$disconnect();
    process.exit(0);
});
startServer();
//# sourceMappingURL=index.js.map