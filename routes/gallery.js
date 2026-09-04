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

// In-memory cache for gallery items to eliminate repeated database queries
let cachedGallery = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache

async function getCachedGallery() {
    const now = Date.now();
    if (!cachedGallery || (now - lastCacheTime > CACHE_TTL_MS)) {
        cachedGallery = await db.all(`SELECT id, title, category, image_url, created_at FROM gallery ORDER BY created_at DESC`);
        lastCacheTime = now;
    }
    return cachedGallery;
}

function invalidateGalleryCache() {
    cachedGallery = null;
    lastCacheTime = 0;
}

// Public: Get random gallery images (served from memory cache to avoid DB load)
router.get('/random', async (req, res) => {
    try {
        const limit = Math.min(parseInt(req.query.limit) || 6, 20);
        const allItems = await getCachedGallery();
        
        if (!allItems || allItems.length === 0) {
            return res.json([]);
        }

        // Shuffle in-memory array (0 database queries)
        const shuffled = [...allItems].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, limit);

        // Tell browser to cache for 3 minutes to prevent repeated HTTP requests
        res.set('Cache-Control', 'public, max-age=180');
        res.json(selected);
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
        
        let imageUrl = req.body.image_url || null;
        let imagePublicId = req.body.image_public_id || null;

        if (req.file) {
            const uploadResult = await cloudinaryService.uploadImage(req.file.buffer, {
                folder: 'graceland-church/gallery',
                type: 'gallery',
                optimizeLocally: true
            });
            imageUrl = uploadResult.url;
            imagePublicId = uploadResult.public_id;
        }

        if (!imageUrl) {
            return res.status(400).json({ error: 'Image file is required' });
        }
        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }

        const sanitizedTitle = Sanitizer.sanitizeText(title);
        const sanitizedCategory = category ? Sanitizer.sanitizeText(category) : null;

        await db.run(
            `INSERT INTO gallery (title, image_url, image_public_id, category) 
             VALUES (?, ?, ?, ?)`,
            [sanitizedTitle, imageUrl, imagePublicId, sanitizedCategory]
        );

        invalidateGalleryCache();

        res.json({ 
            success: true, 
            message: 'Image uploaded to gallery',
            url: imageUrl 
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
        invalidateGalleryCache();

        res.json({ success: true, message: 'Image deleted' });
    } catch (error) {
        logger.error('Error deleting gallery image:', error);
        res.status(500).json({ error: 'Failed to delete image' });
    }
});

module.exports = router;
