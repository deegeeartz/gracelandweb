const { db } = require('../db-manager');

class SettingsModel {
    // Get all settings
    static async getAll() {
        const query = 'SELECT * FROM settings ORDER BY key';
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
        const query = 'SELECT * FROM settings WHERE key = ?';
        const setting = await db.get(query, [key]);
        
        if (!setting) return null;
        
        try {
            return JSON.parse(setting.value);
        } catch (e) {
            return setting.value;
        }
    }

    // Set single setting
    static async set(key, value, description = null) {
        const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
        
        const query = `
            INSERT OR REPLACE INTO settings (key, value, description)
            VALUES (?, ?, ?)
        `;

        const result = await db.run(query, [key, stringValue, description]);
        return result.changes;
    }

    // Update multiple settings
    static async updateMultiple(settingsObj) {
        const query = `
            INSERT OR REPLACE INTO settings (key, value, description)
            VALUES (?, ?, ?)
        `;

        let totalChanges = 0;
        for (const [key, value] of Object.entries(settingsObj)) {
            const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
            const result = await db.run(query, [key, stringValue, null]);
            totalChanges += result.changes;
        }
        
        return totalChanges;
    }

    // Delete setting
    static async delete(key) {
        const query = 'DELETE FROM settings WHERE key = ?';
        const result = await db.run(query, [key]);
        return result.changes;
    }

    // Get site configuration (common settings)
    static async getSiteConfig() {
        const configKeys = [
            'site_title', 'site_description', 'site_logo', 
            'contact_email', 'contact_phone', 'social_facebook', 
            'social_instagram', 'social_youtube'
        ];
        
        const query = `SELECT * FROM settings WHERE key IN (${configKeys.map(() => '?').join(',')})`;
        const settings = await db.all(query, configKeys);
        
        const config = {};
        settings.forEach(setting => {
            try {
                config[setting.key] = JSON.parse(setting.value);
            } catch (e) {
                config[setting.key] = setting.value;
            }
        });
        
        return config;
    }
}

module.exports = SettingsModel;
