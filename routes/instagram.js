/**
 * Instagram API Route
 * Fetches Instagram posts from Instagram profile (no API key needed)
 */

const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

const INSTAGRAM_HANDLE = 'rccggracelandparishbadagry';
const INSTAGRAM_URL = `https://www.instagram.com/${INSTAGRAM_HANDLE}`;
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
 * Fetch Instagram posts using web scraping from HTML
 */
async function fetchInstagramPosts() {
    try {
        const https = require('https');
        const url = `https://www.instagram.com/${INSTAGRAM_HANDLE}/`;

        return new Promise((resolve) => {
            https.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Connection': 'keep-alive',
                    'Upgrade-Insecure-Requests': '1'
                }
            }, (response) => {
                let data = '';

                // Handle gzip compression
                const gunzip = require('zlib').createGunzip();
                const stream = response.headers['content-encoding'] === 'gzip' 
                    ? response.pipe(gunzip) 
                    : response;

                stream.on('data', (chunk) => {
                    data += chunk.toString();
                });

                stream.on('end', () => {
                    try {
                        // Look for embedded JSON data in the HTML
                        // Instagram embeds data in <script type="application/ld+json"> tags
                        const jsonMatches = data.match(/<script type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs);
                        
                        if (jsonMatches && jsonMatches.length > 0) {
                            for (const match of jsonMatches) {
                                const jsonText = match.replace(/<script[^>]*>/, '').replace(/<\/script>/, '');
                                try {
                                    const json = JSON.parse(jsonText);
                                    const posts = parseInstagramLDJSON(json);
                                    if (posts && posts.length > 0) {
                                        logger.success(`Fetched ${posts.length} Instagram posts from LD+JSON`);
                                        resolve(posts);
                                        return;
                                    }
                                } catch (e) {
                                    // Try next match
                                }
                            }
                        }

                        // Fallback: Try to find window._sharedData
                        const sharedDataMatch = data.match(/window\._sharedData\s*=\s*({.+?});/);
                        if (sharedDataMatch) {
                            const json = JSON.parse(sharedDataMatch[1]);
                            const posts = parseInstagramData(json);
                            if (posts && posts.length > 0) {
                                logger.success(`Fetched ${posts.length} Instagram posts from sharedData`);
                                resolve(posts);
                                return;
                            }
                        }

                        logger.warn('Could not extract Instagram posts from HTML');
                        resolve(getFallbackPosts());
                    } catch (error) {
                        logger.error('Failed to parse Instagram HTML:', error.message);
                        resolve(getFallbackPosts());
                    }
                });

                stream.on('error', (error) => {
                    logger.error('Instagram stream error:', error.message);
                    resolve(getFallbackPosts());
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
 * Parse Instagram LD+JSON data
 */
function parseInstagramLDJSON(json) {
    try {
        const posts = [];
        
        // Check if it's a profile page with posts
        if (json['@type'] === 'ProfilePage' && json.mainEntity) {
            const images = json.mainEntity.image;
            if (Array.isArray(images)) {
                images.slice(0, 12).forEach((imageUrl, index) => {
                    posts.push({
                        id: `post_${index}`,
                        image: imageUrl,
                        thumbnail: imageUrl,
                        caption: json.mainEntity.description || '',
                        likes: 0,
                        comments: 0,
                        timestamp: Date.now() / 1000,
                        permalink: `https://www.instagram.com/${INSTAGRAM_HANDLE}/`,
                        type: 'scraped'
                    });
                });
                return posts;
            }
        }

        return null;
    } catch (error) {
        logger.error('Parse LD+JSON error:', error.message);
        return null;
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
 * Fallback posts when Instagram scraping fails
 * These show church-related content as placeholders
 */
function getFallbackPosts() {
    logger.warn('Using fallback Instagram posts - real scraping failed');
    return [
        {
            id: '1',
            image: 'https://placehold.co/400x400/8B5CF6/FFF?text=Sunday+Service',
            thumbnail: 'https://placehold.co/300x300/8B5CF6/FFF?text=Sunday+Service',
            caption: `Join us for Sunday Service! Experience an overflow of His grace. 🙏\n\nFollow us: @${INSTAGRAM_HANDLE}`,
            likes: 0,
            comments: 0,
            timestamp: Date.now() / 1000,
            permalink: INSTAGRAM_URL,
            type: 'placeholder'
        },
        {
            id: '2',
            image: 'https://placehold.co/400x400/EC4899/FFF?text=Prayer+Meeting',
            thumbnail: 'https://placehold.co/300x300/EC4899/FFF?text=Prayer+Meeting',
            caption: `Prayer changes things! Join our prayer meetings. 🕊️\n\nVisit our Instagram for updates: @${INSTAGRAM_HANDLE}`,
            likes: 0,
            comments: 0,
            timestamp: Date.now() / 1000,
            permalink: INSTAGRAM_URL,
            type: 'placeholder'
        },
        {
            id: '3',
            image: 'https://placehold.co/400x400/F97316/FFF?text=Youth+Fellowship',
            thumbnail: 'https://placehold.co/300x300/F97316/FFF?text=Youth+Fellowship',
            caption: `Young and on fire for God! Join our youth fellowship. 🔥\n\nConnect with us: @${INSTAGRAM_HANDLE}`,
            likes: 0,
            comments: 0,
            timestamp: Date.now() / 1000,
            permalink: INSTAGRAM_URL,
            type: 'placeholder'
        },
        {
            id: '4',
            image: 'https://placehold.co/400x400/EF4444/FFF?text=Community+Outreach',
            thumbnail: 'https://placehold.co/300x300/EF4444/FFF?text=Community+Outreach',
            caption: `Reaching out with love and compassion. 💖\n\nSee more on Instagram: @${INSTAGRAM_HANDLE}`,
            likes: 0,
            comments: 0,
            timestamp: Date.now() / 1000,
            permalink: INSTAGRAM_URL,
            type: 'placeholder'
        },
        {
            id: '5',
            image: 'https://placehold.co/400x400/10B981/FFF?text=Bible+Study',
            thumbnail: 'https://placehold.co/300x300/10B981/FFF?text=Bible+Study',
            caption: `Dive deeper into God's Word with us! 📖\n\nFollow for more: @${INSTAGRAM_HANDLE}`,
            likes: 0,
            comments: 0,
            timestamp: Date.now() / 1000,
            permalink: INSTAGRAM_URL,
            type: 'placeholder'
        },
        {
            id: '6',
            image: 'https://placehold.co/400x400/3B82F6/FFF?text=Worship+Night',
            thumbnail: 'https://placehold.co/300x300/3B82F6/FFF?text=Worship+Night',
            caption: `Experience powerful worship and praise! 🎵\n\nVisit: @${INSTAGRAM_HANDLE}`,
            likes: 0,
            comments: 0,
            timestamp: Date.now() / 1000,
            permalink: INSTAGRAM_URL,
            type: 'placeholder'
        }
    ];
}

module.exports = router;
