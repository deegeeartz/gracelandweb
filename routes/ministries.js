const express = require('express');
const router = express.Router();
const multer = require('multer');
const { db } = require('../database/db-manager');
const logger = require('../utils/logger');
const cloudinaryService = require('../services/cloudinary.service');
const Sanitizer = require('../utils/sanitizer');
const { verifyToken } = require('./auth');

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only images are allowed'));
        }
    }
});

// Public: Get all ministries
router.get('/', async (req, res) => {
    try {
        const ministries = await db.all(`SELECT * FROM ministries ORDER BY id ASC`);
        res.json(ministries);
    } catch (error) {
        logger.error('Error fetching ministries:', error);
        res.status(500).json({ error: 'Failed to fetch ministries' });
    }
});

// Admin: Create ministry
router.post('/', verifyToken, upload.single('image'), async (req, res) => {
    try {
        const { name, description } = req.body;
        
        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
        }

        const sanitizedName = Sanitizer.sanitizeText(name);
        const sanitizedDesc = description ? Sanitizer.sanitizeText(description) : null;
        
        let imageUrl = req.body.image_url || null;
        if (req.file) {
            const uploadResult = await cloudinaryService.uploadImage(req.file.buffer, {
                folder: 'graceland-church/ministries'
            });
            imageUrl = uploadResult.secure_url;
        }

        await db.run(
            `INSERT INTO ministries (name, description, image_url) VALUES (?, ?, ?)`,
            [sanitizedName, sanitizedDesc, imageUrl]
        );

        res.status(201).json({ success: true, message: 'Ministry created successfully' });
    } catch (error) {
        logger.error('Error creating ministry:', error);
        res.status(500).json({ error: 'Failed to create ministry' });
    }
});

// Admin: Update ministry
router.put('/:id', verifyToken, upload.single('image'), async (req, res) => {
    try {
        const id = req.params.id;
        const { name, description } = req.body;
        
        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
        }

        const sanitizedName = Sanitizer.sanitizeText(name);
        const sanitizedDesc = description ? Sanitizer.sanitizeText(description) : null;
        
        let updateQuery = `UPDATE ministries SET name = ?, description = ?`;
        let params = [sanitizedName, sanitizedDesc];

        if (req.body.image_url) {
            updateQuery += `, image_url = ?`;
            params.push(req.body.image_url);
        } else if (req.file) {
            const uploadResult = await cloudinaryService.uploadImage(req.file.buffer, {
                folder: 'graceland-church/ministries'
            });
            updateQuery += `, image_url = ?`;
            params.push(uploadResult.secure_url);
        }

        updateQuery += ` WHERE id = ?`;
        params.push(id);

        await db.run(updateQuery, params);

        res.json({ success: true, message: 'Ministry updated successfully' });
    } catch (error) {
        logger.error('Error updating ministry:', error);
        res.status(500).json({ error: 'Failed to update ministry' });
    }
});

// Admin: Delete ministry
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const id = req.params.id;
        
        // Fetch to delete image from cloudinary if it exists
        const ministry = await db.get(`SELECT image_url FROM ministries WHERE id = ?`, [id]);
        if (ministry && ministry.image_url) {
            await cloudinaryService.deleteImage(ministry.image_url);
        }

        await db.run(`DELETE FROM ministries WHERE id = ?`, [id]);
        res.json({ success: true, message: 'Ministry deleted successfully' });
    } catch (error) {
        logger.error('Error deleting ministry:', error);
        res.status(500).json({ error: 'Failed to delete ministry' });
    }
});

module.exports = router;
