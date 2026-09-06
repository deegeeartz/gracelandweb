const express = require('express');
const router = express.Router();
const { db } = require('../database/db-manager');
const logger = require('../utils/logger');

const { verifyToken } = require('./auth');

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

// Admin: Create house fellowship
router.post('/', verifyToken, async (req, res) => {
    try {
        const { name, leader_name, address, meeting_time, contact_phone, phone } = req.body;
        if (!name || !leader_name) {
            return res.status(400).json({ error: 'Fellowship name and leader name are required' });
        }
        const phoneValue = phone || contact_phone || null;
        await db.run(
            `INSERT INTO house_fellowships (name, leader_name, address, meeting_time, phone) VALUES (?, ?, ?, ?, ?)`,
            [name, leader_name, address || null, meeting_time || null, phoneValue]
        );
        res.json({ success: true, message: 'Fellowship created successfully' });
    } catch (error) {
        logger.error('Error creating house fellowship:', error);
        res.status(500).json({ error: 'Failed to create house fellowship' });
    }
});

// Admin: Delete house fellowship
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        await db.run(`DELETE FROM house_fellowships WHERE id = ?`, [id]);
        res.json({ success: true, message: 'Fellowship deleted successfully' });
    } catch (error) {
        logger.error('Error deleting house fellowship:', error);
        res.status(500).json({ error: 'Failed to delete house fellowship' });
    }
});

module.exports = router;

