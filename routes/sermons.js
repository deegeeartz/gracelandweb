const express = require('express');
const router = express.Router();
const Sermon = require('../database/models/Sermon');

// GET /api/sermons - Get all sermons with pagination and filters
router.get('/', async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            series,
            speaker,
            search,
            sortBy = 'sermon_date',
            sortOrder = 'DESC'
        } = req.query;

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            series,
            speaker,
            search,
            sortBy,
            sortOrder
        };

        const [sermons, totalCount] = await Promise.all([
            Sermon.getAll(options),
            Sermon.getCount(options)
        ]);

        const totalPages = Math.ceil(totalCount / options.limit);

        res.json({
            sermons,
            pagination: {
                currentPage: options.page,
                totalPages,
                totalCount,
                hasNextPage: options.page < totalPages,
                hasPrevPage: options.page > 1
            }
        });
    } catch (error) {
        console.error('Error fetching sermons:', error);
        res.status(500).json({ error: 'Failed to fetch sermons' });
    }
});

// GET /api/sermons/recent - Get recent sermons
router.get('/recent', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 5;
        const sermons = await Sermon.getRecent(limit);
        res.json(sermons);
    } catch (error) {
        console.error('Error fetching recent sermons:', error);
        res.status(500).json({ error: 'Failed to fetch recent sermons' });
    }
});

// GET /api/sermons/series - Get sermon series
router.get('/series', async (req, res) => {
    try {
        const series = await Sermon.getSeries();
        res.json(series);
    } catch (error) {
        console.error('Error fetching sermon series:', error);
        res.status(500).json({ error: 'Failed to fetch sermon series' });
    }
});

// GET /api/sermons/speakers - Get speakers
router.get('/speakers', async (req, res) => {
    try {
        const speakers = await Sermon.getSpeakers();
        res.json(speakers);
    } catch (error) {
        console.error('Error fetching speakers:', error);
        res.status(500).json({ error: 'Failed to fetch speakers' });
    }
});

// GET /api/sermons/:id - Get single sermon
router.get('/:id', async (req, res) => {
    try {
        const sermon = await Sermon.getById(req.params.id);
        
        if (!sermon) {
            return res.status(404).json({ error: 'Sermon not found' });
        }

        res.json(sermon);
    } catch (error) {
        console.error('Error fetching sermon:', error);
        res.status(500).json({ error: 'Failed to fetch sermon' });
    }
});

// POST /api/sermons/:id/listen - Increment listen count
router.post('/:id/listen', async (req, res) => {
    try {
        await Sermon.incrementListens(req.params.id);
        res.json({ message: 'Listen count updated' });
    } catch (error) {
        console.error('Error updating listen count:', error);
        res.status(500).json({ error: 'Failed to update listen count' });
    }
});

// POST /api/sermons/:id/download - Increment download count
router.post('/:id/download', async (req, res) => {
    try {
        await Sermon.incrementDownloads(req.params.id);
        res.json({ message: 'Download count updated' });
    } catch (error) {
        console.error('Error updating download count:', error);
        res.status(500).json({ error: 'Failed to update download count' });
    }
});

module.exports = router;
