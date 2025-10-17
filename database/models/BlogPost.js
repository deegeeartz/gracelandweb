const { db } = require('../db-manager');

class BlogPostModel {    // Get all blog posts with pagination and filters
    static async getAll(options = {}) {
        const {
            page = 1,
            limit = 10,
            category = null,
            status = 'published',
            search = null,
            sortBy = 'created_at',
            sortOrder = 'DESC'        } = options;

        // Ensure page and limit are valid integers
        const validPage = Math.max(1, parseInt(page) || 1);
        const validLimit = Math.max(1, Math.min(parseInt(limit) || 10, 1000));
        const offset = (validPage - 1) * validLimit;

        let whereClause = [];
        let params = [];

        // Only add status filter if it's explicitly set (not null or undefined)
        if (status !== null && status !== undefined) {
            whereClause.push('bp.status = ?');
            params.push(status);
        }

        if (category) {
            whereClause.push('c.slug = ?');
            params.push(category);
        }

        if (search) {
            whereClause.push('(bp.title LIKE ? OR bp.excerpt LIKE ? OR bp.content LIKE ?)');
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        const whereString = whereClause.length > 0 ? `WHERE ${whereClause.join(' AND ')}` : '';

        const query = `
            SELECT 
                bp.*,
                c.name as category_name,
                c.slug as category_slug,
                u.username as author_name
            FROM blog_posts bp
            LEFT JOIN categories c ON bp.category_id = c.id
            LEFT JOIN users u ON bp.author_id = u.id
            ${whereString}
            ORDER BY bp.${sortBy} ${sortOrder}
            LIMIT ? OFFSET ?
        `;        params.push(validLimit, offset);
        return await db.all(query, params);
    }

    // Get blog post by slug
    static async getBySlug(slug) {
        const query = `
            SELECT 
                bp.*,
                c.name as category_name,
                c.slug as category_slug,
                u.username as author_name
            FROM blog_posts bp
            LEFT JOIN categories c ON bp.category_id = c.id
            LEFT JOIN users u ON bp.author_id = u.id
            WHERE bp.slug = ? AND bp.status = 'published'
        `;
        return await db.get(query, [slug]);
    }

    // Get blog post by ID
    static async getById(id) {
        const query = `
            SELECT 
                bp.*,
                c.name as category_name,
                c.slug as category_slug,
                u.username as author_name
            FROM blog_posts bp
            LEFT JOIN categories c ON bp.category_id = c.id
            LEFT JOIN users u ON bp.author_id = u.id
            WHERE bp.id = ?
        `;
        return await db.get(query, [id]);
    }

    // Create new blog post
    static async create(postData) {
        const {
            title,
            slug,
            excerpt,
            content,
            author_id,
            category_id,
            status = 'draft',
            published_at = null
        } = postData;

        const query = `
            INSERT INTO blog_posts (
                title, slug, excerpt, content, author_id, 
                category_id, status, published_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const result = await db.run(query, [
            title, slug, excerpt, content, author_id,
            category_id, status, published_at
        ]);
        return result.lastID;
    }

    // Update blog post
    static async update(id, postData) {
        const {
            title,
            slug,
            excerpt,
            content,
            category_id,
            status,
            published_at
        } = postData;

        const query = `
            UPDATE blog_posts 
            SET title = ?, slug = ?, excerpt = ?, content = ?, 
                category_id = ?, status = ?, published_at = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;

        const result = await db.run(query, [
            title, slug, excerpt, content, category_id, 
            status, published_at, id
        ]);
        return result.changes;
    }

    // Delete blog post
    static async delete(id) {
        const query = 'DELETE FROM blog_posts WHERE id = ?';
        const result = await db.run(query, [id]);
        return result.changes;
    }

    // Get recent posts
    static async getRecent(limit = 5) {
        const query = `
            SELECT 
                bp.*,
                c.name as category_name,
                c.slug as category_slug
            FROM blog_posts bp
            LEFT JOIN categories c ON bp.category_id = c.id
            WHERE bp.status = 'published'
            ORDER BY bp.published_at DESC
            LIMIT ?
        `;
        return await db.all(query, [parseInt(limit)]);
    }

    // Get posts by category
    static async getByCategory(categorySlug, limit = 10) {
        const query = `
            SELECT 
                bp.*,
                c.name as category_name,
                c.slug as category_slug
            FROM blog_posts bp
            JOIN categories c ON bp.category_id = c.id
            WHERE c.slug = ? AND bp.status = 'published'
            ORDER BY bp.published_at DESC
            LIMIT ?
        `;
        return await db.all(query, [categorySlug, parseInt(limit)]);
    }

    // Search posts
    static async search(searchTerm, limit = 10) {
        const query = `
            SELECT 
                bp.*,
                c.name as category_name,
                c.slug as category_slug
            FROM blog_posts bp
            LEFT JOIN categories c ON bp.category_id = c.id
            WHERE bp.status = 'published' 
            AND (bp.title LIKE ? OR bp.excerpt LIKE ? OR bp.content LIKE ?)
            ORDER BY bp.published_at DESC
            LIMIT ?
        `;
        const searchPattern = `%${searchTerm}%`;
        return await db.all(query, [searchPattern, searchPattern, searchPattern, parseInt(limit)]);
    }    // Get post count
    static async getCount(filters = {}) {
        const { category = null, status = 'published', search = null } = filters;
        
        let whereClause = [];
        let params = [];

        // Only add status filter if it's explicitly set (not null or undefined)
        if (status !== null && status !== undefined) {
            whereClause.push('bp.status = ?');
            params.push(status);
        }

        if (category) {
            whereClause.push('c.slug = ?');
            params.push(category);
        }

        if (search) {
            whereClause.push('(bp.title LIKE ? OR bp.excerpt LIKE ? OR bp.content LIKE ?)');
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        const whereString = whereClause.length > 0 ? `WHERE ${whereClause.join(' AND ')}` : '';

        const query = `
            SELECT COUNT(*) as count
            FROM blog_posts bp
            LEFT JOIN categories c ON bp.category_id = c.id
            ${whereString}
        `;

        const result = await db.get(query, params);
        return result.count;
    }

    // Increment post views
    static async incrementViews(id) {
        const query = 'UPDATE blog_posts SET views = views + 1 WHERE id = ?';
        return await db.run(query, [id]);
    }

    // Increment post likes
    static async incrementLikes(id) {
        const query = 'UPDATE blog_posts SET likes = likes + 1 WHERE id = ?';
        return await db.run(query, [id]);
    }
}

module.exports = BlogPostModel;