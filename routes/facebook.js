/**
 * Facebook API Route
 * Fetches latest video from Facebook page timeline
 */

const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

const FACEBOOK_PAGE = 'RCCGLP4GRACELAND';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Cache for latest video
let cachedVideo = null;
let cacheTimestamp = null;

/**
 * GET /api/facebook/latest-video
 * Fetch latest video from Facebook page
 */
router.get('/latest-video', async (req, res) => {
    try {
        // Check cache first
        if (cachedVideo && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_DURATION)) {
            logger.log('Serving cached Facebook video');
            return res.json({
                success: true,
                video: cachedVideo,
                cached: true,
                timestamp: cacheTimestamp
            });
        }

        // Fetch fresh video
        logger.log('Fetching latest Facebook video...');
        const video = await fetchLatestVideo();

        if (video) {
            // Update cache
            cachedVideo = video;
            cacheTimestamp = Date.now();

            logger.success('Fetched latest Facebook video');
            
            res.json({
                success: true,
                video: video,
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
            message: 'Failed to fetch Facebook video',
            error: error.message,
            video: getFallbackVideo()
        });
    }
});

/**
 * Fetch latest video from Facebook page (live or recent)
 */
async function fetchLatestVideo() {
    try {
        const https = require('https');
        
        // Fetch from main page to get any recent videos (live or recorded)
        const url = `https://www.facebook.com/${FACEBOOK_PAGE}`;

        return new Promise((resolve) => {
            https.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.9'
                }
            }, (response) => {
                let data = '';

                response.on('data', (chunk) => {
                    data += chunk;
                });

                response.on('end', () => {
                    try {
                        // Look for video IDs in the HTML (match multiple patterns)
                        // Pattern 1: /videos/1234567890
                        // Pattern 2: /watch/?v=1234567890
                        const videoPatterns = [
                            /\/videos\/(\d{10,})/g,
                            /\/watch\/\?v=(\d{10,})/g,
                            /"video_id":"(\d{10,})"/g
                        ];
                        
                        let videoIds = new Set();
                        
                        for (const pattern of videoPatterns) {
                            let match;
                            while ((match = pattern.exec(data)) !== null) {
                                videoIds.add(match[1]);
                            }
                        }
                        
                        if (videoIds.size > 0) {
                            // Get the first video ID found
                            const videoId = Array.from(videoIds)[0];
                            logger.success(`Found video ID: ${videoId}`);
                            
                            resolve({
                                id: videoId,
                                embedUrl: `https://www.facebook.com/plugins/video.php?href=https%3A%2F%2Fwww.facebook.com%2F${FACEBOOK_PAGE}%2Fvideos%2F${videoId}%2F&show_text=false&width=800&height=450&appId`,
                                pageUrl: `https://www.facebook.com/${FACEBOOK_PAGE}/videos/${videoId}`,
                                timestamp: Date.now()
                            });
                        } else {
                            logger.warn('No video ID found, using page plugin');
                            // Use the page plugin to show all videos
                            resolve({
                                id: 'page-plugin',
                                embedUrl: `https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2F${FACEBOOK_PAGE}&tabs=timeline&width=800&height=500&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=false`,
                                pageUrl: `https://www.facebook.com/${FACEBOOK_PAGE}/videos`,
                                timestamp: Date.now(),
                                isPagePlugin: true
                            });
                        }
                    } catch (error) {
                        logger.error('Failed to parse Facebook page:', error.message);
                        resolve(getFallbackVideo());
                    }
                });
            }).on('error', (error) => {
                logger.error('Facebook fetch error:', error.message);
                resolve(getFallbackVideo());
            });
        });
    } catch (error) {
        logger.error('fetchLatestVideo error:', error);
        return getFallbackVideo();
    }
}

/**
 * Fallback video when Facebook API fails
 * Uses Page Plugin to show recent posts and videos
 */
function getFallbackVideo() {
    // Return Page Plugin that shows timeline with recent videos
    return {
        id: 'page-plugin',
        embedUrl: `https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2F${FACEBOOK_PAGE}&tabs=timeline&width=800&height=500&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=false`,
        pageUrl: `https://www.facebook.com/${FACEBOOK_PAGE}`,
        timestamp: Date.now(),
        fallback: true,
        isPagePlugin: true
    };
}

module.exports = router;
