const { db } = require('../db-manager');

class UserModel {
    // Get user by username or email
    static async getByCredentials(usernameOrEmail) {
        const query = 'SELECT * FROM users WHERE username = ? OR email = ?';
        
        return new Promise((resolve, reject) => {
            db.get(query, [usernameOrEmail, usernameOrEmail], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    // Get user by ID
    static async getById(id) {
        const query = 'SELECT id, username, email, role, created_at FROM users WHERE id = ?';
        
        return new Promise((resolve, reject) => {
            db.get(query, [id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    // Create new user
    static async create(userData) {
        const { username, email, password_hash, role = 'admin' } = userData;
        
        const query = `
            INSERT INTO users (username, email, password_hash, role)
            VALUES (?, ?, ?, ?)
        `;

        return new Promise((resolve, reject) => {
            db.run(query, [username, email, password_hash, role], function(err) {
                if (err) reject(err);
                else resolve(this.lastID);
            });
        });
    }

    // Update user
    static async update(id, userData) {
        const { username, email, password_hash } = userData;
        
        let query = 'UPDATE users SET username = ?, email = ?';
        let params = [username, email];
        
        if (password_hash) {
            query += ', password_hash = ?';
            params.push(password_hash);
        }
        
        query += ', updated_at = CURRENT_TIMESTAMP WHERE id = ?';
        params.push(id);

        return new Promise((resolve, reject) => {
            db.run(query, params, function(err) {
                if (err) reject(err);
                else resolve(this.changes);
            });
        });
    }

    // Get all users (admin only)
    static async getAll() {
        const query = 'SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC';
        
        return new Promise((resolve, reject) => {
            db.all(query, [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }
}

module.exports = UserModel;
