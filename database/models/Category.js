const { db } = require('../init-db');

class CategoryModel {
    // Get all categories
    static async getAll() {
        const query = `
            SELECT 
                c.*,
                COUNT(bp.id) as post_count
            FROM categories c
            LEFT JOIN blog_posts bp ON c.id = bp.category_id AND bp.status = 'published'
            GROUP BY c.id
            ORDER BY c.name
        `;

        return new Promise((resolve, reject) => {
            db.all(query, [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    // Get category by slug
    static async getBySlug(slug) {
        const query = 'SELECT * FROM categories WHERE slug = ?';
        
        return new Promise((resolve, reject) => {
            db.get(query, [slug], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    // Create new category
    static async create(categoryData) {
        const { name, slug, description } = categoryData;
        
        const query = 'INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)';

        return new Promise((resolve, reject) => {
            db.run(query, [name, slug, description], function(err) {
                if (err) reject(err);
                else resolve(this.lastID);
            });
        });
    }

    // Update category
    static async update(id, categoryData) {
        const { name, slug, description } = categoryData;
        
        const query = 'UPDATE categories SET name = ?, slug = ?, description = ? WHERE id = ?';

        return new Promise((resolve, reject) => {
            db.run(query, [name, slug, description, id], function(err) {
                if (err) reject(err);
                else resolve(this.changes);
            });
        });
    }

    // Delete category
    static async delete(id) {
        const query = 'DELETE FROM categories WHERE id = ?';
        
        return new Promise((resolve, reject) => {
            db.run(query, [id], function(err) {
                if (err) reject(err);
                else resolve(this.changes);
            });
        });
    }
}

module.exports = CategoryModel;
