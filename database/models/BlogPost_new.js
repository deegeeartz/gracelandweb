const { db } = require('../db-manager');

class BlogPostModel {
    // Get all blog posts with pagination and filters
    static async getAll(options = {}) {
        const {
            page = 1,
            limit = 10,
            category = null,
            status = 'published',
            search = null,
            sortBy = 'created_at',
            sortOrder = 'DESC'
        } = options;

        const offset = (page - 1) * limit;
        let whereClause = [];
        let params = [];

        if (status) {
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
        `;

        params.push(limit, offset);
        return await db.all(query, params);
    }

    // Get total count for pagination
    static async getCount(options = {}) {
        const { category = null, status = 'published', search = null } = options;
        
        let whereClause = [];
        let params = [];

        if (status) {
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

        const row = await db.get(query, params);
        return row ? row.count : 0;
    }

    // Get single blog post by ID or slug
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
            WHERE bp.id = ? OR bp.slug = ?
        `;

        return await db.get(query, [id, id]);
    }

    // Create new blog post
    static async create(postData) {
        const {
            title,
            slug,
            excerpt,
            content,
            featured_image,
            author_id,
            category_id,
            status = 'draft',
            published_at
        } = postData;

        const query = `
            INSERT INTO blog_posts (
                title, slug, excerpt, content, featured_image, 
                author_id, category_id, status, published_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const result = await db.run(query, [
            title, slug, excerpt, content, featured_image,
            author_id, category_id, status, published_at
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
            featured_image,
            category_id,
            status,
            published_at
        } = postData;

        const query = `
            UPDATE blog_posts 
            SET title = ?, slug = ?, excerpt = ?, content = ?, 
                featured_image = ?, category_id = ?, status = ?, 
                published_at = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;

        const result = await db.run(query, [
            title, slug, excerpt, content, featured_image,
            category_id, status, published_at, id
        ]);
        return result.changes;
    }

    // Delete blog post
    static async delete(id) {
        const query = 'DELETE FROM blog_posts WHERE id = ?';
        const result = await db.run(query, [id]);
        return result.changes;
    }

    // Increment views
    static async incrementViews(id) {
        const query = 'UPDATE blog_posts SET views = views + 1 WHERE id = ?';
        const result = await db.run(query, [id]);
        return result.changes;
    }

    // Get recent posts
    static async getRecent(limit = 5) {
        const query = `
            SELECT 
                bp.*,
                c.name as category_name,
                c.slug as category_slug,
                u.username as author_name
            FROM blog_posts bp
            LEFT JOIN categories c ON bp.category_id = c.id
            LEFT JOIN users u ON bp.author_id = u.id
            WHERE bp.status = 'published'
            ORDER BY bp.published_at DESC
            LIMIT ?
        `;

        return await db.all(query, [limit]);
    }

    // Get posts by category
    static async getByCategory(categorySlug, limit = 10) {
        const query = `
            SELECT 
                bp.*,
                c.name as category_name,
                c.slug as category_slug,
                u.username as author_name
            FROM blog_posts bp
            JOIN categories c ON bp.category_id = c.id
            LEFT JOIN users u ON bp.author_id = u.id
            WHERE c.slug = ? AND bp.status = 'published'
            ORDER BY bp.published_at DESC
            LIMIT ?
        `;

        return await db.all(query, [categorySlug, limit]);
    }
}

module.exports = BlogPostModel;
