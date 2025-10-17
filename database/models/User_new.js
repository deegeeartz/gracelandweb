const { db } = require('../db-manager');

class UserModel {
    // Get user by username or email
    static async getByCredentials(usernameOrEmail) {
        const query = 'SELECT * FROM users WHERE username = ? OR email = ?';
        return await db.get(query, [usernameOrEmail, usernameOrEmail]);
    }

    // Get user by ID
    static async getById(id) {
        const query = 'SELECT * FROM users WHERE id = ?';
        return await db.get(query, [id]);
    }

    // Create new user
    static async create(userData) {
        const {
            username,
            email,
            password_hash,
            first_name,
            last_name,
            role = 'admin'
        } = userData;

        const query = `
            INSERT INTO users (
                username, email, password_hash, first_name, 
                last_name, role
            ) VALUES (?, ?, ?, ?, ?, ?)
        `;

        const result = await db.run(query, [
            username, email, password_hash, first_name, 
            last_name, role
        ]);
        return result.lastID;
    }

    // Update user
    static async update(id, userData) {
        const {
            username,
            email,
            first_name,
            last_name,
            role
        } = userData;

        const query = `
            UPDATE users 
            SET username = ?, email = ?, first_name = ?, 
                last_name = ?, role = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;

        const result = await db.run(query, [
            username, email, first_name, last_name, role, id
        ]);
        return result.changes;
    }

    // Delete user
    static async delete(id) {
        const query = 'DELETE FROM users WHERE id = ?';
        const result = await db.run(query, [id]);
        return result.changes;
    }
}

module.exports = UserModel;
