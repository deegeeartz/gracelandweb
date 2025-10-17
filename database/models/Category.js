const { db } = require('../db-manager');

class CategoryModel {
    // Get all categories
    static async getAll() {
        const query = `
            SELECT c.*, COUNT(bp.id) as post_count
            FROM categories c
            LEFT JOIN blog_posts bp ON c.id = bp.category_id
            GROUP BY c.id
            ORDER BY c.name
        `;
        return await db.all(query, []);
    }

    // Get category by ID or slug
    static async getById(id) {
        const query = 'SELECT * FROM categories WHERE id = ? OR slug = ?';
        return await db.get(query, [id, id]);
    }

    // Create new category
    static async create(categoryData) {
        const { name, slug, description } = categoryData;

        const query = `
            INSERT INTO categories (name, slug, description)
            VALUES (?, ?, ?)
        `;

        const result = await db.run(query, [name, slug, description]);
        return result.lastID;
    }

    // Update category
    static async update(id, categoryData) {
        const { name, slug, description } = categoryData;

        const query = `
            UPDATE categories 
            SET name = ?, slug = ?, description = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;

        const result = await db.run(query, [name, slug, description, id]);
        return result.changes;
    }

    // Delete category
    static async delete(id) {
        const query = 'DELETE FROM categories WHERE id = ?';
        const result = await db.run(query, [id]);
        return result.changes;
    }
}

module.exports = CategoryModel;