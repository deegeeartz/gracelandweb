const express = require('express');
const router = express.Router();
const { db } = require('../database/db-manager');
const logger = require('../utils/logger');

// Public: Get all house fellowships
router.get('/', async (req, res) => {
    try {
        const fellowships = await db.all(`
            SELECT id, name, leader_name, address, meeting_time, phone 
            FROM house_fellowships 
            ORDER BY name ASC
        `);
        res.json(fellowships);
    } catch (error) {
        logger.error('Error fetching house fellowships:', error);
        res.status(500).json({ error: 'Failed to fetch house fellowships' });
    }
});

module.exports = router;
