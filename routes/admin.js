const express = require('express');
const router = express.Router();
const { verifyToken } = require('./auth');
const BlogPost = require('../database/models/BlogPost');
const Sermon = require('../database/models/Sermon');
const Category = require('../database/models/Category');

// Helper function to generate slug from title
const generateSlug = (title) => {
    return title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-')     // Replace spaces with hyphens
        .trim();
};

// GET /api/admin/stats - Get dashboard statistics
router.get('/stats', verifyToken, async (req, res) => {
    try {
        // Get all posts for stats calculation
        const allPosts = await BlogPost.getAll({ status: null, limit: 1000 });
        const publishedPosts = allPosts.filter(post => post.status === 'published');
        
        const totalPosts = publishedPosts.length;
        const totalViews = publishedPosts.reduce((sum, post) => sum + (post.views || 0), 0);
        const totalLikes = publishedPosts.reduce((sum, post) => sum + (post.likes || 0), 0);

        // Get recent posts
        const recentPosts = await BlogPost.getRecent(5);

        // Get sermons count
        const allSermons = await Sermon.getAll({ limit: 1000 });
        const totalSermons = allSermons.length;

        res.json({
            totalPosts,
            totalViews,
            totalLikes,
            totalSermons,
            recentPosts
        });
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// GET /api/admin/posts - Get all posts for admin (including drafts)
router.get('/posts', verifyToken, async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            category,
            status,
            search,
            sortBy = 'updated_at',
            sortOrder = 'DESC'
        } = req.query;

        // Convert 'all' status to null to fetch all posts
        const actualStatus = (status === 'all' || status === '') ? null : status;

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            category,
            status: actualStatus,
            search,
            sortBy,
            sortOrder
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
            }
        });
    } catch (error) {
        console.error('Error fetching admin posts:', error);
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
});

// POST /api/admin/posts - Create new blog post
router.post('/posts', verifyToken, async (req, res) => {
    try {
        const {
            title,
            excerpt,
            content,
            featured_image,
            image_public_id,
            image_urls,
            category_id,
            status = 'draft',
            published_at
        } = req.body;

        if (!title || !content) {
            return res.status(400).json({ error: 'Title and content are required' });
        }

        // Generate slug from title
        const slug = generateSlug(title);

        // Create post with Cloudinary image data
        const postId = await BlogPost.create({
            title,
            slug,
            excerpt,
            content,
            featured_image,
            image_public_id,
            image_urls,
            author_id: req.user.userId,
            category_id,
            status,
            published_at: status === 'published' ? (published_at || new Date().toISOString()) : published_at
        });

        res.status(201).json({
            message: 'Blog post created successfully',
            postId
        });
    } catch (error) {
        console.error('Error creating blog post:', error);
        res.status(500).json({ error: 'Failed to create blog post' });
    }
});

// PUT /api/admin/posts/:id - Update blog post
router.put('/posts/:id', verifyToken, async (req, res) => {
    try {
        const {
            title,
            excerpt,
            content,
            featured_image,
            image_public_id,
            image_urls,
            category_id,
            status,
            published_at
        } = req.body;

        if (!title || !content) {
            return res.status(400).json({ error: 'Title and content are required' });
        }        // Generate slug from title
        const slug = generateSlug(title);

        const updatedRows = await BlogPost.update(req.params.id, {
            title,
            slug,
            excerpt,
            content,
            featured_image,
            image_public_id,
            image_urls,
            category_id,
            status,
            published_at: status === 'published' ? (published_at || new Date().toISOString()) : published_at
        });

        if (updatedRows === 0) {
            return res.status(404).json({ error: 'Blog post not found' });
        }

        res.json({ message: 'Blog post updated successfully' });
    } catch (error) {
        console.error('Error updating blog post:', error);
        res.status(500).json({ error: 'Failed to update blog post' });
    }
});

// DELETE /api/admin/posts/:id - Delete blog post
router.delete('/posts/:id', verifyToken, async (req, res) => {
    try {
        const deletedRows = await BlogPost.delete(req.params.id);

        if (deletedRows === 0) {
            return res.status(404).json({ error: 'Blog post not found' });
        }

        res.json({ message: 'Blog post deleted successfully' });
    } catch (error) {
        console.error('Error deleting blog post:', error);
        res.status(500).json({ error: 'Failed to delete blog post' });
    }
});

// GET /api/admin/sermons - Get all sermons for admin
router.get('/sermons', verifyToken, async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            series,
            speaker,
            search,
            sortBy = 'sermon_date',
            sortOrder = 'DESC'
        } = req.query;

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            series,
            speaker,
            search,
            sortBy,
            sortOrder
        };

        // For admin, get all sermons regardless of status
        delete options.status;

        const [sermons, totalCount] = await Promise.all([
            Sermon.getAll(options),
            Sermon.getCount(options)
        ]);

        const totalPages = Math.ceil(totalCount / options.limit);

        res.json({
            sermons,
            pagination: {
                currentPage: options.page,
                totalPages,
                totalCount,
                hasNextPage: options.page < totalPages,
                hasPrevPage: options.page > 1
            }
        });
    } catch (error) {
        console.error('Error fetching admin sermons:', error);
        res.status(500).json({ error: 'Failed to fetch sermons' });
    }
});

// POST /api/admin/sermons - Create new sermon
router.post('/sermons', verifyToken, async (req, res) => {
    try {
        const {
            title,
            description,
            speaker,
            series,
            audio_url,
            video_url,
            featured_image,
            scripture_reference,
            sermon_date,
            duration,
            status = 'published'
        } = req.body;

        if (!title || !speaker) {
            return res.status(400).json({ error: 'Title and speaker are required' });
        }

        // Generate slug from title
        const slug = generateSlug(title);

        const sermonId = await Sermon.create({
            title,
            slug,
            description,
            speaker,
            series,
            audio_url,
            video_url,
            featured_image,
            scripture_reference,
            sermon_date,
            duration,
            status
        });

        res.status(201).json({
            message: 'Sermon created successfully',
            sermonId
        });
    } catch (error) {
        console.error('Error creating sermon:', error);
        res.status(500).json({ error: 'Failed to create sermon' });
    }
});

// PUT /api/admin/sermons/:id - Update sermon
router.put('/sermons/:id', verifyToken, async (req, res) => {
    try {
        const {
            title,
            description,
            speaker,
            series,
            audio_url,
            video_url,
            featured_image,
            scripture_reference,
            sermon_date,
            duration,
            status
        } = req.body;

        if (!title || !speaker) {
            return res.status(400).json({ error: 'Title and speaker are required' });
        }

        // Generate slug from title
        const slug = generateSlug(title);

        const updatedRows = await Sermon.update(req.params.id, {
            title,
            slug,
            description,
            speaker,
            series,
            audio_url,
            video_url,
            featured_image,
            scripture_reference,
            sermon_date,
            duration,
            status
        });

        if (updatedRows === 0) {
            return res.status(404).json({ error: 'Sermon not found' });
        }

        res.json({ message: 'Sermon updated successfully' });
    } catch (error) {
        console.error('Error updating sermon:', error);
        res.status(500).json({ error: 'Failed to update sermon' });
    }
});

// DELETE /api/admin/sermons/:id - Delete sermon
router.delete('/sermons/:id', verifyToken, async (req, res) => {
    try {
        const deletedRows = await Sermon.delete(req.params.id);

        if (deletedRows === 0) {
            return res.status(404).json({ error: 'Sermon not found' });
        }

        res.json({ message: 'Sermon deleted successfully' });
    } catch (error) {
        console.error('Error deleting sermon:', error);
        res.status(500).json({ error: 'Failed to delete sermon' });
    }
});

// GET /api/admin/categories - Get all categories
router.get('/categories', verifyToken, async (req, res) => {
    try {
        const categories = await Category.getAll();
        res.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

module.exports = router;
