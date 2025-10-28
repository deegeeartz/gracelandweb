/**
 * Instagram Feed Integration with API
 * Fetches and displays real Instagram posts with animations
 */

// Determine API base URL
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : '';

const INSTAGRAM_HANDLE = 'rccggracelandparishbadagry';
const INSTAGRAM_URL = `https://www.instagram.com/${INSTAGRAM_HANDLE}`;
const API_ENDPOINT = `${API_BASE}/api/instagram/feed`;

// Instagram post data
let instagramPosts = [];

/**
 * Fetch Instagram posts from backend API
 */
async function fetchInstagramPosts() {
    try {
        logger.log('Fetching Instagram posts...');
        
        const response = await fetch(API_ENDPOINT);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.posts && data.posts.length > 0) {
            instagramPosts = data.posts;
            logger.success(`Loaded ${instagramPosts.length} Instagram posts`);
            return instagramPosts;
        } else {
            logger.warn('No Instagram posts found');
            return [];
        }
    } catch (error) {
        logger.error('Failed to fetch Instagram posts:', error.message);
        // Fallback to embed widget
        return [];
    }
}

/**
 * Initialize Instagram feed
 */
async function initializeInstagramFeed() {
    logger.log('Initializing Instagram feed...');
    
    // Try to fetch posts from API
    const posts = await fetchInstagramPosts();
    
    if (posts.length > 0) {
        // Display posts in grid
        displayInstagramGrid(posts);
        // Update floating background with real posts
        createFloatingPostsBackground(posts.slice(0, 4));
        // Create carousel
        createInstagramCarousel(posts);
    } else {
        // Fallback to Instagram embed widget
        loadInstagramWidget();
        // Use placeholder for floating posts
        createFloatingPostsBackground();
    }
}

/**
 * Display Instagram posts in grid
 */
function displayInstagramGrid(posts) {
    const container = document.querySelector('.instagram-feed-grid');
    
    if (!container) return;
    
    container.innerHTML = ''; // Clear existing
    
    // Show first 6 posts
    const displayPosts = posts.slice(0, 6);
    
    displayPosts.forEach(post => {
        const postCard = createPostCard(post);
        container.appendChild(postCard);
    });
    
    logger.success('Instagram grid displayed');
}

/**
 * Create Instagram post card
 */
function createPostCard(post) {
    const card = document.createElement('div');
    card.className = 'instagram-post-card';
    
    const caption = post.caption || '';
    const truncatedCaption = caption.length > 100 
        ? caption.substring(0, 100) + '...' 
        : caption;
    
    card.innerHTML = `
        <img src="${post.thumbnail || post.image}" 
             alt="${truncatedCaption}" 
             loading="lazy">
        <div class="instagram-post-overlay">
            <div class="instagram-post-stats">
                <span><i class="fas fa-heart"></i> ${formatNumber(post.likes || 0)}</span>
                <span><i class="fas fa-comment"></i> ${formatNumber(post.comments || 0)}</span>
            </div>
            <p class="instagram-post-caption">${truncatedCaption}</p>
        </div>
    `;
    
    // Click to open Instagram post
    card.addEventListener('click', () => {
        if (post.permalink) {
            window.open(post.permalink, '_blank', 'noopener,noreferrer');
        }
    });
    
    return card;
}

/**
 * Create floating Instagram posts background
 */
function createFloatingPostsBackground(posts = null) {
    const container = document.querySelector('.floating-instagram-bg');
    
    if (!container) return;
    
    container.innerHTML = ''; // Clear existing
    
    // Use real posts or placeholders
    const postsData = posts || [
        { image: 'https://via.placeholder.com/300?text=Sunday+Service', caption: 'Sunday Service' },
        { image: 'https://via.placeholder.com/300?text=Prayer+Meeting', caption: 'Prayer Meeting' },
        { image: 'https://via.placeholder.com/300?text=Youth+Fellowship', caption: 'Youth Fellowship' },
        { image: 'https://via.placeholder.com/300?text=Worship', caption: 'Worship' }
    ];
    
    postsData.forEach((post, index) => {
        const postElement = createFloatingPost(post, index);
        container.appendChild(postElement);
    });
}

/**
 * Create individual floating post element
 */
function createFloatingPost(post, index) {
    const postDiv = document.createElement('div');
    postDiv.className = 'floating-post';
    postDiv.style.animationDelay = `${index * 2}s`;
    
    const imageUrl = post.thumbnail || post.image;
    const caption = post.caption || 'RCCG Graceland';
    
    postDiv.innerHTML = `
        <div class="floating-post-inner">
            <img src="${imageUrl}" alt="${caption}" loading="lazy">
            <div class="floating-post-overlay">
                <i class="fab fa-instagram"></i>
            </div>
        </div>
    `;
    
    return postDiv;
}

/**
 * Create Instagram carousel
 */
function createInstagramCarousel(posts) {
    const carousel = document.querySelector('.instagram-carousel-track');
    
    if (!carousel || !posts || posts.length === 0) return;
    
    carousel.innerHTML = ''; // Clear existing
    
    // Duplicate posts for infinite scroll effect
    const carouselPosts = [...posts, ...posts];
    
    carouselPosts.forEach(post => {
        const item = document.createElement('div');
        item.className = 'instagram-carousel-item';
        
        item.innerHTML = `
            <img src="${post.thumbnail || post.image}" alt="${post.caption || 'Instagram post'}" loading="lazy">
        `;
        
        item.addEventListener('click', () => {
            if (post.permalink) {
                window.open(post.permalink, '_blank', 'noopener,noreferrer');
            }
        });
        
        carousel.appendChild(item);
    });
    
    logger.success('Instagram carousel created');
}

/**
 * Load Instagram embed widget (fallback)
 */
function loadInstagramWidget() {
    const container = document.querySelector('.instagram-feed-container');
    
    if (!container) {
        logger.warn('Instagram container not found');
        return;
    }

    // Instagram embed script
    if (!document.querySelector('script[src*="instagram.com/embed"]')) {
        const script = document.createElement('script');
        script.src = 'https://www.instagram.com/embed.js';
        script.async = true;
        document.body.appendChild(script);
    } else if (window.instgrm) {
        window.instgrm.Embeds.process();
    }
    
    logger.success('Instagram widget loaded');
}

/**
 * Format numbers (1000 -> 1K)
 */
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

/**
 * Refresh Instagram feed
 */
async function refreshInstagramFeed() {
    logger.log('Refreshing Instagram feed...');
    await initializeInstagramFeed();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeInstagramFeed();
});

// Auto-refresh every 10 minutes
setInterval(refreshInstagramFeed, 10 * 60 * 1000);

// Export functions
window.refreshInstagramFeed = refreshInstagramFeed;
