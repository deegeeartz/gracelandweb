const { db } = require('../db-manager');

class SermonModel {
    // Get all sermons with pagination and filters
    static async getAll(options = {}) {
        const {
            page = 1,
            limit = 10,
            series = null,
            speaker = null,
            search = null,
            sortBy = 'sermon_date',
            sortOrder = 'DESC'
        } = options;

        const offset = (page - 1) * limit;
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
            SELECT * FROM sermons
            ${whereString}
            ORDER BY ${sortBy} ${sortOrder}
            LIMIT ? OFFSET ?
        `;

        params.push(limit, offset);
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
            audio_url,
            video_url,
            featured_image,
            scripture_reference,
            sermon_date,
            duration,
            status = 'published'
        } = sermonData;

        const query = `
            INSERT INTO sermons (
                title, slug, description, speaker, series, audio_url, 
                video_url, featured_image, scripture_reference, 
                sermon_date, duration, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const result = await db.run(query, [
            title, slug, description, speaker, series, audio_url,
            video_url, featured_image, scripture_reference,
            sermon_date, duration, status
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
            audio_url,
            video_url,
            featured_image,
            scripture_reference,
            sermon_date,
            duration,
            status
        } = sermonData;

        const query = `
            UPDATE sermons 
            SET title = ?, slug = ?, description = ?, speaker = ?, 
                series = ?, audio_url = ?, video_url = ?, 
                featured_image = ?, scripture_reference = ?, 
                sermon_date = ?, duration = ?, status = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;

        const result = await db.run(query, [
            title, slug, description, speaker, series, audio_url,
            video_url, featured_image, scripture_reference,
            sermon_date, duration, status, id
        ]);
        return result.changes;
    }

    // Delete sermon
    static async delete(id) {
        const query = 'DELETE FROM sermons WHERE id = ?';
        const result = await db.run(query, [id]);
        return result.changes;
    }

    // Increment listens
    static async incrementListens(id) {
        const query = 'UPDATE sermons SET listens = listens + 1 WHERE id = ?';
        const result = await db.run(query, [id]);
        return result.changes;
    }

    // Increment downloads
    static async incrementDownloads(id) {
        const query = 'UPDATE sermons SET downloads = downloads + 1 WHERE id = ?';
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

        return await db.all(query, [limit]);
    }

    // Get sermon series
    static async getSeries() {
        const query = `
            SELECT series, COUNT(*) as count
            FROM sermons
            WHERE status = 'published' AND series IS NOT NULL
            GROUP BY series
            ORDER BY count DESC
        `;

        return await db.all(query, []);
    }

    // Get speakers
    static async getSpeakers() {
        const query = `
            SELECT speaker, COUNT(*) as count
            FROM sermons
            WHERE status = 'published'
            GROUP BY speaker
            ORDER BY count DESC
        `;

        return await db.all(query, []);
    }

    // Get total count
    static async getCount(options = {}) {
        const { series = null, speaker = null, search = null } = options;
        
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
        const query = `SELECT COUNT(*) as count FROM sermons ${whereString}`;

        const row = await db.get(query, params);
        return row ? row.count : 0;
    }
}

module.exports = SermonModel;
