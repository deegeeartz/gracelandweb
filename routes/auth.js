const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../database/models/User');
const logger = require('../utils/logger');
const validate = require('../middleware/validate');
const { loginSchema, registerSchema, changePasswordSchema } = require('../schemas/auth.schema');

function getJwtSecret(res) {
    const rawSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production-graceland-2024';
    const secret = typeof rawSecret === 'string' ? rawSecret.trim().replace(/^['"]|['"]$/g, '') : rawSecret;
    if (!secret) {
        logger.error('JWT_SECRET is not configured');
        if (res) {
            res.status(500).json({ error: 'Authentication is not configured on server' });
        }
        return null;
    }
    return secret;
}

function verifyToken(req, res, next) {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const secret = getJwtSecret(res);
    if (!secret) return;

    try {
        const decoded = jwt.verify(token, secret);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(400).json({ error: 'Invalid token.' });
    }
}

function requireAdmin(req, res, next) {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
}

// POST /api/auth/login
router.post('/login', validate(loginSchema), async (req, res) => {
    try {
        const secret = getJwtSecret(res);
        if (!secret) return;

        const { username, password } = req.body;

        // Get user from database
        const user = await User.getByCredentials(username);
        
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                userId: user.id, 
                username: user.username,
                role: user.role 
            },
            secret,
            { expiresIn: '24h' }
        );

        // Remove password from user object
        const { password_hash, ...userWithoutPassword } = user;

        res.json({
            message: 'Login successful',            
            token,
            user: userWithoutPassword
        });
    } catch (error) {
        logger.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
});

// POST /api/auth/register (for creating new admin users)
router.post('/register', verifyToken, requireAdmin, validate(registerSchema), async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.getByCredentials(username);
        if (existingUser) {
            return res.status(400).json({ error: 'Username or email already exists' });
        }

        // Hash password
        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);

        // Create user
        const userId = await User.create({
            username,
            email,
            password_hash,
            role: 'admin'
        });

        res.status(201).json({
            message: 'User created successfully',            
            userId
        });
    } catch (error) {
        logger.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/auth/verify - Verify token and get user info
router.get('/verify', verifyToken, async (req, res) => {
    try {
        const user = await User.getById(req.user.userId);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }        
        res.json({ user });
    } catch (error) {
        logger.error('Token verification error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/auth/change-password
router.post('/change-password', verifyToken, validate(changePasswordSchema), async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Get user with password hash
        const user = await User.getByCredentials(req.user.username);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Verify current password
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
        
        if (!isPasswordValid) {
            return res.status(400).json({ error: 'Current password is incorrect' });
        }

        // Hash new password
        const saltRounds = 10;
        const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

        // Update password
        await User.update(user.id, {
            username: user.username,
            email: user.email,
            password_hash: newPasswordHash
        });

        res.json({ message: 'Password changed successfully' });    } catch (error) {
        logger.error('Change password error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
module.exports.verifyToken = verifyToken;
