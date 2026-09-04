const express = require('express');
const router = express.Router();
const { db } = require('../database/db-manager');
const logger = require('../utils/logger');
const Sanitizer = require('../utils/sanitizer');

// Public: Global search (Sermons, Blogs, Events)
router.get('/', async (req, res) => {
    try {
        const query = req.query.q;
        
        if (!query) {
            return res.json({ blogs: [], sermons: [], events: [] });
        }

        const sanitizedQuery = Sanitizer.sanitizeText(query);
        const likeQuery = `%${sanitizedQuery}%`;

        const [blogs, sermons, events] = await Promise.all([
            db.all(`SELECT id, title, slug, excerpt, 'blog' as type, created_at 
                    FROM blog_posts 
                    WHERE status = 'published' AND (title LIKE ? OR excerpt LIKE ? OR content LIKE ?) 
                    LIMIT 5`, [likeQuery, likeQuery, likeQuery]),
            db.all(`SELECT id, title, slug, description, 'sermon' as type, sermon_date as created_at 
                    FROM sermons 
                    WHERE status = 'published' AND (title LIKE ? OR description LIKE ? OR speaker LIKE ?) 
                    LIMIT 5`, [likeQuery, likeQuery, likeQuery]),
            db.all(`SELECT id, title, description, 'event' as type, start_time as created_at 
                    FROM events 
                    WHERE status = 'published' AND (title LIKE ? OR description LIKE ?) 
                    LIMIT 5`, [likeQuery, likeQuery])
        ]);

        res.json({ blogs, sermons, events });
    } catch (error) {
        logger.error('Error performing search:', error);
        res.status(500).json({ error: 'Search failed' });
    }
});

module.exports = router;
