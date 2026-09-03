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

module.exports = router;
