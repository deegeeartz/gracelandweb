const { db } = require('../init-db');

class SettingsModel {
    // Get all settings
    static async getAll() {
        const query = 'SELECT * FROM settings ORDER BY key';
        
        return new Promise((resolve, reject) => {
            db.all(query, [], (err, rows) => {
                if (err) reject(err);
                else {
                    // Convert to key-value object
                    const settings = {};
                    rows.forEach(row => {
                        let value = row.value;
                        // Parse based on type
                        if (row.type === 'number') {
                            value = parseFloat(value);
                        } else if (row.type === 'boolean') {
                            value = value === 'true';
                        } else if (row.type === 'json') {
                            try {
                                value = JSON.parse(value);
                            } catch (e) {
                                value = row.value;
                            }
                        }
                        settings[row.key] = value;
                    });
                    resolve(settings);
                }
            });
        });
    }

    // Get single setting by key
    static async getByKey(key) {
        const query = 'SELECT * FROM settings WHERE key = ?';
        
        return new Promise((resolve, reject) => {
            db.get(query, [key], (err, row) => {
                if (err) reject(err);
                else {
                    if (!row) {
                        resolve(null);
                        return;
                    }
                    
                    let value = row.value;
                    // Parse based on type
                    if (row.type === 'number') {
                        value = parseFloat(value);
                    } else if (row.type === 'boolean') {
                        value = value === 'true';
                    } else if (row.type === 'json') {
                        try {
                            value = JSON.parse(value);
                        } catch (e) {
                            value = row.value;
                        }
                    }
                    resolve(value);
                }
            });
        });
    }

    // Update or create setting
    static async set(key, value, type = 'string', description = null) {
        // Convert value to string for storage
        let stringValue = value;
        if (type === 'json') {
            stringValue = JSON.stringify(value);
        } else if (type === 'boolean') {
            stringValue = value ? 'true' : 'false';
        } else {
            stringValue = String(value);
        }

        const query = `
            INSERT OR REPLACE INTO settings (key, value, type, description, updated_at)
            VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
        `;

        return new Promise((resolve, reject) => {
            db.run(query, [key, stringValue, type, description], function(err) {
                if (err) reject(err);
                else resolve(this.changes);
            });
        });
    }

    // Update multiple settings
    static async updateMultiple(settings) {
        const stmt = db.prepare(`
            INSERT OR REPLACE INTO settings (key, value, type, updated_at)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        `);

        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.run('BEGIN TRANSACTION');
                
                for (const [key, data] of Object.entries(settings)) {
                    const { value, type = 'string' } = data;
                    
                    let stringValue = value;
                    if (type === 'json') {
                        stringValue = JSON.stringify(value);
                    } else if (type === 'boolean') {
                        stringValue = value ? 'true' : 'false';
                    } else {
                        stringValue = String(value);
                    }
                    
                    stmt.run([key, stringValue, type]);
                }
                
                db.run('COMMIT', (err) => {
                    if (err) {
                        db.run('ROLLBACK');
                        reject(err);
                    } else {
                        resolve(true);
                    }
                });
            });
        });
    }

    // Delete setting
    static async delete(key) {
        const query = 'DELETE FROM settings WHERE key = ?';
        
        return new Promise((resolve, reject) => {
            db.run(query, [key], function(err) {
                if (err) reject(err);
                else resolve(this.changes);
            });
        });
    }
}

module.exports = SettingsModel;
