const { db } = require('../db-manager');

class SettingsModel {
    // Get all settings
    static async getAll() {
        const query = 'SELECT * FROM settings ORDER BY `key`';
        return await db.all(query, []);
    }

    // Get settings as key-value object
    static async getAsObject() {
        const query = 'SELECT * FROM settings';
        const settings = await db.all(query, []);
        
        const settingsObj = {};
        settings.forEach(setting => {
            try {
                settingsObj[setting.key] = JSON.parse(setting.value);
            } catch (e) {
                settingsObj[setting.key] = setting.value;
            }
        });
        
        return settingsObj;
    }

    // Get single setting by key
    static async getByKey(key) {
        const query = 'SELECT * FROM settings WHERE `key` = ?';
        const setting = await db.get(query, [key]);
        
        if (!setting) return null;
        
        try {
            return JSON.parse(setting.value);
        } catch (e) {
            return setting.value;
        }
    }

    // Set single setting (MySQL version)
    static async set(key, value, description = null) {
        const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
        
        const query = `
            INSERT INTO settings (\`key\`, value, description)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE 
            value = VALUES(value),
            description = VALUES(description),
            updated_at = CURRENT_TIMESTAMP
        `;

        const result = await db.run(query, [key, stringValue, description]);
        return result.changes;
    }

    // Update multiple settings
    static async updateMultiple(settingsObj) {
        const keys = Object.keys(settingsObj);
        let updated = 0;
        
        for (const key of keys) {
            const result = await this.set(key, settingsObj[key]);
            updated += result;
        }
        
        return updated;
    }

    // Delete setting
    static async delete(key) {
        const query = 'DELETE FROM settings WHERE `key` = ?';
        const result = await db.run(query, [key]);
        return result.changes;
    }
}

module.exports = SettingsModel;