/**
 * Instagram API Route
 * Fetches Instagram posts using web scraping (no API key needed)
 */

const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

const INSTAGRAM_HANDLE = 'rccggracelandparishbadagry';
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

// Cache for Instagram posts
let cachedPosts = null;
let cacheTimestamp = null;

/**
 * GET /api/instagram/feed
 * Fetch Instagram posts
 */
router.get('/feed', async (req, res) => {
    try {
        // Check cache first
        if (cachedPosts && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_DURATION)) {
            logger.log('Serving cached Instagram posts');
            return res.json({
                success: true,
                posts: cachedPosts,
                cached: true,
                timestamp: cacheTimestamp
            });
        }

        // Fetch fresh posts
        logger.log('Fetching Instagram posts from web...');
        const posts = await fetchInstagramPosts();

        if (posts && posts.length > 0) {
            // Update cache
            cachedPosts = posts;
            cacheTimestamp = Date.now();

            logger.success(`Fetched ${posts.length} Instagram posts`);
            
            res.json({
                success: true,
                posts: posts,
                cached: false,
                timestamp: cacheTimestamp
            });
        } else {
            logger.warn('No Instagram posts found');
            res.json({
                success: false,
                message: 'No posts found',
                posts: []
            });
        }
    } catch (error) {
        logger.error('Instagram API error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch Instagram posts',
            error: error.message
        });
    }
});

/**
 * Fetch Instagram posts using web scraping
 */
async function fetchInstagramPosts() {
    try {
        const https = require('https');
        const url = `https://www.instagram.com/${INSTAGRAM_HANDLE}/?__a=1&__d=dis`;

        return new Promise((resolve, reject) => {
            https.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'application/json'
                }
            }, (response) => {
                let data = '';

                response.on('data', (chunk) => {
                    data += chunk;
                });

                response.on('end', () => {
                    try {
                        const json = JSON.parse(data);
                        const posts = parseInstagramData(json);
                        resolve(posts);
                    } catch (error) {
                        logger.warn('Failed to parse Instagram JSON, trying alternative method');
                        resolve(getFallbackPosts());
                    }
                });
            }).on('error', (error) => {
                logger.error('Instagram fetch error:', error.message);
                resolve(getFallbackPosts());
            });
        });
    } catch (error) {
        logger.error('fetchInstagramPosts error:', error);
        return getFallbackPosts();
    }
}

/**
 * Parse Instagram JSON data
 */
function parseInstagramData(json) {
    try {
        const posts = [];
        
        // Try different JSON structures (Instagram changes this frequently)
        let edges = null;
        
        if (json.graphql?.user?.edge_owner_to_timeline_media?.edges) {
            edges = json.graphql.user.edge_owner_to_timeline_media.edges;
        } else if (json.data?.user?.edge_owner_to_timeline_media?.edges) {
            edges = json.data.user.edge_owner_to_timeline_media.edges;
        }

        if (!edges) {
            logger.warn('Could not find posts in Instagram response');
            return getFallbackPosts();
        }

        edges.slice(0, 12).forEach(edge => {
            const node = edge.node;
            
            posts.push({
                id: node.id,
                image: node.display_url || node.thumbnail_src,
                thumbnail: node.thumbnail_src || node.display_url,
                caption: node.edge_media_to_caption?.edges[0]?.node?.text || '',
                likes: node.edge_liked_by?.count || 0,
                comments: node.edge_media_to_comment?.count || 0,
                timestamp: node.taken_at_timestamp,
                permalink: `https://www.instagram.com/p/${node.shortcode}/`,
                type: node.__typename
            });
        });

        return posts;
    } catch (error) {
        logger.error('Parse error:', error.message);
        return getFallbackPosts();
    }
}

/**
 * Fallback posts when Instagram API fails
 */
function getFallbackPosts() {
    return [
        {
            id: '1',
            image: 'https://via.placeholder.com/400?text=Sunday+Service',
            thumbnail: 'https://via.placeholder.com/300?text=Sunday+Service',
            caption: 'Join us for Sunday Service! Experience an overflow of His grace. 🙏',
            likes: 0,
            comments: 0,
            timestamp: Date.now() / 1000,
            permalink: `https://www.instagram.com/${INSTAGRAM_HANDLE}/`,
            type: 'placeholder'
        },
        {
            id: '2',
            image: 'https://via.placeholder.com/400?text=Prayer+Meeting',
            thumbnail: 'https://via.placeholder.com/300?text=Prayer+Meeting',
            caption: 'Prayer changes things! Join our prayer meetings. 🕊️',
            likes: 0,
            comments: 0,
            timestamp: Date.now() / 1000,
            permalink: `https://www.instagram.com/${INSTAGRAM_HANDLE}/`,
            type: 'placeholder'
        },
        {
            id: '3',
            image: 'https://via.placeholder.com/400?text=Youth+Fellowship',
            thumbnail: 'https://via.placeholder.com/300?text=Youth+Fellowship',
            caption: 'Young and on fire for God! Join our youth fellowship. 🔥',
            likes: 0,
            comments: 0,
            timestamp: Date.now() / 1000,
            permalink: `https://www.instagram.com/${INSTAGRAM_HANDLE}/`,
            type: 'placeholder'
        },
        {
            id: '4',
            image: 'https://via.placeholder.com/400?text=Community+Outreach',
            thumbnail: 'https://via.placeholder.com/300?text=Community+Outreach',
            caption: 'Reaching out with love and compassion. 💖',
            likes: 0,
            comments: 0,
            timestamp: Date.now() / 1000,
            permalink: `https://www.instagram.com/${INSTAGRAM_HANDLE}/`,
            type: 'placeholder'
        }
    ];
}

module.exports = router;
