const express = require('express');
const router = express.Router();
const BlogPost = require('../database/models/BlogPost');
const Category = require('../database/models/Category');
const logger = require('../utils/logger');
const Sanitizer = require('../utils/sanitizer');

// GET /api/blog - Get all blog posts with pagination and filters
router.get('/', async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            category,
            search,
            sortBy = 'published_at',
            sortOrder = 'DESC'
        } = req.query;

        // Validate and sanitize pagination parameters
        const sanitized = Sanitizer.sanitizePagination(page, limit);

        const options = {
            page: sanitized.page,
            limit: sanitized.limit,
            category: category ? Sanitizer.sanitizeText(category) : undefined,
            search: search ? Sanitizer.sanitizeText(search) : undefined,
            sortBy,
            sortOrder,
            status: 'published'
        };

        const [posts, totalCount] = await Promise.all([
            BlogPost.getAll(options),
            BlogPost.getCount(options)
        ]);

        const totalPages = Math.ceil(totalCount / options.limit);

        res.json({
            posts,
            pagination: {
                currentPage: options.page,
                totalPages,
                totalCount,
                hasNextPage: options.page < totalPages,
                hasPrevPage: options.page > 1
            }        });
    } catch (error) {
        logger.error('Error fetching blog posts:', error);
        res.status(500).json({ error: 'Failed to fetch blog posts' });
    }
});

// GET /api/blog/categories - Get all categories with post counts
router.get('/categories', async (req, res) => {
    try {
        const categories = await Category.getAll();
        res.json(categories);
    } catch (error) {
        logger.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

// GET /api/blog/recent - Get recent blog posts
router.get('/recent', async (req, res) => {
    try {
        const limit = Sanitizer.sanitizeInt(req.query.limit, 5, 1, 20);
        const posts = await BlogPost.getRecent(limit);
        res.json(posts);
    } catch (error) {
        logger.error('Error fetching recent posts:', error);
        res.status(500).json({ error: 'Failed to fetch recent posts' });
    }
});

// GET /api/blog/:id - Get single blog post (by ID or slug)
router.get('/:id', async (req, res) => {
    try {
        const identifier = req.params.id;
        
        // Try to fetch by ID first, then by slug
        let post = await BlogPost.getById(identifier);
        
        // If not found by ID and identifier is not a number, try slug
        if (!post && isNaN(identifier)) {
            post = await BlogPost.getBySlug(identifier);
        }
        
        if (!post) {
            return res.status(404).json({ error: 'Blog post not found' });
        }

        // Only show published posts on public blog
        if (post.status !== 'published') {
            return res.status(404).json({ error: 'Blog post not found' });
        }

        // Increment view count
        await BlogPost.incrementViews(post.id);
        post.views = (post.views || 0) + 1;        res.json(post);
    } catch (error) {
        logger.error('Error fetching blog post:', error);
        res.status(500).json({ error: 'Failed to fetch blog post' });
    }
});

// GET /api/blog/category/:slug - Get posts by category
router.get('/category/:slug', async (req, res) => {
    try {
        // Validate and sanitize slug
        const slug = Sanitizer.sanitizeSlug(req.params.slug);
        
        if (!slug) {
            return res.status(400).json({ error: 'Invalid category slug' });
        }
        
        const limit = Sanitizer.sanitizeInt(req.query.limit, 10, 1, 50);
        const posts = await BlogPost.getByCategory(slug, limit);
        res.json(posts);
    } catch (error) {
        logger.error('Error fetching posts by category:', error);
        res.status(500).json({ error: 'Failed to fetch posts by category' });
    }
});

module.exports = router;
