const express = require('express');
const router = express.Router();
const { db } = require('../database/db-manager');
const logger = require('../utils/logger');
const Sanitizer = require('../utils/sanitizer');

// Public: Get approved comments for a post
router.get('/post/:postId', async (req, res) => {
    try {
        const comments = await db.all(`
            SELECT id, name, comment, created_at 
            FROM comments 
            WHERE post_id = ? AND status = 'approved'
            ORDER BY created_at DESC
        `, [req.params.postId]);
        res.json(comments);
    } catch (error) {
        logger.error('Error fetching comments:', error);
        res.status(500).json({ error: 'Failed to fetch comments' });
    }
});

// Public: Submit a new comment
router.post('/post/:postId', async (req, res) => {
    try {
        const postId = req.params.postId;
        const { name, email, comment } = req.body;

        if (!name || !email || !comment) {
            return res.status(400).json({ error: 'Name, email, and comment are required' });
        }

        const sanitizedName = Sanitizer.sanitizeText(name);
        const sanitizedEmail = Sanitizer.sanitizeText(email);
        const sanitizedComment = Sanitizer.sanitizeText(comment);

        // Verify post exists
        const post = await db.get(`SELECT id FROM blog_posts WHERE id = ?`, [postId]);
        if (!post) {
            return res.status(404).json({ error: 'Blog post not found' });
        }

        await db.run(
            `INSERT INTO comments (post_id, name, email, comment, status) 
             VALUES (?, ?, ?, ?, 'pending')`,
            [postId, sanitizedName, sanitizedEmail, sanitizedComment]
        );

        res.json({ success: true, message: 'Comment submitted and awaiting approval' });
    } catch (error) {
        logger.error('Error submitting comment:', error);
        res.status(500).json({ error: 'Failed to submit comment' });
    }
});

module.exports = router;
