const express = require('express');
const router = express.Router();
const { db } = require('../database/db-manager');
const logger = require('../utils/logger');
const Sanitizer = require('../utils/sanitizer');

// Public: Submit a new prayer request
router.post('/', async (req, res) => {
    try {
        const { name, email, phone, request_text, is_public = false } = req.body;

        if (!name || !request_text) {
            return res.status(400).json({ error: 'Name and request text are required' });
        }

        const sanitizedName = Sanitizer.sanitizeText(name);
        const sanitizedEmail = email ? Sanitizer.sanitizeText(email) : null;
        const sanitizedPhone = phone ? Sanitizer.sanitizeText(phone) : null;
        const sanitizedRequest = Sanitizer.sanitizeText(request_text);
        // Explicit boolean casting
        const isPublicBool = is_public === true || is_public === 'true';

        await db.run(
            `INSERT INTO prayer_requests (name, email, phone, request_text, is_public, status) 
             VALUES (?, ?, ?, ?, ?, 'pending')`,
            [sanitizedName, sanitizedEmail, sanitizedPhone, sanitizedRequest, isPublicBool]
        );

        res.json({ success: true, message: 'Prayer request submitted successfully' });
    } catch (error) {
        logger.error('Error submitting prayer request:', error);
        res.status(500).json({ error: 'Failed to submit prayer request' });
    }
});

// Public: Get approved public prayer requests
router.get('/public', async (req, res) => {
    try {
        const requests = await db.all(`
            SELECT id, name, request_text, created_at 
            FROM prayer_requests 
            WHERE is_public = TRUE AND status = 'approved'
            ORDER BY created_at DESC 
            LIMIT 20
        `);
        res.json(requests);
    } catch (error) {
        logger.error('Error fetching public prayer requests:', error);
        res.status(500).json({ error: 'Failed to fetch public prayer requests' });
    }
});

module.exports = router;
