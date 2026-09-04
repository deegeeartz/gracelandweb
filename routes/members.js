const express = require('express');
const router = express.Router();
const { db } = require('../database/db-manager');
const logger = require('../utils/logger');
const Sanitizer = require('../utils/sanitizer');

// Public: Submit a connect card / register as member
router.post('/register', async (req, res) => {
    try {
        const { first_name, last_name, email, phone, address } = req.body;

        if (!first_name || !last_name) {
            return res.status(400).json({ error: 'First and last name are required' });
        }

        const sanitizedFirstName = Sanitizer.sanitizeText(first_name);
        const sanitizedLastName = Sanitizer.sanitizeText(last_name);
        const sanitizedEmail = email ? Sanitizer.sanitizeText(email) : null;
        const sanitizedPhone = phone ? Sanitizer.sanitizeText(phone) : null;
        const sanitizedAddress = address ? Sanitizer.sanitizeText(address) : null;

        await db.run(
            `INSERT INTO members (first_name, last_name, email, phone, address, joined_date) 
             VALUES (?, ?, ?, ?, ?, CURDATE())`,
            [sanitizedFirstName, sanitizedLastName, sanitizedEmail, sanitizedPhone, sanitizedAddress]
        );

        res.json({ success: true, message: 'Registration successful' });
    } catch (error) {
        logger.error('Error registering member:', error);
        res.status(500).json({ error: 'Failed to register member' });
    }
});

const { verifyToken } = require('./auth');

// Admin: Get all members
router.get('/', verifyToken, async (req, res) => {
    try {
        const members = await db.all(`SELECT * FROM members ORDER BY joined_date DESC`);
        res.json(members);
    } catch (error) {
        logger.error('Error fetching all members:', error);
        res.status(500).json({ error: 'Failed to fetch members' });
    }
});

// Admin: Delete member
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        await db.run(`DELETE FROM members WHERE id = ?`, [req.params.id]);
        res.json({ success: true, message: 'Member deleted' });
    } catch (error) {
        logger.error('Error deleting member:', error);
        res.status(500).json({ error: 'Failed to delete member' });
    }
});

module.exports = router;
