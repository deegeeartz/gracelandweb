/**
 * Instagram Feed Integration
 * Displays Instagram posts in a beautiful carousel with animations
 */

const INSTAGRAM_HANDLE = 'rccggracelandparishbadagry';
const INSTAGRAM_URL = `https://www.instagram.com/${INSTAGRAM_HANDLE}`;

// Instagram post data structure (we'll fetch this)
let instagramPosts = [];

/**
 * Initialize Instagram feed carousel
 */
function initializeInstagramFeed() {
    logger.log('Initializing Instagram feed...');
    
    // For now, we'll use Instagram's embed widget
    // In future, can integrate with Instagram Graph API for more control
    loadInstagramWidget();
}

/**
 * Load Instagram embed widget
 */
function loadInstagramWidget() {
    const container = document.querySelector('.instagram-feed-container');
    
    if (!container) {
        logger.warn('Instagram container not found');
        return;
    }

    // Instagram embed script
    const script = document.createElement('script');
    script.src = 'https://www.instagram.com/embed.js';
    script.async = true;
    document.body.appendChild(script);
    
    logger.success('Instagram widget loaded');
}

/**
 * Create floating Instagram posts animation
 * Posts float across the screen as background elements
 */
function createFloatingPostsBackground() {
    const container = document.querySelector('.floating-instagram-bg');
    
    if (!container) return;

    // Sample post images (you can update these with real posts)
    const samplePosts = [
        { image: 'https://via.placeholder.com/300', caption: 'Sunday Service' },
        { image: 'https://via.placeholder.com/300', caption: 'Prayer Meeting' },
        { image: 'https://via.placeholder.com/300', caption: 'Youth Fellowship' },
        { image: 'https://via.placeholder.com/300', caption: 'Community Outreach' }
    ];

    samplePosts.forEach((post, index) => {
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
    
    postDiv.innerHTML = `
        <div class="floating-post-inner">
            <img src="${post.image}" alt="${post.caption}">
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
function createInstagramCarousel() {
    const carousel = document.querySelector('.instagram-carousel');
    
    if (!carousel) return;

    // Instagram posts will be loaded here
    // Can be populated via API or manually
    logger.log('Instagram carousel ready');
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeInstagramFeed();
    createFloatingPostsBackground();
    createInstagramCarousel();
});

// Export functions
window.refreshInstagramFeed = initializeInstagramFeed;
