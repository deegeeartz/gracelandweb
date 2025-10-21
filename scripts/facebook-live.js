/**
 * Facebook Live Stream Auto-Loader
 * Automatically fetches and displays the most recent live/video content from Facebook page
 * Plays inline like YouTube without redirecting
 */

const FACEBOOK_PAGE_ID = 'RCCGLP4GRACELAND';
const FACEBOOK_PAGE_URL = `https://www.facebook.com/${FACEBOOK_PAGE_ID}`;

// Load Facebook live stream that plays inline (like YouTube)
function loadFacebookVideoEmbed() {
    const videoWrapper = document.querySelector('.video-wrapper');
    
    if (!videoWrapper) {
        logger.warn('Video wrapper not found');
        return;
    }

    // Facebook Video Player Plugin - plays inline without redirect
    // This will show the most recent live stream or video
    const videoEmbedHTML = `
        <iframe 
            src="https://www.facebook.com/plugins/video.php?height=500&href=${encodeURIComponent(FACEBOOK_PAGE_URL + '/videos/')}&show_text=false&width=800&t=0"
            width="100%"
            height="500"
            style="border:none;overflow:hidden;"
            scrolling="no"
            frameborder="0"
            allowfullscreen="true"
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share">
        </iframe>
    `;

    videoWrapper.innerHTML = videoEmbedHTML;
    logger.success('Facebook video embed loaded');
}

// Alternative: Embedded player for live streams specifically
function loadFacebookLiveEmbed() {
    const videoWrapper = document.querySelector('.video-wrapper');
    
    if (!videoWrapper) return;

    // This embeds the /live endpoint which shows active or most recent live video
    const liveEmbedHTML = `
        <iframe 
            src="https://www.facebook.com/plugins/video.php?height=500&href=${encodeURIComponent(FACEBOOK_PAGE_URL + '/live/')}&show_text=false&width=800"
            width="100%"
            height="500"
            style="border:none;overflow:hidden;"
            scrolling="no"
            frameborder="0"
            allowfullscreen="true"
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share">
        </iframe>
    `;

    videoWrapper.innerHTML = liveEmbedHTML;
    logger.success('Facebook live embed loaded');
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    logger.log('Initializing Facebook live stream...');
    
    // Load live stream embed that plays inline
    loadFacebookLiveEmbed();
    
    // Refresh every 5 minutes to check for new content
    setInterval(() => {
        logger.log('Refreshing Facebook embed...');
        loadFacebookLiveEmbed();
    }, 5 * 60 * 1000);
});

// Export for manual refresh
window.refreshFacebookLive = loadFacebookLiveEmbed;
