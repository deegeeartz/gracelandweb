const express = require('express');
const router = express.Router();
const multer = require('multer');
const { db } = require('../database/db-manager');
const logger = require('../utils/logger');
const cloudinaryService = require('../services/cloudinary.service');
const Sanitizer = require('../utils/sanitizer');

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only images are allowed'));
        }
    }
});

// Admin Middleware (assuming it's passed or defined here, for simplicity we'll just check if they are logged in if this route is mounted under /api/admin/gallery, but wait, gallery view is public, upload is admin)

// Public: Get random gallery images
router.get('/random', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 6;
        const images = await db.all(`SELECT * FROM gallery ORDER BY RAND() LIMIT ?`, [limit]);
        res.json(images);
    } catch (error) {
        logger.error('Error fetching random gallery images:', error);
        res.status(500).json({ error: 'Failed to fetch random gallery images' });
    }
});

// Public: Get gallery images
router.get('/', async (req, res) => {
    try {
        const { category } = req.query;
        let query = `SELECT * FROM gallery ORDER BY created_at DESC`;
        let params = [];

        if (category) {
            query = `SELECT * FROM gallery WHERE category = ? ORDER BY created_at DESC`;
            params = [Sanitizer.sanitizeText(category)];
        }

        const images = await db.all(query, params);
        res.json(images);
    } catch (error) {
        logger.error('Error fetching gallery:', error);
        res.status(500).json({ error: 'Failed to fetch gallery' });
    }
});

// Admin: Upload to gallery (Assume mounted at /api/admin/gallery or protected in server.js)
// But for ease of integration, we'll keep upload here and protect it in server.js
router.post('/', upload.single('image'), async (req, res) => {
    try {
        const { title, category } = req.body;
        
        if (!req.file) {
            return res.status(400).json({ error: 'Image file is required' });
        }
        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }

        // Upload to Cloudinary with local optimization
        const uploadResult = await cloudinaryService.uploadImage(req.file.buffer, {
            folder: 'graceland-church/gallery',
            type: 'gallery',
            optimizeLocally: true // Ensures web/space optimization
        });

        const sanitizedTitle = Sanitizer.sanitizeText(title);
        const sanitizedCategory = category ? Sanitizer.sanitizeText(category) : null;

        await db.run(
            `INSERT INTO gallery (title, image_url, image_public_id, category) 
             VALUES (?, ?, ?, ?)`,
            [sanitizedTitle, uploadResult.url, uploadResult.public_id, sanitizedCategory]
        );

        res.json({ 
            success: true, 
            message: 'Image uploaded to gallery',
            url: uploadResult.url 
        });

    } catch (error) {
        logger.error('Error uploading to gallery:', error);
        res.status(500).json({ error: 'Failed to upload image' });
    }
});

// Admin: Delete from gallery
router.delete('/:id', async (req, res) => {
    try {
        const image = await db.get(`SELECT * FROM gallery WHERE id = ?`, [req.params.id]);
        
        if (!image) {
            return res.status(404).json({ error: 'Image not found' });
        }

        if (image.image_public_id) {
            await cloudinaryService.deleteImage(image.image_public_id);
        }

        await db.run(`DELETE FROM gallery WHERE id = ?`, [req.params.id]);

        res.json({ success: true, message: 'Image deleted' });
    } catch (error) {
        logger.error('Error deleting gallery image:', error);
        res.status(500).json({ error: 'Failed to delete image' });
    }
});

module.exports = router;
