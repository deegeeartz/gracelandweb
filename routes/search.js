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
        
        // Ensure query has enough characters for FULLTEXT search (default min is usually 3)
        if (sanitizedQuery.length < 3) {
            // Fallback to LIKE for very short queries
            const likeQuery = `%${sanitizedQuery}%`;
            
            const [blogs, sermons, events] = await Promise.all([
                db.all(`SELECT id, title, slug, excerpt, 'blog' as type, created_at 
                        FROM blog_posts WHERE status = 'published' AND (title LIKE ? OR excerpt LIKE ?) LIMIT 5`, [likeQuery, likeQuery]),
                db.all(`SELECT id, title, slug, description, 'sermon' as type, sermon_date as created_at 
                        FROM sermons WHERE status = 'published' AND (title LIKE ? OR description LIKE ? OR speaker LIKE ?) LIMIT 5`, [likeQuery, likeQuery, likeQuery]),
                db.all(`SELECT id, title, description, 'event' as type, start_time as created_at 
                        FROM events WHERE status = 'published' AND (title LIKE ? OR description LIKE ?) LIMIT 5`, [likeQuery, likeQuery])
            ]);
            
            return res.json({ blogs, sermons, events });
        }

        // Use FULLTEXT search for better relevance
        const matchQuery = `${sanitizedQuery}`;

        const [blogs, sermons, events] = await Promise.all([
            db.all(`SELECT id, title, slug, excerpt, 'blog' as type, created_at 
                    FROM blog_posts 
                    WHERE status = 'published' AND MATCH(title, excerpt, content) AGAINST(? IN BOOLEAN MODE)
                    LIMIT 5`, [matchQuery]),
            db.all(`SELECT id, title, slug, description, 'sermon' as type, sermon_date as created_at 
                    FROM sermons 
                    WHERE status = 'published' AND MATCH(title, description, speaker) AGAINST(? IN BOOLEAN MODE)
                    LIMIT 5`, [matchQuery]),
            // Events doesn't have a FULLTEXT index setup in init-mysql.js, so we use LIKE
            db.all(`SELECT id, title, description, 'event' as type, start_time as created_at 
                    FROM events 
                    WHERE status = 'published' AND (title LIKE ? OR description LIKE ?)
                    LIMIT 5`, [`%${sanitizedQuery}%`, `%${sanitizedQuery}%`])
        ]);

        res.json({ blogs, sermons, events });
    } catch (error) {
        logger.error('Error performing search:', error);
        res.status(500).json({ error: 'Search failed' });
    }
});

module.exports = router;
