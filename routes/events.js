const express = require('express');
const router = express.Router();
const { db } = require('../database/db-manager');
const logger = require('../utils/logger');
const Sanitizer = require('../utils/sanitizer');

// Public: Get all upcoming events
router.get('/', async (req, res) => {
    try {
        const events = await db.all(`
            SELECT * FROM events 
            WHERE status = 'published' AND start_time >= NOW()
            ORDER BY start_time ASC
        `);
        res.json(events);
    } catch (error) {
        logger.error('Error fetching events:', error);
        res.status(500).json({ error: 'Failed to fetch events' });
    }
});

// Public: Get past events
router.get('/past', async (req, res) => {
    try {
        const events = await db.all(`
            SELECT * FROM events 
            WHERE status = 'published' AND start_time < NOW()
            ORDER BY start_time DESC
            LIMIT 10
        `);
        res.json(events);
    } catch (error) {
        logger.error('Error fetching past events:', error);
        res.status(500).json({ error: 'Failed to fetch past events' });
    }
});

// Public: Get single event details
router.get('/:id', async (req, res) => {
    try {
        const event = await db.get(`SELECT * FROM events WHERE id = ? AND status = 'published'`, [req.params.id]);
        if (!event) return res.status(404).json({ error: 'Event not found' });
        res.json(event);
    } catch (error) {
        logger.error('Error fetching event details:', error);
        res.status(500).json({ error: 'Failed to fetch event details' });
    }
});

// Public: RSVP to an event
router.post('/:id/rsvp', async (req, res) => {
    try {
        const eventId = req.params.id;
        const { name, email, phone, status = 'attending' } = req.body;

        if (!name || !email) {
            return res.status(400).json({ error: 'Name and email are required' });
        }

        const sanitizedName = Sanitizer.sanitizeText(name);
        const sanitizedEmail = Sanitizer.sanitizeText(email);
        const sanitizedPhone = phone ? Sanitizer.sanitizeText(phone) : null;
        
        await db.run(
            `INSERT INTO event_rsvps (event_id, name, email, phone, status) VALUES (?, ?, ?, ?, ?)`,
            [eventId, sanitizedName, sanitizedEmail, sanitizedPhone, status]
        );

        res.json({ success: true, message: 'RSVP submitted successfully' });
    } catch (error) {
        logger.error('Error submitting RSVP:', error);
        res.status(500).json({ error: 'Failed to submit RSVP' });
    }
});

module.exports = router;
