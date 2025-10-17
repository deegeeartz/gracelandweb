const { db } = require('../db-manager');

class SermonModel {    // Get all sermons with pagination and filters
    static async getAll(options = {}) {
        const {
            page = 1,
            limit = 10,
            series = null,
            speaker = null,
            search = null,
            status = 'published',
            sortBy = 'sermon_date',
            sortOrder = 'DESC'
        } = options;

        // Ensure page and limit are valid integers
        const validPage = Math.max(1, parseInt(page) || 1);
        const validLimit = Math.max(1, Math.min(parseInt(limit) || 10, 1000));
        const offset = (validPage - 1) * validLimit;

        let whereClause = [];
        let params = [];

        // Only add status filter if it's explicitly set (not null or undefined)
        if (status !== null && status !== undefined) {
            whereClause.push('status = ?');
            params.push(status);
        }

        if (series) {
            whereClause.push('series = ?');
            params.push(series);
        }

        if (speaker) {
            whereClause.push('speaker LIKE ?');
            params.push(`%${speaker}%`);
        }

        if (search) {
            whereClause.push('(title LIKE ? OR description LIKE ? OR speaker LIKE ?)');
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        const whereString = whereClause.length > 0 ? `WHERE ${whereClause.join(' AND ')}` : '';

        const query = `
            SELECT * FROM sermons
            ${whereString}
            ORDER BY ${sortBy} ${sortOrder}
            LIMIT ? OFFSET ?
        `;

        params.push(validLimit, offset);
        return await db.all(query, params);
    }

    // Get sermon by ID or slug
    static async getById(id) {
        const query = 'SELECT * FROM sermons WHERE id = ? OR slug = ?';
        return await db.get(query, [id, id]);
    }

    // Create new sermon
    static async create(sermonData) {
        const {
            title,
            slug,
            description,
            speaker,
            series,
            sermon_date,
            audio_url,
            video_url,
            scripture_reference,
            status = 'published'
        } = sermonData;

        const query = `
            INSERT INTO sermons (
                title, slug, description, speaker, series,
                sermon_date, audio_url, video_url, scripture_reference, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const result = await db.run(query, [
            title, slug, description, speaker, series,
            sermon_date, audio_url, video_url, scripture_reference, status
        ]);
        return result.lastID;
    }

    // Update sermon
    static async update(id, sermonData) {
        const {
            title,
            slug,
            description,
            speaker,
            series,
            sermon_date,
            audio_url,
            video_url,
            scripture_reference,
            status
        } = sermonData;

        const query = `
            UPDATE sermons 
            SET title = ?, slug = ?, description = ?, speaker = ?, series = ?,
                sermon_date = ?, audio_url = ?, video_url = ?, 
                scripture_reference = ?, status = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;

        const result = await db.run(query, [
            title, slug, description, speaker, series,
            sermon_date, audio_url, video_url, scripture_reference, status, id
        ]);
        return result.changes;
    }

    // Delete sermon
    static async delete(id) {
        const query = 'DELETE FROM sermons WHERE id = ?';
        const result = await db.run(query, [id]);
        return result.changes;
    }

    // Get recent sermons
    static async getRecent(limit = 5) {
        const query = `
            SELECT * FROM sermons
            WHERE status = 'published'
            ORDER BY sermon_date DESC
            LIMIT ?
        `;
        return await db.all(query, [parseInt(limit)]);
    }

    // Get sermons by series
    static async getBySeries(series, limit = 10) {
        const query = `
            SELECT * FROM sermons
            WHERE series = ? AND status = 'published'
            ORDER BY sermon_date DESC
            LIMIT ?
        `;
        return await db.all(query, [series, parseInt(limit)]);
    }

    // Search sermons
    static async search(searchTerm, limit = 10) {
        const query = `
            SELECT * FROM sermons
            WHERE status = 'published' 
            AND (title LIKE ? OR description LIKE ? OR speaker LIKE ? OR scripture_reference LIKE ?)
            ORDER BY sermon_date DESC
            LIMIT ?
        `;
        const searchPattern = `%${searchTerm}%`;
        return await db.all(query, [searchPattern, searchPattern, searchPattern, searchPattern, parseInt(limit)]);
    }

    // Get sermon count
    static async getCount(filters = {}) {
        const { series = null, speaker = null, search = null } = filters;
        
        let whereClause = ['status = "published"'];
        let params = [];

        if (series) {
            whereClause.push('series = ?');
            params.push(series);
        }

        if (speaker) {
            whereClause.push('speaker LIKE ?');
            params.push(`%${speaker}%`);
        }

        if (search) {
            whereClause.push('(title LIKE ? OR description LIKE ? OR speaker LIKE ?)');
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        const whereString = `WHERE ${whereClause.join(' AND ')}`;

        const query = `
            SELECT COUNT(*) as count
            FROM sermons
            ${whereString}
        `;

        const result = await db.get(query, params);
        return result.count;
    }

    // Get unique series
    static async getSeries() {
        const query = `
            SELECT DISTINCT series
            FROM sermons
            WHERE series IS NOT NULL AND series != ''
            ORDER BY series
        `;
        const results = await db.all(query, []);
        return results.map(row => row.series);
    }

    // Get unique speakers
    static async getSpeakers() {
        const query = `
            SELECT DISTINCT speaker
            FROM sermons
            WHERE speaker IS NOT NULL AND speaker != ''
            ORDER BY speaker
        `;
        const results = await db.all(query, []);
        return results.map(row => row.speaker);
    }
}

module.exports = SermonModel;