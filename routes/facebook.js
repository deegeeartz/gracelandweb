/**
 * Facebook API Route
 * Serves a stable Facebook timeline embed configuration
 */

const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

const FACEBOOK_PAGE = 'RCCGLP4GRACELAND';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Cache for embed payload
let cachedEmbed = null;
let cacheTimestamp = null;

/**
 * GET /api/facebook/latest-video
 * Return stable Facebook embed config
 */
router.get('/latest-video', async (req, res) => {
    try {
        // Check cache first
        if (cachedEmbed && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_DURATION)) {
            logger.log('Serving cached Facebook embed');
            return res.json({
                success: true,
                video: cachedEmbed,
                cached: true,
                timestamp: cacheTimestamp
            });
        }

        const embedConfig = getFallbackVideo();

        if (embedConfig) {
            // Update cache
            cachedEmbed = embedConfig;
            cacheTimestamp = Date.now();

            logger.success('Prepared Facebook timeline embed');
            
            res.json({
                success: true,
                video: embedConfig,
                cached: false,
                timestamp: cacheTimestamp
            });
        } else {
            logger.warn('No Facebook video found');
            res.json({
                success: false,
                message: 'No video found',
                video: getFallbackVideo()
            });
        }
    } catch (error) {
        logger.error('Facebook API error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to prepare Facebook embed',
            error: error.message,
            video: getFallbackVideo()
        });
    }
});

/**
 * Stable Facebook timeline embed config
 */
function getFallbackVideo() {
    return {
        id: 'page-plugin',
        embedUrl: `https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2F${FACEBOOK_PAGE}&tabs=timeline&width=800&height=500&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=false`,
        pageUrl: `https://www.facebook.com/${FACEBOOK_PAGE}/videos`,
        timestamp: Date.now(),
        fallback: false,
        isPagePlugin: true
    };
}

module.exports = router;
