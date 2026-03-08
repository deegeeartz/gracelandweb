const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../database/models/User');
const logger = require('../utils/logger');

const JWT_SECRET = process.env.JWT_SECRET;

function getJwtSecret(res) {
    if (!JWT_SECRET) {
        logger.error('JWT_SECRET is not configured');
        if (res) {
            res.status(500).json({ error: 'Authentication is not configured on server' });
        }
        return null;
    }
    return JWT_SECRET;
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
router.post('/login', async (req, res) => {
    try {
        const secret = getJwtSecret(res);
        if (!secret) return;

        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

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
            message: 'Login successful',            token,
            user: userWithoutPassword
        });
    } catch (error) {
        logger.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/auth/register (for creating new admin users)
router.post('/register', verifyToken, requireAdmin, async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Username, email, and password are required' });
        }

        if (password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters' });
        }

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
            message: 'User created successfully',            userId
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
        }        res.json({ user });
    } catch (error) {
        logger.error('Token verification error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/auth/change-password
router.post('/change-password', verifyToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Current password and new password are required' });
        }

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
